// Gesti touch: pressione lunga e trascinamento, pizzico verticale e orizzontale
import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
const today = new Date(); const pad = (x) => String(x).padStart(2, '0');
const T = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
const seed = { v: 1, items: [{ id: 'a1', type: 'evento', title: 'Prova', date: T, endDate: null, start: 540, end: 600, cat: null, alert: null, repeat: { f: 'none', days: [], until: null }, address: '', link: '', notes: '', doneDates: {} }], cats: [], settings: { lang: 'it', ganttUnassigned: true, hourH: 48, monthTitles: false, ganttScale: 'week', recent: [], defaultCat: null, notify: false } };
const errors = [];
const dom = new JSDOM(html, {
  runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://hora.nautargo.com/',
  beforeParse(w) {
    w.localStorage.setItem('hora.v1', JSON.stringify(seed));
    w.console.error = (...a) => errors.push(a.join(' '));
    w.Element.prototype.getBoundingClientRect = function () { return { top: 0, left: 0, right: 390, bottom: 800, width: 390, height: 800, x: 0, y: 0 }; };
  }
});
const w = dom.window, d = w.document;
const wait = (ms = 60) => new Promise((r) => setTimeout(r, ms));
const $ = (s) => d.querySelector(s), $$ = (s) => [...d.querySelectorAll(s)];
const touch = (el, kind, pts, target = el) => {
  const e = new w.Event(kind, { bubbles: true, cancelable: true });
  const list = pts.map(([x, y]) => ({ clientX: x, clientY: y, target }));
  Object.defineProperty(e, 'touches', { value: kind === 'touchend' ? list.slice(0, -1) : list });
  target.dispatchEvent(e);
  return e;
};
await wait(120);
w.document.querySelector('.splash').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
await wait(450);
const sc = $('.g-scroll');
let ev = $('.ev');
assert.ok(ev);
// tocco breve: apre la scheda
touch(sc, 'touchstart', [[200, 440]], ev); await wait(50); touch(sc, 'touchend', [[200, 440]], ev); await wait(150);
assert.ok($('.sheet')); console.log('  ok tocco breve apre');
$('.sheet button[aria-label="Chiudi"]').dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await wait(100);
// pressione lunga e trascinamento di 1 ora
ev = $('.ev');
touch(sc, 'touchstart', [[200, 440]], ev); await wait(450);
assert.ok($('.ev.ghost')); console.log('  ok pressione lunga solleva');
const m = touch(sc, 'touchmove', [[200, 488]], ev); assert.ok(m.defaultPrevented, 'scorrimento bloccato');
await wait(50); touch(sc, 'touchend', [[200, 488]], ev); await wait(100);
let s = JSON.parse(w.localStorage.getItem('hora.v1'));
assert.deepEqual([s.items[0].start, s.items[0].end], [600, 660]); console.log('  ok trascinamento touch a 10:00');
// bordo destro: passa al giorno dopo durante il trascinamento
ev = $('.ev');
touch(sc, 'touchstart', [[200, 488]], ev); await wait(450);
touch(sc, 'touchmove', [[380, 488]], ev); await wait(800);
touch(sc, 'touchmove', [[200, 536]], ev); await wait(50); touch(sc, 'touchend', [[200, 536]], ev); await wait(100);
s = JSON.parse(w.localStorage.getItem('hora.v1'));
const tm = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
const TM = `${tm.getFullYear()}-${pad(tm.getMonth() + 1)}-${pad(tm.getDate())}`;
assert.deepEqual([s.items[0].date, s.items[0].start], [TM, 660]); console.log('  ok bordo: giorno successivo');
// pizzico verticale: altezza ora da 48 a ~96
touch(sc, 'touchstart', [[200, 300], [200, 400]]); touch(sc, 'touchmove', [[200, 250], [200, 450]]); await wait(50);
touch(sc, 'touchend', [[200, 250], [200, 450]]); await wait(100);
assert.equal($('.g-body').style.height, (24 * 96) + 'px'); console.log('  ok pizzico verticale');
// pizzico orizzontale (stringi): 1 giorno -> 3 giorni
touch(sc, 'touchstart', [[100, 300], [300, 300]]); touch(sc, 'touchmove', [[170, 300], [230, 300]]); await wait(50);
touch(sc, 'touchend', [[170, 300], [230, 300]]); await wait(100);
assert.equal($$('.g-day').length, 3); console.log('  ok pizzico orizzontale: 3 giorni');
const pinch = async () => { touch(sc, 'touchstart', [[100, 300], [300, 300]]); touch(sc, 'touchmove', [[170, 300], [230, 300]]); touch(sc, 'touchend', [[170, 300], [230, 300]]); await wait(100); };
await pinch();
assert.equal($$('.g-day').length, 5); console.log('  ok pizzico orizzontale: 5 giorni (anche nel fine settimana)');
await pinch();
assert.equal($$('.g-day').length, 7); console.log('  ok pizzico orizzontale: settimana');
assert.deepEqual(errors, []);
console.log('touch: 8 test superati');
w.close();
