import { Router } from "express";

import {
    renovar_membresia,
    clientesMembresiaVencida,
    registrarPagoMembresia,
    actualizarMembresia
} from "../controllers/membresias.controller.js";

const router = Router();

router.get('/clientesMembresiaVencida', clientesMembresiaVencida);
router.post('/registrarPagoMembresia', registrarPagoMembresia);
router.put('/renovarMembresia', renovar_membresia);
router.put('/actualizarMembresia', actualizarMembresia);

export default router;