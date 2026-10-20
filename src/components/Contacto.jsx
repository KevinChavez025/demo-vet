import { MapPin, Clock, MessageCircle } from "lucide-react"
import { config } from "../data/config"

function Contacto() {
  const urlWhatsapp =
    "https://wa.me/" +
    config.whatsapp +
    "?text=" +
    encodeURIComponent("Hola, quisiera hacer una consulta.")

  const urlMapa =
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(config.direccion)

  return (
    <>
      <section id="contacto" className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-emerald-800">
            Contacto
          </h2>
          <p className="mt-2 text-center text-gray-600">
            Estamos para ayudarte
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <MapPin size={20} />
              </div>
              <div>
                <p className="font-semibold">Direccion</p>
                <p className="text-gray-600">{config.direccion}</p>
                <a
                  href={urlMapa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-emerald-700 hover:underline"
                >
                  Ver en el mapa
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <Clock size={20} />
              </div>
              <div>
                <p className="font-semibold">Horario</p>
                <p className="text-gray-600">{config.horario}</p>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center">
            <a
              href={urlWhatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700"
            >
              <MessageCircle size={20} />
              Escribenos por WhatsApp
            </a>
          </div>
        </div>
      </section>

      <footer className="bg-emerald-900 text-emerald-100 py-6 px-4 text-center text-sm">
        <p>
          {new Date().getFullYear()} {config.nombre}. Todos los derechos reservados.
        </p>
      </footer>
    </>
  )
}

export default Contacto