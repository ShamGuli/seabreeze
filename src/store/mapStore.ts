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
  setSelectedBuilding: (building: Building | null) => void;
  setActiveCategory: (category: BuildingCategory | null) => void;
  setSearchQuery: (query: string) => void;
  toggleMarkersHidden: () => void;
  setFlyToOverview: (fn: (() => void) | null) => void;
  setIs3D: (val: boolean) => void;
  setIs3DLoading: (val: boolean) => void;
  setShowBasePlan: (val: boolean) => void;
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
  setSelectedBuilding: (building) => set({ selectedBuilding: building }),
  setActiveCategory: (category) => set({ activeCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  toggleMarkersHidden: () => set((s) => ({ markersHidden: !s.markersHidden })),
  setFlyToOverview: (fn) => set({ flyToOverview: fn }),
  setIs3D: (val) => set({ is3D: val }),
  setIs3DLoading: (val) => set({ is3DLoading: val }),
  setShowBasePlan: (val) => set({ showBasePlan: val }),
}));
