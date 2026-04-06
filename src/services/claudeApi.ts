import type { FormField, FormAnalysis, FilledField, FollowUpQuestion } from '../types';

const API_KEY = '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';
const API_URL = 'https://api.anthropic.com/v1/messages';

async function callClaude(systemPrompt: string, userContent: unknown[], maxTokens = 6144): Promise<string> {
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
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userContent }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API error: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.content[0].text;
}

/**
 * Analyze an uploaded form: detect language, extract fields with positions, generate summary.
 */
export async function analyzeForm(
  fileB64: string,
  fileMime: string
): Promise<{ analysis: FormAnalysis; fields: FormField[] }> {
  const systemPrompt = `You are a form analysis expert. Analyze the uploaded form and extract all fillable fields in the order they appear on the page (top to bottom).

Return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{
  "detectedLanguage": "language code (e.g. de, fr, it, en)",
  "detectedLanguageLabel": "language name in English (e.g. German, French)",
  "formTitleOriginal": "form title in its original language",
  "formTitleTranslated": "form title translated to English",
  "summary": "2-3 sentence description of what this form is for and what information it collects",
  "fields": [
    {
      "id": "snake_case_field_id",
      "label": "Human readable label in English",
      "labelOriginal": "Label exactly as written on the form in the original language",
      "type": "text|date|email|phone|number|yesno|select|signature",
      "required": true,
      "format": "expected format hint if applicable (e.g. DD/MM/YYYY)",
      "question": "Natural question to ask the user for this field",
      "options": ["only for select type"]
    }
  ]
}

CRITICAL rules:
- List fields in EXACT top-to-bottom order as they appear on the form
- Extract ALL visible fields including checkboxes, dropdowns, text areas, and signature lines
- For checkboxes or yes/no questions, use type "yesno"
- For dropdowns or multiple choice, use type "select" and include options array
- For signature lines or "Unterschrift" / "Firma" / "Signature" areas, use type "signature"
- Mark fields as required based on visual indicators (asterisks, bold, "required" text) or your best judgment
- The "question" should be a natural, conversational way to ask for that information
- Keep field IDs unique and descriptive in snake_case

LABEL RULES:
- "labelOriginal" must be the EXACT text of the field label as it appears on the form, in the form's original language. This is critical — we use it to locate the field on the form programmatically.
- Copy the label text verbatim from the form. For example, if the form says "Nome e Cognome", use exactly "Nome e Cognome" (not "Nome e cognome" or "Nome E Cognome").
- Do NOT include numbering prefixes like "1." or "2." — just the label text itself.
- For fields with sub-labels like "(GG/MM/AAAA)", include only the main label, not the sub-label.`;

  const isImage = fileMime.startsWith('image/');
  const mediaType = isImage ? fileMime : 'image/png';

  let userContent: unknown[];

  if (fileMime === 'application/pdf') {
    userContent = [
      {
        type: 'document',
        source: { type: 'base64', media_type: 'application/pdf', data: fileB64 },
      },
      { type: 'text', text: 'Analyze this form and extract all fields with their input area positions. Return JSON only.' },
    ];
  } else {
    userContent = [
      {
        type: 'image',
        source: { type: 'base64', media_type: mediaType, data: fileB64 },
      },
      { type: 'text', text: 'Analyze this form and extract all fields with their input area positions. Return JSON only.' },
    ];
  }

  const response = await callClaude(systemPrompt, userContent);

  let json: string = response;
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (jsonMatch) json = jsonMatch[0];

  const parsed = JSON.parse(json);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fields: FormField[] = parsed.fields.map((f: any) => ({
    id: f.id,
    label: f.label,
    labelOriginal: f.labelOriginal || f.label,
    type: f.type || 'text',
    required: f.required ?? true,
    format: f.format,
    question: f.question,
    options: f.options,
  }));

  const mandatoryFields = fields.filter((f) => f.required);
  const optionalFields = fields.filter((f) => !f.required);

  const analysis: FormAnalysis = {
    detectedLanguage: parsed.detectedLanguage,
    detectedLanguageLabel: parsed.detectedLanguageLabel,
    formTitleOriginal: parsed.formTitleOriginal,
    formTitleTranslated: parsed.formTitleTranslated,
    summary: parsed.summary,
    mandatoryFields,
    optionalFields,
  };

  return { analysis, fields };
}

