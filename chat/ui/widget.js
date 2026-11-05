// Interfejs widżetu czatu, wspólny dla trzech asystentów.
// Dwa ekrany: (1) podanie imienia, (2) rozmowa z wirtualną konsultantką (SITE.assistant).
// Renderowany w Shadow DOM, żeby CSS strony go nie psuł
// (a nasz CSS nie psuł strony).
// Cały tekst pacjenta i modelu wstawiamy przez textContent — nigdy innerHTML.
import { respond } from '../core/pipeline.js';
import { SITE, TILES, textOf, replyFor, fill, activeNotices, orderTiles } from '../core/knowledge.js';
import { UI_TEXTS } from '../core/texts.js';
import { getPanelConfig, logTurn, logClick, newSessionId } from '../settings/client.js';
import { isSafeUrl } from '../settings/schema.js';

// Ikony — stałe SVG (bezpieczne do wstawienia przez innerHTML).
const ICON_BUBBLE =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4.5c4.4 0 7.5 2.9 7.5 6.6s-3.1 6.6-7.5 6.6c-.9 0-1.8-.1-2.6-.4L5.6 19l1-3.3C5.4 14.5 4.5 12.9 4.5 11.1 4.5 7.4 7.6 4.5 12 4.5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>';
const ICON_CLOSE =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
const ICON_MIN =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 16.5h11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
const ICON_SEND =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6.5l5.5 5.5-5.5 5.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

// Awatar w nagłówku: dymek z plusem (projekt „premium”).
const ICON_AVATAR =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v8.5a1.5 1.5 0 0 1-1.5 1.5H10l-4.5 3.5V17H5a1.5 1.5 0 0 1-1.5-1.5V7A1.5 1.5 0 0 1 5 5.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 8.6v5.3M9.35 11.25h5.3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
const ICON_ARROW =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6.5l5.5 5.5-5.5 5.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

