import * as Cesium from 'cesium';

// Token keys mapping to environment variables
const TOKENS: Record<string, string> = {
  TOKEN_1: process.env.NEXT_PUBLIC_CESIUM_TOKEN_1 || '',
  TOKEN_2: process.env.NEXT_PUBLIC_CESIUM_TOKEN_2 || '',
  TOKEN_3: process.env.NEXT_PUBLIC_CESIUM_TOKEN_3 || '',
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
  heightOffset?: number;
}

export const ION_MODELS: IonModelDef[] = [];

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
  heightOffset: number = 0,
): Promise<Cesium.Cesium3DTileset> {
  const resource = await Cesium.IonResource.fromAssetId(assetId, {
    accessToken: token,
  });
  const tileset = await Cesium.Cesium3DTileset.fromUrl(resource);

  // Push model down to hide built-in ground plane beneath satellite imagery
  if (heightOffset !== 0) {
    const center = tileset.boundingSphere.center;
    const carto = Cesium.Cartographic.fromCartesian(center);
    const adjusted = Cesium.Cartesian3.fromRadians(
      carto.longitude,
      carto.latitude,
      carto.height + heightOffset,
    );
    const offset = Cesium.Cartesian3.subtract(adjusted, center, new Cesium.Cartesian3());
    tileset.modelMatrix = Cesium.Matrix4.fromTranslation(offset);
  }

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
