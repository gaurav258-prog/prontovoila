import { useEffect, useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import ArchIcon from '../components/ArchIcon';
import { generateTaxCalendar, getEventStatus, formatEventDate, daysFromToday } from '../data/taxCalendar';
import type { CalendarEvent } from '../data/taxCalendar';
import '../styles/app.css';
import '../styles/dashboard.css';

const SESSION_KEY = 'prontovoila_tax_session';
const CURRENT_YEAR = new Date().getFullYear();
const DEFAULT_TAX_YEAR = CURRENT_YEAR - 1;
const TOTAL_STEPS = 8;
const TAX_STEP_LABELS = ['', 'Language', 'Briefing', 'Personal', 'Income', 'Deductions', 'Insurance', 'Extras', 'Summary'];

interface TaxSession {
  step: number;
  langLabel?: string;
  personal?: { taxYear: number; steuerklasse: string; firstName: string };
  employment?: { hasMultipleEmployers: boolean };
  special?: { numberOfChildren: number; hasInvestmentIncome: boolean; sparerPauschbetragUsed: boolean };
  insurance?: { riesterContributions: number };
  summary?: { estimatedRefund: number | null; estimatedLiability: number | null };
}

const TAX_NEWS = [
  {
    id: 'grundfreibetrag-2024',
    year: '2024',
    title: 'Grundfreibetrag raised to €11,784',
    body: 'The tax-free basic allowance increased to €11,784 for 2024 — €696 more than 2023. Income below this threshold is not taxed.',
  },
  {
    id: 'homeoffice-pauschale',
    year: '2023+',
    title: 'Home office flat rate: €6/day, max €1,260/year',
    body: 'Permanent increase from 2023 onwards. No dedicated room required — 210 qualifying days at €6 each fully deductible.',
  },
  {
    id: 'sparer-pauschbetrag',
    year: '2023+',
    title: 'Sparerpauschbetrag doubled to €1,000 / €2,000',
    body: 'Investment income exemption raised from €801/€1,602 to €1,000/€2,000 (single/joint) — update your Freistellungsauftrag.',
  },
  {
    id: 'werbungskosten',
    year: '2022+',
    title: 'Werbungskostenpauschale raised to €1,230',
    body: 'Standard work expense deduction increased from €1,000 to €1,230. If your actual expenses exceed this, itemise to maximise your refund.',
  },
];

const PREVIEW_USER = {
  id: 'preview', email: 'gaurav@example.com', name: 'Gaurav Sachdeva',
  provider: 'email' as const, emailVerified: true,
};

function greeting(name: string): string {
  const h = new Date().getHours();
  const g = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  const first = (name || '').split(' ')[0];
  return first ? `${g}, ${first}` : g;
}

function fmt(n: number) {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// ── Icons ─────────────────────────────────────────────────────────
function IconForm() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor"
      strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter">
      <rect x="2" y="1" width="12" height="16" />
      <line x1="5" y1="6" x2="11" y2="6" /><line x1="5" y1="9" x2="11" y2="9" />
      <line x1="5" y1="12" x2="8" y2="12" />
      <circle cx="16" cy="15" r="3" /><line x1="14" y1="13" x2="18" y2="17" strokeWidth="1.5" />
    </svg>
  );
}
function IconTax() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor"
      strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter">
      <rect x="1" y="3" width="18" height="14" />
      <line x1="1" y1="7" x2="19" y2="7" />
      <line x1="5" y1="1" x2="5" y2="5" /><line x1="15" y1="1" x2="15" y2="5" />
      <line x1="5" y1="11" x2="8" y2="11" /><line x1="12" y1="11" x2="15" y2="11" />
      <line x1="5" y1="14" x2="8" y2="14" /><line x1="12" y1="14" x2="15" y2="14" />
    </svg>
  );
}
function IconPlan() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor"
      strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter">
      <rect x="1" y="4" width="18" height="12" />
      <line x1="1" y1="8" x2="19" y2="8" />
      <line x1="4" y1="12" x2="8" y2="12" /><line x1="4" y1="14" x2="6" y2="14" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter">
      <polyline points="2,7 5,10 11,3" />
    </svg>
  );
}
// ── Filing history row ────────────────────────────────────────────
function YearRow({
  year, session, onClear,
}: {
  year: number;
  session: TaxSession | null;
  onClear: () => void;
}) {
  const isCurrent = session?.personal?.taxYear === year || (!session && year === DEFAULT_TAX_YEAR);
  const isActive = session && session.personal?.taxYear === year && session.step < TOTAL_STEPS;
  const isDone = session && session.personal?.taxYear === year && session.step === TOTAL_STEPS;
  const hasRefund = isDone && session?.summary?.estimatedRefund != null;
  const hasLiability = isDone && session?.summary?.estimatedLiability != null;

  let statusDot = 'db-hy-dot-idle';
  let statusText = 'Not yet filed via ProntoVoilà';
  let badge = null;

  if (isActive) {
    statusDot = 'db-hy-dot-active';
    statusText = `Step ${session.step} of ${TOTAL_STEPS} · ${TAX_STEP_LABELS[session.step] ?? ''}`;
    badge = <span className="db-hy-badge db-hy-badge-progress">In progress</span>;
  } else if (isDone && (hasRefund || hasLiability)) {
    statusDot = 'db-hy-dot-done';
    const amt = session.summary?.estimatedRefund ?? session.summary?.estimatedLiability ?? 0;
    statusText = hasRefund ? `Estimated refund: +€${fmt(amt)}` : `Estimated due: −€${fmt(amt)}`;
    badge = <span className="db-hy-badge db-hy-badge-done">{hasRefund ? 'Refund estimated' : 'Liability estimated'}</span>;
  }

  return (
    <div className={`db-hy-row ${isCurrent ? 'db-hy-row-current' : ''}`}>
      <div className="db-hy-year">{year}</div>
      <div className={`db-hy-dot ${statusDot}`} />
      <div className="db-hy-info">
        <span className="db-hy-status">{statusText}</span>
        {badge}
      </div>
      <div className="db-hy-actions">
        {isActive && (
          <>
            <Link to="/tax" className="db-hy-link">Resume</Link>
            <button className="db-hy-link db-hy-link-muted" onClick={onClear}>Clear</button>
          </>
        )}
        {isDone && <Link to="/tax" className="db-hy-link">View summary</Link>}
        {!isActive && !isDone && (
          <Link to="/tax" className="db-hy-link">{isCurrent ? 'Start now' : 'Backfile'}</Link>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user: authUser, isLoggedIn, loading, logout } = useAuthStore();
  const isPreview = new URLSearchParams(window.location.search).get('preview') === '1';
  const user = isPreview ? PREVIEW_USER : authUser;
  const navigate = useNavigate();
  const [taxSession, setTaxSession] = useState<TaxSession | null>(null);
  const [deadlines, setDeadlines] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return;
    try {
      const parsed: TaxSession = JSON.parse(raw);
      if (parsed.step && parsed.step > 1) {
        setTaxSession(parsed);
        const yr = parsed.personal?.taxYear ?? DEFAULT_TAX_YEAR;
        const events = generateTaxCalendar({
          taxYear: yr,
          steuerklasse: parsed.personal?.steuerklasse ?? '',
          numberOfChildren: parsed.special?.numberOfChildren ?? 0,
          hasInvestmentIncome: parsed.special?.hasInvestmentIncome ?? false,
          sparerPauschbetragUsed: parsed.special?.sparerPauschbetragUsed ?? false,
          riesterContributions: parsed.insurance?.riesterContributions ?? 0,
          hasMultipleEmployers: parsed.employment?.hasMultipleEmployers ?? false,
        });
        setDeadlines(events.filter(e => !e.dateLabel && getEventStatus(e) !== 'overdue').slice(0, 3));
      }
    } catch { /* ignore */ }
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 14, color: 'var(--ink3)' }}>Loading...</div>
      </div>
    );
  }
  if (!isLoggedIn && !isPreview) return <Navigate to="/login" replace />;

  const handleLogout = async () => { await logout(); navigate('/'); };
  const clearSession = () => { localStorage.removeItem(SESSION_KEY); setTaxSession(null); setDeadlines([]); };

  const activeYear = taxSession?.personal?.taxYear ?? DEFAULT_TAX_YEAR;
  const historyYears = [activeYear, activeYear - 1, activeYear - 2, activeYear - 3];

  // default deadlines when no session
  const shownDeadlines = deadlines.length > 0 ? deadlines : [
    { id: 'd1', date: new Date(DEFAULT_TAX_YEAR + 1, 6, 31), title: 'Standard filing deadline', titleDE: 'Abgabefrist', description: '', category: 'deadline' as const },
    { id: 'd2', date: new Date(DEFAULT_TAX_YEAR + 2, 1, 28), title: 'Extended — with Steuerberater', titleDE: 'Verlängerungsfrist', description: '', category: 'extended' as const },
  ];

  return (
    <div className="db-shell">

      {/* ── Nav ─────────────────────────────────────────────── */}
      <header className="db-header">
        <Link to="/" className="db-logo">
          <ArchIcon size={26} />
          <span className="db-wordmark">Pronto<em>Voilà</em></span>
        </Link>
        <div className="db-header-right">
          <span className="db-user-email">{user?.email}</span>
          <button className="db-signout-btn" onClick={handleLogout}>Sign out</button>
        </div>
      </header>

      <div className="db-content">

        {/* ── Welcome bar ──────────────────────────────────── */}
        <div className="db-welcome-bar">
          <div>
            <div className="db-welcome-text">{greeting(user?.name ?? '')}</div>
            <div className="db-welcome-sub">Your ProntoVoil&agrave; dashboard</div>
          </div>
          <div className="db-plan-badge">
            <span className="db-plan-tier">Free Plan</span>
            <span className="db-plan-hint">Pro coming soon</span>
          </div>
        </div>

        {/* ══ SECTION: German Tax Returns ═════════════════════ */}
        <section className="db-section">
          <div className="db-section-head">
            <div className="db-section-icon"><IconTax /></div>
            <div>
              <div className="db-section-title">German Tax Returns</div>
              <div className="db-section-de">Einkommensteuererklärung</div>
            </div>
          </div>

          <div className="db-tax-layout">

            {/* ── Left: current + history ── */}
            <div className="db-tax-main">

              {/* Current year card */}
              <div className="db-current-card">
                <div className="db-current-head">
                  <span className="db-current-year">{activeYear} Tax Return</span>
                  {taxSession ? (
                    taxSession.step === TOTAL_STEPS ? (
                      <span className="db-current-badge db-badge-done">Summary ready</span>
                    ) : (
                      <span className="db-current-badge db-badge-progress">In progress</span>
                    )
                  ) : (
                    <span className="db-current-badge db-badge-idle">Not started</span>
                  )}
                </div>

                {taxSession ? (
                  taxSession.step === TOTAL_STEPS && (taxSession.summary?.estimatedRefund != null || taxSession.summary?.estimatedLiability != null) ? (
                    <div className="db-refund-display">
                      <div className="db-refund-label">
                        {taxSession.summary?.estimatedRefund != null ? 'Estimated refund' : 'Estimated tax due'}
                        {taxSession.langLabel ? ` · filed in ${taxSession.langLabel}` : ''}
                      </div>
                      <div className={`db-refund-amount ${taxSession.summary?.estimatedRefund != null ? 'refund' : 'liability'}`}>
                        {taxSession.summary?.estimatedRefund != null ? '+' : '−'}&euro;{fmt(taxSession.summary?.estimatedRefund ?? taxSession.summary?.estimatedLiability ?? 0)}
                      </div>
                    </div>
                  ) : (
                    <div className="db-progress-section">
                      <div className="db-progress-meta">
                        <span>Step {taxSession.step} of {TOTAL_STEPS} — {TAX_STEP_LABELS[taxSession.step]}</span>
                        {taxSession.langLabel && <span className="db-progress-lang">{taxSession.langLabel}</span>}
                      </div>
                      <div className="db-progress-bar">
                        <div className="db-progress-fill"
                          style={{ width: `${Math.round(((taxSession.step - 1) / (TOTAL_STEPS - 1)) * 100)}%` }} />
                      </div>
                    </div>
                  )
                ) : (
                  <div className="db-current-empty">
                    File your {activeYear} German income tax return in your language. Most expats get a refund.
                  </div>
                )}

                <div className="db-current-actions">
                  {taxSession && taxSession.step < TOTAL_STEPS && (
                    <>
                      <Link to="/tax" className="btn btn-primary" style={{ fontSize: 13, padding: '9px 16px' }}>Resume return &rarr;</Link>
                      <button className="btn btn-ghost" style={{ fontSize: 12, padding: '8px 14px' }} onClick={clearSession}>Start new</button>
                    </>
                  )}
                  {taxSession && taxSession.step === TOTAL_STEPS && (
                    <>
                      <Link to="/tax" className="btn btn-primary" style={{ fontSize: 13, padding: '9px 16px' }}>View summary &rarr;</Link>
                      <button className="btn btn-ghost" style={{ fontSize: 12, padding: '8px 14px' }} onClick={clearSession}>Start new</button>
                    </>
                  )}
                  {!taxSession && (
                    <Link to="/tax" className="btn btn-primary" style={{ fontSize: 13, padding: '9px 16px' }}>
                      Start {activeYear} return &rarr;
                    </Link>
                  )}
                </div>
              </div>

              {/* Filing history */}
              <div className="db-history">
                <div className="db-history-head">
                  <span className="db-history-title">Filing history</span>
                  <span className="db-history-note">Multi-year cloud sync coming soon</span>
                </div>
                {historyYears.map(yr => (
                  <YearRow key={yr} year={yr} session={taxSession} onClear={clearSession} />
                ))}
              </div>
            </div>

            {/* ── Right: deadlines + news ── */}
            <div className="db-tax-sidebar">

              {/* Deadlines */}
              <div className="db-sidebar-card">
                <div className="db-sidebar-card-title">Upcoming deadlines</div>
                {shownDeadlines.map(e => {
                  const days = daysFromToday(e.date);
                  const color = days <= 30 ? '#d97706' : days <= 90 ? '#ca8a04' : 'var(--ink4)';
                  return (
                    <div key={e.id} className="db-dl-row">
                      <div className="db-dl-date" style={{ color }}>{formatEventDate(e.date)}</div>
                      <div className="db-dl-title">{e.title}</div>
                      <div className="db-dl-days" style={{ color }}>{days}d</div>
                    </div>
                  );
                })}
                <Link to="/calendar" className="db-sidebar-link">View full calendar &rarr;</Link>
              </div>

              {/* Tax news */}
              <div className="db-sidebar-card">
                <div className="db-sidebar-card-title">German tax updates</div>
                {TAX_NEWS.map(n => (
                  <div key={n.id} className="db-news-item">
                    <div className="db-news-head">
                      <span className="db-news-title">{n.title}</span>
                      <span className="db-news-year">{n.year}</span>
                    </div>
                    <div className="db-news-body">{n.body}</div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </section>

        {/* ══ SECTION: Form Translation ════════════════════════ */}
        <section className="db-section">
          <div className="db-section-head">
            <div className="db-section-icon"><IconForm /></div>
            <div>
              <div className="db-section-title">Form Translation</div>
              <div className="db-section-de">Formularübersetzung · 50+ languages</div>
            </div>
            <Link to="/app" className="btn btn-primary db-section-head-cta">
              Translate a form &rarr;
            </Link>
          </div>

          <div className="db-forms-body">
            {isPreview ? (
              /* Preview: show mock form history */
              <div>
                <div className="db-forms-table-head">
                  <span>Form</span><span>Date</span><span>Language</span><span>Files</span>
                </div>
                {[
                  { id: '1', name: 'Anmeldung', nameDE: 'Registration (Berlin)', date: '14 Mar 2026', lang: 'Turkish' },
                  { id: '2', name: 'Kindergeldantrag', nameDE: 'Child benefit application', date: '2 Feb 2026', lang: 'English' },
                ].map(f => (
                  <div key={f.id} className="db-form-row">
                    <div className="db-form-row-name">
                      <span className="db-form-row-title">{f.name}</span>
                      <span className="db-form-row-de">{f.nameDE}</span>
                    </div>
                    <div className="db-form-row-date">{f.date}</div>
                    <div className="db-form-row-lang">{f.lang}</div>
                    <div className="db-form-row-files">
                      <span className="db-form-file-chip db-form-file-original">Original</span>
                      <span className="db-form-file-chip db-form-file-filled">Filled</span>
                    </div>
                  </div>
                ))}
                <div className="db-forms-storage-note">
                  Showing mock data. In production, forms are shown here only if you have enabled document storage.
                </div>
              </div>
            ) : (
              /* Real user: empty state */
              <div className="db-forms-empty">
                <div className="db-forms-empty-icon"><IconForm /></div>
                <div className="db-forms-empty-title">No forms translated yet</div>
                <div className="db-forms-empty-body">
                  When you translate a form, it will appear here — including the original and completed version — if you have enabled document storage in your account settings.
                </div>
                <div className="db-forms-privacy-note">
                  By default, forms are processed in memory only and never stored. Your documents are deleted the moment your session ends.
                </div>
                <Link to="/app" className="btn btn-primary" style={{ fontSize: 13, padding: '9px 16px', textDecoration: 'none', display: 'inline-block' }}>
                  Translate your first form &rarr;
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* ══ SECTION: Plan & Billing ══════════════════════════ */}
        <section className="db-section">
          <div className="db-section-head">
            <div className="db-section-icon"><IconPlan /></div>
            <div>
              <div className="db-section-title">Plan &amp; Billing</div>
              <div className="db-section-de">Abonnement</div>
            </div>
            <span className="db-plan-current-badge" style={{ marginLeft: 'auto' }}>Free Plan</span>
          </div>

          <div className="db-plan-single">
            <div className="db-plan-single-left">
              <div className="db-plan-price">€0 <span className="db-plan-price-sub">/month</span></div>
              <div className="db-plan-since">Active since account creation</div>
            </div>
            <ul className="db-plan-features db-plan-features-grid">
              {[
                'Unlimited form translations',
                'AI-powered in 50+ languages',
                '1 tax return per year',
                'Tax calendar &amp; deadlines',
                'Estimated refund calculation',
                'ELSTER filing guidance',
              ].map(f => (
                <li key={f}>
                  <span className="db-plan-check"><IconCheck /></span>
                  <span dangerouslySetInnerHTML={{ __html: f }} />
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Account footer ───────────────────────────────── */}
        <footer className="db-account-bar">
          <div className="db-account-left">
            <span className="db-account-email">{user?.email}</span>
            <span className="db-account-sep">&middot;</span>
            <span className="db-account-provider">{user?.provider === 'google' ? 'Google account' : 'Email account'}</span>
          </div>
          <div className="db-account-links">
            <Link to="/privacy" className="db-account-link">Privacy</Link>
            <Link to="/terms" className="db-account-link">Terms</Link>
            <Link to="/contact" className="db-account-link">Support</Link>
            <button className="db-account-link" onClick={handleLogout}>Sign out</button>
          </div>
        </footer>

      </div>
    </div>
  );
}
