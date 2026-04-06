export default function ArchIcon({ size = 28, light = false, className }: { size?: number; light?: boolean; className?: string }) {
  // light=true → dark background (all gold)
  // light=false → light background (navy structure, gold dots)
  const stroke = light ? '#c9a84c' : '#162f49';
  const dimOpacity = light ? 1 : 0.5;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size * 0.6}
      viewBox="0 0 44 26"
      className={className}
      aria-hidden="true"
    >
      {/* Base line */}
      <line x1="2" y1="24" x2="42" y2="24" stroke={stroke} strokeOpacity={dimOpacity} strokeWidth="1.5" strokeLinecap="round"/>
      {/* Arch */}
      <path d="M6 24 Q22 4 38 24" fill="none" stroke={stroke} strokeWidth="2.2" strokeLinecap="round"/>
      {/* Left pillar */}
      <line x1="8" y1="24" x2="8" y2="15" stroke={stroke} strokeOpacity={dimOpacity} strokeWidth="1.5" strokeLinecap="round"/>
      {/* Right pillar */}
      <line x1="36" y1="24" x2="36" y2="15" stroke={stroke} strokeOpacity={dimOpacity} strokeWidth="1.5" strokeLinecap="round"/>
      {/* Left dot */}
      <circle cx="2" cy="24" r="2.5" fill="#c9a84c"/>
      {/* Right dot */}
      <circle cx="42" cy="24" r="2.5" fill="#c9a84c"/>
    </svg>
  );
}
