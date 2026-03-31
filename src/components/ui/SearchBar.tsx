'use client';

import { useRef, useState, useEffect } from 'react';
import { buildings, type Building } from '@/data/buildings';
import { CATEGORY_COLORS } from '@/data/categories';
import { useMapStore } from '@/store/mapStore';
import { useLang } from '@/context/LanguageContext';

interface SearchBarProps {
  onFlyTo: (building: Building) => void;
}

export default function SearchBar({ onFlyTo }: SearchBarProps) {
  const { t } = useLang();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const setSelectedBuilding = useMapStore((s) => s.setSelectedBuilding);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const results =
    query.length >= 2
      ? buildings.filter((b) =>
          b.name.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 8)
      : [];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function select(b: Building) {
    setSelectedBuilding(b);
    onFlyTo(b);
    setQuery('');
    setOpen(false);
  }

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'absolute',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 30,
        width: 360,
      }}
    >
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={t('searchPlaceholder')}
        style={{
          width: '100%',
          padding: '10px 16px',
          borderRadius: open && results.length > 0 ? '12px 12px 0 0' : 12,
          border: '1px solid rgba(255,255,255,0.15)',
          background: 'rgba(15, 15, 30, 0.9)',
          backdropFilter: 'blur(16px)',
          color: 'white',
          fontSize: 14,
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />
      {open && results.length > 0 && (
        <div
          style={{
            background: 'rgba(15, 15, 30, 0.95)',
            backdropFilter: 'blur(16px)',
            borderRadius: '0 0 12px 12px',
            border: '1px solid rgba(255,255,255,0.15)',
            borderTop: 'none',
            overflow: 'hidden',
          }}
        >
          {results.map((b) => (
            <button
              key={b.id}
              onClick={() => select(b)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '10px 16px',
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: 13,
                cursor: 'pointer',
                textAlign: 'left',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = 'none')
              }
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: CATEGORY_COLORS[b.category],
                  flexShrink: 0,
                }}
              />
              <span>{b.name}</span>
              {b.area_ha && (
                <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                  {b.area_ha} ha
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
