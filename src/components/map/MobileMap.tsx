'use client';

if (typeof window !== 'undefined') {
  window.CESIUM_BASE_URL = '/cesium';
}

import { useEffect, useRef } from 'react';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { getToken } from '@/utils/cesiumConfig';
import { getMapConfig } from '@/data/mapConfigs';
import { fetchBuildingsForMap, type Building } from '@/data/buildings';
import { CATEGORY_COLORS } from '@/data/categories';
import type { NativeToWebMessage, WebToNativeMessage } from '@/types/bridge';

const BRIDGE_VERSION = '1.0.0';

function sendToNative(msg: WebToNativeMessage) {
  window.ReactNativeWebView?.postMessage(JSON.stringify(msg));
}

// Same logic as desktop BuildingLoader.tsx
async function fetchIonAssetIds(token: string): Promise<number[]> {
  try {
    const res = await fetch('https://api.cesium.com/v1/assets?limit=999', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items ?? [])
      .filter((item: any) => item.type === '3DTILES' && item.id > 4000000)
      .map((item: any) => item.id as number);
  } catch {
    return [];
  }
}

export default function MobileMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const tilesetsRef = useRef<Cesium.Cesium3DTileset[]>([]);
  const tilesetLoadedRef = useRef(false);
  const entityMapRef = useRef<Map<string, { entity: Cesium.Entity; building: Building }>>(new Map());
  const is3DRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return;

    const params = new URLSearchParams(window.location.search);
    const mapId = params.get('map') || 'nardaran';
    const config = getMapConfig(mapId);

    Cesium.Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN || '';

    const v = new Cesium.Viewer(containerRef.current, {
      animation: false,
      timeline: false,
      baseLayerPicker: false,
      fullscreenButton: false,
      vrButton: false,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      sceneModePicker: false,
      selectionIndicator: false,
      navigationHelpButton: false,
      requestRenderMode: false,
      targetFrameRate: 30,
      msaaSamples: 1,
      shadows: false,
      orderIndependentTranslucency: false,
      useBrowserRecommendedResolution: false,
      contextOptions: {
        webgl: {
          antialias: false,
          powerPreference: 'default',
          preserveDrawingBuffer: false,
          failIfMajorPerformanceCaveat: false,
        },
      },
    });

    viewerRef.current = v;
    v.terrainProvider = new Cesium.EllipsoidTerrainProvider();

    // Imagery: Cesium default base layer is already loaded (baseLayer not disabled)

    // ── Scene settings ──
    v.scene.globe.depthTestAgainstTerrain = true;
    v.scene.globe.show = true;
    v.scene.fog.enabled = false;
    v.scene.globe.tileCacheSize = 50;
    v.scene.globe.enableLighting = true;
    v.scene.light = new Cesium.SunLight({ intensity: 2.0 });
    v.clock.currentTime = Cesium.JulianDate.fromIso8601('2025-07-15T12:00:00Z');
    v.clock.shouldAnimate = false;
    v.resolutionScale = 1.0;

    // ── Camera ──
    const ctrl = v.scene.screenSpaceCameraController;
    ctrl.minimumZoomDistance = 10;
    ctrl.maximumZoomDistance = 12000;
    ctrl.enableTilt = true;
    ctrl.enableLook = true;
    ctrl.tiltEventTypes = [
      Cesium.CameraEventType.MIDDLE_DRAG,
      Cesium.CameraEventType.PINCH,
      { eventType: Cesium.CameraEventType.LEFT_DRAG, modifier: Cesium.KeyboardEventModifier.CTRL },
    ];

    v.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(
        config.center.longitude, config.center.latitude, config.initialHeight
      ),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(config.initialPitch),
        roll: 0,
      },
    });

    // ── Building markers ──
    (async () => {
      const buildings = await fetchBuildingsForMap(config.buildingsJsonPath);
      if (v.isDestroyed()) return;
      const map = new Map<string, { entity: Cesium.Entity; building: Building }>();
      for (const building of buildings) {
        const color = Cesium.Color.fromCssColorString(CATEGORY_COLORS[building.category]);
        const entity = v.entities.add({
          name: building.id,
          position: Cesium.Cartesian3.fromDegrees(building.longitude, building.latitude),
          point: new Cesium.PointGraphics({
            color,
            pixelSize: 10,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          }),
          label: new Cesium.LabelGraphics({
            text: building.name,
            font: '11px sans-serif',
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -12),
            scaleByDistance: new Cesium.NearFarScalar(500, 1.0, 3000, 0.0),
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          }),
        });
        map.set(building.id, { entity, building });
      }
      entityMapRef.current = map;
    })();

    // ── Click handler ──
    const handler = new Cesium.ScreenSpaceEventHandler(v.scene.canvas);
    handler.setInputAction((click: { position: Cesium.Cartesian2 }) => {
      const picked = v.scene.pick(click.position);
      if (Cesium.defined(picked) && picked.id instanceof Cesium.Entity) {
        const entity = picked.id as Cesium.Entity;
        const entry = entityMapRef.current.get(entity.name || '');
        if (entry) {
          sendToNative({
            type: 'BUILDING_CLICK',
            payload: {
              id: entry.building.id,
              name: entry.building.name,
              lat: entry.building.latitude,
              lng: entry.building.longitude,
            },
          });
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    // ── Camera debounce ──
    let cameraDebounceTimer: ReturnType<typeof setTimeout>;
    v.camera.changed.addEventListener(() => {
      clearTimeout(cameraDebounceTimer);
      cameraDebounceTimer = setTimeout(() => {
        const pos = v.camera.positionCartographic;
        sendToNative({
          type: 'CAMERA_MOVED',
          payload: {
            lat: Cesium.Math.toDegrees(pos.latitude),
            lng: Cesium.Math.toDegrees(pos.longitude),
            height: pos.height,
          },
        });
      }, 300);
    });

    // ── 3D Tiles (same logic as desktop BuildingLoader.tsx) ──
    async function enable3D() {
      if (tilesetLoadedRef.current) {
        tilesetsRef.current.forEach((t) => { t.show = true; });
        return;
      }
      if (config.tilesetTokenKeys.length === 0) return;
      tilesetLoadedRef.current = true;
      const allAssets: { assetId: number; token: string }[] = [];
      await Promise.all(
        config.tilesetTokenKeys.map(async (key) => {
          const token = getToken(key);
          if (!token) return;
          const ids = await fetchIonAssetIds(token);
          ids.forEach((id) => allAssets.push({ assetId: id, token }));
        })
      );
      await Promise.allSettled(
        allAssets.map(async ({ assetId, token }) => {
          try {
            const resource = await Cesium.IonResource.fromAssetId(assetId, { accessToken: token });
            if (v.isDestroyed()) return;
            const tileset = await Cesium.Cesium3DTileset.fromUrl(resource, {
              maximumScreenSpaceError: 24,
              skipLevelOfDetail: true,
              baseScreenSpaceError: 1024,
              skipScreenSpaceErrorFactor: 16,
              skipLevels: 1,
              immediatelyLoadDesiredLevelOfDetail: false,
              loadSiblings: false,
            });
            if (v.isDestroyed()) return;
            v.scene.primitives.add(tileset);
            tilesetsRef.current.push(tileset);
          } catch (err) {
            console.warn(`Failed to load tileset ${assetId}:`, err);
          }
        })
      );
    }

    function disable3D() {
      tilesetsRef.current.forEach((t) => { t.show = false; });
    }

    // ── SET_FILTER handler ──
    function handleSetFilter(key: string, value: string | number | boolean) {
      switch (key) {
        case 'category': {
          // value = category string or '' for all
          const cat = value as string;
          entityMapRef.current.forEach(({ entity, building }) => {
            entity.show = !cat || building.category === cat;
          });
          break;
        }
        case 'markersVisible': {
          entityMapRef.current.forEach(({ entity }) => {
            entity.show = !!value;
          });
          break;
        }
        case 'sunHour': {
          const hour = value as number;
          const date = new Date(2025, 6, 15, Math.floor(hour), (hour % 1) * 60);
          v.clock.currentTime = Cesium.JulianDate.fromDate(date);
          v.clock.shouldAnimate = false;
          break;
        }
        case 'shadows': {
          v.shadows = !!value;
          if (value) {
            v.shadowMap.softShadows = true;
            v.shadowMap.darkness = 0.6;
            v.shadowMap.size = 2048;
          }
          v.scene.globe.enableLighting = true;
          break;
        }
      }
    }

    // ── Native → Web command listener ──
    function handleNativeCommand(e: Event) {
      const { type, payload } = (e as CustomEvent<NativeToWebMessage>).detail;
      switch (type) {
        case 'FLY_TO':
          v.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(
              payload.lng, payload.lat, payload.height || 500
            ),
            duration: 0.8,
            easingFunction: Cesium.EasingFunction.LINEAR_NONE,
          });
          break;
        case 'TOGGLE_3D':
          is3DRef.current = payload.enabled;
          if (payload.enabled) {
            enable3D();
            v.camera.flyTo({
              destination: Cesium.Cartesian3.fromDegrees(
                config.center.longitude, config.center.latitude, 2000
              ),
              orientation: { heading: 0, pitch: Cesium.Math.toRadians(-45), roll: 0 },
              duration: 1.5,
            });
          } else {
            disable3D();
            v.camera.flyTo({
              destination: Cesium.Cartesian3.fromDegrees(
                config.center.longitude, config.center.latitude, config.initialHeight
              ),
              orientation: { heading: 0, pitch: Cesium.Math.toRadians(-90), roll: 0 },
              duration: 1.5,
            });
          }
          break;
        case 'SET_FILTER':
          handleSetFilter(payload.key, payload.value);
          break;
        case 'PAUSE_RENDER':
          v.useDefaultRenderLoop = false;
          break;
        case 'RESUME_RENDER':
          v.useDefaultRenderLoop = true;
          break;
        case 'HIGHLIGHT_BUILDING': {
          entityMapRef.current.forEach(({ entity }) => {
            if (entity.point) {
              entity.point.pixelSize = new Cesium.ConstantProperty(
                entity.name === payload.id ? 16 : 10
              );
              entity.point.outlineWidth = new Cesium.ConstantProperty(
                entity.name === payload.id ? 3 : 2
              );
            }
          });
          break;
        }
        case 'CLEAR_HIGHLIGHT': {
          entityMapRef.current.forEach(({ entity }) => {
            if (entity.point) {
              entity.point.pixelSize = new Cesium.ConstantProperty(10);
              entity.point.outlineWidth = new Cesium.ConstantProperty(2);
            }
          });
          break;
        }
      }
    }
    window.addEventListener('nativeCommand', handleNativeCommand);

    sendToNative({ type: 'MAP_READY', payload: { version: BRIDGE_VERSION } });

    return () => {
      window.removeEventListener('nativeCommand', handleNativeCommand);
      clearTimeout(cameraDebounceTimer);
      handler.destroy();
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, []);

  return <div id="cesiumContainer" ref={containerRef} style={{ width: '100vw', height: '100vh' }} />;
}
