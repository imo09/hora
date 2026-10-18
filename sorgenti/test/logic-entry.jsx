import assert from 'node:assert/strict';
import { parseText, voiceSave, parseBlock, occurrences, toICS, parseICS, moveSub, moveCat, shiftItem, newItem, looksLikeBlock, expand, resolveCat, sunTimes, sunAvg, makePass, filterCat, NO_FILTER, unzip, parseZip, isTimedMulti } from '../src/hora.jsx';
import zlib from 'node:zlib';

const T = '2026-10-12'; // lunedì
const cats = [
  { id: 'l', name: 'Lavoro', parent: null, order: 0, color: 'verderame' },
  { id: 's1', name: 'SAL ottobre', parent: 'l', order: 0, color: null },
  { id: 'p', name: 'Personale', parent: null, order: 1, color: 'ottone' },
  { id: 'v', name: 'Viaggio Lisbona', parent: 'p', order: 0, color: 'sabbia' },
  { id: 'c', name: 'Casa', parent: null, order: 2, color: 'salvia' }
];
let n = 0;
const ok = (name, fn) => { fn(); n++; console.log('  ok', name); };

ok('riunione con fascia, avviso e categoria', () => {
  const r = parseText("riunione cantiere giovedì 9-11, ricordamelo un'ora prima #sal", cats, T);
  assert.equal(r.date, '2026-10-15'); assert.equal(r.start, 540); assert.equal(r.end, 660);
  assert.equal(r.alert, 60); assert.equal(r.cat, 's1'); assert.equal(r.title, 'Riunione cantiere'); assert.equal(r.type, 'evento');
});
ok('ora singola con durata di default', () => {
  const r = parseText('dentista gio 15:30', cats, T);
  assert.equal(r.date, '2026-10-15'); assert.equal(r.start, 930); assert.equal(r.end, 990); assert.equal(r.title, 'Dentista');
});
ok('promemoria con giorno e numero', () => {
  const r = parseText('ricordami di pagare le bollette lunedì 19', cats, T);
  assert.equal(r.type, 'promemoria'); assert.equal(r.date, '2026-10-19'); assert.equal(r.title, 'Pagare le bollette'); assert.equal(r.start, null);
});
ok('ripetizione su più giorni', () => {
  const r = parseText('corsa ogni mar, gio e sab alle 7', cats, T);
  assert.deepEqual(r.repeat.days, [1, 3, 5]); assert.equal(r.repeat.f, 'week'); assert.equal(r.start, 420); assert.equal(r.title, 'Corsa');
});
ok('intervallo di giorni', () => {
  const r = parseText('Lisbona dal 23 al 25 ottobre', cats, T);
  assert.equal(r.date, '2026-10-23'); assert.equal(r.endDate, '2026-10-25'); assert.equal(r.title, 'Lisbona');
});
ok('data con barra e alle', () => {
  const r = parseText('15/10 call fornitore alle 15', cats, T);
  assert.equal(r.date, '2026-10-15'); assert.equal(r.start, 900); assert.equal(r.title, 'Call fornitore');
});
ok('domani e promemoria:', () => {
  const r = parseText('promemoria: comprare latte domani', cats, T);
  assert.equal(r.type, 'promemoria'); assert.equal(r.date, '2026-10-13'); assert.equal(r.title, 'Comprare latte');
});
ok('dalle alle e durata', () => {
  const a = parseText('studio dalle 18 alle 19:30', cats, T); assert.equal(a.start, 1080); assert.equal(a.end, 1170);
  const b = parseText('palestra domani alle 18 per 2 ore', cats, T); assert.equal(b.end, 1200); assert.equal(b.title, 'Palestra');
});
ok('15 ottobre e prossimo venerdì', () => {
  assert.equal(parseText('cena 15 ottobre', cats, T).date, '2026-10-15');
  assert.equal(parseText('cena prossimo lunedì', cats, T).date, '2026-10-19');
  assert.equal(parseText('cena lunedì', cats, T).date, '2026-10-12');
});
ok('ricorrenze settimanali e mensili', () => {
  const it = newItem({ date: '2026-10-12', repeat: { f: 'week', days: [1, 3], until: null } });
  assert.deepEqual(occurrences(it, '2026-10-12', '2026-10-25'), ['2026-10-13', '2026-10-15', '2026-10-20', '2026-10-22']);
  const m = newItem({ date: '2026-01-31', repeat: { f: 'month', days: [], until: null } });
  assert.deepEqual(occurrences(m, '2026-02-01', '2026-04-30'), ['2026-03-31']);
  const y = newItem({ date: '2020-03-10', repeat: { f: 'year', days: [], until: '2027-01-01' } });
  assert.deepEqual(occurrences(y, '2026-01-01', '2027-12-31'), ['2026-03-10']);
  const multi = newItem({ date: '2026-10-23', endDate: '2026-10-25' });
  assert.deepEqual(occurrences(multi, '2026-10-24', '2026-10-30'), ['2026-10-23']);
  assert.equal(expand([multi], '2026-10-24', '2026-10-30')[0].end, '2026-10-25');
});
ok('spostamento di una serie', () => {
  const it = newItem({ date: '2026-10-12', repeat: { f: 'week', days: [0, 6], until: null } });
  const s = shiftItem(it, 1);
  assert.equal(s.date, '2026-10-13'); assert.deepEqual(s.repeat.days, [1, 0]);
});
const BLOCK = `#marea
13/10 07:00-07:45 | Corsa | evento | Personale | ripete mar gio sab
14/10 18:30 | Spesa settimanale | promemoria | Casa | avviso 30 minuti
16/10 | Revisione auto | promemoria | Personale | indirizzo: Via Roma 10, Parma
23/10-25/10 | Lisbona | evento | Personale › Viaggio Lisbona | link: https://example.com
19/10 09:00 | Bollette | promemoria | Bollette e conti | note: luce e gas
dentista giovedì 15:30 #casa`;
ok('blocco da Claude', () => {
  assert.equal(looksLikeBlock(BLOCK), true);
  const d = parseBlock(BLOCK, cats, T);
  assert.equal(d.length, 6);
  assert.deepEqual([d[0].date, d[0].start, d[0].end, d[0].cat, d[0].repeat.days.join()], ['2026-10-13', 420, 465, 'p', '1,3,5']);
  assert.deepEqual([d[1].type, d[1].alert, d[1].cat], ['promemoria', 30, 'c']);
  assert.equal(d[2].address, 'Via Roma 10, Parma'); assert.equal(d[2].start, null);
  assert.deepEqual([d[3].date, d[3].endDate, d[3].cat, d[3].link], ['2026-10-23', '2026-10-25', 'v', 'https://example.com']);
  assert.deepEqual(d[4].missing, ['Bollette e conti']); assert.equal(d[4].notes, 'luce e gas');
  assert.deepEqual([d[5].title, d[5].date, d[5].start, d[5].cat], ['Dentista', '2026-10-15', 930, 'c']);
  assert.deepEqual(resolveCat('Lavoro > Nuova', cats).missing, ['Lavoro', 'Nuova']);
});
ok('ics andata e ritorno', () => {
  const items = [
    newItem({ title: 'Riunione, cantiere; nord', date: '2026-10-15', start: 540, end: 660, cat: 's1', alert: 60, address: 'Via X', notes: 'riga 1\nriga 2', repeat: { f: 'week', days: [3], until: '2026-12-31' } }),
    newItem({ title: 'Lisbona', date: '2026-10-23', endDate: '2026-10-25' }),
    newItem({ title: 'Latte', type: 'promemoria', date: '2026-10-13', start: 600 })
  ];
  const back = parseICS(toICS(items, cats));
  assert.equal(back.length, 3);
  assert.deepEqual([back[0].title, back[0].date, back[0].start, back[0].end, back[0].alert, back[0].notes, back[0].catPath], ['Riunione, cantiere; nord', '2026-10-15', 540, 660, 60, 'riga 1\nriga 2', 'Lavoro › SAL ottobre']);
  assert.deepEqual([back[0].repeat.f, back[0].repeat.days.join(), back[0].repeat.until], ['week', '3', '2026-12-31']);
  assert.deepEqual([back[1].date, back[1].endDate, back[1].start], ['2026-10-23', '2026-10-25', null]);
  assert.deepEqual([back[2].type, back[2].start], ['promemoria', 600]);
});
ok('trascinare sottocategorie e categorie', () => {
  const a = moveSub(cats, 'v', { into: 'l' });
  assert.equal(a.find((c) => c.id === 'v').parent, 'l');
  assert.deepEqual(a.filter((c) => c.parent === 'l').sort((x, y) => x.order - y.order).map((c) => c.id), ['v', 's1']);
  const b = moveSub(cats, 'v', { after: 's1', parent: 'l' });
  assert.deepEqual(b.filter((c) => c.parent === 'l').sort((x, y) => x.order - y.order).map((c) => c.id), ['s1', 'v']);
  const c = moveCat(cats, 'c', { before: 'l' });
  assert.deepEqual(c.filter((x) => !x.parent).sort((x, y) => x.order - y.order).map((x) => x.id), ['c', 'l', 'p']);
});

