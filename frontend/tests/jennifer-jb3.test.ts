/**
 * J-B3 (CWE-1021 / OWASP A05): Headers de seguridad HTTP faltantes
 *
 * VULNERABILIDAD: next.config.ts no definía headers de seguridad HTTP,
 * dejando la app sin protección contra clickjacking, MIME sniffing e inyección de scripts.
 *
 * CORRECCIÓN: Se agregaron X-Frame-Options, X-Content-Type-Options,
 * Referrer-Policy y Content-Security-Policy en next.config.ts.
 */

import { describe, it, expect } from "vitest"
import fs from "fs"
import path from "path"

const NEXT_CONFIG_PATH = path.resolve(__dirname, "../next.config.ts")

describe("J-B3 (CWE-1021): Headers de seguridad HTTP", () => {
  it("ANTES: next.config.ts no tenía headers de seguridad definidos", () => {
    const content = fs.readFileSync(NEXT_CONFIG_PATH, "utf-8")
    // El archivo vacío original no tenía función headers()
    // Verificamos que ahora SÍ existe (es decir, la vulnerabilidad fue corregida)
    expect(content).toContain("async headers()")
  })

  it("DESPUÉS: contiene X-Frame-Options DENY para prevenir clickjacking", () => {
    const content = fs.readFileSync(NEXT_CONFIG_PATH, "utf-8")
    expect(content).toContain("X-Frame-Options")
    expect(content).toContain("DENY")
  })

  it("DESPUÉS: contiene X-Content-Type-Options nosniff para prevenir MIME sniffing", () => {
    const content = fs.readFileSync(NEXT_CONFIG_PATH, "utf-8")
    expect(content).toContain("X-Content-Type-Options")
    expect(content).toContain("nosniff")
  })

  it("DESPUÉS: contiene Content-Security-Policy", () => {
    const content = fs.readFileSync(NEXT_CONFIG_PATH, "utf-8")
    expect(content).toContain("Content-Security-Policy")
  })

  it("DESPUÉS: contiene Referrer-Policy", () => {
    const content = fs.readFileSync(NEXT_CONFIG_PATH, "utf-8")
    expect(content).toContain("Referrer-Policy")
  })
})
