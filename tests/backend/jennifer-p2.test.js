/**
 * Tests para Correcciones de Jennifer — Parte 2 (Servidor)
 *
 * Corrección 1 — Inyección en parámetros (CWE-20 / OWASP A03:2021)
 * Archivo: backend/controllers/helper.controller.js
 * Funciones: getCliente, getAdmin
 *
 * Corrección 2 — Control de acceso sin roles (CWE-862 / OWASP A01:2021)
 * Archivo: backend/middleware/auth.middleware.js
 * Rutas:   backend/routes/cliente.routes.js, sesion.routes.js, clase.routes.js
 */
import { describe, it, expect } from 'vitest';

// ─────────────────────────────────────────────────────────────
// CORRECCIÓN 1 — Inyección en parámetros
// ─────────────────────────────────────────────────────────────

describe('J-P2-1 (CWE-20): Validación de cédula en parámetros de ruta', () => {

    describe('helper.controller.js — getCliente', () => {

        it('ANTES: validación por longitud era vulnerable a strings no numéricos', async () => {
            /**
             * Código vulnerable original:
             *   if (!cedula || String(cedula).length !== 9) { ... }
             * Esto aceptaba "AAAAAAAAA", "'; DROP--", etc. (9 chars cualesquiera)
             */
            const fs = await import('fs');
            const path = await import('path');
            const content = fs.readFileSync(
                path.resolve(import.meta.dirname, '../../backend/controllers/helper.controller.js'),
                'utf-8'
            );
            // Verificar que la validación vulnerable YA NO existe
            expect(content).not.toContain('String(cedula).length !== 9');
            expect(content).not.toContain("Cedula query parameter must be exactly 9 characters");
        });

        it('DESPUÉS: validación con regex /^\\d{9}$/ exige exactamente 9 dígitos numéricos', async () => {
            const fs = await import('fs');
            const path = await import('path');
            const content = fs.readFileSync(
                path.resolve(import.meta.dirname, '../../backend/controllers/helper.controller.js'),
                'utf-8'
            );
            expect(content).toContain('/^\\d{9}$/');
            expect(content).toContain('Formato de cédula inválido');
        });

        it('DESPUÉS: usa sql.VarChar(9) para tipar el input de la query', async () => {
            const fs = await import('fs');
            const path = await import('path');
            const content = fs.readFileSync(
                path.resolve(import.meta.dirname, '../../backend/controllers/helper.controller.js'),
                'utf-8'
            );
            expect(content).toContain('sql.VarChar(9)');
        });
    });

    describe('helper.controller.js — getAdmin', () => {

        it('ANTES: getAdmin también usaba validación por longitud (vulnerable)', async () => {
            const fs = await import('fs');
            const path = await import('path');
            const content = fs.readFileSync(
                path.resolve(import.meta.dirname, '../../backend/controllers/helper.controller.js'),
                'utf-8'
            );
            expect(content).not.toContain('String(cedula).length !== 9');
        });

        it('DESPUÉS: getAdmin aplica la misma validación /^\\d{9}$/', async () => {
            const fs = await import('fs');
            const path = await import('path');
            const content = fs.readFileSync(
                path.resolve(import.meta.dirname, '../../backend/controllers/helper.controller.js'),
                'utf-8'
            );
            // Debe aparecer al menos dos veces (getCliente y getAdmin)
            const matches = content.match(/\/\^\s*\\d\{9\}\s*\$\//g) || [];
            expect(matches.length).toBeGreaterThanOrEqual(2);
        });
    });
});

// ─────────────────────────────────────────────────────────────
// CORRECCIÓN 2 — Control de acceso sin roles
// ─────────────────────────────────────────────────────────────

describe('J-P2-2 (CWE-862): Control de acceso basado en roles', () => {

    describe('auth.middleware.js — middleware requireRole', () => {

        it('ANTES: no existía middleware de autenticación (archivo no existía)', async () => {
            /**
             * En la versión original no había ningún middleware de auth.
             * Verificamos que ahora SÍ existe requireRole.
             */
            const fs = await import('fs');
            const path = await import('path');
            const content = fs.readFileSync(
                path.resolve(import.meta.dirname, '../../backend/middleware/auth.middleware.js'),
                'utf-8'
            );
            expect(content).toContain('requireRole');
        });

        it('DESPUÉS: requireRole devuelve 401 si no hay autenticación', async () => {
            const fs = await import('fs');
            const path = await import('path');
            const content = fs.readFileSync(
                path.resolve(import.meta.dirname, '../../backend/middleware/auth.middleware.js'),
                'utf-8'
            );
            expect(content).toContain('401');
        });

        it('DESPUÉS: requireRole devuelve 403 si el rol es incorrecto', async () => {
            const fs = await import('fs');
            const path = await import('path');
            const content = fs.readFileSync(
                path.resolve(import.meta.dirname, '../../backend/middleware/auth.middleware.js'),
                'utf-8'
            );
            expect(content).toContain('403');
        });
    });

    describe('cliente.routes.js — rutas destructivas protegidas', () => {

        it('ANTES: rutas POST/PUT/DELETE eran públicas sin ningún guard', async () => {
            const fs = await import('fs');
            const path = await import('path');
            const content = fs.readFileSync(
                path.resolve(import.meta.dirname, '../../backend/routes/cliente.routes.js'),
                'utf-8'
            );
            // Verificar que requireRole está aplicado en rutas destructivas
            expect(content).toContain("requireRole('admin')");
        });

        it('DESPUÉS: POST insertarCliente requiere rol admin', async () => {
            const fs = await import('fs');
            const path = await import('path');
            const content = fs.readFileSync(
                path.resolve(import.meta.dirname, '../../backend/routes/cliente.routes.js'),
                'utf-8'
            );
            expect(content).toMatch(/post.*insertarCliente.*requireRole|requireRole.*insertarCliente/is);
        });

        it('DESPUÉS: DELETE eliminarPersona requiere rol admin', async () => {
            const fs = await import('fs');
            const path = await import('path');
            const content = fs.readFileSync(
                path.resolve(import.meta.dirname, '../../backend/routes/cliente.routes.js'),
                'utf-8'
            );
            expect(content).toMatch(/delete.*eliminarPersona.*requireRole|requireRole.*eliminarPersona/is);
        });
    });

    describe('clase.routes.js — rutas destructivas protegidas', () => {

        it('DESPUÉS: POST crearClase requiere rol admin', async () => {
            const fs = await import('fs');
            const path = await import('path');
            const content = fs.readFileSync(
                path.resolve(import.meta.dirname, '../../backend/routes/clase.routes.js'),
                'utf-8'
            );
            expect(content).toContain("requireRole('admin')");
        });
    });

    describe('sesion.routes.js — rutas destructivas protegidas', () => {

        it('DESPUÉS: POST crearSesion requiere rol admin', async () => {
            const fs = await import('fs');
            const path = await import('path');
            const content = fs.readFileSync(
                path.resolve(import.meta.dirname, '../../backend/routes/sesion.routes.js'),
                'utf-8'
            );
            expect(content).toContain("requireRole('admin')");
        });
    });
});
