export type EventStatus = 'overdue' | 'urgent' | 'upcoming' | 'future' | 'approx';
export type EventCategory = 'deadline' | 'extended' | 'opportunity' | 'action';

export interface CalendarEvent {
  id: string;
  date: Date;
  dateLabel?: string;       // Set for approximate dates (overrides date display)
  title: string;
  titleDE: string;
  description: string;
  category: EventCategory;
  link?: string;
  isPersonalized?: boolean; // True = derived from user's entered data
}

function lastDayOfFeb(year: number): Date {
  return new Date(year, 2, 0); // Month 2 = March, day 0 = last day of Feb
}

export interface TaxCalendarOpts {
  taxYear: number;
  steuerklasse: string;
  numberOfChildren: number;
  hasInvestmentIncome: boolean;
  sparerPauschbetragUsed: boolean;
  riesterContributions: number;
  hasMultipleEmployers: boolean;
}

export function generateTaxCalendar(opts: TaxCalendarOpts): CalendarEvent[] {
  const {
    taxYear,
    steuerklasse,
    numberOfChildren,
    hasInvestmentIncome,
    sparerPauschbetragUsed,
    riesterContributions,
    hasMultipleEmployers,
  } = opts;

  const y1 = taxYear + 1; // year after tax year (e.g. 2026 for 2025)
  const y2 = taxYear + 2; // two years after (e.g. 2027 for 2025)
  const y4 = taxYear + 4; // four years (voluntary refund window)

  // Mandatory filer: must file regardless of refund expectation
  const isMandatoryFiler =
    ['3', '5'].includes(steuerklasse) ||
    hasMultipleEmployers ||
    (hasInvestmentIncome && !sparerPauschbetragUsed);

  const events: CalendarEvent[] = [];

  // 1. Standard filing deadline — 31 July Y+1
  events.push({
    id: 'standard-deadline',
    date: new Date(y1, 6, 31),
    title: isMandatoryFiler ? 'Mandatory filing deadline' : 'Filing deadline (self-filers)',
    titleDE: 'Abgabefrist Einkommensteuererklärung',
    description: isMandatoryFiler
      ? `You are required to file your ${taxYear} return by this date. Late filing may result in a penalty (Verspätungszuschlag) of at least €25/month.`
      : `If you choose to file your ${taxYear} return yourself, this is the standard deadline. Filing after this date with no extension is allowed only for voluntary filers.`,
    category: 'deadline',
    link: 'https://www.elster.de',
    isPersonalized: isMandatoryFiler,
  });

  // 2. Extended deadline with Steuerberater — 28/29 Feb Y+2
  events.push({
    id: 'extended-deadline',
    date: lastDayOfFeb(y2),
    title: 'Extended deadline with tax adviser',
    titleDE: 'Verlängerungsfrist mit Steuerberater',
    description: `If you engage a licensed Steuerberater or Lohnsteuerhilfeverein to file your ${taxYear} return, the deadline is automatically extended to this date.`,
    category: 'extended',
  });

  // 3. Voluntary refund window — 31 Dec Y+4 (only shown to non-mandatory filers)
  if (!isMandatoryFiler) {
    events.push({
      id: 'voluntary-window',
      date: new Date(y4, 11, 31),
      title: 'Last chance to claim your refund',
      titleDE: 'Letzte Frist — freiwillige Steuererklärung',
      description: `Voluntary filers can claim a ${taxYear} refund any time within 4 years. After this date, the right to claim lapses permanently — even if you are owed money.`,
      category: 'opportunity',
    });
  }

  // 4. Expected Steuerbescheid (approximate — shown with dateLabel)
  events.push({
    id: 'steuerbescheid',
    date: new Date(y1, 9, 1), // placeholder for sort
    dateLabel: '~3–6 months after you file',
    title: 'Tax assessment notice expected',
    titleDE: 'Steuerbescheid (voraussichtlich)',
    description: `The Finanzamt will post your official tax assessment. Check the amount carefully — it may differ from your estimate. The notice is legally binding unless you appeal.`,
    category: 'action',
  });

  // 5. Appeal window (approximate)
  events.push({
    id: 'einspruch',
    date: new Date(y1, 10, 1), // placeholder for sort (after steuerbescheid)
    dateLabel: 'Within 1 month of receiving Steuerbescheid',
    title: 'Appeal window (Einspruchsfrist)',
    titleDE: 'Einspruchsfrist',
    description: `If you disagree with the tax assessment, file a written Einspruch (objection) with the Finanzamt within 1 month of receipt. This is free and suspends enforcement of any additional payment.`,
    category: 'action',
  });

  // --- Personalised events ---

  // Children: Kindergeld check
  if (numberOfChildren > 0) {
    events.push({
      id: 'kindergeld',
      date: new Date(y1, 11, 31), // 31 Dec Y+1
      title: 'Kindergeld — review eligibility',
      titleDE: 'Kindergeld-Überprüfung',
      description: `If your child's circumstances changed in ${taxYear} (started university, turned 18, moved out), notify the Familienkasse promptly. Payments may be reclaimed if you're overpaid and don't report changes.`,
      category: 'action',
      link: 'https://www.arbeitsagentur.de/familie-und-kinder/kindergeld',
      isPersonalized: true,
    });
  }

  // Riester: Zulageantrag deadline — 31 Dec Y+2
  if (riesterContributions > 0) {
    events.push({
      id: 'riester-zulage',
      date: new Date(y2, 11, 31),
      title: 'Riester subsidy claim deadline',
      titleDE: 'Riester-Zulageantrag',
      description: `You contributed to a Riester pension in ${taxYear}. Your provider can apply for the Zulage on your behalf — confirm they have a standing order to do so. Missing this date means permanently losing the government allowance for that year.`,
      category: 'opportunity',
      isPersonalized: true,
    });
  }

  // Freistellungsauftrag — if investment income but no exemption used
  if (hasInvestmentIncome && !sparerPauschbetragUsed) {
    events.push({
      id: 'freistellungsauftrag',
      date: new Date(y1, 11, 31), // 31 Dec Y+1
      title: 'Set up a tax exemption order',
      titleDE: 'Freistellungsauftrag einrichten',
      description: `You have investment income but your Sparerpauschbetrag (€1,000 / €2,000 joint) appears unused. File a Freistellungsauftrag with your bank before year-end to stop unnecessary withholding tax in ${y1}.`,
      category: 'action',
      isPersonalized: true,
    });
  }

  // Sort: concrete dates ascending, approximate events at the end
  const concrete = events
    .filter(e => !e.dateLabel)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  const approx = events.filter(e => e.dateLabel);

  return [...concrete, ...approx];
}

export function getEventStatus(event: CalendarEvent): EventStatus {
  if (event.dateLabel) return 'approx';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysUntil = Math.round((event.date.getTime() - today.getTime()) / msPerDay);
  if (daysUntil < 0) return 'overdue';
  if (daysUntil <= 30) return 'urgent';
  if (daysUntil <= 90) return 'upcoming';
  return 'future';
}

export function daysFromToday(date: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatEventDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
