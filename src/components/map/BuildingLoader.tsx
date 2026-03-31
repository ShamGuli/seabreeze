'use client';

import { useEffect, useRef } from 'react';
import * as Cesium from 'cesium';
import { getToken } from '@/utils/cesiumConfig';

interface BuildingLoaderProps {
  viewer: Cesium.Viewer | null;
}

/**
 * Fetches all 3DTILES assets from a Cesium Ion account via REST API.
 * When assets are added/removed on Ion, no code change needed — auto-syncs.
 */
async function fetchIonAssetIds(token: string): Promise<number[]> {
  try {
    const res = await fetch('https://api.cesium.com/v1/assets?limit=999', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      console.error(`Cesium Ion API error: ${res.status} ${res.statusText}`);
      return [];
    }

    const data = await res.json();
    // Skip Cesium global assets (OSM Buildings, Google 3D Tiles etc.)
    // Only load user-uploaded assets (id > 4000000)
    const ids: number[] = (data.items ?? [])
      .filter((item: any) => item.type === '3DTILES' && item.id > 4000000)
      .map((item: any) => {
        console.log(`Ion asset: [${item.id}] ${item.name}`);
        return item.id as number;
      });

    console.log(`Cesium Ion: ${ids.length} 3D Tiles assets found`);
    return ids;
  } catch (err) {
    console.error('Failed to fetch Ion assets:', err);
    return [];
  }
}

export default function BuildingLoader({ viewer }: BuildingLoaderProps) {
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!viewer || loadedRef.current) return;
    loadedRef.current = true;

    async function loadAllModels() {
      if (!viewer) return;

      const token = getToken('TOKEN_3');

      // Fetch all 3DTILES assets from the Ion account dynamically
      const assetIds = await fetchIonAssetIds(token);

      // Paralel yüklə — hamısı eyni anda başlayır
      await Promise.allSettled(
        assetIds.map(async (assetId) => {
          try {
            const resource = await Cesium.IonResource.fromAssetId(assetId, {
              accessToken: token,
            });
            const tileset = await Cesium.Cesium3DTileset.fromUrl(resource, {
              maximumScreenSpaceError: 24,
              maximumMemoryUsage: 256,
              skipLevelOfDetail: true,
              baseScreenSpaceError: 1024,
              skipScreenSpaceErrorFactor: 16,
              skipLevels: 1,
              immediatelyLoadDesiredLevelOfDetail: false,
              loadSiblings: false,
            });
            tileset.shadows = Cesium.ShadowMode.ENABLED;
            viewer.scene.primitives.add(tileset);
          } catch (err) {
            console.error(`Failed to load tileset ${assetId}:`, err);
          }
        })
      );
    }

    loadAllModels();
  }, [viewer]);

  return null;
}
