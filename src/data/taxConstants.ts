// German tax constants for 2024/2025

export const TAX_YEARS = [2025, 2024, 2023];

export const STEUERKLASSE_OPTIONS = [
  { value: '1', label: 'Class 1', de: 'Steuerklasse I', desc: 'Single, divorced, or widowed — standard class for most single employees' },
  { value: '2', label: 'Class 2', de: 'Steuerklasse II', desc: 'Single parent living with a child — gives you a higher tax-free allowance' },
  { value: '3', label: 'Class 3', de: 'Steuerklasse III', desc: 'Married and the higher earner — your spouse takes Class 5. Less tax withheld monthly' },
  { value: '4', label: 'Class 4', de: 'Steuerklasse IV', desc: 'Married and both earn roughly the same — equal withholding for both partners' },
  { value: '5', label: 'Class 5', de: 'Steuerklasse V', desc: 'Married and the lower earner — your spouse takes Class 3. More tax withheld monthly' },
  { value: '6', label: 'Class 6', de: 'Steuerklasse VI', desc: 'Second or additional job — highest withholding rate, used for side employment' },
];

export const RELIGION_OPTIONS = [
  { value: 'none', label: 'None', de: 'Keine', desc: 'No church tax will be deducted from your salary' },
  { value: 'ev', label: 'Protestant', de: 'Evangelisch', desc: '8–9% church tax on your income tax — deducted automatically by your employer' },
  { value: 'rk', label: 'Roman Catholic', de: 'Römisch-Katholisch', desc: '8–9% church tax on your income tax — deducted automatically by your employer' },
  { value: 'other', label: 'Other', de: 'Sonstige', desc: 'Other registered religious community — check if church tax applies' },
];

export const MARITAL_OPTIONS = [
  { value: 'single', label: 'Single', de: 'Ledig', desc: 'Never married' },
  { value: 'married', label: 'Married', de: 'Verheiratet', desc: 'You can file jointly with your spouse for potential tax savings' },
  { value: 'separated', label: 'Separated', de: 'Getrennt lebend', desc: 'Living apart from your spouse — joint filing may still be possible in the separation year' },
  { value: 'divorced', label: 'Divorced', de: 'Geschieden', desc: 'Legally divorced — filed as single' },
  { value: 'widowed', label: 'Widowed', de: 'Verwitwet', desc: 'You may get favorable tax treatment for up to 2 years after your spouse\'s passing' },
];

export const COMMUTE_OPTIONS = [
  { value: 'car', label: 'Car', de: 'Auto', desc: 'Includes your own car, company car, or carpool' },
  { value: 'public_transport', label: 'Public transport', de: 'Öffentliche Verkehrsmittel', desc: 'Bus, train, subway — you can claim actual ticket costs if higher than the flat rate' },
  { value: 'bicycle', label: 'Bicycle', de: 'Fahrrad', desc: 'You still get the distance-based flat rate even by bike' },
  { value: 'mixed', label: 'Mixed', de: 'Gemischt', desc: 'Combination of transport methods — e.g. bike to station, then train' },
];

export const INSURANCE_TYPE_OPTIONS = [
  { value: 'public', label: 'Public (GKV)', de: 'Gesetzlich (GKV)', desc: 'Statutory health insurance — most employees in Germany are in this system' },
  { value: 'private', label: 'Private (PKV)', de: 'Privat (PKV)', desc: 'Private insurance — available if you earn above ~€70k/year or are self-employed' },
];

// Tax rates & thresholds (2024 values, update yearly)
export const TAX_RATES = {
  2024: {
    grundfreibetrag: 11784,
    werbungskostenpauschale: 1230,
    entfernungspauschaleFirst20: 0.30,
    entfernungspauschaleAbove20: 0.38,
    homeofficePauschalePerDay: 6,
    homeofficePauschaleMax: 1260,
    sonderausgabenPauschbetrag: 36,
    sparerPauschbetragSingle: 1000,
    sparerPauschbetragMarried: 2000,
    handwerkerleistungenMaxReduction: 1200,
    haushaltsnaheDienstleistungenMaxReduction: 4000,
  },
  2025: {
    grundfreibetrag: 12096,
    werbungskostenpauschale: 1230,
    entfernungspauschaleFirst20: 0.30,
    entfernungspauschaleAbove20: 0.38,
    homeofficePauschalePerDay: 6,
    homeofficePauschaleMax: 1260,
    sonderausgabenPauschbetrag: 36,
    sparerPauschbetragSingle: 1000,
    sparerPauschbetragMarried: 2000,
    handwerkerleistungenMaxReduction: 1200,
    haushaltsnaheDienstleistungenMaxReduction: 4000,
  },
} as Record<number, Record<string, number>>;

export const TAX_STEP_LABELS = ['Language', 'Your Info', 'Personal', 'Income', 'Deductions', 'Insurance', 'Extras', 'Summary'];
