import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const InventarioForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    idMaterial: 1, // Por defecto: 1 = Router Cisco ISR 
    idLaboratorio: 1, // Por defecto: 1 = LAB-RED-01
    codigoInventario: '',
    numeroSerie: '',
    estado: 'DISPONIBLE'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inventario/unitario', formData);
      alert('¡Equipo registrado correctamente!');
      navigate('/inventario'); // Redirige a la lista después de guardar
    } catch (error) {
      alert('Error al registrar: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h2 style={{ borderBottom: '2px solid #FFD700', paddingBottom: '10px', color: '#003366', marginTop: 0 }}>
        Registrar Nuevo Equipo
      </h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Tipo de Material</label>
          <select name="idMaterial" value={formData.idMaterial} onChange={handleChange} style={inputStyle}>
            <option value={1}>Router Cisco ISR (Redes)</option>
            <option value={2}>Switch Cisco Catalyst (Redes)</option>
            <option value={11}>Computadora de Escritorio (Sistemas)</option>
            <option value={38}>Osciloscopio Digital (Electrónica)</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Laboratorio Asignado</label>
          <select name="idLaboratorio" value={formData.idLaboratorio} onChange={handleChange} style={inputStyle}>
            <option value={1}>LAB-RED-01 (Laboratorio de Redes I)</option>
            <option value={3}>LAB-SIS-01 (Laboratorio de Sistemas I)</option>
            <option value={9}>LAB-ELE-01 (Laboratorio de Electrónica I)</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Código de Inventario Institucional</label>
          <input 
            type="text" 
            name="codigoInventario" 
            required 
            placeholder="Ej: EMI-RED-RT4331-001" 
            value={formData.codigoInventario} 
            onChange={handleChange} 
            style={inputStyle} 
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Número de Serie (Fabricante)</label>
          <input 
            type="text" 
            name="numeroSerie" 
            placeholder="Ej: FGL213400X" 
            value={formData.numeroSerie} 
            onChange={handleChange} 
            style={inputStyle} 
          />
        </div>

        <button type="submit" style={{
          backgroundColor: '#003366',
          color: 'white',
          padding: '12px',
          border: 'none',
          borderRadius: '6px',
          fontWeight: 'bold',
          cursor: 'pointer',
          marginTop: '10px',
          transition: 'background-color 0.3s'
        }}>
          Guardar Equipo
        </button>
      </form>
    </div>
  );
};

// Objeto de estilos reutilizable para los inputs
const inputStyle = {
  width: '100%',
  padding: '10px',
  borderRadius: '4px',
  border: '1px solid #cbd5e1',
  boxSizing: 'border-box',
  fontSize: '15px'
};

export default InventarioForm;