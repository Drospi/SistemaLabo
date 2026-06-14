const db = require('../db/database');

const getSolicitudes = (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT S.id, S.fechaSolicitud, S.fechaNecesaria, S.estado, S.observaciones,
             E.nombres || ' ' || E.apellidos as estudiante,
             D.nombres || ' ' || D.apellidos as docente
      FROM SOLICITUD_MATERIAL S
      LEFT JOIN ESTUDIANTE E ON S.idEstudiante = E.id
      LEFT JOIN DOCENTE D ON S.idDocente = D.id
      ORDER BY S.fechaSolicitud DESC
    `);
    res.json(stmt.all());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const registrarSolicitud = (req, res) => {
  try {
    const { fechaNecesaria, observaciones, materiales } = req.body;
    // materiales debe ser un array: [{ idMaterial: 1, cantidadSolicitada: 2 }, ...]

    if (!materiales || materiales.length === 0) {
      return res.status(400).json({ error: 'Debe incluir al menos un material en la solicitud.' });
    }

    // Usaremos el ID del estudiante de prueba que creamos en fases anteriores
    const idEstudianteActivo = 1;

    const transaction = db.transaction(() => {
      // 1. Insertar la cabecera de la solicitud
      const stmtCabecera = db.prepare(`
        INSERT INTO SOLICITUD_MATERIAL (idEstudiante, fechaNecesaria, observaciones, estado)
        VALUES (?, ?, ?, 'PENDIENTE')
      `);
      const info = stmtCabecera.run(idEstudianteActivo, fechaNecesaria, observaciones);
      const idSolicitud = info.lastInsertRowid;

      // 2. Insertar los detalles iterando sobre el array de materiales
      const stmtDetalle = db.prepare(`
        INSERT INTO SOLICITUD_MATERIAL_DETALLE (idSolicitud, idMaterial, cantidadSolicitada, estadoDevolucion)
        VALUES (?, ?, ?, 'PENDIENTE')
      `);

      for (const mat of materiales) {
        stmtDetalle.run(idSolicitud, mat.idMaterial, mat.cantidadSolicitada);
      }

      return idSolicitud;
    });

    const nuevaSolicitud = transaction();
    res.status(201).json({ message: 'Solicitud de materiales registrada con éxito', id: nuevaSolicitud });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Añade esta función a solicitud.controller.js
const actualizarEstadoSolicitud = (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    // Validamos contra los estados definidos en tu CHECK constraint
    const estadosValidos = ['PENDIENTE', 'APROBADA', 'RECHAZADA', 'ENTREGADA', 'DEVUELTA'];
    
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: 'Estado no válido' });
    }

    const stmt = db.prepare(`
      UPDATE SOLICITUD_MATERIAL 
      SET estado = ? 
      WHERE id = ?
    `);
    
    const info = stmt.run(estado, id);
    
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    res.json({ message: `Solicitud actualizada a ${estado} exitosamente` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// No olvides actualizar tu module.exports:
module.exports = { 
  getSolicitudes, 
  registrarSolicitud, 
  actualizarEstadoSolicitud 
};