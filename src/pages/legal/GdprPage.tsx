import LegalLayout from './LegalLayout';
import { useNavigate } from 'react-router-dom';
import '../../styles/legal.css';

export default function GdprPage() {
  const navigate = useNavigate();
  return (
    <LegalLayout
      title="GDPR &amp; Your Rights"
      subtitle="Your data protection rights under the General Data Protection Regulation."
      lastUpdated="6 April 2026"
    >
      <div className="legal">

        <p>ProntoVoilà is committed to protecting your personal data in compliance with the General Data Protection Regulation (EU) 2016/679 (GDPR) and applicable German data protection law (Bundesdatenschutzgesetz, BDSG).</p>

        <h2>Your Rights Under GDPR</h2>
        <p>As a data subject, you have the following rights:</p>

        <h3>Right of Access (Art. 15)</h3>
        <p>You have the right to obtain confirmation of whether we process personal data about you, and if so, to receive a copy of that data along with information about how it is processed.</p>

        <h3>Right to Rectification (Art. 16)</h3>
        <p>You have the right to have inaccurate personal data corrected without undue delay.</p>

        <h3>Right to Erasure — "Right to be Forgotten" (Art. 17)</h3>
        <p>You may request deletion of your personal data where it is no longer necessary for the purposes for which it was collected, you have withdrawn consent, or you object to processing and there are no overriding legitimate grounds.</p>

        <h3>Right to Restriction of Processing (Art. 18)</h3>
        <p>You may request that we restrict processing of your data in certain circumstances, for example while the accuracy of the data is being verified.</p>

        <h3>Right to Data Portability (Art. 20)</h3>
        <p>Where processing is based on consent or a contract, you have the right to receive your personal data in a structured, commonly used, machine-readable format and to transmit it to another controller.</p>

        <h3>Right to Object (Art. 21)</h3>
        <p>You may object at any time to processing of your personal data based on our legitimate interests. We will stop processing unless we can demonstrate compelling legitimate grounds that override your interests.</p>

        <h3>Right to Withdraw Consent (Art. 7(3))</h3>
        <p>Where processing is based on consent, you may withdraw that consent at any time. Withdrawal does not affect the lawfulness of processing carried out before withdrawal.</p>

        <h3>Right not to be Subject to Automated Decision-Making (Art. 22)</h3>
        <p>ProntoVoilà does not make automated decisions that produce legal effects or similarly significantly affect you. Tax estimates are calculations, not automated administrative decisions — you remain in control of whether and how to submit any filing.</p>

        <h2>How to Exercise Your Rights</h2>
        <p>To exercise any of your rights, please contact us at <a href="mailto:hello@prontovoila.com">hello@prontovoila.com</a> with the subject line "GDPR Request". We will respond within <strong>30 days</strong>. We may ask you to verify your identity before processing the request.</p>

        <h2>Tax Data &amp; Sensitive Information</h2>
        <p>Tax-related information (income, deductions, personal identifiers) constitutes sensitive personal data. We process this data only:</p>
        <ul>
          <li>Locally in your browser (tax session data is stored in localStorage on your device only).</li>
          <li>Via the AI API during active analysis — under your explicit instruction when you click "Analyze".</li>
          <li>Only on our servers if you choose to save a session to your account.</li>
        </ul>
        <p>We do not retain raw tax data after your session ends unless you explicitly save it.</p>

        <h2>Supervisory Authority</h2>
        <p>You have the right to lodge a complaint with a supervisory authority. In Germany, the relevant authority is:</p>
        <ul>
          <li><strong>Bundesbeauftragter für den Datenschutz und die Informationsfreiheit (BfDI)</strong><br />
          Husarenstraße 30, 53117 Bonn, Germany<br />
          <a href="https://www.bfdi.bund.de" target="_blank" rel="noopener noreferrer">www.bfdi.bund.de</a></li>
        </ul>
        <p>You may also contact the supervisory authority in your EU country of residence.</p>

        <h2>Full Privacy Policy</h2>
        <p>For complete details on how we collect and use your data, please see our <button onClick={() => navigate('/privacy')} style={{ background: 'none', border: 'none', color: 'var(--navy)', cursor: 'pointer', fontSize: 15, padding: 0, textDecoration: 'underline', fontFamily: 'var(--sans)' }}>Privacy Policy</button>.</p>

      </div>
    </LegalLayout>
  );
}
