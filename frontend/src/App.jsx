import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LaboratorioList from './components/LaboratorioList';
import InventarioList from './components/InventarioList';
import InventarioForm from './components/InventarioForm';
import ReservaForm from './components/ReservaForm';
import ReservaList from './components/ReservaList';
import MantenimientoList from './components/MantenimientoList';
import MantenimientoForm from './components/MantenimientoForm';
import InventarioStockList from './components/InventarioStockList';
import PracticaList from './components/PracticaList';
import PracticaForm from './components/PracticaForm';
import SolicitudList from './components/SolicitudList';
import SolicitudForm from './components/SolicitudForm';
import LoginForm from './components/LoginForm';
import InventarioStockForm from './components/InventarioStockForm';
// Importaremos el inventario en un momento

function App() {
  return (
    <Router>
      <div style={{ 
        maxWidth: '100%', 
        margin: '0 auto', 
        fontFamily: 'system-ui, sans-serif',
        backgroundColor: '#f4f4f9',
        minHeight: '100vh'
      }}>
        <Navbar />
        
        <main style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
          <Routes>
            <Route path="/" element={<LaboratorioList />} />
            <Route path="/inventario" element={<InventarioList />} />
            <Route path="/inventario/nuevo" element={<InventarioForm />} />
            <Route path="/reservas/nueva" element={<ReservaForm />} />
            <Route path="/reservas" element={<ReservaList />} />
            <Route path="/mantenimiento" element={<MantenimientoList />} />
            <Route path="/mantenimiento/nuevo" element={<MantenimientoForm />} />
            <Route path="/inventario/stock" element={<InventarioStockList />} />
            <Route path="/practicas" element={<PracticaList />} />
            <Route path="/practicas/nueva" element={<PracticaForm />} />
            <Route path="/solicitudes" element={<SolicitudList />} />
            <Route path="/solicitudes/nueva" element={<SolicitudForm />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/inventario/stock/nuevo" element={<InventarioStockForm />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;