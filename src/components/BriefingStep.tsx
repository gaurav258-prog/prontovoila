import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { parseFreehandText } from '../services/claudeApi';
import { simulateFreehandParse } from '../data/demoData';
import { getSavedProfile } from '../services/profileStore';

export default function BriefingStep() {
  const {
    formAnalysis, fields, langLabel, setStep,
    freehandText, setFreehandText,
    setFilledFields, setFollowUpQuestions, setFollowUpIdx, clearHistory,
    testMode,
  } = useAppStore();

  // Pre-fill from saved profile if available and no text yet
  const savedProfile = getSavedProfile();
  const initialText = freehandText || (savedProfile?.rawText ?? '');

  const [localText, setLocalText] = useState(initialText);
  const [parsing, setParsing] = useState(false);
  const [showProfileBanner, setShowProfileBanner] = useState(!!savedProfile && !freehandText);

  if (!formAnalysis) return null;

  const handleSubmit = async () => {
    if (!localText.trim()) return;
    setParsing(true);
    setFreehandText(localText);

    const { filled, followUps } = testMode
      ? await simulateFreehandParse(localText, fields)
      : await parseFreehandText(localText, fields, langLabel);

    setFilledFields(filled);
    setFollowUpQuestions(followUps);
    setFollowUpIdx(0);
    clearHistory();

    if (followUps.length === 0) {
      // All fields extracted — skip to confirm
      setStep(5);
    } else {
      setStep(4);
    }
  };

  if (parsing) {
    return (
      <div className="card fade-in">
        <div className="spin-wrap">
          <div className="spinner" />
          <div className="spin-lbl">Analyzing your information...</div>
          <div className="spin-sub">Extracting details and matching to form fields</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card fade-in">
      <div className="card-title">About this form</div>

      {/* Summary */}
      <div style={{ margin: '1rem 0 1.5rem' }}>
        <p style={{ fontSize: 13.5, color: 'var(--ink2)', lineHeight: 1.7 }}>
          {formAnalysis.summary}
        </p>
      </div>

      {/* Mandatory fields */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
          Required information
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {formAnalysis.mandatoryFields.map((f) => (
            <span key={f.id} className="field-tag required">{f.label}</span>
          ))}
        </div>
      </div>

      {/* Optional fields */}
      {formAnalysis.optionalFields.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Optional information
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {formAnalysis.optionalFields.map((f) => (
              <span key={f.id} className="field-tag optional">{f.label}</span>
            ))}
          </div>
        </div>
      )}

      {/* Saved profile banner */}
      {showProfileBanner && (
        <div className="fade-in" style={{
          padding: '10px 14px', background: 'var(--gold-dim)',
          border: '1px solid rgba(201,168,76,0.25)', borderRadius: 'var(--rad)',
          marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 13, color: '#8a6a20', fontWeight: 500 }}>
            Your saved details have been pre-filled below. Review and edit as needed.
          </span>
          <button
            style={{
              fontSize: 11, color: 'var(--ink3)', background: 'none', border: 'none',
              cursor: 'pointer', textDecoration: 'underline', flexShrink: 0, marginLeft: 8,
            }}
            onClick={() => { setLocalText(''); setShowProfileBanner(false); }}
          >
            Clear
          </button>
        </div>
      )}

      {/* Freehand textarea */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink)', marginBottom: 6 }}>
          Tell us about yourself in {langLabel}
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink3)', marginBottom: 10, lineHeight: 1.6 }}>
          {showProfileBanner
            ? 'Your saved info is pre-filled. Add any new details or edit below, then submit.'
            : 'Type freely in your own words. Include as much information as you can \u2014 name, date of birth, contact details, address, etc. We\u2019ll extract what we need and only ask about what\u2019s missing.'
          }
        </div>
        <textarea
          className="freehand-area"
          placeholder={`Example: My name is Maria Garcia, born on 15/03/1990. My email is maria.garcia@email.com and I live at Hauptstra\u00dfe 42, 10115 Berlin. I am an EU citizen and currently employed.`}
          value={localText}
          onChange={(e) => setLocalText(e.target.value)}
          rows={7}
        />
      </div>

      <div className="btn-row">
        <button className="btn btn-ghost" onClick={() => setStep(2)}>Back</button>
        <button
          className="btn btn-primary"
          disabled={!localText.trim()}
          onClick={handleSubmit}
        >
          Submit & analyze
        </button>
      </div>
    </div>
  );
}
