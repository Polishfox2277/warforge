import {
  BUILDINGS,
  FACTIONS,
  UNIT_TYPES,
  assignOpenFaction,
  buildBuilding,
  createInitialState,
  currentPlayer,
  endTurn,
  formatCost,
  getPlayer,
  getProvince,
  incomeForPlayer,
  isHumanLocalTurn,
  isUsersTurn,
  moveOrAttack,
  ownUnitsAt,
  recruitUnit,
  resourceIcon,
  runAiTurn,
  selectableTargets,
  terrainLabel,
  unitsAt,
  winner
} from './engine.js';
import { connect, createRoom, joinRoom, loadConfig, saveConfig, submitState, subscribeGame } from './supabaseClient.js';

const LOCAL_KEY = 'warforge_local_state';
const ui = {
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
  supabaseGameId: null,
  supabaseVersion: 0,
  supabaseUser: null,
  unsubscribe: null,
  saving: false,
  dirty: false
};

boot();

function boot() {
  const cfg = loadConfig();
  ui.supabaseUrlInput.value = cfg.url || '';
  ui.supabaseKeyInput.value = cfg.key || '';
  ui.nicknameInput.value = localStorage.getItem('warforge_nickname') || 'Dowódca';

  document.querySelector('#newLocalBtn').addEventListener('click', () => {
    setState(createInitialState({ humanName: ui.nicknameInput.value || 'Gracz' }), 'local');
    toast('Utworzono nową kampanię singleplayer.');
  });
  document.querySelector('#saveLocalBtn').addEventListener('click', saveLocal);
  document.querySelector('#loadLocalBtn').addEventListener('click', loadLocal);
  document.querySelector('#openMultiplayerBtn').addEventListener('click', () => ui.multiplayerDialog.showModal());
  document.querySelector('#connectSupabaseBtn').addEventListener('click', connectFromDialog);
  document.querySelector('#createRoomBtn').addEventListener('click', createRoomFromDialog);
  document.querySelector('#joinRoomBtn').addEventListener('click', joinRoomFromDialog);

  render();
}

function setState(nextState, mode = app.mode) {
  app.state = nextState;
  app.mode = mode;
  app.selectedProvinceId = null;
  app.selectedUnitId = null;
  render();
}

