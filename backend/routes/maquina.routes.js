import Router from 'express';
import { requireRole, authenticateToken } from "../middleware/auth.middleware.js";

import {
    agregarMaquina,
    nuevaRevisionMaquina,
    cursorMaquinaVencidas
} from "../controllers/maquina.controller.js";

const router = Router();

router.post("/agregarMaquina", authenticateToken, requireRole('admin'), agregarMaquina);
router.post('/nuevaRevisionMaquina', authenticateToken, requireRole('admin'), nuevaRevisionMaquina);
router.get('/cursorMaquinasVencidas', cursorMaquinaVencidas);

export default router;