"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, Search, Filter, Edit, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
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
import { Cliente } from "@/types/cliente"

const api = "https://api.mytry.dev"

export default function ClientesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [clienteEditar, setClienteEditar] = useState<Cliente | null>(null)
  const [nuevoCorreo, setNuevoCorreo] = useState("")
  const [nuevoTelefono, setNuevoTelefono] = useState("")
  const [errorForm, setErrorForm] = useState("")
  const [mensajeExito, setMensajeExito] = useState("")
  

  useEffect(() => {
    fetchClientes()
  }, [])

  const fetchClientes = async () => {
    try {
      const response = await fetch(`${api}/clientes/vistaClientes`)
      const data = await response.json()
      if (data.success && Array.isArray(data.tables) && Array.isArray(data.tables[0])) {
        setClientes(data.tables[0])
      } else {
        console.warn("Formato de respuesta inesperado:", data)
      }
    } catch (error) {
      console.error("Error al cargar los datos de los clientes:", error)
    }
  }

  const handleEliminarCliente = async (cedula: string) => {
    const confirmar = window.confirm(`¿Estás seguro de que deseas eliminar al cliente con cédula ${cedula}?`)
    if (!confirmar) return

    try {
      const response = await fetch(`${api}/clientes/eliminarPersona`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cedula }),
      })

      const result = await response.json()
      if (response.ok && result.success) {
        alert("Cliente eliminado correctamente")
        setClientes((prev) => prev.filter((cliente) => cliente.cedula !== cedula))
      } else {
        alert("No se pudo eliminar el cliente: " + result.message)
      }
    } catch (error) {
      console.error("Error al eliminar cliente:", error)
      alert("Ocurrió un error al intentar eliminar al cliente.")
    }
  }

  const handleActualizarCliente = async () => {
    if (!clienteEditar) return
    setErrorForm("")
    setMensajeExito("")

    if (nuevoCorreo === clienteEditar.correo && nuevoTelefono === clienteEditar.telefono) {
      setErrorForm("Debes modificar al menos el correo o el teléfono.")
      return
    }

    const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nuevoCorreo)
    const telefonoValido = /^[0-9]{8,15}$/.test(nuevoTelefono)

    if (!correoValido) {
      setErrorForm("Correo inválido.")
      return
    }

    if (!telefonoValido) {
      setErrorForm("Teléfono inválido (debe contener solo números y entre 8-15 dígitos).")
      return
    }

    try {
      const response = await fetch(`${api}/clientes/actualizarPersona`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cedula: clienteEditar.cedula,
          correo: nuevoCorreo,
          telefono: nuevoTelefono
        })
      })

      const result = await response.json()
      if (response.ok && result.success) {
        setMensajeExito("Datos actualizados correctamente.")
        setTimeout(() => {
          setClienteEditar(null)
          fetchClientes()
        }, 1000)
      } else {
        setErrorForm(result.message || "Error desconocido.")
      }
    } catch (error) {
      console.error("Error al actualizar:", error)
      setErrorForm("Error de conexión al actualizar.")
    }
  }

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      Activo: "default",
      Inactivo: "secondary",
      Suspendido: "destructive",
      Nuevo: "outline",
      Revisión: "outline",
      Retirado: "secondary",
      Otros: "outline",
      Congelado: "secondary",
    }
    return <Badge variant={variants[estado] || "outline"}>{estado}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">Gestiona todos los clientes del gimnasio</p>
        </div>
        <Link href="/clientes/nuevo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Cliente
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>Todos los clientes registrados en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, cédula..."
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
                <TableHead>Cédula</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Fecha Registro</TableHead>
                <TableHead>Membresía</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientes
                .filter((cliente) =>
                  `${cliente.nombre} ${cliente.apellido1} ${cliente.apellido2} ${cliente.cedula}`
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
                )
                .map((cliente) => (
                  <TableRow key={cliente.cedula}>
                    <TableCell className="font-medium">{cliente.cedula}</TableCell>
                    <TableCell>{`${cliente.nombre} ${cliente.apellido1} ${cliente.apellido2}`}</TableCell>
                    <TableCell>{cliente.telefono}</TableCell>
                    <TableCell>{cliente.correo}</TableCell>
                    <TableCell>{new Date(cliente.fecha_registro).toLocaleDateString("es-CR")}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{cliente.tipo_membresia ?? "Sin membresía"}</div>
                        {cliente.fecha_expiracion && (
                          <div className="text-muted-foreground">
                            Exp: {new Date(cliente.fecha_expiracion).toLocaleDateString("es-CR")}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getEstadoBadge(cliente.estado_cliente)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => {
                              setClienteEditar(cliente)
                              setNuevoCorreo(cliente.correo)
                              setNuevoTelefono(cliente.telefono)
                              setErrorForm("")
                              setMensajeExito("")
                            }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Editar Cliente</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-3">
                              <Input
                                type="email"
                                placeholder="Correo"
                                value={nuevoCorreo}
                                onChange={(e) => setNuevoCorreo(e.target.value)}
                              />
                              <Input
                                type="text"
                                placeholder="Teléfono"
                                value={nuevoTelefono}
                                onChange={(e) => setNuevoTelefono(e.target.value)}
                              />
                              {errorForm && <p className="text-sm text-red-600">{errorForm}</p>}
                              {mensajeExito && <p className="text-sm text-green-600">{mensajeExito}</p>}
                            </div>
                            <DialogFooter>
                              <Button onClick={handleActualizarCliente}>Guardar</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <Button variant="ghost" size="sm" onClick={() => handleEliminarCliente(cliente.cedula)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
