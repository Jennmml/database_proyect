"use client"

import { useEffect, useState ,useRef} from "react"
import Link from "next/link"
import {
  Users,
  UserCheck,
  Dumbbell,
  Calendar,
  CreditCard,
  BarChart3,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { datosEstadisticas } from "@/types/estadisticas"
import { toast } from "sonner"

const api = "https://api.mytry.dev"


export default function Dashboard() {
  const [datos, setDatos] = useState<datosEstadisticas | null>(null)
  const [fecha, setFecha] = useState<string>("2025-05-27") 
  const [loading, setLoading] = useState(false)
  const yaMostrado = useRef(false)
useEffect(() => {
    const verificarMaquinas = async () => {
      try {
        if (yaMostrado.current) return
        yaMostrado.current = true

        const toastKey = "toastMaquinasMostrado"
        if (localStorage.getItem(toastKey)) return

        const res = await fetch(`${api}/maquinas/cursorMaquinasVencidas`)
        const data = await res.json()

        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const maquinas = data.data

          const resumen = maquinas
            .slice(0, 3)
            .map((m: any) => `${m.tipo}`)
            .join(", ") + (maquinas.length > 3 ? ` y ${maquinas.length - 3} más...` : "")

          toast.warning(`${maquinas.length} máquinas necesitan revisión`, {
            description: resumen,
            duration: 6000,
            action: {
              label: "Ver detalles",
              onClick: () => {
                window.location.href = "/administradores"
              },
            },
          })

          localStorage.setItem(toastKey, "true")
          setTimeout(() => {
            localStorage.removeItem(toastKey)
          }, 10000)
        }
      } catch (error) {
        console.error("Error al verificar máquinas vencidas:", error)
      }
    }

    verificarMaquinas()
  }, [])




  const fetchEstadisticas = async (fechaEnvio: string) => {
    try {
      setLoading(true)
      const fechaParam = `'${fechaEnvio}'`
      const url = `${api}/estadisticas/obtenerEstadisticasPorFecha?fecha=${encodeURIComponent(fechaParam)}`

      const response = await fetch(url)
      if (!response.ok) throw new Error("Error en la respuesta de la API")

      const data = await response.json()
      if (data.success && Array.isArray(data.data)) {
        setDatos(data.data[0])
      } else {
        console.warn("Formato de respuesta inesperado:", data)
      }
    } catch (error) {
      console.error("Error al cargar estadísticas:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEstadisticas(fecha)
  }, [])

  const stats = [
    {
      title: "Total Clientes",
      value: datos?.total_clientes ?? "0",
      description: "Clientes registrados",
      icon: Users,
      href: "/clientes",
    },
    {
      title: "Entrenadores",
      value: datos?.total_entrenadores ?? "0",
      description: "Entrenadores activos",
      icon: UserCheck,
      href: "/entrenadores",
    },
    {
      title: "Clases",
      value: datos?.total_clases ?? "0",
      description: "Clases disponibles",
      icon: Dumbbell,
      href: "/clases",
    },
    {
      title: "Próximas Sesiones",
      value: datos?.sesiones_pendientes ?? "0",
      description: "Sesiones Pendientes",
      icon: Calendar,
      href: "/sesiones",
    },
    {
      title: "Ingresos",
      value: datos ? `₡${datos.total_pagos.toLocaleString("es-CR")}` : "₡0",
      description: "Ingresos totales",
      icon: CreditCard,
      href: "/pagos",
    },
    {
      title: "Máquinas",
      value: datos?.total_maquinas ?? "0",
      description: "Equipos disponibles",
      icon: BarChart3,
      href: "/administradores",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Bienvenido al sistema de administración FastFitness</p>
        </div>
        <div className="flex gap-2 items-center">
          <Input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="max-w-[160px]"
          />
          <Button onClick={() => fetchEstadisticas(fecha)} disabled={loading}>
            {loading ? "Consultando..." : "Consultar"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.title} href={stat.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>Operaciones frecuentes del sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/clientes/nuevo" className="block p-3 rounded-lg border hover:bg-accent transition-colors">
              <div className="font-medium">Registrar Cliente</div>
              <div className="text-sm text-muted-foreground">Agregar nuevo cliente al sistema</div>
            </Link>
            <Link href="/asistencia" className="block p-3 rounded-lg border hover:bg-accent transition-colors">
              <div className="font-medium">Registrar Asistencia</div>
              <div className="text-sm text-muted-foreground">Marcar asistencia a clases</div>
            </Link>
            <Link href="/pagos/nuevo" className="block p-3 rounded-lg border hover:bg-accent transition-colors">
              <div className="font-medium">Procesar Pago</div>
              <div className="text-sm text-muted-foreground">Registrar pago de membresía</div>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reportes</CardTitle>
            <CardDescription>Consultas y análisis del gimnasio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/reportes/clientes-ranking" className="block p-3 rounded-lg border hover:bg-accent transition-colors">
              <div className="font-medium">Ranking de Clientes</div>
              <div className="text-sm text-muted-foreground">Por número de clases inscritas</div>
            </Link>
            <Link href="/reportes/proximasAVencer" className="block p-3 rounded-lg border hover:bg-accent transition-colors">
              <div className="font-medium">Membresías Próximas a Vencer</div>
              <div className="text-sm text-muted-foreground">Clientes con membresías próximas a vencer</div>
            </Link>
            <Link href="/reportes/grupos-estado" className="block p-3 rounded-lg border hover:bg-accent transition-colors">
              <div className="font-medium">Estado de Grupos</div>
              <div className="text-sm text-muted-foreground">Capacidad y matriculados</div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
