import { z } from "zod";
import DOMPurify from "dompurify";

/**
 * Función auxiliar para sanear strings y prevenir XSS
 */
export const sanitizeString = (val: string) => {
    if (typeof window !== "undefined") {
        return DOMPurify.sanitize(val.trim());
    }
    return val.trim(); // Fallback básico si no hay window
};

/**
 * Esquema para la creación de máquinas
 * Naturaleza 1: Saneamiento y validación de tipos
 */
export const maquinaFormSchema = z.object({
    tipo: z.string()
        .min(2, "El tipo debe tener al menos 2 caracteres")
        .max(50, "El tipo es demasiado largo")
        .transform(sanitizeString),
    modelo: z.string()
        .min(1, "El modelo es obligatorio")
        .max(50, "El modelo es demasiado largo")
        .transform(sanitizeString),
    marca: z.string()
        .min(1, "La marca es obligatoria")
        .max(50, "La marca es demasiado largo")
        .transform(sanitizeString),
    estado: z.number().int().positive()
});

/**
 * Esquema para validar la respuesta del API (Estados de Máquina)
 * Naturaleza 2: Manejo seguro de datos recibidos (Client as Attack Object)
 */
export const estadoMaquinaSchema = z.object({
    id_estado: z.number(),
    estado: z.string().transform(sanitizeString)
});

/**
 * Esquema para la vista de máquinas en el Dashboard Admin
 */
export const adminMaquinaSchema = z.object({
    id_maquina: z.number(),
    tipo: z.string().transform(sanitizeString),
    modelo: z.string().transform(sanitizeString),
    marca: z.string().transform(sanitizeString),
    estado: z.string().transform(sanitizeString),
    ultima_revision: z.string().nullable().optional(),
    nombre_admin: z.string().nullable().optional().transform(v => v ? sanitizeString(v) : v)
});

export const apiResponseSchema = z.object({
    success: z.boolean(),
    data: z.array(z.any()).optional(),
    message: z.string().optional()
});
