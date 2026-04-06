import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
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
  const [ctaEmail, setCtaEmail] = useState('');
  const [pricingTab, setPricingTab] = useState<'forms' | 'tax'>('forms');

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

  const handleCtaSubmit = (e: FormEvent) => {
    e.preventDefault();
    navigate('/app');
  };

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
              Life abroad,<strong>made simple.</strong>
            </h1>
            <p className="hero-sub">
              Bureaucracy in a foreign language shouldn&rsquo;t hold you back. ProntoVoil&agrave; helps expats, immigrants and international workers navigate official paperwork, tax filings and government processes &mdash; in any language.
            </p>
            <div className="hero-btns">
              <a href="#services" className="btn-gold">Explore services &darr;</a>
            </div>
            <div className="trust-row">
              <div className="tstat"><div className="tstat-n">50+</div><div className="tstat-l">Languages</div></div>
              <div className="tdiv" />
              <div className="tstat"><div className="tstat-n">120+</div><div className="tstat-l">Countries</div></div>
              <div className="tdiv" />
              <div className="tstat"><div className="tstat-n">98%</div><div className="tstat-l">Accuracy</div></div>
              <div className="tdiv" />
              <div className="tstat"><div className="tstat-n">4.9&#9733;</div><div className="tstat-l">User rating</div></div>
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
              <div className="fbadge">&#10003; Filled in 2 min</div>
            </div>
            <div className="fcard fcard-2">
              <div className="fcard-flag">{'\u{1F1EF}\u{1F1F5}'}</div>
              <div className="fcard-title">{'\u5165\u9662\u7533\u8FBC\u66F8'} &mdash; Tokyo</div>
              <div className="fbar done" />
              <div className="fbar done w9" />
              <div className="fbar w7" />
              <div className="fbadge">&#10003; Answered in Hindi</div>
            </div>
            <div className="fcard fcard-3">
              <div className="fcard-flag">{'\u{1F1EB}\u{1F1F7}'}</div>
              <div className="fcard-title">D&eacute;claration de revenus</div>
              <div className="fbar done w9" />
              <div className="fbar done" />
              <div className="fbar done w7" />
              <div className="fbadge">&#10003; Answered in Arabic</div>
            </div>
          </div>
        </div>
      </section>

      {/* STAT BAND */}
      <div className="stat-band">
        <div className="stat-row">
          <div><div className="sn">2.4M+</div><div className="sl">Forms filled</div></div>
          <div><div className="sn">50+</div><div className="sl">Languages</div></div>
          <div><div className="sn">180+</div><div className="sl">Form types</div></div>
          <div><div className="sn">3 min</div><div className="sl">Average time</div></div>
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
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 13l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
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
              <button className="btn-gold" onClick={() => navigate('/app')} style={{ marginTop: 'auto' }}>
                Upload a form &mdash; it&rsquo;s free &rarr;
              </button>
            </div>
            <div className="svc-card svc-active">
              <div className="svc-badge">Germany</div>
              <div className="svc-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M2 9h20M8 3v6M16 3v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M8 14h2M8 17h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </div>
              <h3>Resident Country Tax Filing</h3>
              <p>File your tax return in the country you live in &mdash; guided step by step in your language. No more struggling with foreign tax forms or missing deadlines.</p>
              <ul className="svc-list">
                <li>Annual tax return preparation</li>
                <li>Local deductions &amp; credits guidance</li>
                <li>Deadline tracking &amp; reminders</li>
                <li>Plain-language explanations</li>
                <li>Multi-country support</li>
              </ul>
              <button className="btn-gold" onClick={() => navigate('/tax')} style={{ marginTop: 'auto' }}>
                File your taxes &mdash; it&rsquo;s free &rarr;
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section className="sl-section" id="problem">
        <div className="cont">
          <span className="sec-ey rv">The challenge</span>
          <h2 className="sec-h rv rv1">Official forms shouldn&rsquo;t be<br/>a language barrier</h2>
          <p className="sec-p rv rv2">
            Whether registering at a local council, seeing a doctor, filing taxes, or enrolling a child in school &mdash; navigating official paperwork in an unfamiliar language is stressful, time-consuming, and costly when done wrong.
          </p>
          <div className="prob-grid rv rv3">
            <div className="pcard">
              <div className="picon" style={{ background: '#fff0e8' }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 2L3 18h16L11 2z" stroke="#c0622a" strokeWidth="1.5" strokeLinejoin="round"/><path d="M11 9v4M11 14v.5" stroke="#c0622a" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </div>
              <h3>Government registration</h3>
              <p>Anmeldung, residenza, inscription &mdash; critical forms for life in a new country, written entirely in the local language.</p>
            </div>
            <div className="pcard">
              <div className="picon" style={{ background: '#e8efff' }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 3a8 8 0 100 16A8 8 0 0011 3z" stroke="#3060c0" strokeWidth="1.5"/><path d="M11 8v4l3 3" stroke="#3060c0" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </div>
              <h3>Medical &amp; hospital forms</h3>
              <p>Patient intake, consent forms, medical history. Accurate completion affects the care you receive.</p>
            </div>
            <div className="pcard">
              <div className="picon" style={{ background: '#f5f0e8' }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="4" y="5" width="14" height="12" rx="2" stroke="#8a6a20" strokeWidth="1.5"/><path d="M8 10h6M8 13h4" stroke="#8a6a20" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </div>
              <h3>Tax &amp; financial declarations</h3>
              <p>Annual filings, bank account opening, insurance. Errors are expensive to fix.</p>
            </div>
            <div className="pcard">
              <div className="picon" style={{ background: '#e8f5ee' }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 3L4 8v11h5v-5h4v5h5V8L11 3z" stroke="#2a6a40" strokeWidth="1.5" strokeLinejoin="round"/></svg>
              </div>
              <h3>School &amp; childcare</h3>
              <p>Enrolment forms, permission slips, medical declarations for children in a new country.</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="sc-section" id="how">
        <div className="cont">
          <span className="sec-ey rv">How ProntoVoil&agrave; works</span>
          <h2 className="sec-h rv rv1">Three steps to any filled form</h2>
          <p className="sec-p rv rv2">No translation tools. No dictionaries. Upload, answer in your language, receive a completed form.</p>
          <div className="steps rv rv3">
            <div className="step">
              <div className="step-num">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="18" x2="12" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><polyline points="9 15 12 12 15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <h3>Upload your form</h3>
              <p>PDF, photograph, or Word document. ProntoVoil&agrave; reads every field automatically, regardless of language.</p>
            </div>
            <div className="step">
              <div className="step-num">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <h3>Answer in your language</h3>
              <p>Type naturally. ProntoVoil&agrave; extracts the relevant information and asks only for what it cannot find.</p>
            </div>
            <div className="step">
              <div className="step-num">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <h3>Review and confirm</h3>
              <p>Every field shown clearly with its translated value. Edit anything before downloading.</p>
            </div>
            <div className="step">
              <div className="step-num">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><polyline points="7 10 12 15 17 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <h3>Download and submit</h3>
              <p>PDF, Word or data export. Correct fields, correct language, ready to sign.</p>
            </div>
          </div>
        </div>
      </section>

      {/* USE CASES */}
      <section className="sl-section" id="usecases">
        <div className="cont">
          <span className="sec-ey rv">Where ProntoVoil&agrave; helps</span>
          <h2 className="sec-h rv rv1">Every form type.<br/>Every country.</h2>
          <p className="sec-p rv rv2">From a GP registration in London to a tax declaration in Tokyo.</p>
          <div className="uc-grid rv rv3">
            <div className="uccard">
              <div className="uc-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="3" y1="22" x2="21" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><rect x="2" y="11" width="20" height="11" rx="1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><polygon points="12 2 2 11 22 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <h3>Government &amp; immigration</h3>
              <p>Residence registration, visas, work permits, identity documents.</p>
            </div>
            <div className="uccard">
              <div className="uc-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <h3>Healthcare</h3>
              <p>Patient registration, medical history, consent forms, insurance claims.</p>
            </div>
            <div className="uccard">
              <div className="uc-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 10v6M2 10l10-5 10 5-10 5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 12v5c3 3 9 3 12 0v-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <h3>Education</h3>
              <p>School and university enrolment, scholarships, childcare registration.</p>
            </div>
            <div className="uccard">
              <div className="uc-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <h3>Tax &amp; finance</h3>
              <p>Tax returns, bank account opening, mortgage applications.</p>
            </div>
            <div className="uccard">
              <div className="uc-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="3" width="15" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="5.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="18.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <h3>Transport &amp; utilities</h3>
              <p>Vehicle registration, driving licence exchange, utility connections.</p>
            </div>
            <div className="uccard">
              <div className="uc-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="12" x2="12" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><line x1="10" y1="14" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <h3>Employment</h3>
              <p>Onboarding forms, HR documents, social security registration.</p>
            </div>
            <div className="uccard">
              <div className="uc-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <h3>Housing</h3>
              <p>Rental applications, purchase contracts, tenancy agreements.</p>
            </div>
            <div className="uccard">
              <div className="uc-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22V12M3 5h18M12 2l3 3-3 3-3-3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 5l4 8H0L4 5zM20 5l4 8h-8l4-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <h3>Legal &amp; notarial</h3>
              <p>Powers of attorney, declarations, court forms.</p>
            </div>
          </div>
        </div>
      </section>

      {/* LANGUAGES */}
      <section className="sn-section" id="languages">
        <div className="cont">
          <span className="sec-ey rv">Language coverage</span>
          <h2 className="sec-h rv rv1">Your language. Any form&rsquo;s language.</h2>
          <p className="sec-p rv rv2">Every combination works. Answer in Hindi, fill a German form. Respond in Arabic, complete a Japanese document.</p>
          <div className="lang-split rv rv3">
            <div className="lang-pairs">
              <div className="lpair"><span className="lp-from"><span>{'\u{1F1EE}\u{1F1F3}'}</span>Hindi</span><span className="lp-arr">&rarr;</span><span className="lp-to"><span>{'\u{1F1E9}\u{1F1EA}'}</span>German form</span></div>
              <div className="lpair"><span className="lp-from"><span>{'\u{1F1F8}\u{1F1E6}'}</span>Arabic</span><span className="lp-arr">&rarr;</span><span className="lp-to"><span>{'\u{1F1EB}\u{1F1F7}'}</span>French form</span></div>
              <div className="lpair"><span className="lp-from"><span>{'\u{1F1E7}\u{1F1F7}'}</span>Portuguese</span><span className="lp-arr">&rarr;</span><span className="lp-to"><span>{'\u{1F1EF}\u{1F1F5}'}</span>Japanese form</span></div>
              <div className="lpair"><span className="lp-from"><span>{'\u{1F1E8}\u{1F1F3}'}</span>Chinese</span><span className="lp-arr">&rarr;</span><span className="lp-to"><span>{'\u{1F1EC}\u{1F1E7}'}</span>English form</span></div>
              <div className="lpair"><span className="lp-from"><span>{'\u{1F1FA}\u{1F1E6}'}</span>Ukrainian</span><span className="lp-arr">&rarr;</span><span className="lp-to"><span>{'\u{1F1F5}\u{1F1F1}'}</span>Polish form</span></div>
              <div className="lpair"><span className="lp-from"><span>{'\u{1F1F0}\u{1F1F7}'}</span>Korean</span><span className="lp-arr">&rarr;</span><span className="lp-to"><span>{'\u{1F1EE}\u{1F1F9}'}</span>Italian form</span></div>
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
          <h2 className="sec-h rv rv1">Real forms. Real people.<br/>Real relief.</h2>
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
              </div>
              <div className="price-c feat">
                <div className="plabel">Pro</div>
                <div className="pamount">&euro;9</div>
                <div className="pperiod">per month, billed annually</div>
                <ul className="pfeats">
                  <li className="pok">Unlimited forms</li>
                  <li className="pok">All 50+ languages</li>
                  <li className="pok">All export formats</li>
                  <li className="pok">Full form history</li>
                  <li className="pok">Priority processing</li>
                </ul>
                <button className="btn-pgold" onClick={() => navigate('/app')}>Start Pro &mdash; 14 days free</button>
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
                  <li className="pok">AI-powered tax summary</li>
                  <li className="pok">Estimated refund overview</li>
                  <li className="pno">Deduction calculations</li>
                  <li className="pno">Custom deduction claims</li>
                  <li className="pno">ELSTER submission</li>
                </ul>
                <button className="btn-pghost" onClick={() => navigate('/tax')}>Get started free</button>
              </div>
              <div className="price-c">
                <div className="plabel">Standard</div>
                <div className="pamount">&euro;39</div>
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
              </div>
              <div className="price-c feat">
                <div className="plabel">Complete</div>
                <div className="pamount">&euro;69</div>
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
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="sc-section" id="cta">
        <div className="cont">
          <div className="cta-box rv">
            <h2>Start filling any form today</h2>
            <p>Free to try. No credit card. Works on every device in every language.</p>
            <form className="email-row" onSubmit={handleCtaSubmit}>
              <input
                type="email"
                placeholder="Your email address"
                value={ctaEmail}
                onChange={(e) => setCtaEmail(e.target.value)}
              />
              <button type="submit" className="btn-gold">Get early access &rarr;</button>
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="foot-inner">
          <div className="foot-brand">
            <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ArchIcon size={26} light /><span>Pronto<em>Voil&agrave;</em></span></div>
            <p>Life abroad, made simple. Helping expats navigate official paperwork, tax filings and government processes in any language.</p>
          </div>
          <div className="fcol">
            <h4>Product</h4>
            <a href="#">How it works</a>
            <a href="#">Languages</a>
            <a href="#">Use cases</a>
            <a href="#">Pricing</a>
            <a href="#">API</a>
          </div>
          <div className="fcol">
            <h4>Company</h4>
            <a href="#">About</a>
            <a href="#">Blog</a>
            <a href="#">Press</a>
            <a href="#">Careers</a>
            <a href="#">Contact</a>
          </div>
          <div className="fcol">
            <h4>Legal</h4>
            <a href="#">Privacy policy</a>
            <a href="#">Terms of service</a>
            <a href="#">Cookie policy</a>
            <a href="#">GDPR</a>
          </div>
        </div>
        <div className="foot-bottom">
          <span className="foot-copy">&copy; 2026 ProntoVoil&agrave;. All rights reserved.</span>
        </div>
      </footer>
    </>
  );
}
