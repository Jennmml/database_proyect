import { Router } from "express";

import {
    crearClase,
    registarAsistencia,
    vistaTotalClasesPorSesion,
    eliminarClase
} from "../controllers/clase.controller.js";

const router = Router();

router.get('/vistaTotalClasesPorSesion', vistaTotalClasesPorSesion);
router.post('/registrarAsistencia', registarAsistencia);
router.post('/crearClase', crearClase);
router.delete('/eliminarClase', eliminarClase);

export default router;