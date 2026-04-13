'use client';

import { useMapStore, type CommFilterKey } from '@/store/mapStore';
import { CATEGORY_COLORS, type BuildingCategory } from '@/data/categories';
import { COMM_GROUP_COLORS } from '@/components/map/CommunicationOverlay';
import { useLang } from '@/context/LanguageContext';
import { getMapConfig } from '@/data/mapConfigs';

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
  const showCommWells = useMapStore((s) => s.showCommWells);
  const toggleCommWells = useMapStore((s) => s.toggleCommWells);
  const showCommLines = useMapStore((s) => s.showCommLines);
  const toggleCommLines = useMapStore((s) => s.toggleCommLines);
  const showCategoryBar = useMapStore((s) => s.showCategoryBar);
  const toggleCategoryBar = useMapStore((s) => s.toggleCategoryBar);
  const activeMapId = useMapStore((s) => s.activeMapId);
  const mapBuildings = useMapStore((s) => s.mapBuildings);

  const showOrtho = useMapStore((s) => s.showOrtho);
  const toggleOrtho = useMapStore((s) => s.toggleOrtho);
  const showBasePlan = useMapStore((s) => s.showBasePlan);
  const showBasePlanLayers = useMapStore((s) => s.showBasePlanLayers);
  const toggleBasePlanLayers = useMapStore((s) => s.toggleBasePlanLayers);

  // ═══ COMMUNICATION MODE ═══
  if (showCommunication) {
    const allOn = activeCommFilters.length === COMM_GROUPS.length;

    return (
      <div className="animate-slide-up category-scroll" style={{
        position: 'absolute', bottom: 20, left: 0, right: 0,
        marginLeft: 'auto', marginRight: 'auto', width: 'fit-content',
        zIndex: 20, display: 'flex', gap: 4, alignItems: 'center',
        padding: '4px 6px', borderRadius: 16,
        maxWidth: '96vw', overflowX: 'hidden',
        background: 'rgba(15,15,20,0.85)',
        backdropFilter: 'blur(12px)',
      }}>
        {/* ON/OFF toggle */}
        <button
          onClick={() => setAllCommFilters(!allOn)}
          className="glow-btn"
          style={{
            padding: '4px 10px', borderRadius: 12,
            border: `1.5px solid ${allOn ? '#4FD1C5' : '#EF4444'}`,
            background: allOn ? 'rgba(79, 209, 197, 0.45)' : 'rgba(239, 68, 68, 0.35)',
            color: '#fff',
            fontSize: 11, fontWeight: 600, cursor: 'pointer',
            whiteSpace: 'nowrap' as const,
          }}
        >
          {allOn ? 'ON' : 'OFF'}
        </button>

        {/* Category filters */}
        {COMM_GROUPS.map((g) => {
          const active = activeCommFilters.includes(g.key);
          return (
            <button
              key={g.key}
              className="glow-btn"
              onClick={() => toggleCommFilter(g.key)}
              style={{
                padding: '4px 8px', borderRadius: 12,
                border: `1.5px solid ${g.color}`,
                background: active ? g.color : 'rgba(25,25,30,0.9)',
                color: '#fff',
                fontSize: 10, fontWeight: 600, cursor: 'pointer',
                whiteSpace: 'nowrap' as const,
                display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center' }}>
                {g.icon}
              </span>
              {g.label}
            </button>
          );
        })}

        {/* ── Separator ── */}
        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />

        {/* Ortho toggle */}
        <button
          onClick={toggleOrtho}
          className="glow-btn"
          style={{
            padding: '4px 10px', borderRadius: 12,
            border: 'none',
            background: showOrtho ? '#6366F1' : '#6B7280',
            color: '#fff',
            fontSize: 10, fontWeight: 600, cursor: 'pointer',
            whiteSpace: 'nowrap' as const,
            display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 3v18" /></svg>
          Ortho
        </button>

        {/* Xəttlər toggle */}
        <button
          onClick={toggleCommLines}
          className="glow-btn"
          style={{
            padding: '4px 10px', borderRadius: 12,
            border: 'none',
            background: showCommLines ? '#10B981' : '#6B7280',
            color: '#fff',
            fontSize: 10, fontWeight: 600, cursor: 'pointer',
            whiteSpace: 'nowrap' as const,
            display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 17l6-6 4 4 8-8" /></svg>
          Xəttlər
        </button>

        {/* Quyular toggle */}
        <button
          onClick={toggleCommWells}
          className="glow-btn"
          style={{
            padding: '4px 10px', borderRadius: 12,
            border: 'none',
            background: showCommWells ? '#10B981' : '#6B7280',
            color: '#fff',
            fontSize: 10, fontWeight: 600, cursor: 'pointer',
            whiteSpace: 'nowrap' as const,
            display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill={showCommWells ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="8" /></svg>
          Quyular
        </button>
      </div>
    );
  }

  // ═══ BASE PLAN MODE ═══
  if (showBasePlan && !showCommunication) {
    return (
      <div className="animate-slide-up" style={{
        position: 'absolute', bottom: 20, left: 0, right: 0,
        marginLeft: 'auto', marginRight: 'auto', width: 'fit-content',
        zIndex: 20, display: 'flex', gap: 4, alignItems: 'center',
        padding: '4px 6px', borderRadius: 16,
        background: 'rgba(15,15,20,0.85)',
        backdropFilter: 'blur(12px)',
      }}>
        <button
          onClick={toggleOrtho}
          className="glow-btn"
          style={{
            padding: '4px 10px', borderRadius: 12,
            border: 'none',
            background: showOrtho ? '#6366F1' : '#6B7280',
            color: '#fff',
            fontSize: 10, fontWeight: 600, cursor: 'pointer',
            whiteSpace: 'nowrap' as const,
            display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 3v18" /></svg>
          Ortho
        </button>
        <button
          onClick={toggleBasePlanLayers}
          className="glow-btn"
          style={{
            padding: '4px 10px', borderRadius: 12,
            border: 'none',
            background: showBasePlanLayers ? '#0EA5E9' : '#6B7280',
            color: '#fff',
            fontSize: 10, fontWeight: 600, cursor: 'pointer',
            whiteSpace: 'nowrap' as const,
            display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
          Plan
        </button>
      </div>
    );
  }

  // ═══ NORMAL MODE ═══
  // Hide category UI for maps without buildings (e.g. Charvak)
  if (activeMapId !== 'nardaran') return null;

  return (
    <>
      {/* Info button — sol yuxarı */}
      <button
        onClick={toggleCategoryBar}
        style={{
          position: 'absolute', top: 16, left: 16, zIndex: 20,
          width: 40, height: 40, borderRadius: '50%',
          border: 'none',
          background: showCategoryBar ? 'rgba(79, 209, 197, 0.9)' : 'rgba(15,15,20,0.85)',
          backdropFilter: 'blur(12px)',
          color: '#fff',
          fontSize: 20, fontWeight: 700, fontStyle: 'italic', fontFamily: 'Georgia, serif',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.2s',
        }}
      >
        i
      </button>

      {/* Category bar — yalnız açıq olanda */}
      {showCategoryBar && (
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
            onClick={() => {
              if (!markersHidden && !activeCategory) {
                // All ON → turn OFF
                toggleMarkersHidden();
              } else {
                // OFF or filtered → turn all ON
                if (markersHidden) toggleMarkersHidden();
                setActiveCategory(null);
              }
            }}
            className="glow-btn"
            style={{
              padding: '6px 14px', borderRadius: 16,
              border: `1.5px solid ${!markersHidden ? '#4FD1C5' : '#EF4444'}`,
              background: !markersHidden ? 'rgba(79, 209, 197, 0.45)' : 'rgba(239, 68, 68, 0.35)',
              color: '#fff',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              whiteSpace: 'nowrap' as const,
            }}
          >
            {!markersHidden ? 'ON' : 'OFF'}
          </button>

          {CATEGORIES.map((cat) => {
            const active = activeCategory === cat;
            const color = CATEGORY_COLORS[cat];
            return (
              <button
                key={cat}
                className="glow-btn"
                onClick={() => { if (markersHidden) toggleMarkersHidden(); setActiveCategory(active ? null : cat); }}
                style={{
                  padding: '6px 12px', borderRadius: 16,
                  border: `1.5px solid ${markersHidden ? color + '40' : color}`,
                  background: active && !markersHidden ? color : 'rgba(25,25,30,0.9)',
                  color: markersHidden ? '#aaa' : '#fff',
                  fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  whiteSpace: 'nowrap' as const,
                }}
              >
                {t(CAT_LABEL_KEYS[cat])}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
