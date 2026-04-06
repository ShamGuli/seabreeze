'use client';

import { useEffect, useState } from 'react';

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    // Wait for globe tiles to start loading, then fade out
    const timer = setTimeout(() => {
      setOpacity(0);
      setTimeout(() => setVisible(false), 600);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: '#0a0a1a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        opacity,
        transition: 'opacity 0.6s ease-out',
        pointerEvents: opacity === 0 ? 'none' : 'auto',
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: 32,
          fontWeight: 300,
          color: 'white',
          letterSpacing: 6,
          textTransform: 'uppercase',
        }}
      >
        Sea Breeze
      </h1>
      <p
        style={{
          margin: 0,
          fontSize: 13,
          color: 'rgba(255,255,255,0.5)',
          letterSpacing: 2,
        }}
      >
        Interactive Resort Map
      </p>
      <div
        style={{
          width: 200,
          height: 2,
          background: 'rgba(255,255,255,0.1)',
          borderRadius: 1,
          overflow: 'hidden',
          marginTop: 8,
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, #3B82F6, #06B6D4)',
            animation: 'loading-bar 2s ease-in-out infinite',
            transformOrigin: 'left',
          }}
        />
      </div>
      <style>{`
        @keyframes loading-bar {
          0% { transform: scaleX(0); }
          50% { transform: scaleX(1); }
          100% { transform: scaleX(0); transform-origin: right; }
        }
      `}</style>
    </div>
  );
}
