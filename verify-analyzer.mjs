import fs from 'fs';
import { PDFDocument } from 'pdf-lib';

const pdfPath = '/Users/gauravsachdeva/Downloads/Verpflichtungserklaerung_Empty-filled-14.pdf';

// Simulate the generateQuestionForField function from acroFormAnalyzer.ts
function generateQuestionForField(field) {
  const context = (field.nearbyLabels && field.nearbyLabels.length > 0)
    ? field.nearbyLabels[0]
    : field.name;

  const label = context
    .replace(/[_-]/g, ' ')
    .replace(/^\d+\s*/, '')
    .trim();

  let question;
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

// Simulate mapFieldType
function mapFieldType(acroType) {
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

async function analyzeAndReport() {
  try {
    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    
    const form = pdfDoc.getForm();
    const acroFields = form.getFields();
    
    console.log('📋 VERPFLICHTUNGSERKLÄRUNG PDF ANALYSIS');
    console.log('==========================================\n');
    
    console.log(`Total AcroForm Fields: ${acroFields.length}`);
    console.log('\n🔍 FIELD ANALYSIS:');
    console.log('─'.repeat(80));
    
    const fields = [];
    const seenNames = new Set();
    
    acroFields.forEach((acroField, index) => {
      const fieldName = acroField.getName();
      
      if (seenNames.has(fieldName)) {
        console.log(`[${index+1}] ⚠️ DUPLICATE: ${fieldName} (SKIPPED)`);
        return;
      }
      seenNames.add(fieldName);
      
      const { label, question } = generateQuestionForField({ 
        name: fieldName,
        type: 'text',
        nearbyLabels: []
      });
      
      fields.push({
        id: `acro_${fieldName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        label,
        question,
        pdfFieldName: fieldName
      });
      
      console.log(`[${index+1}] ${fieldName}`);
      console.log(`    Label: ${label}`);
      console.log(`    Question: ${question}`);
      console.log('');
    });
    
    console.log('─'.repeat(80));
    console.log(`\n✅ Analysis Complete:`);
    console.log(`   Total Fields: ${acroFields.length}`);
    console.log(`   Unique Fields: ${fields.length}`);
    console.log(`   Duplicates Avoided: ${acroFields.length - fields.length}`);
    console.log(`   Expected Questionnaire Fields: ${fields.length}`);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

analyzeAndReport();
