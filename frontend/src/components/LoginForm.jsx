import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const LoginForm = () => {
  const navigate = useNavigate();
  const [credenciales, setCredenciales] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setCredenciales({ ...credenciales, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await api.post('/auth/login', credenciales);
      // Guardar sesión en el navegador
      localStorage.setItem('usuarioEMI', JSON.stringify(res.data.usuario));
      navigate('/'); // Redirigir al inicio
      window.location.reload(); // Recargar para actualizar el Navbar
    } catch (error) {
      setError(error.response?.data?.error || 'Error de conexión');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <div style={{ maxWidth: '400px', width: '100%', backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#003366', margin: 0 }}>SGL - EMI</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '5px' }}>Sistema Gestor de Laboratorios</p>
        </div>
        
        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '14px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={labelStyle}>Correo Institucional</label>
            <input 
              type="email" 
              name="email" 
              placeholder="ejemplo@emi.edu.bo" 
              value={credenciales.email} 
              onChange={handleChange} 
              style={inputStyle} 
              required 
            />
          </div>

          <div>
            <label style={labelStyle}>Contraseña</label>
            <input 
              type="password" 
              name="password" 
              value={credenciales.password} 
              onChange={handleChange} 
              style={inputStyle} 
              required 
            />
          </div>

          <button type="submit" style={{ backgroundColor: '#FFD700', color: '#003366', padding: '12px', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '10px' }}>
            Ingresar al Sistema
          </button>
        </form>
      </div>
    </div>
  );
};

const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px', color: '#334155' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' };

export default LoginForm;