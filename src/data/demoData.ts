import type { FormField, FormAnalysis, FilledField, FollowUpQuestion } from '../types';

export const DEMO_FIELDS: FormField[] = [
  { id: 'full_name', label: 'Full Name', type: 'text', required: true, question: 'What is your full legal name?' },
  { id: 'dob', label: 'Date of Birth', type: 'date', required: true, question: 'What is your date of birth?', format: 'DD/MM/YYYY' },
  { id: 'email', label: 'Email Address', type: 'email', required: true, question: 'What is your email address?' },
  { id: 'phone', label: 'Phone Number', type: 'phone', required: false, question: 'What is your phone number?' },
  { id: 'address', label: 'Home Address', type: 'text', required: true, question: 'What is your home address?' },
  { id: 'citizen', label: 'EU Citizen', type: 'yesno', required: true, question: 'Are you an EU citizen?' },
  { id: 'occupation', label: 'Occupation', type: 'select', required: false, question: 'What is your current occupation?', options: ['Employed', 'Self-employed', 'Student', 'Retired', 'Other'] },
];

export function simulateFormAnalysis(): Promise<FormAnalysis> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mandatory = DEMO_FIELDS.filter((f) => f.required);
      const optional = DEMO_FIELDS.filter((f) => !f.required);
      resolve({
        detectedLanguage: 'de',
        detectedLanguageLabel: 'German',
        formTitleOriginal: 'Anmeldung zur Krankenversicherung',
        formTitleTranslated: 'Health Insurance Registration',
        summary:
          'This is a health insurance registration form. It collects your personal details including name, date of birth, contact information, and residency status to process your enrollment in the health insurance program.',
        mandatoryFields: mandatory,
        optionalFields: optional,
      });
    }, 2000);
  });
}

/** Parse freehand text and extract field values using simple keyword/regex matching. */
export function simulateFreehandParse(
  text: string,
  fields: FormField[]
): Promise<{ filled: FilledField[]; followUps: FollowUpQuestion[] }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const lower = text.toLowerCase();
      const filled: FilledField[] = [];
      const followUps: FollowUpQuestion[] = [];

      for (const field of fields) {
        let matched = false;
        let value = '';

        switch (field.id) {
          case 'full_name': {
            // Match "my name is X" or "I'm X" or "name: X"
            const nameMatch = text.match(
              /(?:my name is|i(?:'|')?m|name[:\s]+)\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i
            );
            if (nameMatch) {
              value = nameMatch[1].trim();
              matched = true;
            }
            break;
          }
          case 'dob': {
            // Match date patterns: DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY, YYYY-MM-DD
            const dateMatch = text.match(
              /\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})\b/
            );
            if (dateMatch) {
              value = dateMatch[1];
              matched = true;
            }
            break;
          }
          case 'email': {
            const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
            if (emailMatch) {
              value = emailMatch[0];
              matched = true;
            }
            break;
          }
          case 'phone': {
            const phoneMatch = text.match(/(?:\+?\d[\d\s\-()]{7,})/);
            if (phoneMatch) {
              value = phoneMatch[0].trim();
              matched = true;
            }
            break;
          }
          case 'address': {
            // Match text after "live at", "address is", "address:", "live in"
            const addrMatch = text.match(
              /(?:live (?:at|in)|address(?:\s+is)?[:\s]+)\s*(.+?)(?:\.|,\s*(?:my|i |and |born|email|phone)|$)/i
            );
            if (addrMatch) {
              value = addrMatch[1].trim();
              matched = true;
            }
            break;
          }
          case 'citizen': {
            if (
              lower.includes('eu citizen') ||
              lower.includes('european citizen') ||
              lower.includes('citizen of eu') ||
              lower.includes('i am a citizen')
            ) {
              value = lower.includes('not') ? 'No' : 'Yes';
              matched = true;
            }
            break;
          }
          case 'occupation': {
            const occupations = ['employed', 'self-employed', 'student', 'retired'];
            for (const occ of occupations) {
              if (lower.includes(occ)) {
                value = occ.charAt(0).toUpperCase() + occ.slice(1);
                if (occ === 'self-employed') value = 'Self-employed';
                matched = true;
                break;
              }
            }
            if (!matched && (lower.includes('work as') || lower.includes('job is') || lower.includes('i work'))) {
              value = 'Employed';
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

      // If nothing matched at all, put all mandatory fields in followUps
      if (filled.length === 0) {
        followUps.length = 0;
        for (const field of fields) {
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
    }, 1800);
  });
}
