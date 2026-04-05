import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../store/appStore';
import { LANGUAGES, ALL_LANGUAGES } from '../data/languages';
import { analyzeForm } from '../services/claudeApi';
import { simulateFormAnalysis, DEMO_FIELDS } from '../data/demoData';

export default function DetectStep() {
  const {
    setStep, setLanguage, setFormAnalysis, setFormMeta, setFields,
    langCode, formAnalysis, fileB64, fileMime, testMode,
  } = useAppStore();

  const [analyzing, setAnalyzing] = useState(!formAnalysis);
  const [error, setError] = useState('');
  const [customLang, setCustomLang] = useState('');
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    if (!formAnalysis) {
      if (testMode) {
        // Test mode: use demo data, no API call
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
      } else if (fileB64 && fileMime) {
        // Live mode: call Claude API
        analyzeForm(fileB64, fileMime)
          .then(({ analysis, fields }) => {
            setFormAnalysis(analysis);
            setFormMeta({
              title: analysis.formTitleTranslated,
              description: analysis.summary,
              totalFields: analysis.mandatoryFields.length + analysis.optionalFields.length,
            });
            setFields(fields);
            setAnalyzing(false);
          })
          .catch((err) => {
            console.error('Form analysis failed:', err);
            setError(err.message || 'Failed to analyze form. Please try again.');
            setAnalyzing(false);
          });
      }
    }
  }, []);

  if (analyzing) {
    return (
      <div className="card fade-in">
        <div className="spin-wrap">
          <div className="spinner" />
          <div className="spin-lbl">{testMode ? 'Loading test data...' : 'Analyzing your form...'}</div>
          <div className="spin-sub">{testMode ? 'Using demo mode (no API calls)' : 'Reading fields, detecting language and structure'}</div>
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
          <button className="btn btn-ghost" onClick={() => setStep(1)}>Back</button>
          <button className="btn btn-primary" onClick={() => { setError(''); setAnalyzing(true); initRef.current = false; }}>
            Retry
          </button>
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

      <div style={{ position: 'relative', marginTop: 12 }}>
        <input
          className="chat-in"
          placeholder="Search for a language..."
          value={customLang}
          onChange={(e) => setCustomLang(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && customLang.trim()) {
              // Select first matching result or use typed text
              const match = ALL_LANGUAGES.find((lg) =>
                lg.en.toLowerCase().startsWith(customLang.toLowerCase()) ||
                lg.l.toLowerCase().startsWith(customLang.toLowerCase())
              );
              if (match) {
                setLanguage(match.c, match.l);
                setCustomLang('');
              } else {
                setLanguage('custom', customLang.trim());
                setCustomLang('');
              }
            }
          }}
          style={{ width: '100%' }}
        />
        {customLang.trim().length >= 1 && (
          <div className="lang-dropdown">
            {ALL_LANGUAGES
              .filter((lg) => {
                const q = customLang.toLowerCase();
                return lg.en.toLowerCase().includes(q) || lg.l.toLowerCase().includes(q) || lg.c.includes(q);
              })
              .slice(0, 8)
              .map((lg) => (
                <button
                  key={lg.c}
                  className="lang-dropdown-item"
                  onClick={() => {
                    setLanguage(lg.c, lg.l);
                    setCustomLang('');
                  }}
                >
                  <span style={{ fontSize: 16 }}>{lg.f}</span>
                  <span style={{ fontWeight: 500 }}>{lg.en}</span>
                  <span style={{ color: 'var(--ink4)', fontSize: 12 }}>{lg.l}</span>
                </button>
              ))
            }
            {ALL_LANGUAGES.filter((lg) => {
              const q = customLang.toLowerCase();
              return lg.en.toLowerCase().includes(q) || lg.l.toLowerCase().includes(q) || lg.c.includes(q);
            }).length === 0 && (
              <div style={{ padding: '10px 12px', fontSize: 13, color: 'var(--ink4)', textAlign: 'center' }}>
                No match found — press Enter to use "{customLang}"
              </div>
            )}
          </div>
        )}
      </div>

      <div className="btn-row">
        <button className="btn btn-ghost" onClick={() => setStep(1)}>Back</button>
        <button className="btn btn-primary" onClick={() => setStep(3)}>Continue</button>
      </div>
    </div>
  );
}
