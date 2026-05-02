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

const router = Router()

router.get('/vistaClientes', vistaClientes)
router.get('/vistaClientesClase', vistaClientesClase)
router.get('/vistaClientesSesion', vistaClientesSesion)
router.get('/rankingClientes', rankingClientes)
router.get('/clientesMembresiaProximaAVencer', clientesMembresiaProximaAVencer)
router.get('/vistaHistorialPagosClientes', vistaHistorialPagosClientes)
router.post('/insertarCliente', insertarCliente)
router.put('/actualizarPersona', actualizarPersona)
router.delete('/eliminarPersona', eliminarPersona)


export default router