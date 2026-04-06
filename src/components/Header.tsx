import { useNavigate } from 'react-router-dom';
import ArchIcon from './ArchIcon';

interface HeaderProps {
  onLogoClick?: () => void;
  tagline?: string;
}

export default function Header({ onLogoClick, tagline = 'Upload any form · answer in your language · get it filled' }: HeaderProps) {
  const navigate = useNavigate();

  const handleLogo = () => {
    if (onLogoClick) {
      onLogoClick();
    } else {
      navigate('/');
    }
  };

  return (
    <header className="header">
      <div>
        <div
          className="header-lockup"
          onClick={handleLogo}
          style={{ cursor: 'pointer' }}
        >
          <ArchIcon size={28} light />
          <div className="wordmark wordmark--light">Pronto<em>Voil&agrave;</em></div>
        </div>
        <div className="tagline">{tagline}</div>
      </div>
    </header>
  );
}
