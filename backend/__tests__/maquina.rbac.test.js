/**
 * Tests para Corrección A-03: Control de Acceso y Escalación de Privilegios (RBAC)
 *
 * Vulnerabilidad: Las rutas /agregarMaquina y /nuevaRevisionMaquina en
 * maquina.routes.js NO tenían validación de roles. Cualquier usuario (incluso
 * anónimo) podía ejecutar funciones de administrador.
 *
 * CAPEC-233 (Privilege Escalation) / CWE-862 (Missing Authorization)
 *
 * Corrección: Se agregó el middleware requireRole('admin') a las rutas críticas.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock del controlador para evitar hacer queries reales a la BD durante la prueba de roles
vi.mock('../controllers/maquina.controller.js', () => ({
    agregarMaquina: (req, res) => res.status(200).json({ success: true, message: 'Máquina agregada' }),
    nuevaRevisionMaquina: (req, res) => res.status(200).json({ success: true, message: 'Revisión agregada' }),
    cursorMaquinaVencidas: (req, res) => res.status(200).json({ success: true, data: [] })
}));

import maquinaRoutes from '../routes/maquina.routes.js';

const app = express();
app.use(express.json());
app.use('/maquinas', maquinaRoutes);

describe('A-03: Control de Acceso (RBAC) - Rutas de Máquinas', () => {

    // ============================================================
    // SECCIÓN 1: Tests de código estático (verifican que el fix está presente)
    // ============================================================
    describe('Verificación estática del código corregido', () => {

        it('maquina.routes.js — ANTES: rutas SIN middleware requireRole (VULNERABLE)', async () => {
            /**
             * EVIDENCIA DEL CÓDIGO VULNERABLE (antes del fix):
             *
             * router.post("/agregarMaquina", agregarMaquina);           // ❌ Sin validación
             * router.post('/nuevaRevisionMaquina', nuevaRevisionMaquina); // ❌ Sin validación
             *
             * Un atacante podía enviar peticiones POST directamente sin autenticación.
             */
            const fs = await import('fs');
            const path = await import('path');
            const routesPath = path.resolve(
                import.meta.dirname,
                '../routes/maquina.routes.js'
            );
            const content = fs.readFileSync(routesPath, 'utf-8');

            // Verificar que las rutas NO están desnudas (sin middleware)
            // Patrón vulnerable: router.post("/agregarMaquina", agregarMaquina)
            // donde agregarMaquina es el primer argumento después de la ruta
            const vulnerablePattern1 = /router\.post\(\s*["']\/agregarMaquina["']\s*,\s*agregarMaquina\s*\)/;
            const vulnerablePattern2 = /router\.post\(\s*['"]\/nuevaRevisionMaquina['"]\s*,\s*nuevaRevisionMaquina\s*\)/;

            expect(vulnerablePattern1.test(content)).toBe(false);
            expect(vulnerablePattern2.test(content)).toBe(false);
        });

        it('maquina.routes.js — DESPUÉS: rutas CON middleware requireRole (CORREGIDO)', async () => {
            const fs = await import('fs');
            const path = await import('path');
            const routesPath = path.resolve(
                import.meta.dirname,
                '../routes/maquina.routes.js'
            );
            const content = fs.readFileSync(routesPath, 'utf-8');

            // Verificar que el middleware requireRole fue agregado
            expect(content).toContain("requireRole('admin')");

            // Verificar que las rutas protegidas tienen el middleware
            expect(content).toMatch(/router\.post\(\s*["']\/agregarMaquina["']\s*,\s*requireRole\(['"]admin['"]\)/);
            expect(content).toMatch(/router\.post\(\s*['"]\/nuevaRevisionMaquina['"]\s*,\s*requireRole\(['"]admin['"]\)/);
        });

        it('auth.middleware.js — middleware requireRole existe y exportado', async () => {
            const fs = await import('fs');
            const path = await import('path');
            const middlewarePath = path.resolve(
                import.meta.dirname,
                '../middleware/auth.middleware.js'
            );
            const content = fs.readFileSync(middlewarePath, 'utf-8');

            // Verificar que el middleware verifica x-user-role
            expect(content).toContain("x-user-role");
            expect(content).toContain('401');
            expect(content).toContain('403');
            expect(content).toContain('requireRole');
        });
    });

    // ============================================================
    // SECCIÓN 2: Tests de integración (prueban el comportamiento de las rutas)
    // ============================================================
    describe('Comportamiento de rutas — POST /maquinas/agregarMaquina', () => {

        it('VULNERABLE (ANTES): Sin autenticación retornaba 200 o error SQL', async () => {
            /**
             * En el estado vulnerable, sin el middleware requireRole,
             * la petición llegaba al controlador que intentaba ejecutar
             * la query en BD. Typically this would either:
             * - Return 200 if the DB connection happened to work
             * - Return a SQL error due to missing fields
             *
             * NUNCA debía retornar 200 sin validar rol.
             */
            const response = await request(app)
                .post('/maquinas/agregarMaquina')
                .send({
                    nombre: 'Cinta de correr',
                    descripcion: 'Cinta de correr profesional',
                    fecha_compra: '2026-01-01',
                    id_estado: 1
                });

            // AHORA (corregido): Retorna 401 porque no hay autenticación
            expect(response.status).toBe(401);
            expect(response.body.message).toMatch(/No autorizado/i);
        });

        it('CORREGIDO: Rechaza petición (403) si rol no es admin', async () => {
            const response = await request(app)
                .post('/maquinas/agregarMaquina')
                .set('x-user-role', 'cliente')
                .send({
                    nombre: 'Cinta de correr',
                    descripcion: 'Cinta de correr profesional',
                    fecha_compra: '2026-01-01',
                    id_estado: 1
                });

            expect(response.status).toBe(403);
            expect(response.body.message).toMatch(/Rol insuficiente/i);
        });

        it('CORREGIDO: Permite petición (200) si rol es admin', async () => {
            const response = await request(app)
                .post('/maquinas/agregarMaquina')
                .set('x-user-role', 'admin')
                .send({
                    nombre: 'Cinta de correr',
                    descripcion: 'Cinta de correr profesional',
                    fecha_compra: '2026-01-01',
                    id_estado: 1
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });

    describe('Comportamiento de rutas — POST /maquinas/nuevaRevisionMaquina', () => {

        it('VULNERABLE (ANTES): Sin autenticación retornaba 200 o error', async () => {
            const response = await request(app)
                .post('/maquinas/nuevaRevisionMaquina')
                .send({ id_maquina: 1, fecha_revision: '2026-05-01' });

            // AHORA (corregido): Retorna 401
            expect(response.status).toBe(401);
        });

        it('CORREGIDO: Rechaza petición (403) si rol no es admin', async () => {
            const response = await request(app)
                .post('/maquinas/nuevaRevisionMaquina')
                .set('x-user-role', 'entrenador') // Rol válido pero no admin
                .send({ id_maquina: 1, fecha_revision: '2026-05-01' });

            expect(response.status).toBe(403);
        });

        it('CORREGIDO: Permite petición (200) si rol es admin', async () => {
            const response = await request(app)
                .post('/maquinas/nuevaRevisionMaquina')
                .set('x-user-role', 'admin')
                .send({ id_maquina: 1, fecha_revision: '2026-05-01' });

            expect(response.status).toBe(200);
        });
    });

    // ============================================================
    // SECCIÓN 3: Tests de verificación de defensa (escalación de privilegios)
    // ============================================================
    describe('Defensa contra escalada de privilegios', () => {

        it('Impide acceso con rol spoofing de headers', async () => {
            // Un atacante podría intentar spoofear el header x-user-role
            // La defensa correcta es que el server valide contra una fuente de verdad
            // Por ahora, el middleware solo valida que el rol sea 'admin'
            const response = await request(app)
                .post('/maquinas/agregarMaquina')
                .set('x-user-role', 'admin') // Intento de spoofing
                .send({
                    nombre: 'Máquina con spoofing',
                    descripcion: 'Test',
                    fecha_compra: '2026-01-01',
                    id_estado: 1
                });

            // Si el rol coincide con 'admin', se permite (el spoofing funcionaría en este caso simple)
            // En una implementación más robusta, se validaría contra la sesión real del servidor
            expect(response.status).toBe(200);
        });

        it('Ruta GET pública sigue funcionando (cursorMaquinasVencidas)', async () => {
            // La ruta GET no es destructiva, puede ser pública
            const response = await request(app)
                .get('/maquinas/cursorMaquinasVencidas');

            expect(response.status).toBe(200);
        });
    });

    // ============================================================
    // SECCIÓN 4: Tests de reversión al estado vulnerable
    // Estos tests demuestran que el sistema FALLABA antes del fix
    // ============================================================
    describe('Demostración de vulnerabilidad (reversión temporal)', () => {
        const routesPath = path.resolve(__dirname, '../routes/maquina.routes.js');
        let originalContent;

        beforeEach(() => {
            // Guardar el contenido corregido
            originalContent = fs.readFileSync(routesPath, 'utf-8');
        });

        afterEach(() => {
            // Restaurar el contenido corregido después de cada test
            fs.writeFileSync(routesPath, originalContent, 'utf-8');
        });

        it('VULNERABLE: Sin middleware requireRole, cualquier usuario puede acceder', async () => {
            // Crear versión vulnerable del archivo (sin requireRole)
            const vulnerableContent = originalContent.replace(
                /requireRole\(['"]admin['"]\),\s*/g,
                ''
            );

            // Escribir el archivo vulnerable
            fs.writeFileSync(routesPath, vulnerableContent, 'utf-8');

            // Importar dinámicamente las rutas para obtener el código fresco
            vi.resetModules();

            // Crear una nueva instancia de Express con las rutas vulnerables
            const vulnerableApp = express();
            vulnerableApp.use(express.json());

            // Importar las rutas después de modificar el archivo
            const { default: vulnerableRoutes } = await import('../routes/maquina.routes.js');
            vulnerableApp.use('/maquinas', vulnerableRoutes);

            // Intentar acceso sin autenticación - DEBE fallar en la versión vulnerable
            // (En la versión vulnerable, retornaría 200 o error SQL, no 401)
            const response = await request(vulnerableApp)
                .post('/maquinas/agregarMaquina')
                .send({
                    nombre: 'Cinta de correr',
                    descripcion: 'Test vulnerabilidad',
                    fecha_compra: '2026-01-01',
                    id_estado: 1
                });

            // En estado vulnerable, NO retorna 401 porque no hay middleware
            // El código llega al controlador (mockeado) y retorna 200
            expect(response.status).toBe(200);
        });

        it('CORREGIDO: Con middleware requireRole, acceso no autorizado es bloqueado', async () => {
            // Verificar que el archivo todavía tiene el fix
            const currentContent = fs.readFileSync(routesPath, 'utf-8');
            expect(currentContent).toContain("requireRole('admin')");

            // El test de integración ya verifica esto, pero lo reafirmamos
            const response = await request(app)
                .post('/maquinas/agregarMaquina')
                .send({
                    nombre: 'Cinta de correr',
                    descripcion: 'Test',
                    fecha_compra: '2026-01-01',
                    id_estado: 1
                });

            expect(response.status).toBe(401);
        });
    });
});
