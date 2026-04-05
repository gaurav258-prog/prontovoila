import { useAppStore } from '../store/appStore';

export default function ResultsStep() {
  const { filledFields, formMeta, langLabel, langCode, file, reset } = useAppStore();

  const filled = filledFields.filter((f) => !f.skipped);

  const handleDownloadJSON = () => {
    const data = {
      form: formMeta?.title,
      language: langLabel,
      fileName: file?.name,
      fields: filledFields.map((f) => ({
        label: f.label,
        value: f.value,
        skipped: f.skipped || false,
      })),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prontovoila-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCSV = () => {
    const rows = [['Field', 'Value', 'Skipped']];
    filledFields.forEach((f) => {
      rows.push([f.label, f.value || '', f.skipped ? 'Yes' : 'No']);
    });
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prontovoila-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card fade-in">
      <div className="res-header">
        <div>
          <div className="res-title">{formMeta?.title || 'Form Results'}</div>
          <div className="res-lang">
            {langLabel} ({langCode})
          </div>
        </div>
        <span className="badge badge-ok">
          {filled.length}/{filledFields.length} fields filled
        </span>
      </div>

      <div className="dl-row" style={{ marginBottom: 20 }}>
        <button className="dl-btn" onClick={handleDownloadJSON}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M7 2v8m0 0l-3-3m3 3l3-3M2 12h10" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          JSON
        </button>
        <button className="dl-btn" onClick={handleDownloadCSV}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M7 2v8m0 0l-3-3m3 3l3-3M2 12h10" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          CSV
        </button>
      </div>

      <div className="fields-list">
        {filledFields.map((f) => (
          <div key={f.id} className="field-row">
            <div className="f-label">{f.label}</div>
            <div className="f-val-wrap">
              {f.skipped ? (
                <div className="f-skipped">Skipped</div>
              ) : (
                <div className="f-val">{f.value}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="btn-row">
        <button className="btn btn-primary" onClick={reset}>
          Fill another form
        </button>
      </div>
    </div>
  );
}
