// 1.8: nota in folio già dal modulo, anteprima salvata nell'elemento, colonna delle settimane, campo del Nuovo, marchio Settimana
import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
const R = { f: 'none', days: [], until: null };
const seed = { v: 1, cats: [{ id: 'l', name: 'Lavoro', icon: 'valigetta', color: 'verderame', parent: null, order: 0, gantt: true }], alarmGroups: [], todos: {},
  items: [
    { id: 'a', type: 'evento', title: 'Riunione', date: '2026-11-26', start: 540, end: 600, cat: 'l', repeat: R, doneDates: {} },
    { id: 'b', type: 'evento', title: 'Cena', date: '2026-11-26', start: 1200, end: 1260, cat: 'l', repeat: R, doneDates: {},
      folio: { by: 'folio', id: 'zz1', title: 'Menu della cena', prev: '# Menu\n\n- [ ] antipasto\n- [x] vino\n- dolce\n\n[Apri in hora](https://hora.nautargo.com/#nota=zz1)\n' } }
  ],
  settings: { lang: 'it', splash: false, ganttUnassigned: true, hourH: 48, monthTitles: false, ganttScale: 'week', recent: [], notify: false, sun: { on: false, name: 'Roma', lat: 41.9, lon: 12.5 } } };
const errors = [];
const dom = new JSDOM(html, {
  runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://hora.nautargo.com/',
  beforeParse(w) {
    const RD = w.Date, FIX = new RD(2026, 10, 26, 10, 0).getTime();
    class FD extends RD { constructor(...a) { if (a.length) super(...a); else super(FIX); } static now() { return FIX; } }
    w.Date = FD;
    w.localStorage.setItem('hora.v1', JSON.stringify(seed));
    w.console.error = (...a) => errors.push(a.join(' '));
    w.open = () => null;
    Object.defineProperty(w.HTMLElement.prototype, 'clientWidth', { get() { return 390; } });
    w.Element.prototype.getBoundingClientRect = function () { return { top: 0, left: 0, right: 390, bottom: 800, width: 390, height: 800, x: 0, y: 0 }; };
  }
});
const w = dom.window, d = w.document;
const wait = (ms = 60) => new Promise((r) => setTimeout(r, ms));
const $ = (s) => d.querySelector(s), $$ = (s) => [...d.querySelectorAll(s)];
const click = (el) => { assert.ok(el, 'elemento mancante'); el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); };
const byText = (sel, txt) => $$(sel).find((e) => e.textContent.trim().includes(txt));
const store = () => JSON.parse(w.localStorage.getItem('hora.v1'));
let n = 0; const ok = (m) => { n++; console.log('  ok', m); };

await wait(200);
// marchio Settimana: sette colonne e il punto ottone
assert.equal($$('.logo svg .mk-b').length, 7);
assert.ok($('.logo svg .mk-sun')); ok('marchio Settimana');
// campo del Nuovo centrato rispetto al microfono
assert.ok(/\.smart\{display:flex;gap:10px;align-items:center/.test(html)); ok('campo del Nuovo centrato');
// colonna delle settimane con fondo e testo a contrasto
assert.ok(/\.m-wk,\.m-wk0\{[^}]*color:var\(--wkink\)[^}]*background:var\(--wkbg\)/.test(html));
assert.ok(/--wkbg:#D3DBD7;--wkink:#22313B/.test(html) && /--wkbg:#22323B;--wkink:#D5DEE2/.test(html)); ok('colonna delle settimane a contrasto, chiaro e scuro');
// nota in folio dal modulo di modifica
click($('.tabs button[aria-label="Mese"]')); await wait();
click(byText('.m-open', 'Riunione')); await wait();
click($('.sheet button[aria-label="Modifica"]')); await wait();
click($('.fo-fl .lnk')); await wait();
assert.ok(!$('.sheet .fo-all'), 'nel modulo niente "anche agli altri"');
click($('.sheet .fo-new')); await wait();
assert.ok($('.fo-pick').textContent.includes('creato al salvataggio'));
click(byText('.sheet .btn.pri', 'Salva')); await wait(150);
const fa = store().items.find((x) => x.id === 'a').folio;
assert.ok(fa && fa.by === 'hora' && fa.id && fa.title === 'Riunione'); ok('nota in folio scelta dal modulo e salvata');
// nuovo elemento: la nota si sceglie già alla creazione
click($('.fab')); await wait(300);
const ta = $('.smart-ta');
Object.getOwnPropertyDescriptor(w.HTMLTextAreaElement.prototype, 'value').set.call(ta, 'Corso di yoga giovedì 18');
ta.dispatchEvent(new w.Event('input', { bubbles: true })); await wait();
click($('.fo-fl .lnk')); await wait();
click($('.sheet .fo-new')); await wait();
click(byText('.sheet .btn.pri', 'Aggiungi')); await wait(150);
const yoga = store().items.find((x) => x.title.startsWith('Corso di yoga'));
assert.ok(yoga && yoga.folio && yoga.folio.by === 'hora'); ok('nota in folio scelta alla creazione');
// anteprima: senza folio raggiungibile resta quella salvata nell'elemento, in markdown leggibile
click($('.ctl.today')); await wait();
click(byText('.m-open', 'Cena')); await wait(150);
const prev = $('.fo-prev');
assert.ok(prev, 'anteprima');
assert.ok(prev.querySelector('.fo-h') && prev.querySelector('.fo-h').textContent === 'Menu');
assert.equal(prev.querySelectorAll('.fo-cb').length, 2);
assert.ok(prev.querySelector('.fo-cb.on').textContent.includes('vino'));
assert.ok(!prev.textContent.includes('Apri in hora'), 'il collegamento di ritorno non entra nell\'anteprima');
assert.ok($('.fo-card').textContent.includes('Menu della cena')); ok('anteprima della nota dall\'ultima lettura');
assert.equal(errors.length, 0, errors.join('\n'));
console.log(`1.8: ${n} test superati`);
process.exit(0);
