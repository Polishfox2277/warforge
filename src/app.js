import {
  BUILDINGS,
  FACTIONS,
  UNIT_TYPES,
  advanceRealtime,
  buildBuilding,
  createInitialState,
  fillOpenSlotsWithBots,
  formatCost,
  getControlledPlayer,
  getPlayer,
  getProvince,
  incomeForPlayer,
  isUnitReady,
  migrateState,
  moveOrAttack,
  ownUnitsAt,
  readyInSeconds,
  recruitUnit,
  resourceIcon,
  selectableTargets,
  terrainLabel,
  unitsAt,
  winner
} from './engine.js';
import { connect, createRoom, joinRoom, loadConfig, saveConfig, submitState, subscribeGame } from './supabaseClient.js';

const LOCAL_KEY = 'warforge_local_state_v2';
const DEFAULT_SUPABASE = {
  url: 'https://mcldlpljgcitixwbnjfb.supabase.co',
  key: 'sb_publishable_8fKwAVcLPTj8TYWt_lHEpQ_Lp3KD1DI'
};

const ui = {
  app: document.querySelector('#app'),
  hub: document.querySelector('#hub'),
  gameScreen: document.querySelector('#gameScreen'),
  mapRoot: document.querySelector('#mapRoot'),
  playersRoot: document.querySelector('#playersRoot'),
  provinceRoot: document.querySelector('#provinceRoot'),
  unitRoot: document.querySelector('#unitRoot'),
  ordersRoot: document.querySelector('#ordersRoot'),
  logRoot: document.querySelector('#logRoot'),
  turnInfo: document.querySelector('#turnInfo'),
  playerInfo: document.querySelector('#playerInfo'),
  syncInfo: document.querySelector('#syncInfo'),
  multiplayerDialog: document.querySelector('#multiplayerDialog'),
  multiplayerStatus: document.querySelector('#multiplayerStatus'),
  supabaseUrlInput: document.querySelector('#supabaseUrlInput'),
  supabaseKeyInput: document.querySelector('#supabaseKeyInput'),
  nicknameInput: document.querySelector('#nicknameInput'),
  roomCodeInput: document.querySelector('#roomCodeInput')
};

const app = {
  state: createInitialState({ humanName: 'Gracz' }),
  selectedProvinceId: null,
  selectedUnitId: null,
  mode: 'local',
  view: 'hub',
  localHumanId: 'eagle',
  supabaseGameId: null,
  supabaseVersion: 0,
  supabaseUser: null,
  unsubscribe: null,
  saving: false,
  pendingPersist: false,
  lastPersistAt: 0,
  toastTimer: null
};

boot();

function boot() {
  const cfg = { ...DEFAULT_SUPABASE, ...loadConfig() };
  ui.supabaseUrlInput.value = cfg.url || '';
  ui.supabaseKeyInput.value = cfg.key || '';
  ui.nicknameInput.value = localStorage.getItem('warforge_nickname') || 'Dowódca';

  document.querySelector('#hubStartBtn').addEventListener('click', startSoloGame);
  document.querySelector('#hubLoadBtn').addEventListener('click', () => loadLocal({ fromHub: true }));
  document.querySelector('#hubMultiplayerBtn').addEventListener('click', () => ui.multiplayerDialog.showModal());
  document.querySelector('#hubDocsBtn').addEventListener('click', () => document.querySelector('#howToPlayDialog').showModal());

  document.querySelector('#hubBtn').addEventListener('click', showHub);
  document.querySelector('#newLocalBtn').addEventListener('click', startSoloGame);
  document.querySelector('#saveLocalBtn').addEventListener('click', () => saveLocal(false));
  document.querySelector('#loadLocalBtn').addEventListener('click', () => loadLocal({ fromHub: false }));
  document.querySelector('#openMultiplayerBtn').addEventListener('click', () => ui.multiplayerDialog.showModal());
  document.querySelector('#connectSupabaseBtn').addEventListener('click', connectFromDialog);
  document.querySelector('#createRoomBtn').addEventListener('click', createRoomFromDialog);
  document.querySelector('#joinRoomBtn').addEventListener('click', joinRoomFromDialog);

  showHub();
  render();
  window.setInterval(gameLoop, 1000);
}

