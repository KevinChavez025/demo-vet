import { useState } from "react"
import { PawPrint, Menu, X } from "lucide-react"
import { config } from "../data/config"

const enlaces = [
  { texto: "Inicio", href: "#inicio" },
  { texto: "Servicios", href: "#servicios" },
  { texto: "Contacto", href: "#contacto" },
]

function Navbar() {
  const [abierto, setAbierto] = useState(false)

  return (
    <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-emerald-100">
      <nav className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
        <a href="#inicio" className="flex items-center gap-2 font-bold text-emerald-700">
          <PawPrint size={24} />
          {config.nombre}
        </a>

        <div className="hidden sm:flex items-center gap-6 text-sm text-gray-600">
          <a href="#servicios" className="hover:text-emerald-700">Servicios</a>
          <a href="#contacto" className="hover:text-emerald-700">Contacto</a>
          <a
            href="#reserva"
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
          >
            Reservar cita
          </a>
        </div>

        <div className="flex items-center gap-2 sm:hidden">
          <a
            href="#reserva"
            className="bg-emerald-600 text-white text-sm px-3 py-2 rounded-lg hover:bg-emerald-700"
          >
            Reservar
          </a>
          <button
            type="button"
            onClick={() => setAbierto(!abierto)}
            aria-label={abierto ? "Cerrar menu" : "Abrir menu"}
            aria-expanded={abierto}
            className="p-2 text-emerald-700"
          >
            {abierto ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </nav>

      {abierto && (
        <ul className="sm:hidden border-t border-emerald-100 bg-white px-4 py-2">
          {enlaces.map((e) => (
            <li key={e.href}>
              <a
                href={e.href}
                onClick={() => setAbierto(false)}
                className="block py-3 text-gray-700 border-b border-gray-100 last:border-0 hover:text-emerald-700"
              >
                {e.texto}
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  )
}

export default Navbar