import type { FormField, FormAnalysis, FilledField, FollowUpQuestion } from '../types';

// ── AcroForm field extraction ──
// Reads the PDF's built-in interactive form fields using pdf-lib + PDF.js for accurate positions.
export interface AcroField {
  name: string;
  type: 'text' | 'checkbox' | 'radio' | 'select' | 'signature' | 'other';
  rect: { x: number; y: number; width: number; height: number; page: number };
  fontSize: number;
  options?: string[];
}

export async function extractAcroFields(pdfBytes: Uint8Array): Promise<AcroField[]> {
  try {
    const { PDFDocument } = await import('pdf-lib');
    const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    const form = doc.getForm();
    const fields = form.getFields();
    if (fields.length === 0) return [];

    // ── Step 1: build a name→rect map using PDF.js getAnnotations() ──
    // pdf-lib's getRectangle() returns 0 for many PDFs; PDF.js is authoritative for rects.
    const pdfJsRects = new Map<string, { x: number; y: number; width: number; height: number; page: number }>();
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

    // ── Step 2: build AcroField list, merging PDF.js rects ──
    return fields.map(f => {
      const ctor = f.constructor.name;
      let type: AcroField['type'] = 'other';
      if (ctor.includes('TextField'))    type = 'text';
      else if (ctor.includes('CheckBox')) type = 'checkbox';
      else if (ctor.includes('RadioGroup')) type = 'radio';
      else if (ctor.includes('Dropdown') || ctor.includes('OptionList')) type = 'select';
      else if (ctor.includes('Signature')) type = 'signature';

      // Prefer PDF.js rect; fall back to pdf-lib getRectangle()
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

      // Extract font size from /DA (Default Appearance) stream
      const da: string = (f as any).acroField?.getDefaultAppearance?.() || '';
      const fsMatch = da.match(/\s(\d+(?:\.\d+)?)\s+Tf/);
      const fontSize = fsMatch ? parseFloat(fsMatch[1]) : 9;

      // Extract options for radio groups and dropdowns
      let options: string[] | undefined;
      if (type === 'radio' || type === 'select') {
        try { options = (f as any).getOptions?.() || undefined; } catch { /* ignore */ }
      }

      return { name, type, rect, fontSize, options };
    });
  } catch {
    return [];
  }
}

const API_KEY = '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';
const API_URL = 'https://api.anthropic.com/v1/messages';

async function callClaude(
  systemPrompt: string,
  userContent: unknown[],
  maxTokens = 6144,
  signal?: AbortSignal,
): Promise<string> {
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

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API error: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.content[0].text;
}

/**
 * Robustly extract JSON from Claude's response.
 * Handles: plain JSON, markdown code fences, leading/trailing commentary.
 */
function extractJson(response: string): string {
  // Strip ```json ... ``` or ``` ... ``` code fences
  const fenceMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenceMatch) return fenceMatch[1];

  // Find the outermost { ... } block
  const start = response.indexOf('{');
  const end = response.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) return response.slice(start, end + 1);

  // Return as-is and let JSON.parse give the real error
  return response;
}

/**
 * Analyze an uploaded form.
 *
 * TWO PATHS depending on whether the PDF has real AcroForm fields:
 *
 * PATH A — AcroForm PDF (has interactive form fields)
 *   Claude maps the user's data to the PDF's exact field names.
 *   No coordinate guessing needed — we fill by name.
 *
 * PATH B — Scanned / image / flat PDF (no AcroForm fields)
 *   Claude visually analyses the form and estimates input-box positions.
 *   We use coordinate-based text overlay.
 */
