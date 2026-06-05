export const FACTIONS = [
  { id: 'eagle', name: 'Orły Północy', color: '#c4525a' },
  { id: 'union', name: 'Liga Rzeczna', color: '#4d89e8' },
  { id: 'nomads', name: 'Stepowe Chanaty', color: '#5fbe7d' },
  { id: 'crown', name: 'Korona Południa', color: '#d6a047' }
];

export const UNIT_TYPES = {
  infantry: { label: 'Piechota', short: 'P', cost: { money: 90, manpower: 90, steel: 10, oil: 0 }, attack: 30, defense: 40, move: 1, cooldownMs: 9000 },
  artillery: { label: 'Artyleria', short: 'A', cost: { money: 130, manpower: 55, steel: 35, oil: 0 }, attack: 46, defense: 22, move: 1, cooldownMs: 12000 },
  tank: { label: 'Czołgi', short: 'C', cost: { money: 190, manpower: 45, steel: 65, oil: 45 }, attack: 68, defense: 52, move: 1, cooldownMs: 15000 }
};

export const BUILDINGS = {
  industry: { label: 'Przemysł', max: 4, cost: { money: 130, manpower: 15, steel: 80, oil: 0 }, description: '+ dochód i produkcja' },
  fort: { label: 'Forty', max: 3, cost: { money: 90, manpower: 30, steel: 60, oil: 0 }, description: '+ obrona prowincji' },
  airbase: { label: 'Lotnisko', max: 2, cost: { money: 120, manpower: 20, steel: 50, oil: 25 }, description: 'rezerwa pod lotnictwo' }
};

export const REALTIME_DEFAULTS = {
  dayMs: 30000,
  economyEveryMs: 12000,
  aiEveryMs: 3500,
  maxCatchUpMs: 45000
};

const NAMES = [
  'Arden', 'Ravel', 'Korn', 'Wysoki Bród', 'Falk',
  'Dolina Solna', 'Ester', 'Nowy Port', 'Wolnigrad', 'Bursztyn',
  'Kaldera', 'Mosty', 'Dębina', 'Rudnica', 'Srebrna',
  'Górny Step', 'Orch', 'Pustkowie', 'Królewiec', 'Południca'
];

const TERRAINS = ['plains', 'forest', 'hills', 'city', 'marsh'];
const TERRAIN_LABELS = { plains: 'równiny', forest: 'las', hills: 'wzgórza', city: 'miasto', marsh: 'bagna' };
const TERRAIN_DEF = { plains: 0, forest: 8, hills: 14, city: 18, marsh: 10 };

export function terrainLabel(terrain) {
  return TERRAIN_LABELS[terrain] ?? terrain;
}

export function createInitialState({ humanName = 'Gracz', mode = 'local', userId = null } = {}) {
  const provinces = createMap();
  const now = Date.now();
  const players = FACTIONS.map((faction, index) => ({
    ...faction,
    type: index === 0 ? 'human' : 'bot',
    controller: index === 0 ? userId : null,
    nickname: index === 0 ? humanName : faction.name,
    resources: { money: 360, manpower: 330, steel: 230, oil: 130 },
    eliminated: false
  }));

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
    units.push(createUnit('infantry', faction.id, capitals[faction.id], now));
    units.push(createUnit(faction.id === 'crown' ? 'artillery' : 'infantry', faction.id, capitals[faction.id], now));
  }

  const state = {
    schema: 2,
    mode,
    version: 0,
    rng: 174921,
    day: 1,
    gameTimeMs: 0,
    hostUserId: mode === 'multiplayer' ? userId : null,
    realtime: {
      paused: false,
      lastWallAt: now,
      lastEconomyAt: 0,
      lastAiAt: 0,
      dayMs: REALTIME_DEFAULTS.dayMs,
      economyEveryMs: REALTIME_DEFAULTS.economyEveryMs,
      aiEveryMs: REALTIME_DEFAULTS.aiEveryMs
    },
    provinces,
    units,
    players,
    selectedProvinceId: null,
    selectedUnitId: null,
    log: ['Rozpoczęto kampanię real-time. Rozbuduj przemysł, zbierz armię i przejmij stolice przeciwników.']
  };
  return state;
}

