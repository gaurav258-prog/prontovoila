import type { FormField, FormAnalysis, FilledField, FollowUpQuestion } from '../types';

export const DEMO_FIELDS: FormField[] = [
  { id: 'nome_cognome', label: 'Full Name', labelOriginal: 'Nome e Cognome', type: 'text', required: true, question: 'What is your full name (first and last)?' },
  { id: 'data_nascita', label: 'Date of Birth', labelOriginal: 'Data di Nascita', type: 'date', required: true, question: 'What is your date of birth?', format: 'DD/MM/YYYY' },
  { id: 'luogo_nascita', label: 'Place of Birth', labelOriginal: 'Luogo di Nascita', type: 'text', required: true, question: 'Where were you born? (City, Province, Country)' },
  { id: 'codice_fiscale', label: 'Tax Code (Codice Fiscale)', labelOriginal: 'Codice Fiscale', type: 'text', required: true, question: 'What is your Codice Fiscale (Italian tax code, 16 characters)?' },
  { id: 'indirizzo_residenza', label: 'Residential Address in Milan', labelOriginal: 'Indirizzo di Residenza a Milano', type: 'text', required: true, question: 'What is your residential address in Milan? (Street, Number, CAP)?' },
  { id: 'firma', label: 'Signature', labelOriginal: 'Firma del Dichiarante', type: 'signature', required: true, question: 'Please provide your signature.' },
];

export function simulateFormAnalysis(): Promise<FormAnalysis> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mandatory = DEMO_FIELDS.filter((f) => f.required && f.type !== 'signature');
      const optional = DEMO_FIELDS.filter((f) => !f.required);
      resolve({
        detectedLanguage: 'it',
        detectedLanguageLabel: 'Italian',
        formTitleOriginal: 'Dichiarazione di Residenza',
        formTitleTranslated: 'Declaration of Residence',
        summary:
          'This is a residence declaration form for the Comune di Milano. It collects your personal details including full name, date of birth, place of birth, Italian tax code (Codice Fiscale), and your residential address in Milan to register your residency.',
        mandatoryFields: mandatory,
        optionalFields: optional,
      });
    }, 1500);
  });
}

/** Parse freehand text and extract field values using keyword/regex matching. */
export function simulateFreehandParse(
  text: string,
  fields: FormField[]
): Promise<{ filled: FilledField[]; followUps: FollowUpQuestion[] }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filled: FilledField[] = [];
      const followUps: FollowUpQuestion[] = [];

      for (const field of fields) {
        // Skip signature fields — handled separately
        if (field.type === 'signature') continue;

        let matched = false;
        let value = '';

        switch (field.id) {
          case 'nome_cognome': {
            const nameMatch = text.match(
              /(?:my name is|i(?:'|')?m|name[:\s]+|mi chiamo|nome[:\s]+)\s*([A-Za-zÀ-ÿ]+(?:\s+[A-Za-zÀ-ÿ]+)+)/i
            );
            if (nameMatch) {
              value = nameMatch[1].trim();
              matched = true;
            }
            break;
          }
          case 'data_nascita': {
            const dateMatch = text.match(
              /\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})\b/
            );
            if (dateMatch) {
              value = dateMatch[1];
              matched = true;
            }
            break;
          }
          case 'luogo_nascita': {
            // Match "born in X", "birth place X", "nato a X", "luogo di nascita X"
            const placeMatch = text.match(
              /(?:born (?:in|at)|birth\s*place\s*(?:is)?|nato\/a?\s+a|luogo\s+di\s+nascita[:\s]+)\s*([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s,]+?)(?:\.|,?\s*(?:my|i |and |il |la |codice|address|indirizzo|email|phone|born on)|$)/i
            );
            if (placeMatch) {
              value = placeMatch[1].trim();
              matched = true;
            }
            break;
          }
          case 'codice_fiscale': {
            // Italian tax code: 16 alphanumeric characters
            const cfMatch = text.match(/\b([A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z])\b/i);
            if (cfMatch) {
              value = cfMatch[1].toUpperCase();
              matched = true;
            }
            // Also try generic "codice fiscale is X" or just a 16-char alphanumeric
            if (!matched) {
              const cfMatch2 = text.match(/(?:codice\s*fiscale|tax\s*code|fiscal\s*code)\s*(?:is|:)?\s*([A-Z0-9]{16})/i);
              if (cfMatch2) {
                value = cfMatch2[1].toUpperCase();
                matched = true;
              }
            }
            break;
          }
          case 'indirizzo_residenza': {
            const addrMatch = text.match(
              /(?:live (?:at|in)|address(?:\s+is)?[:\s]+|abito\s+(?:in|a)|indirizzo[:\s]+|risiedo\s+(?:in|a))\s*(.+?)(?:\.|,?\s*(?:my|i |and |il |la |codice|born|nato|email|phone)|$)/i
            );
            if (addrMatch) {
              value = addrMatch[1].trim();
              matched = true;
            }
            break;
          }
        }

        if (matched) {
          filled.push({
            id: field.id,
            label: field.label,
            value,
            confidence: 'high',
            source: 'freehand',
          });
        } else {
          followUps.push({
            fieldId: field.id,
            label: field.label,
            question: field.question || `Please provide your ${field.label.toLowerCase()}.`,
            type: field.type,
            options: field.options,
            reason: `I couldn't find your ${field.label.toLowerCase()} in what you wrote.`,
          });
        }
      }

      // If nothing matched at all, put all non-signature fields in followUps
      if (filled.length === 0) {
        followUps.length = 0;
        for (const field of fields) {
          if (field.type === 'signature') continue;
          followUps.push({
            fieldId: field.id,
            label: field.label,
            question: field.question || `Please provide your ${field.label.toLowerCase()}.`,
            type: field.type,
            options: field.options,
            reason: `I need your ${field.label.toLowerCase()} to complete the form.`,
          });
        }
      }

      resolve({ filled, followUps });
    }, 1500);
  });
}
