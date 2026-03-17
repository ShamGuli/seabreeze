'use client';

import { useMapStore } from '@/store/mapStore';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/data/categories';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar() {
  const building = useMapStore((s) => s.selectedBuilding);
  const setSelectedBuilding = useMapStore((s) => s.setSelectedBuilding);
  const flyToOverview = useMapStore((s) => s.flyToOverview);

  return (
    <AnimatePresence>
      {building && (
        <motion.div
          initial={{ x: -340, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -340, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 250 }}
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            bottom: 16,
            width: 320,
            zIndex: 20,
            background: 'rgba(15, 15, 30, 0.92)',
            backdropFilter: 'blur(16px)',
            borderRadius: 16,
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '20px 20px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <div style={{ flex: 1 }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: 20,
                  fontWeight: 600,
                  lineHeight: 1.3,
                }}
              >
                {building.name}
              </h2>
              <span
                style={{
                  display: 'inline-block',
                  marginTop: 8,
                  padding: '3px 10px',
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 500,
                  background: CATEGORY_COLORS[building.category],
                  color: 'white',
                }}
              >
                {CATEGORY_LABELS[building.category]}
              </span>
            </div>
            <button
              onClick={() => {
                setSelectedBuilding(null);
                flyToOverview?.();
              }}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: 'white',
                width: 32,
                height: 32,
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginLeft: 12,
              }}
            >
              x
            </button>
          </div>

          {/* Details */}
          <div style={{ padding: 20, flex: 1 }}>
            {building.area_ha && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  fontSize: 14,
                }}
              >
                <span style={{ color: 'rgba(255,255,255,0.6)' }}>Area</span>
                <span style={{ fontWeight: 500 }}>{building.area_ha} ha</span>
              </div>
            )}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                fontSize: 14,
              }}
            >
              <span style={{ color: 'rgba(255,255,255,0.6)' }}>
                Coordinates
              </span>
              <span style={{ fontWeight: 500, fontFamily: 'monospace' }}>
                {building.latitude.toFixed(4)}, {building.longitude.toFixed(4)}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
