import {
  BUILDINGS,
  BOT_COUNTRY_PRESETS,
  DEFAULT_CUSTOM_COUNTRY,
  DOCTRINES,
  GOVERNMENTS,
  IDEOLOGIES,
  MAP_PRESETS,
  TRAITS,
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
  provinceBattleStatus,
  provinceDefenseStrength,
  readyInSeconds,
  recruitUnit,
  repairProvince,
  resourceIcon,
  selectableTargets,
  terrainLabel,
  unitCostForPlayer,
  unitsAt,
  winner
} from './engine.js';
import { connect, createRoom, fetchGame, joinRoom, loadConfig, saveConfig, submitState, subscribeGame } from './supabaseClient.js';

const LOCAL_KEY = 'warforge_local_state_v4';
const COUNTRY_KEY = 'warforge_custom_country_v1';
const DEFAULT_SUPABASE = {
  url: 'https://mcldlpljgcitixwbnjfb.supabase.co',
  key: 'sb_publishable_8fKwAVcLPTj8TYWt_lHEpQ_Lp3KD1DI'
};

const MAP_PAN_THRESHOLD = 10;
const MAP_KEYBOARD_PAN_STEP = 96;
const MAP_ZOOM_MIN = 0.65;
const MAP_ZOOM_MAX = 2.35;
const MAP_ZOOM_STEP = 1.12;

const ui = {
  app: document.querySelector('#app'),
  hub: document.querySelector('#hub'),
  hubCountrySummary: document.querySelector('#hubCountrySummary'),
  multiplayerCountrySummary: document.querySelector('#multiplayerCountrySummary'),
  gameScreen: document.querySelector('#gameScreen'),
  mapRoot: document.querySelector('#mapRoot'),
  quickActionsRoot: document.querySelector('#quickActionsRoot'),
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
  multiplayerMapInput: document.querySelector('#multiplayerMapInput'),
  supabaseUrlInput: document.querySelector('#supabaseUrlInput'),
  supabaseKeyInput: document.querySelector('#supabaseKeyInput'),
  nicknameInput: document.querySelector('#nicknameInput'),
  roomCodeInput: document.querySelector('#roomCodeInput'),
  setupDialog: document.querySelector('#setupDialog'),
  setupMapInput: document.querySelector('#setupMapInput'),
  setupPaceInput: document.querySelector('#setupPaceInput'),
  setupDifficultyInput: document.querySelector('#setupDifficultyInput'),
  setupResourcesInput: document.querySelector('#setupResourcesInput'),
  setupCommanderInput: document.querySelector('#setupCommanderInput'),
  setupCountrySummary: document.querySelector('#setupCountrySummary'),
  countryDialog: document.querySelector('#countryDialog'),
  countryStatus: document.querySelector('#countryStatus'),
  countryPreview: document.querySelector('#countryPreview'),
  countryIdeologyDescription: document.querySelector('#countryIdeologyDescription'),
  countryNameInput: document.querySelector('#countryNameInput'),
  countryColorInput: document.querySelector('#countryColorInput'),
  countrySecondaryColorInput: document.querySelector('#countrySecondaryColorInput'),
  countryIdeologyInput: document.querySelector('#countryIdeologyInput'),
  countryGovernmentInput: document.querySelector('#countryGovernmentInput'),
  countryDoctrineInput: document.querySelector('#countryDoctrineInput'),
  countryTraitInput: document.querySelector('#countryTraitInput'),
  countryFlagPatternInput: document.querySelector('#countryFlagPatternInput'),
  countryEmblemInput: document.querySelector('#countryEmblemInput')
};

const app = {
  state: createInitialState({ humanName: 'Gracz', customCountry: loadCountryProfile() }),
  customCountry: loadCountryProfile(),
  selectedProvinceId: null,
  selectedUnitId: null,
  orderMode: false,
  mode: 'local',
  view: 'hub',
  localHumanId: 'eagle',
  supabaseGameId: null,
  supabaseVersion: 0,
  supabaseUser: null,
  unsubscribe: null,
  saving: false,
  pendingPersist: false,
  queuedRemoteRow: null,
  lastPersistAt: 0,
  lastLocalSaveAt: 0,
  mapDrag: { active: false, panning: false, moved: false, suppressClickUntil: 0, pointerId: null, startX: 0, startY: 0, scrollLeft: 0, scrollTop: 0 },
  mapView: { scale: 1 },
  toastTimer: null
};

boot();

