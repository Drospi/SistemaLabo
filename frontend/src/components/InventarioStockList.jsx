import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';

const InventarioStockList = () => {
  const [stock, setStock] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargarStock = useCallback(async () => {
    try {
      const res = await api.get('/inventario/stock');
      setStock(res.data);
    } catch (error) {
      console.error("Error al cargar stock:", error);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarStock();
  }, [cargarStock]);

  if (cargando) return <div>Cargando inventario de consumibles...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ margin: 0, color: '#0f172a' }}>Inventario de Consumibles (Stock)</h2>
        <Link to="/inventario/stock/nuevo" style={{ backgroundColor: '#FFD700', color: '#003366', padding: '8px 16px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}>
  + Ingreso de Stock
</Link>
      </div>

      {stock.length === 0 ? (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8fafc', borderLeft: '4px solid #FFD700', borderRadius: '4px' }}>
          <p style={{ margin: 0, color: '#334155' }}>No hay registros de consumibles o fungibles en los laboratorios.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', marginTop: '20px' }}>
          <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <thead>
              <tr style={{ backgroundColor: '#003366', color: 'white', textAlign: 'left' }}>
                <th style={thStyle}>Laboratorio</th>
                <th style={thStyle}>Material</th>
                <th style={thStyle}>Ubicación Física</th>
                <th style={thStyle}>Disponible</th>
                <th style={thStyle}>Dañado</th>
                <th style={thStyle}>Total</th>
              </tr>
            </thead>
            <tbody>
              {stock.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={tdStyle}><strong>{item.laboratorio}</strong></td>
                  <td style={tdStyle}>
                    {item.nombre} <br/>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>{item.codigoMaterial}</span>
                  </td>
                  <td style={tdStyle}>{item.ubicacionFisica || 'No asignada'}</td>
                  <td style={tdStyle}>
                    <span style={{ fontWeight: 'bold', color: item.cantidadDisponible > 0 ? '#16a34a' : '#dc2626' }}>
                      {item.cantidadDisponible} {item.unidadMedida}
                    </span>
                  </td>
                  <td style={tdStyle}>{item.cantidadDañada} {item.unidadMedida}</td>
                  <td style={tdStyle}>{item.cantidadTotal} {item.unidadMedida}</td>
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

export default InventarioStockList;