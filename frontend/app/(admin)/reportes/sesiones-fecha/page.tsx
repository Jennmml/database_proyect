"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { CalendarDays } from "lucide-react"
import { parse, format } from "date-fns"
import { es } from "date-fns/locale"
import SesionPorMes from "@/types/sesionesPorMes"

export default function ListaSesionesPorMes() {
  const [datos, setDatos] = useState<SesionPorMes[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const res = await fetch("http://localhost:3100/sesiones/cantidadSesionPorMes")
        const data = await res.json()

        if (data.success && Array.isArray(data.tables[0])) {
          const transformados = data.tables[0].map((item: any) => ({
            ...item,
            mesFormateado: format(parse(item.mes, "MMMM yyyy", new Date()), "MMMM 'de' yyyy", { locale: es }),
          }))
          setDatos(transformados)
        }
      } catch (error) {
        console.error("Error al cargar sesiones por mes:", error)
      } finally {
        setCargando(false)
      }
    }

    fetchDatos()
  }, [])

  if (cargando) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sesiones por Mes</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-center">Cargando datos...</CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Sesiones por Mes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {datos.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 border rounded-lg shadow-sm hover:bg-accent transition-colors"
          >
            <div>
              <p className="text-base font-medium">{item.clase}</p>
              <p className="text-sm text-muted-foreground">{item.mesFormateado}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CalendarDays className="w-4 h-4" />
              <span>
                {item.total_sesiones_en_mes} sesión
                {item.total_sesiones_en_mes !== 1 ? "es" : ""}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
