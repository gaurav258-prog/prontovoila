import { create } from 'zustand';

export type TaxStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type Steuerklasse = '1' | '2' | '3' | '4' | '5' | '6';

export interface PersonalInfo {
  taxYear: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  steuerIdentifikationsnummer: string;
  steuernummer: string;
  steuerklasse: Steuerklasse | '';
  religion: string;
  maritalStatus: string;
  spouseFirstName: string;
  spouseLastName: string;
  spouseTaxId: string;
  spouseSteuerklasse: Steuerklasse | '';
}

export interface EmploymentIncome {
  employerName: string;
  employerAddress: string;
  grossSalary: number;
  lohnsteuerPaid: number;
  solidaritaetszuschlag: number;
  kirchensteuerPaid: number;
  socialSecurityEmployee: number;
  hasMultipleEmployers: boolean;
  additionalEmployments: Array<{
    employerName: string;
    grossSalary: number;
    lohnsteuerPaid: number;
  }>;
}

export interface WorkExpenses {
  commuteDistanceKm: number;
  commuteDaysPerYear: number;
  commuteMethod: string;
  publicTransportCost: number;
  homeOfficeDays: number;
  hasDedicatedRoom: boolean;
  dedicatedRoomCost: number;
  workEquipmentCosts: number;
  workEquipmentDetails: string;
  trainingCosts: number;
  professionalLiterature: number;
  unionDues: number;
  movingCosts: number;
  hasDoubleHousehold: boolean;
  doubleHouseholdRent: number;
  doubleHouseholdMonths: number;
}

export interface InsurancePension {
  healthInsuranceType: string;
  healthInsurancePaid: number;
  nursingInsurancePaid: number;
  pensionInsurancePaid: number;
  unemploymentInsurancePaid: number;
  privateHealthInsurance: number;
  disabilityInsurance: number;
  liabilityInsurance: number;
  accidentInsurance: number;
  riesterContributions: number;
  ruerupContributions: number;
}

export interface SpecialExpenses {
  donations: number;
  donationRecipients: string;
  additionalChurchTax: number;
  cleaningService: number;
  gardeningService: number;
  handwerkerleistungen: number;
  handwerkerDetails: string;
  childcare: number;
  numberOfChildren: number;
  hasInvestmentIncome: boolean;
  investmentIncome: number;
  withheldAbgeltungssteuer: number;
  sparerPauschbetragUsed: boolean;
}

export interface TaxSummary {
  estimatedRefund: number | null;
  estimatedLiability: number | null;
  analysisText: string;
  recommendations: string[];
  nextSteps: string[];
  generatedAt: string;
}

const defaultPersonal: PersonalInfo = {
  taxYear: new Date().getFullYear() - 1,
  firstName: '', lastName: '', dateOfBirth: '',
  street: '', houseNumber: '', postalCode: '', city: '',
  steuerIdentifikationsnummer: '', steuernummer: '',
  steuerklasse: '', religion: 'none', maritalStatus: 'single',
  spouseFirstName: '', spouseLastName: '', spouseTaxId: '', spouseSteuerklasse: '',
};

const defaultEmployment: EmploymentIncome = {
  employerName: '', employerAddress: '',
  grossSalary: 0, lohnsteuerPaid: 0, solidaritaetszuschlag: 0,
  kirchensteuerPaid: 0, socialSecurityEmployee: 0,
  hasMultipleEmployers: false, additionalEmployments: [],
};

const defaultExpenses: WorkExpenses = {
  commuteDistanceKm: 0, commuteDaysPerYear: 220, commuteMethod: 'car',
  publicTransportCost: 0, homeOfficeDays: 0, hasDedicatedRoom: false,
  dedicatedRoomCost: 0, workEquipmentCosts: 0, workEquipmentDetails: '',
  trainingCosts: 0, professionalLiterature: 0, unionDues: 0, movingCosts: 0,
  hasDoubleHousehold: false, doubleHouseholdRent: 0, doubleHouseholdMonths: 0,
};

