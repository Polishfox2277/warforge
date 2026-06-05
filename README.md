# Warforge Provinces — map expanded update

Statyczna gra strategiczna inspirowana Call of War / Hearts of Iron, przygotowana pod GitHub Pages + Supabase Free.

## Co dodano w tej wersji

- Rozbudowano mapę z 20 do **48 prowincji**.
- Dodano większe pole gry `1180 × 760`.
- Fronty są bardziej poszarpane dzięki ręcznym override'om właścicieli kilku prowincji.
- Naprawiono problem „pusta prowincja jest niezajmowalna”:
  - pusta, nieufortyfikowana prowincja wpada po wejściu jednostki,
  - jednostka dostaje tylko małą stratę organizacyjną zależną od terenu,
  - stolice i forty nadal bronią się nawet bez jednostek.
- Zachowano kreator własnego kraju, flagi SVG, ideologie i losowe kraje botów.

## Kierunek dalszej rozbudowy mapy

Aktualna mapa jest nadal generowana z siatki offsetowej, ale wygląda jak nieregularne prowincje. To dobry etap MVP.

Docelowy etap powinien wyglądać tak:

```js
{
  id: "warszawa",
  name: "Warszawa",
  owner: "poland",
  terrain: "city",
  polygon: [[120, 90], [180, 80], [210, 130], [150, 170]],
  neighbors: ["lodz", "bialystok", "lublin"],
  resources: { money: 60, manpower: 45, steel: 20, oil: 4 },
  buildings: { industry: 2, fort: 1, airbase: 1 }
}
```

Wtedy granice prowincji nie są już „udawane” przez generator, tylko wynikają z realnych polygonów.

## Uruchomienie lokalne

```bash
cd warforge-mvp-map-expanded
python3 -m http.server 5173
```

Otwórz:

```text
http://localhost:5173
```

## Supabase

Dla samej większej mapy SQL nie musi się zmieniać względem wersji custom-country, ale najbezpieczniej uruchomić aktualny plik:

```text
supabase/schema.sql
```

Jeżeli wcześniej uruchomiłeś wersję custom-country, ta wersja ma kompatybilną strukturę RPC.

## GitHub Pages

1. Wgraj zawartość folderu do repozytorium.
2. GitHub → Settings → Pages.
3. Deploy from a branch.
4. Branch `main`, folder `/root`.
