'use client';

import { useState } from 'react';
import * as Cesium from 'cesium';
import { useLang } from '@/context/LanguageContext';

interface SunSliderProps {
  viewer: Cesium.Viewer | null;
}

export default function SunSlider({ viewer }: SunSliderProps) {
  const { t } = useLang();
  const [currentHour, setCurrentHour] = useState(12);
  const [isSliderVisible, setIsSliderVisible] = useState(false);
  const [shadowsEnabled, setShadowsEnabled] = useState(false);

  function enableShadows() {
    if (!viewer || shadowsEnabled) return;
    viewer.shadows = true;
    viewer.shadowMap.softShadows = true;
    viewer.shadowMap.darkness = 0.6;
    viewer.shadowMap.size = 2048;
    viewer.scene.globe.enableLighting = true;
    setShadowsEnabled(true);
  }

  function updateSunPosition(hour: number) {
    if (!viewer) return;
    enableShadows();
    setCurrentHour(hour);
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const wholeHour = Math.floor(hour);
    const minutes = Math.round((hour - wholeHour) * 60);
    const dateString =
      year + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0') +
      'T' + String(wholeHour).padStart(2, '0') + ':' + String(minutes).padStart(2, '0') + ':00Z';
    viewer.clock.currentTime = Cesium.JulianDate.fromIso8601(dateString);
    viewer.clock.shouldAnimate = false;
    viewer.scene.requestRender();
  }

  function getTimeLabel(hour: number) {
    const h = Math.floor(hour);
    const m = Math.round((hour - h) * 60);
    return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
  }

  function getPeriodLabel(hour: number) {
    if (hour < 5)  return t('periodNight');
    if (hour < 7)  return t('periodSunrise');
    if (hour < 10) return t('periodMorning');
    if (hour < 14) return t('periodNoon');
    if (hour < 17) return t('periodAfternoon');
    if (hour < 20) return t('periodSunset');
    return t('periodNight');
  }

  function getPeriodIcon(hour: number) {
    if (hour < 5 || hour >= 20) return '\u{1F319}';
    if (hour < 7)  return '\u{1F305}';
    if (hour < 17) return '\u{2600}\u{FE0F}';
    return '\u{1F307}';
  }

  const presets = [
    { icon: '\u{1F305}', key: 'periodSunrise', hour: 6.5 },
    { icon: '\u{2600}\u{FE0F}', key: 'periodNoon', hour: 12 },
    { icon: '\u{1F307}', key: 'periodSunset', hour: 18.5 },
    { icon: '\u{1F319}', key: 'periodNight', hour: 22 },
  ];

  return (
    <>
      <button
        onClick={() => { setIsSliderVisible(!isSliderVisible); if (!isSliderVisible) enableShadows(); }}
        style={{
          position: 'absolute', bottom: '30px', right: '16px',
          width: '40px', height: '40px', borderRadius: '50%',
          background: isSliderVisible ? 'rgba(255,165,0,0.6)' : 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, transition: 'background 0.2s ease', fontSize: '18px',
        }}
        title={t('sunPosition')}
      >
        {'\u{2600}\u{FE0F}'}
      </button>

      {isSliderVisible && (
        <div style={{
          position: 'absolute', bottom: '80px', right: '16px', width: '280px',
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)',
          borderRadius: '12px', padding: '16px', zIndex: 1000,
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>{t('sunPosition')}</span>
            <span style={{ fontSize: '16px' }}>{getPeriodIcon(currentHour)}</span>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '12px' }}>
            <span style={{ color: 'white', fontSize: '28px', fontWeight: '700', fontFamily: 'monospace' }}>
              {getTimeLabel(currentHour)}
            </span>
            <br />
            <span style={{ color: 'rgba(255,165,0,0.8)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {getPeriodLabel(currentHour)}
            </span>
          </div>

          <input
            type="range" min="0" max="24" step="0.25" value={currentHour}
            onChange={(e) => updateSunPosition(parseFloat(e.target.value))}
            className="sun-slider"
            style={{
              width: '100%', height: '6px', borderRadius: '3px', outline: 'none',
              cursor: 'pointer', accentColor: '#FFA500',
              background: 'linear-gradient(to right, #1a1a3e, #1a1a3e, #FF6B35, #FFD700, #87CEEB, #87CEEB, #FFD700, #FF6B35, #1a1a3e)',
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
            {['00:00','06:00','12:00','18:00','24:00'].map((lbl) => (
              <span key={lbl} style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>{lbl}</span>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '6px', marginTop: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {presets.map((p) => (
              <button
                key={p.key}
                onClick={() => updateSunPosition(p.hour)}
                style={{
                  padding: '4px 10px', borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: Math.abs(currentHour - p.hour) < 1 ? 'rgba(255,165,0,0.3)' : 'rgba(255,255,255,0.05)',
                  color: 'white', fontSize: '11px', cursor: 'pointer', transition: 'background 0.2s ease',
                }}
              >
                {p.icon} {t(p.key)}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
