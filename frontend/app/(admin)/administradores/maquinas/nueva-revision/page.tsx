"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

const api = "https://api.mytry.dev"

export default function NuevaRevisionForm() {
  const [cedula, setCedula] = useState("")
  const [admin, setAdmin] = useState<any | null>(null)
  const [maquinas, setMaquinas] = useState<any[]>([])
  const [estados, setEstados] = useState<any[]>([])
  const [idMaquina, setIdMaquina] = useState("")
  const [estadoNuevo, setEstadoNuevo] = useState("")
  const [observacion, setObservacion] = useState("")

  const buscarAdmin = async () => {
    try {
      const res = await fetch(`${api}/consultas/admin/${cedula}`)
      const data = await res.json()
      if (data.success) {
        setAdmin(data.data)
      } else {
        toast.error("Administrador no encontrado")
        setAdmin(null)
      }
    } catch (err) {
      console.error(err)
      toast.error("Error al buscar administrador")
    }
  }

  useEffect(() => {
    const cargarDatos = async () => {
      const [maquinasRes, estadosRes] = await Promise.all([
        fetch(`${api}/consultas/maquinas`).then(r => r.json()),
        fetch(`${api}/consultas/estadosMaquina`).then(r => r.json()),
      ])
      if (maquinasRes.success) setMaquinas(maquinasRes.data)
      if (estadosRes.success) setEstados(estadosRes.data)
    }
    cargarDatos()
  }, [])

  const enviarRevision = async () => {
    if (!idMaquina || !estadoNuevo || !observacion || !cedula) {
      toast.warning("Por favor, complete todos los campos")
      return
    }

    try {
      const res = await fetch(`${api}/maquinas/nuevaRevisionMaquina`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_maquina: parseInt(idMaquina),
          cedula_admin: cedula,
          nuevo_estado: parseInt(estadoNuevo),
          observacion,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        toast.success("Revisión registrada correctamente")
        setIdMaquina("")
        setEstadoNuevo("")
        setObservacion("")
      } else {
        toast.error("Error: " + data.message)
      }
    } catch (err) {
      console.error(err)
      toast.error("Error al registrar revisión")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/administradores">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nueva Revisión</h1>
          <p className="text-muted-foreground">Registrar una revisión técnica de una máquina</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos de la Revisión</CardTitle>
          <CardDescription>Completa todos los campos requeridos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Cédula Administrador</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Ej: 264451244"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
              />
              <Button variant="outline" onClick={buscarAdmin}>Buscar</Button>
            </div>
            {admin && (
              <p className="text-sm text-muted-foreground mt-1">
                Admin: <strong>{admin.nombre} {admin.apellido1}</strong> (Contratado: {new Date(admin.fecha_contratacion).toLocaleDateString()})
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Máquina</Label>
            <Select value={idMaquina} onValueChange={setIdMaquina}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione una máquina" />
              </SelectTrigger>
              <SelectContent className="bg-white text-black">
                {maquinas.map((m) => (
                  <SelectItem key={m.id_maquina} value={m.id_maquina.toString()}>
                    #{m.id_maquina} - {m.tipo} - {m.modelo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Nuevo Estado</Label>
            <Select value={estadoNuevo} onValueChange={setEstadoNuevo}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un estado" />
              </SelectTrigger>
              <SelectContent className="bg-white text-black">
                {estados.map((e) => (
                  <SelectItem key={e.id_estado} value={e.id_estado.toString()}>
                    {e.estado}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacion">Observación</Label>
            <textarea
              id="observacion"
              placeholder="Observaciones sobre el estado de la máquina..."
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              rows={4}
              className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>

          <div className="flex justify-start pt-4">
            <Button onClick={enviarRevision}>
              Registrar Revisión
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
