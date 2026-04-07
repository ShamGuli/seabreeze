export type BuildingCategory =
  | 'hotel'
  | 'residence'
  | 'villa'
  | 'entertainment'
  | 'beach'
  | 'restaurant'
  | 'education'
  | 'service'
  | 'landmark';

export const CATEGORY_COLORS: Record<BuildingCategory, string> = {
  hotel: '#3B82F6',
  residence: '#10B981',
  villa: '#F59E0B',
  entertainment: '#8B5CF6',
  beach: '#06B6D4',
  restaurant: '#EF4444',
  education: '#6366F1',
  service: '#6B7280',
  landmark: '#F97316',
};

export const CATEGORY_LABELS: Record<BuildingCategory, string> = {
  hotel: 'Hotels',
  residence: 'Residences',
  villa: 'Villas',
  entertainment: 'Entertainment',
  beach: 'Beach & Marina',
  restaurant: 'Restaurants',
  education: 'Education',
  service: 'Services',
  landmark: 'Landmarks',
};

/** Classify a building name into a category by keyword matching */
export function classifyBuilding(name: string): BuildingCategory {
  const n = name.toLowerCase();

  // Hotels
  if (
    /\bhotel\b/.test(n) ||
    /\brixos\b/.test(n) ||
    /\bradisson\b/.test(n) ||
    /\bhyatt\b/.test(n) ||
    /\bswiss\b/.test(n) ||
    /\bgrand hotel\b/.test(n) ||
    /\bcube otel\b/.test(n) ||
    /\botel\b/.test(n) ||
    /\bnobu\b/.test(n) ||
    /\bshor house\b/.test(n)
  )
    return 'hotel';

  // Villas (check before residence since some names overlap)
  if (
    /\bvilla/.test(n) ||
    /\bwilla/.test(n) ||
    /\bkotec\b/.test(n) ||
    /\branches\b/.test(n) ||
    /\btown house\b/.test(n)
  )
    return 'villa';

  // Residences
  if (
    /\bresidenc/.test(n) ||
    /\bapartment/.test(n) ||
    /\btower/.test(n) ||
    /\bpalazzo\b/.test(n) ||
    /\bmonte carlo\b/.test(n) ||
    /\bmonaco\b/.test(n) ||
    /\bneo city\b/.test(n) ||
    /\bcanyon/.test(n) ||
    /\bmarina village\b/.test(n) ||
    /\bblue waters\b/.test(n) ||
    /\bresidential\b/.test(n)
  )
    return 'residence';

  // Entertainment
  if (
    /\bcasino\b/.test(n) ||
    /\bluna park\b/.test(n) ||
    /\bwater park\b/.test(n) ||
    /\bdream fest\b/.test(n) ||
    /\bfunzilla\b/.test(n) ||
    /\bkarting\b/.test(n) ||
    /\bkatok\b/.test(n) ||
    /\bsport\b/.test(n) ||
    /\bpadel\b/.test(n) ||
    /\btennis\b/.test(n) ||
    /\bfitnes\b/.test(n) ||
    /\bevent hall\b/.test(n) ||
    /\bglamp\b/.test(n) ||
    /\bwave\b/.test(n) ||
    /\bokids\b/.test(n) ||
    /\bsmash\b/.test(n)
  )
    return 'entertainment';

  // Beach & Marina
  if (
    /\bbeach\b/.test(n) ||
    /\bmarina\b/.test(n) ||
    /\bharbou?r\b/.test(n) ||
    /\bisland\b/.test(n) ||
    /\bvenetian\b/.test(n) ||
    /\bpalm\b/.test(n) ||
    /\bcaspian dream\b/.test(n)
  )
    return 'beach';

  // Restaurants & Cafes
  if (
    /\brestoran/.test(n) ||
    /\bcipiriani\b/.test(n) ||
    /\bcayxana\b/.test(n) ||
    /\brose bar\b/.test(n) ||
    /\bfish box\b/.test(n) ||
    /\bfood court\b/.test(n) ||
    /\bdel verde\b/.test(n) ||
    /\bdel rosa\b/.test(n) ||
    /\bdel vita\b/.test(n) ||
    /\bdel ventus\b/.test(n) ||
    /\bde luna\b/.test(n) ||
    /\bdesol\b/.test(n) ||
    /\bderma\b/.test(n) ||
    /\bdoner\b/.test(n) ||
    /\bbeerbasha\b/.test(n) ||
    /\bmaize\b/.test(n) ||
    /\bcigars\b/.test(n) ||
    /\bcofemania\b/.test(n) ||
    /\bgloria\b/.test(n) ||
    /\bteabreeze\b/.test(n) ||
    /\bteayoume\b/.test(n) ||
    /\blucapolare\b/.test(n) ||
    /\bkababç/.test(n) ||
    /\bla mer\b/.test(n) ||
    /\bgarden shop\b/.test(n)
  )
    return 'restaurant';

  // Education
  if (/\bschool\b/.test(n) || /\buniversity\b/.test(n) || /\blandau\b/.test(n))
    return 'education';

  // Light House 2 → residence (not landmark)
  if (/\blight\s*house[-\s]*2\b/.test(n)) return 'residence';

  // Landmarks
  if (
    /\blight house\b/.test(n) ||
    /\blighthouse\b/.test(n) ||
    /\bskyline\b/.test(n) ||
    /\bellipse\b/.test(n) ||
    /\bsky park\b/.test(n) ||
    /\bbrabus\b/.test(n) ||
    /\bport d.azur\b/.test(n) ||
    /\bnine senses\b/.test(n) ||
    /\bart center\b/.test(n)
  )
    return 'landmark';

  // Services (fallback for parking, offices, technical zones)
  if (
    /\bparking\b/.test(n) ||
    /\boffice\b/.test(n) ||
    /\binzibati\b/.test(n) ||
    /\banbar\b/.test(n) ||
    /\bsklat\b/.test(n) ||
    /\bsvarka\b/.test(n) ||
    /\bazerisiq\b/.test(n) ||
    /\bqazanxana\b/.test(n) ||
    /\btexniki\b/.test(n) ||
    /\bavot\b/.test(n) ||
    /\bfhn\b/.test(n) ||
    /\bstaff\b/.test(n) ||
    /\bcons office\b/.test(n) ||
    /\bpost\b/.test(n)
  )
    return 'service';

  return 'service'; // fallback
}
