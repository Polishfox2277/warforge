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

export async function connect(config) {
  const finalConfig = { ...loadConfig(), ...config };
  if (!finalConfig.url || !finalConfig.key) throw new Error('Podaj URL projektu i publiczny klucz Supabase.');
  saveConfig(finalConfig);
  if (!loadedCreateClient) {
    const mod = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
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
  const user = await ensureAnonymousSession(nickname);
  initialState.players[0].controller = user.id;
  initialState.players[0].nickname = nickname || 'Host';
  const { data: game, error } = await sb
    .from('games')
    .insert({ name, host_user: user.id, state: initialState })
    .select('id, code, state, version')
    .single();
  if (error) throw error;
  const { error: memberError } = await sb
    .from('game_members')
    .insert({ game_id: game.id, user_id: user.id, nickname, faction_id: 'eagle', is_host: true });
  if (memberError) throw memberError;
  return { game, user };
}

export async function joinRoom({ code, nickname }) {
  const sb = client();
  const user = await ensureAnonymousSession(nickname);
  const normalized = code.trim().toUpperCase();
  const { data: game, error } = await sb
    .from('games')
    .select('id, code, state, version')
    .eq('code', normalized)
    .single();
  if (error) throw error;

  const state = structuredClone(game.state);
  const openSlot = state.players.find(p => p.type === 'open');
  const factionId = openSlot?.id ?? 'spectator';
  const { error: memberError } = await sb
    .from('game_members')
    .upsert({ game_id: game.id, user_id: user.id, nickname, faction_id: factionId, is_host: false }, { onConflict: 'game_id,user_id' });
  if (memberError) throw memberError;

  return { game, user, factionId };
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

export function subscribeGame(gameId, onChange) {
  const sb = client();
  const channel = sb
    .channel(`warforge-game-${gameId}`)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${gameId}` }, payload => onChange(payload.new))
    .subscribe();
  return () => sb.removeChannel(channel);
}
