import Router from 'express';

import{
    asignarEntrenadorASesionProgramada,
    vistaClienteSesionEntrenador,
    vistaSesionesSinEntrenador,
    vistaEntrenadorSesionesTotales
} from '../controllers/entrenador.controller.js';

const router = Router();

router.get('/vistaClienteSesionEntrenador', vistaClienteSesionEntrenador)
router.get('/vistaSesionesSinEntrenador', vistaSesionesSinEntrenador);
router.get('/vistaEntrenadorSesionesTotales', vistaEntrenadorSesionesTotales);
router.post('/asignarEntrenadorASesionProgramada', asignarEntrenadorASesionProgramada);

export default router