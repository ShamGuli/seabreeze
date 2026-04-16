'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as Cesium from 'cesium';
import { useMapStore } from '@/store/mapStore';
import { getMapConfig } from '@/data/mapConfigs';

interface ImageryOverlayProps {
  viewer: Cesium.Viewer | null;
}

interface TooltipData {
  name: string;
  areaText: string;
  screenX: number;
  screenY: number;
  scale: number;
  worldPos: Cesium.Cartesian3;
}

function getTooltipScale(viewer: Cesium.Viewer): number {
  const height = viewer.camera.positionCartographic.height;
  // At 500m = scale 1.0, at 8000m+ = scale 0.3, smooth interpolation
  const minH = 500, maxH = 8000, minS = 0.35, maxS = 1.0;
  if (height <= minH) return maxS;
  if (height >= maxH) return minS;
  const t = (height - minH) / (maxH - minH);
  return maxS - t * (maxS - minS);
}

/** Shoelace formula for polygon area on a sphere (approximate, good for small areas) */
function computePolygonArea(coords: { lon: number; lat: number }[]): number {
  const R = 6371000;
  const n = coords.length;
  if (n < 3) return 0;
  let area = 0;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const lat1 = coords[i].lat * (Math.PI / 180);
    const lat2 = coords[j].lat * (Math.PI / 180);
    const dLon = (coords[j].lon - coords[i].lon) * (Math.PI / 180);
    area += dLon * (2 + Math.sin(lat1) + Math.sin(lat2));
  }
  area = Math.abs((area * R * R) / 2);
  return area;
}

