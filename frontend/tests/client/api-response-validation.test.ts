import { describe, it, expect } from "vitest";
import { ClientesResponseSchema } from "../../app/(admin)/clientes/schema";

describe("Validación de respuesta del API de Clientes", () => {
  it("rechaza una respuesta inválida del API", () => {
    const respuestaInvalida = [
      {
        cedula: "<script>alert(1)</script>",
        // Falta nombre y otros campos obligatorios que espera el esquema
        nombre: 123
      }
    ];

    const result = ClientesResponseSchema.safeParse(respuestaInvalida);

    expect(result.success).toBe(false);
  });

  it("acepta una respuesta válida del API", () => {
    const respuestaValida = [
      {
        cedula: "123456789",
        nombre: "Cliente Prueba",
        apellido1: "Apellido",
        telefono: "88888888",
        correo: "cliente@test.com",
        fecha_registro: "2023-01-01",
        estado_cliente: "Activo"
      }
    ];

    const result = ClientesResponseSchema.safeParse(respuestaValida);

    expect(result.success).toBe(true);
  });
});