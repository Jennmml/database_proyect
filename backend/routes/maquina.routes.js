import Router from 'express';
import { requireRole } from "../middleware/auth.middleware.js";

import {
    agregarMaquina,
    nuevaRevisionMaquina,
    cursorMaquinaVencidas
} from "../controllers/maquina.controller.js";

const router = Router();

router.post("/agregarMaquina", requireRole('admin'), agregarMaquina);
router.post('/nuevaRevisionMaquina', requireRole('admin'), nuevaRevisionMaquina);
router.get('/cursorMaquinasVencidas', cursorMaquinaVencidas);

export default router;