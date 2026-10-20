import Navbar from "./components/Navbar"
import Hero from "./components/Hero"
import Servicios from "./components/Servicios"
import Reserva from "./components/Reserva"
import Contacto from "./components/Contacto"
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
      </footer>
    </div>
  )
}

export default App