# Warforge Provinces

Turowa gra strategiczna inspirowana skalą **Call of War / Hearts of Iron IV**, przygotowana pod darmowy, statyczny stack:

- **GitHub Pages** jako hosting frontendu,
- **Supabase** jako Auth, Postgres, RPC i Realtime,
- bez bundlera i bez backendu Node — wszystko działa z plików statycznych.

To jest grywalne MVP: mapa prowincji, rozbudowa przemysłu/fortów/lotnisk, zasoby, rekrutacja, ruch, walka, boty, zapis lokalny i prosty multiplayer z pokojami.

## Funkcje w tej wersji

- 20 fikcyjnych prowincji na mapie heksowej.
- 4 frakcje, stolice, teren i sąsiedztwo prowincji.
- Zasoby: pieniądze, rekruci, stal, ropa.
- Budynki: przemysł, forty, lotniska.
- Jednostki: piechota, artyleria, czołgi.
- Turowa gospodarka i walka.
- Boty wykonujące rozbudowę, rekrutację i ataki.
- Singleplayer w `localStorage`.
- Multiplayer przez Supabase z anonimowym logowaniem, pokojem i Realtime.

## Szybki start lokalny

W folderze projektu uruchom serwer statyczny:

```bash
python3 -m http.server 5173
```

Otwórz:

```text
http://localhost:5173
```

Możesz też otworzyć `index.html` bez serwera, ale serwer lokalny lepiej obsługuje moduły ES.

## Wdrożenie na GitHub Pages

1. Utwórz repozytorium na GitHubie, np. `warforge-provinces`.
2. Wgraj zawartość tego folderu do głównego katalogu repozytorium.
3. W GitHubie wejdź w **Settings → Pages**.
4. Ustaw **Source: Deploy from a branch**.
5. Wybierz branch `main` i folder `/root`.
6. Po zapisie GitHub Pages opublikuje `index.html`.

## Konfiguracja Supabase

1. Utwórz projekt w Supabase.
2. Włącz anonimowe logowanie: **Authentication → Sign In / Providers → Anonymous sign-ins**.
3. Wejdź w **SQL Editor** i uruchom cały plik:

```text
supabase/schema.sql
```

4. Wejdź w **Project Settings → API** i skopiuj:
   - Project URL,
   - publiczny `anon` / `publishable` key.
5. W grze kliknij **Multiplayer** i wklej te dane.
6. Kliknij **Połącz**, potem **Utwórz pokój** albo **Dołącz do pokoju**.

## Jak grać

1. Kliknij prowincję.
2. Jeżeli należy do aktualnego gracza, możesz budować i rekrutować.
3. Kliknij jednostkę, potem sąsiednią prowincję, aby wykonać marsz lub atak.
4. Kliknij **Zakończ turę**.
5. Boty w singleplayerze wykonują swoje tury automatycznie.

## Multiplayer — ważne ograniczenia MVP

Ta wersja jest client-authoritative: logika gry działa w przeglądarce, a Supabase zapisuje aktualny stan. RLS ogranicza dostęp do pokojów i wymaga logowania, ale nie jest to jeszcze system anty-cheat klasy produkcyjnej. Do publicznej gry rankingowej trzeba przenieść rozstrzyganie tur do bezpiecznej warstwy serwerowej, np. Supabase Edge Functions albo własny backend.

## Struktura projektu

```text
.
├── index.html
├── assets/
│   └── favicon.svg
├── src/
│   ├── app.js             # UI, wejście aplikacji, multiplayer flow
│   ├── engine.js          # zasady gry, ekonomia, walka, AI
│   ├── styles.css         # wygląd gry
│   └── supabaseClient.js  # Supabase Auth, RPC, Realtime
└── supabase/
    └── schema.sql         # tabele, RLS, RPC, Realtime publication
```

## Następne kroki rozwoju

- Mgła wojny i rozpoznanie.
- Drzewko technologii.
- Dyplomacja i pakty.
- Kolejka produkcji i czas budowy zamiast natychmiastowych akcji.
- Rozkazy równoczesne i rozstrzyganie fazy po kliknięciu „koniec tury”.
- Serwerowa walidacja ruchów, jeżeli gra ma być publiczna i konkurencyjna.
- Edytor mapy oraz import większych map.