// Ikony kafelków usług — stałe SVG (obrys w kolorze napisu kafelka). Klucz = usługa (SERVICES).
const svgIcon = (body) =>
  `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
const ICON_PILL = svgIcon('<rect x="3.2" y="8.6" width="17.6" height="6.8" rx="3.4" transform="rotate(-45 12 12)"/><path d="M9.6 9.6l4.8 4.8"/>');
const ICON_CALENDAR = svgIcon('<rect x="4" y="5.5" width="16" height="14.5" rx="2.5"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>');
const ICON_GENERIC = svgIcon('<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8.5v7M8.5 12h7"/>');
const TILE_ICONS = {
  wizyta: svgIcon('<path d="M6 3.5v5a4 4 0 0 0 8 0v-5"/><path d="M10 12.5v2.5a4.5 4.5 0 0 0 9 0v-2"/><circle cx="19" cy="11" r="1.8"/>'),
  recepta: ICON_PILL,
  kontynuacja: svgIcon('<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M19.5 4.5v4h-4"/>'),
  l4: svgIcon('<rect x="4" y="5.5" width="16" height="14.5" rx="2.5"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4M9 14.8l2 2 4-4"/>'),
  wyniki: svgIcon('<path d="M7 18v-5M12 18V7M17 18v-8"/>'),
  skierowanie: svgIcon('<path d="M9.5 3.5h5M10.5 3.5v6l-5 8.5a1.5 1.5 0 0 0 1.3 2.3h10.4a1.5 1.5 0 0 0 1.3-2.3l-5-8.5v-6"/><path d="M7.8 15h8.4"/>'),
  psychiatra: svgIcon('<path d="M8 20.5v-3.2a7 7 0 1 1 9-1.9V20.5"/><circle cx="12.2" cy="10" r="2.4"/><path d="M12.2 12.4v2"/>'),
  leki_psych: ICON_PILL,
  psycholog: svgIcon('<path d="M5 5h14a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 19 17h-8l-4.5 3.5V17H5a1.5 1.5 0 0 1-1.5-1.5v-9A1.5 1.5 0 0 1 5 5z"/><path d="M8.5 11h.01M12 11h.01M15.5 11h.01"/>'),
  dzien_po: svgIcon('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
  antykoncepcja: svgIcon('<rect x="3.5" y="6" width="17" height="12" rx="3"/><circle cx="8" cy="10.2" r=".9"/><circle cx="12" cy="10.2" r=".9"/><circle cx="16" cy="10.2" r=".9"/><circle cx="8" cy="13.8" r=".9"/><circle cx="12" cy="13.8" r=".9"/><circle cx="16" cy="13.8" r=".9"/>'),
  trt: svgIcon('<path d="M12 3.5c3 4 6 7.3 6 10.6a6 6 0 0 1-12 0C6 10.8 9 7.5 12 3.5z"/>'),
  otylosc: svgIcon('<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M8.5 10a4.5 4.5 0 0 1 7 0"/><path d="M12 10.5l1.3-1.6"/>'),
};
TILE_ICONS.terapeuta = TILE_ICONS.psycholog;

// Imię, obrazy i napisy pochodzą z SITE — domyślne wartości albo zmiany z panelu („Strona i wygląd”),
// nałożone przez initPanel() przed zamontowaniem widżetu.
const DEFAULT_AVATAR = new URL('../img/avatar.png', import.meta.url).href;
const DEFAULT_LOGO = new URL('../img/logo.png', import.meta.url).href;
const avatarUrl = () => SITE.avatar || DEFAULT_AVATAR;
const NAME_MAX = 40;

// Powitanie (przypadek M) z 6 szybkimi przyciskami — zanim pacjent cokolwiek napisze.
const greetingFor = (name) => ({
  role: 'bot',
  greeting: true, // powitanie z imieniem — nie trafia do historii ani rejestru rozmów
  text: textOf('M', { imie: `, ${name}` }),
  links: replyFor('powitanie').links,
  case: 'M',
});

/**
 * Montuje widżet na stronie.
 * @param {object} opts
 * @param {object} opts.engine   silnik z { name, label, version, ask() }
 * @param {string} opts.cssUrl   pełny adres chat/ui/widget.css
 * @param {string} [opts.title]  nazwa w nagłówku (domyślnie „Lekarze i Terapeuci”)
 * @param {string} [opts.accent] kolor przewodni (CSS) — przyciski i dymki pacjenta
 * @param {'left'|'right'} [opts.position]
 * @param {boolean} [opts.open]  otwarty od razu po załadowaniu
 * @param {HTMLElement} [opts.container] osadź w tym elemencie (strona demo)
 */
export function mountWidget(opts) {
  const { engine } = opts;
  const BOT_LABEL = SITE.assistant; // np. „Ilona”
  // Atrybuty data-* na stronie mają pierwszeństwo przed ustawieniami z panelu.
  const title = opts.title || SITE.title;
  const accent = opts.accent || SITE.accent;
  const position = opts.position || SITE.position;
  if (opts.open === undefined) opts.open = SITE.autoOpen;
  const storeKey = opts.storeKey || `lt-chat:${engine.name}`;
  const state = loadState(storeKey) || { open: !!opts.open, name: '', startedAt: 0, session: '', consent: false, messages: [] };
  // Stan przebiegu rozmowy dla pipeline: tryb kryzysowy i licznik niezrozumiałych pytań.
  state.flow = state.flow || { crisis: false, unclear: 0 };

  // --- Szkielet DOM ---------------------------------------------------------
  const host = document.createElement('div');
  host.className = 'lt-chat-host';
  const root = host.attachShadow({ mode: 'open' });
  const inline = Boolean(opts.container);

  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = opts.cssUrl;
  root.appendChild(css);

  const wrap = el('div', `chat ${inline ? 'inline' : 'floating'} ${position === 'left' ? 'left' : 'right'}${opts.fill ? ' fill' : ''}`);
  if (accent) wrap.style.setProperty('--accent', accent);
  applyTileStyle(wrap, TILES);
  wrap.dataset.variant = engine.name;
  wrap.dataset.version = engine.version;
  root.appendChild(wrap);

  const launcher = el('button', 'launcher');
  launcher.type = 'button';
  launcher.setAttribute('aria-label', `Otwórz czat — ${SITE.assistant}, wirtualna konsultantka`);
  launcher.innerHTML = ICON_BUBBLE;

  const panel = el('section', 'panel');
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', `${title} — ${SITE.assistant}, wirtualna konsultantka`);

  const closeBtn = el('button', 'close');
  closeBtn.type = 'button';
  closeBtn.setAttribute('aria-label', 'Zamknij czat i zakończ rozmowę');
  closeBtn.innerHTML = ICON_CLOSE;
  // „_” — minimalizuje okno do ikony czatu (rozmowa zostaje); „×” — kończy rozmowę i zamyka czat.
  const minBtn = el('button', 'close minimize');
  minBtn.type = 'button';
  minBtn.setAttribute('aria-label', 'Zminimalizuj czat');
  minBtn.title = 'Zminimalizuj';
  minBtn.innerHTML = ICON_MIN;
  closeBtn.title = 'Zamknij (rozmowa zacznie się od nowa)';
  // Przyciski w prawym górnym rogu: „_” i „×”.
  const winActions = () => {
    const box = el('div', 'win-actions');
    box.append(minBtn.cloneNode(true), closeBtn.cloneNode(true));
    return box;
  };

  // --- Ekran 1: imię ---------------------------------------------------------
  const intro = el('div', 'intro');
  const brand = el('div', 'brand');
  const logo = el('div', 'logo');
  logo.innerHTML = ICON_BUBBLE;
  brand.append(logo, el('span', 'brand-name', title));
  const introTop = el('div', 'intro-top');
  introTop.append(brand);
  if (!inline) introTop.append(winActions());

  const nameForm = el('form', 'intro-form');
  const h = el('h2', 'intro-title', fill(SITE.introTitle));
  const lead = el('p', 'intro-lead', fill(SITE.introLead));
  const nameId = `lt-name-${engine.name}`;
  const label = el('label', 'intro-label', 'Imię');
  label.htmlFor = nameId;
  const nameInput = el('input', 'intro-input');
  nameInput.id = nameId;
  nameInput.type = 'text';
  nameInput.autocomplete = 'given-name';
  nameInput.maxLength = NAME_MAX;
  nameInput.required = true;
  const start = el('button', 'primary', 'Rozpocznij rozmowę');
  start.type = 'submit';
  const hint = el('p', 'intro-hint', 'Twoje imię będzie widoczne w historii rozmowy.');
  // Zgoda na zapis treści rozmowy — pokazywana tylko, gdy panel ustawia poziom 2 lub 3.
  const logging = getPanelConfig().logging;
  const consentBox = el('label', 'consent');
  const consentInput = el('input');
  consentInput.type = 'checkbox';
  consentBox.append(
    consentInput,
    el(
      'span',
      '',
      `Zgadzam się na zapisanie treści tej rozmowy (bez mojego imienia, numerów i adresów e-mail) w celu ulepszania asystentki. ` +
        `Zapis jest usuwany po ${logging.retentionDays} dniach. Zgoda jest dobrowolna — czat działa także bez niej.`,
    ),
  );
  const privacy = el('a', 'consent-link', 'Polityka prywatności');
  privacy.href = `${SITE.base}/polityka-prywatnosci`;
  privacy.target = '_blank';
  privacy.rel = 'noopener';
  consentBox.lastChild.append(' ', privacy);
  nameForm.append(h, lead, label, nameInput);
  if (logging.level >= 2) nameForm.append(consentBox);
  nameForm.append(start, hint, sosNode(UI_TEXTS.emergencyFooter));
  // Logo kliniki w wolnym miejscu między nagłówkiem a formularzem.
  const introLogo = el('div', 'intro-logo');
  const logoImg = el('img');
  logoImg.src = SITE.logo || DEFAULT_LOGO;
  logoImg.alt = title;
  logoImg.decoding = 'async';
  introLogo.append(logoImg);
  intro.append(introTop, introLogo, nameForm);

  // --- Ekran 2: rozmowa ------------------------------------------------------
  const chatView = el('div', 'chat-view');
  const header = el('header', 'header');
  const avatar = el('div', 'avatar');
  avatar.innerHTML = ICON_AVATAR;
  avatar.append(el('span', 'status-dot'));
  const titleBox = el('div', 'title');
  titleBox.append(el('strong', '', title), el('span', 'subtitle', `${SITE.assistant} · wirtualna konsultantka · online`));
  header.title = `${engine.label} · ${engine.name} v${engine.version}`;
  header.append(avatar, titleBox);
  if (!inline) header.append(winActions());

  const log = el('div', 'log');
  log.setAttribute('aria-live', 'polite');

  const form = el('form', 'composer');
  const input = el('textarea', 'input');
  input.rows = 1;
  input.maxLength = 500;
  input.placeholder = SITE.placeholder || UI_TEXTS.placeholder;
  input.setAttribute('aria-label', 'Twoja wiadomość');
  const send = el('button', 'send');
  send.type = 'submit';
  send.setAttribute('aria-label', 'Wyślij');
  send.innerHTML = ICON_SEND;
  form.append(input, send);
  // Stały dopisek pod polem (specyfikacja, pkt 8.9) — widoczny zawsze.
  const sos = sosNode(UI_TEXTS.emergencyFooter);

  chatView.append(header, log, form, sos);
  panel.append(intro, chatView);
  wrap.append(panel);
  if (!inline) wrap.append(launcher);
  (opts.container || document.body).appendChild(host);

  // --- Wyświetlanie ----------------------------------------------------------
  function renderIntroLines() {
    log.append(el('div', 'day', formatDay(state.startedAt)));
    const notice = el('div', 'notice', 'Wirtualna konsultantka nie udziela porad medycznych. Infolinia: ');
    const tel = el('a', '', SITE.phone);
    tel.href = SITE.phoneHref;
    notice.append(tel);
    log.append(notice);
    // Komunikaty okresowe z panelu (np. „24–26.12 infolinia nieczynna”) — tylko w swoim terminie.
    for (const n of activeNotices()) log.append(el('div', 'announce', n.text));
  }

  function renderMessage(msg, animate = true) {
    const item = el('div', `msg ${msg.role}${msg.emergency ? ' emergency' : ''}${animate ? ' enter' : ''}`);
    if (msg.emergency) {
      // Karta alarmowa: zawsze rozwinięta, ogłaszana od razu czytnikom ekranu.
      item.setAttribute('role', 'alert');
      item.setAttribute('aria-live', 'assertive');
    }
    const who = msg.role === 'user' ? state.name : msg.title ? `${BOT_LABEL} · ${msg.title}` : BOT_LABEL;
    item.append(whoRow(who, msg.role !== 'user'));
    const bubble = el('div', 'bubble');
    appendLinkified(bubble, msg.text);
    item.append(bubble);

    if (msg.links?.length) {
      // Usługi — kolorowe kafelki z ceną (każda usługa w swoim kolorze, obrys = wariant);
      // informacje (cennik, kontakt, „Jaki specjalista?”) — małe szare przyciski; 112 — czerwony.
      const tiles = el('div', 'tiles');
      const links = el('div', 'links');
      // Kafelki usług w kolejności z ustawień panelu; podpowiedzi (szare) i 112 — na swoich miejscach.
      const isTile = (l) => l.kind !== 'alarm' && (l.tile || (l.main && l.kind !== 'info'));
      const ordered = [...orderTiles(msg.links.filter(isTile)), ...msg.links.filter((l) => !isTile(l))];
      for (const l of ordered) {
        const alarm = l.kind === 'alarm';
        const tile = !alarm && (l.tile || (l.main && l.kind !== 'info'));
        // „Umów wizytę” — szeroki przycisk pod kafelkami (ikona kalendarza i strzałka).
        const cta = tile && l.id === 'umow_wizyte';
        const cls = alarm ? 'link main k-alarm' : cta ? 'tile cta' : tile ? `tile${l.outline ? ' outline' : ''}` : 'link';
        const node = buttonNode(l, cls, tile, msg.case, cta);
        if (!node) continue;
        if (!alarm && !cta) paint(node, l.color, tile && !l.outline);
        (tile ? tiles : links).append(node);
      }
      if (tiles.children.length) {
        // „Pojedynczy kafelek dopasowany do treści” (szeroki „Umów wizytę” się nie liczy).
        tiles.classList.toggle('single', tiles.querySelectorAll('.tile:not(.cta)').length === 1);
        item.append(tiles);
        if (TILES.nobreak || TILES.pack) requestAnimationFrame(() => layoutTiles(tiles, TILES));
      }
      if (links.children.length) item.append(links);
    }
    if (msg.note && opts.showTech) item.append(el('div', 'note', msg.note));
    log.append(item);

    if (msg.chips?.length) renderChips(msg.chips);
    log.scrollTop = log.scrollHeight;
  }

  // Kolor przycisku z ustawień (tylko #rrggbb). Na jasnym kolorze napis ciemny — dla czytelności.
  function paint(node, color, filled) {
    if (!/^#[0-9a-f]{6}$/i.test(color || '')) return;
    node.style.setProperty('--k', color);
    if (filled && contrastWithWhite(color) < 3) node.style.setProperty('--k-ink', '#1d1d1f');
  }

  // Plakietka z ceną: kolor z panelu (napis biały albo ciemny — co czytelniejsze); brak = auto.
  function paintPrice(node, color) {
    if (!/^#[0-9a-f]{6}$/i.test(color || '')) return node;
    node.style.background = color;
    node.style.color = contrastWithWhite(color) < 3 ? '#1d1d1f' : '#fff';
    return node;
  }

  // Jeden przycisk: link (https/tel) albo pytanie zadawane w czacie (l.ask).
  // Kafelek: nazwa usługi + cena w drugiej linii („e-Recepta online · od 59 zł”).
  function buttonNode(l, cls, tile, caseId, cta = false) {
    let node;
    if (l.ask) {
      node = el('button', cls);
      node.type = 'button';
      node.addEventListener('click', () => {
        clicked(l.label, caseId);
        ask(l.ask);
      });
    } else {
      if (!isSafeUrl(l.url)) return null; // tylko https/tel/mailto — nigdy javascript:
      node = el('a', cls);
      node.href = l.url;
      if (!l.url.startsWith('tel:')) node.target = '_top'; // otwórz zakładkę na stronie kliniki
      node.addEventListener('click', () => clicked(l.label, caseId));
    }
    const [name, price] = String(l.label).split(' · ');
    if (cta) {
      const ico = el('span', 'cta-ico');
      ico.innerHTML = ICON_CALENDAR;
      const arrow = el('span', 'cta-arrow');
      arrow.innerHTML = ICON_ARROW;
      node.append(ico, el('span', 'tile-name', name), arrow);
    } else if (tile) {
      // Ikona usługi (stały SVG) w półprzezroczystym kwadracie, nazwa, cena w „pigułce”.
      node.append(tileIcon(l.svc), el('span', 'tile-name', name));
      if (price) node.append(paintPrice(priceNode(price), l.priceColor));
    } else {
      node.textContent = l.label;
    }
    return node;
  }

  function renderChips(chips) {
    log.querySelectorAll('.chips').forEach((c) => c.remove());
    const row = el('div', 'chips');
    for (const c of chips) {
      const b = el('button', 'chip', c);
      b.type = 'button';
      b.addEventListener('click', () => ask(c));
      row.append(b);
    }
    log.append(row);
  }

  function showTyping() {
    const t = el('div', 'msg bot typing');
    t.append(whoRow(`${BOT_LABEL} pisze…`, true));
    const b = el('div', 'bubble');
    b.append(el('i'), el('i'), el('i'));
    t.append(b);
    log.append(t);
    log.scrollTop = log.scrollHeight;
    return () => t.remove();
  }

  function renderConversation() {
    log.textContent = '';
    renderIntroLines();
    state.messages.forEach((m) => renderMessage(m, false));
  }

  function showScreen() {
    const hasName = Boolean(state.name);
    wrap.classList.toggle('has-name', hasName);
    if (hasName) renderConversation();
  }

  // --- Zachowanie ------------------------------------------------------------
  let busy = false;

  // Rejestr: kliknięty przycisk + przypadek A–M (bez treści rozmowy).
  function clicked(button, caseId) {
    logClick({ session: state.session, consent: state.consent, variant: engine.name, version: engine.version, button, caseId });
  }

  function startConversation(name, consent) {
    state.name = name;
    state.consent = consent;
    state.session = newSessionId();
    state.startedAt = Date.now();
    state.messages = [greetingFor(name)];
    state.flow = { crisis: false, unclear: 0 };
    saveState(storeKey, state);
    showScreen();
    input.focus({ preventScroll: true });
  }

  async function ask(text) {
    const message = text.trim();
    if (!message || busy || !state.name) return;
    busy = true;
    send.disabled = true;
    try {
      await askInner(message);
    } finally {
      // Nawet po nieoczekiwanym błędzie czat nie zostaje zablokowany.
      busy = false;
      send.disabled = false;
    }
    input.focus({ preventScroll: true });
  }

  async function askInner(message) {
    log.querySelectorAll('.chips').forEach((c) => c.remove());

    const userMsg = { role: 'user', text: message };
    state.messages.push(userMsg);
    renderMessage(userMsg);

    const stopTyping = showTyping();
    // Historia rozmowy dla silnika (bot jej nie używa — miejsce na przyszłe rozszerzenia):
    // bez powitania (zawiera imię) i bez bieżącego pytania.
    const history = state.messages
      .filter((m) => m !== userMsg && !m.greeting)
      .slice(-6)
      .map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }));

    const started = Date.now();
    state.flow.name = state.name || ''; // do {imie} w odpowiedziach (np. powitanie po „halo”)
    const reply = await respond(engine, message, history, state.flow);
    // Krótkie minimalne opóźnienie, żeby natychmiastowe odpowiedzi bota nie były zbyt nagłe.
    // Karta alarmowa — bez opóźnienia.
    if (!reply.emergency) await wait(Math.max(0, 600 - (Date.now() - started)));
    stopTyping();

    const botMsg = {
      role: 'bot',
      text: reply.text,
      links: reply.links,
      chips: reply.chips,
      title: reply.title,
      case: reply.case,
    };
    state.messages.push(botMsg);
    renderMessage(botMsg);
    // A i B: czerwona karta z 112 ZAWSZE jako ostatnia wiadomość — na dole, tuż nad polem wpisywania.
    if (reply.alarm) {
      const card = { role: 'bot', text: reply.alarm.text, links: reply.alarm.links, emergency: true, title: 'komunikat alarmowy', case: reply.case };
      state.messages.push(card);
      renderMessage(card);
      log.scrollTop = log.scrollHeight;
    }
    state.messages = state.messages.slice(-40);
    saveState(storeKey, state);

    // Rejestr rozmów (zakres zależy od poziomu z panelu i zgody pacjenta; imię nigdy nie jest wysyłane).
    logTurn({ session: state.session, consent: state.consent, variant: engine.name, version: engine.version, question: message, reply });
  }

  function setOpen(open) {
    state.open = open;
    wrap.classList.toggle('open', open);
    launcher.setAttribute('aria-expanded', String(open));
    saveState(storeKey, state);
    if (open) setTimeout(() => (state.name ? input : nameInput).focus({ preventScroll: true }), 50);
  }

  // Czyści rozmowę i imię — przy następnym otwarciu czat zaczyna od ekranu powitalnego.
  function resetConversation() {
    state.name = '';
    state.consent = false;
    state.session = '';
    consentInput.checked = false;
    state.messages = [];
    state.flow = { crisis: false, unclear: 0 };
    log.textContent = '';
    nameInput.value = '';
    input.value = '';
    saveState(storeKey, state);
    showScreen();
  }

  nameForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = nameInput.value.replace(/\s+/g, ' ').trim().slice(0, NAME_MAX);
    if (name) startConversation(name, consentInput.checked);
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (busy) return; // asystentka jeszcze odpowiada — wpisany tekst zostaje w polu
    const v = input.value;
    input.value = '';
    autoGrow();
    ask(v);
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      form.requestSubmit();
    }
  });
  const autoGrow = () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
  };
  input.addEventListener('input', autoGrow);
  launcher.addEventListener('click', () => setOpen(!state.open));
  root.querySelectorAll('.minimize').forEach((b) => b.addEventListener('click', () => setOpen(false)));
  root.querySelectorAll('.close:not(.minimize)').forEach((b) =>
    b.addEventListener('click', () => {
      resetConversation();
      setOpen(false);
    }),
  );
  wrap.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !inline) setOpen(false);
  });

  showScreen();
  setOpen(inline ? true : state.open);
  // Podgląd w panelu: rozmowa startuje od razu (bez ekranu z imieniem), żeby widać było powitanie.
  if (opts.autoStartName && !state.name) startConversation(opts.autoStartName, false);

  return {
    open: () => setOpen(true),
    close: () => setOpen(false),
    ask,
    // Czyści rozmowę i imię — wraca do ekranu powitalnego.
    reset: resetConversation,
    destroy: () => host.remove(),
  };
}

// --- funkcje pomocnicze ------------------------------------------------------

// Podpis nad dymkiem; przy konsultantce — miniatura logo jak zdjęcie profilowe.
function whoRow(name, withAvatar) {
  const row = el('div', 'who');
  if (withAvatar) {
    const img = el('img', 'who-avatar');
    img.src = avatarUrl();
    img.alt = '';
    row.append(img);
  }
  row.append(el('span', '', name));
  return row;
}

// Wygląd kafelków z panelu: marginesy (zmienne CSS) i przełączniki jako klasy.
export function applyTileStyle(node, t) {
  const p = t.padding;
  node.style.setProperty('--tile-pad', `${p.t}px ${p.r}px ${p.b}px ${p.l}px`);
  node.classList.toggle('tiles-fit', Boolean(t.fit));
  node.classList.toggle('tiles-nobreak', Boolean(t.nobreak));
  node.classList.toggle('tiles-autow', Boolean(t.autoWidth));
  node.classList.toggle('tiles-center-h', Boolean(t.centerH));
  node.classList.toggle('tiles-center-v', Boolean(t.centerV));
  node.classList.toggle('tiles-single-fit', t.singleFit !== false);
  node.classList.toggle('tiles-shadow', t.shadow !== false);
  // Ikona: rozmiar (px) i — gdy ustawiona — stała odległość od nazwy usługi.
  node.style.setProperty('--ico-size', `${t.iconSize || 28}px`);
  const gap = Number.isFinite(t.iconGap) ? t.iconGap : null;
  node.classList.toggle('tiles-icogap', gap !== null);
  if (gap !== null) node.style.setProperty('--ico-gap', `${gap}px`);
  else node.style.removeProperty('--ico-gap');
  node.style.setProperty('--tile-fs', `${t.fontSize || 13.5}px`);
  node.classList.toggle('tiles-pack', Boolean(t.pack) && !t.autoWidth);
}

// Układ kafelków po narysowaniu: zmniejszenie napisu („bez przenoszenia liter”) i —
// przy „równych odstępach w pionie” — dosunięcie kafelków w kolumnach (siatka z wierszami po 1 px,
// każdy kafelek zajmuje tyle wierszy, ile ma wysokości + odstęp). Kolejność zostaje wierszami.
export function layoutTiles(container, t) {
  if (t.nobreak) fitTileText(container);
  else container.querySelectorAll('.tile-name, .pv-name').forEach((n) => (n.style.fontSize = ''));
  const grids = container.matches?.('.tiles, .tile-preview') ? [container] : [...container.querySelectorAll('.tiles')];
  for (const g of grids) {
    const items = [...g.children];
    g.classList.remove('packed');
    items.forEach((i) => (i.style.gridRowEnd = ''));
    if (!t.pack || t.autoWidth) continue;
    const gap = parseFloat(getComputedStyle(g).columnGap) || 8;
    const heights = items.map((i) => i.getBoundingClientRect().height);
    g.classList.add('packed');
    items.forEach((i, k) => (i.style.gridRowEnd = `span ${Math.max(1, Math.round(heights[k] + gap))}`));
  }
}

// „Bez przenoszenia liter”: gdy najdłuższy wyraz nie mieści się w kafelku, zmniejsz napis
// (maks. do 11 px) zamiast łamać wyraz w środku.
export function fitTileText(root) {
  for (const name of root.querySelectorAll('.tile-name, .pv-name')) {
    name.style.fontSize = '';
    name.style.overflowWrap = '';
    let size = parseFloat(getComputedStyle(name).fontSize) || 13.5;
    while (name.scrollWidth > name.clientWidth + 0.5 && size > 10) {
      size -= 0.5;
      name.style.fontSize = `${size}px`;
    }
    // Gdy nawet najmniejszy napis się nie mieści — łamiemy wyraz, żeby nic nie wyszło poza kafelek.
    if (name.scrollWidth > name.clientWidth + 0.5) name.style.overflowWrap = 'anywhere';
  }
}

// Kontrast koloru z białym tekstem (WCAG) — eksportowany też do panelu.
export function contrastWithWhite(hex) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  const L = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  return 1.05 / (L + 0.05);
}

// Ikona usługi w kwadraciku (stały SVG) — także do podglądu kafelków w panelu.
export function tileIcon(svc) {
  const ico = el('span', 'tile-ico');
  ico.innerHTML = TILE_ICONS[svc] || ICON_GENERIC;
  return ico;
}

// Cena w „pigułce”: „od” cieńszym pismem, kwota pogrubiona („od 79 zł”).
function priceNode(price) {
  const node = el('span', 'tile-price');
  const m = /^(od)\s+(.+)$/i.exec(price);
  if (m) node.append(el('span', 'price-from', `${m[1]} `), el('b', '', m[2]));
  else node.append(el('b', '', price));
  return node;
}

// Stały dopisek o 112: numery alarmowe pogrubione, reszta zwykłym tekstem (textContent).
function sosNode(text) {
  const p = el('p', 'sos');
  for (const part of String(text || '').split(/(\b112\b(?:\s+lub\s+\b999\b)?|\b999\b)/)) {
    if (!part) continue;
    p.append(/^(112|999)/.test(part) ? el('strong', '', part) : document.createTextNode(part));
  }
  return p;
}

function el(tag, className = '', text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// „Dzisiaj, 10:24” / „Wczoraj, 10:24” / „12.10.2026, 10:24”.
function formatDay(ts) {
  const d = new Date(ts || Date.now());
  const time = d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return `Dzisiaj, ${time}`;
  if (d.toDateString() === yesterday.toDateString()) return `Wczoraj, ${time}`;
  return `${d.toLocaleDateString('pl-PL')}, ${time}`;
}

// Zamienia adresy kliniki w tekście modelu na linki; reszta zostaje zwykłym tekstem.
function appendLinkified(parent, text) {
  const host = new URL(SITE.base).hostname;
  const parts = String(text || '').split(/(https?:\/\/[^\s)]+)/g);
  for (const part of parts) {
    let url = null;
    try {
      const h = /^https:\/\//.test(part) ? new URL(part).hostname : '';
      if (h && (h === host || h.endsWith(`.${host}`))) url = part.replace(/[.,;]+$/, '');
    } catch { /* to nie jest adres */ }
    if (url) {
      const a = el('a', 'inline-link', url.replace(/^https?:\/\/(www\.)?/, ''));
      a.href = url;
      a.target = '_top';
      parent.append(a);
    } else if (part) {
      parent.append(document.createTextNode(part));
    }
  }
}

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// sessionStorage może być zablokowany (tryb prywatny, iframe) — nie pozwalamy, by to wywróciło czat.
function loadState(key) {
  try {
    return JSON.parse(sessionStorage.getItem(key));
  } catch {
    return null;
  }
}
function saveState(key, state) {
  try {
    sessionStorage.setItem(key, JSON.stringify(state));
  } catch { /* pomijamy */ }
}
