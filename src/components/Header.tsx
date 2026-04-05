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
          <span style={{ fontSize: 11, color: 'var(--ink4)' }}>
            {apiKey ? 'Key set' : 'No API key'}
          </span>
          <button
            className="btn btn-ghost"
            style={{ padding: '6px 12px', fontSize: 11 }}
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
