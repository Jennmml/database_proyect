export default interface ClienteSesion {
  id_sesion_programada: number
  cedula: string
  nombre_cliente: string
  nombre_clase: string
  descripcion_clase: string
  numero_grupo: number
  fecha_sesion: string
  dia: string
  hora_inicio: string
  hora_fin: string
  asistio?: boolean | null
}