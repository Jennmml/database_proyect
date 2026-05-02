"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface ClienteRanking {
  cedula: string
  nombre_completo: string
  total_clases: number
  posicion: string
}

export default function RankingClientesPage() {
  const [ranking, setRanking] = useState<ClienteRanking[]>([])

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const response = await fetch("https://api.mytry.dev/clientes/rankingClientes")
        const data = await response.json()
        if (data.success && Array.isArray(data.tables) && Array.isArray(data.tables[0])) {
          const ordenados = data.tables[0].sort(
            (a: ClienteRanking, b: ClienteRanking) => parseInt(a.posicion) - parseInt(b.posicion)
          )
          setRanking(ordenados)
        } else {
          throw new Error("No se pudo obtener el ranking.")
        }
      } catch (error) {
        console.error("Error al cargar el ranking:", error)
      }
    }

    fetchRanking()
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Ranking de Clientes</h1>

      <Card>
        <CardHeader>
          <CardTitle>Ranking de Clientes</CardTitle>
          <CardDescription>
            Visualiza el ranking de clientes por asistencia a clases.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Posición</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Cédula</TableHead>
                <TableHead>Total de Clases</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ranking.map((cliente, index) => (
                <TableRow key={cliente.cedula + "-" + index}>
                  <TableCell>
                    <Badge variant={cliente.posicion === "1" ? "default" : "secondary"}>
                      {cliente.posicion}
                    </Badge>
                  </TableCell>
                  <TableCell>{cliente.nombre_completo}</TableCell>
                  <TableCell>{cliente.cedula}</TableCell>
                  <TableCell>{cliente.total_clases}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
