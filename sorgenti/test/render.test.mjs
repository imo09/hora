// Test di rendering e flussi principali in jsdom
import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
const errors = [];
const dom = new JSDOM(html, {
  runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://hora.nautargo.com/',
  beforeParse(w) {
    w.console.error = (...a) => errors.push(a.join(' '));
    w.addEventListener('error', (e) => errors.push(String(e.message)));
    w.HTMLElement.prototype.scrollIntoView = () => {};
    Object.defineProperty(w.navigator, 'language', { value: 'it-IT' });
    w.Element.prototype.getBoundingClientRect = function () { return { top: 0, left: 0, right: 390, bottom: 800, width: 390, height: 800, x: 0, y: 0 }; };
  }
});
const w = dom.window, d = w.document;
const wait = (ms = 60) => new Promise((r) => setTimeout(r, ms));
const $ = (s) => d.querySelector(s), $$ = (s) => [...d.querySelectorAll(s)];
const click = (el) => { assert.ok(el, 'elemento mancante'); el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); };
const byText = (sel, txt) => $$(sel).find((e) => e.textContent.trim().includes(txt));
const type = (el, v) => {
  const proto = el.tagName === 'TEXTAREA' ? w.HTMLTextAreaElement.prototype : el.tagName === 'SELECT' ? w.HTMLSelectElement.prototype : w.HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v);
  el.dispatchEvent(new w.Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
};
const mouse = (el, kind, x, y, target = el) => target.dispatchEvent(new w.MouseEvent(kind, { bubbles: true, clientX: x, clientY: y, button: 0 }));
const store = () => JSON.parse(w.localStorage.getItem('hora.v1'));
let n = 0;
const ok = (name) => { n++; console.log('  ok', name); };

await wait(150);
assert.ok($('.splash'), 'splash'); assert.ok($('.sp-word').textContent === 'hora');
click($('.splash')); await wait(450);
assert.ok(!$('.splash')); ok('splash e chiusura');
assert.ok($('.hdr1 .tabs') && $('.hdr2 h1') && $('.fab'), 'intestazione a due righe e pulsante +');
assert.ok(!$('.bottombar'), 'barra in basso tolta');
assert.equal(store().cats.length, 3); ok('stato iniziale con 3 categorie');

click(byText('.tabs button', 'Settimana')); await wait();
assert.equal($$('.g-day').length, 7); ok('vista settimana');
click(byText('.tabs button', 'Mese')); await wait();
assert.ok($$('.m-cell').length >= 28); ok('vista mese');
click($('.gbtn')); await wait();
assert.equal($$('.gt-row.cat').length, 3); ok('gantt con categorie');
click(byText('.tabs button', 'Giorno')); await wait();

// nuovo elemento da testo
click($('.fab')); await wait(300);
click($('.lnk.sm')); await wait();
assert.ok($$('.vex').length >= 4, 'esempi per la voce'); click($('.lnk.sm')); await wait();
const ta = $('.smart-ta');
type(ta, "riunione cantiere domani 9-11, ricordamelo un'ora prima #lav"); await wait();
assert.equal($$('.form input')[0].value, 'Riunione cantiere');
assert.ok($$('.smart-hl mark').length >= 3, 'evidenziazioni');
click($('.sh-foot .btn.pri')); await wait();
let s = store();
assert.equal(s.items.length, 1);
const lav = s.cats.find((c) => c.name === 'Lavoro');
assert.deepEqual([s.items[0].start, s.items[0].end, s.items[0].alert, s.items[0].cat], [540, 660, 60, lav.id]);
ok('creazione da testo naturale');
await wait();
assert.ok($('.ev') && $('.ev').textContent.includes('Riunione cantiere'), 'evento visibile nel giorno');
ok('evento nella griglia');

// trascinamento con il mouse: 9:00 -> 10:00
const scroller = $('.g-scroll');
const ev = $('.ev');
mouse(scroller, 'mousedown', 200, 440, ev); mouse(w, 'mousemove', 200, 470); mouse(w, 'mousemove', 200, 488); await wait();
assert.ok($('.ev.ghost'), 'fantasma durante il trascinamento');
mouse(w, 'mouseup', 200, 488); await wait();
s = store();
assert.deepEqual([s.items[0].start, s.items[0].end], [600, 720]); ok('spostamento a quarti d\'ora');
// maniglia inferiore: fine 12:00 -> 12:30
const hd = $('.hd.bot');
assert.ok(hd, 'maniglie visibili dopo la selezione');
mouse(scroller, 'mousedown', 200, 576, hd); mouse(w, 'mousemove', 200, 600); mouse(w, 'mouseup', 200, 600); await wait();
assert.equal(store().items[0].end, 750); ok('allungamento con la maniglia');

