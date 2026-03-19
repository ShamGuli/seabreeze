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

      // 3 new tilesets (TOKEN_3 account)
      const token3 = getToken('TOKEN_3');
      const newAssets = [4543828, 4544141, 4544753, 4544666, 4544710, 4544731];
      for (const assetId of newAssets) {
        try {
          const resource = await Cesium.IonResource.fromAssetId(assetId, { accessToken: token3 });
          const tileset = await Cesium.Cesium3DTileset.fromUrl(resource);
          viewer.scene.primitives.add(tileset);
        } catch (err) {
          console.error(`Failed to load tileset ${assetId}:`, err);
        }
      }

    }

    loadAllModels();
  }, [viewer]);

  return null;
}
