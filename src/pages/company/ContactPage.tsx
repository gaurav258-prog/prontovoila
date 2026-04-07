import LegalLayout from '../legal/LegalLayout';
import '../../styles/legal.css';

export default function ContactPage() {
  return (
    <LegalLayout title="Contact Us" subtitle="We'd love to hear from you.">
      <div className="legal">

        <h2>General Enquiries</h2>
        <p>For product questions, feedback, or general enquiries:<br />
        <a href="mailto:hello@prontovoila.com">hello@prontovoila.com</a></p>

        <h2>Support</h2>
        <p>For help with a specific form or tax filing:<br />
        <a href="mailto:hello@prontovoila.com">hello@prontovoila.com</a><br />
        Please include a description of the issue and, if relevant, the form type or step number in the tax module.</p>

        <h2>Privacy &amp; Data Requests</h2>
        <p>To exercise your GDPR rights (access, deletion, portability, etc.):<br />
        <a href="mailto:hello@prontovoila.com">hello@prontovoila.com</a><br />
        Subject line: <strong>GDPR Request</strong><br />
        We respond within 30 days.</p>

        <h2>Press &amp; Partnerships</h2>
        <p>Media enquiries and partnership proposals:<br />
        <a href="mailto:hello@prontovoila.com">hello@prontovoila.com</a></p>

        <h2>Response Times</h2>
        <p>We aim to respond to all enquiries within <strong>2 business days</strong>. For urgent support issues, please indicate "Urgent" in your subject line.</p>

      </div>
    </LegalLayout>
  );
}
