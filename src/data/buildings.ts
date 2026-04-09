import { type BuildingCategory, classifyBuilding } from './categories';

export interface Building {
  id: string;
  name: string;
  longitude: number;
  latitude: number;
  area_ha?: number;
  category: BuildingCategory;
}

// Import the generated JSON at build time (Nardaran default)
import rawBuildings from '../../public/data/buildings.json';

export const buildings: Building[] = rawBuildings.map((b) => ({
  ...b,
  category: classifyBuilding(b.name),
}));

// Dynamic loader for any map
export async function fetchBuildingsForMap(jsonPath: string): Promise<Building[]> {
  try {
    const res = await fetch(jsonPath);
    if (!res.ok) return [];
    const raw = await res.json();
    return raw.map((b: any) => ({
      ...b,
      category: classifyBuilding(b.name),
    }));
  } catch {
    return [];
  }
}
