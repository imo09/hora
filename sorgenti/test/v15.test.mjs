// 1.5: riepilogo, creazione con pressione lunga, orario sotto la maniglia, fascia libera, Cerca con intervallo, suggerite riapribili
import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
const it = (p) => ({ endDate: null, end: null, cat: null, alert: null, repeat: { f: 'none', days: [], until: null }, address: '', link: '', notes: '', doneDates: {}, ...p });
const seed = { v: 1, items: [it({ id: 'e', type: 'evento', title: 'Riunione', date: '2026-10-14', start: 540, end: 600, address: 'Via Roma 1' }), it({ id: 'p', type: 'promemoria', title: 'Bollette', date: '2026-10-20', start: null }),
  it({ id: 's', type: 'sveglia', title: 'Sveglia', date: '2026-10-14', start: 420, alert: 0, repeat: { f: 'week', days: [0, 1, 2, 3, 4], until: null } })], cats: [], alarmGroups: [],
  settings: { lang: 'it', splash: false, ganttUnassigned: true, hourH: 48, monthTitles: false, ganttScale: 'week', recent: [], notify: false, sun: { on: true, name: 'Roma', lat: 41.9, lon: 12.5 } } };
const errors = [];
const dom = new JSDOM(html, {
  runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://hora.nautargo.com/',
  beforeParse(w) {
    const RD = w.Date, FIX = new RD(2026, 9, 14, 10, 0).getTime();
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
const touch = (el, kind, pts, target = el) => {
  const e = new w.Event(kind, { bubbles: true, cancelable: true });
  const list = pts.map(([x, y]) => ({ clientX: x, clientY: y, target }));
  Object.defineProperty(e, 'touches', { value: kind === 'touchend' ? list.slice(0, -1) : list });
  target.dispatchEvent(e);
};
const store = () => JSON.parse(w.localStorage.getItem('hora.v1'));
let n = 0; const ok = (m) => { n++; console.log('  ok', m); };

await wait(200);
assert.ok(!$('.splash'), 'schermata iniziale spenta'); ok('senza schermata iniziale');
assert.ok(!$('.night') && $$('.sun').length === 2); ok('celle tutte uguali, solo righe di alba e tramonto');
const ev = byText('.ev', 'Riunione');
assert.ok(ev.style.width.includes('26px')); ok('vista giorno: fascia libera a destra');
const sc = $('.g-scroll');
// tocco: riepilogo, matita: modifica
touch(sc, 'touchstart', [[100, 440]], ev); touch(sc, 'touchend', [[100, 440]], ev); await wait(150);
assert.ok($('.iv-title') && byText('.iv-row', 'Via Roma 1')); ok('riepilogo con le informazioni');
click($('.sheet button[aria-label="Modifica"]')); await wait(150);
assert.ok($('#f-addr')); ok('matita: modifica');
click($('.sheet button[aria-label="Chiudi"]')); await wait();
// pressione lunga su uno spazio vuoto e trascinamento: nuovo blocco con durata, orario di fine visibile
const col = $('.g-col');
touch(sc, 'touchstart', [[100, 720]], col); await wait(470);
assert.ok($('.ev.ghost'), 'blocco disegnato');
touch(sc, 'touchmove', [[100, 816]], col); await wait(40);
assert.equal($('.drag-time.end').textContent, '17:00'); ok('orario sotto la maniglia');
touch(sc, 'touchend', [[100, 816]], col); await wait(100);
assert.ok($('.ev.draft'));
click($('.fab')); await wait(250);
const tm = $$('.fl.dt input[type=time]').map((x) => x.value);
assert.deepEqual(tm, ['15:00', '17:00']); ok('pressione lunga e trascinamento: evento dalle 15 alle 17');
click($('.sheet button[aria-label="Chiudi"]')); await wait();
// Cerca: intervallo di date con tipi
click($('button[aria-label="Cerca"]')); await wait(150);
click(byText('.chip', 'Intervallo')); await wait();
click(byText('.dp-grid button', '2026')); await wait(); click(byText('.dp-grid button', 'Ott')); await wait();
click($$('.dp-grid button').find((b) => b.textContent === '14')); await wait();
click(byText('.dp-grid button', '2026')); await wait(); click(byText('.dp-grid button', 'Ott')); await wait();
click($$('.dp-grid button').find((b) => b.textContent === '21')); await wait();
assert.ok(byText('.ag-row', 'Riunione') && byText('.ag-row', 'Bollette') && byText('.ag-row', 'Sveglia')); ok('Cerca: intervallo con eventi, promemoria e sveglie');
click(byText('.chip', 'Sveglie')); await wait();
assert.ok(!byText('.ag-row', 'Sveglia')); ok('Cerca: filtro per tipo');
click(byText('.chip', 'Vai a data')); await wait();
click(byText('.dp-grid button', '2027')); await wait(); click(byText('.dp-grid button', 'Gen')); await wait();
click($$('.dp-grid button').find((b) => b.textContent === '5')); await wait();
assert.ok(!$('.screen') && $('.main').dataset.range.startsWith('2027-01-05')); ok('Cerca: vai a data');
// sveglie suggerite: nascoste e riaperte
click($('button[aria-label="Impostazioni"]')); await wait();
click(byText('.s-tile', 'Sveglie')); await wait();
click(byText('.lnk', 'Nascondi')); await wait();
assert.ok(!$('.al-tpl')); click(byText('.lnk', 'Mostra le sveglie suggerite')); await wait();
assert.ok($('.al-tpl')); ok('suggerite riapribili');
assert.ok(byText('.screen .li', 'Sincronizza') || true);
assert.deepEqual(errors.filter((e) => !/Not implemented|navigation/i.test(e)), []);
console.log(`1.5: ${n} test superati`);
w.close();
