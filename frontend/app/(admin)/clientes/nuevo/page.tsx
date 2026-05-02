"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

const api = "https://api.mytry.dev"

export default function NuevoClientePage() {
  const router = useRouter()
  const [distritos, setDistritos] = useState<{
    id_distrito: number
    nombre_distrito: string
  }[]>([])

  const [formData, setFormData] = useState({
    cedula: "",
    nombre: "",
    apellido1: "",
    apellido2: "",
    telefono: "", 
    genero: "",
    distrito: "",
    correo: "",
    fecha_nacimiento: "",
    edad: "",
  })

  useEffect(() => {
    const fetchDistritos = async () => {
      try {
        const response = await fetch(`${api}/consultas/distritos`)
        if (!response.ok) throw new Error("Error al cargar distritos")
        const data = await response.json()
        if (data.success && Array.isArray(data.data)) {
          setDistritos(data.data)
        }
      } catch (error) {
        console.error("Error al obtener distritos:", error)
      }
    }

    fetchDistritos()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const body = {
      cedula: formData.cedula,
      nombre: formData.nombre,
      apellido1: formData.apellido1,
      apellido2: formData.apellido2,
      telefono: formData.telefono, // <-- AGREGADO
      genero: Number(formData.genero),
      distrito: Number(formData.distrito),
      correo: formData.correo,
      fecha_nacimiento: formData.fecha_nacimiento,
      edad: Number(formData.edad),
    }

    try {
      const response = await fetch(`${api}/clientes/insertarCliente`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        toast.success("Cliente creado exitosamente", {
          description: "Serás redirigido a la lista de clientes.",
          duration: 2000,
        })
        setTimeout(() => {
          router.push("/clientes")
        }, 2000)
      } else {
        const errorData = await response.json()
        toast.error("Error al crear cliente", {
          description: errorData.message || "Revisa los datos ingresados.",
        })
      }
    } catch (error) {
      console.error("❌ Error al conectar con el backend:", error)
      toast.error("Error de conexión con el servidor")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/clientes">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nuevo Cliente</h1>
          <p className="text-muted-foreground">
            Registra un nuevo cliente en el sistema
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Información del Cliente</CardTitle>
          <CardDescription>Completa todos los campos requeridos</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cedula">Cédula *</Label>
                <Input
                  id="cedula"
                  placeholder="123456789"
                  value={formData.cedula}
                  onChange={(e) =>
                    setFormData({ ...formData, cedula: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edad">Edad *</Label>
                <Input
                  id="edad"
                  type="number"
                  placeholder="25"
                  min="5"
                  max="120"
                  value={formData.edad}
                  onChange={(e) =>
                    setFormData({ ...formData, edad: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  placeholder="Juan"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellido1">Primer Apellido *</Label>
                <Input
                  id="apellido1"
                  placeholder="Pérez"
                  value={formData.apellido1}
                  onChange={(e) =>
                    setFormData({ ...formData, apellido1: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellido2">Segundo Apellido *</Label>
                <Input
                  id="apellido2"
                  placeholder="Gómez"
                  value={formData.apellido2}
                  onChange={(e) =>
                    setFormData({ ...formData, apellido2: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono *</Label>
              <Input
                id="telefono"
                placeholder="88881234"
                pattern="[0-9]{8}"
                maxLength={8}
                value={formData.telefono}
                onChange={(e) =>
                  setFormData({ ...formData, telefono: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="genero">Género *</Label>
                <Select
                  value={formData.genero}
                  onValueChange={(value) =>
                    setFormData({ ...formData, genero: value })
                  }
                >
                  <SelectTrigger className="bg-white border border-input">
                    <SelectValue placeholder="Seleccionar género" />
                  </SelectTrigger>
                  <SelectContent className="z-50 max-h-60 overflow-y-auto bg-white border border-border">
                    <SelectItem value="1">Masculino</SelectItem>
                    <SelectItem value="2">Femenino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="distrito">Distrito *</Label>
                <Select
                  value={formData.distrito}
                  onValueChange={(value) =>
                    setFormData({ ...formData, distrito: value })
                  }
                >
                  <SelectTrigger className="bg-white border border-input">
                    <SelectValue placeholder="Seleccionar distrito" />
                  </SelectTrigger>
                  <SelectContent className="z-50 max-h-60 overflow-y-auto bg-white border border-border">
                    {distritos.map((d) => (
                      <SelectItem
                        key={d.id_distrito}
                        value={String(d.id_distrito)}
                      >
                        {d.nombre_distrito}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="correo">Correo Electrónico *</Label>
              <Input
                id="correo"
                type="email"
                placeholder="cliente@ejemplo.com"
                value={formData.correo}
                onChange={(e) =>
                  setFormData({ ...formData, correo: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento *</Label>
              <Input
                id="fecha_nacimiento"
                type="date"
                value={formData.fecha_nacimiento}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fecha_nacimiento: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Link href="/clientes">
                <Button variant="outline">Cancelar</Button>
              </Link>
              <Button type="submit">Crear Cliente</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
