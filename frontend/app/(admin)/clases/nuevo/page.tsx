"use client"

import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"

const api = "https://api.mytry.dev"

export default function NuevaClasePage() {
  const [formData, setFormData] = useState({
    nombre_clase: "",
    descripcion: "",
    cupo_disponible: "",
    dia: "",
    hora_inicio: "",
    hora_fin: "",
  })

  const [mensaje, setMensaje] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMensaje("")

    try {
      const response = await fetch(`${api}/clases/crearClase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          cupo_disponible: parseInt(formData.cupo_disponible, 10)
        })
      })

      const data = await response.json()
      if (data.success) {
        setMensaje("✅ Clase creada exitosamente.")
        setFormData({
          nombre_clase: "",
          descripcion: "",
          cupo_disponible: "",
          dia: "",
          hora_inicio: "",
          hora_fin: ""
        })
      } else {
        setMensaje(`❌ Error: ${data.message || "No se pudo crear la clase."}`)
      }
    } catch (error) {
      setMensaje("❌ Error inesperado al conectar con el servidor.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="w-full md:w-1/2">
        <Card>
          <CardHeader>
            <CardTitle>Crear Nueva Clase</CardTitle>
            <CardDescription>Completa todos los campos para registrar una clase nueva.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="nombre_clase">Nombre de la Clase</Label>
                <Input
                  name="nombre_clase"
                  id="nombre_clase"
                  value={formData.nombre_clase}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <textarea
                  name="descripcion"
                  id="descripcion"
                  rows={5}
                  className="w-full rounded border px-3 py-2 text-sm resize-none"
                  value={formData.descripcion}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="cupo_disponible">Cupo Disponible</Label>
                <Input
                  name="cupo_disponible"
                  id="cupo_disponible"
                  type="number"
                  min="1"
                  value={formData.cupo_disponible}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="dia">Día</Label>
                <select
                  name="dia"
                  id="dia"
                  value={formData.dia}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-sm"
                  required
                >
                  <option value="">Selecciona un día</option>
                  <option value="Lunes">Lunes</option>
                  <option value="Martes">Martes</option>
                  <option value="Miércoles">Miércoles</option>
                  <option value="Jueves">Jueves</option>
                  <option value="Viernes">Viernes</option>
                  <option value="Sábado">Sábado</option>
                  <option value="Domingo">Domingo</option>
                </select>
              </div>

              <div>
                <Label htmlFor="hora_inicio">Hora de Inicio</Label>
                <Input
                  name="hora_inicio"
                  id="hora_inicio"
                  type="time"
                  value={formData.hora_inicio}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="hora_fin">Hora de Fin</Label>
                <Input
                  name="hora_fin"
                  id="hora_fin"
                  type="time"
                  value={formData.hora_fin}
                  onChange={handleChange}
                  required
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Creando..." : "Crear Clase"}
              </Button>

              {mensaje && (
                <p className={`text-sm mt-2 ${mensaje.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>
                  {mensaje}
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
