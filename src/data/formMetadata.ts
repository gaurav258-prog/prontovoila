/**
 * Form Metadata Database
 * Maps detected forms to their proper names, translations, and descriptions
 * Each form stores translations in multiple languages
 * Extensible for new forms and languages
 */

export interface FormTranslation {
  title: string;        // Form title in this language
  description: string;  // Form description in this language
}

export interface FormMetadata {
  formId: string;                                    // Unique ID (e.g., 'verpflichtungserklarung')
  originalLanguage: string;                          // Language code of original form (e.g., 'de')
  originalTitle: string;                             // Form name in original language
  keywords: string[];                                // Keywords to detect this form type
  translations: Record<string, FormTranslation>;     // Translations: { 'en': {...}, 'it': {...}, 'es': {...} }
}

// German forms with multilingual translations
const germanForms: Record<string, FormMetadata> = {
  verpflichtungserklarung: {
    formId: 'verpflichtungserklarung',
    originalLanguage: 'de',
    originalTitle: 'Verpflichtungserklärung',
    keywords: ['verpflichtung', 'sponsor', 'garantie', 'unterhalt'],
    translations: {
      en: {
        title: 'Declaration of Obligation (Sponsorship)',
        description: 'This is a German sponsorship form (Verpflichtungserklärung) used to declare financial responsibility for visa applicants. It collects personal and contact details of the sponsor and information about the sponsored person(s).',
      },
      de: {
        title: 'Verpflichtungserklärung',
        description: 'Dies ist ein deutsches Sponsorshipformular (Verpflichtungserklärung), das verwendet wird, um die finanzielle Verantwortung für Visaantragsteller zu erklären.',
      },
      it: {
        title: 'Dichiarazione di Obbligo',
        description: 'Questo è un modulo di patrocinio tedesco (Verpflichtungserklärung) utilizzato per dichiarare la responsabilità finanziaria per i candidati ai visti.',
      },
      fr: {
        title: 'Déclaration d\'Obligation',
        description: 'Il s\'agit d\'un formulaire de parrainage allemand (Verpflichtungserklärung) utilisé pour déclarer la responsabilité financière des demandeurs de visa.',
      },
      es: {
        title: 'Declaración de Obligación',
        description: 'Este es un formulario de patrocinio alemán (Verpflichtungserklärung) utilizado para declarar la responsabilidad financiera de los solicitantes de visa.',
      },
    },
  },
  anmeldung: {
    formId: 'anmeldung',
    originalLanguage: 'de',
    originalTitle: 'Anmeldung',
    keywords: ['anmeldung', 'registrierung', 'wohnung', 'adresse'],
    translations: {
      en: {
        title: 'Registration Form',
        description: 'This is a German registration form (Anmeldung) used to register your residence or other official information with German authorities.',
      },
      de: {
        title: 'Anmeldung',
        description: 'Dies ist ein deutsches Anmeldeformular (Anmeldung), das zur Registrierung Ihres Wohnsitzes bei deutschen Behörden verwendet wird.',
      },
      it: {
        title: 'Modulo di Registrazione',
        description: 'Questo è un modulo di registrazione tedesco (Anmeldung) utilizzato per registrare il tuo indirizzo.',
      },
      fr: {
        title: 'Formulaire d\'Enregistrement',
        description: 'Ceci est un formulaire d\'enregistrement allemand (Anmeldung) utilisé pour enregistrer votre adresse.',
      },
      es: {
        title: 'Formulario de Registro',
        description: 'Este es un formulario de registro alemán (Anmeldung) utilizado para registrar tu domicilio.',
      },
    },
  },
  abmeldung: {
    formId: 'abmeldung',
    originalLanguage: 'de',
    originalTitle: 'Abmeldung',
    keywords: ['abmeldung', 'abmeld', 'umzug'],
    translations: {
      en: {
        title: 'Deregistration Form',
        description: 'This is a German deregistration form (Abmeldung) used to deregister your residence when leaving Germany.',
      },
      de: {
        title: 'Abmeldung',
        description: 'Dies ist ein deutsches Abmeldeformular (Abmeldung), das verwendet wird, um Ihren Wohnsitz in Deutschland abzumelden.',
      },
      it: {
        title: 'Modulo di Cancellazione',
        description: 'Questo è un modulo di cancellazione tedesco (Abmeldung) utilizzato per cancellare la tua registrazione.',
      },
      fr: {
        title: 'Formulaire de Désinscription',
        description: 'Ceci est un formulaire de désinscription allemand (Abmeldung) utilisé pour annuler votre enregistrement.',
      },
      es: {
        title: 'Formulario de Cancelación',
        description: 'Este es un formulario de cancelación alemán (Abmeldung) utilizado para cancelar tu registro.',
      },
    },
  },
  einkommenssteuer: {
    formId: 'einkommenssteuer',
    originalLanguage: 'de',
    originalTitle: 'Einkommensteuererklärung',
    keywords: ['einkommensteuer', 'steuer', 'steuererklarung', 'einkommen'],
    translations: {
      en: {
        title: 'Income Tax Return',
        description: 'This is a German income tax return form (Einkommensteuererklärung) used to file annual personal income tax. It includes sections for employment income, deductions, and special expenses.',
      },
      de: {
        title: 'Einkommensteuererklärung',
        description: 'Dies ist ein deutsches Einkommensteuererklärungsformular, das zur Abgabe der jährlichen Einkommenssteuer verwendet wird.',
      },
      it: {
        title: 'Dichiarazione dei Redditi',
        description: 'Questo è un modulo di dichiarazione dei redditi tedesco utilizzato per dichiarare le imposte sul reddito annuali.',
      },
      fr: {
        title: 'Déclaration d\'Impôt sur le Revenu',
        description: 'Ceci est un formulaire de déclaration de revenus allemand utilisé pour déclarer l\'impôt sur le revenu annuel.',
      },
      es: {
        title: 'Declaración del Impuesto sobre la Renta',
        description: 'Este es un formulario de declaración de impuestos sobre la renta alemán utilizado para declarar los impuestos sobre la renta anuales.',
      },
    },
  },
  visum: {
    formId: 'visum',
    originalLanguage: 'de',
    originalTitle: 'Visumantrag',
    keywords: ['visum', 'visa', 'schengen', 'antrag'],
    translations: {
      en: {
        title: 'Visa Application',
        description: 'This is a German visa application form used to apply for a German or Schengen visa. It requires personal information, travel plans, and supporting documentation.',
      },
      de: {
        title: 'Visumantrag',
        description: 'Dies ist ein deutsches Visumantrag-Formular, das zur Beantragung eines deutschen oder Schengen-Visums verwendet wird.',
      },
      it: {
        title: 'Modulo di Richiesta di Visto',
        description: 'Questo è un modulo di richiesta di visto tedesco utilizzato per richiedere un visto tedesco o Schengen.',
      },
      fr: {
        title: 'Demande de Visa',
        description: 'Ceci est un formulaire de demande de visa allemand utilisé pour demander un visa allemand ou Schengen.',
      },
      es: {
        title: 'Solicitud de Visa',
        description: 'Este es un formulario de solicitud de visa alemán utilizado para solicitar una visa alemana o Schengen.',
      },
    },
  },
};

