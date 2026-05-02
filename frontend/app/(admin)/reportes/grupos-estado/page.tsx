"use client"

import { useEffect, useState } from "react"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import GrupoCupo from "@/types/grupoCupo"


export default function EstadoGruposPages() {
  const [grupos, setGrupos] = useState<GrupoCupo[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchGrupos = async () => {
      try {
        const res = await fetch("https://api.mytry.dev/sesiones/promedioPorGrupoYCupos")
        const json = await res.json()

        if (json.success && Array.isArray(json.tables)) {
          const datos = json.tables.flat() 
          setGrupos(datos)
        } else {
          throw new Error("Formato de datos inválido")
        }
      } catch (error) {
        console.error("Error al obtener los datos de los grupos:", error)
      }
    }

    fetchGrupos()
  }, [])

  const gruposFiltrados = grupos.filter((g) =>
    g.numero_grupo.toString().includes(searchTerm) ||
    g.estado.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const badgeColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "disponible": return "default"
      case "lleno": return "outline"
      default: return "outline"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cupos por Grupo</h1>
        <p className="text-muted-foreground">Consulta del promedio de cupos y estado de los grupos</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de Grupos</CardTitle>
          <CardDescription>Filtra por número de grupo o estado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Buscar por grupo o estado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Grupo</TableHead>
                <TableHead>Cupo Disponible</TableHead>
                <TableHead>Matriculados</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gruposFiltrados.map((grupo) => (
                <TableRow key={grupo.numero_grupo}>
                  <TableCell>{grupo.numero_grupo}</TableCell>
                  <TableCell>{grupo.cupo_disponible}</TableCell>
                  <TableCell>{grupo.cantidad_matriculados}</TableCell>
                  <TableCell>
                    <Badge variant={badgeColor(grupo.estado)}>
                      {grupo.estado}
                    </Badge>
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
