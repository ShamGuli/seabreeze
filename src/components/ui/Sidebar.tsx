'use client';

import { useMapStore } from '@/store/mapStore';
import { CATEGORY_COLORS, CATEGORY_LABELS, type BuildingCategory } from '@/data/categories';
import { motion, AnimatePresence } from 'framer-motion';
import type { Building } from '@/data/buildings';

// ─── Stable random generator seeded by building name ───
function createRng(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);
  return {
    int(min: number, max: number) {
      hash = (hash * 9301 + 49297) % 233280;
      return min + Math.floor((hash / 233280) * (max - min + 1));
    },
    pick<T>(arr: T[]): T {
      hash = (hash * 9301 + 49297) % 233280;
      return arr[Math.floor((hash / 233280) * arr.length)];
    },
    bool(chance = 0.5) {
      hash = (hash * 9301 + 49297) % 233280;
      return hash / 233280 < chance;
    },
  };
}

interface BuildingData {
  floors: number;
  blocks: number;
  unitsPerFloor: number;
  totalUnits: number;
  avgUnitSize: number;
  minUnitSize: number;
  maxUnitSize: number;
  parkingSpaces: number;
  yearBuilt: number;
  construction: string;
  description: string;
  address: string;
  district: string;
  phone: string;
  offices: { name: string; floor: number; area: number; active: boolean }[];
  restaurants: { name: string; cuisine: string; floor: number; area: number; capacity: number; open: string; close: string }[];
  amenities: string[];
}

const OFFICE_NAMES = [
  'Azure Consulting', 'Caspian Legal Group', 'TechHub Innovations',
  'SeaView Real Estate', 'Baku Financial Services', 'Meridian Architecture',
  'Global Trade Partners', 'Silk Road Analytics', 'Neftchi Ventures',
  'Absheron Advisory', 'Digital Wave Studio', 'Caspian Logistics',
];

const RESTAURANT_DATA = [
  { name: 'Sapore Italiano', cuisine: 'Italyan mətbəxi' },
  { name: 'The Breeze Cafe', cuisine: 'Qəhvə və şirniyyat' },
  { name: 'Nami Sushi Bar', cuisine: 'Yapon mətbəxi' },
  { name: 'Sahil Grill House', cuisine: 'Manqal və qril' },
  { name: 'La Mer Bistro', cuisine: 'Fransız mətbəxi' },
  { name: 'Baku Doner', cuisine: 'Türk fast-food' },
  { name: 'Caspian Terrace', cuisine: 'Azərbaycan mətbəxi' },
  { name: 'Mango Smoothie Bar', cuisine: 'Şirələr və kokteyllər' },
];

const AMENITIES = [
  { icon: '\u{1F3CA}', label: 'Hovuz' },
  { icon: '\u{1F3CB}\u{FE0F}', label: 'İdman zalı' },
  { icon: '\u{1F17F}\u{FE0F}', label: 'Parkinq' },
  { icon: '\u{1F6D7}', label: 'Lift' },
  { icon: '\u{1F4F9}', label: 'Kamera' },
  { icon: '\u{1F310}', label: 'WiFi' },
  { icon: '\u{1F46E}', label: 'Mühafizə' },
  { icon: '\u{1F333}', label: 'Bağ' },
  { icon: '\u{1F9D2}', label: 'Uşaq meydançası' },
  { icon: '\u{1F9FA}', label: 'Camaşırxana' },
];

const CONSTRUCTIONS = ['Dəmir-beton', 'Metal karkas', 'Monolit beton', 'Yığma beton'];

const DESCRIPTIONS = [
  'SeaBreeze kurort zonasında yerləşən premium yaşayış kompleksi. Panoramik dəniz mənzərəsi və dünya səviyyəli infrastruktur təklif edir.',
  'Xəzər sahilində lüks yaşayış imkanı təqdim edən unikal layihə. Müasir dizayn və ekoloji materiallarla inşa edilib.',
  'Rahatlıq və zərifliyi birləşdirən eksklüziv sahil rezidensiyası. Birbaşa çimərliyə çıxış və kurort tipli xidmətlər mövcuddur.',
  'SeaBreeze-in mərkəzində yerləşən müasir çoxfunksiyalı kompleks. Yaşayış rahatlığı ilə kommersiya imkanlarını birləşdirir.',
  'Abşeron yarımadasında memarlıq şah əsəri. Döşəmədən tavana qədər pəncərələr Xəzər dənizinin heyrətamiz mənzərəsini açır.',
];

