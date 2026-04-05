import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../store/appStore';
import { LANGUAGES } from '../data/languages';
import { simulateFormAnalysis, DEMO_FIELDS } from '../data/demoData';

export default function DetectStep() {
  const {
    setStep, setLanguage, setFormAnalysis, setFormMeta, setFields,
    langCode, formAnalysis,
  } = useAppStore();

  const [analyzing, setAnalyzing] = useState(!formAnalysis);
  const [customLang, setCustomLang] = useState('');
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    if (!formAnalysis) {
      simulateFormAnalysis().then((analysis) => {
        setFormAnalysis(analysis);
        setFormMeta({
          title: analysis.formTitleTranslated,
          description: analysis.summary,
          totalFields: analysis.mandatoryFields.length + analysis.optionalFields.length,
        });
        setFields(DEMO_FIELDS);
        setAnalyzing(false);
      });
    }
  }, []);

  if (analyzing) {
    return (
      <div className="card fade-in">
        <div className="spin-wrap">
          <div className="spinner" />
          <div className="spin-lbl">Analyzing your form...</div>
          <div className="spin-sub">Detecting language, fields and structure</div>
        </div>
      </div>
    );
  }

  if (!formAnalysis) return null;

  return (
    <div className="card fade-in">
      <div className="card-title">Form Detected</div>

      <div className="detect-result" style={{ margin: '1.25rem 0' }}>
        <div className="alert alert-info" style={{ marginTop: 0 }}>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>
            This form is in <strong>{formAnalysis.detectedLanguageLabel}</strong>
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink2)' }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink3)' }}>
              {formAnalysis.formTitleOriginal}
            </span>
            <br />
            {formAnalysis.formTitleTranslated}
          </div>
        </div>
      </div>

      <div className="card-sub">
        Which language would you like to interact in? We'll ask questions in your chosen language.
      </div>

      <div className="lang-grid">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.c}
            className={`lang-btn ${langCode === lang.c ? 'sel' : ''}`}
            onClick={() => setLanguage(lang.c, lang.l)}
          >
            <span className="lang-flag">{lang.f}</span>
            {lang.l}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12 }}>
        <input
          className="chat-in"
          placeholder="Or type another language..."
          value={customLang}
          onChange={(e) => setCustomLang(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && customLang.trim()) {
              setLanguage('custom', customLang.trim());
            }
          }}
        />
        <button
          className="btn btn-ghost"
          disabled={!customLang.trim()}
          onClick={() => setLanguage('custom', customLang.trim())}
        >
          Set
        </button>
      </div>

      <div className="btn-row">
        <button className="btn btn-ghost" onClick={() => setStep(1)}>Back</button>
        <button className="btn btn-primary" onClick={() => setStep(3)}>Continue</button>
      </div>
    </div>
  );
}
