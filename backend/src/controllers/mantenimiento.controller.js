const db = require('../db/database');

const getMantenimientos = (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT M.id, M.tipo, M.descripcionFalla, M.responsable, M.fechaInicio, M.estadoAnterior, M.resultado, 
             I.codigoInventario, MAT.nombre as equipo
      FROM MANTENIMIENTO M
      JOIN INVENTARIO_UNITARIO I ON M.idInventarioUnitario = I.id
      JOIN MATERIAL MAT ON I.idMaterial = MAT.id
      ORDER BY M.fechaInicio DESC
    `);
    res.json(stmt.all());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const registrarMantenimiento = (req, res) => {
  try {
    const { idInventarioUnitario, tipo, descripcionFalla, responsable } = req.body;
    
    // 1. Obtener el estado actual del equipo para guardarlo en el historial
    const stmtEquipo = db.prepare(`SELECT estado FROM INVENTARIO_UNITARIO WHERE id = ?`);
    const equipo = stmtEquipo.get(idInventarioUnitario);
    
    if (!equipo) {
      return res.status(404).json({ error: 'Equipo no encontrado en el inventario' });
    }

    // Usaremos una transacción para asegurar que ambos cambios ocurran correctamente
    const transaction = db.transaction(() => {
      // 2. Insertar el registro de mantenimiento
      const stmtInsert = db.prepare(`
        INSERT INTO MANTENIMIENTO (idInventarioUnitario, tipo, descripcionFalla, responsable, estadoAnterior, resultado)
        VALUES (?, ?, ?, ?, ?, 'PENDIENTE')
      `);
      const info = stmtInsert.run(idInventarioUnitario, tipo, descripcionFalla, responsable, equipo.estado);
      
      // 3. Actualizar el estado del equipo en el inventario
      const stmtUpdate = db.prepare(`
        UPDATE INVENTARIO_UNITARIO 
        SET estado = 'MANTENIMIENTO', actualizadoEn = datetime('now','localtime')
        WHERE id = ?
      `);
      stmtUpdate.run(idInventarioUnitario);
      
      return info.lastInsertRowid;
    });

    const nuevoId = transaction();
    res.status(201).json({ message: 'Mantenimiento registrado y equipo inhabilitado', id: nuevoId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const finalizarMantenimiento = (req, res) => {
  try {
    const { id } = req.params;
    const { resultado, observaciones } = req.body; 

    // Validar entradas
    if (!['REPARADO', 'IRREPARABLE'].includes(resultado)) {
      return res.status(400).json({ error: 'El resultado debe ser REPARADO o IRREPARABLE' });
    }

    // Obtener qué equipo está asociado a este mantenimiento
    const stmtMant = db.prepare(`SELECT idInventarioUnitario FROM MANTENIMIENTO WHERE id = ?`);
    const mant = stmtMant.get(id);

    if (!mant) {
      return res.status(404).json({ error: 'Registro de mantenimiento no encontrado' });
    }

    // Definir el nuevo estado del hardware según el resultado
    const nuevoEstadoEquipo = resultado === 'REPARADO' ? 'DISPONIBLE' : 'DADO_DE_BAJA';

    // Usar transacción para mantener la consistencia
    const transaction = db.transaction(() => {
      // 1. Cerrar la orden de mantenimiento
      db.prepare(`
        UPDATE MANTENIMIENTO 
        SET resultado = ?, observaciones = ?, fechaFin = datetime('now','localtime')
        WHERE id = ?
      `).run(resultado, observaciones || null, id);

      // 2. Actualizar el inventario
      db.prepare(`
        UPDATE INVENTARIO_UNITARIO 
        SET estado = ?, actualizadoEn = datetime('now','localtime')
        WHERE id = ?
      `).run(nuevoEstadoEquipo, mant.idInventarioUnitario);
    });

    transaction();
    res.json({ message: `Mantenimiento cerrado. Hardware marcado como: ${nuevoEstadoEquipo}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Asegúrate de exportar la nueva función:
module.exports = { 
  getMantenimientos, 
  registrarMantenimiento, 
  finalizarMantenimiento 
};