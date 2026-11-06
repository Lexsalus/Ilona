# Instrukcja obsługi panelu — czat Ilona

Dla osoby, która na co dzień opiekuje się czatem: zmienia ceny, teksty, komunikaty i wygląd — bez programowania. Uruchomienie panelu, serwer i sprawy techniczne opisuje [ADMINISTRATOR.md](ADMINISTRATOR.md).

## Spis treści

1. [Otwarcie panelu](#1-otwarcie-panelu)
2. [Zakładki](#2-zakładki)
3. [Typowe zadania krok po kroku](#3-typowe-zadania-krok-po-kroku)
4. [Czego czat nigdy nie robi](#4-czego-czat-nigdy-nie-robi)
5. [Słowniczek](#5-słowniczek)
6. [Pytania i odpowiedzi](#6-pytania-i-odpowiedzi)
7. [Czat oczami pacjenta](#7-czat-oczami-pacjenta)

---

## 1. Otwarcie panelu

1. Otwórz w przeglądarce **https://lexsalus.github.io/Ilona/panel/** (najlepiej dodaj do zakładek).
2. Pole **Repozytorium** jest już wypełnione (`Lexsalus/Ilona`). W polu **Token GitHub** wklej swój token (jak go zdobyć — niżej) i kliknij **Zaloguj**.
3. Zmieniaj ustawienia i kliknij **Zapisz zmiany**. Ustawienia zapisują się w repozytorium na GitHubie, a czat na stronie zmienia się sam **po ok. 1–2 minutach** (najpierw automatycznie przechodzą testy). Przeglądarki pacjentów mogą jeszcze do 10 minut pokazywać poprzednią wersję.
4. Po pracy: **Wyloguj** (na cudzym komputerze — zawsze).

Bez tokenu panel nie wpuszcza — przypadkowa osoba, która trafi na adres panelu, niczego nie zmieni.

### Token GitHub (jednorazowo)

1. Zaloguj się na GitHubie kontem, które ma dostęp do repozytorium czatu.
2. Otwórz **https://github.com/settings/personal-access-tokens/new**.
3. **Token name:** np. „Panel Ilona”; **Expiration:** np. 1 rok (po wygaśnięciu zrobisz nowy).
4. **Resource owner:** `Lexsalus`; **Repository access** → **Only select repositories** → `Lexsalus/Ilona`.
5. **Permissions** → **Repository permissions** → **Contents** → **Read and write** (nic więcej nie zaznaczaj).
6. **Generate token** i skopiuj go (zaczyna się od `github_pat_`) — GitHub pokazuje go tylko raz.

Token traktuj jak hasło. Panel pamięta go do zamknięcia karty, a po zaznaczeniu **„Zapamiętaj na tym komputerze”** — na stałe w tej przeglądarce (tylko na własnym komputerze). Zgubiony albo podejrzany token usuwasz na tej samej stronie GitHuba (**Settings → Developer settings → Personal access tokens**). Każdy zapis widać w historii repozytorium jako zmianę „Ustawienia czatu — zapis z panelu” z nazwą Twojego konta — w razie pomyłki administrator może ją cofnąć.

> **Wskazówki:** przy większości pól jest ikonka **?** — najedź na nią myszą (albo stuknij na telefonie), żeby zobaczyć krótkie wyjaśnienie.

**Zmiany zapisuje przycisk „Zapisz zmiany”** (u góry, po prawej). Dopóki go nie klikniesz, widać napis „Niezapisane zmiany”, a „Cofnij” przywraca poprzednie ustawienia.

**Podgląd czatu** z prawej strony pokazuje czat tak, jak zobaczy go pacjent — od razu z niezapisanymi zmianami. Można w nim pisać; „Od nowa” zaczyna rozmowę od powitania. Przycisk „Podgląd czatu” w górnym pasku go chowa.

---

## 2. Zakładki

Zakładki są w czterech kolorowych grupach (ten sam kolor ma pasek przy tytule otwartej zakładki):

| Grupa | Zakładka | Do czego |
|---|---|---|
| **Działanie** (indygo) | **Bezpieczeństwo** | Telefon wsparcia w komunikacie kryzysowym (B) i to, co dzieje się po nim |
| | **Rejestracja rozmów** | Co zapisujemy z rozmów i jak długo (decyzja administratora — RODO) |
| **Odpowiedzi** (zielony) | **Własne odpowiedzi** | Odpowiedź na pytanie, które się powtarza |
| | **Odpowiedzi wbudowane** | Popraw tekst gotowej odpowiedzi |
| | **Tematy** | Słowa, po których czat rozpoznaje temat; przyciski dodatkowe; **słowa alarmowe** (112) |
| | **Komunikaty** | Krótka informacja w czacie z datą od–do (np. święta) |
| **Wygląd i usługi** (różowy) | **Usługi i przyciski** | Ceny, kolory kafelków, przyciski pod odpowiedziami, wygląd kafelków |
| | **Strona i wygląd** | Telefon, godziny, e-mail, powitanie, logo, kolor czatu, adresy podstron |
| **Analiza** (złoty) | **Rozmowy** | O co pytają pacjenci i na co czat nie umiał odpowiedzieć (gdy rejestracja jest włączona) |
| | **Kontrola strony** | Czy linki, ceny i telefon w odpowiedziach zgadzają się ze stroną kliniki |

**Rytm pracy (zalecany):**

- **co tydzień:** Rozmowy → filtr „Bez odpowiedzi” → dla powtarzających się pytań dopisz słowa w „Tematach” albo dodaj własną odpowiedź,
- **po e-mailu z GitHuba „Kontrola strony kliniki — failed”:** Kontrola strony → popraw wskazane linki lub ceny,
- **przed świętami / zmianą godzin:** Komunikaty.

---

## 3. Typowe zadania krok po kroku

### Czat nie umie odpowiedzieć na pytanie (np. „czy macie parking?”)

1. **Własne odpowiedzi** → **+ Nowa**.
2. **Frazy** — po jednej w wierszu, krótko (min. 3 znaki): `parking`, `gdzie zaparkować`.
3. **Odpowiedź asystentki** — np. „Konsultacje odbywają się online (telefon lub wideo), więc nie trzeba przyjeżdżać do placówki.”
4. (Opcjonalnie) **Przyciski z linkami**: `Jak to działa? | https://lekarzeiterapeuci.pl/jak-to-dziala`
5. W polu **Sprawdź odpowiedź** wpisz pytanie tak, jak napisałby pacjent → **Sprawdź**.
6. **Zapisz zmiany**.

Wskazówka: gwiazdka na końcu frazy łapie odmiany — `parking*` → „parkingu”, „parkingiem”.

### Pacjent pisze innym słowem (np. „rwa kulszowa”) i czat nie rozpoznaje tematu

1. **Tematy** → wyszukaj temat (np. „Inny specjalista”) → rozwiń.
2. Dopisz słowa po przecinku — gwiazdka na końcu = dowolna końcówka: `rw* kulszow*` łapie „rwa / rwę / rwy kulszową”.
3. W polu **Sprawdź pytanie** (na górze zakładki) wpisz pytanie pacjenta → zobaczysz temat i kafelki.
4. **Zapisz zmiany**. Kliknięcie słowa domyślnego je wyłącza (przekreślone), ponowne — przywraca.

### Zmienił się tekst odpowiedzi

1. **Odpowiedzi wbudowane** → wyszukaj temat (np. „L4”) → rozwiń.
2. W polu **Twoja wersja** wpisz nowy tekst. Pola w nawiasach klamrowych (`{telefon}`, `{imie}`, `{cena}`…) czat uzupełnia sam — zostaw je.
3. Jeśli zmienił się też link — zaznacz **Zmień też linki pod odpowiedzią**.
4. **Zapisz zmiany**. „Przywróć domyślną” cofa zmianę.

Teksty alarmowe (112, kryzys) są zablokowane — zmienia je programista po zatwierdzeniu przez lekarza.

### Zmieniła się cena usługi albo kolor kafelka

1. **Usługi i przyciski** → przy usłudze wpisz nową **cenę** (np. `od 59 zł`), wybierz **kolor** kafelka i kolor ceny (auto albo z palety); „sam obrys” = kafelek biały z kolorową ramką.
2. Niżej, w **Przyciski pod odpowiedziami**, ustalisz, które kafelki pokazuje każdy rodzaj odpowiedzi (A–M).
3. Sprawdź w **podglądzie czatu** → **Zapisz zmiany**.

Czerwony kolor jest zarezerwowany dla przycisku 112. Po zmianie ceny sprawdź w „Kontroli strony”, czy zgadza się ze stroną kliniki.

### Wygląd kafelków (wysokość, wyśrodkowanie, czcionka)

**Usługi i przyciski** → sekcja **Wygląd kafelków**: *Dopasuj wysokość do zawartości*, *Pojedynczy kafelek dopasowany do treści* (domyślnie włączone), *Cienie pod kafelkami* (kolorowy cień pod kafelkiem; domyślnie włączone), *Wyśrodkuj w poziomie* / *w pionie*, *Równe odstępy w pionie*, *Szerokość dopasowana do tekstu*, *Bez przenoszenia pojedynczych liter*, wielkość czcionki, **wielkość ikon** (12–32 px, domyślnie 28 px), **odległość ikony od napisu** (automatycznie albo stała, w pikselach), marginesy i kolejność kafelków (np. najtańsze najpierw). Każdą zmianę od razu widać w podglądzie czatu.

### Słowa alarmowe (112) — dopisanie albo wyłączenie

1. **Tematy** → sekcja **Słowa alarmowe** na górze: grupa **B** (kryzys psychiczny) i **A** (zagrożenie życia, zatrucie, przedawkowanie).
2. Dopisz frazę po przecinku (np. `za duzo dopalacz*`); znak `=` na początku wyłącza tolerancję literówek (np. `=nie moge mowic`, żeby nie łapać „nie mogę umówić”).
3. Kliknięcie frazy domyślnej ją wyłącza — panel pyta o potwierdzenie.
4. **Każdą zmianę powinien zatwierdzić lekarz.** Lepiej uruchomić alarm za często niż za rzadko.

### Co dzieje się po komunikacie kryzysowym (B)

**Bezpieczeństwo** → **Tryb kryzysowy po komunikacie B**. Domyślnie: *Nigdy* — kolejne niejasne pytanie dostaje zwykłe „Nie jestem pewna…” z kafelkami usług. Można włączyć powtarzanie komunikatu B (tylko przy niejasnych wiadomościach albo także przy pytaniach spoza tematu), wpisać ile razy (0 = do końca rozmowy) i zdecydować, czy konkretne pytanie kończy ten tryb. Wiadomość z frazą kryzysową zawsze dostaje komunikat B.

W tej samej zakładce: **telefon wsparcia** 116 123 / 116 111 w komunikacie B (domyślnie wyłączony — decyzja właściciela serwisu).

### Komunikat w czacie (np. „24–26.12 infolinia nieczynna”)

**Komunikaty** → **+ Dodaj komunikat** → tekst i daty od–do (puste = bez ograniczenia) → **Zapisz zmiany**. Komunikat pojawia się i znika sam.

### Zmiana telefonu, godzin, powitania albo logo

**Strona i wygląd** → popraw pole (puste = wartość domyślna) → sprawdź w podglądzie → **Zapisz zmiany**. Telefon, e-mail i godziny trafiają też do odpowiedzi czatu i do kontroli strony. Logo i miniatura: PNG/JPG/WebP do ok. 150 KB.

### Kontrola strony pokazuje błąd

1. **Kontrola strony** → sekcja **Do sprawdzenia**.
2. Każda karta pokazuje: który link, co jest nie tak, **gdzie jest używany** i **jak poprawić**.
3. Popraw link we wskazanym miejscu → **Zapisz zmiany** → **Sprawdź teraz**.
4. Brakujący fakt (np. „Cena: psycholog 169 zł”) oznacza, że na stronie jest inna cena — popraw ją w „Usługi i przyciski”.

### Kopia zapasowa (Eksport i Import)

1. **Eksport** (górny pasek) — pobiera plik `ustawienia-asystentki-RRRR-MM-DD.json` ze **wszystkimi** ustawieniami panelu. Zachowaj go jako kopię.
2. Żeby przywrócić: **Import** → wybierz plik → sprawdź ustawienia w zakładkach → **Zapisz zmiany**.

### Testy od zera (Dev reset)

Przycisk **Dev reset** (górny pasek) czyści pamięć przeglądarki (historie czatów, rozmowy i ustawienia trybu lokalnego, preferencje panelu) i przywraca ustawienia domyślne. W trybie lokalnym od razu; przy serwerze i pliku domyślne pojawiają się jako **niezapisane zmiany** — trafią na stronę dopiero po „Zapisz zmiany” („Cofnij” je odrzuca). Logowanie zostaje.

---

## 4. Czego czat nigdy nie robi

To celowe zabezpieczenia — nie da się ich wyłączyć w panelu:

- **nie stawia diagnoz, nie dobiera leków ani dawek**, nie interpretuje wyników badań — kieruje do lekarza,
- przy objawach **stanu nagłego** (ból w klatce piersiowej, duszność, objawy udaru, przedawkowanie, myśli samobójcze…) zawsze pokazuje czerwoną kartę z **112** — przed jakąkolwiek inną odpowiedzią, także własną (w panelu można tylko dopisać lub wyłączyć pojedyncze **słowa alarmowe** — za zgodą lekarza),
- **nie udaje człowieka** — przedstawia się jako wirtualna konsultantka,
- **nie wysyła imienia pacjenta** poza jego przeglądarkę,
- nie pokazuje linków innych niż `https://`, `tel:`, `mailto:`.

Własne odpowiedzi też powinny tego przestrzegać: pisz „do jakiego specjalisty / do której usługi”, a nie „co to może być”.

---

## 5. Słowniczek

| Pojęcie | Znaczenie |
|---|---|
| **Bot** | Czat działający na słowach kluczowych — w całości w przeglądarce pacjenta, bezpłatny i przewidywalny |
| **Przypadek A–M** | Rodzaj odpowiedzi ze specyfikacji czatu, np. A — stan nagły (112), B — kryzys psychiczny, D — dolegliwość, F — L4, J — cennik, L — niejasne pytanie |
| **Kafelek** | Kolorowy przycisk usługi z ceną pod odpowiedzią — prowadzi do zakupu |
| **Temat** | Kategoria pytania, np. „Dermatologia”, „L4”, „Cennik” |
| **Fraza / słowo kluczowe** | Słowo lub kilka słów, po których czat rozpoznaje temat albo własną odpowiedź; `*` na końcu = dowolna końcówka |
| **Słowa alarmowe** | Frazy, które od razu uruchamiają czerwoną kartę z 112 (zakładka „Tematy”) |
| **Tryb kryzysowy** | Zachowanie czatu po komunikacie B (zakładka „Bezpieczeństwo”) |
| **Odpowiedź wbudowana** | Gotowa odpowiedź ze specyfikacji; można ją zmienić w panelu |
| **Komunikat** | Krótka informacja na górze czatu, widoczna między datą od a do |
| **Rejestr rozmów** | Zapis pytań i odpowiedzi według poziomu rejestracji (domyślnie wyłączony) |
| **Kontrola strony** | Sprawdzenie, czy linki, ceny i telefon w odpowiedziach zgadzają się ze stroną kliniki |
| **Dev reset** | Przycisk do testów: czyści pamięć przeglądarki i przywraca ustawienia domyślne |

---

## 6. Pytania i odpowiedzi

**Czy zmiana w panelu od razu działa na stronie?**
Po kliknięciu „Zapisz zmiany” — po ok. 1–2 minutach (GitHub najpierw uruchamia testy, potem publikuje). Przeglądarki, także Twoja, mogą jeszcze do 10 minut pokazywać poprzednią wersję: odśwież stronę z pominięciem pamięci (Ctrl+F5, na Macu Cmd+Shift+R; na telefonie zamknij i otwórz kartę). Zmiany niezapisane widać od razu w podglądzie czatu w panelu.

**Czy mogę coś zepsuć?**
Panel sprawdza każde pole przed zapisem (np. odrzuca złe linki). Alarmu 112 nie da się wyłączyć — najwyżej pojedyncze słowa alarmowe (panel pyta o potwierdzenie). W najgorszym razie: „Przywróć domyślne” przy zmienionym elemencie, „Cofnij” przed zapisem, Import wcześniejszego eksportu albo „Dev reset”.

**Czat odpowiada źle na konkretne pytanie — co zrobić najszybciej?**
Dopisz słowo z tego pytania do właściwego tematu („Tematy”) albo dodaj własną odpowiedź z tą frazą — działa od razu po zapisaniu.

**Czat zawsze odpowiada „Nie jestem pewna…”**
Najpierw Ctrl+F5 (stara wersja w pamięci przeglądarki), potem „Dev reset” (ustawienia zapisane w tej przeglądarce). Jeśli dotyczy tylko niektórych pytań — dopisz słowa w „Tematach” (pole „Sprawdź pytanie” pokaże efekt).

**Czy widzę, kto pisał?**
Nie. Imię pacjenta nie jest zapisywane, adresy IP też nie. Rozmowy są oznaczone tylko losowym numerem.

**Jak przetestować coś, nie zmieniając strony kliniki?**
Wprowadź zmiany **bez zapisywania** i sprawdź je w **podglądzie czatu** po prawej stronie panelu — pokazuje niezapisane zmiany. Nie pasuje? **Cofnij**. Strona kliniki zmienia się dopiero po „Zapisz zmiany”.

---

## 7. Czat oczami pacjenta

**Komputer.** Okrągły przycisk w prawym dolnym rogu strony otwiera okno czatu. W nagłówku są dwa przyciski:

| Przycisk | Działanie |
|---|---|
| **_** (minimalizuj) | Chowa czat do okrągłej ikony; rozmowa zostaje — po kliknięciu ikony wraca w tym samym miejscu. Tak samo działa klawisz **Esc**. |
| **×** (zamknij) | Kończy rozmowę: czyści ją razem z imieniem i zamyka czat. Po ponownym otwarciu czat zaczyna od ekranu powitalnego. Bez pytania o potwierdzenie. |

W niskim oknie przeglądarki (mały laptop, powiększona strona) czat zajmuje prawie całą wysokość i ma zwarty układ.

**Telefon.** Czat otwiera się **na cały ekran** (bez przycisku powiększania) — także na iPhonie obróconym poziomo, z pomniejszoną stroną czy w trybie „wersja na komputer”. Dodatkowo:

- strona kliniki pod czatem się nie przewija — przesuwanie palcem przewija tylko rozmowę; po zwinięciu czatu strona wraca w to samo miejsce,
- klawiatura nie wyskakuje sama po otwarciu — dopiero po stuknięciu w pole; okno dopasowuje się wtedy do miejsca nad klawiaturą,
- nagłówek, dymki i kafelki są nieco mniejsze, żeby na ekranie mieściło się więcej.

**Dopisek na dole** „W nagłym zagrożeniu życia dzwoń **112 lub 999**” jest zawsze widoczny (numery na czerwono). Rozmowa jest pamiętana tylko do zamknięcia karty przeglądarki.

**Gdy coś wygląda „po staremu”** po zmianie w panelu albo nowej wersji czatu — przeglądarka pacjenta może do 10 minut używać poprzedniej wersji. Wystarczy odczekać albo odświeżyć stronę z pominięciem pamięci.

