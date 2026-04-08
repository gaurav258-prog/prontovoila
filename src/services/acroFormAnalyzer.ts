/**
 * AcroForm Analyzer
 *
 * Directly analyzes PDF AcroForm fields without relying on Claude.
 * This is the foundation of the truly generic, form-agnostic approach:
 * - Extract field structure from PDF
 * - Get nearby labels for context
 * - Auto-generate simple questions
 * - Render at field coordinates
 *
 * Works with ANY form type, language, or layout.
 */

import type { FormField, FormAnalysis } from '../types';
import { detectFormType, generateGenericFormTitle, getFormTranslation } from '../data/formMetadata';

export interface AcroFormField {
  name: string;
  type: 'text' | 'checkbox' | 'radio' | 'select' | 'signature' | 'other';
  rect: { x: number; y: number; width: number; height: number; page: number };
  fontSize: number;
  options?: string[];
  nearbyLabels?: string[];
}

/**
 * Generate a simple, clear question for an AcroForm field based on its context
 */
function generateQuestionForField(field: AcroFormField): { label: string; question: string } {
  // Use nearby labels if available, otherwise use field name
  const context = field.nearbyLabels && field.nearbyLabels.length > 0
    ? field.nearbyLabels[0]
    : field.name;

  // Clean up the context
  const label = context
    .replace(/[_-]/g, ' ')
    .replace(/^\d+\s*/, '') // Remove leading numbers (e.g., "1 Name" -> "Name")
    .trim();

  // Generate question based on field type
  let question: string;

  if (field.type === 'checkbox') {
    question = `${label}?`;
  } else if (field.type === 'signature') {
    question = `Please sign: ${label}`;
  } else if (field.type === 'select' || field.type === 'radio') {
    question = `What is your ${label.toLowerCase()}?`;
  } else {
    question = `Please provide: ${label}`;
  }

  return { label, question };
}

/**
 * Detect language from AcroForm field names
 * Supports: German, Italian, French, English
 */
function detectLanguageFromFields(acroFields: AcroFormField[]): { code: string; label: string } {
  // Collect all field names to detect language patterns
  const allText = acroFields.map(f => f.name + (f.nearbyLabels?.join(' ') || '')).join(' ').toLowerCase();

  // Language keyword patterns with /gi flag for global matching
  const languagePatterns = [
    {
      code: 'de',
      label: 'German',
      keywords: /geburtsdatum|geburtsort|staatsangehörigkeit|straße|hausnummer|postleitzahl|wohnort|vorname|geschlecht|reisepass|einreise|aufenthalt|anschrift|beziehung|ehegatte|kinder|verpflichtung|anmeldung|abmeldung|steuer|visum|antrag/gi,
      minMatches: 3,
    },
    {
      code: 'it',
      label: 'Italian',
      keywords: /nome|cognome|nascita|residenza|indirizzo|comune|provincia|telefono|email|cittadinanza|documento|passaporto|dichiarazione|modulo|anagrafe/gi,
      minMatches: 3,
    },
    {
      code: 'fr',
      label: 'French',
      keywords: /nom|prenom|naissance|residence|adresse|ville|telephone|email|nationalite|passeport|declaration|demande|formulaire|domicile/gi,
      minMatches: 3,
    },
  ];

  // Check each language pattern
  for (const pattern of languagePatterns) {
    const matches = allText.match(pattern.keywords);
    if (matches && matches.length >= pattern.minMatches) {
      return { code: pattern.code, label: pattern.label };
    }
  }

  // Default to unknown if no clear language pattern detected
  return { code: 'unknown', label: 'Unknown' };
}

/**
 * Map AcroForm field type to FormField type
 */
function mapFieldType(acroType: string): FormField['type'] {
  switch (acroType) {
    case 'checkbox':
      return 'yesno';
    case 'signature':
      return 'signature';
    case 'select':
    case 'radio':
      return 'select';
    default:
      return 'text';
  }
}

/**
 * Analyze AcroForm fields directly and generate questionnaire fields
 * No Claude analysis, no duplicates, purely PDF-based
 */
export function analyzeAcroFormFields(
  acroFields: AcroFormField[],
): { analysis: FormAnalysis; fields: FormField[] } {
  const fields: FormField[] = [];
  const seenFieldNames = new Set<string>();

  for (const acroField of acroFields) {
    // Skip if we've already created a field for this AcroForm field
    if (seenFieldNames.has(acroField.name)) continue;
    seenFieldNames.add(acroField.name);

    const { label, question } = generateQuestionForField(acroField);

    const field: FormField = {
      id: `acro_${acroField.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      label,
      labelOriginal: label,
      type: mapFieldType(acroField.type),
      required: true,
      question,
      pdfFieldName: acroField.name,
      pdfFieldRect: {
        x: acroField.rect.x,
        y: acroField.rect.y,
        width: acroField.rect.width,
        height: acroField.rect.height,
        page: acroField.rect.page,
      },
      pdfFieldFontSize: acroField.fontSize,
      minFontSize: 6,
      maxFontSize: acroField.fontSize,
      isAutoMetadata: false,
      options: acroField.options,
    };

    fields.push(field);
  }

  // Detect language from field names
  const detectedLang = detectLanguageFromFields(acroFields);

  // Detect specific form type and get metadata
  const fieldNames = acroFields.map(f => f.name);
  let formMetadata = detectFormType(fieldNames, detectedLang.code);

  // If no specific form detected, generate generic title for the language
  if (!formMetadata) {
    formMetadata = generateGenericFormTitle(detectedLang.code);
  }

  // Get English translation for display (user will select language later in DetectStep)
  const englishTranslation = getFormTranslation(formMetadata, 'en');
  const formTitleOriginal = formMetadata.originalTitle;
  const formTitleTranslated = englishTranslation.title;
  const summary = englishTranslation.description;

  // Create the analysis summary (includes formMetadata for later language selection)
  const analysis: FormAnalysis = {
    detectedLanguage: detectedLang.code,
    detectedLanguageLabel: detectedLang.label,
    formTitleOriginal,
    formTitleTranslated,
    summary,
    mandatoryFields: fields.filter(f => f.required),
    optionalFields: fields.filter(f => !f.required),
    formMetadata,  // Include metadata so UI can translate to user's selected language
  };

  console.log('✅ ACROFORM ANALYSIS COMPLETE:', {
    totalFields: acroFields.length,
    questionsGenerated: fields.length,
    duplicatesAvoided: acroFields.length - fields.length,
  });

  return { analysis, fields };
}
