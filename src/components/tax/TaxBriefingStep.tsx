import { useState } from 'react';
import { useTaxStore } from '../../store/taxStore';
import { parseTaxBriefing } from '../../services/taxAnalysis';

export default function TaxBriefingStep() {
  const {
    langLabel, briefingText, setBriefingText, setBriefingParsed,
    updatePersonal, updateEmployment, updateExpenses, updateInsurance, updateSpecial,
    setStep, setError,
  } = useTaxStore();

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
          <div className="spin-lbl">Analyzing your information...</div>
          <div className="spin-sub">Extracting tax-relevant details from your description</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card fade-in">
      <div className="card-title">Tell us about your tax situation</div>
      <div className="card-sub">Write freely in {langLabel} &mdash; we&rsquo;ll extract the relevant details</div>

      <div className="tax-hint">
        Describe your situation in your own words. For example: your job, salary, how you commute, whether you work from home, any insurance you pay, donations, children, etc. The more you share, the more we can pre-fill for you.
      </div>

      <div className="tax-briefing-example">
        <strong>Example:</strong> &ldquo;My name is Maria Santos, born on 15 March 1990. I live at Hauptstra&szlig;e 42, 69115 Heidelberg. My tax ID is 12345678901. I work as a software engineer at SAP in Walldorf, earning &euro;75,000 per year. They withheld about &euro;15,800 in income tax and &euro;870 solidarity surcharge. I drive 35km to work each day, about 220 days a year. I worked from home about 80 days last year. I bought a new laptop for &euro;1,200 for work. I&rsquo;m single, tax class 1, no church tax. I pay public health insurance &mdash; around &euro;3,200 employee share, plus &euro;1,100 nursing care and &euro;7,200 pension. I donated &euro;200 to UNICEF. I also paid &euro;600 for a cleaning lady.&rdquo;
      </div>

      <textarea
        className="tax-briefing-area"
        value={localText}
        onChange={(e) => setLocalText(e.target.value)}
        placeholder={`Describe your tax situation in ${langLabel}...`}
        rows={8}
      />

      <div className="btn-row" style={{ marginTop: 16 }}>
        <button className="btn btn-ghost" onClick={() => setStep(1)}>&larr; Back</button>
        <button className="btn btn-ghost" onClick={handleSkip}>Skip &mdash; I&rsquo;ll fill manually</button>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={!localText.trim()}
        >
          Analyze &amp; pre-fill &rarr;
        </button>
      </div>
    </div>
  );
}
