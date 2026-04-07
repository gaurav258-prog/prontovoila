import { useTaxStore } from '../../store/taxStore';
import {
  generateTaxCalendar,
  getEventStatus,
  daysFromToday,
  formatEventDate,
} from '../../data/taxCalendar';
import type { CalendarEvent, EventStatus } from '../../data/taxCalendar';

// Left-border accent colour per status
const STATUS_ACCENT: Record<EventStatus, string> = {
  overdue:  '#dc2626',
  urgent:   '#d97706',
  upcoming: '#ca8a04',
  future:   'var(--border-light)',
  approx:   'var(--border-light)',
};

const STATUS_BG: Record<EventStatus, string> = {
  overdue:  '#fff5f5',
  urgent:   '#fffbeb',
  upcoming: '#fefce8',
  future:   'var(--cream)',
  approx:   'var(--cream)',
};

const STATUS_LABEL: Partial<Record<EventStatus, { text: string; color: string }>> = {
  overdue:  { text: 'Overdue',  color: '#dc2626' },
  urgent:   { text: 'Due soon', color: '#d97706' },
  upcoming: { text: 'Upcoming', color: '#ca8a04' },
};

const CATEGORY_LABEL: Record<string, string> = {
  deadline:    'Deadline',
  extended:    'Extended',
  opportunity: 'Opportunity',
  action:      'Action required',
};

function EventRow({ event }: { event: CalendarEvent }) {
  const status = getEventStatus(event);
  const accent = STATUS_ACCENT[status];
  const bg = STATUS_BG[status];
  const statusLabel = STATUS_LABEL[status];
  const days = event.dateLabel ? null : daysFromToday(event.date);

  return (
    <div
      className="tcal-item"
      style={{ background: bg, borderLeftColor: accent }}
    >
      {/* Date column */}
      <div className="tcal-date-col">
        {event.dateLabel ? (
          <span className="tcal-date-approx">{event.dateLabel}</span>
        ) : (
          <>
            <span className="tcal-date-main">{formatEventDate(event.date)}</span>
            {days !== null && (
              <span
                className="tcal-days-away"
                style={{ color: days < 0 ? '#dc2626' : days <= 30 ? '#d97706' : 'var(--ink4)' }}
              >
                {days < 0
                  ? `${Math.abs(days)}d ago`
                  : days === 0
                  ? 'Today'
                  : `${days} days`}
              </span>
            )}
          </>
        )}
      </div>

      {/* Content column */}
      <div className="tcal-content-col">
        <div className="tcal-title-row">
          <span className="tcal-title">{event.title}</span>
          <div className="tcal-badges">
            {statusLabel && (
              <span className="tcal-badge" style={{ color: statusLabel.color, borderColor: statusLabel.color }}>
                {statusLabel.text}
              </span>
            )}
            {event.isPersonalized && (
              <span className="tcal-badge tcal-badge-personal">Your situation</span>
            )}
            <span className="tcal-badge tcal-badge-cat">{CATEGORY_LABEL[event.category]}</span>
          </div>
        </div>
        <div className="tcal-de">{event.titleDE}</div>
        <div className="tcal-desc">{event.description}</div>
        {event.link && (
          <a
            href={event.link}
            target="_blank"
            rel="noopener noreferrer"
            className="tcal-link"
          >
            Official resource &rarr;
          </a>
        )}
      </div>
    </div>
  );
}

export default function TaxCalendar() {
  const { personal, special, employment, insurance } = useTaxStore();

  const events = generateTaxCalendar({
    taxYear: personal.taxYear,
    steuerklasse: personal.steuerklasse,
    numberOfChildren: special.numberOfChildren,
    hasInvestmentIncome: special.hasInvestmentIncome,
    sparerPauschbetragUsed: special.sparerPauschbetragUsed,
    riesterContributions: insurance.riesterContributions,
    hasMultipleEmployers: employment.hasMultipleEmployers,
  });

  const hasPersonalized = events.some(e => e.isPersonalized);

  return (
    <div className="tax-calendar">
      <div className="tcal-header">
        <div className="tax-section-title">
          {personal.taxYear} Tax Calendar
          <span className="tcal-header-de">Steuerkalender {personal.taxYear}</span>
        </div>
        <div className="tcal-header-sub">
          Key dates for your {personal.taxYear} German income tax return
          {hasPersonalized && ' — some events are personalised to your data'}
        </div>
      </div>

      <div className="tcal-list">
        {events.map(event => (
          <EventRow key={event.id} event={event} />
        ))}
      </div>

      <div className="tcal-footer">
        Dates based on standard German income tax law (§149 AO, §36 EStG) for {personal.taxYear}.
        {hasPersonalized && ' Events marked "Your situation" reflect your entered data.'}
        {' '}Always verify with an official source or Steuerberater.
      </div>
    </div>
  );
}
