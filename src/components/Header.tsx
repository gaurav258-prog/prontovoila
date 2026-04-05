import { useState } from 'react';
import { useAppStore } from '../store/appStore';

export default function Header() {
  const { apiKey, setApiKey } = useAppStore();
  const [showPanel, setShowPanel] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (keyInput.trim()) {
      setApiKey(keyInput.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <>
      <header className="header">
        <div>
          <div className="wordmark">Pronto<em>Voil&agrave;</em></div>
          <div className="tagline">Upload any form &middot; answer in your language &middot; get it filled</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
            {apiKey ? 'Key set' : ''}
          </span>
          <button
            style={{
              padding: '7px 14px', fontSize: 12, fontWeight: 500,
              border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6,
              background: 'transparent', color: 'rgba(255,255,255,0.65)',
              cursor: 'pointer', fontFamily: 'var(--sans)', transition: 'all 0.15s',
            }}
            onClick={() => setShowPanel(!showPanel)}
          >
            API key
          </button>
        </div>
      </header>

      {showPanel && (
        <div className="api-setup">
          <h3>Anthropic API Key</h3>
          <p>
            Your key is stored only in this browser session and sent exclusively to
            api.anthropic.com — never anywhere else.
          </p>
          <div className="api-row">
            <input
              className="api-in"
              type="password"
              placeholder="sk-ant-..."
              autoComplete="off"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <button className="btn btn-primary" style={{ padding: '9px 14px' }} onClick={handleSave}>
              Save
            </button>
          </div>
          {saved && (
            <div style={{ fontSize: 11, color: 'var(--ok)', marginTop: 6 }}>
              &#10003; Key saved for this session
            </div>
          )}
        </div>
      )}
    </>
  );
}