function boot() {
  const cfg = { ...DEFAULT_SUPABASE, ...loadConfig() };
  ui.supabaseUrlInput.value = cfg.url || '';
  ui.supabaseKeyInput.value = cfg.key || '';
  ui.nicknameInput.value = localStorage.getItem('warforge_nickname') || 'Dowódca';
  ui.setupCommanderInput.value = ui.nicknameInput.value;

  populateIdeologies();
  fillCountryEditor(app.customCountry);
  renderCountryCards();

  document.querySelector('#hubStartBtn').addEventListener('click', openSetupDialog);
  document.querySelector('#hubLoadBtn').addEventListener('click', () => loadLocal({ fromHub: true }));
  document.querySelector('#hubMultiplayerBtn').addEventListener('click', () => ui.multiplayerDialog.showModal());
  document.querySelector('#hubCountryBtn').addEventListener('click', () => ui.countryDialog.showModal());
  document.querySelector('#hubDocsBtn').addEventListener('click', () => document.querySelector('#howToPlayDialog').showModal());

  document.querySelector('#hubBtn').addEventListener('click', showHub);
  document.querySelector('#countryBtn').addEventListener('click', () => ui.countryDialog.showModal());
  document.querySelector('#newLocalBtn').addEventListener('click', openSetupDialog);
  document.querySelector('#saveLocalBtn').addEventListener('click', () => saveLocal(false));
  document.querySelector('#loadLocalBtn').addEventListener('click', () => loadLocal({ fromHub: false }));
  document.querySelector('#openMultiplayerBtn').addEventListener('click', () => ui.multiplayerDialog.showModal());
  document.querySelector('#connectSupabaseBtn').addEventListener('click', connectFromDialog);
  document.querySelector('#createRoomBtn').addEventListener('click', createRoomFromDialog);
  document.querySelector('#joinRoomBtn').addEventListener('click', joinRoomFromDialog);
  document.querySelector('#setupStartSoloBtn').addEventListener('click', startSoloGameFromSetup);
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
    ui.countryGovernmentInput,
    ui.countryDoctrineInput,
    ui.countryTraitInput,
    ui.countryFlagPatternInput,
    ui.countryEmblemInput
  ].forEach(el => el.addEventListener('input', refreshCountryPreview));

  initMapPan();
  showHub();
  render();
  window.setInterval(gameLoop, 1000);
}

function populateIdeologies() {
  ui.countryIdeologyInput.innerHTML = Object.entries(IDEOLOGIES)
    .map(([id, data]) => `<option value="${id}">${data.label}</option>`)
    .join('');
  ui.countryGovernmentInput.innerHTML = Object.entries(GOVERNMENTS)
    .map(([id, data]) => `<option value="${id}">${data.label}</option>`)
    .join('');
  ui.countryDoctrineInput.innerHTML = Object.entries(DOCTRINES)
    .map(([id, data]) => `<option value="${id}">${data.label}</option>`)
    .join('');
  ui.countryTraitInput.innerHTML = Object.entries(TRAITS)
    .map(([id, data]) => `<option value="${id}">${data.label}</option>`)
    .join('');
  const mapOptions = Object.entries(MAP_PRESETS)
    .map(([id, data]) => `<option value="${id}">${data.label} — ${data.factions} krajów / ${data.rows * data.cols} prowincji</option>`)
    .join('');
  ui.setupMapInput.innerHTML = mapOptions;
  ui.multiplayerMapInput.innerHTML = mapOptions;
  ui.setupMapInput.value = 'continental';
  ui.multiplayerMapInput.value = 'continental';
}

function initMapPan() {
  ui.mapRoot.tabIndex = 0;
  ui.mapRoot.setAttribute('aria-label', 'Mapa prowincji. Przeciągnij, aby przesunąć, użyj strzałek do ruchu i kółka myszy do zoomu.');

  ui.mapRoot.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    app.mapDrag.active = true;
    app.mapDrag.panning = false;
    app.mapDrag.moved = false;
    app.mapDrag.pointerId = event.pointerId;
    app.mapDrag.startX = event.clientX;
    app.mapDrag.startY = event.clientY;
    app.mapDrag.scrollLeft = ui.mapRoot.scrollLeft;
    app.mapDrag.scrollTop = ui.mapRoot.scrollTop;
  });

  ui.mapRoot.addEventListener('pointermove', event => {
    if (!app.mapDrag.active) return;

    const dx = event.clientX - app.mapDrag.startX;
    const dy = event.clientY - app.mapDrag.startY;

    if (!app.mapDrag.panning) {
      if (Math.hypot(dx, dy) < MAP_PAN_THRESHOLD) return;
      app.mapDrag.panning = true;
      app.mapDrag.moved = true;
      ui.mapRoot.classList.add('dragging');
      if (!ui.mapRoot.hasPointerCapture?.(event.pointerId)) {
        ui.mapRoot.setPointerCapture?.(event.pointerId);
      }
    }

    event.preventDefault();
    ui.mapRoot.scrollLeft = app.mapDrag.scrollLeft - dx;
    ui.mapRoot.scrollTop = app.mapDrag.scrollTop - dy;
  });

  const stopDrag = event => {
    if (!app.mapDrag.active) return;

    const wasPanning = app.mapDrag.panning;
    app.mapDrag.active = false;
    app.mapDrag.panning = false;
    app.mapDrag.pointerId = null;
    ui.mapRoot.classList.remove('dragging');

    if (event?.pointerId !== undefined && ui.mapRoot.hasPointerCapture?.(event.pointerId)) {
      ui.mapRoot.releasePointerCapture?.(event.pointerId);
    }

    if (wasPanning) {
      app.mapDrag.suppressClickUntil = Date.now() + 90;
      window.setTimeout(() => { app.mapDrag.moved = false; }, 110);
    } else {
      app.mapDrag.moved = false;
    }
  };

  ui.mapRoot.addEventListener('pointerup', stopDrag);
  ui.mapRoot.addEventListener('pointercancel', stopDrag);
  ui.mapRoot.addEventListener('mouseleave', stopDrag);

  ui.mapRoot.addEventListener('wheel', event => {
    if (app.view !== 'game') return;
    event.preventDefault();

    const direction = event.deltaY < 0 ? 1 : -1;
    const factor = direction > 0 ? MAP_ZOOM_STEP : 1 / MAP_ZOOM_STEP;
    const nextScale = clamp((app.mapView.scale || 1) * factor, MAP_ZOOM_MIN, MAP_ZOOM_MAX);
    zoomMapAt(nextScale, event.clientX, event.clientY);
  }, { passive: false });

  document.addEventListener('keydown', event => {
    if (app.view !== 'game' || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    if (isInteractiveElement(event.target) || isDialogOpen()) return;

    const step = MAP_KEYBOARD_PAN_STEP * (event.shiftKey ? 2 : 1);
    let left = 0;
    let top = 0;

    if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') left = -step;
    else if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') left = step;
    else if (event.key === 'ArrowUp' || event.key.toLowerCase() === 'w') top = -step;
    else if (event.key === 'ArrowDown' || event.key.toLowerCase() === 's') top = step;
    else return;

    event.preventDefault();
    ui.mapRoot.focus({ preventScroll: true });
    ui.mapRoot.scrollBy({ left, top, behavior: 'auto' });
  });
}

