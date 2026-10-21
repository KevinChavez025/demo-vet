import { useEffect, useState } from "react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { LogOut, Check, X, Phone } from "lucide-react"
import { supabase } from "../lib/supabase"
import { config } from "../data/config"

const FILTROS = ["todas", "pendiente", "confirmada", "cancelada"]

const COLORES = {
  pendiente: "bg-amber-100 text-amber-900",
  confirmada: "bg-emerald-100 text-emerald-900",
  cancelada: "bg-gray-100 text-gray-700",
}

function Login() {
  const [correo, setCorreo] = useState("")
  const [clave, setClave] = useState("")
  const [error, setError] = useState("")
  const [cargando, setCargando] = useState(false)

  async function entrar(e) {
    e.preventDefault()
    if (!supabase) return
    setCargando(true)
    setError("")
    const { error } = await supabase.auth.signInWithPassword({
      email: correo.trim(),
      password: clave,
    })
    if (error) setError("Correo o clave incorrectos.")
    setCargando(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-emerald-50 px-4">
      <form
        onSubmit={entrar}
        className="w-full max-w-sm bg-white rounded-xl p-6 shadow-sm"
      >
        <h1 className="text-xl font-bold text-emerald-800">Panel de citas</h1>
        <p className="mt-1 text-sm text-gray-600">{config.nombre}</p>

        <label className="mt-6 block text-sm font-medium" htmlFor="correo">
          Correo
        </label>
        <input
          id="correo"
          type="email"
          autoComplete="username"
          required
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
        />

        <label className="mt-4 block text-sm font-medium" htmlFor="clave">
          Clave
        </label>
        <input
          id="clave"
          type="password"
          autoComplete="current-password"
          required
          value={clave}
          onChange={(e) => setClave(e.target.value)}
          className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
        />

        {error && (
          <p role="alert" className="mt-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={cargando}
          className="mt-6 w-full bg-emerald-700 text-white py-2 rounded-lg disabled:opacity-60 hover:bg-emerald-800"
        >
          {cargando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </main>
  )
}

function Citas({ sesion }) {
  const [citas, setCitas] = useState([])
  const [filtro, setFiltro] = useState("todas")
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState("")

  async function cargar() {
    setCargando(true)
    const hoy = format(new Date(), "yyyy-MM-dd")
    const { data, error } = await supabase
      .from("citas")
      .select("*")
      .gte("fecha", hoy)
      .order("fecha")
      .order("hora")
    if (error) {
      setError("No pudimos cargar las citas.")
    } else {
      setError("")
      setCitas(data)
    }
    setCargando(false)
  }

  useEffect(() => {
    cargar()
  }, [])

  async function cambiarEstado(id, estado) {
    setError("")
    const { data, error } = await supabase
      .from("citas")
      .update({ estado })
      .eq("id", id)
      .select()

    if (error || !data || data.length === 0) {
      await cargar()
      setError(
        "No se pudo guardar el cambio. Cierra sesion, vuelve a entrar e intenta de nuevo."
      )
      return
    }

    const actualizada = data[0]
    setCitas((lista) => lista.map((c) => (c.id === id ? actualizada : c)))
  }

  async function salir() {
    await supabase.auth.signOut()
  }

  const visibles = citas.filter((c) => filtro === "todas" || c.estado === filtro)
  const pendientes = citas.filter((c) => c.estado === "pendiente").length

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="font-bold text-emerald-800">Panel de citas</h1>
            <p className="text-xs text-gray-600">{sesion.user.email}</p>
          </div>
          <button
            onClick={salir}
            className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
          >
            <LogOut size={18} />
            Salir
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <p className="text-sm text-gray-700">
          {pendientes} {pendientes === 1 ? "cita pendiente" : "citas pendientes"} de confirmar
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {FILTROS.map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={
                "px-3 py-1 rounded-full text-sm capitalize border " +
                (filtro === f
                  ? "bg-emerald-700 text-white border-emerald-700"
                  : "bg-white text-gray-700 border-gray-300 hover:border-emerald-400")
              }
            >
              {f}
            </button>
          ))}
          <button
            onClick={cargar}
            className="px-3 py-1 rounded-full text-sm border border-gray-300 bg-white text-gray-700 hover:border-emerald-400"
          >
            Actualizar
          </button>
        </div>

        {error && (
          <p role="alert" className="mt-4 text-sm text-red-700">
            {error}
          </p>
        )}

        {cargando ? (
          <p className="mt-6 text-sm text-gray-600">Cargando citas...</p>
        ) : visibles.length === 0 ? (
          <p className="mt-6 text-sm text-gray-600">No hay citas para mostrar.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {visibles.map((c) => (
              <li key={c.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold capitalize">
                      {format(parseISO(c.fecha), "EEEE d 'de' MMMM", { locale: es })} - {c.hora}
                    </p>
                    <p className="text-sm text-gray-700">{c.servicio}</p>
                  </div>
                  <span
                    className={
                      "shrink-0 px-2 py-1 rounded-full text-xs font-medium capitalize " +
                      COLORES[c.estado]
                    }
                  >
                    {c.estado}
                  </span>
                </div>

                <p className="mt-3 text-sm text-gray-700">
                  {c.nombre} - mascota: {c.mascota}
                </p>
                <a
                  href={"tel:+51" + c.telefono}
                  className="mt-1 inline-flex items-center gap-1 text-sm text-emerald-700 underline"
                >
                  <Phone size={14} />
                  {c.telefono}
                </a>

                {c.estado !== "cancelada" && (
                  <div className="mt-4 flex gap-2">
                    {c.estado === "pendiente" && (
                      <button
                        onClick={() => cambiarEstado(c.id, "confirmada")}
                        className="inline-flex items-center gap-1 bg-emerald-700 text-white text-sm px-3 py-2 rounded-lg hover:bg-emerald-800"
                      >
                        <Check size={16} />
                        Confirmar
                      </button>
                    )}
                    <button
                      onClick={() => cambiarEstado(c.id, "cancelada")}
                      className="inline-flex items-center gap-1 border border-gray-300 text-gray-700 text-sm px-3 py-2 rounded-lg hover:border-red-400 hover:text-red-700"
                    >
                      <X size={16} />
                      Cancelar
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}

function Panel() {
  const [sesion, setSesion] = useState(null)
  const [listo, setListo] = useState(false)

  useEffect(() => {
    document.title = "Panel - " + config.nombre
    const meta = document.createElement("meta")
    meta.name = "robots"
    meta.content = "noindex, nofollow"
    document.head.appendChild(meta)
    return () => document.head.removeChild(meta)
  }, [])

  useEffect(() => {
    if (!supabase) {
      setListo(true)
      return
    }
    supabase.auth.getSession().then(({ data }) => {
      setSesion(data.session)
      setListo(true)
    })
    const { data } = supabase.auth.onAuthStateChange((_evento, nueva) => {
      setSesion(nueva)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  if (!listo) {
    return <p className="p-6 text-sm text-gray-600">Cargando...</p>
  }
  if (!supabase) {
    return <p className="p-6 text-sm text-red-700">Falta configurar Supabase.</p>
  }
  return sesion ? <Citas sesion={sesion} /> : <Login />
}

export default Panel