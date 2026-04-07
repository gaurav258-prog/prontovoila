import { useState } from 'react';
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
import { useNavigate, Link } from 'react-router-dom';
import '../styles/app.css';

export default function AppPage() {
  const step = useAppStore((s) => s.step);
  const reset = useAppStore((s) => s.reset);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleStartOver = () => {
    // Steps 1 & 6 don't need a confirm — nothing in progress or already done
    if (step === 1 || step === 6) { reset(); return; }
    setShowResetConfirm(true);
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
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 8, marginTop: -16,
      }}>
        <Link to="/dashboard" style={{ fontSize: 12, color: 'var(--ink4)', textDecoration: 'none' }}>
          &larr; Dashboard
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {step > 1 && step < 6 && (
            <button
              onClick={handleStartOver}
              style={{
                fontSize: 11, color: 'var(--ink4)', background: 'none', border: 'none',
                cursor: 'pointer', textDecoration: 'underline', padding: 0,
              }}
            >
              Start over
            </button>
          )}
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
        </div>
      </div>
      <StepBar />
      <div className="fade-in" key={step}>
        {renderStep()}
      </div>

      {/* Start over confirmation modal — shown for steps 2–5 where work would be lost */}
      {showResetConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 16,
        }}>
          <div style={{
            background: '#fff', borderRadius: 'var(--rad-lg)', padding: '28px 24px',
            maxWidth: 380, width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>
              Start over?
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink3)', marginBottom: 24, lineHeight: 1.5 }}>
              Your current progress will be lost and you'll return to the upload screen.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn btn-ghost"
                style={{ flex: 1 }}
                onClick={() => setShowResetConfirm(false)}
              >
                Keep going
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1, background: '#dc2626', borderColor: '#dc2626' }}
                onClick={() => { setShowResetConfirm(false); reset(); }}
              >
                Yes, start over
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
