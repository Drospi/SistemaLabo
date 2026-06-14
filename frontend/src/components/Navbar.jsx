import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const usuarioLogueado = JSON.parse(localStorage.getItem('usuarioEMI'));

  const handleLogout = () => {
    localStorage.removeItem('usuarioEMI');
    navigate('/login');
  };

  // Extraemos el rol de forma segura
  const rol = usuarioLogueado?.rol;

  return (
    <nav style={{ backgroundColor: '#003366', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '4px solid #FFD700', color: 'white', flexWrap: 'wrap', gap: '15px' }}>
      <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>EMI Labs</div>
      
      {usuarioLogueado ? (
        <>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>Laboratorios</Link>
            
            {/* Solo el ENCARGADO ve el inventario completo y mantenimiento */}
            {rol === 'ENCARGADO' && (
              <>
                <Link to="/inventario" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>Equipos</Link>
                <Link to="/inventario/stock" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>Consumibles</Link>
                <Link to="/mantenimiento" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>Mantenimiento</Link>
              </>
            )}

            <Link to="/reservas" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>Reservas</Link>
            
            {/* Docentes y Encargados ven Prácticas */}
            {(rol === 'DOCENTE' || rol === 'ENCARGADO') && (
              <Link to="/practicas" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>Prácticas</Link>
            )}

            <Link to="/solicitudes" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>Préstamos</Link>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ fontSize: '14px', textAlign: 'right' }}>
              <span style={{ display: 'block', fontWeight: 'bold' }}>{usuarioLogueado.nombres}</span>
              <span style={{ fontSize: '11px', color: '#FFD700' }}>{rol}</span>
            </div>
            <button onClick={handleLogout} style={{ backgroundColor: 'transparent', border: '1px solid white', color: 'white', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
              Salir
            </button>
          </div>
        </>
      ) : (
        <Link to="/login" style={{ color: '#FFD700', textDecoration: 'none', fontWeight: 'bold' }}>Iniciar Sesión</Link>
      )}
    </nav>
  );
};

export default Navbar;