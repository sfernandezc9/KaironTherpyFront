import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import PrivateRoute from './components/auth/PrivateRoute';
import LoginPage from './pages/Login/LoginPage';
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
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/pacientes" element={<PacientesList />} />
                <Route path="/pacientes/:id" element={<PacienteDetail />} />
                <Route
                  path="/terapeutas"
                  element={
                    <PrivateRoute requiredRole="administrador">
                      <TerapeutasList />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/terapeutas/:id"
                  element={
                    <PrivateRoute requiredRole="administrador">
                      <TerapeutaDetail />
                    </PrivateRoute>
                  }
                />
                <Route path="/sesiones" element={<SesionesList />} />
                <Route
                  path="/insumos"
                  element={
                    <PrivateRoute requiredRole="administrador">
                      <InsumosPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/estructura"
                  element={
                    <PrivateRoute requiredRole="administrador">
                      <EstructuraPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/informes"
                  element={
                    <PrivateRoute requiredRole="administrador">
                      <InformesPage />
                    </PrivateRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
