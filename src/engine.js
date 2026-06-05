export const FACTIONS = [
  { id: 'eagle', slotName: 'slot_1' },
  { id: 'union', slotName: 'slot_2' },
  { id: 'nomads', slotName: 'slot_3' },
  { id: 'crown', slotName: 'slot_4' }
];

export const DEFAULT_CUSTOM_COUNTRY = {
  name: 'Federacja Zenith',
  color: '#7b5cff',
  secondaryColor: '#f2b84b',
  ideology: 'industrialist',
  flagPattern: 'horizontal',
  emblem: 'star'
};

export const IDEOLOGIES = {
  industrialist: {
    label: 'Industrializm',
    short: 'IND',
    description: '+15% dochodu 💰 i ⚙️, -10% kosztu przemysłu.',
    incomeMult: { money: 1.15, steel: 1.15 },
    buildingDiscounts: { industry: 0.9 },
    unitDiscounts: {},
    attackMult: 1,
    defenseMult: 1,
    cooldownMult: 1
  },
  militarist: {
    label: 'Militaryzm',
    short: 'MIL',
    description: '+10% siły ataku, -10% cooldownu jednostek, -5% kosztów rekrutacji.',
    incomeMult: {},
    buildingDiscounts: {},
    unitDiscounts: { infantry: 0.95, artillery: 0.95, tank: 0.95 },
    attackMult: 1.1,
    defenseMult: 1,
    cooldownMult: 0.9
  },
  collectivist: {
    label: 'Kolektywizm',
    short: 'KOL',
    description: '+18% dochodu 👥, +6% obrony, -12% kosztu piechoty.',
    incomeMult: { manpower: 1.18 },
    buildingDiscounts: {},
    unitDiscounts: { infantry: 0.88 },
    attackMult: 1,
    defenseMult: 1.06,
    cooldownMult: 1
  },
  technocrat: {
    label: 'Technokracja',
    short: 'TECH',
    description: '+10% dochodu 🛢️, -12% kosztu artylerii i czołgów, -10% kosztu lotnisk.',
    incomeMult: { oil: 1.1 },
    buildingDiscounts: { airbase: 0.9 },
    unitDiscounts: { artillery: 0.88, tank: 0.88 },
    attackMult: 1,
    defenseMult: 1,
    cooldownMult: 1
  }
};

export const BOT_COUNTRY_PRESETS = [
  { name: 'Republika Bursztynu', color: '#c4525a', secondaryColor: '#f4d26a', ideology: 'industrialist', flagPattern: 'vertical', emblem: 'gear' },
  { name: 'Wolne Marchie Ardonii', color: '#4d89e8', secondaryColor: '#d7e6ff', ideology: 'technocrat', flagPattern: 'cross', emblem: 'star' },
  { name: 'Konfederacja Nivarii', color: '#4eaf73', secondaryColor: '#f1f7ef', ideology: 'collectivist', flagPattern: 'horizontal', emblem: 'sun' },
  { name: 'Królestwo Solwinu', color: '#d6a047', secondaryColor: '#5f2d16', ideology: 'militarist', flagPattern: 'diagonal', emblem: 'crown' },
  { name: 'Związek Trzech Portów', color: '#3ca6a6', secondaryColor: '#efffff', ideology: 'industrialist', flagPattern: 'horizontal', emblem: 'anchor' },
  { name: 'Dyrektoriat Valon', color: '#8d6cf7', secondaryColor: '#f7f0ff', ideology: 'technocrat', flagPattern: 'vertical', emblem: 'gear' },
  { name: 'Front Północnych Rubieży', color: '#688e45', secondaryColor: '#f6f0cb', ideology: 'collectivist', flagPattern: 'cross', emblem: 'star' },
  { name: 'Liga Szkarłatnych Mostów', color: '#b64662', secondaryColor: '#f7d6df', ideology: 'militarist', flagPattern: 'horizontal', emblem: 'sun' },
  { name: 'Księstwa Asterii', color: '#dd7f3e', secondaryColor: '#fff4e7', ideology: 'militarist', flagPattern: 'diagonal', emblem: 'crown' },
  { name: 'Komuna Rudnych Wzgórz', color: '#9d4edd', secondaryColor: '#f1defc', ideology: 'collectivist', flagPattern: 'vertical', emblem: 'hammer' },
  { name: 'Republika Morenii', color: '#3278b3', secondaryColor: '#f4f8fb', ideology: 'technocrat', flagPattern: 'horizontal', emblem: 'anchor' },
  { name: 'Stalowa Unia Karsji', color: '#7e8c99', secondaryColor: '#f4ca64', ideology: 'industrialist', flagPattern: 'cross', emblem: 'gear' }
];

