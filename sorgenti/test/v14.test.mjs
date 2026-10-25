// 1.4: tutto il giorno trascinabile, maniglie che aprono, + con il blocco disegnato, sveglie a gruppi, tema scuro, schermata iniziale
import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
const it = (p) => ({ endDate: null, end: null, cat: null, alert: null, repeat: { f: 'none', days: [], until: null }, address: '', link: '', notes: '', doneDates: {}, ...p });
const seed = { v: 1, items: [it({ id: 'f', type: 'evento', title: 'Ferie', date: '2026-10-14', start: null }), it({ id: 'e', type: 'evento', title: 'Riunione', date: '2026-10-14', start: 540, end: 600 })], cats: [], alarmGroups: [],
  settings: { lang: 'it', ganttUnassigned: true, hourH: 48, monthTitles: false, ganttScale: 'week', recent: [], notify: false, sun: { on: false, name: 'Roma', lat: 41.9, lon: 12.5 } } };
const errors = [];
const dom = new JSDOM(html, {
  runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://hora.nautargo.com/',
  beforeParse(w) {
    const RD = w.Date, FIX = new RD(2026, 9, 14, 10, 0).getTime();
    class FD extends RD { constructor(...a) { if (a.length) super(...a); else super(FIX); } static now() { return FIX; } }
    w.Date = FD;
    w.localStorage.setItem('hora.v1', JSON.stringify(seed));
    w.console.error = (...a) => errors.push(a.join(' '));
    w.Element.prototype.getBoundingClientRect = function () { return { top: 0, left: 0, right: 390, bottom: 800, width: 390, height: 800, x: 0, y: 0 }; };
  }
});
const w = dom.window, d = w.document;
const wait = (ms = 60) => new Promise((r) => setTimeout(r, ms));
const $ = (s) => d.querySelector(s), $$ = (s) => [...d.querySelectorAll(s)];
const click = (el) => { assert.ok(el, 'elemento mancante'); el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); };
const byText = (sel, txt) => $$(sel).find((e) => e.textContent.trim().includes(txt));
const touch = (el, kind, pts, target = el) => {
  const e = new w.Event(kind, { bubbles: true, cancelable: true });
  const list = pts.map(([x, y]) => ({ clientX: x, clientY: y, target }));
  Object.defineProperty(e, 'touches', { value: kind === 'touchend' ? list.slice(0, -1) : list });
  target.dispatchEvent(e);
};
const mouse = (el, kind, x, y, target = el) => target.dispatchEvent(new w.MouseEvent(kind, { bubbles: true, clientX: x, clientY: y, button: 0 }));
const store = () => JSON.parse(w.localStorage.getItem('hora.v1'));
let n = 0; const ok = (m) => { n++; console.log('  ok', m); };

