'use client';

import { useRef } from 'react';
import * as Cesium from 'cesium';
import { useLang } from '@/context/LanguageContext';

interface MyLocationButtonProps {
  viewer: Cesium.Viewer | null;
}

export default function MyLocationButton({ viewer }: MyLocationButtonProps) {
  const { t } = useLang();
  const locationEntityRef = useRef<Cesium.Entity | null>(null);

  function handleMyLocation() {
    if (!viewer || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        // Kamera — birbaşa yuxarıdan bax, marker mərkəzdə olsun
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(lng, lat, 500),
          orientation: {
            heading: 0.0,
            pitch: Cesium.Math.toRadians(-90),
            roll: 0.0,
          },
          duration: 2.0,
          complete: function () {
            viewer.camera.flyTo({
              destination: Cesium.Cartesian3.fromDegrees(lng, lat, 400),
              orientation: {
                heading: 0.0,
                pitch: Cesium.Math.toRadians(-60),
                roll: 0.0,
              },
              duration: 1.5,
            });
          },
        });

        // Əvvəlki marker varsa sil
        if (locationEntityRef.current) {
          viewer.entities.remove(locationEntityRef.current);
          locationEntityRef.current = null;
        }

        // Ana marker — mavi nöqtə
        const entity = viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(lng, lat),
          point: {
            pixelSize: 14,
            color: Cesium.Color.fromCssColorString('#4285F4'),
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 3,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
        });

        locationEntityRef.current = entity;

        // Pulsing ring-lər — 3 dənə dalğa
        const rings = [{ delay: 0 }, { delay: 1000 }, { delay: 2000 }];

        rings.forEach((ring) => {
          setTimeout(() => {
            let size = 10.0;
            const ringEntity = viewer.entities.add({
              position: Cesium.Cartesian3.fromDegrees(lng, lat),
              ellipse: {
                semiMinorAxis: size,
                semiMajorAxis: size,
                material: Cesium.Color.fromCssColorString('#4285F4').withAlpha(0.4),
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                classificationType: Cesium.ClassificationType.BOTH,
              },
            });

            const pulseTimer = setInterval(() => {
              size += 3;
              if (size > 150) {
                size = 10.0;
              }
              const alpha = 0.4 * (1.0 - size / 150.0);

              if (ringEntity.ellipse) {
                (ringEntity.ellipse.semiMinorAxis as any) = new Cesium.ConstantProperty(size);
                (ringEntity.ellipse.semiMajorAxis as any) = new Cesium.ConstantProperty(size);
                (ringEntity.ellipse.material as any) = new Cesium.ColorMaterialProperty(
                  Cesium.Color.fromCssColorString('#4285F4').withAlpha(alpha)
                );
              }
            }, 50);

            // 30 saniyə sonra ring-ləri dayandır
            setTimeout(() => {
              clearInterval(pulseTimer);
              if (!viewer.isDestroyed()) {
                viewer.entities.remove(ringEntity);
              }
            }, 30000);
          }, ring.delay);
        });
      },
      (error) => {
        console.error('Location error:', error);
        alert(t('locationDenied'));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <button
      onClick={handleMyLocation}
      style={{
        position: 'absolute',
        bottom: '30px',
        left: '16px',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.15)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        transition: 'background 0.2s ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(66,133,244,0.5)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.7)')}
      title={t('myLocation')}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7" stroke="white" strokeWidth="1.5" fill="none" />
        <circle cx="10" cy="10" r="2" fill="white" />
        <line x1="10" y1="0" x2="10" y2="4" stroke="white" strokeWidth="1.5" />
        <line x1="10" y1="16" x2="10" y2="20" stroke="white" strokeWidth="1.5" />
        <line x1="0" y1="10" x2="4" y2="10" stroke="white" strokeWidth="1.5" />
        <line x1="16" y1="10" x2="20" y2="10" stroke="white" strokeWidth="1.5" />
      </svg>
    </button>
  );
}