function startSoloGame() {
  disconnectMultiplayer();
  setState(createInitialState({ humanName: ui.nicknameInput.value || 'Gracz', mode: 'local' }), 'local');
  app.localHumanId = 'eagle';
  showGame();
  toast('Nowa kampania real-time rozpoczęta.');
}

function setState(nextState, mode = app.mode) {
  app.state = migrateState(nextState);
  app.mode = mode;
  app.selectedProvinceId = null;
  app.selectedUnitId = null;
  render();
}

function showHub() {
  app.view = 'hub';
  ui.hub.hidden = false;
  ui.gameScreen.hidden = true;
}

function showGame() {
  app.view = 'game';
  ui.hub.hidden = true;
  ui.gameScreen.hidden = false;
  render();
}

function render() {
  migrateState(app.state);
  if (app.view !== 'game') return;
  const controlled = controlledPlayer();
  const win = winner(app.state);
  ui.turnInfo.textContent = win ? `Zwycięstwo: ${win.nickname}` : `Dzień ${app.state.day} · real-time`;
  ui.playerInfo.textContent = controlled
    ? `Kontrolujesz: ${controlled.nickname} (${controlled.name})`
    : app.mode === 'multiplayer'
      ? 'Obserwator / brak wolnego państwa'
      : 'Tryb lokalny';
  ui.syncInfo.textContent = app.mode === 'multiplayer'
    ? `Online${app.state.roomCode ? ` · kod ${app.state.roomCode}` : ''}${isHostAuthority() ? ' · host symuluje świat' : ''}`
    : 'Singleplayer real-time';
  renderMap();
  renderPlayers();
  renderProvince();
  renderUnit();
  renderOrders();
  renderLog();
}

function renderMap() {
  const targets = new Set(app.selectedUnitId ? selectableTargets(app.state, app.selectedUnitId) : []);
  const lines = [];
  for (const province of app.state.provinces) {
    for (const neighborId of province.neighbors) {
      if (province.id > neighborId) continue;
      const n = getProvince(app.state, neighborId);
      lines.push(`<line class="adjacency-line" x1="${province.x}" y1="${province.y}" x2="${n.x}" y2="${n.y}" />`);
    }
  }

  const provinces = app.state.provinces.map(province => {
    const owner = getPlayer(app.state, province.owner) || FACTIONS.find(f => f.id === province.owner);
    const points = hexPoints(province.x, province.y, 76).map(p => p.join(',')).join(' ');
    const unitCount = unitsAt(app.state, province.id).length;
    const classNames = [
      'province',
      app.selectedProvinceId === province.id ? 'selected' : '',
      targets.has(province.id) ? 'target' : ''
    ].join(' ');
    return `<g class="${classNames}" data-province-id="${province.id}">
      <polygon points="${points}" fill="${owner?.color ?? '#687089'}" opacity="0.86"></polygon>
      <text class="province-name" x="${province.x}" y="${province.y - 13}">${escapeHtml(province.name)}</text>
      <text class="province-meta" x="${province.x}" y="${province.y + 12}">${province.capital ? '★ ' : ''}${terrainLabel(province.terrain)} · 🏭${province.buildings.industry} 🛡${province.buildings.fort}${unitCount ? ` · ⚔${unitCount}` : ''}</text>
    </g>`;
  }).join('');

  const unitChips = app.state.units.map(unit => {
    const province = getProvince(app.state, unit.location);
    const owner = getPlayer(app.state, unit.owner);
    const sameProvinceUnits = unitsAt(app.state, unit.location);
    const offsetIndex = sameProvinceUnits.findIndex(u => u.id === unit.id);
    const angle = (offsetIndex / Math.max(1, sameProvinceUnits.length)) * Math.PI * 2;
    const radius = sameProvinceUnits.length > 1 ? 25 : 0;
    const x = province.x + Math.cos(angle) * radius;
    const y = province.y + 42 + Math.sin(angle) * 12;
    const selected = app.selectedUnitId === unit.id ? 'selected' : '';
    const ready = isUnitReady(app.state, unit);
    return `<g class="unit-chip ${selected} ${ready ? 'ready' : 'cooldown'}" data-unit-id="${unit.id}" transform="translate(${x} ${y})">
      <circle r="19" fill="${owner?.color ?? '#ddd'}"></circle>
      <text y="1">${UNIT_TYPES[unit.type].short}</text>
      <title>${UNIT_TYPES[unit.type].label} · ${Math.max(0, Math.round(unit.hp))}%${ready ? ' · gotowa' : ` · ${readyInSeconds(app.state, unit)} s`}</title>
    </g>`;
  }).join('');

  ui.mapRoot.innerHTML = `<svg viewBox="0 0 1000 610" role="img" aria-label="Mapa prowincji Warforge">
    <rect x="0" y="0" width="1000" height="610" rx="22" fill="#11182b"></rect>
    ${lines.join('')}
    ${provinces}
    ${unitChips}
  </svg>`;

  ui.mapRoot.querySelectorAll('[data-province-id]').forEach(el => el.addEventListener('click', () => onProvinceClick(el.dataset.provinceId)));
  ui.mapRoot.querySelectorAll('[data-unit-id]').forEach(el => el.addEventListener('click', event => {
    event.stopPropagation();
    onUnitClick(el.dataset.unitId);
  }));
}

