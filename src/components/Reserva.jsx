import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { addDays, format, getDay } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarCheck, Check } from "lucide-react"
import { config } from "../data/config"
import { supabase } from "../lib/supabase"

const SITE_KEY = "0x4AAAAAAFf5TGIMFW4JfVjy"

const HORAS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
]

function proximosDias() {
  const dias = []
  let d = new Date()
  while (dias.length < 12) {
    d = addDays(d, 1)
    if (getDay(d) !== 0) dias.push(d)
  }
  return dias
}

const DIAS = proximosDias()

function Reserva() {
  const [paso, setPaso] = useState(1)
  const [servicio, setServicio] = useState(null)
  const [fecha, setFecha] = useState(null)
  const [hora, setHora] = useState(null)
  const [ocupadas, setOcupadas] = useState([])
  const [cargando, setCargando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [errorServidor, setErrorServidor] = useState("")
  const [urlWhatsapp, setUrlWhatsapp] = useState("")
  const [enviado, setEnviado] = useState(false)
  const [token, setToken] = useState("")

  const widgetRef = useRef(null)
  const widgetId = useRef(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const fechaTexto = fecha ? format(fecha, "EEEE d 'de' MMMM", { locale: es }) : ""

  useEffect(() => {
    if (paso !== 3) return undefined

    let intervalo = null

    function montar() {
      if (!window.turnstile || !widgetRef.current) return false
      widgetId.current = window.turnstile.render(widgetRef.current, {
        sitekey: SITE_KEY,
        callback: (t) => setToken(t),
        "expired-callback": () => setToken(""),
        "error-callback": () => setToken(""),
      })
      return true
    }

    if (!montar()) {
      intervalo = setInterval(() => {
        if (montar()) clearInterval(intervalo)
      }, 300)
    }

    return () => {
      if (intervalo) clearInterval(intervalo)
      if (widgetId.current !== null && window.turnstile) {
        window.turnstile.remove(widgetId.current)
      }
      widgetId.current = null
      setToken("")
    }
  }, [paso])

  function reiniciarWidget() {
    setToken("")
    if (widgetId.current !== null && window.turnstile) {
      window.turnstile.reset(widgetId.current)
    }
  }

  async function cargarOcupadas(d) {
    setCargando(true)
    setErrorServidor("")
    if (!supabase) {
      setOcupadas([])
      setErrorServidor("El servicio de reservas no esta disponible.")
      setCargando(false)
      return
    }
    const { data, error } = await supabase.rpc("horas_ocupadas", {
      p_fecha: format(d, "yyyy-MM-dd"),
    })
    if (error) {
      setOcupadas([])
      setErrorServidor("No pudimos cargar los horarios. Intenta de nuevo.")
    } else {
      setOcupadas(data.map((r) => r.hora))
    }
    setCargando(false)
  }

  function seleccionarDia(d) {
    setFecha(d)
    setHora(null)
    cargarOcupadas(d)
  }

  async function enviar(datos) {
    if (guardando || !token) return
    setGuardando(true)
    setErrorServidor("")

    let respuesta
    try {
      respuesta = await fetch("/api/reservar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token,
          servicio: servicio.nombre,
          fecha: format(fecha, "yyyy-MM-dd"),
          hora: hora,
          nombre: datos.nombre.trim(),
          telefono: datos.telefono,
          mascota: datos.mascota.trim(),
        }),
      })
    } catch {
      setErrorServidor("No pudimos conectar. Revisa tu internet e intenta de nuevo.")
      reiniciarWidget()
      setGuardando(false)
      return
    }

    if (respuesta.status === 201) {
      const mensaje =
        "Hola, acabo de reservar una cita en " + config.nombre + ".\n" +
        "Servicio: " + servicio.nombre + "\n" +
        "Fecha: " + fechaTexto + "\n" +
        "Hora: " + hora + "\n" +
        "Mascota: " + datos.mascota + "\n" +
        "Nombre: " + datos.nombre
      setUrlWhatsapp(
        "https://wa.me/" + config.whatsapp + "?text=" + encodeURIComponent(mensaje)
      )
      setGuardando(false)
      setEnviado(true)
      return
    }

    if (respuesta.status === 409) {
      setHora(null)
      await cargarOcupadas(fecha)
      setErrorServidor("Ese horario acaba de ser tomado. Elige otro.")
      setPaso(2)
    } else if (respuesta.status === 403) {
      setErrorServidor("No pudimos verificar que eres una persona. Intenta de nuevo.")
      reiniciarWidget()
    } else if (respuesta.status === 400) {
      setErrorServidor("Revisa los datos ingresados e intenta de nuevo.")
      reiniciarWidget()
    } else {
      setErrorServidor("No pudimos registrar tu cita. Intenta de nuevo.")
      reiniciarWidget()
    }
    setGuardando(false)
  }

  function reiniciar() {
    setPaso(1)
    setServicio(null)
    setFecha(null)
    setHora(null)
    setOcupadas([])
    setErrorServidor("")
    setUrlWhatsapp("")
    setEnviado(false)
  }

  const titulos = ["Servicio", "Fecha y hora", "Tus datos"]

  return (
    <section id="reserva" className="bg-emerald-50 py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-emerald-800">
          Reserva tu cita
        </h2>

        {enviado ? (
          <div className="mt-8 bg-white rounded-xl p-8 text-center shadow-sm">
            <div className="mx-auto w-14 h-14 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Check size={28} />
            </div>
            <h3 className="mt-4 text-xl font-semibold">Cita registrada</h3>
            <p className="mt-2 text-gray-600 capitalize">
              {servicio.nombre} - {fechaTexto}, {hora}
            </p>
            <p className="mt-2 text-gray-600">
              La clinica confirmara tu cita pronto.
            </p>
            <a
              href={urlWhatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block bg-emerald-700 text-white px-5 py-2 rounded-lg hover:bg-emerald-800"
            >
              Avisar por WhatsApp (opcional)
            </a>
            <div>
              <button
                onClick={reiniciar}
                className="mt-4 text-emerald-700 font-medium hover:underline"
              >
                Hacer otra reserva
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-8 bg-white rounded-xl p-6 shadow-sm">
            <ol className="flex justify-between text-sm mb-6">
              {titulos.map((t, i) => (
                <li
                  key={t}
                  className={
                    "flex-1 text-center pb-2 border-b-2 " +
                    (paso === i + 1
                      ? "border-emerald-600 text-emerald-700 font-semibold"
                      : paso > i + 1
                      ? "border-emerald-300 text-emerald-700"
                      : "border-gray-200 text-gray-600")
                  }
                >
                  {i + 1}. {t}
                </li>
              ))}
            </ol>

            {errorServidor && (
              <p
                role="alert"
                className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700"
              >
                {errorServidor}
              </p>
            )}

            {paso === 1 && (
              <div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {config.servicios.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setServicio(s)}
                      className={
                        "text-left border rounded-lg p-4 transition " +
                        (servicio && servicio.id === s.id
                          ? "border-emerald-600 bg-emerald-50"
                          : "border-gray-200 hover:border-emerald-300")
                      }
                    >
                      <p className="font-semibold">{s.nombre}</p>
                      <p className="text-sm text-gray-600">
                        {s.duracion} min - S/ {s.precio}
                      </p>
                    </button>
                  ))}
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    disabled={!servicio}
                    onClick={() => setPaso(2)}
                    className="bg-emerald-700 text-white px-5 py-2 rounded-lg disabled:opacity-40 hover:bg-emerald-800"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}

            {paso === 2 && (
              <div>
                <p className="text-sm font-medium text-gray-700">Elige el dia</p>
                <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
                  {DIAS.map((d) => {
                    const activo = fecha && format(fecha, "yyyy-MM-dd") === format(d, "yyyy-MM-dd")
                    return (
                      <button
                        key={d.toISOString()}
                        type="button"
                        onClick={() => seleccionarDia(d)}
                        className={
                          "shrink-0 w-20 border rounded-lg py-2 text-center " +
                          (activo
                            ? "border-emerald-600 bg-emerald-50"
                            : "border-gray-200 hover:border-emerald-300")
                        }
                      >
                        <span className="block text-xs uppercase text-gray-600">
                          {format(d, "EEE", { locale: es })}
                        </span>
                        <span className="block text-lg font-semibold">
                          {format(d, "d")}
                        </span>
                        <span className="block text-xs text-gray-600">
                          {format(d, "MMM", { locale: es })}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {fecha && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700">Elige la hora</p>
                    {cargando ? (
                      <p className="mt-2 text-sm text-gray-600">Cargando horarios...</p>
                    ) : (
                      <div className="mt-2 grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {HORAS.map((h) => {
                          const bloqueada = ocupadas.includes(h)
                          return (
                            <button
                              key={h}
                              type="button"
                              disabled={bloqueada}
                              onClick={() => setHora(h)}
                              className={
                                "border rounded-lg py-2 text-sm " +
                                (hora === h
                                  ? "border-emerald-600 bg-emerald-700 text-white"
                                  : bloqueada
                                  ? "border-gray-100 bg-gray-50 text-gray-300 line-through cursor-not-allowed"
                                  : "border-gray-200 hover:border-emerald-300")
                              }
                            >
                              {h}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-6 flex justify-between">
                  <button onClick={() => setPaso(1)} className="text-gray-600 hover:underline">
                    Atras
                  </button>
                  <button
                    disabled={!fecha || !hora}
                    onClick={() => {
                      setErrorServidor("")
                      setPaso(3)
                    }}
                    className="bg-emerald-700 text-white px-5 py-2 rounded-lg disabled:opacity-40 hover:bg-emerald-800"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}

            {paso === 3 && (
              <form onSubmit={(evento) => handleSubmit(enviar)(evento)} noValidate>
                <div className="bg-emerald-50 rounded-lg p-4 text-sm text-gray-700">
                  <p className="font-semibold">{servicio.nombre} - S/ {servicio.precio}</p>
                  <p className="capitalize">{fechaTexto}, {hora}</p>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Tu nombre</label>
                    <input
                      {...register("nombre", {
                        required: "Ingresa tu nombre",
                        minLength: { value: 3, message: "Minimo 3 letras" },
                        maxLength: { value: 80, message: "Maximo 80 letras" },
                      })}
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                    {errors.nombre && (
                      <p className="mt-1 text-xs text-red-600">{errors.nombre.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Celular</label>
                    <input
                      inputMode="numeric"
                      {...register("telefono", {
                        required: "Ingresa tu celular",
                        pattern: { value: /^9\d{8}$/, message: "9 digitos, empieza con 9" },
                      })}
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                    {errors.telefono && (
                      <p className="mt-1 text-xs text-red-600">{errors.telefono.message}</p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium">Nombre de tu mascota</label>
                    <input
                      {...register("mascota", {
                        required: "Ingresa el nombre de tu mascota",
                        maxLength: { value: 60, message: "Maximo 60 letras" },
                      })}
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                    {errors.mascota && (
                      <p className="mt-1 text-xs text-red-600">{errors.mascota.message}</p>
                    )}
                  </div>
                </div>

                <label className="mt-4 flex items-start gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    {...register("acepto", { required: "Debes aceptar para continuar" })}
                    className="mt-1"
                  />
                  <span>
                    Acepto el tratamiento de mis datos personales segun la{" "}
                    <a href="#privacidad" className="text-emerald-700 underline">
                      politica de privacidad
                    </a>
                    .
                  </span>
                </label>
                {errors.acepto && (
                  <p className="mt-1 text-xs text-red-600">{errors.acepto.message}</p>
                )}

                <div ref={widgetRef} className="mt-4" />

                <div className="mt-6 flex justify-between">
                  <button type="button" onClick={() => setPaso(2)} className="text-gray-600 hover:underline">
                    Atras
                  </button>
                  <button
                    type="submit"
                    disabled={guardando || !token}
                    className="inline-flex items-center gap-2 bg-emerald-700 text-white px-5 py-2 rounded-lg disabled:opacity-60 hover:bg-emerald-800"
                  >
                    <CalendarCheck size={18} />
                    {guardando ? "Guardando..." : "Confirmar cita"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

export default Reserva