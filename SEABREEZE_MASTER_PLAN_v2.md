# SeaBreeze 3D Interactive Map — Master Implementation Plan v2

> **Last updated:** 2026-03-13
> **Purpose:** Job interview demo prototype
> **Timeline:** 5-7 days
> **Workflow:** VS Code → Claude Opus 4.6 (Plan Mode → Agent Mode)

---

## 1. Project Context

**What:** Interactive 3D map of SeaBreeze resort city (Baku, Azerbaijan, Caspian Sea coastline ~5km).
**Why:** Demo prototype for job interview. If accepted, this becomes the production map for SeaBreeze website and mobile apps.
**Goal:** Smooth, visually impressive, professional-grade 3D map with real building models placed on real satellite imagery.

---

## 2. Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Framework** | Next.js 14 (App Router) | SSR, code splitting, optimal loading |
| **3D Engine** | CesiumJS | Native geo-coordinates, built-in satellite/terrain, camera fly-to, ground overlay, globe with zoom-lock to resort |
| **State** | Zustand | Lightweight, perfect for map/UI state |
| **UI** | Tailwind CSS + Framer Motion | Clean panels, smooth sidebar transitions |
| **Styling** | Tailwind CSS | Rapid utility-first styling |

### Why CesiumJS (not React Three Fiber)
- Native geo-coordinate system (lon/lat) — models placed by real coordinates
- Built-in Bing Maps satellite imagery + Cesium World Terrain (no Google API needed)
- Master plan overlay in 3 lines of code (SingleTileImageryProvider)
- Ion platform handles 3D Tiles optimization automatically
- Camera fly-to with geo-aware animation built-in
- Production-ready: same code embeds into SeaBreeze website/mobile app (WebView)
- No need for Google Maps API — Cesium provides everything

---

## 3. Real Assets Inventory

### 3.1 — 3D Models (5 confirmed)

| # | Model | Source | File/Asset | Status |
|---|-------|--------|-----------|--------|
| 1 | **Skypark** | Local GLB | `skypark__2__compressed.glb` (14MB) | ✅ Web-ready, no optimization needed |
| 2 | **Nobu** | Cesium Ion | Asset ID: **4481945** | ✅ Ion-optimized 3D Tiles |
| 3 | **Montenegro** | Cesium Ion | Asset ID: **4346739** | ✅ Ion-optimized 3D Tiles |
| 4 | **Brabus Land** | Cesium Ion | Asset ID: **4367726** | ✅ Ion-optimized 3D Tiles |
| 5 | **Brabus Bina** | Cesium Ion | Asset ID: **4367733** | ✅ Ion-optimized 3D Tiles |

### 3.2 — Cesium Ion Access Tokens

**Token 1** — Nobu + Montenegro (same account, confirmed by client):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxZTVjN2IzMi1jMzUxLTRlNGQtYmJmNi1kY2VlNDMwZTVhYTgiLCJpZCI6MzI4ODczLCJpYXQiOjE3NTQzODMzOTR9.YV7FLJInVF05hlrrqaI9sB1j7EEc1i6qxN3kDH4aafk
```

**Token 2** — Brabus Land + Brabus Bina:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwY2VhMzQ1NS1iOWVkLTQ5YzItYjZiZi04ODMzNGQxMzQ3ZmUiLCJpZCI6Mzc4NDAwLCJpYXQiOjE3NjgzNzkzNDd9.t_X6c7pLN02otlOtpumK5F5ScB7a8t-aCw7DA4FhYcc
```

