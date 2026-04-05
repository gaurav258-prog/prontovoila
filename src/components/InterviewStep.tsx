import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../store/appStore';
import type { FormField } from '../types';

// Demo fields for now — will be replaced by AI extraction
const DEMO_FIELDS: FormField[] = [
  { id: 'full_name', label: 'Full Name', type: 'text', required: true, question: 'What is your full legal name?' },
  { id: 'dob', label: 'Date of Birth', type: 'date', required: true, question: 'What is your date of birth?', format: 'DD/MM/YYYY' },
  { id: 'email', label: 'Email Address', type: 'email', required: true, question: 'What is your email address?' },
  { id: 'phone', label: 'Phone Number', type: 'phone', required: false, question: 'What is your phone number?' },
  { id: 'address', label: 'Home Address', type: 'text', required: true, question: 'What is your home address?' },
  { id: 'citizen', label: 'EU Citizen', type: 'yesno', required: true, question: 'Are you an EU citizen?' },
  { id: 'occupation', label: 'Occupation', type: 'select', required: false, question: 'What is your current occupation?', options: ['Employed', 'Self-employed', 'Student', 'Retired', 'Other'] },
];

export default function InterviewStep() {
  const {
    fields, setFields, history, addMessage, setAnswer,
    addFilledField, idx, setIdx, setStep, langLabel,
    formMeta, setFormMeta,
  } = useAppStore();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(!formMeta);
  const chatRef = useRef<HTMLDivElement>(null);

  // Initialize demo fields on mount
  useEffect(() => {
    if (!formMeta) {
      setTimeout(() => {
        setFormMeta({ title: 'Uploaded Form', description: 'Form fields detected', totalFields: DEMO_FIELDS.length });
        setFields(DEMO_FIELDS);
        setLoading(false);
        addMessage({ role: 'ai', text: `Great! I found ${DEMO_FIELDS.length} fields in your form. Let's fill them out. I'll ask in ${langLabel}.` });
        addMessage({ role: 'ai', text: DEMO_FIELDS[0].question || `Please provide: ${DEMO_FIELDS[0].label}` });
      }, 1500);
    }
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [history]);

  const currentField = fields[idx];
  const progress = fields.length > 0 ? ((idx) / fields.length) * 100 : 0;

  const handleSubmit = (value: string) => {
    if (!value.trim() || !currentField) return;

    addMessage({ role: 'user', text: value });
    setAnswer(currentField.id, value.trim());
    addFilledField({
      id: currentField.id,
      label: currentField.label,
      value: value.trim(),
    });

    const nextIdx = idx + 1;
    if (nextIdx < fields.length) {
      setIdx(nextIdx);
      const nextField = fields[nextIdx];
      setTimeout(() => {
        addMessage({ role: 'ai', text: nextField.question || `Please provide: ${nextField.label}` });
      }, 400);
    } else {
      setTimeout(() => {
        addMessage({ role: 'ai', text: 'All done! I have all the information needed. Let me prepare your filled form.' });
        setTimeout(() => setStep(4), 1200);
      }, 400);
    }

    setInput('');
  };

  const handleSkip = () => {
    if (!currentField) return;
    addMessage({ role: 'user', text: '(skipped)' });
    addFilledField({
      id: currentField.id,
      label: currentField.label,
      value: '',
      skipped: true,
    });

    const nextIdx = idx + 1;
    if (nextIdx < fields.length) {
      setIdx(nextIdx);
      const nextField = fields[nextIdx];
      setTimeout(() => {
        addMessage({ role: 'ai', text: nextField.question || `Please provide: ${nextField.label}` });
      }, 400);
    } else {
      setTimeout(() => {
        addMessage({ role: 'ai', text: 'All done! Preparing your results.' });
        setTimeout(() => setStep(4), 1200);
      }, 400);
    }
  };

  const handleYesNo = (val: string) => {
    handleSubmit(val);
  };

  const handleOption = (val: string) => {
    handleSubmit(val);
  };

  if (loading) {
    return (
      <div className="card fade-in">
        <div className="spin-wrap">
          <div className="spinner" />
          <div className="spin-lbl">Analyzing your form...</div>
          <div className="spin-sub">Detecting fields and structure</div>
        </div>
      </div>
    );
  }

  const renderInput = () => {
    if (!currentField) return null;

    if (currentField.type === 'yesno') {
      return (
        <div className="yn-row">
          <button className="yn-btn yes" onClick={() => handleYesNo('Yes')}>
            Yes
          </button>
          <button className="yn-btn no" onClick={() => handleYesNo('No')}>
            No
          </button>
        </div>
      );
    }

    if (currentField.type === 'select' && currentField.options) {
      return (
        <div className="opt-grid">
          {currentField.options.map((opt) => (
            <button key={opt} className="opt-btn" onClick={() => handleOption(opt)}>
              {opt}
            </button>
          ))}
        </div>
      );
    }

    return (
      <div className="chat-row">
        <input
          className="chat-in"
          type={currentField.type === 'email' ? 'email' : currentField.type === 'date' ? 'date' : 'text'}
          placeholder={currentField.format || `Enter ${currentField.label.toLowerCase()}...`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit(input)}
          autoFocus
        />
        <button className="btn btn-primary" onClick={() => handleSubmit(input)}>
          Send
        </button>
      </div>
    );
  };

  return (
    <div className="card fade-in">
      <div className="interview-meta">
        <span className="int-label">
          {currentField ? `Field ${idx + 1} of ${fields.length}: ${currentField.label}` : 'Complete'}
        </span>
        <span className="int-counter">
          {idx}/{fields.length}
        </span>
      </div>
      <div className="progbar">
        <div className="progbar-inner" style={{ width: `${progress}%` }} />
      </div>

      <div className="chat-area" ref={chatRef}>
        {history.map((msg, i) => (
          <div key={i} className={`msg ${msg.role === 'ai' ? 'ai' : 'usr'}`}>
            <div className="msg-from">{msg.role === 'ai' ? 'ProntoVoila' : 'You'}</div>
            <div className="bubble">{msg.text}</div>
          </div>
        ))}
      </div>

      <div className="input-zone">{renderInput()}</div>

      {currentField && !currentField.required && (
        <div className="skip-row" style={{ marginTop: 6, display: 'flex', gap: 7, alignItems: 'center' }}>
          <button className="btn btn-ghost" style={{ fontSize: 11, padding: '5px 12px' }} onClick={handleSkip}>
            Skip this field
          </button>
          {currentField.format && (
            <span className="format-hint">Format: {currentField.format}</span>
          )}
        </div>
      )}

      <div className="btn-row">
        <button className="btn btn-ghost" onClick={() => setStep(2)}>
          Back
        </button>
      </div>
    </div>
  );
}
