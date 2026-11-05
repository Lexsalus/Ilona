# Wdrożenie i rozwój — dla informatyka

Jak osadzić czat Ilona na stronie www, gdzie go hostować, jak zbudowany jest kod i jak go bezpiecznie rozwijać. Obsługa panelu: [INSTRUKCJA.md](INSTRUKCJA.md). Serwer panelu, źródła ustawień i RODO: [ADMINISTRATOR.md](ADMINISTRATOR.md).

## Spis treści

1. [Osadzenie na stronie](#1-osadzenie-na-stronie)
2. [Hosting: GitHub Pages albo własny serwer](#2-hosting-github-pages-albo-własny-serwer)
3. [Wymagania techniczne strony](#3-wymagania-techniczne-strony)
4. [Budowa kodu](#4-budowa-kodu)
5. [Obsługa pytania krok po kroku](#5-obsługa-pytania-krok-po-kroku)
6. [Ustawienia: format i przepływ](#6-ustawienia-format-i-przepływ)
7. [Typowe zmiany w kodzie](#7-typowe-zmiany-w-kodzie)
8. [Testy, wersje, publikacja](#8-testy-wersje-publikacja)
9. [Odstępstwa od specyfikacji](#9-odstępstwa-od-specyfikacji)
10. [Rozwój — zasady](#10-rozwój--zasady)

---

## 1. Osadzenie na stronie

Jedna linijka przed `</body>` na wszystkich podstronach (zwykle w szablonie stopki):

```html
<script src="https://lexsalus.github.io/Ilona/embed.js" defer></script>
```

Z serwerem panelu (ustawienia na żywo + rejestr rozmów — [ADMINISTRATOR.md](ADMINISTRATOR.md#4-serwer-panelu-cloudflare)):

```html
<script src="https://lexsalus.github.io/Ilona/embed.js"
        data-panel="https://lekarze-panel.TWOJE-KONTO.workers.dev" defer></script>
```

### Atrybuty `data-*` (wszystkie opcjonalne)

| Atrybut | Przykład | Działanie |
|---|---|---|
| `data-panel` | URL serwera panelu | Ustawienia z serwera panelu i rejestr rozmów. Bez niego: `settings.json` obok `embed.js`, a gdy go nie ma — ustawienia domyślne |
| `data-title` | `"Lekarze i Terapeuci"` | Nazwa w nagłówku czatu |
| `data-accent` | `"#2e2787"` | Kolor przewodni (przyciski, dymki pacjenta) |
| `data-position` | `"left"` | Przycisk czatu po lewej (domyślnie po prawej) |
| `data-open` | `"true"` | Czat otwarty od razu po załadowaniu strony |

Atrybuty mają pierwszeństwo przed ustawieniami z panelu („Strona i wygląd”).

### Sterowanie z poziomu strony

Po załadowaniu dostępny jest obiekt `window.LTChat`:

```html
<button onclick="LTChat.open()">Zapytaj Ilonę</button>
```

| Metoda | Działanie |
|---|---|
| `LTChat.open()` / `LTChat.close()` | otwiera / zamyka okno czatu |
| `LTChat.ask("tekst")` | wysyła pytanie w imieniu pacjenta (np. z przycisku „Ile kosztuje L4?”) |
| `LTChat.reset()` | czyści rozmowę i wraca do ekranu powitalnego |

### Uwaga: obecny „czat na żywo”

Na lekarzeiterapeuci.pl jest już widżet czatu na żywo. Jeśli oba mają działać obok siebie, ustaw `data-position="left"`, żeby przyciski się nie nakładały.

---

## 2. Hosting: GitHub Pages albo własny serwer

### GitHub Pages (zalecane)

Workflow `.github/workflows/pages.yml` publikuje repozytorium pod `https://lexsalus.github.io/Ilona/` przy każdym pushu na `main`:

1. uruchamia kontrolę wersji (`tools/check-version.js`) i testy (`tools/test.js`) — **jeśli coś nie przechodzi, strona zostaje w poprzedniej wersji**,
2. usuwa części niepubliczne (`panel/server`, `tools`, `docs`, `.github`),
3. publikuje resztę: `embed.js`, `chat/`, `settings.json`, stronę testową `test.html`, podgląd strony kliniki z czatem (`demo/`, na nią prowadzi `index.html`) i podgląd panelu (`panel/` — publicznie działa tylko w trybie demo).

**Jednorazowo:** repozytorium → **Settings → Pages → Source: GitHub Actions**. GitHub Pages za darmo wymaga repozytorium **publicznego** (kod czatu i tak jest widoczny w przeglądarce każdego pacjenta). Przy repozytorium prywatnym — płatny plan GitHub albo własny serwer.

Aktualizacja czatu = push do `main`; strona kliniki nie wymaga żadnych zmian. GitHub Pages wysyła pliki z nagłówkiem `Cache-Control: max-age=600`, więc przeglądarki pacjentów widzą nową wersję najpóźniej po ok. 10 minutach.

### Własny serwer (np. hosting strony kliniki)

Czat to zwykłe pliki statyczne (ok. 160 KB) — działa z dowolnego folderu na dowolnym serwerze, bez PHP, bazy i konfiguracji. Wszystkie pliki ładują się względem adresu `embed.js`, więc w kodzie nic nie trzeba zmieniać.

**Zalety:** czat ładuje się z tej samej domeny co strona (bez GitHub Pages, bez CORS, prostsze RODO i CSP). **Wada:** aktualizacje nie są automatyczne — każdą zmianę wgrywa się ręcznie.

#### Krok 1. Przygotuj paczkę

W katalogu repozytorium:

```
npm test          # testy muszą przejść
npm run paczka    # tworzy folder paczka/ilona/
```

W `paczka/ilona/` są tylko pliki potrzebne pacjentom:

```
embed.js
settings.json
chat/            (cały folder: core, engine, settings, ui, img, …)
WGRAJ.txt        (krótka instrukcja — na serwer nie jest potrzebny)
```

Bez narzędzia — skopiuj ręcznie te same trzy pozycje: `embed.js`, `settings.json`, `chat/`. **Nie kopiuj** `panel/`, `tools/`, `docs/`, `demo/`, `.git/`, `.github/`, `node_modules/` ani `test.html` (panel na serwerze publicznym jest niepotrzebny, a `panel/server/` to kod Workera, nie strony).

#### Krok 2. Wgraj na serwer

Utwórz na serwerze folder, np. `/ilona/`, i wgraj do niego **całą zawartość** `paczka/ilona/` z zachowaniem struktury folderów. Sposób zależy od hostingu:

- **FTP / SFTP** (FileZilla, WinSCP): połącz się z serwerem, przejdź do katalogu głównego strony (zwykle `public_html/`, `www/` lub `htdocs/`), utwórz `ilona/` i przeciągnij do niego pliki.
- **Panel hostingu** (cPanel, DirectAdmin, panel home.pl/nazwa.pl itp.): Menedżer plików → katalog strony → nowy folder `ilona` → wgraj ZIP z zawartością `paczka/ilona/` → „Rozpakuj”.
- **WordPress:** pliki wgrywa się przez FTP lub menedżer plików hostingu (np. do `public_html/ilona/`), nie przez „Media” — biblioteka mediów nie przyjmie plików `.js`.

Sprawdzenie: adres `https://lekarzeiterapeuci.pl/ilona/embed.js` musi otwierać w przeglądarce kod skryptu (a nie błąd 404), a `https://lekarzeiterapeuci.pl/ilona/settings.json` — ustawienia.

#### Krok 3. Wstaw znacznik na stronę

Przed `</body>` (w WordPressie: motyw → stopka, albo wtyczka typu „Insert Headers and Footers” / „WPCode”):

```html
<script src="/ilona/embed.js" defer></script>
```

Jeśli na stronie był już znacznik z `github.io` — **zamień** go (dwa znaczniki = dwa okna czatu). Atrybuty `data-*` (rozdział 1) działają tak samo.

#### Krok 4. Sprawdź

1. Otwórz stronę w oknie prywatnym (bez starej pamięci podręcznej).
2. Kliknij przycisk czatu, podaj imię, wpisz „cześć” — powinny pojawić się kafelki usług z cenami.
3. Wpisz „nie mogę oddychać” — musi pojawić się czerwona karta z przyciskiem „Zadzwoń 112”.
4. W konsoli przeglądarki (F12) nie może być błędów `[Ilona]`.

#### Aktualizacje

| Co się zmieniło | Co wgrać ponownie |
|---|---|
| ustawienia w panelu (źródło „plik”) | tylko `settings.json` (panel zapisuje go w repozytorium) |
| nowa wersja czatu (kod) | `npm run paczka` i całą zawartość `paczka/ilona/` (nadpisz pliki) |
| ustawienia przy serwerze panelu (Cloudflare) | nic — czat pobiera je na żywo z bazy |

Po wgraniu przeglądarki pacjentów mogą przez chwilę używać starych plików z pamięci podręcznej (zależnie od ustawień serwera — zwykle do kilku godzin). Numer wersji jest w `chat/version.js` i w pliku `WGRAJ.txt` paczki.

#### Najczęstsze problemy

- **Czat się nie pojawia, w konsoli 404** — zły adres w `src` albo pliki w złym folderze (np. `ilona/ilona/embed.js`). Sprawdź adres `…/ilona/embed.js` w przeglądarce.
- **Błąd „MIME type” przy plikach `.js`** — serwer musi wysyłać `.js` jako `text/javascript` (standard; w razie problemu w `.htaccess`: `AddType text/javascript .js`).
- **Brak ikon/logo** — nie wgrał się folder `chat/img/`.
- **Czat na innej domenie niż strona** (np. `cdn.…`) — ustaw dla plików czatu nagłówek `Access-Control-Allow-Origin` (rozdział 3).
- **Strona ma CSP** — host czatu to wtedy domena strony (`'self'`), więc zwykle nic nie trzeba dopisywać.

---

## 3. Wymagania techniczne strony

- **Przeglądarki:** współczesne (ES modules, Shadow DOM, `fetch`) — Chrome, Edge, Firefox, Safari z ostatnich lat. Bez bibliotek zewnętrznych i bez kroku budowania.
- **Izolacja:** czat renderuje się w **Shadow DOM** — style strony nie psują czatu, a style czatu nie wpływają na stronę. Cały tekst wstawiany jest przez `textContent` (nigdy `innerHTML`).
- **Content-Security-Policy** (jeśli strona ją ma) musi dopuszczać:
  - `script-src` — host czatu (np. `https://lexsalus.github.io`),
  - `style-src` — ten sam host (style ładowane jako plik CSS do Shadow DOM),
  - `img-src` — ten sam host oraz `data:` (logo/miniatura wgrane w panelu),
  - `connect-src` — host czatu (`settings.json`) i — jeśli używany — serwer panelu (`*.workers.dev`).
- **CORS:** GitHub Pages wysyła `Access-Control-Allow-Origin: *`, więc moduły i `settings.json` ładują się z innej domeny bez konfiguracji. Na własnym serwerze w innej domenie niż strona — ustaw ten nagłówek dla plików czatu.
- **Pamięć przeglądarki:** rozmowa w `sessionStorage` (klucz `lt-chat:bot`, znika po zamknięciu karty). Brak ciasteczek. Gdy pamięć jest zablokowana (tryb prywatny, iframe), czat działa dalej, tylko bez zapamiętywania rozmowy.
- **Sieć:** bez serwera panelu i przy rejestracji wyłączonej czat po załadowaniu nie wysyła żadnych zapytań poza pobraniem `settings.json`.

---

## 4. Budowa kodu

Czysty JavaScript (ES modules), bez zależności i bez kroku budowania. Czat (`chat/`) **nie importuje niczego z panelu** — panel korzysta z modułów czatu (te same zasady i wiedza w obu miejscach).

```
embed.js                    ładuje chat/embed-core.js (adres względny do własnej lokalizacji)
chat/
  embed-core.js             start(script): atrybuty data-* → ustawienia → silnik → widżet → window.LTChat
  config.js                 PANEL_CONFIG.endpoint — adres serwera panelu „na sztywno” (opcjonalny)
  version.js                VERSION — wersja czatu (zarządza nią tools/bump.js)
  engine/bot-engine.js      silnik: rozpoznaje temat (słowa kluczowe, tolerancja literówek, CASE_ORDER)
  core/
    texts.js                WSZYSTKIE teksty odpowiedzi (przypadki A–M) i napisy interfejsu
    knowledge.js            wiedza: strona, podstrony, usługi i ceny, kolory, przyciski, tematy
                            (INTENTS + słowa kluczowe), kolejność przypadków, applySettings()
    safety.js               przypadki A (112) i B (kryzys) — listy fraz alarmowych, checkSafety()
    pipeline.js             respond(): kolejność obsługi pytania (punkt 5), tryb kryzysowy
    text.js                 normalizacja tekstu, dopasowanie fraz z tolerancją literówek
    privacy.js              anonimizacja (numery, e-maile) przed zapisem rozmów
  settings/
    schema.js               format ustawień, wartości domyślne, walidacja (wspólne: czat, panel, serwer)
    client.js               wczytanie ustawień (serwer → tryb lokalny → plik → domyślne), własne
                            odpowiedzi (matchRule), wysyłanie wpisów do rejestru rozmów
  ui/widget.js, widget.css  okno czatu (Shadow DOM), kafelki usług, karta 112, komunikaty
  img/                      logo i miniatura konsultantki (domyślne)
settings.json               ustawienia czatu (źródło „plik”) — format jak eksport z panelu
panel/
  index.html, admin.js, admin.css   panel administracyjny (jedna strona, zakładki)
  labels.js                 nazwy tematów do panelu i raportów
  site-check.js             kontrola strony kliniki (linki, fakty, zmiany treści)
  server/worker.js          serwer panelu: Cloudflare Worker + D1 (ustawienia, rejestr, kontrola strony)
tools/
  serve-local.js            lokalny serwer (npm run panel): pliki + zapis settings.json + kontrola strony
  test.js                   testy (npm test)
  check-site.js             kontrola strony z konsoli / GitHub Actions
  bump.js, check-version.js wersjonowanie
  d1-sqlite.js              atrapa Cloudflare D1 na SQLite (do testów serwera panelu)
```

---

## 5. Obsługa pytania krok po kroku

`chat/core/pipeline.js` → `respond(engine, wiadomość, historia, sesja)`:

1. **Czyszczenie** wiadomości (spacje, długość maks. 500 znaków).
2. **A / B — bezpieczeństwo** (`safety.js`): fraza alarmowa → zielona odpowiedź u góry + **czerwona karta z 112 zawsze na dole** (`reply.alarm`). Zawsze pierwsze, na każdej wiadomości; nie da się wyłączyć.
3. **Własne odpowiedzi** z panelu (`settings/client.js → matchRule`): wygrywa najdłuższa pasująca fraza.
4. **Silnik** (`engine/bot-engine.js`): wybiera przypadek według stałej kolejności `CASE_ORDER` = I → J → C → F → E → G → H → K → D → M → L; w obrębie przypadku — temat z najwyższym wynikiem. Odpowiedź (`replyFor`) = tekst z `texts.js` + kafelki usług z cenami (`CASE_BUTTONS`, `BUTTONS`, `SERVICES`).
5. **Tryb kryzysowy** (po B): czy niejasna wiadomość dostaje ponownie komunikat B — według ustawień `safety.*` (domyślnie nie).
6. **„Napisz do nas”** — po dwóch niezrozumiałych wiadomościach z rzędu.
7. **`{imie}`** w tekście uzupełniane imieniem z ekranu powitalnego (albo usuwane).

Każda odpowiedź ma postać `{ text, links, chips, intent, case, source }`; przy A/B dodatkowo `alarm` i `emergency`.

**Dopasowanie fraz** (`text.js`): tekst jest normalizowany (małe litery, bez polskich znaków, bez interpunkcji, 3+ powtórzone litery skracane). Fraza pasuje na granicach słów; `*` na końcu słowa = dowolna końcówka (`rw* kulszow*`); słowa od 5 liter (a przedrostki od 6) dopuszczają **jedną literówkę**; `=` na początku frazy wyłącza tolerancję literówek (dla fraz, które łatwo pomylić, np. `=nie moge mowic` ≠ „nie mogę umówić”).

---

## 6. Ustawienia: format i przepływ

Ustawienia to jeden obiekt JSON; plik `settings.json` i eksport z panelu mają format:

```json
{ "format": "lt-asystent-ustawienia", "formatVersion": 1, "config": { … } }
```

Pola `config` (zapisywane są tylko **zmiany** względem wartości domyślnych z kodu):

| Pole | Zawartość | Zakładka panelu |
|---|---|---|
| `logging` | poziom rejestracji 0–3, czas przechowywania | Rejestracja rozmów |
| `safety` | telefon wsparcia w B, tryb kryzysowy | Bezpieczeństwo |
| `alarms` | dodane / wyłączone frazy alarmowe A i B | Tematy → Słowa alarmowe |
| `rules` | własne odpowiedzi (frazy → tekst + linki) | Własne odpowiedzi |
| `overrides` | zmienione teksty odpowiedzi (klucz z `texts.js`) | Odpowiedzi wbudowane |
| `services`, `buttons` | usługi (nazwa, cena, kolor…), przyciski pod odpowiedziami | Usługi i przyciski |
| `tiles` | wygląd kafelków | Usługi i przyciski |
| `keywords`, `topics` | słowa kluczowe tematów, przyciski dodatkowe | Tematy |
| `notices` | komunikaty z datami | Komunikaty |
| `site`, `pages` | kontakt, napisy, wygląd, logo; adresy podstron | Strona i wygląd |

Zasady:

- **`chat/settings/schema.js → sanitizeConfig()`** sprawdza każde pole (typy, limity, tylko znane klucze — nie np. `constructor`, bezpieczne linki tylko `https:`/`tel:`/`mailto:`, frazy własnych odpowiedzi min. 3 znaki, obrazy tylko jako `data:` PNG/JPEG/WebP). Używają go czat, panel i serwer panelu — serwer nie ufa przeglądarce.
- **`chat/core/knowledge.js → applySettings(cfg)`** to jedyne miejsce, które nakłada ustawienia na wiedzę czatu. Zawsze startuje od wartości domyślnych, więc usunięcie zmiany w panelu przywraca dokument.
- Nowe pole ustawień: dodaj je do `DEFAULT_CONFIG` i `sanitizeConfig()` (`schema.js`), zastosuj w `applySettings()` i dopisz do testu eksportu/importu w `tools/test.js` (test pilnuje, żeby żadne pole nie zginęło).

---

## 7. Typowe zmiany w kodzie

Większość zmian treści robi się w panelu, bez kodu. Kod zmieniasz, gdy zmienia się **wartość domyślna** (dokument) albo zachowanie.

| Zmiana | Gdzie |
|---|---|
| Domyślny tekst odpowiedzi | `chat/core/texts.js` (teksty `locked` — A/B — tylko po zatwierdzeniu przez lekarza) |
| Domyślna cena, kolor, nazwa usługi | `chat/core/knowledge.js` → `SERVICES` |
| Przyciski pod odpowiedzią | `knowledge.js` → `BUTTONS`, `CASE_BUTTONS` |
| Nowy temat albo słowa kluczowe | `knowledge.js` → `INTENTS` (+ nazwa w `panel/labels.js`), testy w `tools/test.js` |
| Frazy alarmowe | `chat/core/safety.js` → `EMERGENCY` (A), `CRISIS` (B) — po zatwierdzeniu przez lekarza |
| Adresy podstron, kontakt | `knowledge.js` → `DEFAULT_SITE`, `PAGES` |
| Wygląd okna czatu | `chat/ui/widget.css` (zmienne CSS na górze pliku) |
| Nowa zakładka panelu | `panel/index.html` (sekcja + przycisk w grupie), `panel/admin.js` (funkcja `render…` wywoływana w `renderAll()`), pole ustawień jak w punkcie 6 |

Po każdej zmianie: `npm test`, sprawdzenie na stronie testowej (`npm run panel` → http://localhost:5050/), `npm run bump`, commit, push.

---

## 8. Testy, wersje, publikacja

```powershell
npm test                                  # testy: 28 pytań bota, 38 testów akceptacyjnych ze specyfikacji,
                                          # panel, serwer panelu (na SQLite), kontrola strony, plik ustawień
npm run bump -- patch "Opis zmiany"       # nowa wersja + wpis w CHANGES.md
npm run check                             # wersja zgodna z CHANGES.md
git add -A; git commit -m "Opis zmiany"; git push
```

- **Wersja** czatu jest jedna (`chat/version.js`), w formacie `MAJOR.MINOR.PATCH`: PATCH — poprawka bez zmiany zachowania; MINOR — nowa wiedza lub funkcja; MAJOR — zmiana zasad działania. Każda wersja ma wpis w `CHANGES.md` (dodaje go `npm run bump`).
- Zmiana samego `settings.json` (ustawienia z panelu) nie wymaga nowej wersji.
- Push na `main` → GitHub Actions: kontrola wersji + testy → publikacja na GitHub Pages. Niezaliczony test wstrzymuje publikację.
- Codziennie ok. 7:23 GitHub Actions sprawdza stronę kliniki (`site-check.yml`); przy problemie wysyła e-mail.

---

## 9. Odstępstwa od specyfikacji

Ustawienia domyślne pochodzą ze specyfikacji czatu „Ilona” v1.1. Świadome odstępstwa (decyzje właściciela lub wymagania testów akceptacyjnych):

- **Kolejność przypadków:** J (cena) przed tematami — „ile kosztuje psychiatra” dostaje cenę, a nie kartę C; M (powitanie) po D — „dzień dobry, boli mnie kręgosłup” to dolegliwość, nie powitanie.
- **Tryb kryzysowy po B** domyślnie **wyłączony**: kolejna niejasna wiadomość dostaje „Nie jestem pewna…” z usługami (specyfikacja: ponownie komunikat B). Zachowanie ze specyfikacji można włączyć w panelu („Bezpieczeństwo”).
- **Frazy alarmowe A** rozszerzone o przedawkowanie narkotyków i dopalaczy („za dużo narkotyków”, „przećpałem”…); część fraz bez tolerancji literówek, żeby nie dawać fałszywych alarmów („nie mogę umówić wizyty”, „zatrudnienie”).
- **Pojedynczy kafelek** w odpowiedzi ma szerokość i wysokość według treści (przełącznik w panelu).
- **Wygląd „premium”** (projekt graficzny z 11.2026): kafelki z ikoną usługi, ceną w „pigułce” i kolorowym cieniem (cień można wyłączyć w panelu), szeroki przycisk „Umów wizytę” z ikoną kalendarza, ciemnozielony nagłówek z tytułem pisanym szeryfową czcionką. **Kolory usług** są ciemniejszymi odcieniami barw ze specyfikacji (lepszy kontrast z białym napisem); psycholog / terapeuta — oliwkowy zamiast morskiego. Wszystkie kolory można zmienić w panelu, a poprzednie są nadal w palecie. Czcionka szeryfowa to czcionka systemowa (Georgia / Palatino) — bez pobierania czcionek z Google, ze względu na RODO.

Do zatwierdzenia przez lekarza kierującego serwisem: listy fraz alarmowych (A, B) i teksty komunikatów alarmowych.

---

## 10. Rozwój — zasady

- **Bezpieczeństwo ponad wszystko:** wykrywanie A/B działa regułami, przed wszystkimi innymi odpowiedziami. Lepiej uruchomić alarm za często niż za rzadko. Każda zmiana w `safety.js` — z testem i po zatwierdzeniu przez lekarza.
- **Czat prowadzi do zakupu:** każda odpowiedź tematu kończy się kafelkami usług z ceną (test „zasady nadrzędne” w `tools/test.js`).
- **Czat nie zależy od panelu:** `chat/` nie importuje niczego z `panel/`. Nowe funkcje panelu korzystają z modułów czatu, nie odwrotnie.
- **Wszystko, co często się zmienia, trafia do panelu** z wartością domyślną w kodzie; w ustawieniach zapisujemy tylko zmiany.
- **Bez zależności i kroku budowania** — pliki z repozytorium działają w przeglądarce tak, jak są.
- **Tekst tylko przez `textContent`** — nigdy `innerHTML` z danymi z ustawień czy od pacjenta.
- **Każda zmiana:** test → `npm run bump` → wpis w `CHANGES.md` → push.
- Miejsce na kolejne silniki: silnik to obiekt `{ name, label, version, ask(wiadomość, historia) }` zwracający odpowiedź w formacie z punktu 5; `pipeline.js` i widżet nie zależą od konkretnego silnika (historia rozmowy jest już przekazywana do `ask`).
