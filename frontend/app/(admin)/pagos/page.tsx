"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Filter, DollarSign } from "lucide-react"
import Link from "next/link"
import Pago from "@/types/pagos"

const api = "https://api.mytry.dev"

export default function PagosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [pagos, setPagos] = useState<Pago[]>([])

  useEffect(()=>{
    const fetchPagos = async () => {
      try {
        const response = await fetch(`${api}/clientes/vistaHistorialPagosClientes`)
        const data = await response.json()
        setPagos(data.data)
      } catch (err) {
        console.error("Error cargando pagos:", err)
      }
    }
    fetchPagos()
  }, [])

  const formatDate = (iso: string) => {
  const date = new Date(iso)
  return date.toLocaleDateString("es-CR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
}

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: "CRC",
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pagos</h1>
          <p className="text-muted-foreground">Gestiona los pagos de membresías</p>
        </div>
        <Link href="/pagos/nuevo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Pago
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Pagos</CardTitle>
          <CardDescription>Todos los pagos registrados en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente, cédula..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Membresía</TableHead>
                <TableHead>Forma de Pago</TableHead>
                <TableHead>Monto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagos.map((pago) => (
                <TableRow key={pago.id_pago}>
                  <TableCell className="font-medium">{pago.id_pago}</TableCell>
                  <TableCell>{formatDate(pago.fecha_pago)}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{pago.nombre_completo}</div>
                      <div className="text-sm text-muted-foreground">{pago.cedula}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{pago.tipo_membresia}</Badge>
                  </TableCell>
                  <TableCell>{pago.formaDePago}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(pago.monto)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
