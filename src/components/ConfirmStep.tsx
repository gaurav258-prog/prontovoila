import { useState, useRef, useEffect, useCallback } from 'react';
import { useAppStore } from '../store/appStore';
import type { FormField, SignatureMode } from '../types';
import { saveProfile, hasProfile } from '../services/profileStore';

function SignatureField({ fieldId, label }: { fieldId: string; label: string }) {
  const { signatures, updateSignature } = useAppStore();
  const sig = signatures.find((s) => s.fieldId === fieldId);
  const mode = sig?.mode || null;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [typedName, setTypedName] = useState(sig?.typedName || '');

  const setMode = (m: SignatureMode) => {
    updateSignature(fieldId, { mode: m, dataUrl: null, typedName: undefined });
  };

  // Drawing logic
  const getPos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  }, []);

  const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }, [getPos]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }, [isDrawing, getPos]);

  const endDraw = useCallback(() => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      updateSignature(fieldId, { mode: 'draw', dataUrl: canvas.toDataURL('image/png') });
    }
  }, [fieldId, updateSignature]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#1a1a18';
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
      }
      updateSignature(fieldId, { mode: 'draw', dataUrl: null });
    }
  };

  useEffect(() => {
    if (mode === 'draw' && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#1a1a18';
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
      }
    }
  }, [mode]);

  // Typed signature rendering
  useEffect(() => {
    if (mode === 'type' && typedName.trim()) {
      // Render to hidden canvas
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 80;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, 400, 80);
        ctx.font = '700 36px "Dancing Script", cursive';
        ctx.fillStyle = '#1a1a18';
        ctx.fillText(typedName, 10, 50);
        updateSignature(fieldId, { mode: 'type', dataUrl: canvas.toDataURL('image/png'), typedName });
      }
    }
  }, [typedName, mode, fieldId, updateSignature]);

  return (
    <div className="sig-section">
      <div className="sig-title">{label}</div>
      <div className="sig-mode-row">
        <button className={`sig-mode-btn ${mode === 'draw' ? 'active' : ''}`} onClick={() => setMode('draw')}>
          Draw signature
        </button>
        <button className={`sig-mode-btn ${mode === 'type' ? 'active' : ''}`} onClick={() => setMode('type')}>
          Type signature
        </button>
        <button className={`sig-mode-btn ${mode === 'after-print' ? 'active' : ''}`} onClick={() => setMode('after-print')}>
          Sign after printing
        </button>
      </div>

      {mode === 'draw' && (
        <div className="sig-canvas-wrap">
          <canvas
            ref={canvasRef}
            className="sig-canvas"
            width={600}
            height={200}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={endDraw}
          />
          <button className="btn btn-ghost" style={{ fontSize: 11, padding: '4px 12px', marginTop: 6 }} onClick={clearCanvas}>
            Clear
          </button>
        </div>
      )}

      {mode === 'type' && (
        <div>
          <input
            className="chat-in"
            placeholder="Type your full name..."
            value={typedName}
            onChange={(e) => setTypedName(e.target.value)}
            style={{ marginBottom: 8 }}
          />
          {typedName && (
            <div className="sig-typed-preview">{typedName}</div>
          )}
        </div>
      )}

      {mode === 'after-print' && (
        <div className="sig-print-notice">
          The signature area will be left blank with a line for manual signing after printing.
        </div>
      )}
    </div>
  );
}

