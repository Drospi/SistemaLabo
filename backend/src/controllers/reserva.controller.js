const db = require('../db/database');

const getReservas = (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT R.id, R.fecha, R.horaInicio, R.horaFin, R.motivo, R.estado, L.nombre as laboratorio
      FROM RESERVA R
      JOIN LABORATORIO L ON R.idLaboratorio = L.id
      ORDER BY R.fecha DESC, R.horaInicio ASC
    `);
    res.json(stmt.all());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const crearReserva = (req, res) => {
  try {
    const { idLaboratorio, fecha, horaInicio, horaFin, motivo } = req.body;
    
    // Validar que la hora de inicio sea menor a la hora de fin
    if (horaInicio >= horaFin) {
      return res.status(400).json({ error: 'La hora de inicio debe ser anterior a la hora de fin.' });
    }

    // 1. SOLUCIÓN TEMPORAL (MOCK AUTH): 
    // Como aún no hay login, creamos un estudiante de prueba si no existe en la BD
    db.prepare(`
      INSERT OR IGNORE INTO ESTUDIANTE 
      (id, codigoSaga, nombres, apellidos, email, password, carrera, semestre) 
      VALUES (1, 'SAGA-001', 'Estudiante', 'Prueba', 'prueba@emi.edu.bo', '123456', 'Ingeniería', 5)
    `).run();

    // 2. Simulamos que el estudiante con ID 1 es quien está haciendo la solicitud
    const idEstudianteActivo = 1;

    // 3. Agregamos el idEstudiante al INSERT para cumplir con el CHECK constraint
    const stmt = db.prepare(`
      INSERT INTO RESERVA (idLaboratorio, idEstudiante, fecha, horaInicio, horaFin, motivo, estado)
      VALUES (?, ?, ?, ?, ?, ?, 'PENDIENTE')
    `);
    
    // Pasamos el idEstudianteActivo como segundo parámetro
    const info = stmt.run(idLaboratorio, idEstudianteActivo, fecha, horaInicio, horaFin, motivo);
    
    res.status(201).json({ message: 'Reserva solicitada exitosamente', id: info.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const actualizarEstadoReserva = (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    const estadosValidos = ['PENDIENTE', 'APROBADA', 'RECHAZADA', 'CANCELADA', 'EN_CURSO', 'COMPLETADA'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: 'Estado no válido' });
    }

    // 👇 Aquí está la corrección: quitamos actualizadoEn
    const stmt = db.prepare(`
      UPDATE RESERVA 
      SET estado = ? 
      WHERE id = ?
    `);
    
    const info = stmt.run(estado, id);
    
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    res.json({ message: `Reserva ${estado.toLowerCase()} exitosamente` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// No olvides exportar la nueva función junto con las demás:
module.exports = { 
  getReservas, 
  crearReserva, 
  actualizarEstadoReserva 
};