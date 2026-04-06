import Header from '../components/Header';
import TaxStepBar from '../components/tax/TaxStepBar';
import TaxLanguageStep from '../components/tax/TaxLanguageStep';
import TaxBriefingStep from '../components/tax/TaxBriefingStep';
import TaxPersonalStep from '../components/tax/TaxPersonalStep';
import TaxIncomeStep from '../components/tax/TaxIncomeStep';
import TaxDeductionsStep from '../components/tax/TaxDeductionsStep';
import TaxInsuranceStep from '../components/tax/TaxInsuranceStep';
import TaxExtrasStep from '../components/tax/TaxExtrasStep';
import TaxSummaryStep from '../components/tax/TaxSummaryStep';
import { useTaxStore } from '../store/taxStore';
import '../styles/app.css';
import '../styles/tax.css';

export default function TaxPage() {
  const step = useTaxStore((s) => s.step);

  const renderStep = () => {
    switch (step) {
      case 1: return <TaxLanguageStep />;
      case 2: return <TaxBriefingStep />;
      case 3: return <TaxPersonalStep />;
      case 4: return <TaxIncomeStep />;
      case 5: return <TaxDeductionsStep />;
      case 6: return <TaxInsuranceStep />;
      case 7: return <TaxExtrasStep />;
      case 8: return <TaxSummaryStep />;
      default: return <TaxLanguageStep />;
    }
  };

  return (
    <div className="shell">
      <Header />
      <div style={{ margin: '8px 0 16px', textAlign: 'center' }}>
        <span style={{ fontSize: 13, color: 'var(--ink3)', fontWeight: 500 }}>
          German Personal Tax Filing &middot; <span style={{ color: 'var(--ink4)' }}>Einkommensteuererkl&auml;rung</span>
        </span>
      </div>
      <TaxStepBar />
      <div className="fade-in" key={step}>
        {renderStep()}
      </div>
    </div>
  );
}
