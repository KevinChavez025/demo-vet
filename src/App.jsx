import Navbar from "./components/Navbar"
import Hero from "./components/Hero"
import Servicios from "./components/Servicios"
import Reserva from "./components/Reserva"
import Contacto from "./components/Contacto"
import Privacidad from "./components/Privacidad"
import WhatsAppFlotante from "./components/WhatsAppFlotante"
import { config } from "./data/config"

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <Servicios />
        <Reserva />
        <Contacto />
      </main>
      <footer className="bg-emerald-900 text-emerald-100 py-6 px-4 text-center text-sm">
        <p>
          {new Date().getFullYear()} {config.nombre}. Todos los derechos reservados.
        </p>
        <p className="mt-2">
          <a href="#privacidad" className="underline hover:text-white">
            Politica de privacidad
          </a>
        </p>
      </footer>
      <WhatsAppFlotante />
      <Privacidad />
    </div>
  )
}

export default App