'use client';

import { useEffect, useRef } from 'react';
import * as Cesium from 'cesium';
import { getToken } from '@/utils/cesiumConfig';
import { useMapStore } from '@/store/mapStore';
import { getMapConfig } from '@/data/mapConfigs';

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
    .filter((item: any) => item.type === '3DTILES' && item.id > 4000000 && item.status === 'COMPLETE')
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
  const loadedForMapRef = useRef<string | null>(null);
  const is3D = useMapStore((s) => s.is3D);
  const setIs3DLoading = useMapStore((s) => s.setIs3DLoading);
  const activeMapId = useMapStore((s) => s.activeMapId);

  // Cleanup tilesets when map changes
  useEffect(() => {
    if (!viewer || viewer.isDestroyed()) return;

    // If map changed, remove old tilesets
    if (loadedForMapRef.current && loadedForMapRef.current !== activeMapId) {
      tilesetsRef.current.forEach((t) => {
        viewer.scene.primitives.remove(t);
        if (!t.isDestroyed()) t.destroy();
      });
      tilesetsRef.current = [];
      loadedForMapRef.current = null;
      viewer.scene.requestRender();
    }
  }, [viewer, activeMapId]);

  useEffect(() => {
    if (!viewer) return;

    const config = getMapConfig(activeMapId);

    if (is3D) {
      if (loadedForMapRef.current !== activeMapId) {
        // Load tilesets for current map
        loadedForMapRef.current = activeMapId;
        setIs3DLoading(true);

        if (config.tilesetTokenKeys.length === 0) {
          setIs3DLoading(false);
          return;
        }

        (async () => {
          const allAssets: { assetId: number; token: string }[] = [];

          const excludeIds = new Set(config.excludeAssetIds ?? []);

          await Promise.all(
            config.tilesetTokenKeys.map(async (key) => {
              const token = getToken(key);
              if (!token) return;
              const ids = await fetchIonAssetIds(token);
              ids.filter((id) => !excludeIds.has(id)).forEach((id) => allAssets.push({ assetId: id, token }));
            })
          );

          const tilesets: Cesium.Cesium3DTileset[] = [];
          await Promise.allSettled(
            allAssets.map(async ({ assetId, token }) => {
              try {
                const resource = await Cesium.IonResource.fromAssetId(assetId, {
                  accessToken: token,
                });
                const tileset = await Cesium.Cesium3DTileset.fromUrl(resource, {
                  maximumScreenSpaceError: 32,
                  skipLevelOfDetail: true,
                  baseScreenSpaceError: 1024,
                  skipScreenSpaceErrorFactor: 16,
                  skipLevels: 1,
                  immediatelyLoadDesiredLevelOfDetail: false,
                  loadSiblings: false,
                  cullWithChildrenBounds: true,
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
        // Show existing tilesets
        tilesetsRef.current.forEach((t) => { t.show = true; });
        viewer.scene.requestRender();
      }
    } else {
      // 2D: hide tilesets
      tilesetsRef.current.forEach((t) => { t.show = false; });
      if (viewer.scene) viewer.scene.requestRender();
    }
  }, [viewer, is3D, activeMapId]);

  return null;
}
