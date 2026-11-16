'use strict';

const $ = (sel) => document.querySelector(sel);
const SAVE_KEY = 'infierno.partida';

// ================= Lógica del juego =================
// La fila es un array: el índice 0 es el fondo y el último elemento es la carta activa.
// Cada carta en juego: { id, estado: 'DORSO'|'FRENTE'|'ROTADA', frontExceptionActive, frontEntryState }

let game = null;   // { level, deck, prevTopId, over, reason, message }
let toast = '';

const info = (c) => CARD_BY_ID.get(c.id);
const topCard = () => game.deck[game.deck.length - 1];
const isFaceUp = (c) => c.estado === 'FRENTE' || c.estado === 'ROTADA';
const minStars = () => LEVELS[game.level].minStars;

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function newGame(levelIdx) {
  const deck = LEVELS[levelIdx].cards.map((id) => ({ id, estado: 'DORSO', frontExceptionActive: false, frontEntryState: null }));
  game = { level: levelIdx, deck: shuffle(deck), prevTopId: null, over: false, reason: '', message: '' };
  toast = '';
  handleFrontArrival();
}

function activeValue(c) {
  const i = info(c);
  return c.estado === 'ROTADA' ? i.valorI : i.valorF;
}

const countStars = () => game.deck.filter((c) => c.estado === 'ROTADA' && info(c).estrellaI).length;
const countSouls = () => game.deck.filter((c) => SOUL_IDS.includes(c.id) && isFaceUp(c)).length;
const canEscape = () => countSouls() === 4 && countStars() >= minStars();

function lose(message) {
  game.over = true;
  game.reason = 'lose';
  game.message = message;
}

// Se ejecuta cada vez que una carta nueva queda como carta activa.
function handleFrontArrival() {
  const t = topCard();
  if (!t || t.id === game.prevTopId) return;

  t.frontEntryState = t.estado;
  t.frontExceptionActive = DEMON_IDS.has(t.id) && t.frontEntryState === 'FRENTE';

  if (DEMON_IDS.has(t.id) && t.frontEntryState === 'ROTADA' && !game.over) {
    lose('Los demonios te capturaron. Bienvenido a una eternidad de tormentos en el infierno.');
  }
  if (t.id === PORTAL_ID && t.frontEntryState === 'FRENTE' && !canEscape()) {
    toast = 'Cumplí tus objetivos para poder rotar el portal.';
  }
  game.prevTopId = t.id;
}

function availableActions() {
  if (!game || game.over || !game.deck.length) return [];
  const t = topCard();

  if (t.id === PORTAL_ID) {
    if (t.estado === 'DORSO') return ['revelar'];
    return canEscape() ? ['rotar', 'desplazar'] : ['desplazar'];
  }
  if (DEMON_IDS.has(t.id)) {
    if (t.estado === 'ROTADA') return ['desplazar'];
    if (t.frontExceptionActive && t.estado === 'FRENTE') return ['rotar'];
  }
  if (t.estado === 'DORSO') return ['revelar'];
  return ['rotar', 'desplazar'];
}

function actionRevelar() {
  const t = topCard();
  if (t.estado !== 'DORSO') return;
  t.estado = 'FRENTE';
  t.frontExceptionActive = false;
  if (SOUL_IDS.includes(t.id)) toast = '¡Rescataste un alma! ❤️';
  if (t.id === PORTAL_ID && !canEscape()) toast = 'Cumplí todos tus objetivos para poder rotar el portal y escapar.';
}

function actionRotar() {
  const t = topCard();
  if (t.estado === 'DORSO') return;
  if (t.id === PORTAL_ID && !canEscape()) {
    toast = 'Vas a poder rotar el portal y escapar solo cuando cumplas tus objetivos.';
    return;
  }
  const prev = t.estado;
  t.estado = prev === 'FRENTE' ? 'ROTADA' : 'FRENTE';
  if (DEMON_IDS.has(t.id)) {
    t.frontExceptionActive = false;
    if (t.estado === 'ROTADA') {
      toast = '⚠️ Demonio rotado: si vuelve a ser la carta activa, perdés.';
      return;
    }
  }
  if (t.id === PORTAL_ID && t.estado === 'ROTADA') {
    if (canEscape()) {
      game.over = true;
      game.reason = 'win';
      game.message = `Rescataste las 4 almas, juntaste ${minStars()} estrellas o más y escaparon juntos del infierno.`;
    } else {
      const souls = countSouls(), stars = countStars();
      const parts = [];
      if (souls < 4) parts.push(`Faltan ${4 - souls} alma(s) (${souls}/4).`);
      if (stars < minStars()) parts.push(`Faltan ${minStars() - stars} estrella(s) (${stars}/${minStars()}).`);
      lose('No pudiste escapar. ' + parts.join(' '));
    }
    return;
  }
  if (t.estado === 'ROTADA' && prev !== 'ROTADA' && info(t).estrellaI) toast = '⭐ ¡Sumaste una estrella!';
}

