import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const MantenimientoList = () => {
  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargarRegistros = useCallback(async () => {
    try {
      const res = await api.get('/mantenimiento');
      setRegistros(res.data);
    } catch (error) {
      console.error("Error al cargar mantenimientos:", error);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarRegistros();
  }, [cargarRegistros]);

  // Nueva función para manejar el cierre del mantenimiento
  const resolverFalla = async (id, esReparado) => {
    const resultado = esReparado ? 'REPARADO' : 'IRREPARABLE';
    const confirmacion = window.confirm(`¿Confirmas que el diagnóstico final es: ${resultado}?`);
    
    if (!confirmacion) return;

    // Pedimos una observación opcional (muy útil en infraestructura de redes)
    const observaciones = window.prompt("Añade notas técnicas sobre la resolución (opcional):", "");
    if (observaciones === null) return; // Si cancela el prompt

    try {
      await api.put(`/mantenimiento/${id}/finalizar`, { resultado, observaciones });
      cargarRegistros(); // Recargar la tabla
      alert(`Hardware actualizado exitosamente a estado: ${esReparado ? 'DISPONIBLE' : 'DADO DE BAJA'}`);
    } catch (error) {
      alert("Error: " + (error.response?.data?.error || error.message));
    }
  };

  if (cargando) return <div>Cargando registros de mantenimiento...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ margin: 0, color: '#0f172a' }}>Control de Mantenimiento</h2>
        <Link to="/mantenimiento/nuevo" style={{ backgroundColor: '#FFD700', color: '#003366', padding: '8px 16px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}>
          + Reportar Falla
        </Link>
      </div>

      {registros.length === 0 ? (
        <p style={{ marginTop: '20px' }}>No hay equipos en mantenimiento actualmente.</p>
      ) : (
        <div style={{ overflowX: 'auto', marginTop: '20px' }}>
          <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <thead>
              <tr style={{ backgroundColor: '#003366', color: 'white', textAlign: 'left' }}>
                <th style={thStyle}>Código</th>
                <th style={thStyle}>Equipo</th>
                <th style={thStyle}>Diagnóstico / Falla</th>
                <th style={thStyle}>Estado</th>
                <th style={thStyle}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((reg) => (
                <tr key={reg.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={tdStyle}><strong>{reg.codigoInventario}</strong></td>
                  <td style={tdStyle}>{reg.equipo}</td>
                  <td style={tdStyle}>{reg.descripcionFalla}</td>
                  <td style={tdStyle}>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                      backgroundColor: reg.resultado === 'REPARADO' ? '#dcfce7' : reg.resultado === 'IRREPARABLE' ? '#fee2e2' : '#fef08a',
                      color: reg.resultado === 'REPARADO' ? '#166534' : reg.resultado === 'IRREPARABLE' ? '#991b1b' : '#854d0e'
                    }}>
                      {reg.resultado || 'PENDIENTE'}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    {/* Botones visibles solo si no se ha resuelto la falla */}
                    {reg.resultado === null || reg.resultado === 'PENDIENTE' ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => resolverFalla(reg.id, true)} style={{ ...btnStyle, backgroundColor: '#16a34a', color: 'white' }}>✔ Reparado</button>
                        <button onClick={() => resolverFalla(reg.id, false)} style={{ ...btnStyle, backgroundColor: '#475569', color: 'white' }}>✖ Baja</button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#64748b' }}>Cerrado</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const thStyle = { padding: '12px 15px', borderBottom: '2px solid #cbd5e1' };
const tdStyle = { padding: '12px 15px', color: '#334155' };
const btnStyle = { border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' };

export default MantenimientoList;