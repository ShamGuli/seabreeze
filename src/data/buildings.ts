import { type BuildingCategory, classifyBuilding } from './categories';

export interface Building {
  id: string;
  name: string;
  longitude: number;
  latitude: number;
  area_ha?: number;
  category: BuildingCategory;
}

// Import the generated JSON at build time
import rawBuildings from '../../public/data/buildings.json';

export const buildings: Building[] = rawBuildings.map((b) => ({
  ...b,
  category: classifyBuilding(b.name),
}));
