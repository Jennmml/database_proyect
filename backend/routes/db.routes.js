import { Router } from "express";
import {conectToSqlServer, disconnectFromSqlServer} from '../controllers/db.Controller.js'


const router = Router()

router.post('/connect', conectToSqlServer)
router.post('/disconnect', disconnectFromSqlServer)

export default router