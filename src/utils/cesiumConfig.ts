import * as Cesium from 'cesium';

// Token keys mapping to environment variables
const TOKENS: Record<string, string> = {
  TOKEN_1: process.env.NEXT_PUBLIC_CESIUM_TOKEN_1 || '',
  TOKEN_2: process.env.NEXT_PUBLIC_CESIUM_TOKEN_2 || '',
  ION_DEFAULT: process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN || '',
};

export function getToken(key: string): string {
  return TOKENS[key] || '';
}

// Ion model definitions
export interface IonModelDef {
  id: string;
  name: string;
  assetId: number;
  tokenKey: string;
  longitude: number;
  latitude: number;
}

export const ION_MODELS: IonModelDef[] = [
  {
    id: 'nobu',
    name: 'Nobu',
    assetId: 4481945,
    tokenKey: 'TOKEN_1',
    longitude: 49.946508,
    latitude: 40.588146,
  },
  {
    id: 'montenegro',
    name: 'Montenegro',
    assetId: 4346739,
    tokenKey: 'TOKEN_1',
    longitude: 49.949684,
    latitude: 40.585082,
  },
  {
    id: 'brabus-land',
    name: 'Brabus Land',
    assetId: 4367726,
    tokenKey: 'TOKEN_2',
    longitude: 49.944642,
    latitude: 40.587625,
  },
  {
    id: 'brabus-bina',
    name: 'Brabus Bina',
    assetId: 4367733,
    tokenKey: 'TOKEN_2',
    longitude: 49.944642,
    latitude: 40.587625,
  },
];

// Skypark local model definition
export const SKYPARK = {
  id: 'skypark',
  name: 'Sky Park',
  url: '/models/skypark.glb',
  longitude: 49.939449,
  latitude: 40.580650,
};

/**
 * Load an Ion 3D Tileset with a specific token.
 * Models use their original embedded coordinates (no repositioning needed).
 */
export async function loadIonTileset(
  viewer: Cesium.Viewer,
  assetId: number,
  token: string,
  name: string,
): Promise<Cesium.Cesium3DTileset> {
  const resource = await Cesium.IonResource.fromAssetId(assetId, {
    accessToken: token,
  });
  const tileset = await Cesium.Cesium3DTileset.fromUrl(resource);

  // Force all materials fully opaque — no see-through glass
  tileset.customShader = new Cesium.CustomShader({
    translucencyMode: Cesium.CustomShaderTranslucencyMode.OPAQUE,
    fragmentShaderText: `
      void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
        material.alpha = 1.0;
      }
    `,
  });

  viewer.scene.primitives.add(tileset);

  console.log(`Loaded Ion tileset: ${name} (asset ${assetId})`);

  return tileset;
}

/**
 * Load a local GLB model as an Entity.
 */
export function loadLocalModel(
  viewer: Cesium.Viewer,
  url: string,
  longitude: number,
  latitude: number,
  heading: number = 0
): Cesium.Entity {
  const position = Cesium.Cartesian3.fromDegrees(longitude, latitude);
  const hpr = new Cesium.HeadingPitchRoll(
    Cesium.Math.toRadians(heading),
    0,
    0
  );
  const orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);

  return viewer.entities.add({
    position,
    orientation: orientation as any,
    model: {
      uri: url,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    },
  });
}
