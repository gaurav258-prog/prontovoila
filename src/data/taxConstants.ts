// German tax constants — sourced from official BMF/EStH/LStH documentation
// §32a EStG, §9a EStG, §10c EStG, §20 Abs. 9 EStG, §4 SolZG, §9 EStG

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
  { value: 'ev', label: 'Protestant', de: 'Evangelisch', desc: '8–9% church tax on your income tax — rate depends on your Bundesland' },
  { value: 'rk', label: 'Roman Catholic', de: 'Römisch-Katholisch', desc: '8–9% church tax on your income tax — rate depends on your Bundesland' },
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

// Kirchensteuer rate by Bundesland (§3 KiStG)
// 8% applies only in Bayern and Baden-Württemberg; 9% everywhere else
export const KIRCHENSTEUER_RATE_8 = ['BY', 'BW']; // Bayern, Baden-Württemberg
export const KIRCHENSTEUER_RATE_DEFAULT = 0.09;    // 9% — all other 14 Bundesländer
export const KIRCHENSTEUER_RATE_LOW    = 0.08;     // 8% — BY and BW only

// Tax rates, thresholds and flat rates by year
// Sources: EStH 2023/2024/2025, LStH 2023/2024/2025 (esth/lsth.bundesfinanzministerium.de)
export const TAX_RATES: Record<number, {
  grundfreibetrag: number;
  werbungskostenpauschale: number;
  entfernungspauschaleFirst20: number;
  entfernungspauschaleAbove20: number;
  homeofficePauschalePerDay: number;
  homeofficePauschaleMax: number;
  sonderausgabenPauschbetrag: number;
  sparerPauschbetragSingle: number;
  sparerPauschbetragMarried: number;
  handwerkerleistungenMaxReduction: number;
  haushaltsnaheDienstleistungenMaxReduction: number;
  solzFreigrenzeEinzel: number;
  solzFreigrenzeZusammen: number;
}> = {
  // 2023 — Jahressteuergesetz 2022 changes took effect
  2023: {
    grundfreibetrag: 10908,                    // §32a Abs. 1 EStG
    werbungskostenpauschale: 1230,             // §9a Nr. 1a EStG (raised from €1,200 in 2022)
    entfernungspauschaleFirst20: 0.30,         // §9 Abs. 1 Nr. 4 EStG
    entfernungspauschaleAbove20: 0.35,         // §9 Abs. 1 Nr. 4 EStG — NOTE: €0.35 in 2023 (not €0.38)
    homeofficePauschalePerDay: 6,              // §4 Abs. 5 Nr. 6c EStG (raised from €5 in 2022)
    homeofficePauschaleMax: 1260,              // = 210 days × €6
    sonderausgabenPauschbetrag: 36,            // §10c EStG
    sparerPauschbetragSingle: 1000,            // §20 Abs. 9 EStG (raised from €801 in 2022)
    sparerPauschbetragMarried: 2000,           // §20 Abs. 9 EStG (raised from €1,602 in 2022)
    handwerkerleistungenMaxReduction: 1200,    // §35a Abs. 3 EStG (20% of €6,000)
    haushaltsnaheDienstleistungenMaxReduction: 4000, // §35a Abs. 2 EStG (20% of €20,000)
    solzFreigrenzeEinzel: 17543,               // §3 SolZG — income tax amount threshold (single)
    solzFreigrenzeZusammen: 35086,             // §3 SolZG — income tax amount threshold (married)
  },
  // 2024
  2024: {
    grundfreibetrag: 11784,                    // §32a Abs. 1 EStG
    werbungskostenpauschale: 1230,             // §9a Nr. 1a EStG
    entfernungspauschaleFirst20: 0.30,         // §9 Abs. 1 Nr. 4 EStG
    entfernungspauschaleAbove20: 0.38,         // §9 Abs. 1 Nr. 4 EStG (raised to €0.38 from 2024)
    homeofficePauschalePerDay: 6,              // §4 Abs. 5 Nr. 6c EStG
    homeofficePauschaleMax: 1260,              // = 210 days × €6
    sonderausgabenPauschbetrag: 36,            // §10c EStG
    sparerPauschbetragSingle: 1000,            // §20 Abs. 9 EStG
    sparerPauschbetragMarried: 2000,           // §20 Abs. 9 EStG
    handwerkerleistungenMaxReduction: 1200,    // §35a Abs. 3 EStG
    haushaltsnaheDienstleistungenMaxReduction: 4000, // §35a Abs. 2 EStG
    solzFreigrenzeEinzel: 18130,               // §3 SolZG
    solzFreigrenzeZusammen: 36260,             // §3 SolZG
  },
  // 2025
  2025: {
    grundfreibetrag: 12096,                    // §32a Abs. 1 EStG
    werbungskostenpauschale: 1230,             // §9a Nr. 1a EStG
    entfernungspauschaleFirst20: 0.30,         // §9 Abs. 1 Nr. 4 EStG
    entfernungspauschaleAbove20: 0.38,         // §9 Abs. 1 Nr. 4 EStG
    homeofficePauschalePerDay: 6,              // §4 Abs. 5 Nr. 6c EStG
    homeofficePauschaleMax: 1260,              // = 210 days × €6
    sonderausgabenPauschbetrag: 36,            // §10c EStG
    sparerPauschbetragSingle: 1000,            // §20 Abs. 9 EStG
    sparerPauschbetragMarried: 2000,           // §20 Abs. 9 EStG
    handwerkerleistungenMaxReduction: 1200,    // §35a Abs. 3 EStG
    haushaltsnaheDienstleistungenMaxReduction: 4000, // §35a Abs. 2 EStG
    solzFreigrenzeEinzel: 19950,               // §3 SolZG
    solzFreigrenzeZusammen: 39900,             // §3 SolZG
  },
};

