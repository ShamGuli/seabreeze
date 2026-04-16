'use client';

import { useEffect, useRef } from 'react';
import * as Cesium from 'cesium';
import { useMapStore } from '@/store/mapStore';

interface Props {
  viewer: Cesium.Viewer | null;
}

interface LineGroup {
  width: number;
  segs: number[][][];
}

interface PolyGroup {
  fill: string;
  fillAlpha: number;
  stroke: string;
  strokeAlpha: number;
  rings: number[][][];
}

interface BasePlanData {
  lines: Record<string, LineGroup>;
  polygons: PolyGroup[];
  labels: { name: string; lon: number; lat: number }[];
}

export default function CharvakBasePlan({ viewer }: Props) {
  const primitivesRef = useRef<(Cesium.GroundPolylinePrimitive | Cesium.GroundPrimitive)[]>([]);
  const labelDsRef = useRef<Cesium.CustomDataSource | null>(null);
  const loadedRef = useRef(false);
  const showBasePlan = useMapStore((s) => s.showBasePlan);
  const activeMapId = useMapStore((s) => s.activeMapId);

  useEffect(() => {
    if (!viewer || viewer.isDestroyed() || activeMapId !== 'charvak') return;

    if (showBasePlan && !loadedRef.current) {
      loadedRef.current = true;

      (async () => {
        try {
          const res = await fetch('/data/baseplan-charvak.json');
          const data: BasePlanData = await res.json();
          if (viewer.isDestroyed()) return;

          // ── Lines ──
          for (const [color, group] of Object.entries(data.lines)) {
            const cesiumColor = Cesium.Color.fromCssColorString(color).withAlpha(0.9);
            const instances = group.segs.map((pts, i) =>
              new Cesium.GeometryInstance({
                geometry: new Cesium.GroundPolylineGeometry({
                  positions: pts.map(([lon, lat]) => Cesium.Cartesian3.fromDegrees(lon, lat)),
                  width: group.width || 2.0,
                }),
                id: `charvak-line-${color}-${i}`,
              })
            );
            if (instances.length === 0) continue;

            const prim = new Cesium.GroundPolylinePrimitive({
              geometryInstances: instances,
              appearance: new Cesium.PolylineMaterialAppearance({
                material: Cesium.Material.fromType('Color', { color: cesiumColor }),
              }),
              asynchronous: true,
            });
            viewer.scene.groundPrimitives.add(prim);
            primitivesRef.current.push(prim);
          }

          // ── Polygons ──
          for (const group of data.polygons) {
            if (group.fillAlpha <= 0.01) continue; // skip transparent

            const fillColor = Cesium.Color.fromCssColorString(group.fill).withAlpha(group.fillAlpha);

            const instances = group.rings.map((pts, i) => {
              try {
                return new Cesium.GeometryInstance({
                  geometry: new Cesium.PolygonGeometry({
                    polygonHierarchy: new Cesium.PolygonHierarchy(
                      pts.map(([lon, lat]) => Cesium.Cartesian3.fromDegrees(lon, lat))
                    ),
                  }),
                  id: `charvak-poly-${group.fill}-${i}`,
                });
              } catch { return null; }
            }).filter(Boolean) as Cesium.GeometryInstance[];

            if (instances.length === 0) continue;

            try {
              const prim = new Cesium.GroundPrimitive({
                geometryInstances: instances,
                appearance: new Cesium.MaterialAppearance({
                  material: Cesium.Material.fromType('Color', { color: fillColor }),
                }),
                asynchronous: true,
              });
              viewer.scene.groundPrimitives.add(prim);
              primitivesRef.current.push(prim);
            } catch (err) {
              console.warn('Polygon primitive error:', err);
            }
          }

          // ── Labels ──
          const labelDs = new Cesium.CustomDataSource('charvak-bp-labels');
          data.labels.forEach(({ name, lon, lat }) => {
            labelDs.entities.add({
              position: Cesium.Cartesian3.fromDegrees(lon, lat, 0),
              label: {
                text: name,
                font: 'bold 14px sans-serif',
                fillColor: Cesium.Color.WHITE,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 3,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                scaleByDistance: new Cesium.NearFarScalar(500, 1.2, 8000, 0.4),
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                verticalOrigin: Cesium.VerticalOrigin.CENTER,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
              },
            });
          });
          viewer.dataSources.add(labelDs);
          labelDsRef.current = labelDs;

          viewer.scene.requestRender();
          console.log(`Charvak BasePlan: ${primitivesRef.current.length} primitives, ${data.labels.length} labels`);
        } catch (err) {
          console.warn('Failed to load Charvak base plan:', err);
        }
      })();
    } else if (!showBasePlan && loadedRef.current) {
      primitivesRef.current.forEach((p) => {
        if (!viewer.isDestroyed()) viewer.scene.groundPrimitives.remove(p);
      });
      primitivesRef.current = [];
      if (labelDsRef.current && !viewer.isDestroyed()) {
        viewer.dataSources.remove(labelDsRef.current, true);
        labelDsRef.current = null;
      }
      loadedRef.current = false;
      if (!viewer.isDestroyed()) viewer.scene.requestRender();
    }
  }, [viewer, showBasePlan, activeMapId]);

  // Cleanup on map change
  useEffect(() => {
    if (!viewer || viewer.isDestroyed()) return;
    if (activeMapId !== 'charvak' && loadedRef.current) {
      primitivesRef.current.forEach((p) => {
        if (!viewer.isDestroyed()) viewer.scene.groundPrimitives.remove(p);
      });
      primitivesRef.current = [];
      if (labelDsRef.current) {
        viewer.dataSources.remove(labelDsRef.current, true);
        labelDsRef.current = null;
      }
      loadedRef.current = false;
    }
  }, [viewer, activeMapId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (viewer && !viewer.isDestroyed()) {
        primitivesRef.current.forEach((p) => viewer.scene.groundPrimitives.remove(p));
        if (labelDsRef.current) viewer.dataSources.remove(labelDsRef.current, true);
        primitivesRef.current = [];
        labelDsRef.current = null;
      }
    };
  }, [viewer]);

  return null;
}