function generateBuildingData(building: Building): BuildingData {
  const rng = createRng(building.name);

  const floors = rng.int(5, 35);
  const blocks = rng.int(1, 5);
  const unitsPerFloor = rng.int(4, 12);
  const totalUnits = floors * unitsPerFloor;
  const minUnitSize = rng.int(35, 55);
  const maxUnitSize = rng.int(120, 200);
  const avgUnitSize = rng.int(minUnitSize + 10, maxUnitSize - 10);

  const officeCount = rng.int(3, 7);
  const offices = Array.from({ length: officeCount }, (_, i) => ({
    name: OFFICE_NAMES[i % OFFICE_NAMES.length],
    floor: rng.int(1, 3),
    area: rng.int(60, 220),
    active: rng.bool(0.65),
  }));

  const restCount = rng.int(2, 4);
  const restaurants = Array.from({ length: restCount }, (_, i) => {
    const r = RESTAURANT_DATA[i % RESTAURANT_DATA.length];
    const openH = rng.int(7, 12);
    const closeH = rng.int(21, 24);
    return {
      ...r,
      floor: rng.int(1, 2),
      area: rng.int(80, 220),
      capacity: rng.int(20, 80),
      open: String(openH).padStart(2, '0') + ':00',
      close: String(closeH).padStart(2, '0') + ':00',
    };
  });

  const amenityCount = rng.int(5, 10);
  const amenities: string[] = [];
  const used = new Set<number>();
  for (let i = 0; i < amenityCount; i++) {
    let idx = rng.int(0, AMENITIES.length - 1);
    while (used.has(idx)) idx = (idx + 1) % AMENITIES.length;
    used.add(idx);
    amenities.push(AMENITIES[idx].icon + ' ' + AMENITIES[idx].label);
  }

  const phoneMiddle = rng.int(100, 999);
  const phoneLast = rng.int(10, 99);

  return {
    floors,
    blocks,
    unitsPerFloor,
    totalUnits,
    avgUnitSize,
    minUnitSize,
    maxUnitSize,
    parkingSpaces: rng.int(50, 300),
    yearBuilt: rng.int(2020, 2026),
    construction: rng.pick(CONSTRUCTIONS),
    description: rng.pick(DESCRIPTIONS),
    address: 'SeaBreeze Bulvarı, Blok ' + rng.int(1, 20) + ', Bakı, Azərbaycan',
    district: 'Neftçala şossesi, Sahil',
    phone: '+994 12 ' + phoneMiddle + ' ' + phoneLast + ' ' + rng.int(10, 99),
    offices,
    restaurants,
    amenities,
  };
}

function isOpenNow(open: string, close: string): boolean {
  const now = new Date();
  const h = now.getHours();
  const openH = parseInt(open);
  const closeH = parseInt(close);
  return h >= openH && h < closeH;
}

// ─── Section wrapper ───
function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{
        fontSize: 11,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        color: 'rgba(255,255,255,0.4)',
        marginBottom: 12,
      }}>
        {icon} {title}
      </div>
      {children}
    </div>
  );
}

// ─── Card wrapper ───
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      borderRadius: 10,
      border: '1px solid rgba(255,255,255,0.06)',
      padding: 12,
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── Info row ───
function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      padding: '6px 0',
      fontSize: 13,
    }}>
      <span style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</span>
      <span style={{ color: 'rgba(255,255,255,0.92)', fontWeight: 500 }}>{value}</span>
    </div>
  );
}

