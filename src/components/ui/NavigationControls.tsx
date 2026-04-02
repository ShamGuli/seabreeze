'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import * as Cesium from 'cesium';
import { useMapStore } from '@/store/mapStore';

interface NavigationControlsProps {
  viewer: Cesium.Viewer | null;
}

export default function NavigationControls({ viewer }: NavigationControlsProps) {
  const [isOrbiting, setIsOrbiting] = useState(false);
  const orbitRef = useRef(false);
  const is3D = useMapStore((s) => s.is3D);
  const is3DLoading = useMapStore((s) => s.is3DLoading);
  const setIs3D = useMapStore((s) => s.setIs3D);

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

  // ── 3D Orbit animasiya ──
  const startOrbit = useCallback(() => {
    if (!viewer || orbitRef.current) return;
    orbitRef.current = true;
    setIsOrbiting(true);

    const canvas = viewer.scene.canvas;
    const centerPixel = new Cesium.Cartesian2(canvas.clientWidth / 2, canvas.clientHeight / 2);
    let center: Cesium.Cartesian3 | undefined = viewer.scene.pickPosition(centerPixel);
    if (!center || !Cesium.defined(center)) {
      center = viewer.camera.pickEllipsoid(centerPixel, viewer.scene.globe.ellipsoid) ?? undefined;
    }
    if (!center) {
      center = Cesium.Cartesian3.fromDegrees(49.950, 40.584, 0);
    }
    const orbitCenter = center;

    let heading = viewer.camera.heading;
    const pitch = viewer.camera.pitch;
    const range = Cesium.Cartesian3.distance(viewer.camera.position, orbitCenter);

    function orbitStep() {
      if (!orbitRef.current || !viewer || viewer.isDestroyed()) {
        setIsOrbiting(false);
        return;
      }
      heading += Cesium.Math.toRadians(0.3);
      viewer.camera.lookAt(
        orbitCenter,
        new Cesium.HeadingPitchRange(heading, pitch, range)
      );
      viewer.scene.requestRender();
      requestAnimationFrame(orbitStep);
    }

    viewer.camera.lookAt(
      orbitCenter,
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

  // ── Helper: ekranın mərkəzindəki yer nöqtəsini tap ──
  const pickViewCenter = useCallback((): Cesium.Cartesian3 | null => {
    if (!viewer) return null;
    const canvas = viewer.scene.canvas;
    const center = new Cesium.Cartesian2(canvas.clientWidth / 2, canvas.clientHeight / 2);
    // Əvvəlcə scene pick, sonra ellipsoid pick
    const picked = viewer.scene.pickPosition(center);
    if (picked && Cesium.defined(picked)) return picked;
    const ellipsoidPick = viewer.camera.pickEllipsoid(center, viewer.scene.globe.ellipsoid);
    return ellipsoidPick ?? null;
  }, [viewer]);

  // ── 2D/3D Toggle ──
  const toggle3D = useCallback(() => {
    if (!viewer || is3DLoading) return;

    const target = pickViewCenter();
    // Fallback: resort mərkəzi
    const flyTarget = target ?? Cesium.Cartesian3.fromDegrees(49.950, 40.584, 0);

    // flyToBoundingSphere kameranı kilidləyir — bitəndə transform sıfırla
    const unlockCamera = () => {
      viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
      viewer.scene.requestRender();
    };

    if (is3D) {
      // 3D → 2D
      if (isOrbiting) stopOrbit();
      setIs3D(false);
      const cart = viewer.scene.globe.ellipsoid.cartesianToCartographic(viewer.camera.position);
      viewer.camera.flyToBoundingSphere(
        new Cesium.BoundingSphere(flyTarget, 0),
        {
          offset: new Cesium.HeadingPitchRange(
            Cesium.Math.toRadians(0),
            Cesium.Math.toRadians(-90),
            Math.max(cart.height, 3000)
          ),
          duration: 1.5,
          complete: unlockCamera,
        }
      );
    } else {
      // 2D → 3D
      setIs3D(true);
      const cart = viewer.scene.globe.ellipsoid.cartesianToCartographic(viewer.camera.position);
      viewer.camera.flyToBoundingSphere(
        new Cesium.BoundingSphere(flyTarget, 0),
        {
          offset: new Cesium.HeadingPitchRange(
            Cesium.Math.toRadians(0),
            Cesium.Math.toRadians(-45),
            Math.min(cart.height, 2000)
          ),
          duration: 1.5,
          complete: unlockCamera,
        }
      );
    }
  }, [viewer, is3D, is3DLoading, isOrbiting, stopOrbit, setIs3D, pickViewCenter]);

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
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {/* Drone body */}
          <rect x="9" y="9" width="6" height="6" rx="2" />
          {/* Arms */}
          <line x1="10" y1="10" x2="5" y2="5" />
          <line x1="14" y1="10" x2="19" y2="5" />
          <line x1="10" y1="14" x2="5" y2="19" />
          <line x1="14" y1="14" x2="19" y2="19" />
          {/* Propellers */}
          <circle cx="5" cy="5" r="2.5" />
          <circle cx="19" cy="5" r="2.5" />
          <circle cx="5" cy="19" r="2.5" />
          <circle cx="19" cy="19" r="2.5" />
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

      {/* 2D/3D Toggle */}
      <button
        onClick={toggle3D}
        style={{
          ...btnStyle,
          marginTop: 4,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.5px',
          background: is3D ? 'rgba(0,150,255,0.5)' : 'rgba(15, 15, 30, 0.85)',
          opacity: is3DLoading ? 0.6 : 1,
          pointerEvents: is3DLoading ? 'none' : 'auto',
        }}
        onMouseEnter={e => { if (!is3D && !is3DLoading) e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
        onMouseLeave={e => { if (!is3D) e.currentTarget.style.background = 'rgba(15, 15, 30, 0.85)'; }}
        title={is3D ? '2D görünüşə keç' : '3D görünüşə keç'}
      >
        {is3DLoading ? '...' : is3D ? '2D' : '3D'}
      </button>
    </div>
  );
}
