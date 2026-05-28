import { useState } from 'react';
import './BrandLogo.css';

const SIZE_MAP = {
  sm:   { height: 28 },
  md:   { height: 38 },
  lg:   { height: 48 },
  xl:   { height: 60 },
  hero: { height: 80 },
};

export default function BrandLogo({ size = 'md' }) {
  const [imgError, setImgError] = useState(false);
  const h = SIZE_MAP[size]?.height || 38;

  // Try to use the text logo image (logo-text.png)
  // Falls back to text version if image not found
  if (!imgError) {
    return (
      <img
        src="/logo-text.png"
        alt="Everest Auto Hub"
        height={h}
        style={{ height: h, width: 'auto', objectFit: 'contain', display: 'block' }}
        onError={() => setImgError(true)}
      />
    );
  }

  // Fallback text version
  return (
    <span className={`brand-logo brand-logo--${size}`} aria-label="Everest Auto Hub">
      <span className="brand-everest-auto">EVEREST AUTO</span>
      <span className="brand-hub-box">HUB</span>
    </span>
  );
}
