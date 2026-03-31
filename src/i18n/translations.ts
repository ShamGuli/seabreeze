export type Lang = 'az' | 'ru' | 'en';

type TranslationMap = Record<string, Record<Lang, string>>;

export const T: TranslationMap = {
  // ── SearchBar ──
  searchPlaceholder: { az: 'Binaları axtar...', ru: 'Поиск зданий...', en: 'Search buildings...' },

  // ── CategoryFilter ──
  hideAll:   { az: 'Hamısını gizlət', ru: 'Скрыть все',    en: 'Hide All'   },
  showAll:   { az: 'Hamısını göstər', ru: 'Показать все',  en: 'Show All'   },
  catHotel:         { az: 'Otellər',             ru: 'Отели',                  en: 'Hotels'        },
  catResidence:     { az: 'Rezidensiyalar',       ru: 'Резиденции',             en: 'Residences'    },
  catVilla:         { az: 'Villalar',             ru: 'Виллы',                  en: 'Villas'        },
  catEntertainment: { az: 'Əyləncə',              ru: 'Развлечения',            en: 'Entertainment' },
  catBeach:         { az: 'Çimərlik & Marina',    ru: 'Пляж & Марина',          en: 'Beach & Marina'},
  catRestaurant:    { az: 'Restoranlar',          ru: 'Рестораны',              en: 'Restaurants'   },
  catEducation:     { az: 'Təhsil',               ru: 'Образование',            en: 'Education'     },
  catService:       { az: 'Xidmətlər',            ru: 'Услуги',                 en: 'Services'      },
  catLandmark:      { az: 'Landmarklar',          ru: 'Памятники',              en: 'Landmarks'     },

  // ── Sidebar header ──
  openNow:  { az: 'Açıqdır',  ru: 'Открыто',  en: 'Open Now' },
  closed:   { az: 'Bağlıdır', ru: 'Закрыто',  en: 'Closed'   },

  // ── Sidebar stats ──
  statArea:   { az: 'Sahə',    ru: 'Площадь', en: 'Area'   },
  statFloors: { az: 'Mərtəbə', ru: 'Этажи',   en: 'Floors' },
  statUnits:  { az: 'Mənzil',  ru: 'Кварт.',  en: 'Units'  },

  // ── Sidebar sections ──
  secAbout:    { az: 'Haqqında',       ru: 'О здании',          en: 'About'            },
  secLocation: { az: 'Məkan',          ru: 'Местоположение',    en: 'Location'         },
  secDetails:  { az: 'Bina məlumatları', ru: 'Сведения',        en: 'Building Details' },
  secOffices:  { az: 'Ofislər',        ru: 'Офисы',             en: 'Offices'          },
  secRestaurants: { az: 'Restoranlar', ru: 'Рестораны',         en: 'Restaurants'      },
  secAmenities: { az: 'İmkanlar',      ru: 'Удобства',          en: 'Amenities'        },
  secContact:  { az: 'Əlaqə',          ru: 'Контакты',          en: 'Contact'          },

  // ── Location rows ──
  rowAddress: { az: 'Ünvan',       ru: 'Адрес',       en: 'Address'     },
  rowDistrict:{ az: 'Rayon',       ru: 'Район',       en: 'District'    },
  rowCoords:  { az: 'Koordinatlar',ru: 'Координаты',  en: 'Coordinates' },

  // ── Building details rows ──
  rowType:         { az: 'Növ',              ru: 'Тип',              en: 'Type'          },
  rowFloors:       { az: 'Mərtəbə',          ru: 'Этажи',            en: 'Floors'        },
  rowBlocks:       { az: 'Blok',             ru: 'Блоки',            en: 'Blocks'        },
  rowUnitsFloor:   { az: 'Mənzil/Mərtəbə',   ru: 'Квартир/этаж',    en: 'Units/Floor'   },
  rowTotalUnits:   { az: 'Ümumi mənzil',     ru: 'Всего квартир',    en: 'Total Units'   },
  rowAvgSize:      { az: 'Ort. sahə',        ru: 'Ср. площадь',      en: 'Avg. Size'     },
  rowMinSize:      { az: 'Min. sahə',        ru: 'Мин. площадь',     en: 'Min. Size'     },
  rowMaxSize:      { az: 'Maks. sahə',       ru: 'Макс. площадь',    en: 'Max. Size'     },
  rowParking:      { az: 'Parkinq',          ru: 'Парковка',         en: 'Parking'       },
  rowYearBuilt:    { az: 'Tikinti ili',      ru: 'Год постройки',    en: 'Year Built'    },
  rowConstruction: { az: 'Tikinti növü',     ru: 'Конструкция',      en: 'Construction'  },

  // ── Offices ──
  officeCount: { az: '{n} ofis sahəsi (1-3 mərtəbə)', ru: '{n} офисов (этажи 1-3)', en: '{n} office spaces (floors 1-3)' },
  officeFloor: { az: 'Mərtəbə',  ru: 'Этаж',  en: 'Floor' },

  // ── Restaurants ──
  restOpen:   { az: 'Açıqdır',  ru: 'Открыто',  en: 'Open'   },
  restClosed: { az: 'Bağlıdır', ru: 'Закрыто',  en: 'Closed' },
  restSeats:  { az: 'oturacaq', ru: 'мест',     en: 'seats'  },
  restFloor:  { az: 'Mərtəbə',  ru: 'Этаж',    en: 'Floor'  },

  // ── Contact ──
  contactPhone:   { az: 'Telefon', ru: 'Телефон', en: 'Phone'   },
  contactEmail:   { az: 'E-poçt',  ru: 'E-mail',  en: 'Email'   },
  contactWebsite: { az: 'Vebsayt', ru: 'Сайт',    en: 'Website' },

  // ── MyLocation ──
  myLocation:   { az: 'Mənim yerim',             ru: 'Моё местоположение',        en: 'My Location'         },
  locationDenied: { az: 'Məkana giriş rədd edildi', ru: 'Доступ к местоположению запрещён', en: 'Location access denied' },

  // ── SunSlider ──
  sunPosition:   { az: 'Günəş mövqeyi',       ru: 'Положение солнца', en: 'Sun Position'  },
  periodNight:   { az: 'Gecə',                ru: 'Ночь',             en: 'Night'         },
  periodSunrise: { az: 'Gün çıxışı',          ru: 'Рассвет',          en: 'Sunrise'       },
  periodMorning: { az: 'Səhər',               ru: 'Утро',             en: 'Morning'       },
  periodNoon:    { az: 'Günorta',             ru: 'Полдень',          en: 'Noon'          },
  periodAfternoon:{ az: 'Günortadan sonra',   ru: 'День',             en: 'Afternoon'     },
  periodSunset:  { az: 'Gün batımı',          ru: 'Закат',            en: 'Sunset'        },

  // ── WeatherEffects ──
  weatherTitle:     { az: 'Hava effektləri',  ru: 'Погодные эффекты',  en: 'Weather Effects' },
  weatherClear:     { az: 'Aydın',            ru: 'Ясно',              en: 'Clear'           },
  weatherCloudy:    { az: 'Buludlu',          ru: 'Облачно',           en: 'Cloudy'          },
  weatherOvercast:  { az: 'Tutqun',           ru: 'Пасмурно',          en: 'Overcast'        },
  weatherFog:       { az: 'Duman',            ru: 'Туман',             en: 'Fog'             },
  weatherRain:      { az: 'Yağış',            ru: 'Дождь',             en: 'Rain'            },
  weatherHeavyRain: { az: 'Güclü yağış',      ru: 'Ливень',            en: 'Heavy Rain'      },
  weatherSnow:      { az: 'Qar',              ru: 'Снег',              en: 'Snow'            },
  weatherSandstorm: { az: 'Qum fırtınası',    ru: 'Песчаная буря',    en: 'Sandstorm'       },
};

