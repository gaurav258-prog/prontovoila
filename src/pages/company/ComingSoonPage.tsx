import LegalLayout from '../legal/LegalLayout';
import '../../styles/legal.css';

interface Props {
  title: string;
}

export default function ComingSoonPage({ title }: Props) {
  return (
    <LegalLayout title={title}>
      <div className="legal" style={{ textAlign: 'center', padding: '3rem 0' }}>
        <div style={{ fontSize: 48, marginBottom: '1rem' }}>🔜</div>
        <h2 style={{ marginTop: 0 }}>Coming soon</h2>
        <p>This section is under construction. Check back soon.</p>
        <p>In the meantime, reach us at <a href="mailto:hello@prontovoila.com">hello@prontovoila.com</a>.</p>
      </div>
    </LegalLayout>
  );
}
