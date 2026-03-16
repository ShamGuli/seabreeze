'use client';

import { useEffect, useRef } from 'react';
import * as Cesium from 'cesium';
import {
  ION_MODELS,
  getToken,
  loadIonTileset,
} from '@/utils/cesiumConfig';

interface BuildingLoaderProps {
  viewer: Cesium.Viewer | null;
}

export default function BuildingLoader({ viewer }: BuildingLoaderProps) {
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!viewer || loadedRef.current) return;
    loadedRef.current = true;

    async function loadAllModels() {
      if (!viewer) return;

      // Load Ion tilesets — repositioned to client-confirmed coordinates
      for (const model of ION_MODELS) {
        try {
          const token = getToken(model.tokenKey);
          await loadIonTileset(viewer, model.assetId, token, model.name, model.heightOffset ?? 0);
        } catch (err) {
          console.error(`Failed to load ${model.name}:`, err);
        }
      }

    }

    loadAllModels();
  }, [viewer]);

  return null;
}
