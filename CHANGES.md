# Historia zmian

Czat „Ilona” ma jeden numer wersji w formacie `MAJOR.MINOR.PATCH` (plik `chat/version.js`):

- **PATCH** (1.0.**1**) — poprawka bez zmiany zachowania dla pacjenta (literówka, styl, drobny błąd).
- **MINOR** (1.**1**.0) — nowa wiedza lub funkcja (nowe słowa kluczowe, nowa usługa, nowa zakładka panelu).
- **MAJOR** (**2**.0.0) — zmiana zasad działania czatu.

Nowy wpis dodaje polecenie: `npm run bump -- <patch|minor|major> "Opis zmiany"`.
Zgodność wersji z tym plikiem sprawdza `npm run check` (także automatycznie przy każdym pushu).

<!-- NEW ENTRIES BELOW -->

## 2026-11-05

### 1.2.13
- iPhone: pełny ekran także na starszym iOS (wysokość 100vh, gdy brak dvh)

### 1.2.12
- Telefon: czat na cały ekran także przy szerokości do 600 px (mały „rozmiar wyświetlania”) i w poziomie

### 1.2.11
- Style czatu z numerem wersji w adresie — po aktualizacji przeglądarka nie używa starych stylów

### 1.2.10
- Dopisek o 112: numery „112 lub 999” znów na czerwono

### 1.2.9
- Przycisk pełnego ekranu tylko na telefonie (na komputerze ukryty)

### 1.2.8
- Przycisk pełnego ekranu „□” (ponowne kliknięcie przywraca rozmiar); treść na środku w czytelnej szerokości; zwarty nagłówek z trzema przyciskami

### 1.2.7
- Niskie okno przeglądarki: czat zajmuje prawie całą wysokość, zwarty nagłówek, kafelki i pole wpisywania; cienki pasek przewijania

### 1.2.6
- „×” kończy rozmowę i zamyka czat (po otwarciu — od nowa), „_” tylko minimalizuje

### 1.2.5
- Przycisk „_” obok zamknięcia — minimalizuje czat do ikony

### 1.2.4
- Domyślna wielkość ikon na kafelkach: 28 px

### 1.2.3
- Okno czatu bez poziomego paska przewijania (cienie kafelków przy prawej krawędzi są przycinane)

### 1.2.2
- Panel: wielkość ikon na kafelkach (12–32 px, domyślnie największa) i odległość ikony od napisu (automatycznie albo 0–30 px)

### 1.2.1
- Cień kafelków jak w projekcie: pasek w kolorze usługi po prawej stronie, do następnego kafelka, zwężający się u góry i u dołu

### 1.2.0
- Wygląd „premium”: kafelki z ikonami, ceną w pigułce i kolorowym cieniem (przełącznik w panelu, domyślnie włączony), szeroki przycisk „Umów wizytę”, nowy nagłówek i kolory usług

## 2026-10-21

### 1.1.2
- Nowy adres po zmianie nazwy konta GitHub: lexsalus.github.io/Ilona

## 2026-10-18

### 1.1.1
- Instrukcja wgrania czatu na własny serwer (docs/WDROZENIE.md) i polecenie npm run paczka

## 2026-10-15

### 1.1.0
- Podgląd strony kliniki z czatem Ilona (demo/) — strona główna publikacji prowadzi do niego; strona testowa przeniesiona do test.html

### 1.0.1
- Poprawki z audytu: frazy alarmowe, CSV bez formuł, ochrona rejestru i blokada haseł w bazie, walidacja kluczy, komunikaty w czasie lokalnym, kontrola strony, serwer lokalny, linki https, frazy min. 3 znaki, widżet

### 1.0.0
- Pierwsza wersja w repozytorium Ilona: czat (bot regułowy) z ustawieniami domyślnymi ze specyfikacji „Ilona” v1.1 oraz panel administracyjny, kontrola strony kliniki, strona testowa i dokumentacja.
