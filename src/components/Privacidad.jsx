import { X } from "lucide-react"
import { config } from "../data/config"

function Privacidad() {
  return (
    <section
      id="privacidad"
      aria-label="Politica de privacidad"
      className="hidden target:flex fixed inset-0 z-20 items-center justify-center bg-black/50 p-4"
    >
      <div className="relative bg-white rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 text-sm text-gray-700">
        <a
          href="#reserva"
          aria-label="Cerrar politica de privacidad"
          className="absolute top-3 right-3 p-2 text-gray-600 hover:text-gray-900"
        >
          <X size={22} />
        </a>

        <h2 className="text-xl font-bold text-emerald-800 pr-8">
          Politica de privacidad
        </h2>
        <p className="mt-1 text-gray-600">Ultima actualizacion: octubre 2026</p>

        <h3 className="mt-5 font-semibold">1. Responsable</h3>
        <p className="mt-1">
          {config.nombre}, ubicada en {config.direccion}.
        </p>

        <h3 className="mt-5 font-semibold">2. Datos que recopilamos</h3>
        <p className="mt-1">
          Nombre, numero de celular, nombre de tu mascota, servicio elegido,
          fecha y hora de la cita.
        </p>

        <h3 className="mt-5 font-semibold">3. Para que los usamos</h3>
        <p className="mt-1">
          Solo para gestionar y confirmar tu cita. No usamos tus datos para
          otros fines ni los vendemos a terceros.
        </p>

        <h3 className="mt-5 font-semibold">4. Como se envian</h3>
        <p className="mt-1">
          Al confirmar, se abre WhatsApp con un mensaje que contiene tus datos y
          que se envia a la clinica. Este sitio web no guarda tus datos en
          ningun servidor. El uso de WhatsApp se rige por sus propias politicas.
        </p>

        <h3 className="mt-5 font-semibold">5. Conservacion</h3>
        <p className="mt-1">
          Conservamos tus datos solo el tiempo necesario para atender tu cita y
          cumplir obligaciones legales.
        </p>

        <h3 className="mt-5 font-semibold">6. Tus derechos</h3>
        <p className="mt-1">
          Segun la Ley 29733 (Ley de Proteccion de Datos Personales) puedes
          solicitar acceso, rectificacion, cancelacion y oposicion sobre tus
          datos escribiendonos por WhatsApp o en nuestra direccion.
        </p>

        <div className="mt-6 text-right">
          <a
            href="#reserva"
            className="inline-block bg-emerald-700 text-white px-5 py-2 rounded-lg hover:bg-emerald-800"
          >
            Cerrar
          </a>
        </div>
      </div>
    </section>
  )
}

export default Privacidad