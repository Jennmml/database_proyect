import request from 'supertest';
import express from 'express';
import maquinaRoutes from '../../backend/routes/maquina.routes.js';

// Mock del controlador para evitar hacer querys reales a la BD durante la prueba de roles
jest.mock('../../backend/controllers/maquina.controller.js', () => ({
    agregarMaquina: (req, res) => res.status(200).json({ success: true, message: 'Máquina agregada' }),
    nuevaRevisionMaquina: (req, res) => res.status(200).json({ success: true, message: 'Revisión agregada' }),
    cursorMaquinaVencidas: (req, res) => res.status(200).json({ success: true, data: [] })
}));

const app = express();
app.use(express.json());
app.use('/maquinas', maquinaRoutes);

describe('Control de Acceso (RBAC) - Rutas de Máquinas [A-03, CWE-862]', () => {
    
    describe('POST /maquinas/agregarMaquina', () => {
        it('debe rechazar la petición (401) si no se proporciona ningún rol de usuario', async () => {
            const response = await request(app)
                .post('/maquinas/agregarMaquina')
                .send({
                    nombre: 'Cinta de correr',
                    descripcion: 'Cinta de correr profesional',
                    fecha_compra: '2026-01-01',
                    id_estado: 1
                });
            
            // En la versión vulnerable esto retornaba 200 o un error SQL por fallar la DB (no autenticación).
            // Con el fix, retorna 401
            expect(response.status).toBe(401);
            expect(response.body.message).toMatch(/No autorizado/i);
        });

        it('debe rechazar la petición (403) si se usa un rol que no es admin', async () => {
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

        it('debe permitir la petición (200) si se proporciona el rol admin', async () => {
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

    describe('POST /maquinas/nuevaRevisionMaquina', () => {
        it('debe rechazar la petición (401) si no se proporciona ningún rol de usuario', async () => {
            const response = await request(app)
                .post('/maquinas/nuevaRevisionMaquina')
                .send({ id_maquina: 1, fecha_revision: '2026-05-01' });
            
            expect(response.status).toBe(401);
        });

        it('debe permitir la petición (200) si se proporciona el rol admin', async () => {
            const response = await request(app)
                .post('/maquinas/nuevaRevisionMaquina')
                .set('x-user-role', 'admin')
                .send({ id_maquina: 1, fecha_revision: '2026-05-01' });
            
            expect(response.status).toBe(200);
        });
    });
    
    // El endpoint GET no es destructivo, verificar que sigue funcionando sin auth si es público, 
    // o asumiendo que debe requerir autenticación general, esto variará según el requerimiento exacto.
});
