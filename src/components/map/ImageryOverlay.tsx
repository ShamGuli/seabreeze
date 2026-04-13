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
  const kmlSourcesRef = useRef<Cesium.KmlDataSource[]>([]);
  const loadedForMapRef = useRef<string | null>(null);
  const showBasePlan = useMapStore((s) => s.showBasePlan);
  const showNames = useMapStore((s) => s.showNames);
  const activeMapId = useMapStore((s) => s.activeMapId);

  // Cleanup when map changes
  useEffect(() => {
    if (!viewer || viewer.isDestroyed()) return;

    if (loadedForMapRef.current && loadedForMapRef.current !== activeMapId) {
      layersRef.current.forEach((layer) => {
        if (!viewer.isDestroyed()) viewer.imageryLayers.remove(layer, true);
      });
      kmlSourcesRef.current.forEach((ds) => {
        if (!viewer.isDestroyed()) viewer.dataSources.remove(ds, true);
      });
      layersRef.current = [];
      kmlSourcesRef.current = [];
      loadedForMapRef.current = null;
      if (namesSourceRef.current) {
        viewer.dataSources.remove(namesSourceRef.current, true);
        namesSourceRef.current = null;
      }
      viewer.scene.globe.depthTestAgainstTerrain = true;
      viewer.scene.requestRender();
    }
  }, [viewer, activeMapId]);

  useEffect(() => {
    if (!viewer || viewer.isDestroyed()) return;

    const config = getMapConfig(activeMapId);
    const hasAssets = config.basePlanAssetIds.length > 0 || config.basePlanKmlIds.length > 0;

    if (showBasePlan && layersRef.current.length === 0 && kmlSourcesRef.current.length === 0) {
      if (!config.basePlanToken || !hasAssets) return;

      loadedForMapRef.current = activeMapId;

      // Load imagery assets
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
          console.warn(`Failed to load base plan imagery ${assetId}:`, err);
        }
      });

      // Load KML assets (polygons, lines, placemarks)
      config.basePlanKmlIds.forEach(async (assetId) => {
        try {
          const resource = await Cesium.IonResource.fromAssetId(assetId, {
            accessToken: config.basePlanToken,
          });
          if (viewer.isDestroyed()) return;
          const ds = await Cesium.KmlDataSource.load(resource, {
            camera: viewer.scene.camera,
            canvas: viewer.scene.canvas,
            clampToGround: false,
          });
          if (viewer.isDestroyed()) return;
          // Disable depth test so lines don't clip behind terrain
          viewer.scene.globe.depthTestAgainstTerrain = false;
          // Hide labels and billboards
          ds.entities.values.forEach((entity) => {
            if (entity.label) {
              entity.label.show = new Cesium.ConstantProperty(false);
            }
            if (entity.billboard) {
              entity.billboard.show = new Cesium.ConstantProperty(false);
            }
          });
          viewer.dataSources.add(ds);
          kmlSourcesRef.current.push(ds);
          viewer.scene.requestRender();
        } catch (err) {
          console.warn(`Failed to load base plan KML ${assetId}:`, err);
        }
      });
    } else if (!showBasePlan && (layersRef.current.length > 0 || kmlSourcesRef.current.length > 0)) {
      // Remove imagery
      layersRef.current.forEach((layer) => {
        if (!viewer.isDestroyed()) viewer.imageryLayers.remove(layer, true);
      });
      // Remove KML
      kmlSourcesRef.current.forEach((ds) => {
        if (!viewer.isDestroyed()) viewer.dataSources.remove(ds, true);
      });
      layersRef.current = [];
      kmlSourcesRef.current = [];
      loadedForMapRef.current = null;
      // Restore depth test when KML removed
      if (!viewer.isDestroyed()) {
        viewer.scene.globe.depthTestAgainstTerrain = true;
        viewer.scene.requestRender();
      }
    }
  }, [viewer, showBasePlan, activeMapId]);

  // ── Names overlay (separate toggle) ──
  const namesSourceRef = useRef<Cesium.CustomDataSource | null>(null);
  useEffect(() => {
    if (!viewer || viewer.isDestroyed()) return;

    const config = getMapConfig(activeMapId);

    if (showNames && !namesSourceRef.current && config.namesAssetId) {
      (async () => {
        try {
          const resource = await Cesium.IonResource.fromAssetId(config.namesAssetId!, {
            accessToken: config.namesToken || '',
          });
          if (viewer.isDestroyed()) return;
          const ds = await Cesium.KmlDataSource.load(resource, {
            camera: viewer.scene.camera,
            canvas: viewer.scene.canvas,
            clampToGround: true,
          });
          if (viewer.isDestroyed()) return;

          // Create a custom data source with just labels at polygon centers
          const namesDs = new Cesium.CustomDataSource('names');
          ds.entities.values.forEach((entity) => {
            if (!entity.name) return;
            // Find polygon positions from this entity or children
            let positions: Cesium.Cartesian3[] | null = null;
            if (entity.polygon) {
              const h = entity.polygon.hierarchy?.getValue(Cesium.JulianDate.now());
              if (h?.positions?.length) positions = h.positions;
            }
            if (!positions) return;

            const center = Cesium.BoundingSphere.fromPoints(positions).center;
            namesDs.entities.add({
              position: center,
              label: new Cesium.LabelGraphics({
                text: entity.name,
                font: '13px sans-serif',
                fillColor: Cesium.Color.WHITE,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 2,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                verticalOrigin: Cesium.VerticalOrigin.CENTER,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                scaleByDistance: new Cesium.NearFarScalar(500, 1.0, 8000, 0.3),
              }),
            });
          });

          console.log(`Names overlay: ${namesDs.entities.values.length} labels created`);
          viewer.dataSources.add(namesDs);
          namesSourceRef.current = namesDs;
          viewer.scene.requestRender();
        } catch (err) {
          console.warn(`Failed to load names KML ${config.namesAssetId}:`, err);
        }
      })();
    } else if (!showNames && namesSourceRef.current) {
      if (!viewer.isDestroyed()) {
        viewer.dataSources.remove(namesSourceRef.current, true);
        viewer.scene.requestRender();
      }
      namesSourceRef.current = null;
    }
  }, [viewer, showNames, activeMapId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (viewer && !viewer.isDestroyed()) {
        layersRef.current.forEach((layer) => viewer.imageryLayers.remove(layer, true));
        kmlSourcesRef.current.forEach((ds) => viewer.dataSources.remove(ds, true));
        if (namesSourceRef.current) viewer.dataSources.remove(namesSourceRef.current, true);
        layersRef.current = [];
        kmlSourcesRef.current = [];
        namesSourceRef.current = null;
      }
    };
  }, [viewer]);

  return null;
}
