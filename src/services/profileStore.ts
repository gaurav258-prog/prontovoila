const STORAGE_KEY = 'prontovoila_user_profile';

export interface UserProfile {
  fields: Record<string, string>; // fieldId -> value (from last session)
  rawText: string;                // the freehand text to pre-fill
  savedAt: string;                // ISO timestamp
}

export function getSavedProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function saveProfile(fields: Record<string, string>): void {
  // Build a natural-language summary from the field values
  const parts: string[] = [];
  const fieldLabels: Record<string, string> = {
    nome_cognome: 'My name is',
    full_name: 'My name is',
    data_nascita: 'born on',
    dob: 'born on',
    luogo_nascita: 'Born in',
    place_of_birth: 'Born in',
    codice_fiscale: 'My codice fiscale is',
    tax_code: 'My tax code is',
    indirizzo_residenza: 'I live at',
    address: 'I live at',
    home_address: 'I live at',
    email: 'My email is',
    email_address: 'My email is',
    phone: 'My phone is',
    phone_number: 'My phone is',
  };

  for (const [id, value] of Object.entries(fields)) {
    if (!value || value === 'Yes' || value === 'No') continue;
    const prefix = fieldLabels[id];
    if (prefix) {
      parts.push(`${prefix} ${value}`);
    } else {
      parts.push(value);
    }
  }

  const rawText = parts.join('. ') + '.';

  const profile: UserProfile = {
    fields,
    rawText,
    savedAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function deleteProfile(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function hasProfile(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}
