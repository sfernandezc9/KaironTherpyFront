import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import PacientesList from './pages/Pacientes/PacientesList';
import PacienteDetail from './pages/Pacientes/PacienteDetail';
import TerapeutasList from './pages/Terapeutas/TerapeutasList';
import TerapeutaDetail from './pages/Terapeutas/TerapeutaDetail';
import SesionesList from './pages/Sesiones/SesionesList';
import InsumosPage from './pages/Insumos/InsumosPage';
import EstructuraPage from './pages/Estructura/EstructuraPage';
import InformesPage from './pages/Informes/InformesPage';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/pacientes" element={<PacientesList />} />
        <Route path="/pacientes/:id" element={<PacienteDetail />} />
        <Route path="/terapeutas" element={<TerapeutasList />} />
        <Route path="/terapeutas/:id" element={<TerapeutaDetail />} />
        <Route path="/sesiones" element={<SesionesList />} />
        <Route path="/insumos" element={<InsumosPage />} />
        <Route path="/estructura" element={<EstructuraPage />} />
        <Route path="/informes" element={<InformesPage />} />
      </Routes>
    </Layout>
  );
}
