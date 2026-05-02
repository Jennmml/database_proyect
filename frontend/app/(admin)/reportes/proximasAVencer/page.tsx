"use client"

import { useEffect, useState } from "react"
import { MembresiasProximasAVencer } from "@/types/cliente"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProximasAVencerPage() {
  const [membresias, setMembresias] = useState<MembresiasProximasAVencer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMembresias = async () => {
      try {
        const response = await fetch("https://api.mytry.dev/clientes/clientesMembresiaProximaAVencer")
        const data = await response.json()
        if (data.success) {
          setMembresias(data.tables[0])
        } else {
          setError("Error al obtener los datos.")
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Error de conexión con el servidor.")
      } finally {
        setLoading(false)
      }
    }

    fetchMembresias()
  }, [])

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-CR", {
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Membresías por vencer</h1>
        <p className="text-muted-foreground">
          Consulta avanzada: Clientes cuya membresía expira en menos de una semana
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <div className="text-red-600 font-medium">{error}</div>
      ) : membresias.length === 0 ? (
        <div className="text-gray-500">No hay membresías próximas a vencer.</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {membresias.map((m) => (
            <Card key={m.cedula} className="shadow-sm border">
              <CardHeader>
                <CardTitle className="text-xl">{m.nombre_completo}</CardTitle>
                <CardDescription>Cédula: {m.cedula}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>Fecha de expiración:</strong> {formatFecha(m.fecha_expiracion)}</p>
                <p><strong>Días restantes:</strong> {m.dias_restantes} día(s)</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