/**
 * Parse freehand text against extracted fields using Claude.
 */
export async function parseFreehandText(
  text: string,
  fields: FormField[],
  userLang: string
): Promise<{ filled: FilledField[]; followUps: FollowUpQuestion[] }> {
  // Exclude signature fields from freehand parsing
  const nonSigFields = fields.filter((f) => f.type !== 'signature');
  const fieldList = nonSigFields.map((f) => `- ${f.id}: "${f.label}" (type: ${f.type}, required: ${f.required})`).join('\n');

  const today = new Date();
  const todayStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

  const systemPrompt = `You extract form field values from freehand user text. The user may write in ${userLang} or any language.
Today's date is: ${todayStr}

Form fields to extract:
${fieldList}

Return ONLY valid JSON (no markdown, no code fences) with this structure:
{
  "extracted": [
    { "id": "field_id", "value": "extracted value" }
  ],
  "missing": [
    { "id": "field_id", "label": "Field Label", "question": "Natural question to ask in ${userLang}", "reason": "Brief explanation why this is needed", "type": "text|date|email|phone|number|yesno|select" }
  ]
}

CRITICAL extraction rules — follow these exactly:
- Extract ONLY the specific data value, NEVER the surrounding sentence or description
  - WRONG: "my birth place is Rome" → WRONG value: "my birth place is Rome"
  - RIGHT: "my birth place is Rome" → CORRECT value: "Roma" (just the place name)
  - WRONG: "I was born on 15 June 1988 in Rome" → value for place: "15 June 1988 in Rome"
  - RIGHT: "I was born on 15 June 1988 in Rome" → value for place: "Roma", value for date: "15/06/1988"
- For place/city fields: extract ONLY the city/location name, nothing else
- For name fields: extract ONLY the person's name
- For address fields: extract ONLY the street address
- For dates: normalize to DD/MM/YYYY format. If user says "today" or "today's date", use ${todayStr}
- For yes/no fields, return "Yes" or "No"
- For phone numbers, keep the original format
- NEVER invent or guess values that the user did not provide
- NEVER use placeholder dates or made-up data — only use what the user actually wrote
- If the user says "today" for any date field, use today's date: ${todayStr}
- Only put truly missing fields in "missing"
- Questions in "missing" should be asked in ${userLang}`;

  const response = await callClaude(systemPrompt, [
    { type: 'text', text: `User's freehand input:\n\n${text}` },
  ]);

  let json = response;
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (jsonMatch) json = jsonMatch[0];

  const parsed = JSON.parse(json);

  const filled: FilledField[] = (parsed.extracted || []).map((e: { id: string; value: string }) => {
    const field = nonSigFields.find((f) => f.id === e.id);
    return {
      id: e.id,
      label: field?.label || e.id,
      value: e.value,
      confidence: 'high' as const,
      source: 'freehand' as const,
      position: field?.position,
    };
  });

  const followUps: FollowUpQuestion[] = (parsed.missing || []).map((m: { id: string; label: string; question: string; reason: string; type: string }) => {
    const field = nonSigFields.find((f) => f.id === m.id);
    return {
      fieldId: m.id,
      label: m.label || field?.label || m.id,
      question: m.question || `Please provide your ${m.label || m.id}.`,
      type: (m.type || field?.type || 'text') as FormField['type'],
      options: field?.options,
      reason: m.reason || `I need your ${m.label || m.id} to complete the form.`,
    };
  });

  return { filled, followUps };
}
