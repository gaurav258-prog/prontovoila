import fs from 'fs';
import { PDFDocument } from 'pdf-lib';

const pdfPath = '/Users/gauravsachdeva/Downloads/Verpflichtungserklaerung_Empty-filled-14.pdf';

async function testAnalyzer() {
  try {
    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    
    console.log('📄 PDF LOADED');
    console.log(`Total fields in PDF: ${fields.length}`);
    console.log('\n🔍 ACROFORM FIELDS (first 20):');
    
    fields.slice(0, 20).forEach((field, i) => {
      console.log(`${i+1}. ${field.getName()}`);
    });
    
    if (fields.length > 20) {
      console.log(`\n... and ${fields.length - 20} more fields`);
    }
    
    console.log(`\n✅ Total: ${fields.length} fields`);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAnalyzer();
