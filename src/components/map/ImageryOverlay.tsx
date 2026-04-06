'use client';

import { useEffect, useRef } from 'react';
import * as Cesium from 'cesium';
import { useMapStore } from '@/store/mapStore';

interface ImageryOverlayProps {
  viewer: Cesium.Viewer | null;
}

const BASEPLAN_TOKEN = process.env.NEXT_PUBLIC_CESIUM_BASEPLAN_TOKEN || '';

// Cesium Ion imagery asset IDs for the base plan layers
const BASEPLAN_ASSET_IDS = [4594912, 4595054, 4595004, 4594980, 4599368];

export default function ImageryOverlay({ viewer }: ImageryOverlayProps) {
  const layersRef = useRef<Cesium.ImageryLayer[]>([]);
  const showBasePlan = useMapStore((s) => s.showBasePlan);

  useEffect(() => {
    if (!viewer || viewer.isDestroyed()) return;

    if (showBasePlan && layersRef.current.length === 0) {
      // Load all base plan imagery layers
      const resource = new Cesium.Resource({
        url: 'https://api.cesium.com/',
        headers: { Authorization: `Bearer ${BASEPLAN_TOKEN}` },
      });

      BASEPLAN_ASSET_IDS.forEach(async (assetId) => {
        try {
          const provider = await Cesium.IonImageryProvider.fromAssetId(assetId, {
            accessToken: BASEPLAN_TOKEN,
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
      // Remove all base plan layers
      layersRef.current.forEach((layer) => {
        if (!viewer.isDestroyed()) {
          viewer.imageryLayers.remove(layer, true);
        }
      });
      layersRef.current = [];
      if (!viewer.isDestroyed()) viewer.scene.requestRender();
    }
  }, [viewer, showBasePlan]);

  // Cleanup on unmount
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
