/**
 * J-P2-2 (CWE-862 / OWASP A01:2021): Control de acceso sin roles
 *
 * VULNERABILIDAD: Las rutas POST, PUT y DELETE de clientes, sesiones y clases
 * eran completamente públicas. Cualquier usuario anónimo podía ejecutar
 * operaciones destructivas sin ninguna autenticación.
 *
 * CORRECCIÓN: Se creó el middleware requireRole que verifica el rol del usuario
 * autenticado via JWT. Sin token → 401. Con rol incorrecto → 403.
 *
 * Nota: Yeilyn migró el middleware de x-user-role header plano a JWT firmado.
 * Estos tests usan generateToken (helper del middleware) para simular tokens.
 */

import request from 'supertest';
import express from 'express';
import { generateToken } from '../middleware/auth.middleware.js';

// Mocks de controladores para evitar conexión real a BD
jest.mock('../controllers/cliente.controller.js', () => ({
    insertarCliente:   (req, res) => res.status(200).json({ success: true }),
    eliminarPersona:   (req, res) => res.status(200).json({ success: true }),
    actualizarPersona: (req, res) => res.status(200).json({ success: true }),
    vistaClientes:               (req, res) => res.status(200).json({ success: true }),
    vistaClientesClase:          (req, res) => res.status(200).json({ success: true }),
    vistaClientesSesion:         (req, res) => res.status(200).json({ success: true }),
    rankingClientes:             (req, res) => res.status(200).json({ success: true }),
    clientesMembresiaProximaAVencer: (req, res) => res.status(200).json({ success: true }),
    vistaHistorialPagosClientes: (req, res) => res.status(200).json({ success: true }),
}));

jest.mock('../controllers/clase.controller.js', () => ({
    crearClase:               (req, res) => res.status(200).json({ success: true }),
    eliminarClase:            (req, res) => res.status(200).json({ success: true }),
    registarAsistencia:       (req, res) => res.status(200).json({ success: true }),
    vistaTotalClasesPorSesion:(req, res) => res.status(200).json({ success: true }),
}));

import clienteRoutes from '../routes/cliente.routes.js';
import claseRoutes   from '../routes/clase.routes.js';

const app = express();
app.use(express.json());
app.use('/clientes', clienteRoutes);
app.use('/clases',   claseRoutes);

const adminToken  = generateToken({ role: 'admin',  cedula: '111111111' });
const clienteToken = generateToken({ role: 'cliente', cedula: '222222222' });

describe('J-P2-2 (CWE-862): Control de acceso basado en roles', () => {

    describe('POST /clientes/insertarCliente', () => {
        it('ANTES: sin token retornaba 200 (versión vulnerable era pública)', async () => {
            // Con el fix retorna 401 — la ruta ya no es pública
            const res = await request(app).post('/clientes/insertarCliente').send({});
            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it('DESPUÉS: token con rol incorrecto retorna 403', async () => {
            const res = await request(app)
                .post('/clientes/insertarCliente')
                .set('Authorization', `Bearer ${clienteToken}`)
                .send({});
            expect(res.status).toBe(403);
        });

        it('DESPUÉS: token con rol admin retorna 200', async () => {
            const res = await request(app)
                .post('/clientes/insertarCliente')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({});
            expect(res.status).toBe(200);
        });
    });

    describe('DELETE /clientes/eliminarPersona', () => {
        it('ANTES: sin token retornaba 200 (versión vulnerable era pública)', async () => {
            const res = await request(app).delete('/clientes/eliminarPersona');
            expect(res.status).toBe(401);
        });

        it('DESPUÉS: admin puede eliminar', async () => {
            const res = await request(app)
                .delete('/clientes/eliminarPersona')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(200);
        });
    });

    describe('PUT /clientes/actualizarPersona', () => {
        it('ANTES: sin token retornaba 200 (versión vulnerable era pública)', async () => {
            const res = await request(app).put('/clientes/actualizarPersona').send({});
            expect(res.status).toBe(401);
        });
    });

    describe('POST /clases/crearClase', () => {
        it('ANTES: sin token retornaba 200 (versión vulnerable era pública)', async () => {
            const res = await request(app).post('/clases/crearClase').send({});
            expect(res.status).toBe(401);
        });

        it('DESPUÉS: admin puede crear clase', async () => {
            const res = await request(app)
                .post('/clases/crearClase')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({});
            expect(res.status).toBe(200);
        });
    });

    describe('DELETE /clases/eliminarClase', () => {
        it('ANTES: sin token retornaba 200 (versión vulnerable era pública)', async () => {
            const res = await request(app).delete('/clases/eliminarClase');
            expect(res.status).toBe(401);
        });
    });

    describe('GET /clientes/vistaClientes — ruta pública sin cambios', () => {
        it('DESPUÉS: GET sigue siendo accesible sin token', async () => {
            const res = await request(app).get('/clientes/vistaClientes');
            expect(res.status).toBe(200);
        });
    });
});
