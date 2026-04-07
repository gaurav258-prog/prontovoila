import LegalLayout from './LegalLayout';
import '../../styles/legal.css';

const Check = () => (
  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: '50%', background: 'var(--gold-dim)', flexShrink: 0, marginRight: 10 }}>
    <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="var(--gold)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
  </span>
);

export default function SecurityPage() {
  return (
    <LegalLayout
      title="Security"
      subtitle="How ProntoVoilà protects your data in practice."
      lastUpdated="6 April 2026"
    >
      <div className="legal">

        {/* Trust headline */}
        <div style={{ background: 'var(--navy)', borderRadius: 12, padding: '1.5rem 1.75rem', marginBottom: '2.5rem' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '.85rem' }}>Our security commitments</p>
          {[
            'All data in transit is encrypted with TLS 1.2 or higher.',
            'Uploaded forms are never written to disk — processed in memory only, then discarded.',
            'Tax session data lives exclusively in your browser. It never reaches our servers unless you save it.',
            'We never sell your data. We never use it to train AI models.',
            'You can permanently delete all your data at any time.',
            'We will notify you within 72 hours of any data breach affecting your data.',
          ].map((text) => (
            <div key={text} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '.6rem' }}>
              <Check />
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,.8)', lineHeight: 1.65 }}>{text}</span>
            </div>
          ))}
        </div>

        <h2>Data in Transit</h2>
        <p>All communication between your browser and ProntoVoilà is encrypted using <strong>TLS 1.2 or higher</strong> (HTTPS). This means your uploaded documents, tax data, and account information cannot be intercepted in transit.</p>

        <h2>Uploaded Documents</h2>
        <p>When you upload a form for translation, the document is sent directly to our processing pipeline and <strong>never written to persistent storage</strong>. It exists only in memory during processing. Once the field extraction is complete and the response is returned to your browser, the document is discarded. We hold no copy.</p>
        <p>If you are concerned about a particularly sensitive document, you may redact personal identifiers (names, ID numbers) before uploading — the field detection works on structure and layout, not the specific values.</p>

        <h2>Tax Session Data</h2>
        <p>Your German tax filing session is stored <strong>exclusively in your browser's localStorage</strong> under the key <code>prontovoila_tax_session</code>. It does not leave your device unless you explicitly click "Save &amp; come back later" while logged in to an account.</p>
        <p>During active tax analysis (when you click "Analyse"), the data you have entered is sent to our AI processing layer for narrative generation only — numbers are calculated deterministically in your browser using our open tax formula engine. The AI never receives your full session; it receives only the calculated summary figures.</p>
        <p>To delete your local session data at any time: clear your browser's site data for prontovoila.com, or use the "Start a new return" option in the app.</p>

        <h2>AI Processing</h2>
        <p>ProntoVoilà uses an enterprise AI API for form analysis and tax narrative generation. We have selected a provider whose enterprise API terms <strong>contractually prohibit using inputs to train models</strong>. Your documents and tax data are not retained by the AI provider after processing.</p>
        <p>Data transmitted to the AI API:</p>
        <ul>
          <li><strong>Form translation:</strong> the extracted text content of your uploaded form and your answers.</li>
          <li><strong>Tax analysis:</strong> only the pre-calculated numerical summary (refund amount, deduction totals) — not your name, address, or tax ID. We deliberately limit what is sent.</li>
        </ul>

        <h2>Infrastructure</h2>
        <p>ProntoVoilà is hosted on infrastructure with data centres in the <strong>EU/EEA</strong>. We use reputable, enterprise-grade providers with their own security certifications (SOC 2, ISO 27001). Where any sub-processor is based outside the EU, data transfers are governed by GDPR-approved Standard Contractual Clauses (SCCs).</p>

        <h2>Access Controls</h2>
        <p>Access to production systems and user data is restricted to authorised team members only, using multi-factor authentication and role-based access. We do not grant broad database access — queries are scoped to the minimum required.</p>

        <h2>Vulnerability Disclosure</h2>
        <p>If you discover a security vulnerability in ProntoVoilà, please report it responsibly to <a href="mailto:hello@prontovoila.com">hello@prontovoila.com</a> with the subject "Security Disclosure". We will acknowledge within 48 hours and work to resolve confirmed issues promptly. We do not pursue legal action against good-faith security researchers.</p>

        <h2>Incident Response</h2>
        <p>In the event of a data breach affecting your personal data, we are committed to notifying affected users and the relevant supervisory authority (BfDI) within <strong>72 hours</strong> of becoming aware, in accordance with GDPR Art. 33–34.</p>

        <h2>Questions</h2>
        <p>Security or privacy questions: <a href="mailto:hello@prontovoila.com">hello@prontovoila.com</a></p>

      </div>
    </LegalLayout>
  );
}
