export interface Cliente {
  nombre: string
  apellido1: string
  apellido2: string
  correo: string
  cedula: string
  telefono: string
  fecha_registro: string
  fecha_expiracion: string | null
  tipo_membresia: string | null
  estado_cliente: string
}


export interface MembresiasProximasAVencer {
  cedula: string
  nombre_completo: string
  fecha_expiracion: string
  dias_restantes: number
}