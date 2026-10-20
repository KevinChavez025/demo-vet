import Navbar from "./components/Navbar"
import Hero from "./components/Hero"
import Servicios from "./components/Servicios"
import Reserva from "./components/Reserva"
import Contacto from "./components/Contacto"

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Servicios />
      <Reserva />
      <Contacto />
    </div>
  )
}

export default App