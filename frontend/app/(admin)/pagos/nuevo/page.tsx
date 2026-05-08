"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, CheckCircle, Search } from "lucide-react"
import Link from "next/link"
import { TipoMembresia } from "@/types/tipoMembresia"
import { Persona } from "@/types/persona"
import ClientCard from "../../inscripciones/clientCard"

export default function NuevoPagoPage() {
  const [cedula, setCedula] = useState("")
  const [monto, setMonto] = useState(15000)
  const [idFormaPago, setIdFormaPago] = useState(1)
  const [tipoMembresia, setTipoMembresia] = useState<number | null>(null)
  const [persona, setPersona] = useState<Persona | null>(null)
  const [estado, setEstado] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [tiposMembresia, setTiposMembresia] = useState<TipoMembresia[]>([])
  const [modo, setModo] = useState<"registrar" | "actualizar" | "renovar">("registrar")

  const formasDePago = [
    { id: 1, nombre: "Tarjeta" },
    { id: 2, nombre: "Simpe" },
    { id: 3, nombre: "Efectivo" },
  ]

  useEffect(() => {
    const fetchTipos = async () => {
      try {
        const response = await fetch("http://localhost:3100/consultas/tipoMembresia")
        const data = await response.json()
        setTiposMembresia(data.data)
      } catch (err) {
        console.error("Error cargando tipos de membresía:", err)
      }
    }
    fetchTipos()
  }, [])

  const buscarPersona = async () => {
    setError(null)
    setEstado(null)
    if (cedula.trim().length !== 9) {
      setError("La cédula debe tener 9 dígitos.")
      setPersona(null)
      return
    }
    try {
      const response = await fetch(`http://localhost:3100/consultas/cliente/${cedula}`)
      const data = await response.json()
      if (data.success) {
        setPersona(data.data)
      } else {
        setError("Cliente no encontrado.")
        setPersona(null)
      }
    } catch (err) {
      setError("Error al buscar el cliente.")
      setPersona(null)
    }
  }

  const enviar = async () => {
    setLoading(true)
    setError(null)
    setEstado(null)

    const fecha_pago = new Date().toISOString().split("T")[0]
    let url = ""
    let method = "POST"
    let body: any = {}


    if (modo === "registrar") {
      if (!tipoMembresia) {
        setError("Selecciona un tipo de membresía.")
        setLoading(false)
        return
      }
      url = "http://localhost:3100/membresias/registrarPagoMembresia"
      body = { cedula_cliente: cedula, tipo_membresia: tipoMembresia, monto, fecha_pago, id_forma_pago: idFormaPago }
    } else if (modo === "actualizar") {
      if (!tipoMembresia) {
        setError("Selecciona un tipo de membresía.")
        setLoading(false)
        return
      }
      url = "http://localhost:3100/membresias/actualizarMembresia"
      method = "PUT"
      body = { cedula_cliente: cedula, tipo_membresia: tipoMembresia, monto, fecha_pago, id_forma_pago: idFormaPago }
    } else if (modo === "renovar") {
      url = "http://localhost:3100/membresias/renovarMembresia"
      method = "PUT"
      body = { cedula: cedula, monto, id_forma_pago: idFormaPago }
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok)
        switch(modo){
          case "registrar":
            throw new Error("Error al registrar el pago.")
          case "actualizar":
            throw new Error("Error al actualizar el pago, primero se debe crear una membresia del tipo " + tiposMembresia.find(t => t.id_tipo_membresia === tipoMembresia)?.tipo + " y luego actualizarla, esto debido a que cada membresia esta ligada a un historial de pagos" )
          case "renovar":
            throw new Error("Error al renovar el pago.")
        }
      setEstado("Operación completada exitosamente.")
      setPersona(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/pagos">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nuevo Pago</h1>
          <p className="text-muted-foreground">Gestiona el registro o renovación de una membresía</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Buscar Cliente</CardTitle>
            <CardDescription>Ingresa la cédula del cliente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">

            <div className="space-y-2">
              <Label htmlFor="modo">Modo</Label>
                <Select
                  value={modo}
                  onValueChange={(val) => setModo(val as "registrar" | "actualizar" | "renovar")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar modo" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-black shadow-md border border-gray-200 rounded-md">
                    <SelectItem value="registrar">Registrar nueva</SelectItem>
                    <SelectItem value="actualizar">Actualizar existente</SelectItem>
                    <SelectItem value="renovar">Renovar última</SelectItem>
                  </SelectContent>
                </Select>
            </div>


            <div className="flex space-x-2">
              <Input
                placeholder="Cédula del cliente"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
              />
              <Button onClick={buscarPersona}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {persona && (
              <ClientCard persona={persona} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información del Pago</CardTitle>
            <CardDescription>Completa los detalles del pago</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="monto">Monto (₡)</Label>
              <Input
                  id="monto"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="₡15000"
                  value={monto.toString()}
                  onChange={(e) => {
                    const val = e.target.value
                    if (/^\d*$/.test(val)) {
                      setMonto(val === "" ? 0 : Number(val))
                    }
                  }}
                />
            </div>

            {(modo === "registrar" || modo === "actualizar") && (
              <div className="space-y-2">
                <Label htmlFor="tipo_membresia">Tipo de Membresía</Label>
                <Select
                  value={tipoMembresia?.toString() || ""}
                  onValueChange={(val) => setTipoMembresia(Number(val))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-black shadow-md border border-gray-200 rounded-md">
                    {tiposMembresia.map((tipo) => (
                      <SelectItem key={tipo.id_tipo_membresia} value={tipo.id_tipo_membresia.toString()}>
                        {tipo.tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="formaPago">Forma de Pago</Label>
              <Select
                value={idFormaPago.toString()}
                onValueChange={(val) => setIdFormaPago(Number(val))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar forma de pago" />
                </SelectTrigger>
                <SelectContent className="bg-white text-black shadow-md border border-gray-200 rounded-md">
                  {formasDePago.map((f) => (
                    <SelectItem key={f.id} value={f.id.toString()}>{f.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-start pt-4">
              <Button onClick={enviar} disabled={!persona || loading}>
                {loading ? "Procesando..." : "Registrar Pago"}
              </Button>
            </div>

            {estado && (
              <div className="flex items-center gap-2 text-green-600 mt-2">
                <CheckCircle className="w-5 h-5" />
                <span>{estado}</span>
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
    </div>
  )
}
