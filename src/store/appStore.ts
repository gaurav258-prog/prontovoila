import { create } from 'zustand';
import type { AppStep, FormField, FormMeta, FormAnalysis, FilledField, ChatMessage, FollowUpQuestion, SignatureData } from '../types';

interface AppState {
  step: AppStep;
  file: File | null;
  fileB64: string | null;
  fileMime: string | null;
  langCode: string;
  langLabel: string;
  formMeta: FormMeta | null;
  formAnalysis: FormAnalysis | null;
  fields: FormField[];
  answers: Record<string, string>;
  filledFields: FilledField[];
  freehandText: string;
  followUpQuestions: FollowUpQuestion[];
  followUpIdx: number;
  history: ChatMessage[];
  idx: number;
  signatures: SignatureData[];
  userConfirmed: boolean;
  testMode: boolean;
  hasAcroFields: boolean; // true = PDF has real form fields; fill by name. false = use coordinate overlay.

  setStep: (step: AppStep) => void;
  setTestMode: (mode: boolean) => void;
  setFile: (file: File | null, b64: string | null, mime: string | null) => void;
  setLanguage: (code: string, label: string) => void;
  setFormMeta: (meta: FormMeta) => void;
  setFormAnalysis: (analysis: FormAnalysis) => void;
  setHasAcroFields: (has: boolean) => void;
  setFields: (fields: FormField[]) => void;
  setAnswer: (fieldId: string, value: string) => void;
  setFilledFields: (fields: FilledField[]) => void;
  updateFilledField: (id: string, value: string) => void;
  addMessage: (msg: ChatMessage) => void;
  clearHistory: () => void;
  setFreehandText: (text: string) => void;
  setFollowUpQuestions: (questions: FollowUpQuestion[]) => void;
  setFollowUpIdx: (idx: number) => void;
  setIdx: (idx: number) => void;
  setSignatures: (sigs: SignatureData[]) => void;
  updateSignature: (fieldId: string, data: Partial<SignatureData>) => void;
  setUserConfirmed: (confirmed: boolean) => void;
  reset: () => void;
}

const initialState = {
  step: 1 as AppStep,
  file: null,
  fileB64: null,
  fileMime: null,
  langCode: 'en',
  langLabel: 'English',
  formMeta: null,
  formAnalysis: null,
  fields: [],
  answers: {},
  filledFields: [],
  freehandText: '',
  followUpQuestions: [],
  followUpIdx: 0,
  history: [],
  idx: 0,
  signatures: [],
  userConfirmed: false,
  testMode: false,
  hasAcroFields: false,
};

export const useAppStore = create<AppState>((set) => ({
  ...initialState,
  setStep: (step) => set({ step }),
  setTestMode: (testMode) => set({ testMode }),
  setFile: (file, fileB64, fileMime) => set({ file, fileB64, fileMime }),
  setLanguage: (langCode, langLabel) => set({ langCode, langLabel }),
  setFormMeta: (formMeta) => set({ formMeta }),
  setFormAnalysis: (formAnalysis) => set({ formAnalysis }),
  setHasAcroFields: (hasAcroFields) => set({ hasAcroFields }),
  setFields: (fields) => set({ fields }),
  setAnswer: (fieldId, value) =>
    set((state) => ({ answers: { ...state.answers, [fieldId]: value } })),
  setFilledFields: (filledFields) => set({ filledFields }),
  updateFilledField: (id, value) =>
    set((state) => ({
      filledFields: state.filledFields.map((f) =>
        f.id === id ? { ...f, value, source: 'edited' as const } : f
      ),
    })),
  addMessage: (msg) =>
    set((state) => ({ history: [...state.history, msg] })),
  clearHistory: () => set({ history: [] }),
  setFreehandText: (freehandText) => set({ freehandText }),
  setFollowUpQuestions: (followUpQuestions) => set({ followUpQuestions }),
  setFollowUpIdx: (followUpIdx) => set({ followUpIdx }),
  setIdx: (idx) => set({ idx }),
  setSignatures: (signatures) => set({ signatures }),
  updateSignature: (fieldId, data) =>
    set((state) => ({
      signatures: state.signatures.some((s) => s.fieldId === fieldId)
        ? state.signatures.map((s) => s.fieldId === fieldId ? { ...s, ...data } : s)
        : [...state.signatures, { fieldId, mode: 'draw', dataUrl: null, ...data } as SignatureData],
    })),
  setUserConfirmed: (userConfirmed) => set({ userConfirmed }),
  reset: () => set(initialState),
}));
