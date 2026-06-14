import { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';

const InventarioList = () => {
  const [equipos, setEquipos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchEquipos = async () => {
      try {
        const respuesta = await api.get('/inventario/unitario');
        setEquipos(respuesta.data);
      } catch (error) {
        console.error("Error al cargar inventario:", error);
      } finally {
        setCargando(false);
      }
    };
    fetchEquipos();
  }, []);

  if (cargando) return <div>Cargando equipos...</div>;

  return (
    <div>
      <h2 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
        Inventario de Equipos
      </h2>

      <div style={{ marginBottom: '20px' }}>
  <Link to="/inventario/nuevo" style={{
    backgroundColor: '#FFD700',
    color: '#003366',
    padding: '8px 16px',
    borderRadius: '4px',
    textDecoration: 'none',
    fontWeight: 'bold',
    display: 'inline-block'
  }}>
    + Registrar Nuevo Equipo
  </Link>
</div>
      
      {equipos.length === 0 ? (
        <p>No hay equipos registrados en el sistema.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px', marginTop: '20px' }}>
          {equipos.map((equipo) => (
            <div key={equipo.id} style={{
              backgroundColor: 'white',
              borderLeft: '4px solid #003366',
              padding: '15px',
              borderRadius: '6px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>{equipo.nombre}</h3>
              <p style={{ margin: '3px 0', color: '#64748b' }}>{equipo.marca} {equipo.modelo}</p>
              <div style={{ marginTop: '10px', fontSize: '0.9rem' }}>
                <p style={{ margin: '3px 0' }}><strong>Cód:</strong> {equipo.codigoInventario}</p>
                <p style={{ margin: '3px 0' }}><strong>Ubicación:</strong> {equipo.laboratorio}</p>
              </div>
              <span style={{ 
                display: 'inline-block',
                marginTop: '10px',
                padding: '4px 8px', 
                borderRadius: '4px', 
                fontSize: '0.8rem',
                fontWeight: 'bold',
                backgroundColor: equipo.estado === 'DISPONIBLE' ? '#dcfce7' : '#fef08a',
                color: equipo.estado === 'DISPONIBLE' ? '#166534' : '#854d0e'
              }}>
                {equipo.estado}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InventarioList;