/**
 * J-P2-1 (CWE-20 / OWASP A03:2021): Inyección en parámetros — validación de cédula
 *
 * VULNERABILIDAD: getCliente y getAdmin validaban la cédula solo por longitud
 * (String(cedula).length !== 9), permitiendo que cadenas como "AAAAAAAAA" o
 * "'; DROP--" pasaran el filtro y llegaran a la base de datos.
 *
 * CORRECCIÓN: Se reemplazó la validación por /^\d{9}$/, que exige exactamente
 * 9 dígitos numéricos. Cualquier otro formato es rechazado con HTTP 400.
 */

import request from 'supertest';
import express from 'express';

// Mock de la conexión a BD para no requerir SQL Server en los tests
jest.mock('../config/conectionStore.js', () => ({
    getConnection: () => ({ connection: null })
}));

import helperRoutes from '../routes/helper.routes.js';

const app = express();
app.use(express.json());
app.use('/helper', helperRoutes);

describe('J-P2-1 (CWE-20): Validación de cédula en parámetros de ruta', () => {

    describe('GET /helper/cliente/:cedula — versión vulnerable rechazaba solo por longitud', () => {

        it('ANTES: cadena de 9 letras pasaba el filtro de longitud (versión vulnerable aceptaba "AAAAAAAAA")', async () => {
            // En la versión vulnerable: String("AAAAAAAAA").length === 9 → pasaba el filtro
            // Con /^\d{9}$/ → rechaza porque no son dígitos → 400
            const res = await request(app).get('/helper/cliente/AAAAAAAAA');
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('ANTES: cadena con caracteres especiales de 9 chars pasaba (ej: "ABC!@#456")', async () => {
            const res = await request(app).get('/helper/cliente/ABC!@%23456');
            expect(res.status).toBe(400);
        });

        it('DESPUÉS: cédula con menos de 9 dígitos es rechazada con 400', async () => {
            const res = await request(app).get('/helper/cliente/12345678');
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/inválido/i);
        });

        it('DESPUÉS: cédula con más de 9 dígitos es rechazada con 400', async () => {
            const res = await request(app).get('/helper/cliente/1234567890');
            expect(res.status).toBe(400);
        });

        it('DESPUÉS: cédula con letras mezcladas es rechazada con 400', async () => {
            const res = await request(app).get('/helper/cliente/12345678A');
            expect(res.status).toBe(400);
        });

        it('DESPUÉS: cédula vacía es rechazada con 400', async () => {
            // Express trata /cliente/ como ruta distinta, probamos con espacio codificado
            const res = await request(app).get('/helper/cliente/ ');
            expect(res.status).toBe(400);
        });

        it('DESPUÉS: cédula válida de 9 dígitos pasa la validación (no retorna 400 por formato)', async () => {
            // Sin conexión a BD retorna 400 por "No active SQL Server connection",
            // pero el motivo no es el formato de la cédula — confirma que la validación pasó
            const res = await request(app).get('/helper/cliente/123456789');
            expect(res.body.message).not.toMatch(/inválido/i);
            expect(res.body.message).not.toMatch(/9 dígitos/i);
        });
    });

    describe('GET /helper/admin/:cedula — misma validación aplicada a getAdmin', () => {

        it('ANTES: letras de 9 chars pasaban en getAdmin (versión vulnerable)', async () => {
            const res = await request(app).get('/helper/admin/BBBBBBBBB');
            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/inválido/i);
        });

        it('DESPUÉS: cédula válida pasa la validación de formato en getAdmin', async () => {
            const res = await request(app).get('/helper/admin/987654321');
            expect(res.body.message).not.toMatch(/inválido/i);
        });
    });
});