export const UNIT_TYPES = {
  infantry: { label: 'Piechota', short: 'P', cost: { money: 90, manpower: 90, steel: 10, oil: 0 }, attack: 30, defense: 40, move: 1, cooldownMs: 9000 },
  artillery: { label: 'Artyleria', short: 'A', cost: { money: 130, manpower: 55, steel: 35, oil: 0 }, attack: 46, defense: 22, move: 1, cooldownMs: 12000 },
  tank: { label: 'Czołgi', short: 'C', cost: { money: 190, manpower: 45, steel: 65, oil: 45 }, attack: 68, defense: 52, move: 1, cooldownMs: 15000 }
};

export const BUILDINGS = {
  industry: { label: 'Przemysł', max: 4, cost: { money: 130, manpower: 15, steel: 80, oil: 0 }, description: '+ dochód i produkcja' },
  fort: { label: 'Forty', max: 3, cost: { money: 110, manpower: 35, steel: 75, oil: 0 }, description: '+ umiarkowana obrona, słabsza przeciw artylerii' },
  airbase: { label: 'Lotnisko', max: 2, cost: { money: 120, manpower: 20, steel: 50, oil: 25 }, description: 'rezerwa pod lotnictwo' }
};

export const BALANCE = {
  maxUnitCooldownMs: 30000,
  fortDefenseByLevel: [0, 7, 12, 16],
  fortDamageReductionByLevel: [0, 0.05, 0.08, 0.10],
  artilleryFortPierceByLevel: [0, 4, 7, 10]
};

export const REALTIME_DEFAULTS = {
  dayMs: 30000,
  economyEveryMs: 12000,
  aiEveryMs: 3500,
  maxCatchUpMs: 45000
};

export const SETUP_DEFAULTS = {
  pace: 'normal',
  difficulty: 'normal',
  startResources: 'normal',
  economyEveryMs: REALTIME_DEFAULTS.economyEveryMs,
  aiEveryMs: REALTIME_DEFAULTS.aiEveryMs,
  dayMs: REALTIME_DEFAULTS.dayMs
};

const SETUP_PRESETS = {
  pace: {
    slow: { economyEveryMs: 18000, aiEveryMs: 5200, dayMs: 42000 },
    normal: { economyEveryMs: 12000, aiEveryMs: 3500, dayMs: 30000 },
    fast: { economyEveryMs: 8000, aiEveryMs: 2400, dayMs: 22000 }
  },
  startResources: {
    low: 0.72,
    normal: 1,
    high: 1.45
  },
  difficulty: {
    easy: { botResources: 0.78, botIncome: 0.86, botAttack: 0.92, aiEveryFactor: 1.25 },
    normal: { botResources: 1, botIncome: 1, botAttack: 1, aiEveryFactor: 1 },
    hard: { botResources: 1.25, botIncome: 1.15, botAttack: 1.08, aiEveryFactor: 0.82 }
  }
};

const TERRAIN_DEF = { plains: 0, forest: 8, hills: 14, city: 18, marsh: 10 };
const TERRAIN_ORG_LOSS = { plains: 3, forest: 5, hills: 6, city: 7, marsh: 8 };

