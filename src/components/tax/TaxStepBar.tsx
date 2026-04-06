import { useTaxStore } from '../../store/taxStore';
import { TAX_STEP_LABELS } from '../../data/taxConstants';

export default function TaxStepBar() {
  const step = useTaxStore((s) => s.step);
  const setStep = useTaxStore((s) => s.setStep);

  return (
    <div className="stepbar">
      {TAX_STEP_LABELS.map((label, i) => {
        const num = i + 1;
        const isDone = num < step;
        const isActive = num === step;
        const cls = isDone ? 'done' : isActive ? 'active' : '';

        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < TAX_STEP_LABELS.length - 1 ? 1 : undefined }}>
            <div
              className={`s-item ${cls}`}
              style={isDone ? { cursor: 'pointer' } : undefined}
              onClick={isDone ? () => setStep(num as import('../../store/taxStore').TaxStep) : undefined}
            >
              <div className="s-dot">{isDone ? '\u2713' : num}</div>
              <span>{label}</span>
            </div>
            {i < TAX_STEP_LABELS.length - 1 && <div className="s-line" />}
          </div>
        );
      })}
    </div>
  );
}
