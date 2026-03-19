'use client';

import { useState } from 'react';
import * as Cesium from 'cesium';

interface SunSliderProps {
  viewer: Cesium.Viewer | null;
}

export default function SunSlider({ viewer }: SunSliderProps) {
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
      year +
      '-' +
      String(month).padStart(2, '0') +
      '-' +
      String(day).padStart(2, '0') +
      'T' +
      String(wholeHour).padStart(2, '0') +
      ':' +
      String(minutes).padStart(2, '0') +
      ':00Z';

    viewer.clock.currentTime = Cesium.JulianDate.fromIso8601(dateString);
    viewer.clock.shouldAnimate = false;
  }

  function getTimeLabel(hour: number) {
    const h = Math.floor(hour);
    const m = Math.round((hour - h) * 60);
    return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
  }

  function getPeriodLabel(hour: number) {
    if (hour < 5) return 'Night';
    if (hour < 7) return 'Sunrise';
    if (hour < 10) return 'Morning';
    if (hour < 14) return 'Noon';
    if (hour < 17) return 'Afternoon';
    if (hour < 20) return 'Sunset';
    return 'Night';
  }

  function getPeriodIcon(hour: number) {
    if (hour < 5 || hour >= 20) return '\u{1F319}';
    if (hour < 7) return '\u{1F305}';
    if (hour < 17) return '\u{2600}\u{FE0F}';
    return '\u{1F307}';
  }

  return (
    <>
      {/* Sun Control Button */}
      <button
        onClick={() => {
          setIsSliderVisible(!isSliderVisible);
          if (!isSliderVisible) enableShadows();
        }}
        style={{
          position: 'absolute',
          bottom: '30px',
          right: '16px',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: isSliderVisible ? 'rgba(255,165,0,0.6)' : 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.15)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          transition: 'background 0.2s ease',
          fontSize: '18px',
        }}
        title="Sun Position"
      >
        {'\u{2600}\u{FE0F}'}
      </button>

      {/* Sun Slider Panel */}
      {isSliderVisible && (
        <div
          style={{
            position: 'absolute',
            bottom: '80px',
            right: '16px',
            width: '280px',
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(12px)',
            borderRadius: '12px',
            padding: '16px',
            zIndex: 1000,
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}
          >
            <span style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>
              Sun Position
            </span>
            <span style={{ fontSize: '16px' }}>{getPeriodIcon(currentHour)}</span>
          </div>

          {/* Time display */}
          <div style={{ textAlign: 'center', marginBottom: '12px' }}>
            <span
              style={{
                color: 'white',
                fontSize: '28px',
                fontWeight: '700',
                fontFamily: 'monospace',
              }}
            >
              {getTimeLabel(currentHour)}
            </span>
            <br />
            <span
              style={{
                color: 'rgba(255,165,0,0.8)',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              {getPeriodLabel(currentHour)}
            </span>
          </div>

          {/* Slider */}
          <input
            type="range"
            min="0"
            max="24"
            step="0.25"
            value={currentHour}
            onChange={(e) => updateSunPosition(parseFloat(e.target.value))}
            className="sun-slider"
            style={{
              width: '100%',
              height: '6px',
              borderRadius: '3px',
              outline: 'none',
              cursor: 'pointer',
              accentColor: '#FFA500',
              background:
                'linear-gradient(to right, #1a1a3e, #1a1a3e, #FF6B35, #FFD700, #87CEEB, #87CEEB, #FFD700, #FF6B35, #1a1a3e)',
            }}
          />

          {/* Time labels */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '6px',
            }}
          >
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>00:00</span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>06:00</span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>12:00</span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>18:00</span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>24:00</span>
          </div>

          {/* Quick preset buttons */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              marginTop: '12px',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {[
              { label: '\u{1F305} Sunrise', hour: 6.5 },
              { label: '\u{2600}\u{FE0F} Noon', hour: 12 },
              { label: '\u{1F307} Sunset', hour: 18.5 },
              { label: '\u{1F319} Night', hour: 22 },
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => updateSunPosition(preset.hour)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  background:
                    Math.abs(currentHour - preset.hour) < 1
                      ? 'rgba(255,165,0,0.3)'
                      : 'rgba(255,255,255,0.05)',
                  color: 'white',
                  fontSize: '11px',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
