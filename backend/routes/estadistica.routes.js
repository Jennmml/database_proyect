import { Router } from "express";

import {
    obtenerEstadisticasPorFecha
} from "../controllers/estadistica.controller.js";

const router = Router();

router.get("/obtenerEstadisticasPorFecha", obtenerEstadisticasPorFecha);

export default router;
