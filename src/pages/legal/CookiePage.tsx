import LegalLayout from './LegalLayout';
import '../../styles/legal.css';

export default function CookiePage() {
  return (
    <LegalLayout
      title="Cookie Policy"
      subtitle="How ProntoVoilà uses cookies and similar technologies."
      lastUpdated="6 April 2026"
    >
      <div className="legal">

        <h2>What Are Cookies?</h2>
        <p>Cookies are small text files stored on your device by your browser when you visit a website. They allow websites to remember your preferences and understand how you interact with the site. Similar technologies include localStorage (used for storing your in-progress tax session locally on your device) and session storage.</p>

        <h2>Cookies We Use</h2>
        <h3>Strictly Necessary Cookies</h3>
        <p>These cookies are essential for the Service to function. They cannot be disabled.</p>
        <ul>
          <li><strong>Session cookie:</strong> maintains your logged-in state during a browsing session.</li>
          <li><strong>Security tokens:</strong> protect against cross-site request forgery (CSRF).</li>
        </ul>

        <h3>Functional Storage (localStorage)</h3>
        <p>ProntoVoilà stores your in-progress tax session data in your browser's localStorage under the key <code>prontovoila_tax_session</code>. This data never leaves your device unless you explicitly save it to your account. It is not a cookie and is not transmitted to our servers automatically. You can delete it at any time by clearing your browser's site data.</p>

        <h3>Analytics Cookies (optional)</h3>
        <p>We may use privacy-respecting analytics (such as aggregated page view counts) to understand how the Service is used and to improve it. These do not track you across other websites and do not contain personally identifiable information. You may opt out by adjusting your browser settings.</p>

        <h3>No Advertising or Tracking Cookies</h3>
        <p>We do not use advertising cookies, remarketing pixels, or cross-site tracking technologies. We do not share cookie data with advertising networks.</p>

        <h2>Third-Party Cookies</h2>
        <p>Our hosting provider (Vercel) may set performance-related cookies necessary for content delivery. These are strictly functional and do not track your browsing activity across other websites.</p>

        <h2>Managing Cookies</h2>
        <p>You can control and delete cookies through your browser settings. Please note that disabling strictly necessary cookies may affect the functionality of the Service. Most browsers allow you to:</p>
        <ul>
          <li>View and delete individual cookies.</li>
          <li>Block cookies from specific or all websites.</li>
          <li>Receive a notification when a cookie is set.</li>
        </ul>
        <p>For instructions, visit your browser's help section or <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer">allaboutcookies.org</a>.</p>

        <h2>Changes to This Policy</h2>
        <p>We may update this Cookie Policy to reflect changes in our practices or applicable law. The "last updated" date at the top reflects the most recent revision.</p>

        <h2>Contact</h2>
        <p>Questions about our use of cookies: <a href="mailto:hello@prontovoila.com">hello@prontovoila.com</a></p>

      </div>
    </LegalLayout>
  );
}
