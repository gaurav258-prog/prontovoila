import LegalLayout from './LegalLayout';
import '../../styles/legal.css';

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="How ProntoVoilà collects, uses, and protects your personal data."
      lastUpdated="6 April 2026"
    >
      <div className="legal">

        {/* Plain-English summary — first thing users read */}
        <div style={{ background: 'var(--navy)', borderRadius: 12, padding: '1.5rem 1.75rem', marginBottom: '2.5rem' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '.85rem' }}>In plain language</p>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '.7rem' }}>
            {[
              ['🔒', 'Your tax session lives in your browser only. It never leaves your device unless you save it to your account.'],
              ['🗑️', 'Uploaded forms are deleted from our servers immediately after processing. We do not keep copies.'],
              ['🚫', 'We never sell your data. We never use your documents or tax information to train AI models. Ever.'],
              ['✏️', 'You can delete everything we hold about you at any time. Email us and it\'s gone within 30 days.'],
            ].map(([icon, text]) => (
              <li key={icon as string} style={{ display: 'flex', gap: '.75rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: 16, lineHeight: 1.6, flexShrink: 0 }}>{icon}</span>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,.8)', lineHeight: 1.65 }}>{text}</span>
              </li>
            ))}
          </ul>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.35)', marginTop: '1rem', marginBottom: 0 }}>The full legal text follows below. The summary above is accurate — the details just add the legal precision.</p>
        </div>

        <div className="toc">
          <p>Contents</p>
          <a href="#controller">1. Data Controller</a>
          <a href="#what-we-collect">2. Data We Collect</a>
          <a href="#how-we-use">3. How We Use Your Data</a>
          <a href="#legal-basis">4. Legal Basis (GDPR)</a>
          <a href="#third-parties">5. Processing Partners</a>
          <a href="#retention">6. Data Retention</a>
          <a href="#your-rights">7. Your Rights</a>
          <a href="#security">8. Security</a>
          <a href="#transfers">9. International Transfers</a>
          <a href="#children">10. Children</a>
          <a href="#changes">11. Changes to This Policy</a>
          <a href="#contact">12. Contact</a>
        </div>

        <h2 id="controller">1. Data Controller</h2>
        <p>ProntoVoilà ("we", "us", "our") is the data controller for personal data processed through this Service. Contact: <a href="mailto:hello@prontovoila.com">hello@prontovoila.com</a>.</p>

        <h2 id="what-we-collect">2. Data We Collect</h2>
        <h3>Data you provide directly</h3>
        <ul>
          <li><strong>Account data:</strong> email address and name (when you register or contact us).</li>
          <li><strong>Form content:</strong> documents you upload for translation, including any personal information they contain. These are processed in memory and deleted immediately after — we do not store them.</li>
          <li><strong>Tax data:</strong> personal details, income figures, deduction information, and other tax-related data you enter in the tax filing module. This is stored locally in your browser only — see §6.</li>
          <li><strong>Communications:</strong> messages you send to our support team.</li>
        </ul>
        <h3>Data collected automatically</h3>
        <ul>
          <li><strong>Usage data:</strong> pages visited, features used, session duration, browser type, and IP address — used only for security and service improvement.</li>
          <li><strong>Cookies:</strong> see our <a href="/cookies">Cookie Policy</a>.</li>
        </ul>

        <h2 id="how-we-use">3. How We Use Your Data</h2>
        <ul>
          <li>To provide, operate, and improve the Service.</li>
          <li>To process form translations and tax calculations on your behalf.</li>
          <li>To send transactional emails (e.g. session save confirmation).</li>
          <li>To respond to support requests.</li>
          <li>To detect and prevent fraud or misuse.</li>
          <li>To comply with legal obligations.</li>
        </ul>
        <p>We do <strong>not</strong> sell your personal data. We do not use your documents or tax information to train AI models.</p>

        <h2 id="legal-basis">4. Legal Basis (GDPR)</h2>
        <p>We process your personal data under the following legal bases (GDPR Article 6):</p>
        <ul>
          <li><strong>Contract performance (Art. 6(1)(b)):</strong> processing necessary to deliver the Service you requested.</li>
          <li><strong>Legitimate interests (Art. 6(1)(f)):</strong> security monitoring and fraud prevention.</li>
          <li><strong>Consent (Art. 6(1)(a)):</strong> non-essential cookies, where applicable.</li>
          <li><strong>Legal obligation (Art. 6(1)(c)):</strong> where required by law.</li>
        </ul>
        <p>For sensitive tax information, we rely on your <strong>explicit consent (Art. 9(2)(a))</strong>, which you give when entering data in the tax module.</p>

        <h2 id="third-parties">5. Processing Partners</h2>
        <p>To deliver the Service, we use vetted third-party processors, each bound by GDPR-compliant Data Processing Agreements (DPAs). No processor receives your data beyond what is strictly necessary.</p>
        <ul>
          <li><strong>AI analysis:</strong> form field extraction and tax narrative generation are performed via an enterprise AI API. The API provider's enterprise terms contractually prohibit the use of API inputs to train models. Document content is transmitted only when you actively use a feature that requires it (e.g. clicking "Analyse") and is not stored after the response is returned.</li>
          <li><strong>Hosting &amp; CDN:</strong> application hosting on servers in the EU/EEA, with global CDN edge caching for performance.</li>
          <li><strong>Authentication:</strong> optional user account authentication (when enabled).</li>
          <li><strong>Transactional email:</strong> for session save confirmations and account notifications only.</li>
        </ul>
        <p>We do not share your data with advertisers, data brokers, or analytics resellers.</p>

        <h2 id="retention">6. Data Retention</h2>
        <ul>
          <li><strong>Uploaded forms:</strong> deleted from processing memory immediately after the response is generated. We do not retain copies of any document you upload.</li>
          <li><strong>Tax session data:</strong> stored exclusively in your browser's localStorage under the key <code>prontovoila_tax_session</code>. It never reaches our servers unless you explicitly save a session to your account. You can delete it anytime by clearing browser site data.</li>
          <li><strong>Account data:</strong> retained while your account is active and for up to 24 months after deletion for legal compliance, then permanently deleted.</li>
          <li><strong>Usage logs:</strong> anonymised and retained for up to 90 days.</li>
        </ul>

        <h2 id="your-rights">7. Your Rights</h2>
        <p>Under GDPR and German data protection law (BDSG), you have the right to:</p>
        <ul>
          <li><strong>Access</strong> the personal data we hold about you (Art. 15).</li>
          <li><strong>Rectification</strong> of inaccurate data (Art. 16).</li>
          <li><strong>Erasure</strong> — "right to be forgotten" (Art. 17).</li>
          <li><strong>Restriction</strong> of processing in certain circumstances (Art. 18).</li>
          <li><strong>Data portability</strong> in a structured, machine-readable format (Art. 20).</li>
          <li><strong>Object</strong> to processing based on legitimate interests (Art. 21).</li>
          <li><strong>Withdraw consent</strong> at any time without affecting prior lawful processing (Art. 7(3)).</li>
          <li><strong>Lodge a complaint</strong> with the BfDI (Germany's data protection authority): <a href="https://www.bfdi.bund.de" target="_blank" rel="noopener noreferrer">www.bfdi.bund.de</a>.</li>
        </ul>
        <p>To exercise any right: <a href="mailto:hello@prontovoila.com">hello@prontovoila.com</a> — subject line "GDPR Request". We respond within 30 days.</p>

        <h2 id="security">8. Security</h2>
        <p>We use TLS encryption for all data in transit, strict access controls, and secure credential management. Uploaded forms are never written to persistent storage — they live only in processing memory. Tax session data stays in your browser. See our <a href="/security">Security page</a> for full details.</p>

        <h2 id="transfers">9. International Transfers</h2>
        <p>Our primary infrastructure is hosted in the EU/EEA. Where any processing partner is based outside the EU (for example, AI API infrastructure with US-based providers), transfers are made under appropriate safeguards — specifically Standard Contractual Clauses (SCCs) approved by the European Commission under GDPR Chapter V. These contractually require the recipient to protect your data to EU standards.</p>

        <h2 id="children">10. Children</h2>
        <p>ProntoVoilà is not directed at children under 16. We do not knowingly collect personal data from children. Contact us immediately if you believe a child has submitted data.</p>

        <h2 id="changes">11. Changes to This Policy</h2>
        <p>We will notify registered users of material changes by email before they take effect. The "last updated" date at the top reflects the most recent revision.</p>

        <h2 id="contact">12. Contact</h2>
        <p>Privacy questions: <a href="mailto:hello@prontovoila.com">hello@prontovoila.com</a></p>

      </div>
    </LegalLayout>
  );
}