const defaultInsurance: InsurancePension = {
  healthInsuranceType: 'public',
  healthInsurancePaid: 0, nursingInsurancePaid: 0,
  pensionInsurancePaid: 0, unemploymentInsurancePaid: 0,
  privateHealthInsurance: 0, disabilityInsurance: 0,
  liabilityInsurance: 0, accidentInsurance: 0,
  riesterContributions: 0, ruerupContributions: 0,
};

const defaultSpecial: SpecialExpenses = {
  donations: 0, donationRecipients: '', additionalChurchTax: 0,
  cleaningService: 0, gardeningService: 0,
  handwerkerleistungen: 0, handwerkerDetails: '',
  childcare: 0, numberOfChildren: 0,
  hasInvestmentIncome: false, investmentIncome: 0,
  withheldAbgeltungssteuer: 0, sparerPauschbetragUsed: false,
};

interface TaxState {
  step: TaxStep;
  langCode: string;
  langLabel: string;
  briefingText: string;
  briefingParsed: boolean;
  personal: PersonalInfo;
  employment: EmploymentIncome;
  expenses: WorkExpenses;
  insurance: InsurancePension;
  special: SpecialExpenses;
  summary: TaxSummary | null;
  isAnalyzing: boolean;
  error: string | null;

  setStep: (step: TaxStep) => void;
  setLanguage: (code: string, label: string) => void;
  setBriefingText: (text: string) => void;
  setBriefingParsed: (v: boolean) => void;
  updatePersonal: (data: Partial<PersonalInfo>) => void;
  updateEmployment: (data: Partial<EmploymentIncome>) => void;
  updateExpenses: (data: Partial<WorkExpenses>) => void;
  updateInsurance: (data: Partial<InsurancePension>) => void;
  updateSpecial: (data: Partial<SpecialExpenses>) => void;
  setSummary: (summary: TaxSummary) => void;
  setIsAnalyzing: (v: boolean) => void;
  setError: (err: string | null) => void;
  reset: () => void;
}

export const useTaxStore = create<TaxState>((set) => ({
  step: 1,
  langCode: 'en',
  langLabel: 'English',
  briefingText: '',
  briefingParsed: false,
  personal: { ...defaultPersonal },
  employment: { ...defaultEmployment },
  expenses: { ...defaultExpenses },
  insurance: { ...defaultInsurance },
  special: { ...defaultSpecial },
  summary: null,
  isAnalyzing: false,
  error: null,

  setStep: (step) => set({ step }),
  setLanguage: (code, label) => set({ langCode: code, langLabel: label }),
  setBriefingText: (text) => set({ briefingText: text }),
  setBriefingParsed: (v) => set({ briefingParsed: v }),
  updatePersonal: (data) => set((s) => ({ personal: { ...s.personal, ...data } })),
  updateEmployment: (data) => set((s) => ({ employment: { ...s.employment, ...data } })),
  updateExpenses: (data) => set((s) => ({ expenses: { ...s.expenses, ...data } })),
  updateInsurance: (data) => set((s) => ({ insurance: { ...s.insurance, ...data } })),
  updateSpecial: (data) => set((s) => ({ special: { ...s.special, ...data } })),
  setSummary: (summary) => set({ summary }),
  setIsAnalyzing: (v) => set({ isAnalyzing: v }),
  setError: (err) => set({ error: err }),
  reset: () => set({
    step: 1,
    langCode: 'en', langLabel: 'English',
    briefingText: '', briefingParsed: false,
    personal: { ...defaultPersonal },
    employment: { ...defaultEmployment },
    expenses: { ...defaultExpenses },
    insurance: { ...defaultInsurance },
    special: { ...defaultSpecial },
    summary: null, isAnalyzing: false, error: null,
  }),
}));