// tocco su uno spazio vuoto: prima toglie la selezione, poi crea un blocco di un'ora, poi apre il form
const col0 = $('.g-col');
mouse(scroller, 'mousedown', 200, 1110, col0); mouse(w, 'mouseup', 200, 1110); await wait();
assert.ok(!$('.hd'), 'selezione tolta');
mouse(scroller, 'mousedown', 200, 1110, col0); mouse(w, 'mouseup', 200, 1110); await wait();
const dr = $('.ev.draft');
assert.ok(dr && dr.textContent.includes('Nuovo') && dr.textContent.includes('23:00 - 24:00'), 'blocco nuovo di 1 ora');
mouse(scroller, 'mousedown', 200, 1120, dr); mouse(w, 'mouseup', 200, 1120); await wait(300);
assert.ok($('.sheet') && !$('.ev.draft'));
type($('.smart-ta'), 'telefonata'); await wait();
assert.equal($$('.fl.dt input[type=time]')[0].value, '23:00', 'ora tenuta dal tocco');
click($('.sh-foot .btn.pri')); await wait();
s = store();
const tel = s.items.find((x) => x.title === 'Telefonata');
assert.deepEqual([tel.start, tel.end], [1380, 1440]); ok('creazione toccando il calendario');

// apertura e campi indirizzo / link / note
const ev2 = $$('.ev').find((e) => e.textContent.includes('Riunione'));
mouse(scroller, 'mousedown', 200, 500, ev2); mouse(w, 'mouseup', 200, 500); await wait(200);
assert.ok($('.sheet .iv-title') && $('.iv-title').textContent.includes('Riunione'), 'riepilogo aperto');
assert.ok(byText('.iv-row', 'Lavoro') && byText('.iv-row', 'ora prima'), 'categoria e avviso nel riepilogo'); ok('riepilogo elemento');
click($('.sheet button[aria-label="Modifica"]')); await wait(200);
type($('#f-addr'), 'Via Roma 10, Parma'); type($('#f-link'), 'example.com'); type($('#f-notes'), 'portare il computo'); await wait();
assert.ok($('a[aria-label="Apri in Google Maps"]').href.includes('google.com/maps/search/?api=1&query=Via%20Roma%2010%2C%20Parma'));
assert.equal($('a[aria-label="Apri il link"]').href, 'https://example.com/');
click($('.sh-foot .btn.pri')); await wait();
s = store();
assert.deepEqual([s.items[0].address, s.items[0].link, s.items[0].notes], ['Via Roma 10, Parma', 'example.com', 'portare il computo']);
ok('indirizzo con Google Maps, link e note');

// evento da un giorno e un'ora a un altro giorno e un'ora
click($('.fab')); await wait(300);
type($$('.form input')[0], 'Trasferta');
click($('.form .sw[aria-label="Tutto il giorno"]')); await wait();
const [dS, tS] = $$('.fl.dt')[0].querySelectorAll('input'), [dE, tE] = $$('.fl.dt')[1].querySelectorAll('input');
type(dS, '2026-11-02'); type(tS, '22:00'); type(dE, '2026-11-04'); type(tE, '08:30'); await wait();
click($('.sh-foot .btn.pri')); await wait();
const tr = store().items.find((x) => x.title === 'Trasferta');
assert.deepEqual([tr.date, tr.start, tr.endDate, tr.end], ['2026-11-02', 1320, '2026-11-04', 510]);
click(byText('.tabs button', 'Settimana')); await wait();
const segs = $$('.ev').filter((e) => e.textContent.includes('Trasferta'));
assert.equal(segs.length, 3, 'un tratto per giorno'); assert.ok(segs.every((e) => !e.querySelector('.hd')));
ok('evento su più giorni con orario');

