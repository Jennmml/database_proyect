"use client"

import { useEffect, useState,useRef } from "react"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import Entrenador from "@/types/entrenador"
import SesionSinEntrenador from "@/types/sesionUnica"
import EstadisticaEntrenador from "@/types/estadisticaEntrenador"
import EntrenadoresSesionesTotales from "./sesionesTotales"

const api= "https://api.mytry.dev"

export default function AsignarEntrenadorPage() {
  const [entrenadores, setEntrenadores] = useState<Entrenador[]>([])
  const [sesiones, setSesiones] = useState<SesionSinEntrenador[]>([])
  const [estadisticas, setEstadisticas] = useState<EstadisticaEntrenador[]>([])
  const [selectedEntrenador, setSelectedEntrenador] = useState("")
  const [selectedSesion, setSelectedSesion] = useState("")
  const yaMostrado = useRef(false)

  useEffect(() => {
    const verificarSesionesSinEntrenador = async () => {
      try {
        if (yaMostrado.current) return
        yaMostrado.current = true

        const toastKey = "toastSesionesMostrado"
        if (localStorage.getItem(toastKey)) return

        const res = await fetch(`${api}/sesiones/cursorSesionesSinEntrenador`)
        const data = await res.json()

        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const sesiones = data.data

          const resumen = sesiones
            .slice(0, 3)
            .map((s: any) => `${s.nombre_clase} (Grupo ${s.numero_grupo})`)
            .join(", ") + (sesiones.length > 3 ? ` y ${sesiones.length - 3} más...` : "")

          toast.warning(`${sesiones.length} sesiones sin entrenador asignado`, {
            description: resumen,
            duration: 6000,
            action: {
              label: "Ver detalles",
              onClick: () => {
                window.location.href = "/sesiones"
              },
            },
          })

          localStorage.setItem(toastKey, "true")
          setTimeout(() => {
            localStorage.removeItem(toastKey)
          }, 10000)
        }
      } catch (error) {
        console.error("Error al verificar sesiones sin entrenador:", error)
      }
    }

    verificarSesionesSinEntrenador()
  }, [])


  const fetchEntrenadores = async () => {
    try {
      const res = await fetch(`${api}/consultas/entrenadores`)
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) {
        setEntrenadores(data.data)
      } else {
        throw new Error("Formato inválido de entrenadores")
      }
    } catch (error) {
      toast.error("Error al cargar entrenadores")
    }
  }

  const fetchSesiones = async () => {
    try {
      const res = await fetch(`${api}/entrenadores/vistaSesionesSinEntrenador`)
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) {
        const sesionesFormateadas = data.data.map((s: any) => ({
          id: s.id_sesion_programada,
          descripcion: `${s.nombre_clase} - ${s.fecha.slice(0, 10)} (${s.hora_inicio.slice(11, 16)} - ${s.hora_fin.slice(11, 16)}) - Grupo ${s.numero_grupo}`
        }))
        setSesiones(sesionesFormateadas)
      } else {
        throw new Error("Formato inválido de sesiones sin entrenador")
      }
    } catch (error) {
      toast.error("Error al cargar sesiones sin entrenador")
    }
  }

  const fetchEstadisticas = async () => {
    try {
      const res = await fetch(`${api}/entrenadores/vistaEntrenadorSesionesTotales`)
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) {
        setEstadisticas(data.data)
      } else {
        throw new Error("Formato inválido de estadísticas")
      }
    } catch (error) {
      toast.error("Error al cargar estadísticas")
    }
  }


  useEffect(() => {
    fetchEntrenadores()
    fetchSesiones()
    fetchEstadisticas()
  }, [])


  const asignarEntrenador = async () => {
    try {
      const res = await fetch(`${api}/entrenadores/asignarEntrenadorASesionProgramada`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cedula_entrenador: selectedEntrenador,
          id_sesion_programada: parseInt(selectedSesion)
        })
      })

      if (res.ok) {
        toast.success("Entrenador asignado con éxito")
        setSelectedEntrenador("")
        setSelectedSesion("")
        await fetchSesiones()
        await fetchEstadisticas()
      } else {
        const msg = await res.text()
        toast.error(msg)
      }
    } catch (error) {
      toast.error("Error al asignar entrenador")
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <h1 className="text-3xl font-bold">Asignar Entrenador</h1>
        <p className="text-muted-foreground mb-4">Selecciona un entrenador y una sesión sin asignar</p>
        <Card>
          <CardHeader>
            <CardTitle>Formulario</CardTitle>
            <CardDescription>Entrenador y sesión</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>Entrenador</Label>
              <Select value={selectedEntrenador} onValueChange={setSelectedEntrenador}>
                <SelectTrigger className="bg-white text-black">
                  <SelectValue placeholder="Seleccionar entrenador" />
                </SelectTrigger>
                <SelectContent className="bg-white text-black">
                  {entrenadores.map((e) => (
                    <SelectItem key={e.cedula} value={e.cedula}>
                      {e.cedula} - {e.nombre} {e.apellido1} {e.apellido2} ({e.tipo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Sesión</Label>
              <Select value={selectedSesion} onValueChange={setSelectedSesion}>
                <SelectTrigger className="bg-white text-black">
                  <SelectValue placeholder="Seleccionar sesión" />
                </SelectTrigger>
                <SelectContent className="bg-white text-black">
                  {sesiones.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      {s.descripcion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={asignarEntrenador}
              disabled={!selectedEntrenador || !selectedSesion}
            >
              Asignar Entrenador
            </Button>
          </CardContent>
        </Card>
      </div>


      <EntrenadoresSesionesTotales estadisticas={estadisticas} />
    </div>
  )
}