function renderPlayers() {
  const controlled = controlledPlayer();
  ui.playersRoot.innerHTML = app.state.players.map(player => {
    const income = incomeForPlayer(app.state, player.id);
    const current = controlled?.id === player.id ? 'current' : '';
    const status = player.eliminated ? 'wyeliminowany' : player.type === 'bot' ? 'bot' : player.type === 'open' ? 'wolne' : controlled?.id === player.id ? 'ty' : 'gracz';
    const controller = player.type === 'human' && player.controller ? `<div class="resources muted">ID: ${escapeHtml(player.controller.slice(0, 8))}</div>` : '';
    return `<article class="player-card ${current}">
      <div class="player-color" style="background:${player.color}"></div>
      <div>
        <div class="player-line"><strong>${escapeHtml(player.nickname)}</strong><span class="pill">${status}</span></div>
        <div class="resources">
          ${resourcePill('money', player.resources.money)} ${resourcePill('manpower', player.resources.manpower)} ${resourcePill('steel', player.resources.steel)} ${resourcePill('oil', player.resources.oil)}
        </div>
        <div class="resources muted">Dochód/tick: ${formatCost(scaleIncome(income))}</div>
        ${controller}
      </div>
    </article>`;
  }).join('');
}

function renderProvince() {
  const province = app.selectedProvinceId ? getProvince(app.state, app.selectedProvinceId) : null;
  if (!province) {
    ui.provinceRoot.className = 'province-root muted';
    ui.provinceRoot.textContent = 'Kliknij prowincję na mapie.';
    return;
  }
  ui.provinceRoot.className = 'province-root detail-grid';
  const owner = getPlayer(app.state, province.owner);
  const income = formatCost(scaleIncome(incomeSingleProvince(province)));
  ui.provinceRoot.innerHTML = `
    <div class="detail-row"><strong>${escapeHtml(province.name)}</strong><span>${province.capital ? 'Stolica' : terrainLabel(province.terrain)}</span></div>
    <div class="detail-row"><span>Właściciel</span><span>${escapeHtml(owner?.nickname ?? province.owner)}</span></div>
    <div class="detail-row"><span>Dochód/tick</span><span>${income}</span></div>
    <div class="detail-row"><span>Budynki</span><span>🏭 ${province.buildings.industry} · 🛡 ${province.buildings.fort} · 🛫 ${province.buildings.airbase}</span></div>
    <div class="detail-row"><span>Jednostki</span><span>${unitsAt(app.state, province.id).length}</span></div>`;
}

