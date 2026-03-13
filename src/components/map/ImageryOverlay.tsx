'use client';

import { useEffect, useRef, useState } from 'react';
import * as Cesium from 'cesium';

interface ImageryOverlayProps {
  viewer: Cesium.Viewer | null;
}

// Rotated corner coordinates matching the resort's actual orientation
const OVERLAY_CORNERS = Cesium.Cartesian3.fromDegreesArray([
  49.900, 40.570,  // SW
  49.993, 40.582,  // SE
  49.985, 40.596,  // NE
  49.892, 40.584,  // NW
]);

export default function ImageryOverlay({ viewer }: ImageryOverlayProps) {
  const entityRef = useRef<Cesium.Entity | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!viewer || entityRef.current) return;

    const entity = viewer.entities.add({
      polygon: {
        hierarchy: new Cesium.PolygonHierarchy(OVERLAY_CORNERS),
        material: new Cesium.ImageMaterialProperty({
          image: '/textures/master-plan-rotated.webp',
          transparent: true,
        }),
        classificationType: Cesium.ClassificationType.BOTH,
        stRotation: 0,
      },
      show: false,
    });

    entityRef.current = entity;

    return () => {
      if (entityRef.current && viewer && !viewer.isDestroyed()) {
        viewer.entities.remove(entityRef.current);
        entityRef.current = null;
      }
    };
  }, [viewer]);

  useEffect(() => {
    if (entityRef.current) {
      entityRef.current.show = visible;
    }
  }, [visible]);

  return (
    <button
      onClick={() => setVisible((v) => !v)}
      style={{
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 10,
        padding: '8px 16px',
        borderRadius: 8,
        border: 'none',
        background: visible ? '#3B82F6' : 'rgba(30, 30, 50, 0.85)',
        color: 'white',
        fontSize: 14,
        fontWeight: 500,
        cursor: 'pointer',
        backdropFilter: 'blur(8px)',
        transition: 'background 0.2s',
      }}
    >
      {visible ? 'Hide Master Plan' : 'Show Master Plan'}
    </button>
  );
}
