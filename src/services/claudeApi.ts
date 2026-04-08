import type { FormField, FormAnalysis, FilledField, FollowUpQuestion } from '../types';
import { analyzeAcroFormFields } from './acroFormAnalyzer';

async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

async function callClaude(
  systemPrompt: string,
  userContent: unknown[],
  maxTokens = 6144,
  signal?: AbortSignal,
  retries = 4,
): Promise<string> {
  for (let attempt = 0; attempt < retries; attempt++) {
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
      signal,
    });

    if (res.status === 429) {
      const wait = 2000 * Math.pow(2, attempt);
      console.warn(`Rate limit hit — waiting ${wait}ms before retry ${attempt + 1}/${retries}`);
      await sleep(wait);
      continue;
    }

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Claude API error: ${res.status} ${err}`);
    }

    const data = await res.json();
    return data.content[0].text;
  }
  throw new Error('Rate limit persists after retries — please wait a minute and try again.');
}

// ── AcroForm field extraction ──
// Reads the PDF's built-in interactive form fields using pdf-lib + PDF.js for accurate positions.
export interface AcroField {
  name: string;
  type: 'text' | 'checkbox' | 'radio' | 'select' | 'signature' | 'other';
  rect: { x: number; y: number; width: number; height: number; page: number };
  fontSize: number;
  options?: string[];
}

export async function extractAcroFields(pdfBytes: Uint8Array): Promise<{ fields: AcroField[]; pageWidths: number[] }> {
  try {
    const { PDFDocument } = await import('pdf-lib');
    const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    const form = doc.getForm();
    const fields = form.getFields();
    if (fields.length === 0) return { fields: [], pageWidths: [] };

    const pdfJsRects = new Map<string, { x: number; y: number; width: number; height: number; page: number }>();
    let pageWidths: number[] = [];
    try {
      const pdfjsLib = await import('pdfjs-dist/build/pdf.mjs');
      if (pdfjsLib.GlobalWorkerOptions) pdfjsLib.GlobalWorkerOptions.workerSrc = '';
      const pdfJsDoc = await pdfjsLib.getDocument({
        data: pdfBytes.slice(),
        useSystemFonts: true,
        isEvalSupported: false,
        useWorkerFetch: false,
        disableAutoFetch: true,
      }).promise;
      for (let pageNum = 1; pageNum <= pdfJsDoc.numPages; pageNum++) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pdfJsPage = await pdfJsDoc.getPage(pageNum) as any;
        const viewport = pdfJsPage.getViewport({ scale: 1.0 });
        pageWidths.push(viewport.width);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const annotations: any[] = await pdfJsPage.getAnnotations();
        for (const annot of annotations) {
          if (annot.subtype === 'Widget' && annot.fieldName && annot.rect) {
            const [x1, y1, x2, y2] = annot.rect;
            pdfJsRects.set(annot.fieldName, {
              x: Math.round(Math.min(x1, x2)),
              y: Math.round(Math.min(y1, y2)),
              width: Math.round(Math.abs(x2 - x1)),
              height: Math.round(Math.abs(y2 - y1)),
              page: pageNum,
            });
          }
        }
      }
    } catch { /* fall through — pdf-lib rect fallback below */ }

    return { fields: fields.map(f => {
      const ctor = f.constructor.name;
      let type: AcroField['type'] = 'other';
      if (ctor.includes('TextField'))    type = 'text';
      else if (ctor.includes('CheckBox')) type = 'checkbox';
      else if (ctor.includes('RadioGroup')) type = 'radio';
      else if (ctor.includes('Dropdown') || ctor.includes('OptionList')) type = 'select';
      else if (ctor.includes('Signature')) type = 'signature';

      const name = f.getName();
      const pdfJsRect = pdfJsRects.get(name);
      let rect: AcroField['rect'];
      if (pdfJsRect) {
        rect = pdfJsRect;
      } else {
        const widgets = (f as any).acroField?.getWidgets?.() || [];
        const r = widgets[0]?.getRectangle?.();
        rect = { x: 0, y: 0, width: r?.width || 0, height: r?.height || 0, page: 1 };
      }

      const da: string = (f as any).acroField?.getDefaultAppearance?.() || '';
      const fsMatch = da.match(/\s(\d+(?:\.\d+)?)\s+Tf/);
      const fontSize = fsMatch ? parseFloat(fsMatch[1]) : 9;

      let options: string[] | undefined;
      if (type === 'radio' || type === 'select') {
        try { options = (f as any).getOptions?.() || undefined; } catch { /* ignore */ }
      }

      return { name, type, rect, fontSize, options };
    }), pageWidths };
  } catch {
    return { fields: [], pageWidths: [] };
  }
}

const API_KEY = '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';
const API_URL = 'https://api.anthropic.com/v1/messages';

/**
 * Efficiently extract nearby text for PDF fields (with timeout to prevent hangs)
 * Returns a map of field name -> nearby label text
 */
async function extractFieldContextFast(
  pdfBytes: Uint8Array,
  acroFields: Array<{ name: string; rect: { x: number; y: number; width: number; height: number; page: number } }>,
): Promise<Map<string, string[]>> {
  const contextMap = new Map<string, string[]>();

  try {
    const pdfjsLib = await import('pdfjs-dist/build/pdf.mjs');
    if (pdfjsLib.GlobalWorkerOptions) pdfjsLib.GlobalWorkerOptions.workerSrc = '';

    // Use a timeout to prevent blocking
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Text extraction timeout')), 5000) // 5 second timeout
    );

    const extractPromise = (async () => {
      const pdfJsDoc = await pdfjsLib.getDocument({
        data: pdfBytes,
        useSystemFonts: true,
        isEvalSupported: false,
        useWorkerFetch: false,
        disableAutoFetch: true,
      }).promise;

      for (let pageNum = 1; pageNum <= Math.min(pdfJsDoc.numPages, 2); pageNum++) { // Only first 2 pages for speed
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const page = await pdfJsDoc.getPage(pageNum) as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const textContent = await page.getTextContent() as any;

        for (const acroField of acroFields) {
          if (acroField.rect.page !== pageNum || contextMap.has(acroField.name)) continue;

          const nearby: string[] = [];
          const searchRadius = 100;

          for (const item of textContent.items) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const ti = item as any;
            if (!ti.str?.trim()) continue;

            const dx = Math.abs((ti.transform?.[4] ?? 0) - acroField.rect.x);
            const dy = Math.abs((ti.transform?.[5] ?? 0) - acroField.rect.y);
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < searchRadius) {
              nearby.push(ti.str.trim());
            }
          }

          if (nearby.length > 0) {
            contextMap.set(acroField.name, nearby.slice(0, 2));
          }
        }
      }
    })();

    await Promise.race([extractPromise, timeoutPromise]);
  } catch (err) {
    // Silently fail — continue without context
    console.warn('Text extraction skipped or timed out');
  }

  return contextMap;
}

/**
 * Robustly extract JSON from Claude's response.
 */
function extractJson(response: string): string {
  const fenceMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenceMatch) return fenceMatch[1];
  const start = response.indexOf('{');
  const end = response.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) return response.slice(start, end + 1);
  return response;
}

export async function analyzeForm(
  fileB64: string,
  fileMime: string,
  signal?: AbortSignal,
): Promise<{ analysis: FormAnalysis; fields: FormField[]; hasAcroFields: boolean }> {

  let acroFields: AcroField[] = [];
  let pageWidths: number[] = [];
  let fieldContextMap = new Map<string, string[]>();

  if (fileMime === 'application/pdf') {
    const rawBytes = Uint8Array.from(atob(fileB64), c => c.charCodeAt(0));
    const result = await extractAcroFields(rawBytes);
    acroFields = result.fields;
    pageWidths = result.pageWidths;

    // Extract text context with timeout protection (max 5 seconds)
    fieldContextMap = await extractFieldContextFast(rawBytes, acroFields);
    console.log('📊 TEXT EXTRACTION COMPLETE:', {
      fieldsWithContext: fieldContextMap.size,
      totalFields: acroFields.length,
      contextSample: Array.from(fieldContextMap.entries()).slice(0, 3),
    });
  }

  const hasAcroFields = acroFields.length > 0;

  // ── ACROFORM PATH: Use PDF structure directly, not Claude ──
  // This is the truly generic approach that works with ANY form
  if (hasAcroFields) {
    console.log('🎯 USING ACROFORM ANALYZER (not Claude)', {
      totalAcroFields: acroFields.length,
      reason: 'Direct PDF field analysis - generic, reliable, no duplicates',
    });

    // Add nearby text labels to each field
    const fieldsWithContext: typeof acroFields = acroFields.map(f => ({
      ...f,
      nearbyLabels: fieldContextMap.get(f.name),
    }));

    const { analysis, fields } = analyzeAcroFormFields(fieldsWithContext);
    return { analysis, fields, hasAcroFields };
  }

  // ── FALLBACK: For non-AcroForm PDFs, use Claude ──
  let systemPrompt: string;

  if (false) { // This block is now dead code, keeping structure for reference
    const separateFieldNames = new Set<string>();
    const hasPositions = acroFields.some(f => f.rect.x > 0 || f.rect.y > 0);
    if (hasPositions) {
      for (let i = 0; i < acroFields.length; i++) {
        for (let j = i + 1; j < acroFields.length; j++) {
          const a = acroFields[i];
          const b = acroFields[j];
          if (a.rect.page !== b.rect.page) continue;
          if (Math.abs(a.rect.y - b.rect.y) <= 15 && Math.abs(a.rect.x - b.rect.x) > 20) {
            separateFieldNames.add(a.name);
            separateFieldNames.add(b.name);
          }
        }
      }
    }

    const fieldList = acroFields
      .map(f => {
        const pos = `"pos":{"x":${f.rect.x},"y":${f.rect.y},"w":${f.rect.width},"h":${f.rect.height},"page":${f.rect.page}}`;
        const sep = separateFieldNames.has(f.name) ? ', "separate":true' : '';
        const context = fieldContextMap.get(f.name);
        const contextStr = context && context.length > 0 ? `, "nearbyLabels": ${JSON.stringify(context)}` : '';
        const base = `{ "pdfFieldName": "${f.name}", "type": "${f.type}", ${pos}${sep}${contextStr}`;
        if (f.options && f.options.length > 0) {
          return `  ${base}, "options": ${JSON.stringify(f.options)} }`;
        }
        return `  ${base} }`;
      })
      .join(',\n');

    // Log how many fields have context included
    const fieldsWithContext = acroFields.filter(f => fieldContextMap.has(f.name)).length;
    console.log('📝 FIELD LIST CONTEXT:', {
      fieldsWithContext,
      totalFields: acroFields.length,
      percentage: Math.round((fieldsWithContext / acroFields.length) * 100) + '%',
    });

    systemPrompt = `You are a form analysis expert. This PDF has ${acroFields.length} interactive AcroForm fields already defined.

