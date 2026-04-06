import { useTaxStore } from '../../store/taxStore';
import TaxField from './TaxField';
import TaxCurrencyInput from './TaxCurrencyInput';
import { INSURANCE_TYPE_OPTIONS } from '../../data/taxConstants';

export default function TaxInsuranceStep() {
  const { insurance, updateInsurance, setStep } = useTaxStore();

  return (
    <div className="card fade-in">
      <div className="card-title">Insurance &amp; Pension</div>
      <div className="card-sub">Vorsorgeaufwand</div>

      <div className="tax-hint">
        These values are on your <strong>Lohnsteuerbescheinigung</strong>. Employee contributions are usually already deducted from your salary.
      </div>

      <div className="tax-section">
        <div className="tax-section-title">Mandatory Insurance</div>
        <div className="tax-section-sub">Pflichtversicherungen</div>

        <TaxField
          label="Health insurance type" german="Krankenversicherung"
          type="select" value={insurance.healthInsuranceType}
          onChange={(v) => updateInsurance({ healthInsuranceType: v })}
          options={INSURANCE_TYPE_OPTIONS}
          info="Most employees are in public insurance (GKV). High earners may opt for private (PKV)."
        />
        <TaxCurrencyInput
          label="Health insurance (employee share)" german="KV-Beitrag (AN-Anteil)"
          value={insurance.healthInsurancePaid}
          onChange={(v) => updateInsurance({ healthInsurancePaid: v })}
        />
        <TaxCurrencyInput
          label="Nursing care insurance" german="Pflegeversicherung"
          value={insurance.nursingInsurancePaid}
          onChange={(v) => updateInsurance({ nursingInsurancePaid: v })}
        />
        <TaxCurrencyInput
          label="Pension insurance (employee share)" german="Rentenversicherung (AN-Anteil)"
          value={insurance.pensionInsurancePaid}
          onChange={(v) => updateInsurance({ pensionInsurancePaid: v })}
        />
        <TaxCurrencyInput
          label="Unemployment insurance" german="Arbeitslosenversicherung"
          value={insurance.unemploymentInsurancePaid}
          onChange={(v) => updateInsurance({ unemploymentInsurancePaid: v })}
        />
      </div>

      <div className="tax-section">
        <div className="tax-section-title">Private Insurance</div>
        <div className="tax-section-sub">Weitere Versicherungen</div>

        {insurance.healthInsuranceType === 'private' && (
          <TaxCurrencyInput
            label="Private health insurance premiums" german="PKV-Beitr&auml;ge"
            value={insurance.privateHealthInsurance}
            onChange={(v) => updateInsurance({ privateHealthInsurance: v })}
          />
        )}
        <TaxCurrencyInput
          label="Disability insurance" german="Berufsunf&auml;higkeitsversicherung"
          value={insurance.disabilityInsurance}
          onChange={(v) => updateInsurance({ disabilityInsurance: v })}
        />
        <TaxCurrencyInput
          label="Liability insurance" german="Haftpflichtversicherung"
          value={insurance.liabilityInsurance}
          onChange={(v) => updateInsurance({ liabilityInsurance: v })}
        />
        <TaxCurrencyInput
          label="Accident insurance" german="Unfallversicherung"
          value={insurance.accidentInsurance}
          onChange={(v) => updateInsurance({ accidentInsurance: v })}
        />
      </div>

      <div className="tax-section">
        <div className="tax-section-title">Retirement Savings</div>
        <div className="tax-section-sub">Altersvorsorge</div>

        <TaxCurrencyInput
          label="Riester pension contributions" german="Riester-Beitr&auml;ge"
          value={insurance.riesterContributions}
          onChange={(v) => updateInsurance({ riesterContributions: v })}
          info="State-subsidized pension. Maximum \u20AC2,100/year for full subsidy."
        />
        <TaxCurrencyInput
          label="R&uuml;rup pension contributions" german="R&uuml;rup-Beitr&auml;ge (Basisrente)"
          value={insurance.ruerupContributions}
          onChange={(v) => updateInsurance({ ruerupContributions: v })}
          info="Also called Basisrente. Contributions are tax-deductible up to a yearly limit."
        />
      </div>

      <div className="btn-row" style={{ marginTop: 24 }}>
        <button className="btn btn-ghost" onClick={() => setStep(5)}>&larr; Back</button>
        <button className="btn btn-primary" onClick={() => setStep(7)}>
          Continue &rarr;
        </button>
      </div>
    </div>
  );
}
