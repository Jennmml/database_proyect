import { z } from "zod";

export const ClienteSchema = z.object({
  cedula: z.string(),
  nombre: z.string(),
  apellido1: z.string(),
  apellido2: z.string().optional().nullable(),
  telefono: z.string().optional().nullable(),
  correo: z.string().optional().nullable(),
  fecha_registro: z.string().or(z.date()).optional().nullable(),
  tipo_membresia: z.string().optional().nullable(),
  fecha_expiracion: z.string().or(z.date()).optional().nullable(),
  estado_cliente: z.string().optional().nullable(),
}).passthrough();

export const ClientesResponseSchema = z.array(ClienteSchema);
