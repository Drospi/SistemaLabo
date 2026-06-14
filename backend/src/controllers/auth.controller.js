const db = require('../db/database');
const bcrypt = require('bcryptjs');

const login = (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    // 0. CUENTA MAESTRA: ENCARGADO DE LABORATORIO
    if (email === 'encargado@emi.edu.bo' && password === '123456') {
      return res.json({ 
        message: 'Bienvenido Administrador', 
        usuario: { id: 0, nombres: 'Jefe de', apellidos: 'Laboratorios', email: email, rol: 'ENCARGADO' } 
      });
    }

    // 1. Buscar si es un DOCENTE
    let usuario = db.prepare(`SELECT id, nombres, apellidos, email, password, 'DOCENTE' as rol FROM DOCENTE WHERE email = ?`).get(email);

    // 2. Si no es docente, buscar si es ESTUDIANTE
    if (!usuario) {
      usuario = db.prepare(`SELECT id, nombres, apellidos, email, password, 'ESTUDIANTE' as rol FROM ESTUDIANTE WHERE email = ?`).get(email);
    }

    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // Verificar contraseña (soporta texto plano para pruebas y bcrypt para producción)
    const isMatch = (password === usuario.password) || bcrypt.compareSync(password, usuario.password);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    delete usuario.password;
    res.json({ message: 'Bienvenido al sistema', usuario });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { login };