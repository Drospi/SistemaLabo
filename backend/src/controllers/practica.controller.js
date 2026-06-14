const db = require('../db/database');

const getPracticas = (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT P.id, P.titulo, P.materia, P.semestre, P.duracionHoras, P.estado,
             L.nombre as laboratorio, D.nombres || ' ' || D.apellidos as docente
      FROM PRACTICA P
      JOIN LABORATORIO L ON P.idLaboratorio = L.id
      JOIN DOCENTE D ON P.idDocente = D.id
      ORDER BY P.creadoEn DESC
    `);
    res.json(stmt.all());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const registrarPractica = (req, res) => {
  try {
    const { idLaboratorio, titulo, descripcion, materia, semestre, duracionHoras } = req.body;

    // 1. MOCK AUTH: Creamos un docente de prueba temporal
    db.prepare(`
      INSERT OR IGNORE INTO DOCENTE 
      (id, codigoSaga, nombres, apellidos, email, password, especialidad, grado) 
      VALUES (1, 'DOC-001', 'Docente', 'Ingeniería', 'docente@emi.edu.bo', '123456', 'Redes y Sistemas', 'Ing.')
    `).run();

    const idDocenteActivo = 1;

    // 2. Insertamos la práctica
    const stmt = db.prepare(`
      INSERT INTO PRACTICA 
      (idLaboratorio, idDocente, titulo, descripcion, materia, semestre, duracionHoras, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVA')
    `);
    
    const info = stmt.run(idLaboratorio, idDocenteActivo, titulo, descripcion, materia, semestre, duracionHoras || 2.0);
    
    res.status(201).json({ message: 'Práctica registrada exitosamente', id: info.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getPracticas, registrarPractica };