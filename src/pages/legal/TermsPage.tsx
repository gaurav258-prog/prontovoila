import LegalLayout from './LegalLayout';
import '../../styles/legal.css';

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      subtitle="Please read these terms carefully before using ProntoVoilà."
      lastUpdated="6 April 2026"
    >
      <div className="legal">

        <div className="toc">
          <p>Contents</p>
          <a href="#acceptance">1. Acceptance of Terms</a>
          <a href="#services">2. Description of Services</a>
          <a href="#translation-disclaimer">3. Form Translation Disclaimer</a>
          <a href="#tax-disclaimer">4. Tax Filing Disclaimer</a>
          <a href="#no-professional-advice">5. No Professional or Legal Advice</a>
          <a href="#user-responsibilities">6. User Responsibilities</a>
          <a href="#commitments">7. Our Commitments to You</a>
          <a href="#liability">8. Limitation of Liability</a>
          <a href="#ip">9. Intellectual Property</a>
          <a href="#privacy">10. Privacy and Data</a>
          <a href="#termination">11. Termination</a>
          <a href="#governing-law">12. Governing Law</a>
          <a href="#contact">13. Contact</a>
        </div>

        <h2 id="acceptance">1. Acceptance of Terms</h2>
        <p>By accessing or using ProntoVoilà ("the Service", "we", "us"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service. These terms apply to all users of the Service, including visitors, registered users, and paying subscribers.</p>

        <h2 id="services">2. Description of Services</h2>
        <p>ProntoVoilà provides two AI-assisted services:</p>
        <ul>
          <li><strong>Form Translation &amp; Filling:</strong> an AI-powered tool that reads official forms, translates field labels and instructions, and assists users in completing those forms in a language of their choice.</li>
          <li><strong>German Tax Filing Assistance:</strong> a guided questionnaire that helps users prepare an estimated German personal income tax return (Einkommensteuererklärung), calculate an estimated refund or liability using publicly documented formulas, and (on the Complete plan) submit a return via ELSTER.</li>
        </ul>
        <p>ProntoVoilà is a software tool, not a licensed translation agency, certified public accountant, Steuerberater (tax adviser), or law firm.</p>

        <hr className="section-divider" />

        <div className="disclaimer-box">
          <p><strong>Important — please read sections 3 and 4 carefully.</strong> They describe the key limitations of our translation and tax services. Using ProntoVoilà does not replace professional legal, translation, or tax advice.</p>
        </div>

        <h2 id="translation-disclaimer">3. Form Translation Disclaimer</h2>
        <p>ProntoVoilà's form translation feature uses artificial intelligence to interpret and translate document content. You acknowledge and agree that:</p>
        <ul>
          <li>Translations produced by ProntoVoilà are <strong>AI-generated and for convenience only</strong>. They are not certified, notarised, or sworn translations and may not be accepted by government authorities, courts, or other institutions that require certified translations.</li>
          <li>AI translations may contain <strong>errors, omissions, or misinterpretations</strong>, particularly for technical, legal, or medical terminology.</li>
          <li>You are solely responsible for <strong>reviewing and verifying</strong> all translated content before signing, submitting, or acting on any completed form.</li>
          <li>ProntoVoilà makes no warranty that any completed form will be accepted by the relevant authority, institution, or organisation.</li>
          <li>Where accuracy is critical — such as visa applications, medical consent forms, or legal declarations — you should have the document independently reviewed by a qualified human translator or the relevant professional.</li>
        </ul>

        <h2 id="tax-disclaimer">4. Tax Filing Disclaimer</h2>
        <p>ProntoVoilà's tax filing feature provides automated assistance with German personal income tax returns. You acknowledge and agree that:</p>
        <ul>
          <li>Tax estimates are calculated using <strong>publicly documented formulas</strong> (§32a EStG, §9 EStG, §10 EStG, §4 SolZG, §35a EStG and related provisions) applied to information you provide. They are estimates and may differ from the assessment issued by the Finanzamt.</li>
          <li>ProntoVoilà is <strong>not a licensed Steuerberater (tax adviser) or Wirtschaftsprüfer</strong> and does not provide regulated tax advice within the meaning of the Steuerberatungsgesetz (StBerG). The Service is a software tool only.</li>
          <li>The Service does <strong>not account for all possible tax situations</strong>, including but not limited to: self-employment income (Gewerbebetrieb), rental income, complex Splittingtarif edge cases, foreign income, capital gains, inheritance, or business assets.</li>
          <li>You are responsible for ensuring that all information you enter is <strong>accurate, complete, and truthful</strong>. Submitting incorrect information to the Finanzamt, whether via ELSTER or otherwise, is your sole legal responsibility.</li>
          <li>ELSTER submissions made through the Complete plan are submitted <strong>on your explicit instruction and on your behalf</strong>. You remain the taxpayer of record and bear full legal responsibility for the submitted return.</li>
          <li>ProntoVoilà recommends that users with <strong>complex tax situations, significant assets, or uncertainty</strong> consult a licensed Steuerberater before filing.</li>
          <li>Tax law changes regularly. While we update our formulas for each tax year, we cannot guarantee that the Service reflects the latest legislative amendments at all times.</li>
        </ul>

        <h2 id="no-professional-advice">5. No Professional or Legal Advice</h2>
        <p>Nothing in the Service, including translated documents, tax calculations, AI-generated analysis, recommendations, or any other output, constitutes legal advice, tax advice, financial advice, or any other form of regulated professional advice. You should not rely solely on the Service to make legal, financial, or compliance decisions. Consult the appropriate qualified professional for your specific situation.</p>

        <h2 id="user-responsibilities">6. User Responsibilities</h2>
        <p>By using the Service, you agree to:</p>
        <ul>
          <li>Provide accurate and truthful information in all forms and questionnaires.</li>
          <li>Review all AI-generated output before submission or use.</li>
          <li>Comply with all applicable laws and regulations in your jurisdiction.</li>
          <li>Not use the Service for any fraudulent, unlawful, or deceptive purpose.</li>
          <li>Keep your account credentials confidential and notify us immediately of any unauthorised access.</li>
          <li>Not attempt to reverse-engineer, scrape, or misuse the Service.</li>
        </ul>

        <h2 id="commitments">7. Our Commitments to You</h2>
        <p>Alongside the limitations above, ProntoVoilà makes the following commitments:</p>
        <ul>
          <li>We will <strong>never sell your personal data</strong> to any third party.</li>
          <li>We will <strong>never use your documents or tax information to train AI models</strong>.</li>
          <li>Uploaded documents are <strong>deleted immediately after processing</strong>. We keep no copies.</li>
          <li>Your tax session data is <strong>stored only in your browser</strong> unless you explicitly save it to your account.</li>
          <li>You can request <strong>deletion of all data we hold about you</strong> at any time and we will action it within 30 days.</li>
          <li>We will notify you within <strong>72 hours</strong> of becoming aware of any personal data breach that affects your data, as required by GDPR Art. 33–34.</li>
          <li>We will keep our formulas and methods <strong>transparent</strong> — the tax calculation methodology is documented and based on publicly available German tax law.</li>
        </ul>

        <h2 id="liability">8. Limitation of Liability</h2>
        <p>To the fullest extent permitted by applicable law:</p>
        <ul>
          <li>ProntoVoilà is provided <strong>"as is"</strong> without warranties of any kind, express or implied, including but not limited to warranties of accuracy, fitness for a particular purpose, or non-infringement.</li>
          <li>ProntoVoilà shall not be liable for any <strong>direct, indirect, incidental, special, consequential, or punitive damages</strong> arising from your use of the Service, including but not limited to: incorrect form completion, rejected applications, tax penalties, late-filing surcharges, errors in ELSTER submissions, or reliance on AI-generated translations.</li>
          <li>Our total aggregate liability to you for any claims arising under or related to these Terms shall not exceed the <strong>total fees paid by you to ProntoVoilà in the twelve months preceding the claim</strong>.</li>
          <li>Some jurisdictions do not allow certain exclusions of liability; in such cases, our liability is limited to the maximum extent permitted by law.</li>
        </ul>

        <h2 id="ip">9. Intellectual Property</h2>
        <p>The ProntoVoilà platform, brand, software, and all associated content are owned by ProntoVoilà and protected by intellectual property law. You retain ownership of any documents you upload. By uploading documents, you grant ProntoVoilà a limited licence to process them solely for the purpose of providing the Service to you. We do not use your documents to train AI models.</p>

        <h2 id="privacy">10. Privacy and Data</h2>
        <p>Your use of the Service is also governed by our <a href="/privacy">Privacy Policy</a> and <a href="/cookies">Cookie Policy</a>, which are incorporated into these Terms by reference. We process personal data including tax-related information in accordance with EU GDPR and applicable German data protection law.</p>

        <h2 id="termination">11. Termination</h2>
        <p>We may suspend or terminate your access to the Service at any time if you breach these Terms or if we reasonably believe your use is harmful or unlawful. You may stop using the Service at any time. Paid plan fees are non-refundable except where required by applicable consumer protection law.</p>

        <h2 id="governing-law">12. Governing Law</h2>
        <p>These Terms are governed by the laws of the Federal Republic of Germany, excluding conflict of laws rules. Any disputes shall be subject to the exclusive jurisdiction of the courts of Germany, unless mandatory consumer protection rules in your country of residence provide otherwise.</p>

        <h2 id="contact">13. Contact</h2>
        <p>If you have questions about these Terms, please contact us at <a href="mailto:hello@prontovoila.com">hello@prontovoila.com</a>.</p>

      </div>
    </LegalLayout>
  );
}