await wait(150);
assert.ok($('.sp-sub') && $('.sp-tap'), 'sottotitolo e invito a toccare');
await wait(3200); assert.ok($('.splash'), 'la schermata iniziale resta finché non si tocca'); ok('schermata iniziale: resta fino al tocco');
click($('.splash')); await wait(450);
assert.ok($$('.slot').length >= 24); ok('celle orarie');
// settimana: Ferie (mercoledì, colonna 2) spostato a giovedì con pressione lunga
click($('.tabs button[aria-label="Settimana"]')); await wait();
const sc = $('.g-scroll');
// col mouse: giovedì; poi col dito, pressione lunga, di nuovo mercoledì
let chip = byText('.ad-chip', 'Ferie'); assert.ok(chip);
mouse(sc, 'mousedown', 150, 30, chip); mouse(w, 'mousemove', 160, 30); mouse(w, 'mousemove', 200, 30); mouse(w, 'mouseup', 200, 30); await wait(100);
assert.equal(store().items.find((x) => x.id === 'f').date, '2026-10-15'); ok('tutto il giorno: trascinato col mouse');
chip = byText('.ad-chip', 'Ferie');
touch(sc, 'touchstart', [[200, 30]], chip); await wait(450);
assert.ok($('.ad-chip.lift'), 'sollevato');
touch(sc, 'touchmove', [[150, 30]], chip); await wait(30); touch(sc, 'touchend', [[150, 30]], chip); await wait(100);
assert.equal(store().items.find((x) => x.id === 'f').date, '2026-10-14'); ok('tutto il giorno: pressione lunga e trascinamento');
// giorno: blocco nuovo e +
click($('.tabs button[aria-label="Giorno"]')); await wait();
const col = $('.g-col');
touch(sc, 'touchstart', [[200, 720]], col); touch(sc, 'touchend', [[200, 720]], col); await wait();
if (!$('.ev.draft')) { touch(sc, 'touchstart', [[200, 720]], col); touch(sc, 'touchend', [[200, 720]], col); await wait(); }
assert.ok($('.ev.draft') && $('.fab.ready'));
click($('.fab')); await wait(300);
assert.equal($$('.fl.dt input[type=time]')[0].value, '15:00', 'ora dal blocco'); ok('+ con il blocco disegnato');
click($('.sheet button[aria-label="Chiudi"]')); await wait();
// maniglia toccata senza trascinare: apre
const ev = byText('.ev', 'Riunione');
touch(sc, 'touchstart', [[200, 440]], ev); await wait(450); touch(sc, 'touchend', [[200, 440]], ev); await wait(100);
const hd = $('.hd.bot'); assert.ok(hd);
touch(sc, 'touchstart', [[200, 480]], hd); await wait(40); touch(sc, 'touchend', [[200, 480]], hd); await wait(200);
assert.ok($('.sheet'), 'scheda aperta'); ok('maniglia: un tocco apre');
click($('.sheet button[aria-label="Chiudi"]')); await wait();
// vai a data dalla pressione lunga su Oggi
const today = byText('.ctl.txt', 'Oggi');
today.dispatchEvent(new w.Event('pointerdown', { bubbles: true })); await wait(560); today.dispatchEvent(new w.Event('pointerup', { bubbles: true }));
assert.ok($('.dp-grid')); ok('pressione lunga su Oggi: Vai a data');
click($('.sheet button[aria-label="Chiudi"]')); await wait();
// impostazioni: sveglie a gruppi e modelli
click($('button[aria-label="Impostazioni"]')); await wait();
click(byText('.s-tile', 'Sveglie')); await wait();
click($$('.tpl .ctl')[0]); await wait();
let s = store();
assert.equal(s.alarmGroups.length, 1); assert.equal(s.items.filter((x) => x.type === 'sveglia' && x.group === s.alarmGroups[0].id).length, 2); ok('modello di gruppo aggiunto');
click($('.al-row .sw')); await wait();
assert.equal(store().items.find((x) => x.type === 'sveglia').off, true); ok('interruttore della sveglia');
click(byText('.seg button', 'Eventi e promemoria')); await wait();
assert.ok(byText('.ag-row', 'Riunione') && byText('.ag-row', 'Ferie')); ok('elenco eventi e promemoria');
click($('.screen button[aria-label="Indietro"]')); await wait();
// tema scuro e schermata iniziale spenta
click(byText('.screen .seg button', 'Scuro')); await wait();
assert.equal(d.documentElement.dataset.theme, 'dark'); ok('tema scuro');
click($('.screen .sw[aria-label="Schermata iniziale"]')); await wait();
assert.equal(store().settings.splash, false); ok('schermata iniziale spenta');
// importa con IA
click(byText('.screen .li', 'Importa da un')); await wait();
assert.ok(byText('.screen .btn', 'Scarica .md'));
const ta = $('textarea.paste');
Object.getOwnPropertyDescriptor(w.HTMLTextAreaElement.prototype, 'value').set.call(ta, '#hora\n20/10 10:00 | Da IA | promemoria');
ta.dispatchEvent(new w.Event('input', { bubbles: true })); await wait();
click(byText('.screen .btn.pri', 'Leggi')); await wait();
assert.equal($$('.imp').length, 1); ok('importa da altra app con IA');
assert.deepEqual(errors.filter((e) => !/Not implemented|navigation/i.test(e)), []);
console.log(`1.4: ${n} test superati`);
w.close();
