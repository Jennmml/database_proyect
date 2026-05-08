import { Router } from "express";

import {
    crearClase,
    registarAsistencia,
    vistaTotalClasesPorSesion,
    eliminarClase
} from "../controllers/clase.controller.js";
import { requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.get('/vistaTotalClasesPorSesion', vistaTotalClasesPorSesion);
router.post('/registrarAsistencia', requireRole('admin'), registarAsistencia);
router.post('/crearClase', requireRole('admin'), crearClase);
router.delete('/eliminarClase', requireRole('admin'), eliminarClase);

export default router;