const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Crea el archivo de la base de datos en la raíz del backend
const dbPath = path.resolve(__dirname, '../../emi_laboratorios.db');
const db = new Database(dbPath, { verbose: console.log });

// Activar las llaves foráneas y WAL (como en tu script)
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

// Leer y ejecutar el esquema
const schemaPath = path.resolve(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

try {
  db.exec(schema);
  console.log('Base de datos inicializada correctamente con datos semilla.');
} catch (error) {
  console.error('Error al ejecutar el esquema:', error);
}

module.exports = db;