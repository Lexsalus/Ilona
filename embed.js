/*
 * Czat „Ilona” — lekarzeiterapeuci.pl. Jedyny skrypt, który wkleja się na stronę www.
 * Wklej na stronie (np. przed </body>):
 *   <script src="https://lexsalus.github.io/Ilona/embed.js" defer></script>
 * Atrybuty opcjonalne:
 *   data-panel="https://…workers.dev"  — serwer panelu (ustawienia na żywo + rejestr rozmów);
 *                                         bez niego czat czyta settings.json obok tego skryptu
 *   data-title, data-accent="#2e2787", data-position="left", data-open="true"
 * Szczegóły: docs/WDROZENIE.md.
 */
(function () {
  var script = document.currentScript;
  var core = new URL('chat/embed-core.js', script.src).href;
  import(core)
    .then(function (m) { return m.start(script); })
    .catch(function (err) { console.error('[Ilona] nie udało się wczytać czatu', err); });
})();
