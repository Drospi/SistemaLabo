import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const PracticaForm = () => {
  const navigate = useNavigate();
  const [laboratorios, setLaboratorios] = useState([]);
  const [formData, setFormData] = useState({
    idLaboratorio: '',
    titulo: '',
    descripcion: '',
    materia: '',
    semestre: 5,
    duracionHoras: 2.0
  });

  useEffect(() => {
    let montado = true;
    const cargarLaboratorios = async () => {
      try {
        const res = await api.get('/laboratorios');
        if (montado && res.data.length > 0) {
          setLaboratorios(res.data);
          setFormData(prev => ({ ...prev, idLaboratorio: res.data[0].id }));
        }
      } catch (error) {
        console.error("Error al cargar laboratorios:", error);
      }
    };
    cargarLaboratorios();
    return () => { montado = false; };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/practicas', formData);
      alert('¡Guía de práctica registrada exitosamente!');
      navigate('/practicas');
    } catch (error) {
      alert('Error al registrar: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h2 style={{ borderBottom: '2px solid #FFD700', paddingBottom: '10px', color: '#003366', marginTop: 0 }}>
        Registrar Guía de Práctica
      </h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        <div>
          <label style={labelStyle}>Laboratorio Asignado</label>
          <select name="idLaboratorio" value={formData.idLaboratorio} onChange={handleChange} style={inputStyle} required>
            {laboratorios.map(lab => (
              <option key={lab.id} value={lab.id}>{lab.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Materia</label>
          <input type="text" name="materia" required placeholder="Ej: Redes Avanzadas I" value={formData.materia} onChange={handleChange} style={inputStyle} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={labelStyle}>Semestre</label>
            <input type="number" min="1" max="10" name="semestre" required value={formData.semestre} onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Duración (Horas)</label>
            <input type="number" step="0.5" name="duracionHoras" required value={formData.duracionHoras} onChange={handleChange} style={inputStyle} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Título de la Práctica</label>
          <input type="text" name="titulo" required placeholder="Ej: Implementación de EtherChannel L2/L3" value={formData.titulo} onChange={handleChange} style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>Descripción / Objetivos</label>
          <textarea name="descripcion" rows="3" placeholder="Ej: Configuración de enlaces troncales utilizando switches Catalyst y enrutamiento inter-VLAN en Router 4331." value={formData.descripcion} onChange={handleChange} style={inputStyle} />
        </div>

        <button type="submit" style={{ backgroundColor: '#003366', color: 'white', padding: '12px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
          Guardar Práctica Académica
        </button>
      </form>
    </div>
  );
};

const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px', color: '#334155' };
const inputStyle = { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontFamily: 'inherit' };

export default PracticaForm;