// Italian forms with multilingual translations
const italianForms: Record<string, FormMetadata> = {
  dichiarazione_residenza: {
    formId: 'dichiarazione_residenza',
    originalLanguage: 'it',
    originalTitle: 'Dichiarazione di Residenza',
    keywords: ['dichiarazione', 'residenza', 'indirizzo'],
    translations: {
      it: {
        title: 'Dichiarazione di Residenza',
        description: 'Questo è un modulo di dichiarazione di residenza italiana (Dichiarazione di Residenza) utilizzato per registrare ufficialmente il tuo luogo di residenza presso le autorità italiane.',
      },
      en: {
        title: 'Residence Declaration',
        description: 'This is an Italian residence declaration form (Dichiarazione di Residenza) used to officially register your place of residence with Italian authorities.',
      },
      de: {
        title: 'Wohnsitzerklärung',
        description: 'Dies ist ein italienisches Wohnsitzerklärungsformular (Dichiarazione di Residenza), das zur offiziellen Registrierung Ihres Wohnsitzes bei italienischen Behörden verwendet wird.',
      },
      fr: {
        title: 'Déclaration de Résidence',
        description: 'Il s\'agit d\'un formulaire de déclaration de résidence italien (Dichiarazione di Residenza) utilisé pour enregistrer officiellement votre lieu de résidence auprès des autorités italiennes.',
      },
      es: {
        title: 'Declaración de Residencia',
        description: 'Este es un formulario de declaración de residencia italiano (Dichiarazione di Residenza) utilizado para registrar oficialmente tu lugar de residencia ante las autoridades italianas.',
      },
    },
  },
  modulo_anagrafe: {
    formId: 'modulo_anagrafe',
    originalLanguage: 'it',
    originalTitle: 'Modulo Anagrafe',
    keywords: ['anagrafe', 'modulo', 'comunale'],
    translations: {
      it: {
        title: 'Modulo Anagrafe',
        description: 'Questo è un modulo dell\'ufficio del registro italiano (Modulo Anagrafe) utilizzato per varie procedure amministrative comunali inclusi i cambiamenti di residenza e gli aggiornamenti.',
      },
      en: {
        title: 'Registry Office Form',
        description: 'This is an Italian registry office form (Modulo Anagrafe) used for various municipal administrative procedures including residence changes and updates.',
      },
      de: {
        title: 'Standesamtsformular',
        description: 'Dies ist ein italienisches Standesamtsformular (Modulo Anagrafe), das für verschiedene kommunale Verwaltungsverfahren verwendet wird.',
      },
      fr: {
        title: 'Formulaire de Registre Civil',
        description: 'Ceci est un formulaire d\'office d\'état civil italien (Modulo Anagrafe) utilisé pour diverses procédures administratives municipales.',
      },
      es: {
        title: 'Formulario del Registro Civil',
        description: 'Este es un formulario de oficina de registro italiano (Modulo Anagrafe) utilizado para diversos procedimientos administrativos municipales.',
      },
    },
  },
};