function renderUnit() {
  const unit = app.selectedUnitId ? app.state.units.find(u => u.id === app.selectedUnitId) : null;
  if (!unit) {
    const province = app.selectedProvinceId ? getProvince(app.state, app.selectedProvinceId) : null;
    const provinceUnits = province ? unitsAt(app.state, province.id) : [];
    if (!provinceUnits.length) {
      ui.unitRoot.className = 'unit-root muted';
      ui.unitRoot.textContent = 'Kliknij jednostkę albo prowincję z jednostką.';
      return;
    }
    ui.unitRoot.className = 'unit-root detail-grid';
    ui.unitRoot.innerHTML = provinceUnits.map(u => unitButtonHtml(u)).join('');
    ui.unitRoot.querySelectorAll('[data-unit-pick]').forEach(btn => btn.addEventListener('click', () => onUnitClick(btn.dataset.unitPick)));
    return;
  }
  const province = getProvince(app.state, unit.location);
  const owner = getPlayer(app.state, unit.owner);
  ui.unitRoot.className = 'unit-root detail-grid';
  ui.unitRoot.innerHTML = `
    <div class="detail-row"><strong>${UNIT_TYPES[unit.type].label}</strong><span>${Math.round(unit.hp)}% siły</span></div>
    <div class="detail-row"><span>Państwo</span><span>${escapeHtml(owner?.nickname ?? unit.owner)}</span></div>
    <div class="detail-row"><span>Pozycja</span><span>${escapeHtml(province.name)}</span></div>
    <div class="detail-row"><span>Status</span><span>${isUnitReady(app.state, unit) ? 'gotowa' : `odpoczywa ${readyInSeconds(app.state, unit)} s`}</span></div>
    <div class="detail-row"><span>Doświadczenie</span><span>${unit.xp}</span></div>`;
}

function renderOrders() {
  const player = controlledPlayer();
  const canAct = userCanAct();
  const province = app.selectedProvinceId ? getProvince(app.state, app.selectedProvinceId) : null;
  const unit = app.selectedUnitId ? app.state.units.find(u => u.id === app.selectedUnitId) : null;
  const buttons = [];

  if (!player) {
    buttons.push('<span class="muted">Nie masz przypisanego państwa. Dołącz do pokoju z wolnym miejscem albo obserwuj rozgrywkę.</span>');
  }

  if (player && province && province.owner === player.id) {
    for (const [key, building] of Object.entries(BUILDINGS)) {
      buttons.push(actionButton(`${building.label} (${formatCost(building.cost)})`, () => perform(() => buildBuilding(app.state, province.id, key, player.id)), canAct));
    }
    for (const [key, unitDef] of Object.entries(UNIT_TYPES)) {
      buttons.push(actionButton(`Rekrutuj ${unitDef.label} (${formatCost(unitDef.cost)})`, () => perform(() => recruitUnit(app.state, province.id, key, player.id)), canAct));
    }
  }

  if (player && unit && unit.owner === player.id) {
    for (const targetId of selectableTargets(app.state, unit.id)) {
      const target = getProvince(app.state, targetId);
      const verb = target.owner === unit.owner ? 'Marsz' : 'Atak';
      buttons.push(actionButton(`${verb}: ${target.name}`, () => perform(() => moveOrAttack(app.state, unit.id, target.id, player.id)), canAct && isUnitReady(app.state, unit)));
    }
  }

  if (app.mode === 'multiplayer' && isHostAuthority() && app.state.players.some(p => p.type === 'open')) {
    buttons.push(actionButton('Wypełnij wolne kraje botami', () => perform(() => fillOpenSlotsWithBots(app.state)), true));
  }

  if (!buttons.length) buttons.push('<span class="muted">Wybierz własną prowincję lub jednostkę, aby wydać rozkaz.</span>');
  ui.ordersRoot.innerHTML = '';
  for (const item of buttons) {
    if (typeof item === 'string') ui.ordersRoot.insertAdjacentHTML('beforeend', item);
    else ui.ordersRoot.appendChild(item);
  }
}

function renderLog() {
  ui.logRoot.innerHTML = (app.state.log ?? []).slice(0, 22).map(item => `<li>${escapeHtml(item)}</li>`).join('');
}

function onProvinceClick(provinceId) {
  const player = controlledPlayer();
  if (app.selectedUnitId && player) {
    const targets = selectableTargets(app.state, app.selectedUnitId);
    if (targets.includes(provinceId) && userCanAct()) {
      perform(() => moveOrAttack(app.state, app.selectedUnitId, provinceId, player.id));
      return;
    }
  }
  app.selectedProvinceId = provinceId;
  if (player) {
    const own = ownUnitsAt(app.state, provinceId, player.id).find(u => isUnitReady(app.state, u)) || ownUnitsAt(app.state, provinceId, player.id)[0];
    app.selectedUnitId = own?.id ?? null;
  } else {
    app.selectedUnitId = null;
  }
  render();
}

