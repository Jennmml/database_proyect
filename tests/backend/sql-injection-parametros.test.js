/**
 * Tests para Corrección A-05: Inyección de Parámetros SQL
 * 
 * Vulnerabilidad: Los controladores entrenador.controller.js y maquina.controller.js
 * usaban .input() sin tipo SQL explícito, permitiendo confusión de tipos y potencial
 * inyección SQL.
 * 
 * CAPEC-66 (SQL Injection) / CWE-89 (Improper Neutralization of Special Elements
 * used in an SQL Command)
 * 
 * Corrección: Se agregaron tipos SQL explícitos (sql.Char, sql.Int, sql.TinyInt, 
 * sql.VarChar) en todos los .input() y validación de formato en el backend.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ============================================================
// SECCIÓN 1: Tests de código estático (verifican que el fix está presente)
// Estos tests NO requieren conexión a BD ni servidor corriendo
// ============================================================

describe('A-05: SQL Injection — Parámetros sin tipo explícito', () => {

    describe('Verificación estática del código corregido', () => {
        
        it('entrenador.controller.js — ANTES: .input() sin tipo SQL (VULNERABLE)', async () => {
            /**
             * EVIDENCIA DEL CÓDIGO VULNERABLE (antes del fix):
             * 
             * .input("cedula_entrenador", cedula_entrenador)        // ❌ Sin tipo
             * .input("id_sesion_programada", id_sesion_programada)   // ❌ Sin tipo
             * 
             * Sin tipo SQL explícito, mssql infiere el tipo desde el valor JavaScript.
             * Un atacante podría enviar valores que se interpreten de forma inesperada,
             * causando confusión de tipos en la consulta SQL.
             */
            const fs = await import('fs');
            const path = await import('path');
            const controllerPath = path.resolve(
                import.meta.dirname, 
                '../../backend/controllers/entrenador.controller.js'
            );
            const content = fs.readFileSync(controllerPath, 'utf-8');

            // Verificar que YA NO existe .input() sin tipo (patrón vulnerable)
            // Patrón vulnerable: .input("nombre", variable) — solo 2 argumentos
            const vulnerablePattern = /\.input\(\s*"cedula_entrenador"\s*,\s*cedula_entrenador\s*\)/;
            expect(vulnerablePattern.test(content)).toBe(false);

            const vulnerablePattern2 = /\.input\(\s*"id_sesion_programada"\s*,\s*id_sesion_programada\s*\)/;
            expect(vulnerablePattern2.test(content)).toBe(false);
        });

        it('entrenador.controller.js — DESPUÉS: .input() con tipo SQL explícito (CORREGIDO)', async () => {
            const fs = await import('fs');
            const path = await import('path');
            const controllerPath = path.resolve(
                import.meta.dirname,
                '../../backend/controllers/entrenador.controller.js'
            );
            const content = fs.readFileSync(controllerPath, 'utf-8');

            // Verificar que AHORA usa tipos SQL explícitos
            expect(content).toContain('sql.Char(9)');
            expect(content).toContain('sql.Int');
            
            // Verificar que importa sql de mssql
            expect(content).toMatch(/import\s+sql\s+from\s+["']mssql["']/);
        });

        it('maquina.controller.js — ANTES: .input() sin tipo SQL (VULNERABLE)', async () => {
            /**
             * EVIDENCIA DEL CÓDIGO VULNERABLE (antes del fix):
             * 
             * .input("id_maquina", id_maquina)          // ❌ Sin tipo
             * .input("cedula_admin", cedula_admin)       // ❌ Sin tipo
             * .input("nuevo_estado", nuevo_estado)       // ❌ Sin tipo
             * .input("observacion", observacion)         // ❌ Sin tipo
             * 
             * El stored procedure espera: INT, CedulaRestringida(CHAR(9)), 
             * TINYINT, VARCHAR(300). Sin tipos explícitos, un atacante podría
             * enviar objetos, arrays o strings con SQL malicioso.
             */
            const fs = await import('fs');
            const path = await import('path');
            const controllerPath = path.resolve(
                import.meta.dirname,
                '../../backend/controllers/maquina.controller.js'
            );
            const content = fs.readFileSync(controllerPath, 'utf-8');

            // Verificar que YA NO existe .input() sin tipo (patrón vulnerable)
            const vulnerablePatterns = [
                /\.input\(\s*"id_maquina"\s*,\s*id_maquina\s*\)/,
                /\.input\(\s*"cedula_admin"\s*,\s*cedula_admin\s*\)/,
                /\.input\(\s*"nuevo_estado"\s*,\s*nuevo_estado\s*\)/,
                /\.input\(\s*"observacion"\s*,\s*observacion\s*\)/,
            ];

            for (const pattern of vulnerablePatterns) {
                expect(pattern.test(content)).toBe(false);
            }
        });

        it('maquina.controller.js — DESPUÉS: .input() con tipo SQL explícito (CORREGIDO)', async () => {
            const fs = await import('fs');
            const path = await import('path');
            const controllerPath = path.resolve(
                import.meta.dirname,
                '../../backend/controllers/maquina.controller.js'
            );
            const content = fs.readFileSync(controllerPath, 'utf-8');

            // Verificar que usa todos los tipos SQL correctos según el SP
            expect(content).toContain('sql.Int');         // id_maquina → INT
            expect(content).toContain('sql.Char(9)');     // cedula_admin → CHAR(9)
            expect(content).toContain('sql.TinyInt');     // nuevo_estado → TINYINT
            expect(content).toContain('sql.VarChar(300)');// observacion → VARCHAR(300)
        });
    });

    // ============================================================
    // SECCIÓN 2: Tests de validación de entrada (lógica del controlador)
    // Usan mocks para simular el comportamiento sin conexión a BD
    // ============================================================

    describe('Validación de entrada — entrenador.controller.js', () => {
        let mockReq, mockRes, asignarEntrenador;

        beforeEach(async () => {
            // Mock de getConnection para simular conexión activa
            vi.resetModules();
            vi.doMock('../../backend/config/conectionStore.js', () => ({
                getConnection: () => ({
                    connection: {
                        request: () => ({
                            input: function() { return this; },
                            execute: async () => ({ recordset: [] })
                        })
                    }
                })
            }));

            const mod = await import('../../backend/controllers/entrenador.controller.js');
            asignarEntrenador = mod.asignarEntrenadorASesionProgramada;

            mockRes = {
                status: vi.fn().mockReturnThis(),
                json: vi.fn().mockReturnThis(),
            };
        });

        it('rechaza petición sin campos requeridos', async () => {
            mockReq = { body: {} };
            await asignarEntrenador(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
        });

        it('rechaza cédula con formato inválido (inyección SQL)', async () => {
            // Intento de inyección: enviar SQL en vez de cédula
            mockReq = {
                body: {
                    cedula_entrenador: "'; DROP TABLE entrenador; --",
                    id_sesion_programada: 1
                }
            };
            await asignarEntrenador(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: expect.stringContaining("9 dígitos")
                })
            );
        });

        it('rechaza cédula con longitud incorrecta', async () => {
            mockReq = {
                body: {
                    cedula_entrenador: "12345",  // Solo 5 dígitos
                    id_sesion_programada: 1
                }
            };
            await asignarEntrenador(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
        });

        it('rechaza id_sesion_programada no numérico', async () => {
            mockReq = {
                body: {
                    cedula_entrenador: "123456789",
                    id_sesion_programada: "abc; DROP TABLE sesion;--"
                }
            };
            await asignarEntrenador(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
        });

        it('rechaza id_sesion_programada negativo', async () => {
            mockReq = {
                body: {
                    cedula_entrenador: "123456789",
                    id_sesion_programada: -5
                }
            };
            await asignarEntrenador(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
        });

        it('acepta datos válidos con formato correcto', async () => {
            mockReq = {
                body: {
                    cedula_entrenador: "123456789",
                    id_sesion_programada: 1
                }
            };
            await asignarEntrenador(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });
    });

    describe('Validación de entrada — maquina.controller.js (nuevaRevisionMaquina)', () => {
        let mockReq, mockRes, nuevaRevision;

        beforeEach(async () => {
            vi.resetModules();
            vi.doMock('../../backend/config/conectionStore.js', () => ({
                getConnection: () => ({
                    connection: {
                        request: () => ({
                            input: function() { return this; },
                            execute: async () => ({ recordset: [] })
                        })
                    }
                })
            }));

            const mod = await import('../../backend/controllers/maquina.controller.js');
            nuevaRevision = mod.nuevaRevisionMaquina;

            mockRes = {
                status: vi.fn().mockReturnThis(),
                json: vi.fn().mockReturnThis(),
            };
        });

        it('rechaza petición sin campos requeridos', async () => {
            mockReq = { body: {} };
            await nuevaRevision(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
        });

        it('rechaza id_maquina con inyección SQL', async () => {
            mockReq = {
                body: {
                    id_maquina: "1; DROP TABLE maquina;--",
                    cedula_admin: "264451244",
                    nuevo_estado: 1,
                    observacion: "Test"
                }
            };
            await nuevaRevision(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: expect.stringContaining("entero positivo")
                })
            );
        });

        it('rechaza cedula_admin con formato inválido', async () => {
            mockReq = {
                body: {
                    id_maquina: 1,
                    cedula_admin: "' OR 1=1 --",  // SQL injection attempt
                    nuevo_estado: 1,
                    observacion: "Test"
                }
            };
            await nuevaRevision(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
        });

        it('rechaza nuevo_estado fuera de rango TINYINT', async () => {
            mockReq = {
                body: {
                    id_maquina: 1,
                    cedula_admin: "264451244",
                    nuevo_estado: 999,  // Fuera de rango TINYINT (0-255)
                    observacion: "Test"
                }
            };
            await nuevaRevision(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
        });

        it('rechaza observacion que excede 300 caracteres', async () => {
            mockReq = {
                body: {
                    id_maquina: 1,
                    cedula_admin: "264451244",
                    nuevo_estado: 1,
                    observacion: "A".repeat(301)  // Excede VARCHAR(300)
                }
            };
            await nuevaRevision(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
        });

        it('acepta datos válidos con formato correcto', async () => {
            mockReq = {
                body: {
                    id_maquina: 1,
                    cedula_admin: "264451244",
                    nuevo_estado: 1,
                    observacion: "Revisión rutinaria sin novedades."
                }
            };
            await nuevaRevision(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(201);
        });
    });
});
