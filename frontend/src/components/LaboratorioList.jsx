import { useState, useEffect } from 'react';
import api from '../services/api';


const LaboratorioList = () => {
  const [laboratorios, setLaboratorios] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchLaboratorios = async () => {
      try {
        const respuesta = await api.get('/laboratorios');
        setLaboratorios(respuesta.data);
      } catch (error) {
        console.error("Error al cargar laboratorios:", error);
      } finally {
        setCargando(false);
      }
    };

    fetchLaboratorios();
  }, []);

  if (cargando) return <div>Cargando infraestructura...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
        Infraestructura de Laboratorios
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {laboratorios.map((lab) => (
          <div key={lab.id} style={{ 
            border: '1px solid #cbd5e1', 
            borderRadius: '8px', 
            padding: '15px',
            backgroundColor: '#f8fafc'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#0f172a' }}>{lab.nombre}</h3>
            <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Código:</strong> {lab.codigo}</p>
            <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Ubicación:</strong> {lab.ubicacion}</p>
            <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Área:</strong> {lab.tipo}</p>
            
            <span style={{ 
              display: 'inline-block',
              marginTop: '10px',
              padding: '4px 8px', 
              borderRadius: '12px', 
              fontSize: '12px',
              backgroundColor: lab.estado === 'OPERATIVO' ? '#dcfce7' : '#fee2e2',
              color: lab.estado === 'OPERATIVO' ? '#166534' : '#991b1b'
            }}>
              {lab.estado}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LaboratorioList;