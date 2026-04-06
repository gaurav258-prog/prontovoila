import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AppPage from './pages/AppPage';
import TaxPage from './pages/TaxPage';
// import ProtectedRoute from './components/ProtectedRoute'; // temporarily disabled

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/app" element={<AppPage />} />
      <Route path="/tax" element={<TaxPage />} />
    </Routes>
  );
}

export default App;