function actionDesplazar(count) {
  const n = game.deck.length;
  count = Math.max(1, Math.min(n, count));
  // Las `count` cartas de arriba pasan al fondo, en el mismo orden.
  game.deck = game.deck.slice(n - count).concat(game.deck.slice(0, n - count));
  handleFrontArrival();
}

// ================= Guardado =================
function save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(game)); } catch { /* sin storage */ }
}
function loadSaved() {
  try {
    const g = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (g && !g.over && Array.isArray(g.deck) && LEVELS[g.level]) return g;
  } catch { /* nada guardado */ }
  return null;
}
function clearSaved() {
  try { localStorage.removeItem(SAVE_KEY); } catch { /* sin storage */ }
}

// ================= Pantallas y diálogos =================
function show(id) {
  document.querySelectorAll('.screen').forEach((s) => s.toggleAttribute('data-active', s.id === id));
  window.scrollTo(0, 0);
}
function openDialog(d) { if (d.showModal) d.showModal(); else d.setAttribute('open', ''); }
function closeDialog(d) { if (d.close) d.close(); else d.removeAttribute('open'); }

// ================= Cartas (DOM) =================
const fmt = (v) => (v === 0 ? '?' : String(v));

// Arma la cara física de la carta: valor de FRENTE arriba-izq, valor de ROTADA abajo-der
// (al revés). Al rotar la carta entera 180°, cada valor queda donde corresponde.
function fillCard(el, c) {
  const i = info(c);
  const back = c.estado === 'DORSO';
  el.className = 'card ' + (back ? 'is-back' : 'c-' + i.color) + (c.estado === 'ROTADA' ? ' is-rot' : '');
  const src = `assets/cards/${back ? 'carta_dorso' : i.img}.webp`;
  let img = el.querySelector('img');
  if (!img) {
    img = document.createElement('img');
    img.alt = '';
    img.draggable = false;
    el.prepend(img);
  }
  if (img.getAttribute('src') !== src) img.setAttribute('src', src);
  el.querySelectorAll('span').forEach((s) => s.remove());
  if (back) return;
  const add = (cls, text) => { const s = document.createElement('span'); s.className = cls; s.textContent = text; el.append(s); };
  add('val v-tl', fmt(i.valorF));
  add('val v-br', fmt(i.valorI));
  if (i.estrellaF) add('star s-tr', '★');
  if (i.estrellaI) add('star s-bl', '★');
}

// ---------- Fila de cartas (miniaturas superpuestas) ----------
const rowEl = $('#row');
const miniEls = new Map(); // id -> elemento, para animar los desplazamientos

function renderRow() {
  const deck = game.deck;
  const n = deck.length;
  const w = rowEl.clientWidth;
  const cw = parseFloat(getComputedStyle(rowEl).getPropertyValue('--mini-w')) || 46;
  const step = n > 1 ? Math.min(cw + 6, (w - cw) / (n - 1)) : 0;
  const offset = Math.max(0, (w - (cw + step * (n - 1))) / 2);

  const alive = new Set(deck.map((c) => c.id));
  for (const [id, el] of miniEls) if (!alive.has(id)) { el.remove(); miniEls.delete(id); }

  deck.forEach((c, idx) => {
    let el = miniEls.get(c.id);
    if (!el) {
      el = document.createElement('div');
      rowEl.append(el);
      miniEls.set(c.id, el);
    }
    fillCard(el, c);
    el.classList.add('mini');
    el.classList.toggle('is-top', idx === n - 1);
    el.style.left = `${offset + idx * step}px`;
    el.style.zIndex = String(idx + 1);
  });
}

function resetRow() {
  rowEl.replaceChildren();
  miniEls.clear();
}

// ---------- Carta activa en grande ----------
const bigEl = $('#big-card');
let bigShown = null; // { id, estado } mostrado la última vez

