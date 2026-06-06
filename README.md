# Warforge Provinces — organic maps, drag map and sync fix

Statyczna gra strategiczna real-time pod GitHub Pages + Supabase Free.

## Co zmieniono w tej wersji

### 1. Overhaul mapy

Mapa nie jest już sztywną regularną siatką wizualną. Każda nowa kampania dostaje seed i generuje:

- organicznie przesunięte centra prowincji,
- nieregularne kształty prowincji,
- mniej prostokątne granice państw,
- różniejsze rozmieszczenie miast, lasów, wzgórz i bagien,
- warstwy krajobrazu: wybrzeże, rzekę, jezioro i cień górski.

Dalej zachowana jest logika sąsiedztwa heksowego, więc balans i AI nie tracą stabilności.

### 2. Poruszanie się po mapie myszką

Mapa ma teraz własny viewport. Przeciągnij ją myszką, żeby przesuwać widok. Kliknięcie prowincji nadal tylko wybiera prowincję, a ruch lub atak jednostką nadal wymaga przycisku **Wydaj rozkaz**.

### 3. Poprawki synchronizacji Supabase

- host zapisuje stan rzadziej,
- sam upływ czasu nie wymusza zapisu JSON-a co sekundę,
- konflikt wersji powoduje automatyczne pobranie aktualnego stanu pokoju,
- update z Realtime, który przyjdzie podczas zapisu, jest buforowany zamiast ignorowany,
- lokalny zapis singleplayera jest throttlowany i akcje gracza zapisują się od razu.

### 4. Poprawki bezpieczeństwa danych gracza

- kolory, flagi, nazwy i enumy kraju są normalizowane po stronie frontendu,
- `migrateState()` czyści kolory i podstawowe pola stanu pobranego z Supabase,
- SQL RPC `join_game_room()` waliduje kolory, flagę, enumy i teksty,
- polityka `game_members_select_related` nie ujawnia już członków wszystkich aktywnych pokoi,
- `submit_game_state()` odrzuca nieobiektowy lub zbyt duży JSON stanu.

### 5. Zachowany rebalance i edytor państwa

Dalej są dostępne:

- trzy mapy: **Pogranicze**, **Kontynent Valdoru**, **Wielka Wojna**,
- do 8 krajów,
- edytor kraju z flagą, ideologią, ustrojem, doktryną i cechą narodową,
- łagodniejszy balans botów,
- szybkie akcje nad mapą,
- paski HP, etykiety obrony i zniszczenia prowincji.

## Uruchomienie lokalne

```bash
cd warforge-mvp-balance-maps-country-v2-visible
python3 -m http.server 5173
```

Otwórz:

```text
http://localhost:5173
```

## Supabase

Uruchom ponownie plik:

```text
supabase/schema.sql
```

W Supabase nadal musi być włączone:

```text
Authentication → Anonymous sign-ins → Enable
```

## GitHub Pages

1. Wgraj zawartość folderu do repozytorium.
2. GitHub → Settings → Pages.
3. Deploy from a branch.
4. Branch `main`, folder `/root`.

## Znane ograniczenie MVP

Multiplayer nadal zapisuje pełny stan gry jako JSONB. Ta wersja zmniejsza ryzyko XSS i problemów synchronizacji, ale pełna odporność na cheaty wymaga następnego kroku architektonicznego: walidowanych komend gracza po stronie backendu albo Supabase Edge Functions.
