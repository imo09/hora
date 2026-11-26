// 1.7: settimane, da fare, nota in folio, barra in alto, esportazione a scelta, pannello del giorno, marchio
import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
const R = { f: 'none', days: [], until: null };
const seed = { v: 1, cats: [{ id: 'l', name: 'Lavoro', icon: 'valigetta', color: 'verderame', parent: null, order: 0, gantt: true }, { id: 'p', name: 'Personale', icon: 'persone', color: 'ottone', parent: null, order: 1, gantt: true }], alarmGroups: [],
  items: [
    { id: 'a', type: 'evento', title: 'Corso', date: '2026-11-26', start: 540, end: 600, cat: 'l', repeat: { f: 'week', days: [3], until: null }, doneDates: {} },
    { id: 'b', type: 'evento', title: 'Cena', date: '2026-11-27', start: 1200, end: 1260, cat: 'p', repeat: R, doneDates: {} },
    { id: 'c', type: 'evento', title: 'Cena', date: '2026-12-04', start: 1200, end: 1260, cat: 'p', repeat: R, doneDates: {} },
    { id: 'd', type: 'sveglia', title: 'Sveglia', date: '2026-11-26', start: 420, repeat: { f: 'day', days: [], until: null }, doneDates: {} },
    { id: 'e', type: 'promemoria', title: 'Vecchio', date: '2025-01-10', start: 600, cat: 'l', repeat: R, doneDates: {} }
  ],
  settings: { lang: 'it', splash: false, ganttUnassigned: true, hourH: 48, monthTitles: false, ganttScale: 'week', recent: [], notify: false, sun: { on: false, name: 'Roma', lat: 41.9, lon: 12.5 } } };
const errors = [], opened = [], downloads = [];
let width = 390;
const dom = new JSDOM(html, {
  runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://hora.nautargo.com/',
  beforeParse(w) {
    const RD = w.Date, FIX = new RD(2026, 10, 26, 10, 0).getTime();
    class FD extends RD { constructor(...a) { if (a.length) super(...a); else super(FIX); } static now() { return FIX; } }
    w.Date = FD;
    w.localStorage.setItem('hora.v1', JSON.stringify(seed));
    w.console.error = (...a) => errors.push(a.join(' '));
    w.open = (u) => { opened.push(u); return null; };
    w.URL.createObjectURL = () => 'blob:x';
    w.URL.revokeObjectURL = () => {};
    w.HTMLAnchorElement.prototype.click = function () { downloads.push(this.download); };
    Object.defineProperty(w.HTMLElement.prototype, 'clientWidth', { get() { return width; } });
    w.Element.prototype.getBoundingClientRect = function () { return { top: 0, left: 0, right: width, bottom: 800, width, height: 800, x: 0, y: 0 }; };
  }
});
const w = dom.window, d = w.document;
const wait = (ms = 60) => new Promise((r) => setTimeout(r, ms));
const $ = (s) => d.querySelector(s), $$ = (s) => [...d.querySelectorAll(s)];
const click = (el) => { assert.ok(el, 'elemento mancante'); el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); };
const byText = (sel, txt) => $$(sel).find((e) => e.textContent.trim().includes(txt));
const store = () => JSON.parse(w.localStorage.getItem('hora.v1'));
const type = (el, v) => { const set = Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, 'value').set; set.call(el, v); el.dispatchEvent(new w.Event('input', { bubbles: true })); };
const enter = (el) => el.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
let n = 0; const ok = (m) => { n++; console.log('  ok', m); };

