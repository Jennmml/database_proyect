import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import { authenticateToken, generateToken } from '../../backend/middleware/auth.middleware.js';

// Mock app para testing
const createTestApp = () => {
    const app = express();
    app.use(express.json());

    // Mock de la ruta /consultas/cliente/:cedula
    app.get('/consultas/cliente/:cedula', authenticateToken, (req, res) => {
        const { cedula } = req.params;

        // Validación de formato de cédula
        if (!cedula || !/^\d{9}$/.test(cedula)) {
            return res.status(400).json({
                success: false,
                message: "Formato de cédula inválido. Debe contener exactamente 9 dígitos numéricos.",
            });
        }

        // CORRECCIÓN 2: Validación de autorización - IDOR prevention
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "No autenticado. Se requiere un token válido."
            });
        }

        const esAdmin = req.user.role === 'admin';
        const esPropietario = req.user.cedula === cedula;

        if (!esAdmin && !esPropietario) {
            return res.status(403).json({
                success: false,
                message: "No autorizado para acceder a este recurso. Solo puedes consultar tu propia cédula o eres administrador."
            });
        }

        // Simular respuesta exitosa
        res.status(200).json({
            success: true,
            data: {
                cedula: cedula,
                nombre: 'Cliente Prueba',
                email: 'cliente@test.com'
            }
        });
    });

    return app;
};

describe('Corrección 2: Control de acceso por propietario en cliente', () => {
    const app = createTestApp();

    it('bloquea acceso a datos de otro cliente por cédula', async () => {
        const tokenUsuarioA = generateToken({
            role: 'cliente',
            cedula: '111111111'
        });

        const res = await request(app)
            .get('/consultas/cliente/222222222')
            .set('Authorization', `Bearer ${tokenUsuarioA}`);

        expect(res.status).toBe(403);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('No autorizado');
    });

    it('permite al cliente consultar su propia cédula', async () => {
        const tokenUsuarioA = generateToken({
            role: 'cliente',
            cedula: '111111111'
        });

        const res = await request(app)
            .get('/consultas/cliente/111111111')
            .set('Authorization', `Bearer ${tokenUsuarioA}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.cedula).toBe('111111111');
    });

    it('permite al admin consultar cualquier cédula', async () => {
        const tokenAdmin = generateToken({
            role: 'admin',
            cedula: '999999999'
        });

        const res = await request(app)
            .get('/consultas/cliente/222222222')
            .set('Authorization', `Bearer ${tokenAdmin}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.cedula).toBe('222222222');
    });

    it('rechaza acceso sin token de autenticación', async () => {
        const res = await request(app)
            .get('/consultas/cliente/111111111');

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('No autenticado');
    });

    it('rechaza cédulas con formato inválido', async () => {
        const tokenUsuarioA = generateToken({
            role: 'cliente',
            cedula: '111111111'
        });

        const resInvalidFormat = await request(app)
            .get('/consultas/cliente/abc123')
            .set('Authorization', `Bearer ${tokenUsuarioA}`);

        expect(resInvalidFormat.status).toBe(400);
        expect(resInvalidFormat.body.message).toContain('Formato de cédula inválido');
    });

    it('bloquea acceso aunque el cliente sea de otro rol intentando acceso cruzado', async () => {
        const tokenEntrenador = generateToken({
            role: 'entrenador',
            cedula: '333333333'
        });

        const res = await request(app)
            .get('/consultas/cliente/444444444')
            .set('Authorization', `Bearer ${tokenEntrenador}`);

        // Aunque sea entrenador, no puede acceder a cédula ajena
        expect(res.status).toBe(403);
        expect(res.body.success).toBe(false);
    });

    it('admin puede consultar su propia cédula y también la de otros', async () => {
        const tokenAdmin = generateToken({
            role: 'admin',
            cedula: '999999999'
        });

        // Consultar propia cédula
        const resPropia = await request(app)
            .get('/consultas/cliente/999999999')
            .set('Authorization', `Bearer ${tokenAdmin}`);

        expect(resPropia.status).toBe(200);
        expect(resPropia.body.success).toBe(true);

        // Consultar cédula ajena como admin
        const resAjena = await request(app)
            .get('/consultas/cliente/111111111')
            .set('Authorization', `Bearer ${tokenAdmin}`);

        expect(resAjena.status).toBe(200);
        expect(resAjena.body.success).toBe(true);
    });
});
