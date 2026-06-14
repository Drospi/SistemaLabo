import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const SolicitudList = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);

  const usuarioLogueado = JSON.parse(localStorage.getItem('usuarioEMI')) || {};
  const esEncargado = usuarioLogueado.rol === 'ENCARGADO';

  const cargarSolicitudes = useCallback(async () => {
    try {
      const res = await api.get('/solicitudes');
      setSolicitudes(res.data);
    } catch (error) {
      console.error("Error al cargar solicitudes:", error);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarSolicitudes();
  }, [cargarSolicitudes]);

  // Nueva función para cambiar el estado
  const cambiarEstado = async (id, nuevoEstado) => {
    if (!window.confirm(`¿Seguro que deseas pasar esta solicitud a estado: ${nuevoEstado}?`)) return;
    
    try {
      await api.put(`/solicitudes/${id}/estado`, { estado: nuevoEstado });
      cargarSolicitudes(); // Recargamos para ver los cambios
    } catch (error) {
      alert("Error al actualizar: " + (error.response?.data?.error || error.message));
    }
  };

  if (cargando) return <div>Cargando solicitudes de material...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ margin: 0, color: '#0f172a' }}>Préstamos y Solicitudes</h2>
        <Link to="/solicitudes/nueva" style={{ backgroundColor: '#FFD700', color: '#003366', padding: '8px 16px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}>
          + Pedir Material
        </Link>
      </div>

      {solicitudes.length === 0 ? (
        <p style={{ marginTop: '20px' }}>No hay solicitudes de material registradas.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '15px', marginTop: '20px' }}>
          {solicitudes.map((sol) => (
            <div key={sol.id} style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderLeft: `5px solid ${getColorEstado(sol.estado)}` }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <strong style={{ color: '#0f172a' }}>Solicitud #{sol.id}</strong>
                <span style={{ fontSize: '12px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '4px', backgroundColor: `${getColorEstado(sol.estado)}20`, color: getColorEstado(sol.estado) }}>
                  {sol.estado}
                </span>
              </div>
              
              <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Solicitante:</strong> {sol.estudiante || sol.docente}</p>
              <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Para fecha:</strong> {sol.fechaNecesaria}</p>
              <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Obs:</strong> {sol.observaciones || 'Ninguna'}</p>

              {/* Botones de Acción según el estado actual - SOLO ENCARGADO */}
   {esEncargado && (
     <div style={{ marginTop: '15px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
       
       {sol.estado === 'PENDIENTE' && (
         <>
           <button onClick={() => cambiarEstado(sol.id, 'APROBADA')} style={{ ...btnStyle, backgroundColor: '#0ea5e9' }}>Aprobar</button>
           <button onClick={() => cambiarEstado(sol.id, 'RECHAZADA')} style={{ ...btnStyle, backgroundColor: '#dc2626' }}>Rechazar</button>
         </>
       )}

       {sol.estado === 'APROBADA' && (
         <button onClick={() => cambiarEstado(sol.id, 'ENTREGADA')} style={{ ...btnStyle, backgroundColor: '#8b5cf6' }}>
           Marcar como Entregada
         </button>
       )}

       {sol.estado === 'ENTREGADA' && (
         <button onClick={() => cambiarEstado(sol.id, 'DEVUELTA')} style={{ ...btnStyle, backgroundColor: '#16a34a' }}>
           Recibir Devolución
         </button>
       )}
     </div>
   )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Función auxiliar para colorear la interfaz
const getColorEstado = (estado) => {
  switch(estado) {
    case 'PENDIENTE': return '#d97706'; // Naranja
    case 'APROBADA': return '#0ea5e9';  // Celeste
    case 'RECHAZADA': return '#dc2626'; // Rojo
    case 'ENTREGADA': return '#8b5cf6'; // Morado
    case 'DEVUELTA': return '#16a34a';  // Verde
    default: return '#94a3b8';
  }
};

const btnStyle = { border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', color: 'white', width: '100%' };

export default SolicitudList;