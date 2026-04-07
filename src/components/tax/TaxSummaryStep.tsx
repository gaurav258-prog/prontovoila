import { useEffect, useRef } from 'react';
import { useTaxStore } from '../../store/taxStore';
import { analyzeTaxSituation } from '../../services/taxAnalysis';
import TaxCalendar from './TaxCalendar';

export default function TaxSummaryStep() {
  const {
    langCode, personal, employment, expenses, insurance, special,
    summary, isAnalyzing, error,
    setSummary, setIsAnalyzing, setError, setStep, reset,
  } = useTaxStore();

  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current || summary) return;
    initRef.current = true;
    setIsAnalyzing(true);
    setError(null);

    analyzeTaxSituation(langCode, personal, employment, expenses, insurance, special)
      .then((result) => {
        setSummary(result);
        setIsAnalyzing(false);
      })
      .catch((err) => {
        console.error('Tax analysis failed:', err);
        setError(err.message || 'Failed to analyze tax data');
        setIsAnalyzing(false);
      });
  }, []);

  if (isAnalyzing) {
    return (
      <div className="card fade-in">
        <div className="spin-wrap">
          <div className="spinner" />
          <div className="spin-lbl">Analyzing your tax situation...</div>
          <div className="spin-sub">Calculating deductions, estimating refund, and preparing recommendations</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card fade-in">
        <div className="card-title">Analysis failed</div>
        <div className="alert alert-err" style={{ marginTop: 12 }}>{error}</div>
        <div className="btn-row">
          <button className="btn btn-ghost" onClick={() => setStep(7)}>&larr; Back</button>
          <button className="btn btn-primary" onClick={() => {
            setError(null);
            initRef.current = false;
            setIsAnalyzing(true);
            analyzeTaxSituation(langCode, personal, employment, expenses, insurance, special)
              .then((result) => { setSummary(result); setIsAnalyzing(false); })
              .catch((e) => { setError(e.message); setIsAnalyzing(false); });
          }}>Retry</button>
        </div>
      </div>
    );
  }

  if (!summary) return null;

  const refundOrLiability = summary.estimatedRefund
    ? { type: 'refund' as const, amount: summary.estimatedRefund }
    : { type: 'liability' as const, amount: summary.estimatedLiability || 0 };

  return (
    <div className="card fade-in">
      <div className="card-title">Your Tax Summary</div>
      <div className="card-sub">Steuer&uuml;bersicht &middot; {personal.taxYear}</div>

      <div className={`tax-result-banner ${refundOrLiability.type}`}>
        <div className="tax-result-label">
          {refundOrLiability.type === 'refund' ? 'Estimated Refund' : 'Estimated Tax Due'}
        </div>
        <div className="tax-result-amount">
          {refundOrLiability.type === 'refund' ? '+' : '-'}&euro;{refundOrLiability.amount.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </div>
        <div className="tax-result-note">
          {refundOrLiability.type === 'refund'
            ? 'Erstattung (Steuererstattung)'
            : 'Nachzahlung (Steuernachzahlung)'
          }
        </div>
      </div>

      <div className="tax-analysis">
        <div className="tax-section-title">Analysis</div>
        <ul className="tax-reco-list">
          {summary.analysisText.split('\n').filter(Boolean).map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </div>

      {summary.recommendations.length > 0 && (
        <div className="tax-section" style={{ marginTop: 20 }}>
          <div className="tax-section-title">Recommendations</div>
          <ul className="tax-reco-list">
            {summary.recommendations.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      {summary.nextSteps.length > 0 && (
        <div className="tax-section" style={{ marginTop: 20 }}>
          <div className="tax-section-title">Next Steps</div>
          <ol className="tax-next-list">
            {summary.nextSteps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </div>
      )}

      <TaxCalendar />

      <div style={{ marginTop: 24, padding: '12px 16px', background: 'var(--cream2)', borderRadius: 'var(--rad)', fontSize: 12, color: 'var(--ink3)' }}>
        This is an estimate based on the information you provided. Actual results may vary. For official filing, use ELSTER (elster.de) or consult a Steuerberater (tax advisor).
      </div>

      <div className="btn-row" style={{ marginTop: 24 }}>
        <button className="btn btn-ghost" onClick={() => setStep(7)}>&larr; Back</button>
        <button className="btn btn-primary" onClick={() => reset()}>
          Start New Return
        </button>
      </div>
    </div>
  );
}
