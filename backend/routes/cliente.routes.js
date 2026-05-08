import { Router } from "express";
  import {
    insertarCliente,
    eliminarPersona,
    actualizarPersona,
    vistaClientes,
    vistaClientesClase,
    vistaClientesSesion,
    vistaHistorialPagosClientes,
    rankingClientes,
    clientesMembresiaProximaAVencer
  } from "../controllers/cliente.controller.js";
import { requireRole } from "../middleware/auth.middleware.js";

const router = Router()

router.get('/vistaClientes', vistaClientes)
router.get('/vistaClientesClase', vistaClientesClase)
router.get('/vistaClientesSesion', vistaClientesSesion)
router.get('/rankingClientes', rankingClientes)
router.get('/clientesMembresiaProximaAVencer', clientesMembresiaProximaAVencer)
router.get('/vistaHistorialPagosClientes', vistaHistorialPagosClientes)
router.post('/insertarCliente', requireRole('admin'), insertarCliente)
router.put('/actualizarPersona', requireRole('admin'), actualizarPersona)
router.delete('/eliminarPersona', requireRole('admin'), eliminarPersona)


export default router