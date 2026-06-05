# Warforge Provinces — setup + readable map update

Statyczna gra strategiczna real-time pod GitHub Pages + Supabase Free.

## Co dodano w tej wersji

### 1. Dokładniejszy setup kampanii

Przycisk **Setup kampanii solo** otwiera teraz ekran ustawień przed startem:

- tempo gry: wolne / normalne / szybkie,
- trudność botów: łatwa / normalna / trudna,
- zasoby startowe: niskie / normalne / wysokie,
- nazwa dowódcy.

Te ustawienia wpływają na realną rozgrywkę:
- tempo zmienia częstotliwość gospodarki, AI i długość dnia,
- trudność zmienia zasoby botów, dochód botów, siłę ataku botów i szybkość ich decyzji,
- zasoby startowe zmieniają startowy budżet.

### 2. Czytelniejsza mapa

Każda prowincja ma teraz widoczne oznaczenie:

- **PUSTA · 0** — łatwa do zajęcia, brak ukrytej obrony,
- **ARMIA · X** — stoi tam jednostka / jednostki,
- **FORT · X** — prowincja jest broniona fortyfikacją,
- **STOLICA · X** — stolica ma garnizon nawet bez jednostek.

Dodatkowo:
- jednostki mają paski HP,
- prowincje mają pasek kondycji pola,
- zniszczenia prowincji są pokazane jako pęknięcia i procent zniszczeń,
- zniszczenia obniżają dochód prowincji,
- zniszczenia można naprawiać akcją **Napraw szkody**,
- zniszczenia powoli spadają same przy tickach gospodarki, szybciej w prowincjach z przemysłem.

### 3. Lepsza ergonomia

Najważniejsza zmiana sterowania:

**Kliknięcie prowincji już nie rusza przypadkowo jednostki.**

Nowy schemat:

1. Klikasz prowincję — tylko ją wybierasz.
2. Klikasz jednostkę — tylko ją wybierasz.
3. Klikasz **Wydaj rozkaz**.
4. Dopiero teraz kliknięcie sąsiedniej prowincji wykonuje marsz albo atak.

To rozwiązuje problem przypadkowego ruchu armii przy przeglądaniu mapy.

### 4. Szybkie akcje nad mapą

Nie trzeba ciągle scrollować do bocznego panelu.

Po wyborze własnej prowincji nad mapą pojawiają się:
- budowa przemysłu,
- budowa fortu,
- budowa lotniska,
- naprawa szkód,
- rekrutacja piechoty,
- rekrutacja artylerii,
- rekrutacja czołgów.

Boczny panel nadal istnieje jako panel szczegółów.

## Uruchomienie lokalne

```bash
cd warforge-mvp-setup-ui
python3 -m http.server 5173
```

Otwórz:

```text
http://localhost:5173
```

## Supabase

Jeżeli masz już wgrany SQL z wersji `custom-country` albo `map-expanded`, SQL nie wymaga zmiany dla tej aktualizacji.

Dla pewności możesz ponownie uruchomić:

```text
supabase/schema.sql
```

Nadal wymagane jest:

```text
Authentication → Anonymous sign-ins → Enable
```

## GitHub Pages

1. Wgraj zawartość folderu do repozytorium.
2. GitHub → Settings → Pages.
3. Deploy from a branch.
4. Branch `main`, folder `/root`.

## Notatka projektowa

Mapa jest nadal MVP, ale ma już czytelny system informacji strategicznej. Kolejny dobry krok to wydzielenie mapy do `mapData.js` i później zrobienie edytora mapy.