/* ============ 1.1 ============ */
ok('ripetizioni: ogni N, giorni saltati, ultimo venerdì', () => {
  const a = newItem({ date: '2026-10-01', repeat: { f: 'day', days: [], until: null, every: 3 } });
  assert.deepEqual(occurrences(a, '2026-10-05', '2026-10-12'), ['2026-10-07', '2026-10-10']);
  const b = newItem({ date: '2026-10-05', repeat: { f: 'week', days: [0, 2], until: null, every: 2, skip: ['2026-10-21'] } });
  assert.deepEqual(occurrences(b, '2026-10-05', '2026-11-01'), ['2026-10-05', '2026-10-07', '2026-10-19']);
  const c = newItem({ date: '2026-10-30', repeat: { f: 'month', days: [], until: null, wk: { n: -1, d: 4 } } });
  assert.deepEqual(occurrences(c, '2026-10-01', '2027-01-31'), ['2026-10-30', '2026-11-27', '2026-12-25', '2027-01-29']);
  const d = newItem({ date: '2026-10-13', repeat: { f: 'month', days: [], until: null, wk: { n: 2, d: 1 }, every: 2 } });
  assert.deepEqual(occurrences(d, '2026-10-01', '2027-02-28'), ['2026-10-13', '2026-12-08', '2027-02-09']);
});
ok('evento con orario su più giorni', () => {
  const it = newItem({ date: '2026-10-23', endDate: '2026-10-25', start: 1320, end: 120 });
  assert.equal(isTimedMulti(it), true);
  assert.deepEqual(expand([it], '2026-10-24', '2026-10-24').map((o) => [o.date, o.end]), [['2026-10-23', '2026-10-25']]);
  const back = parseICS(toICS([it], cats))[0];
  assert.deepEqual([back.date, back.endDate, back.start, back.end], ['2026-10-23', '2026-10-25', 1320, 120]);
});
ok('sveglia da testo e da blocco', () => {
  const r = parseText('sveglia alle 6:45 ogni giorno', cats, T);
  assert.deepEqual([r.type, r.start, r.repeat.f, r.title], ['sveglia', 405, 'day', '']);
  assert.equal(parseText('comprare una sveglia domani', cats, T).type, 'evento');
  const d = parseBlock('#hora\n13/10 07:00 | Sveglia | sveglia | ripete lun mar mer gio ven', cats, T);
  assert.deepEqual([d[0].type, d[0].start, d[0].alert, d[0].repeat.days.join()], ['sveglia', 420, 0, '0,1,2,3,4']);
  const v = parseBlock('#hora\n23/10-24/10 22:00-08:30 | Volo notturno | evento | Personale', cats, T)[0];
  assert.deepEqual([v.date, v.endDate, v.start, v.end, v.cat], ['2026-10-23', '2026-10-24', 1320, 510, 'p']);
});
ok('promemoria solo avviso e sveglia nel file .ics', () => {
  const items = [newItem({ type: 'promemoria', title: 'Farmaco', date: '2026-10-13', start: 480, onlyAlert: true, alert: 0 }), newItem({ type: 'sveglia', title: 'Sveglia', date: '2026-10-13', start: 420, alert: 0, repeat: { f: 'week', days: [0, 1, 2, 3, 4], until: null } })];
  const back = parseICS(toICS(items, cats));
  assert.deepEqual([back[0].type, back[0].onlyAlert, back[1].type, back[1].repeat.days.join(), back[1].catPath], ['promemoria', true, 'sveglia', '0,1,2,3,4', '']);
});
const GOOGLE = [
  'BEGIN:VCALENDAR', 'PRODID:-//Google Inc//Google Calendar 70.9054//EN', 'X-WR-CALNAME:Corso sommelier', 'X-WR-TIMEZONE:Europe/Rome',
  'BEGIN:VEVENT', 'DTSTART;TZID=Europe/Rome:20261013T200000', 'DTEND;TZID=Europe/Rome:20261013T223000', 'RRULE:FREQ=WEEKLY;INTERVAL=2;COUNT=4;BYDAY=TU',
  'EXDATE;TZID=Europe/Rome:20261027T200000', 'UID:abc@google.com', 'SUMMARY:Lezione', 'END:VEVENT',
  'BEGIN:VEVENT', 'DTSTART;TZID=Europe/Rome:20261110T210000', 'DTEND;TZID=Europe/Rome:20261110T230000', 'RECURRENCE-ID;TZID=Europe/Rome:20261110T200000', 'UID:abc@google.com', 'SUMMARY:Lezione (spostata)', 'END:VEVENT',
  'BEGIN:VEVENT', 'DTSTART:20261030T090000Z', 'DTEND:20261030T100000Z', 'RRULE:FREQ=MONTHLY;BYDAY=-1FR', 'UID:m@google.com', 'SUMMARY:Riepilogo mese', 'END:VEVENT',
  'BEGIN:VEVENT', 'DTSTART;TZID=America/New_York:20261020T090000', 'DTEND;TZID=America/New_York:20261021T110000', 'UID:ny@google.com', 'SUMMARY:Volo e riunione', 'END:VEVENT',
  'BEGIN:VEVENT', 'DTSTART;VALUE=DATE:20261101', 'DTEND;VALUE=DATE:20261102', 'UID:x@google.com', 'STATUS:CANCELLED', 'SUMMARY:Annullato', 'END:VEVENT',
  'END:VCALENDAR'
].join('\r\n');
ok('export di Google: intervallo, volte, eccezioni, fusi', () => {
  const d = parseICS(GOOGLE);
  assert.equal(d.length, 4);
  const les = d.find((x) => x.title === 'Lezione');
  assert.deepEqual([les.start, les.end, les.repeat.every, les.repeat.until, les.catPath], [1200, 1350, 2, '2026-11-24', 'Corso sommelier']);
  assert.deepEqual(occurrences(les, '2026-10-01', '2026-12-31'), ['2026-10-13', '2026-11-24']);
  const mov = d.find((x) => x.title === 'Lezione (spostata)');
  assert.deepEqual([mov.date, mov.start, mov.repeat.f], ['2026-11-10', 1260, 'none']);
  const m = d.find((x) => x.title === 'Riepilogo mese');
  assert.deepEqual([m.start, m.repeat.wk], [600, { n: -1, d: 4 }]);
  const ny = d.find((x) => x.title === 'Volo e riunione');
  assert.deepEqual([ny.date, ny.start, ny.endDate, ny.end], ['2026-10-20', 900, '2026-10-21', 1020]);
  assert.ok(!d.some((x) => x.title === 'Annullato'));
  assert.equal(parseICS(GOOGLE.replace('X-WR-CALNAME:Corso sommelier', 'X-WR-CALNAME:nome@gmail.com'))[0].catPath, '');
});
// .zip minimo con un file compresso e uno no
function makeZip(files) {
  const parts = [], central = [];
  let off = 0;
  for (const [name, text, deflate] of files) {
    const raw = Buffer.from(text), data = deflate ? zlib.deflateRawSync(raw) : raw, nm = Buffer.from(name);
    const lh = Buffer.alloc(30); lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(deflate ? 8 : 0, 8); lh.writeUInt32LE(data.length, 18); lh.writeUInt32LE(raw.length, 22); lh.writeUInt16LE(nm.length, 26);
    const ch = Buffer.alloc(46); ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(deflate ? 8 : 0, 10); ch.writeUInt32LE(data.length, 20); ch.writeUInt32LE(raw.length, 24); ch.writeUInt16LE(nm.length, 28); ch.writeUInt32LE(off, 42);
    parts.push(lh, nm, data); central.push(ch, nm); off += 30 + nm.length + data.length;
  }
  const cd = Buffer.concat(central), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10); end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(off, 16);
  const b = Buffer.concat([...parts, cd, end]);
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.length);
}
const zipBuf = makeZip([['Calendario/Corso sommelier.ics', GOOGLE, true], ['Calendario/Palestra.ics', 'BEGIN:VCALENDAR\r\nBEGIN:VEVENT\r\nDTSTART:20261014T170000Z\r\nSUMMARY:Pesi\r\nEND:VEVENT\r\nEND:VCALENDAR', false]]);
const zipFiles = await unzip(zipBuf);
const zipDrafts = await parseZip(zipBuf);
ok('zip di Google: file compressi e nome del calendario', () => {
  assert.deepEqual(zipFiles.map((f) => f.name), ['Calendario/Corso sommelier.ics', 'Calendario/Palestra.ics']);
  assert.equal(zipDrafts.length, 5);
  assert.equal(zipDrafts.find((x) => x.title === 'Pesi').catPath, 'Palestra');
});
ok('alba e tramonto a Roma', () => {
  const s = sunTimes('2026-10-17', 41.9, 12.5), w = sunTimes('2026-12-21', 41.9, 12.5);
  assert.ok(Math.abs(s.rise - (7 * 60 + 22)) <= 4 && Math.abs(s.set - (18 * 60 + 25)) <= 4, JSON.stringify(s));
  assert.ok(Math.abs(w.rise - (7 * 60 + 34)) <= 4 && Math.abs(w.set - (16 * 60 + 42)) <= 4, JSON.stringify(w));
  const a = sunAvg(['2026-10-17', '2026-10-18'], 41.9, 12.5);
  assert.ok(a.rise >= s.rise && a.set <= s.set);
});
ok('filtro per tipi e categorie, categoria dei nuovi elementi', () => {
  const its = [newItem({ cat: 's1' }), newItem({ cat: 'p' }), newItem({ cat: null }), newItem({ type: 'sveglia' }), newItem({ type: 'promemoria', cat: 'l' })];
  const pass = makePass({ types: ['evento', 'sveglia'], cats: ['l'] }, cats);
  assert.deepEqual(its.map(pass), [true, false, false, true, false]);
  assert.deepEqual(its.map(makePass({ types: NO_FILTER.types, cats: ['__none'] }, cats)), [false, false, true, true, false]);
  assert.equal(filterCat({ types: NO_FILTER.types, cats: ['c', 'v'] }, cats), 'v');
  assert.equal(filterCat(NO_FILTER, cats), null);
});

