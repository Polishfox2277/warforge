export const BASE_FACTION_SLOTS = [
  { id: 'eagle', slotName: 'slot_1' },
  { id: 'union', slotName: 'slot_2' },
  { id: 'nomads', slotName: 'slot_3' },
  { id: 'crown', slotName: 'slot_4' },
  { id: 'forge', slotName: 'slot_5' },
  { id: 'tide', slotName: 'slot_6' },
  { id: 'ashen', slotName: 'slot_7' },
  { id: 'highland', slotName: 'slot_8' }
];

export const FACTIONS = BASE_FACTION_SLOTS;

export const MAP_PRESETS = {
  skirmish: {
    id: 'skirmish',
    label: 'Pogranicze',
    description: 'Mała, organiczna mapa 4 kraje / 20 prowincji. Najlepsza do szybkiego testu.',
    rows: 4,
    cols: 5,
    factions: 4,
    width: 1040,
    height: 650,
    x0: 126,
    y0: 108,
    xStep: 174,
    yStep: 130,
    oddOffset: 72,
    jitterX: 34,
    jitterY: 28
  },
  continental: {
    id: 'continental',
    label: 'Kontynent Valdoru',
    description: 'Średnia organiczna mapa 6 krajów / 48 prowincji. Domyślna, najbardziej grywalna.',
    rows: 6,
    cols: 8,
    factions: 6,
    width: 1240,
    height: 800,
    x0: 90,
    y0: 86,
    xStep: 138,
    yStep: 108,
    oddOffset: 48,
    jitterX: 31,
    jitterY: 25
  },
  grand: {
    id: 'grand',
    label: 'Wielka Wojna',
    description: 'Duża organiczna mapa 8 krajów / 80 prowincji. Dłuższa kampania.',
    rows: 8,
    cols: 10,
    factions: 8,
    width: 1440,
    height: 960,
    x0: 88,
    y0: 88,
    xStep: 126,
    yStep: 98,
    oddOffset: 44,
    jitterX: 28,
    jitterY: 22
  }
};

export const DEFAULT_CUSTOM_COUNTRY = {
  name: 'Federacja Zenith',
  color: '#7b5cff',
  secondaryColor: '#f2b84b',
  ideology: 'industrialist',
  government: 'republic',
  doctrine: 'balanced',
  trait: 'engineers',
  flagPattern: 'horizontal',
  emblem: 'star'
};

export const IDEOLOGIES = {
  industrialist: {
    label: 'Industrializm',
    short: 'IND',
    description: '+12% dochodu 💰 i ⚙️, -8% kosztu przemysłu.',
    incomeMult: { money: 1.12, steel: 1.12 },
    buildingDiscounts: { industry: 0.92 },
    unitDiscounts: {},
    attackMult: 1,
    defenseMult: 1,
    cooldownMult: 1
  },
  militarist: {
    label: 'Militaryzm',
    short: 'MIL',
    description: '+7% ataku, -7% cooldownu, -4% kosztu jednostek.',
    incomeMult: {},
    buildingDiscounts: {},
    unitDiscounts: { infantry: 0.96, artillery: 0.96, tank: 0.96 },
    attackMult: 1.07,
    defenseMult: 1,
    cooldownMult: 0.93
  },
  collectivist: {
    label: 'Kolektywizm',
    short: 'KOL',
    description: '+14% dochodu 👥, +4% obrony, -8% kosztu piechoty.',
    incomeMult: { manpower: 1.14 },
    buildingDiscounts: {},
    unitDiscounts: { infantry: 0.92 },
    attackMult: 1,
    defenseMult: 1.04,
    cooldownMult: 1
  },
  technocrat: {
    label: 'Technokracja',
    short: 'TECH',
    description: '+8% dochodu 🛢️, -9% kosztu artylerii/czołgów i lotnisk.',
    incomeMult: { oil: 1.08 },
    buildingDiscounts: { airbase: 0.91 },
    unitDiscounts: { artillery: 0.91, tank: 0.91 },
    attackMult: 1,
    defenseMult: 1,
    cooldownMult: 1
  }
};

export const GOVERNMENTS = {
  republic: {
    label: 'Republika',
    description: '+8% dochodu pieniędzy, tańsze naprawy.',
    incomeMult: { money: 1.08 },
    repairDiscount: 0.88,
    stability: 1.02
  },
  monarchy: {
    label: 'Monarchia',
    description: '+5% obrony stolic i fortów, +5% rekrutów.',
    incomeMult: { manpower: 1.05 },
    capitalDefenseMult: 1.05,
    fortDefenseMult: 1.05
  },
  council: {
    label: 'Rada Ludowa',
    description: '+9% rekrutów, -6% kosztu piechoty.',
    incomeMult: { manpower: 1.09 },
    unitDiscounts: { infantry: 0.94 }
  },
  directorate: {
    label: 'Dyrektoriat',
    description: '+6% stali i ropy, -5% kosztu budynków.',
    incomeMult: { steel: 1.06, oil: 1.06 },
    buildingDiscounts: { industry: 0.95, fort: 0.95, airbase: 0.95 }
  }
};

export const DOCTRINES = {
  balanced: {
    label: 'Doktryna zrównoważona',
    description: 'Brak ryzykownych skrajności. +3% ataku i obrony.',
    attackMult: 1.03,
    defenseMult: 1.03,
    cooldownMult: 1
  },
  maneuver: {
    label: 'Manewrowa',
    description: '-12% cooldownu ruchu i ataku, ale -3% obrony.',
    attackMult: 1,
    defenseMult: 0.97,
    cooldownMult: 0.88
  },
  firepower: {
    label: 'Siła ognia',
    description: '+9% ataku artylerii i czołgów, +5% kosztu jednostek.',
    attackMult: 1.04,
    heavyAttackMult: 1.09,
    defenseMult: 1,
    unitCostMult: 1.05,
    cooldownMult: 1
  },
  defense: {
    label: 'Obrona głęboka',
    description: '+9% obrony, forty efektywniejsze, +6% cooldownu.',
    attackMult: 0.98,
    defenseMult: 1.09,
    fortDefenseMult: 1.1,
    cooldownMult: 1.06
  }
};

export const TRAITS = {
  engineers: {
    label: 'Korpus inżynieryjny',
    description: '-12% kosztu fortów i napraw.',
    buildingDiscounts: { fort: 0.88 },
    repairDiscount: 0.88
  },
  miners: {
    label: 'Zagłębia rudne',
    description: '+12% dochodu ⚙️.',
    incomeMult: { steel: 1.12 }
  },
  oilfields: {
    label: 'Pola naftowe',
    description: '+14% dochodu 🛢️.',
    incomeMult: { oil: 1.14 }
  },
  traders: {
    label: 'Kupcy i banki',
    description: '+10% pieniędzy, +4% kosztu rekrutacji.',
    incomeMult: { money: 1.10 },
    unitCostMult: 1.04
  },
  patriots: {
    label: 'Patriotyczna mobilizacja',
    description: '+10% rekrutów, -3% obrony.',
    incomeMult: { manpower: 1.10 },
    defenseMult: 0.97
  }
};

