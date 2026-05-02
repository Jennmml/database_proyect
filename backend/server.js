import express from 'express';
import cors from 'cors';

import helperRoutes from './routes/helper.routes.js'
import dbRoutes from './routes/db.routes.js'
import clienteRoutes from './routes/cliente.routes.js'
import adminRoutes from './routes/admin.routes.js'
import membresiaRoutes from './routes/membresia.routes.js'
import sesionRoutes from './routes/sesion.routes.js'
import claseRoutes from './routes/clase.routes.js'
import estadisticaRoutes from './routes/estadistica.routes.js'
import maquinaRoutes from './routes/maquina.routes.js'
import entrenadorRoutes from './routes/entrenador.routes.js';

const app = express();
const port = 3100;

app.use(cors());
app.use(express.json());

app.use('/consultas', helperRoutes);
app.use('/connection', dbRoutes)
app.use('/clientes', clienteRoutes)
app.use('/admin', adminRoutes)
app.use('/membresias', membresiaRoutes)
app.use('/sesiones', sesionRoutes)
app.use('/clases', claseRoutes)
app.use('/estadisticas', estadisticaRoutes)
app.use('/maquinas', maquinaRoutes)
app.use('/entrenadores', entrenadorRoutes);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});