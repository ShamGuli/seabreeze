'use client';

import { useEffect, useRef } from 'react';
import * as Cesium from 'cesium';
import { useMapStore } from '@/store/mapStore';

interface CommunicationOverlayProps {
  viewer: Cesium.Viewer | null;
}

const COMM_TOKEN = process.env.NEXT_PUBLIC_CESIUM_COMM_TOKEN || '';
const COMM_KML_ASSET_ID = 4599391; // "Kommunikasiya" KML

export default function CommunicationOverlay({ viewer }: CommunicationOverlayProps) {
  const dataSourceRef = useRef<Cesium.KmlDataSource | null>(null);
  const showCommunication = useMapStore((s) => s.showCommunication);

  useEffect(() => {
    if (!viewer || viewer.isDestroyed()) return;

    if (showCommunication && !dataSourceRef.current) {
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
          viewer.scene.requestRender();
        } catch (err) {
          console.warn('Failed to load Communication KML:', err);
        }
      })();
    } else if (!showCommunication && dataSourceRef.current) {
      if (!viewer.isDestroyed()) {
        viewer.dataSources.remove(dataSourceRef.current, true);
        viewer.scene.requestRender();
      }
      dataSourceRef.current = null;
    }
  }, [viewer, showCommunication]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (viewer && !viewer.isDestroyed() && dataSourceRef.current) {
        viewer.dataSources.remove(dataSourceRef.current, true);
        dataSourceRef.current = null;
      }
    };
  }, [viewer]);

  return null;
}
