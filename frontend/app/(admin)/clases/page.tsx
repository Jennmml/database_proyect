"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Plus, Search, Trash2 } from "lucide-react"

interface Clase {
  id_clase: number
  nombre: string
  descripcion: string
  total_sesiones: number
}

const api = "https://api.mytry.dev"

export default function ClasesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [clases, setClases] = useState<Clase[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchClases()
  }, [])

  const fetchClases = async () => {
    try {
      const response = await fetch(`${api}/clases/vistaTotalClasesPorSesion`)
      const json = await response.json()

      if (json.success && Array.isArray(json.data)) {
        setClases(json.data)
      } else {
        throw new Error("Formato de respuesta inesperado")
      }
    } catch (error) {
      console.error("Error al cargar clases:", error)
    }
  }

  const handleEliminarClase = async (id_clase: number) => {
    const confirmar = confirm("¿Estás seguro de que deseas eliminar esta clase? Esta acción es irreversible.")

    if (!confirmar) return

    try {
      setLoading(true)
      const res = await fetch(`${api}/clases/eliminarClase`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ id_clase })
      })

      const result = await res.json()

      if (res.ok && result.success) {
        alert("✅ Clase eliminada correctamente.")
        await fetchClases()
      } else {
        throw new Error(result.message || "Error desconocido al eliminar clase.")
      }
    } catch (err) {
      console.error("Error al eliminar clase:", err)
      alert("No se pudo eliminar la clase.")
    } finally {
      setLoading(false)
    }
  }

  const clasesFiltradas = clases.filter((clase) =>
    `${clase.nombre} ${clase.descripcion}`.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clases creadas</h1>
          <p className="text-muted-foreground">
            Consulta y administración de clases creadas en el sistema
          </p>
        </div>
        <Link href="/clases/nuevo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva clase
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de Clases</CardTitle>
          <CardDescription>
            Detalles de las clases creadas y cantidad de sesiones asignadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="h-10">
                <TableHead className="py-1">Id clase</TableHead>
                <TableHead className="py-1">Nombre</TableHead>
                <TableHead className="py-1">Descripción</TableHead>
                <TableHead className="py-1">Sesiones</TableHead>
                <TableHead className="py-1 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clasesFiltradas.map((clase) => (
                <TableRow key={clase.id_clase} className="h-10">
                  <TableCell className="py-1">{clase.id_clase}</TableCell>
                  <TableCell className="py-1">{clase.nombre}</TableCell>
                  <TableCell className="py-1 text-muted-foreground">{clase.descripcion}</TableCell>
                  <TableCell className="py-1">{clase.total_sesiones}</TableCell>
                  <TableCell className="py-1 text-right">
                    <Button
                      size="sm"
                      disabled={loading}
                      onClick={() => handleEliminarClase(clase.id_clase)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
