import { z } from 'zod';

export const inscripcionSesionSchema = z.object({
  cedula_cliente: z.string().length(9, "La cédula debe tener exactamente 9 dígitos").regex(/^\d+$/, "La cédula solo debe contener números"),
  id_sesion_programada: z.number().int().positive("El ID de sesión debe ser un número positivo")
});