function isInteractiveElement(target) {
  return Boolean(target?.closest?.('input, textarea, select, button, dialog'));
}

function isDialogOpen() {
  return Boolean(document.querySelector('dialog[open]'));
}

function zoomMapAt(nextScale, clientX, clientY) {
  const currentScale = app.mapView.scale || 1;
  if (Math.abs(nextScale - currentScale) < 0.001) return;

  const rect = ui.mapRoot.getBoundingClientRect();
  const focalX = clientX - rect.left;
  const focalY = clientY - rect.top;
  const contentX = ui.mapRoot.scrollLeft + focalX;
  const contentY = ui.mapRoot.scrollTop + focalY;
  const ratio = nextScale / currentScale;

  app.mapView.scale = nextScale;
  applyMapScaleVariables();

  ui.mapRoot.scrollLeft = contentX * ratio - focalX;
  ui.mapRoot.scrollTop = contentY * ratio - focalY;
}

function applyMapScaleVariables(mapMeta = app.state.mapMeta ?? { width: 1000, height: 610 }) {
  const scale = app.mapView.scale || 1;
  ui.mapRoot.style.setProperty('--map-width', `${Math.round(mapMeta.width * scale)}px`);
  ui.mapRoot.style.setProperty('--map-height', `${Math.round(mapMeta.height * scale)}px`);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}


function openSetupDialog() {
  ui.setupCommanderInput.value = ui.nicknameInput.value || localStorage.getItem('warforge_nickname') || 'Dowódca';
  ui.setupCountrySummary.innerHTML = countryMiniCardHtml(app.customCountry);
  ui.setupDialog.showModal();
}

function setupConfigFromDialog() {
  return {
    mapId: ui.setupMapInput.value,
    pace: ui.setupPaceInput.value,
    difficulty: ui.setupDifficultyInput.value,
    startResources: ui.setupResourcesInput.value
  };
}

function multiplayerSetupConfigFromDialog() {
  return {
    ...setupConfigFromDialog(),
    mapId: ui.multiplayerMapInput.value || ui.setupMapInput.value
  };
}

function startSoloGameFromSetup() {
  ui.nicknameInput.value = ui.setupCommanderInput.value || ui.nicknameInput.value || 'Dowódca';
  localStorage.setItem('warforge_nickname', ui.nicknameInput.value);
  ui.setupDialog.close();
  startSoloGame(setupConfigFromDialog());
}

function startSoloGame(setup = setupConfigFromDialog()) {
  disconnectMultiplayer();
  setState(createInitialState({ humanName: ui.nicknameInput.value || 'Gracz', mode: 'local', customCountry: app.customCountry, setup }), 'local');
  app.localHumanId = 'eagle';
  showGame();
  toast('Nowa kampania real-time rozpoczęta. Twój kraj został użyty jako państwo gracza.');
}