const NAMES = [
  'Arden', 'Ravel', 'Korn', 'Srebrny Bród', 'Falk', 'Nowy Port', 'Wysoka Latarnia', 'Rivermark',
  'Dolina Solna', 'Ester', 'Wolnigrad', 'Bursztyn', 'Księżycowe Pola', 'Żelazny Trakt', 'Mokradła Elsen', 'Brzeg Wschodni',
  'Kaldera', 'Mosty', 'Dębina', 'Rudnica', 'Stare Opactwo', 'Srebrna', 'Północny Przesmyk', 'Zielona Marchia',
  'Górny Step', 'Orch', 'Pustkowie', 'Bielica', 'Suchy Las', 'Równia Koronna', 'Czarne Kopce', 'Złoty Jar',
  'Królewiec', 'Południca', 'Kamienny Brzeg', 'Wyżyna Sarn', 'Kopalnie Vald', 'Delta Miru', 'Port Słony', 'Ostatnia Straż',
  'Czerwona Przełęcz', 'Niziny Toru', 'Wrzosowisko', 'Głębokie Jezioro', 'Lazurowy Brzeg', 'Trzy Wieże', 'Zamek Południa', 'Ogród Korony'
];

const TERRAINS = ['plains', 'forest', 'hills', 'city', 'marsh'];
const TERRAIN_LABELS = { plains: 'równiny', forest: 'las', hills: 'wzgórza', city: 'miasto', marsh: 'bagna' };

export function terrainLabel(terrain) {
  return TERRAIN_LABELS[terrain] ?? terrain;
}

