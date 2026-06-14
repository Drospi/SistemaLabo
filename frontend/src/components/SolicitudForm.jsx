import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const SolicitudForm = () => {
  const navigate = useNavigate();
  const [catalogo, setCatalogo] = useState([]);
  const [formData, setFormData] = useState({
    fechaNecesaria: '',
    observaciones: '',
  });
  const [materialesSeleccionados, setMaterialesSeleccionados] = useState([
    { idMaterial: '', cantidadSolicitada: 1 }
  ]);

  useEffect(() => {
    let montado = true;
    // Cargar catálogo de materiales disponibles
    const cargarCatalogo = async () => {
      try {
        const res = await api.get('/inventario/stock');
        if (montado) {
          setCatalogo(res.data);
          if (res.data.length > 0) {
            setMaterialesSeleccionados([{ idMaterial: res.data[0].id, cantidadSolicitada: 1 }]);
          }
        }
      } catch (error) {
        console.error("Error al cargar catálogo:", error);
      }
    };
    cargarCatalogo();
    return () => { montado = false; };
  }, []);

  const handleFormDataChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMaterialChange = (index, field, value) => {
    const nuevosMateriales = [...materialesSeleccionados];
    nuevosMateriales[index][field] = value;
    setMaterialesSeleccionados(nuevosMateriales);
  };

  const agregarFilaMaterial = () => {
    if (catalogo.length > 0) {
      setMaterialesSeleccionados([...materialesSeleccionados, { idMaterial: catalogo[0].id, cantidadSolicitada: 1 }]);
    }
  };

  const removerFilaMaterial = (index) => {
    const nuevosMateriales = [...materialesSeleccionados];
    nuevosMateriales.splice(index, 1);
    setMaterialesSeleccionados(nuevosMateriales);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/solicitudes', {
        ...formData,
        materiales: materialesSeleccionados
      });
      alert('¡Solicitud enviada a revisión!');
      navigate('/solicitudes');
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h2 style={{ borderBottom: '2px solid #FFD700', paddingBottom: '10px', color: '#003366', marginTop: 0 }}>
        Solicitar Material de Laboratorio
      </h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={labelStyle}>Fecha en que se necesita</label>
            <input type="date" name="fechaNecesaria" required value={formData.fechaNecesaria} onChange={handleFormDataChange} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Observaciones / Práctica Asociada</label>
            <input type="text" name="observaciones" placeholder="Ej: Para práctica de VLANs" value={formData.observaciones} onChange={handleFormDataChange} style={inputStyle} />
          </div>
        </div>

        <div style={{ marginTop: '15px' }}>
          <h3 style={{ fontSize: '16px', color: '#0f172a', marginBottom: '10px' }}>Materiales Requeridos</h3>
          
          {catalogo.length === 0 ? (
            <div style={{ padding: '15px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '4px', borderLeft: '4px solid #dc2626' }}>
              <strong>No hay consumibles disponibles en el inventario.</strong> <br/>
              No puedes realizar solicitudes hasta que se registre nuevo stock.
            </div>
          ) : (
            <>
              {materialesSeleccionados.map((item, index) => (
                <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                  <select 
                    value={item.idMaterial} 
                    onChange={(e) => handleMaterialChange(index, 'idMaterial', parseInt(e.target.value))} 
                    style={{ ...inputStyle, flex: 2 }}
                    required
                  >
                    {catalogo.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.nombre} (Disp: {cat.cantidadDisponible})</option>
                    ))}
                  </select>
                  
                  <input 
                    type="number" 
                    min="1" 
                    value={item.cantidadSolicitada} 
                    onChange={(e) => handleMaterialChange(index, 'cantidadSolicitada', parseInt(e.target.value))} 
                    style={{ ...inputStyle, flex: 1 }} 
                    required 
                  />
                  
                  {materialesSeleccionados.length > 1 && (
                    <button type="button" onClick={() => removerFilaMaterial(index)} style={{ backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer' }}>
                      X
                    </button>
                  )}
                </div>
              ))}
              
              <button type="button" onClick={agregarFilaMaterial} style={{ backgroundColor: '#f1f5f9', border: '1px dashed #cbd5e1', padding: '8px', width: '100%', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', color: '#475569' }}>
                + Agregar otro material
              </button>
            </>
          )}
        </div>

        {/* Deshabilitar el botón principal si no hay catálogo */}
        <button type="submit" disabled={catalogo.length === 0} style={{ 
          backgroundColor: catalogo.length === 0 ? '#94a3b8' : '#003366', 
          color: 'white', padding: '12px', border: 'none', borderRadius: '6px', 
          fontWeight: 'bold', cursor: catalogo.length === 0 ? 'not-allowed' : 'pointer', 
          marginTop: '15px' 
        }}>
          Enviar Solicitud
        </button>

      </form>
    </div>
  );
};

const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px', color: '#334155' };
const inputStyle = { padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' };

export default SolicitudForm;