export const BOT_COUNTRY_PRESETS = [
  { name: 'Republika Bursztynu', color: '#c4525a', secondaryColor: '#f4d26a', ideology: 'industrialist', government: 'republic', doctrine: 'balanced', trait: 'traders', flagPattern: 'vertical', emblem: 'gear' },
  { name: 'Wolne Marchie Ardonii', color: '#4d89e8', secondaryColor: '#d7e6ff', ideology: 'technocrat', government: 'directorate', doctrine: 'firepower', trait: 'oilfields', flagPattern: 'cross', emblem: 'star' },
  { name: 'Konfederacja Nivarii', color: '#4eaf73', secondaryColor: '#f1f7ef', ideology: 'collectivist', government: 'council', doctrine: 'defense', trait: 'patriots', flagPattern: 'horizontal', emblem: 'sun' },
  { name: 'Królestwo Solwinu', color: '#d6a047', secondaryColor: '#5f2d16', ideology: 'militarist', government: 'monarchy', doctrine: 'balanced', trait: 'engineers', flagPattern: 'diagonal', emblem: 'crown' },
  { name: 'Związek Trzech Portów', color: '#3ca6a6', secondaryColor: '#efffff', ideology: 'industrialist', government: 'republic', doctrine: 'maneuver', trait: 'traders', flagPattern: 'horizontal', emblem: 'anchor' },
  { name: 'Dyrektoriat Valon', color: '#8d6cf7', secondaryColor: '#f7f0ff', ideology: 'technocrat', government: 'directorate', doctrine: 'firepower', trait: 'miners', flagPattern: 'vertical', emblem: 'gear' },
  { name: 'Front Północnych Rubieży', color: '#688e45', secondaryColor: '#f6f0cb', ideology: 'collectivist', government: 'council', doctrine: 'defense', trait: 'engineers', flagPattern: 'cross', emblem: 'star' },
  { name: 'Liga Szkarłatnych Mostów', color: '#b64662', secondaryColor: '#f7d6df', ideology: 'militarist', government: 'republic', doctrine: 'maneuver', trait: 'patriots', flagPattern: 'horizontal', emblem: 'sun' },
  { name: 'Księstwa Asterii', color: '#dd7f3e', secondaryColor: '#fff4e7', ideology: 'militarist', government: 'monarchy', doctrine: 'firepower', trait: 'oilfields', flagPattern: 'diagonal', emblem: 'crown' },
  { name: 'Komuna Rudnych Wzgórz', color: '#9d4edd', secondaryColor: '#f1defc', ideology: 'collectivist', government: 'council', doctrine: 'balanced', trait: 'miners', flagPattern: 'vertical', emblem: 'hammer' },
  { name: 'Republika Morenii', color: '#3278b3', secondaryColor: '#f4f8fb', ideology: 'technocrat', government: 'republic', doctrine: 'maneuver', trait: 'traders', flagPattern: 'horizontal', emblem: 'anchor' },
  { name: 'Stalowa Unia Karsji', color: '#7e8c99', secondaryColor: '#f4ca64', ideology: 'industrialist', government: 'directorate', doctrine: 'defense', trait: 'engineers', flagPattern: 'cross', emblem: 'gear' },
  { name: 'Protektorat Czarnych Kopuł', color: '#59606f', secondaryColor: '#f6d365', ideology: 'militarist', government: 'directorate', doctrine: 'defense', trait: 'miners', flagPattern: 'diagonal', emblem: 'crown' },
  { name: 'Rzeczpospolita Miru', color: '#2f9e8f', secondaryColor: '#f8fff9', ideology: 'industrialist', government: 'republic', doctrine: 'balanced', trait: 'oilfields', flagPattern: 'cross', emblem: 'anchor' },
  { name: 'Zakon Wysokiej Przełęczy', color: '#a15c38', secondaryColor: '#fff0d0', ideology: 'collectivist', government: 'monarchy', doctrine: 'defense', trait: 'engineers', flagPattern: 'vertical', emblem: 'sun' },
  { name: 'Liga Lazurowego Brzegu', color: '#1d70a2', secondaryColor: '#b8f3ff', ideology: 'technocrat', government: 'republic', doctrine: 'maneuver', trait: 'traders', flagPattern: 'horizontal', emblem: 'anchor' }
];

export const UNIT_TYPES = {
  infantry: { label: 'Piechota', short: 'P', cost: { money: 80, manpower: 75, steel: 8, oil: 0 }, attack: 34, defense: 34, move: 1, cooldownMs: 9500 },
  artillery: { label: 'Artyleria', short: 'A', cost: { money: 120, manpower: 45, steel: 30, oil: 0 }, attack: 56, defense: 18, move: 1, cooldownMs: 12500 },
  tank: { label: 'Czołgi', short: 'C', cost: { money: 170, manpower: 38, steel: 55, oil: 38 }, attack: 72, defense: 42, move: 1, cooldownMs: 14500 }
};

export const BUILDINGS = {
  industry: { label: 'Przemysł', max: 4, cost: { money: 115, manpower: 10, steel: 60, oil: 0 }, description: '+ dochód i produkcja' },
  fort: { label: 'Forty', max: 3, cost: { money: 95, manpower: 25, steel: 55, oil: 0 }, description: '+ umiarkowana obrona, słabsza przeciw artylerii' },
  airbase: { label: 'Lotnisko', max: 2, cost: { money: 105, manpower: 15, steel: 40, oil: 20 }, description: 'rezerwa pod lotnictwo' }
};

export const BALANCE = {
  maxUnitCooldownMs: 30000,
  fortDefenseByLevel: [0, 4, 7, 10],
  fortDamageReductionByLevel: [0, 0.03, 0.05, 0.07],
  artilleryFortPierceByLevel: [0, 3, 5, 7]
};

export const REALTIME_DEFAULTS = {
  dayMs: 34000,
  economyEveryMs: 14000,
  aiEveryMs: 5200,
  maxCatchUpMs: 45000
};

export const SETUP_DEFAULTS = {
  mapId: 'continental',
  pace: 'normal',
  difficulty: 'normal',
  startResources: 'normal'
};

const SETUP_PRESETS = {
  pace: {
    slow: { economyEveryMs: 19000, aiEveryMs: 7000, dayMs: 46000 },
    normal: { economyEveryMs: 14000, aiEveryMs: 5200, dayMs: 34000 },
    fast: { economyEveryMs: 9500, aiEveryMs: 3900, dayMs: 26000 }
  },
  startResources: {
    low: 0.82,
    normal: 1,
    high: 1.35
  },
  difficulty: {
    easy: { botResources: 0.62, botIncome: 0.72, botAttack: 0.84, botRecruitChance: 0.28, botBuildChance: 0.25, botMoveChance: 0.48, aiEveryFactor: 1.55 },
    normal: { botResources: 0.82, botIncome: 0.88, botAttack: 0.94, botRecruitChance: 0.38, botBuildChance: 0.34, botMoveChance: 0.58, aiEveryFactor: 1.25 },
    hard: { botResources: 1.04, botIncome: 1.03, botAttack: 1.02, botRecruitChance: 0.48, botBuildChance: 0.44, botMoveChance: 0.66, aiEveryFactor: 1 }
  }
};

const NAME_POOL = [
  'Arden', 'Ravel', 'Korn', 'Srebrny Bród', 'Falk', 'Nowy Port', 'Wysoka Latarnia', 'Rivermark',
  'Dolina Solna', 'Ester', 'Wolnigrad', 'Bursztyn', 'Księżycowe Pola', 'Żelazny Trakt', 'Mokradła Elsen', 'Brzeg Wschodni',
  'Kaldera', 'Mosty', 'Dębina', 'Rudnica', 'Stare Opactwo', 'Srebrna', 'Północny Przesmyk', 'Zielona Marchia',
  'Górny Step', 'Orch', 'Pustkowie', 'Bielica', 'Suchy Las', 'Równia Koronna', 'Czarne Kopce', 'Złoty Jar',
  'Królewiec', 'Południca', 'Kamienny Brzeg', 'Wyżyna Sarn', 'Kopalnie Vald', 'Delta Miru', 'Port Słony', 'Ostatnia Straż',
  'Czerwona Przełęcz', 'Niziny Toru', 'Wrzosowisko', 'Głębokie Jezioro', 'Lazurowy Brzeg', 'Trzy Wieże', 'Zamek Południa', 'Ogród Korony',
  'Szklany Las', 'Nadbrzeże Kruków', 'Białe Mury', 'Ruda Zatoka', 'Wielkie Łąki', 'Słoneczne Pole', 'Mroźna Granica', 'Zielony Fort',
  'Półwysep Dor', 'Stare Kopalnie', 'Siedem Mostów', 'Nowa Kaldera', 'Pustynia Varr', 'Złote Wydmy', 'Górna Rzeka', 'Skały Nivar',
  'Okręg Mir', 'Cisowe Pola', 'Wrota Zachodu', 'Słony Jar', 'Mglista Dolina', 'Północne Baszty', 'Ostatnia Delta', 'Przylądek Falk',
  'Dolina Trzech Wsi', 'Ognisty Grzbiet', 'Martwy Las', 'Niebieski Trakt', 'Kamienna Rzeka', 'Rubież Koralowa', 'Żurawie Bagna', 'Cichy Port'
];

const TERRAINS = ['plains', 'forest', 'hills', 'city', 'marsh'];
const TERRAIN_LABELS = { plains: 'równiny', forest: 'las', hills: 'wzgórza', city: 'miasto', marsh: 'bagna' };
const TERRAIN_DEF = { plains: 0, forest: 5, hills: 9, city: 11, marsh: 7 };
const TERRAIN_ORG_LOSS = { plains: 2, forest: 4, hills: 5, city: 6, marsh: 6 };

export function terrainLabel(terrain) {
  return TERRAIN_LABELS[terrain] ?? terrain;
}

