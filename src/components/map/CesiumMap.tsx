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

export default function CesiumMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const [viewer, setViewer] = useState<Cesium.Viewer | null>(null);

  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return;

    // Set default Ion token (terrain + imagery)
    Cesium.Ion.defaultAccessToken =
      process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN || '';

    const v = new Cesium.Viewer(containerRef.current, {
      terrainProvider: new Cesium.EllipsoidTerrainProvider(), // Flat surface, no elevation
      baseLayer: false, // Remove default Bing Maps imagery
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
    });

    // Add Google Maps 2D Satellite imagery from Ion (must load before overlay)
    (async () => {
      const provider = await Cesium.IonImageryProvider.fromAssetId(3830182);
      if (!v.isDestroyed()) {
        v.imageryLayers.addImageryProvider(provider, 0); // index 0 = base layer
      }
    })();

    // Globe & scene settings
    v.scene.globe.depthTestAgainstTerrain = false;

    v.scene.fog.enabled = true;
    v.scene.fog.density = 0.0003;
    if (v.scene.skyAtmosphere) v.scene.skyAtmosphere.show = true;

    // Camera controller — full 3D orbit
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

    // Performance
    v.scene.requestRenderMode = true;
    v.scene.maximumRenderTimeChange = 0.1;

    // Initial camera: top-down view centered on resort
    v.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(49.950, 40.584, 5000),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-90),
        roll: 0,
      },
    });

    viewerRef.current = v;
    setViewer(v);

    return () => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
        viewerRef.current = null;
        setViewer(null);
      }
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <BuildingLoader viewer={viewer} />
      <BuildingMarkers viewer={viewer} />
      <SearchBar onFlyTo={(b) => viewer && flyToBuilding(viewer, b)} />
      <CategoryFilter />
      <Sidebar />
    </div>
  );
}
