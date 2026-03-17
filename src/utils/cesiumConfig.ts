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
  heightOffset?: number;
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
    id: 'eva',
    name: 'EVA',
    assetId: 4525522,
    tokenKey: 'TOKEN_1',
    longitude: 49.967888,
    latitude: 40.591375,
  },
  {
    id: 'digital',
    name: 'Digital Residence',
    assetId: 4537132,
    tokenKey: 'TOKEN_2',
    longitude: 49.955,
    latitude: 40.590,
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

  // Image-based lighting for realistic PBR rendering
  const ibl = new Cesium.ImageBasedLighting();
  ibl.luminanceAtZenith = 0.7;
  ibl.sphericalHarmonicCoefficients = [
    new Cesium.Cartesian3(0.8, 0.8, 0.85),
    new Cesium.Cartesian3(0.3, 0.3, 0.35),
    new Cesium.Cartesian3(0.2, 0.2, 0.2),
    new Cesium.Cartesian3(-0.1, -0.1, -0.1),
    new Cesium.Cartesian3(-0.1, -0.1, -0.1),
    new Cesium.Cartesian3(0.1, 0.1, 0.1),
    new Cesium.Cartesian3(0.05, 0.05, 0.05),
    new Cesium.Cartesian3(-0.1, -0.1, -0.1),
    new Cesium.Cartesian3(0.1, 0.1, 0.1),
  ];
  tileset.imageBasedLighting = ibl;

  // PBR custom shader — boost diffuse color + subtle emissive
  tileset.customShader = new Cesium.CustomShader({
    lightingModel: Cesium.LightingModel.PBR,
    fragmentShaderText: `
      void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
        material.diffuse *= 1.3;
        material.emissive = material.diffuse * 0.15;
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