function createMap() {
  const provinces = [];
  const rows = 4;
  const cols = 5;
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const id = `p${r * cols + c}`;
      const owner = r < 2 ? (c < 3 ? 'eagle' : 'union') : (c < 2 ? 'nomads' : 'crown');
      const terrain = TERRAINS[(r * 7 + c * 3) % TERRAINS.length];
      const capital = (id === 'p0' || id === 'p4' || id === 'p15' || id === 'p19');
      provinces.push({
        id,
        name: NAMES[r * cols + c],
        row: r,
        col: c,
        x: 118 + c * 175 + (r % 2) * 84,
        y: 100 + r * 132,
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
  state.schema = 2;
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
  }
  if (!Array.isArray(state.units)) state.units = [];
  for (const unit of state.units) {
    unit.availableAt = unit.availableAt ?? state.gameTimeMs;
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
  return {
    money: province.resources.money + industry * 18 + (province.capital ? 18 : 0),
    manpower: province.resources.manpower + industry * 4,
    steel: province.resources.steel + industry * 10,
    oil: province.resources.oil + (province.buildings.airbase ?? 0) * 2
  };
}

export function incomeForPlayer(state, playerId) {
  const total = { money: 0, manpower: 0, steel: 0, oil: 0 };
  for (const province of state.provinces.filter(p => p.owner === playerId)) {
    const income = provinceIncome(province);
    for (const key of Object.keys(total)) total[key] += income[key];
  }
  return total;
}

export function buildBuilding(state, provinceId, buildingType, actorPlayerId = null) {
  migrateState(state);
  const player = getActionPlayer(state, actorPlayerId);
  const province = getProvince(state, provinceId);
  const building = BUILDINGS[buildingType];
  if (!player) return fail('Nie kontrolujesz aktywnego państwa.');
  if (!province || !building) return fail('Nieznana budowa.');
  if (province.owner !== player.id) return fail('Możesz budować tylko we własnej prowincji.');
  const level = province.buildings[buildingType] ?? 0;
  if (level >= building.max) return fail(`${building.label} osiągnęło maksymalny poziom.`);
  if (!canAfford(player, building.cost)) return fail(`Brakuje zasobów: ${formatCost(building.cost)}.`);
  pay(player, building.cost);
  province.buildings[buildingType] = level + 1;
  pushLog(state, `${player.nickname}: rozbudowano ${building.label} w ${province.name} do poziomu ${level + 1}.`);
  mutate(state);
  return ok();
}

export function recruitUnit(state, provinceId, unitType, actorPlayerId = null) {
  migrateState(state);
  const player = getActionPlayer(state, actorPlayerId);
  const province = getProvince(state, provinceId);
  const unitDef = UNIT_TYPES[unitType];
  if (!player) return fail('Nie kontrolujesz aktywnego państwa.');
  if (!province || !unitDef) return fail('Nieznana rekrutacja.');
  if (province.owner !== player.id) return fail('Rekrutacja jest możliwa tylko we własnej prowincji.');
  if (!canAfford(player, unitDef.cost)) return fail(`Brakuje zasobów: ${formatCost(unitDef.cost)}.`);
  pay(player, unitDef.cost);
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
    unit.availableAt = state.gameTimeMs + (UNIT_TYPES[unit.type].cooldownMs ?? 10000);
    unit.acted = false;
    pushLog(state, `${UNIT_TYPES[unit.type].label} przeszła z ${origin.name} do ${target.name}.`);
    mutate(state);
    return ok();
  }

  const result = resolveCombat(state, unit, target);
  unit.availableAt = state.gameTimeMs + (UNIT_TYPES[unit.type].cooldownMs ?? 10000);
  unit.acted = false;
  mutate(state);
  return result;
}

function resolveCombat(state, attacker, target) {
  const attackerPlayer = getPlayer(state, attacker.owner);
  const targetOwnerBefore = target.owner;
  const defenders = enemyUnitsAt(state, target.id, attacker.owner);
  const unitDef = UNIT_TYPES[attacker.type];
  const roll = 0.82 + nextRandom(state) * 0.38;
  const attackPower = unitDef.attack * (attacker.hp / 100) * roll + attacker.xp * 2;
  const garrison = defenders.length > 0
    ? defenders.reduce((sum, defender) => sum + UNIT_TYPES[defender.type].defense * (defender.hp / 100), 0)
    : 24;
  const defensePower = garrison + TERRAIN_DEF[target.terrain] + (target.buildings.fort ?? 0) * 22;

  if (attackPower >= defensePower) {
    const damage = Math.min(75, Math.round(defensePower * 0.42));
    attacker.hp = Math.max(18, attacker.hp - damage);
    attacker.xp += 1;
    for (const defender of defenders) defender.hp = 0;
    state.units = state.units.filter(u => u.hp > 0);
    target.owner = attacker.owner;
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
      .filter(p => (p.buildings.industry ?? 0) < BUILDINGS.industry.max && canAfford(player, BUILDINGS.industry.cost))
      .sort((a, b) => (a.buildings.industry ?? 0) - (b.buildings.industry ?? 0))[0];
    if (affordableIndustry) {
      buildBuilding(state, affordableIndustry.id, 'industry', player.id);
      changed = true;
    }
  }

  const provinceForRecruitment = owned.find(p => ownUnitsAt(state, p.id, player.id).length < 3) ?? owned[0];
  if (provinceForRecruitment && nextRandom(state) > 0.35) {
    const unitChoice = canAfford(player, UNIT_TYPES.tank.cost) && nextRandom(state) > 0.55 ? 'tank' : 'infantry';
    if (canAfford(player, UNIT_TYPES[unitChoice].cost)) {
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
  return TERRAIN_DEF[province.terrain] + (province.buildings.fort ?? 0) * 22 + enemyUnitsAt(state, province.id, attackerId).length * 35;
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
  return (unit?.availableAt ?? 0) <= state.gameTimeMs;
}

export function readyInSeconds(state, unit) {
  migrateState(state);
  return Math.max(0, Math.ceil(((unit?.availableAt ?? 0) - state.gameTimeMs) / 1000));
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

function ok(data = null) { return { ok: true, data }; }
function fail(error) { return { ok: false, error }; }
