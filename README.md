# Warforge Provinces — MVP real-time

Statyczna gra strategiczna inspirowana Call of War / Hearts of Iron, przygotowana pod GitHub Pages + Supabase Free.

## Co zmieniono w tej wersji

- Dodano hub/menu główne z opcjami: Zacznij grę solo, Multiplayer, Wczytaj zapis i Jak grać.
- Gra działa w czasie rzeczywistym: nie ma ręcznych tur.
- Zasoby są generowane co kilka sekund.
- Jednostki mają cooldown po ruchu lub ataku.
- Boty wykonują decyzje automatycznie.
- Multiplayer przypisuje dołączającego gracza do pierwszego wolnego państwa.
- Przypisanie kraju odbywa się atomowo w Supabase przez RPC `join_game_room`, więc dwóch graczy nie powinno dostać tego samego państwa.
- Host multiplayera symuluje świat real-time i zapisuje stan w Supabase.

## Uruchomienie lokalne

```bash
cd warforge-mvp-configured
python3 -m http.server 5173
```

Otwórz:

```text
http://localhost:5173
```

## GitHub Pages

1. Wgraj zawartość tego folderu do repozytorium GitHub.
2. Wejdź w **Settings → Pages**.
3. Wybierz **Deploy from a branch**.
4. Ustaw branch `main` i folder `/root`.
5. Otwórz opublikowany adres Pages.

## Supabase

W projekcie Supabase uruchom plik:

```text
supabase/schema.sql
```

Potem włącz anonimowe logowanie:

```text
Authentication → Sign In / Providers → Anonymous sign-ins → Enable
```

Projekt jest już skonfigurowany pod:

```text
Project URL:
https://mcldlpljgcitixwbnjfb.supabase.co

Public key:
sb_publishable_8fKwAVcLPTj8TYWt_lHEpQ_Lp3KD1DI
```

## Jak testować multiplayer

1. Otwórz grę w jednej przeglądarce.
2. Kliknij **Multiplayer → Utwórz pokój**.
3. Skopiuj kod pokoju.
4. Otwórz grę w innej przeglądarce, profilu albo trybie incognito.
5. Kliknij **Multiplayer**, wpisz kod pokoju i kliknij **Dołącz do pokoju**.
6. Dołączający gracz powinien dostać własne państwo, np. Liga Rzeczna, Stepowe Chanaty albo Korona Południa.

## Ważne ograniczenie MVP

Ta wersja działa na darmowym, statycznym stacku bez własnego serwera gry. Oznacza to, że host przeglądarkowy jest autorytetem symulacji świata. Do produkcyjnego, rankingowego multiplayera potrzebny byłby osobny backend albo Supabase Edge Functions walidujące rozkazy.