function setState(nextState, mode = app.mode) {
  app.state = migrateState(nextState);
  app.mode = mode;
  if (mode === 'local') syncLocalHumanId();
  app.selectedProvinceId = null;
  app.selectedUnitId = null;
  app.orderMode = false;
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
  ui.turnInfo.textContent = win ? `Zwycięstwo: ${win.nickname}` : `${app.state.mapMeta?.label ?? 'Mapa'} · Dzień ${app.state.day} · real-time`;
  ui.playerInfo.textContent = controlled
    ? `Kontrolujesz: ${controlled.nickname} (${controlled.name})`
    : app.mode === 'multiplayer'
      ? 'Obserwator / brak wolnego państwa'
      : 'Tryb lokalny';
  ui.syncInfo.textContent = app.mode === 'multiplayer'
    ? `Online${app.state.roomCode ? ` · kod ${app.state.roomCode}` : ''}${isHostAuthority() ? ' · host symuluje świat' : ''}`
    : 'Singleplayer real-time';
  renderMap();
  renderQuickActions();
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
  if (ui.setupCountrySummary) ui.setupCountrySummary.innerHTML = countryMiniCardHtml(profile);
}

function renderMap() {
  const controlled = controlledPlayer();
  const targets = new Set(app.orderMode && app.selectedUnitId ? selectableTargets(app.state, app.selectedUnitId) : []);
  const mapMeta = app.state.mapMeta ?? { width: 1000, height: 610 };
  const prevScroll = { left: ui.mapRoot.scrollLeft, top: ui.mapRoot.scrollTop };
  const lines = [];
  for (const province of app.state.provinces) {
    for (const neighborId of province.neighbors) {
      if (province.id > neighborId) continue;
      const n = getProvince(app.state, neighborId);
      if (!n) continue;
      lines.push(`<line class="adjacency-line" x1="${province.x}" y1="${province.y}" x2="${n.x}" y2="${n.y}" />`);
    }
  }

  const provinces = app.state.provinces.map(province => {
    const owner = getPlayer(app.state, province.owner);
    const points = provincePolygonPoints(province).map(p => p.join(',')).join(' ');
    const unitCount = unitsAt(app.state, province.id).length;
    const status = provinceBattleStatus(app.state, province.id, controlled?.id);
    const damageOpacity = Math.min(0.62, (status.devastation ?? 0) / 130);
    const classNames = [
      'province',
      `terrain-${province.terrain}`,
      province.coastline ? 'coast-province' : '',
      `status-${status.kind}`,
      app.selectedProvinceId === province.id ? 'selected' : '',
      targets.has(province.id) ? 'target' : ''
    ].join(' ');
    const hpBarWidth = Math.max(0, Math.min(52, status.hp * 0.52));
    const damageLines = status.devastation > 12
      ? `<g class="province-cracks" opacity="${damageOpacity}">
          <path d="M ${province.x - 35} ${province.y - 28} l 16 12 l -8 10 l 20 16" />
          <path d="M ${province.x + 26} ${province.y - 30} l -12 15 l 10 7 l -18 18" />
        </g>`
      : '';
    return `<g class="${classNames}" data-province-id="${province.id}">
      <polygon points="${points}" fill="${cssColor(owner?.color, '#687089')}" opacity="0.88"></polygon>
      ${terrainMarkerSvg(province)}
      ${damageLines}
      <g class="province-badge" transform="translate(${province.x - 42} ${province.y - 44})">
        <rect width="84" height="18" rx="8"></rect>
        <text x="42" y="13">${escapeHtml(status.label)} · ${status.strength}</text>
      </g>
      <g class="province-hp" transform="translate(${province.x - 26} ${province.y + 24})">
        <rect class="hp-bg" width="52" height="6" rx="3"></rect>
        <rect class="hp-fill" width="${hpBarWidth}" height="6" rx="3"></rect>
      </g>
      ${status.devastation > 0 ? `<text class="province-damage" x="${province.x + 47}" y="${province.y + 35}">-${status.devastation}%</text>` : ''}
      <text class="province-name" x="${province.x}" y="${province.y - 15}">${escapeHtml(province.name)}</text>
      <text class="province-meta" x="${province.x}" y="${province.y + 12}">${province.capital ? '★ ' : ''}${terrainLabel(province.terrain)} · 🏭${province.buildings.industry} 🛡${province.buildings.fort}${unitCount ? ` · ⚔${unitCount}` : ''}</text>
    </g>`;
  }).join('');

  const unitChips = app.state.units.map(unit => {
    const province = getProvince(app.state, unit.location);
    if (!province) return '';
    const owner = getPlayer(app.state, unit.owner);
    const sameProvinceUnits = unitsAt(app.state, unit.location);
    const offsetIndex = sameProvinceUnits.findIndex(u => u.id === unit.id);
    const angle = (offsetIndex / Math.max(1, sameProvinceUnits.length)) * Math.PI * 2;
    const radius = sameProvinceUnits.length > 1 ? 25 : 0;
    const x = province.x + Math.cos(angle) * radius;
    const y = province.y + 42 + Math.sin(angle) * 12;
    const selected = app.selectedUnitId === unit.id ? 'selected' : '';
    const ready = isUnitReady(app.state, unit);
    const hpWidth = Math.max(0, Math.min(34, unit.hp * 0.34));
    return `<g class="unit-chip ${selected} ${ready ? 'ready' : 'cooldown'}" data-unit-id="${unit.id}" transform="translate(${x} ${y})">
      <circle r="19" fill="${cssColor(owner?.color, '#dddddd')}"></circle>
      <text y="1">${UNIT_TYPES[unit.type].short}</text>
      <rect class="unit-hp-bg" x="-17" y="22" width="34" height="5" rx="2.5"></rect>
      <rect class="unit-hp-fill" x="-17" y="22" width="${hpWidth}" height="5" rx="2.5"></rect>
      <title>${UNIT_TYPES[unit.type].label} · ${Math.max(0, Math.round(unit.hp))}%${ready ? ' · gotowa' : ` · ${readyInSeconds(app.state, unit)} s`}</title>
    </g>`;
  }).join('');

  applyMapScaleVariables(mapMeta);
  ui.mapRoot.innerHTML = `<svg viewBox="0 0 ${mapMeta.width} ${mapMeta.height}" role="img" aria-label="Mapa prowincji Warforge">
    <defs>
      <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <rect x="0" y="0" width="${mapMeta.width}" height="${mapMeta.height}" rx="22" fill="#10172a"></rect>
    ${mapLandscapeLayers(mapMeta)}
    ${lines.join('')}
    ${provinces}
    ${unitChips}
  </svg>`;

  ui.mapRoot.scrollLeft = prevScroll.left;
  ui.mapRoot.scrollTop = prevScroll.top;
  ui.mapRoot.querySelectorAll('[data-province-id]').forEach(el => el.addEventListener('click', event => {
    if (app.mapDrag.moved || Date.now() < app.mapDrag.suppressClickUntil) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onProvinceClick(el.dataset.provinceId);
  }));
  ui.mapRoot.querySelectorAll('[data-unit-id]').forEach(el => el.addEventListener('click', event => {
    event.stopPropagation();
    if (app.mapDrag.moved || Date.now() < app.mapDrag.suppressClickUntil) return;
    onUnitClick(el.dataset.unitId);
  }));
}


