import { useEffect, useRef, useState } from "react"
import { format, parseISO, isToday, isTomorrow } from "date-fns"
import { es } from "date-fns/locale"
import {
  LogOut,
  Check,
  X,
  Phone,
  MessageCircle,
  RefreshCw,
  RotateCcw,
  CircleCheck,
  CircleAlert,
} from "lucide-react"
import { supabase } from "../lib/supabase"
import { config } from "../data/config"

const FILTROS = [
  { id: "activas", texto: "Activas" },
  { id: "pendiente", texto: "Pendientes" },
  { id: "confirmada", texto: "Confirmadas" },
  { id: "cancelada", texto: "Canceladas" },
]

const COLORES = {
  pendiente: "bg-amber-100 text-amber-900",
  confirmada: "bg-emerald-100 text-emerald-900",
  cancelada: "bg-gray-100 text-gray-700",
}

const ACCIONES = {
  confirmar: {
    estado: "confirmada",
    Icono: Check,
    titulo: "Confirmar esta cita?",
    descripcion: "La cita quedara como confirmada y la hora seguira reservada.",
    volver: "Volver",
    aceptar: "Si, confirmar",
    exito: "Cita confirmada.",
    peligro: false,
  },
  cancelar: {
    estado: "cancelada",
    Icono: X,
    titulo: "Cancelar esta cita?",
    descripcion:
      "La hora quedara libre en la web. Podras reactivarla despues si nadie la toma.",
    volver: "Mantener cita",
    aceptar: "Si, cancelar cita",
    exito: "Cita cancelada.",
    peligro: true,
  },
  reactivar: {
    estado: "pendiente",
    Icono: RotateCcw,
    titulo: "Reactivar esta cita?",
    descripcion: "Volvera a quedar como pendiente de confirmar, si la hora sigue libre.",
    volver: "Volver",
    aceptar: "Si, reactivar",
    exito: "Cita reactivada.",
    peligro: false,
  },
  salir: {
    estado: null,
    Icono: LogOut,
    titulo: "Cerrar sesion?",
    descripcion:
      "Tendras que ingresar con tu correo y clave para volver a ver las citas.",
    volver: "Quedarme",
    aceptar: "Si, cerrar sesion",
    exito: "",
    peligro: false,
  },
}

function consultarCitas() {
  const hoy = format(new Date(), "yyyy-MM-dd")
  return supabase
    .from("citas")
    .select("*")
    .gte("fecha", hoy)
    .order("fecha")
    .order("hora")
}

function tituloDia(fecha) {
  const d = parseISO(fecha)
  const texto = format(d, "EEEE d 'de' MMMM", { locale: es })
  const capital = texto.charAt(0).toUpperCase() + texto.slice(1)
  if (isToday(d)) return "Hoy - " + capital
  if (isTomorrow(d)) return "Manana - " + capital
  return capital
}

function agrupar(lista) {
  const grupos = []
  lista.forEach((c) => {
    const ultimo = grupos[grupos.length - 1]
    if (ultimo && ultimo.fecha === c.fecha) {
      ultimo.items.push(c)
    } else {
      grupos.push({ fecha: c.fecha, items: [c] })
    }
  })
  return grupos
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

function Contador({ numero, texto }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
      <p className="text-2xl font-bold text-emerald-800">{numero}</p>
      <p className="text-xs text-gray-600">{texto}</p>
    </div>
  )
}

