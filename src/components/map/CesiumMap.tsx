'use client';

import { useEffect, useRef, useState } from 'react';

// Set CESIUM_BASE_URL before Cesium loads (must happen before import)
if (typeof window !== 'undefined') {
  window.CESIUM_BASE_URL = '/cesium';
}

import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import BuildingLoader from './BuildingLoader';
import BuildingMarkers, { flyToBuilding } from './BuildingMarkers';
import Sidebar from '../ui/Sidebar';
import SearchBar from '../ui/SearchBar';
import CategoryFilter from '../ui/CategoryFilter';
import MapTabs from '../ui/MapTabs';
import MyLocationButton from '../ui/MyLocationButton';
import SunSlider from '../ui/SunSlider';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import NavigationControls from '../ui/NavigationControls';
import ImageryOverlay from './ImageryOverlay';
import CommunicationOverlay from './CommunicationOverlay';
import RoadOverlay from './RoadOverlay';
import CharvakBasePlan from './CharvakBasePlan';
import CharvakZone from './CharvakZone';
import AiChat from '../ui/AiChat';
import { useMapStore } from '@/store/mapStore';
import { getMapConfig } from '@/data/mapConfigs';
import { fetchBuildingsForMap } from '@/data/buildings';

export default function CesiumMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const [viewer, setViewer] = useState<Cesium.Viewer | null>(null);
  const setFlyToOverview = useMapStore((s) => s.setFlyToOverview);
  const setMapBuildings = useMapStore((s) => s.setMapBuildings);
  const setIsMapTransitioning = useMapStore((s) => s.setIsMapTransitioning);
  const is3D = useMapStore((s) => s.is3D);
  const showBasePlan = useMapStore((s) => s.showBasePlan);
  const activeMapId = useMapStore((s) => s.activeMapId);
  const activeConfig = getMapConfig(activeMapId);

  // ── Initialize viewer ──
  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return;

    const initialConfig = getMapConfig('nardaran');

    Cesium.Ion.defaultAccessToken =
      process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN || '';

    const v = new Cesium.Viewer(containerRef.current, {
      baseLayer: false,
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
      useBrowserRecommendedResolution: true,
      requestRenderMode: true,
      maximumRenderTimeChange: Infinity,
    });

    v.terrainProvider = new Cesium.EllipsoidTerrainProvider();
    (v.cesiumWidget as any).showRenderLoopErrors = false;

    (async () => {
      const provider = await Cesium.IonImageryProvider.fromAssetId(3830182);
      if (!v.isDestroyed()) {
        v.imageryLayers.addImageryProvider(provider, 0);
      }
    })();

    v.scene.globe.depthTestAgainstTerrain = true;
    v.scene.globe.show = true;
    v.scene.fog.enabled = true;
    v.scene.globe.tileCacheSize = 100;
    v.scene.globe.enableLighting = true;
    v.scene.light = new Cesium.SunLight({ intensity: 2.0 });
    v.clock.currentTime = Cesium.JulianDate.fromIso8601('2025-07-15T12:00:00Z');
    v.clock.shouldAnimate = false;

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
        initialConfig.center.longitude,
        initialConfig.center.latitude,
        initialConfig.initialHeight
      ),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(initialConfig.initialPitch),
        roll: 0,
      },
    });

    viewerRef.current = v;
    setViewer(v);

    // Load initial buildings
    fetchBuildingsForMap(initialConfig.buildingsJsonPath).then(setMapBuildings);

    // Register flyToOverview
    setFlyToOverview(() => {
      if (v && !v.isDestroyed()) {
        const cfg = getMapConfig(useMapStore.getState().activeMapId);
        v.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(
            cfg.center.longitude, cfg.center.latitude, cfg.initialHeight
          ),
          orientation: {
            heading: Cesium.Math.toRadians(0),
            pitch: Cesium.Math.toRadians(cfg.initialPitch),
            roll: 0,
          },
          duration: 1.5,
        });
      }
    });

    return () => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
        viewerRef.current = null;
        setViewer(null);
      }
    };
  }, []);

  // ── Handle map switch ──
  useEffect(() => {
    if (!viewer || viewer.isDestroyed()) return;

    const config = getMapConfig(activeMapId);

    // Terrain: Nardaran always flat; Charvak handled by showBasePlan effect
    if (activeMapId !== 'charvak') {
      viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
    }

    // Load buildings for new map
    fetchBuildingsForMap(config.buildingsJsonPath).then(setMapBuildings);

    // Fly camera to new location
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        config.center.longitude,
        config.center.latitude,
        config.initialHeight
      ),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(config.initialPitch),
        roll: 0,
      },
      duration: 2.0,
      complete: () => {
        setIsMapTransitioning(false);
      },
    });
  }, [viewer, activeMapId]);

  // ── Charvak terrain: Base Plan = real relief, 3D = flat ──
  useEffect(() => {
    if (!viewer || viewer.isDestroyed() || activeMapId !== 'charvak') return;

    if (showBasePlan) {
      Cesium.createWorldTerrainAsync({ requestWaterMask: false, requestVertexNormals: false }).then((terrain) => {
        if (!viewer.isDestroyed()) {
          viewer.terrainProvider = terrain;
          viewer.scene.requestRender();
        }
      });
    } else {
      viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
      viewer.scene.requestRender();
    }
  }, [viewer, activeMapId, showBasePlan]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <BuildingLoader viewer={viewer} />
      <BuildingMarkers viewer={viewer} />
      <MapTabs />
      <SearchBar onFlyTo={(b) => viewer && flyToBuilding(viewer, b)} />
      <CategoryFilter />
      <MyLocationButton viewer={viewer} />
      {is3D && <SunSlider viewer={viewer} />}
      <LanguageSwitcher />
      <NavigationControls viewer={viewer} />
      <ImageryOverlay viewer={viewer} />
      <CommunicationOverlay viewer={viewer} />
      <RoadOverlay viewer={viewer} />
      <CharvakBasePlan viewer={viewer} />
      <CharvakZone viewer={viewer} />
      <AiChat />
      <Sidebar />
    </div>
  );
}
