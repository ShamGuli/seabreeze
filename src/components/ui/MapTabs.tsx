'use client';

import { useState, useRef, useEffect } from 'react';
import { MAP_CONFIGS } from '@/data/mapConfigs';
import { useMapStore } from '@/store/mapStore';
import { useLang } from '@/context/LanguageContext';

export default function MapTabs() {
  const { lang } = useLang();
  const activeMapId = useMapStore((s) => s.activeMapId);
  const setActiveMap = useMapStore((s) => s.setActiveMap);
  const isMapTransitioning = useMapStore((s) => s.isMapTransitioning);
  const showCommunication = useMapStore((s) => s.showCommunication);
  const selectedBuilding = useMapStore((s) => s.selectedBuilding);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const activeConfig = MAP_CONFIGS.find((c) => c.id === activeMapId) ?? MAP_CONFIGS[0];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (MAP_CONFIGS.length <= 1 || selectedBuilding) return null;

  return (
    <div ref={ref} style={{ position: 'absolute', top: 16, left: showCommunication ? 16 : 68, zIndex: 30, transition: 'left 0.3s' }}>
      {/* Active map button (dropdown trigger) */}
      <button
        onClick={() => setOpen(!open)}
        disabled={isMapTransitioning}
        style={{
          padding: '8px 16px',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.15)',
          background: 'rgba(15, 15, 30, 0.85)',
          backdropFilter: 'blur(10px)',
          color: '#fff',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          transition: 'all 0.2s',
        }}
      >
        {activeConfig.nameI18n[lang]}
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          marginTop: 4,
          minWidth: '100%',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(15, 15, 30, 0.92)',
          backdropFilter: 'blur(16px)',
          overflow: 'hidden',
        }}>
          {MAP_CONFIGS.map((config) => {
            const isActive = config.id === activeMapId;
            return (
              <button
                key={config.id}
                onClick={() => {
                  if (!isActive && !isMapTransitioning) {
                    setActiveMap(config.id);
                  }
                  setOpen(false);
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px 16px',
                  border: 'none',
                  background: isActive ? 'rgba(0,150,255,0.25)' : 'transparent',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  cursor: isActive ? 'default' : 'pointer',
                  textAlign: 'left',
                  whiteSpace: 'nowrap',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                {config.nameI18n[lang]}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
