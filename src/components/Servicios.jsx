import { Stethoscope, Syringe, Scissors, Bug, Clock } from "lucide-react"
import { config } from "../data/config"

const iconos = {
  1: Stethoscope,
  2: Syringe,
  3: Scissors,
  4: Bug,
}

function Servicios() {
  return (
    <section id="servicios" className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-emerald-800">
          Nuestros servicios
        </h2>
        <p className="mt-2 text-center text-gray-600">
          Elige el que necesita tu mascota
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {config.servicios.map((s) => {
            const Icono = iconos[s.id] || Stethoscope
            return (
              <article
                key={s.id}
                className="border border-emerald-100 rounded-xl p-6 text-center shadow-sm hover:shadow-md transition"
              >
                <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <Icono size={24} />
                </div>
                <h3 className="mt-4 font-semibold text-gray-800">{s.nombre}</h3>
                <p className="mt-1 flex items-center justify-center gap-1 text-sm text-gray-500">
                  <Clock size={14} />
                  {s.duracion} min
                </p>
                <p className="mt-3 text-xl font-bold text-emerald-700">
                  S/ {s.precio}
                </p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Servicios