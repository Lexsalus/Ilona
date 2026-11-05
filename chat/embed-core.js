// Uruchamia czat Ilona na podstawie jego tagu <script> (embed.js w katalogu głównym).
// Czyta atrybuty data-*, wczytuje ustawienia (serwer panelu → plik settings.json → domyślne),
// ładuje silnik bota i montuje widżet.
import { mountWidget } from './ui/widget.js';
import { botEngine } from './engine/bot-engine.js';
import { initPanel } from './settings/client.js';
import { PANEL_CONFIG } from './config.js';
import { VERSION } from './version.js';

export async function start(script) {
  const data = { ...(script?.dataset || {}) };
  await initPanel({ endpoint: data.panel || PANEL_CONFIG.endpoint });
  const widget = mountWidget({
    engine: botEngine,
    // ?v=wersja — po aktualizacji przeglądarka pobiera nowe style zamiast starych z pamięci podręcznej.
    cssUrl: new URL(`./ui/widget.css?v=${VERSION}`, import.meta.url).href,
    title: data.title,
    accent: data.accent,
    position: data.position,
    open: data.open ? data.open === 'true' : undefined, // brak atrybutu = ustawienie z panelu
  });
  // Udostępnia stronie małe API, np. LTChat.open() wywołane z przycisku.
  window.LTChat = widget;
  return widget;
}
