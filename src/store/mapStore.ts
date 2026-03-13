import { create } from 'zustand';
import type { Building } from '@/data/buildings';
import type { BuildingCategory } from '@/data/categories';

interface MapState {
  selectedBuilding: Building | null;
  activeCategory: BuildingCategory | null;
  searchQuery: string;
  setSelectedBuilding: (building: Building | null) => void;
  setActiveCategory: (category: BuildingCategory | null) => void;
  setSearchQuery: (query: string) => void;
}

export const useMapStore = create<MapState>((set) => ({
  selectedBuilding: null,
  activeCategory: null,
  searchQuery: '',
  setSelectedBuilding: (building) => set({ selectedBuilding: building }),
  setActiveCategory: (category) => set({ activeCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
