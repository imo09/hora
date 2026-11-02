// 1.6: spunte del filtro, festività, righe di alba e tramonto sopra la griglia, menu di Oggi, impostazioni dal logo
import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
const seed = { v: 1, items: [], cats: [{ id: 'l', name: 'Lavoro', icon: 'valigetta', color: 'verderame', parent: null, order: 0, gantt: true }], alarmGroups: [],
  settings: { lang: 'it', splash: false, ganttUnassigned: true, hourH: 48, monthTitles: false, ganttScale: 'week', recent: [], notify: false, sun: { on: true, name: 'Roma', lat: 41.9, lon: 12.5 } } };
const errors = [];
const dom = new JSDOM(html, {
  runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://hora.nautargo.com/',
  beforeParse(w) {
    const RD = w.Date, FIX = new RD(2026, 11, 25, 10, 0).getTime();
    class FD extends RD { constructor(...a) { if (a.length) super(...a); else super(FIX); } static now() { return FIX; } }
    w.Date = FD;
    w.localStorage.setItem('hora.v1', JSON.stringify(seed));
    w.console.error = (...a) => errors.push(a.join(' '));
    Object.defineProperty(w.HTMLElement.prototype, 'clientWidth', { get() { return 390; } });
    w.Element.prototype.getBoundingClientRect = function () { return { top: 0, left: 0, right: 390, bottom: 800, width: 390, height: 800, x: 0, y: 0 }; };
  }
});
const w = dom.window, d = w.document;
const wait = (ms = 60) => new Promise((r) => setTimeout(r, ms));
const $ = (s) => d.querySelector(s), $$ = (s) => [...d.querySelectorAll(s)];
const click = (el) => { assert.ok(el, 'elemento mancante'); el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); };
const byText = (sel, txt) => $$(sel).find((e) => e.textContent.trim().includes(txt));
const css = (el, p) => w.getComputedStyle(el).getPropertyValue(p);
const store = () => JSON.parse(w.localStorage.getItem('hora.v1'));
let n = 0; const ok = (m) => { n++; console.log('  ok', m); };

await wait(200);
// filtro: la casella si vede anche quando è spenta
click($('.ctl.filt')); await wait(150);
const cb = $('.sheet .list .cb');
assert.ok(cb && !cb.classList.contains('on'));
const faint2 = css(d.documentElement, '--faint2').trim();
assert.ok(/^#[0-9A-Fa-f]{6}$/.test(faint2), 'il colore del bordo esiste: ' + faint2);
assert.ok(/\.cb\{[^}]*border:1\.5px solid var\(--faint2\)/.test(html), 'bordo sempre disegnato'); ok('filtro: spunte sempre visibili');
click(byText('.sheet .li', 'Lavoro')); await wait();
assert.ok($('.sheet .cb.on')); click(byText('.sheet .btn', 'Mostra tutto')); click(byText('.sheet .btn', 'Fatto')); await wait();
// festività: 25 dicembre colorato, nome nell'intestazione
assert.ok($('.g-day.hol'), 'giorno di festa in evidenza');
assert.ok($('.g-day.hol em') && $('.g-day.hol em').textContent === 'Natale'); ok('festività: Natale segnato nella vista giorno');
assert.ok($('.g-col.hol')); ok('festività: colonna colorata');
click($('.tabs button[aria-label="Mese"]')); await wait();
assert.ok($$('.m-cell.hol').length >= 2, 'Natale e Santo Stefano'); ok('festività: giorni colorati nel mese');
// si possono spegnere
click($('button[aria-label="Impostazioni"]')); await wait();
assert.ok($('.screen h1').textContent.includes('Impostazioni')); ok('impostazioni dal logo');
click($('.screen .sw[aria-label="Festività italiane"]')); await wait();
assert.equal(store().settings.holidays, false);
click($('.screen button[aria-label="Indietro"]')); await wait();
assert.ok(!$('.m-cell.hol')); ok('festività spente');
click($('.tabs button[aria-label="Giorno"]')); await wait();
// alba e tramonto sopra le celle
const sun = $('.sun');
assert.ok(sun && +css(sun, 'z-index') >= 4); ok('righe di alba e tramonto sopra la griglia');
// menu di Oggi: Cerca
const td = $('.ctl.today');
assert.ok($('.ctl.today .corner'), 'angolo illuminato');
td.dispatchEvent(new w.Event('pointerdown', { bubbles: true })); await wait(560); td.dispatchEvent(new w.Event('pointerup', { bubbles: true })); await wait();
click(byText('.list.menu .li', 'Cerca')); await wait(150);
assert.ok($('.screen .search')); ok('menu di Oggi: Cerca');
assert.deepEqual(errors.filter((e) => !/Not implemented|navigation/i.test(e)), []);
console.log(`1.6: ${n} test superati`);
w.close();
