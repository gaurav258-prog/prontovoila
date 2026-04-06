import { useTaxStore } from '../../store/taxStore';
import TaxField from './TaxField';
import TaxCurrencyInput from './TaxCurrencyInput';
import { COMMUTE_OPTIONS, TAX_RATES } from '../../data/taxConstants';

export default function TaxDeductionsStep() {
  const { expenses, updateExpenses, personal, setStep } = useTaxStore();

  const rates = TAX_RATES[personal.taxYear] || TAX_RATES[2024];

  // Calculate itemized deductions total
  const commuteFirst20 = Math.min(expenses.commuteDistanceKm, 20) * rates.entfernungspauschaleFirst20 * expenses.commuteDaysPerYear;
  const commuteAbove20 = Math.max(expenses.commuteDistanceKm - 20, 0) * rates.entfernungspauschaleAbove20 * expenses.commuteDaysPerYear;
  const commuteDeduction = Math.max(commuteFirst20 + commuteAbove20, expenses.publicTransportCost);
  const homeOfficeDeduction = Math.min(expenses.homeOfficeDays * rates.homeofficePauschalePerDay, rates.homeofficePauschaleMax);
  const itemizedTotal = commuteDeduction + homeOfficeDeduction +
    expenses.workEquipmentCosts + expenses.trainingCosts +
    expenses.professionalLiterature + expenses.unionDues + expenses.movingCosts +
    (expenses.hasDoubleHousehold ? expenses.doubleHouseholdRent * expenses.doubleHouseholdMonths : 0);

  const pauschale = rates.werbungskostenpauschale;
  const worthItemizing = itemizedTotal > pauschale;

  return (
    <div className="card fade-in">
      <div className="card-title">Work-Related Deductions</div>
      <div className="card-sub">Werbungskosten</div>

      <div className={`tax-deduction-meter ${worthItemizing ? 'above' : 'below'}`}>
        <div className="tax-meter-bar">
          <div
            className="tax-meter-fill"
            style={{ width: `${Math.min(100, (itemizedTotal / pauschale) * 100)}%` }}
          />
          <div className="tax-meter-threshold" />
        </div>
        <div className="tax-meter-labels">
          <span>Your deductions: &euro;{itemizedTotal.toFixed(0)}</span>
          <span>Flat rate: &euro;{pauschale}</span>
        </div>
        <div className="tax-meter-verdict">
          {worthItemizing
            ? `Itemizing saves you \u20AC${(itemizedTotal - pauschale).toFixed(0)} over the flat rate`
            : `You're \u20AC${(pauschale - itemizedTotal).toFixed(0)} below the flat rate \u2014 the flat rate will be applied automatically`
          }
        </div>
      </div>

      <div className="tax-section">
        <div className="tax-section-title">Commute</div>
        <div className="tax-section-sub">Entfernungspauschale</div>

        <TaxField
          label="One-way distance to work" german="Entfernung Wohnung&ndash;Arbeit (km)"
          type="number" value={String(expenses.commuteDistanceKm || '')}
          onChange={(v) => updateExpenses({ commuteDistanceKm: Number(v) || 0 })}
          info="Shortest route, one way. You get \u20AC0.30/km for the first 20 km and \u20AC0.38/km beyond."
          placeholder="km"
        />
        <TaxField
          label="Working days commuted" german="Arbeitstage"
          type="number" value={String(expenses.commuteDaysPerYear)}
          onChange={(v) => updateExpenses({ commuteDaysPerYear: Number(v) || 0 })}
          info="Typically 220\u2013230 days per year for a full-time job"
        />
        <TaxField
          label="Commute method" german="Verkehrsmittel"
          type="select" value={expenses.commuteMethod}
          onChange={(v) => updateExpenses({ commuteMethod: v })}
          options={COMMUTE_OPTIONS}
        />
        {(expenses.commuteMethod === 'public_transport' || expenses.commuteMethod === 'mixed') && (
          <TaxCurrencyInput
            label="Annual public transport cost" german="Fahrtkosten &Ouml;PNV"
            value={expenses.publicTransportCost}
            onChange={(v) => updateExpenses({ publicTransportCost: v })}
            info="If higher than the distance-based flat rate, this amount is used instead"
          />
        )}
      </div>

      <div className="tax-section">
        <div className="tax-section-title">Home Office</div>
        <div className="tax-section-sub">Homeoffice-Pauschale</div>

        <TaxField
          label="Days worked from home" german="Homeoffice-Tage"
          type="number" value={String(expenses.homeOfficeDays || '')}
          onChange={(v) => updateExpenses({ homeOfficeDays: Number(v) || 0 })}
          info={`\u20AC${rates.homeofficePauschalePerDay}/day, max \u20AC${rates.homeofficePauschaleMax}/year (${Math.floor(rates.homeofficePauschaleMax / rates.homeofficePauschalePerDay)} days)`}
        />
        <TaxField
          label="Dedicated home office room?" german="H&auml;usliches Arbeitszimmer"
          type="yesno" value={expenses.hasDedicatedRoom ? 'yes' : 'no'}
          onChange={(v) => updateExpenses({ hasDedicatedRoom: v === 'yes' })}
          info="A separate room used exclusively for work. If yes, you can deduct the proportional rent and utilities instead of the flat rate."
        />
        {expenses.hasDedicatedRoom && (
          <TaxCurrencyInput
            label="Monthly room costs" german="Kosten Arbeitszimmer (monatlich)"
            value={expenses.dedicatedRoomCost}
            onChange={(v) => updateExpenses({ dedicatedRoomCost: v })}
            info="Proportional share of rent + utilities for your work room"
          />
        )}
      </div>

      <div className="tax-section">
        <div className="tax-section-title">Other Work Expenses</div>
        <div className="tax-section-sub">Sonstige Werbungskosten</div>

        <TaxCurrencyInput
          label="Work equipment" german="Arbeitsmittel"
          value={expenses.workEquipmentCosts}
          onChange={(v) => updateExpenses({ workEquipmentCosts: v })}
          info="Laptop, desk, chair, monitor, etc. Items over \u20AC800 must be depreciated over multiple years."
        />
        {expenses.workEquipmentCosts > 0 && (
          <TaxField
            label="Equipment details" german="Beschreibung"
            value={expenses.workEquipmentDetails}
            onChange={(v) => updateExpenses({ workEquipmentDetails: v })}
            placeholder="e.g. Laptop, desk, office chair"
          />
        )}
        <TaxCurrencyInput
          label="Training & courses" german="Fortbildungskosten"
          value={expenses.trainingCosts}
          onChange={(v) => updateExpenses({ trainingCosts: v })}
        />
        <TaxCurrencyInput
          label="Professional literature" german="Fachliteratur"
          value={expenses.professionalLiterature}
          onChange={(v) => updateExpenses({ professionalLiterature: v })}
        />
        <TaxCurrencyInput
          label="Union dues" german="Gewerkschaftsbeitrag"
          value={expenses.unionDues}
          onChange={(v) => updateExpenses({ unionDues: v })}
        />
        <TaxCurrencyInput
          label="Job-related moving costs" german="Umzugskosten"
          value={expenses.movingCosts}
          onChange={(v) => updateExpenses({ movingCosts: v })}
          info="Only deductible if you moved for work (e.g. commute shortened by at least 1 hour)"
        />
      </div>

      <div className="tax-section">
        <TaxField
          label="Double household (doppelte Haushaltsfhrung)?" german="Doppelte Haushaltsf&uuml;hrung"
          type="yesno" value={expenses.hasDoubleHousehold ? 'yes' : 'no'}
          onChange={(v) => updateExpenses({ hasDoubleHousehold: v === 'yes' })}
          info="If you maintain a second home near your workplace while keeping your primary home elsewhere"
        />
        {expenses.hasDoubleHousehold && (
          <div className="tax-subsection">
            <TaxCurrencyInput
              label="Monthly rent at work location" german="Miete Zweitwohnung"
              value={expenses.doubleHouseholdRent}
              onChange={(v) => updateExpenses({ doubleHouseholdRent: v })}
            />
            <TaxField
              label="Number of months" german="Anzahl Monate"
              type="number" value={String(expenses.doubleHouseholdMonths || '')}
              onChange={(v) => updateExpenses({ doubleHouseholdMonths: Number(v) || 0 })}
            />
          </div>
        )}
      </div>

      <div className="btn-row" style={{ marginTop: 24 }}>
        <button className="btn btn-ghost" onClick={() => setStep(4)}>&larr; Back</button>
        <button className="btn btn-primary" onClick={() => setStep(6)}>
          Continue &rarr;
        </button>
      </div>
    </div>
  );
}
