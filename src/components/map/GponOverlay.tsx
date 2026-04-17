'use client';

import { useEffect, useRef } from 'react';
import * as Cesium from 'cesium';
import { useMapStore } from '@/store/mapStore';

interface Props {
  viewer: Cesium.Viewer | null;
}

interface GponGroup {
  color: string;
  lines: Record<string, { width: number; segs: number[][][] }>;
  points: { name: string; lon: number; lat: number }[];
  polygons: { fill: string; alpha: number; pts: number[][] }[];
}

interface GponData {
  groups: Record<string, GponGroup>;
}

export default function GponOverlay({ viewer }: Props) {
  const linePrimsRef = useRef<Cesium.GroundPolylinePrimitive[]>([]);
  const fillPrimsRef = useRef<Cesium.GroundPrimitive[]>([]);
  const pointDsRef = useRef<Cesium.CustomDataSource | null>(null);
  const dataLoadedRef = useRef(false);

  const showGpon = useMapStore((s) => s.showGpon);
  const showCommunication = useMapStore((s) => s.showCommunication);
  const activeMapId = useMapStore((s) => s.activeMapId);

  const visible = showGpon && showCommunication && activeMapId === 'nardaran';

  // Load once
  useEffect(() => {
    if (!viewer || viewer.isDestroyed() || activeMapId !== 'nardaran') return;

    if (visible && !dataLoadedRef.current) {
      dataLoadedRef.current = true;

      (async () => {
        try {
          const res = await fetch('/data/gpon-nardaran.json');
          const data: GponData = await res.json();
          if (viewer.isDestroyed()) return;

          const pointDs = new Cesium.CustomDataSource('gpon-points');

          for (const [groupName, group] of Object.entries(data.groups)) {
            const groupColor = Cesium.Color.fromCssColorString(group.color);

            // Lines
            for (const [color, lineGroup] of Object.entries(group.lines)) {
              const cesiumColor = Cesium.Color.fromCssColorString(color).withAlpha(0.9);
              const instances = lineGroup.segs
                .filter((pts) => pts.length >= 2)
                .map((pts, i) => {
                  try {
                    return new Cesium.GeometryInstance({
                      geometry: new Cesium.GroundPolylineGeometry({
                        positions: pts.map(([lon, lat]) => Cesium.Cartesian3.fromDegrees(lon, lat)),
                        width: Math.max(lineGroup.width || 2, 0.5),
                      }),
                      id: `gpon-${groupName}-line-${i}`,
                    });
                  } catch { return null; }
                })
                .filter(Boolean) as Cesium.GeometryInstance[];

              if (instances.length === 0) continue;

              const prim = new Cesium.GroundPolylinePrimitive({
                geometryInstances: instances,
                appearance: new Cesium.PolylineMaterialAppearance({
                  material: Cesium.Material.fromType('Color', { color: cesiumColor }),
                }),
                asynchronous: true,
              });
              viewer.scene.groundPrimitives.add(prim);
              linePrimsRef.current.push(prim);
            }

            // Points
            group.points.forEach((pt) => {
              pointDs.entities.add({
                position: Cesium.Cartesian3.fromDegrees(pt.lon, pt.lat),
                point: {
                  color: groupColor,
                  pixelSize: 6,
                  outlineColor: Cesium.Color.WHITE,
                  outlineWidth: 1,
                  heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                  disableDepthTestDistance: Number.POSITIVE_INFINITY,
                  scaleByDistance: new Cesium.NearFarScalar(300, 0.8, 3000, 0.15),
                },
                label: pt.name && !pt.name.startsWith('Marker') ? {
                  text: pt.name.replace(/\s*\[.*\]$/, ''),
                  font: 'bold 11px sans-serif',
                  fillColor: Cesium.Color.WHITE,
                  outlineColor: Cesium.Color.BLACK,
                  outlineWidth: 3,
                  style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                  pixelOffset: new Cesium.Cartesian2(0, -14),
                  scaleByDistance: new Cesium.NearFarScalar(300, 1.0, 6000, 0.3),
                  disableDepthTestDistance: Number.POSITIVE_INFINITY,
                  heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                } : undefined,
              });
            });

            // Polygons
            group.polygons.forEach((poly, i) => {
              if (poly.pts.length < 3) return;
              try {
                const fillColor = Cesium.Color.fromCssColorString(poly.fill).withAlpha(poly.alpha);
                const prim = new Cesium.GroundPrimitive({
                  geometryInstances: [new Cesium.GeometryInstance({
                    geometry: new Cesium.PolygonGeometry({
                      polygonHierarchy: new Cesium.PolygonHierarchy(
                        poly.pts.map(([lon, lat]) => Cesium.Cartesian3.fromDegrees(lon, lat))
                      ),
                    }),
                    id: `gpon-${groupName}-poly-${i}`,
                  })],
                  appearance: new Cesium.MaterialAppearance({
                    material: Cesium.Material.fromType('Color', { color: fillColor }),
                  }),
                  asynchronous: true,
                });
                viewer.scene.groundPrimitives.add(prim);
                fillPrimsRef.current.push(prim);
              } catch { /* skip */ }
            });
          }

          viewer.dataSources.add(pointDs);
          pointDsRef.current = pointDs;
          viewer.scene.requestRender();
        } catch (err) {
          console.warn('Failed to load GPON:', err);
        }
      })();
    }
  }, [viewer, visible, activeMapId]);

  // Toggle visibility
  useEffect(() => {
    if (!viewer || viewer.isDestroyed() || !dataLoadedRef.current) return;
    linePrimsRef.current.forEach((p) => { p.show = visible; });
    fillPrimsRef.current.forEach((p) => { p.show = visible; });
    if (pointDsRef.current) pointDsRef.current.show = visible;
    viewer.scene.requestRender();
  }, [viewer, visible]);

  // Cleanup
  useEffect(() => {
    if (!viewer || viewer.isDestroyed()) return;
    if ((activeMapId !== 'nardaran' || !showCommunication) && dataLoadedRef.current) destroyAll();
  }, [viewer, activeMapId, showCommunication]);

  useEffect(() => { return () => { destroyAll(); }; }, [viewer]);

  function destroyAll() {
    if (!viewer || viewer.isDestroyed()) return;
    linePrimsRef.current.forEach((p) => { if (!viewer.isDestroyed()) viewer.scene.groundPrimitives.remove(p); });
    fillPrimsRef.current.forEach((p) => { if (!viewer.isDestroyed()) viewer.scene.groundPrimitives.remove(p); });
    linePrimsRef.current = [];
    fillPrimsRef.current = [];
    if (pointDsRef.current && !viewer.isDestroyed()) { viewer.dataSources.remove(pointDsRef.current, true); pointDsRef.current = null; }
    dataLoadedRef.current = false;
  }

  return null;
}
