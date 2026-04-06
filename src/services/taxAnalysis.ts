import type { TaxSummary } from '../store/taxStore';
import type { PersonalInfo, EmploymentIncome, WorkExpenses, InsurancePension, SpecialExpenses } from '../store/taxStore';
import { TAX_RATES } from '../data/taxConstants';

const API_KEY = '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';
const API_URL = 'https://api.anthropic.com/v1/messages';

interface BriefingResult {
  personal?: Partial<PersonalInfo>;
  employment?: Partial<EmploymentIncome>;
  expenses?: Partial<WorkExpenses>;
  insurance?: Partial<InsurancePension>;
  special?: Partial<SpecialExpenses>;
}

export async function parseTaxBriefing(text: string, langLabel: string): Promise<BriefingResult> {
  const systemPrompt = `You are a German tax data extraction assistant. The user will describe their tax situation in ${langLabel}. Extract as many tax-relevant details as possible and return them as structured JSON.

You MUST respond with a valid JSON object (no markdown, no code fences) with this structure. Only include fields you can confidently extract — omit fields you're unsure about:

{
  "personal": {
    "firstName": "string or omit",
    "lastName": "string or omit",
    "steuerklasse": "1"|"2"|"3"|"4"|"5"|"6" or omit,
    "religion": "none"|"ev"|"rk"|"other" or omit,
    "maritalStatus": "single"|"married"|"separated"|"divorced"|"widowed" or omit,
    "city": "string or omit"
  },
  "employment": {
    "employerName": "string or omit",
    "grossSalary": number or omit,
    "lohnsteuerPaid": number or omit,
    "kirchensteuerPaid": number or omit
  },
  "expenses": {
    "commuteDistanceKm": number or omit,
    "commuteDaysPerYear": number or omit,
    "commuteMethod": "car"|"public_transport"|"bicycle"|"mixed" or omit,
    "publicTransportCost": number or omit,
    "homeOfficeDays": number or omit,
    "workEquipmentCosts": number or omit,
    "workEquipmentDetails": "string or omit",
    "trainingCosts": number or omit,
    "unionDues": number or omit
  },
  "insurance": {
    "healthInsuranceType": "public"|"private" or omit,
    "healthInsurancePaid": number or omit,
    "pensionInsurancePaid": number or omit
  },
  "special": {
    "donations": number or omit,
    "donationRecipients": "string or omit",
    "numberOfChildren": number or omit,
    "childcare": number or omit,
    "cleaningService": number or omit,
    "handwerkerleistungen": number or omit
  }
}`;

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: text }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Briefing parse failed: ${res.status} ${err}`);
  }

  const data = await res.json();
  const parsed = JSON.parse(data.content[0].text);
  return parsed as BriefingResult;
}

export async function analyzeTaxSituation(
  langCode: string,
  personal: PersonalInfo,
  employment: EmploymentIncome,
  expenses: WorkExpenses,
  insurance: InsurancePension,
  special: SpecialExpenses,
): Promise<TaxSummary> {
  const rates = TAX_RATES[personal.taxYear] || TAX_RATES[2024];

  const systemPrompt = `You are a German tax advisor assistant for ProntoVoilà. Based on the provided data for an employed person in Germany, calculate an estimated tax refund or liability for tax year ${personal.taxYear}.

Apply these German tax rules:
- Grundfreibetrag: €${rates.grundfreibetrag}
- Werbungskostenpauschale: €${rates.werbungskostenpauschale} (use itemized if higher)
- Entfernungspauschale: €0.30/km first 20km, €0.38/km beyond
- Homeoffice-Pauschale: €${rates.homeofficePauschalePerDay}/day, max €${rates.homeofficePauschaleMax}/year
- Sonderausgaben-Pauschbetrag: €${rates.sonderausgabenPauschbetrag}
- Sparerpauschbetrag: €${rates.sparerPauschbetragSingle} (single) / €${rates.sparerPauschbetragMarried} (married)
- Handwerkerleistungen: 20% of labor costs, max €${rates.handwerkerleistungenMaxReduction} tax reduction
- Haushaltsnahe Dienstleistungen: 20% of costs, max €${rates.haushaltsnaheDienstleistungenMaxReduction} tax reduction
- Childcare: 2/3 of costs deductible, max €4,000 per child/year
- German progressive income tax brackets apply