export function createInitialState({ humanName = 'Gracz', mode = 'local', userId = null, customCountry = null, setup = {} } = {}) {
  const gameSetup = normalizeSetup(setup);
  const mapPreset = MAP_PRESETS[gameSetup.public.mapId] ?? MAP_PRESETS.continental;
  const factionSlots = BASE_FACTION_SLOTS.slice(0, mapPreset.factions);
  const mapSeed = Number.isFinite(Number(setup?.mapSeed)) ? Number(setup.mapSeed) : Math.floor(Math.random() * 1_000_000_000);
  const provinces = createMap(mapPreset, factionSlots, mapSeed);
  const wallNow = Date.now();
  const hostCountry = normalizeCountryProfile(customCountry, BOT_COUNTRY_PRESETS[0], 'eagle');
  const botProfiles = pickBotProfiles(mapPreset.factions - 1, [hostCountry.name]);

  const players = factionSlots.map((slot, index) => {
    const country = index === 0 ? hostCountry : normalizeCountryProfile(botProfiles[index - 1], BOT_COUNTRY_PRESETS[index - 1], slot.id);
    return {
      id: slot.id,
      name: country.name,
      color: country.color,
      secondaryColor: country.secondaryColor,
      ideology: country.ideology,
      government: country.government,
      doctrine: country.doctrine,
      trait: country.trait,
      flag: country.flag,
      type: index === 0 ? 'human' : 'bot',
      controller: index === 0 ? userId : null,
      nickname: index === 0 ? humanName : country.name,
      resources: scaledStartResources(index === 0 ? gameSetup.humanResourceFactor : gameSetup.botResourceFactor),
      aiModifiers: index === 0 ? null : gameSetup.botModifiers,
      eliminated: false
    };
  });

  if (mode === 'multiplayer') {
    players[0].type = 'human';
    players[0].controller = userId;
    players[0].nickname = humanName || 'Host';
    for (let i = 1; i < players.length; i += 1) {
      players[i].type = 'open';
      players[i].controller = null;
      players[i].nickname = 'Wolne miejsce';
    }
  }

  const units = [];
  for (const player of players) {
    const capital = provinces.find(p => p.owner === player.id && p.capital) ?? provinces.find(p => p.owner === player.id);
    if (!capital) continue;
    units.push(createUnit('infantry', player.id, capital.id, 0));
    units.push(createUnit(player.id === 'eagle' ? 'artillery' : 'infantry', player.id, capital.id, 0));
    if (player.id === 'eagle' && mapPreset.factions >= 6) {
      units.push(createUnit('infantry', player.id, capital.id, 0));
    }
  }

  return {
    schema: 6,
    mode,
    version: 0,
    rng: 174921,
    day: 1,
    gameTimeMs: 0,
    hostUserId: mode === 'multiplayer' ? userId : null,
    setup: { ...gameSetup.public, mapSeed },
    mapMeta: { width: mapPreset.width, height: mapPreset.height, rows: mapPreset.rows, cols: mapPreset.cols, id: mapPreset.id, label: mapPreset.label, seed: mapSeed },
    realtime: {
      paused: false,
      lastWallAt: wallNow,
      lastEconomyAt: 0,
      lastAiAt: 0,
      dayMs: gameSetup.dayMs,
      economyEveryMs: gameSetup.economyEveryMs,
      aiEveryMs: gameSetup.aiEveryMs
    },
    provinces,
    units,
    players,
    selectedProvinceId: null,
    selectedUnitId: null,
    log: [`Rozpoczęto kampanię na mapie ${mapPreset.label}. Normalny balans jest teraz łagodniejszy: puste pola są łatwe, boty wolniejsze, a gracz ma więcej czasu na decyzje.`]
  };
}

function createMap(preset, factionSlots, mapSeed = 174921) {
  const provinces = [];
  const capitals = capitalPositions(preset, factionSlots.length);
  const centers = capitals.map((pos, i) => ({
    ...pos,
    owner: factionSlots[i].id,
    pull: 0.84 + seededRandom(mapSeed, 11, i) * 0.34
  }));

  for (let r = 0; r < preset.rows; r += 1) {
    for (let c = 0; c < preset.cols; c += 1) {
      const index = r * preset.cols + c;
      const id = `p${index}`;
      const capitalIndex = capitals.findIndex(pos => pos.row === r && pos.col === c);
      const terrain = terrainFor(r, c, preset, capitalIndex >= 0, mapSeed);
      const owner = capitalIndex >= 0
        ? factionSlots[capitalIndex].id
        : nearestCenterOwner(r, c, centers, mapSeed);
      const drift = organicProvinceDrift(r, c, preset, mapSeed);
      const x = clampNumber(preset.x0 + c * preset.xStep + (r % 2) * preset.oddOffset + drift.x, 58, preset.width - 58);
      const y = clampNumber(preset.y0 + r * preset.yStep + drift.y, 58, preset.height - 58);
      provinces.push({
        id,
        name: NAME_POOL[(index + Math.floor(mapSeed % NAME_POOL.length)) % NAME_POOL.length] ?? `Prowincja ${r + 1}-${c + 1}`,
        row: r,
        col: c,
        x: Math.round(x),
        y: Math.round(y),
        owner,
        terrain,
        capital: capitalIndex >= 0,
        coastline: isCoastlineProvince(r, c, preset, mapSeed),
        shape: provinceShape(index, terrain, capitalIndex >= 0, mapSeed),
        devastation: 0,
        resources: provinceResources(terrain, capitalIndex >= 0),
        buildings: {
          industry: capitalIndex >= 0 ? 2 : terrain === 'city' ? 1 : 0,
          fort: capitalIndex >= 0 ? 1 : 0,
          airbase: 0
        }
      });
    }
  }

  softenBorders(provinces, preset, factionSlots, mapSeed);
  for (const province of provinces) {
    province.neighbors = findNeighbors(province, provinces).map(p => p.id);
  }
  return provinces;
}

function capitalPositions(preset, count) {
  const lastR = preset.rows - 1;
  const lastC = preset.cols - 1;
  const midR = Math.floor(lastR / 2);
  const midC = Math.floor(lastC / 2);
  const positions = [
    { row: 0, col: 0 },
    { row: 0, col: lastC },
    { row: lastR, col: 0 },
    { row: lastR, col: lastC },
    { row: midR, col: 0 },
    { row: midR, col: lastC },
    { row: 0, col: midC },
    { row: lastR, col: midC }
  ];
  return positions.slice(0, count);
}

function nearestCenterOwner(row, col, centers, mapSeed = 174921) {
  let best = centers[0];
  let bestDist = Number.POSITIVE_INFINITY;
  for (let i = 0; i < centers.length; i += 1) {
    const center = centers[i];
    const dRow = row - center.row;
    const dCol = col - center.col;
    const borderNoise = (seededRandom(mapSeed, row + 101, col + 211, i) - 0.5) * 1.55;
    const dist = (dRow * dRow * 1.05 + dCol * dCol * 1.16) * (center.pull ?? 1) + borderNoise;
    if (dist < bestDist) {
      best = center;
      bestDist = dist;
    }
  }
  return best.owner;
}

function softenBorders(provinces, preset, slots, mapSeed = 174921) {
  if (slots.length < 5) return;
  const byRC = (r, c) => provinces.find(p => p.row === r && p.col === c);
  const flips = [
    [1, Math.floor(preset.cols / 2) - 1, slots[1]?.id],
    [2, Math.floor(preset.cols / 2), slots[0]?.id],
    [preset.rows - 2, Math.floor(preset.cols / 2) - 1, slots[3]?.id],
    [preset.rows - 3, Math.floor(preset.cols / 2), slots[2]?.id],
    [Math.floor(preset.rows / 2), 1, slots[4]?.id],
    [Math.floor(preset.rows / 2), preset.cols - 2, slots[5]?.id ?? slots[1]?.id]
  ];
  for (const [r, c, owner] of flips) {
    const p = byRC(r, c);
    if (p && owner && seededRandom(mapSeed, r + 7, c + 13) > 0.26) p.owner = owner;
  }
}

function terrainFor(r, c, preset, capital, mapSeed = 174921) {
  if (capital) return 'city';
  const n = seededRandom(mapSeed, r + 31, c + 47);
  const ridge = Math.abs((r / Math.max(1, preset.rows - 1)) - (0.28 + seededRandom(mapSeed, c + 5, 91) * 0.42));
  const riverBand = Math.abs((c / Math.max(1, preset.cols - 1)) - (0.18 + seededRandom(mapSeed, r + 9, 183) * 0.66));
  if (n > 0.91 || ((r + c * 2 + Math.floor(mapSeed % 7)) % 13 === 0)) return 'city';
  if (ridge < 0.12 || n < 0.13) return 'hills';
  if (riverBand < 0.09 || (n > 0.69 && n < 0.8)) return 'marsh';
  if (n > 0.43 && n < 0.68) return 'forest';
  return 'plains';
}

