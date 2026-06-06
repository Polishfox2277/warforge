const STORAGE_KEY = 'warforge_supabase_config';
let supabase = null;
let loadedCreateClient = null;

export function saveConfig(config) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function loadConfig() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}


const ALLOWED = {
  ideology: ['industrialist', 'militarist', 'collectivist', 'technocrat'],
  government: ['republic', 'monarchy', 'council', 'directorate'],
  doctrine: ['balanced', 'maneuver', 'firepower', 'defense'],
  trait: ['engineers', 'miners', 'oilfields', 'traders', 'patriots'],
  flagPattern: ['horizontal', 'vertical', 'cross', 'diagonal'],
  emblem: ['star', 'gear', 'sun', 'anchor', 'crown', 'hammer', 'eagle', 'none']
};

function safeText(value, fallback = 'Dowódca', max = 40) {
  const text = String(value ?? '')
    .replace(/[\u0000-\u001f\u007f<>]/g, '')
    .trim()
    .slice(0, max);
  return text || fallback;
}

function safeColor(value, fallback) {
  const text = String(value ?? '').trim();
  const safeFallback = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(String(fallback ?? '').trim())
    ? String(fallback).trim().toLowerCase()
    : '#7b5cff';
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(text) ? text.toLowerCase() : safeFallback;
}

function safeEnum(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

function safeFlag(countryProfile, color, secondaryColor) {
  const raw = countryProfile?.flag ?? {};
  return {
    pattern: safeEnum(raw.pattern ?? countryProfile?.flagPattern, ALLOWED.flagPattern, 'horizontal'),
    emblem: safeEnum(raw.emblem ?? countryProfile?.emblem, ALLOWED.emblem, 'star'),
    primary: safeColor(raw.primary ?? color, color),
    secondary: safeColor(raw.secondary ?? secondaryColor, secondaryColor)
  };
}

export async function connect(config) {
  const finalConfig = { ...loadConfig(), ...config };
  if (!finalConfig.url || !finalConfig.key) throw new Error('Podaj URL projektu i publiczny klucz Supabase.');
  saveConfig(finalConfig);
  if (!loadedCreateClient) {
    const mod = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm');
    loadedCreateClient = mod.createClient;
  }
  supabase = loadedCreateClient(finalConfig.url, finalConfig.key, {
    auth: { persistSession: true, autoRefreshToken: true }
  });
  return supabase;
}

export function client() {
  if (!supabase) throw new Error('Najpierw połącz Supabase.');
  return supabase;
}

export async function ensureAnonymousSession(nickname) {
  const sb = client();
  let { data: sessionData } = await sb.auth.getSession();
  if (!sessionData.session) {
    const { data, error } = await sb.auth.signInAnonymously({ options: { data: { nickname } } });
    if (error) throw error;
    sessionData = { session: data.session };
  }
  if (nickname) {
    await sb.auth.updateUser({ data: { nickname } }).catch(() => null);
  }
  return sessionData.session.user;
}

export async function createRoom({ name, nickname, initialState }) {
  const sb = client();
  const safeNickname = safeText(nickname, 'Host', 40);
  const user = await ensureAnonymousSession(safeNickname);
  initialState.hostUserId = user.id;
  initialState.players[0].controller = user.id;
  initialState.players[0].nickname = safeNickname;
  const { data: game, error } = await sb
    .from('games')
    .insert({ name: safeText(name, 'Warforge room', 60), host_user: user.id, status: 'running', state: initialState })
    .select('id, code, state, version')
    .single();
  if (error) throw error;
  const { error: memberError } = await sb
    .from('game_members')
    .insert({ game_id: game.id, user_id: user.id, nickname: safeNickname, faction_id: 'eagle', is_host: true });
  if (memberError) throw memberError;
  return { game, user };
}

export async function joinRoom({ code, nickname, countryProfile }) {
  const sb = client();
  const user = await ensureAnonymousSession(nickname);
  const normalized = code.trim().toUpperCase();
  if (!normalized) throw new Error('Wpisz kod pokoju.');

  const color = safeColor(countryProfile?.color, '#7b5cff');
  const secondaryColor = safeColor(countryProfile?.secondaryColor, '#f2b84b');
  const payload = {
    p_code: normalized,
    p_nickname: safeText(nickname, 'Dowódca', 40),
    p_country_name: safeText(countryProfile?.name, 'Nowe Państwo', 40),
    p_color: color,
    p_secondary_color: secondaryColor,
    p_ideology: safeEnum(countryProfile?.ideology, ALLOWED.ideology, 'industrialist'),
    p_government: safeEnum(countryProfile?.government, ALLOWED.government, 'republic'),
    p_doctrine: safeEnum(countryProfile?.doctrine, ALLOWED.doctrine, 'balanced'),
    p_trait: safeEnum(countryProfile?.trait, ALLOWED.trait, 'engineers'),
    p_flag: safeFlag(countryProfile, color, secondaryColor)
  };

  const { data: game, error } = await sb.rpc('join_game_room', payload);
  if (error) throw error;

  const faction = game.state?.players?.find(p => p.controller === user.id);
  return { game, user, factionId: faction?.id ?? 'spectator' };
}

export async function submitState(gameId, state, expectedVersion) {
  const sb = client();
  const { data, error } = await sb.rpc('submit_game_state', {
    p_game_id: gameId,
    p_state: state,
    p_expected_version: expectedVersion
  });
  if (error) throw error;
  return data;
}

export async function fetchGame(gameId) {
  const sb = client();
  const { data, error } = await sb
    .from('games')
    .select('id, code, state, version')
    .eq('id', gameId)
    .single();
  if (error) throw error;
  return data;
}

export function subscribeGame(gameId, onChange) {

  const sb = client();
  const channel = sb
    .channel(`warforge-game-${gameId}`)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${gameId}` }, payload => onChange(payload.new))
    .subscribe();
  return () => sb.removeChannel(channel);
}
