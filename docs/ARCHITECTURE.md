# Architektura

## Frontend

Aplikacja jest statyczna: `index.html`, `src/styles.css`, `src/app.js`, `src/engine.js` i `src/supabaseClient.js`.

- `engine.js` zawiera reguły gry: mapa, zasoby, jednostki, walka, boty, real-time tick.
- `app.js` zawiera UI, hub, pętlę gry i synchronizację.
- `supabaseClient.js` zawiera połączenie z Supabase, tworzenie pokoju, dołączanie do pokoju i Realtime.

## Real-time

Gra nie używa tur. Stan ma pola:

- `gameTimeMs`
- `day`
- `realtime.lastWallAt`
- `realtime.lastEconomyAt`
- `realtime.lastAiAt`

W singleplayerze lokalna przeglądarka rozwija świat co sekundę. W multiplayerze robi to host pokoju.

## Multiplayer

Tabela `games` przechowuje cały stan gry jako JSONB. Tabela `game_members` przechowuje uczestników i ich państwa.

Dołączanie używa funkcji SQL:

```sql
public.join_game_room(p_code text, p_nickname text)
```

Funkcja blokuje wiersz gry przez `FOR UPDATE`, znajduje pierwszego gracza z `type = 'open'`, zmienia go na `human` i przypisuje `controller = auth.uid()`. To naprawia problem braku przypisanego kraju u graczy dołączających.

## Bezpieczeństwo

Frontend używa wyłącznie publicznego klucza publishable/anon. Nie wolno umieszczać w kodzie klucza `service_role`.

RLS i RPC ograniczają dostęp do pokoi oraz sprawdzają, czy zapis stanu wykonuje członek gry. MVP nadal nie jest odporne na cheaty po stronie klienta.
