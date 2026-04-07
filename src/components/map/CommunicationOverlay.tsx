'use client';

import { useEffect, useRef } from 'react';
import * as Cesium from 'cesium';
import { useMapStore, type CommFilterKey } from '@/store/mapStore';

interface CommunicationOverlayProps {
  viewer: Cesium.Viewer | null;
}

const COMM_TOKEN = process.env.NEXT_PUBLIC_CESIUM_COMM_TOKEN || '';
const COMM_KML_ASSET_ID = 4599391;

const ORTHO_TOKEN = process.env.NEXT_PUBLIC_CESIUM_ORTHO_TOKEN || '';
const ORTHO_ASSET_ID = 4250769;

// ── Folder → Group mapping ──
const FOLDER_TO_GROUP: Record<string, CommFilterKey> = {
  'Elektrik kanalı': 'elektrik',
  'Elektrik quyusu': 'elektrik',
  'Pano': 'elektrik',
  'Transformator': 'elektrik',
  'Generator': 'elektrik',
  'Tel. quyusu': 'elektrik',
  'Boş quyu': 'elektrik',
  'Naməlum quyu': 'elektrik',

  'Drenaj kanalı': 'drenaj',
  'Drenaj quyusu': 'drenaj',

  'Kanalizasiya kanalı': 'kanalizasiya',
  'Kanalizasiya quyusu': 'kanalizasiya',

  'Qaz kanalı': 'qaz',
  'Qaz quyusu': 'qaz',
  'Qazanxana': 'qaz',

  'Su kanalı (içməli)': 'su_icmeli',
  'Su quyusu (içməli)': 'su_icmeli',
  'Su anbarı': 'su_icmeli',
  'Siyirtmə': 'su_icmeli',

  'Su kanalı (Texniki)': 'su_texniki',
  'Su quyusu (texniki)': 'su_texniki',
};

// ── Group colors ──
export const COMM_GROUP_COLORS: Record<CommFilterKey, string> = {
  elektrik: '#EF4444',
  drenaj: '#10B981',
  kanalizasiya: '#8B5CF6',
  qaz: '#FACC15',
  su_icmeli: '#06B6D4',
  su_texniki: '#3B82F6',
};

// Walk up parent chain to find matching folder name
function findGroup(entity: Cesium.Entity): CommFilterKey | 'always' | null {
  let current: Cesium.Entity | undefined = entity;
  while (current) {
    if (current.name && FOLDER_TO_GROUP[current.name] !== undefined) {
      return FOLDER_TO_GROUP[current.name];
    }
    if (current.name === 'Ərazilər') return 'always';
    current = current.parent;
  }
  return null;
}

