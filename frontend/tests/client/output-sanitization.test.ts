import { describe, it, expect } from "vitest";
import { escapeText } from "../../utils/escapeText";

describe("Sanitización de salida en cliente (XSS Reflejado/Almacenado)", () => {
  it("escapa caracteres peligrosos antes de renderizar texto", () => {
    const input = `<img src=x onerror=alert(1)>`;
    const output = escapeText(input);

    expect(output).not.toContain("<img");
    expect(output).toContain("&lt;img");
    expect(output).toContain("&gt;");
  });

  it("no aplica cambios en texto seguro", () => {
    const input = `Clase de Yoga Básica`;
    const output = escapeText(input);

    expect(output).toBe(input);
  });
});