function renderBig() {
  const t = topCard();
  const prev = bigShown;
  const sameCard = prev && prev.id === t.id;
  // Sin animación de giro cuando cambia de carta; con animación si la misma carta rota.
  fillCard(bigEl, t);
  bigEl.classList.add('big');
  bigEl.classList.toggle('no-anim', !sameCard);
  bigEl.classList.toggle('glow', isFaceUp(t));
  if (!sameCard || (prev.estado === 'DORSO' && t.estado !== 'DORSO')) {
    const wrap = $('#big-wrap');
    wrap.classList.remove('flip-in');
    void wrap.offsetWidth; // reinicia la animación
    wrap.classList.add('flip-in');
  }
  bigShown = { id: t.id, estado: t.estado };

  const name = $('#card-name');
  if (t.estado === 'DORSO') {
    name.textContent = 'Carta boca abajo';
  } else {
    const i = info(t);
    const st = t.estado === 'ROTADA' ? ' · rotada' : '';
    name.textContent = i.nombre + st;
  }
  name.className = 'card-name' + (t.estado === 'DORSO' ? '' : ' n-' + info(t).color);
}

// ---------- Estado (estrellas y almas) ----------
function renderStatus() {
  const need = minStars();
  const got = countStars();
  const starsEl = $('#stars');
  starsEl.replaceChildren();
  for (let k = 0; k < Math.max(need, got); k++) {
    const s = document.createElement('span');
    s.textContent = k < got ? '★' : '☆';
    s.className = k < got ? 'on' : '';
    starsEl.append(s);
  }
  starsEl.setAttribute('aria-label', `Estrellas: ${got} de ${need}`);

  const heartsEl = $('#hearts');
  heartsEl.replaceChildren();
  let souls = 0;
  for (const id of SOUL_IDS) {
    const c = game.deck.find((x) => x.id === id);
    const on = c && isFaceUp(c);
    if (on) souls++;
    const h = document.createElement('span');
    h.textContent = on ? '❤️' : '🖤';
    heartsEl.append(h);
  }
  heartsEl.setAttribute('aria-label', `Almas rescatadas: ${souls} de 4`);

  const ok = canEscape();
  $('#status').classList.toggle('is-ready', ok);
  $('#status-escape').hidden = !ok;
}

// ---------- Botones de acción ----------
function button(label, cls, onClick) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'btn ' + cls;
  b.innerHTML = label;
  b.addEventListener('click', onClick);
  return b;
}

function renderActions() {
  const box = $('#actions');
  if (game.over) {
    box.replaceChildren(
      button('Jugar de nuevo', 'btn-primary', () => startLevel(game.level)),
      button('Niveles', 'btn-secondary', () => { clearSaved(); show('screen-levels'); }),
    );
    return;
  }
  const t = topCard();
  box.replaceChildren(...availableActions().map((a) => {
    if (a === 'revelar') return button('<span class="ico">↶</span> Revelar', 'btn-primary', () => act(actionRevelar));
    if (a === 'rotar') {
      const label = t.estado === 'ROTADA' ? '<span class="ico">↺</span> Volver' : '<span class="ico">↻</span> Rotar';
      return button(label, 'btn-primary', () => act(actionRotar));
    }
    const v = activeValue(t);
    return button(`<span class="ico">➔</span> Desplazar <b class="count">${fmt(v)}</b>`, 'btn-secondary', () => {
      if (v === 0) openPicker();
      else act(() => actionDesplazar(v));
    });
  }));
}

function render() {
  $('#level-title').textContent = `${LEVELS[game.level].number}. ${LEVELS[game.level].label}`;
  renderStatus();
  renderRow();
  renderBig();
  const t = $('#toast');
  t.textContent = toast;
  t.classList.toggle('is-on', !!toast);
  t.classList.toggle('is-warn', toast.startsWith('⚠️'));
  renderActions();
}

// Ejecuta una acción, guarda y redibuja.
function act(fn) {
  toast = '';
  fn();
  render();
  if (game.over) {
    clearSaved();
    if (game.reason === 'lose') navigator.vibrate?.([120, 60, 220]);
    setTimeout(showEnd, 700);
  } else {
    save();
  }
}

function showEnd() {
  const win = game.reason === 'win';
  $('#end-dialog').classList.toggle('is-win', win);
  $('#end-emoji').textContent = win ? '🎉' : '💀';
  $('#end-title').textContent = win ? '¡Escapaste!' : '¡Perdiste!';
  $('#end-msg').textContent = game.message;
  openDialog($('#end-dialog'));
}

function startLevel(idx) {
  newGame(idx);
  beginGame();
}