// ── Sidebar data strings (multilingual) ──

export const DESCRIPTIONS: Record<Lang, string[]> = {
  az: [
    'SeaBreeze kurort zonasında yerləşən premium yaşayış kompleksi. Panoramik dəniz mənzərəsi və dünya səviyyəli infrastruktur təklif edir.',
    'Xəzər sahilində lüks yaşayış imkanı təqdim edən unikal layihə. Müasir dizayn və ekoloji materiallarla inşa edilib.',
    'Rahatlıq və zərifliyi birləşdirən eksklüziv sahil rezidensiyası. Birbaşa çimərliyə çıxış və kurort tipli xidmətlər mövcuddur.',
    'SeaBreeze-in mərkəzində yerləşən müasir çoxfunksiyalı kompleks. Yaşayış rahatlığı ilə kommersiya imkanlarını birləşdirir.',
    'Abşeron yarımadasında memarlıq şah əsəri. Döşəmədən tavana qədər pəncərələr Xəzər dənizinin heyrətamiz mənzərəsini açır.',
  ],
  ru: [
    'Премиальный жилой комплекс в курортной зоне SeaBreeze. Предлагает панорамный вид на море и инфраструктуру мирового уровня.',
    'Уникальный проект, предоставляющий роскошное жильё на берегу Каспийского моря. Построен с использованием современного дизайна и экологичных материалов.',
    'Эксклюзивная прибрежная резиденция, сочетающая комфорт и элегантность. Прямой выход к пляжу и курортные услуги.',
    'Современный многофункциональный комплекс в центре SeaBreeze. Объединяет жилой комфорт с коммерческими возможностями.',
    'Архитектурный шедевр на Абшеронском полуострове. Панорамные окна от пола до потолка открывают захватывающий вид на Каспий.',
  ],
  en: [
    'Premium residential complex in the SeaBreeze resort zone. Features panoramic sea views and world-class infrastructure.',
    'A unique project offering luxury living on the Caspian coast. Built with modern design and eco-friendly materials.',
    'Exclusive beachfront residence combining comfort and elegance. Direct beach access and resort-style services available.',
    'A modern mixed-use complex in the heart of SeaBreeze. Blends residential comfort with commercial opportunities.',
    'Architectural masterpiece on the Absheron Peninsula. Floor-to-ceiling windows reveal breathtaking views of the Caspian Sea.',
  ],
};

