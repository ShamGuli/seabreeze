'use client';

import { useEffect, useRef } from 'react';
import * as Cesium from 'cesium';
import type { Building } from '@/data/buildings';
import { CATEGORY_COLORS } from '@/data/categories';
import { useMapStore } from '@/store/mapStore';

interface BuildingMarkersProps {
  viewer: Cesium.Viewer | null;
}

export default function BuildingMarkers({ viewer }: BuildingMarkersProps) {
  const entityMapRef = useRef<Map<string, Cesium.Entity>>(new Map());
  const loadedForMapRef = useRef<string | null>(null);
  const handlerRef = useRef<Cesium.ScreenSpaceEventHandler | null>(null);
  const setSelectedBuilding = useMapStore((s) => s.setSelectedBuilding);
  const activeCategory = useMapStore((s) => s.activeCategory);
  const markersHidden = useMapStore((s) => s.markersHidden);
  const activeMapId = useMapStore((s) => s.activeMapId);
  const mapBuildings = useMapStore((s) => s.mapBuildings);

  // Create/recreate entities when buildings or map changes
  useEffect(() => {
    if (!viewer || viewer.isDestroyed()) return;

    // Cleanup old entities
    entityMapRef.current.forEach((entity) => {
      viewer.entities.remove(entity);
    });
    entityMapRef.current.clear();

    if (mapBuildings.length === 0) {
      loadedForMapRef.current = activeMapId;
      viewer.scene.requestRender();
      return;
    }

    const map = new Map<string, Cesium.Entity>();

    for (const building of mapBuildings) {
      const color = Cesium.Color.fromCssColorString(
        CATEGORY_COLORS[building.category]
      );

      const entity = viewer.entities.add({
        name: building.id,
        position: Cesium.Cartesian3.fromDegrees(
          building.longitude,
          building.latitude,
          0
        ),
        point: {
          pixelSize: 10,
          color,
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        },
        label: {
          text: building.name,
          font: '13px sans-serif',
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -14),
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          scaleByDistance: new Cesium.NearFarScalar(500, 1.0, 5000, 0.4),
          translucencyByDistance: new Cesium.NearFarScalar(500, 1.0, 8000, 0.0),
        },
      });

      map.set(building.id, entity);
    }

    entityMapRef.current = map;
    loadedForMapRef.current = activeMapId;

    // Setup click handler (once)
    if (!handlerRef.current) {
      const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handler.setInputAction((click: { position: Cesium.Cartesian2 }) => {
        const state = useMapStore.getState();
        if (state.showBasePlan || state.showCommunication) return;
        const picked = viewer.scene.pick(click.position);
        if (Cesium.defined(picked) && picked.id instanceof Cesium.Entity) {
          const entity = picked.id as Cesium.Entity;
          const building = state.mapBuildings.find((b) => b.id === entity.name);
          if (building) {
            state.setSelectedBuilding(building);
            flyToBuilding(viewer, building);
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      handlerRef.current = handler;
    }

    viewer.scene.requestRender();
  }, [viewer, mapBuildings, activeMapId]);

  const showCommunication = useMapStore((s) => s.showCommunication);
  const showBasePlan = useMapStore((s) => s.showBasePlan);
  const showCategoryBar = useMapStore((s) => s.showCategoryBar);

  // Filter entities by active category or hide all
  useEffect(() => {
    const map = entityMapRef.current;
    if (map.size === 0) return;

    for (const building of mapBuildings) {
      const entity = map.get(building.id);
      if (!entity) continue;
      if (!showCategoryBar || markersHidden || showCommunication || showBasePlan) {
        entity.show = false;
      } else {
        entity.show = activeCategory === null || building.category === activeCategory;
      }
    }
    if (viewer && !viewer.isDestroyed()) {
      viewer.scene.requestRender();
    }
  }, [viewer, activeCategory, markersHidden, showCommunication, showBasePlan, showCategoryBar, mapBuildings]);

  // Cleanup handler on unmount
  useEffect(() => {
    return () => {
      handlerRef.current?.destroy();
      handlerRef.current = null;
    };
  }, []);

  return null;
}

export function flyToBuilding(viewer: Cesium.Viewer, building: Building) {
  const target = Cesium.Cartesian3.fromDegrees(
    building.longitude,
    building.latitude,
    0
  );
  const heading = Cesium.Math.toRadians(30);
  const pitch = Cesium.Math.toRadians(-25);
  const range = 300;

  viewer.camera.flyToBoundingSphere(
    new Cesium.BoundingSphere(target, 0),
    {
      offset: new Cesium.HeadingPitchRange(heading, pitch, range),
      duration: 1.5,
    }
  );
}
