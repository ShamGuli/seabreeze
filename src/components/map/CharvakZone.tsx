'use client';

import { useEffect, useRef, useState } from 'react';
import * as Cesium from 'cesium';
import { useMapStore } from '@/store/mapStore';

interface Props {
  viewer: Cesium.Viewer | null;
}

interface ZonePoly {
  fill: string;
  fillAlpha: number;
  stroke: string;
  strokeWidth: number;
  name: string;
  pts: number[][];
}

interface ZoneTooltip {
  name: string;
  color: string;
  screenX: number;
  screenY: number;
}

// Color legend for zone types
const ZONE_COLORS: Record<string, string> = {
  '#ff0000': '#EF4444',
  '#ffff00': '#EAB308',
  '#00ffc5': '#2DD4BF',
  '#70a800': '#84CC16',
  '#005ce6': '#3B82F6',
  '#a83800': '#B45309',
  '#ff00c5': '#EC4899',
  '#000000': '#6B7280',
};

export default function CharvakZone({ viewer }: Props) {
  const primitivesRef = useRef<Cesium.GroundPrimitive[]>([]);
  const outlineRef = useRef<Cesium.GroundPolylinePrimitive[]>([]);
  const handlerRef = useRef<Cesium.ScreenSpaceEventHandler | null>(null);
  const renderListenerRef = useRef<(() => void) | null>(null);
  const zoneMapRef = useRef<Map<string, { name: string; fill: string; center: Cesium.Cartesian3 }>>(new Map());
  const tooltipWorldRef = useRef<Cesium.Cartesian3 | null>(null);
  const loadedRef = useRef(false);
  const showZone = useMapStore((s) => s.showZone);
  const activeMapId = useMapStore((s) => s.activeMapId);
  const [tooltip, setTooltip] = useState<ZoneTooltip | null>(null);

  useEffect(() => {
    if (!viewer || viewer.isDestroyed() || activeMapId !== 'charvak') return;

    if (showZone && !loadedRef.current) {
      loadedRef.current = true;

      (async () => {
        try {
          const res = await fetch('/data/zona-charvak.json');
          const data: ZonePoly[] = await res.json();
          if (viewer.isDestroyed()) return;

          const groups: Record<string, { color: Cesium.Color; instances: Cesium.GeometryInstance[] }> = {};

          data.forEach((poly, i) => {
            const positions = poly.pts.map(([lon, lat]) => Cesium.Cartesian3.fromDegrees(lon, lat));
            if (positions.length < 3) return;

            const fillColor = Cesium.Color.fromCssColorString(poly.fill).withAlpha(poly.fillAlpha);
            const key = poly.fill + '|' + poly.fillAlpha;
            if (!groups[key]) groups[key] = { color: fillColor, instances: [] };

            const instanceId = `zone-${i}`;

            try {
              groups[key].instances.push(
                new Cesium.GeometryInstance({
                  geometry: new Cesium.PolygonGeometry({
                    polygonHierarchy: new Cesium.PolygonHierarchy(positions),
                  }),
                  id: instanceId,
                })
              );
            } catch { return; }

            // Store zone data for click lookup
            if (poly.name && !poly.name.match(/^\d/)) {
              let sumLon = 0, sumLat = 0;
              poly.pts.forEach(([lon, lat]) => { sumLon += lon; sumLat += lat; });
              const center = Cesium.Cartesian3.fromDegrees(sumLon / poly.pts.length, sumLat / poly.pts.length);
              zoneMapRef.current.set(instanceId, { name: poly.name, fill: poly.fill, center });
            }

            // Outline
            try {
              const outlinePositions = [...positions, positions[0]];
              const outlinePrim = new Cesium.GroundPolylinePrimitive({
                geometryInstances: [new Cesium.GeometryInstance({
                  geometry: new Cesium.GroundPolylineGeometry({
                    positions: outlinePositions,
                    width: poly.strokeWidth || 1,
                  }),
                  id: `zone-outline-${i}`,
                })],
                appearance: new Cesium.PolylineMaterialAppearance({
                  material: Cesium.Material.fromType('Color', {
                    color: Cesium.Color.fromCssColorString(poly.stroke).withAlpha(0.8),
                  }),
                }),
                asynchronous: true,
              });
              viewer.scene.groundPrimitives.add(outlinePrim);
              outlineRef.current.push(outlinePrim);
            } catch { /* skip */ }
          });

          // Create fill primitives
          for (const group of Object.values(groups)) {
            if (group.instances.length === 0) continue;
            try {
              const prim = new Cesium.GroundPrimitive({
                geometryInstances: group.instances,
                appearance: new Cesium.MaterialAppearance({
                  material: Cesium.Material.fromType('Color', { color: group.color }),
                }),
                asynchronous: true,
              });
              viewer.scene.groundPrimitives.add(prim);
              primitivesRef.current.push(prim);
            } catch (err) {
              console.warn('Zone primitive error:', err);
            }
          }

          // Click handler
          const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
          handler.setInputAction((click: { position: Cesium.Cartesian2 }) => {
            const picked = viewer.scene.pick(click.position);

            if (Cesium.defined(picked) && picked.id && typeof picked.id === 'string') {
              const zone = zoneMapRef.current.get(picked.id);
              if (zone) {
                tooltipWorldRef.current = zone.center;
                const sp = Cesium.SceneTransforms.worldToWindowCoordinates(viewer.scene, zone.center);
                if (sp) {
                  setTooltip({ name: zone.name, color: zone.fill, screenX: sp.x, screenY: sp.y });
                }
                viewer.scene.requestRender();
                return;
              }
            }

            // Click outside — close tooltip
            if (tooltip || tooltipWorldRef.current) {
              setTooltip(null);
              tooltipWorldRef.current = null;
            }
          }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
          handlerRef.current = handler;

          // Track tooltip position on camera move
          const onPostRender = () => {
            if (!tooltipWorldRef.current || viewer.isDestroyed()) return;
            const sp = Cesium.SceneTransforms.worldToWindowCoordinates(viewer.scene, tooltipWorldRef.current);
            if (sp) {
              setTooltip(prev => prev ? { ...prev, screenX: sp.x, screenY: sp.y } : null);
            }
          };
          viewer.scene.postRender.addEventListener(onPostRender);
          renderListenerRef.current = onPostRender;

          viewer.scene.requestRender();
        } catch (err) {
          console.warn('Failed to load Charvak zone:', err);
        }
      })();
    } else if (!showZone && loadedRef.current) {
      cleanup();
    }
  }, [viewer, showZone, activeMapId]);

  function cleanup() {
    if (!viewer || viewer.isDestroyed()) return;
    primitivesRef.current.forEach((p) => { if (!viewer.isDestroyed()) viewer.scene.groundPrimitives.remove(p); });
    outlineRef.current.forEach((p) => { if (!viewer.isDestroyed()) viewer.scene.groundPrimitives.remove(p); });
    primitivesRef.current = [];
    outlineRef.current = [];
    zoneMapRef.current.clear();
    if (handlerRef.current) { handlerRef.current.destroy(); handlerRef.current = null; }
    if (renderListenerRef.current) { viewer.scene.postRender.removeEventListener(renderListenerRef.current); renderListenerRef.current = null; }
    setTooltip(null);
    tooltipWorldRef.current = null;
    loadedRef.current = false;
    if (!viewer.isDestroyed()) viewer.scene.requestRender();
  }

  // Cleanup on map change
  useEffect(() => {
    if (!viewer || viewer.isDestroyed()) return;
    if (activeMapId !== 'charvak' && loadedRef.current) cleanup();
  }, [viewer, activeMapId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { cleanup(); };
  }, [viewer]);

  if (!tooltip) return null;

  const dotColor = ZONE_COLORS[tooltip.color] || tooltip.color;

  return (
    <div
      style={{
        position: 'fixed',
        left: tooltip.screenX,
        top: tooltip.screenY,
        transform: 'translate(-50%, -100%) translateY(-14px)',
        pointerEvents: 'none',
        zIndex: 50,
      }}
    >
      <div
        style={{
          background: 'rgba(20, 20, 35, 0.92)',
          backdropFilter: 'blur(8px)',
          borderRadius: 10,
          padding: '10px 16px',
          color: '#fff',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          maxWidth: 280,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <div style={{
          width: 12, height: 12, borderRadius: '50%',
          background: dotColor, flexShrink: 0,
          border: '2px solid rgba(255,255,255,0.5)',
        }} />
        <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.3 }}>
          {tooltip.name}
        </div>
      </div>
      <div
        style={{
          width: 0, height: 0,
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: '8px solid rgba(20, 20, 35, 0.92)',
          margin: '0 auto',
        }}
      />
    </div>
  );
}
