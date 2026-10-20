import { useState } from "react"
import { useForm } from "react-hook-form"
import { addDays, format, getDay } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarCheck, Check } from "lucide-react"
import { config } from "../data/config"

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

function ocupada(fecha, hora) {
  const s = format(fecha, "yyyy-MM-dd") + hora
  let n = 0
  for (let i = 0; i < s.length; i++) n += s.charCodeAt(i)
  return n % 4 === 0
}

const DIAS = proximosDias()

function Reserva() {
  const [paso, setPaso] = useState(1)
  const [servicio, setServicio] = useState(null)
  const [fecha, setFecha] = useState(null)
  const [hora, setHora] = useState(null)
  const [enviado, setEnviado] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const fechaTexto = fecha ? format(fecha, "EEEE d 'de' MMMM", { locale: es }) : ""

  function enviar(datos) {
    const mensaje =
      "Hola, quiero reservar una cita en " + config.nombre + ".\n" +
      "Servicio: " + servicio.nombre + "\n" +
      "Fecha: " + fechaTexto + "\n" +
      "Hora: " + hora + "\n" +
      "Mascota: " + datos.mascota + "\n" +
      "Nombre: " + datos.nombre + "\n" +
      "Telefono: " + datos.telefono
    const url = "https://wa.me/" + config.whatsapp + "?text=" + encodeURIComponent(mensaje)
    window.open(url, "_blank", "noopener,noreferrer")
    setEnviado(true)
  }

  function reiniciar() {
    setPaso(1)
    setServicio(null)
    setFecha(null)
    setHora(null)
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
            <h3 className="mt-4 text-xl font-semibold">Solicitud enviada</h3>
            <p className="mt-2 text-gray-600">
              Se abrio WhatsApp con tu solicitud. La clinica te confirmara la cita.
            </p>
            <button
              onClick={reiniciar}
              className="mt-6 text-emerald-700 font-medium hover:underline"
            >
              Hacer otra reserva
            </button>
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
                      ? "border-emerald-300 text-emerald-500"
                      : "border-gray-200 text-gray-400")
                  }
                >
                  {i + 1}. {t}
                </li>
              ))}
            </ol>

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
                      <p className="text-sm text-gray-500">
                        {s.duracion} min - S/ {s.precio}
                      </p>
                    </button>
                  ))}
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    disabled={!servicio}
                    onClick={() => setPaso(2)}
                    className="bg-emerald-600 text-white px-5 py-2 rounded-lg disabled:opacity-40 hover:bg-emerald-700"
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
                        onClick={() => {
                          setFecha(d)
                          setHora(null)
                        }}
                        className={
                          "shrink-0 w-20 border rounded-lg py-2 text-center " +
                          (activo
                            ? "border-emerald-600 bg-emerald-50"
                            : "border-gray-200 hover:border-emerald-300")
                        }
                      >
                        <span className="block text-xs uppercase text-gray-500">
                          {format(d, "EEE", { locale: es })}
                        </span>
                        <span className="block text-lg font-semibold">
                          {format(d, "d")}
                        </span>
                        <span className="block text-xs text-gray-500">
                          {format(d, "MMM", { locale: es })}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {fecha && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700">Elige la hora</p>
                    <div className="mt-2 grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {HORAS.map((h) => {
                        const bloqueada = ocupada(fecha, h)
                        return (
                          <button
                            key={h}
                            type="button"
                            disabled={bloqueada}
                            onClick={() => setHora(h)}
                            className={
                              "border rounded-lg py-2 text-sm " +
                              (hora === h
                                ? "border-emerald-600 bg-emerald-600 text-white"
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
                  </div>
                )}

                <div className="mt-6 flex justify-between">
                  <button onClick={() => setPaso(1)} className="text-gray-500 hover:underline">
                    Atras
                  </button>
                  <button
                    disabled={!fecha || !hora}
                    onClick={() => setPaso(3)}
                    className="bg-emerald-600 text-white px-5 py-2 rounded-lg disabled:opacity-40 hover:bg-emerald-700"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}

            {paso === 3 && (
              <form onSubmit={handleSubmit(enviar)} noValidate>
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
                      {...register("mascota", { required: "Ingresa el nombre de tu mascota" })}
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
                  Acepto el tratamiento de mis datos personales para gestionar mi cita.
                </label>
                {errors.acepto && (
                  <p className="mt-1 text-xs text-red-600">{errors.acepto.message}</p>
                )}

                <div className="mt-6 flex justify-between">
                  <button type="button" onClick={() => setPaso(2)} className="text-gray-500 hover:underline">
                    Atras
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-700"
                  >
                    <CalendarCheck size={18} />
                    Confirmar por WhatsApp
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