import { create } from 'zustand';
import type { Building } from '@/data/buildings';
import type { BuildingCategory } from '@/data/categories';

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
  setSelectedBuilding: (building: Building | null) => void;
  setActiveCategory: (category: BuildingCategory | null) => void;
  setSearchQuery: (query: string) => void;
  toggleMarkersHidden: () => void;
  setFlyToOverview: (fn: (() => void) | null) => void;
  setIs3D: (val: boolean) => void;
  setIs3DLoading: (val: boolean) => void;
  setShowBasePlan: (val: boolean) => void;
  setShowCommunication: (val: boolean) => void;
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
  setSelectedBuilding: (building) => set({ selectedBuilding: building }),
  setActiveCategory: (category) => set({ activeCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  toggleMarkersHidden: () => set((s) => ({ markersHidden: !s.markersHidden })),
  setFlyToOverview: (fn) => set({ flyToOverview: fn }),
  // Mutual exclusion: enabling one disables the others
  setIs3D: (val) => set(val ? { is3D: true, showBasePlan: false, showCommunication: false } : { is3D: false }),
  setIs3DLoading: (val) => set({ is3DLoading: val }),
  setShowBasePlan: (val) => set(val ? { showBasePlan: true, is3D: false, showCommunication: false } : { showBasePlan: false }),
  setShowCommunication: (val) => set(val ? { showCommunication: true, is3D: false, showBasePlan: false } : { showCommunication: false }),
}));
