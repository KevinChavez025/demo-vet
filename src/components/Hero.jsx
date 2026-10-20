import { CalendarCheck } from "lucide-react"
import { config } from "../data/config"

function Hero() {
  return (
    <section id="inicio" className="bg-emerald-50 py-20 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-emerald-800">
          {config.nombre}
        </h1>
        <p className="mt-4 text-lg text-gray-600">{config.eslogan}</p>
        <a
          href="#reserva"
          className="mt-8 inline-flex items-center gap-2 bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-800"
        >
          <CalendarCheck size={20} />
          Reservar cita
        </a>
        <p className="mt-4 text-sm text-gray-600">{config.horario}</p>
      </div>
    </section>
  )
}

export default Hero