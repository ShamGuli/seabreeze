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
  excludeAssetIds?: number[];
  basePlanToken: string;
  basePlanAssetIds: number[];       // IMAGERY assets
  basePlanKmlIds: number[];         // KML assets (polygons, lines)
  commToken?: string;
  commKmlAssetId?: number;
  orthoAssets?: { assetId: number; token: string }[];
  roadKmlId?: number;
  roadKmlToken?: string;
  namesToken?: string;
  namesAssetId?: number;
}

export const MAP_CONFIGS: MapConfig[] = [
  {
    id: 'nardaran',
    nameI18n: { az: 'SB Bakı', ru: 'SB Баку', en: 'SB Baku' },
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
    basePlanToken: process.env.NEXT_PUBLIC_CESIUM_ORTHO_TOKEN_2 || '',
    basePlanAssetIds: [4630772],
    namesToken: process.env.NEXT_PUBLIC_CESIUM_ASSET_TOKEN || '',
    namesAssetId: 4619773,
    basePlanKmlIds: [],
    commToken: process.env.NEXT_PUBLIC_CESIUM_ASSET_TOKEN || '',
    commKmlAssetId: 4599391,
    orthoAssets: [
      { assetId: 4250769, token: process.env.NEXT_PUBLIC_CESIUM_ORTHO_TOKEN || '' },
      { assetId: 4631310, token: process.env.NEXT_PUBLIC_CESIUM_ORTHO_TOKEN_2 || '' },
    ],
    roadKmlId: 4630705,
    roadKmlToken: process.env.NEXT_PUBLIC_CESIUM_ORTHO_TOKEN_2 || '',
  },
  {
    id: 'charvak',
    nameI18n: { az: 'SB Özbəkistan', ru: 'SB Узбекистан', en: 'SB Uzbekistan' },
    center: { longitude: 70.060, latitude: 41.655 },
    initialHeight: 5000,
    initialPitch: -90,
    buildingsJsonPath: '/data/buildings-charvak.json',
    features: {
      communication: false,
      basePlan: true,
      models3D: true,
    },
    tilesetTokenKeys: ['CHARVAK_TOKEN'],
    excludeAssetIds: [],
    basePlanToken: process.env.NEXT_PUBLIC_CESIUM_CHARVAK_TOKEN || '',
    basePlanAssetIds: [],
    basePlanKmlIds: [],
  },
];

export function getMapConfig(id: string): MapConfig {
  return MAP_CONFIGS.find((c) => c.id === id) ?? MAP_CONFIGS[0];
}
