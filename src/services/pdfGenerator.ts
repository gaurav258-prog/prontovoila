import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { FilledField, FormField, FormAnalysis, SignatureData } from '../types';

const NAVY = rgb(22 / 255, 47 / 255, 73 / 255);
const GOLD = rgb(201 / 255, 168 / 255, 76 / 255);
const INK = rgb(26 / 255, 26 / 255, 24 / 255);
const INK3 = rgb(107 / 255, 106 / 255, 100 / 255);
const CREAM = rgb(245 / 255, 244 / 255, 240 / 255);
const WHITE = rgb(1, 1, 1);
// DARK_BLUE removed — filled text now uses INK to match form's own typography;

function base64ToUint8Array(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// ── Extract text positions from PDF using pdf.js ──

interface TextItem {
  str: string;
  x: number;       // PDF x coordinate (from left)
  y: number;       // PDF y coordinate (from bottom)
  width: number;
  fontSize: number; // Detected font size in points
  page: number;
}

async function extractTextPositions(pdfBytes: Uint8Array): Promise<{ items: TextItem[]; pageHeights: number[]; pageWidths: number[] }> {
  // Dynamically import pdfjs-dist to handle browser/worker setup
  const pdfjsLib = await import('pdfjs-dist/build/pdf.mjs');

  // Set up the worker - use a fake worker (inline) to avoid worker file issues
  if (pdfjsLib.GlobalWorkerOptions) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '';
  }

  const loadingTask = pdfjsLib.getDocument({
    data: pdfBytes.slice(), // copy to avoid detached buffer issues
    useSystemFonts: true,
    isEvalSupported: false,
    useWorkerFetch: false,
    disableAutoFetch: true,
  });

  const doc = await loadingTask.promise;
  const items: TextItem[] = [];
  const pageHeights: number[] = [];
  const pageWidths: number[] = [];

  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const viewport = page.getViewport({ scale: 1.0 });
    pageHeights.push(viewport.height);
    pageWidths.push(viewport.width);

    const textContent = await page.getTextContent();
    for (const item of textContent.items) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ti = item as any;
      if (!ti.str?.trim()) continue;
      const tx = ti.transform?.[4] ?? 0;
      const ty = ti.transform?.[5] ?? 0;
      const w = ti.width ?? 0;
      // Font size: use item height if available, otherwise derive from transform matrix
      // transform = [scaleX, skewX, skewY, scaleY, tx, ty] — scaleY ≈ font size for upright text
      const detectedSize = ti.height
        ? Math.abs(ti.height)
        : Math.abs(ti.transform?.[3] ?? 0);
      const fontSize = detectedSize > 0 ? detectedSize : 10;
      items.push({ str: ti.str, x: tx, y: ty, width: w, fontSize, page: p - 1 });
    }
  }

  return { items, pageHeights, pageWidths };
}

/**
 * Estimate the font size to use for filled-in text on a given page.
 * Looks at all body-text items on the page (excluding very small labels and very large headings)
 * and returns the most common (mode) size, clamped to a sensible range.
 */
function detectBodyFontSize(pageItems: TextItem[]): number {
  // Collect sizes that look like regular form body text (6–16pt)
  const sizes = pageItems
    .map(i => Math.round(i.fontSize))
    .filter(s => s >= 6 && s <= 16);
  if (sizes.length === 0) return 10;

  // Return the mode (most frequent size)
  const freq: Record<number, number> = {};
  for (const s of sizes) freq[s] = (freq[s] ?? 0) + 1;
  const mode = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
  return Number(mode[0]);
}

/**
 * Find the best matching text item for a field label.
 * Conservative matching only — avoids single-word matches that cause wrong-field placement.
 */
function findLabelPosition(labelOriginal: string, textItems: TextItem[]): TextItem | null {
  const needle = labelOriginal.toLowerCase().trim();

  // Tier 1: exact substring match
  for (const item of textItems) {
    if (item.str.toLowerCase().includes(needle)) return item;
  }

  // Tier 2: all significant words of the label are present in the text item
  const words = needle.split(/\s+/).filter(w => w.length > 2);
  if (words.length >= 2) {
    for (const item of textItems) {
      const itemLower = item.str.toLowerCase();
      const matchCount = words.filter(w => itemLower.includes(w)).length;
      // Require ALL words to match (not just 2), to avoid false positives
      if (matchCount === words.length) return item;
    }
  }

  // NOTE: Single-word fallback intentionally removed — it caused wrong-field placement
  // when common words like "Name", "Datum", "Adresse" appeared in multiple labels.
  return null;
}

