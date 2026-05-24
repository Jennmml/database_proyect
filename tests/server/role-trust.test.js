import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import { requireRole, authenticateToken, generateToken } from '../../backend/middleware/auth.middleware.js';

// Mock app para testing
const createTestApp = () => {
    const app = express();
    app.use(express.json());

    // Ruta protegida que requiere rol admin
    app.post('/maquinas/agregarMaquina', authenticateToken, requireRole('admin'), (req, res) => {
        res.status(200).json({
            success: true,
            message: 'Máquina agregada correctamente'
        });
    });

    return app;
};

describe('Corrección 1: No confiar en x-user-role para autorización', () => {
    const app = createTestApp();

    it('rechaza una petición cuando solo se envía x-user-role falsificado sin token', async () => {
        const res = await request(app)
            .post('/maquinas/agregarMaquina')
            .set('x-user-role', 'admin')
            .send({
                nombre: 'Máquina prueba',
                estado: 'Activa'
            });

        // Debe rechazar con 401 (no autenticado) o 403 (token inválido)
        expect([401, 403]).toContain(res.status);
        expect(res.body.success).toBe(false);
    });

    it('rechaza una petición con x-user-role admin pero sin Bearer token', async () => {
        const res = await request(app)
            .post('/maquinas/agregarMaquina')
            .set('x-user-role', 'admin')
            .set('Authorization', 'InvalidFormat')
            .send({
                nombre: 'Máquina prueba',
                estado: 'Activa'
            });

        expect([401, 403]).toContain(res.status);
    });

    it('acepta una petición con token JWT válido y rol admin', async () => {
        const validToken = generateToken({
            cedula: '123456789',
            role: 'admin'
        });

        const res = await request(app)
            .post('/maquinas/agregarMaquina')
            .set('Authorization', `Bearer ${validToken}`)
            .send({
                nombre: 'Máquina prueba',
                estado: 'Activa'
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    it('rechaza una petición con token JWT válido pero rol insuficiente', async () => {
        const tokenCliente = generateToken({
            cedula: '111111111',
            role: 'cliente'
        });

        const res = await request(app)
            .post('/maquinas/agregarMaquina')
            .set('Authorization', `Bearer ${tokenCliente}`)
            .send({
                nombre: 'Máquina prueba',
                estado: 'Activa'
            });

        expect(res.status).toBe(403);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('Acceso denegado');
    });

    it('rechaza una petición sin Authorization header', async () => {
        const res = await request(app)
            .post('/maquinas/agregarMaquina')
            .send({
                nombre: 'Máquina prueba',
                estado: 'Activa'
            });

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('Token requerido');
    });

    it('rechaza una petición con token expirado o inválido', async () => {
        const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.invalid';

        const res = await request(app)
            .post('/maquinas/agregarMaquina')
            .set('Authorization', `Bearer ${invalidToken}`)
            .send({
                nombre: 'Máquina prueba',
                estado: 'Activa'
            });

        expect(res.status).toBe(403);
        expect(res.body.message).toContain('inválido');
    });
});
