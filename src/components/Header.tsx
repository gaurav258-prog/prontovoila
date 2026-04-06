import ArchIcon from './ArchIcon';

export default function Header() {
  return (
    <header className="header">
      <div>
        <div className="header-lockup">
          <ArchIcon size={28} light />
          <div className="wordmark wordmark--light">Pronto<em>Voil&agrave;</em></div>
        </div>
        <div className="tagline">Upload any form &middot; answer in your language &middot; get it filled</div>
      </div>
    </header>
  );
}