export default function CommunicationOverlay({ viewer }: CommunicationOverlayProps) {
  const dataSourceRef = useRef<Cesium.KmlDataSource | null>(null);
  const entityGroupMap = useRef<Map<string, CommFilterKey | 'always'>>(new Map());
  const pointEntityIds = useRef<Set<string>>(new Set());
  const orthoLayerRef = useRef<Cesium.ImageryLayer | null>(null);
  const showCommunication = useMapStore((s) => s.showCommunication);
  const activeCommFilters = useMapStore((s) => s.activeCommFilters);
  const showCommWells = useMapStore((s) => s.showCommWells);

  // ── Load / Unload KML ──
  useEffect(() => {
    if (!viewer || viewer.isDestroyed()) return;

    if (showCommunication && !dataSourceRef.current) {
      // Load orthophoto background
      (async () => {
        try {
          const orthoProvider = await Cesium.IonImageryProvider.fromAssetId(ORTHO_ASSET_ID, {
            accessToken: ORTHO_TOKEN,
          });
          if (viewer.isDestroyed()) return;
          const layer = viewer.imageryLayers.addImageryProvider(orthoProvider);
          layer.alpha = 1.0;
          orthoLayerRef.current = layer;
          viewer.scene.requestRender();
        } catch (err) {
          console.warn('Failed to load orthophoto:', err);
        }
      })();

      (async () => {
        try {
          const resource = await Cesium.IonResource.fromAssetId(COMM_KML_ASSET_ID, {
            accessToken: COMM_TOKEN,
          });
          if (viewer.isDestroyed()) return;
          const ds = await Cesium.KmlDataSource.load(resource, {
            camera: viewer.scene.camera,
            canvas: viewer.scene.canvas,
            clampToGround: true,
          });
          if (viewer.isDestroyed()) return;
          viewer.dataSources.add(ds);
          dataSourceRef.current = ds;

          // Classify and style all entities
          const entities = ds.entities.values;
          for (const entity of entities) {
            // Hide ALL labels and billboards globally
            if (entity.label) {
              entity.label.show = new Cesium.ConstantProperty(false);
            }
            if (entity.billboard) {
              entity.billboard.show = new Cesium.ConstantProperty(false);
            }

            const group = findGroup(entity);
            if (!group) continue;

            entityGroupMap.current.set(entity.id, group);

            if (group === 'always') {
              if (entity.polygon) {
                entity.polygon.material = new Cesium.ColorMaterialProperty(
                  Cesium.Color.WHITE.withAlpha(0.08)
                );
                entity.polygon.outlineColor = new Cesium.ConstantProperty(
                  Cesium.Color.WHITE.withAlpha(0.3)
                );
              }
              continue;
            }

            const color = Cesium.Color.fromCssColorString(COMM_GROUP_COLORS[group]);

            // Points → colored pin marker (no text)
            if (entity.position && !entity.polyline && !entity.polygon) {
              // Remove existing billboard/point
              entity.billboard = undefined as any;
              entity.point = new Cesium.PointGraphics({
                color: color,
                pixelSize: 10,
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: 2,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                scaleByDistance: new Cesium.NearFarScalar(500, 1.0, 8000, 0.5),
              });
              pointEntityIds.current.add(entity.id);
            }

            // Polylines → colored, clamped to ground
            if (entity.polyline) {
              entity.polyline.material = new Cesium.ColorMaterialProperty(color.withAlpha(0.85));
              entity.polyline.width = new Cesium.ConstantProperty(3);
              entity.polyline.clampToGround = new Cesium.ConstantProperty(true);
              entity.polyline.arcType = new Cesium.ConstantProperty(Cesium.ArcType.GEODESIC);
            }

            // Polygons → colored fill
            if (entity.polygon) {
              entity.polygon.material = new Cesium.ColorMaterialProperty(color.withAlpha(0.25));
              entity.polygon.outlineColor = new Cesium.ConstantProperty(color);
            }
          }

          console.log(`Communication: ${entityGroupMap.current.size} entities classified`);
          viewer.scene.requestRender();
        } catch (err) {
          console.warn('Failed to load Communication KML:', err);
        }
      })();
    } else if (!showCommunication && dataSourceRef.current) {
      if (!viewer.isDestroyed()) {
        viewer.dataSources.remove(dataSourceRef.current, true);
        if (orthoLayerRef.current) {
          viewer.imageryLayers.remove(orthoLayerRef.current, true);
          orthoLayerRef.current = null;
        }
        viewer.scene.requestRender();
      }
      dataSourceRef.current = null;
      entityGroupMap.current.clear();
    }
  }, [viewer, showCommunication]);

  // ── Apply filters ──
  useEffect(() => {
    if (!dataSourceRef.current || !viewer || viewer.isDestroyed()) return;

    const entities = dataSourceRef.current.entities.values;
    for (const entity of entities) {
      const group = entityGroupMap.current.get(entity.id);
      if (!group) continue;

      if (group === 'always') {
        entity.show = true;
      } else {
        entity.show = activeCommFilters.includes(group);
      }
    }
    viewer.scene.requestRender();
  }, [viewer, activeCommFilters]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (viewer && !viewer.isDestroyed()) {
        if (dataSourceRef.current) {
          viewer.dataSources.remove(dataSourceRef.current, true);
          dataSourceRef.current = null;
        }
        if (orthoLayerRef.current) {
          viewer.imageryLayers.remove(orthoLayerRef.current, true);
          orthoLayerRef.current = null;
        }
        entityGroupMap.current.clear();
      }
    };
  }, [viewer]);

  return null;
}
