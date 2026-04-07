import LegalLayout from '../legal/LegalLayout';
import '../../styles/legal.css';

export default function AboutPage() {
  return (
    <LegalLayout title="About ProntoVoilà" subtitle="Making official life abroad simpler, one form at a time.">
      <div className="legal">

        <h2>Our Mission</h2>
        <p>Moving to a new country is one of the most exciting things a person can do. But the paperwork that comes with it — residence registration, medical forms, tax returns, school enrolment, work permits — is often in a language you don't speak fluently, using terminology you've never encountered, with consequences for getting it wrong.</p>
        <p>ProntoVoilà exists to change that. We believe that language should never be a barrier to accessing the services and rights you're entitled to in your adopted country.</p>

        <h2>What We Build</h2>
        <p>We build tools that help the millions of expats, immigrants, and international workers who navigate official bureaucracy every day:</p>
        <ul>
          <li><strong>Form Translation &amp; Filling</strong> — upload any official form in any language, answer questions in yours, download a completed PDF ready to submit.</li>
          <li><strong>German Tax Filing (Einkommensteuererklärung)</strong> — a guided, multilingual questionnaire that walks you through your German income tax return step by step, calculates your refund using official formulas, and helps you file.</li>
        </ul>

        <h2>Our Approach</h2>
        <p>We combine state-of-the-art AI with careful attention to accuracy and transparency. For tax calculations, we use deterministic formulas sourced from official German tax law (§32a EStG and related provisions) — not AI estimation — so the numbers are reproducible and auditable. AI handles the narrative, translation, and guidance; the maths is done by code.</p>
        <p>We are honest about what we are: a software tool, not a licensed translation bureau or Steuerberater. Our <a href="/terms">Terms of Service</a> are clear about the limitations of AI-assisted services.</p>

        <h2>Contact</h2>
        <p>Questions, feedback, or partnership enquiries: <a href="mailto:hello@prontovoila.com">hello@prontovoila.com</a></p>

      </div>
    </LegalLayout>
  );
}
