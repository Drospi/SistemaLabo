import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const InventarioStockForm = () => {
  const navigate = useNavigate();
  const [laboratorios, setLaboratorios] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [unidadActual, setUnidadActual] = useState('');
  
  const [formData, setFormData] = useState({
    idMaterial: '',
    idLaboratorio: '',
    cantidad: ''
  });

  useEffect(() => {
    let montado = true;
    const cargarDatos = async () => {
      try {
        const [resLabs, resMats] = await Promise.all([
          api.get('/laboratorios'),
          api.get('/inventario/materiales-stock')
        ]);
        
        if (montado) {
          setLaboratorios(resLabs.data);
          setMateriales(resMats.data);
          
          if (resLabs.data.length > 0 && resMats.data.length > 0) {
            setFormData({
              idLaboratorio: resLabs.data[0].id,
              idMaterial: resMats.data[0].id,
              cantidad: 1
            });
            setUnidadActual(resMats.data[0].unidadMedida);
          }
        }
      } catch (error) {
        console.error("Error al cargar dependencias:", error);
      }
    };
    cargarDatos();
    return () => { montado = false; };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Si cambia el material, actualizamos la etiqueta de la unidad de medida (Ej: METROS, UNIDADES)
    if (name === 'idMaterial') {
      const matSeleccionado = materiales.find(m => m.id === parseInt(value));
      if (matSeleccionado) setUnidadActual(matSeleccionado.unidadMedida);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inventario/stock/ingreso', formData);
      alert('¡Ingreso de stock registrado correctamente!');
      navigate('/inventario/stock'); 
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h2 style={{ borderBottom: '2px solid #FFD700', paddingBottom: '10px', color: '#003366', marginTop: 0 }}>
        Registrar Ingreso de Consumibles
      </h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        <div>
          <label style={labelStyle}>Laboratorio de Destino</label>
          <select name="idLaboratorio" value={formData.idLaboratorio} onChange={handleChange} style={inputStyle} required>
            {laboratorios.map(lab => (
              <option key={lab.id} value={lab.id}>{lab.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Material / Insumo</label>
          <select name="idMaterial" value={formData.idMaterial} onChange={handleChange} style={inputStyle} required>
            {materiales.map(mat => (
              <option key={mat.id} value={mat.id}>{mat.nombre} ({mat.codigo})</option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Cantidad a Ingresar ({unidadActual})</label>
          <input 
            type="number" 
            name="cantidad" 
            min="1" 
            required 
            value={formData.cantidad} 
            onChange={handleChange} 
            style={inputStyle} 
          />
        </div>

        <button type="submit" style={{ backgroundColor: '#003366', color: 'white', padding: '12px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
          Sumar al Inventario
        </button>
      </form>
    </div>
  );
};

const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px', color: '#334155' };
const inputStyle = { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '15px' };

export default InventarioStockForm;