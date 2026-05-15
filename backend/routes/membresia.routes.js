import { Router } from "express";

import {
    renovar_membresia,
    obtenerMembresiasVencidas,
    registrarPagoMembresia,
    actualizarMembresia
} from "../controllers/membresias.controller.js";

const router = Router();

router.get('/clientesMembresiaVencida', obtenerMembresiasVencidas);
router.post('/registrarPagoMembresia', registrarPagoMembresia);
router.put('/renovarMembresia', renovar_membresia);
router.put('/actualizarMembresia', actualizarMembresia);

export default router;