/* grammatica a voce (VOCE.md) */
const V = (txt) => parseText(txt, cats, T);
const hm = (r) => [r.start, r.end];
ok('voce: fasce orarie', () => {
  assert.deepEqual(hm(V('riunione dalle 9 alle 11')), [540, 660]);
  assert.deepEqual(hm(V('riunione dalle nove alle undici')), [540, 660]);
  assert.deepEqual(hm(V('riunione dalle 9 e mezza alle 11 meno un quarto')), [570, 645]);
  assert.deepEqual(hm(V('riunione tra le 9 e le 11')), [540, 660]);
  assert.deepEqual(hm(V('pranzo dalle 12:30 alle 14')), [750, 840]);
  assert.deepEqual(hm(V('cena dalle 8 alle 10 di sera')), [1200, 1320]);
  assert.deepEqual(hm(V("corso dall'una alle tre")), [780, 900]);
  assert.deepEqual(hm(V('lavoro dalle 10 alle 2')), [600, 840]);
  assert.deepEqual(hm(V('dalle 10 a mezzogiorno banca')), [600, 720]);
});
ok('voce: inizio e durata', () => {
  assert.deepEqual(hm(V('palestra dalle 18 per due ore')), [1080, 1200]);
  assert.deepEqual(hm(V("palestra alle 18 per un'ora e mezza")), [1080, 1170]);
  assert.deepEqual(hm(V('call alle 15 per 45 minuti')), [900, 945]);
  assert.deepEqual(hm(V("call alle 15 per tre quarti d'ora")), [900, 945]);
  assert.deepEqual(hm(V('caffè alle 10 per mezz\'ora')), [600, 630]);
});
ok('voce: orari a parole e parti del giorno', () => {
  assert.equal(V('dentista alle tre e mezza').start, 930);
  assert.equal(V('dentista alle 3 del pomeriggio').start, 900);
  assert.equal(V('treno alle 6 di mattina').start, 360);
  assert.equal(V('cinema stasera alle 9').start, 1260);
  assert.equal(V('cinema domani sera alle 9').date, '2026-10-13');
  assert.equal(V('cinema giovedì sera alle 9').start, 1260);
  assert.equal(V('pranzo a mezzogiorno').start, 720);
  assert.equal(V('sveglia alle sei e mezza').start, 390);
  assert.equal(V('corsa alle 7').start, 420);
});
ok('voce: date', () => {
  assert.equal(V('cena il primo novembre').date, '2026-11-01');
  assert.equal(V('cena il ventitré ottobre').date, '2026-10-23');
  assert.equal(V('cena venerdì prossimo').date, '2026-10-16');
  assert.equal(V('cena lunedì prossimo').date, '2026-10-19');
  assert.equal(V('cena la prossima settimana').date, '2026-10-19');
  assert.equal(V('cena tra due settimane').date, '2026-10-26');
  assert.equal(V('lunedì una riunione').date, '2026-10-12');
  const r = V('Lisbona dal primo al tre novembre');
  assert.deepEqual([r.date, r.endDate, r.title], ['2026-11-01', '2026-11-03', 'Lisbona']);
});
ok('voce: ripetizioni', () => {
  assert.deepEqual(V('sveglia alle 6 e 45 dal lunedì al venerdì').repeat.days, [0, 1, 2, 3, 4]);
  assert.deepEqual(V('palestra ogni giorno feriale alle 7').repeat.days, [0, 1, 2, 3, 4]);
  const r = V('corso ogni due settimane il martedì');
  assert.deepEqual([r.repeat.f, r.repeat.every], ['week', 2]);
  const u = V('corso ogni lunedì fino al 30 novembre');
  assert.equal(u.repeat.until, '2026-11-30');
  assert.deepEqual(V('pulizie ogni weekend').repeat.days, [5, 6]);
});
ok('voce: tipi, comandi, avvisi, categoria, indirizzo, note', () => {
  let r = V('metti un evento riunione con Marco domani alle 10');
  assert.deepEqual([r.type, r.title, r.date, r.start], ['evento', 'Riunione con Marco', '2026-10-13', 600]);
  r = V('nuovo promemoria comprare il latte domani');
  assert.deepEqual([r.type, r.title], ['promemoria', 'Comprare il latte']);
  r = V('imposta la sveglia alle 7 tutti i giorni');
  assert.deepEqual([r.type, r.start, r.repeat.f, r.title], ['sveglia', 420, 'day', '']);
  assert.equal(V('crea presentazione domani').title, 'Crea presentazione');
  assert.equal(V('dentista giovedì alle 15 avvisami mezz\'ora prima').alert, 30);
  assert.equal(V('dentista giovedì alle 15 avvisami un quarto d\'ora prima').alert, 15);
  assert.equal(V('dentista giovedì alle 15 avvisami due ore prima').alert, 120);
  assert.equal(V('dentista giovedì alle 15 con avviso').alert, 0);
  r = V('sopralluogo domani alle 9 categoria lavoro');
  assert.deepEqual([r.cat, r.title], ['l', 'Sopralluogo']);
  assert.equal(V('albergo categoria personale viaggio lisbona').cat, 'v');
  r = V('cena da Anna in via Roma 10 sabato alle 20');
  assert.deepEqual([r.address, r.title, r.date, r.start], ['via Roma 10', 'Cena da Anna', '2026-10-17', 1200]);
  r = V('sopralluogo domani alle 9 indirizzo piazza Garibaldi 3, Parma');
  assert.equal(r.address, 'piazza Garibaldi 3');
  r = V('cena con Marco domani alle 20 con nota portare il vino alle 19');
  assert.deepEqual([r.notes, r.title, r.start], ['portare il vino alle 19', 'Cena con Marco', 1200]);
  assert.equal(V('ferie tutto il giorno domani').start, null);
  assert.equal(voiceSave('dentista domani alle 15 salva'), 'dentista domani alle 15');
  assert.equal(voiceSave('dentista domani'), null);
});
console.log(`motore: ${n} test superati`);