Respond in the language with code "${langCode}". Include German terms in parentheses throughout.

You MUST respond with a valid JSON object (no markdown, no code fences) with this exact structure:
{
  "estimatedRefund": <positive number if refund, null if liability>,
  "estimatedLiability": <positive number if owes, null if refund>,
  "analysisText": "<detailed analysis in user's language, 3-5 paragraphs, with German terms in parentheses>",
  "recommendations": ["<recommendation 1>", "<recommendation 2>", ...],
  "nextSteps": ["<step 1>", "<step 2>", ...]
}`;

  const userData = {
    personal: {
      taxYear: personal.taxYear,
      steuerklasse: personal.steuerklasse,
      maritalStatus: personal.maritalStatus,
      religion: personal.religion,
      numberOfChildren: special.numberOfChildren,
    },
    employment: {
      grossSalary: employment.grossSalary,
      lohnsteuerPaid: employment.lohnsteuerPaid,
      solidaritaetszuschlag: employment.solidaritaetszuschlag,
      kirchensteuerPaid: employment.kirchensteuerPaid,
      socialSecurityEmployee: employment.socialSecurityEmployee,
      additionalEmployments: employment.additionalEmployments,
    },
    expenses: {
      commuteDistanceKm: expenses.commuteDistanceKm,
      commuteDaysPerYear: expenses.commuteDaysPerYear,
      commuteMethod: expenses.commuteMethod,
      publicTransportCost: expenses.publicTransportCost,
      homeOfficeDays: expenses.homeOfficeDays,
      hasDedicatedRoom: expenses.hasDedicatedRoom,
      dedicatedRoomCost: expenses.dedicatedRoomCost,
      workEquipmentCosts: expenses.workEquipmentCosts,
      trainingCosts: expenses.trainingCosts,
      professionalLiterature: expenses.professionalLiterature,
      unionDues: expenses.unionDues,
      movingCosts: expenses.movingCosts,
      hasDoubleHousehold: expenses.hasDoubleHousehold,
      doubleHouseholdRent: expenses.doubleHouseholdRent,
      doubleHouseholdMonths: expenses.doubleHouseholdMonths,
    },
    insurance: {
      healthInsuranceType: insurance.healthInsuranceType,
      healthInsurancePaid: insurance.healthInsurancePaid,
      nursingInsurancePaid: insurance.nursingInsurancePaid,
      pensionInsurancePaid: insurance.pensionInsurancePaid,
      unemploymentInsurancePaid: insurance.unemploymentInsurancePaid,
      privateHealthInsurance: insurance.privateHealthInsurance,
      disabilityInsurance: insurance.disabilityInsurance,
      liabilityInsurance: insurance.liabilityInsurance,
      accidentInsurance: insurance.accidentInsurance,
      riesterContributions: insurance.riesterContributions,
      ruerupContributions: insurance.ruerupContributions,
    },
    special: {
      donations: special.donations,
      cleaningService: special.cleaningService,
      gardeningService: special.gardeningService,
      handwerkerleistungen: special.handwerkerleistungen,
      childcare: special.childcare,
      numberOfChildren: special.numberOfChildren,
      hasInvestmentIncome: special.hasInvestmentIncome,
      investmentIncome: special.investmentIncome,
      withheldAbgeltungssteuer: special.withheldAbgeltungssteuer,
      sparerPauschbetragUsed: special.sparerPauschbetragUsed,
    },
  };

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: `Analyze this tax data and provide an estimated refund or liability:\n\n${JSON.stringify(userData, null, 2)}`,
      }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Tax analysis failed: ${res.status} ${err}`);
  }

  const data = await res.json();
  const text = data.content[0].text;
  const parsed = JSON.parse(text);

  return {
    estimatedRefund: parsed.estimatedRefund ?? null,
    estimatedLiability: parsed.estimatedLiability ?? null,
    analysisText: parsed.analysisText || '',
    recommendations: parsed.recommendations || [],
    nextSteps: parsed.nextSteps || [],
    generatedAt: new Date().toISOString(),
  };
}
