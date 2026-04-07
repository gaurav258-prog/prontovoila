import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AppPage from './pages/AppPage';
import TaxPage from './pages/TaxPage';
import TaxCalendarPage from './pages/TaxCalendarPage';
import TermsPage from './pages/legal/TermsPage';
import PrivacyPage from './pages/legal/PrivacyPage';
import CookiePage from './pages/legal/CookiePage';
import GdprPage from './pages/legal/GdprPage';
import SecurityPage from './pages/legal/SecurityPage';
import AboutPage from './pages/company/AboutPage';
import ContactPage from './pages/company/ContactPage';
import ComingSoonPage from './pages/company/ComingSoonPage';
// import ProtectedRoute from './components/ProtectedRoute'; // temporarily disabled

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/app" element={<AppPage />} />
      <Route path="/tax" element={<TaxPage />} />
      <Route path="/calendar" element={<TaxCalendarPage />} />
      {/* Legal */}
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/cookies" element={<CookiePage />} />
      <Route path="/gdpr" element={<GdprPage />} />
      <Route path="/security" element={<SecurityPage />} />
      {/* Company */}
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/blog" element={<ComingSoonPage title="Blog" />} />
      <Route path="/press" element={<ComingSoonPage title="Press" />} />
      <Route path="/careers" element={<ComingSoonPage title="Careers" />} />
    </Routes>
  );
}

export default App;
