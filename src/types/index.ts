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
  type: 'text' | 'yesno' | 'number' | 'email' | 'phone' | 'date' | 'select' | 'radio' | 'iban' | 'signature';
  options?: string[];
  required?: boolean;
  format?: string;
  question?: string;
  position?: FieldPosition;
  pdfFieldName?: string; // Exact AcroForm field name in the PDF — used for direct field filling
  pdfFieldRect?: { x: number; y: number; width: number; height: number; page: number }; // actual PDF widget rectangle in pts
  pdfFieldFontSize?: number; // font size from field /DA stream

  // Spatial constraints for smart rendering
  minFontSize?: number; // minimum font size to use (prevents unreadably small text)
  maxFontSize?: number; // maximum font size to use (from form template)
  isAutoMetadata?: boolean; // true if this is auto-detected (date, signature) — should be filled automatically

  splitIndex?: number; // 0-based position within a combined field (undefined = not split)
  splitPct?: number; // % of field width this sub-column occupies (must sum to 100 across siblings)
  pairedNeinPdfFieldName?: string; // for ja/nein checkbox pairs: the "nein" checkbox's pdfFieldName
}

export interface FormMeta {
  title: string;
  description: string;
  totalFields: number;
}

export interface FormMetadata {
  formId: string;
  originalLanguage: string;
  originalTitle: string;
  keywords: string[];
  translations: Record<string, { title: string; description: string }>;
}

export interface FormAnalysis {
  detectedLanguage: string;
  detectedLanguageLabel: string;
  formTitleOriginal: string;
  formTitleTranslated: string;
  summary: string;
  formMetadata?: FormMetadata;  // NEW: Metadata for multilingual translations
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
