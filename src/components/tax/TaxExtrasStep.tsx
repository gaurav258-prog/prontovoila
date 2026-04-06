import { useTaxStore } from '../../store/taxStore';
import TaxField from './TaxField';
import TaxCurrencyInput from './TaxCurrencyInput';
import { TAX_RATES } from '../../data/taxConstants';

export default function TaxExtrasStep() {
  const { special, updateSpecial, personal, setStep } = useTaxStore();
  const rates = TAX_RATES[personal.taxYear] || TAX_RATES[2024];

  return (
    <div className="card fade-in">
      <div className="card-title">Special Expenses &amp; Extras</div>
      <div className="card-sub">Sonderausgaben, haushaltsnahe Dienstleistungen &amp; Kapitalertr&auml;ge</div>

      <div className="tax-section">
        <div className="tax-section-title">Donations</div>
        <div className="tax-section-sub">Spenden</div>

        <TaxCurrencyInput
          label="Donations to charitable organizations" german="Spenden"
          value={special.donations}
          onChange={(v) => updateSpecial({ donations: v })}
          info="Donations to registered German charities are fully deductible. Keep your receipts (Spendenbescheinigung)."
        />
        {special.donations > 0 && (
          <TaxField
            label="Recipients" german="Spendenempf&auml;nger"
            value={special.donationRecipients}
            onChange={(v) => updateSpecial({ donationRecipients: v })}
            placeholder="e.g. Red Cross, UNICEF"
          />
        )}
      </div>

      <div className="tax-section">
        <div className="tax-section-title">Household Services</div>
        <div className="tax-section-sub">Haushaltsnahe Dienstleistungen &amp; Handwerkerleistungen</div>

        <TaxCurrencyInput
          label="Cleaning service" german="Reinigungskraft"
          value={special.cleaningService}
          onChange={(v) => updateSpecial({ cleaningService: v })}
          info={`20% of costs are directly deducted from your tax, up to \u20AC${rates.haushaltsnaheDienstleistungenMaxReduction} total tax reduction for all household services`}
        />
        <TaxCurrencyInput
          label="Gardening service" german="Gartenpflege"
          value={special.gardeningService}
          onChange={(v) => updateSpecial({ gardeningService: v })}
        />
        <TaxCurrencyInput
          label="Craftsmen services (labor costs only)" german="Handwerkerleistungen"
          value={special.handwerkerleistungen}
          onChange={(v) => updateSpecial({ handwerkerleistungen: v })}
          info={`20% of labor costs deducted from tax, max \u20AC${rates.handwerkerleistungenMaxReduction} tax reduction. Only labor, not materials.`}
        />
        {special.handwerkerleistungen > 0 && (
          <TaxField
            label="Description of work" german="Beschreibung"
            value={special.handwerkerDetails}
            onChange={(v) => updateSpecial({ handwerkerDetails: v })}
            placeholder="e.g. bathroom renovation, painting"
          />
        )}
      </div>

      <div className="tax-section">
        <div className="tax-section-title">Childcare</div>
        <div className="tax-section-sub">Kinderbetreuungskosten</div>

        <TaxField
          label="Number of children" german="Anzahl Kinder"
          type="number" value={String(special.numberOfChildren || '')}
          onChange={(v) => updateSpecial({ numberOfChildren: Number(v) || 0 })}
        />
        {special.numberOfChildren > 0 && (
          <TaxCurrencyInput
            label="Total childcare costs" german="Kinderbetreuungskosten"
            value={special.childcare}
            onChange={(v) => updateSpecial({ childcare: v })}
            info="Kita, nanny, after-school care. 2/3 of costs deductible, up to \u20AC4,000 per child per year."
          />
        )}
      </div>

      <div className="tax-section">
        <div className="tax-section-title">Investment Income</div>
        <div className="tax-section-sub">Kapitalertr&auml;ge</div>

        <TaxField
          label="Did you have investment income?" german="Kapitalertr&auml;ge"
          type="yesno" value={special.hasInvestmentIncome ? 'yes' : 'no'}
          onChange={(v) => updateSpecial({ hasInvestmentIncome: v === 'yes' })}
          info="Interest, dividends, or capital gains from stocks, funds, or savings accounts"
        />
        {special.hasInvestmentIncome && (
          <div className="tax-subsection">
            <TaxCurrencyInput
              label="Total investment income" german="H&ouml;he der Kapitalertr&auml;ge"
              value={special.investmentIncome}
              onChange={(v) => updateSpecial({ investmentIncome: v })}
            />
            <TaxCurrencyInput
              label="Withholding tax paid" german="Einbehaltene Abgeltungssteuer"
              value={special.withheldAbgeltungssteuer}
              onChange={(v) => updateSpecial({ withheldAbgeltungssteuer: v })}
              info="25% flat tax automatically withheld by your bank"
            />
            <TaxField
              label="Did you use a Freistellungsauftrag?" german="Freistellungsauftrag erteilt?"
              type="yesno" value={special.sparerPauschbetragUsed ? 'yes' : 'no'}
              onChange={(v) => updateSpecial({ sparerPauschbetragUsed: v === 'yes' })}
              info={`Tax-free allowance of \u20AC${personal.maritalStatus === 'married' ? rates.sparerPauschbetragMarried : rates.sparerPauschbetragSingle} for investment income. If set up with your bank, they won't withhold tax on income below this threshold.`}
            />
          </div>
        )}
      </div>

      <div className="btn-row" style={{ marginTop: 24 }}>
        <button className="btn btn-ghost" onClick={() => setStep(6)}>&larr; Back</button>
        <button className="btn btn-primary" onClick={() => setStep(8)}>
          Generate Tax Analysis &rarr;
        </button>
      </div>
    </div>
  );
}
