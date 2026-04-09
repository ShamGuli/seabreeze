export interface MapConfig {
  id: string;
  nameI18n: { az: string; ru: string; en: string };
  center: { longitude: number; latitude: number };
  initialHeight: number;
  initialPitch: number;
  buildingsJsonPath: string;
  features: {
    communication: boolean;
    basePlan: boolean;
    models3D: boolean;
  };
  // Ion tokens and assets
  tilesetTokenKeys: string[];
  basePlanToken: string;
  basePlanAssetIds: number[];
  commToken?: string;
  commKmlAssetId?: number;
  orthoToken?: string;
  orthoAssetId?: number;
}

export const MAP_CONFIGS: MapConfig[] = [
  {
    id: 'nardaran',
    nameI18n: { az: 'Nardaran', ru: 'Нардаран', en: 'Nardaran' },
    center: { longitude: 49.940, latitude: 40.582 },
    initialHeight: 5000,
    initialPitch: -90,
    buildingsJsonPath: '/data/buildings.json',
    features: {
      communication: true,
      basePlan: true,
      models3D: true,
    },
    tilesetTokenKeys: ['TOKEN_3', 'TOKEN_4'],
    basePlanToken: process.env.NEXT_PUBLIC_CESIUM_BASEPLAN_TOKEN || '',
    basePlanAssetIds: [4594912, 4595054, 4595004, 4594980, 4599368],
    commToken: process.env.NEXT_PUBLIC_CESIUM_COMM_TOKEN || '',
    commKmlAssetId: 4599391,
    orthoToken: process.env.NEXT_PUBLIC_CESIUM_ORTHO_TOKEN || '',
    orthoAssetId: 4250769,
  },
  {
    id: 'charvak',
    nameI18n: { az: 'Çarvak', ru: 'Чарвак', en: 'Charvak' },
    center: { longitude: 69.98, latitude: 41.62 },
    initialHeight: 5000,
    initialPitch: -90,
    buildingsJsonPath: '/data/buildings-charvak.json',
    features: {
      communication: false,
      basePlan: true,
      models3D: true,
    },
    tilesetTokenKeys: [],  // token-lər sonra əlavə olunacaq
    basePlanToken: process.env.NEXT_PUBLIC_CESIUM_CHARVAK_BASEPLAN_TOKEN || '',
    basePlanAssetIds: [],   // asset ID-lər sonra əlavə olunacaq
  },
];

export function getMapConfig(id: string): MapConfig {
  return MAP_CONFIGS.find((c) => c.id === id) ?? MAP_CONFIGS[0];
}
