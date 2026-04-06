import { useTaxStore } from '../../store/taxStore';
import TaxField from './TaxField';
import { TAX_YEARS, STEUERKLASSE_OPTIONS, RELIGION_OPTIONS, MARITAL_OPTIONS } from '../../data/taxConstants';

export default function TaxPersonalStep() {
  const { personal, updatePersonal, setStep } = useTaxStore();

  const isMarried = personal.maritalStatus === 'married';

  return (
    <div className="card fade-in">
      <div className="card-title">Personal Information</div>
      <div className="card-sub">Pers&ouml;nliche Angaben</div>

      <div className="tax-section">
        <TaxField
          label="Tax year"
          german="Steuerjahr"
          type="select"
          value={String(personal.taxYear)}
          onChange={(v) => updatePersonal({ taxYear: Number(v) })}
          options={TAX_YEARS.map((y) => ({ value: String(y), label: String(y) }))}
        />

        <div className="tax-row">
          <TaxField
            label="First name" german="Vorname" required
            value={personal.firstName}
            onChange={(v) => updatePersonal({ firstName: v })}
          />
          <TaxField
            label="Last name" german="Nachname" required
            value={personal.lastName}
            onChange={(v) => updatePersonal({ lastName: v })}
          />
        </div>

        <TaxField
          label="Date of birth" german="Geburtsdatum" type="date"
          value={personal.dateOfBirth}
          onChange={(v) => updatePersonal({ dateOfBirth: v })}
        />

        <div className="tax-row">
          <TaxField
            label="Street" german="Stra&szlig;e"
            value={personal.street}
            onChange={(v) => updatePersonal({ street: v })}
          />
          <TaxField
            label="House number" german="Hausnummer"
            value={personal.houseNumber}
            onChange={(v) => updatePersonal({ houseNumber: v })}
          />
        </div>

        <div className="tax-row">
          <TaxField
            label="Postal code" german="Postleitzahl"
            value={personal.postalCode}
            onChange={(v) => updatePersonal({ postalCode: v })}
            placeholder="e.g. 10115"
          />
          <TaxField
            label="City" german="Ort"
            value={personal.city}
            onChange={(v) => updatePersonal({ city: v })}
          />
        </div>
      </div>

      <div className="tax-section">
        <div className="tax-section-title">Tax Identification</div>
        <div className="tax-section-sub">Steuerliche Identifikation</div>

        <TaxField
          label="Tax identification number" german="Steueridentifikationsnummer" required
          value={personal.steuerIdentifikationsnummer}
          onChange={(v) => updatePersonal({ steuerIdentifikationsnummer: v })}
          placeholder="11-digit number"
          info="Your 11-digit tax ID, assigned when you first registered in Germany. Find it on your Lohnsteuerbescheinigung or any letter from the Finanzamt."
        />

        <TaxField
          label="Tax number (if existing)" german="Steuernummer"
          value={personal.steuernummer}
          onChange={(v) => updatePersonal({ steuernummer: v })}
          info="Assigned by your local Finanzamt after your first tax return. Leave blank if filing for the first time."
        />

        <TaxField
          label="Tax class" german="Steuerklasse" required
          type="select" value={personal.steuerklasse}
          onChange={(v) => updatePersonal({ steuerklasse: v as '' })}
          options={STEUERKLASSE_OPTIONS}
          info="Determines how much income tax your employer withholds monthly. Single = Class 1, Married = Class 3/4/5."
        />
      </div>

      <div className="tax-section">
        <div className="tax-section-title">Personal Status</div>
        <div className="tax-section-sub">Familienstand &amp; Religion</div>

        <TaxField
          label="Marital status" german="Familienstand"
          type="select" value={personal.maritalStatus}
          onChange={(v) => updatePersonal({ maritalStatus: v })}
          options={MARITAL_OPTIONS}
        />

        <TaxField
          label="Religion (for church tax)" german="Religionszugeh&ouml;rigkeit"
          type="select" value={personal.religion}
          onChange={(v) => updatePersonal({ religion: v })}
          options={RELIGION_OPTIONS}
          info="Church tax (8-9%) is automatically deducted if you're registered as Protestant (ev) or Catholic (rk) in Germany."
        />

        {isMarried && (
          <div className="tax-subsection">
            <div className="tax-section-title">Spouse Details</div>
            <div className="tax-section-sub">Angaben zum Ehepartner</div>
            <div className="tax-row">
              <TaxField
                label="Spouse first name" german="Vorname"
                value={personal.spouseFirstName}
                onChange={(v) => updatePersonal({ spouseFirstName: v })}
              />
              <TaxField
                label="Spouse last name" german="Nachname"
                value={personal.spouseLastName}
                onChange={(v) => updatePersonal({ spouseLastName: v })}
              />
            </div>
            <TaxField
              label="Spouse tax ID" german="Steuer-ID Ehepartner"
              value={personal.spouseTaxId}
              onChange={(v) => updatePersonal({ spouseTaxId: v })}
            />
            <TaxField
              label="Spouse tax class" german="Steuerklasse Ehepartner"
              type="select" value={personal.spouseSteuerklasse}
              onChange={(v) => updatePersonal({ spouseSteuerklasse: v as '' })}
              options={STEUERKLASSE_OPTIONS}
            />
          </div>
        )}
      </div>

      <div className="btn-row" style={{ marginTop: 24 }}>
        <button className="btn btn-ghost" onClick={() => setStep(2)}>&larr; Back</button>
        <button
          className="btn btn-primary"
          onClick={() => setStep(4)}
          disabled={!personal.firstName || !personal.lastName || !personal.steuerklasse}
        >
          Continue &rarr;
        </button>
      </div>
    </div>
  );
}
