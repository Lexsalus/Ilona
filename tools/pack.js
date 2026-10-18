// Paczka czatu do wgrania na własny serwer (np. hosting strony kliniki).
// Uruchom:  npm run paczka
// Tworzy folder paczka/ilona/ z samymi plikami potrzebnymi pacjentom:
//   embed.js, settings.json, chat/  (+ plik WGRAJ.txt z instrukcją).
// Panel, narzędzia, dokumentacja i testy NIE trafiają do paczki.
// Folder paczka/ jest w .gitignore — nie trafia do repozytorium.
import { cpSync, rmSync, mkdirSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { VERSION } from '../chat/version.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'paczka', 'ilona');

// Pliki i foldery czatu — jedyne, które ładuje strona www.
const ITEMS = ['embed.js', 'settings.json', 'chat'];

for (const item of ITEMS) {
  if (!existsSync(join(root, item))) {
    console.error(`Brak ${item} — paczka nie została utworzona.`);
    process.exit(1);
  }
}

rmSync(join(root, 'paczka'), { recursive: true, force: true });
mkdirSync(out, { recursive: true });
for (const item of ITEMS) cpSync(join(root, item), join(out, item), { recursive: true });

writeFileSync(
  join(out, 'WGRAJ.txt'),
  [
    `Czat „Ilona” — wersja ${VERSION}`,
    '',
    '1. Wgraj CAŁĄ zawartość tego folderu na serwer strony, do folderu /ilona/',
    '   (tak, aby plik był pod adresem https://twoja-domena.pl/ilona/embed.js).',
    '2. Na stronie, przed </body>, wklej jedną linijkę:',
    '   <script src="/ilona/embed.js" defer></script>',
    '   (jeśli wcześniej był adres github.io — zamień go na ten).',
    '3. Sprawdź: otwórz stronę, kliknij przycisk czatu, wpisz „cześć”.',
    '',
    'Aktualizacja ustawień (źródło „plik”): wgraj ponownie tylko settings.json.',
    'Aktualizacja wersji czatu: wgraj ponownie wszystko (nadpisz pliki).',
    'Ten plik (WGRAJ.txt) nie musi być na serwerze.',
    'Szczegóły: docs/WDROZENIE.md, rozdział 2.',
    '',
  ].join('\r\n'),
);

// Podsumowanie: liczba plików i rozmiar.
let files = 0;
let bytes = 0;
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p);
    else {
      files++;
      bytes += s.size;
    }
  }
})(out);
console.log(`Paczka gotowa: paczka/ilona/ — Ilona ${VERSION}, ${files} plików, ${Math.round(bytes / 1024)} KB.`);