export default function Sidebar() {
  const building = useMapStore((s) => s.selectedBuilding);
  const setSelectedBuilding = useMapStore((s) => s.setSelectedBuilding);
  const flyToOverview = useMapStore((s) => s.flyToOverview);

  if (!building) return null;

  const data = generateBuildingData(building);
  const catColor = CATEGORY_COLORS[building.category];
  const slug = building.name.toLowerCase().replace(/\s+/g, '');

  return (
    <AnimatePresence>
      {building && (
        <motion.div
          key={building.id}
          initial={{ x: -380, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -380, opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 260 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: 360,
            zIndex: 20,
            background: 'rgba(15, 20, 35, 0.92)',
            backdropFilter: 'blur(20px)',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            overflowX: 'hidden',
            borderRight: '1px solid rgba(255,255,255,0.08)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
          className="sidebar-scroll"
        >
          {/* ═══ HEADER ═══ */}
          <div style={{
            padding: '24px 20px 18px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}>
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, lineHeight: 1.3, color: 'rgba(255,255,255,0.95)' }}>
                {building.name}
              </h2>
              <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                <span style={{
                  padding: '3px 10px',
                  borderRadius: 12,
                  fontSize: 11,
                  fontWeight: 600,
                  background: catColor,
                }}>
                  {CATEGORY_LABELS[building.category]}
                </span>
              </div>
            </div>
            <button
              onClick={() => { setSelectedBuilding(null); flyToOverview?.(); }}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.6)',
                width: 32,
                height: 32,
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginLeft: 12,
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
            >
              {'\u2715'}
            </button>
          </div>

          {/* ═══ HERO STATS ═══ */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {[
                { icon: '\u{1F4CD}', label: 'Sahə', value: (building.area_ha || +(data.floors * 0.3).toFixed(1)) + ' ha' },
                { icon: '\u{1F3E2}', label: 'Mərtəbə', value: String(data.floors) },
                { icon: '\u{1F3E0}', label: 'Mənzil', value: String(data.totalUnits) },
              ].map((s) => (
                <Card key={s.label}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 16, marginBottom: 4 }}>{s.icon}</div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: 'rgba(255,255,255,0.95)' }}>{s.value}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* ═══ HAQQINDA ═══ */}
          <Section title="Haqqında" icon={'\u{2139}\u{FE0F}'}>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: 'rgba(255,255,255,0.7)' }}>
              {data.description}
            </p>
          </Section>

          {/* ═══ ÜNVAN VƏ KOORDİNATLAR ═══ */}
          <Section title="Məkan" icon={'\u{1F4CD}'}>
            <Card>
              <InfoRow label="Ünvan" value={data.address} />
              <InfoRow label="Rayon" value={data.district} />
              <InfoRow label="Koordinatlar" value={building.latitude.toFixed(4) + ', ' + building.longitude.toFixed(4)} />
            </Card>
          </Section>

          {/* ═══ BİNA MƏLUMATLARI ═══ */}
          <Section title="Bina məlumatları" icon={'\u{1F3D7}\u{FE0F}'}>
            <Card>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                <InfoRow label="Növ" value={CATEGORY_LABELS[building.category]} />
                <InfoRow label="Mərtəbə" value={data.floors} />
                <InfoRow label="Blok" value={data.blocks} />
                <InfoRow label="Mənzil/Mərtəbə" value={data.unitsPerFloor} />
                <InfoRow label="Ümumi mənzil" value={data.totalUnits} />
                <InfoRow label="Ort. sahə" value={data.avgUnitSize + ' m\u00B2'} />
                <InfoRow label="Min. sahə" value={data.minUnitSize + ' m\u00B2'} />
                <InfoRow label="Maks. sahə" value={data.maxUnitSize + ' m\u00B2'} />
                <InfoRow label="Parkinq" value={data.parkingSpaces} />
                <InfoRow label="Tikinti ili" value={data.yearBuilt} />
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 8, paddingTop: 8 }}>
                <InfoRow label="Tikinti növü" value={data.construction} />
              </div>
            </Card>
          </Section>

          {/* ═══ OFİSLƏR ═══ */}
          <Section title="Ofislər" icon={'\u{1F4BC}'}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>
              1-3-cü mərtəbələrdə {data.offices.length} ofis sahəsi
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {data.offices.map((o, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.04)',
                  fontSize: 12,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: o.active ? '#10B981' : '#EF4444',
                      flexShrink: 0,
                    }} />
                    <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>{o.name}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>
                    <span>Mərtəbə {o.floor}</span>
                    <span>{o.area} m{'\u00B2'}</span>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* ═══ RESTORANLAR ═══ */}
          <Section title="Restoranlar" icon={'\u{1F37D}\u{FE0F}'}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {data.restaurants.map((r, i) => {
                const rOpen = isOpenNow(r.open, r.close);
                return (
                  <Card key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.92)' }}>{r.name}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 3 }}>
                          {r.cuisine} {'\u2022'} Mərtəbə {r.floor}
                        </div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>
                          {r.area} m{'\u00B2'} {'\u2022'} {r.capacity} oturacaq
                        </div>
                      </div>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: 10,
                        fontSize: 10,
                        fontWeight: 600,
                        background: rOpen ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                        color: rOpen ? '#10B981' : '#EF4444',
                      }}>
                        {rOpen ? 'Açıqdır' : 'Bağlıdır'}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 6 }}>
                      {'\u23F0'} {r.open} - {r.close}
                    </div>
                  </Card>
                );
              })}
            </div>
          </Section>

          {/* ═══ İMKANLAR ═══ */}
          <Section title="İmkanlar" icon={'\u2728'}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {data.amenities.map((a, i) => (
                <span key={i} style={{
                  padding: '5px 10px',
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 500,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.75)',
                }}>
                  {a}
                </span>
              ))}
            </div>
          </Section>

          {/* ═══ ƏLAQƏ ═══ */}
          <Section title="Əlaqə" icon={'\u{1F4DE}'}>
            <Card>
              <InfoRow label="Telefon" value={data.phone} />
              <InfoRow label="E-poçt" value={'info@' + slug + '.az'} />
              <InfoRow label="Vebsayt" value={'www.' + slug + '.az'} />
            </Card>
          </Section>

          {/* bottom spacer */}
          <div style={{ height: 24, flexShrink: 0 }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
