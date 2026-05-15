/**
 * J-B2 (CWE-209): Exposición de mensajes de error internos del servidor
 *
 * VULNERABILIDAD: El frontend mostraba directamente data.message del servidor,
 * filtrando detalles técnicos internos al usuario (ej: "constraint violation en tabla clases").
 *
 * CORRECCIÓN: Se muestra un mensaje genérico en lugar del mensaje real del servidor.
 */

import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import fs from "fs"
import path from "path"
import NuevaClasePage from "../app/(admin)/clases/nuevo/page"

const CLASES_PAGE_PATH = path.resolve(__dirname, "../app/(admin)/clases/nuevo/page.tsx")

describe("J-B2 (CWE-209): Mensajes de error internos del servidor", () => {
  it("ANTES: el código original exponía data.message directamente", () => {
    const vulnerablePattern = "data.message"
    const currentContent = fs.readFileSync(CLASES_PAGE_PATH, "utf-8")
    // El código vulnerable usaba: `❌ Error: ${data.message || "..."}`
    // Verificamos que esa interpolación ya no exista
    expect(currentContent).not.toContain("`❌ Error: ${data.message")
  })

  it("DESPUÉS: mensaje de error genérico, sin filtrar data.message del servidor", async () => {
    const serverInternalMessage = "constraint violation en tabla clases — columna 'cupo_disponible'"

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: false,
        message: serverInternalMessage,
      }),
    }) as any

    render(<NuevaClasePage />)

    fireEvent.change(screen.getByLabelText(/Nombre de la Clase/i), {
      target: { name: "nombre_clase", value: "Yoga Avanzado" },
    })
    fireEvent.change(screen.getByLabelText(/Descripción/i), {
      target: { name: "descripcion", value: "Clase para nivel avanzado" },
    })
    fireEvent.change(screen.getByLabelText(/Cupo Disponible/i), {
      target: { name: "cupo_disponible", value: "15" },
    })

    const diaSelect = screen.getByLabelText(/Día/i)
    fireEvent.change(diaSelect, { target: { name: "dia", value: "Lunes" } })

    fireEvent.change(screen.getByLabelText(/Hora de Inicio/i), {
      target: { name: "hora_inicio", value: "08:00" },
    })
    fireEvent.change(screen.getByLabelText(/Hora de Fin/i), {
      target: { name: "hora_fin", value: "09:00" },
    })

    fireEvent.click(screen.getByRole("button", { name: /Crear Clase/i }))

    await waitFor(() => {
      const mensaje = screen.getByText(/No se pudo crear la clase/i)
      expect(mensaje).toBeTruthy()
      // El mensaje interno del servidor NO debe aparecer en el DOM
      expect(document.body.textContent).not.toContain(serverInternalMessage)
    })
  })
})
