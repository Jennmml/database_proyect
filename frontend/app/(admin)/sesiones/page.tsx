"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Search, Users2, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent
} from "@/components/ui/card"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog"
import { Sesion } from "@/types/sesion"
import Inscripcion from "@/types/inscripcion"

export default function SesionesPage() {
  const [sesiones, setSesiones] = useState<Sesion[]>([])
  const [sesionesUnicas, setSesionesUnicas] = useState<Sesion[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [inscritos, setInscritos] = useState<Inscripcion[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tituloSesion, setTituloSesion] = useState("")
  const [idSesionActual, setIdSesionActual] = useState<number | null>(null)

  const fetchSesiones = async () => {
    try {
      const response = await fetch("https://api.mytry.dev/clientes/vistaClientesSesion")
      const data = await response.json()
      if (data.success && Array.isArray(data.tables) && Array.isArray(data.tables[0])) {
        setSesiones(data.tables[0])
        const únicas = agruparSesiones(data.tables[0])
        setSesionesUnicas(únicas)
      } else {
        throw new Error("Formato de datos inválido")
      }
    } catch (error) {
      console.error("Error al cargar sesiones:", error)
    }
  }

  useEffect(() => {
    fetchSesiones()
  }, [])

  const agruparSesiones = (sesiones: Sesion[]) => {
    const mapa = new Map<number, Sesion>()
    sesiones.forEach((s) => {
      if (!mapa.has(s.id_sesion_programada)) {
        mapa.set(s.id_sesion_programada, s)
      }
    })
    return Array.from(mapa.values())
  }

  const handleVerInscritos = async (id: number, clase: string, grupo: string) => {
    try {
      const res = await fetch(`https://api.mytry.dev/sesiones/obtenerInscritosPorSesion/${id}`)
      const json = await res.json()
      if (json.success) {
        setTituloSesion(`Clase: ${clase} | Grupo: ${grupo}`)
        setIdSesionActual(id)
        setInscritos(json.data)
        setModalOpen(true)
      } else {
        alert("No se pudieron obtener los inscritos.")
      }
    } catch (error) {
      console.error("Error al obtener inscritos:", error)
    }
  }

  const handleEliminarSesion = async (id: number) => {
    const confirmar = confirm("¿Deseas eliminar esta sesión programada? Esta acción no se puede deshacer.")
    if (!confirmar) return

    try {
      setLoading(true)
      const res = await fetch("https://api.mytry.dev/sesiones/eliminarSesion", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ id_sesion_programada: id })
      })

      const result = await res.json()

      if (res.ok && result.success) {
        alert("✅ Sesión eliminada correctamente.")
        fetchSesiones()
      } else {
        throw new Error(result.message || "Error desconocido")
      }
    } catch (err) {
      console.error("Error al eliminar sesión:", err)
      alert("No se pudo eliminar la sesión.")
    } finally {
      setLoading(false)
    }
  }

  const handleDesinscribir = async (cedula: string) => {
    if (!idSesionActual) return
    const confirmar = confirm(`¿Deseas desinscribir al cliente con cédula ${cedula}?`)
    if (!confirmar) return

    try {
      const res = await fetch("https://api.mytry.dev/sesiones/desinscribirClienteDeSesion", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          cedula,
          id_sesion_programada: idSesionActual
        })
      })

      const result = await res.json()
      if (result.success) {
        alert("Cliente desinscrito correctamente.")
        setInscritos((prev) => prev.filter(i => i.cedula !== cedula))
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error("Error al desinscribir cliente:", error)
      alert("Error al desinscribir el cliente.")
    }
  }

  const sesionesFiltradas = sesionesUnicas.filter((s) =>
    `${s.nombre_clase} ${s.dia} ${s.numero_grupo} ${s.fecha_sesion}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Sesiones Programadas</h1>

      <Card>
        <CardHeader>
          <CardTitle>Listado de sesiones</CardTitle>
          <CardDescription>Visualiza cuándo y en qué grupo están programadas las clases</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por clase, grupo, día..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Link href="/sesiones/nuevo">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nueva sesión
              </Button>
            </Link>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Clase</TableHead>
                <TableHead>Grupo</TableHead>
                <TableHead>Día</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Inicio</TableHead>
                <TableHead>Fin</TableHead>
                <TableHead>Entrenador</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sesionesFiltradas.map((s) => (
                <TableRow key={s.id_sesion_programada} className="h-10">
                  <TableCell>{s.nombre_clase}</TableCell>
                  <TableCell>{s.numero_grupo}</TableCell>
                  <TableCell>{s.dia}</TableCell>
                  <TableCell>{new Date(s.fecha_sesion).toLocaleDateString("es-CR")}</TableCell>
                  <TableCell>{new Date(s.hora_inicio).toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit" })}</TableCell>
                  <TableCell>{new Date(s.hora_fin).toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit" })}</TableCell>
                  <TableCell>{s.entrenador_asignado ?? "No asignado"}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleVerInscritos(s.id_sesion_programada, s.nombre_clase, String(s.numero_grupo))}
                    >
                      <Users2 className="w-4 h-4 mr-1" />
                      Ver inscritos
                    </Button>

                    <Button size="sm" disabled={loading} onClick={() => handleEliminarSesion(s.id_sesion_programada)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inscritos a la sesión</DialogTitle>
            <DialogDescription>{tituloSesion}</DialogDescription>
          </DialogHeader>
          {inscritos.length > 0 ? (
            <div className="mt-2 space-y-2">
              {inscritos.map((i) => (
                <div key={i.cedula} className="border p-2 rounded flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{i.nombre}</p>
                    <p className="text-sm text-muted-foreground">{i.cedula} | {i.correo}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleDesinscribir(i.cedula)}
                  >
                    <Trash2 className="w-4 h-4 mr-" />
                    Desinscribir
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No hay inscritos.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