function renderQuickActions() {
  const player = controlledPlayer();
  const province = app.selectedProvinceId ? getProvince(app.state, app.selectedProvinceId) : null;
  const unit = app.selectedUnitId ? app.state.units.find(u => u.id === app.selectedUnitId) : null;
  const parts = [];

  if (province) {
    const owner = getPlayer(app.state, province.owner);
    const status = provinceBattleStatus(app.state, province.id, player?.id);
    parts.push(`<div class="quick-summary"><strong>${escapeHtml(province.name)}</strong><span>${escapeHtml(owner?.name ?? province.owner)}</span><span class="pill">${escapeHtml(status.label)} · siła ${status.strength}</span></div>`);
  } else {
    parts.push('<div class="quick-summary muted">Kliknij prowincję, aby zobaczyć szybkie akcje. Kliknięcie prowincji nie rusza już jednostki.</div>');
  }

  ui.quickActionsRoot.innerHTML = parts.join('');
  const actions = document.createElement('div');
  actions.className = 'quick-actions';

  if (player && province && province.owner === player.id) {
    for (const [key, building] of Object.entries(BUILDINGS)) {
      const cost = buildingCostForPlayer(player, key);
      actions.appendChild(actionButton(`Buduj ${building.label}`, () => perform(() => buildBuilding(app.state, province.id, key, player.id)), userCanAct()));
    }
    if ((province.devastation ?? 0) > 0) {
      actions.appendChild(actionButton(`Napraw szkody ${province.devastation}%`, () => perform(() => repairProvince(app.state, province.id, player.id)), userCanAct()));
    }
    for (const [key, unitDef] of Object.entries(UNIT_TYPES)) {
      const cost = unitCostForPlayer(player, key);
      const btn = actionButton(`+ ${unitDef.label}`, () => perform(() => recruitUnit(app.state, province.id, key, player.id)), userCanAct());
      btn.title = formatCost(cost);
      actions.appendChild(btn);
    }
  }

  if (player && unit && unit.owner === player.id) {
    const btn = actionButton(app.orderMode ? 'Anuluj rozkaz' : 'Wydaj rozkaz', () => {
      app.orderMode = !app.orderMode;
      render();
      if (app.orderMode) toast('Tryb rozkazu: kliknij sąsiednią prowincję, żeby wykonać marsz albo atak.');
    }, userCanAct() && isUnitReady(app.state, unit));
    btn.classList.add(app.orderMode ? 'danger' : 'accent-lite');
    actions.appendChild(btn);
  }

  if (!actions.children.length) {
    const hint = document.createElement('span');
    hint.className = 'muted quick-hint';
    hint.textContent = 'Szybkie akcje pojawią się po wybraniu własnej prowincji lub jednostki.';
    actions.appendChild(hint);
  }

  ui.quickActionsRoot.appendChild(actions);
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
  const status = provinceBattleStatus(app.state, province.id, controlledPlayer()?.id);
  ui.provinceRoot.innerHTML = `
    <div class="detail-row"><strong>${escapeHtml(province.name)}</strong><span>${province.capital ? 'Stolica' : terrainLabel(province.terrain)}</span></div>
    <div class="detail-row"><span>Właściciel</span><span>${flagIconHtml(owner?.flag)} ${escapeHtml(owner?.name ?? province.owner)}</span></div>
    <div class="detail-row"><span>Doktryna</span><span>${escapeHtml(IDEOLOGIES[owner?.ideology]?.label ?? '—')}</span></div>
    <div class="detail-row"><span>Obrona pola</span><span>${escapeHtml(status.label)} · siła ${status.strength}</span></div>
    <div class="detail-row"><span>Zniszczenia</span><span>${status.devastation}%</span></div>
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
    if ((province.devastation ?? 0) > 0) {
      buttons.push(actionButton(`Napraw szkody ${province.devastation}%`, () => perform(() => repairProvince(app.state, province.id, player.id)), canAct));
    }
    for (const [key, unitDef] of Object.entries(UNIT_TYPES)) {
      const cost = unitCostForPlayer(player, key);
      buttons.push(actionButton(`Rekrutuj ${unitDef.label} (${formatCost(cost)})`, () => perform(() => recruitUnit(app.state, province.id, key, player.id)), canAct));
    }
  }

  if (player && unit && unit.owner === player.id) {
    buttons.push(actionButton(app.orderMode ? 'Anuluj tryb rozkazu' : 'Wydaj rozkaz wybraną jednostką', () => {
      app.orderMode = !app.orderMode;
      render();
      if (app.orderMode) toast('Tryb rozkazu aktywny: kliknij sąsiednią prowincję na mapie.');
    }, canAct && isUnitReady(app.state, unit)));
    for (const targetId of (app.orderMode ? selectableTargets(app.state, unit.id) : [])) {
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
  if (app.orderMode && app.selectedUnitId && player) {
    const targets = selectableTargets(app.state, app.selectedUnitId);
    if (targets.includes(provinceId) && userCanAct()) {
      perform(() => moveOrAttack(app.state, app.selectedUnitId, provinceId, player.id));
      app.orderMode = false;
      return;
    }
    toast('To nie jest sąsiednia prowincja dla wybranej jednostki. Rozkaz anulowany.');
    app.orderMode = false;
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
  app.orderMode = false;
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
  if (app.mode === 'local') saveLocal(true);
  else persistIfNeeded({ force: true });
}

function gameLoop() {
  if (app.view !== 'game') return;
  if (app.mode === 'local') {
    const result = advanceRealtime(app.state, { includeBots: true });
    render();
    if (result.ok && result.data.changed) saveLocalIfNeeded();
    return;
  }
  if (app.mode === 'multiplayer' && isHostAuthority()) {
    const result = advanceRealtime(app.state, { includeBots: true });
    render();
    if (result.ok && result.data.changed) persistIfNeeded({ throttleMs: 6000 });
  } else {
    render();
  }
}

async function persistIfNeeded({ force = false, throttleMs = 0 } = {}) {
  if (app.mode !== 'multiplayer' || !app.supabaseGameId) return;
  const now = Date.now();
  if (app.saving) {
    if (force) app.pendingPersist = true;
    return;
  }
  if (!force && throttleMs && now - app.lastPersistAt < throttleMs) return;
  app.saving = true;
  app.lastPersistAt = now;
  try {
    const expected = app.supabaseVersion;
    const stateToSend = structuredClone(app.state);
    const row = await submitState(app.supabaseGameId, stateToSend, expected);
    if (row?.state) {
      applyRemoteGameRow(row, 'Zapisano stan w Supabase.');
    }
  } catch (error) {
    const message = String(error?.message ?? error);
    if (message.includes('version conflict')) {
      try {
        await refreshRemoteState('Konflikt wersji — pobrano nowszy stan pokoju.');
      } catch (refreshError) {
        const refreshMessage = String(refreshError?.message ?? refreshError);
        ui.multiplayerStatus.textContent = `Konflikt wersji i błąd odświeżania: ${refreshMessage}`;
        toast(`Konflikt wersji i błąd odświeżania: ${refreshMessage}`);
      }
    } else {
      ui.multiplayerStatus.textContent = `Błąd synchronizacji: ${message}`;
      toast(`Błąd synchronizacji: ${message}`);
    }
  } finally {
    app.saving = false;
    if (app.queuedRemoteRow && (!app.queuedRemoteRow.version || app.queuedRemoteRow.version > app.supabaseVersion)) {
      applyRemoteGameRow(app.queuedRemoteRow, 'Odebrano nowszy stan pokoju.');
      app.queuedRemoteRow = null;
    }
    const shouldPersistAgain = app.pendingPersist;
    app.pendingPersist = false;
    render();
    if (shouldPersistAgain) persistIfNeeded({ force: true });
  }
}

async function refreshRemoteState(message = 'Odświeżono stan pokoju.') {
  if (!app.supabaseGameId) return;
  const row = await fetchGame(app.supabaseGameId);
  if (row?.state) applyRemoteGameRow(row, message);
}

function applyRemoteGameRow(row, message = '') {
  app.supabaseVersion = row.version ?? app.supabaseVersion;
  const next = migrateState(row.state);
  next.roomCode = row.code ?? next.roomCode;
  app.state = next;
  if (message) ui.multiplayerStatus.textContent = message;
}


function userCanAct() {
  if (winner(app.state)) return false;
  return Boolean(controlledPlayer());
}

function controlledPlayer() {
  if (app.mode === 'local') return resolveLocalControlledPlayer();

  const userId = app.supabaseUser?.id;
  const controlled = getControlledPlayer(app.state, userId);
  if (controlled) return controlled;

  // Awaryjna ścieżka dla starszych pokoi/zapisów, w których host nie miał
  // jeszcze wpisanego controller w players[0]. Bez tego UI przechodziło
  // w tryb obserwatora: boty działały, ale gracz nie miał aktywnych akcji.
  if (userId && app.state.hostUserId === userId) {
    const hostPlayer = app.state.players.find(p => p.controller === userId && !p.eliminated)
      ?? app.state.players.find(p => p.type === 'human' && !p.eliminated)
      ?? null;
    return hostPlayer;
  }

  return null;
}

function resolveLocalControlledPlayer() {
  const exact = getPlayer(app.state, app.localHumanId);
  if (exact && exact.type !== 'open' && !exact.eliminated) return exact;

  const human = app.state.players.find(p => p.type === 'human' && !p.eliminated);
  if (human) {
    app.localHumanId = human.id;
    return human;
  }

  const playable = app.state.players.find(p => p.type !== 'bot' && p.type !== 'open' && !p.eliminated);
  if (playable) {
    app.localHumanId = playable.id;
    return playable;
  }

  return null;
}

function syncLocalHumanId() {
  resolveLocalControlledPlayer();
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
  if (Array.isArray(province.shape?.points) && province.shape.points.length >= 6) {
    return province.shape.points.map(([dx, dy]) => [Math.round(province.x + dx), Math.round(province.y + dy)]);
  }
  const seed = Number.parseInt(province.id.slice(1), 10) + 17;
  const angles = [-112, -70, -25, 18, 58, 104, 151, 205];
  return angles.map((deg, index) => {
    const wave = Math.sin((seed * 12.9898 + index * 78.233)) * 43758.5453;
    const noise = wave - Math.floor(wave);
    const rx = 55 + noise * 17;
    const ry = 42 + ((noise * 1.7) % 1) * 16;
    const angle = Math.PI / 180 * deg;
    return [
      Math.round(province.x + Math.cos(angle) * rx),
      Math.round(province.y + Math.sin(angle) * ry)
    ];
  });
}

function terrainMarkerSvg(province) {
  const markers = {
    forest: ['M-18 12 L-6 -12 L6 12 Z', 'M-4 15 L-4 7 L4 7 L4 15 Z'],
    hills: ['M-28 16 L-10 -10 L4 16 Z', 'M-4 16 L14 -16 L30 16 Z'],
    marsh: ['M-26 6 C-16 -2,-8 14,2 6 S18 14,28 6', 'M-22 17 C-10 9,-1 24,10 16 S20 21,27 15'],
    city: ['M-23 16 V-8 H-11 V16 Z', 'M-7 16 V-18 H7 V16 Z', 'M11 16 V-3 H23 V16 Z']
  };
  const paths = markers[province.terrain];
  if (!paths) return '';
  return `<g class="terrain-marker" transform="translate(${province.x} ${province.y + 3})">${paths.map(d => `<path d="${d}" />`).join('')}</g>`;
}

function mapLandscapeLayers(mapMeta) {
  const w = mapMeta.width;
  const h = mapMeta.height;
  const seed = Number(mapMeta.seed ?? 174921);
  const riverY = Math.round(h * (0.28 + pseudo(seed, 3) * 0.28));
  const riverBend = Math.round(h * (0.10 + pseudo(seed, 5) * 0.12));
  const coastX = Math.round(w * (0.06 + pseudo(seed, 7) * 0.08));
  const lakeX = Math.round(w * (0.62 + pseudo(seed, 11) * 0.18));
  const lakeY = Math.round(h * (0.22 + pseudo(seed, 13) * 0.5));
  return `
    <path class="coast-fill" d="M0 0 H${coastX + 40} C${coastX - 12} ${h * .16}, ${coastX + 78} ${h * .34}, ${coastX + 8} ${h * .52} S${coastX + 82} ${h * .80}, ${coastX + 24} ${h} H0 Z" />
    <path class="coast-line" d="M${coastX} 34 C${coastX + 56} ${h * .18}, ${coastX - 18} ${h * .34}, ${coastX + 48} ${h * .48} S${coastX - 12} ${h * .75}, ${coastX + 62} ${h - 46}" />
    <path class="river-line" d="M${Math.round(w * .12)} ${riverY} C${Math.round(w * .28)} ${riverY - riverBend}, ${Math.round(w * .38)} ${riverY + riverBend}, ${Math.round(w * .52)} ${riverY} S${Math.round(w * .74)} ${riverY - riverBend}, ${Math.round(w * .9)} ${riverY + riverBend * .45}" />
    <ellipse class="lake-fill" cx="${lakeX}" cy="${lakeY}" rx="${Math.round(w * .055)}" ry="${Math.round(h * .038)}" />
    <path class="mountain-shadow" d="M${Math.round(w * .22)} ${Math.round(h * .78)} C${Math.round(w * .35)} ${Math.round(h * .6)}, ${Math.round(w * .48)} ${Math.round(h * .88)}, ${Math.round(w * .63)} ${Math.round(h * .68)} S${Math.round(w * .82)} ${Math.round(h * .78)}, ${Math.round(w * .92)} ${Math.round(h * .61)}" />`;
}

function pseudo(seed, salt) {
  const x = Math.sin(seed * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function cssColor(value, fallback) {
  return normalizeColor(value, fallback);
}

function saveLocalIfNeeded() {
  const now = Date.now();
  if (now - app.lastLocalSaveAt < 5000) return;
  app.lastLocalSaveAt = now;
  saveLocal(true);
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
    const initialState = createInitialState({ mode: 'multiplayer', humanName: config.nickname, customCountry: app.customCountry, setup: multiplayerSetupConfigFromDialog() });
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
    if (app.saving) {
      app.queuedRemoteRow = row;
      return;
    }
    if (row.version && row.version < app.supabaseVersion) return;
    applyRemoteGameRow(row);
    render();
  });
}

function disconnectMultiplayer() {
  if (app.unsubscribe) app.unsubscribe();
  app.unsubscribe = null;
  app.supabaseGameId = null;
  app.supabaseVersion = 0;
  app.supabaseUser = null;
  app.queuedRemoteRow = null;
  app.pendingPersist = false;
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
  ui.countryGovernmentInput.value = next.government;
  ui.countryDoctrineInput.value = next.doctrine;
  ui.countryTraitInput.value = next.trait;
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
    government: ui.countryGovernmentInput.value,
    doctrine: ui.countryDoctrineInput.value,
    trait: ui.countryTraitInput.value,
    flagPattern: ui.countryFlagPatternInput.value,
    emblem: ui.countryEmblemInput.value
  });
}

function refreshCountryPreview() {
  const profile = currentEditorCountry();
  ui.countryPreview.innerHTML = countryCardHtml(profile, 'Podgląd kraju', false);
  ui.countryIdeologyDescription.innerHTML = [
    IDEOLOGIES[profile.ideology]?.description,
    GOVERNMENTS[profile.government]?.description,
    DOCTRINES[profile.doctrine]?.description,
    TRAITS[profile.trait]?.description
  ].filter(Boolean).map(escapeHtml).join('<br>');
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
      <div class="country-meta">${escapeHtml(GOVERNMENTS[profile.government]?.label ?? profile.government)} · ${escapeHtml(DOCTRINES[profile.doctrine]?.label ?? profile.doctrine)} · ${escapeHtml(TRAITS[profile.trait]?.label ?? profile.trait)}</div>
      <div class="country-meta">${escapeHtml(IDEOLOGIES[profile.ideology]?.description ?? '')}</div>
    </div>
  </article>`;
}

