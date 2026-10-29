# opencode — przewodnik i audyt edukacyjny

**Stan przeglądu:** 29 października 2026 r.  
**Gałąź bazowa:** `dev`  
**Analizowany commit:** `fee476bb90043a1012abda156dd9af9e5c71b19d`  
**Mapa wszystkich plików śledzonych przez Git:** [1](AUDYT_MAPA_01.md) · [2](AUDYT_MAPA_02.md) · [3](AUDYT_MAPA_03.md) · [4](AUDYT_MAPA_04.md) · [5](AUDYT_MAPA_05.md) · [6](AUDYT_MAPA_06.md) · [7](AUDYT_MAPA_07.md) · [8](AUDYT_MAPA_08.md) · [9](AUDYT_MAPA_09.md) · [10](AUDYT_MAPA_10.md) · [11](AUDYT_MAPA_11.md) · [12](AUDYT_MAPA_12.md) · [13](AUDYT_MAPA_13.md) · [14](AUDYT_MAPA_14.md) · [15](AUDYT_MAPA_15.md) · [16](AUDYT_MAPA_16.md) · [17](AUDYT_MAPA_17.md) · [18](AUDYT_MAPA_18.md) · [19](AUDYT_MAPA_19.md) · [20](AUDYT_MAPA_20.md) · [21](AUDYT_MAPA_21.md) · [22](AUDYT_MAPA_22.md) · [23](AUDYT_MAPA_23.md)

> To jest przegląd reprezentatywnych części projektu z inwentaryzacją wszystkich śledzonych plików, a nie pełna, ręczna weryfikacja każdego wiersza ani certyfikat bezpieczeństwa. Mapa jest automatyczna; wymienienie pliku nie oznacza, że został przetestowany lub dokładnie przeczytany. Wyniki odnoszą się do powyższego commita. Inne gałęzie mogą zawierać inne wersje.

## Co robi projekt

Fork OpenCode: monorepo agenta programistycznego z klientami, serwerem i pakietami protokołu.

## Jak czytać kod i jak przepływają dane

[`packages/opencode/`](packages/opencode) zawiera wykonanie CLI i logikę sesji, [`packages/core/`](packages/core) współdzieloną domenę, [`packages/server/`](packages/server) warstwę serwera, [`packages/client/`](packages/client) klienta, a [`packages/app/`](packages/app) i [`packages/desktop/`](packages/desktop) interfejsy.

Podczas czytania zacznij od punktu wejścia, przejdź do funkcji odpowiadającej za żądanie lub działanie użytkownika, a potem do operacji na danych i wyniku. Mapa plików podaje ścieżki i automatycznie rozpoznane nazwy wybranych deklaracji.

## Co jest wartościowe w obecnym rozwiązaniu

Repozytorium wyraźnie opisuje dozwolone kierunki zależności Schema → Core/Protocol → Server w głównym [`AGENTS.md`](AGENTS.md), co pomaga ograniczać sprzężenia.

## Ustalenia, luki i proponowany rozwój

- **Zakres:** to fork `anomalyco/opencode`, liczący kilka tysięcy plików. Przegląd objął strukturę, konfigurację i workflowy, nie każdy dostawca modeli ani granicę uprawnień.

- **Potwierdzone — testy:** główny [`package.json`](package.json) celowo kończy `npm/bun test` w katalogu głównym błędem; testy należy uruchamiać z właściwego pakietu zgodnie z [`AGENTS.md`](AGENTS.md).

- **Do rozwoju:** zarządzać synchronizacją z upstreamem, testować granice uprawnień narzędzi i wykonywania poleceń oraz weryfikować, jakie dane trafiają do modeli. Publikacja z workflowów dotyczy wskazanych gałęzi/tagów; zewnętrznych integracji nie sprawdzano.

## Sprawdzenia i ich granice

Nie uruchomiono Bun ani testów pakietów: brak tego środowiska i pełnych zależności. Przegląd nie potwierdza bezpieczeństwa projektu.

W kopii roboczej dostępne pliki Pythona sprawdzono dodatkowo parserem składni; sprawdzono też składnię odczytanych plików [`package.json`](package.json) i `composer.json`. Nie zastępuje to uruchomienia programu. Kod źródłowy tej gałęzi jest taki sam jak w commicie bazowym; dodane są wyłącznie dokumenty audytu i mapy.

## Jak zaplanować kolejne prace

Najpierw zajmij się punktami oznaczonymi jako krytyczne lub wysokie, następnie ustal, które uwagi wymagają testu na pełnym środowisku. Dla każdej zmiany przygotuj osobną gałąź, konkretny przypadek odtwarzający problem i test rezultatu. Nie traktuj propozycji jako potwierdzenia, że poprawka została już wdrożona.
