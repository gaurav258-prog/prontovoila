import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import type { FormField } from '../types';

export default function ConfirmStep() {
  const {
    filledFields, fields, langLabel, langCode,
    updateFilledField, setStep, setUserConfirmed,
  } = useAppStore();

  const [editing, setEditing] = useState<Record<string, boolean>>({});
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  // Build complete field list: filled + any fields not yet in filledFields
  const allFieldIds = fields.map((f) => f.id);
  const filledMap = new Map(filledFields.map((f) => [f.id, f]));

  const orderedFields = allFieldIds.map((id) => {
    const field = fields.find((f) => f.id === id) as FormField;
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
    setUserConfirmed(true);
    setStep(6);
  };

  const confidenceColor = (conf?: string) => {
    if (conf === 'high') return 'var(--ok)';
    if (conf === 'medium') return 'var(--warn)';
    if (conf === 'low') return 'var(--err)';
    return 'var(--paper3)';
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
                  <button
                    className="btn btn-primary"
                    style={{ padding: '6px 12px', fontSize: 11 }}
                    onClick={() => saveEdit(f.id)}
                  >
                    Save
                  </button>
                  <button
                    className="btn btn-ghost"
                    style={{ padding: '6px 10px', fontSize: 11 }}
                    onClick={() => cancelEdit(f.id)}
                  >
                    Cancel
                  </button>
                </div>
              ) : f.value && !f.skipped ? (
                <div>
                  <div
                    className="f-val"
                    style={{ borderLeftColor: confidenceColor(f.confidence) }}
                  >
                    {f.value}
                  </div>
                  <div style={{ marginTop: 4, display: 'flex', gap: 8, alignItems: 'center' }}>
                    {f.source && (
                      <span style={{ fontSize: 10, color: 'var(--ink4)', fontFamily: 'var(--mono)' }}>
                        {f.source === 'freehand' ? 'from your text' : f.source === 'followup' ? 'from Q&A' : 'edited'}
                      </span>
                    )}
                    <button
                      className="edit-btn"
                      onClick={() => startEdit(f.id, f.value)}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div className="f-skipped">Not provided</div>
                  <button
                    className="edit-btn"
                    onClick={() => startEdit(f.id, '')}
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="btn-row">
        <button className="btn btn-ghost" onClick={() => setStep(4)}>Back</button>
        <button className="btn btn-primary" onClick={handleConfirm}>
          Looks good — finalize
        </button>
      </div>
    </div>
  );
}