function countryMiniCardHtml(profile) {
  return `<article class="mini-country-card-inner">
    <div class="country-flag-mini">${flagSvgMarkup(profile.flag, 72, 44)}</div>
    <div>
      <div><strong>${escapeHtml(profile.name)}</strong></div>
      <div class="muted">${escapeHtml(IDEOLOGIES[profile.ideology]?.label ?? profile.ideology)} · ${escapeHtml(DOCTRINES[profile.doctrine]?.label ?? profile.doctrine)}</div>
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
  const government = GOVERNMENTS[profile?.government] ? profile.government : DEFAULT_CUSTOM_COUNTRY.government;
  const doctrine = DOCTRINES[profile?.doctrine] ? profile.doctrine : DEFAULT_CUSTOM_COUNTRY.doctrine;
  const trait = TRAITS[profile?.trait] ? profile.trait : DEFAULT_CUSTOM_COUNTRY.trait;
  const flagPattern = ['horizontal', 'vertical', 'cross', 'diagonal'].includes(profile?.flagPattern) ? profile.flagPattern : DEFAULT_CUSTOM_COUNTRY.flagPattern;
  const emblem = ['star', 'gear', 'sun', 'anchor', 'crown', 'hammer', 'eagle', 'none'].includes(profile?.emblem) ? profile.emblem : DEFAULT_CUSTOM_COUNTRY.emblem;
  return {
    name: safeName,
    color,
    secondaryColor,
    ideology,
    government,
    doctrine,
    trait,
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
  const safeFallback = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(String(fallback || '').trim())
    ? String(fallback).trim().toLowerCase()
    : '#6c7a9c';
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(text) ? text.toLowerCase() : safeFallback;
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
