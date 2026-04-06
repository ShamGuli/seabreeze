'use client';

import { useMapStore, type CommFilterKey } from '@/store/mapStore';
import { CATEGORY_COLORS, type BuildingCategory } from '@/data/categories';
import { COMM_GROUP_COLORS } from '@/components/map/CommunicationOverlay';
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

interface CommGroup {
  key: CommFilterKey;
  label: string;
  icon: JSX.Element;
  color: string;
}

const COMM_GROUPS: CommGroup[] = [
  {
    key: 'elektrik', label: 'Elektrik', color: COMM_GROUP_COLORS.elektrik,
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="13,2 3,14 12,14 11,22 21,10 12,10" /></svg>,
  },
  {
    key: 'drenaj', label: 'Drenaj', color: COMM_GROUP_COLORS.drenaj,
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M2 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0" /><path d="M2 18c2-3 4-3 6 0s4 3 6 0 4-3 6 0" /></svg>,
  },
  {
    key: 'kanalizasiya', label: 'Kanalizasiya', color: COMM_GROUP_COLORS.kanalizasiya,
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M8 12h8" /><path d="M12 8v8" /></svg>,
  },
  {
    key: 'qaz', label: 'Qaz', color: COMM_GROUP_COLORS.qaz,
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 22c-4 0-7-3-7-7 0-4 7-13 7-13s7 9 7 13c0 4-3 7-7 7z" /></svg>,
  },
  {
    key: 'su_icmeli', label: 'Su (içməli)', color: COMM_GROUP_COLORS.su_icmeli,
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 22c-4 0-6-3-6-6 0-4 6-10 6-10s6 6 6 10c0 3-2 6-6 6z" /></svg>,
  },
  {
    key: 'su_texniki', label: 'Su (texniki)', color: COMM_GROUP_COLORS.su_texniki,
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 22c-4 0-6-3-6-6 0-4 6-10 6-10s6 6 6 10c0 3-2 6-6 6z" /><line x1="10" y1="16" x2="14" y2="16" /></svg>,
  },
];

export default function CategoryFilter() {
  const { t } = useLang();
  const activeCategory = useMapStore((s) => s.activeCategory);
  const setActiveCategory = useMapStore((s) => s.setActiveCategory);
  const markersHidden = useMapStore((s) => s.markersHidden);
  const toggleMarkersHidden = useMapStore((s) => s.toggleMarkersHidden);
  const showCommunication = useMapStore((s) => s.showCommunication);
  const activeCommFilters = useMapStore((s) => s.activeCommFilters);
  const toggleCommFilter = useMapStore((s) => s.toggleCommFilter);
  const setAllCommFilters = useMapStore((s) => s.setAllCommFilters);

  // ═══ COMMUNICATION MODE ═══
  if (showCommunication) {
    const allOn = activeCommFilters.length === COMM_GROUPS.length;

    return (
      <div className="glass animate-slide-up category-scroll" style={{
        position: 'absolute', bottom: 24, left: 0, right: 0,
        marginLeft: 'auto', marginRight: 'auto', width: 'fit-content',
        zIndex: 20, display: 'flex', gap: 3, alignItems: 'center',
        padding: '5px 6px', borderRadius: 18,
        maxWidth: '90vw', overflowX: 'auto',
      }}>
        <button
          onClick={() => setAllCommFilters(!allOn)}
          className="glow-btn"
          style={{
            padding: '9px 18px', borderRadius: 13, border: 'none',
            background: allOn ? 'rgba(79, 209, 197, 0.2)' : 'rgba(255,255,255,0.04)',
            color: allOn ? '#4FD1C5' : 'rgba(255,255,255,0.55)',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            whiteSpace: 'nowrap' as const,
            boxShadow: allOn ? '0 0 12px rgba(79,209,197,0.15)' : 'none',
          }}
        >
          Hamısı
        </button>

        {COMM_GROUPS.map((g) => {
          const active = activeCommFilters.includes(g.key);
          return (
            <button
              key={g.key}
              className="glow-btn"
              onClick={() => toggleCommFilter(g.key)}
              style={{
                padding: '7px 14px', borderRadius: 13, border: 'none',
                background: active ? g.color : 'rgba(255,255,255,0.04)',
                color: active ? 'white' : 'rgba(255,255,255,0.55)',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                whiteSpace: 'nowrap' as const,
                boxShadow: active ? `0 0 16px ${g.color}50` : 'none',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', color: active ? 'white' : g.color }}>
                {g.icon}
              </span>
              {g.label}
            </button>
          );
        })}
      </div>
    );
  }

  // ═══ NORMAL MODE ═══
  return (
    <div className="animate-slide-up category-scroll" style={{
      position: 'absolute', bottom: 24, left: 0, right: 0,
      marginLeft: 'auto', marginRight: 'auto', width: 'fit-content',
      zIndex: 20, display: 'flex', gap: 5, alignItems: 'center',
      padding: '6px 8px', borderRadius: 18,
      maxWidth: '96vw', overflowX: 'hidden',
      background: 'rgba(15,15,20,0.85)',
      backdropFilter: 'blur(12px)',
    }}>
      <button
        onClick={() => { setActiveCategory(null); if (markersHidden) toggleMarkersHidden(); }}
        className="glow-btn"
        style={{
          padding: '6px 14px', borderRadius: 16,
          border: '1.5px solid #4FD1C5',
          background: !activeCategory && !markersHidden
            ? 'rgba(79, 209, 197, 0.45)' : 'rgba(25,25,30,0.9)',
          color: '#fff',
          fontSize: 13, fontWeight: 600, cursor: 'pointer',
          whiteSpace: 'nowrap' as const,
        }}
      >
        {t('showAll') || 'All'}
      </button>

      {CATEGORIES.map((cat) => {
        const active = activeCategory === cat;
        const color = CATEGORY_COLORS[cat];
        return (
          <button
            key={cat}
            className="glow-btn"
            onClick={() => setActiveCategory(active ? null : cat)}
            style={{
              padding: '6px 12px', borderRadius: 16,
              border: `1.5px solid ${color}`,
              background: active ? color : 'rgba(25,25,30,0.9)',
              color: '#fff',
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
              whiteSpace: 'nowrap' as const,
            }}
          >
            {t(CAT_LABEL_KEYS[cat])}
          </button>
        );
      })}
    </div>
  );
}
