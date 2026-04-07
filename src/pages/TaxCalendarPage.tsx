import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  generateTaxCalendar,
  getEventStatus,
  formatEventDate,
  daysFromToday,
} from '../data/taxCalendar';
import type { CalendarEvent, TaxCalendarOpts } from '../data/taxCalendar';
import '../styles/app.css';
import '../styles/tax.css';

const SESSION_KEY = 'prontovoila_tax_session';
const DEFAULT_TAX_YEAR = new Date().getFullYear() - 1;

const STATUS_ACCENT: Record<string, string> = {
  overdue:  '#dc2626',
  urgent:   '#d97706',
  upcoming: '#ca8a04',
  future:   'var(--border-light)',
  approx:   'var(--border-light)',
};
const STATUS_BG: Record<string, string> = {
  overdue:  '#fff5f5',
  urgent:   '#fffbeb',
  upcoming: '#fefce8',
  future:   'var(--cream)',
  approx:   'var(--cream)',
};
const STATUS_LABEL: Record<string, { text: string; color: string } | undefined> = {
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
    <div style={{
      display: 'grid', gridTemplateColumns: '140px 1fr', gap: 12,
      padding: '11px 14px', borderRadius: 'var(--rad)',
      background: bg, border: '1px solid var(--border-light)',
      borderLeftWidth: 3, borderLeftColor: accent,
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 2 }}>
        {event.dateLabel ? (
          <span style={{ fontSize: 11, fontStyle: 'italic', color: 'var(--ink3)', lineHeight: 1.4 }}>{event.dateLabel}</span>
        ) : (
          <>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)', lineHeight: 1.4 }}>{formatEventDate(event.date)}</span>
            {days !== null && (
              <span style={{ fontSize: 11, color: days < 0 ? '#dc2626' : days <= 30 ? '#d97706' : 'var(--ink4)' }}>
                {days < 0 ? `${Math.abs(days)}d ago` : days === 0 ? 'Today' : `${days} days`}
              </span>
            )}
          </>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', flexWrap: 'wrap', gap: 5 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)', lineHeight: 1.35 }}>{event.title}</span>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 1 }}>
            {statusLabel && (
              <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 2, border: `1px solid ${statusLabel.color}`, color: statusLabel.color, textTransform: 'uppercase', letterSpacing: '.03em' }}>
                {statusLabel.text}
              </span>
            )}
            {event.isPersonalized && (
              <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 2, border: '1px solid var(--gold)', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '.03em' }}>
                Your situation
              </span>
            )}
            <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 2, border: '1px solid var(--border-light)', color: 'var(--ink4)', textTransform: 'uppercase', letterSpacing: '.03em' }}>
              {CATEGORY_LABEL[event.category]}
            </span>
          </div>
        </div>
        <div style={{ fontSize: 11, color: 'var(--ink4)', fontStyle: 'italic' }}>{event.titleDE}</div>
        <div style={{ fontSize: 12, color: 'var(--ink3)', lineHeight: 1.55 }}>{event.description}</div>
        {event.link && (
          <a href={event.link} target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-block', marginTop: 5, fontSize: 11, color: 'var(--gold)', fontWeight: 500, textDecoration: 'none' }}>
            Official resource &rarr;
          </a>
        )}
      </div>
    </div>
  );
}

export default function TaxCalendarPage() {
  const { user } = useAuthStore();
  const isPreview = new URLSearchParams(window.location.search).get('preview') === '1';
  const [opts, setOpts] = useState<TaxCalendarOpts>({
    taxYear: DEFAULT_TAX_YEAR,
    steuerklasse: '',
    numberOfChildren: 0,
    hasInvestmentIncome: false,
    sparerPauschbetragUsed: false,
    riesterContributions: 0,
    hasMultipleEmployers: false,
  });

  useEffect(() => {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return;
    try {
      const s = JSON.parse(raw);
      setOpts({
        taxYear: s.personal?.taxYear ?? DEFAULT_TAX_YEAR,
        steuerklasse: s.personal?.steuerklasse ?? '',
        numberOfChildren: s.special?.numberOfChildren ?? 0,
        hasInvestmentIncome: s.special?.hasInvestmentIncome ?? false,
        sparerPauschbetragUsed: s.special?.sparerPauschbetragUsed ?? false,
        riesterContributions: s.insurance?.riesterContributions ?? 0,
        hasMultipleEmployers: s.employment?.hasMultipleEmployers ?? false,
      });
    } catch { /* ignore */ }
  }, []);

  const events = generateTaxCalendar(opts);
  const hasPersonalized = events.some(e => e.isPersonalized);

  return (
    <div className="shell">
      {/* Nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, marginTop: -8 }}>
        <Link to="/dashboard" style={{ fontSize: 12, color: 'var(--ink4)', textDecoration: 'none' }}>
          &larr; Dashboard
        </Link>
        {(user || isPreview) && (
          <span style={{ fontSize: 12, color: 'var(--ink4)' }}>
            {user?.email ?? 'preview@example.com'}
          </span>
        )}
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--navy)', letterSpacing: '-.01em' }}>
          {opts.taxYear} Tax Calendar
          <span style={{ marginLeft: 8, fontSize: 13, fontWeight: 400, fontStyle: 'italic', color: 'var(--ink4)' }}>
            Steuerkalender {opts.taxYear}
          </span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink3)', marginTop: 4 }}>
          Key dates for your {opts.taxYear} German income tax return
          {hasPersonalized && ' — some events are personalised to your data'}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {events.map(event => <EventRow key={event.id} event={event} />)}
      </div>

      <div style={{ marginTop: 16, fontSize: 11, color: 'var(--ink4)', fontStyle: 'italic', lineHeight: 1.5 }}>
        Dates based on standard German income tax law (§149 AO, §36 EStG) for {opts.taxYear}.
        {hasPersonalized && ' Events marked "Your situation" reflect your saved tax data.'}
        {' '}Always verify with an official source or Steuerberater.
      </div>
    </div>
  );
}
