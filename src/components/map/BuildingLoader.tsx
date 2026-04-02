'use client';

import { useEffect, useRef } from 'react';
import * as Cesium from 'cesium';
import { getToken } from '@/utils/cesiumConfig';
import { useMapStore } from '@/store/mapStore';

interface BuildingLoaderProps {
  viewer: Cesium.Viewer | null;
}

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

const HEIGHT_OFFSET = 0;

export default function BuildingLoader({ viewer }: BuildingLoaderProps) {
  const tilesetsRef = useRef<Cesium.Cesium3DTileset[]>([]);
  const loadedRef = useRef(false);
  const is3D = useMapStore((s) => s.is3D);
  const setIs3DLoading = useMapStore((s) => s.setIs3DLoading);

  useEffect(() => {
    if (!viewer) return;

    if (is3D) {
      if (!loadedRef.current) {
        // İlk dəfə: tileset-ləri yüklə
        loadedRef.current = true;
        setIs3DLoading(true);

        (async () => {
          const token = getToken('TOKEN_3');
          const assetIds = await fetchIonAssetIds(token);

          const tilesets: Cesium.Cesium3DTileset[] = [];
          await Promise.allSettled(
            assetIds.map(async (assetId) => {
              try {
                const resource = await Cesium.IonResource.fromAssetId(assetId, {
                  accessToken: token,
                });
                const tileset = await Cesium.Cesium3DTileset.fromUrl(resource, {
                  maximumScreenSpaceError: 24,
                  skipLevelOfDetail: true,
                  baseScreenSpaceError: 1024,
                  skipScreenSpaceErrorFactor: 16,
                  skipLevels: 1,
                  immediatelyLoadDesiredLevelOfDetail: false,
                  loadSiblings: false,
                });

                if (HEIGHT_OFFSET !== 0) {
                  const center = tileset.boundingSphere.center;
                  const cart = Cesium.Cartographic.fromCartesian(center);
                  const shifted = Cesium.Cartesian3.fromRadians(
                    cart.longitude, cart.latitude, cart.height + HEIGHT_OFFSET
                  );
                  const offset = Cesium.Cartesian3.subtract(shifted, center, new Cesium.Cartesian3());
                  tileset.modelMatrix = Cesium.Matrix4.fromTranslation(offset);
                }

                viewer.scene.primitives.add(tileset);
                tilesets.push(tileset);
              } catch (err) {
                console.error(`Failed to load tileset ${assetId}:`, err);
              }
            })
          );

          tilesetsRef.current = tilesets;
          setIs3DLoading(false);
          viewer.scene.requestRender();
        })();
      } else {
        // Sonrakı: show = true
        tilesetsRef.current.forEach((t) => { t.show = true; });
        viewer.scene.requestRender();
      }
    } else {
      // 2D: tileset-ləri gizlət
      tilesetsRef.current.forEach((t) => { t.show = false; });
      if (viewer.scene) viewer.scene.requestRender();
    }
  }, [viewer, is3D]);

  return null;
}