function organicProvinceDrift(r, c, preset, mapSeed) {
  const edgeR = Math.min(r, preset.rows - 1 - r);
  const edgeC = Math.min(c, preset.cols - 1 - c);
  const edgeEase = Math.max(0.35, Math.min(1, Math.min(edgeR + 0.7, edgeC + 0.7) / 2.2));
  const wobbleX = (seededRandom(mapSeed, r + 17, c + 29) - 0.5) * 2 * (preset.jitterX ?? 28) * edgeEase;
  const wobbleY = (seededRandom(mapSeed, r + 37, c + 41) - 0.5) * 2 * (preset.jitterY ?? 22) * edgeEase;
  const continentCurve = Math.sin((r + 1) * 1.17 + mapSeed * 0.00001) * (preset.jitterX ?? 28) * 0.28;
  return { x: wobbleX + continentCurve, y: wobbleY };
}

function isCoastlineProvince(r, c, preset, mapSeed) {
  const edge = r === 0 || c === 0 || r === preset.rows - 1 || c === preset.cols - 1;
  const inlet = seededRandom(mapSeed, r + 71, c + 73) > 0.78 && (r < 2 || c < 2 || r > preset.rows - 3 || c > preset.cols - 3);
  return edge || inlet;
}

function provinceShape(index, terrain, capital, mapSeed) {
  const sides = capital ? 9 : 8;
  const points = [];
  const rotation = (seededRandom(mapSeed, index + 5, 601) - 0.5) * 0.28;
  for (let i = 0; i < sides; i += 1) {
    const angle = rotation + (Math.PI * 2 * i) / sides;
    const terrainScale = terrain === 'hills' ? 1.08 : terrain === 'marsh' ? 0.94 : terrain === 'city' ? 0.98 : 1;
    const rx = (54 + seededRandom(mapSeed, index + 17, i + 101) * 24) * terrainScale;
    const ry = (40 + seededRandom(mapSeed, index + 23, i + 113) * 20) * (capital ? 1.08 : 1);
    points.push([
      Math.round(Math.cos(angle) * rx),
      Math.round(Math.sin(angle) * ry)
    ]);
  }
  return { points };
}

function seededRandom(...values) {
  let h = 2166136261;
  for (const value of values) {
    const text = String(value);
    for (let i = 0; i < text.length; i += 1) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
  }
  h += h << 13; h ^= h >>> 7;
  h += h << 3; h ^= h >>> 17;
  h += h << 5;
  return ((h >>> 0) % 1000000) / 1000000;
}

function provinceResources(terrain, capital) {
  const base = { money: 24, manpower: 20, steel: 9, oil: 5 };
  if (capital) return { money: 62, manpower: 46, steel: 26, oil: 12 };
  if (terrain === 'city') return { money: 46, manpower: 32, steel: 16, oil: 6 };
  if (terrain === 'hills') return { money: 20, manpower: 14, steel: 28, oil: 5 };
  if (terrain === 'forest') return { money: 18, manpower: 26, steel: 11, oil: 4 };
  if (terrain === 'marsh') return { money: 15, manpower: 12, steel: 8, oil: 20 };
  return base;
}

function findNeighbors(province, all) {
  const dirsEven = [[0, -1], [0, 1], [-1, -1], [-1, 0], [1, -1], [1, 0]];
  const dirsOdd = [[0, -1], [0, 1], [-1, 0], [-1, 1], [1, 0], [1, 1]];
  const dirs = province.row % 2 === 0 ? dirsEven : dirsOdd;
  return dirs
    .map(([dr, dc]) => all.find(p => p.row === province.row + dr && p.col === province.col + dc))
    .filter(Boolean);
}

