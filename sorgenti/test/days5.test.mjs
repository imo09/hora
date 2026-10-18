// 5 giorni (giorno feriale fisso: mercoledì 14 ottobre 2026), scorrimento laterale, freccia di 5 giorni
import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
const errors = [];
const dom = new JSDOM(html, {
  runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://hora.nautargo.com/',
  beforeParse(w) {
    const RD = w.Date, FIX = new RD(2026, 9, 14, 10, 0).getTime();
    class FD extends RD { constructor(...a) { if (a.length) super(...a); else super(FIX); } static now() { return FIX; } }
    w.Date = FD;
    Object.defineProperty(w.navigator, 'language', { value: 'it-IT' });
    w.console.error = (...a) => errors.push(a.join(' '));
    w.Element.prototype.getBoundingClientRect = function () { return { top: 0, left: 0, right: 390, bottom: 800, width: 390, height: 800, x: 0, y: 0 }; };
  }
});
const w = dom.window, d = w.document;
const wait = (ms = 60) => new Promise((r) => setTimeout(r, ms));
const $ = (s) => d.querySelector(s), $$ = (s) => [...d.querySelectorAll(s)];
const click = (el) => el.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
const touch = (el, kind, pts, target = el) => {
  const e = new w.Event(kind, { bubbles: true, cancelable: true });
  const list = pts.map(([x, y]) => ({ clientX: x, clientY: y, target }));
  Object.defineProperty(e, 'touches', { value: kind === 'touchend' ? list.slice(0, -1) : list });
  target.dispatchEvent(e);
  return e;
};
const pinchIn = async () => { const sc = $('.g-scroll'); touch(sc, 'touchstart', [[100, 300], [300, 300]]); touch(sc, 'touchmove', [[170, 300], [230, 300]]); touch(sc, 'touchend', [[170, 300], [230, 300]]); await wait(100); };
const byText = (sel, txt) => $$(sel).find((e) => e.textContent.trim().includes(txt));
const title = () => $('.hdr2 h1').textContent;
let n = 0; const ok = (m) => { n++; console.log('  ok', m); };

await wait(120); click($('.splash')); await wait(450);
assert.equal(title(), 'Mer 14 ottobre');
// scorrimento laterale nella vista Giorno
const sc = $('.g-scroll');
touch(sc, 'touchstart', [[300, 400]]); touch(sc, 'touchmove', [[150, 410]]); touch(sc, 'touchmove', [[120, 410]]); touch(sc, 'touchend', [[120, 410]]); await wait(80);
assert.equal(title(), 'Gio 15 ottobre'); ok('scorrimento laterale: giorno dopo');
touch(sc, 'touchstart', [[100, 400]]); touch(sc, 'touchmove', [[300, 410]]); touch(sc, 'touchend', [[300, 410]]); await wait(80);
assert.equal(title(), 'Mer 14 ottobre'); ok('scorrimento laterale: giorno prima');
await pinchIn();
assert.equal($$('.g-day').length, 3); assert.equal($('.tabs button.on').textContent, '3 giorni');
await pinchIn();
assert.ok(!$('.grid.sx'), '5 giorni a pagine'); assert.equal($('.tabs button.on').textContent, '5 giorni');
assert.equal(title(), '12 - 16 ottobre'); ok('pizzico: 5 giorni feriali nella tab Giorno');
click($('button[aria-label="Successivo"]')); await wait();
assert.equal(title(), '17 - 21 ottobre'); ok('freccia: 5 giorni avanti');
const sc2 = $('.g-scroll');
touch(sc2, 'touchstart', [[100, 400]]); touch(sc2, 'touchmove', [[300, 410]]); touch(sc2, 'touchend', [[300, 410]]); await wait(80);
assert.equal(title(), '12 - 16 ottobre'); ok('scorrimento bloccato: 5 giorni prima');
// impostazioni: scorrimento continuo
click($('button[aria-label="Impostazioni"]')); await wait();
click($('.screen .sw[aria-label="Scorrimento continuo"]')); await wait();
assert.equal(JSON.parse(w.localStorage.getItem('hora.v1')).settings.freeScroll, true);
click($('.screen button[aria-label="Indietro"]')); await wait();
assert.ok($('.grid.sx'), '5 giorni a scorrimento');
// scorrimento orizzontale continuo: la vista si ricentra sul primo giorno visibile
let g = $('.g-scroll');
g.scrollLeft = 44 * 16; g.dispatchEvent(new w.Event('scroll')); await wait(260);
assert.equal(title(), '14 - 18 ottobre'); ok('scorrimento continuo: 5 giorni');
await pinchIn();
assert.equal($('.tabs button.on').textContent, 'Settimana'); assert.ok($('.grid.sx'));
assert.equal(title(), '12 - 18 ottobre'); ok('pizzico: settimana continua da lunedì');
g = $('.g-scroll');
g.scrollLeft = 44 * 17; g.dispatchEvent(new w.Event('scroll')); await wait(260);
assert.equal(title(), '15 - 21 ottobre'); ok('scorrimento continuo: settimana');
// mese continuo: scorre per settimane e cambia mese guardato
click(byText('.tabs button', 'Mese')); await wait();
const ms = $('.m-scroll');
assert.ok(ms, 'mese a scorrimento'); assert.equal(title(), 'Ottobre 2026');
ms.scrollTop = ms.scrollTop + 52 * 5; ms.dispatchEvent(new w.Event('scroll')); await wait(260);
assert.equal(title(), 'Novembre 2026'); ok('scorrimento continuo: mese');
// di nuovo a pagine
click($('button[aria-label="Impostazioni"]')); await wait();
click($('.screen .sw[aria-label="Scorrimento continuo"]')); await wait();
click($('.screen button[aria-label="Indietro"]')); await wait();
assert.ok(!$('.m-scroll') && $('.m-fix')); ok('scorrimento a pagine di nuovo');
assert.deepEqual(errors, []);
console.log(`5 giorni e scorrimento: ${n} test superati`);
w.close();
