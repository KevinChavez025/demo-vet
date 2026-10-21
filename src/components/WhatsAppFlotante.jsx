import { MessageCircle } from "lucide-react"
import { config } from "../data/config"

function WhatsAppFlotante() {
  const url =
    "https://wa.me/" +
    config.whatsapp +
    "?text=" +
    encodeURIComponent("Hola, quisiera hacer una consulta.")

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribenos por WhatsApp"
      className="fixed bottom-5 right-5 z-10 flex items-center justify-center w-14 h-14 rounded-full bg-green-600 text-white shadow-lg hover:bg-green-700 hover:scale-105 transition"
    >
      <MessageCircle size={28} />
    </a>
  )
}

export default WhatsAppFlotante