import { useState } from 'react';
import { useTaxStore } from '../../store/taxStore';
import { LANGUAGES, ALL_LANGUAGES } from '../../data/languages';
import { getUIStrings } from '../../services/taxAnalysis';

export default function TaxLanguageStep() {
  const { langCode, langLabel, briefingStrings, setLanguage, setBriefingStrings, setStep } = useTaxStore();
  const [search, setSearch] = useState('');
  const [translating, setTranslating] = useState(false);

  const filtered = search.trim()
    ? ALL_LANGUAGES.filter(
        (l) =>
          l.l.toLowerCase().includes(search.toLowerCase()) ||
          l.en.toLowerCase().includes(search.toLowerCase())
      )
    : null;

  const select = (code: string, label: string) => {
    setLanguage(code, label);
  };

  const handleContinue = async () => {
    if (!langCode) return;
    // English — no translation needed
    if (langCode === 'en' || briefingStrings) {
      setStep(2);
      return;
    }
    setTranslating(true);
    try {
      const strings = await getUIStrings(langLabel);
      setBriefingStrings(strings);
    } catch {
      // On failure, fall back to English — still proceed
    }
    setTranslating(false);
    setStep(2);
  };

  if (translating) {
    return (
      <div className="card fade-in">
        <div className="spin-wrap">
          <div className="spinner" />
          <div className="spin-lbl">Preparing in {langLabel}…</div>
          <div className="spin-sub">Translating the questionnaire into your language</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card fade-in">
      <div className="card-title">Choose your language</div>
      <div className="card-sub">
        Answer tax questions in your language. German terms will always be shown alongside for reference.
      </div>

      <div className="lang-grid" style={{ marginTop: 16 }}>
        {LANGUAGES.map((lang) => (
          <button
            key={lang.c}
            className={`lang-btn ${langCode === lang.c ? 'sel' : ''}`}
            onClick={() => select(lang.c, lang.l)}
          >
            <span className="lang-flag">{lang.f}</span>
            <span className="lang-name">{lang.l}</span>
          </button>
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        <input
          className="chat-in"
          placeholder="Search for another language..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {filtered && filtered.length > 0 && (
          <div className="lang-search-results" style={{ marginTop: 8 }}>
            {filtered.slice(0, 8).map((lang) => (
              <button
                key={lang.c}
                className={`lang-btn ${langCode === lang.c ? 'sel' : ''}`}
                onClick={() => { select(lang.c, lang.l); setSearch(''); }}
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                <span className="lang-flag">{lang.f}</span>
                <span className="lang-name">{lang.l}</span>
                <span style={{ color: 'var(--ink4)', fontSize: 12, marginLeft: 'auto' }}>{lang.en}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="btn-row" style={{ marginTop: 24 }}>
        <button className="btn btn-primary" onClick={handleContinue} disabled={!langCode}>
          Continue &rarr;
        </button>
      </div>
    </div>
  );
}
