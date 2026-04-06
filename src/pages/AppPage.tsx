import Header from '../components/Header';
import StepBar from '../components/StepBar';
import UploadStep from '../components/UploadStep';
import DetectStep from '../components/DetectStep';
import BriefingStep from '../components/BriefingStep';
import FollowUpStep from '../components/FollowUpStep';
import ConfirmStep from '../components/ConfirmStep';
import ResultsStep from '../components/ResultsStep';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import '../styles/app.css';

export default function AppPage() {
  const step = useAppStore((s) => s.step);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const renderStep = () => {
    switch (step) {
      case 1: return <UploadStep />;
      case 2: return <DetectStep />;
      case 3: return <BriefingStep />;
      case 4: return <FollowUpStep />;
      case 5: return <ConfirmStep />;
      case 6: return <ResultsStep />;
      default: return <UploadStep />;
    }
  };

  return (
    <div className="shell">
      <Header />
      {user && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          gap: 10, marginBottom: 8, marginTop: -16,
        }}>
          <span style={{ fontSize: 12, color: 'var(--ink3)' }}>{user.email}</span>
          <button
            onClick={handleLogout}
            style={{
              fontSize: 11, color: 'var(--ink4)', background: 'none', border: 'none',
              cursor: 'pointer', textDecoration: 'underline',
            }}
          >
            Sign out
          </button>
        </div>
      )}
      <StepBar />
      <div className="fade-in" key={step}>
        {renderStep()}
      </div>
    </div>
  );
}
