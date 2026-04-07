import { useNavigate } from 'react-router-dom';
import ArchIcon from '../../components/ArchIcon';

interface Props {
  title: string;
  subtitle?: string;
  lastUpdated?: string;
  children: React.ReactNode;
}

export default function LegalLayout({ title, subtitle, lastUpdated, children }: Props) {
  const navigate = useNavigate();
  return (
    <div style={{ fontFamily: 'var(--sans)', color: 'var(--ink)', background: '#fff', minHeight: '100vh' }}>
      {/* Nav */}
      <nav style={{ background: 'var(--navy)', padding: '0 5%', height: 64, display: 'flex', alignItems: 'center' }}>
        <div style={{ maxWidth: 900, width: '100%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: '-.5px', fontFamily: 'var(--sans)' }}
          >
            <ArchIcon size={22} light />
            <span>Pronto<span style={{ color: 'var(--gold)' }}>Voilà</span></span>
          </button>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: '1px solid rgba(255,255,255,.2)', borderRadius: 6, padding: '6px 14px', color: 'rgba(255,255,255,.7)', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--sans)' }}>
            ← Back
          </button>
        </div>
      </nav>

      {/* Header */}
      <div style={{ background: 'var(--cream)', borderBottom: '1px solid var(--border-light)', padding: '3rem 5%' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h1 style={{ fontSize: 'clamp(26px,4vw,40px)', fontWeight: 700, color: 'var(--navy)', marginBottom: '.4rem', letterSpacing: '-.02em' }}>{title}</h1>
          {subtitle && <p style={{ fontSize: 16, color: 'var(--ink3)', marginTop: '.4rem' }}>{subtitle}</p>}
          {lastUpdated && <p style={{ fontSize: 12, color: 'var(--ink4)', marginTop: '.6rem' }}>Last updated: {lastUpdated}</p>}
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 5% 5rem' }}>
        {children}
      </div>

      {/* Footer strip */}
      <div style={{ background: 'var(--navy)', padding: '1.5rem 5%', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,.3)' }}>© 2026 ProntoVoilà. All rights reserved.</p>
      </div>
    </div>
  );
}
