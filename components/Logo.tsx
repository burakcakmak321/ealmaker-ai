/** Profesyonel SVG logo - metin sayfası + kalem teması (yeşil kutu üzerinde beyaz) */
export default function Logo({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Sayfa dikdörtgeni */}
      <rect x="6" y="4" width="24" height="30" rx="2" stroke="white" strokeWidth="2" fill="none" />
      {/* Yazı çizgileri */}
      <line x1="11" y1="11" x2="27" y2="11" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.95" />
      <line x1="11" y1="17" x2="23" y2="17" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
      <line x1="11" y1="23" x2="21" y2="23" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
      {/* Kalem */}
      <path d="M25 25l7 7 2-2-7-7-2 2z" fill="white" stroke="white" strokeWidth="1" strokeLinejoin="round" />
      <line x1="27" y1="27" x2="32" y2="32" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.9" />
    </svg>
  );
}
