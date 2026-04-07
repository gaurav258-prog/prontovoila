import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ArchIcon from '../components/ArchIcon';
import '../styles/landing.css';

const LANGUAGES = [
  { c: 'en', name: 'English', flag: '\u{1F1EC}\u{1F1E7}', n: 'English' },
  { c: 'de', name: 'German', flag: '\u{1F1E9}\u{1F1EA}', n: 'Deutsch' },
  { c: 'fr', name: 'French', flag: '\u{1F1EB}\u{1F1F7}', n: 'Fran\u00e7ais' },
  { c: 'es', name: 'Spanish', flag: '\u{1F1EA}\u{1F1F8}', n: 'Espa\u00f1ol' },
  { c: 'it', name: 'Italian', flag: '\u{1F1EE}\u{1F1F9}', n: 'Italiano' },
  { c: 'pt', name: 'Portuguese', flag: '\u{1F1E7}\u{1F1F7}', n: 'Portugu\u00eas' },
  { c: 'nl', name: 'Dutch', flag: '\u{1F1F3}\u{1F1F1}', n: 'Nederlands' },
  { c: 'pl', name: 'Polish', flag: '\u{1F1F5}\u{1F1F1}', n: 'Polski' },
  { c: 'ar', name: 'Arabic', flag: '\u{1F1F8}\u{1F1E6}', n: '\u0627\u0644\u0639\u0631\u0628\u064A\u0629' },
  { c: 'zh', name: 'Chinese', flag: '\u{1F1E8}\u{1F1F3}', n: '\u4E2D\u6587' },
  { c: 'ja', name: 'Japanese', flag: '\u{1F1EF}\u{1F1F5}', n: '\u65E5\u672C\u8A9E' },
  { c: 'ko', name: 'Korean', flag: '\u{1F1F0}\u{1F1F7}', n: '\uD55C\uAD6D\uC5B4' },
  { c: 'hi', name: 'Hindi', flag: '\u{1F1EE}\u{1F1F3}', n: '\u0939\u093F\u0928\u094D\u0926\u0940' },
  { c: 'tr', name: 'Turkish', flag: '\u{1F1F9}\u{1F1F7}', n: 'T\u00fcrk\u00e7e' },
  { c: 'ru', name: 'Russian', flag: '\u{1F1F7}\u{1F1FA}', n: '\u0420\u0443\u0441\u0441\u043A\u0438\u0439' },
  { c: 'uk', name: 'Ukrainian', flag: '\u{1F1FA}\u{1F1E6}', n: '\u0423\u043A\u0440\u0430\u0457\u043D\u0441\u044C\u043A\u0430' },
  { c: 'sv', name: 'Swedish', flag: '\u{1F1F8}\u{1F1EA}', n: 'Svenska' },
  { c: 'da', name: 'Danish', flag: '\u{1F1E9}\u{1F1F0}', n: 'Dansk' },
  { c: 'fi', name: 'Finnish', flag: '\u{1F1EB}\u{1F1EE}', n: 'Suomi' },
  { c: 'no', name: 'Norwegian', flag: '\u{1F1F3}\u{1F1F4}', n: 'Norsk' },
  { c: 'cs', name: 'Czech', flag: '\u{1F1E8}\u{1F1FF}', n: '\u010Ce\u0161tina' },
  { c: 'ro', name: 'Romanian', flag: '\u{1F1F7}\u{1F1F4}', n: 'Rom\u00e2n\u0103' },
  { c: 'hu', name: 'Hungarian', flag: '\u{1F1ED}\u{1F1FA}', n: 'Magyar' },
  { c: 'el', name: 'Greek', flag: '\u{1F1EC}\u{1F1F7}', n: '\u0395\u03BB\u03BB\u03B7\u03BD\u03B9\u03BA\u03AC' },
  { c: 'he', name: 'Hebrew', flag: '\u{1F1EE}\u{1F1F1}', n: '\u05E2\u05D1\u05E8\u05D9\u05EA' },
  { c: 'fa', name: 'Persian', flag: '\u{1F1EE}\u{1F1F7}', n: '\u0641\u0627\u0631\u0633\u06CC' },
  { c: 'ur', name: 'Urdu', flag: '\u{1F1F5}\u{1F1F0}', n: '\u0627\u0631\u062F\u0648' },
  { c: 'bn', name: 'Bengali', flag: '\u{1F1E7}\u{1F1E9}', n: '\u09AC\u09BE\u0982\u09B2\u09BE' },
  { c: 'vi', name: 'Vietnamese', flag: '\u{1F1FB}\u{1F1F3}', n: 'Ti\u1EBFng Vi\u1EC7t' },
  { c: 'th', name: 'Thai', flag: '\u{1F1F9}\u{1F1ED}', n: '\u0E20\u0E32\u0E29\u0E32\u0E44\u0E17\u0E22' },
  { c: 'id', name: 'Indonesian', flag: '\u{1F1EE}\u{1F1E9}', n: 'Bahasa Indonesia' },
  { c: 'ms', name: 'Malay', flag: '\u{1F1F2}\u{1F1FE}', n: 'Bahasa Melayu' },
];

