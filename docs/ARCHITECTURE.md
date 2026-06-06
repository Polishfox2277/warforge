# Architektura

## Frontend

Aplikacja jest statyczna: `index.html`, `src/styles.css`, `src/app.js`, `src/engine.js` i `src/supabaseClient.js`.

- `engine.js` zawiera reguły gry: generowanie organicznej mapy, zasoby, jednostki, walka, boty i real-time tick.
- `app.js` zawiera UI, hub, pętlę gry, drag-panning mapy i synchronizację.
- `supabaseClient.js` zawiera połączenie z Supabase, tworzenie pokoju, dołączanie, pobieranie stanu i Realtime.

## Mapa

Mapa jest generowana z seedu zapisanego w `state.setup.mapSeed` oraz `state.mapMeta.seed`. Dzięki temu nowa kampania wygląda inaczej, ale po zapisie/wczytaniu i w multiplayerze wszyscy widzą ten sam układ.

Prowincje mają:

- logiczne pozycje `row`/`col` dla sąsiedztwa i AI,
- wizualne pozycje `x`/`y` z organicznym jitterem,
- `shape.points`, czyli nieregularny polygon relatywny do centrum prowincji,
- `terrain`, `coastline`, `resources`, `buildings`.

## Real-time

Gra nie używa tur. Stan ma pola:

- `gameTimeMs`
- `day`
- `realtime.lastWallAt`
- `realtime.lastEconomyAt`
- `realtime.lastAiAt`

W singleplayerze lokalna przeglądarka rozwija świat co sekundę. W multiplayerze robi to host pokoju. Sam upływ czasu nie zwiększa już wersji stanu; zapis następuje przy realnej zmianie ekonomii, AI lub po akcji gracza.

## Multiplayer

Tabela `games` przechowuje cały stan gry jako JSONB. Tabela `game_members` przechowuje uczestników i ich państwa.

Dołączanie używa funkcji SQL:

```sql
public.join_game_room(
  p_code text,
  p_nickname text,
  p_country_name text,
  p_color text,
  p_secondary_color text,
  p_ideology text,
  p_government text,
  p_doctrine text,
  p_trait text,
  p_flag jsonb
)
```

Funkcja blokuje wiersz gry przez `FOR UPDATE`, znajduje pierwszego gracza z `type = 'open'`, zmienia go na `human` i przypisuje `controller = auth.uid()`.

## Synchronizacja

`submit_game_state()` używa `p_expected_version`. Gdy wersja nie pasuje, frontend pobiera aktualny rekord `games` i nie zostaje ze starym lokalnym stanem. Update z Realtime otrzymany podczas zapisu jest buforowany w `queuedRemoteRow` i stosowany po zakończeniu zapisu.

## Bezpieczeństwo

Frontend używa wyłącznie publicznego klucza publishable/anon. Nie wolno umieszczać w kodzie klucza `service_role`.

Warstwy ochrony w tej wersji:

- frontend waliduje payload kraju przed RPC,
- SQL waliduje nazwy, kolory, enumy i flagę w `join_game_room()`,
- `migrateState()` czyści stan pobrany z localStorage/Supabase,
- RLS dla `game_members` nie pokazuje już członków wszystkich aktywnych pokoi,
- `submit_game_state()` odrzuca nieobiektowy lub zbyt duży stan JSON.

MVP nadal nie jest w pełni odporne na cheaty, bo klienci zapisują cały stan. Produkcyjny multiplayer powinien przejść na walidowane komendy po stronie backendu lub Edge Functions.
