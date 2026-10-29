# opencode: atomowa wymiana plików JSON

Branch: `wersja-inzynierska-2026`. Stan bazowy: `dev` / `fee476bb90043a1012abda156dd9af9e5c71b19d`. Data wykonania: 29.10.2026.

To autorski wariant rozwojowy konkretnego fragmentu projektu. Branch zachowuje pełne drzewo kodu z wersji bazowej i zawiera opisane poniżej zmiany. [Wcześniejszy audyt](https://github.com/MichalGarnuch/opencode/tree/audyt-edukacyjny-2026) jest na osobnym branchu. Nie wykonywano merge ani wdrożenia.

## Awaria, która zostawia poprawny dokument

Bezpośredni zapis konfiguracji może uciąć poprzedni plik, zanim nowa zawartość będzie gotowa. Błąd serializacji, przerwanie procesu lub drugi piszący proces może pozostawić pusty albo częściowy JSON.

W `packages/core/src/util/atomic-json.ts` serializacja następuje przed otwarciem pliku. Nowa zawartość trafia do losowego pliku tymczasowego w tym samym katalogu, tworzonego wyłącznie (`wx`). Po pełnym zapisie, synchronizacji pliku i zamknięciu uchwytu następuje `rename` na ścieżkę docelową. Czytelnik finalnej ścieżki widzi poprzedni albo kompletny nowy dokument.

## Szczegóły, które łatwo przeoczyć

Ten sam katalog zapewnia wymianę w ramach jednego systemu plików. Nowy plik domyślnie ma 0600. Przy zastępowaniu zachowuję poprzednie bity uprawnień, a jawny `mode` ma pierwszeństwo; dodatkowe chmod zapobiega zmianie tych bitów przez umask. Nie zachowuję w ten sposób właściciela, ACL ani rozszerzonych atrybutów.

Istniejące dowiązanie symboliczne nadal wskazuje na ten sam cel. Obsłużony jest również cel jeszcze nieistniejący i ograniczenie długości łańcucha linków. Na błędzie plik tymczasowy jest usuwany. Po nagłym zabiciu procesu może zostać osierocony plik tymczasowy — nie stanie się on jednak dokumentem finalnym.

`FSUtil.writeJson` opakowuje nową operację w `Effect.tryPromise` i zachowuje domenowy typ błędu. Pozostałe operacje zapisu i struktura danych nie są globalnie przebudowane. To implementacja dla rzeczywistego systemu plików Node używanego przez core; integrację z ewentualnymi alternatywnymi adapterami trzeba osobno zweryfikować.

## Semantyka współbieżności

Dwa kompletne zapisy mogą się zastąpić: ostatni rename wygrywa. To atomowa widoczność, nie kontrola konfliktów ani scalanie dokumentów. Jeżeli zapis zależy od odczytanej wersji, potrzebny jest mutex/wersjonowanie i compare-and-swap wyżej. `fsync` pliku nie zastępuje synchronizacji katalogu, więc nie obiecuję pełnej trwałości rename po utracie zasilania. Sieciowe i nietypowe systemy plików wymagają osobnego testu.

## Test i następny etap

Test Bun zapisuje rzeczywiste pliki: nieudana serializacja BigInt zachowuje poprzedni dokument, 20 równoczesnych zapisów daje kompletny JSON, link działa, bity uprawnień są zachowane i brakujący cel dowiązania zostaje utworzony. Przed rebase do upstreamu potrzebny jest pełny zestaw core i testy Windows oraz awarii procesu w każdej fazie zapisu.

## Weryfikacja wykonana w tej sesji

| Sprawdzenie | Wynik i znaczenie |
|---|---|
| Bun 1.3.13: test/atomic-json.test.ts w packages/core | PASS: 1 test, 8 asercji, rzeczywisty filesystem |

### Granice weryfikacji

Nie wykonano pełnego builda ani testów całego monorepo. Brak testu awarii zasilania, Windows, NFS i alternatywnych implementacji Effect FileSystem. Nie zapewniono rozwiązywania konfliktów równoczesnych edycji ani zachowania ACL/właściciela.

## Mapa zmian

- [`packages/core/src/util/atomic-json.ts`](packages/core/src/util/atomic-json.ts)
- [`packages/core/test/atomic-json.test.ts`](packages/core/test/atomic-json.test.ts)
- [`packages/core/src/fs-util.ts`](packages/core/src/fs-util.ts)
