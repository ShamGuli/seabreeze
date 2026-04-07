import { create } from 'zustand';
import type { Building } from '@/data/buildings';
import type { BuildingCategory } from '@/data/categories';

export type CommFilterKey = 'elektrik' | 'drenaj' | 'kanalizasiya' | 'qaz' | 'su_icmeli' | 'su_texniki';

const ALL_COMM: CommFilterKey[] = ['elektrik', 'drenaj', 'kanalizasiya', 'qaz', 'su_icmeli', 'su_texniki'];

interface MapState {
  selectedBuilding: Building | null;
  activeCategory: BuildingCategory | null;
  searchQuery: string;
  markersHidden: boolean;
  flyToOverview: (() => void) | null;
  is3D: boolean;
  is3DLoading: boolean;
  showBasePlan: boolean;
  showCommunication: boolean;
  activeCommFilters: CommFilterKey[];
  showCommWells: boolean;
  showCommLines: boolean;
  showCategoryBar: boolean;
  toggleCommWells: () => void;
  toggleCommLines: () => void;
  toggleCategoryBar: () => void;
  setSelectedBuilding: (building: Building | null) => void;
  setActiveCategory: (category: BuildingCategory | null) => void;
  setSearchQuery: (query: string) => void;
  toggleMarkersHidden: () => void;
  setFlyToOverview: (fn: (() => void) | null) => void;
  setIs3D: (val: boolean) => void;
  setIs3DLoading: (val: boolean) => void;
  setShowBasePlan: (val: boolean) => void;
  setShowCommunication: (val: boolean) => void;
  toggleCommFilter: (key: CommFilterKey) => void;
  setAllCommFilters: (on: boolean) => void;
}

export const useMapStore = create<MapState>((set) => ({
  selectedBuilding: null,
  activeCategory: null,
  searchQuery: '',
  markersHidden: false,
  flyToOverview: null,
  is3D: false,
  is3DLoading: false,
  showBasePlan: false,
  showCommunication: false,
  activeCommFilters: [...ALL_COMM],
  showCommWells: true,
  showCommLines: true,
  showCategoryBar: false,
  toggleCommWells: () => set((s) => ({ showCommWells: !s.showCommWells })),
  toggleCommLines: () => set((s) => ({ showCommLines: !s.showCommLines })),
  toggleCategoryBar: () => set((s) => ({ showCategoryBar: !s.showCategoryBar })),
  setSelectedBuilding: (building) => set({ selectedBuilding: building }),
  setActiveCategory: (category) => set({ activeCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  toggleMarkersHidden: () => set((s) => ({ markersHidden: !s.markersHidden })),
  setFlyToOverview: (fn) => set({ flyToOverview: fn }),
  setIs3D: (val) => set(val ? { is3D: true, showBasePlan: false, showCommunication: false } : { is3D: false }),
  setIs3DLoading: (val) => set({ is3DLoading: val }),
  setShowBasePlan: (val) => set(val ? { showBasePlan: true, is3D: false, showCommunication: false, selectedBuilding: null } : { showBasePlan: false }),
  setShowCommunication: (val) => set(val
    ? { showCommunication: true, is3D: false, showBasePlan: false, activeCommFilters: [...ALL_COMM], showCommWells: true, showCommLines: true }
    : { showCommunication: false }
  ),
  toggleCommFilter: (key) => set((s) => {
    const has = s.activeCommFilters.includes(key);
    return { activeCommFilters: has ? s.activeCommFilters.filter(k => k !== key) : [...s.activeCommFilters, key] };
  }),
  setAllCommFilters: (on) => set({ activeCommFilters: on ? [...ALL_COMM] : [] }),
}));
