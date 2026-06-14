import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const ReservaForm = () => {
  const navigate = useNavigate();
  const [laboratorios, setLaboratorios] = useState([]);
  const [formData, setFormData] = useState({
    idLaboratorio: '',
    fecha: '',
    horaInicio: '',
    horaFin: '',
    motivo: ''
  });

  // Cargar los laboratorios disponibles para el select
  useEffect(() => {
    api.get('/laboratorios').then(res => {
      setLaboratorios(res.data);
      if(res.data.length > 0) {
        setFormData(prev => ({ ...prev, idLaboratorio: res.data[0].id }));
      }
    });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reservas', formData);
      alert('¡Reserva enviada a estado PENDIENTE de aprobación!');
      navigate('/'); // Redirige al inicio por ahora
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h2 style={{ borderBottom: '2px solid #FFD700', paddingBottom: '10px', color: '#003366', marginTop: 0 }}>
        Solicitar Laboratorio
      </h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        <div>
          <label style={labelStyle}>Laboratorio a Reservar</label>
          <select name="idLaboratorio" value={formData.idLaboratorio} onChange={handleChange} style={inputStyle}>
            {laboratorios.map(lab => (
              <option key={lab.id} value={lab.id}>{lab.nombre} ({lab.ubicacion})</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          <div>
            <label style={labelStyle}>Fecha</label>
            <input type="date" name="fecha" required value={formData.fecha} onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Hora Inicio</label>
            <input type="time" name="horaInicio" required value={formData.horaInicio} onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Hora Fin</label>
            <input type="time" name="horaFin" required value={formData.horaFin} onChange={handleChange} style={inputStyle} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Motivo / Tema de la Práctica</label>
          <textarea 
            name="motivo" 
            required 
            rows="3"
            placeholder="Ej: Configuración de Router 4331 y EtherChannel L2..." 
            value={formData.motivo} 
            onChange={handleChange} 
            style={inputStyle} 
          />
        </div>

        <button type="submit" style={{
          backgroundColor: '#003366', color: 'white', padding: '12px', border: 'none',
          borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px'
        }}>
          Enviar Solicitud
        </button>
      </form>
    </div>
  );
};

const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' };
const inputStyle = { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontFamily: 'inherit' };

export default ReservaForm;