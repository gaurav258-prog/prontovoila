// Deterministic German income tax calculation
// Sources: §32a EStG, §9 EStG, §9a EStG, §10 EStG, §10a EStG, §10b EStG,
//          §10c EStG, §20 Abs. 9 EStG, §35a EStG, §4 SolZG, §3 KiStG
//
// This is an estimate for employed individuals (Arbeitnehmer).
// Does not handle: Gewerbebetrieb, Vermietung, complex Splittingtarif edge cases.

import type { PersonalInfo, EmploymentIncome, WorkExpenses, InsurancePension, SpecialExpenses } from '../store/taxStore';
import { TAX_RATES, calcEinkommensteuer, calcSolidaritaetszuschlag, calcKirchensteuer } from '../data/taxConstants';

export interface TaxCalcBreakdown {
  // Inputs
  grossSalary: number;
  year: number;

  // Werbungskosten (§9 EStG)
  commuteCost: number;
  homeOfficeCost: number;
  otherWerbungskosten: number;
  totalWerbungskosten: number;
  werbungskostenpauschale: number;
  werbungskostenUsed: number;         // max(total, pauschbetrag)

  // Vorsorgeaufwendungen / Sonderausgaben (§10 EStG)
  healthInsuranceDeductible: number;
  nursingInsuranceDeductible: number;
  pensionInsuranceDeductible: number;
  unemploymentInsuranceDeductible: number;
  riesterDeductible: number;
  donationsDeductible: number;
  childcareDeductible: number;
  churchTaxPaidDeductible: number;
  totalSonderausgaben: number;
  sonderausgabenPauschbetrag: number;
  sonderausgabenUsed: number;         // max(total, pauschbetrag)

  // zu versteuerndes Einkommen
  zve: number;

  // Tax before credits
  einkommensteuerBeforeCredits: number;

  // §35a tax credits (directly reduce tax owed)
  haushaltsnahCredit: number;
  handwerkerCredit: number;
  totalCredits: number;

  // Final income tax
  einkommensteuer: number;

  // Solidarity surcharge & church tax (assessed)
  solidaritaetszuschlagDue: number;
  kirchensteuerDue: number;

  // Total taxes
  totalTaxDue: number;
  totalTaxWithheld: number;

  // Result
  refund: number | null;
  liability: number | null;
}

