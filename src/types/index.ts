export interface Language {
  c: string;
  l: string;
  f: string;
}

export interface FieldPosition {
  page: number;
  xPct: number;
  yPct: number;
  widthPct: number;
  heightPct: number;
}

export interface FormField {
  id: string;
  label: string;
  labelOriginal?: string; // Label in the form's original language (for position matching)
  type: 'text' | 'yesno' | 'number' | 'email' | 'phone' | 'date' | 'select' | 'iban' | 'signature';
  options?: string[];
  required?: boolean;
  format?: string;
  question?: string;
  position?: FieldPosition;
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
  position?: FieldPosition;
}

export interface ChatMessage {
  role: 'ai' | 'user';
  text: string;
}

export type SignatureMode = 'draw' | 'type' | 'after-print';

export interface SignatureData {
  fieldId: string;
  mode: SignatureMode;
  dataUrl: string | null;
  typedName?: string;
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
