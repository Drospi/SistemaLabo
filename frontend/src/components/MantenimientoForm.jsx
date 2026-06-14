import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const MantenimientoForm = () => {
  const navigate = useNavigate();
  const [equipos, setEquipos] = useState([]);
  const [formData, setFormData] = useState({
    idInventarioUnitario: '',
    tipo: 'CORRECTIVO',
    descripcionFalla: '',
    responsable: ''
  });

  useEffect(() => {
    let montado = true;

    const cargarEquipos = async () => {
      try {
        const res = await api.get('/inventario/unitario');
        if (montado) {
          // Filtramos para mostrar solo equipos que no estén ya en mantenimiento o dados de baja
          const equiposDisponibles = res.data.filter(eq => 
            eq.estado === 'DISPONIBLE' || eq.estado === 'DETERIORADO' || eq.estado === 'EN_USO'
          );
          setEquipos(equiposDisponibles);
          
          if (equiposDisponibles.length > 0) {
            setFormData(prev => ({ ...prev, idInventarioUnitario: equiposDisponibles[0].id }));
          }
        }
      } catch (error) {
        console.error("Error al cargar equipos:", error);
      }
    };

    cargarEquipos();
    return () => { montado = false; };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/mantenimiento', formData);
      alert('¡Falla reportada! El equipo ha sido marcado EN MANTENIMIENTO.');
      navigate('/mantenimiento'); 
    } catch (error) {
      alert('Error al registrar: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h2 style={{ borderBottom: '2px solid #FFD700', paddingBottom: '10px', color: '#003366', marginTop: 0 }}>
        Reportar Falla de Equipo
      </h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        
        <div>
          <label style={labelStyle}>Equipo Afectado</label>
          <select name="idInventarioUnitario" value={formData.idInventarioUnitario} onChange={handleChange} style={inputStyle} required>
            {equipos.length === 0 && <option value="">No hay equipos disponibles para reportar</option>}
            {equipos.map(eq => (
              <option key={eq.id} value={eq.id}>
                {eq.codigoInventario} - {eq.nombre} ({eq.laboratorio})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Tipo de Mantenimiento Requerido</label>
          <select name="tipo" value={formData.tipo} onChange={handleChange} style={inputStyle}>
            <option value="PREVENTIVO">Preventivo (Limpieza, actualización, revisión)</option>
            <option value="CORRECTIVO">Correctivo (Reparación de falla confirmada)</option>
            <option value="EMERGENCIA">Emergencia (Falla crítica que detiene el laboratorio)</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>Técnico / Responsable Asignado</label>
          <input 
            type="text" 
            name="responsable" 
            required 
            placeholder="Ej: Ing. Sistemas / Soporte Técnico Externo" 
            value={formData.responsable} 
            onChange={handleChange} 
            style={inputStyle} 
          />
        </div>

        <div>
          <label style={labelStyle}>Descripción Detallada de la Falla</label>
          <textarea 
            name="descripcionFalla" 
            required 
            rows="4"
            placeholder="Ej: El router no enciende. El puerto GigabitEthernet0/0/0 no da link..." 
            value={formData.descripcionFalla} 
            onChange={handleChange} 
            style={inputStyle} 
          />
        </div>

        <button type="submit" disabled={equipos.length === 0} style={{
          backgroundColor: equipos.length === 0 ? '#94a3b8' : '#003366', 
          color: 'white', 
          padding: '12px', 
          border: 'none',
          borderRadius: '6px', 
          fontWeight: 'bold', 
          cursor: equipos.length === 0 ? 'not-allowed' : 'pointer', 
          marginTop: '10px'
        }}>
          Registrar Mantenimiento
        </button>
      </form>
    </div>
  );
};

// Estilos reutilizables
const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px', color: '#334155' };
const inputStyle = { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: '15px' };

export default MantenimientoForm;