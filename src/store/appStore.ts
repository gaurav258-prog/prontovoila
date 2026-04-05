import { create } from 'zustand';
import type { AppStep, FormField, FormMeta, FilledField, ChatMessage } from '../types';

interface AppState {
  step: AppStep;
  file: File | null;
  fileB64: string | null;
  fileMime: string | null;
  langCode: string;
  langLabel: string;
  formMeta: FormMeta | null;
  fields: FormField[];
  answers: Record<string, string>;
  filledFields: FilledField[];
  history: ChatMessage[];
  idx: number;
  apiKey: string;
  currentInputMode: string;

  setStep: (step: AppStep) => void;
  setFile: (file: File | null, b64: string | null, mime: string | null) => void;
  setLanguage: (code: string, label: string) => void;
  setFormMeta: (meta: FormMeta) => void;
  setFields: (fields: FormField[]) => void;
  setAnswer: (fieldId: string, value: string) => void;
  addFilledField: (field: FilledField) => void;
  addMessage: (msg: ChatMessage) => void;
  setIdx: (idx: number) => void;
  setApiKey: (key: string) => void;
  setInputMode: (mode: string) => void;
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
  fields: [],
  answers: {},
  filledFields: [],
  history: [],
  idx: 0,
  apiKey: '',
  currentInputMode: 'text',
};

export const useAppStore = create<AppState>((set) => ({
  ...initialState,
  setStep: (step) => set({ step }),
  setFile: (file, fileB64, fileMime) => set({ file, fileB64, fileMime }),
  setLanguage: (langCode, langLabel) => set({ langCode, langLabel }),
  setFormMeta: (formMeta) => set({ formMeta }),
  setFields: (fields) => set({ fields }),
  setAnswer: (fieldId, value) =>
    set((state) => ({ answers: { ...state.answers, [fieldId]: value } })),
  addFilledField: (field) =>
    set((state) => ({ filledFields: [...state.filledFields, field] })),
  addMessage: (msg) =>
    set((state) => ({ history: [...state.history, msg] })),
  setIdx: (idx) => set({ idx }),
  setApiKey: (key) => {
    sessionStorage.setItem('pv_api_key', key);
    set({ apiKey: key });
  },
  setInputMode: (currentInputMode) => set({ currentInputMode }),
  reset: () => set(initialState),
}));
