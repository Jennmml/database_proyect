"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from "chart.js"
import EstadoGenero from "@/types/estadoGenero"
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)



export default function DistribucionGeneroChart() {
  const [datos, setDatos] = useState<EstadoGenero[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const res = await fetch("http://localhost:3100/sesiones/distribucionGeneroPorEstado")
        const data = await res.json()
        if (data.success && Array.isArray(data.tables[0])) {
          setDatos(data.tables[0])
        } else {
          console.error("Formato de respuesta inesperado:", data)
        }
      } catch (error) {
        console.error("Error al cargar distribución de género:", error)
      } finally {
        setCargando(false)
      }
    }

    fetchDatos()
  }, [])

  if (cargando || datos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribución de Género</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          Cargando datos...
        </CardContent>
      </Card>
    )
  }

  const chartData = {
    labels: datos.map((item) => item.estado),
    datasets: [
      {
        label: "Hombres",
        data: datos.map((item) => item.hombres),
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderRadius: 8,
        barThickness: 30,
      },
      {
        label: "Mujeres",
        data: datos.map((item) => item.mujeres),
        backgroundColor: "rgba(244, 114, 182, 0.8)",
        borderRadius: 8,
        barThickness: 30,
      },
    ],
  }

  const chartOptions :ChartOptions<"bar">= {
    responsive: true,
    maintainAspectRatio: false, 
    animation: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          font: { size: 14 },
        },
      },
      title: {
        display: true,
        text: "Distribución de Género por clientes inscritos a clases",
        font: { size: 18 },
        padding: { top: 10, bottom: 10 },
      },
    },
    scales: {
      x: {
        ticks: {
          font: { size: 12 },
        },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: {
          font: { size: 12 },
        },
        grid: { color: "#f0f0f0" },
      },
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Distribución de Género de Sesiones</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64"> 
          <Bar data={chartData} options={chartOptions} /> 
        </div>
      </CardContent>
    </Card>
  )
}
