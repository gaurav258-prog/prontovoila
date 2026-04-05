import { useAppStore } from '../store/appStore';
import { STEPS } from '../data/languages';

export default function StepBar() {
  const step = useAppStore((s) => s.step);

  return (
    <div className="stepbar">
      {STEPS.map((label, i) => {
        const num = i + 1;
        const isDone = num < step;
        const isActive = num === step;
        const cls = isDone ? 'done' : isActive ? 'active' : '';

        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : undefined }}>
            <div className={`s-item ${cls}`}>
              <div className="s-dot">{isDone ? '\u2713' : num}</div>
              <span>{label}</span>
            </div>
            {i < STEPS.length - 1 && <div className="s-line" />}
          </div>
        );
      })}
    </div>
  );
}