await wait(200);
// marchio nuovo, senza ingranaggio
assert.ok($('.logo svg .mk-sun'), 'marchio con il sole');
assert.ok(!$('.logo-g'), 'niente ingranaggio sul marchio'); ok('marchio senza ingranaggio');
// numero di settimana nella vista Giorno
assert.equal($('.g-wk').textContent, 'S48'); ok('settimana 48 nella vista Giorno');
// da fare: striscia nella vista Giorno
click($('.todo.strip .td-h')); await wait();
type($('.todo .td-add input'), 'Pagare bolletta'); enter($('.todo .td-add input')); await wait();
type($('.todo .td-add input'), 'Comprare il pane'); enter($('.todo .td-add input')); await wait();
assert.deepEqual(store().todos['2026-11-26'].map((x) => x.t), ['Pagare bolletta', 'Comprare il pane']);
click($('.todo .td-list .cb')); await wait();
assert.equal(store().todos['2026-11-26'][0].done, true);
assert.equal($('.todo .td-n').textContent, '1/2'); ok('da fare: aggiunta e spunta');
click(byText('.todo .td-move', 'Sposta a domani')); await wait();
assert.equal(store().todos['2026-11-27'][0].t, 'Comprare il pane');
assert.equal(store().todos['2026-11-26'].length, 1); ok('da fare: i non fatti passano a domani');
// barra in alto: elenco e sveglie
assert.ok($('.hdr button[aria-label="Eventi e promemoria"]') && $('.hdr button[aria-label="Sveglie"]'));
click($('.hdr button[aria-label="Eventi e promemoria"]')); await wait();
assert.ok($('.screen'), 'elenco aperto');
click($('.screen button[aria-label="Indietro"]')); await wait();
click($('button[aria-label="Impostazioni"]')); await wait();
assert.ok(!$('.s-tile'), 'non più nelle impostazioni'); ok('elenco e sveglie nella barra in alto');
// esportazione a scelta
click(byText('.screen .li', 'Esporta')); await wait();
assert.ok($('.sheet .ex-sum').textContent.includes('Elementi: 5'), $('.sheet .ex-sum').textContent);
click(byText('.sheet .chip', 'Sveglie')); await wait();
click(byText('.sheet .chip', 'Personale')); await wait();
assert.ok($('.sheet .ex-sum').textContent.includes('Elementi: 2'), $('.sheet .ex-sum').textContent);
click(byText('.sheet .chip', 'Tutte')); await wait();
click(byText('.sheet .chip', 'Da una data in poi')); await wait();
click(byText('.dp-grid button', '2026')); await wait(); click(byText('.dp-grid button', 'Gen')); await wait();
click($$('.dp-grid button').find((b) => b.textContent === '1')); await wait();
assert.ok($('.sheet .ex-sum').textContent.includes('Elementi: 3'), 'senza sveglie e senza il promemoria del 2025: ' + $('.sheet .ex-sum').textContent); ok('esportazione: tipi, categorie e data');
click(byText('.sheet .btn', 'Esporta')); await wait();
assert.ok(downloads.some((x) => typeof x === 'string' && x.startsWith('hora-parziale-')), downloads.join()); ok('esportazione parziale scaricata');
click($('.screen button[aria-label="Indietro"]')); await wait();
// settimane nel mese
click($('.tabs button[aria-label="Mese"]')); await wait();
assert.ok($$('.m-wk').map((x) => x.textContent).includes('48')); ok('settimane nel mese');
assert.ok($('.m-list .todo')); ok('da fare sotto il giorno del mese');
// nota in folio da un evento ripetuto
click(byText('.m-open', 'Corso')); await wait();
click($('.fo-row.add')); await wait();
click(byText('.sheet .btn', 'Crea un Foglio')); await wait();
const f = store().items.find((x) => x.id === 'a').folio;
assert.ok(f && f.by === 'hora' && f.id, 'nota legata');
assert.ok(opened[0] && opened[0].startsWith('https://folio.nautargo.com/#hora?') && opened[0].includes('id=' + f.id) && opened[0].includes('t=Corso'), String(opened[0]));
assert.ok($('.fo-row a').getAttribute('href').includes('#hora?')); ok('nota in folio creata e aperta');
click($('.sheet button[aria-label="Chiudi"]')); await wait();
// un Foglio esistente legato a due eventi con lo stesso titolo
click($$('.m-cell').find((c) => c.getAttribute('aria-label').toLowerCase().startsWith('ven 27'))); await wait();
click(byText('.m-open', 'Cena')); await wait();
click($('.fo-row.add')); await wait();
click($('.sheet .fo-all .sw')); await wait();
type($('.sheet .search input'), 'https://folio.nautargo.com/#foglio=abc123'); await wait();
click(byText('.sheet .btn', 'Collega')); await wait();
assert.deepEqual(store().items.filter((x) => x.folio && x.folio.id === 'abc123').map((x) => x.id).sort(), ['b', 'c']); ok('Foglio esistente legato a più eventi');
click($('.sheet button[aria-label="Chiudi"]')); await wait();
// ritorno da folio: #nota= apre l'elemento
w.location.hash = '#nota=' + f.id; await wait(150);
assert.ok($('.iv-title') && $('.iv-title').textContent === 'Corso'); ok('da folio a hora: si apre l\'elemento');
click($('.sheet button[aria-label="Chiudi"]')); await wait();
// pannello del giorno su schermo largo
width = 1300; w.dispatchEvent(new w.Event('resize')); await wait(120);
assert.ok($('.side .mm') && $('.side .sd-day') && $('.side .todo'), 'pannello del giorno');
assert.ok(!$('.m-list'), 'elenco sotto il mese spostato nel pannello');
click($$('.side .mm-d').find((b) => b.getAttribute('aria-label').toLowerCase().startsWith('mer 2 dic'))); await wait();
assert.ok($('.side .sd-h h2').textContent.includes('2 dic'), $('.side .sd-h h2').textContent); ok('pannello del giorno accanto al mese');
click($('.tabs button[aria-label="Giorno"]')); await wait();
assert.ok($('.side') && !$('.todo.strip')); ok('pannello anche nella vista Giorno');
// Attività: settimane nell'intestazione
click($('.gbtn')); await wait(150);
assert.ok($$('.gh-w').some((x) => x.textContent === 'S48')); ok('settimane in Attività');
assert.equal(errors.length, 0, errors.join('\n'));
console.log(`1.7: ${n} test superati`);
process.exit(0);
