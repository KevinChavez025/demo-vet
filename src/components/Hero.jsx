import {
  CalendarCheck,
  MessageCircle,
  PawPrint,
  ShieldCheck,
  Clock,
  HeartHandshake,
} from "lucide-react"
import { config } from "../data/config"

const puntos = [
  { Icono: ShieldCheck, texto: "Atencion profesional" },
  { Icono: Clock, texto: "Reserva en 1 minuto" },
  { Icono: HeartHandshake, texto: "Trato cercano" },
]

function Hero() {
  const urlWhatsapp =
    "https://wa.me/" +
    config.whatsapp +
    "?text=" +
    encodeURIComponent("Hola, quisiera hacer una consulta.")

  return (
    <section
      id="inicio"
      className="bg-gradient-to-b from-emerald-50 to-white py-16 px-4"
    >
      <div className="max-w-5xl mx-auto grid gap-10 md:grid-cols-2 items-center">
        <div className="text-center md:text-left">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 text-emerald-800 text-sm font-medium px-3 py-1">
            <PawPrint size={16} />
            {config.nombre}
          </span>

          <h1 className="mt-4 text-4xl sm:text-5xl font-bold leading-tight text-emerald-900">
            {config.eslogan}
          </h1>

          <p className="mt-4 text-lg text-gray-600">
            Consultas, vacunas y cuidado diario. Reserva tu cita en linea y
            evita las esperas.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
            <a
              href="#reserva"
              className="inline-flex items-center justify-center gap-2 bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-800"
            >
              <CalendarCheck size={20} />
              Reservar cita
            </a>
            <a
              href={urlWhatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border border-emerald-700 text-emerald-800 px-6 py-3 rounded-lg font-medium hover:bg-emerald-50"
            >
              <MessageCircle size={20} />
              Escribenos
            </a>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 justify-center md:justify-start text-sm text-gray-700">
            {puntos.map((p) => (
              <li key={p.texto} className="flex items-center gap-2">
                <p.Icono size={18} className="text-emerald-700" />
                {p.texto}
              </li>
            ))}
          </ul>

          <p className="mt-6 text-sm text-gray-600">{config.horario}</p>
        </div>

        <div className="order-first md:order-last">
          {config.foto ? (
            <img
              src={config.foto}
              alt={"Mascota atendida en " + config.nombre}
              width="600"
              height="450"
              className="w-full max-h-96 object-cover rounded-2xl shadow-lg"
            />
          ) : (
            <div className="mx-auto w-64 h-64 md:w-full md:h-80 rounded-2xl bg-emerald-100 flex items-center justify-center shadow-inner">
              <PawPrint size={120} className="text-emerald-700 opacity-80" />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default Hero