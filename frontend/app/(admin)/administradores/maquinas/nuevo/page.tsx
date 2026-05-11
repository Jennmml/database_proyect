"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, CheckCircle, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { maquinaFormSchema, apiResponseSchema } from "@/lib/security-schemas"

interface EstadoMaquina {
    id_estado: number;
    estado: string;
}

const api = "http://localhost:3100"

export default function NuevaMaquinaPage() {
  const [estados,setEstados] = useState<EstadoMaquina[]>([])
  const [estado, setEstado] = useState<number>(1)
  const [tipo, setTipo] = useState<string>("")
  const [modelo, setModelo] = useState<string>("")
  const [marca, setMarca] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

    useEffect(()=>{
    const fetchEstados = async () => {
      try {
        const response = await fetch(`${api}/consultas/estadosMaquina`)
        const rawData = await response.json()
        
        // CORRECCIÓN: Validación de integridad de datos recibidos del API
        const validation = apiResponseSchema.safeParse(rawData)
        if (validation.success && validation.data.data) {
            setEstados(validation.data.data)
        } else {
            console.error("Respuesta del API malformada detectada por Zod")
            setError("Error de integridad de datos del servidor.")
        }
      } catch (err) {
        console.error("Error cargando estados:", err)
      }
    }

    fetchEstados()

  }, [])

  const enviar = async () => {
    setError(null)
    setSuccess(null)

    // CORRECCIÓN: Validación y Saneamiento antes del envío
    const validation = maquinaFormSchema.safeParse({ tipo, modelo, marca, estado })
    
    if (!validation.success) {
      const firstError = validation.error.errors[0].message
      setError(firstError)
      return
    }

    const cleanedData = validation.data
    setLoading(true)

    try {
      const res = await fetch(`${api}/maquinas/agregarMaquina`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(cleanedData)
      })

      if (!res.ok) throw new Error("Error al registrar la máquina.")
      setSuccess("Máquina registrada y saneada correctamente.")
      setTipo("")
      setModelo("")
      setMarca("")
    } catch (err: any) {
      setError(err.message || "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/administradores">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>
        
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nueva Máquina</h1>
          <p className="text-muted-foreground">Registrar una nueva máquina en el sistema</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de la Máquina</CardTitle>
          <CardDescription>Completa los siguientes campos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo</Label>
            <Input
              id="tipo"
              placeholder="Ej: Cardio, Pesas, etc."
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="modelo">Modelo</Label>
            <Input
              id="modelo"
              placeholder="Ej: X200"
              value={modelo}
              onChange={(e) => setModelo(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="marca">Marca</Label>
            <Input
              id="marca"
              placeholder="Ej: LifeFitness"
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <Select
                value={estado.toString()}
                onValueChange={(val) => setEstado(Number(val))}
            >
                <SelectTrigger>
                <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent className="bg-white text-black shadow-md border border-gray-200 rounded-md">
                {estados.map((estado) => (
                    <SelectItem key={estado.id_estado} value={estado.id_estado.toString()}>
                    {estado.estado}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
           </div>

          <div className="flex justify-start pt-4">
            <Button onClick={enviar} disabled={loading}>
              {loading ? "Registrando..." : "Registrar Máquina"}
            </Button>
          </div>

          {success && (
            <div className="flex items-center gap-2 text-green-600 mt-2">
              <CheckCircle className="w-5 h-5" />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <p className="text-red-600 text-sm mt-2 text-center">
              {error}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
