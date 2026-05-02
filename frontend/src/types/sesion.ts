export interface Sesion {
  id_sesion_programada: number;
  nombre_clase: string;
  numero_grupo: number | string;
  dia: string;
  fecha_sesion: string | Date;
  hora_inicio: string;
  hora_fin: string;
  entrenador_asignado?: string | null;
  
}