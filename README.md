# Ilona — czat dla lekarzeiterapeuci.pl

Wirtualna konsultantka **Ilona** pomaga pacjentom serwisu [lekarzeiterapeuci.pl](https://lekarzeiterapeuci.pl) wybrać właściwą usługę i prowadzi prosto do jej zakupu: każda odpowiedź kończy się kolorowymi kafelkami usług z ceną. Czat nie stawia diagnoz i nie udziela porad medycznych, a przy objawach stanu nagłego zawsze kieruje pod numer **112**.

- **Czat** to bot regułowy: działa w całości w przeglądarce pacjenta, bez AI i bez wysyłania pytań na zewnątrz. Ustawienia domyślne pochodzą ze specyfikacji czatu „Ilona” v1.1.
- **Panel administracyjny** (https://lexsalus.github.io/Ilona/panel/, logowanie tokenem GitHub) pozwala bez programowania zmieniać ceny, kolory, teksty odpowiedzi, słowa kluczowe, komunikaty, wygląd czatu i zasady bezpieczeństwa. Zapis trafia do repozytorium i po testach — na stronę.

## Wstawienie na stronę

Jedna linijka przed `</body>` (szczegóły: [docs/WDROZENIE.md](docs/WDROZENIE.md)):

```html
<script src="https://lexsalus.github.io/Ilona/embed.js" defer></script>
```

Podgląd strony kliniki z czatem Ilona: `https://lexsalus.github.io/Ilona/` (prowadzi do `demo/`). Strona testowa czatu: `https://lexsalus.github.io/Ilona/test.html`

## Dokumentacja

| Dla kogo | Dokument |
|---|---|
| Osoba, która na co dzień obsługuje panel (ceny, teksty, komunikaty) | [docs/INSTRUKCJA.md](docs/INSTRUKCJA.md) |
| Administrator: uruchomienie panelu, źródła ustawień, serwer panelu, rejestracja rozmów, RODO, kontrola strony | [docs/ADMINISTRATOR.md](docs/ADMINISTRATOR.md) |
| Informatyk / wdrożeniowiec: osadzenie na stronie, hosting, budowa kodu, rozwój, testy, wersje | [docs/WDROZENIE.md](docs/WDROZENIE.md) |

## Budowa repozytorium

```
embed.js               jedyny skrypt wklejany na stronę www
settings.json          ustawienia czatu (źródło „plik”) — zapisuje je panel
index.html             przekierowanie do demo/
test.html              strona testowa czatu
demo/                  podgląd: kopia strony głównej lekarzeiterapeuci.pl z czatem Ilona zamiast „czatu na żywo”
chat/                  CZAT — wszystko, co ładuje strona www (nie zależy od panelu)
  embed-core.js          start: ustawienia → silnik → widżet
  config.js              adres serwera panelu (opcjonalny)
  version.js             wersja czatu
  engine/                silnik: bot regułowy
  core/                  wiedza, teksty, bezpieczeństwo (112), kolejność obsługi pytania
  settings/              wczytywanie i sprawdzanie ustawień (wspólne z panelem)
  ui/                    widżet (okno czatu) i jego style
  img/                   logo i miniatura konsultantki
panel/                 PANEL ADMINISTRACYJNY — online: …/Ilona/panel/ (logowanie tokenem GitHub)
  server/                serwer panelu — Cloudflare Worker + baza D1 (opcjonalny)
tools/                 serwer lokalny, testy, kontrola strony, wersjonowanie
docs/                  dokumentacja
.github/workflows/     publikacja na GitHub Pages i codzienna kontrola strony kliniki
```

## Najważniejsze polecenia

Wymagany [Node.js](https://nodejs.org) 22.13+ (wersja LTS). Projekt nie ma zależności — `npm install` nie jest potrzebne.

| Polecenie | Działanie |
|---|---|
| `npm run panel` | panel i strona testowa na komputerze programisty: http://localhost:5050/panel/ |
| `npm test` | testy (m.in. 38 testów akceptacyjnych ze specyfikacji) |
| `npm run check` | zgodność wersji z `CHANGES.md` |
| `npm run bump -- <patch\|minor\|major> "Opis"` | nowa wersja + wpis w `CHANGES.md` |
| `npm run paczka` | paczka czatu do wgrania na własny serwer (`paczka/ilona/`) |
| `npm run check-site` | kontrola strony kliniki (linki, ceny, telefon, godziny) |

Każda zmiana: `npm test` → `npm run bump -- patch "Opis zmiany"` → commit → push. Strona aktualizuje się sama po ok. minucie, a jeśli testy nie przejdą, publikacja jest wstrzymana.

Historia zmian: [CHANGES.md](CHANGES.md).
