'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import * as Cesium from 'cesium';

interface NavigationControlsProps {
  viewer: Cesium.Viewer | null;
}

export default function NavigationControls({ viewer }: NavigationControlsProps) {
  const [isOrbiting, setIsOrbiting] = useState(false);
  const orbitRef = useRef(false);

  // ── Zoom ──
  const zoom = useCallback((inOut: 'in' | 'out') => {
    if (!viewer) return;
    const camera = viewer.camera;
    const ellipsoid = viewer.scene.globe.ellipsoid;
    const cameraHeight = ellipsoid.cartesianToCartographic(camera.position).height;
    const moveRate = cameraHeight / 4.0;
    if (inOut === 'in') {
      camera.moveForward(moveRate);
    } else {
      camera.moveBackward(moveRate);
    }
    viewer.scene.requestRender();
  }, [viewer]);

  // ── 3D Orbit animasiya — kameranın baxdığı nöqtə ətrafında ──
  const startOrbit = useCallback(() => {
    if (!viewer || orbitRef.current) return;
    orbitRef.current = true;
    setIsOrbiting(true);

    // Ekranın mərkəzindəki nöqtəni tap (kamera hara baxırsa)
    const canvas = viewer.scene.canvas;
    const centerPixel = new Cesium.Cartesian2(canvas.clientWidth / 2, canvas.clientHeight / 2);
    let center = viewer.scene.pickPosition(centerPixel);
    if (!center || !Cesium.defined(center)) {
      center = viewer.camera.pickEllipsoid(centerPixel, viewer.scene.globe.ellipsoid);
    }
    if (!center) {
      // Fallback: layihənin mərkəzi
      center = Cesium.Cartesian3.fromDegrees(49.950, 40.584, 0);
    }

    let heading = viewer.camera.heading;
    const pitch = viewer.camera.pitch;
    const range = Cesium.Cartesian3.distance(viewer.camera.position, center);

    function orbitStep() {
      if (!orbitRef.current || !viewer || viewer.isDestroyed()) {
        setIsOrbiting(false);
        return;
      }
      heading += Cesium.Math.toRadians(0.3);
      viewer.camera.lookAt(
        center!,
        new Cesium.HeadingPitchRange(heading, pitch, range)
      );
      viewer.scene.requestRender();
      requestAnimationFrame(orbitStep);
    }

    viewer.camera.lookAt(
      center,
      new Cesium.HeadingPitchRange(heading, pitch, range)
    );
    requestAnimationFrame(orbitStep);
  }, [viewer]);

  const stopOrbit = useCallback(() => {
    orbitRef.current = false;
    setIsOrbiting(false);
    if (viewer && !viewer.isDestroyed()) {
      viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
      viewer.scene.requestRender();
    }
  }, [viewer]);

  useEffect(() => {
    return () => { orbitRef.current = false; };
  }, []);

  const btnStyle: React.CSSProperties = {
    width: 36,
    height: 36,
    borderRadius: '50%',
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(15, 15, 30, 0.85)',
    backdropFilter: 'blur(10px)',
    color: 'white',
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s',
  };

  return (
    <div style={{
      position: 'absolute',
      top: 60,
      right: 16,
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 4,
    }}>
      <button
        onClick={() => zoom('in')}
        style={btnStyle}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(15, 15, 30, 0.85)'}
      >
        +
      </button>

      <button
        onClick={isOrbiting ? stopOrbit : startOrbit}
        style={{
          ...btnStyle,
          background: isOrbiting ? 'rgba(0,150,255,0.5)' : 'rgba(15, 15, 30, 0.85)',
        }}
        onMouseEnter={e => { if (!isOrbiting) e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
        onMouseLeave={e => { if (!isOrbiting) e.currentTarget.style.background = 'rgba(15, 15, 30, 0.85)'; }}
        title="3D Orbit"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      </button>

      <button
        onClick={() => zoom('out')}
        style={btnStyle}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(15, 15, 30, 0.85)'}
      >
        −
      </button>
    </div>
  );
}
