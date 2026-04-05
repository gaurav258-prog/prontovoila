import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../store/appStore';

export default function FollowUpStep() {
  const {
    followUpQuestions, followUpIdx, setFollowUpIdx,
    filledFields, setFilledFields,
    history, addMessage,
    setStep, langLabel,
  } = useAppStore();

  const [input, setInput] = useState('');
  const chatRef = useRef<HTMLDivElement>(null);
  const initRef = useRef(false);

  const current = followUpQuestions[followUpIdx];
  const progress = followUpQuestions.length > 0
    ? (followUpIdx / followUpQuestions.length) * 100
    : 0;

  // Ask first question on mount
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    if (history.length === 0 && followUpQuestions.length > 0) {
      const filled = filledFields.filter((f) => f.source === 'freehand');
      const intro = filled.length > 0
        ? `Great, I extracted ${filled.length} field${filled.length > 1 ? 's' : ''} from what you wrote. I just need a few more details in ${langLabel}.`
        : `I need a few more details to complete the form. Let me ask in ${langLabel}.`;
      addMessage({ role: 'ai', text: intro });
      setTimeout(() => {
        const q = followUpQuestions[0];
        addMessage({ role: 'ai', text: `${q.reason} ${q.question}` });
      }, 500);
    }
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [history]);

  const advance = (value: string) => {
    if (!current) return;

    addMessage({ role: 'user', text: value });

    // Add to filled fields
    const updated = [
      ...filledFields,
      {
        id: current.fieldId,
        label: current.label,
        value: value.trim(),
        confidence: 'high' as const,
        source: 'followup' as const,
      },
    ];
    setFilledFields(updated);

    const nextIdx = followUpIdx + 1;
    if (nextIdx < followUpQuestions.length) {
      setFollowUpIdx(nextIdx);
      const next = followUpQuestions[nextIdx];
      setTimeout(() => {
        addMessage({ role: 'ai', text: `${next.reason} ${next.question}` });
      }, 400);
    } else {
      setTimeout(() => {
        addMessage({ role: 'ai', text: 'I now have everything I need. Let me show you the completed form for review.' });
        setTimeout(() => setStep(5), 1000);
      }, 400);
    }
    setInput('');
  };

  const handleSubmit = (value: string) => {
    if (!value.trim()) return;
    advance(value.trim());
  };

  const handleSkip = () => {
    if (!current) return;
    addMessage({ role: 'user', text: '(skipped)' });
    const updated = [
      ...filledFields,
      {
        id: current.fieldId,
        label: current.label,
        value: '',
        skipped: true,
        confidence: undefined,
        source: 'followup' as const,
      },
    ];
    setFilledFields(updated);

    const nextIdx = followUpIdx + 1;
    if (nextIdx < followUpQuestions.length) {
      setFollowUpIdx(nextIdx);
      const next = followUpQuestions[nextIdx];
      setTimeout(() => {
        addMessage({ role: 'ai', text: `${next.reason} ${next.question}` });
      }, 400);
    } else {
      setTimeout(() => {
        addMessage({ role: 'ai', text: 'All done! Let me show you the completed form.' });
        setTimeout(() => setStep(5), 1000);
      }, 400);
    }
  };

  const renderInput = () => {
    if (!current) return null;

    if (current.type === 'yesno') {
      return (
        <div className="yn-row">
          <button className="yn-btn yes" onClick={() => advance('Yes')}>Yes</button>
          <button className="yn-btn no" onClick={() => advance('No')}>No</button>
        </div>
      );
    }

    if (current.type === 'select' && current.options) {
      return (
        <div className="opt-grid">
          {current.options.map((opt) => (
            <button key={opt} className="opt-btn" onClick={() => advance(opt)}>
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
          type={current.type === 'email' ? 'email' : current.type === 'date' ? 'date' : 'text'}
          placeholder={`Enter ${current.label.toLowerCase()}...`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit(input)}
          autoFocus
        />
        <button className="btn btn-primary" onClick={() => handleSubmit(input)}>Send</button>
      </div>
    );
  };

  return (
    <div className="card fade-in">
      <div className="interview-meta">
        <span className="int-label">
          {current ? `Question ${followUpIdx + 1} of ${followUpQuestions.length}: ${current.label}` : 'Complete'}
        </span>
        <span className="int-counter">
          {followUpIdx}/{followUpQuestions.length}
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

      {current && current.type !== 'yesno' && current.type !== 'select' && (
        <div style={{ marginTop: 6, display: 'flex', gap: 7, alignItems: 'center' }}>
          <button className="btn btn-ghost" style={{ fontSize: 11, padding: '5px 12px' }} onClick={handleSkip}>
            Skip this field
          </button>
        </div>
      )}

      <div className="btn-row">
        <button className="btn btn-ghost" onClick={() => setStep(3)}>Back</button>
      </div>
    </div>
  );
}
