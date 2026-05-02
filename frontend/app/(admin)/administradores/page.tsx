"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import AdminMaquina from "@/types/adminMaquina"
import RevisionHistoryModal from "@/components/RevisionHistoryModal"

const api = "https://api.mytry.dev"

export default function AdminMaquinasPage() {
  const [maquinas, setMaquinas] = useState<AdminMaquina[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [maquinaSeleccionada, setMaquinaSeleccionada] = useState<number | null>(null)

  useEffect(() => {
    const fetchMaquinas = async () => {
      try {
        const res = await fetch(`${api}/admin/vistaAdminMaquina`)
        const data = await res.json()

        if (data.success && Array.isArray(data.data)) {
          setMaquinas(data.data)
        } else {
          throw new Error("Formato de datos inválido")
        }
      } catch (err) {
        console.error("Error al cargar máquinas:", err)
      }
    }

    fetchMaquinas()
  }, [])

  const maquinasFiltradas = maquinas.filter((m) =>
    m.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.estado.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const badgeColor = (estado: string) => {
    switch (estado) {
      case "Operativa": return "default"
      case "Mantenimiento": return "outline"
      case "Reparación": return "outline"
      case "Descompuesta": return "outline"
      default: return "outline"
    }
  }

  const abrirHistorial = (id: number) => {
    setMaquinaSeleccionada(id)
    setModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Administración de Máquinas</h1>
          <p className="text-muted-foreground">Control del estado, revisiones y asignaciones</p>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <Link href="/administradores/maquinas/nueva-revision">
            <Button className="flex items-center gap-1" variant={"outline"}>
              <Plus className="h-4 w-4" />
              Nueva revisión
            </Button>
          </Link>

          <Link href="/administradores/maquinas/nuevo">
            <Button className="flex items-center gap-1" variant="outline">
              <Plus className="h-4 w-4" />
              Nueva máquina
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de Máquinas</CardTitle>
          <CardDescription>Filtra por tipo, marca, modelo o estado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Buscar por tipo, marca o estado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Última Revisión</TableHead>
                <TableHead>Administrador</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {maquinasFiltradas.map((m) => (
                <TableRow key={m.id_maquina}>
                  <TableCell>{m.id_maquina}</TableCell>
                  <TableCell>{m.tipo}</TableCell>
                  <TableCell>{m.modelo}</TableCell>
                  <TableCell>{m.marca}</TableCell>
                  <TableCell>
                    <Badge variant={badgeColor(m.estado)}>
                      {m.estado}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {m.ultima_revision
                    ? new Date(m.ultima_revision).toLocaleDateString('es-CR', { timeZone: 'UTC' })
                    : <span className="text-muted-foreground">Sin revisión</span>}
                  </TableCell>
                  <TableCell>
                    {m.nombre_admin ?? <span className="text-muted-foreground">No asignado</span>}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => abrirHistorial(m.id_maquina)}>
                      Ver revisiones
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <RevisionHistoryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        idMaquina={maquinaSeleccionada}
      />
    </div>
  )
}