function onUnitClick(unitId) {
  const unit = app.state.units.find(u => u.id === unitId);
  app.selectedUnitId = unitId;
  app.selectedProvinceId = unit?.location ?? app.selectedProvinceId;
  render();
}

function perform(action) {
  const result = action();
  if (!result.ok) {
    toast(result.error);
    render();
    return;
  }
  const win = winner(app.state);
  if (win) app.state.log.unshift(`${win.nickname} kontroluje mapę. Koniec kampanii!`);
  render();
  persistIfNeeded({ force: true });
}

function gameLoop() {
  if (app.view !== 'game') return;
  if (app.mode === 'local') {
    const result = advanceRealtime(app.state, { includeBots: true });
    render();
    if (result.ok && result.data.changed) saveLocal(true);
    return;
  }
  if (app.mode === 'multiplayer' && isHostAuthority()) {
    const result = advanceRealtime(app.state, { includeBots: true });
    render();
    if (result.ok && result.data.changed) persistIfNeeded({ throttleMs: 1800 });
  } else {
    render();
  }
}

async function persistIfNeeded({ force = false, throttleMs = 0 } = {}) {
  if (app.mode !== 'multiplayer' || !app.supabaseGameId || app.saving) return;
  const now = Date.now();
  if (!force && throttleMs && now - app.lastPersistAt < throttleMs) return;
  app.saving = true;
  app.lastPersistAt = now;
  try {
    const expected = app.supabaseVersion;
    const stateToSend = structuredClone(app.state);
    const row = await submitState(app.supabaseGameId, stateToSend, expected);
    if (row?.state) {
      app.supabaseVersion = row.version;
      app.state = migrateState(row.state);
      app.state.roomCode = row.code ?? app.state.roomCode;
      ui.multiplayerStatus.textContent = 'Zapisano stan w Supabase.';
    }
  } catch (error) {
    ui.multiplayerStatus.textContent = `Błąd synchronizacji: ${error.message}`;
    toast(`Błąd synchronizacji: ${error.message}`);
  } finally {
    app.saving = false;
    render();
  }
}

function userCanAct() {
  if (winner(app.state)) return false;
  return Boolean(controlledPlayer());
}

function controlledPlayer() {
  if (app.mode === 'local') return getPlayer(app.state, app.localHumanId);
  return getControlledPlayer(app.state, app.supabaseUser?.id);
}

function isHostAuthority() {
  if (app.mode !== 'multiplayer' || !app.supabaseUser) return false;
  const hostId = app.state.hostUserId || app.state.players[0]?.controller;
  return hostId === app.supabaseUser.id;
}

function actionButton(label, handler, enabled = true) {
  const btn = document.createElement('button');
  btn.className = 'btn small';
  btn.type = 'button';
  btn.textContent = label;
  btn.disabled = !enabled;
  btn.addEventListener('click', handler);
  return btn;
}

function unitButtonHtml(unit) {
  const owner = getPlayer(app.state, unit.owner);
  const status = isUnitReady(app.state, unit) ? 'gotowa' : `${readyInSeconds(app.state, unit)} s`;
  return `<button class="btn small" type="button" data-unit-pick="${unit.id}">${UNIT_TYPES[unit.type].label} · ${owner?.nickname ?? unit.owner} · ${Math.round(unit.hp)}% · ${status}</button>`;
}

function incomeSingleProvince(province) {
  const industry = province.buildings.industry ?? 0;
  return {
    money: province.resources.money + industry * 18 + (province.capital ? 18 : 0),
    manpower: province.resources.manpower + industry * 4,
    steel: province.resources.steel + industry * 10,
    oil: province.resources.oil + (province.buildings.airbase ?? 0) * 2
  };
}

function scaleIncome(income) {
  return Object.fromEntries(Object.entries(income).map(([key, value]) => [key, Math.round(value * 0.28)]));
}

function resourcePill(key, value) {
  return `<span class="pill">${resourceIcon(key)} ${Math.round(value)}</span>`;
}

function hexPoints(cx, cy, r) {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = Math.PI / 180 * (60 * i - 30);
    return [Math.round(cx + r * Math.cos(angle)), Math.round(cy + r * Math.sin(angle))];
  });
}

function saveLocal(silent = false) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(app.state));
  if (!silent) toast('Zapisano kampanię w localStorage.');
}

