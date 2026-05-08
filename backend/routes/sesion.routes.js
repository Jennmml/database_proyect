import { Router } from "express";

import {
    crearSesion,
    inscribirClienteASesion,
    desinscribirClienteDeSesion,
    vistaSesiones,
    vistaDetallesSesion,
    cantidadSesionPorMes,
    distribucionGeneroPorEstado,
    promedioPorGrupoYCupos,
    cursorSesionesSinEntrenador,
    eliminarSesion,
    obtenerInscritosPorSesion
} from "../controllers/sesion.controller.js";
import { requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.get('/cantidadSesionPorMes', cantidadSesionPorMes);
router.get('/distribucionGeneroPorEstado', distribucionGeneroPorEstado);
router.get('/promedioPorGrupoYCupos', promedioPorGrupoYCupos);
router.get('/vistaDetallesSesion', vistaDetallesSesion);
router.get('/cursorSesionesSinEntrenador', cursorSesionesSinEntrenador);
router.get('/vistaSesiones', vistaSesiones);
router.get("/obtenerInscritosPorSesion/:id_sesion_programada", obtenerInscritosPorSesion)
router.post('/crearSesion', requireRole('admin'), crearSesion);
router.post('/inscribirClienteASesion', requireRole('admin'), inscribirClienteASesion);
router.delete('/eliminarSesion', requireRole('admin'), eliminarSesion);
router.delete('/desinscribirClienteDeSesion', requireRole('admin'), desinscribirClienteDeSesion);

export default router;
