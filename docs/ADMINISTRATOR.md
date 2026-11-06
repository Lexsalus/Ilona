# Administrator — panel, ustawienia, serwer, RODO

Dla osoby, która uruchamia panel, decyduje, gdzie są ustawienia, wdraża serwer panelu i odpowiada za rejestr rozmów. Codzienna obsługa panelu: [INSTRUKCJA.md](INSTRUKCJA.md). Osadzenie czatu na stronie i budowa kodu: [WDROZENIE.md](WDROZENIE.md).

## Spis treści

1. [Jak to działa](#1-jak-to-działa)
2. [Uruchomienie panelu](#2-uruchomienie-panelu)
3. [Źródła ustawień: GitHub, plik, serwer, tryb lokalny](#3-źródła-ustawień-github-plik-serwer-tryb-lokalny)
4. [Serwer panelu (Cloudflare)](#4-serwer-panelu-cloudflare)
5. [Bezpieczeństwo panelu](#5-bezpieczeństwo-panelu)
6. [Rejestracja rozmów i RODO](#6-rejestracja-rozmów-i-rodo)
7. [Kontrola strony kliniki](#7-kontrola-strony-kliniki)
8. [Kopie zapasowe, eksport, import, Dev reset](#8-kopie-zapasowe-eksport-import-dev-reset)
9. [Decyzje właściciela serwisu](#9-decyzje-właściciela-serwisu)
10. [Najczęstsze problemy](#10-najczęstsze-problemy)

---

## 1. Jak to działa

```
Komputer administratora               (opcjonalnie) Cloudflare                Strona kliniki
┌──────────────────────┐   hasło     ┌─────────────────────────────┐        ┌──────────────────┐
│ panel administracyjny│ ──────────► │ serwer panelu (Worker + D1) │ ◄───── │ czat (embed.js)  │
│ npm run panel        │  /admin/*   │  ustawienia · rejestr rozmów│ /config│ u pacjenta       │
│ 127.0.0.1:5050       │             │  kontrola strony (codziennie)│  /log  └──────────────────┘
└──────────┬───────────┘             └─────────────────────────────┘                 ▲
           │ zapis settings.json → git push → GitHub Pages (lexsalus.github.io/Ilona) ┘
```

- **Czat** (`chat/`, `embed.js`) działa w przeglądarce pacjenta. Przy starcie wczytuje ustawienia: z serwera panelu (jeśli podany), w przeciwnym razie z pliku `settings.json` obok skryptu, a gdy go nie ma — z wartości domyślnych.
- **Panel administracyjny** (`panel/`) jest jeden: **https://lexsalus.github.io/Ilona/panel/**. Logowanie tokenem GitHub; „Zapisz zmiany” zapisuje `settings.json` w repozytorium (commit przez GitHub API), a GitHub Actions testuje i publikuje czat w ok. 1–2 minuty. Bez tokenu z prawem zapisu do repozytorium panel nie wpuszcza. Na komputerze programisty (`npm run panel`) są też tryby pomocnicze — schowane pod „Dla programisty”.
- **Serwer panelu** (`panel/server/`) jest **opcjonalny**: przechowuje ustawienia i rejestr rozmów w bazie Cloudflare D1. Bez niego czat działa na pliku `settings.json` i nie zapisuje rozmów.

---

## 2. Uruchomienie panelu

**Zwykła praca:** **https://lexsalus.github.io/Ilona/panel/** → token GitHub → **Zaloguj**. Jak utworzyć token (tylko to repozytorium, uprawnienie *Contents: Read and write*) — [INSTRUKCJA.md, punkt 1](INSTRUKCJA.md#1-otwarcie-panelu). Komputer nie wymaga niczego poza przeglądarką.

**Komputer programisty** (testy, rozwój czatu, tryby pomocnicze):

**Jednorazowo:**

1. Zainstaluj [Node.js](https://nodejs.org) w wersji **LTS** (22.13 lub nowszej).
2. Pobierz projekt:

   ```powershell
   git clone https://github.com/Lexsalus/Ilona
   ```

**Za każdym razem** (terminal w folderze projektu):

```powershell
git pull
npm run panel
```

Otwórz **http://localhost:5050/panel/** (tryby pomocnicze: „Dla programisty” pod logowaniem). Strona testowa czatu: **http://localhost:5050/test.html**, podgląd strony kliniki z czatem: **http://localhost:5050/demo/**. Zatrzymanie: `Ctrl+C`.

Lokalny serwer nasłuchuje tylko na `127.0.0.1` — nikt z sieci ani z internetu nie ma do niego dostępu. Projekt nie ma zależności (`npm install` nie jest potrzebne).

---

## 3. Źródła ustawień: GitHub, plik, serwer, tryb lokalny

| Źródło | Gdzie są ustawienia | Rejestr rozmów | Kiedy zmiana działa na stronie | Dla kogo |
|---|---|---|---|---|
| **GitHub** (zwykła praca, panel online) | `settings.json` w repozytorium — zapis przez GitHub API (token) | nie | po ok. 1–2 min (testy + publikacja) | codzienna obsługa z dowolnego komputera |
| **Plik ustawień** (komputer programisty) | `settings.json` na dysku | nie | po `git push` (GitHub Pages publikuje w ok. minutę) | praca w repozytorium, kopie w `panel/backups/` |
| **Serwer panelu (baza)** | Cloudflare D1 | tak | po ok. minucie, automatycznie | produkcja z rejestrem rozmów |
| **Tryb lokalny (demo)** | pamięć przeglądarki | tak (w tej przeglądarce) | od razu, tylko w tej przeglądarce | testy, pokaz |

Czat bierze ustawienia z pierwszego dostępnego źródła: serwer panelu (gdy na stronie jest `data-panel` albo adres w `chat/config.js`) → tryb lokalny (gdy wybrano go w panelu w tej samej przeglądarce) → plik `settings.json` → ustawienia domyślne.

Zapis z panelu online to commit w repozytorium („Ustawienia czatu — zapis z panelu”, autor = właściciel tokenu): historia zmian i cofanie (`git revert`) jak przy każdej innej zmianie. Programista po takim zapisie robi `git pull` przed własną pracą. Jeśli `settings.json` zmienił się w międzyczasie (inny komputer), panel nie nadpisze go — prosi o odświeżenie.

### Praca z plikiem ustawień (komputer programisty)

1. `npm run panel` → „Dla programisty” → **Plik ustawień** → zmiany → **Zapisz zmiany**. Panel zapisuje `settings.json` w folderze projektu; poprzednia wersja trafia do `panel/backups/` (30 ostatnich kopii, poza repozytorium).
2. Wyślij plik do repozytorium:

   ```powershell
   git add settings.json
   git commit -m "Ustawienia: nowy cennik"
   git push
   ```

3. Po ok. minucie czat na stronie używa nowych ustawień (GitHub Pages). Sprawdź na stronie testowej.

Zmiana samych ustawień (`settings.json`) nie wymaga nowej wersji czatu.

### Przejście na serwer panelu

Gdy potrzebny jest rejestr rozmów albo zmiany „na żywo” bez `git push`: wdroż serwer (punkt 4), w panelu zrób **Eksport** z pliku, zaloguj się do serwera i **Import** → **Zapisz zmiany**. Plik `settings.json` zostaje jako zapas — czat użyje go, gdyby serwer nie odpowiadał.

---

## 4. Serwer panelu (Cloudflare)

Potrzebne darmowe konto Cloudflare.

```powershell
cd panel\server
npx wrangler login
npx wrangler d1 create lekarze-panel              # tworzy bazę; skopiuj "database_id"
```

Wklej `database_id` do `panel/server/wrangler.toml`, potem:

```powershell
npx wrangler secret put ADMIN_PASSWORD            # długie hasło (min. 16 znaków)
npx wrangler deploy
```

Na końcu pojawi się adres, np. `https://lekarze-panel.twoja-nazwa.workers.dev`. Tabele w bazie tworzą się same.

**Podłączenie czatu** — wybierz jeden sposób:

- na stronie kliniki w znaczniku skryptu: `data-panel="https://lekarze-panel.twoja-nazwa.workers.dev"`, **albo**
- w `chat/config.js`: `endpoint: 'https://…workers.dev'` (potem `npm run bump -- patch "Podłączenie serwera panelu"` i `git push`).

**Logowanie:** panel → **Serwer panelu** → adres + hasło → **Połącz**. Hasło jest pamiętane tylko do zamknięcia karty.

W `wrangler.toml` ustaw też `ALLOWED_ORIGINS` — domeny stron, z których czat może zapisywać rozmowy (domyślnie lekarzeiterapeuci.pl, www.lekarzeiterapeuci.pl, lexsalus.github.io i localhost).

---

## 5. Bezpieczeństwo panelu

| Zabezpieczenie | Co daje |
|---|---|
| Panel online zapisuje tylko z tokenem GitHub z prawem zapisu do repozytorium (fine-grained, jedno repozytorium, *Contents*) | Osoba bez tokenu nie zaloguje się i niczego nie zmieni; token można w każdej chwili unieważnić na GitHubie |
| Każdy zapis = commit z autorem; publikacja dopiero po testach (GitHub Actions) | Widać, kto i kiedy zmienił ustawienia; błędny plik nie trafi na stronę |
| Token domyślnie tylko do zamknięcia karty („Zapamiętaj” — świadomie, na własnym komputerze) | Mniejsze ryzyko na wspólnych komputerach |
| Tryby pomocnicze (serwer, plik, lokalny) tylko na `127.0.0.1` | Nikt z internetu nie użyje ich przez publiczny adres |
| Zapis pliku ustawień tylko z lokalnego panelu (sprawdzany Host i Origin) | Żadna inna strona otwarta w przeglądarce nie zmieni `settings.json` |
| Hasło (`ADMIN_PASSWORD`), porównywane w stałym czasie | Bez hasła nie da się odczytać ani zmienić ustawień czy rozmów |
| Blokada po 10 błędnych hasłach (15 min), licznik w bazie | Chroni przed zgadywaniem hasła — we wszystkich instancjach serwera |
| `ADMIN_ORIGINS` (domyślnie tylko `localhost:5050`) | Część administracyjna działa tylko z lokalnego panelu |
| **`ADMIN_IPS`** (opcjonalne) | Część administracyjna istnieje tylko dla Twojego IP — dla innych 404 |
| Cloudflare Access (opcjonalne, zalecane) | Logowanie e-mailem / Google przed dostępem do `/admin/*` |
| Serwer ponownie sprawdza i przycina wszystko, co przyśle przeglądarka | Błędne lub złośliwe dane nie trafią do bazy |
| Górny limit rejestru: 200 000 wpisów | Zasypanie rejestru fałszywymi wpisami nie zapełni bazy (nowe wpisy są wtedy pomijane) |

**Ograniczenie do adresu IP:** sprawdź swój adres (https://ifconfig.me), w `wrangler.toml` odkomentuj `ADMIN_IPS = "TWÓJ.ADRES.IP"` i `npx wrangler deploy`. Domowe IP potrafi się zmieniać — wtedy zaktualizuj adres.

**Cloudflare Access:** Zero Trust → Access → Applications → Add application → Self-hosted: domena Workera, ścieżka `/admin/*`, polityka „Allow” dla Twojego e-maila.

**Hasło:** zmiana — `npx wrangler secret put ADMIN_PASSWORD` w folderze `panel/server`.

**Limit zapytań (zalecane przy włączonym rejestrze rozmów):** nagłówek `Origin` sprawdzany przy zapisie rozmów da się podrobić spoza przeglądarki, a limit 60 wpisów na minutę liczy każda instancja serwera osobno. Dodaj regułę w Cloudflare: domena Workera → **Security → WAF → Rate limiting rules** → ścieżka `/log`, np. 30 zapytań na minutę z jednego IP, akcja „Block”. Taka sama reguła dla `/admin/*` (np. 20 na minutę) dodatkowo utrudnia zgadywanie hasła.

---

## 6. Rejestracja rozmów i RODO

Działa tylko z serwerem panelu (albo w trybie lokalnym, w jednej przeglądarce). Domyślnie **wyłączona**.

| Poziom | Co zapisujemy | Czego wymaga |
|---|---|---|
| 0. Wyłączona (domyślnie) | nic | — |
| 1. Statystyki | temat pytania, przypadek A–M, kliknięty przycisk, wersję, godzinę, losowy identyfikator rozmowy | wzmianka w polityce prywatności |
| 2. Treść pytań za zgodą | + treść pytań pacjentów, którzy zaznaczyli zgodę | zgoda (pole na ekranie powitalnym), zapis w polityce prywatności, umowa powierzenia z Cloudflare |
| 3. Pełne rozmowy za zgodą | + odpowiedzi czatu | jak wyżej |

Zawsze, na każdym poziomie:

- **imię pacjenta nie jest wysyłane ani zapisywane**,
- numery (PESEL, telefony, konta — każdy ciąg min. 7 cyfr) i adresy e-mail są **wycinane** przed zapisem — w przeglądarce i ponownie na serwerze,
- **treści wiadomości kryzysowych (B) nie zapisujemy wcale**,
- **nie zapisujemy adresów IP**,
- wpisy starsze niż **czas przechowywania** (1–365 dni, domyślnie 90) są usuwane automatycznie codziennie.

> Pytania o zdrowie to dane szczególnej kategorii (art. 9 RODO). Przed włączeniem poziomu 2 lub 3 właściciel serwisu powinien skonsultować z prawnikiem: zapis w polityce prywatności, podstawę prawną (zgoda), umowę powierzenia przetwarzania z Cloudflare, czas przechowywania i krąg osób z dostępem do panelu.

Bot działa w całości w przeglądarce pacjenta — **treść pytań nigdzie nie jest wysyłana**, dopóki rejestracja jest wyłączona (poziom 0). Rozmowa jest pamiętana tylko w `sessionStorage` przeglądarki (znika po zamknięciu karty).

---

## 7. Kontrola strony kliniki

Czat podaje linki, ceny, telefon i godziny ze strony lekarzeiterapeuci.pl. Kontrola wyłapuje zmiany na stronie kliniki:

1. **Linki** ze wszystkich odpowiedzi (wbudowanych, zmienionych w panelu i własnych): 404/500, brak odpowiedzi, przekierowanie, brak sekcji (np. `#cennik`).
2. **Fakty**: numer infolinii, e-mail, godziny, ceny usług (z bieżących ustawień — `siteFacts()` w `chat/core/knowledge.js`).
3. **Zmiany treści** stron kliniki od poprzedniego sprawdzenia (informacyjnie).

| Sposób | Kiedy |
|---|---|
| Panel → „Kontrola strony” → **Sprawdź teraz** | na żądanie (lokalnie przez `npm run panel`; przy serwerze — przez serwer panelu) |
| Serwer panelu | automatycznie codziennie rano; wynik w panelu |
| GitHub Actions (`.github/workflows/site-check.yml`) | automatycznie codziennie ok. 7:23, z ustawieniami z `settings.json`; przy problemie GitHub wysyła **e-mail** |
| `npm run check-site` | z konsoli; `--config settings.json` dołącza linki z ustawień, `--save` zapamiętuje wynik do wykrywania zmian |

**E-mail z GitHuba:** GitHub → Settings → Notifications → Actions → powiadomienia o nieudanych uruchomieniach. Ręcznie: repozytorium → Actions → „Kontrola strony kliniki” → Run workflow. GitHub wstrzymuje zaplanowane uruchomienia po 60 dniach bez aktywności w repozytorium — wtedy „Enable workflow”.

---

## 8. Kopie zapasowe, eksport, import, Dev reset

- **Eksport** (górny pasek panelu) — plik ze wszystkimi ustawieniami (także niezapisanymi), w tym samym formacie co `settings.json`. Nie zawiera: rozmów, wyniku kontroli strony ani preferencji wyglądu panelu.
- **Import** — wczytuje plik z eksportu albo `settings.json`. Ustawienia są sprawdzane i trafiają do edycji — nic się nie zmienia przed „Zapisz zmiany”.
- **Kopie pliku** — przy każdym zapisie `settings.json` z panelu poprzednia wersja trafia do `panel/backups/` (30 ostatnich). Pełna historia jest też w Git (`git log settings.json`).
- **Dev reset** — czyści pamięć przeglądarki (klucze `lt-…`: historie czatów, tryb lokalny, preferencje panelu) i przywraca ustawienia domyślne: w trybie lokalnym od razu, przy pliku i serwerze jako niezapisane zmiany. Logowanie zostaje.

---

## 9. Decyzje właściciela serwisu

Ustawienia domyślne są zgodne ze specyfikacją czatu „Ilona” v1.1, z wyjątkiem świadomych decyzji opisanych w [WDROZENIE.md](WDROZENIE.md#9-odstępstwa-od-specyfikacji). Do ustalenia przed uruchomieniem:

- [ ] **Telefon wsparcia** 116 123 / 116 111 w komunikacie B (zakładka „Bezpieczeństwo”, domyślnie wyłączony).
- [ ] **Przegląd medyczny** — lekarz kierujący serwisem zatwierdza słowa alarmowe (A, B) i teksty komunikatów; zapisać datę i wersję.
- [ ] **Prawnik** — czy forma czatu nie wymaga certyfikacji jako wyrób medyczny; polityka prywatności.
- [ ] **RODO** — poziom rejestracji rozmów, czas przechowywania, umowa powierzenia z Cloudflare (gdy serwer panelu).
- [ ] **Kontrast kolorów** — część kolorów usług (pomarańczowy, oliwkowy, turkusowy) ma słabszy kontrast z białym napisem; czat sam przełącza wtedy napis na ciemny.
- [ ] Czy czat **zastępuje**, czy działa **obok** obecnego „czatu na żywo” na stronie (wtedy `data-position="left"`).

---

## 10. Najczęstsze problemy

| Objaw | Przyczyna / rozwiązanie |
|---|---|
| Panel: „Nieprawidłowe hasło” | Hasło z `wrangler secret put ADMIN_PASSWORD`; po 10 próbach blokada na 15 min |
| Panel: „Serwer nie odpowiada…” | Zły adres Workera albo zmienił się Twój IP przy włączonym `ADMIN_IPS` |
| Panel: „Nieprawidłowy albo wygasły token GitHub” | Token wygasł albo został usunięty — utwórz nowy (INSTRUKCJA, punkt 1) |
| Panel: „Token nie ma uprawnienia do zapisu” | W ustawieniach tokenu: repozytorium `Lexsalus/Ilona` i *Contents: Read and write* |
| Panel: „Plik ustawień na GitHubie zmienił się w międzyczasie” | Ktoś zapisał z innego komputera — odśwież panel i wprowadź zmiany ponownie |
| Czat nie widzi zmian z panelu / pliku | Zakładka Actions: czy publikacja po zapisie się udała (ok. 1–2 min). Przeglądarka może do 10 min pokazywać poprzednią wersję — Ctrl+F5 (Mac: Cmd+Shift+R), na telefonie zamknij i otwórz kartę |
| Lokalnie: `git push` odrzucony („fetch first”) | W repozytorium jest nowszy zapis z panelu — `git pull --rebase`, potem `git push` |
| Czat nie widzi zmian z serwera | Ustawienia są pamiętane do 60 s; sprawdź `data-panel` / `chat/config.js` i czy kliknięto „Zapisz zmiany” |
| Czat zawsze odpowiada „Nie jestem pewna…” | Stara wersja w pamięci przeglądarki (Ctrl+F5) albo ustawienia trybu lokalnego w tej przeglądarce („Dev reset”) |
| Brak pola zgody na ekranie powitalnym | Pojawia się tylko przy poziomie rejestracji 2 lub 3 |
| Rozmowy się nie zapisują | Poziom 0, brak serwera panelu albo domena strony spoza `ALLOWED_ORIGINS` |
| Publikacja na GitHub Pages wstrzymana | Testy albo kontrola wersji nie przeszły — szczegóły w zakładce Actions |
| `npm run panel`: „EADDRINUSE” | Port 5050 zajęty — panel już działa albo `node tools/serve-local.js 5051` (przy serwerze panelu dopisz `http://localhost:5051` do `ADMIN_ORIGINS`) |
