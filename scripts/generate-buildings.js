/**
 * Generate buildings.json from seabreeze_areas.json
 * Filters out unnamed kml_ entries and SB bracket entries, deduplicates by name.
 * Run: node scripts/generate-buildings.js
 */
const fs = require('fs');
const path = require('path');

const raw = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, '..', 'source-assets', 'seabreeze_areas.json'),
    'utf-8'
  )
);

// Filter out unnamed entries
const named = raw.filter((x) => {
  const n = x.name;
  if (n.startsWith('kml_')) return false;
  if (/^SB \d+ \[/.test(n)) return false;
  if (/^SB-\d+ \[/.test(n)) return false;
  return true;
});

// Deduplicate by lowercased name (keep first occurrence)
const seen = new Set();
const unique = named.filter((x) => {
  const key = x.name.trim().toLowerCase();
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});

// Parse area from name (e.g. "Casino 9 ha" → 9)
function parseArea(name) {
  const m = name.match(/([\d.]+)\s*ha/i);
  return m ? parseFloat(m[1]) : undefined;
}

// Clean up name (remove area suffix)
function cleanName(name) {
  return name.replace(/\s*[\d.]+\s*ha$/i, '').trim();
}

// Create building ID from name
function toId(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const buildings = unique.map((x) => {
  const area = parseArea(x.name);
  const name = cleanName(x.name);
  return {
    id: toId(name),
    name,
    longitude: x.longitude,
    latitude: x.latitude,
    ...(area !== undefined && { area_ha: area }),
  };
});

const outPath = path.join(__dirname, '..', 'public', 'data', 'buildings.json');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(buildings, null, 2));
console.log(`Generated ${buildings.length} buildings → ${outPath}`);
