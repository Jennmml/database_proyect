/**
 * J-P2-1 (CWE-20 / OWASP A03:2021): Inyección en parámetros — validación de cédula
 *
 * VULNERABILIDAD: getCliente y getAdmin validaban la cédula solo por longitud
 * (String(cedula).length !== 9), permitiendo que cadenas como "AAAAAAAAA"
 * pasaran el filtro y llegaran a la base de datos.
 *
 * CORRECCIÓN: Se reemplazó la validación por /^\d{9}$/, que exige exactamente
 * 9 dígitos numéricos. Cualquier otro formato es rechazado con HTTP 400.
 */

import request from 'supertest';
import express from 'express';
import { generateToken } from '../middleware/auth.middleware.js';

// Mock de la conexión a BD
jest.mock('../config/conectionStore.js', () => ({
    getConnection: () => ({ connection: null })
}));

import helperRoutes from '../routes/helper.routes.js';

const app = express();
app.use(express.json());
app.use('/helper', helperRoutes);

// Token admin válido para pasar el middleware de auth y llegar a la validación de cédula
const adminToken = generateToken({ role: 'admin', cedula: '111111111' });

describe('J-P2-1 (CWE-20): Validación de cédula en parámetros de ruta', () => {

    describe('GET /helper/cliente/:cedula', () => {

        it('ANTES: cadena de 9 letras pasaba el filtro de longitud (versión vulnerable aceptaba "AAAAAAAAA")', async () => {
            // Versión vulnerable: String("AAAAAAAAA").length === 9 → pasaba
            // Versión corregida: /^\d{9}$/ → rechaza → 400
            const res = await request(app)
                .get('/helper/cliente/AAAAAAAAA')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/inválido/i);
        });

        it('DESPUÉS: cédula con menos de 9 dígitos es rechazada con 400', async () => {
            const res = await request(app)
                .get('/helper/cliente/12345678')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/inválido/i);
        });

        it('DESPUÉS: cédula con más de 9 dígitos es rechazada con 400', async () => {
            const res = await request(app)
                .get('/helper/cliente/1234567890')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(400);
        });

        it('DESPUÉS: cédula con letras mezcladas es rechazada con 400', async () => {
            const res = await request(app)
                .get('/helper/cliente/12345678A')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(400);
        });

        it('DESPUÉS: cédula válida de 9 dígitos pasa la validación de formato', async () => {
            // Sin BD retorna 400 por "No active SQL Server connection",
            // pero el mensaje no es de formato — confirma que la validación de cédula pasó
            const res = await request(app)
                .get('/helper/cliente/123456789')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.body.message).not.toMatch(/inválido/i);
            expect(res.body.message).not.toMatch(/9 dígitos/i);
        });
    });

    describe('GET /helper/admin/:cedula', () => {

        it('ANTES: letras de 9 chars pasaban en getAdmin (versión vulnerable)', async () => {
            const res = await request(app)
                .get('/helper/admin/BBBBBBBBB')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/inválido/i);
        });

        it('DESPUÉS: cédula válida pasa la validación de formato en getAdmin', async () => {
            const res = await request(app)
                .get('/helper/admin/987654321')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.body.message).not.toMatch(/inválido/i);
        });
    });
});
