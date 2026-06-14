const db = require('../db/database');

const getInventarioUnitario = (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT I.id, I.codigoInventario, I.estado, M.nombre, M.marca, M.modelo, L.codigo as laboratorio
      FROM INVENTARIO_UNITARIO I
      JOIN MATERIAL M ON I.idMaterial = M.id
      JOIN LABORATORIO L ON I.idLaboratorio = L.id
    `);
    const inventario = stmt.all();
    res.json(inventario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Añade esta función en tu inventario.controller.js
const registrarEquipo = (req, res) => {
  try {
    const { idMaterial, idLaboratorio, numeroSerie, codigoInventario, estado } = req.body;
    
    const stmt = db.prepare(`
      INSERT INTO INVENTARIO_UNITARIO 
      (idMaterial, idLaboratorio, numeroSerie, codigoInventario, estado) 
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const info = stmt.run(
      idMaterial, 
      idLaboratorio, 
      numeroSerie || null, 
      codigoInventario, 
      estado || 'DISPONIBLE'
    );
    
    res.status(201).json({ 
      message: 'Equipo registrado exitosamente', 
      id: info.lastInsertRowid 
    });
  } catch (error) {
    // Si hay error de llave única (como el código de inventario repetido)
    res.status(400).json({ error: error.message });
  }
};

// Añade esta función a tu controlador
const getInventarioStock = (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT S.id, S.cantidadTotal, S.cantidadDisponible, S.cantidadDañada, S.ubicacionFisica,
             M.nombre, M.unidadMedida, M.codigo as codigoMaterial, L.nombre as laboratorio
      FROM INVENTARIO_STOCK S
      JOIN MATERIAL M ON S.idMaterial = M.id
      JOIN LABORATORIO L ON S.idLaboratorio = L.id
      ORDER BY L.nombre ASC, M.nombre ASC
    `);
    res.json(stmt.all());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Añade estas funciones a inventario.controller.js

// Obtener solo el catálogo de materiales que se manejan por cantidades
const getMaterialesStock = (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT id, codigo, nombre, unidadMedida 
      FROM MATERIAL 
      WHERE tipoGestion = 'STOCK' 
      ORDER BY nombre ASC
    `);
    res.json(stmt.all());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Registrar una nueva entrada de almacén
const registrarIngresoStock = (req, res) => {
  try {
    const { idMaterial, idLaboratorio, cantidad } = req.body;

    if (!cantidad || cantidad <= 0) {
      return res.status(400).json({ error: 'La cantidad a ingresar debe ser mayor a 0' });
    }

    // Insertar el stock o actualizarlo si ya existe esa combinación (idMaterial + idLaboratorio)
    const stmt = db.prepare(`
      INSERT INTO INVENTARIO_STOCK (idMaterial, idLaboratorio, cantidadTotal, cantidadDisponible)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(idMaterial, idLaboratorio) DO UPDATE SET
        cantidadTotal = cantidadTotal + excluded.cantidadTotal,
        cantidadDisponible = cantidadDisponible + excluded.cantidadDisponible,
        actualizadoEn = datetime('now', 'localtime')
    `);

    stmt.run(idMaterial, idLaboratorio, cantidad, cantidad);

    res.status(200).json({ message: 'Stock actualizado con éxito en el laboratorio' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Asegúrate de actualizar el export final:
module.exports = {
  getInventarioUnitario,
  registrarEquipo,
  getInventarioStock,
  getMaterialesStock,     // <-- Nuevo
  registrarIngresoStock   // <-- Nuevo
};