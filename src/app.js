import {
  BUILDINGS,
  BOT_COUNTRY_PRESETS,
  DEFAULT_CUSTOM_COUNTRY,
  IDEOLOGIES,
  UNIT_TYPES,
  advanceRealtime,
  buildBuilding,
  buildingCostForPlayer,
  createInitialState,
  fillOpenSlotsWithBots,
  formatCost,
  getControlledPlayer,
  getPlayer,
  getProvince,
  ideologySummary,
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
  unitCostForPlayer,
  unitsAt,
  winner
} from './engine.js';
import { connect, createRoom, joinRoom, loadConfig, saveConfig, submitState, subscribeGame } from './supabaseClient.js';

const LOCAL_KEY = 'warforge_local_state_v4';
const COUNTRY_KEY = 'warforge_custom_country_v1';
const DEFAULT_SUPABASE = {
  url: 'https://mcldlpljgcitixwbnjfb.supabase.co',
  key: 'sb_publishable_8fKwAVcLPTj8TYWt_lHEpQ_Lp3KD1DI'
};

const ui = {
  app: document.querySelector('#app'),
  hub: document.querySelector('#hub'),
  hubCountrySummary: document.querySelector('#hubCountrySummary'),
  multiplayerCountrySummary: document.querySelector('#multiplayerCountrySummary'),
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
  roomCodeInput: document.querySelector('#roomCodeInput'),
  countryDialog: document.querySelector('#countryDialog'),
  countryStatus: document.querySelector('#countryStatus'),
  countryPreview: document.querySelector('#countryPreview'),
  countryIdeologyDescription: document.querySelector('#countryIdeologyDescription'),
  countryNameInput: document.querySelector('#countryNameInput'),
  countryColorInput: document.querySelector('#countryColorInput'),
  countrySecondaryColorInput: document.querySelector('#countrySecondaryColorInput'),
  countryIdeologyInput: document.querySelector('#countryIdeologyInput'),
  countryFlagPatternInput: document.querySelector('#countryFlagPatternInput'),
  countryEmblemInput: document.querySelector('#countryEmblemInput')
};

const app = {
  state: createInitialState({ humanName: 'Gracz', customCountry: loadCountryProfile() }),
  customCountry: loadCountryProfile(),
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

  populateIdeologies();
  fillCountryEditor(app.customCountry);
  renderCountryCards();

  document.querySelector('#hubStartBtn').addEventListener('click', startSoloGame);
  document.querySelector('#hubLoadBtn').addEventListener('click', () => loadLocal({ fromHub: true }));
  document.querySelector('#hubMultiplayerBtn').addEventListener('click', () => ui.multiplayerDialog.showModal());
  document.querySelector('#hubCountryBtn').addEventListener('click', () => ui.countryDialog.showModal());
  document.querySelector('#hubDocsBtn').addEventListener('click', () => document.querySelector('#howToPlayDialog').showModal());

  document.querySelector('#hubBtn').addEventListener('click', showHub);
  document.querySelector('#countryBtn').addEventListener('click', () => ui.countryDialog.showModal());
  document.querySelector('#newLocalBtn').addEventListener('click', startSoloGame);
  document.querySelector('#saveLocalBtn').addEventListener('click', () => saveLocal(false));
  document.querySelector('#loadLocalBtn').addEventListener('click', () => loadLocal({ fromHub: false }));
  document.querySelector('#openMultiplayerBtn').addEventListener('click', () => ui.multiplayerDialog.showModal());
  document.querySelector('#connectSupabaseBtn').addEventListener('click', connectFromDialog);
  document.querySelector('#createRoomBtn').addEventListener('click', createRoomFromDialog);
  document.querySelector('#joinRoomBtn').addEventListener('click', joinRoomFromDialog);
  document.querySelector('#saveCountryBtn').addEventListener('click', saveCountryFromDialog);
  document.querySelector('#randomCountryBtn').addEventListener('click', randomizeCountry);
  document.querySelector('#resetCountryBtn').addEventListener('click', () => {
    fillCountryEditor(DEFAULT_CUSTOM_COUNTRY);
    refreshCountryPreview();
    ui.countryStatus.textContent = 'Przywrócono domyślną konfigurację.';
  });

  [
    ui.countryNameInput,
    ui.countryColorInput,
    ui.countrySecondaryColorInput,
    ui.countryIdeologyInput,
    ui.countryFlagPatternInput,
    ui.countryEmblemInput
  ].forEach(el => el.addEventListener('input', refreshCountryPreview));

  showHub();
  render();
  window.setInterval(gameLoop, 1000);
}

