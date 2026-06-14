import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const ReservaList = () => {
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);

  const usuarioLogueado = JSON.parse(localStorage.getItem('usuarioEMI')) || {};
  const tienePermisosAdmin = usuarioLogueado.rol === 'ENCARGADO' || usuarioLogueado.rol === 'DOCENTE';
  // 1. Envolvemos la función en useCallback para memorizarla y estabilizar su referencia
  const cargarReservas = useCallback(async () => {
    try {
      const res = await api.get('/reservas');
      setReservas(res.data);
    } catch (error) {
      console.error("Error al cargar reservas:", error);
    } finally {
      setCargando(false);
    }
  }, []); // Dependencias vacías: la función no cambia nunca

  // 2. React ahora está feliz porque cargarReservas es una dependencia segura
  useEffect(() => {
    cargarReservas();
  }, [cargarReservas]);

  const cambiarEstado = async (id, nuevoEstado) => {
    if (!window.confirm(`¿Seguro que deseas marcar esta reserva como ${nuevoEstado}?`)) return;
    
    try {
      await api.put(`/reservas/${id}/estado`, { estado: nuevoEstado });
      cargarReservas(); // Volvemos a llamar a la función memorizada
    } catch (error) {
      alert("Error al actualizar: " + (error.response?.data?.error || error.message));
    }
  };

  if (cargando) return <div>Cargando panel de reservas...</div>;


  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ margin: 0, color: '#0f172a' }}>Gestión de Reservas</h2>
        <Link to="/reservas/nueva" style={{ backgroundColor: '#FFD700', color: '#003366', padding: '8px 16px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}>
          + Nueva Solicitud
        </Link>
      </div>

      {reservas.length === 0 ? (
        <p style={{ marginTop: '20px' }}>No hay reservas registradas en el sistema.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px', marginTop: '20px' }}>
          {reservas.map(reserva => (
            <div key={reserva.id} style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderLeft: `5px solid ${getColorEstado(reserva.estado)}` }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>{reserva.laboratorio}</h3>
              <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Fecha:</strong> {reserva.fecha}</p>
              <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Horario:</strong> {reserva.horaInicio} - {reserva.horaFin}</p>
              <p style={{ margin: '5px 0', fontSize: '14px', backgroundColor: '#f1f5f9', padding: '8px', borderRadius: '4px' }}>
                <strong>Motivo:</strong> {reserva.motivo}
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '12px', padding: '4px 8px', borderRadius: '4px', backgroundColor: `${getColorEstado(reserva.estado)}20`, color: getColorEstado(reserva.estado) }}>
                  {reserva.estado}
                </span>

                {/* Mostrar botones de acción solo si está PENDIENTE y ES ADMIN/DOCENTE */}
   {reserva.estado === 'PENDIENTE' && tienePermisosAdmin && (
     <div style={{ display: 'flex', gap: '8px' }}>
       <button onClick={() => cambiarEstado(reserva.id, 'APROBADA')} style={{ ...btnStyle, backgroundColor: '#16a34a', color: 'white' }}>
         Aprobar
       </button>
       <button onClick={() => cambiarEstado(reserva.id, 'RECHAZADA')} style={{ ...btnStyle, backgroundColor: '#dc2626', color: 'white' }}>
         Rechazar
       </button>
     </div>
   )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Función auxiliar para los colores de estado
const getColorEstado = (estado) => {
  switch(estado) {
    case 'PENDIENTE': return '#d97706'; // Naranja
    case 'APROBADA': return '#16a34a';  // Verde
    case 'RECHAZADA': return '#dc2626'; // Rojo
    case 'CANCELADA': return '#475569'; // Gris
    case 'EN_CURSO': return '#2563eb';  // Azul
    case 'COMPLETADA': return '#059669';// Verde oscuro
    default: return '#94a3b8';
  }
};

const btnStyle = { border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' };

export default ReservaList;