export function calcTaxResult(
  personal: PersonalInfo,
  employment: EmploymentIncome,
  expenses: WorkExpenses,
  insurance: InsurancePension,
  special: SpecialExpenses,
): TaxCalcBreakdown {
  const year = personal.taxYear || new Date().getFullYear() - 1;
  const rates = TAX_RATES[year] ?? TAX_RATES[2024];
  const isMarried = personal.maritalStatus === 'married';

  // ── Total gross income (main + additional employments) ──────────────────
  const additionalGross = employment.additionalEmployments
    .reduce((sum, e) => sum + (e.grossSalary || 0), 0);
  const totalGross = (employment.grossSalary || 0) + additionalGross;

  // ── Werbungskosten (§9 EStG) ─────────────────────────────────────────────
  const km = expenses.commuteDistanceKm || 0;
  const days = expenses.commuteDaysPerYear || 0;
  const commuteFlatRate =
    Math.min(km, 20) * rates.entfernungspauschaleFirst20 * days +
    Math.max(0, km - 20) * rates.entfernungspauschaleAbove20 * days;

  // Public transport: use actual cost if higher than flat rate
  const commuteCost = expenses.commuteMethod === 'public_transport'
    ? Math.max(commuteFlatRate, expenses.publicTransportCost || 0)
    : commuteFlatRate;

  // Homeoffice: per-day rate OR dedicated room cost (higher wins)
  const homeOfficeFlat = Math.min(
    (expenses.homeOfficeDays || 0) * rates.homeofficePauschalePerDay,
    rates.homeofficePauschaleMax,
  );
  const homeOfficeCost = expenses.hasDedicatedRoom
    ? Math.max(homeOfficeFlat, expenses.dedicatedRoomCost || 0)
    : homeOfficeFlat;

  const doubleHouseholdCost = expenses.hasDoubleHousehold
    ? (expenses.doubleHouseholdRent || 0) * (expenses.doubleHouseholdMonths || 0)
    : 0;

  const otherWerbungskosten =
    (expenses.workEquipmentCosts || 0) +
    (expenses.trainingCosts || 0) +
    (expenses.professionalLiterature || 0) +
    (expenses.unionDues || 0) +
    (expenses.movingCosts || 0) +
    doubleHouseholdCost;

  const totalWerbungskosten = commuteCost + homeOfficeCost + otherWerbungskosten;
  const werbungskostenUsed = Math.max(totalWerbungskosten, rates.werbungskostenpauschale);

  // ── Sonderausgaben / Vorsorgeaufwendungen (§10 EStG) ─────────────────────
  // §10 Abs. 1 Nr. 3: GKV/PKV Basisbeitrag fully deductible
  const healthInsuranceDeductible = insurance.healthInsurancePaid || 0;
  // §10 Abs. 1 Nr. 3a: Pflegeversicherung fully deductible
  const nursingInsuranceDeductible = insurance.nursingInsurancePaid || 0;
  // §10 Abs. 1 Nr. 2: Rentenversicherung employee share (100% deductible since 2023)
  const pensionInsuranceDeductible = insurance.pensionInsurancePaid || 0;
  // Arbeitslosenversicherung (§10 Abs. 1 Nr. 3a)
  const unemploymentInsuranceDeductible = insurance.unemploymentInsurancePaid || 0;
  // Riester (§10a EStG) — simplified: actual contributions
  const riesterDeductible = insurance.riesterContributions || 0;

  // §10b EStG: donations deductible up to 20% of Gesamtbetrag der Einkünfte
  const donationsDeductible = Math.min(
    special.donations || 0,
    0.20 * totalGross,
  );

  // §10 Abs. 1 Nr. 5: childcare — 2/3 of costs, max €4,000 per child
  const childcareDeductible = Math.min(
    ((special.childcare || 0) * 2) / 3,
    4000 * Math.max(special.numberOfChildren || 0, 0),
  );

  // Church tax paid is itself deductible as Sonderausgabe
  const churchTaxPaidDeductible = employment.kirchensteuerPaid || 0;

  const totalSonderausgaben =
    healthInsuranceDeductible +
    nursingInsuranceDeductible +
    pensionInsuranceDeductible +
    unemploymentInsuranceDeductible +
    riesterDeductible +
    donationsDeductible +
    childcareDeductible +
    churchTaxPaidDeductible;

  const sonderausgabenUsed = Math.max(totalSonderausgaben, rates.sonderausgabenPauschbetrag);

  // ── zu versteuerndes Einkommen (zvE) ─────────────────────────────────────
  const zve = Math.max(0, totalGross - werbungskostenUsed - sonderausgabenUsed);

  // ── Income tax (§32a EStG) ────────────────────────────────────────────────
  // For married couples (Splittingverfahren §32a Abs. 5 EStG):
  // Calculate tax on half zvE, double the result
  const einkommensteuerBeforeCredits = isMarried
    ? calcEinkommensteuer(zve / 2, year) * 2
    : calcEinkommensteuer(zve, year);

  // ── §35a Tax credits (directly reduce income tax owed) ───────────────────
  const haushaltsnahCredit = Math.min(
    ((special.cleaningService || 0) + (special.gardeningService || 0)) * 0.20,
    rates.haushaltsnaheDienstleistungenMaxReduction,
  );
  const handwerkerCredit = Math.min(
    (special.handwerkerleistungen || 0) * 0.20,
    rates.handwerkerleistungenMaxReduction,
  );
  const totalCredits = haushaltsnahCredit + handwerkerCredit;

  const einkommensteuer = Math.max(0, einkommensteuerBeforeCredits - totalCredits);

  // ── Solidaritätszuschlag (§4 SolZG) ──────────────────────────────────────
  const solidaritaetszuschlagDue = calcSolidaritaetszuschlag(einkommensteuer, year, isMarried);

  // ── Kirchensteuer (§3 KiStG) ──────────────────────────────────────────────
  // Default 9% — applies to 14/16 states; Bayern & Baden-Württemberg: 8%
  // Without bundesland we default to 9%
  const kirchensteuerDue = personal.religion !== 'none'
    ? calcKirchensteuer(einkommensteuer, 'DE') // 'DE' → defaults to 9%
    : 0;

  // ── Withheld vs due ───────────────────────────────────────────────────────
  const additionalLohnsteuer = employment.additionalEmployments
    .reduce((sum, e) => sum + (e.lohnsteuerPaid || 0), 0);
  const totalTaxWithheld =
    (employment.lohnsteuerPaid || 0) +
    additionalLohnsteuer +
    (employment.solidaritaetszuschlag || 0) +
    (employment.kirchensteuerPaid || 0);

  const totalTaxDue = einkommensteuer + solidaritaetszuschlagDue + kirchensteuerDue;

  const net = Math.round(totalTaxWithheld - totalTaxDue);

  return {
    grossSalary: totalGross,
    year,
    commuteCost,
    homeOfficeCost,
    otherWerbungskosten,
    totalWerbungskosten,
    werbungskostenpauschale: rates.werbungskostenpauschale,
    werbungskostenUsed,
    healthInsuranceDeductible,
    nursingInsuranceDeductible,
    pensionInsuranceDeductible,
    unemploymentInsuranceDeductible,
    riesterDeductible,
    donationsDeductible,
    childcareDeductible,
    churchTaxPaidDeductible,
    totalSonderausgaben,
    sonderausgabenPauschbetrag: rates.sonderausgabenPauschbetrag,
    sonderausgabenUsed,
    zve,
    einkommensteuerBeforeCredits,
    haushaltsnahCredit,
    handwerkerCredit,
    totalCredits,
    einkommensteuer,
    solidaritaetszuschlagDue,
    kirchensteuerDue,
    totalTaxDue,
    totalTaxWithheld,
    refund: net > 0 ? net : null,
    liability: net < 0 ? Math.abs(net) : null,
  };
}

export function fmt(n: number): string {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