export function createUnit(type, owner, location, now = 0) {
  return {
    id: `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    type,
    owner,
    location,
    hp: 100,
    xp: 0,
    availableAt: now,
    acted: false
  };
}

export function migrateState(state) {
  if (!state) return state;
  state.schema = 6;
  state.day = state.day ?? state.turn ?? 1;
  state.gameTimeMs = state.gameTimeMs ?? Math.max(0, ((state.turn ?? 1) - 1) * REALTIME_DEFAULTS.dayMs);
  state.setup = { ...SETUP_DEFAULTS, ...(state.setup ?? {}) };
  const mapSeed = Number.isFinite(Number(state.setup?.mapSeed ?? state.mapMeta?.seed)) ? Number(state.setup?.mapSeed ?? state.mapMeta?.seed) : 174921;
  state.mapMeta = {
    width: 1180,
    height: 760,
    rows: 6,
    cols: 8,
    ...(state.mapMeta ?? {}),
    id: state.setup.mapId ?? state.mapMeta?.id ?? 'continental',
    label: MAP_PRESETS[state.setup.mapId]?.label ?? state.mapMeta?.label ?? 'Mapa',
    seed: mapSeed
  };
  state.mapMeta.width = clampNumber(state.mapMeta.width, 600, 2200);
  state.mapMeta.height = clampNumber(state.mapMeta.height, 420, 1600);
  state.realtime = {
    paused: false,
    lastWallAt: Date.now(),
    lastEconomyAt: 0,
    lastAiAt: 0,
    dayMs: REALTIME_DEFAULTS.dayMs,
    economyEveryMs: REALTIME_DEFAULTS.economyEveryMs,
    aiEveryMs: REALTIME_DEFAULTS.aiEveryMs,
    ...(state.realtime ?? {})
  };
  if (Array.isArray(state.provinces)) {
    for (const province of state.provinces) {
      province.devastation = clampNumber(province.devastation ?? 0, 0, 100);
      province.buildings = { industry: 0, fort: 0, airbase: 0, ...(province.buildings ?? {}) };
      province.resources = { money: 20, manpower: 15, steel: 6, oil: 3, ...(province.resources ?? {}) };
      province.x = clampNumber(province.x ?? 0, 0, state.mapMeta.width);
      province.y = clampNumber(province.y ?? 0, 0, state.mapMeta.height);
      province.coastline = Boolean(province.coastline);
      if (!province.shape || !Array.isArray(province.shape.points)) {
        province.shape = provinceShape(Number.parseInt(String(province.id).slice(1), 10) || 0, province.terrain, Boolean(province.capital), state.mapMeta.seed ?? 174921);
      }
    }
  }
  if (!Array.isArray(state.players)) state.players = [];
  for (const player of state.players) {
    player.resources = {
      money: 0,
      manpower: 0,
      steel: 0,
      oil: 0,
      ...(player.resources ?? {})
    };
    player.eliminated = Boolean(player.eliminated);
    player.aiModifiers = player.aiModifiers ?? null;
    player.nickname = safeText(player.nickname || player.name || 'Dowódca', 40);
    player.name = safeText(player.name || player.nickname || 'Państwo', 40);
    player.color = normalizeColor(player.color, '#6c7a9c');
    player.secondaryColor = normalizeColor(player.secondaryColor, '#e8edf8');
    player.ideology = IDEOLOGIES[player.ideology] ? player.ideology : DEFAULT_CUSTOM_COUNTRY.ideology;
    player.government = GOVERNMENTS[player.government] ? player.government : DEFAULT_CUSTOM_COUNTRY.government;
    player.doctrine = DOCTRINES[player.doctrine] ? player.doctrine : DEFAULT_CUSTOM_COUNTRY.doctrine;
    player.trait = TRAITS[player.trait] ? player.trait : DEFAULT_CUSTOM_COUNTRY.trait;
    player.flag = normalizeFlag(player.flag, player.color, player.secondaryColor);
    if (!player.name) player.name = player.nickname || 'Państwo';
  }
  if (!Array.isArray(state.units)) state.units = [];
  for (const unit of state.units) {
    normalizeUnitCooldown(state, unit);
    unit.acted = false;
  }
  state.log = Array.isArray(state.log) ? state.log : [];
  state.version = state.version ?? 0;
  return state;
}

export function currentPlayer(state) {
  migrateState(state);
  return state.players.find(p => p.type === 'human' && !p.eliminated) ?? state.players.find(p => p.type !== 'open' && !p.eliminated) ?? state.players[0];
}

export function getPlayer(state, playerId) {
  return state.players.find(p => p.id === playerId);
}

export function getControlledPlayer(state, userId) {
  if (!userId) return null;
  migrateState(state);
  return state.players.find(p => p.type === 'human' && p.controller === userId && !p.eliminated) ?? null;
}

export function getProvince(state, provinceId) {
  return state.provinces.find(p => p.id === provinceId);
}

export function unitsAt(state, provinceId) {
  return state.units.filter(u => u.location === provinceId && u.hp > 0);
}

export function ownUnitsAt(state, provinceId, owner) {
  return unitsAt(state, provinceId).filter(u => u.owner === owner);
}

export function enemyUnitsAt(state, provinceId, owner) {
  return unitsAt(state, provinceId).filter(u => u.owner !== owner);
}

export function canAfford(player, cost) {
  return Object.entries(cost).every(([key, value]) => (player?.resources?.[key] ?? 0) >= value);
}

function pay(player, cost) {
  for (const [key, value] of Object.entries(cost)) player.resources[key] -= value;
}

export function formatCost(cost) {
  return Object.entries(cost ?? {})
    .filter(([, value]) => value > 0)
    .map(([key, value]) => `${resourceIcon(key)} ${Math.round(value)}`)
    .join(' · ');
}

export function resourceIcon(key) {
  return { money: '💰', manpower: '👥', steel: '⚙️', oil: '🛢️' }[key] ?? key;
}

export function provinceIncome(province) {
  const industry = province.buildings.industry ?? 0;
  const devastation = clampNumber(province.devastation ?? 0, 0, 100);
  const economyFactor = Math.max(0.55, 1 - devastation / 160);
  return {
    money: Math.round((province.resources.money + industry * 18 + (province.capital ? 18 : 0)) * economyFactor),
    manpower: Math.round((province.resources.manpower + industry * 4) * economyFactor),
    steel: Math.round((province.resources.steel + industry * 10) * economyFactor),
    oil: Math.round((province.resources.oil + (province.buildings.airbase ?? 0) * 2) * economyFactor)
  };
}

export function incomeForPlayer(state, playerId) {
  const player = getPlayer(state, playerId);
  const total = { money: 0, manpower: 0, steel: 0, oil: 0 };
  for (const province of state.provinces.filter(p => p.owner === playerId)) {
    const income = provinceIncome(province);
    for (const key of Object.keys(total)) total[key] += income[key];
  }
  const boosted = applyIncomeBonuses(player, total);
  if (player?.type === 'bot' && player.aiModifiers?.botIncome) {
    for (const key of Object.keys(boosted)) boosted[key] = Math.round(boosted[key] * player.aiModifiers.botIncome);
  }
  return boosted;
}

export function unitCostForPlayer(player, unitType) {
  const def = UNIT_TYPES[unitType];
  if (!def) return null;
  const factor = (IDEOLOGIES[player?.ideology]?.unitDiscounts?.[unitType] ?? 1)
    * (GOVERNMENTS[player?.government]?.unitDiscounts?.[unitType] ?? 1)
    * (TRAITS[player?.trait]?.unitDiscounts?.[unitType] ?? 1)
    * (DOCTRINES[player?.doctrine]?.unitCostMult ?? 1)
    * (TRAITS[player?.trait]?.unitCostMult ?? 1);
  return scaleCost(def.cost, factor);
}

export function buildingCostForPlayer(player, buildingType) {
  const def = BUILDINGS[buildingType];
  if (!def) return null;
  const factor = (IDEOLOGIES[player?.ideology]?.buildingDiscounts?.[buildingType] ?? 1)
    * (GOVERNMENTS[player?.government]?.buildingDiscounts?.[buildingType] ?? 1)
    * (TRAITS[player?.trait]?.buildingDiscounts?.[buildingType] ?? 1);
  return scaleCost(def.cost, factor);
}

export function ideologySummary(player) {
  const ideology = IDEOLOGIES[player?.ideology] ?? IDEOLOGIES[DEFAULT_CUSTOM_COUNTRY.ideology];
  const government = GOVERNMENTS[player?.government] ?? GOVERNMENTS[DEFAULT_CUSTOM_COUNTRY.government];
  const doctrine = DOCTRINES[player?.doctrine] ?? DOCTRINES[DEFAULT_CUSTOM_COUNTRY.doctrine];
  const trait = TRAITS[player?.trait] ?? TRAITS[DEFAULT_CUSTOM_COUNTRY.trait];
  return `${ideology.label} · ${government.label} · ${doctrine.label} · ${trait.label}`;
}

export function buildBuilding(state, provinceId, buildingType, actorPlayerId = null) {
  migrateState(state);
  const player = getActionPlayer(state, actorPlayerId);
  const province = getProvince(state, provinceId);
  const building = BUILDINGS[buildingType];
  const effectiveCost = buildingCostForPlayer(player, buildingType);
  if (!player) return fail('Nie kontrolujesz aktywnego państwa.');
  if (!province || !building) return fail('Nieznana budowa.');
  if (province.owner !== player.id) return fail('Możesz budować tylko we własnej prowincji.');
  const level = province.buildings[buildingType] ?? 0;
  if (level >= building.max) return fail(`${building.label} osiągnęło maksymalny poziom.`);
  if (!canAfford(player, effectiveCost)) return fail(`Brakuje zasobów: ${formatCost(effectiveCost)}.`);
  pay(player, effectiveCost);
  province.buildings[buildingType] = level + 1;
  pushLog(state, `${player.nickname}: rozbudowano ${building.label} w ${province.name} do poziomu ${level + 1}.`);
  mutate(state);
  return ok();
}

export function repairProvince(state, provinceId, actorPlayerId = null) {
  migrateState(state);
  const player = getActionPlayer(state, actorPlayerId);
  const province = getProvince(state, provinceId);
  if (!player) return fail('Nie kontrolujesz aktywnego państwa.');
  if (!province) return fail('Nieznana prowincja.');
  if (province.owner !== player.id) return fail('Możesz naprawiać tylko własną prowincję.');
  const damage = clampNumber(province.devastation ?? 0, 0, 100);
  if (damage <= 0) return fail('Ta prowincja nie wymaga napraw.');
  const discount = (GOVERNMENTS[player.government]?.repairDiscount ?? 1) * (TRAITS[player.trait]?.repairDiscount ?? 1);
  const cost = scaleCost({
    money: Math.max(25, Math.round(damage * 1.25)),
    manpower: Math.max(5, Math.round(damage * 0.3)),
    steel: Math.max(8, Math.round(damage * 0.65)),
    oil: 0
  }, discount);
  if (!canAfford(player, cost)) return fail(`Brakuje zasobów na naprawy: ${formatCost(cost)}.`);
  pay(player, cost);
  province.devastation = Math.max(0, damage - 40);
  pushLog(state, `${player.nickname}: naprawiono zniszczenia w ${province.name} do ${province.devastation}%.`);
  mutate(state);
  return ok();
}

export function recruitUnit(state, provinceId, unitType, actorPlayerId = null) {
  migrateState(state);
  const player = getActionPlayer(state, actorPlayerId);
  const province = getProvince(state, provinceId);
  const unitDef = UNIT_TYPES[unitType];
  const effectiveCost = unitCostForPlayer(player, unitType);
  if (!player) return fail('Nie kontrolujesz aktywnego państwa.');
  if (!province || !unitDef) return fail('Nieznana rekrutacja.');
  if (province.owner !== player.id) return fail('Rekrutacja jest możliwa tylko we własnej prowincji.');
  if (ownUnitsAt(state, province.id, player.id).length >= 5) return fail('Limit lokalny: maksymalnie 5 twoich jednostek w jednej prowincji.');
  if (!canAfford(player, effectiveCost)) return fail(`Brakuje zasobów: ${formatCost(effectiveCost)}.`);
  pay(player, effectiveCost);
  const unit = createUnit(unitType, player.id, provinceId, state.gameTimeMs);
  state.units.push(unit);
  pushLog(state, `${player.nickname}: zrekrutowano ${unitDef.label} w ${province.name}.`);
  mutate(state);
  return ok(unit);
}

export function moveOrAttack(state, unitId, targetProvinceId, actorPlayerId = null) {
  migrateState(state);
  const player = getActionPlayer(state, actorPlayerId);
  const unit = state.units.find(u => u.id === unitId && u.hp > 0);
  const target = getProvince(state, targetProvinceId);
  if (!player) return fail('Nie kontrolujesz aktywnego państwa.');
  if (!unit || !target) return fail('Nie wybrano poprawnej jednostki lub celu.');
  if (unit.owner !== player.id) return fail('To nie jest twoja jednostka.');
  if (!isUnitReady(state, unit)) return fail(`Jednostka będzie gotowa za ${readyInSeconds(state, unit)} s.`);
  const origin = getProvince(state, unit.location);
  if (!origin.neighbors.includes(targetProvinceId)) return fail('Jednostka może poruszyć się tylko do sąsiedniej prowincji.');

  if (target.owner === unit.owner && enemyUnitsAt(state, targetProvinceId, unit.owner).length === 0) {
    if (ownUnitsAt(state, targetProvinceId, unit.owner).length >= 5) return fail('W tej prowincji jest już dużo twoich wojsk.');
    unit.location = targetProvinceId;
    unit.availableAt = state.gameTimeMs + effectiveUnitCooldown(player, unit.type);
    pushLog(state, `${UNIT_TYPES[unit.type].label} przeszła z ${origin.name} do ${target.name}.`);
    mutate(state);
    return ok();
  }

  const result = resolveCombat(state, unit, target);
  unit.availableAt = state.gameTimeMs + effectiveUnitCooldown(player, unit.type);
  mutate(state);
  return result;
}

function resolveCombat(state, attacker, target) {
  const attackerPlayer = getPlayer(state, attacker.owner);
  const targetOwnerBefore = target.owner;
  const defenderPlayer = getPlayer(state, targetOwnerBefore);
  const defenders = enemyUnitsAt(state, target.id, attacker.owner);
  const fortLevel = Math.max(0, target.buildings?.fort ?? 0);
  const unitDef = UNIT_TYPES[attacker.type];

  if (defenders.length === 0 && fortLevel === 0 && !target.capital) {
    const terrainLoss = TERRAIN_ORG_LOSS[target.terrain] ?? 3;
    attacker.hp = Math.max(24, attacker.hp - terrainLoss);
    attacker.xp += 0.35;
    target.owner = attacker.owner;
    target.devastation = Math.min(100, (target.devastation ?? 0) + terrainLoss);
    attacker.location = target.id;
    pushLog(state, `${attackerPlayer.nickname} zajmuje pustą prowincję ${target.name}.`);
    checkEliminations(state, targetOwnerBefore);
    return ok();
  }

  const roll = 0.92 + nextRandom(state) * 0.28;
  const doctrine = DOCTRINES[attackerPlayer?.doctrine] ?? DOCTRINES.balanced;
  const heavy = attacker.type === 'artillery' || attacker.type === 'tank';
  const botAttack = attackerPlayer?.type === 'bot' ? (attackerPlayer.aiModifiers?.botAttack ?? 1) : 1;
  const attackPower = unitDef.attack
    * (IDEOLOGIES[attackerPlayer?.ideology]?.attackMult ?? 1)
    * (doctrine.attackMult ?? 1)
    * (heavy ? (doctrine.heavyAttackMult ?? 1) : 1)
    * (TRAITS[attackerPlayer?.trait]?.attackMult ?? 1)
    * botAttack
    * (attacker.hp / 100)
    * roll
    + attacker.xp * 2;

  const garrison = defenders.length > 0
    ? defenders.reduce((sum, defender) => sum + UNIT_TYPES[defender.type].defense * (defender.hp / 100), 0)
    : target.capital
      ? 13
      : 5 + fortLevel * 3;
  const fortPower = fortDefenseBonus(target, attacker.type);
  const defenseMult = (IDEOLOGIES[defenderPlayer?.ideology]?.defenseMult ?? 1)
    * (DOCTRINES[defenderPlayer?.doctrine]?.defenseMult ?? 1)
    * (TRAITS[defenderPlayer?.trait]?.defenseMult ?? 1)
    * (target.capital ? (GOVERNMENTS[defenderPlayer?.government]?.capitalDefenseMult ?? 1) : 1);
  const defensePower = (garrison + TERRAIN_DEF[target.terrain] + fortPower) * defenseMult;

  if (attackPower >= defensePower) {
    const reduction = fortDamageReduction(target);
    const damage = Math.min(62, Math.round(defensePower * 0.34 * (1 - reduction)));
    attacker.hp = Math.max(22, attacker.hp - damage);
    attacker.xp += 1;
    for (const defender of defenders) defender.hp = 0;
    state.units = state.units.filter(u => u.hp > 0);
    target.owner = attacker.owner;
    target.devastation = Math.min(100, (target.devastation ?? 0) + Math.max(6, Math.round(damage * 0.3)));
    attacker.location = target.id;
    pushLog(state, `${attackerPlayer.nickname} zdobywa ${target.name} po ataku ${UNIT_TYPES[attacker.type].label}.`);
    checkEliminations(state, targetOwnerBefore);
    return ok();
  }

  const damage = Math.min(78, Math.round((defensePower - attackPower) * 0.48 + 14));
  attacker.hp -= damage;
  target.devastation = Math.min(100, (target.devastation ?? 0) + Math.max(3, Math.round(damage * 0.14)));
  if (attacker.hp <= 0) {
    state.units = state.units.filter(u => u.id !== attacker.id);
    pushLog(state, `${UNIT_TYPES[attacker.type].label} została rozbita pod ${target.name}.`);
  } else {
    pushLog(state, `Atak na ${target.name} odparty. ${UNIT_TYPES[attacker.type].label} traci ${damage} siły.`);
  }
  return ok();
}

function checkEliminations(state, possiblePlayerId) {
  const player = getPlayer(state, possiblePlayerId);
  if (!player || player.eliminated) return;
  const hasProvince = state.provinces.some(p => p.owner === possiblePlayerId);
  if (!hasProvince) {
    player.eliminated = true;
    state.units = state.units.filter(u => u.owner !== possiblePlayerId);
    pushLog(state, `${player.nickname} zostaje wyeliminowany.`);
  }
}

export function fillOpenSlotsWithBots(state) {
  migrateState(state);
  let changed = false;
  for (const player of state.players) {
    if (player.type === 'open') {
      player.type = 'bot';
      player.controller = null;
      player.nickname = player.name;
      player.aiModifiers = normalizeSetup(state.setup).botModifiers;
      changed = true;
    }
  }
  if (changed) {
    pushLog(state, 'Wolne państwa zostały przejęte przez boty.');
    mutate(state);
  }
  return ok(changed);
}

export function assignOpenFaction(state, userId, nickname) {
  migrateState(state);
  const existing = getControlledPlayer(state, userId);
  if (existing) return ok(existing);
  const slot = state.players.find(p => p.type === 'open');
  if (!slot) return fail('Brak wolnego miejsca. Możesz obserwować rozgrywkę.');
  slot.type = 'human';
  slot.controller = userId;
  slot.nickname = nickname || slot.name;
  pushLog(state, `${slot.nickname} dołącza do gry jako ${slot.name}.`);
  mutate(state);
  return ok(slot);
}

export function advanceRealtime(state, { now = Date.now(), includeBots = true } = {}) {
  migrateState(state);
  if (winner(state)) return ok({ changed: false });
  const rt = state.realtime;
  if (rt.paused) {
    rt.lastWallAt = now;
    return ok({ changed: false });
  }

  const elapsedWall = Math.max(0, Math.min(now - (rt.lastWallAt ?? now), REALTIME_DEFAULTS.maxCatchUpMs));
  rt.lastWallAt = now;
  state.gameTimeMs += elapsedWall;
  state.day = Math.max(1, Math.floor(state.gameTimeMs / (rt.dayMs ?? REALTIME_DEFAULTS.dayMs)) + 1);

  let changed = false;
  const timeChanged = elapsedWall > 0;
  let incomeTicks = 0;
  while (state.gameTimeMs - (rt.lastEconomyAt ?? 0) >= (rt.economyEveryMs ?? REALTIME_DEFAULTS.economyEveryMs) && incomeTicks < 6) {
    rt.lastEconomyAt = (rt.lastEconomyAt ?? 0) + (rt.economyEveryMs ?? REALTIME_DEFAULTS.economyEveryMs);
    grantIncomeToAll(state);
    incomeTicks += 1;
    changed = true;
  }
  if (incomeTicks > 0) pushLog(state, `Dzień ${state.day}: gospodarka wypłaciła zasoby wszystkim aktywnym państwom.`);

  if (includeBots && state.gameTimeMs - (rt.lastAiAt ?? 0) >= (rt.aiEveryMs ?? REALTIME_DEFAULTS.aiEveryMs)) {
    rt.lastAiAt = state.gameTimeMs;
    const botChanged = runBotsOnce(state);
    changed = changed || botChanged;
  }

  if (changed) mutate(state, { quiet: true });
  return ok({ changed, timeChanged });
}

function grantIncomeToAll(state) {
  for (const player of state.players) {
    if (player.eliminated || player.type === 'open') continue;
    const income = incomeForPlayer(state, player.id);
    for (const key of Object.keys(player.resources)) {
      player.resources[key] += Math.round(income[key] * 0.34);
    }
    for (const province of state.provinces.filter(p => p.owner === player.id && (p.devastation ?? 0) > 0)) {
      const repair = 1 + Math.min(3, province.buildings?.industry ?? 0);
      province.devastation = Math.max(0, Math.round((province.devastation ?? 0) - repair));
    }
  }
}

function runBotsOnce(state) {
  let changed = false;
  const bots = state.players.filter(p => p.type === 'bot' && !p.eliminated);
  if (!bots.length) return false;
  const maxBotsPerTick = Math.max(1, Math.ceil(bots.length / 2));
  const start = state.aiCursor ?? 0;
  for (let i = 0; i < maxBotsPerTick; i += 1) {
    const player = bots[(start + i) % bots.length];
    const result = runAiStep(state, player.id);
    changed = changed || result.ok;
  }
  state.aiCursor = (start + maxBotsPerTick) % bots.length;
  return changed;
}

export function runAiStep(state, playerId) {
  migrateState(state);
  const player = getPlayer(state, playerId);
  if (!player || player.type !== 'bot' || player.eliminated) return fail('Ten gracz nie jest botem.');

  let changed = false;
  const owned = state.provinces.filter(p => p.owner === player.id);
  if (!owned.length) return fail('Bot nie ma prowincji.');
  const ai = {
    botRecruitChance: 0.35,
    botBuildChance: 0.3,
    botMoveChance: 0.55,
    ...(player.aiModifiers ?? {})
  };

  if (nextRandom(state) < ai.botBuildChance) {
    const buildType = nextRandom(state) > 0.68 ? 'fort' : 'industry';
    const affordable = owned
      .filter(p => (p.buildings[buildType] ?? 0) < BUILDINGS[buildType].max && canAfford(player, buildingCostForPlayer(player, buildType)))
      .sort((a, b) => (a.buildings[buildType] ?? 0) - (b.buildings[buildType] ?? 0))[0];
    if (affordable) {
      buildBuilding(state, affordable.id, buildType, player.id);
      changed = true;
    }
  }

  const provinceForRecruitment = owned.find(p => ownUnitsAt(state, p.id, player.id).length < 2) ?? owned[0];
  if (provinceForRecruitment && nextRandom(state) < ai.botRecruitChance) {
    const roll = nextRandom(state);
    const unitChoice = canAfford(player, unitCostForPlayer(player, 'tank')) && roll > 0.8 ? 'tank' : canAfford(player, unitCostForPlayer(player, 'artillery')) && roll > 0.58 ? 'artillery' : 'infantry';
    if (canAfford(player, unitCostForPlayer(player, unitChoice))) {
      recruitUnit(state, provinceForRecruitment.id, unitChoice, player.id);
      changed = true;
    }
  }

  if (nextRandom(state) >= ai.botMoveChance) return changed ? ok() : fail('Bot czeka.');

  const readyUnits = state.units.filter(u => u.owner === player.id && isUnitReady(state, u));
  for (const unit of readyUnits.slice(0, 1)) {
    const province = getProvince(state, unit.location);
    const enemyNeighbor = province.neighbors
      .map(id => getProvince(state, id))
      .filter(p => p.owner !== player.id)
      .sort((a, b) => provinceDefenseStrength(state, a.id, player.id) - provinceDefenseStrength(state, b.id, player.id))[0];
    if (enemyNeighbor && provinceDefenseStrength(state, enemyNeighbor.id, player.id) < UNIT_TYPES[unit.type].attack * 1.12) {
      moveOrAttack(state, unit.id, enemyNeighbor.id, player.id);
      changed = true;
    } else {
      const frontier = province.neighbors
        .map(id => getProvince(state, id))
        .find(p => p.owner === player.id && p.neighbors.some(n => getProvince(state, n).owner !== player.id));
      if (frontier && nextRandom(state) > 0.6 && ownUnitsAt(state, frontier.id, player.id).length < 4) {
        moveOrAttack(state, unit.id, frontier.id, player.id);
        changed = true;
      }
    }
  }

  return changed ? ok() : fail('Bot nie wykonał akcji.');
}

export function runAiTurn(state) {
  const bot = state.players.find(p => p.type === 'bot' && !p.eliminated);
  if (!bot) return fail('Brak aktywnego bota.');
  return runAiStep(state, bot.id);
}

export function endTurn(state) {
  migrateState(state);
  pushLog(state, 'Ta wersja działa w czasie rzeczywistym — nie ma już ręcznych tur.');
  return ok();
}

export function winner(state) {
  migrateState(state);
  const activeOwners = new Set(state.provinces.map(p => p.owner));
  const active = state.players.filter(p => activeOwners.has(p.id) && !p.eliminated);
  return active.length === 1 ? active[0] : null;
}

export function isUsersTurn(state, userId) {
  return Boolean(getControlledPlayer(state, userId));
}

export function isHumanLocalTurn(state) {
  migrateState(state);
  return state.players.some(p => p.type === 'human' && !p.eliminated);
}

export function isUnitReady(state, unit) {
  migrateState(state);
  if (!unit) return false;
  normalizeUnitCooldown(state, unit);
  return (unit.availableAt ?? 0) <= state.gameTimeMs;
}

export function readyInSeconds(state, unit) {
  migrateState(state);
  if (!unit) return 0;
  normalizeUnitCooldown(state, unit);
  return Math.max(0, Math.ceil(((unit.availableAt ?? 0) - state.gameTimeMs) / 1000));
}

export function fortDefenseBonus(province, attackerType = 'infantry') {
  const level = Math.max(0, Math.min(BUILDINGS.fort.max, province?.buildings?.fort ?? 0));
  const base = BALANCE.fortDefenseByLevel[level] ?? 0;
  const pierce = attackerType === 'artillery' ? (BALANCE.artilleryFortPierceByLevel[level] ?? 0) : 0;
  return Math.max(0, base - pierce);
}

export function fortDamageReduction(province) {
  const level = Math.max(0, Math.min(BUILDINGS.fort.max, province?.buildings?.fort ?? 0));
  return BALANCE.fortDamageReductionByLevel[level] ?? 0;
}

export function provinceDefenseStrength(state, provinceId, attackerId = null) {
  migrateState(state);
  const province = getProvince(state, provinceId);
  if (!province) return 0;
  const owner = getPlayer(state, province.owner);
  const defenders = unitsAt(state, province.id).filter(u => !attackerId || u.owner !== attackerId);
  const fortLevel = province.buildings?.fort ?? 0;
  const garrison = defenders.length > 0
    ? defenders.reduce((sum, defender) => sum + UNIT_TYPES[defender.type].defense * (defender.hp / 100), 0)
    : province.capital
      ? 13
      : fortLevel > 0
        ? 5 + fortLevel * 3
        : 0;
  const terrain = defenders.length || fortLevel || province.capital ? (TERRAIN_DEF[province.terrain] ?? 0) : 0;
  const fortMult = fortLevel > 0
    ? (GOVERNMENTS[owner?.government]?.fortDefenseMult ?? 1) * (DOCTRINES[owner?.doctrine]?.fortDefenseMult ?? 1)
    : 1;
  const defenseMult = (IDEOLOGIES[owner?.ideology]?.defenseMult ?? 1)
    * (DOCTRINES[owner?.doctrine]?.defenseMult ?? 1)
    * (TRAITS[owner?.trait]?.defenseMult ?? 1)
    * (province.capital ? (GOVERNMENTS[owner?.government]?.capitalDefenseMult ?? 1) : 1);
  return Math.max(0, Math.round((garrison + terrain + fortDefenseBonus(province, 'infantry') * fortMult) * defenseMult));
}

export function provinceBattleStatus(state, provinceId, viewerId = null) {
  migrateState(state);
  const province = getProvince(state, provinceId);
  if (!province) return { label: '—', kind: 'unknown', strength: 0, units: 0, hp: 0 };
  const owner = getPlayer(state, province.owner);
  const allUnits = unitsAt(state, province.id);
  const fortLevel = province.buildings?.fort ?? 0;
  const strength = provinceDefenseStrength(state, provinceId, viewerId);
  const avgHp = allUnits.length
    ? Math.round(allUnits.reduce((sum, unit) => sum + unit.hp, 0) / allUnits.length)
    : province.capital || fortLevel > 0
      ? Math.max(35, 58 + fortLevel * 10 - Math.round(province.devastation ?? 0) * 0.35)
      : 0;
  let kind = 'free';
  let label = 'PUSTA';
  if (allUnits.length > 0) {
    kind = owner?.id === viewerId ? 'own-army' : 'defended';
    label = `${allUnits.length} ARMIA`;
  } else if (province.capital) {
    kind = 'capital';
    label = 'STOLICA';
  } else if (fortLevel > 0) {
    kind = 'fortified';
    label = `FORT ${fortLevel}`;
  }
  return {
    label,
    kind,
    strength,
    units: allUnits.length,
    hp: Math.max(0, Math.min(100, Math.round(avgHp))),
    devastation: Math.max(0, Math.min(100, Math.round(province.devastation ?? 0)))
  };
}

export function selectableTargets(state, unitId) {
  migrateState(state);
  const unit = state.units.find(u => u.id === unitId && u.hp > 0);
  if (!unit) return [];
  return getProvince(state, unit.location)?.neighbors ?? [];
}

export function pushLog(state, message) {
  state.log = [message, ...(state.log ?? [])].slice(0, 100);
}

export function mutate(state, { quiet = false } = {}) {
  state.version = (state.version ?? 0) + 1;
  state.updatedAt = new Date().toISOString();
  if (!quiet) state.lastActionAt = state.updatedAt;
}

function normalizeUnitCooldown(state, unit) {
  if (!unit) return;
  const gameTime = Number.isFinite(state.gameTimeMs) ? state.gameTimeMs : 0;
  if (!Number.isFinite(unit.availableAt)) {
    unit.availableAt = gameTime;
    return;
  }
  if (unit.availableAt > gameTime + BALANCE.maxUnitCooldownMs) {
    unit.availableAt = gameTime;
  }
  if (unit.availableAt < 0) unit.availableAt = 0;
}

function getActionPlayer(state, actorPlayerId) {
  if (actorPlayerId) return getPlayer(state, actorPlayerId);
  return currentPlayer(state);
}

function nextRandom(state) {
  let x = state.rng || 123456789;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  state.rng = x >>> 0;
  return (state.rng % 10000) / 10000;
}

function applyIncomeBonuses(player, income) {
  const out = { ...income };
  const parts = [
    IDEOLOGIES[player?.ideology],
    GOVERNMENTS[player?.government],
    TRAITS[player?.trait]
  ];
  for (const part of parts) {
    for (const [key, mult] of Object.entries(part?.incomeMult ?? {})) {
      out[key] = Math.round((out[key] ?? 0) * mult);
    }
  }
  return out;
}

function effectiveUnitCooldown(player, unitType) {
  const base = UNIT_TYPES[unitType]?.cooldownMs ?? 10000;
  const factor = (IDEOLOGIES[player?.ideology]?.cooldownMult ?? 1) * (DOCTRINES[player?.doctrine]?.cooldownMult ?? 1);
  return Math.round(base * factor);
}

function normalizeSetup(setup = {}) {
  const mapId = MAP_PRESETS[setup.mapId] ? setup.mapId : SETUP_DEFAULTS.mapId;
  const paceKey = SETUP_PRESETS.pace[setup.pace] ? setup.pace : SETUP_DEFAULTS.pace;
  const resourceKey = SETUP_PRESETS.startResources[setup.startResources] ? setup.startResources : SETUP_DEFAULTS.startResources;
  const difficultyKey = SETUP_PRESETS.difficulty[setup.difficulty] ? setup.difficulty : SETUP_DEFAULTS.difficulty;
  const pace = SETUP_PRESETS.pace[paceKey];
  const difficulty = SETUP_PRESETS.difficulty[difficultyKey];
  return {
    public: { mapId, pace: paceKey, startResources: resourceKey, difficulty: difficultyKey },
    humanResourceFactor: SETUP_PRESETS.startResources[resourceKey],
    botResourceFactor: SETUP_PRESETS.startResources[resourceKey] * difficulty.botResources,
    botModifiers: {
      botIncome: difficulty.botIncome,
      botAttack: difficulty.botAttack,
      botRecruitChance: difficulty.botRecruitChance,
      botBuildChance: difficulty.botBuildChance,
      botMoveChance: difficulty.botMoveChance
    },
    dayMs: pace.dayMs,
    economyEveryMs: pace.economyEveryMs,
    aiEveryMs: Math.max(2000, Math.round(pace.aiEveryMs * difficulty.aiEveryFactor))
  };
}

function scaledStartResources(factor = 1) {
  const base = { money: 620, manpower: 520, steel: 420, oil: 220 };
  return Object.fromEntries(Object.entries(base).map(([key, value]) => [key, Math.round(value * factor)]));
}

function scaleCost(cost, factor = 1) {
  const out = {};
  for (const [key, value] of Object.entries(cost ?? {})) out[key] = Math.max(0, Math.round(value * factor));
  return out;
}

function pickBotProfiles(count, blacklist = []) {
  const pool = BOT_COUNTRY_PRESETS.filter(item => !blacklist.includes(item.name));
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function normalizeCountryProfile(profile, fallback = DEFAULT_CUSTOM_COUNTRY, slotId = 'eagle') {
  const merged = { ...DEFAULT_CUSTOM_COUNTRY, ...fallback, ...(profile ?? {}) };
  const color = normalizeColor(merged.color, fallback.color || DEFAULT_CUSTOM_COUNTRY.color);
  const secondaryColor = normalizeColor(merged.secondaryColor, fallback.secondaryColor || DEFAULT_CUSTOM_COUNTRY.secondaryColor);
  const ideology = IDEOLOGIES[merged.ideology] ? merged.ideology : DEFAULT_CUSTOM_COUNTRY.ideology;
  const government = GOVERNMENTS[merged.government] ? merged.government : DEFAULT_CUSTOM_COUNTRY.government;
  const doctrine = DOCTRINES[merged.doctrine] ? merged.doctrine : DEFAULT_CUSTOM_COUNTRY.doctrine;
  const trait = TRAITS[merged.trait] ? merged.trait : DEFAULT_CUSTOM_COUNTRY.trait;
  return {
    slotId,
    name: String(merged.name || fallback.name || 'Nowe Państwo').slice(0, 32),
    color,
    secondaryColor,
    ideology,
    government,
    doctrine,
    trait,
    flagPattern: merged.flagPattern ?? merged.flag?.pattern ?? DEFAULT_CUSTOM_COUNTRY.flagPattern,
    emblem: merged.emblem ?? merged.flag?.emblem ?? DEFAULT_CUSTOM_COUNTRY.emblem,
    flag: normalizeFlag(merged.flag ?? merged, color, secondaryColor)
  };
}

function normalizeFlag(flagLike, color, secondaryColor) {
  const safePrimary = normalizeColor(color, DEFAULT_CUSTOM_COUNTRY.color);
  const safeSecondary = normalizeColor(secondaryColor, DEFAULT_CUSTOM_COUNTRY.secondaryColor);
  const pattern = ['horizontal', 'vertical', 'cross', 'diagonal'].includes(flagLike?.flagPattern || flagLike?.pattern)
    ? (flagLike.flagPattern || flagLike.pattern)
    : DEFAULT_CUSTOM_COUNTRY.flagPattern;
  const emblem = ['star', 'gear', 'sun', 'anchor', 'crown', 'hammer', 'eagle', 'none'].includes(flagLike?.emblem)
    ? flagLike.emblem
    : DEFAULT_CUSTOM_COUNTRY.emblem;
  return {
    pattern,
    emblem,
    primary: normalizeColor(flagLike?.primary || safePrimary, safePrimary),
    secondary: normalizeColor(flagLike?.secondary || safeSecondary, safeSecondary)
  };
}

function normalizeColor(value, fallback) {
  const text = String(value || '').trim();
  const safeFallback = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(String(fallback || '').trim())
    ? String(fallback).trim().toLowerCase()
    : '#6c7a9c';
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(text) ? text.toLowerCase() : safeFallback;
}

function safeText(value, maxLength = 40) {
  return String(value ?? '')
    .replace(/[\u0000-\u001f\u007f<>]/g, '')
    .trim()
    .slice(0, maxLength) || 'Państwo';
}

function clampNumber(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.max(min, Math.min(max, number));
}

function ok(data = null) { return { ok: true, data }; }
function fail(error) { return { ok: false, error }; }
