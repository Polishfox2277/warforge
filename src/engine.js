export const FACTIONS = [
  { id: 'eagle', name: 'Orły Północy', color: '#c4525a' },
  { id: 'union', name: 'Liga Rzeczna', color: '#4d89e8' },
  { id: 'nomads', name: 'Stepowe Chanaty', color: '#5fbe7d' },
  { id: 'crown', name: 'Korona Południa', color: '#d6a047' }
];

export const UNIT_TYPES = {
  infantry: { label: 'Piechota', short: 'P', cost: { money: 90, manpower: 90, steel: 10, oil: 0 }, attack: 30, defense: 40, move: 1 },
  artillery: { label: 'Artyleria', short: 'A', cost: { money: 130, manpower: 55, steel: 35, oil: 0 }, attack: 46, defense: 22, move: 1 },
  tank: { label: 'Czołgi', short: 'C', cost: { money: 190, manpower: 45, steel: 65, oil: 45 }, attack: 68, defense: 52, move: 1 }
};

export const BUILDINGS = {
  industry: { label: 'Przemysł', max: 4, cost: { money: 130, manpower: 15, steel: 80, oil: 0 }, description: '+ dochód i produkcja' },
  fort: { label: 'Forty', max: 3, cost: { money: 90, manpower: 30, steel: 60, oil: 0 }, description: '+ obrona prowincji' },
  airbase: { label: 'Lotnisko', max: 2, cost: { money: 120, manpower: 20, steel: 50, oil: 25 }, description: 'rezerwa pod lotnictwo' }
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
  const players = FACTIONS.map((faction, index) => ({
    ...faction,
    type: index === 0 ? 'human' : 'bot',
    controller: index === 0 ? userId : null,
    nickname: index === 0 ? humanName : faction.name,
    resources: { money: 360, manpower: 330, steel: 230, oil: 130 },
    eliminated: false
  }));

  if (mode === 'multiplayer') {
    players[1].type = 'open';
    players[1].nickname = 'Wolne miejsce';
    players[2].type = 'bot';
    players[3].type = 'bot';
  }

  const units = [];
  const capitals = { eagle: 'p0', union: 'p4', nomads: 'p15', crown: 'p19' };
  for (const faction of FACTIONS) {
    units.push(createUnit('infantry', faction.id, capitals[faction.id]));
    units.push(createUnit(faction.id === 'crown' ? 'artillery' : 'infantry', faction.id, capitals[faction.id]));
  }

  const state = {
    schema: 1,
    mode,
    version: 0,
    rng: 174921,
    turn: 1,
    currentPlayerIndex: 0,
    provinces,
    units,
    players,
    selectedProvinceId: null,
    selectedUnitId: null,
    log: ['Rozpoczęto kampanię. Rozbuduj przemysł, zbierz armię i przejmij stolice przeciwników.']
  };
  startTurn(state, currentPlayer(state).id, { silent: true });
  return state;
}

function createMap() {
  const provinces = [];
  const rows = 4;
  const cols = 5;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
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
  const dirsEven = [[0,-1],[0,1],[-1,-1],[-1,0],[1,-1],[1,0]];
  const dirsOdd = [[0,-1],[0,1],[-1,0],[-1,1],[1,0],[1,1]];
  const dirs = province.row % 2 === 0 ? dirsEven : dirsOdd;
  return dirs
    .map(([dr, dc]) => all.find(p => p.row === province.row + dr && p.col === province.col + dc))
    .filter(Boolean);
}

