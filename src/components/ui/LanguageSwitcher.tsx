'use client';

import { useState, useRef, useEffect } from 'react';
import { useLang } from '@/context/LanguageContext';
import type { Lang } from '@/i18n/translations';

// ─── SVG Flags ───

function FlagAZ({ size = 20 }: { size?: number }) {
  const r = size * 0.12;
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 30 18" style={{ borderRadius: 2, display: 'block' }}>
      <rect width="30" height="6" y="0"  fill="#0092BC" />
      <rect width="30" height="6" y="6"  fill="#E8112D" />
      <rect width="30" height="6" y="12" fill="#00B050" />
      {/* Crescent */}
      <circle cx="15.5" cy="9" r="3.2" fill="white" />
      <circle cx="16.4" cy="9" r="2.5" fill="#E8112D" />
      {/* 8-pointed star */}
      <g transform="translate(19.5,9)" fill="white">
        <polygon points="0,-1.5 0.35,-0.35 1.5,0 0.35,0.35 0,1.5 -0.35,0.35 -1.5,0 -0.35,-0.35" />
        <polygon points="0,-1.5 0.35,-0.35 1.5,0 0.35,0.35 0,1.5 -0.35,0.35 -1.5,0 -0.35,-0.35" transform="rotate(45)" />
      </g>
    </svg>
  );
}

function FlagRU({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 30 18" style={{ borderRadius: 2, display: 'block' }}>
      <rect width="30" height="6" y="0"  fill="#FFFFFF" />
      <rect width="30" height="6" y="6"  fill="#0039A6" />
      <rect width="30" height="6" y="12" fill="#D52B1E" />
    </svg>
  );
}

function FlagEN({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 60 36" style={{ borderRadius: 2, display: 'block' }}>
      {/* Blue background */}
      <rect width="60" height="36" fill="#012169" />
      {/* White diagonals */}
      <line x1="0" y1="0"  x2="60" y2="36" stroke="white" strokeWidth="7.2" />
      <line x1="60" y1="0" x2="0"  y2="36" stroke="white" strokeWidth="7.2" />
      {/* Red diagonals */}
      <line x1="0" y1="0"  x2="60" y2="36" stroke="#C8102E" strokeWidth="4.8" />
      <line x1="60" y1="0" x2="0"  y2="36" stroke="#C8102E" strokeWidth="4.8" />
      {/* White cross */}
      <rect x="0"  y="14.4" width="60" height="7.2" fill="white" />
      <rect x="26.4" y="0" width="7.2" height="36" fill="white" />
      {/* Red cross */}
      <rect x="0"  y="15.6" width="60" height="4.8" fill="#C8102E" />
      <rect x="27.6" y="0" width="4.8" height="36" fill="#C8102E" />
    </svg>
  );
}

const FLAG_COMPONENTS: Record<Lang, (props: { size?: number }) => JSX.Element> = {
  az: FlagAZ,
  ru: FlagRU,
  en: FlagEN,
};

const LANGS: { code: Lang; label: string }[] = [
  { code: 'az', label: 'AZ' },
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
];

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LANGS.find((l) => l.code === lang)!;
  const CurrentFlag = FLAG_COMPONENTS[lang];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} style={{ position: 'absolute', top: 16, right: 16, zIndex: 1100, userSelect: 'none' }}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 12px', borderRadius: 10,
          background: 'rgba(15, 15, 30, 0.88)',
          backdropFilter: 'blur(14px)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: 'white', fontSize: 13, fontWeight: 600,
          cursor: 'pointer', transition: 'border-color 0.2s',
          letterSpacing: '0.3px',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)')}
      >
        <CurrentFlag size={24} />
        <span>{current.label}</span>
        <svg width="10" height="10" viewBox="0 0 10 10"
          style={{ opacity: 0.5, transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
          <path d="M1 3 L5 7 L9 3" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0, minWidth: 110,
          background: 'rgba(15, 15, 30, 0.95)', backdropFilter: 'blur(16px)',
          borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)',
          overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          {LANGS.map((l) => {
            const FlagComp = FLAG_COMPONENTS[l.code];
            const active = lang === l.code;
            return (
              <button
                key={l.code}
                onClick={() => { setLang(l.code); setOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '9px 14px',
                  background: active ? 'rgba(255,255,255,0.1)' : 'none',
                  border: 'none', color: 'white',
                  fontSize: 13, fontWeight: active ? 700 : 400,
                  cursor: 'pointer', transition: 'background 0.15s', textAlign: 'left',
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'none'; }}
              >
                <FlagComp size={22} />
                <span>{l.label}</span>
                {active && <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
