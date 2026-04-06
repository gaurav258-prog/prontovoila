import type { TaxSummary, BriefingStrings } from '../store/taxStore';
import type { PersonalInfo, EmploymentIncome, WorkExpenses, InsurancePension, SpecialExpenses } from '../store/taxStore';
import { TAX_RATES } from '../data/taxConstants';
import { calcTaxResult, fmt } from '../utils/taxCalc';

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
  const raw = data.content[0].text.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim();
  const parsed = JSON.parse(raw);
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
  // ── Step 1: deterministic calculation (§32a EStG formula) ─────────────────
  const calc = calcTaxResult(personal, employment, expenses, insurance, special);
  void TAX_RATES; // constants used via calcTaxResult

  // ── Step 2: Claude generates narrative only — numbers are pre-calculated ──
  const systemPrompt = `You are a German tax advisor assistant for ProntoVoilà. The tax refund/liability has already been calculated using the official §32a EStG formula. Your job is ONLY to write the narrative analysis, recommendations and next steps — do NOT recalculate or override the figures provided.

Respond in the language with code "${langCode}". Include German terms in parentheses throughout.

You MUST respond with a valid JSON object (no markdown, no code fences):
{
  "analysisText": "<3-5 bullet points explaining the key drivers of this result — reference the exact figures provided>",
  "recommendations": ["<actionable recommendation 1>", ...],
  "nextSteps": ["<concrete next step 1>", ...]
}`;

  const calcSummary = `
TAX YEAR: ${calc.year}
Gross income (Bruttolohn): €${fmt(calc.grossSalary)}

DEDUCTIONS APPLIED:
- Werbungskosten used: €${fmt(calc.werbungskostenUsed)} (itemized: €${fmt(calc.totalWerbungskosten)}, Pauschbetrag: €${fmt(calc.werbungskostenpauschale)})
  • Commute (Entfernungspauschale): €${fmt(calc.commuteCost)}
  • Home office (Homeoffice-Pauschale): €${fmt(calc.homeOfficeCost)}
  • Other work expenses: €${fmt(calc.otherWerbungskosten)}
- Sonderausgaben used: €${fmt(calc.sonderausgabenUsed)} (itemized: €${fmt(calc.totalSonderausgaben)})
  • Health insurance (Krankenversicherung): €${fmt(calc.healthInsuranceDeductible)}
  • Nursing care (Pflegeversicherung): €${fmt(calc.nursingInsuranceDeductible)}
  • Pension (Rentenversicherung): €${fmt(calc.pensionInsuranceDeductible)}
  • Unemployment (Arbeitslosenversicherung): €${fmt(calc.unemploymentInsuranceDeductible)}
  • Donations (Spenden): €${fmt(calc.donationsDeductible)}
  • Childcare (Kinderbetreuung): €${fmt(calc.childcareDeductible)}

TAXABLE INCOME (zvE): €${fmt(calc.zve)}
Income tax before credits (§32a ESt): €${fmt(calc.einkommensteuerBeforeCredits)}
§35a tax credits: €${fmt(calc.totalCredits)} (Haushaltsnahe: €${fmt(calc.haushaltsnahCredit)}, Handwerker: €${fmt(calc.handwerkerCredit)})
Income tax assessed (Einkommensteuer): €${fmt(calc.einkommensteuer)}
Solidarity surcharge (Solidaritätszuschlag): €${fmt(calc.solidaritaetszuschlagDue)}
Church tax (Kirchensteuer): €${fmt(calc.kirchensteuerDue)}

TOTAL TAX DUE: €${fmt(calc.totalTaxDue)}
TOTAL ALREADY WITHHELD: €${fmt(calc.totalTaxWithheld)} (Lohnsteuer + Soli + Kirchensteuer from payslips)

RESULT: ${calc.refund !== null ? `REFUND (Erstattung) of €${fmt(calc.refund)}` : `PAYMENT DUE (Nachzahlung) of €${fmt(calc.liability ?? 0)}`}
`;

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
      messages: [{
        role: 'user',
        content: `Here are the pre-calculated tax figures. Write the analysis narrative, recommendations and next steps based on these exact numbers:\n\n${calcSummary}`,
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
    estimatedRefund: calc.refund,
    estimatedLiability: calc.liability,
    analysisText: parsed.analysisText || '',
    recommendations: parsed.recommendations || [],
    nextSteps: parsed.nextSteps || [],
    generatedAt: new Date().toISOString(),
  };
}

export async function getUIStrings(langLabel: string): Promise<BriefingStrings> {
  const prompt = `You are helping translate a German personal tax filing app into ${langLabel}.

Translate the following UI strings into ${langLabel}. Respond with ONLY a valid JSON object (no markdown, no code fences).

The strings to translate:
{
  "hint": "Describe your situation in your own words. For example: your job, salary, how you commute, whether you work from home, any insurance you pay, donations, children, etc. The more you share, the more we can pre-fill for you.",
  "exampleText": "My name is Maria Santos, born on 15 March 1990. I live at Hauptstraße 42, 69115 Heidelberg. My tax ID is 12345678901. I work as a software engineer at SAP in Walldorf, earning €75,000 per year. They withheld about €15,800 in income tax and €870 solidarity surcharge. I drive 35km to work each day, about 220 days a year. I worked from home about 80 days last year. I bought a new laptop for €1,200 for work. I'm single, tax class 1, no church tax. I pay public health insurance — around €3,200 employee share, plus €1,100 nursing care and €7,200 pension. I donated €200 to UNICEF. I also paid €600 for a cleaning lady.",
  "placeholder": "Describe your tax situation in ${langLabel}...",
  "analyzeBtn": "Analyze & pre-fill →",
  "skipBtn": "Skip — I'll fill manually",
  "analyzingLabel": "Analyzing your information...",
  "analyzingSub": "Extracting tax-relevant details from your description"
}

Rules:
- Keep all numbers, euro amounts, German proper nouns (SAP, Walldorf, Heidelberg, UNICEF), and German tax terms (Steuerklasse, Solidaritätszuschlag, Kirchensteuer) as-is
- Use a natural, culturally appropriate name for the example person that fits ${langLabel}-speaking culture (replace "Maria Santos" with a typical name from that culture)
- The example text should read naturally as if a native ${langLabel} speaker wrote it
- Return all 7 keys exactly as shown`;

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) throw new Error(`UI translation failed: ${res.status}`);

  const data = await res.json();
  const raw = data.content[0].text.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim();
  const parsed = JSON.parse(raw);
  return parsed as BriefingStrings;
}
