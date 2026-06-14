import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const PracticaList = () => {
  const [practicas, setPracticas] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargarPracticas = useCallback(async () => {
    try {
      const res = await api.get('/practicas');
      setPracticas(res.data);
    } catch (error) {
      console.error("Error al cargar prácticas:", error);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarPracticas();
  }, [cargarPracticas]);

  if (cargando) return <div>Cargando prácticas académicas...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ margin: 0, color: '#0f172a' }}>Guías de Práctica</h2>
        <Link to="/practicas/nueva" style={{ backgroundColor: '#FFD700', color: '#003366', padding: '8px 16px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}>
          + Nueva Práctica
        </Link>
      </div>

      {practicas.length === 0 ? (
        <p style={{ marginTop: '20px' }}>No hay prácticas registradas.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '15px', marginTop: '20px' }}>
          {practicas.map((prac) => (
            <div key={prac.id} style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderLeft: '4px solid #003366' }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>
                {prac.materia} - Semestre {prac.semestre}
              </span>
              <h3 style={{ margin: '5px 0 10px 0', fontSize: '1.1rem', color: '#0f172a' }}>{prac.titulo}</h3>
              <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Laboratorio:</strong> {prac.laboratorio}</p>
              <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Docente:</strong> {prac.docente}</p>
              <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Duración:</strong> {prac.duracionHoras} hrs</p>
              
              <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', backgroundColor: prac.estado === 'ACTIVA' ? '#dcfce7' : '#f1f5f9', color: prac.estado === 'ACTIVA' ? '#166534' : '#475569' }}>
                  {prac.estado}
                </span>
                <button style={{ border: '1px solid #cbd5e1', background: 'transparent', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                  Ver Detalles
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PracticaList;