// promemoria solo avviso
click($('.fab')); await wait(300);
click(byText('.sheet .seg button', 'Promemoria')); await wait();
type($$('.form input')[0], 'Farmaco'); type($('.form input[type=date]'), '2026-11-03'); 
click($('.form .sw[aria-label="Tutto il giorno"]')); await wait();
type($('.form input[type=time]'), '08:00'); await wait();
click($('.form .sw[aria-label="Da completare"]')); await wait();
click($('.sh-foot .btn.pri')); await wait();
const fa = store().items.find((x) => x.title === 'Farmaco');
assert.deepEqual([fa.type, fa.onlyAlert, fa.alert], ['promemoria', true, 0]);
const remF = $$('.rem').find((e) => e.textContent.includes('Farmaco'));
assert.ok(remF && !remF.querySelector('[data-chk]'), 'senza casella'); ok('promemoria solo avviso');

// sveglia: giorni della settimana, riga spessa nel calendario, fuori da categorie e attività
click($('.fab')); await wait(300);
click(byText('.sheet .seg button', 'Sveglia')); await wait();
assert.ok(!byText('.sheet .fl', 'Categoria'), 'niente categoria');
type($('.form input[type=time]'), '06:30');
click(byText('.wdays button', 'Lu')); click(byText('.wdays button', 'Ma')); await wait();
click($('.sh-foot .btn.pri')); await wait();
const sv = store().items.find((x) => x.type === 'sveglia');
assert.deepEqual([sv.title, sv.start, sv.repeat.f, sv.repeat.days.join(), sv.cat, sv.alert], ['Sveglia', 390, 'week', '0,1', null, 0]);
assert.equal($$('.alm').length, 2, 'riga spessa lunedì e martedì'); ok('sveglia');

// alba e tramonto
assert.equal($$('.sun').length, 2); assert.ok($$('.sunl')[0].textContent.startsWith('↑')); ok('righe di alba e tramonto');

// filtro: tipi e categorie, nuovi elementi nella categoria filtrata
click($('button[aria-label="Filtro"]')); await wait();
click(byText('.sheet .chip', 'Sveglie')); await wait();
click(byText('.sheet .li', 'Lavoro')); await wait();
click(byText('.sheet .btn', 'Fatto')); await wait();
assert.ok($('.ctl.filt.on'), 'filtro acceso');
assert.equal($$('.alm').length, 0); assert.ok(!$$('.ev').some((e) => e.textContent.includes('Trasferta')));
click($('.fab')); await wait(300);
assert.ok(byText('.sheet .fl.btnrow', 'Lavoro'), 'nuovo elemento già in Lavoro');
click($('.sheet button[aria-label="Chiudi"]')); await wait();
click($('button[aria-label="Filtro"]')); await wait();
click(byText('.sheet .btn', 'Mostra tutto')); click(byText('.sheet .btn', 'Fatto')); await wait();
assert.ok(!$('.ctl.filt.on')); ok('filtro per tipi e categorie');
click(byText('.tabs button', 'Giorno')); await wait();

// incolla un blocco da Claude
const BLOCK = '#hora\n13/10 07:00-07:45 | Corsa | evento | Personale | ripete mar gio sab\n14/10 18:30 | Spesa | promemoria | Casa\n23/10-25/10 | Lisbona | evento | Personale › Viaggio Lisbona\n19/10 | Bollette | promemoria';
click($('.fab')); await wait(300);
const pe = new w.Event('paste', { bubbles: true, cancelable: true });
Object.defineProperty(pe, 'clipboardData', { value: { getData: () => BLOCK } });
$('.smart-ta').dispatchEvent(pe); await wait();
assert.equal($$('.imp').length, 4); ok('blocco incollato apre Da aggiungere');
assert.ok(byText('.catchip', 'Viaggio Lisbona (nuova)'));
click($$('.imp .cb')[1]); await wait();
click($('.foot2 .btn.pri')); await wait();
s = store();
assert.equal(s.items.length, 8);
const pers = s.cats.find((c) => c.name === 'Personale');
assert.ok(s.cats.find((c) => c.name === 'Viaggio Lisbona' && c.parent === pers.id), 'sottocategoria creata');
ok('conferma con sottocategoria nuova e un elemento tolto');

// link con hash
w.location.hash = '#aggiungi=' + encodeURIComponent('#hora\n20/10 10:00 | Dal link | promemoria');
await wait(120);
assert.ok(byText('.screen h1', 'Da aggiungere')); assert.equal($$('.imp').length, 1);
click($('.foot2 .btn.pri')); await wait();
assert.equal(store().items.length, 9); ok('link #aggiungi');

