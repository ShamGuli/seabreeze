'use client';

import { useEffect, useRef } from 'react';
import * as Cesium from 'cesium';
import { buildings, type Building } from '@/data/buildings';
import { CATEGORY_COLORS } from '@/data/categories';
import { useMapStore } from '@/store/mapStore';

interface BuildingMarkersProps {
  viewer: Cesium.Viewer | null;
}

export default function BuildingMarkers({ viewer }: BuildingMarkersProps) {
  const loadedRef = useRef(false);
  const entityMapRef = useRef<Map<string, Cesium.Entity>>(new Map());
  const setSelectedBuilding = useMapStore((s) => s.setSelectedBuilding);
  const activeCategory = useMapStore((s) => s.activeCategory);

  // Create entities once
  useEffect(() => {
    if (!viewer || loadedRef.current) return;
    loadedRef.current = true;

    const map = new Map<string, Cesium.Entity>();

    for (const building of buildings) {
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

    // Click handler
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((click: { position: Cesium.Cartesian2 }) => {
      const picked = viewer.scene.pick(click.position);
      if (Cesium.defined(picked) && picked.id instanceof Cesium.Entity) {
        const entity = picked.id as Cesium.Entity;
        const building = buildings.find((b) => b.id === entity.name);
        if (building) {
          setSelectedBuilding(building);
          flyToBuilding(viewer, building);
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    return () => {
      handler.destroy();
    };
  }, [viewer, setSelectedBuilding]);

  // Filter entities by active category
  useEffect(() => {
    const map = entityMapRef.current;
    if (map.size === 0) return;

    for (const building of buildings) {
      const entity = map.get(building.id);
      if (!entity) continue;
      entity.show = activeCategory === null || building.category === activeCategory;
    }
  }, [activeCategory]);

  return null;
}

export function flyToBuilding(viewer: Cesium.Viewer, building: Building) {
  // Fly to an orbit point ~300m from building at an angle
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