The PDF's exact field names, types, and positions (in PDF points, origin = bottom-left) are:
[
${fieldList}
]

Your job: look at the form visually and map each AcroForm field to human-readable information.

CRITICAL FOR UNCLEAR FIELD NAMES:
- Fields named "Text1", "fill_1", "Check Box25", etc. are UNCLEAR
- ALWAYS use the "nearbyLabels" array to understand what they're asking for
- Example: "Text1" with nearbyLabels: ["Reisepassnummer", "Passport"] → This is the passport number field
- Example: "Check Box15" with nearbyLabels: ["yes", "no", "Berufstätigkeit"] → This is a yes/no employment field
- If nearbyLabels exist, use them to create meaningful label and question
- If nearbyLabels are empty, ask the user to provide information for that field (don't skip it)

AVOIDING DUPLICATES:
- Create ONE entry per unique field concept
- If the form has 3 checkboxes for "yes/no/no opinion" on the same question, create ONE yesno field with 3 options
- If you see duplicate labels (e.g. "Place of Birth" appearing twice), investigate: are they really duplicates or
  different fields on different pages/sections? Create one entry per distinct location, don't create duplicates

Return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{
  "detectedLanguage": "language code (e.g. de, fr, it, en)",
  "detectedLanguageLabel": "language name in English",
  "formTitleOriginal": "form title in its original language",
  "formTitleTranslated": "form title translated to English",
  "summary": "2-3 sentence description of the form's purpose",
  "fields": [
    {
      "id": "snake_case_field_id",
      "pdfFieldName": "EXACT field name from the list above — must match precisely",
      "label": "Human readable label in English",
      "labelOriginal": "Label as it appears on the form",
      "type": "text|date|email|phone|number|yesno|select|signature",
      "required": true,
      "format": "format hint if applicable (e.g. DD/MM/YYYY)",
      "question": "Natural question to ask the user for this field",
      "options": ["only for select/radio type"],
      "splitIndex": 0,
      "splitPct": 50,
      "pairedNeinPdfFieldName": "only for yesno checkbox pairs — the nein/no checkbox name"
    }
  ]
}

CRITICAL rules:
- "pdfFieldName" must be copied EXACTLY as given
- List fields in top-to-bottom visual order
- For checkbox fields, type = "yesno"
- For signature fields, type = "signature"
- Do NOT include a "position" key

"separate":true RULE: Any field marked "separate":true is a standalone field. Create EXACTLY ONE entry with its own pdfFieldName. NEVER use splitIndex or splitPct on it.

SPLIT vs SEPARATE FIELDS:
- Two different pdfFieldNames on the same visual row → SEPARATE fields, each gets its own entry
- ONE pdfFieldName spanning both columns (width > 60% of page) → SPLIT field, use splitIndex/splitPct

SPLIT FIELDS ALGORITHM (applies to ALL forms, not just known patterns):
A field is SPLIT if:
1. It has one pdfFieldName but spans >60% of page width, OR
2. It's marked "separate":true but visually spans both left and right columns, OR
3. It contains TWO OR MORE visually distinct input areas on the same horizontal line

For ANY split field you identify (whether in the list below or not):
- Create EXACTLY TWO field entries with the SAME pdfFieldName
- First entry: "splitIndex": 0, label for LEFT side content
- Second entry: "splitIndex": 1, label for RIGHT side content
- The system will automatically render left via AcroForm, right via overlay

KNOWN SPLIT FIELDS (examples - use algorithm above for unknown forms):
- "Name Vorname" → [left="Last Name" (splitIndex:0), right="First Name" (splitIndex:1)]
- "Geburtsdatum Geburtsort" → [left="Date of Birth" (splitIndex:0), right="Place of Birth" (splitIndex:1)]
- "Staatsangehörigkeit Beruf  Arbeitgeber" → [left="Nationality" (splitIndex:0), right="Occupation/Employer" (splitIndex:1)]
- "Staatsangehörigkeit Reisepassnummer" → [left="Nationality" (splitIndex:0), right="Passport Number" (splitIndex:1)]
- "Straße  Hausnummer Postleitzahl  Wohnort" → [left="Street/House Number" (splitIndex:0), right="Postcode/City" (splitIndex:1)]

When in doubt about whether a field is split, err on the side of creating splitIndex 0 and 1 entries.

YES/NO CHECKBOX PAIRS: Create ONE field entry using the ja/yes checkbox pdfFieldName, set type="yesno", add pairedNeinPdfFieldName.

NAME FIELDS: "Name"/"Surname"/"Family name" ALWAYS collects the last name. Be explicit in questions.

VALUE FORMAT RULES:
- Dates: use DD/MM/YYYY unless form specifies otherwise
- Yes/No: use exactly "Yes" or "No"
- Gender: use ONLY the exact abbreviation shown on the form (e.g. "w." or "m." not "female"/"male")`;

  } else {
    systemPrompt = `You are a form analysis expert. This form has no interactive fields — it is a flat/scanned document.
Analyze it visually and extract all fillable areas in top-to-bottom order.

Return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{
  "detectedLanguage": "language code (e.g. de, fr, it, en)",
  "detectedLanguageLabel": "language name in English",
  "formTitleOriginal": "form title in its original language",
  "formTitleTranslated": "form title translated to English",
  "summary": "2-3 sentence description of the form's purpose",
  "fields": [
    {
      "id": "snake_case_field_id",
      "label": "Human readable label in English",
      "labelOriginal": "Label exactly as written on the form",
      "type": "text|date|email|phone|number|yesno|select|signature",
      "required": true,
      "format": "format hint if applicable",
      "question": "Natural question to ask the user",
      "options": ["only for select type"],
      "position": {
        "page": 0,
        "xPct": 55.0,
        "yPct": 23.5,
        "widthPct": 40.0,
        "heightPct": 3.5
      }
    }
  ]
}

POSITION RULES: "position" is the INPUT BOX where text is written, not the label. xPct/yPct use top-left origin.`;
  }

  const isImage = fileMime.startsWith('image/');
  const mediaType = isImage ? fileMime : 'image/png';
  let userContent: unknown[];

  if (fileMime === 'application/pdf') {
    userContent = [
      { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: fileB64 } },
      { type: 'text', text: hasAcroFields
          ? 'Map each AcroForm field to its human-readable label and question. Return JSON only.'
          : 'Analyze this form and estimate the position of each input area. Return JSON only.' },
    ];
  } else {
    userContent = [
      { type: 'image', source: { type: 'base64', media_type: mediaType, data: fileB64 } },
      { type: 'text', text: 'Analyze this form and estimate the position of each input area. Return JSON only.' },
    ];
  }

  const response = await callClaude(systemPrompt, userContent, 8192, signal);

  let parsed: ReturnType<typeof JSON.parse>;
  try {
    parsed = JSON.parse(extractJson(response));
  } catch {
    throw new Error(
      'Could not read the form structure from the API response. ' +
      'This can happen with complex or scanned forms — please try again, or use test mode.'
    );
  }

  if (!parsed.fields || !Array.isArray(parsed.fields)) {
    throw new Error('The form analysis returned an unexpected format. Please try again.');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let fields: FormField[] = parsed.fields.map((f: any) => {
    const acroMatch = acroFields.find(a => a.name === f.pdfFieldName);
    const nativeFontSize = acroMatch?.fontSize ?? 10;

    return {
      id: f.id,
      label: f.label,
      labelOriginal: f.labelOriginal || f.label,
      type: f.type || 'text',
      required: f.required ?? true,
      format: f.format,
      question: f.question,
      options: f.options || acroMatch?.options,
      pdfFieldName: f.pdfFieldName,
      pdfFieldRect: acroMatch?.rect,
      pdfFieldFontSize: nativeFontSize,

      // Spatial constraints for smart rendering
      minFontSize: 6, // Never smaller than this
      maxFontSize: nativeFontSize, // Don't exceed form's native size
      isAutoMetadata: false, // Will be set true for auto-filled fields (date, signature)

      splitIndex: f.splitIndex,
      splitPct: f.splitPct,
      pairedNeinPdfFieldName: f.pairedNeinPdfFieldName,
      position: f.position ? {
        page: f.position.page ?? 0,
        xPct: f.position.xPct ?? 50,
        yPct: f.position.yPct ?? 50,
        widthPct: f.position.widthPct ?? 40,
        heightPct: f.position.heightPct ?? 4,
      } : undefined,
    };
  });

  // ── Deduplicate fields with identical labels ──
  // If multiple fields have the same label (e.g., "Place of Birth" appearing 3 times),
  // keep only the first one to avoid confusing the user with duplicate questions
  const seenLabels = new Set<string>();
  const fieldsBeforeDedupe = fields.length;
  fields = fields.filter((field) => {
    const key = `${field.label}|${field.pdfFieldName}`; // Deduplicate by label + pdfFieldName combo
    if (seenLabels.has(key)) {
      console.warn(`Deduplicating field: ${field.label} (${field.pdfFieldName})`);
      return false; // Skip duplicate
    }
    seenLabels.add(key);
    return true;
  });

  console.log('🧹 DEDUPLICATION:', {
    before: fieldsBeforeDedupe,
    after: fields.length,
    removed: fieldsBeforeDedupe - fields.length,
  });

  // ── Handle combined fields (e.g. "Name Vorname") via coordinate overlay ──
  // These fields span both left and right columns visually but are single AcroForm fields.
  // Split them: left goes via AcroForm, right goes via coordinate overlay (Path B style).
  const combinedFieldPatterns = [
    { fieldName: 'Name Vorname', leftLabel: 'Last Name', rightLabel: 'First Name', rightPct: 52 },
    { fieldName: 'Name Vorname_2', leftLabel: 'Last Name', rightLabel: 'First Name', rightPct: 52 },
    { fieldName: 'Geburtsdatum Geburtsort', leftLabel: 'Date of Birth', rightLabel: 'Place of Birth', rightPct: 62 },
    { fieldName: 'GeburtsdatumGeschlechtwm Geburtsort', leftLabel: 'Date/Gender', rightLabel: 'Place of Birth', rightPct: 65 },
    { fieldName: 'Staatsangehörigkeit Beruf  Arbeitgeber', leftLabel: 'Nationality', rightLabel: 'Occupation/Employer', rightPct: 58 },
    { fieldName: 'Staatsangehörigkeit Reisepassnummer', leftLabel: 'Nationality', rightLabel: 'Passport Number', rightPct: 55 },
    { fieldName: 'Straße  Hausnummer Postleitzahl  Wohnort', leftLabel: 'Street/Number', rightLabel: 'Postcode/City', rightPct: 45 },
  ];

  const rightColumnOverlays: FormField[] = [];
  for (const field of fields) {
    const pattern = combinedFieldPatterns.find(p => p.fieldName === field.pdfFieldName);
    if (!pattern || !field.pdfFieldRect) continue;

    // Get the actual page width from the PDF
    const acroFieldInfo = acroFields.find(a => a.name === field.pdfFieldName);
    const pageNum = acroFieldInfo?.rect.page ?? 1;
    const pageWidth = pageWidths[pageNum - 1] ?? 595; // A4 default: 595 points

    // Calculate right column position as a percentage of the page
    // rightColumnX = left edge of right column in PDF points
    const rightColumnX = acroFieldInfo!.rect.x + acroFieldInfo!.rect.width * (pattern.rightPct / 100);
    const rightColumnXPct = (rightColumnX / pageWidth) * 100;

    // Calculate right column width as a percentage of the page
    const rightColumnWidthPct = (acroFieldInfo!.rect.width * (1 - pattern.rightPct / 100)) / pageWidth * 100;
    const pageHeight = (pageWidth * 11) / 8.5; // A4 aspect ratio: 210 x 297mm

    const rightField: FormField = {
      id: `${field.id}_right`,
      label: pattern.rightLabel,
      labelOriginal: pattern.rightLabel,
      type: field.type,
      required: field.required,
      format: field.format,
      question: field.question?.replace(pattern.leftLabel, pattern.rightLabel),
      options: field.options,
      pdfFieldName: undefined, // No AcroForm field — use coordinate overlay
      position: {
        page: pageNum - 1, // 0-based page index
        xPct: rightColumnXPct,
        yPct: (pageHeight - acroFieldInfo!.rect.y - acroFieldInfo!.rect.height / 2) / pageHeight * 100, // Convert PDF y to top-left origin
        widthPct: rightColumnWidthPct,
        heightPct: (acroFieldInfo!.rect.height / pageHeight) * 100,
      },
    };
    rightColumnOverlays.push(rightField);

    // Keep the original field's split info so questionnaire still asks for left/right separately.
    // The split fields (splitIndex 0 and 1) are used to collect user input,
    // then in pdfGenerator: left goes to AcroForm, right goes to coordinate overlay.
  }

  fields = [...fields, ...rightColumnOverlays];

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

  return { analysis, fields, hasAcroFields };
}

export async function parseFreehandText(
  text: string,
  fields: FormField[],
  userLang: string
): Promise<{ filled: FilledField[]; followUps: FollowUpQuestion[] }> {
  const nonSigFields = fields.filter((f) => f.type !== 'signature');
  const fieldList = nonSigFields.map((f) => {
    const originalLabel = f.labelOriginal && f.labelOriginal !== f.label ? ` [original: "${f.labelOriginal}"]` : '';
    const base = `- ${f.id}: "${f.label}"${originalLabel} (type: ${f.type}, required: ${f.required}`;
    if (f.options && f.options.length > 0) {
      return `${base}, options: [${f.options.join(', ')}])`;
    }
    return `${base})`;
  }).join('\n');

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

CRITICAL extraction rules:
- Extract ONLY the specific data value, never the surrounding sentence
- For dates: normalize to DD/MM/YYYY. If user says "today", use ${todayStr}
- For yes/no fields, return "Yes" or "No"
- For GENDER fields: use ONLY the exact abbreviation the field label shows
- NEVER invent or guess values the user did not provide
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
