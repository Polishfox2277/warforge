# Architektura

## Cel

Gra ma działać za darmo na GitHub Pages + Supabase. GitHub Pages serwuje tylko statyczne pliki, więc aplikacja nie zakłada serwera Node. Supabase pełni rolę bazy, autoryzacji i kanału synchronizacji.

## Frontend

- `index.html` ładuje moduł ES `src/app.js`.
- `src/engine.js` jest czystą logiką gry: nie zna DOM ani Supabase.
- `src/supabaseClient.js` izoluje warstwę sieciową.
- Mapa SVG jest renderowana dynamicznie z danych prowincji.

## Stan gry

Cały stan rozgrywki jest przechowywany jako JSON:

- tura,
- aktualny gracz,
- prowincje,
- jednostki,
- gracze,
- log zdarzeń.

W singleplayerze JSON trafia do `localStorage`. W multiplayerze JSON trafia do `public.games.state` w Supabase.

## Supabase

- `games` przechowuje kod pokoju, hosta, JSON stanu i wersję optymistyczną.
- `game_members` przechowuje członkostwo użytkowników w pokojach.
- `submit_game_state` sprawdza członkostwo i wersję, potem zapisuje nowy stan.
- Realtime wysyła aktualizacje wiersza `games` do podłączonych klientów.

## Model bezpieczeństwa

RLS chroni odczyt i dołączanie do pokoi. Publiczny klucz Supabase może być w przeglądarce, ale nigdy nie wolno umieszczać tam `service_role`.

MVP nie jest odporne na cheaty, bo klient wysyła gotowy stan. Wersja produkcyjna powinna wysyłać rozkazy, a walidacja i symulacja powinny odbywać się po stronie zaufanej.