export function createInitialState({ humanName = 'Gracz', mode = 'local', userId = null, customCountry = null, setup = {} } = {}) {
  const gameSetup = normalizeSetup(setup);
  const provinces = createMap();
  const wallNow = Date.now();
  const gameNow = 0;
  const hostCountry = normalizeCountryProfile(customCountry, BOT_COUNTRY_PRESETS[0], 'eagle');
  const botProfiles = pickBotProfiles(3, [hostCountry.name]);

  const players = FACTIONS.map((slot, index) => {
    const country = index === 0 ? hostCountry : normalizeCountryProfile(botProfiles[index - 1], BOT_COUNTRY_PRESETS[index - 1], slot.id);
    return {
      id: slot.id,
      name: country.name,
      color: country.color,
      secondaryColor: country.secondaryColor,
      ideology: country.ideology,
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
  const capitals = { eagle: 'p0', union: 'p4', nomads: 'p15', crown: 'p19' };
  for (const faction of FACTIONS) {
    units.push(createUnit('infantry', faction.id, capitals[faction.id], gameNow));
    units.push(createUnit(faction.id === 'crown' ? 'artillery' : 'infantry', faction.id, capitals[faction.id], gameNow));
  }

  return {
    schema: 4,
    mode,
    version: 0,
    rng: 174921,
    day: 1,
    gameTimeMs: 0,
    hostUserId: mode === 'multiplayer' ? userId : null,
    setup: gameSetup.public,
    realtime: {
      paused: false,
      lastWallAt: wallNow,
      lastEconomyAt: 0,
      lastAiAt: 0,
      dayMs: gameSetup.dayMs,
      economyEveryMs: gameSetup.economyEveryMs,
      aiEveryMs: gameSetup.aiEveryMs
    },
    mapMeta: { width: 1180, height: 760, rows: 6, cols: 8 },
    provinces,
    units,
    players,
    selectedProvinceId: null,
    selectedUnitId: null,
    log: ['Rozpoczęto kampanię real-time. Rozbuduj przemysł, zbierz armię i przejmij stolice przeciwników.']
  };
}

function createMap() {
  const provinces = [];
  const rows = 6;
  const cols = 8;
  const width = 1180;
  const height = 760;

  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const id = `p${r * cols + c}`;
      const owner = r < 3 ? (c < 4 ? 'eagle' : 'union') : (c < 4 ? 'nomads' : 'crown');
      const terrain = TERRAINS[(r * 7 + c * 3 + (r === 2 || r === 3 ? 1 : 0)) % TERRAINS.length];
      const capital = (id === 'p0' || id === 'p7' || id === 'p40' || id === 'p47');

      provinces.push({
        id,
        name: NAMES[r * cols + c] ?? `Prowincja ${r + 1}-${c + 1}`,
        row: r,
        col: c,
        x: 78 + c * 138 + (r % 2) * 54,
        y: 76 + r * 108,
        owner,
        terrain,
        capital,
        resources: provinceResources(terrain, capital),
        buildings: {
          industry: capital ? 2 : terrain === 'city' ? 1 : 0,
          fort: capital ? 1 : 0,
          airbase: 0
        }
      });
    }
  }

  // Kilka strategicznych regionów neutralizuje czysty podział na ćwiartki:
  // mapa dalej jest prosta, ale fronty są bardziej poszarpane i ciekawsze.
  const overrides = {
    p12: 'eagle', p19: 'union', p20: 'nomads', p27: 'crown',
    p28: 'crown', p35: 'nomads'
  };
  for (const [provinceId, owner] of Object.entries(overrides)) {
    const province = provinces.find(p => p.id === provinceId);
    if (province) province.owner = owner;
  }

  for (const province of provinces) {
    province.neighbors = findNeighbors(province, provinces).map(p => p.id);
  }
  return provinces;
}

function provinceResources(terrain, capital) {
  const base = { money: 22, manpower: 18, steel: 8, oil: 4 };
  if (capital) return { money: 55, manpower: 40, steel: 24, oil: 10 };
  if (terrain === 'city') return { money: 42, manpower: 30, steel: 16, oil: 6 };
  if (terrain === 'hills') return { money: 20, manpower: 13, steel: 25, oil: 5 };
  if (terrain === 'forest') return { money: 18, manpower: 24, steel: 10, oil: 4 };
  if (terrain === 'marsh') return { money: 14, manpower: 12, steel: 8, oil: 18 };
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
  state.schema = 4;
  state.day = state.day ?? state.turn ?? 1;
  state.gameTimeMs = state.gameTimeMs ?? Math.max(0, ((state.turn ?? 1) - 1) * REALTIME_DEFAULTS.dayMs);
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
  state.mapMeta = {
    width: 1180,
    height: 760,
    rows: 6,
    cols: 8,
    ...(state.mapMeta ?? {})
  };
  if (Array.isArray(state.provinces)) {
    for (const province of state.provinces) {
      province.devastation = clampNumber(province.devastation ?? 0, 0, 100);
      province.buildings = { industry: 0, fort: 0, airbase: 0, ...(province.buildings ?? {}) };
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
    player.color = player.color || '#6c7a9c';
    player.secondaryColor = player.secondaryColor || '#e8edf8';
    player.ideology = IDEOLOGIES[player.ideology] ? player.ideology : DEFAULT_CUSTOM_COUNTRY.ideology;
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
  if (Number.isInteger(state.currentPlayerIndex) && state.players[state.currentPlayerIndex]) return state.players[state.currentPlayerIndex];
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
  return Object.entries(cost).every(([key, value]) => (player.resources[key] ?? 0) >= value);
}

function pay(player, cost) {
  for (const [key, value] of Object.entries(cost)) player.resources[key] -= value;
}

export function formatCost(cost) {
  return Object.entries(cost)
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
  const economyFactor = Math.max(0.45, 1 - devastation / 140);
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
  const ideology = ideologyOf(player);
  const factor = ideology.unitDiscounts[unitType] ?? 1;
  return scaleCost(def.cost, factor);
}

export function buildingCostForPlayer(player, buildingType) {
  const def = BUILDINGS[buildingType];
  if (!def) return null;
  const ideology = ideologyOf(player);
  const factor = ideology.buildingDiscounts[buildingType] ?? 1;
  return scaleCost(def.cost, factor);
}

export function ideologySummary(player) {
  const ideology = ideologyOf(player);
  return `${ideology.label}: ${ideology.description}`;
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
  const cost = {
    money: Math.max(25, Math.round(damage * 1.4)),
    manpower: Math.max(6, Math.round(damage * 0.35)),
    steel: Math.max(10, Math.round(damage * 0.75)),
    oil: 0
  };
  if (!canAfford(player, cost)) return fail(`Brakuje zasobów na naprawy: ${formatCost(cost)}.`);
  pay(player, cost);
  province.devastation = Math.max(0, damage - 35);
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
    unit.location = targetProvinceId;
    unit.availableAt = state.gameTimeMs + effectiveUnitCooldown(player, unit.type);
    unit.acted = false;
    pushLog(state, `${UNIT_TYPES[unit.type].label} przeszła z ${origin.name} do ${target.name}.`);
    mutate(state);
    return ok();
  }

  const result = resolveCombat(state, unit, target);
  unit.availableAt = state.gameTimeMs + effectiveUnitCooldown(player, unit.type);
  unit.acted = false;
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

  // Poprawka: pusta, nieufortyfikowana prowincja nie może zachowywać się jak
  // niewidzialna armia. Wystarczy wejść jednostką i zapłacić małą stratę
  // organizacyjną zależną od terenu.
  if (defenders.length === 0 && fortLevel === 0 && !target.capital) {
    const terrainLoss = TERRAIN_ORG_LOSS[target.terrain] ?? 4;
    attacker.hp = Math.max(20, attacker.hp - terrainLoss);
    attacker.xp += 0.4;
    target.owner = attacker.owner;
    target.devastation = Math.min(100, (target.devastation ?? 0) + terrainLoss);
    attacker.location = target.id;
    pushLog(state, `${attackerPlayer.nickname} zajmuje pustą prowincję ${target.name}.`);
    checkEliminations(state, targetOwnerBefore);
    return ok();
  }

  const roll = 0.82 + nextRandom(state) * 0.38;
  const botAttack = attackerPlayer?.type === 'bot' ? (attackerPlayer.aiModifiers?.botAttack ?? 1) : 1;
  const attackPower = unitDef.attack * ideologyOf(attackerPlayer).attackMult * botAttack * (attacker.hp / 100) * roll + attacker.xp * 2;
  const garrison = defenders.length > 0
    ? defenders.reduce((sum, defender) => sum + UNIT_TYPES[defender.type].defense * (defender.hp / 100), 0)
    : target.capital
      ? 18
      : 8 + fortLevel * 4;
  const fortPower = fortDefenseBonus(target, attacker.type);
  const defensePower = (garrison + TERRAIN_DEF[target.terrain] + fortPower) * ideologyOf(defenderPlayer).defenseMult;

  if (attackPower >= defensePower) {
    const reduction = fortDamageReduction(target);
    const damage = Math.min(75, Math.round(defensePower * 0.42 * (1 - reduction)));
    attacker.hp = Math.max(18, attacker.hp - damage);
    attacker.xp += 1;
    for (const defender of defenders) defender.hp = 0;
    state.units = state.units.filter(u => u.hp > 0);
    target.owner = attacker.owner;
    target.devastation = Math.min(100, (target.devastation ?? 0) + Math.max(8, Math.round(damage * 0.35)));
    attacker.location = target.id;
    pushLog(state, `${attackerPlayer.nickname} zdobywa ${target.name} po ataku ${UNIT_TYPES[attacker.type].label}.`);
    checkEliminations(state, targetOwnerBefore);
    return ok();
  }

  const damage = Math.min(90, Math.round((defensePower - attackPower) * 0.65 + 20));
  attacker.hp -= damage;
  if (attacker.hp <= 0) {
    state.units = state.units.filter(u => u.id !== attacker.id);
    pushLog(state, `${UNIT_TYPES[attacker.type].label} została rozbita pod ${target.name}.`);
  } else {
    pushLog(state, `Atak na ${target.name} odparty. ${UNIT_TYPES[attacker.type].label} traci ${damage} siły.`);
  }
  target.devastation = Math.min(100, (target.devastation ?? 0) + Math.max(4, Math.round(damage * 0.18)));
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

  let changed = elapsedWall > 0;
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
  return ok({ changed });
}

function grantIncomeToAll(state) {
  for (const player of state.players) {
    if (player.eliminated || player.type === 'open') continue;
    const income = incomeForPlayer(state, player.id);
    for (const key of Object.keys(player.resources)) {
      player.resources[key] += Math.round(income[key] * 0.28);
    }
    for (const province of state.provinces.filter(p => p.owner === player.id && (p.devastation ?? 0) > 0)) {
      const repair = 1 + Math.min(3, province.buildings?.industry ?? 0);
      province.devastation = Math.max(0, Math.round((province.devastation ?? 0) - repair));
    }
  }
}

function runBotsOnce(state) {
  let changed = false;
  for (const player of state.players.filter(p => p.type === 'bot' && !p.eliminated)) {
    const result = runAiStep(state, player.id);
    changed = changed || result.ok;
  }
  return changed;
}

export function runAiStep(state, playerId) {
  migrateState(state);
  const player = getPlayer(state, playerId);
  if (!player || player.type !== 'bot' || player.eliminated) return fail('Ten gracz nie jest botem.');

  let changed = false;
  const owned = state.provinces.filter(p => p.owner === player.id);
  if (!owned.length) return fail('Bot nie ma prowincji.');

  if (nextRandom(state) > 0.55) {
    const affordableIndustry = owned
      .filter(p => (p.buildings.industry ?? 0) < BUILDINGS.industry.max && canAfford(player, buildingCostForPlayer(player, 'industry')))
      .sort((a, b) => (a.buildings.industry ?? 0) - (b.buildings.industry ?? 0))[0];
    if (affordableIndustry) {
      buildBuilding(state, affordableIndustry.id, 'industry', player.id);
      changed = true;
    }
  }

  const provinceForRecruitment = owned.find(p => ownUnitsAt(state, p.id, player.id).length < 3) ?? owned[0];
  if (provinceForRecruitment && nextRandom(state) > 0.35) {
    const unitChoice = canAfford(player, unitCostForPlayer(player, 'tank')) && nextRandom(state) > 0.55 ? 'tank' : 'infantry';
    if (canAfford(player, unitCostForPlayer(player, unitChoice))) {
      recruitUnit(state, provinceForRecruitment.id, unitChoice, player.id);
      changed = true;
    }
  }

  const readyUnits = state.units.filter(u => u.owner === player.id && isUnitReady(state, u));
  for (const unit of readyUnits.slice(0, 2)) {
    const province = getProvince(state, unit.location);
    const enemyNeighbor = province.neighbors
      .map(id => getProvince(state, id))
      .filter(p => p.owner !== player.id)
      .sort((a, b) => defenseEstimate(state, a, player.id) - defenseEstimate(state, b, player.id))[0];
    if (enemyNeighbor) {
      moveOrAttack(state, unit.id, enemyNeighbor.id, player.id);
      changed = true;
    } else {
      const frontier = province.neighbors
        .map(id => getProvince(state, id))
        .find(p => p.neighbors.some(n => getProvince(state, n).owner !== player.id));
      if (frontier && nextRandom(state) > 0.55) {
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

function defenseEstimate(state, province, attackerId) {
  return TERRAIN_DEF[province.terrain] + fortDefenseBonus(province, 'infantry') + enemyUnitsAt(state, province.id, attackerId).length * 35;
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

export function provinceDefenseStrength(state, provinceId, attackerId = null) {
  migrateState(state);
  const province = getProvince(state, provinceId);
  if (!province) return 0;
  const owner = getPlayer(state, province.owner);
  const defenders = unitsAt(state, province.id).filter(u => !attackerId || u.owner !== attackerId);
  const fortLevel = Math.max(0, province.buildings?.fort ?? 0);
  const garrison = defenders.length > 0
    ? defenders.reduce((sum, defender) => sum + UNIT_TYPES[defender.type].defense * (defender.hp / 100), 0)
    : province.capital
      ? 18
      : fortLevel > 0
        ? 8 + fortLevel * 4
        : 0;
  const baseTerrain = defenders.length || fortLevel || province.capital ? (TERRAIN_DEF[province.terrain] ?? 0) : 0;
  return Math.max(0, Math.round((garrison + baseTerrain + fortDefenseBonus(province, 'infantry')) * ideologyOf(owner).defenseMult));
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
      ? Math.max(35, 55 + fortLevel * 10 - Math.round(province.devastation ?? 0) * 0.4)
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

function ideologyOf(player) {
  if (!player) return IDEOLOGIES[DEFAULT_CUSTOM_COUNTRY.ideology];
  return IDEOLOGIES[player.ideology] ?? IDEOLOGIES[DEFAULT_CUSTOM_COUNTRY.ideology];
}

function applyIncomeBonuses(player, income) {
  const ideology = ideologyOf(player);
  const out = { ...income };
  for (const [key, mult] of Object.entries(ideology.incomeMult ?? {})) {
    out[key] = Math.round((out[key] ?? 0) * mult);
  }
  return out;
}

function effectiveUnitCooldown(player, unitType) {
  const ideology = ideologyOf(player);
  const base = UNIT_TYPES[unitType]?.cooldownMs ?? 10000;
  return Math.round(base * (ideology.cooldownMult ?? 1));
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
  const merged = {
    ...DEFAULT_CUSTOM_COUNTRY,
    ...fallback,
    ...(profile ?? {})
  };
  const color = normalizeColor(merged.color, fallback.color || DEFAULT_CUSTOM_COUNTRY.color);
  const secondaryColor = normalizeColor(merged.secondaryColor, fallback.secondaryColor || DEFAULT_CUSTOM_COUNTRY.secondaryColor);
  const ideology = IDEOLOGIES[merged.ideology] ? merged.ideology : DEFAULT_CUSTOM_COUNTRY.ideology;
  return {
    slotId,
    name: String(merged.name || fallback.name || 'Nowe Państwo').slice(0, 32),
    color,
    secondaryColor,
    ideology,
    flag: normalizeFlag(merged.flag ?? merged, color, secondaryColor)
  };
}

function normalizeFlag(flagLike, color, secondaryColor) {
  const pattern = ['horizontal', 'vertical', 'cross', 'diagonal'].includes(flagLike?.flagPattern || flagLike?.pattern)
    ? (flagLike.flagPattern || flagLike.pattern)
    : DEFAULT_CUSTOM_COUNTRY.flagPattern;
  const emblem = ['star', 'gear', 'sun', 'anchor', 'crown', 'hammer', 'eagle', 'none'].includes(flagLike?.emblem)
    ? flagLike.emblem
    : DEFAULT_CUSTOM_COUNTRY.emblem;
  return {
    pattern,
    emblem,
    primary: normalizeColor(flagLike?.primary || color, color),
    secondary: normalizeColor(flagLike?.secondary || secondaryColor, secondaryColor)
  };
}

function normalizeColor(value, fallback) {
  const text = String(value || '').trim();
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(text) ? text : fallback;
}

function normalizeSetup(setup = {}) {
  const paceKey = SETUP_PRESETS.pace[setup.pace] ? setup.pace : SETUP_DEFAULTS.pace;
  const resourceKey = SETUP_PRESETS.startResources[setup.startResources] ? setup.startResources : SETUP_DEFAULTS.startResources;
  const difficultyKey = SETUP_PRESETS.difficulty[setup.difficulty] ? setup.difficulty : SETUP_DEFAULTS.difficulty;
  const pace = SETUP_PRESETS.pace[paceKey];
  const difficulty = SETUP_PRESETS.difficulty[difficultyKey];
  return {
    public: {
      pace: paceKey,
      startResources: resourceKey,
      difficulty: difficultyKey
    },
    humanResourceFactor: SETUP_PRESETS.startResources[resourceKey],
    botResourceFactor: SETUP_PRESETS.startResources[resourceKey] * difficulty.botResources,
    botModifiers: {
      botIncome: difficulty.botIncome,
      botAttack: difficulty.botAttack
    },
    dayMs: pace.dayMs,
    economyEveryMs: pace.economyEveryMs,
    aiEveryMs: Math.max(1500, Math.round(pace.aiEveryMs * difficulty.aiEveryFactor))
  };
}

function scaledStartResources(factor = 1) {
  const base = { money: 360, manpower: 330, steel: 230, oil: 130 };
  return Object.fromEntries(Object.entries(base).map(([key, value]) => [key, Math.round(value * factor)]));
}

function clampNumber(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.max(min, Math.min(max, number));
}

function ok(data = null) { return { ok: true, data }; }
function fail(error) { return { ok: false, error }; }
