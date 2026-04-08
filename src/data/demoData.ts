import type { FormField, FormAnalysis, FilledField, FollowUpQuestion } from '../types';

// ✅ UPDATED: Now uses actual Verpflichtungserklärung form fields (44 AcroForm fields)
// This matches what the AcroForm analyzer extracts from filled-14.pdf
export const DEMO_FIELDS: FormField[] = [
  { id: 'acro_name_vorname', label: 'Name Vorname', type: 'text', required: true, question: 'Please provide: Name Vorname' },
  { id: 'acro_geburtsdatum_geburtsort', label: 'Geburtsdatum Geburtsort', type: 'text', required: true, question: 'Please provide: Geburtsdatum Geburtsort' },
  { id: 'acro_staatsangehorigkeit', label: 'Staatsangehörigkeit Beruf  Arbeitgeber', type: 'text', required: true, question: 'Please provide: Staatsangehörigkeit Beruf  Arbeitgeber' },
  { id: 'acro_strasse', label: 'Straße  Hausnummer Postleitzahl  Wohnort', type: 'text', required: true, question: 'Please provide: Straße  Hausnummer Postleitzahl  Wohnort' },
  { id: 'acro_fill_1', label: 'fill 1', type: 'text', required: true, question: 'Please provide: fill 1' },
  { id: 'acro_name_vorname_2', label: 'Name Vorname 2', type: 'text', required: true, question: 'Please provide: Name Vorname 2' },
  { id: 'acro_geburtsdatum_geschlecht', label: 'GeburtsdatumGeschlechtwm Geburtsort', type: 'text', required: true, question: 'Please provide: GeburtsdatumGeschlechtwm Geburtsort' },
  { id: 'acro_staatsangehorigkeit_2', label: 'Staatsangehörigkeit Reisepassnummer', type: 'text', required: true, question: 'Please provide: Staatsangehörigkeit Reisepassnummer' },
  { id: 'acro_anschrift', label: 'Anschrift StraßePLZWohnort', type: 'text', required: true, question: 'Please provide: Anschrift StraßePLZWohnort' },
  { id: 'acro_verwandtschaftsbeziehung', label: 'VerwandtschaftsbeziehungBeziehung des Gastes zu Ihnen', type: 'text', required: true, question: 'Please provide: VerwandtschaftsbeziehungBeziehung des Gastes zu Ihnen' },
  { id: 'acro_begleitender', label: 'Begleitender EhegattinEhegatte Name Vorname Geburtsdatum Geschlecht', type: 'text', required: true, question: 'Please provide: Begleitender EhegattinEhegatte Name Vorname Geburtsdatum Geschlecht' },
  { id: 'acro_begleitende', label: 'Begleitende leibliche minderjährige Kinder Name Vorname Geburtsdatum Geschlecht', type: 'text', required: true, question: 'Please provide: Begleitende leibliche minderjährige Kinder Name Vorname Geburtsdatum Geschlecht' },
  { id: 'acro_fill_8', label: 'fill 8', type: 'text', required: true, question: 'Please provide: fill 8' },
  { id: 'acro_einreisedatum', label: 'Einreisedatum ab', type: 'text', required: true, question: 'Please provide: Einreisedatum ab' },
  { id: 'acro_dauer_grund', label: 'Dauer und Grund des Aufenthaltes', type: 'text', required: true, question: 'Please provide: Dauer und Grund des Aufenthaltes' },
  { id: 'acro_datum', label: 'Datum', type: 'date', required: true, question: 'Please provide: Datum' },
  { id: 'acro_text1', label: 'Text1', type: 'text', required: true, question: 'Please provide: Text1' },
  { id: 'acro_text2', label: 'Text2', type: 'text', required: true, question: 'Please provide: Text2' },
  { id: 'acro_text3', label: 'Text3', type: 'text', required: true, question: 'Please provide: Text3' },
  { id: 'acro_text4', label: 'Text4', type: 'text', required: true, question: 'Please provide: Text4' },
  { id: 'acro_check_box5', label: 'Check Box5', type: 'yesno', required: true, question: 'Check Box5?' },
  { id: 'acro_check_box6', label: 'Check Box6', type: 'yesno', required: true, question: 'Check Box6?' },
  { id: 'acro_check_box7', label: 'Check Box7', type: 'yesno', required: true, question: 'Check Box7?' },
  { id: 'acro_check_box8', label: 'Check Box8', type: 'yesno', required: true, question: 'Check Box8?' },
  { id: 'acro_check_box9', label: 'Check Box9', type: 'yesno', required: true, question: 'Check Box9?' },
  { id: 'acro_check_box10', label: 'Check Box10', type: 'yesno', required: true, question: 'Check Box10?' },
  { id: 'acro_check_box11', label: 'Check Box11', type: 'yesno', required: true, question: 'Check Box11?' },
  { id: 'acro_check_box12', label: 'Check Box12', type: 'yesno', required: true, question: 'Check Box12?' },
  { id: 'acro_check_box13', label: 'Check Box13', type: 'yesno', required: true, question: 'Check Box13?' },
  { id: 'acro_check_box14', label: 'Check Box14', type: 'yesno', required: true, question: 'Check Box14?' },
  { id: 'acro_check_box15', label: 'Check Box15', type: 'yesno', required: true, question: 'Check Box15?' },
  { id: 'acro_check_box16', label: 'Check Box16', type: 'yesno', required: true, question: 'Check Box16?' },
  { id: 'acro_check_box17', label: 'Check Box17', type: 'yesno', required: true, question: 'Check Box17?' },
  { id: 'acro_text18', label: 'Text18', type: 'text', required: true, question: 'Please provide: Text18' },
  { id: 'acro_text19', label: 'Text19', type: 'text', required: true, question: 'Please provide: Text19' },
  { id: 'acro_text20', label: 'Text20', type: 'text', required: true, question: 'Please provide: Text20' },
  { id: 'acro_text21', label: 'Text21', type: 'text', required: true, question: 'Please provide: Text21' },
  { id: 'acro_text22', label: 'Text22', type: 'text', required: true, question: 'Please provide: Text22' },
  { id: 'acro_check_box23', label: 'Check Box23', type: 'yesno', required: true, question: 'Check Box23?' },
  { id: 'acro_check_box24', label: 'Check Box24', type: 'yesno', required: true, question: 'Check Box24?' },
  { id: 'acro_check_box25', label: 'Check Box25', type: 'yesno', required: true, question: 'Check Box25?' },
  { id: 'acro_check_box26', label: 'Check Box26', type: 'yesno', required: true, question: 'Check Box26?' },
  { id: 'acro_check_box27', label: 'Check Box27', type: 'yesno', required: true, question: 'Check Box27?' },
  { id: 'acro_check_box28', label: 'Check Box28', type: 'yesno', required: true, question: 'Check Box28?' },
];

export function simulateFormAnalysis(): Promise<FormAnalysis> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mandatory = DEMO_FIELDS.filter((f) => f.required && f.type !== 'signature');
      const optional = DEMO_FIELDS.filter((f) => !f.required);
      resolve({
        detectedLanguage: 'de',
        detectedLanguageLabel: 'German',
        formTitleOriginal: 'Verpflichtungserklärung',
        formTitleTranslated: 'Declaration of Obligation (Sponsorship)',
        summary:
          'This is a German sponsorship form (Verpflichtungserklärung) used to declare financial responsibility for visa applicants. It collects personal and contact details of the sponsor and information about the sponsored person(s).',
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