function loadLocal({ fromHub = false } = {}) {
  const raw = localStorage.getItem(LOCAL_KEY) || localStorage.getItem('warforge_local_state');
  if (!raw) return toast('Brak zapisu lokalnego.');
  try {
    disconnectMultiplayer();
    setState(migrateState(JSON.parse(raw)), 'local');
    app.localHumanId = 'eagle';
    if (fromHub) showGame();
    toast('Wczytano zapis lokalny.');
  } catch {
    toast('Zapis jest uszkodzony.');
  }
}

async function connectFromDialog() {
  try {
    const config = getDialogConfig();
    await connect(config);
    saveConfig(config);
    localStorage.setItem('warforge_nickname', config.nickname);
    ui.multiplayerStatus.textContent = 'Połączono z Supabase. Możesz utworzyć lub dołączyć do pokoju.';
  } catch (error) {
    ui.multiplayerStatus.textContent = error.message;
  }
}

async function createRoomFromDialog() {
  try {
    const config = getDialogConfig();
    await connect(config);
    const initialState = createInitialState({ mode: 'multiplayer', humanName: config.nickname });
    const { game, user } = await createRoom({ name: 'Warforge room', nickname: config.nickname, initialState });
    app.supabaseUser = user;
    app.supabaseGameId = game.id;
    app.supabaseVersion = game.version;
    const state = migrateState(structuredClone(game.state));
    state.roomCode = game.code;
    state.hostUserId = user.id;
    state.players[0].controller = user.id;
    state.players[0].nickname = config.nickname;
    app.mode = 'multiplayer';
    app.state = state;
    setupSubscription(game.id);
    ui.roomCodeInput.value = game.code;
    ui.multiplayerStatus.textContent = `Utworzono pokój. Kod: ${game.code}. Każdy kolejny gracz dostanie własne wolne państwo.`;
    ui.multiplayerDialog.close();
    showGame();
    await persistIfNeeded({ force: true });
  } catch (error) {
    ui.multiplayerStatus.textContent = error.message;
  }
}

async function joinRoomFromDialog() {
  try {
    const config = getDialogConfig();
    await connect(config);
    const { game, user, factionId } = await joinRoom({ code: ui.roomCodeInput.value, nickname: config.nickname });
    const state = migrateState(structuredClone(game.state));
    state.roomCode = game.code;
    app.supabaseUser = user;
    app.supabaseGameId = game.id;
    app.supabaseVersion = game.version;
    app.mode = 'multiplayer';
    app.state = state;
    setupSubscription(game.id);
    ui.multiplayerStatus.textContent = factionId === 'spectator'
      ? `Dołączono do pokoju ${game.code} jako obserwator — brak wolnych państw.`
      : `Dołączono do pokoju ${game.code} jako ${getPlayer(state, factionId)?.name ?? factionId}.`;
    ui.multiplayerDialog.close();
    showGame();
  } catch (error) {
    ui.multiplayerStatus.textContent = error.message;
  }
}

function setupSubscription(gameId) {
  if (app.unsubscribe) app.unsubscribe();
  app.unsubscribe = subscribeGame(gameId, row => {
    if (app.saving) return;
    app.supabaseVersion = row.version;
    const next = migrateState(row.state);
    next.roomCode = row.code ?? next.roomCode;
    app.state = next;
    render();
  });
}

function disconnectMultiplayer() {
  if (app.unsubscribe) app.unsubscribe();
  app.unsubscribe = null;
  app.supabaseGameId = null;
  app.supabaseVersion = 0;
  app.supabaseUser = null;
}

function getDialogConfig() {
  return {
    url: ui.supabaseUrlInput.value.trim(),
    key: ui.supabaseKeyInput.value.trim(),
    nickname: ui.nicknameInput.value.trim() || 'Dowódca'
  };
}

function toast(message) {
  if (app.view === 'game') ui.syncInfo.textContent = message;
  else ui.multiplayerStatus.textContent = message;
  window.clearTimeout(app.toastTimer);
  app.toastTimer = window.setTimeout(() => {
    if (app.view === 'game') {
      ui.syncInfo.textContent = app.mode === 'multiplayer' ? 'Online' : 'Singleplayer real-time';
    }
  }, 2600);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