function beginGame() {
  resetRow();
  bigShown = null;
  show('screen-game');
  render();
  save();
}

// ---------- Elegir cuántas cartas desplazar ----------
const pickDlg = $('#pick-dialog');
function openPicker() {
  const max = Math.min(5, game.deck.length);
  $('#pick-grid').replaceChildren(...Array.from({ length: 5 }, (_, k) => {
    const v = k + 1;
    const b = button(String(v), 'pick', () => { closeDialog(pickDlg); act(() => actionDesplazar(v)); });
    b.disabled = v > max;
    return b;
  }));
  openDialog(pickDlg);
}
$('#pick-cancel').addEventListener('click', () => closeDialog(pickDlg));

// ================= Pantalla de niveles =================
function buildLevels() {
  $('#level-list').replaceChildren(...LEVELS.map((lv, idx) => {
    const demons = lv.cards.filter((id) => DEMON_IDS.has(id)).length;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'level';
    b.innerHTML = `
      <span class="level-num">${lv.number}</span>
      <span class="level-text">
        <strong>${lv.label}</strong>
        <small class="level-sub">${lv.subtitle}</small>
        <small>${lv.desc}</small>
      </span>
      <span class="level-meta">
        <span title="Estrellas necesarias">★ ${lv.minStars}</span>
        <span title="Demonios">😈 ${demons}</span>
      </span>`;
    b.addEventListener('click', () => startLevel(idx));
    return b;
  }));
}

// ================= Inicio =================
function refreshHome() {
  const saved = loadSaved();
  const btn = $('#continue-btn');
  btn.hidden = !saved;
  if (saved) btn.textContent = `Continuar partida (nivel ${LEVELS[saved.level].number})`;
}

$('#play-btn').addEventListener('click', () => show('screen-levels'));
$('#continue-btn').addEventListener('click', () => {
  const saved = loadSaved();
  if (!saved) return refreshHome();
  game = saved;
  toast = '';
  beginGame();
});
$('#back-home').addEventListener('click', () => { refreshHome(); show('screen-home'); });

// Salir de la partida
const quitDlg = $('#quit-dialog');
$('#quit-game').addEventListener('click', () => {
  if (game?.over) { refreshHome(); show('screen-home'); } else openDialog(quitDlg);
});
$('#quit-yes').addEventListener('click', () => { closeDialog(quitDlg); refreshHome(); show('screen-home'); });
$('#quit-no').addEventListener('click', () => closeDialog(quitDlg));

// Fin de partida
$('#end-again').addEventListener('click', () => { closeDialog($('#end-dialog')); startLevel(game.level); });
$('#end-levels').addEventListener('click', () => { closeDialog($('#end-dialog')); show('screen-levels'); });

// Reglas
const rulesDlg = $('#rules-dialog');
$('#rules-btn').addEventListener('click', () => openDialog(rulesDlg));
$('#game-rules').addEventListener('click', () => openDialog(rulesDlg));
$('#rules-ok').addEventListener('click', () => closeDialog(rulesDlg));

// ---------- Cómo instalar ----------
function setInstallTab(os) {
  document.querySelectorAll('.install-tab').forEach((t) => t.setAttribute('aria-selected', String(t.dataset.os === os)));
  document.querySelectorAll('.install-panel').forEach((p) => { p.hidden = p.dataset.os !== os; });
}
function isStandalone() {
  return window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone === true;
}
$('#open-install').addEventListener('click', () => {
  // Arranca en la pestaña del celular que se está usando; la otra sigue disponible.
  const ua = navigator.userAgent;
  const ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  setInstallTab(ios ? 'ios' : 'android');
  $('#install-done').hidden = !isStandalone();
  openDialog($('#install-dialog'));
});
document.querySelectorAll('.install-tab').forEach((t) => t.addEventListener('click', () => setInstallTab(t.dataset.os)));
$('#install-ok').addEventListener('click', () => closeDialog($('#install-dialog')));

// Tocar fuera de un diálogo lo cierra (salvo el de fin de partida).
document.querySelectorAll('dialog.sheet:not(.end)').forEach((d) => d.addEventListener('click', (e) => {
  if (e.target === d) closeDialog(d);
}));

// Redibujar la fila si cambia el ancho (rotar el celular, etc.).
window.addEventListener('resize', () => {
  if (game && $('#screen-game').hasAttribute('data-active')) renderRow();
});

// ================= Arranque =================
buildLevels();
refreshHome();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
