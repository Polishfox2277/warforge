# Warforge Provinces — rebalance, maps and expanded country editor

Statyczna gra strategiczna real-time pod GitHub Pages + Supabase Free.

## Co zmieniono w tej wersji

### 1. Duży rebalance gry

Poprzednia wersja była zbyt trudna, bo boty działały szybko, zbyt często rekrutowały i atakowały, a obrona pól była za wysoka. Ta wersja jest celowo łagodniejsza.

Najważniejsze zmiany:

- większe zasoby startowe gracza,
- mniejsze startowe zasoby botów na normalnym poziomie,
- wolniejsze i mniej agresywne AI,
- boty nie atakują już każdego frontu naraz,
- puste prowincje mają realnie `PUSTA · 0`,
- obniżona obrona terenu, garnizonów i fortów,
- jednostki są trochę skuteczniejsze w ataku,
- gospodarka daje trochę większy dochód na tick,
- limity lokalnych jednostek zmniejszają spam armii w jednym polu.

Aktualna filozofia balansu:

```text
Łatwy    = tryb nauki i testów
Normalny = grywalny standard, gracz ma czas reagować
Trudny   = boty mają lekką przewagę, ale nie powinny być absurdalne
```

### 2. Trzy mapy do wyboru

W setupie gry jest wybór mapy:

- **Pogranicze** — 4 kraje / 20 prowincji
- **Kontynent Valdoru** — 6 krajów / 48 prowincji
- **Wielka Wojna** — 8 krajów / 80 prowincji

W multiplayerze host wybiera mapę pokoju w oknie multiplayer.

### 3. Więcej krajów

Silnik obsługuje teraz do 8 krajów na mapie.

Boty są losowane z większej puli gotowych państw. Każde ma:
- nazwę,
- kolor,
- flagę,
- ideologię,
- ustrój,
- doktrynę,
- cechę narodową.

### 4. Dokładniejszy edytor państwa

Kreator kraju ma teraz więcej elementów:

- nazwa kraju,
- kolor mapy,
- kolor dodatkowy,
- ideologia,
- ustrój,
- doktryna wojskowa,
- cecha narodowa,
- układ flagi,
- emblemat flagi.

Wszystko zapisuje się w `localStorage`.

### 5. Nowe warstwy buffów państwa

Państwo ma teraz kilka niezależnych warstw:

#### Ideologia
Przykłady:
- Industrializm
- Militaryzm
- Kolektywizm
- Technokracja

#### Ustrój
Przykłady:
- Republika
- Monarchia
- Rada Ludowa
- Dyrektoriat

#### Doktryna wojskowa
Przykłady:
- Zrównoważona
- Manewrowa
- Siła ognia
- Obrona głęboka

#### Cecha narodowa
Przykłady:
- Korpus inżynieryjny
- Zagłębia rudne
- Pola naftowe
- Kupcy i banki
- Patriotyczna mobilizacja

### 6. Zachowane poprawki ergonomii

Nadal działa bezpieczniejsze sterowanie:

1. klik prowincji tylko wybiera prowincję,
2. klik jednostki tylko wybiera jednostkę,
3. ruch lub atak wymaga przycisku **Wydaj rozkaz**,
4. dopiero potem kliknięcie sąsiedniego pola wykonuje rozkaz.

Nadal są też:
- szybkie akcje nad mapą,
- etykiety obrony pól,
- paski HP,
- zniszczenia prowincji,
- naprawy szkód.

## Uruchomienie lokalne

```bash
cd warforge-mvp-balance-maps-country
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

Jest to ważne, bo multiplayer dostał nowe pola kraju:

- `government`,
- `doctrine`,
- `trait`.

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

Host przeglądarkowy nadal jest autorytetem świata w multiplayerze. Do produkcyjnego multiplayera trzeba później dodać walidację ruchów po stronie backendu albo Supabase Edge Functions.
