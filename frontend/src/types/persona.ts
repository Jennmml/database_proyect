export interface Persona {
  cedula: string
  nombre: string
  apellido1: string
  apellido2: string
  correo: string
  telefono: string
  fecha_registro: string
  fecha_expiracion: string | null
  tipo_membresia: string | null
  estado_cliente: string
}