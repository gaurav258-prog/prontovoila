import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import TaxStepBar from '../components/tax/TaxStepBar';
import TaxLanguageStep from '../components/tax/TaxLanguageStep';
import TaxBriefingStep from '../components/tax/TaxBriefingStep';
import TaxPersonalStep from '../components/tax/TaxPersonalStep';
import TaxIncomeStep from '../components/tax/TaxIncomeStep';
import TaxDeductionsStep from '../components/tax/TaxDeductionsStep';
import TaxInsuranceStep from '../components/tax/TaxInsuranceStep';
import TaxExtrasStep from '../components/tax/TaxExtrasStep';
import TaxSummaryStep from '../components/tax/TaxSummaryStep';
import { useTaxStore } from '../store/taxStore';
import '../styles/app.css';
import '../styles/tax.css';

const SESSION_KEY = 'prontovoila_tax_session';

export default function TaxPage() {
  const navigate = useNavigate();
  const { step, reset } = useTaxStore();
  const [showExitModal, setShowExitModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved && step === 1) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.step && parsed.step > 1) setShowResumeModal(true);
      } catch { /* ignore */ }
    }
  }, []);

  const isActiveSession = step > 1;

  const handleLogoClick = () => {
    if (isActiveSession) {
      setShowExitModal(true);
    } else {
      navigate('/');
    }
  };

  const handleSaveAndExit = () => {
    // Save full store state to localStorage
    const { reset: _r, ...toSave } = useTaxStore.getState();
    localStorage.setItem(SESSION_KEY, JSON.stringify(toSave));
    setShowExitModal(false);
    navigate('/');
  };

  const handleExitWithoutSaving = () => {
    reset();
    localStorage.removeItem(SESSION_KEY);
    setShowExitModal(false);
    navigate('/');
  };

  const handleResumeSession = () => {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        useTaxStore.setState(parsed);
      } catch { /* ignore */ }
    }
    setShowResumeModal(false);
  };

  const handleStartFresh = () => {
    localStorage.removeItem(SESSION_KEY);
    setShowResumeModal(false);
  };

  const renderStep = () => {
    switch (step) {
      case 1: return <TaxLanguageStep />;
      case 2: return <TaxBriefingStep />;
      case 3: return <TaxPersonalStep />;
      case 4: return <TaxIncomeStep />;
      case 5: return <TaxDeductionsStep />;
      case 6: return <TaxInsuranceStep />;
      case 7: return <TaxExtrasStep />;
      case 8: return <TaxSummaryStep />;
      default: return <TaxLanguageStep />;
    }
  };

  return (
    <div className="shell">
      <Header onLogoClick={handleLogoClick} tagline="German tax return · guided in your language · maximise your refund" />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '4px 0 8px' }}>
        <Link to="/dashboard" style={{ fontSize: 12, color: 'var(--ink4)', textDecoration: 'none' }}>
          &larr; Dashboard
        </Link>
      </div>
      <div style={{ margin: '0 0 16px', textAlign: 'center' }}>
        <span style={{ fontSize: 13, color: 'var(--ink3)', fontWeight: 500 }}>
          German Personal Tax Filing &middot; <span style={{ color: 'var(--ink4)' }}>Einkommensteuererkl&auml;rung</span>
        </span>
      </div>
      <TaxStepBar />
      <div className="fade-in" key={step}>
        {renderStep()}
      </div>

      {showResumeModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 16,
        }}>
          <div style={{
            background: '#fff', borderRadius: 'var(--rad-lg)', padding: '28px 24px',
            maxWidth: 400, width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>
              Resume your session?
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink3)', marginBottom: 24, lineHeight: 1.5 }}>
              You have a saved tax return in progress. Would you like to continue where you left off?
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button className="btn btn-primary" onClick={handleResumeSession} style={{ width: '100%' }}>
                Resume my session
              </button>
              <button className="btn btn-ghost" onClick={handleStartFresh} style={{ width: '100%' }}>
                Start a new return
              </button>
            </div>
          </div>
        </div>
      )}

      {showExitModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 16,
        }}>
          <div style={{
            background: '#fff', borderRadius: 'var(--rad-lg)', padding: '28px 24px',
            maxWidth: 400, width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>
              Leave this session?
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink3)', marginBottom: 24, lineHeight: 1.5 }}>
              You&rsquo;re in the middle of your tax return (step {step} of 8). What would you like to do?
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                className="btn btn-primary"
                onClick={handleSaveAndExit}
                style={{ width: '100%' }}
              >
                Save &amp; come back later
              </button>
              <button
                className="btn btn-ghost"
                onClick={handleExitWithoutSaving}
                style={{ width: '100%' }}
              >
                Exit without saving
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => setShowExitModal(false)}
                style={{ width: '100%', color: 'var(--ink3)' }}
              >
                Stay on this page
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