// mese: un tocco seleziona, il + crea in quel giorno, il doppio tocco apre il giorno
click(byText('.tabs button', 'Mese')); await wait();
const cell = $$('.m-cell')[10];
click(cell); await wait();
assert.ok(cell.classList.contains('sel') && byText('.tabs button', 'Mese').classList.contains('on'));
click($('.fab')); await wait(300);
const dSel = $('.form input[type=date]').value;
assert.equal(+dSel.slice(8), +cell.querySelector('.m-n').textContent, 'il + crea nel giorno scelto');
click($('.sheet button[aria-label="Chiudi"]')); await wait();
click(cell); click(cell); await wait();
assert.ok(byText('.tabs button', 'Giorno').classList.contains('on')); assert.ok($('.grid')); ok('mese: tocco e doppio tocco');


// gantt: Non assegnate visibile e spegnibile, apertura categoria
click($('.gbtn')); await wait();
assert.ok(byText('.gt-label', 'Non assegnate'), 'riga Non assegnate');
click(byText('.gt-label', 'Personale')); await wait();
assert.ok(byText('.gt-label', 'Viaggio Lisbona'), 'sottocategoria visibile');
click(byText('.gt-label', 'Viaggio Lisbona')); await wait();
assert.ok($$('.gt-row.item').some((r) => r.textContent.includes('Lisbona')));
assert.ok($('.gbar.item'), 'barra di più giorni'); assert.ok($('.gm'), 'milestone di un giorno');
ok('gantt: barre, milestone e apertura');
click(byText('.gt-tools .pill', 'Categorie')); await wait();
click($('.sheet .sw')); await wait();
click(byText('.sheet .btn', 'Fatto')); await wait();
assert.ok(!byText('.gt-label', 'Non assegnate')); ok('Non assegnate spenta');
assert.ok(!$$('.gt-row').some((r) => r.textContent.includes('Sveglia')), 'sveglie fuori dalle attività');
click(byText('.seg.sm button', 'Mesi')); await wait();
assert.equal($$('.gh-mm').length, 48); ok('scala mesi (4 anni, scorrimento infinito)');
assert.ok(!$('button[aria-label="Successivo"]') && $('.ctl.date'), 'Attività: senza frecce, con Vai a data');
click($('.ctl.date')); await wait();
click(byText('.dp-grid button', '2027')); await wait();
click(byText('.dp-grid button', 'Mar')); await wait();
click($$('.dp-grid button').find((b) => b.textContent === '10')); await wait();
assert.ok(!$('.dp-grid') && $('.hdr2 h1').textContent.includes('2027')); ok('vai a data: anno, mese, giorno');

// impostazioni e categorie
click($('button[aria-label="Impostazioni"]')); await wait();
assert.equal($$('.screen .sgroup').length, 5); ok('impostazioni in blocchi');
click(byText('.screen .li', 'Categorie')); await wait();
assert.ok($$('.crow').length >= 4); ok('schermata categorie');
click(byText('.crow-main', 'Lavoro')); await wait();
const before = $$('.icons button').length;
click(byText('.icons .more', 'Altro')); await wait();
assert.ok($$('.icons button').length > before + 20); ok('icone: Altro');
const cb = $$('.swatches .sws').length;
click(byText('.swatches .more', 'Altro')); await wait();
assert.ok($$('.swatches .sws').length >= 24 && cb === 8); ok('colori: Altro');
type($$('.screen textarea').pop(), 'Cantieri e uffici'); await wait();
click(byText('.screen .lnk', 'Fatto')); await wait();
assert.equal(store().cats.find((c) => c.name === 'Lavoro').details, 'Cantieri e uffici'); ok('dettagli categoria');

// alba e tramonto: località e spegnimento
assert.ok(byText('.screen .li', 'Alba e tramonto') && $('.screen .li-sel').value === 'Roma');
click($('.screen .sw[aria-label="Mostra nel calendario"]')); await wait();
assert.equal(store().settings.sun.on, false); ok('alba e tramonto spenti dalle impostazioni');

// lingua inglese
click(byText('.screen .seg button', 'English')); await wait();
assert.ok(byText('.screen h1', 'Settings')); ok('interfaccia in inglese');

assert.deepEqual(errors.filter((e) => !/Not implemented|navigation/i.test(e)), [], 'errori nel log');
console.log(`rendering: ${n} test superati`);
w.close();
