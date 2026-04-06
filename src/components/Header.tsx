import { useNavigate } from 'react-router-dom';
import ArchIcon from './ArchIcon';

interface HeaderProps {
  onLogoClick?: () => void;
}

export default function Header({ onLogoClick }: HeaderProps) {
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
        <div className="tagline">Upload any form &middot; answer in your language &middot; get it filled</div>
      </div>
    </header>
  );
}
