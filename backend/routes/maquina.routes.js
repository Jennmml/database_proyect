import Router from 'express';

import {
    agregarMaquina,
    nuevaRevisionMaquina,
    cursorMaquinaVencidas
} from "../controllers/maquina.controller.js";

const router = Router();

router.post("/agregarMaquina", agregarMaquina);
router.post('/nuevaRevisionMaquina', nuevaRevisionMaquina);
router.get('/cursorMaquinasVencidas', cursorMaquinaVencidas);

export default router;