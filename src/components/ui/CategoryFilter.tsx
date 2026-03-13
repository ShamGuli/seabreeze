'use client';

import { useMapStore } from '@/store/mapStore';
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  type BuildingCategory,
} from '@/data/categories';

const CATEGORIES = Object.keys(CATEGORY_COLORS) as BuildingCategory[];

export default function CategoryFilter() {
  const activeCategory = useMapStore((s) => s.activeCategory);
  const setActiveCategory = useMapStore((s) => s.setActiveCategory);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 20,
        display: 'flex',
        gap: 6,
        flexWrap: 'wrap',
        justifyContent: 'center',
        maxWidth: '90vw',
        padding: '8px 12px',
        background: 'rgba(15, 15, 30, 0.85)',
        backdropFilter: 'blur(12px)',
        borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {CATEGORIES.map((cat) => {
        const active = activeCategory === cat;
        return (
          <button
            key={cat}
            onClick={() => setActiveCategory(active ? null : cat)}
            style={{
              padding: '5px 12px',
              borderRadius: 20,
              border: `1.5px solid ${CATEGORY_COLORS[cat]}`,
              background: active ? CATEGORY_COLORS[cat] : 'transparent',
              color: 'white',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s',
              opacity: active ? 1 : 0.7,
            }}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        );
      })}
    </div>
  );
}