export async function analyzeForm(
  fileB64: string,
  fileMime: string,
  signal?: AbortSignal,
): Promise<{ analysis: FormAnalysis; fields: FormField[]; hasAcroFields: boolean }> {

  // ── Step 1: detect AcroForm fields ──
  let acroFields: AcroField[] = [];
  if (fileMime === 'application/pdf') {
    const rawBytes = Uint8Array.from(atob(fileB64), c => c.charCodeAt(0));
    acroFields = await extractAcroFields(rawBytes);
  }
  const hasAcroFields = acroFields.length > 0;

  // ── Step 2: build the right Claude prompt ──
  let systemPrompt: string;

  if (hasAcroFields) {
    // PATH A: tell Claude the exact field names already in the PDF, with positions and row groupings.
    // Pre-compute which fields share a visual row (same page, y within 15pts) using the accurate
    // PDF.js rects. Fields sharing a row are SEPARATE fields — never merged with splitIndex.
    const separateFieldNames = new Set<string>();
    const hasPositions = acroFields.some(f => f.rect.x > 0 || f.rect.y > 0);
    if (hasPositions) {
      for (let i = 0; i < acroFields.length; i++) {
        for (let j = i + 1; j < acroFields.length; j++) {
          const a = acroFields[i];
          const b = acroFields[j];
          if (a.rect.page !== b.rect.page) continue;
          if (Math.abs(a.rect.y - b.rect.y) <= 15 && Math.abs(a.rect.x - b.rect.x) > 20) {
            // These two fields are side-by-side on the same row → both are separate
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
        const base = `{ "pdfFieldName": "${f.name}", "type": "${f.type}", ${pos}${sep}`;
        if (f.options && f.options.length > 0) {
          return `  ${base}, "options": ${JSON.stringify(f.options)} }`;
        }
        return `  ${base} }`;
      })
      .join(',\n');

    systemPrompt = `You are a form analysis expert. This PDF has ${acroFields.length} interactive AcroForm fields already defined.

The PDF's exact field names, types, and positions (in PDF points, origin = bottom-left) are:
[
${fieldList}
]

Your job: look at the form visually and map each AcroForm field to human-readable information.

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
- "pdfFieldName" must be copied EXACTLY as given — this is used to fill the PDF directly
- List fields in top-to-bottom visual order
- For checkbox fields, type = "yesno"
- For signature fields, type = "signature"
- Do NOT include a "position" key — it is not needed for AcroForm PDFs

"separate":true RULE — ABSOLUTE PRIORITY:
Any field marked "separate":true in the list above has been CONFIRMED by code analysis to be a standalone field on the same row as another field. For these fields:
- Create EXACTLY ONE entry with its own pdfFieldName
- NEVER use splitIndex or splitPct on a "separate":true field
- The field contains ONLY ONE data item (its own column's value)
Example: if Text1 and Text2 are both "separate":true and are side-by-side, Text1 gets label "Last name" and Text2 gets label "First name" — two completely independent entries.
Violating this rule will cause data to appear in the wrong column of the PDF.

OPAQUE FIELD HANDLING — many PDFs have fields with generic names like "Text1", "Text22", "fill_1", "fill_8", "Check Box5", "Check Box6", etc. These names carry no semantic meaning. For each such field:
1. Visually locate it on the form by its position (which row, which label is it next to)
2. Only include it in your response if you are 100% certain of its purpose
3. If you are not certain, OMIT IT — a wrong fill is worse than a blank field
For CHECKBOXES with generic names: identify the label each checkbox is visually adjacent to (e.g. "ledig", "verheiratet", "ja", "nein"). Map each checkbox to the correct label. For yes/no checkbox pairs, identify which is "ja" and which is "nein" from their visual positions.
For TEXT fields with generic names: only fill them if the field's position clearly corresponds to a specific data item (e.g., a count field next to "Anzahl", an income field next to "Euro").

SPLIT vs SEPARATE FIELDS — THE MOST IMPORTANT RULE (read carefully):
The field list above includes each field's position ("pos": {x, y, w, h, page}). Use these positions to determine the correct mapping:

SEPARATE FIELDS (most common): Two different pdfFieldNames on the same visual row (similar y-coordinate, different x-coordinate) are SEPARATE fields. Each gets its OWN entry with its OWN pdfFieldName and NO splitIndex. Example:
  - Text1 at (x:50, y:720, w:230) → label "Name/Familienname" → separate entry, pdfFieldName:"Text1"
  - Text2 at (x:310, y:720, w:230) → label "Vorname" → separate entry, pdfFieldName:"Text2"
  These are TWO entries with TWO different pdfFieldNames. NO split needed.

COMBINED/SPLIT FIELD (rare, only when ONE field spans BOTH columns): ONE pdfFieldName with a large width (close to full page width, e.g. w>400pts on A4) that visually covers two label columns. In this case create two entries sharing the SAME pdfFieldName with splitIndex 0 and 1, and splitPct summing to 100.
  Rule of thumb: if the field width is less than 60% of the page width (~355pts on A4), it is a SEPARATE field, not a combined one.

DECISION ALGORITHM — for each visual row:
1. Look at all pdfFieldNames whose pos.y is within ~15pts of each other (same row)
2. If there are 2+ fields on that row → they are SEPARATE fields. Create one entry per field, each with its own pdfFieldName, no splitIndex.
3. If there is exactly 1 field on that row but the visual form shows 2 label columns → that ONE field is a combined/split field. Create 2+ entries with the same pdfFieldName and splitIndex values.
4. NEVER assign two different data items to the same pdfFieldName unless you have confirmed there is truly only ONE field on that row.

COMBINED FIELD SPLITTING — only when confirmed ONE field spans BOTH columns:
Create one entry per visual column — each with the same "pdfFieldName", a unique "id", its own "label"/"question", "splitIndex" (0-based), and "splitPct" (% of total field width; all splitPcts for the same pdfFieldName MUST sum to 100).

SPLIT PATTERNS (apply ONLY to confirmed single-field rows):
- One field spanning "Surname" + "First name" → split: {splitIndex:0, splitPct:48} and {splitIndex:1, splitPct:52}
- One field spanning "Date of birth" + "Place of birth" → split: {splitIndex:0, splitPct:38} and {splitIndex:1, splitPct:62}
- One field spanning "Date of birth" + "Gender" + "Place of birth" → split into 3 entries
- One field spanning "Nationality" + "Occupation/Employer" → split: {splitIndex:0, splitPct:42} and {splitIndex:1, splitPct:58}
- One field spanning "Street/House number" + "Postcode/City" → split: {splitIndex:0, splitPct:55} and {splitIndex:1, splitPct:45}

For single-column fields (one data item only), do NOT set splitIndex or splitPct.

YES/NO CHECKBOX PAIRS — one field only per pair:
The form has many yes/no question pairs where two checkboxes sit side by side (ja/nein, yes/no, oui/non, etc.). For each such pair:
- Create ONLY ONE field entry, using the "ja"/"yes" checkbox's pdfFieldName
- Set type = "yesno"
- Add "pairedNeinPdfFieldName": "<exact name of the nein/no checkbox>"
- Do NOT create a separate field for the "nein" checkbox — it will be auto-set to the opposite value
Example: "Is your spouse employed? □ja □nein" → one field {pdfFieldName:"Check Box10", pairedNeinPdfFieldName:"Check Box11", type:"yesno"}

MUTUALLY EXCLUSIVE CHECKBOX GROUPS (e.g. marital status):
For groups like Familienstand (ledig/verheiratet/verwitwet/etc.), create ONE field per option. The user picks one. Only that checkbox gets checked; the others stay unchecked. Do not group them into a single field.

NAME FIELD CONVENTION (universal):
- A field labelled "Name", "Surname", "Family name", "Last name", or equivalent in any language ALWAYS collects the family/last name. Never put a given/first name into this column.
- When asking for the family name, be explicit: "What is your last name / family name?"
- When asking for the first/given name, be explicit: "What is your first name / given name?"

VALUE FORMAT RULES:
- Dates: use the format shown on the form (e.g. DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD). If the form doesn't specify a format, default to DD/MM/YYYY.
- Phone numbers: keep the original format the user provides
- Yes/No fields: use exactly "Yes" or "No" (capitalised)
- Gender fields: use the abbreviations shown on the form (e.g. "w./m.", "F/M", "f/m") — match the form's own notation

FIELD TYPE ENFORCEMENT:
- number/amount fields (Einkommen, Euro, Betrag, income): ONLY accept numeric values (e.g. "2500"). NEVER write text like "married", "employed", "N/A" into these fields. If you don't have a number, leave the field out of the response entirely.
- checkbox/radio fields: the value MUST be one of the field's exported options. NEVER put free text into checkbox/radio fields.
- Marital status (Familienstand) is ALWAYS a radio group or checkbox — map it to the correct option value, never to a text field.
- For "Ist Ihre Ehefrau/Ihr Ehemann berufstätig?" type yes/no questions, only fill them if the user explicitly confirmed. If unknown, omit.

GENDER FIELDS: When a combined field has a gender sub-column (e.g. "Geburtsdatum | Geschlecht | Geburtsort"), the gender value MUST be EXACTLY the abbreviation printed on the form label — nothing else:
- If the form shows "w./m." → use "w." for female, "m." for male
- If the form shows "F/M" → use "F" for female, "M" for male
NEVER write "female", "male", "weiblich", "männlich" or any full word. Only the exact abbreviation shown on the form.

ADDRESS-AT-HOST FIELDS: If a field asks "Is the guest staying at your address? ja/nein" (or "siehe Gastgeber ja/nein"), treat it as a yesno field. Fill the "ja" checkbox if the guest is staying at the host's address. Do NOT put the address text into this field.

HOST vs GUEST DATA BOUNDARY: Forms that invite guests have two distinct sections — one for the HOST (inviter/Gastgeber) and one for the GUEST (invitee/Gast). Identify from the form's visual layout which section each field belongs to.
- NEVER fill a GUEST section field with HOST data (host name, host address, host employer, etc.)
- NEVER fill a HOST section field with GUEST data
- If an opaque field (Text22, Text18, etc.) in the guest section appears to want the host's name or address as a cross-reference, OMIT IT — leave it blank. The official will fill cross-references manually.`;

  } else {
    // PATH B: no AcroForm fields — Claude must estimate visual positions
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

POSITION RULES (critical — wrong values cause text to land in wrong fields):
- "position" is the INPUT BOX where text is written, not the label
- xPct/yPct use top-left origin: top-left = (0,0), bottom-right = (100,100)
- Be as precise as possible — a 2% yPct error lands text in the wrong row
- Never omit position for any field`;
  }

  // ── Step 3: call Claude ──
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
  const fields: FormField[] = parsed.fields.map((f: any) => {
    const acroMatch = acroFields.find(a => a.name === f.pdfFieldName);
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
      pdfFieldFontSize: acroMatch?.fontSize,
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
- For GENDER fields: look at the field's label to find the expected abbreviation format (e.g. "w./m.", "F/M"). Then map: female/woman/she/weiblich → the female abbreviation; male/man/he/männlich → the male abbreviation. NEVER return "female", "male", "F", "M" or any full word — only the exact abbreviation the field label shows. Example: label contains "w./m." → use "w." for female.
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
