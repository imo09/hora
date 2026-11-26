// 1.9: telefono in orizzontale (una riga in alto, mese e elenco affiancati), mese piccolo solo dove serve
import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
let n = 0; const ok = (m) => { n++; console.log('  ok', m); };
const land = html.slice(html.indexOf('1.9: telefono in orizzontale'));
assert.ok(/@media \(orientation:landscape\) and \(max-height:520px\)\{/.test(land)); ok('regole per il telefono in orizzontale, in fondo allo stile');
assert.ok(/\.hdr\{display:flex;align-items:center/.test(land)); ok('una sola riga in alto');
assert.ok(/\.month:has\(\.m-list\)\{display:grid/.test(land)); ok('mese ed elenco del giorno affiancati');
assert.ok(/padding-left:env\(safe-area-inset-left\)/.test(html)); ok('margini per la tacca dello schermo');
const seed = { v: 1, cats: [], alarmGroups: [], todos: {}, items: [], settings: { lang: 'it', splash: false, hourH: 48, ganttScale: 'week', recent: [], sun: { on: false } } };
const dom = new JSDOM(html, {
  runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://hora.nautargo.com/',
  beforeParse(w) {
    w.localStorage.setItem('hora.v1', JSON.stringify(seed));
    Object.defineProperty(w, 'innerHeight', { value: 390, configurable: true });
    Object.defineProperty(w.HTMLElement.prototype, 'clientWidth', { get() { return 844; } });
    w.Element.prototype.getBoundingClientRect = function () { return { top: 0, left: 0, right: 844, bottom: 390, width: 844, height: 390, x: 0, y: 0 }; };
  }
});
const w = dom.window, d = w.document;
const wait = (ms = 80) => new Promise((r) => setTimeout(r, ms));
await wait(200);
assert.ok(d.querySelector('.side') && !d.querySelector('.side .mm'), 'giorno: pannello senza mese piccolo su schermo basso'); ok('schermo basso: pannello senza mese piccolo');
d.querySelector('.tabs button[aria-label="Mese"]').dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await wait();
assert.ok(d.querySelector('.side') && !d.querySelector('.side .mm'), 'nel mese il mese piccolo non si ripete'); ok('mese: niente mese piccolo ripetuto');
console.log(`1.9: ${n} test superati`);
process.exit(0);