function render() {
  const player = currentPlayer(app.state);
  const win = winner(app.state);
  ui.turnInfo.textContent = win ? `Zwycięstwo: ${win.nickname}` : `Tura ${app.state.turn}`;
  ui.playerInfo.textContent = `${player.nickname} — ${player.type === 'bot' ? 'bot' : player.type === 'open' ? 'wolne miejsce' : 'człowiek'}`;
  ui.syncInfo.textContent = app.mode === 'multiplayer'
    ? `Online${app.state.roomCode ? ` · kod ${app.state.roomCode}` : ''}`
    : 'Tryb lokalny';
  renderMap();
  renderPlayers();
  renderProvince();
  renderUnit();
  renderOrders();
  renderLog();
  maybeRunBots();
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

  const unitChips = app.state.units.map((unit, index) => {
    const province = getProvince(app.state, unit.location);
    const owner = getPlayer(app.state, unit.owner);
    const sameProvinceUnits = unitsAt(app.state, unit.location);
    const offsetIndex = sameProvinceUnits.findIndex(u => u.id === unit.id);
    const angle = (offsetIndex / Math.max(1, sameProvinceUnits.length)) * Math.PI * 2;
    const radius = sameProvinceUnits.length > 1 ? 25 : 0;
    const x = province.x + Math.cos(angle) * radius;
    const y = province.y + 42 + Math.sin(angle) * 12;
    const selected = app.selectedUnitId === unit.id ? 'selected' : '';
    return `<g class="unit-chip ${selected}" data-unit-id="${unit.id}" transform="translate(${x} ${y})">
      <circle r="19" fill="${owner?.color ?? '#ddd'}"></circle>
      <text y="1">${UNIT_TYPES[unit.type].short}</text>
      <title>${UNIT_TYPES[unit.type].label} · ${Math.max(0, Math.round(unit.hp))}%</title>
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
  ui.playersRoot.innerHTML = app.state.players.map((player, index) => {
    const income = incomeForPlayer(app.state, player.id);
    const current = index === app.state.currentPlayerIndex ? 'current' : '';
    const status = player.eliminated ? 'wyeliminowany' : player.type === 'bot' ? 'bot' : player.type === 'open' ? 'wolne' : 'gracz';
    return `<article class="player-card ${current}">
      <div class="player-color" style="background:${player.color}"></div>
      <div>
        <div class="player-line"><strong>${escapeHtml(player.nickname)}</strong><span class="pill">${status}</span></div>
        <div class="resources">
          ${resourcePill('money', player.resources.money)} ${resourcePill('manpower', player.resources.manpower)} ${resourcePill('steel', player.resources.steel)} ${resourcePill('oil', player.resources.oil)}
        </div>
        <div class="resources muted">Dochód: ${formatCost(income)}</div>
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
  const income = formatCost(incomeSingleProvince(province));
  ui.provinceRoot.innerHTML = `
    <div class="detail-row"><strong>${escapeHtml(province.name)}</strong><span>${province.capital ? 'Stolica' : terrainLabel(province.terrain)}</span></div>
    <div class="detail-row"><span>Właściciel</span><span>${escapeHtml(owner?.nickname ?? province.owner)}</span></div>
    <div class="detail-row"><span>Dochód</span><span>${income}</span></div>
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
    <div class="detail-row"><span>Status</span><span>${unit.acted ? 'rozkaz wykonany' : 'gotowa'}</span></div>
    <div class="detail-row"><span>Doświadczenie</span><span>${unit.xp}</span></div>`;
}

function renderOrders() {
  const player = currentPlayer(app.state);
  const canAct = userCanAct();
  const province = app.selectedProvinceId ? getProvince(app.state, app.selectedProvinceId) : null;
  const unit = app.selectedUnitId ? app.state.units.find(u => u.id === app.selectedUnitId) : null;
  const buttons = [];

  if (province && province.owner === player.id) {
    for (const [key, building] of Object.entries(BUILDINGS)) {
      buttons.push(actionButton(`${building.label} (${formatCost(building.cost)})`, () => perform(() => buildBuilding(app.state, province.id, key)), canAct));
    }
    for (const [key, unitDef] of Object.entries(UNIT_TYPES)) {
      buttons.push(actionButton(`Rekrutuj ${unitDef.label} (${formatCost(unitDef.cost)})`, () => perform(() => recruitUnit(app.state, province.id, key)), canAct));
    }
  }

  if (unit && unit.owner === player.id) {
    for (const targetId of selectableTargets(app.state, unit.id)) {
      const target = getProvince(app.state, targetId);
      const verb = target.owner === unit.owner ? 'Marsz' : 'Atak';
      buttons.push(actionButton(`${verb}: ${target.name}`, () => perform(() => moveOrAttack(app.state, unit.id, target.id)), canAct));
    }
  }

  if (player.type === 'bot') buttons.push(actionButton('Rozegraj turę bota', () => perform(() => runAiTurn(app.state)), app.mode === 'local' || app.mode === 'multiplayer'));
  buttons.push(actionButton('Zakończ turę', () => perform(() => endTurn(app.state)), canAct));

  if (!buttons.length) buttons.push('<span class="muted">Wybierz własną prowincję lub jednostkę, aby wydać rozkaz.</span>');
  ui.ordersRoot.innerHTML = '';
  for (const item of buttons) {
    if (typeof item === 'string') ui.ordersRoot.insertAdjacentHTML('beforeend', item);
    else ui.ordersRoot.appendChild(item);
  }
}

function renderLog() {
  ui.logRoot.innerHTML = (app.state.log ?? []).slice(0, 18).map(item => `<li>${escapeHtml(item)}</li>`).join('');
}

function onProvinceClick(provinceId) {
  if (app.selectedUnitId) {
    const targets = selectableTargets(app.state, app.selectedUnitId);
    if (targets.includes(provinceId) && userCanAct()) {
      perform(() => moveOrAttack(app.state, app.selectedUnitId, provinceId));
      return;
    }
  }
  app.selectedProvinceId = provinceId;
  const player = currentPlayer(app.state);
  const own = ownUnitsAt(app.state, provinceId, player.id).find(u => !u.acted) || ownUnitsAt(app.state, provinceId, player.id)[0];
  app.selectedUnitId = own?.id ?? null;
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
  persistIfNeeded();
}

async function persistIfNeeded() {
  if (app.mode !== 'multiplayer' || !app.supabaseGameId || app.saving) return;
  app.saving = true;
  try {
    const expected = app.supabaseVersion;
    const stateToSend = structuredClone(app.state);
    const row = await submitState(app.supabaseGameId, stateToSend, expected);
    if (row?.state) {
      app.supabaseVersion = row.version;
      app.state = row.state;
      ui.multiplayerStatus.textContent = 'Zapisano ruch w Supabase.';
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
  const player = currentPlayer(app.state);
  if (winner(app.state)) return false;
  if (app.mode === 'local') return isHumanLocalTurn(app.state);
  if (player.type === 'bot') return true;
  return app.supabaseUser && isUsersTurn(app.state, app.supabaseUser.id);
}

function maybeRunBots() {
  const player = currentPlayer(app.state);
  if (!player || player.type !== 'bot' || winner(app.state)) return;
  if (app.mode === 'local') {
    window.clearTimeout(app.botTimer);
    app.botTimer = window.setTimeout(() => {
      runAiTurn(app.state);
      saveLocal(true);
      render();
    }, 450);
  }
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
  return `<button class="btn small" type="button" data-unit-pick="${unit.id}">${UNIT_TYPES[unit.type].label} · ${owner?.nickname ?? unit.owner} · ${Math.round(unit.hp)}%</button>`;
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

function loadLocal() {
  const raw = localStorage.getItem(LOCAL_KEY);
  if (!raw) return toast('Brak zapisu lokalnego.');
  try {
    setState(JSON.parse(raw), 'local');
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
    const state = structuredClone(game.state);
    state.roomCode = game.code;
    state.players[0].controller = user.id;
    state.players[0].nickname = config.nickname;
    app.mode = 'multiplayer';
    app.state = state;
    setupSubscription(game.id);
    ui.roomCodeInput.value = game.code;
    ui.multiplayerStatus.textContent = `Utworzono pokój. Kod: ${game.code}`;
    render();
    await persistIfNeeded();
  } catch (error) {
    ui.multiplayerStatus.textContent = error.message;
  }
}

async function joinRoomFromDialog() {
  try {
    const config = getDialogConfig();
    await connect(config);
    const { game, user } = await joinRoom({ code: ui.roomCodeInput.value, nickname: config.nickname });
    const state = structuredClone(game.state);
    const assignment = assignOpenFaction(state, user.id, config.nickname);
    if (!assignment.ok) ui.multiplayerStatus.textContent = assignment.error;
    state.roomCode = game.code;
    app.supabaseUser = user;
    app.supabaseGameId = game.id;
    app.supabaseVersion = game.version;
    app.mode = 'multiplayer';
    app.state = state;
    setupSubscription(game.id);
    render();
    await persistIfNeeded();
    ui.multiplayerStatus.textContent = `Dołączono do pokoju ${game.code}.`;
  } catch (error) {
    ui.multiplayerStatus.textContent = error.message;
  }
}

function setupSubscription(gameId) {
  if (app.unsubscribe) app.unsubscribe();
  app.unsubscribe = subscribeGame(gameId, row => {
    if (app.saving) return;
    app.supabaseVersion = row.version;
    const next = row.state;
    next.roomCode = row.code ?? next.roomCode;
    app.state = next;
    render();
  });
}

function getDialogConfig() {
  return {
    url: ui.supabaseUrlInput.value.trim(),
    key: ui.supabaseKeyInput.value.trim(),
    nickname: ui.nicknameInput.value.trim() || 'Dowódca'
  };
}

function toast(message) {
  ui.syncInfo.textContent = message;
  window.clearTimeout(app.toastTimer);
  app.toastTimer = window.setTimeout(() => {
    ui.syncInfo.textContent = app.mode === 'multiplayer' ? 'Online' : 'Tryb lokalny';
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
