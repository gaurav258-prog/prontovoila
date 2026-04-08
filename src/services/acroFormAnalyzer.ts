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

  // Create the analysis summary
  const analysis: FormAnalysis = {
    detectedLanguage: 'unknown',
    detectedLanguageLabel: 'Unknown',
    formTitleOriginal: 'Form',
    formTitleTranslated: 'Form',
    summary: `This form contains ${acroFields.length} fields to fill.`,
    mandatoryFields: fields.filter(f => f.required),
    optionalFields: fields.filter(f => !f.required),
  };

  console.log('✅ ACROFORM ANALYSIS COMPLETE:', {
    totalFields: acroFields.length,
    questionsGenerated: fields.length,
    duplicatesAvoided: acroFields.length - fields.length,
  });

  return { analysis, fields };
}