// §32a EStG — Einkommensteuer formula (deterministic)
// zvE = zu versteuerndes Einkommen (taxable income), rounded down to whole euro
// Returns income tax rounded down to whole euro
export function calcEinkommensteuer(zve: number, year: number): number {
  const x = Math.floor(zve);

  if (year === 2023) {
    if (x <= 10908) return 0;
    if (x <= 15999) { const y = (x - 10908) / 10000; return Math.floor((979.18 * y + 1400) * y); }
    if (x <= 62809) { const z = (x - 15999) / 10000; return Math.floor((192.59 * z + 2397) * z + 966.53); }
    if (x <= 277825) return Math.floor(0.42 * x - 9972.98);
    return Math.floor(0.45 * x - 18307.73);
  }

  if (year === 2024) {
    if (x <= 11784) return 0;
    if (x <= 17005) { const y = (x - 11784) / 10000; return Math.floor((954.80 * y + 1400) * y); }
    if (x <= 66760) { const z = (x - 17005) / 10000; return Math.floor((181.19 * z + 2397) * z + 991.21); }
    if (x <= 277825) return Math.floor(0.42 * x - 10636.31);
    return Math.floor(0.45 * x - 18971.06);
  }

  if (year === 2025) {
    if (x <= 12096) return 0;
    if (x <= 17443) { const y = (x - 12096) / 10000; return Math.floor((932.30 * y + 1400) * y); }
    if (x <= 68480) { const z = (x - 17443) / 10000; return Math.floor((176.64 * z + 2397) * z + 1015.13); }
    if (x <= 277825) return Math.floor(0.42 * x - 10911.92);
    return Math.floor(0.45 * x - 19246.67);
  }

  // Fallback: use 2024 formula
  return calcEinkommensteuer(zve, 2024);
}

// §4 SolZG — Solidaritätszuschlag
// bemessungsgrundlage = income tax amount (not gross income)
// married = true for Zusammenveranlagung (doubles the Freigrenze)
export function calcSolidaritaetszuschlag(incomeTax: number, year: number, married: boolean): number {
  const rates = TAX_RATES[year] ?? TAX_RATES[2024];
  const freigrenze = married ? rates.solzFreigrenzeZusammen : rates.solzFreigrenzeEinzel;

  if (incomeTax <= freigrenze) return 0;

  // Milderungszone: Soli capped at 11.9% of (ESt − Freigrenze)
  const fullSoli = 0.055 * incomeTax;
  const cappedSoli = 0.119 * (incomeTax - freigrenze);
  return Math.floor(Math.min(fullSoli, cappedSoli) * 100) / 100;
}

// §3 KiStG — Kirchensteuer
// incomeTax = assessed income tax; bundesland = two-letter code e.g. 'BY', 'NW'
export function calcKirchensteuer(incomeTax: number, bundesland: string): number {
  const rate = KIRCHENSTEUER_RATE_8.includes(bundesland.toUpperCase())
    ? KIRCHENSTEUER_RATE_LOW
    : KIRCHENSTEUER_RATE_DEFAULT;
  return Math.floor(incomeTax * rate * 100) / 100;
}

export const TAX_STEP_LABELS = ['Language', 'Your Info', 'Personal', 'Income', 'Deductions', 'Insurance', 'Extras', 'Summary'];
