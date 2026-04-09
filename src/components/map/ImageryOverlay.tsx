'use client';

import { useEffect, useRef } from 'react';
import * as Cesium from 'cesium';
import { useMapStore } from '@/store/mapStore';
import { getMapConfig } from '@/data/mapConfigs';

interface ImageryOverlayProps {
  viewer: Cesium.Viewer | null;
}

export default function ImageryOverlay({ viewer }: ImageryOverlayProps) {
  const layersRef = useRef<Cesium.ImageryLayer[]>([]);
  const loadedForMapRef = useRef<string | null>(null);
  const showBasePlan = useMapStore((s) => s.showBasePlan);
  const activeMapId = useMapStore((s) => s.activeMapId);

  // Cleanup layers when map changes
  useEffect(() => {
    if (!viewer || viewer.isDestroyed()) return;

    if (loadedForMapRef.current && loadedForMapRef.current !== activeMapId) {
      layersRef.current.forEach((layer) => {
        if (!viewer.isDestroyed()) {
          viewer.imageryLayers.remove(layer, true);
        }
      });
      layersRef.current = [];
      loadedForMapRef.current = null;
      viewer.scene.requestRender();
    }
  }, [viewer, activeMapId]);

  useEffect(() => {
    if (!viewer || viewer.isDestroyed()) return;

    const config = getMapConfig(activeMapId);

    if (showBasePlan && layersRef.current.length === 0) {
      if (!config.basePlanToken || config.basePlanAssetIds.length === 0) return;

      loadedForMapRef.current = activeMapId;

      config.basePlanAssetIds.forEach(async (assetId) => {
        try {
          const provider = await Cesium.IonImageryProvider.fromAssetId(assetId, {
            accessToken: config.basePlanToken,
          });
          if (viewer.isDestroyed()) return;
          const layer = viewer.imageryLayers.addImageryProvider(provider);
          layer.alpha = 0.85;
          layersRef.current.push(layer);
          viewer.scene.requestRender();
        } catch (err) {
          console.warn(`Failed to load base plan asset ${assetId}:`, err);
        }
      });
    } else if (!showBasePlan && layersRef.current.length > 0) {
      layersRef.current.forEach((layer) => {
        if (!viewer.isDestroyed()) {
          viewer.imageryLayers.remove(layer, true);
        }
      });
      layersRef.current = [];
      loadedForMapRef.current = null;
      if (!viewer.isDestroyed()) viewer.scene.requestRender();
    }
  }, [viewer, showBasePlan, activeMapId]);

  useEffect(() => {
    return () => {
      if (viewer && !viewer.isDestroyed()) {
        layersRef.current.forEach((layer) => {
          viewer.imageryLayers.remove(layer, true);
        });
        layersRef.current = [];
      }
    };
  }, [viewer]);

  return null;
}