export const CONSTRUCTIONS: Record<Lang, string[]> = {
  az: ['Dəmir-beton', 'Metal karkas', 'Monolit beton', 'Yığma beton'],
  ru: ['Железобетон',  'Металлокаркас', 'Монолитный бетон', 'Сборный бетон'],
  en: ['Reinforced Concrete', 'Steel Frame', 'Monolithic Concrete', 'Precast Concrete'],
};

export const AMENITIES_DATA: Record<Lang, { icon: string; label: string }[]> = {
  az: [
    { icon: '🏊', label: 'Hovuz' }, { icon: '🏋️', label: 'İdman zalı' },
    { icon: '🅿️', label: 'Parkinq' }, { icon: '🛗', label: 'Lift' },
    { icon: '📹', label: 'Kamera' }, { icon: '🌐', label: 'WiFi' },
    { icon: '👮', label: 'Mühafizə' }, { icon: '🌳', label: 'Bağ' },
    { icon: '🧒', label: 'Uşaq meydançası' }, { icon: '🧺', label: 'Camaşırxana' },
  ],
  ru: [
    { icon: '🏊', label: 'Бассейн' }, { icon: '🏋️', label: 'Тренажёрный зал' },
    { icon: '🅿️', label: 'Парковка' }, { icon: '🛗', label: 'Лифт' },
    { icon: '📹', label: 'Видеонаблюдение' }, { icon: '🌐', label: 'WiFi' },
    { icon: '👮', label: 'Охрана' }, { icon: '🌳', label: 'Сад' },
    { icon: '🧒', label: 'Детская площадка' }, { icon: '🧺', label: 'Прачечная' },
  ],
  en: [
    { icon: '🏊', label: 'Pool' }, { icon: '🏋️', label: 'Gym' },
    { icon: '🅿️', label: 'Parking' }, { icon: '🛗', label: 'Elevator' },
    { icon: '📹', label: 'CCTV' }, { icon: '🌐', label: 'WiFi' },
    { icon: '👮', label: 'Security' }, { icon: '🌳', label: 'Garden' },
    { icon: '🧒', label: 'Playground' }, { icon: '🧺', label: 'Laundry' },
  ],
};

export const RESTAURANT_CUISINES: Record<Lang, string[]> = {
  az: ['Italyan mətbəxi', 'Qəhvə və şirniyyat', 'Yapon mətbəxi', 'Manqal və qril', 'Fransız mətbəxi', 'Türk fast-food', 'Azərbaycan mətbəxi', 'Şirələr və kokteyllər'],
  ru: ['Итальянская кухня', 'Кофе и выпечка', 'Японская кухня', 'Гриль и барбекю', 'Французская кухня', 'Турецкий фастфуд', 'Азербайджанская кухня', 'Соки и коктейли'],
  en: ['Italian Cuisine', 'Coffee & Pastry', 'Japanese Cuisine', 'Grill & BBQ', 'French Cuisine', 'Turkish Fast-food', 'Azerbaijani Cuisine', 'Juices & Cocktails'],
};

export const CATEGORY_LABELS_I18N: Record<string, Record<Lang, string>> = {
  hotel:         { az: 'Otel',          ru: 'Отель',              en: 'Hotel'         },
  residence:     { az: 'Rezidensiya',   ru: 'Резиденция',         en: 'Residence'     },
  villa:         { az: 'Villa',         ru: 'Вилла',              en: 'Villa'         },
  entertainment: { az: 'Əyləncə',       ru: 'Развлечения',        en: 'Entertainment' },
  beach:         { az: 'Çimərlik',      ru: 'Пляж',               en: 'Beach'         },
  restaurant:    { az: 'Restoran',      ru: 'Ресторан',           en: 'Restaurant'    },
  education:     { az: 'Təhsil',        ru: 'Образование',        en: 'Education'     },
  service:       { az: 'Xidmət',        ru: 'Услуга',             en: 'Service'       },
  landmark:      { az: 'Landmark',      ru: 'Достопримечательность', en: 'Landmark'   },
};
