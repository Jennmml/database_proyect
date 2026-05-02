import Router from 'express';
import {
    vistaAdminMaquina,
    vistaRevisionMaquina
}from '../controllers/admin.controller.js';


const router = Router();

router.get('/vistaAdminMaquina', vistaAdminMaquina);
router.get('/vistaRevisionMaquina', vistaRevisionMaquina);

export default router;