// ── OVERLAY PDF: Fill the ORIGINAL form ──

export interface OverlayPdfOptions {
  originalFileB64: string;
  originalFileMime: string;
  filledFields: FilledField[];
  fields: FormField[];
  signatures: SignatureData[];
  hasAcroFields?: boolean; // If true, fill using AcroForm fields by name (Path A)
}

export async function generateOverlayPdf(options: OverlayPdfOptions): Promise<Uint8Array> {
  const { originalFileB64, originalFileMime, filledFields, fields, signatures, hasAcroFields } = options;
  const rawBytes = base64ToUint8Array(originalFileB64);

  // Declare doc at function level so it's accessible to both Path A and Path B
  let doc: PDFDocument | null = null;

  // ── PATH A: PDF with real AcroForm fields — fill by name, no guessing ──
  if (hasAcroFields && originalFileMime === 'application/pdf') {
    doc = await PDFDocument.load(rawBytes, { ignoreEncryption: true });
    const form = doc.getForm();

    // Embed Helvetica so we can regenerate appearance streams for auto-size and split fields
    const helvetica = await doc.embedFont(StandardFonts.Helvetica);

    // Build a reliable field rect map using PDF.js getAnnotations().
    // pdf-lib's internal widget rect extraction is unreliable for many PDFs (returns 0 or throws).
    // PDF.js getAnnotations() is purpose-built for rect extraction and works on any PDF structure.
    const pdfJsFieldRects = new Map<string, { width: number; height: number }>();
    try {
      const pdfjsLib = await import('pdfjs-dist/build/pdf.mjs');
      if (pdfjsLib.GlobalWorkerOptions) pdfjsLib.GlobalWorkerOptions.workerSrc = '';
      const pdfJsDoc = await pdfjsLib.getDocument({
        data: rawBytes.slice(),
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
            const w = Math.abs(x2 - x1);
            const h = Math.abs(y2 - y1);
            if (w > 0) pdfJsFieldRects.set(annot.fieldName, { width: w, height: h });
          }
        }
      }
    } catch { /* fall through — existing fallbacks will handle it */ }

    // Group FormFields by pdfFieldName to handle combined (split) fields
    const byPdfFieldName = new Map<string, FormField[]>();
    for (const field of fields) {
      if (!field.pdfFieldName) continue;
      const group = byPdfFieldName.get(field.pdfFieldName) ?? [];
      group.push(field);
      byPdfFieldName.set(field.pdfFieldName, group);
    }

    // Track which paired nein fields have been handled (to avoid processing them twice)
    const handledPairedFields = new Set<string>();

    for (const [pdfFieldName, group] of byPdfFieldName) {
      // Sort by splitIndex so sub-fields are in correct left-to-right order
      const sorted = [...group].sort((a, b) => (a.splitIndex ?? 0) - (b.splitIndex ?? 0));

      if (sorted.length === 1 && sorted[0].splitIndex === undefined) {
        // Simple single field
        const field = sorted[0];

        // Skip if this is a paired nein field that was already handled by its ja counterpart
        if (field.pairedNeinPdfFieldName === undefined && handledPairedFields.has(pdfFieldName)) {
          continue;
        }

        const filled = filledFields.find(f => f.id === field.id);
        if (!filled || filled.skipped || !filled.value) continue;
        // Clamp font size: if the PDF's /DA has fontSize=0 (auto-size), it can blow up in tall fields
        const pdfFieldFontSize = field.pdfFieldFontSize ?? 0;
        const pdfFieldRect = field.pdfFieldRect;
        const effectiveFontSize = pdfFieldFontSize > 0
          ? pdfFieldFontSize
          : Math.max(7, Math.min(10, (pdfFieldRect?.height ?? 20) * 0.55));
        try {
          if (field.type === 'yesno') {
            const isYes = filled.value.toLowerCase() === 'yes' || filled.value === 'true';
            const cb = form.getCheckBox(pdfFieldName);
            if (isYes) cb.check(); else cb.uncheck();
            // Auto-set the paired nein checkbox to the opposite value
            if (field.pairedNeinPdfFieldName) {
              try {
                const neinCb = form.getCheckBox(field.pairedNeinPdfFieldName);
                if (isYes) neinCb.uncheck(); else neinCb.check();
                // Mark the paired nein field as handled so we don't process it again
                handledPairedFields.add(field.pairedNeinPdfFieldName);
              } catch { /* field not found */ }
            }
          } else if (field.type === 'select') {
            const dropdown = form.getDropdown(pdfFieldName);
            const opts = dropdown.getOptions();
            const match = opts.find(o => o.toLowerCase() === filled.value.toLowerCase()) ?? opts[0];
            if (match) dropdown.select(match);
          } else if (field.type === 'radio') {
            try {
              const rg = form.getRadioGroup(pdfFieldName);
              const opts = rg.getOptions();
              const match = opts.find(o => o.toLowerCase() === filled.value.toLowerCase())
                ?? opts.find(o => filled.value.toLowerCase().includes(o.toLowerCase()));
              if (match) rg.select(match);
            } catch { /* ignore */ }
          } else if (field.type !== 'signature') {
            const tf = form.getTextField(pdfFieldName);
            tf.setText(filled.value);
            // For auto-size fields (pdfFieldFontSize=0), setFontSize alone doesn't update the
            // rendered appearance — the viewer ignores /DA without a regenerated /AP stream.
            // Call updateAppearances to bake in our calculated font size.
            const isAutoSize = (field.pdfFieldFontSize ?? 0) === 0;
            if (isAutoSize) {
              tf.setFontSize(effectiveFontSize);
              try { tf.updateAppearances(helvetica); } catch { /* ignore if field uses custom font */ }
            }
          }
        } catch { /* field not found or wrong type */ }
      } else {
        // Combined/split field — only fill the LEFT column (splitIndex=0) in the AcroForm.
        // RIGHT column (splitIndex=1) will be drawn via coordinate overlay in Path B.

        // Only use the left-column (splitIndex=0) value
        const leftField = sorted.find(f => f.splitIndex === 0);
        if (!leftField) continue;

        const leftFilled = filledFields.find(f => f.id === leftField.id);
        if (!leftFilled || leftFilled.skipped || !leftFilled.value) continue;

        const pdfFieldFontSize = leftField.pdfFieldFontSize ?? 0;
        const effectiveFontSize = pdfFieldFontSize > 0
          ? pdfFieldFontSize
          : Math.max(7, Math.min(10, (leftField.pdfFieldRect?.height ?? 20) * 0.55));

        try {
          const tf = form.getTextField(pdfFieldName);
          tf.setText(leftFilled.value);
          tf.setFontSize(effectiveFontSize);
          // CRITICAL: regenerate appearance stream so the viewer uses our exact font size.
          try { tf.updateAppearances(helvetica); } catch { /* ignore if field uses custom font */ }
        } catch { /* field not found */ }
      }
    }

    // Handle signatures separately — typed name only (drawn sigs handled visually by user)
    for (const sig of signatures) {
      if (sig.mode === 'after-print' || !sig.dataUrl) continue;
      const sigField = fields.find(f => f.id === sig.fieldId);
      if (!sigField?.pdfFieldName) continue;
      try {
        form.getTextField(sigField.pdfFieldName).setText(sig.typedName ?? '');
      } catch { /* ignore */ }
    }

    // DO NOT call form.updateFieldAppearances() — it overrides the PDF's native
    // field typography with pdf-lib defaults (wrong font size, too large for compact fields).
    // DO NOT call form.flatten() — the PDF viewer renders fields at the correct native
    // size and style when fields are left interactive.
    // Continue to Path B to fill any coordinate-overlay fields (those without pdfFieldName).
  }

  // ── PATH B: Coordinate-based text overlay (also handles overlay fields from AcroForm PDFs) ──
  // For AcroForm PDFs, doc is already loaded above. For scanned/image forms, load/create here.
  let textPositions: { items: TextItem[]; pageHeights: number[]; pageWidths: number[] } | null = null;

  if (!doc) {
    // doc wasn't initialized in Path A, so either it's a non-AcroForm PDF or an image
    if (originalFileMime === 'application/pdf') {
      doc = await PDFDocument.load(rawBytes, { ignoreEncryption: true });
      try {
        textPositions = await extractTextPositions(rawBytes);
      } catch {
        // Fall back to estimate-based positioning if text extraction fails
      }
    } else {
      // Image: create a PDF with the image as background
      doc = await PDFDocument.create();
      let img;
      if (originalFileMime === 'image/png') {
        img = await doc.embedPng(rawBytes);
      } else {
        img = await doc.embedJpg(rawBytes);
      }
      const imgW = img.width;
      const imgH = img.height;
      const pageW = 595;
      const pageH = Math.min((imgH / imgW) * pageW, 842);
      const page = doc.addPage([pageW, pageH]);
      page.drawImage(img, { x: 0, y: 0, width: pageW, height: pageH });
    }
  }

  // At this point, doc is guaranteed to be non-null
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const font = await doc!.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc!.embedFont(StandardFonts.HelveticaBold);
  const pages = doc!.getPages();

  // Separate data fields from signature fields
  let dataFields = fields.filter((f) => f.type !== 'signature');
  const sigFields = fields.filter((f) => f.type === 'signature');

  // In Path B, skip AcroForm fields that were already filled in Path A.
  // Only render overlay fields (those with position but no pdfFieldName).
  if (hasAcroFields) {
    dataFields = dataFields.filter((f) => !f.pdfFieldName && f.position);
  }

  const allFields = [...dataFields, ...sigFields];

  const page0 = pages[0];
  const ph = page0.getHeight();

  // Detect the body font size of the form from its existing text (per page)
  // This ensures filled-in text visually matches the form's own typography
  const pageFontSizes: number[] = pages.map((_: any, pIdx: number) => {
    if (!textPositions) return 10;
    const pageItems = textPositions.items.filter(i => i.page === pIdx);
    return detectBodyFontSize(pageItems);
  });

  // Fallback: evenly distribute all fields in the form area (28%-82% from top)
  const formTop = ph * 0.72;    // 28% from top = 72% from bottom
  const formBottom = ph * 0.18;  // 82% from top = 18% from bottom
  const formHeight = formTop - formBottom;
  const totalFields = allFields.length;
  const fieldSpacing = totalFields > 1 ? formHeight / totalFields : formHeight / 2;

  // Text color: match the form's ink — use near-black (same as printed form text)
  const TEXT_COLOR = INK;

  // Place each data field value
  // Priority: (1) Claude's position data → (2) label-anchor in PDF text → (3) even distribution
  dataFields.forEach((field, idx) => {
    let filled = filledFields.find((f) => f.id === field.id);

    // For synthetic overlay fields (_right), find the corresponding split field data
    if (!filled && field.id.endsWith('_right')) {
      const originalId = field.id.replace('_right', '');
      // Find the right-column version (splitIndex=1) of the original field
      const rightSplitField = fields.find((f) => f.id === originalId && f.splitIndex === 1);
      if (rightSplitField) {
        filled = filledFields.find((f) => f.id === rightSplitField.id);
      }
    }

    if (!filled || filled.skipped || !filled.value) return;

    const pageIdx = Math.min(field.position?.page ?? 0, pages.length - 1);
    const page = pages[pageIdx];
    const pagePw = page.getWidth();
    const pagePh = page.getHeight();

    // Use the font size detected from this page's existing text
    const fontSize = pageFontSizes[pageIdx] ?? 10;

    let x: number;
    let y: number;
    let maxTextWidth: number;

    if (field.position) {
      // TIER 1 (best): Use Claude's estimated position for the INPUT BOX.
      // xPct/yPct are from top-left (screen convention); pdf-lib y is from bottom.
      const boxLeft   = (field.position.xPct    / 100) * pagePw;
      const boxTop    = pagePh - (field.position.yPct    / 100) * pagePh;
      const boxHeight = (field.position.heightPct / 100) * pagePh;
      const boxWidth  = (field.position.widthPct  / 100) * pagePw;

      x = boxLeft + 3;
      // Vertically centre the text baseline within the box using the actual font size
      y = boxTop - (boxHeight / 2) - (fontSize * 0.35);
      maxTextWidth = Math.max(boxWidth - 8, 40);
    } else {
      // TIER 2: Try to find the label in the PDF text and place value below/after it
      const labelText = field.labelOriginal || field.label;
      const labelItem = textPositions
        ? findLabelPosition(labelText, textPositions.items.filter(i => i.page === pageIdx))
        : null;

      if (labelItem) {
        // Place value one line-height below the label, aligned to its left edge
        // Use the label's own font size so spacing is proportional
        const labelSize = labelItem.fontSize > 0 ? labelItem.fontSize : fontSize;
        x = labelItem.x;
        y = labelItem.y - labelSize - 4;
        maxTextWidth = pagePw - x - 20;
      } else {
        // TIER 3 (last resort): evenly distribute in the form area
        x = pagePw * 0.55;
        y = formTop - (idx + 0.5) * fieldSpacing;
        maxTextWidth = pagePw * 0.4;
      }
    }

    if (field.type === 'yesno') {
      const mark = filled.value.toLowerCase() === 'yes' ? 'X' : '';
      if (mark) {
        page.drawText(mark, { x, y, size: fontSize, font: fontBold, color: TEXT_COLOR });
      }
    } else {
      page.drawText(filled.value, {
        x,
        y,
        size: fontSize,
        font,
        color: TEXT_COLOR,
        maxWidth: maxTextWidth > 0 ? maxTextWidth : pagePw * 0.4,
      });
    }
  });

  // Place signatures
  sigFields.forEach((field, idx) => {
    const sig = signatures.find((s) => s.fieldId === field.id);
    if (!sig) return;

    const pageIdx = Math.min(field.position?.page ?? 0, pages.length - 1);
    const page = pages[pageIdx];
    const pagePw = page.getWidth();
    const pagePh = page.getHeight();
    const fontSize = pageFontSizes[pageIdx] ?? 10;

    let x: number;
    let y: number;

    if (field.position) {
      const boxLeft   = (field.position.xPct    / 100) * pagePw;
      const boxTop    = pagePh - (field.position.yPct    / 100) * pagePh;
      const boxHeight = (field.position.heightPct / 100) * pagePh;
      x = boxLeft + 3;
      y = boxTop - (boxHeight / 2) - (fontSize * 0.35);
    } else {
      const labelText = field.labelOriginal || field.label;
      const labelItem = textPositions ? findLabelPosition(labelText, textPositions.items.filter(i => i.page === pageIdx)) : null;
      if (labelItem) {
        const labelSize = labelItem.fontSize > 0 ? labelItem.fontSize : fontSize;
        x = labelItem.x;
        y = labelItem.y - labelSize - 4;
      } else {
        x = pagePw * 0.55;
        const sigIdx = dataFields.length + idx;
        y = formTop - (sigIdx + 0.5) * fieldSpacing;
      }
    }

    if (sig.mode === 'after-print') {
      // Leave blank — the line is already on the form
    } else if (sig.dataUrl) {
      const sigB64 = sig.dataUrl.split(',')[1];
      if (sigB64) {
        try {
          const sigBytes = base64ToUint8Array(sigB64);
          const maxSigW = pagePw * 0.25;
          embedSignature(doc, page, sigBytes, x, y - 25, maxSigW, 30);
        } catch {
          // Fallback: draw typed name
          if (sig.typedName) {
            page.drawText(sig.typedName, { x, y, size: fontSize, font, color: INK });
          }
        }
      }
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return doc!.save();
}

// Helper to embed signature — needs to be called with await in the main function
async function embedSignature(
  doc: PDFDocument, page: ReturnType<PDFDocument['getPages']>[0],
  pngBytes: Uint8Array, x: number, y: number, maxW: number, maxH: number
) {
  try {
    const img = await doc.embedPng(pngBytes);
    const aspect = img.width / img.height;
    let drawH = Math.min(maxH, 35);
    let drawW = drawH * aspect;
    if (drawW > maxW) {
      drawW = maxW;
      drawH = drawW / aspect;
    }
    page.drawImage(img, { x, y, width: drawW, height: drawH });
  } catch {
    // silently fail if image embedding fails
  }
}


// ── SUMMARY PDF: Fallback/alternative ──

export interface SummaryPdfOptions {
  formAnalysis: FormAnalysis | null;
  filledFields: FilledField[];
  langLabel: string;
  langCode: string;
  fileName?: string;
}

export async function generateSummaryPdf(options: SummaryPdfOptions): Promise<Uint8Array> {
  const { formAnalysis, filledFields, langLabel, langCode, fileName } = options;

  const doc = await PDFDocument.create();
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const PAGE_W = 595;
  const PAGE_H = 842;
  const MARGIN = 50;
  const CONTENT_W = PAGE_W - MARGIN * 2;

  let page = doc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;

  const addPage = () => {
    drawFooter();
    page = doc.addPage([PAGE_W, PAGE_H]);
    y = PAGE_H - MARGIN;
  };

  const ensureSpace = (needed: number) => {
    if (y - needed < MARGIN + 30) addPage();
  };

  const drawFooter = () => {
    const footerText = `Generated by ProntoVoila  |  ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}`;
    const footerW = fontRegular.widthOfTextAtSize(footerText, 8);
    page.drawText(footerText, { x: PAGE_W / 2 - footerW / 2, y: 25, size: 8, font: fontRegular, color: INK3 });
  };

  // Header
  page.drawRectangle({ x: MARGIN, y: y - 60, width: CONTENT_W, height: 60, color: NAVY });
  const title = formAnalysis?.formTitleTranslated || 'Filled Form';
  page.drawText('ProntoVoila', { x: MARGIN + 18, y: y - 25, size: 16, font: fontBold, color: WHITE });
  page.drawText(title, { x: MARGIN + 18, y: y - 45, size: 10, font: fontRegular, color: GOLD });
  const langText = `${langLabel} (${langCode})`;
  const langW = fontRegular.widthOfTextAtSize(langText, 9);
  page.drawText(langText, { x: MARGIN + CONTENT_W - langW - 18, y: y - 38, size: 9, font: fontRegular, color: WHITE });
  y -= 80;

  if (formAnalysis) {
    page.drawText('Original form:', { x: MARGIN, y, size: 9, font: fontRegular, color: INK3 });
    page.drawText(formAnalysis.formTitleOriginal, { x: MARGIN + 75, y, size: 9, font: fontBold, color: INK });
    y -= 16;
    if (fileName) {
      page.drawText('Source file:', { x: MARGIN, y, size: 9, font: fontRegular, color: INK3 });
      page.drawText(fileName, { x: MARGIN + 75, y, size: 9, font: fontRegular, color: INK });
      y -= 16;
    }
    page.drawText('Form language:', { x: MARGIN, y, size: 9, font: fontRegular, color: INK3 });
    page.drawText(formAnalysis.detectedLanguageLabel, { x: MARGIN + 75, y, size: 9, font: fontRegular, color: INK });
    y -= 24;
  }

  page.drawLine({ start: { x: MARGIN, y }, end: { x: MARGIN + CONTENT_W, y }, thickness: 1, color: rgb(221/255, 219/255, 211/255) });
  y -= 24;
  page.drawText('FILLED FORM DATA', { x: MARGIN, y, size: 10, font: fontBold, color: NAVY });
  y -= 20;

  const LABEL_W = 160;
  const VALUE_X = MARGIN + LABEL_W + 10;
  const VALUE_W = CONTENT_W - LABEL_W - 10;

  for (const field of filledFields) {
    const valueText = field.skipped ? '\u2014  (not provided)' : (field.value || '\u2014');
    const valueLines = wrapText(valueText, fontRegular, 10.5, VALUE_W - 20);
    const rowHeight = Math.max(36, 16 + valueLines.length * 14 + 10);
    ensureSpace(rowHeight + 6);
    const rowTop = y;

    page.drawRectangle({ x: MARGIN, y: rowTop - rowHeight, width: CONTENT_W, height: rowHeight, color: CREAM });
    if (!field.skipped && field.value) {
      page.drawRectangle({ x: VALUE_X - 4, y: rowTop - rowHeight + 4, width: 2.5, height: rowHeight - 8, color: GOLD });
    }

    page.drawText(field.label.toUpperCase(), { x: MARGIN + 12, y: rowTop - 16, size: 8.5, font: fontBold, color: INK3 });
    const valueColor = field.skipped ? INK3 : INK;
    const valueFont = field.skipped ? fontRegular : fontBold;
    valueLines.forEach((line, i) => {
      page.drawText(line, { x: VALUE_X + 8, y: rowTop - 16 - i * 14, size: 10.5, font: valueFont, color: valueColor });
    });

    y -= rowHeight + 6;
  }

  drawFooter();
  return doc.save();
}

function wrapText(
  text: string,
  font: { widthOfTextAtSize: (text: string, size: number) => number },
  fontSize: number,
  maxWidth: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (font.widthOfTextAtSize(testLine, fontSize) > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines.length > 0 ? lines : [''];
}