export function createUnit(type, owner, location) {
  return {
    id: `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    type,
    owner,
    location,
    hp: 100,
    xp: 0,
    acted: false
  };
}

export function currentPlayer(state) {
  return state.players[state.currentPlayerIndex];
}

export function getPlayer(state, playerId) {
  return state.players.find(p => p.id === playerId);
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
    .map(([key, value]) => `${resourceIcon(key)} ${value}`)
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

export function startTurn(state, playerId, { silent = false } = {}) {
  const player = getPlayer(state, playerId);
  if (!player || player.eliminated || player.type === 'open') return;
  const income = incomeForPlayer(state, playerId);
  for (const key of Object.keys(player.resources)) player.resources[key] += income[key];
  for (const unit of state.units.filter(u => u.owner === playerId)) unit.acted = false;
  if (!silent) pushLog(state, `${player.nickname}: dochód ${formatCost(income)}.`);
}

export function buildBuilding(state, provinceId, buildingType) {
  const player = currentPlayer(state);
  const province = getProvince(state, provinceId);
  const building = BUILDINGS[buildingType];
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

export function recruitUnit(state, provinceId, unitType) {
  const player = currentPlayer(state);
  const province = getProvince(state, provinceId);
  const unitDef = UNIT_TYPES[unitType];
  if (!province || !unitDef) return fail('Nieznana rekrutacja.');
  if (province.owner !== player.id) return fail('Rekrutacja jest możliwa tylko we własnej prowincji.');
  if (!canAfford(player, unitDef.cost)) return fail(`Brakuje zasobów: ${formatCost(unitDef.cost)}.`);
  pay(player, unitDef.cost);
  const unit = createUnit(unitType, player.id, provinceId);
  state.units.push(unit);
  pushLog(state, `${player.nickname}: zrekrutowano ${unitDef.label} w ${province.name}.`);
  mutate(state);
  return ok(unit);
}

export function moveOrAttack(state, unitId, targetProvinceId) {
  const player = currentPlayer(state);
  const unit = state.units.find(u => u.id === unitId && u.hp > 0);
  const target = getProvince(state, targetProvinceId);
  if (!unit || !target) return fail('Nie wybrano poprawnej jednostki lub celu.');
  if (unit.owner !== player.id) return fail('To nie jest twoja jednostka.');
  if (unit.acted) return fail('Ta jednostka wykonała już rozkaz w tej turze.');
  const origin = getProvince(state, unit.location);
  if (!origin.neighbors.includes(targetProvinceId)) return fail('Jednostka może poruszyć się tylko do sąsiedniej prowincji.');

  if (target.owner === unit.owner && enemyUnitsAt(state, targetProvinceId, unit.owner).length === 0) {
    unit.location = targetProvinceId;
    unit.acted = true;
    pushLog(state, `${UNIT_TYPES[unit.type].label} przeszła z ${origin.name} do ${target.name}.`);
    mutate(state);
    return ok();
  }

  const result = resolveCombat(state, unit, target);
  unit.acted = true;
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

export function endTurn(state) {
  const previous = currentPlayer(state);
  let guard = 0;
  do {
    state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
    if (state.currentPlayerIndex === 0) state.turn += 1;
    guard += 1;
  } while ((currentPlayer(state).eliminated || currentPlayer(state).type === 'open') && guard < state.players.length + 1);
  const next = currentPlayer(state);
  pushLog(state, `${previous.nickname} kończy turę. Teraz gra ${next.nickname}.`);
  startTurn(state, next.id);
  mutate(state);
  return ok();
}

export function runAiTurn(state) {
  const player = currentPlayer(state);
  if (!player || player.type !== 'bot') return fail('Aktualny gracz nie jest botem.');

  const owned = state.provinces.filter(p => p.owner === player.id);
  const affordableIndustry = owned.find(p => (p.buildings.industry ?? 0) < BUILDINGS.industry.max && canAfford(player, BUILDINGS.industry.cost));
  if (affordableIndustry) buildBuilding(state, affordableIndustry.id, 'industry');

  const provinceForRecruitment = owned.find(p => ownUnitsAt(state, p.id, player.id).length < 3) ?? owned[0];
  if (provinceForRecruitment) {
    const unitChoice = canAfford(player, UNIT_TYPES.tank.cost) && nextRandom(state) > 0.55 ? 'tank' : 'infantry';
    if (canAfford(player, UNIT_TYPES[unitChoice].cost)) recruitUnit(state, provinceForRecruitment.id, unitChoice);
  }

  for (const unit of state.units.filter(u => u.owner === player.id && !u.acted)) {
    const province = getProvince(state, unit.location);
    const enemyNeighbor = province.neighbors
      .map(id => getProvince(state, id))
      .filter(p => p.owner !== player.id)
      .sort((a, b) => defenseEstimate(state, a, player.id) - defenseEstimate(state, b, player.id))[0];
    if (enemyNeighbor) {
      moveOrAttack(state, unit.id, enemyNeighbor.id);
    } else {
      const frontier = province.neighbors.map(id => getProvince(state, id)).find(p => p.neighbors.some(n => getProvince(state, n).owner !== player.id));
      if (frontier) moveOrAttack(state, unit.id, frontier.id);
    }
  }

  return endTurn(state);
}

function defenseEstimate(state, province, attackerId) {
  return TERRAIN_DEF[province.terrain] + (province.buildings.fort ?? 0) * 22 + enemyUnitsAt(state, province.id, attackerId).length * 35;
}

export function winner(state) {
  const activeOwners = new Set(state.provinces.map(p => p.owner));
  const active = state.players.filter(p => activeOwners.has(p.id) && !p.eliminated && p.type !== 'open');
  return active.length === 1 ? active[0] : null;
}

export function assignOpenFaction(state, userId, nickname) {
  const slot = state.players.find(p => p.type === 'open');
  if (!slot) return fail('Brak wolnego miejsca. Możesz obserwować rozgrywkę.');
  slot.type = 'human';
  slot.controller = userId;
  slot.nickname = nickname || slot.name;
  pushLog(state, `${slot.nickname} dołącza do gry jako ${slot.name}.`);
  mutate(state);
  return ok(slot);
}

export function isUsersTurn(state, userId) {
  const player = currentPlayer(state);
  return player.type === 'human' && player.controller === userId;
}

export function isHumanLocalTurn(state) {
  return currentPlayer(state).type === 'human';
}

export function selectableTargets(state, unitId) {
  const unit = state.units.find(u => u.id === unitId && u.hp > 0);
  if (!unit || unit.acted) return [];
  return getProvince(state, unit.location)?.neighbors ?? [];
}

export function pushLog(state, message) {
  state.log = [message, ...(state.log ?? [])].slice(0, 80);
}

export function mutate(state) {
  state.version = (state.version ?? 0) + 1;
  state.updatedAt = new Date().toISOString();
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
