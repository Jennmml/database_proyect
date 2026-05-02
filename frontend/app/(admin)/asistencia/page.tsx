"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Search } from "lucide-react"
import { toast } from "sonner"
import ClienteSesion from "@/types/clienteSesion"

const api = "https://api.mytry.dev"

export default function AsistenciaPage() {
  const [selectedSesion, setSelectedSesion] = useState("")
  const [sesionesProgramadas, setSesionesProgramadas] = useState<ClienteSesion[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchSesiones = async () => {
      try {
        const res = await fetch(`${api}/clientes/vistaClientesSesion`)
        const data = await res.json()

        if (data.success && Array.isArray(data.tables[0])) {
          const sesiones = data.tables[0].map((s: any) => ({
            id_sesion_programada: s.id_sesion_programada,
            cedula: s.cedula,
            nombre_cliente: s.nombre_cliente,
            nombre_clase: s.nombre_clase,
            descripcion_clase: s.descripcion_clase,
            numero_grupo: s.numero_grupo,
            fecha_sesion: s.fecha_sesion,
            dia: s.dia,
            hora_inicio: s.hora_inicio,
            hora_fin: s.hora_fin,
            asistio: s.asistio,
          }))
          setSesionesProgramadas(sesiones)
        } else {
          throw new Error("Formato de datos inválido")
        }
      } catch (err) {
        console.error("Error al cargar sesiones:", err)
      }
    }

    fetchSesiones()
  }, [])

  const registrarAsistencia = async (cedula: string, id_sesion_programada: number, asistio: boolean) => {
    try {
      const response = await fetch(`${api}/clases/registrarAsistencia`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cedula, id_sesion_programada, asistio }),
      })

      if (response.ok) {
        setSesionesProgramadas(prev =>
          prev.map(cliente =>
            cliente.cedula === cedula && cliente.id_sesion_programada === id_sesion_programada
              ? { ...cliente, asistio }
              : cliente
          )
        )
        toast.success("Asistencia registrada con éxito")
      } else {
        const errText = await response.text()
        toast.error(errText)
      }
    } catch (error) {
      console.error("Error al registrar asistencia:", error)
      toast.error("Ocurrió un error inesperado al registrar la asistencia")
    }
  }

  const sesionesUnicas = Array.from(
    new Map(
      sesionesProgramadas.map((s) => [
        s.id_sesion_programada,
        {
          id: s.id_sesion_programada,
          descripcion: `${s.nombre_clase} - ${s.fecha_sesion.slice(0, 10)} (${s.hora_inicio.slice(11, 16)} - ${s.hora_fin.slice(11, 16)}) - Grupo ${s.numero_grupo}`,
        },
      ])
    ).values()
  )

  const clientesFiltrados = sesionesProgramadas.filter(
    (c) => c.id_sesion_programada.toString() === selectedSesion &&
      c.nombre_cliente.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sesionActiva = sesionesProgramadas.find(
    (s) => s.id_sesion_programada.toString() === selectedSesion
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Control de Asistencia</h1>
        <p className="text-muted-foreground">Registra la asistencia de los clientes a las clases</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Seleccionar Sesión</CardTitle>
            <CardDescription>Elige la sesión para registrar asistencia</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Label>Sesión Programada</Label>
            <Select value={selectedSesion} onValueChange={setSelectedSesion}>
              <SelectTrigger className="bg-white text-black">
                <SelectValue placeholder="Seleccionar sesión" />
              </SelectTrigger>
              <SelectContent className="bg-white text-black shadow-xl border border-gray-300">
                {sesionesUnicas.map((s) => (
                  <SelectItem key={s.id} value={s.id.toString()}>
                    {s.descripcion}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información de la Sesión</CardTitle>
          </CardHeader>
          <CardContent>
            {sesionActiva ? (
              <div className="space-y-2">
                <div><strong>Clase:</strong> {sesionActiva.nombre_clase}</div>
                <div><strong>Fecha:</strong> {sesionActiva.fecha_sesion.slice(0, 10)}</div>
                <div><strong>Horario:</strong> {sesionActiva.hora_inicio.slice(11, 16)} - {sesionActiva.hora_fin.slice(11, 16)}</div>
                <div><strong>Grupo:</strong> {sesionActiva.numero_grupo}</div>
              </div>
            ) : (
              <p className="text-muted-foreground">Selecciona una sesión para ver los detalles</p>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedSesion && (
        <Card>
          <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
            <CardDescription>Marca la asistencia de cada cliente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-4">
              <Input
                className="pl-8"
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cédula</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientesFiltrados.map((cliente) => (
                  <TableRow key={`${cliente.cedula}-${cliente.id_sesion_programada}`}>
                    <TableCell>{cliente.cedula}</TableCell>
                    <TableCell>{cliente.nombre_cliente}</TableCell>
                    <TableCell>
                      {cliente.asistio === true && <Badge variant="default">Asistió</Badge>}
                      {cliente.asistio === false && <Badge variant="destructive">No Asistió</Badge>}
                      {cliente.asistio === null && <Badge variant="outline">Pendiente</Badge>}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant={cliente.asistio === true ? "default" : "outline"}
                          className={cliente.asistio === true ? "bg-green-500 text-white" : ""}
                          onClick={() => registrarAsistencia(cliente.cedula, cliente.id_sesion_programada, true)}
                          disabled={cliente.asistio !== null}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Asistió
                        </Button>
                        <Button
                          size="sm"
                          variant={cliente.asistio === false ? "destructive" : "outline"}
                          className={cliente.asistio === false ? "bg-red-500 text-white" : ""}
                          onClick={() => registrarAsistencia(cliente.cedula, cliente.id_sesion_programada, false)}
                          disabled={cliente.asistio !== null}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          No Asistió
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}