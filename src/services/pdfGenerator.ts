import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { FilledField, FormField, FormAnalysis, SignatureData } from '../types';

const NAVY = rgb(22 / 255, 47 / 255, 73 / 255);
const GOLD = rgb(201 / 255, 168 / 255, 76 / 255);
const INK = rgb(26 / 255, 26 / 255, 24 / 255);
const INK3 = rgb(107 / 255, 106 / 255, 100 / 255);
const CREAM = rgb(245 / 255, 244 / 255, 240 / 255);
const WHITE = rgb(1, 1, 1);
const DARK_BLUE = rgb(0.05, 0.05, 0.45);
// const LIGHT_GRAY = rgb(0.7, 0.7, 0.7);

function base64ToUint8Array(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// ── OVERLAY PDF: Fill the ORIGINAL form ──

export interface OverlayPdfOptions {
  originalFileB64: string;
  originalFileMime: string;
  filledFields: FilledField[];
  fields: FormField[];
  signatures: SignatureData[];
}

export async function generateOverlayPdf(options: OverlayPdfOptions): Promise<Uint8Array> {
  const { originalFileB64, originalFileMime, filledFields, fields, signatures } = options;
  const rawBytes = base64ToUint8Array(originalFileB64);

  let doc: PDFDocument;

  if (originalFileMime === 'application/pdf') {
    doc = await PDFDocument.load(rawBytes, { ignoreEncryption: true });
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

  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const pages = doc.getPages();

  // Separate data fields from signature fields
  const dataFields = fields.filter((f) => f.type !== 'signature');
  const sigFields = fields.filter((f) => f.type === 'signature');

  // Get the first page dimensions
  const page0 = pages[0];
  const pw = page0.getWidth();
  const ph = page0.getHeight();

  // Determine the form area: typically forms have a header (top ~12%) and footer (bottom ~10%)
  // Fields are distributed in the middle portion
  const formTopPct = 0.28;   // Form fields typically start ~28% from top (after header/title/intro)
  const formBottomPct = 0.82; // Form fields typically end ~82% from top (before footer/declaration)
  const formTop = ph * (1 - formTopPct);    // PDF y coordinate for top of form area
  const formBottom = ph * (1 - formBottomPct); // PDF y coordinate for bottom of form area
  const formHeight = formTop - formBottom;

  // If Claude provided positions, try to use them but with strong validation
  // Otherwise, distribute fields evenly in the form area
  const totalFields = dataFields.length + sigFields.length;
  const fieldSpacing = totalFields > 1 ? formHeight / (totalFields) : formHeight / 2;

  // Place text on the right side of the form (where input lines typically are)
  const textX = pw * 0.42; // ~42% from left — where blank lines usually start
  const maxTextWidth = pw * 0.52; // ~52% width for the text area
  const fontSize = 10;

  // Place each data field value
  dataFields.forEach((field, idx) => {
    const filled = filledFields.find((f) => f.id === field.id);
    if (!filled || filled.skipped || !filled.value) return;

    const fieldPage = field.position?.page ?? 0;
    const pageIdx = Math.min(fieldPage, pages.length - 1);
    const page = pages[pageIdx];

    // Calculate Y position: distribute evenly from top to bottom of form area
    // Each field gets a slot, and we place the value in the middle of that slot
    let y: number;

    if (field.position && field.position.yPct > 0) {
      // Use Claude's position but apply a strong correction
      // Claude's yPct is from top of page. Convert to PDF coords (from bottom)
      // Then nudge up by 1.5% to sit on the line instead of below it
      y = ph - (field.position.yPct / 100) * ph + ph * 0.015;
    } else {
      // Fallback: evenly distribute
      y = formTop - (idx + 0.5) * fieldSpacing;
    }

    if (field.type === 'yesno') {
      const mark = filled.value.toLowerCase() === 'yes' ? 'X' : '';
      if (mark) {
        page.drawText(mark, { x: textX, y, size: fontSize, font: fontBold, color: DARK_BLUE });
      }
    } else {
      page.drawText(filled.value, {
        x: textX,
        y,
        size: fontSize,
        font,
        color: DARK_BLUE,
        maxWidth: maxTextWidth,
      });
    }
  });

  // Place signatures
  sigFields.forEach((field, idx) => {
    const sig = signatures.find((s) => s.fieldId === field.id);
    if (!sig) return;

    const fieldPage = field.position?.page ?? 0;
    const pageIdx = Math.min(fieldPage, pages.length - 1);
    const page = pages[pageIdx];

    // Signature goes after all data fields
    const sigIdx = dataFields.length + idx;
    let y: number;

    if (field.position && field.position.yPct > 0) {
      y = ph - (field.position.yPct / 100) * ph + ph * 0.015;
    } else {
      y = formTop - (sigIdx + 0.5) * fieldSpacing;
    }

    if (sig.mode === 'after-print') {
      // Leave blank — the line is already on the form
    } else if (sig.dataUrl) {
      const sigB64 = sig.dataUrl.split(',')[1];
      if (sigB64) {
        try {
          const sigBytes = base64ToUint8Array(sigB64);
          // We'll embed synchronously by storing for later
          embedSignature(doc, page, sigBytes, textX, y - 25, maxTextWidth * 0.5, 30);
        } catch {
          // Fallback: draw typed name
          if (sig.typedName) {
            page.drawText(sig.typedName, { x: textX, y, size: 14, font, color: DARK_BLUE });
          }
        }
      }
    }
  });

  return doc.save();
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
