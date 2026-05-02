"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { CheckCircle } from "lucide-react"
import { Persona } from "@/types/persona"
import ClientCard from "./clientCard"
import { toast } from "sonner"

interface Sesion {
  id_sesion_programada: number 
  nombre_clase: string
  descripcion_clase: string
  numero_grupo: number
  dia: string
  hora_inicio: string
  hora_fin: string
}

const api = "https://api.mytry.dev"

export default function InscripcionesPage() {
  const [cedula, setCedula] = useState("")
  const [persona, setPersona] = useState<Persona | null>(null)
  const [sesiones, setSesiones] = useState<Sesion[]>([])
  const [sesionSeleccionada, setSesionSeleccionada] = useState<number | null>(null)

  useEffect(() => {
    const fetchSesiones = async () => {
      try {
        const response = await fetch(`${api}/sesiones/vistaDetallesSesion`)
        const data = await response.json()
        if (data.success && Array.isArray(data.tables[0])) {
          setSesiones(data.tables[0])
        } else {
          throw new Error("No se pudieron obtener las sesiones.")
        }
      } catch (error) {
        console.error("Error al cargar sesiones:", error)
        toast.error("Error al cargar sesiones.")
      }
    }

    fetchSesiones()
  }, [])

  const buscarPersona = async () => {
    if (cedula.trim().length !== 9) {
      toast.error("La cédula debe tener exactamente 9 dígitos.")
      setPersona(null)
      return
    }

    try {
      const response = await fetch(`${api}/consultas/cliente/${cedula.trim()}`)
      const data = await response.json()
      if (data.success) {
        setPersona(data.data)
      } else {
        setPersona(null)
        toast.error(`No se encontró ningún cliente con la cédula ${cedula}`)
      }
    } catch (error) {
      console.error("Error al buscar cliente:", error)
      setPersona(null)
      toast.error("Ocurrió un error al buscar el cliente.")
    }
  }

  const tieneMembresiaActiva = () => {
    if (!persona) return false
    if (!persona.tipo_membresia || !persona.fecha_expiracion) return false

    const hoy = new Date()
    const fechaExp = new Date(persona.fecha_expiracion)
    return fechaExp >= hoy
  }

  const handleInscripcion = async () => {
    if (!persona || !sesionSeleccionada) {
      toast.error("Debe seleccionar una sesión y haber buscado una persona válida.")
      return
    }

    try {
      const response = await fetch(`${api}/sesiones/inscribirClienteASesion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cedula_cliente: persona.cedula,
          id_sesion_programada: sesionSeleccionada
        }),
      })

      const result = await response.json()
      if (response.ok && result.success) {
        toast.success("✅ Inscripción exitosa")
        setCedula("")
        setPersona(null)
        setSesionSeleccionada(null)
      } else {
        toast.error(result.message || "No se pudo completar la inscripción.")
      }
    } catch (error) {
      console.error("Error al inscribir:", error)
      toast.error("Ocurrió un error en el servidor.")
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 mx-10 mt-5">
      <div className="flex-1 space-y-6 max-w-xl">
        <h1 className="text-3xl font-bold tracking-tight">Inscripción a Sesiones</h1>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Inscribir cliente a una sesión</h2>

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Label htmlFor="cedula">Cédula</Label>
              <Input
                id="cedula"
                type="text"
                placeholder="Ej: 123456789"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
              />
            </div>
            <Button className="h-[42px] mt-[22px]" onClick={buscarPersona}>
              Buscar persona
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Sesiones disponibles</Label>

            {persona && !tieneMembresiaActiva() && (
              <p className="text-red-600 text-sm">
                El cliente no tiene una membresía activa. No puede inscribirse en sesiones.
              </p>
            )}

            <div className="grid gap-3">
              {sesiones.map((sesion, index) => {
                const isSelected = sesionSeleccionada === sesion.id_sesion_programada
                const isDisabled = sesionSeleccionada !== null && !isSelected

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSesionSeleccionada(isSelected ? null : sesion.id_sesion_programada)}
                    disabled={isDisabled || !persona || !tieneMembresiaActiva()}
                    className={`relative w-full text-left px-5 py-3 rounded-lg border transition font-medium
                      ${isSelected
                        ? "bg-primary text-white border-primary shadow-lg ring-2 ring-primary"
                        : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"}
                      ${isDisabled || !persona || !tieneMembresiaActiva()
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-semibold">{sesion.nombre_clase}</div>
                        <div className="text-sm text-muted-foreground">
                          Grupo {sesion.numero_grupo} - {sesion.dia} de{" "}
                          {new Date(sesion.hora_inicio).toLocaleTimeString("es-CR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          a{" "}
                          {new Date(sesion.hora_fin).toLocaleTimeString("es-CR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle className="h-5 w-5 text-white bg-green-600 rounded-full p-0.5" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <Button
            className="w-full mt-4"
            onClick={handleInscripcion}
            disabled={!persona || !sesionSeleccionada || !tieneMembresiaActiva()}
          >
            Inscribir
          </Button>
        </div>
      </div>

      {persona && (
        <ClientCard
          persona={persona}
          mt={32}
        />
      )}
    </div>
  )
}
