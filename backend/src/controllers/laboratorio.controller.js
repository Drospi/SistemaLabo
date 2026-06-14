const db = require('../db/database');

// Obtener todos los laboratorios con el nombre de su tipo
const getLaboratorios = (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT L.id, L.codigo, L.nombre, L.ubicacion, L.estado, T.nombre as tipo 
      FROM LABORATORIO L
      JOIN TIPO_LABORATORIO T ON L.idTipoLaboratorio = T.id
    `);
    const laboratorios = stmt.all();
    res.json(laboratorios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener un laboratorio específico por ID
const getLaboratorioById = (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare(`SELECT * FROM LABORATORIO WHERE id = ?`);
    const laboratorio = stmt.get(id);
    
    if (!laboratorio) return res.status(404).json({ message: 'Laboratorio no encontrado' });
    
    res.json(laboratorio);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getLaboratorios,
  getLaboratorioById
};