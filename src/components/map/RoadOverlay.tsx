'use client';

import { useEffect, useRef } from 'react';
import * as Cesium from 'cesium';
import { useMapStore } from '@/store/mapStore';

interface RoadOverlayProps {
  viewer: Cesium.Viewer | null;
}

interface RoadData {
  [color: string]: number[][][]; // color → array of polylines → array of [lon,lat]
}

export default function RoadOverlay({ viewer }: RoadOverlayProps) {
  const primitivesRef = useRef<Cesium.GroundPolylinePrimitive[]>([]);
  const loadedRef = useRef(false);
  const showBasePlan = useMapStore((s) => s.showBasePlan);
  const showRoads = useMapStore((s) => s.showRoads);
  const activeMapId = useMapStore((s) => s.activeMapId);

  // Load road data and create primitives
  useEffect(() => {
    if (!viewer || viewer.isDestroyed() || activeMapId !== 'nardaran') return;

    if (showBasePlan && showRoads && !loadedRef.current) {
      loadedRef.current = true;

      (async () => {
        try {
          const res = await fetch('/data/roads-nardaran.json');
          const data: RoadData = await res.json();

          if (viewer.isDestroyed()) return;

          for (const [color, polylines] of Object.entries(data)) {
            const cesiumColor = Cesium.Color.fromCssColorString(color).withAlpha(0.9);

            // Create one primitive per color with material
            const instances: Cesium.GeometryInstance[] = polylines.map((pts, i) =>
              new Cesium.GeometryInstance({
                geometry: new Cesium.GroundPolylineGeometry({
                  positions: pts.map(([lon, lat]) =>
                    Cesium.Cartesian3.fromDegrees(lon, lat)
                  ),
                  width: 3.0,
                }),
                id: `road-${color}-${i}`,
              })
            );

            if (instances.length === 0) continue;

            const primitive = new Cesium.GroundPolylinePrimitive({
              geometryInstances: instances,
              appearance: new Cesium.PolylineMaterialAppearance({
                material: Cesium.Material.fromType('Color', {
                  color: cesiumColor,
                }),
              }),
              asynchronous: true,
            });

            viewer.scene.groundPrimitives.add(primitive);
            primitivesRef.current.push(primitive);
          }

          viewer.scene.requestRender();
          console.log(`Roads loaded: ${primitivesRef.current.length} color groups`);
        } catch (err) {
          console.warn('Failed to load roads:', err);
        }
      })();
    } else if ((!showBasePlan || !showRoads) && loadedRef.current) {
      primitivesRef.current.forEach((p) => {
        if (!viewer.isDestroyed()) viewer.scene.groundPrimitives.remove(p);
      });
      primitivesRef.current = [];
      loadedRef.current = false;
      if (!viewer.isDestroyed()) viewer.scene.requestRender();
    }
  }, [viewer, showBasePlan, showRoads, activeMapId]);

  // Cleanup on map change
  useEffect(() => {
    if (!viewer || viewer.isDestroyed()) return;
    if (activeMapId !== 'nardaran' && loadedRef.current) {
      primitivesRef.current.forEach((p) => {
        if (!viewer.isDestroyed()) viewer.scene.groundPrimitives.remove(p);
      });
      primitivesRef.current = [];
      loadedRef.current = false;
    }
  }, [viewer, activeMapId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (viewer && !viewer.isDestroyed()) {
        primitivesRef.current.forEach((p) => viewer.scene.groundPrimitives.remove(p));
        primitivesRef.current = [];
      }
    };
  }, [viewer]);

  return null;
}
