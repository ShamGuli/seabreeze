'use client';

import { useMapStore } from '@/store/mapStore';
import { CATEGORY_COLORS, type BuildingCategory } from '@/data/categories';
import { useLang } from '@/context/LanguageContext';

const CATEGORIES = Object.keys(CATEGORY_COLORS) as BuildingCategory[];

const CAT_LABEL_KEYS: Record<BuildingCategory, string> = {
  hotel:         'catHotel',
  residence:     'catResidence',
  villa:         'catVilla',
  entertainment: 'catEntertainment',
  beach:         'catBeach',
  restaurant:    'catRestaurant',
  education:     'catEducation',
  service:       'catService',
  landmark:      'catLandmark',
};

export default function CategoryFilter() {
  const { t } = useLang();
  const activeCategory = useMapStore((s) => s.activeCategory);
  const setActiveCategory = useMapStore((s) => s.setActiveCategory);
  const markersHidden = useMapStore((s) => s.markersHidden);
  const toggleMarkersHidden = useMapStore((s) => s.toggleMarkersHidden);

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
        flexWrap: 'nowrap',
        alignItems: 'center',
        maxWidth: '90vw',
        overflowX: 'auto',
        padding: '8px 12px',
        background: 'rgba(15, 15, 30, 0.85)',
        backdropFilter: 'blur(12px)',
        borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <button
        onClick={toggleMarkersHidden}
        style={{
          padding: '5px 14px',
          borderRadius: 20,
          border: '1.5px solid rgba(255,255,255,0.6)',
          background: markersHidden ? 'white' : 'rgba(255,255,255,0.15)',
          color: markersHidden ? '#111' : 'white',
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.15s',
          whiteSpace: 'nowrap',
          marginRight: 4,
        }}
      >
        {markersHidden ? t('showAll') : t('hideAll')}
      </button>
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
              whiteSpace: 'nowrap',
              opacity: active ? 1 : 0.7,
            }}
          >
            {t(CAT_LABEL_KEYS[cat])}
          </button>
        );
      })}
    </div>
  );
}