**Token 3 (Default)** — Terrain + Bing Maps Aerial (Shamil's free-tier account):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmNTJjODMwYS0yNzU2LTQzODktOGY3MC0zZmE4M2Q3ODhhOWMiLCJpZCI6NDAyOTkzLCJpYXQiOjE3NzMzOTYzOTJ9.iSO65sm1ukaae8RFzxpxgH6CxzLeeshZJqMVcJJpXjQ
```
Scopes: `assets:read`, `geocode`

### 3.3 — Model Coordinates (CONFIRMED by client)

| Model | Latitude | Longitude | Source |
|-------|----------|-----------|--------|
| **Skypark** | 40.580650 | 49.939449 | Client WhatsApp |
| **Brabus** | 40.587625 | 49.944642 | Client WhatsApp |
| **Nobu** | 40.588146 | 49.946508 | Client WhatsApp |
| **Montenegro** | 40.585082 | 49.949684 | Client WhatsApp |

> ⚠️ These are the authoritative coordinates. KMZ polygon centroids differ by 30-150m.

### 3.4 — Other Assets

| Asset | Details | Usage |
|-------|---------|-------|
| Master Plan PNG | 15MB, full resort layout | Ground overlay (compress to JPG ~2MB) |
| Skypark Renders | 12 images | Sidebar image carousel |
| KMZ Data | 9000+ polygons, 120+ named areas | Placeholder buildings, labels, categories |

---

## 4. KMZ Data Summary

Extracted from `SB_areas.kmz` — 120+ named zones with polygon centroids:

### Key Named Areas (for placeholder buildings & markers)

| Category | Examples |
|----------|----------|
| **Hotels** | Swiss Hotel, Rixos Hotel, Radisson Blu, Dream Hotel, Nobu, Hyatt Residence |
| **Residences** | Park Residence 1-6, Malibu Residence, Miami Residence, Deluxe Residence, Monte Carlo Residence, Palazzo Del Mare, Harbour Residence, Prime Residence, Paradise Residence, Riviera Residence, Polo Residence, El Saab Residence, Gardens Residences, Marina Village 1 Residence, Premium Residence, Yes Apartments, Digital Residence, Sea View Towers, Renessans Towers, Marina Towers Residence 2 |
| **Villas** | 100 Villas, 200 Villas, Modern Villas, Wood Villas, White Villas, SB-2/3/4/5 Villas, Arabian Ranches, Villalar, Niki Villas |
| **Entertainment** | Casino, Luna Park, Water Park, Dream Fest, Funzilla, Karting, Katok (ice rink) |
| **Beach/Marina** | Niki Beach, Miami Beach, Palm Beach, Beach Club, Marina Yacht Club, Fisher Island, Venetian Harbor |
| **Restaurants** | Cayxana, Rose Bar, Fish Box, Famous Yunan, Cipiriani, Del Verde/Rosa/Vita/Ventus |
| **Education** | School & University, Landau School |
| **Landmarks** | Light House 1-4, Skyline 1-2, Ellipse, Blue Waters, PORT D AZUR, Caspian Dream Liner, Nine Senses Art Center |
| **Services** | Parking zones, Sales Office, SB Cons Office, Post-74 |

Full JSON with all 120+ named areas and coordinates saved: `seabreeze_areas.json`

---

## 5. Architecture

```
Next.js 14 App Router
└── CesiumJS Viewer (client-side, dynamic import ssr:false)
    │
    ├── BASE LAYERS
    │   ├── Cesium World Terrain (Ion Asset 1)
    │   ├── Bing Maps Aerial (Ion Asset 2)
    │   └── Master Plan Overlay (SingleTileImageryProvider, alpha 0.7, toggle)
    │
    ├── 3D MODELS — Ion Tilesets (multi-token)
    │   ├── Nobu        → Ion 4481945 (Token 1)
    │   ├── Montenegro  → Ion 4346739 (Token 1)
    │   ├── Brabus Land → Ion 4367726 (Token 2)
    │   └── Brabus Bina → Ion 4367733 (Token 2)
    │
    ├── 3D MODEL — Local GLB
    │   └── Skypark → public/models/skypark.glb (Entity with ModelGraphics)
    │       Position: lon=49.939449, lat=40.580650
    │       HeadingPitchRoll: adjust at runtime (visual alignment)
    │
    ├── PLACEHOLDER BUILDINGS (120+)
    │   └── Each: colored 3D box Entity at KMZ centroid + label
    │       Color-coded by category (hotel=blue, villa=green, etc.)
    │
    └── MARKERS & LABELS
        └── Billboard + Label entities for all named areas

UI Overlay (React + Tailwind + Framer Motion)
    ├── Sidebar
    │   ├── Building info (name, type, area in ha)
    │   ├── Image carousel (Skypark: 12 renders)
    │   └── Features/tags
    ├── Search Bar (fuzzy search across all 120+ names)
    ├── Category Filter (Hotels, Restaurants, Entertainment, Beach, etc.)
    ├── Master Plan toggle (overlay on/off)
    └── Loading Screen (branded)

State: Zustand (selectedBuilding, category, searchQuery, overlayVisible)
```

---

## 6. File Structure

```
seabreeze-map/
├── public/
│   ├── models/
│   │   └── skypark.glb                    # 14MB local model
│   ├── textures/
│   │   └── master-plan.jpg                # Compressed from 15MB PNG → ~2MB JPG
│   ├── images/
│   │   └── skypark/
│   │       ├── render-01.jpg ... render-12.jpg
│   ├── data/
│   │   └── buildings.json                 # All 120+ buildings: name, coords, category, model info
│   └── cesium/                            # CesiumJS static assets (Workers, ThirdParty, Assets, Widgets)
│       └── (copied by webpack CopyPlugin)
│
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                       # Dynamic import CesiumMap (ssr: false)
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── map/
│   │   │   ├── CesiumMap.tsx              # Main Viewer component
│   │   │   ├── BuildingLoader.tsx         # Multi-token Ion loader + local GLB loader
│   │   │   ├── ImageryOverlay.tsx         # Master plan overlay with toggle
│   │   │   ├── PlaceholderBuilding.tsx    # Colored box entities for 120+ buildings
│   │   │   ├── CameraController.tsx       # flyToBuilding(), flyToOverview(), setBounds()
│   │   │   └── SceneEffects.tsx           # Atmosphere, fog, IBL, golden hour lighting
│   │   │
│   │   └── ui/
│   │       ├── Sidebar.tsx                # Building details + image carousel
│   │       ├── SearchBar.tsx              # Fuzzy search all buildings
│   │       ├── CategoryFilter.tsx         # Filter: Hotels, Villas, Entertainment, Beach, etc.
│   │       ├── MasterPlanToggle.tsx       # Toggle overlay visibility
│   │       └── LoadingScreen.tsx          # Branded loading with progress
│   │
│   ├── data/
│   │   └── buildings.ts                   # TypeScript building registry
│   │       # ModelSource = { type: 'ion', assetId, token } | { type: 'local', url } | { type: 'placeholder' }
│   │       # Building = { id, name, nameAz, category, lon, lat, area_ha, modelSource, images? }
│   │
│   ├── store/
│   │   └── mapStore.ts                    # Zustand: selectedBuilding, filters, overlay state
│   │
│   └── utils/
│       ├── cesiumConfig.ts                # Token management, Ion asset loading helpers
│       └── categories.ts                  # Category definitions, colors, icons
│
├── .env.local                             # NEXT_PUBLIC_CESIUM_TOKEN_1, _TOKEN_2, _ION_TOKEN
├── next.config.js                         # CopyPlugin for Cesium static assets (CRITICAL)
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 7. Implementation Phases

### Phase 1 — Foundation (Day 1)
**Goal:** CesiumJS Viewer running in Next.js with satellite terrain visible

- `npx create-next-app@14 seabreeze-map --typescript --tailwind --app`
- `npm install cesium @cesium/widgets`
- Configure `next.config.js` with CopyPlugin for Cesium static assets
- Set `window.CESIUM_BASE_URL = '/cesium'` before Viewer init
- Import `cesium/Build/Cesium/Widgets/widgets.css`
- Create `CesiumMap.tsx` with `'use client'` + `dynamic(import, { ssr: false })`
- Verify: satellite imagery + terrain rendering, camera at SeaBreeze area

**VS Code prompt:**
```
Read the master plan. Initialize Next.js 14 project with CesiumJS.
Configure webpack CopyPlugin for Cesium static assets.
Create a basic CesiumMap component that shows satellite terrain
centered on coordinates: lon=49.945, lat=40.585 (SeaBreeze center).
Camera altitude ~2000m looking down.
```

### Phase 2 — Models & Overlay (Day 2)
**Goal:** All 5 real models loaded + master plan overlay

- Load Ion models with multi-token approach:
  ```typescript
  // Each Ion model loaded with its own token
  const resource = await IonResource.fromAssetId(assetId, { accessToken: token });
  const tileset = await Cesium3DTileset.fromUrl(resource);
  viewer.scene.primitives.add(tileset);
  ```
- Load Skypark as local GLB Entity:
  ```typescript
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(49.939449, 40.580650),
    model: {
      uri: '/models/skypark.glb',
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    }
  });
  ```
- If Skypark rotation is wrong: add `HeadingPitchRoll` and tune heading visually
- Add master plan as ground overlay:
  ```typescript
  viewer.imageryLayers.addImageryProvider(
    new Cesium.SingleTileImageryProvider({
      url: '/textures/master-plan.jpg',
      rectangle: Cesium.Rectangle.fromDegrees(west, south, east, north)
    })
  );
  ```
- Master plan rectangle bounds: derive from KMZ data (~49.900 to 49.993, ~40.570 to 40.596)

**⚠️ Ion models may have embedded geo-coordinates:** Try adding without modelMatrix override first. If model appears at wrong location, then apply position manually.

**VS Code prompt:**
```
Load 5 building models into CesiumViewer:
- 4 Ion tilesets (multi-token: Token1 for Nobu+Montenegro, Token2 for Brabus)
- 1 local GLB (Skypark at lon=49.939449, lat=40.580650)
Add master plan as ground overlay with toggle.
Tokens and asset IDs are in .env.local.
```

### Phase 3 — Placeholders & Data (Day 3)
**Goal:** All 120+ buildings visible as colored markers/boxes with labels

- Parse `buildings.json` (generated from KMZ data)
- For each named area: create Entity with:
  - Colored box (by category) or billboard pin
  - Label with name
  - Click handler → select building
- Color scheme:
  - Hotels: `#3B82F6` (blue)
  - Residences: `#10B981` (green)
  - Villas: `#F59E0B` (amber)
  - Entertainment: `#8B5CF6` (purple)
  - Beach/Marina: `#06B6D4` (cyan)
  - Restaurants: `#EF4444` (red)
  - Education: `#6366F1` (indigo)
  - Services: `#6B7280` (gray)

**VS Code prompt:**
```
Create 120+ placeholder building entities from buildings.json.
Each building gets a colored box (by category) + label.
Click on any building → update Zustand store selectedBuilding.
Use the KMZ extracted data for positions.
```

### Phase 4 — Interactivity & UI (Day 4)
**Goal:** Click-to-fly, sidebar with carousel, search, category filter

- Click building → `camera.flyTo({ destination, orientation })` with smooth animation
- Sidebar slides in with:
  - Building name (AZ + EN)
  - Category badge
  - Area (ha) from KMZ data
  - Image carousel (Skypark: 12 renders, others: placeholder)
  - Features/tags
- Search bar: fuzzy match across all building names
- Category filter: toggle buttons (Hotels, Villas, Entertainment, etc.)
- Master plan overlay toggle button

**VS Code prompt:**
```
Add click-to-fly camera animation when selecting a building.
Create Sidebar component with image carousel for Skypark (12 renders).
Add SearchBar with fuzzy search across all 120+ buildings.
Add CategoryFilter with colored toggle buttons.
Add MasterPlanToggle button.
```

### Phase 5 — Polish & Visual Quality (Day 5)
**Goal:** Production-quality visuals, loading screen, responsive

- Golden hour lighting: `viewer.clock.currentTime = JulianDate.fromIso8601('2025-07-15T15:00:00Z')`
- Enable atmosphere: `viewer.scene.globe.enableLighting = true`
- Fog for depth: `viewer.scene.fog.enabled = true`
- Skypark glass reflections: `imageBasedLightingFactor: [1.0, 1.0]`
- Camera bounds: restrict to SeaBreeze area (prevent user flying to Antarctica)
- Loading screen: branded, shows progress as models load
- Responsive: sidebar collapses on mobile, touch controls
- Performance: LOD, requestRenderMode for battery saving

**VS Code prompt:**
```
Add visual polish: golden hour lighting, atmosphere, fog.
Set camera bounds to SeaBreeze area only.
Create branded loading screen with progress.
Make sidebar responsive (collapse on mobile).
Enable requestRenderMode for performance.
```

---

## 8. Critical Technical Notes

### CesiumJS Setup in Next.js (MUST DO)

1. **All Cesium components need `'use client'` + `dynamic(..., { ssr: false })`** — Cesium accesses `window` and `document`

2. **`window.CESIUM_BASE_URL = '/cesium'`** must be set BEFORE creating the Viewer

3. **`next.config.js` CopyPlugin** copies Workers/ThirdParty/Assets/Widgets to `public/cesium/`:
   ```javascript
   const CopyPlugin = require('copy-webpack-plugin');
   // Copy from node_modules/cesium/Build/Cesium/ to public/cesium/
   ```

4. **Import CSS:** `import 'cesium/Build/Cesium/Widgets/widgets.css'`

5. **`.env.local` must be in `.gitignore`** — never commit tokens

### Multi-Token Model Loading

```typescript
// DO NOT set Ion.defaultAccessToken for all models
// Instead, load each model with its own token:

async function loadIonModel(viewer, assetId, token) {
  const resource = await Cesium.IonResource.fromAssetId(assetId, {
    accessToken: token
  });
  const tileset = await Cesium.Cesium3DTileset.fromUrl(resource);
  viewer.scene.primitives.add(tileset);
  return tileset;
}

// Usage:
await loadIonModel(viewer, 4481945, process.env.NEXT_PUBLIC_CESIUM_TOKEN_1); // Nobu
await loadIonModel(viewer, 4346739, process.env.NEXT_PUBLIC_CESIUM_TOKEN_1); // Montenegro
await loadIonModel(viewer, 4367726, process.env.NEXT_PUBLIC_CESIUM_TOKEN_2); // Brabus Land
await loadIonModel(viewer, 4367733, process.env.NEXT_PUBLIC_CESIUM_TOKEN_2); // Brabus Bina
```

### Ion Default Token
`Cesium.Ion.defaultAccessToken` is set to Shamil's free-tier token (for terrain + Bing Maps). This is separate from the model tokens (Token 1 and Token 2).

### Skypark Local Model — Rotation Adjustment
If Skypark GLB appears rotated incorrectly:
```typescript
const heading = Cesium.Math.toRadians(HEADING_VALUE); // Try 0, then adjust ±10-20°
const pitch = 0;
const roll = 0;
const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
const orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);

viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(49.939449, 40.580650),
  orientation: orientation,
  model: { uri: '/models/skypark.glb' }
});
```
Tip: Create a temporary UI slider to adjust heading in real-time during development.

### Master Plan Overlay Bounds
Approximate from KMZ data:
```typescript
const overlayBounds = Cesium.Rectangle.fromDegrees(
  49.900,  // west
  40.570,  // south
  49.993,  // east
  40.596   // north
);
```
Fine-tune visually to align with satellite imagery.

---

## 9. Building Data Schema

```typescript
// src/data/buildings.ts

type ModelSource =
  | { type: 'ion'; assetId: number; tokenKey: 'TOKEN_1' | 'TOKEN_2' }
  | { type: 'local'; url: string }
  | { type: 'placeholder' };

type BuildingCategory =
  | 'hotel' | 'residence' | 'villa' | 'entertainment'
  | 'beach' | 'restaurant' | 'education' | 'service' | 'landmark';

interface Building {
  id: string;
  name: string;             // English name
  nameAz?: string;          // Azerbaijani name
  category: BuildingCategory;
  longitude: number;
  latitude: number;
  area_ha?: number;         // from KMZ data
  modelSource: ModelSource;
  images?: string[];        // for sidebar carousel
  description?: string;
  features?: string[];      // tags like "5-star", "beachfront", etc.
}

// Example entries:
const buildings: Building[] = [
  {
    id: 'skypark',
    name: 'Sky Park',
    category: 'landmark',
    longitude: 49.939449,
    latitude: 40.580650,
    area_ha: 4.3,
    modelSource: { type: 'local', url: '/models/skypark.glb' },
    images: Array.from({ length: 12 }, (_, i) => `/images/skypark/render-${String(i + 1).padStart(2, '0')}.jpg`),
  },
  {
    id: 'nobu',
    name: 'Nobu',
    category: 'hotel',
    longitude: 49.946508,
    latitude: 40.588146,
    area_ha: 2.21,
    modelSource: { type: 'ion', assetId: 4481945, tokenKey: 'TOKEN_1' },
  },
  {
    id: 'montenegro',
    name: 'Marina Village (Montenegro)',
    category: 'residence',
    longitude: 49.949684,
    latitude: 40.585082,
    area_ha: 6.81,
    modelSource: { type: 'ion', assetId: 4346739, tokenKey: 'TOKEN_1' },
  },
  {
    id: 'brabus-land',
    name: 'Brabus Land',
    category: 'landmark',
    longitude: 49.944642,
    latitude: 40.587625,
    area_ha: 3.8,
    modelSource: { type: 'ion', assetId: 4367726, tokenKey: 'TOKEN_2' },
  },
  {
    id: 'brabus-bina',
    name: 'Brabus Bina',
    category: 'residence',
    longitude: 49.944642,   // Same area as Brabus Land — adjust if separate coords provided
    latitude: 40.587625,
    modelSource: { type: 'ion', assetId: 4367733, tokenKey: 'TOKEN_2' },
  },
  // ... 120+ placeholder buildings from KMZ data
];
```

---

## 10. Skypark Visual Quality Notes

Based on render images provided:
- **Glass reflections:** Enable IBL — `imageBasedLightingFactor: [1.0, 1.0]` + coastal HDRI
- **Pool water:** If not in GLB, add translucent polygon Entity (`Color('#0EA5E9').withAlpha(0.6)`)
- **Vegetation:** Billboard palm trees around building if needed
- **Lighting:** Golden hour setting for best visual match with renders

---

## 11. Sidebar Image Carousel (Skypark)

```typescript
// Carousel component for Sidebar.tsx
// Images: /public/images/skypark/render-01.jpg ... render-12.jpg

// Features:
// - Swipeable on mobile (touch events)
// - Dot indicators
// - Auto-play with pause on hover
// - Full-screen lightbox on click
```

---

## 12. Camera Configuration

```typescript
// Initial view: overview of entire resort
const OVERVIEW = {
  destination: Cesium.Cartesian3.fromDegrees(49.945, 40.583, 3000),
  orientation: {
    heading: Cesium.Math.toRadians(0),
    pitch: Cesium.Math.toRadians(-45),
    roll: 0
  }
};

// Camera bounds: restrict to SeaBreeze area
viewer.scene.screenSpaceCameraController.minimumZoomDistance = 100;
viewer.scene.screenSpaceCameraController.maximumZoomDistance = 5000;

// Fly to building:
function flyToBuilding(viewer, building) {
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(
      building.longitude,
      building.latitude,
      500 // altitude
    ),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-35),
      roll: 0
    },
    duration: 2.0 // seconds
  });
}
```

---

## 13. Environment Variables (.env.local)

```bash
# Cesium Ion tokens for 3D model tilesets
NEXT_PUBLIC_CESIUM_TOKEN_1=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxZTVjN2IzMi1jMzUxLTRlNGQtYmJmNi1kY2VlNDMwZTVhYTgiLCJpZCI6MzI4ODczLCJpYXQiOjE3NTQzODMzOTR9.YV7FLJInVF05hlrrqaI9sB1j7EEc1i6qxN3kDH4aafk
NEXT_PUBLIC_CESIUM_TOKEN_2=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwY2VhMzQ1NS1iOWVkLTQ5YzItYjZiZi04ODMzNGQxMzQ3ZmUiLCJpZCI6Mzc4NDAwLCJpYXQiOjE3NjgzNzkzNDd9.t_X6c7pLN02otlOtpumK5F5ScB7a8t-aCw7DA4FhYcc

# Cesium Ion default token (for terrain + Bing Maps base layers)
# Shamil's free-tier account (assets:read + geocode scopes)
NEXT_PUBLIC_CESIUM_ION_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmNTJjODMwYS0yNzU2LTQzODktOGY3MC0zZmE4M2Q3ODhhOWMiLCJpZCI6NDAyOTkzLCJpYXQiOjE3NzMzOTYzOTJ9.iSO65sm1ukaae8RFzxpxgH6CxzLeeshZJqMVcJJpXjQ

# Ion Asset IDs
NEXT_PUBLIC_ION_NOBU=4481945
NEXT_PUBLIC_ION_MONTENEGRO=4346739
NEXT_PUBLIC_ION_BRABUS_LAND=4367726
NEXT_PUBLIC_ION_BRABUS_BINA=4367733
```

---

## 14. VS Code + Claude Opus 4.6 Workflow

### Step 1: Plan Mode
```
Feed this entire MD file to Claude in Plan Mode:
"Read this implementation plan. Confirm you understand the architecture,
all asset IDs, tokens, coordinates, and the 5-phase approach.
List any questions or ambiguities before we start coding."
```

### Step 2: Agent Mode — Execute Phase by Phase
Switch to Agent Mode and give phase-specific prompts (see Phase sections above).

### Step 3: Source Assets
Place all source files in `source-assets/` folder in project root:
```
source-assets/
├── skypark__2__compressed.glb    # 14MB local model
├── Sea Breeze Master Plan-min.png # 15MB master plan
├── skypark-renders/
│   ├── render-01.jpg ... render-12.jpg
├── SB_areas.kmz                  # KMZ with all area polygons
└── seabreeze_areas.json          # Extracted coordinates (120+ areas)
```

---

## 15. Still Needed (Optional Enhancements)

| Item | Priority | Notes |
|------|----------|-------|
| Free Cesium Ion default token | ~~HIGH~~ **DONE** | Shamil's account — assets:read + geocode |
| Render images for Nobu, Montenegro, Brabus | Medium | For sidebar carousel (currently only Skypark has renders) |
| Resort branding (logo, colors) | Medium | For loading screen, UI theme |
| Exact Brabus Bina coordinates | Low | Currently using same coords as Brabus Land — may be separate building |
| Additional 3D models | Future | After job acceptance, more models can be added |

---

## 16. Success Criteria

- [ ] Map loads in < 5 seconds (initial terrain + satellite visible)
- [ ] All 5 real models visible at correct positions
- [ ] Click any building → smooth camera fly-to animation
- [ ] Sidebar with building info + Skypark image carousel
- [ ] Search across 120+ building names
- [ ] Category filter toggles
- [ ] Master plan overlay toggle
- [ ] Golden hour lighting, atmosphere, fog
- [ ] Responsive on tablet/mobile
- [ ] No Google API required — fully self-contained with Cesium

---

*Plan ready for execution. Start with Phase 1.*
