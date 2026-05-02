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
const router = Router();

router.get('/cantidadSesionPorMes', cantidadSesionPorMes);
router.get('/distribucionGeneroPorEstado', distribucionGeneroPorEstado);
router.get('/promedioPorGrupoYCupos', promedioPorGrupoYCupos);
router.get('/vistaDetallesSesion', vistaDetallesSesion);
router.get('/cursorSesionesSinEntrenador', cursorSesionesSinEntrenador);
router.get('/vistaSesiones', vistaSesiones);
router.get("/obtenerInscritosPorSesion/:id_sesion_programada", obtenerInscritosPorSesion)
router.post('/crearSesion', crearSesion);
router.post('/inscribirClienteASesion', inscribirClienteASesion);
router.delete('/eliminarSesion', eliminarSesion);
router.delete('/desinscribirClienteDeSesion', desinscribirClienteDeSesion);

export default router;
