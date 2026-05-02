import { Persona } from "@/types/persona"

interface ClientCardProps {
  persona: Persona | null
  mt?: number 
}

export default function clientCard({ persona, mt }: ClientCardProps) {
    return (
        <div>
            {persona && (
                <div className={`w-full md:w-[300px] border rounded-lg p-4 shadow-sm  ${mt ? `mt-${mt}` : ''}`}>
                    <h3 className="text-lg font-semibold mb-1">Cliente encontrado</h3>
                    <p><strong>Nombre:</strong> {persona.nombre} {persona.apellido1} {persona.apellido2}</p>
                    <p><strong>Cédula:</strong> {persona.cedula}</p>
                    <p><strong>Correo:</strong> {persona.correo}</p>
                    <p><strong>Teléfono:</strong> {persona.telefono}</p>
                    <p><strong>Estado:</strong> {persona.estado_cliente}</p>
                    <p><strong>Registro:</strong> {new Date(persona.fecha_registro).toLocaleDateString()}</p>
                    <p><strong>Membresía:</strong> {persona.tipo_membresia ?? "Ninguna"}</p>
                    <p><strong>Expira:</strong> {persona.fecha_expiracion ? new Date(persona.fecha_expiracion).toLocaleDateString() : "No tiene membresia"}</p>
        </div>
      )}
    </div>
    )
}