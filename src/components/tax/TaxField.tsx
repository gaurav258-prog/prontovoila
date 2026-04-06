import { useState } from 'react';

interface TaxFieldProps {
  label: string;
  german: string;
  value: string;
  onChange: (val: string) => void;
  type?: 'text' | 'number' | 'date' | 'select' | 'yesno';
  options?: Array<{ value: string; label: string; de?: string; desc?: string }>;
  info?: string;
  placeholder?: string;
  required?: boolean;
}

export default function TaxField({ label, german, value, onChange, type = 'text', options, info, placeholder, required }: TaxFieldProps) {
  const [showInfo, setShowInfo] = useState(false);

  const hasDescriptions = options?.some((o) => o.desc);

  return (
    <div className="tax-field">
      <label className="tax-field-label">
        {label}
        {required && <span className="tax-required">*</span>}
        {info && (
          <button className="tax-info-btn" onClick={() => setShowInfo(!showInfo)} type="button">
            i
          </button>
        )}
      </label>
      <span className="tax-field-de">{german}</span>

      {showInfo && info && (
        <div className="tax-info-bubble">{info}</div>
      )}

      {type === 'yesno' ? (
        <div className="tax-yesno">
          <button
            type="button"
            className={`tax-yn-btn ${value === 'yes' ? 'active' : ''}`}
            onClick={() => onChange('yes')}
          >Yes</button>
          <button
            type="button"
            className={`tax-yn-btn ${value === 'no' ? 'active' : ''}`}
            onClick={() => onChange('no')}
          >No</button>
        </div>
      ) : type === 'select' && options && hasDescriptions ? (
        <div className="tax-option-cards">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              className={`tax-option-card ${value === o.value ? 'active' : ''}`}
              onClick={() => onChange(o.value)}
            >
              <div className="tax-option-header">
                <span className="tax-option-label">{o.label}</span>
                {o.de && <span className="tax-option-de">{o.de}</span>}
              </div>
              {o.desc && <div className="tax-option-desc">{o.desc}</div>}
            </button>
          ))}
        </div>
      ) : type === 'select' && options ? (
        <select
          className="tax-select"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select...</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}{o.de ? ` (${o.de})` : ''}
            </option>
          ))}
        </select>
      ) : (
        <input
          className="tax-input"
          type={type === 'number' ? 'text' : type}
          inputMode={type === 'number' ? 'decimal' : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || ''}
        />
      )}
    </div>
  );
}