// French forms with multilingual translations
const frenchForms: Record<string, FormMetadata> = {
  declaration_residence: {
    formId: 'declaration_residence',
    originalLanguage: 'fr',
    originalTitle: 'Déclaration de Résidence',
    keywords: ['declaration', 'residence', 'adresse', 'domicile'],
    translations: {
      fr: {
        title: 'Déclaration de Résidence',
        description: 'Il s\'agit d\'un formulaire de déclaration de résidence français (Déclaration de Résidence) utilisé pour enregistrer ou modifier votre adresse auprès des autorités françaises.',
      },
      en: {
        title: 'Residence Declaration',
        description: 'This is a French residence declaration form (Déclaration de Résidence) used to register or change your address with French authorities.',
      },
      de: {
        title: 'Wohnsitzerklärung',
        description: 'Dies ist ein französisches Wohnsitzerklärungsformular (Déclaration de Résidence), das zur Registrierung oder Änderung Ihrer Adresse bei französischen Behörden verwendet wird.',
      },
      it: {
        title: 'Dichiarazione di Residenza',
        description: 'Questo è un modulo di dichiarazione di residenza francese (Déclaration de Résidence) utilizzato per registrare o modificare il tuo indirizzo presso le autorità francesi.',
      },
      es: {
        title: 'Declaración de Residencia',
        description: 'Este es un formulario de declaración de residencia francesa (Déclaration de Résidence) utilizado para registrar o cambiar tu dirección ante las autoridades francesas.',
      },
    },
  },
  demande_visa: {
    formId: 'demande_visa',
    originalLanguage: 'fr',
    originalTitle: 'Demande de Visa',
    keywords: ['demande', 'visa', 'schengen'],
    translations: {
      fr: {
        title: 'Demande de Visa',
        description: 'Il s\'agit d\'un formulaire de demande de visa français utilisé pour demander un visa français ou Schengen. Il requiert des informations personnelles, des détails d\'emploi et un itinéraire de voyage.',
      },
      en: {
        title: 'Visa Application',
        description: 'This is a French visa application form used to apply for a French or Schengen visa. It requires personal information, employment details, and travel itinerary.',
      },
      de: {
        title: 'Visumantrag',
        description: 'Dies ist ein französisches Visumantrag-Formular, das zur Beantragung eines französischen oder Schengen-Visums verwendet wird.',
      },
      it: {
        title: 'Modulo di Richiesta di Visto',
        description: 'Questo è un modulo di richiesta di visto francese utilizzato per richiedere un visto francese o Schengen.',
      },
      es: {
        title: 'Solicitud de Visa',
        description: 'Este es un formulario de solicitud de visa francesa utilizado para solicitar un visa francés o Schengen.',
      },
    },
  },
};

// Map language codes to form databases
const formDatabases: Record<string, Record<string, FormMetadata>> = {
  de: germanForms,
  it: italianForms,
  fr: frenchForms,
};

/**
 * Detect form type from field names
 * Returns the metadata if a known form is detected
 */
export function detectFormType(
  fieldNames: string[],
  languageCode: string,
): FormMetadata | null {
  const fieldText = fieldNames.join(' ').toLowerCase();
  const database = formDatabases[languageCode];

  if (!database) return null;

  // Search for form type by matching keywords
  for (const metadata of Object.values(database)) {
    for (const keyword of metadata.keywords) {
      if (fieldText.includes(keyword)) {
        // Confirm by checking if multiple keywords are found
        const matchCount = metadata.keywords.filter(k => fieldText.includes(k)).length;
        if (matchCount >= 1) {
          return metadata;
        }
      }
    }
  }

  return null;
}