function populateIdeologies() {
  ui.countryIdeologyInput.innerHTML = Object.entries(IDEOLOGIES)
    .map(([id, data]) => `<option value="${id}">${data.label}</option>`)
    .join('');
}

function startSoloGame() {
  disconnectMultiplayer();
  setState(createInitialState({ humanName: ui.nicknameInput.value || 'Gracz', mode: 'local', customCountry: app.customCountry }), 'local');
  app.localHumanId = 'eagle';
  showGame();
  toast('Nowa kampania real-time rozpoczęta. Twój kraj został użyty jako państwo gracza.');
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
  renderCountryCards();
}

function showGame() {
  app.view = 'game';
  ui.hub.hidden = true;
  ui.gameScreen.hidden = false;
  render();
}

function render() {
  migrateState(app.state);
  renderCountryCards();
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

function renderCountryCards() {
  const profile = currentCountryDraft();
  const summary = countryCardHtml(profile, 'Twój kraj', true);
  ui.hubCountrySummary.innerHTML = summary;
  ui.multiplayerCountrySummary.innerHTML = countryMiniCardHtml(profile);
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
    const owner = getPlayer(app.state, province.owner);
    const points = provincePolygonPoints(province).map(p => p.join(',')).join(' ');
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

  const terrainFeatures = `<path class="river-line" d="M 85 210 C 210 190, 265 285, 405 275 S 635 225, 725 315 S 850 455, 940 430" />
    <path class="coast-line" d="M 38 75 C 80 120, 65 185, 98 250 S 70 390, 130 520" />`;

  ui.mapRoot.innerHTML = `<svg viewBox="0 0 1000 610" role="img" aria-label="Mapa prowincji Warforge">
    <rect x="0" y="0" width="1000" height="610" rx="22" fill="#11182b"></rect>
    ${terrainFeatures}
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
        <div class="player-subline">${flagIconHtml(player.flag)} <span>${escapeHtml(player.name)}</span> <span class="pill ideology-pill">${escapeHtml(IDEOLOGIES[player.ideology]?.label ?? player.ideology)}</span></div>
        <div class="resources">
          ${resourcePill('money', player.resources.money)} ${resourcePill('manpower', player.resources.manpower)} ${resourcePill('steel', player.resources.steel)} ${resourcePill('oil', player.resources.oil)}
        </div>
        <div class="resources muted">Dochód/tick: ${formatCost(scaleIncome(income))}</div>
        <div class="resources muted">${escapeHtml(ideologySummary(player))}</div>
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
  const income = formatCost(scaleIncome(incomeSingleProvince(province, owner)));
  ui.provinceRoot.innerHTML = `
    <div class="detail-row"><strong>${escapeHtml(province.name)}</strong><span>${province.capital ? 'Stolica' : terrainLabel(province.terrain)}</span></div>
    <div class="detail-row"><span>Właściciel</span><span>${flagIconHtml(owner?.flag)} ${escapeHtml(owner?.name ?? province.owner)}</span></div>
    <div class="detail-row"><span>Doktryna</span><span>${escapeHtml(IDEOLOGIES[owner?.ideology]?.label ?? '—')}</span></div>
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
    <div class="detail-row"><span>Państwo</span><span>${escapeHtml(owner?.name ?? unit.owner)}</span></div>
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
      const cost = buildingCostForPlayer(player, key);
      buttons.push(actionButton(`${building.label} (${formatCost(cost)})`, () => perform(() => buildBuilding(app.state, province.id, key, player.id)), canAct));
    }
    for (const [key, unitDef] of Object.entries(UNIT_TYPES)) {
      const cost = unitCostForPlayer(player, key);
      buttons.push(actionButton(`Rekrutuj ${unitDef.label} (${formatCost(cost)})`, () => perform(() => recruitUnit(app.state, province.id, key, player.id)), canAct));
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
  return `<button class="btn small" type="button" data-unit-pick="${unit.id}">${UNIT_TYPES[unit.type].label} · ${escapeHtml(owner?.name ?? unit.owner)} · ${Math.round(unit.hp)}% · ${status}</button>`;
}

function incomeSingleProvince(province, owner) {
  const industry = province.buildings.industry ?? 0;
  const income = {
    money: province.resources.money + industry * 18 + (province.capital ? 18 : 0),
    manpower: province.resources.manpower + industry * 4,
    steel: province.resources.steel + industry * 10,
    oil: province.resources.oil + (province.buildings.airbase ?? 0) * 2
  };
  if (!owner) return income;
  const cloneState = { players: [owner], provinces: [], units: [] };
  void cloneState;
  // wykorzystujemy tę samą semantykę bonusów, ale tylko na potrzeby podglądu.
  const ideology = IDEOLOGIES[owner.ideology] ?? IDEOLOGIES.industrialist;
  const out = { ...income };
  for (const [key, mult] of Object.entries(ideology.incomeMult ?? {})) out[key] = Math.round(out[key] * mult);
  return out;
}

function scaleIncome(income) {
  return Object.fromEntries(Object.entries(income).map(([key, value]) => [key, Math.round(value * 0.28)]));
}

function resourcePill(key, value) {
  return `<span class="pill">${resourceIcon(key)} ${Math.round(value)}</span>`;
}

function provincePolygonPoints(province) {
  const seed = Number.parseInt(province.id.slice(1), 10) + 17;
  const angles = [-112, -70, -25, 18, 58, 104, 151, 205];
  const points = angles.map((deg, index) => {
    const wave = Math.sin((seed * 12.9898 + index * 78.233)) * 43758.5453;
    const noise = wave - Math.floor(wave);
    const rx = 70 + noise * 22;
    const ry = 53 + ((noise * 1.7) % 1) * 20;
    const angle = Math.PI / 180 * deg;
    return [
      Math.round(province.x + Math.cos(angle) * rx),
      Math.round(province.y + Math.sin(angle) * ry)
    ];
  });
  return points;
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
    const initialState = createInitialState({ mode: 'multiplayer', humanName: config.nickname, customCountry: app.customCountry });
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
    ui.multiplayerStatus.textContent = `Utworzono pokój. Kod: ${game.code}. Kolejni gracze dołączą ze swoimi własnymi krajami.`;
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
    const { game, user, factionId } = await joinRoom({ code: ui.roomCodeInput.value, nickname: config.nickname, countryProfile: app.customCountry });
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

function loadCountryProfile() {
  try {
    return normalizeCountryProfile(JSON.parse(localStorage.getItem(COUNTRY_KEY) || 'null') || DEFAULT_CUSTOM_COUNTRY);
  } catch {
    return normalizeCountryProfile(DEFAULT_CUSTOM_COUNTRY);
  }
}

function saveCountryProfile(profile) {
  app.customCountry = normalizeCountryProfile(profile);
  localStorage.setItem(COUNTRY_KEY, JSON.stringify(app.customCountry));
  renderCountryCards();
}

function currentCountryDraft() {
  return app.customCountry;
}

function fillCountryEditor(profile) {
  const next = normalizeCountryProfile(profile);
  ui.countryNameInput.value = next.name;
  ui.countryColorInput.value = next.color;
  ui.countrySecondaryColorInput.value = next.secondaryColor;
  ui.countryIdeologyInput.value = next.ideology;
  ui.countryFlagPatternInput.value = next.flagPattern;
  ui.countryEmblemInput.value = next.emblem;
  refreshCountryPreview();
}

function currentEditorCountry() {
  return normalizeCountryProfile({
    name: ui.countryNameInput.value,
    color: ui.countryColorInput.value,
    secondaryColor: ui.countrySecondaryColorInput.value,
    ideology: ui.countryIdeologyInput.value,
    flagPattern: ui.countryFlagPatternInput.value,
    emblem: ui.countryEmblemInput.value
  });
}

function refreshCountryPreview() {
  const profile = currentEditorCountry();
  ui.countryPreview.innerHTML = countryCardHtml(profile, 'Podgląd kraju', false);
  ui.countryIdeologyDescription.textContent = IDEOLOGIES[profile.ideology]?.description || '';
}

function saveCountryFromDialog() {
  const profile = currentEditorCountry();
  saveCountryProfile(profile);
  fillCountryEditor(profile);
  ui.countryStatus.textContent = 'Zapisano kraj w localStorage. Będzie używany w solo i multiplayerze.';
}

function randomizeCountry() {
  const preset = BOT_COUNTRY_PRESETS[Math.floor(Math.random() * BOT_COUNTRY_PRESETS.length)];
  const randomized = {
    ...preset,
    name: `${preset.name} ${Math.floor(10 + Math.random() * 90)}`
  };
  fillCountryEditor(randomized);
  ui.countryStatus.textContent = 'Wylosowano nowy kraj.';
}

function countryCardHtml(profile, label = 'Twój kraj', compact = false) {
  return `<article class="country-card ${compact ? 'compact' : ''}">
    <div class="country-flag-lg">${flagSvgMarkup(profile.flag, 180, 108)}</div>
    <div>
      <div class="eyebrow">${escapeHtml(label)}</div>
      <div class="country-title">${escapeHtml(profile.name)}</div>
      <div class="country-meta"><span class="color-dot" style="background:${profile.color}"></span> Kolor mapy · ${escapeHtml(IDEOLOGIES[profile.ideology]?.label ?? profile.ideology)}</div>
      <div class="country-meta">${escapeHtml(IDEOLOGIES[profile.ideology]?.description ?? '')}</div>
    </div>
  </article>`;
}

function countryMiniCardHtml(profile) {
  return `<article class="mini-country-card-inner">
    <div class="country-flag-mini">${flagSvgMarkup(profile.flag, 72, 44)}</div>
    <div>
      <div><strong>${escapeHtml(profile.name)}</strong></div>
      <div class="muted">${escapeHtml(IDEOLOGIES[profile.ideology]?.label ?? profile.ideology)}</div>
    </div>
  </article>`;
}

function flagIconHtml(flag) {
  return `<span class="flag-inline">${flagSvgMarkup(flag, 26, 16)}</span>`;
}

function flagSvgMarkup(flag, width = 120, height = 72) {
  const f = normalizeCountryProfile({ color: flag?.primary, secondaryColor: flag?.secondary, flagPattern: flag?.pattern, emblem: flag?.emblem }).flag;
  const primary = f.primary;
  const secondary = f.secondary;
  const stroke = 'rgba(255,255,255,0.16)';
  let base = '';
  if (f.pattern === 'vertical') {
    base = `<rect width="${width}" height="${height}" fill="${primary}"/><rect x="${width / 3}" width="${width / 3}" height="${height}" fill="${secondary}"/><rect x="${(width / 3) * 2}" width="${width / 3}" height="${height}" fill="${primary}"/>`;
  } else if (f.pattern === 'cross') {
    base = `<rect width="${width}" height="${height}" fill="${primary}"/><rect x="${width * 0.33}" width="${width * 0.16}" height="${height}" fill="${secondary}"/><rect y="${height * 0.42}" width="${width}" height="${height * 0.18}" fill="${secondary}"/>`;
  } else if (f.pattern === 'diagonal') {
    base = `<rect width="${width}" height="${height}" fill="${primary}"/><polygon points="0,${height} ${width * 0.18},${height} ${width},${height * 0.12} ${width},0 ${width * 0.82},0 0,${height * 0.88}" fill="${secondary}"/>`;
  } else {
    base = `<rect width="${width}" height="${height}" fill="${primary}"/><rect y="${height / 3}" width="${width}" height="${height / 3}" fill="${secondary}"/><rect y="${(height / 3) * 2}" width="${width}" height="${height / 3}" fill="${primary}"/>`;
  }

  const cx = width / 2;
  const cy = height / 2;
  const iconColor = f.pattern === 'cross' ? primary : '#fff7e3';
  let emblem = '';
  switch (f.emblem) {
    case 'gear':
      emblem = `<g fill="${iconColor}" transform="translate(${cx} ${cy})"><circle r="12" fill="none" stroke="${iconColor}" stroke-width="5"/><circle r="4"/><g>${Array.from({ length: 8 }).map((_, i) => `<rect x="-2" y="-20" width="4" height="8" rx="1" transform="rotate(${i * 45})"/>`).join('')}</g></g>`;
      break;
    case 'sun':
      emblem = `<g fill="${iconColor}" transform="translate(${cx} ${cy})"><circle r="8"/>${Array.from({ length: 12 }).map((_, i) => `<rect x="-1.5" y="-18" width="3" height="7" rx="1" transform="rotate(${i * 30})"/>`).join('')}</g>`;
      break;
    case 'anchor':
      emblem = `<g fill="none" stroke="${iconColor}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" transform="translate(${cx} ${cy})"><circle cy="-11" r="4"/><path d="M0 -5 V14"/><path d="M-12 6 C-12 18,-4 19,0 13 C4 19,12 18,12 6"/><path d="M-8 0 H8"/></g>`;
      break;
    case 'crown':
      emblem = `<g fill="${iconColor}" transform="translate(${cx} ${cy + 2})"><path d="M-18 12 L-12 -8 L-2 2 L2 -12 L12 2 L18 -8 L22 12 Z"/><rect x="-19" y="12" width="38" height="6" rx="2"/></g>`;
      break;
    case 'hammer':
      emblem = `<g fill="${iconColor}" transform="translate(${cx} ${cy}) rotate(-18)"><rect x="-3" y="-3" width="6" height="28" rx="2"/><rect x="-12" y="-16" width="24" height="8" rx="2"/></g>`;
      break;
    case 'eagle':
      emblem = `<g fill="${iconColor}" transform="translate(${cx} ${cy})"><path d="M0 -14 C7 -18, 12 -16, 15 -9 C20 -10, 23 -8, 23 -2 C19 0, 16 1, 12 2 C11 10, 8 14, 0 18 C-8 14,-11 10,-12 2 C-16 1,-19 0,-23 -2 C-23 -8,-20 -10,-15 -9 C-12 -16,-7 -18,0 -14 Z"/></g>`;
      break;
    case 'none':
      emblem = '';
      break;
    case 'star':
    default:
      emblem = `<g fill="${iconColor}" transform="translate(${cx} ${cy})"><polygon points="0,-16 4,-5 16,-5 6,2 10,14 0,7 -10,14 -6,2 -16,-5 -4,-5"/></g>`;
      break;
  }
  return `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="10" fill="#0e1324" stroke="${stroke}"/>${base}${emblem}</svg>`;
}

function normalizeCountryProfile(profile) {
  const safeName = String(profile?.name || DEFAULT_CUSTOM_COUNTRY.name).trim().slice(0, 32) || DEFAULT_CUSTOM_COUNTRY.name;
  const color = normalizeColor(profile?.color, DEFAULT_CUSTOM_COUNTRY.color);
  const secondaryColor = normalizeColor(profile?.secondaryColor, DEFAULT_CUSTOM_COUNTRY.secondaryColor);
  const ideology = IDEOLOGIES[profile?.ideology] ? profile.ideology : DEFAULT_CUSTOM_COUNTRY.ideology;
  const flagPattern = ['horizontal', 'vertical', 'cross', 'diagonal'].includes(profile?.flagPattern) ? profile.flagPattern : DEFAULT_CUSTOM_COUNTRY.flagPattern;
  const emblem = ['star', 'gear', 'sun', 'anchor', 'crown', 'hammer', 'eagle', 'none'].includes(profile?.emblem) ? profile.emblem : DEFAULT_CUSTOM_COUNTRY.emblem;
  return {
    name: safeName,
    color,
    secondaryColor,
    ideology,
    flagPattern,
    emblem,
    flag: {
      pattern: flagPattern,
      emblem,
      primary: color,
      secondary: secondaryColor
    }
  };
}

function normalizeColor(value, fallback) {
  const text = String(value || '').trim();
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(text) ? text : fallback;
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
