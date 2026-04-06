import { useState } from 'react';
import { useTaxStore } from '../../store/taxStore';
import { parseTaxBriefing } from '../../services/taxAnalysis';

const EN_STRINGS = {
  hint: 'Describe your situation in your own words. For example: your job, salary, how you commute, whether you work from home, any insurance you pay, donations, children, etc. The more you share, the more we can pre-fill for you.',
  exampleText: 'My name is Maria Santos, born on 15 March 1990. I live at Hauptstraße 42, 69115 Heidelberg. My tax ID is 12345678901. I work as a software engineer at SAP in Walldorf, earning €75,000 per year. They withheld about €15,800 in income tax and €870 solidarity surcharge. I drive 35km to work each day, about 220 days a year. I worked from home about 80 days last year. I bought a new laptop for €1,200 for work. I\'m single, tax class 1, no church tax. I pay public health insurance — around €3,200 employee share, plus €1,100 nursing care and €7,200 pension. I donated €200 to UNICEF. I also paid €600 for a cleaning lady.',
  placeholder: 'Describe your tax situation in English…',
  analyzeBtn: 'Analyze & pre-fill →',
  skipBtn: 'Skip — I\'ll fill manually',
  analyzingLabel: 'Analyzing your information…',
  analyzingSub: 'Extracting tax-relevant details from your description',
};

export default function TaxBriefingStep() {
  const {
    langLabel, briefingText, briefingStrings,
    setBriefingText, setBriefingParsed,
    updatePersonal, updateEmployment, updateExpenses, updateInsurance, updateSpecial,
    setStep, setError,
  } = useTaxStore();

  const s = briefingStrings ?? EN_STRINGS;

  const [localText, setLocalText] = useState(briefingText);
  const [parsing, setParsing] = useState(false);

  const handleSubmit = async () => {
    if (!localText.trim()) return;
    setParsing(true);
    setBriefingText(localText);

    try {
      const result = await parseTaxBriefing(localText, langLabel);
      if (result.personal) updatePersonal(result.personal);
      if (result.employment) updateEmployment(result.employment);
      if (result.expenses) updateExpenses(result.expenses);
      if (result.insurance) updateInsurance(result.insurance);
      if (result.special) updateSpecial(result.special);
      setBriefingParsed(true);
      setStep(3);
    } catch (err) {
      console.error('Briefing parse failed:', err);
      setError('Failed to analyze your information. You can continue filling in manually.');
      setBriefingParsed(false);
      setStep(3);
    }
  };

  const handleSkip = () => {
    setStep(3);
  };

  if (parsing) {
    return (
      <div className="card fade-in">
        <div className="spin-wrap">
          <div className="spinner" />
          <div className="spin-lbl">{s.analyzingLabel}</div>
          <div className="spin-sub">{s.analyzingSub}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card fade-in">
      <div className="card-title">Tell us about your tax situation</div>
      <div className="card-sub">Write freely in {langLabel} &mdash; we&rsquo;ll extract the relevant details</div>

      <div className="tax-hint">{s.hint}</div>

      <div className="tax-briefing-example">
        <strong>Example:</strong> &ldquo;{s.exampleText}&rdquo;
      </div>

      <textarea
        className="tax-briefing-area"
        value={localText}
        onChange={(e) => setLocalText(e.target.value)}
        placeholder={s.placeholder}
        rows={8}
      />

      <div className="btn-row" style={{ marginTop: 16 }}>
        <button className="btn btn-ghost" onClick={() => setStep(1)}>&larr; Back</button>
        <button className="btn btn-ghost" onClick={handleSkip}>{s.skipBtn}</button>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={!localText.trim()}
        >
          {s.analyzeBtn}
        </button>
      </div>
    </div>
  );
}