export default function ConfirmStep() {
  const {
    filledFields, fields, langLabel, langCode,
    updateFilledField, setStep, setUserConfirmed,
  } = useAppStore();

  const [editing, setEditing] = useState<Record<string, boolean>>({});
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [showSavePrompt, setShowSavePrompt] = useState(false);

  // Separate signature fields from data fields
  const sigFields = fields.filter((f) => f.type === 'signature');
  const dataFields = fields.filter((f) => f.type !== 'signature');

  const allFieldIds = dataFields.map((f) => f.id);
  const filledMap = new Map(filledFields.map((f) => [f.id, f]));

  const orderedFields = allFieldIds.map((id) => {
    const field = dataFields.find((f) => f.id === id) as FormField;
    const filled = filledMap.get(id);
    return {
      id,
      label: field.label,
      value: filled?.value || '',
      skipped: filled?.skipped || !filled,
      confidence: filled?.confidence,
      source: filled?.source,
    };
  });

  const filledCount = orderedFields.filter((f) => f.value && !f.skipped).length;

  const startEdit = (id: string, currentValue: string) => {
    setEditing((prev) => ({ ...prev, [id]: true }));
    setEditValues((prev) => ({ ...prev, [id]: currentValue }));
  };

  const saveEdit = (id: string) => {
    updateFilledField(id, editValues[id] || '');
    setEditing((prev) => ({ ...prev, [id]: false }));
  };

  const cancelEdit = (id: string) => {
    setEditing((prev) => ({ ...prev, [id]: false }));
  };

  const handleConfirm = () => {
    // Show save profile prompt before finalizing
    setShowSavePrompt(true);
  };

  const finalize = (shouldSave: boolean) => {
    if (shouldSave) {
      // Build field map from filled data
      const fieldValues: Record<string, string> = {};
      for (const f of filledFields) {
        if (f.value && !f.skipped) {
          fieldValues[f.id] = f.value;
        }
      }
      saveProfile(fieldValues);
    }
    setShowSavePrompt(false);
    setUserConfirmed(true);
    setStep(6);
  };

  const confidenceColor = (conf?: string) => {
    if (conf === 'high') return 'var(--gold)';
    if (conf === 'medium') return 'var(--warn)';
    if (conf === 'low') return 'var(--err)';
    return 'var(--border-light)';
  };

  return (
    <div className="card fade-in">
      <div className="res-header">
        <div>
          <div className="res-title">Review your form</div>
          <div className="res-lang">{langLabel} ({langCode})</div>
        </div>
        <span className="badge badge-ok">
          {filledCount}/{orderedFields.length} fields filled
        </span>
      </div>

      <div className="card-sub">
        Please review the information below. Click "Edit" on any field to make changes before finalizing.
      </div>

      <div className="fields-list">
        {orderedFields.map((f) => (
          <div key={f.id} className="field-row">
            <div className="f-label">{f.label}</div>
            <div className="f-val-wrap">
              {editing[f.id] ? (
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input
                    className="chat-in"
                    style={{ fontSize: 13, padding: '6px 10px' }}
                    value={editValues[f.id] || ''}
                    onChange={(e) =>
                      setEditValues((prev) => ({ ...prev, [f.id]: e.target.value }))
                    }
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit(f.id)}
                    autoFocus
                  />
                  <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 11 }} onClick={() => saveEdit(f.id)}>Save</button>
                  <button className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: 11 }} onClick={() => cancelEdit(f.id)}>Cancel</button>
                </div>
              ) : f.value && !f.skipped ? (
                <div>
                  <div className="f-val" style={{ borderLeftColor: confidenceColor(f.confidence) }}>{f.value}</div>
                  <div style={{ marginTop: 4, display: 'flex', gap: 8, alignItems: 'center' }}>
                    {f.source && (
                      <span style={{ fontSize: 10, color: 'var(--ink4)', fontFamily: 'var(--mono)' }}>
                        {f.source === 'freehand' ? 'from your text' : f.source === 'followup' ? 'from Q&A' : 'edited'}
                      </span>
                    )}
                    <button className="edit-btn" onClick={() => startEdit(f.id, f.value)}>Edit</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div className="f-skipped">Not provided</div>
                  <button className="edit-btn" onClick={() => startEdit(f.id, '')}>Add</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {sigFields.length > 0 && sigFields.map((sf) => (
        <SignatureField key={sf.id} fieldId={sf.id} label={sf.label} />
      ))}

      {showSavePrompt && (
        <div className="save-prompt fade-in" style={{
          marginTop: '1.5rem', padding: '1.25rem', background: 'var(--gold-dim)',
          border: '1px solid rgba(201,168,76,0.25)', borderRadius: 'var(--rad-lg)',
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--navy)', marginBottom: 6 }}>
            Save your details for next time?
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink3)', marginBottom: 12, lineHeight: 1.6 }}>
            {hasProfile()
              ? 'Update your saved profile with this form\'s details. Next time you fill a form, your info will be pre-filled automatically.'
              : 'Your details will be saved in this browser only. Next time you fill a form, your info will be pre-filled — you can always edit before confirming.'}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" onClick={() => finalize(true)}>
              {hasProfile() ? 'Update & finalize' : 'Save & finalize'}
            </button>
            <button className="btn btn-ghost" onClick={() => finalize(false)}>
              Skip — just finalize
            </button>
          </div>
        </div>
      )}

      {!showSavePrompt && (
        <div className="btn-row">
          <button className="btn btn-ghost" onClick={() => setStep(4)}>Back</button>
          <button className="btn btn-primary" onClick={handleConfirm}>
            Looks good — finalize
          </button>
        </div>
      )}
    </div>
  );
}
