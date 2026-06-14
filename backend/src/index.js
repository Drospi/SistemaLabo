const express = require('express');
const cors = require('cors');
const db = require('./db/database'); // Inicializa la DB

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Importar rutas
const laboratoriosRoutes = require('./routes/laboratorios.routes');
app.use('/api/laboratorios', laboratoriosRoutes);

const inventarioRoutes = require('./routes/inventario.routes'); 
app.use('/api/inventario', inventarioRoutes);                

const reservasRoutes = require('./routes/reservas.routes');
app.use('/api/reservas', reservasRoutes);

const mantenimientoRoutes = require('./routes/mantenimiento.routes');
app.use('/api/mantenimiento', mantenimientoRoutes);

const practicasRoutes = require('./routes/practicas.routes');
app.use('/api/practicas', practicasRoutes);

const solicitudesRoutes = require('./routes/solicitudes.routes');
app.use('/api/solicitudes', solicitudesRoutes);

const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Servidor de laboratorios corriendo en http://localhost:${PORT}`);
});