function Confirmacion({ accion, procesando, onCerrar, onConfirmar }) {
  const botonSeguro = useRef(null)
  const datos = ACCIONES[accion.tipo]
  const c = accion.cita
  const Icono = datos.Icono

  useEffect(() => {
    if (botonSeguro.current) botonSeguro.current.focus()
    function alTeclear(e) {
      if (e.key === "Escape" && !procesando) onCerrar()
    }
    document.addEventListener("keydown", alTeclear)
    return () => document.removeEventListener("keydown", alTeclear)
  }, [procesando, onCerrar])

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 p-4"
      onClick={() => {
        if (!procesando) onCerrar()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-confirmacion"
        className="w-full max-w-sm bg-white rounded-xl p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={
            "w-12 h-12 rounded-full flex items-center justify-center " +
            (datos.peligro ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700")
          }
        >
          <Icono size={24} />
        </div>

        <h2 id="titulo-confirmacion" className="mt-4 text-lg font-bold text-gray-900">
          {datos.titulo}
        </h2>
        <p className="mt-1 text-sm text-gray-600">{datos.descripcion}</p>

        {c && (
          <div className="mt-4 rounded-lg bg-gray-50 border border-gray-200 p-3 text-sm text-gray-800">
            <p className="font-semibold capitalize">
              {format(parseISO(c.fecha), "EEEE d 'de' MMMM", { locale: es })} - {c.hora}
            </p>
            <p>{c.servicio}</p>
            <p>
              {c.nombre} - mascota: {c.mascota}
            </p>
          </div>
        )}

        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button
            ref={botonSeguro}
            type="button"
            onClick={onCerrar}
            disabled={procesando}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            {datos.volver}
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={procesando}
            className={
              "px-4 py-2 rounded-lg text-white disabled:opacity-60 " +
              (datos.peligro
                ? "bg-red-700 hover:bg-red-800"
                : "bg-emerald-700 hover:bg-emerald-800")
            }
          >
            {procesando ? "Guardando..." : datos.aceptar}
          </button>
        </div>
      </div>
    </div>
  )
}

function Aviso({ aviso }) {
  const ok = aviso.tipo === "ok"
  return (
    <div
      role="status"
      className={
        "fixed bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-sm w-[calc(100%-2rem)] flex items-start gap-2 rounded-lg px-4 py-3 text-sm text-white shadow-lg " +
        (ok ? "bg-emerald-800" : "bg-red-700")
      }
    >
      {ok ? (
        <CircleCheck size={18} className="shrink-0 mt-0.5" />
      ) : (
        <CircleAlert size={18} className="shrink-0 mt-0.5" />
      )}
      <span>{aviso.texto}</span>
    </div>
  )
}

function Citas({ sesion }) {
  const [citas, setCitas] = useState([])
  const [filtro, setFiltro] = useState("activas")
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState("")
  const [accion, setAccion] = useState(null)
  const [procesando, setProcesando] = useState(false)
  const [aviso, setAviso] = useState(null)
  const temporizador = useRef(null)

  function mostrarAviso(tipo, texto) {
    if (temporizador.current) clearTimeout(temporizador.current)
    setAviso({ tipo: tipo, texto: texto })
    temporizador.current = setTimeout(() => setAviso(null), tipo === "ok" ? 3000 : 6000)
  }

  useEffect(() => {
    return () => {
      if (temporizador.current) clearTimeout(temporizador.current)
    }
  }, [])

  async function cargar() {
    setCargando(true)
    const { data, error } = await consultarCitas()
    if (error) {
      setError("No pudimos cargar las citas.")
    } else {
      setError("")
      setCitas(data)
    }
    setCargando(false)
  }

  useEffect(() => {
    let cancelado = false
    consultarCitas().then(({ data, error }) => {
      if (cancelado) return
      if (error) {
        setError("No pudimos cargar las citas.")
      } else {
        setError("")
        setCitas(data)
      }
      setCargando(false)
    })
    return () => {
      cancelado = true
    }
  }, [])

  async function cambiarEstado(id, estado) {
    const { data, error } = await supabase
      .from("citas")
      .update({ estado })
      .eq("id", id)
      .select()

    if (error && error.code === "23505") {
      await cargar()
      mostrarAviso("error", "No se pudo reactivar: ese horario ya fue tomado por otra cita.")
      return false
    }

    if (error || !data || data.length === 0) {
      await cargar()
      mostrarAviso(
        "error",
        "No se pudo guardar el cambio. Cierra sesion, vuelve a entrar e intenta de nuevo."
      )
      return false
    }

    const actualizada = data[0]
    setCitas((lista) => lista.map((c) => (c.id === id ? actualizada : c)))
    return true
  }

  async function confirmarAccion() {
    if (!accion || procesando) return
    setProcesando(true)

    if (accion.tipo === "salir") {
      const { error } = await supabase.auth.signOut()
      if (error) {
        mostrarAviso("error", "No se pudo cerrar la sesion. Intenta de nuevo.")
        setProcesando(false)
        setAccion(null)
      }
      return
    }

    const datos = ACCIONES[accion.tipo]
    const ok = await cambiarEstado(accion.cita.id, datos.estado)
    if (ok) mostrarAviso("ok", datos.exito)
    setProcesando(false)
    setAccion(null)
  }

  const hoy = format(new Date(), "yyyy-MM-dd")
  const pendientes = citas.filter((c) => c.estado === "pendiente").length
  const confirmadas = citas.filter((c) => c.estado === "confirmada").length
  const deHoy = citas.filter((c) => c.fecha === hoy && c.estado !== "cancelada").length

  const visibles = citas.filter((c) => {
    if (filtro === "activas") return c.estado !== "cancelada"
    return c.estado === filtro
  })
  const grupos = agrupar(visibles)

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="font-bold text-emerald-800">Panel de citas</h1>
            <p className="text-xs text-gray-600">{sesion.user.email}</p>
          </div>
          <button
            onClick={() => setAccion({ tipo: "salir", cita: null })}
            className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
          >
            <LogOut size={18} />
            Salir
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="grid grid-cols-3 gap-3">
          <Contador numero={pendientes} texto="Pendientes" />
          <Contador numero={deHoy} texto="Hoy" />
          <Contador numero={confirmadas} texto="Confirmadas" />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {FILTROS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFiltro(f.id)}
              className={
                "px-3 py-1 rounded-full text-sm border " +
                (filtro === f.id
                  ? "bg-emerald-700 text-white border-emerald-700"
                  : "bg-white text-gray-700 border-gray-300 hover:border-emerald-400")
              }
            >
              {f.texto}
            </button>
          ))}
          <button
            onClick={cargar}
            aria-label="Actualizar"
            className="ml-auto inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm border border-gray-300 bg-white text-gray-700 hover:border-emerald-400"
          >
            <RefreshCw size={14} />
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
        ) : grupos.length === 0 ? (
          <p className="mt-6 text-sm text-gray-600">No hay citas para mostrar.</p>
        ) : (
          <div className="mt-6 space-y-6">
            {grupos.map((g) => (
              <section key={g.fecha}>
                <h2 className="text-sm font-semibold text-gray-700">
                  {tituloDia(g.fecha)}
                </h2>
                <ul className="mt-2 space-y-3">
                  {g.items.map((c) => (
                    <li
                      key={c.id}
                      className={
                        "bg-white rounded-xl border border-gray-200 p-4 " +
                        (c.estado === "cancelada" ? "opacity-80" : "")
                      }
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-baseline gap-3">
                          <span className="text-xl font-bold text-emerald-800">
                            {c.hora}
                          </span>
                          <span className="text-sm text-gray-700">{c.servicio}</span>
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

                      <p className="mt-2 text-sm text-gray-800">
                        {c.nombre} - mascota: {c.mascota}
                      </p>

                      <div className="mt-1 flex flex-wrap gap-4 text-sm">
                        <a
                          href={"tel:+51" + c.telefono}
                          className="inline-flex items-center gap-1 text-emerald-700 underline"
                        >
                          <Phone size={14} />
                          {c.telefono}
                        </a>
                        <a
                          href={"https://wa.me/51" + c.telefono}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-emerald-700 underline"
                        >
                          <MessageCircle size={14} />
                          WhatsApp
                        </a>
                      </div>

                      {c.estado !== "cancelada" ? (
                        <div className="mt-4 flex gap-2">
                          {c.estado === "pendiente" && (
                            <button
                              onClick={() => setAccion({ tipo: "confirmar", cita: c })}
                              className="inline-flex items-center gap-1 bg-emerald-700 text-white text-sm px-3 py-2 rounded-lg hover:bg-emerald-800"
                            >
                              <Check size={16} />
                              Confirmar
                            </button>
                          )}
                          <button
                            onClick={() => setAccion({ tipo: "cancelar", cita: c })}
                            className="inline-flex items-center gap-1 border border-gray-300 text-gray-700 text-sm px-3 py-2 rounded-lg hover:border-red-400 hover:text-red-700"
                          >
                            <X size={16} />
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <div className="mt-4">
                          <button
                            onClick={() => setAccion({ tipo: "reactivar", cita: c })}
                            className="inline-flex items-center gap-1 border border-emerald-700 text-emerald-800 text-sm px-3 py-2 rounded-lg hover:bg-emerald-50"
                          >
                            <RotateCcw size={16} />
                            Reactivar
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>

      {accion && (
        <Confirmacion
          accion={accion}
          procesando={procesando}
          onCerrar={() => setAccion(null)}
          onConfirmar={confirmarAccion}
        />
      )}
      {aviso && <Aviso aviso={aviso} />}
    </main>
  )
}

function Panel() {
  const [sesion, setSesion] = useState(null)
  const [listo, setListo] = useState(!supabase)

  useEffect(() => {
    document.title = "Panel - " + config.nombre
    const meta = document.createElement("meta")
    meta.name = "robots"
    meta.content = "noindex, nofollow"
    document.head.appendChild(meta)
    return () => document.head.removeChild(meta)
  }, [])

  useEffect(() => {
    if (!supabase) return undefined

    let activo = true
    supabase.auth.getSession().then(({ data }) => {
      if (!activo) return
      setSesion(data.session)
      setListo(true)
    })
    const { data } = supabase.auth.onAuthStateChange((_evento, nueva) => {
      setSesion(nueva)
    })
    return () => {
      activo = false
      data.subscription.unsubscribe()
    }
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