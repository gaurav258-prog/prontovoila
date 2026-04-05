import { useCallback, useRef, useState } from 'react';
import { useAppStore } from '../store/appStore';

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function getExt(name: string): string {
  return name.split('.').pop()?.toUpperCase() || 'FILE';
}

export default function UploadStep() {
  const { file, setFile, setStep, testMode, setTestMode } = useAppStore();
  const [over, setOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (f: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        const b64 = (reader.result as string).split(',')[1];
        setFile(f, b64, f.type);
      };
      reader.readAsDataURL(f);
    },
    [setFile]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const removeFile = () => setFile(null, null, null);

  return (
    <div className="card fade-in">
      <div className="card-title">Upload your form</div>
      <div className="card-sub">
        Drag & drop a PDF, Word, or image file — we'll read the fields and walk you through each one.
      </div>

      <div
        className={`dropzone ${over ? 'over' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
      >
        <svg className="dz-icon" viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M22 30V14m0 0l-6 6m6-6l6 6" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="4" y="4" width="36" height="36" rx="8" strokeLinecap="round" />
        </svg>
        <div className="dz-title">Drop file here</div>
        <div className="dz-sub">
          or <b>browse</b> &middot; PDF, DOCX, JPG, PNG up to 20 MB
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.doc,.jpg,.jpeg,.png,.webp"
          style={{ display: 'none' }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </div>

      {file && (
        <div className="file-chip">
          <div className="chip-ext">{getExt(file.name)}</div>
          <div className="chip-name">{file.name}</div>
          <div className="chip-size">{formatSize(file.size)}</div>
          <button className="chip-del" onClick={removeFile}>
            Remove
          </button>
        </div>
      )}

      <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <label style={{ fontSize: 12, color: 'var(--ink3)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <input
            type="checkbox"
            checked={testMode}
            onChange={(e) => setTestMode(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          Test mode (no API calls — uses demo data)
        </label>
      </div>

      <div className="btn-row">
        <button className="btn btn-primary" disabled={!file} onClick={() => setStep(2)}>
          Continue
        </button>
      </div>
    </div>
  );
}
