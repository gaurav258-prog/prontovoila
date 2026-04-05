import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { LANGUAGES } from '../data/languages';

export default function LanguageStep() {
  const { langCode, setLanguage, setStep } = useAppStore();
  const [customLang, setCustomLang] = useState('');

  const handleSelect = (code: string, label: string) => {
    setLanguage(code, label);
  };

  return (
    <div className="card fade-in">
      <div className="card-title">Choose your language</div>
      <div className="card-sub">
        We'll ask questions in this language. The form will be filled in the language it requires.
      </div>

      <div className="lang-grid">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.c}
            className={`lang-btn ${langCode === lang.c ? 'sel' : ''}`}
            onClick={() => handleSelect(lang.c, lang.l)}
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
        <button className="btn btn-ghost" onClick={() => setStep(1)}>
          Back
        </button>
        <button className="btn btn-primary" onClick={() => setStep(3)}>
          Continue
        </button>
      </div>
    </div>
  );
}