const CITIES: [number, number][] = [
  [51.5, -0.1], [48.8, 2.3], [52.5, 13.4], [41.9, 12.5], [40.4, -3.7],
  [55.7, 37.6], [59.9, 10.7], [35.7, 139.7], [37.5, 127], [31.2, 121.5],
  [1.3, 103.8], [28.6, 77.2], [19.1, 72.9], [6.5, 3.4], [-23.5, -46.6],
  [40.7, -74], [34.0, -118], [-33.8, 151.2], [30.0, 31.2], [25.2, 55.3],
  [24.7, 46.7], [39.9, 116.4], [55.9, -3.2], [53.3, -6.3], [50.8, 4.3],
  [52.4, 4.9], [-34.6, -58.4], [14.7, -17.4], [9.0, 38.7], [36.8, 10.2],
];

const StarSvg = () => (
  <svg className="tstar" viewBox="0 0 14 14">
    <path d="M7 1l1.5 4h4l-3.3 2.4 1.3 4L7 9 3.5 11.4l1.3-4L1.5 5H5.5L7 1z" />
  </svg>
);

const FiveStars = () => (
  <div className="tstars">
    <StarSvg /><StarSvg /><StarSvg /><StarSvg /><StarSvg />
  </div>
);

export default function LandingPage() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [pricingTab, setPricingTab] = useState<'forms' | 'tax'>('forms');
  const [howTab, setHowTab] = useState<'forms' | 'tax'>('forms');

  // Scroll listener for nav
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Intersection Observer for reveal elements
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('on');
          }
        });
      },
      { threshold: 0.08 }
    );
    const elements = document.querySelectorAll('.rv');
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Canvas animation
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;

    let W: number, H: number;
    let animId: number;

    function resize() {
      W = c!.width = window.innerWidth;
      H = c!.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function xy(lat: number, lon: number): [number, number] {
      return [(lon + 180) / 360 * W, (90 - lat) / 180 * H];
    }

    const dots = CITIES.map(([la, lo]) => {
      const [x, y] = xy(la, lo);
      return { x, y, r: Math.random() * 1.8 + 1.2, op: Math.random() * 0.45 + 0.25, ph: Math.random() * Math.PI * 2 };
    });

    const arcs: { fx: number; fy: number; tx: number; ty: number; p: number; sp: number }[] = [];
    for (let i = 0; i < 28; i++) {
      const f = CITIES[Math.floor(Math.random() * CITIES.length)];
      const t = CITIES[Math.floor(Math.random() * CITIES.length)];
      const [fx, fy] = xy(f[0], f[1]);
      const [tx, ty] = xy(t[0], t[1]);
      arcs.push({ fx, fy, tx, ty, p: Math.random(), sp: 0.0008 + Math.random() * 0.0018 });
    }

    function draw() {
      ctx!.clearRect(0, 0, W, H);
      ctx!.strokeStyle = 'rgba(255,255,255,0.035)';
      ctx!.lineWidth = 0.5;
      for (let lo = -180; lo <= 180; lo += 30) {
        const x = (lo + 180) / 360 * W;
        ctx!.beginPath(); ctx!.moveTo(x, 0); ctx!.lineTo(x, H); ctx!.stroke();
      }
      for (let la = -90; la <= 90; la += 30) {
        const y = (90 - la) / 180 * H;
        ctx!.beginPath(); ctx!.moveTo(0, y); ctx!.lineTo(W, y); ctx!.stroke();
      }
      arcs.forEach((a) => {
        a.p += a.sp;
        if (a.p > 1) a.p = 0;
        const mx = (a.fx + a.tx) / 2;
        const my = (a.fy + a.ty) / 2 - Math.abs(a.tx - a.fx) * 0.22;
        ctx!.beginPath(); ctx!.moveTo(a.fx, a.fy); ctx!.quadraticCurveTo(mx, my, a.tx, a.ty);
        ctx!.strokeStyle = 'rgba(201,168,76,0.055)'; ctx!.lineWidth = 0.7; ctx!.stroke();
        const tt = a.p;
        const px = (1 - tt) * (1 - tt) * a.fx + 2 * (1 - tt) * tt * mx + tt * tt * a.tx;
        const py = (1 - tt) * (1 - tt) * a.fy + 2 * (1 - tt) * tt * my + tt * tt * a.ty;
        ctx!.beginPath(); ctx!.arc(px, py, 1.8, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(201,168,76,${0.4 + a.p * 0.35})`; ctx!.fill();
      });
      dots.forEach((d) => {
        d.ph += 0.018;
        const al = d.op + Math.sin(d.ph) * 0.12;
        ctx!.beginPath(); ctx!.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(201,168,76,${al})`; ctx!.fill();
        ctx!.beginPath(); ctx!.arc(d.x, d.y, d.r + 2 + Math.sin(d.ph) * 1.5, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(201,168,76,${al * 0.25})`; ctx!.lineWidth = 0.4; ctx!.stroke();
      });
      animId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <>
      {/* NAV */}
      <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
        <div className="nav-inner">
          <a href="#" className="logo" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ArchIcon size={26} light /><span>Pronto<em>Voil&agrave;</em></span></a>
          <div className="nav-links">
            <a href="#services">Services</a>
            <a href="#how">How it works</a>
            <a href="#languages">Languages</a>
            <a href="#pricing">Pricing</a>
          </div>
          <div className="nav-right">
            <button
              className="btn-nav-ghost"
              onClick={() => navigate('/app')}
              style={{ cursor: 'pointer' }}
            >
              Sign in
            </button>
            <button
              className="btn-nav-cta"
              onClick={() => navigate('/app')}
              style={{ cursor: 'pointer' }}
            >
              Try free
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <canvas id="heroCanvas" ref={canvasRef} />
        <div className="hero-overlay" />
        <div className="hero-inner">
          <div className="hero-left">
            <div className="eyebrow">
              <div className="eyebrow-dot" />
              <span>Trusted by expats in 50+ countries</span>
            </div>
            <h1>
              Official life abroad.<strong>In your language.</strong>
            </h1>
            <p className="hero-sub">
              Fill any government form in any language. File your German income tax &mdash; guided step by step in yours. ProntoVoil&agrave; handles the bureaucracy so you can focus on living.
            </p>
            <div className="hero-btns">
              <a href="#services" className="btn-gold">Explore services &darr;</a>
            </div>
            <div className="trust-row">
              <div className="tstat"><div className="tstat-n">50+</div><div className="tstat-l">Languages</div></div>
              <div className="tdiv" />
              <div className="tstat"><div className="tstat-n">🇩🇪</div><div className="tstat-l">Germany Tax Filing</div></div>
              <div className="tdiv" />
              <div className="tstat"><div className="tstat-n">5 min</div><div className="tstat-l">Avg. fill time</div></div>
              <div className="tdiv" />
              <div className="tstat"><div className="tstat-n">Free</div><div className="tstat-l">To start</div></div>
            </div>
          </div>
          <div className="hero-right">
            <div className="fcard fcard-1">
              <div className="fcard-flag">{'\u{1F1E9}\u{1F1EA}'}</div>
              <div className="fcard-title">Anmeldung &mdash; Berlin</div>
              <div className="fbar done w9" />
              <div className="fbar done w7" />
              <div className="fbar done" />
              <div className="fbar done w5" />
              <div className="fbadge">&#10003; Filled in Turkish · 2 min</div>
            </div>
            <div className="fcard fcard-2" style={{ width: 270 }}>
              <div className="fcard-flag" style={{ fontSize: 14, color: 'rgba(255,255,255,.5)', marginBottom: '.3rem' }}>EINKOMMENSTEUER&shy;ERKL&Auml;RUNG 2024</div>
              <div className="fcard-title" style={{ fontSize: 12, color: 'rgba(255,255,255,.75)', marginBottom: '.7rem' }}>Estimated refund (Erstattung)</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--gold)', marginBottom: '.5rem' }}>&euro;1,840</div>
              <div className="fbar done w9" style={{ marginBottom: 3 }} />
              <div className="fbar done w7" style={{ marginBottom: 3 }} />
              <div className="fbar done" style={{ marginBottom: 3 }} />
              <div className="fbadge" style={{ marginTop: '.6rem' }}>&#10003; Guided in Hindi</div>
            </div>
          </div>
        </div>
      </section>

      {/* CAPABILITY BAND */}
      <div className="stat-band">
        <div className="stat-row">
          <div><div className="sn">50+</div><div className="sl">Languages supported</div></div>
          <div><div className="sn">Any form</div><div className="sl">PDF, photo, Word</div></div>
          <div><div className="sn">🇩🇪 Tax</div><div className="sl">German Einkommensteuer</div></div>
          <div><div className="sn">Free</div><div className="sl">To start, no card needed</div></div>
        </div>
      </div>

      {/* SERVICES */}
      <section className="sl-section" id="services">
        <div className="cont">
          <span className="sec-ey rv">What we do</span>
          <h2 className="sec-h rv rv1">Two services. One mission.</h2>
          <p className="sec-p rv rv2">Everything an expat needs to navigate official life abroad &mdash; starting with the paperwork that matters most.</p>
          <div className="svc-grid rv rv3">
            <div className="svc-card svc-active">
              <div className="svc-badge">Available now</div>
              <div className="svc-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter"/><polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter"/><path d="M9 13l2 2 4-4" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter"/></svg>
              </div>
              <h3>Form Translation &amp; Filling</h3>
              <p>Upload any official form in any language. Answer questions naturally in yours. ProntoVoil&agrave; reads every field, translates intelligently, and fills the original document with precision.</p>
              <ul className="svc-list">
                <li>Government registrations &amp; visas</li>
                <li>Medical &amp; hospital forms</li>
                <li>School &amp; university enrolment</li>
                <li>Employment &amp; HR documents</li>
                <li>Legal &amp; notarial forms</li>
              </ul>
              <button className="btn-gold" onClick={() => { setPricingTab('forms'); document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' }); }} style={{ marginTop: 'auto' }}>
                See pricing &amp; get started &rarr;
              </button>
            </div>
            <div className="svc-card svc-active">
              <div className="svc-badge">Germany · Available now</div>
              <div className="svc-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="18" rx="2" stroke="currentColor" strokeWidth="1"/><path d="M2 9h20M8 3v6M16 3v6" stroke="currentColor" strokeWidth="1" strokeLinecap="square"/><path d="M8 14h2M8 17h4" stroke="currentColor" strokeWidth="1" strokeLinecap="square"/></svg>
              </div>
              <h3>German Tax Filing <span style={{ fontWeight: 400, fontSize: '13px', color: 'var(--ink4)' }}>(Einkommensteuererkl&auml;rung)</span></h3>
              <p>File your annual German income tax return &mdash; guided step by step in your language. Deterministic refund calculation using official §32a EStG formulas. No German required.</p>
              <ul className="svc-list">
                <li>Guided in your language (50+)</li>
                <li>Deductions: commute, home office, equipment, insurance</li>
                <li>Official §32a EStG refund calculation</li>
                <li>ELSTER direct submission (Complete plan)</li>
                <li>Freehand briefing &mdash; describe your situation, we pre-fill</li>
              </ul>
              <button className="btn-gold" onClick={() => { setPricingTab('tax'); document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' }); }} style={{ marginTop: 'auto' }}>
                See pricing &amp; file now &rarr;
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section className="sl-section" id="problem">
        <div className="cont">
          <span className="sec-ey rv">The challenge</span>
          <h2 className="sec-h rv rv1">Two problems every expat faces</h2>
          <p className="sec-p rv rv2">
            Foreign paperwork and foreign taxes &mdash; both come at you at once. Both are stressful in an unfamiliar language. ProntoVoil&agrave; solves both.
          </p>
          <div className="prob-grid rv rv3">
            <div className="pcard">
              <div className="picon" style={{ background: 'var(--cream)' }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M14 2H6a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6l-4-4z" stroke="var(--navy)" strokeWidth="1" strokeLinejoin="miter"/><path d="M14 2v4h4M8 11h6M8 14h4" stroke="var(--navy)" strokeWidth="1" strokeLinecap="square"/></svg>
              </div>
              <h3>Forms in a foreign language</h3>
              <p>Anmeldung, patient intake, school enrolment &mdash; critical documents written entirely in a language you may not speak fluently.</p>
            </div>
            <div className="pcard">
              <div className="picon" style={{ background: 'var(--cream)' }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 3a8 8 0 100 16A8 8 0 0011 3z" stroke="var(--navy)" strokeWidth="1"/><path d="M11 8v4l3 3" stroke="var(--navy)" strokeWidth="1" strokeLinecap="square"/></svg>
              </div>
              <h3>Wrong fields, wrong answers</h3>
              <p>Translation tools give words, not context. A mistranslated field on a visa or medical form can have serious consequences.</p>
            </div>
            <div className="pcard">
              <div className="picon" style={{ background: 'var(--cream)' }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="4" y="5" width="14" height="12" stroke="var(--navy)" strokeWidth="1"/><path d="M8 9h6M8 12h4M13 12l2 2" stroke="var(--navy)" strokeWidth="1" strokeLinecap="square"/></svg>
              </div>
              <h3>German tax return complexity</h3>
              <p>Einkommensteuererklärung involves dozens of fields, deduction rules, and official thresholds &mdash; all in German, with real money at stake.</p>
            </div>
            <div className="pcard">
              <div className="picon" style={{ background: 'var(--cream)' }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 3L4 8v11h5v-5h4v5h5V8L11 3z" stroke="var(--navy)" strokeWidth="1" strokeLinejoin="miter"/></svg>
              </div>
              <h3>Missing refunds &amp; deadlines</h3>
              <p>The average expat in Germany is owed a refund but never claims it. Missing the July 31 deadline costs even more.</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="sc-section" id="how">
        <div className="cont">
          <span className="sec-ey rv">How it works</span>
          <h2 className="sec-h rv rv1">Simple steps. Real results.</h2>
          <p className="sec-p rv rv2">Two services, both designed to be completed in minutes &mdash; in any language.</p>

          {/* Tab toggle */}
          <div className="rv rv2" style={{ display: 'flex', marginBottom: '2.5rem' }}>
            <div style={{ display: 'inline-flex', background: 'var(--border-light)', borderRadius: 40, padding: 3, gap: 3 }}>
              <button
                onClick={() => setHowTab('forms')}
                style={{
                  padding: '7px 20px', borderRadius: 36, border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 600, transition: 'all .2s',
                  background: howTab === 'forms' ? 'var(--navy)' : 'transparent',
                  color: howTab === 'forms' ? '#fff' : 'var(--ink3)',
                }}
              >Form Translation</button>
              <button
                onClick={() => setHowTab('tax')}
                style={{
                  padding: '7px 20px', borderRadius: 36, border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 600, transition: 'all .2s',
                  background: howTab === 'tax' ? 'var(--navy)' : 'transparent',
                  color: howTab === 'tax' ? '#fff' : 'var(--ink3)',
                }}
              >German Tax Filing</button>
            </div>
          </div>

          {howTab === 'forms' ? (
            <div className="steps rv rv3">
              <div className="step">
                <div className="step-num">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter"/><polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter"/><line x1="12" y1="18" x2="12" y2="12" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter"/><polyline points="9 15 12 12 15 15" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter"/></svg>
                </div>
                <h3>Upload your form</h3>
                <p>PDF, photograph, or Word document. ProntoVoil&agrave; reads every field automatically, regardless of language.</p>
              </div>
              <div className="step">
                <div className="step-num">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter"/></svg>
                </div>
                <h3>Answer in your language</h3>
                <p>Type naturally. ProntoVoil&agrave; extracts the relevant information and asks only for what it cannot find.</p>
              </div>
              <div className="step">
                <div className="step-num">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter"/></svg>
                </div>
                <h3>Review and confirm</h3>
                <p>Every field shown clearly with its translated value. Edit anything before downloading.</p>
              </div>
              <div className="step">
                <div className="step-num">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter"/><polyline points="7 10 12 15 17 10" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter"/><line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter"/></svg>
                </div>
                <h3>Download and submit</h3>
                <p>PDF, Word or data export. Correct fields, correct language, ready to sign.</p>
              </div>
            </div>
          ) : (
            <div className="steps rv rv3" style={{ gridTemplateColumns: 'repeat(5,1fr)' }}>
              <div className="step">
                <div className="step-num">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1"/><path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="1" strokeLinecap="square"/></svg>
                </div>
                <h3>Pick your language</h3>
                <p>Choose any of 50+ languages. The entire questionnaire will be shown in yours.</p>
              </div>
              <div className="step">
                <div className="step-num">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter"/></svg>
                </div>
                <h3>Describe your situation</h3>
                <p>Write freely about your job, salary, commute, insurance. We extract the tax data automatically.</p>
              </div>
              <div className="step">
                <div className="step-num">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1"/><path d="M8 12h8M8 8h5M8 16h3" stroke="currentColor" strokeWidth="1" strokeLinecap="square"/></svg>
                </div>
                <h3>Confirm your details</h3>
                <p>Review pre-filled income, deductions and insurance. Edit any field before we calculate.</p>
              </div>
              <div className="step">
                <div className="step-num">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2v20M2 12h20" stroke="currentColor" strokeWidth="1" strokeLinecap="square"/><path d="M7 7l10 10M17 7L7 17" stroke="currentColor" strokeWidth="1" strokeLinecap="square" opacity=".3"/></svg>
                </div>
                <h3>See your refund</h3>
                <p>Exact §32a EStG calculation &mdash; Einkommensteuer, Soli, Kirchensteuer. No AI estimation for numbers.</p>
              </div>
              <div className="step">
                <div className="step-num">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter"/></svg>
                </div>
                <h3>Submit via ELSTER</h3>
                <p>Complete plan: file directly to Finanzamt via ELSTER. Standard: download your summary PDF.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* LANGUAGES */}
      <section className="sn-section" id="languages">
        <div className="cont">
          <span className="sec-ey rv">Language coverage</span>
          <h2 className="sec-h rv rv1">Any language. Both services.</h2>
          <p className="sec-p rv rv2">Fill forms or file your German taxes &mdash; in any of 50+ languages. Answer in Hindi, fill a German Anmeldung. File your Einkommensteuererkl&auml;rung guided in Turkish.</p>
          <div className="lang-split rv rv3">
            <div className="lang-pairs">
              <div style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,.3)', letterSpacing: '.1em', textTransform: 'uppercase' as const, marginBottom: '.5rem' }}>Form Translation</div>
              <div className="lpair"><span className="lp-from"><span>{'\u{1F1EE}\u{1F1F3}'}</span>Hindi</span><span className="lp-arr">&rarr;</span><span className="lp-to"><span>{'\u{1F1E9}\u{1F1EA}'}</span>German Anmeldung</span></div>
              <div className="lpair"><span className="lp-from"><span>{'\u{1F1F8}\u{1F1E6}'}</span>Arabic</span><span className="lp-arr">&rarr;</span><span className="lp-to"><span>{'\u{1F1EB}\u{1F1F7}'}</span>French medical form</span></div>
              <div className="lpair"><span className="lp-from"><span>{'\u{1F1E7}\u{1F1F7}'}</span>Portuguese</span><span className="lp-arr">&rarr;</span><span className="lp-to"><span>{'\u{1F1EF}\u{1F1F5}'}</span>Japanese intake form</span></div>
              <div className="lpair"><span className="lp-from"><span>{'\u{1F1FA}\u{1F1E6}'}</span>Ukrainian</span><span className="lp-arr">&rarr;</span><span className="lp-to"><span>{'\u{1F1F5}\u{1F1F1}'}</span>Polish school form</span></div>
              <div style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,.3)', letterSpacing: '.1em', textTransform: 'uppercase' as const, margin: '1rem 0 .5rem' }}>German Tax Filing</div>
              <div className="lpair"><span className="lp-from"><span>{'\u{1F1F9}\u{1F1F7}'}</span>Turkish</span><span className="lp-arr">&rarr;</span><span className="lp-to"><span>{'\u{1F1E9}\u{1F1EA}'}</span>Einkommensteuererklärung</span></div>
              <div className="lpair"><span className="lp-from"><span>{'\u{1F1E8}\u{1F1F3}'}</span>Chinese</span><span className="lp-arr">&rarr;</span><span className="lp-to"><span>{'\u{1F1E9}\u{1F1EA}'}</span>Einkommensteuererklärung</span></div>
            </div>
            <div>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,.35)', letterSpacing: '.1em', textTransform: 'uppercase' as const, fontWeight: 600, marginBottom: '.85rem' }}>All supported languages</p>
              <div className="lmat">
                {LANGUAGES.map((l) => (
                  <div className="lchip" key={l.c}>
                    <span className="lf">{l.flag}</span>
                    <div>
                      <div className="lcn">{l.name}</div>
                      <div className="lcnv">{l.n}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="sc-section" id="testimonials">
        <div className="cont">
          <span className="sec-ey rv">What people say</span>
          <h2 className="sec-h rv rv1">Real paperwork.<br/>Real relief.</h2>
          <div className="tgrid rv rv2">
            <div className="tcard">
              <FiveStars />
              <p className="tq">&ldquo;I had been putting off registering in Germany for weeks because the Anmeldung was incomprehensible. ProntoVoil&agrave; walked me through it in English and had everything filled correctly in under three minutes.&rdquo;</p>
              <div className="tauth">
                <div className="tav" style={{ background: '#e8efff', color: '#3060c0' }}>PR</div>
                <div>
                  <div className="tname">Priya R.</div>
                  <div className="tloc">{'\u{1F1EE}\u{1F1F3}'} Bengaluru &rarr; {'\u{1F1E9}\u{1F1EA}'} Berlin</div>
                  <div className="tform">Anmeldung &mdash; Residence registration</div>
                </div>
              </div>
            </div>
            <div className="tcard">
              <FiveStars />
              <p className="tq">&ldquo;My company transferred me to Tokyo. The hospital gave me a six-page intake form in Japanese. I answered in English. Every field was filled accurately.&rdquo;</p>
              <div className="tauth">
                <div className="tav" style={{ background: '#fff0e8', color: '#c0622a' }}>MC</div>
                <div>
                  <div className="tname">Marco C.</div>
                  <div className="tloc">{'\u{1F1EE}\u{1F1F9}'} Milan &rarr; {'\u{1F1EF}\u{1F1F5}'} Tokyo</div>
                  <div className="tform">{'\u5165\u9662\u7533\u8FBC\u66F8'} &mdash; Hospital intake</div>
                </div>
              </div>
            </div>
            <div className="tcard">
              <FiveStars />
              <p className="tq">&ldquo;We moved from Riyadh to Paris with three children. The school dossier was twelve pages of French administrative forms. What would have taken a full weekend took ProntoVoil&agrave; eight minutes.&rdquo;</p>
              <div className="tauth">
                <div className="tav" style={{ background: '#f5f0e8', color: '#8a6a20' }}>AK</div>
                <div>
                  <div className="tname">Ahmed K.</div>
                  <div className="tloc">{'\u{1F1F8}\u{1F1E6}'} Riyadh &rarr; {'\u{1F1EB}\u{1F1F7}'} Paris</div>
                  <div className="tform">Dossier inscription scolaire</div>
                </div>
              </div>
            </div>
            <div className="tcard">
              <FiveStars />
              <p className="tq">&ldquo;I had no idea I was owed a refund. I described my situation in Turkish, ProntoVoil&agrave; pre-filled the whole Einkommensteuererklärung and showed me &euro;1,840 back. The German tax system finally makes sense to me.&rdquo;</p>
              <div className="tauth">
                <div className="tav" style={{ background: '#e8f5ee', color: '#2a6a40' }}>EY</div>
                <div>
                  <div className="tname">Emine Y.</div>
                  <div className="tloc">{'\u{1F1F9}\u{1F1F7}'} Istanbul &rarr; {'\u{1F1E9}\u{1F1EA}'} Munich</div>
                  <div className="tform">Einkommensteuererklärung 2024 &mdash; €1,840 refund</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="sl-section" id="pricing">
        <div className="cont">
          <span className="sec-ey rv" style={{ display: 'block', textAlign: 'center' }}>Pricing</span>
          <h2 className="sec-h rv rv1" style={{ textAlign: 'center', marginBottom: '.5rem' }}>Transparent pricing</h2>
          <p className="sec-p rv rv2" style={{ textAlign: 'center', margin: '0 auto 2rem' }}>Start free. No credit card required.</p>

          {/* Tab toggle */}
          <div className="rv rv2" style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}>
            <div style={{ display: 'inline-flex', background: 'var(--cream2)', borderRadius: 40, padding: 4, gap: 4 }}>
              <button
                onClick={() => setPricingTab('forms')}
                style={{
                  padding: '8px 22px', borderRadius: 36, border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 600, transition: 'all .2s',
                  background: pricingTab === 'forms' ? 'var(--navy)' : 'transparent',
                  color: pricingTab === 'forms' ? '#fff' : 'var(--ink3)',
                }}
              >Form Translation</button>
              <button
                onClick={() => setPricingTab('tax')}
                style={{
                  padding: '8px 22px', borderRadius: 36, border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 600, transition: 'all .2s',
                  background: pricingTab === 'tax' ? 'var(--navy)' : 'transparent',
                  color: pricingTab === 'tax' ? '#fff' : 'var(--ink3)',
                }}
              >Tax Filing</button>
            </div>
          </div>

          {pricingTab === 'forms' ? (
            <div className="pgrid rv rv3">
              <div className="price-c">
                <div className="plabel">Free</div>
                <div className="pamount">&euro;0</div>
                <div className="pperiod">No time limit</div>
                <ul className="pfeats">
                  <li className="pok">3 forms per month</li>
                  <li className="pok">All 50+ languages</li>
                  <li className="pok">PDF and Word download</li>
                  <li className="pno">Form history</li>
                  <li className="pno">API access</li>
                </ul>
                <button className="btn-pghost" onClick={() => navigate('/app')}>Get started free</button>
                <p style={{ fontSize: 11, color: 'var(--ink4)', textAlign: 'center', marginTop: '.65rem', marginBottom: 0 }}>No credit card · No account required</p>
              </div>
              <div className="price-c feat">
                <div className="plabel">Pro</div>
                <div className="pamount">&euro;9</div>
                <div className="pperiod">per month, billed annually</div>
                <ul className="pfeats">
                  <li className="pok">Unlimited forms</li>
                  <li className="pok">All 50+ languages</li>
                  <li className="pok">All export formats</li>
                  <li className="pok">Full form history &amp; re-download</li>
                </ul>
                <button className="btn-pgold" onClick={() => navigate('/app')}>Start Pro &mdash; 14 days free</button>
                <p style={{ fontSize: 11, color: 'var(--ink4)', textAlign: 'center', marginTop: '.65rem', marginBottom: 0 }}>Cancel anytime · Your documents are never stored</p>
              </div>
              <div className="price-c">
                <div className="plabel">Enterprise</div>
                <div className="pamount" style={{ fontSize: '28px', paddingTop: '8px' }}>Custom</div>
                <div className="pperiod">Volume pricing available</div>
                <ul className="pfeats">
                  <li className="pok">Unlimited users</li>
                  <li className="pok">Full API access</li>
                  <li className="pok">Bulk processing</li>
                  <li className="pok">White-label option</li>
                  <li className="pok">Dedicated support</li>
                </ul>
                <a href="#cta" className="btn-pghost">Contact sales &rarr;</a>
              </div>
            </div>
          ) : (
            <div className="pgrid rv rv3">
              <div className="price-c">
                <div className="plabel">Basic</div>
                <div className="pamount">&euro;0</div>
                <div className="pperiod">Free, always</div>
                <ul className="pfeats">
                  <li className="pok">Personal &amp; income info</li>
                  <li className="pok">Estimated refund overview</li>
                  <li className="pno">Deduction calculations</li>
                  <li className="pno">Custom deduction claims</li>
                  <li className="pno">ELSTER submission</li>
                </ul>
                <button className="btn-pghost" onClick={() => navigate('/tax')}>Get started free</button>
                <p style={{ fontSize: 11, color: 'var(--ink4)', textAlign: 'center', marginTop: '.65rem', marginBottom: 0 }}>No card · Tax data stays in your browser</p>
              </div>
              <div className="price-c">
                <div className="plabel">Standard</div>
                <div className="pamount">&euro;49</div>
                <div className="pperiod">per filing year</div>
                <ul className="pfeats">
                  <li className="pok">Everything in Basic</li>
                  <li className="pok">Common deductions (commute, home office, equipment)</li>
                  <li className="pok">Custom deduction claims</li>
                  <li className="pok">Insurance &amp; pension deductions</li>
                  <li className="pok">Optimised refund calculation</li>
                  <li className="pno">ELSTER direct submission</li>
                </ul>
                <button className="btn-pghost" onClick={() => navigate('/tax')}>Start Standard &rarr;</button>
                <p style={{ fontSize: 11, color: 'var(--ink4)', textAlign: 'center', marginTop: '.65rem', marginBottom: 0 }}>One-time per year · No recurring charge</p>
              </div>
              <div className="price-c feat">
                <div className="plabel">Complete</div>
                <div className="pamount">&euro;99</div>
                <div className="pperiod">per filing year</div>
                <ul className="pfeats">
                  <li className="pok">Everything in Standard</li>
                  <li className="pok" style={{ fontWeight: 600, color: 'var(--navy)' }}>ELSTER direct submission</li>
                  <li className="pok" style={{ fontWeight: 600, color: 'var(--navy)' }}>Official filing to Finanzamt</li>
                  <li className="pok" style={{ fontWeight: 600, color: 'var(--navy)' }}>Submission confirmation</li>
                  <li className="pok">Filing history &amp; document storage</li>
                  <li className="pok">Priority support</li>
                </ul>
                <button className="btn-pgold" onClick={() => navigate('/tax')}>File with ELSTER &rarr;</button>
                <p style={{ fontSize: 11, color: 'var(--ink4)', textAlign: 'center', marginTop: '.65rem', marginBottom: 0 }}>ELSTER submission on your explicit instruction</p>
              </div>
            </div>
          )}

          {/* Shared trust strip */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
            {[
              ['🔒', 'Data encrypted in transit'],
              ['🗑️', 'Documents deleted after processing'],
              ['🚫', 'We never sell your data'],
              ['🇪🇺', 'Servers in the EU'],
            ].map(([icon, label]) => (
              <div key={label as string} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 14 }}>{icon}</span>
                <span style={{ fontSize: 12, color: 'var(--ink3)', fontWeight: 500 }}>{label as string}</span>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', marginTop: '.85rem', marginBottom: 0 }}>
            <a href="/security" style={{ fontSize: 12, color: 'var(--ink4)', textDecoration: 'underline' }}>How we protect your data →</a>
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="sc-section" id="cta">
        <div className="cont">
          <div className="rv" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 860, margin: '0 auto' }}>
            <div className="cta-box" style={{ textAlign: 'left', padding: '3rem 2.5rem' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--gold)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '.75rem' }}>Form Translation</div>
              <h2 style={{ fontSize: 'clamp(22px,2.5vw,32px)', marginBottom: '.6rem' }}>Fill any form today</h2>
              <p style={{ fontSize: '15px', marginBottom: '1.75rem' }}>Upload, answer in your language, receive a completed PDF. Free to try &mdash; no card needed.</p>
              <button className="btn-gold" onClick={() => navigate('/app')}>Upload a form &rarr;</button>
            </div>
            <div className="cta-box" style={{ textAlign: 'left', padding: '3rem 2.5rem', background: 'var(--navy)', border: '1px solid rgba(201,168,76,.25)' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--gold)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '.75rem' }}>German Tax Filing</div>
              <h2 style={{ fontSize: 'clamp(22px,2.5vw,32px)', marginBottom: '.6rem' }}>File your taxes now</h2>
              <p style={{ fontSize: '15px', marginBottom: '1.75rem' }}>Guided Einkommensteuererklärung in your language. Accurate §32a refund calculation. Free to start.</p>
              <button className="btn-gold" onClick={() => navigate('/tax')}>File your taxes &rarr;</button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="foot-inner">
          <div className="foot-brand">
            <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ArchIcon size={26} light /><span>Pronto<em>Voil&agrave;</em></span></div>
            <p>Official life abroad. In your language. Form translation and German tax filing for expats worldwide.</p>
          </div>
          <div className="fcol">
            <h4>Product</h4>
            <a href="#services">Form Translation</a>
            <a href="#services" onClick={(e) => { e.preventDefault(); navigate('/tax'); }}>German Tax Filing</a>
            <a href="#languages">Languages</a>
            <a href="#pricing">Pricing</a>
            <a href="#how">How it works</a>
          </div>
          <div className="fcol">
            <h4>Company</h4>
            <a href="/about">About</a>
            <a href="/blog">Blog</a>
            <a href="/press">Press</a>
            <a href="/careers">Careers</a>
            <a href="/contact">Contact</a>
          </div>
          <div className="fcol">
            <h4>Legal</h4>
            <a href="/privacy">Privacy policy</a>
            <a href="/terms">Terms of service</a>
            <a href="/cookies">Cookie policy</a>
            <a href="/gdpr">GDPR</a>
            <a href="/security">Security</a>
          </div>
        </div>
        <div className="foot-bottom">
          <span className="foot-copy">&copy; 2026 ProntoVoil&agrave;. All rights reserved.</span>
        </div>
      </footer>
    </>
  );
}
