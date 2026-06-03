import { z } from 'zod';

export const registrarPagoSchema = z.object({
  cedula_cliente: z.string().length(9, "La cédula debe tener exactamente 9 dígitos").regex(/^\d+$/, "La cédula solo debe contener números"),
  tipo_membresia: z.number().int().min(1).max(5),
  monto: z.number().positive("El monto debe ser un valor positivo"),
  fecha_pago: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)").refine((date) => new Date(date) <= new Date(), "La fecha no puede ser en el futuro"),
  id_forma_pago: z.number().int().positive()
});

export const renovarMembresiaSchema = z.object({
  cedula: z.string().length(9).regex(/^\d+$/),
  monto: z.number().positive(),
  id_forma_pago: z.number().int().positive()
});
