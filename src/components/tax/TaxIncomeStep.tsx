import { useTaxStore } from '../../store/taxStore';
import TaxField from './TaxField';
import TaxCurrencyInput from './TaxCurrencyInput';

export default function TaxIncomeStep() {
  const { employment, updateEmployment, setStep } = useTaxStore();

  return (
    <div className="card fade-in">
      <div className="card-title">Employment Income</div>
      <div className="card-sub">Eink&uuml;nfte aus nichtselbst&auml;ndiger Arbeit &middot; Anlage N</div>

      <div className="tax-hint">
        You can find all these values on your <strong>Lohnsteuerbescheinigung</strong> (annual tax certificate) from your employer, typically received in February.
      </div>

      <div className="tax-section">
        <TaxField
          label="Employer name" german="Arbeitgeber" required
          value={employment.employerName}
          onChange={(v) => updateEmployment({ employerName: v })}
        />
        <TaxField
          label="Employer address" german="Anschrift des Arbeitgebers"
          value={employment.employerAddress}
          onChange={(v) => updateEmployment({ employerAddress: v })}
        />
      </div>

      <div className="tax-section">
        <div className="tax-section-title">Income &amp; Tax Withheld</div>
        <div className="tax-section-sub">Bruttolohn &amp; einbehaltene Steuern</div>

        <TaxCurrencyInput
          label="Gross annual salary" german="Bruttoarbeitslohn (Zeile 3)"
          value={employment.grossSalary}
          onChange={(v) => updateEmployment({ grossSalary: v })}
          info="Line 3 of your Lohnsteuerbescheinigung"
        />
        <TaxCurrencyInput
          label="Income tax withheld" german="Einbehaltene Lohnsteuer (Zeile 4)"
          value={employment.lohnsteuerPaid}
          onChange={(v) => updateEmployment({ lohnsteuerPaid: v })}
          info="Line 4 — this is the tax already paid by your employer on your behalf"
        />
        <TaxCurrencyInput
          label="Solidarity surcharge" german="Solidarit&auml;tszuschlag (Zeile 5)"
          value={employment.solidaritaetszuschlag}
          onChange={(v) => updateEmployment({ solidaritaetszuschlag: v })}
          info="Line 5 — 5.5% surcharge on income tax (often 0 for lower incomes)"
        />
        <TaxCurrencyInput
          label="Church tax withheld" german="Kirchensteuer (Zeile 6)"
          value={employment.kirchensteuerPaid}
          onChange={(v) => updateEmployment({ kirchensteuerPaid: v })}
          info="Line 6 — only if registered for church tax"
        />
        <TaxCurrencyInput
          label="Social security contributions (employee)" german="AN-Beitr&auml;ge Sozialversicherung"
          value={employment.socialSecurityEmployee}
          onChange={(v) => updateEmployment({ socialSecurityEmployee: v })}
          info="Total employee share of health, pension, nursing, and unemployment insurance"
        />
      </div>

      <div className="tax-section">
        <TaxField
          label="Multiple employers?" german="Mehrere Arbeitgeber?"
          type="yesno"
          value={employment.hasMultipleEmployers ? 'yes' : 'no'}
          onChange={(v) => updateEmployment({ hasMultipleEmployers: v === 'yes' })}
          info="Select yes if you had more than one employer during the tax year"
        />

        {employment.hasMultipleEmployers && (
          <div className="tax-subsection">
            {employment.additionalEmployments.map((emp, idx) => (
              <div key={idx} className="tax-additional-employer">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="tax-section-title">Additional Employer {idx + 1}</span>
                  <button
                    className="btn btn-ghost"
                    style={{ fontSize: 12, padding: '2px 8px' }}
                    onClick={() => {
                      const updated = [...employment.additionalEmployments];
                      updated.splice(idx, 1);
                      updateEmployment({ additionalEmployments: updated });
                    }}
                  >Remove</button>
                </div>
                <TaxField
                  label="Employer name" german="Arbeitgeber"
                  value={emp.employerName}
                  onChange={(v) => {
                    const updated = [...employment.additionalEmployments];
                    updated[idx] = { ...updated[idx], employerName: v };
                    updateEmployment({ additionalEmployments: updated });
                  }}
                />
                <TaxCurrencyInput
                  label="Gross salary" german="Bruttoarbeitslohn"
                  value={emp.grossSalary}
                  onChange={(v) => {
                    const updated = [...employment.additionalEmployments];
                    updated[idx] = { ...updated[idx], grossSalary: v };
                    updateEmployment({ additionalEmployments: updated });
                  }}
                />
                <TaxCurrencyInput
                  label="Tax withheld" german="Lohnsteuer"
                  value={emp.lohnsteuerPaid}
                  onChange={(v) => {
                    const updated = [...employment.additionalEmployments];
                    updated[idx] = { ...updated[idx], lohnsteuerPaid: v };
                    updateEmployment({ additionalEmployments: updated });
                  }}
                />
              </div>
            ))}
            <button
              className="btn btn-ghost"
              style={{ marginTop: 8 }}
              onClick={() => {
                updateEmployment({
                  additionalEmployments: [
                    ...employment.additionalEmployments,
                    { employerName: '', grossSalary: 0, lohnsteuerPaid: 0 },
                  ],
                });
              }}
            >+ Add another employer</button>
          </div>
        )}
      </div>

      <div className="btn-row" style={{ marginTop: 24 }}>
        <button className="btn btn-ghost" onClick={() => setStep(3)}>&larr; Back</button>
        <button
          className="btn btn-primary"
          onClick={() => setStep(5)}
          disabled={!employment.employerName || employment.grossSalary === 0}
        >
          Continue &rarr;
        </button>
      </div>
    </div>
  );
}
