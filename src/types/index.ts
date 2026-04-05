export interface Language {
  c: string;
  l: string;
  f: string;
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'yesno' | 'number' | 'email' | 'phone' | 'date' | 'select' | 'iban';
  options?: string[];
  required?: boolean;
  format?: string;
  question?: string;
}

export interface FormMeta {
  title: string;
  description: string;
  totalFields: number;
}

export interface FormAnalysis {
  detectedLanguage: string;
  detectedLanguageLabel: string;
  formTitleOriginal: string;
  formTitleTranslated: string;
  summary: string;
  mandatoryFields: FormField[];
  optionalFields: FormField[];
}

export interface FollowUpQuestion {
  fieldId: string;
  label: string;
  question: string;
  type: FormField['type'];
  options?: string[];
  reason: string;
}

export interface FilledField {
  id: string;
  label: string;
  value: string;
  original?: string;
  skipped?: boolean;
  confidence?: 'high' | 'medium' | 'low';
  source?: 'freehand' | 'followup' | 'edited';
}

export interface ChatMessage {
  role: 'ai' | 'user';
  text: string;
}

export type AppStep = 1 | 2 | 3 | 4 | 5 | 6;

export interface SessionRecord {
  id?: number;
  file_name: string;
  lang_code: string;
  lang_label: string;
  form_title: string;
  total_fields: number;
  filled_fields: number;
  skipped_fields: number;
  started_at: string;
  completed_at?: string;
  answers: Record<string, string>;
}
