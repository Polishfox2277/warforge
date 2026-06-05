# Warforge Provinces — custom countries update

Statyczna gra strategiczna inspirowana Call of War / Hearts of Iron, przygotowana pod GitHub Pages + Supabase Free.

## Co dodano w tej wersji

- Kreator własnego kraju w menu głównym.
- Gracz może ustawić:
  - nazwę kraju,
  - kolor na mapie,
  - kolor dodatkowy,
  - ideologię z gameplayowymi buffami,
  - wzór flagi,
  - emblemat flagi.
- Konfiguracja kraju jest zapisywana w `localStorage`.
- W singleplayerze własny kraj staje się państwem gracza.
- W multiplayerze host tworzy pokój własnym krajem, a gracz dołączający nadpisuje pierwszy wolny slot swoim krajem zapisanym lokalnie.
- Kraje botów są losowane z gotowej puli presetów.
- Zachowano wcześniejsze poprawki:
  - real-time,
  - naprawa wiecznego odpoczynku jednostek,
  - słabsze forty,
  - nieregularne prowincje zamiast czystych hexów,
  - hub/menu główne.

## Ideologie i buffy

- **Industrializm** — +15% dochodu 💰 i ⚙️, -10% kosztu przemysłu.
- **Militaryzm** — +10% siły ataku, -10% cooldownu jednostek, -5% kosztów rekrutacji.
- **Kolektywizm** — +18% dochodu 👥, +6% obrony, -12% kosztu piechoty.
- **Technokracja** — +10% dochodu 🛢️, -12% kosztu artylerii i czołgów, -10% kosztu lotnisk.

## Uruchomienie lokalne

```bash
cd warforge-mvp-custom-country
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

**Ważne:** uruchom ponownie cały plik:

```text
supabase/schema.sql
```

Dlaczego? Ponieważ funkcja RPC `join_game_room` ma nową sygnaturę i przyjmuje dane własnego kraju gracza.

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

1. Otwórz grę i ustaw własny kraj w opcji **Stwórz własny kraj**.
2. Kliknij **Multiplayer → Utwórz pokój**.
3. Skopiuj kod pokoju.
4. Otwórz grę w innej przeglądarce, profilu albo trybie incognito.
5. Tam również ustaw inny własny kraj.
6. Kliknij **Multiplayer**, wpisz kod pokoju i kliknij **Dołącz do pokoju**.
7. Drugi gracz powinien dostać własne państwo z własną nazwą, flagą, ideologią i kolorem.

## Ograniczenie MVP

Ta wersja działa na darmowym, statycznym stacku bez własnego serwera gry. Host przeglądarkowy nadal jest autorytetem symulacji świata. Do produkcyjnego multiplayera z twardą walidacją nadal przydałby się osobny backend albo Edge Functions.