/**
 * Get form translation in the user's selected language
 * Falls back to English if translation not available
 */
export function getFormTranslation(
  metadata: FormMetadata,
  selectedLanguage: string,
): { title: string; description: string } {
  // Try to get translation in selected language
  if (metadata.translations[selectedLanguage]) {
    return metadata.translations[selectedLanguage];
  }

  // Fall back to English
  if (metadata.translations.en) {
    return metadata.translations.en;
  }

  // Fall back to original language
  if (metadata.translations[metadata.originalLanguage]) {
    return metadata.translations[metadata.originalLanguage];
  }

  // Fallback fallback
  return {
    title: metadata.originalTitle,
    description: 'Please fill in all required fields.',
  };
}

/**
 * Generate a generic form title for detected language
 * Used as fallback when specific form type isn't detected
 */
export function generateGenericFormTitle(
  detectedLanguageCode: string,
): FormMetadata {
  const genericForms: Record<string, FormMetadata> = {
    de: {
      formId: 'generic_de',
      originalLanguage: 'de',
      originalTitle: 'Deutsches Formular',
      keywords: [],
      translations: {
        de: {
          title: 'Deutsches Formular',
          description: 'Dies ist ein deutsches Formular. Bitte füllen Sie alle erforderlichen Felder aus und geben Sie genaue Informationen ein.',
        },
        en: {
          title: 'German Form',
          description: 'This is a German form. Please fill in all required fields and provide accurate information.',
        },
        it: {
          title: 'Modulo Tedesco',
          description: 'Questo è un modulo tedesco. Si prega di compilare tutti i campi obbligatori.',
        },
        fr: {
          title: 'Formulaire Allemand',
          description: 'Ceci est un formulaire allemand. Veuillez remplir tous les champs requis.',
        },
        es: {
          title: 'Formulario Alemán',
          description: 'Este es un formulario alemán. Por favor, rellena todos los campos requeridos.',
        },
      },
    },
    it: {
      formId: 'generic_it',
      originalLanguage: 'it',
      originalTitle: 'Modulo Italiano',
      keywords: [],
      translations: {
        it: {
          title: 'Modulo Italiano',
          description: 'Questo è un modulo italiano. Si prega di compilare tutti i campi obbligatori.',
        },
        en: {
          title: 'Italian Form',
          description: 'This is an Italian form. Please complete all mandatory fields.',
        },
        de: {
          title: 'Italienisches Formular',
          description: 'Dies ist ein italienisches Formular. Bitte füllen Sie alle erforderlichen Felder aus.',
        },
        fr: {
          title: 'Formulaire Italien',
          description: 'Ceci est un formulaire italien. Veuillez remplir tous les champs requis.',
        },
        es: {
          title: 'Formulario Italiano',
          description: 'Este es un formulario italiano. Por favor, rellena todos los campos requeridos.',
        },
      },
    },
    fr: {
      formId: 'generic_fr',
      originalLanguage: 'fr',
      originalTitle: 'Formulaire Français',
      keywords: [],
      translations: {
        fr: {
          title: 'Formulaire Français',
          description: 'Ceci est un formulaire français. Veuillez remplir tous les champs requis.',
        },
        en: {
          title: 'French Form',
          description: 'This is a French form. Please fill in all required fields.',
        },
        de: {
          title: 'Französisches Formular',
          description: 'Dies ist ein französisches Formular. Bitte füllen Sie alle erforderlichen Felder aus.',
        },
        it: {
          title: 'Modulo Francese',
          description: 'Questo è un modulo francese. Si prega di compilare tutti i campi obbligatori.',
        },
        es: {
          title: 'Formulario Francés',
          description: 'Este es un formulario francés. Por favor, rellena todos los campos requeridos.',
        },
      },
    },
    unknown: {
      formId: 'generic_unknown',
      originalLanguage: 'unknown',
      originalTitle: 'Form',
      keywords: [],
      translations: {
        en: {
          title: 'Form',
          description: 'Please fill in all required fields and proceed.',
        },
        de: {
          title: 'Formular',
          description: 'Bitte füllen Sie alle erforderlichen Felder aus.',
        },
        it: {
          title: 'Modulo',
          description: 'Si prega di compilare tutti i campi obbligatori.',
        },
        fr: {
          title: 'Formulaire',
          description: 'Veuillez remplir tous les champs requis.',
        },
        es: {
          title: 'Formulario',
          description: 'Por favor, rellena todos los campos requeridos.',
        },
      },
    },
  };

  return (
    genericForms[detectedLanguageCode] || genericForms.unknown
  );
}
