'use client';

import { useState, useRef, useEffect } from 'react';
import { useLang } from '@/context/LanguageContext';
import type { Lang } from '@/i18n/translations';

const LANGS: { code: Lang; flag: string; label: string }[] = [
  { code: 'az', flag: '🇦🇿', label: 'AZ' },
  { code: 'ru', flag: '🇷🇺', label: 'RU' },
  { code: 'en', flag: '🇬🇧', label: 'EN' },
];

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LANGS.find((l) => l.code === lang)!;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 1100,
        userSelect: 'none',
      }}
    >
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '7px 12px',
          borderRadius: 10,
          background: 'rgba(15, 15, 30, 0.88)',
          backdropFilter: 'blur(14px)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: 'white',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'border-color 0.2s',
          letterSpacing: '0.3px',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)')}
      >
        <span style={{ fontSize: 16 }}>{current.flag}</span>
        <span>{current.label}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          style={{ opacity: 0.5, transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
        >
          <path d="M1 3 L5 7 L9 3" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            minWidth: 110,
            background: 'rgba(15, 15, 30, 0.95)',
            backdropFilter: 'blur(16px)',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.12)',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); setOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '9px 14px',
                background: lang === l.code ? 'rgba(255,255,255,0.1)' : 'none',
                border: 'none',
                color: 'white',
                fontSize: 13,
                fontWeight: lang === l.code ? 700 : 400,
                cursor: 'pointer',
                transition: 'background 0.15s',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => { if (lang !== l.code) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
              onMouseLeave={(e) => { if (lang !== l.code) e.currentTarget.style.background = 'none'; }}
            >
              <span style={{ fontSize: 18 }}>{l.flag}</span>
              <span>{l.label}</span>
              {lang === l.code && (
                <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