export default function ImageryOverlay({ viewer }: ImageryOverlayProps) {
  const orthoLayersRef = useRef<Cesium.ImageryLayer[]>([]);
  const layersRef = useRef<Cesium.ImageryLayer[]>([]);
  const kmlSourcesRef = useRef<Cesium.KmlDataSource[]>([]);
  const namesSourceRef = useRef<Cesium.KmlDataSource | null>(null);
  const clickHandlerRef = useRef<Cesium.ScreenSpaceEventHandler | null>(null);
  const renderListenerRef = useRef<(() => void) | null>(null);
  const loadedForMapRef = useRef<string | null>(null);
  const selectedIdRef = useRef<string | null>(null);
  const tooltipWorldPosRef = useRef<Cesium.Cartesian3 | null>(null);
  const cancelledRef = useRef(false);
  const showBasePlan = useMapStore((s) => s.showBasePlan);
  const showOrtho = useMapStore((s) => s.showOrtho);
  const showBasePlanLayers = useMapStore((s) => s.showBasePlanLayers);
  const activeMapId = useMapStore((s) => s.activeMapId);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  // Update tooltip screen position on camera move
  const updateTooltipPosition = useCallback(() => {
    if (!viewer || viewer.isDestroyed() || !tooltipWorldPosRef.current) return;
    const screenPos = Cesium.SceneTransforms.worldToWindowCoordinates(
      viewer.scene, tooltipWorldPosRef.current
    );
    if (screenPos) {
      setTooltip(prev => prev ? { ...prev, screenX: screenPos.x, screenY: screenPos.y } : null);
    }
  }, [viewer]);

  const hideTooltip = useCallback(() => {
    setTooltip(null);
    tooltipWorldPosRef.current = null;
    selectedIdRef.current = null;
  }, []);

  // Cleanup when map changes
  useEffect(() => {
    if (!viewer || viewer.isDestroyed()) return;

    if (loadedForMapRef.current && loadedForMapRef.current !== activeMapId) {
      orthoLayersRef.current.forEach((l) => {
        if (!viewer.isDestroyed()) viewer.imageryLayers.remove(l, true);
      });
      orthoLayersRef.current = [];
      layersRef.current.forEach((layer) => {
        if (!viewer.isDestroyed()) viewer.imageryLayers.remove(layer, true);
      });
      kmlSourcesRef.current.forEach((ds) => {
        if (!viewer.isDestroyed()) viewer.dataSources.remove(ds, true);
      });
      if (namesSourceRef.current) {
        viewer.dataSources.remove(namesSourceRef.current, true);
        namesSourceRef.current = null;
      }
      if (clickHandlerRef.current) {
        clickHandlerRef.current.destroy();
        clickHandlerRef.current = null;
      }
      if (renderListenerRef.current) {
        viewer.scene.postRender.removeEventListener(renderListenerRef.current);
        renderListenerRef.current = null;
      }
      layersRef.current = [];
      kmlSourcesRef.current = [];
      loadedForMapRef.current = null;
      hideTooltip();
      viewer.scene.globe.depthTestAgainstTerrain = true;
      viewer.scene.requestRender();
    }
  }, [viewer, activeMapId, hideTooltip]);

  useEffect(() => {
    if (!viewer || viewer.isDestroyed()) return;

    const config = getMapConfig(activeMapId);
    const hasAssets = config.basePlanAssetIds.length > 0 || config.basePlanKmlIds.length > 0 || !!config.namesAssetId;

    if (showBasePlan && layersRef.current.length === 0 && kmlSourcesRef.current.length === 0 && !namesSourceRef.current && orthoLayersRef.current.length === 0) {
      if (!config.basePlanToken || !hasAssets) return;

      loadedForMapRef.current = activeMapId;
      cancelledRef.current = false;

      // 1) Load orthophoto layers (lowest layers)
      (config.orthoAssets ?? []).forEach(async ({ assetId, token }) => {
        try {
          const orthoProvider = await Cesium.IonImageryProvider.fromAssetId(assetId, {
            accessToken: token,
          });
          if (viewer.isDestroyed() || cancelledRef.current) return;
          const layer = viewer.imageryLayers.addImageryProvider(orthoProvider);
          layer.alpha = 1.0;
          const idx = viewer.imageryLayers.indexOf(layer);
          for (let i = idx; i > 1; i--) {
            viewer.imageryLayers.lower(layer);
          }
          layer.show = useMapStore.getState().showOrtho;
          orthoLayersRef.current.push(layer);
          viewer.scene.requestRender();
        } catch (err) {
          console.warn(`Failed to load orthophoto ${assetId}:`, err);
        }
      });

      // 2) Load base plan imagery assets
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
          // Pass 1: unclamped — only to extract label names + positions
          const preDs = await Cesium.KmlDataSource.load(resource.clone(), {
            camera: viewer.scene.camera,
            canvas: viewer.scene.canvas,
            clampToGround: false,
          });
          if (viewer.isDestroyed()) return;
          const labelData: { name: string; lon: number; lat: number }[] = [];
          preDs.entities.values.forEach((entity) => {
            if (entity.label && entity.position && entity.name) {
              const pos = entity.position.getValue(Cesium.JulianDate.now());
              if (pos) {
                const c = Cesium.Cartographic.fromCartesian(pos);
                labelData.push({ name: entity.name, lon: c.longitude, lat: c.latitude });
              }
            }
          });

          // Pass 2: clamped — all geometry (polygons + polylines) on terrain
          const ds = await Cesium.KmlDataSource.load(resource, {
            camera: viewer.scene.camera,
            canvas: viewer.scene.canvas,
            clampToGround: activeMapId === 'charvak',
          });
          if (viewer.isDestroyed()) return;
          viewer.scene.globe.depthTestAgainstTerrain = false;
          if (activeMapId === 'charvak') {
            // Hide original KML labels/billboards (prevent duplicates)
            ds.entities.values.forEach((entity) => {
              if (entity.label) entity.label.show = new Cesium.ConstantProperty(false);
              if (entity.billboard) entity.billboard.show = new Cesium.ConstantProperty(false);
            });
            // Create separate label entities with terrain clamping
            const labelDs = new Cesium.CustomDataSource('charvak-labels');
            labelData.forEach(({ name, lon, lat }) => {
              labelDs.entities.add({
                position: Cesium.Cartesian3.fromRadians(lon, lat, 0),
                label: {
                  text: name,
                  font: 'bold 15px sans-serif',
                  fillColor: Cesium.Color.WHITE,
                  outlineColor: Cesium.Color.BLACK,
                  outlineWidth: 3,
                  style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                  disableDepthTestDistance: Number.POSITIVE_INFINITY,
                  scaleByDistance: new Cesium.NearFarScalar(500, 1.2, 8000, 0.5),
                  pixelOffset: new Cesium.Cartesian2(0, 0),
                  horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                  verticalOrigin: Cesium.VerticalOrigin.CENTER,
                  heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                },
              });
            });
            viewer.dataSources.add(labelDs);
            kmlSourcesRef.current.push(labelDs as unknown as Cesium.KmlDataSource);
          } else {
            // Nardaran: hide labels/billboards
            ds.entities.values.forEach((entity) => {
              if (entity.label) entity.label.show = new Cesium.ConstantProperty(false);
              if (entity.billboard) entity.billboard.show = new Cesium.ConstantProperty(false);
            });
          }
          viewer.dataSources.add(ds);
          kmlSourcesRef.current.push(ds);
          viewer.scene.requestRender();
        } catch (err) {
          console.warn(`Failed to load base plan KML ${assetId}:`, err);
        }
      });

      // Load names/polygons asset
      if (config.namesAssetId) {
        (async () => {
          try {
            const resource = await Cesium.IonResource.fromAssetId(config.namesAssetId!, {
              accessToken: config.namesToken || config.basePlanToken,
            });
            if (viewer.isDestroyed()) return;
            const ds = await Cesium.KmlDataSource.load(resource, {
              camera: viewer.scene.camera,
              canvas: viewer.scene.canvas,
              clampToGround: true,
            });
            if (viewer.isDestroyed()) return;

            // Pre-compute area + center for each polygon
            const entityData = new Map<string, { name: string; areaText: string; center: Cesium.Cartesian3 }>();
            ds.entities.values.forEach((entity) => {
              if (entity.polygon) {
                entity.polygon.material = new Cesium.ColorMaterialProperty(Cesium.Color.TRANSPARENT);
                entity.polygon.outline = new Cesium.ConstantProperty(true);
                entity.polygon.outlineColor = new Cesium.ConstantProperty(Cesium.Color.WHITE.withAlpha(0.6));
                entity.polygon.outlineWidth = new Cesium.ConstantProperty(2);

                const h = entity.polygon.hierarchy?.getValue(Cesium.JulianDate.now());
                if (h?.positions?.length) {
                  const carto = h.positions.map((p: Cesium.Cartesian3) => Cesium.Cartographic.fromCartesian(p));
                  const coords = carto.map((c: Cesium.Cartographic) => ({
                    lon: Cesium.Math.toDegrees(c.longitude),
                    lat: Cesium.Math.toDegrees(c.latitude),
                  }));
                  const areaSqM = computePolygonArea(coords);
                  const areaHa = areaSqM / 10000;
                  const areaText = areaHa >= 1 ? `${areaHa.toFixed(2)} ha` : `${areaSqM.toFixed(0)} m²`;
                  const center = Cesium.BoundingSphere.fromPoints(h.positions).center;
                  entityData.set(entity.id, { name: entity.name || 'Unknown', areaText, center });
                }
              }
              if (entity.billboard) entity.billboard.show = new Cesium.ConstantProperty(false);
              if (entity.label) entity.label.show = new Cesium.ConstantProperty(false);
            });

            viewer.dataSources.add(ds);
            namesSourceRef.current = ds;

            // Post-render listener to keep tooltip following camera
            const onPostRender = () => {
              if (!tooltipWorldPosRef.current || viewer.isDestroyed()) return;
              const sp = Cesium.SceneTransforms.worldToWindowCoordinates(viewer.scene, tooltipWorldPosRef.current);
              if (sp) {
                const scale = getTooltipScale(viewer);
                setTooltip(prev => prev ? { ...prev, screenX: sp.x, screenY: sp.y, scale } : null);
              }
            };
            viewer.scene.postRender.addEventListener(onPostRender);
            renderListenerRef.current = onPostRender;

            // Click handler — toggle highlight + tooltip
            const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
            handler.setInputAction((click: { position: Cesium.Cartesian2 }) => {
              const picked = viewer.scene.pick(click.position);

              const resetAll = () => {
                ds.entities.values.forEach((e) => {
                  if (e.polygon) {
                    e.polygon.material = new Cesium.ColorMaterialProperty(Cesium.Color.TRANSPARENT);
                  }
                });
                hideTooltip();
                viewer.selectedEntity = undefined;
              };

              if (Cesium.defined(picked) && picked.id) {
                const entity = picked.id as Cesium.Entity;
                if (ds.entities.contains(entity) && entity.polygon) {
                  if (selectedIdRef.current === entity.id) {
                    resetAll();
                  } else {
                    resetAll();
                    entity.polygon.material = new Cesium.ColorMaterialProperty(
                      Cesium.Color.CYAN.withAlpha(0.25)
                    );
                    const data = entityData.get(entity.id);
                    if (data) {
                      tooltipWorldPosRef.current = data.center;
                      selectedIdRef.current = entity.id;
                      const sp = Cesium.SceneTransforms.worldToWindowCoordinates(viewer.scene, data.center);
                      if (sp) {
                        setTooltip({
                          name: data.name,
                          areaText: data.areaText,
                          screenX: sp.x,
                          screenY: sp.y,
                          scale: getTooltipScale(viewer),
                          worldPos: data.center,
                        });
                      }
                    }
                  }
                  viewer.scene.requestRender();
                  return;
                }
              }
              if (selectedIdRef.current) {
                resetAll();
                viewer.scene.requestRender();
              }
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
            clickHandlerRef.current = handler;

            viewer.scene.requestRender();
          } catch (err) {
            console.warn(`Failed to load names KML ${config.namesAssetId}:`, err);
          }
        })();
      }
    } else if (!showBasePlan && (layersRef.current.length > 0 || kmlSourcesRef.current.length > 0 || namesSourceRef.current || orthoLayersRef.current.length > 0)) {
      cancelledRef.current = true;
      orthoLayersRef.current.forEach((l) => {
        if (!viewer.isDestroyed()) viewer.imageryLayers.remove(l, true);
      });
      orthoLayersRef.current = [];
      layersRef.current.forEach((layer) => {
        if (!viewer.isDestroyed()) viewer.imageryLayers.remove(layer, true);
      });
      kmlSourcesRef.current.forEach((ds) => {
        if (!viewer.isDestroyed()) viewer.dataSources.remove(ds, true);
      });
      if (namesSourceRef.current) {
        if (!viewer.isDestroyed()) viewer.dataSources.remove(namesSourceRef.current, true);
        namesSourceRef.current = null;
      }
      if (clickHandlerRef.current) {
        clickHandlerRef.current.destroy();
        clickHandlerRef.current = null;
      }
      if (renderListenerRef.current) {
        viewer.scene.postRender.removeEventListener(renderListenerRef.current);
        renderListenerRef.current = null;
      }
      layersRef.current = [];
      kmlSourcesRef.current = [];
      loadedForMapRef.current = null;
      hideTooltip();
      if (!viewer.isDestroyed()) {
        viewer.scene.globe.depthTestAgainstTerrain = true;
        viewer.scene.requestRender();
      }
    }
  }, [viewer, showBasePlan, activeMapId, hideTooltip]);

  // Toggle ortho visibility
  useEffect(() => {
    if (orthoLayersRef.current.length === 0 || !viewer || viewer.isDestroyed()) return;
    orthoLayersRef.current.forEach((l) => { l.show = showOrtho; });
    viewer.scene.requestRender();
  }, [viewer, showOrtho]);

  // Toggle base plan layers visibility
  useEffect(() => {
    if (!viewer || viewer.isDestroyed()) return;
    layersRef.current.forEach((layer) => {
      layer.show = showBasePlanLayers;
    });
    if (layersRef.current.length > 0) viewer.scene.requestRender();
  }, [viewer, showBasePlanLayers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (viewer && !viewer.isDestroyed()) {
        orthoLayersRef.current.forEach((l) => viewer.imageryLayers.remove(l, true));
        orthoLayersRef.current = [];
        layersRef.current.forEach((layer) => viewer.imageryLayers.remove(layer, true));
        kmlSourcesRef.current.forEach((ds) => viewer.dataSources.remove(ds, true));
        if (namesSourceRef.current) viewer.dataSources.remove(namesSourceRef.current, true);
        layersRef.current = [];
        kmlSourcesRef.current = [];
        namesSourceRef.current = null;
        if (clickHandlerRef.current) {
          clickHandlerRef.current.destroy();
          clickHandlerRef.current = null;
        }
        if (renderListenerRef.current) {
          viewer.scene.postRender.removeEventListener(renderListenerRef.current);
          renderListenerRef.current = null;
        }
      }
    };
  }, [viewer]);

  if (!tooltip) return null;

  return (
    <div
      style={{
        position: 'fixed',
        left: tooltip.screenX,
        top: tooltip.screenY,
        transform: `translate(-50%, -100%) translateY(-12px) scale(${tooltip.scale})`,
        transformOrigin: 'bottom center',
        pointerEvents: 'none',
        zIndex: 50,
        transition: 'transform 0.15s ease-out',
      }}
    >
      <div
        style={{
          background: 'rgba(30, 60, 120, 0.92)',
          backdropFilter: 'blur(8px)',
          borderRadius: 10,
          padding: '8px 14px',
          color: '#fff',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
          whiteSpace: 'nowrap',
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: 0.3 }}>{tooltip.name}</div>
        <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>{tooltip.areaText}</div>
      </div>
      {/* Arrow */}
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: '8px solid rgba(30, 60, 120, 0.92)',
          margin: '0 auto',
        }}
      />
    </div>
  );
}
