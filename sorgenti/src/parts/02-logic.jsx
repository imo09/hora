
/* ============ Modello ============ */
export const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
export const NO_REPEAT = { f: 'none', days: [], until: null };
export function newItem(p = {}) {
  return {
    id: uid(), type: 'evento', title: '', date: todayStr(), endDate: null, start: null, end: null, cat: null,
    alert: null, repeat: { ...NO_REPEAT }, address: '', link: '', notes: '', doneDates: {}, created: Date.now(), ...p
  };
}
export const isMulti = (it) => it.type === 'evento' && !!it.endDate && it.endDate > it.date;
export const isTimedMulti = (it) => isMulti(it) && it.start != null;
export const spanDays = (it) => (isMulti(it) ? diffDays(it.date, it.endDate) : 0);
export const isDone = (it, d) => !!(it.doneDates && it.doneDates[d]);
export const byOrder = (a, b) => (a.order ?? 0) - (b.order ?? 0);

export function defaultState(lang) {
  return {
    v: 1,
    items: [],
    cats: [
      { id: uid(), name: lang === 'en' ? 'Work' : 'Lavoro', icon: 'valigetta', color: 'verderame', details: '', parent: null, order: 0, gantt: true },
      { id: uid(), name: lang === 'en' ? 'Personal' : 'Personale', icon: 'persone', color: 'ottone', details: '', parent: null, order: 1, gantt: true },
      { id: uid(), name: lang === 'en' ? 'Home' : 'Casa', icon: 'casa', color: 'salvia', details: '', parent: null, order: 2, gantt: true }
    ],
    settings: { lang, ganttUnassigned: true, hourH: 48, monthTitles: false, ganttScale: 'week', recent: [], notify: false, sun: { ...DEFAULT_SUN } }
  };
}

/* località per alba e tramonto */
export const PLACES = [
  ['Roma', 41.9, 12.5], ['Milano', 45.46, 9.19], ['Napoli', 40.85, 14.27], ['Torino', 45.07, 7.69], ['Palermo', 38.12, 13.36],
  ['Genova', 44.41, 8.93], ['Bologna', 44.49, 11.34], ['Firenze', 43.77, 11.26], ['Bari', 41.12, 16.87], ['Venezia', 45.44, 12.33],
  ['Verona', 45.44, 10.99], ['Parma', 44.8, 10.33], ['Trieste', 45.65, 13.78], ['Cagliari', 39.22, 9.12], ['Perugia', 43.11, 12.39],
  ['Ancona', 43.62, 13.52], ['Trento', 46.07, 11.12], ['Bolzano', 46.5, 11.35], ['Aosta', 45.74, 7.32], ['Potenza', 40.64, 15.8],
  ['Campobasso', 41.56, 14.66], ["L'Aquila", 42.35, 13.4], ['Catanzaro', 38.91, 16.59], ['Pescara', 42.46, 14.21]
];
export const DEFAULT_SUN = { on: true, name: 'Roma', lat: 41.9, lon: 12.5 };

/* dati: chiave di hora, con ripresa automatica dei dati di marea sullo stesso indirizzo */
const KEY = 'hora.v1', OLD_KEY = 'marea.v1';
export function loadState() {
  try { const s = localStorage.getItem(KEY) || localStorage.getItem(OLD_KEY); if (!s) return null; const o = JSON.parse(s); return o && o.items && o.cats ? o : null; } catch (e) { return null; }
}
export function saveState(st) { try { localStorage.setItem(KEY, JSON.stringify(st)); return true; } catch (e) { return false; } }

/* Categoria e colore di un elemento */
export function catOf(cats, id) { return id ? cats.find((c) => c.id === id) || null : null; }
export function catTone(cats, id) {
  const c = catOf(cats, id);
  if (!c) return NONE_TONE;
  if (c.color) return tones(colorHex(c.color));
  const p = catOf(cats, c.parent);
  return p ? tones(colorHex(p.color)) : NONE_TONE;
}
export function catIcon(cats, id) {
  const c = catOf(cats, id);
  return c ? c.icon || 'tag' : 'tag';
}
export function catLabel(cats, id) {
  const c = catOf(cats, id);
  if (!c) return t('unassigned');
  const p = catOf(cats, c.parent);
  return p ? `${p.name} › ${c.name}` : c.name;
}
/* id della categoria e di tutte le sue sottocategorie */
export function catFamily(cats, id) { return [id, ...cats.filter((c) => c.parent === id).map((c) => c.id)]; }

/* ============ Ricorrenze ============ */
const monthsBetween = (a, b) => (+b.slice(0, 4) - +a.slice(0, 4)) * 12 + (+b.slice(5, 7) - +a.slice(5, 7));
/* n-esimo giorno della settimana del mese (n = -1: l'ultimo) */
function nthWeekday(m, n, d) {
  const dim = daysInMonth(m);
  const day = n > 0 ? 1 + ((d - wd(m) + 7) % 7) + (n - 1) * 7 : dim - ((wd(m.slice(0, 8) + pad(dim)) - d + 7) % 7) + (n + 1) * 7;
  return day >= 1 && day <= dim ? m.slice(0, 8) + pad(day) : null;
}
export function occurrences(it, from, to) {
  const span = spanDays(it);
  const r = it.repeat || NO_REPEAT;
  const out = [];
  if (!r.f || r.f === 'none') {
    if (it.date <= to && addDays(it.date, span) >= from) out.push(it.date);
    return out;
  }
  const until = r.until && r.until < to ? r.until : to;
  if (it.date > until) return out;
  const lo = addDays(from, -span);
  const s = it.date < lo ? lo : it.date;
  const N = Math.max(1, r.every || 1);
  const skip = r.skip && r.skip.length ? new Set(r.skip) : null;
  const add = (d) => { if (!skip || !skip.has(d)) out.push(d); };
  if (r.f === 'day') {
    for (let d = addDays(it.date, Math.ceil(diffDays(it.date, s) / N) * N); d <= until; d = addDays(d, N)) add(d);
  } else if (r.f === 'week') {
    const days = r.days && r.days.length ? r.days : [wd(it.date)];
    const w0 = startOfWeek(it.date);
    for (let d = s; d <= until; d = addDays(d, 1)) if (days.includes(wd(d)) && (N === 1 || (diffDays(w0, startOfWeek(d)) / 7) % N === 0)) add(d);
  } else if (r.f === 'month') {
    const day = +it.date.slice(8), m0 = monthStart(it.date);
    for (let m = monthStart(s); m <= until; m = addMonths(m, 1)) {
      if (monthsBetween(m0, m) % N) continue;
      const d = r.wk ? nthWeekday(m, r.wk.n, r.wk.d) : day <= daysInMonth(m) ? m.slice(0, 8) + pad(day) : null;
      if (d && d >= s && d <= until) add(d);
    }
  } else if (r.f === 'year') {
    const md = it.date.slice(5), y0 = +it.date.slice(0, 4);
    for (let y = Math.max(y0, +s.slice(0, 4) - 1); ; y++) {
      if ((y - y0) % N) continue;
      if (md === '02-29' && daysInMonth(`${y}-02-01`) !== 29) continue;
      const d = `${y}-${md}`;
      if (d > until) break;
      if (d >= s) add(d);
    }
  }
  return out;
}
export function expand(items, from, to) {
  const out = [];
  for (const it of items) for (const d of occurrences(it, from, to)) out.push({ it, date: d, end: addDays(d, spanDays(it)), key: it.id + '@' + d });
  return out;
}
/* sposta una serie di giorni (anche i giorni della settimana di una ripetizione) */
export function shiftItem(it, delta) {
  if (!delta) return it;
  const r = it.repeat || NO_REPEAT;
  const repeat = r.f === 'week' && r.days && r.days.length ? { ...r, days: r.days.map((d) => (((d + delta) % 7) + 7) % 7) } : r;
  return { ...it, date: addDays(it.date, delta), endDate: it.endDate ? addDays(it.endDate, delta) : null, repeat };
}

/* ============ Interprete del testo e della voce (italiano) ============
   Grammatica descritta in VOCE.md: numeri anche a parole, fasce orarie, durate, parti del giorno. */
const L = 'a-zà-ÿ0-9';
const B = `(^|[^${L}])`;
const E = `(?=$|[^${L}])`;
const WD_FORMS = [['lunedì', 'lunedi', 'lun'], ['martedì', 'martedi', 'mar'], ['mercoledì', 'mercoledi', 'mer'], ['giovedì', 'giovedi', 'gio'], ['venerdì', 'venerdi', 'ven'], ['sabato', 'sab'], ['domenica', 'dom']];
const WD_RE = WD_FORMS.flat().sort((a, b) => b.length - a.length).join('|');
const wdIndex = (w) => WD_FORMS.findIndex((f) => f.includes(w));
const MON_FULL = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
const MON_AB = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
const MON_RE = [...MON_FULL, ...MON_AB].sort((a, b) => b.length - a.length).join('|');
const monIndex = (m) => { const i = MON_FULL.indexOf(m); return i >= 0 ? i : MON_AB.indexOf(m); };
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
/* stessa lunghezza del testo: toglie solo gli accenti */
const deacc = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');

/* numeri a parole da 1 a 59 (uno, due ... ventitré, quarantacinque) */
const NUM_W = (() => {
  const u = ['', 'uno', 'due', 'tre', 'quattro', 'cinque', 'sei', 'sette', 'otto', 'nove', 'dieci', 'undici', 'dodici', 'tredici', 'quattordici', 'quindici', 'sedici', 'diciassette', 'diciotto', 'diciannove'];
  const m = { un: 1, una: 1 };
  u.forEach((w, i) => { if (w) m[w] = i; });
  for (const [w, n] of [['venti', 20], ['trenta', 30], ['quaranta', 40], ['cinquanta', 50]]) {
    m[w] = n;
    for (let k = 1; k <= 9; k++) {
      const base = k === 1 || k === 8 ? w.slice(0, -1) : w;
      m[base + u[k]] = n + k;
      if (k === 3) m[base + 'tré'] = n + 3;
    }
  }
  return m;
})();
const nwRe = (skip) => `(?:${Object.keys(NUM_W).filter((w) => !skip.includes(w)).sort((a, b) => b.length - a.length).join('|')})(?![${L}])`;
const NWB = nwRe([]);
const toNum = (s) => (s == null ? null : /^\d+$/.test(s) ? +s : s === 'primo' ? 1 : NUM_W[s] ?? null);
const NUM = `(?:\\d{1,2}|${nwRe(['un', 'uno'])})`;
const DAYN = `(\\d{1,2}|primo|${nwRe(['un', 'una', 'uno'])})`;
const PERIOD = `(?:\\s+(?:di|del|della|in)\\s+(?:mattina|mattino|pomeriggio|sera|notte))`;
/* un orario: 9, 9:30, nove, nove e mezza, dieci meno un quarto, mezzogiorno, 3 del pomeriggio */
const CLOCK = `(?:mezzogiorno|mezzanotte|\\d{1,2}[:.]\\d{2}|${NUM})(?:\\s+e\\s+(?:mezza|mezzo|un\\s+quarto|tre\\s+quarti|${NUM})|\\s+meno\\s+(?:un\\s+quarto|${NUM}))?${PERIOD}?`;
/* una durata: un'ora, mezz'ora, 2 ore e mezza, novanta minuti, tre quarti d'ora */
const DUR = `(?:un'?\\s?ora|mezz'?\\s?ora|un\\s+quarto\\s+d'?\\s?ora|tre\\s+quarti\\s+d'?\\s?ora|un\\s+giorno|il\\s+giorno|(?:\\d+|${NWB})\\s*(?:ore|ora|h|minuti|minuto|min|giorni|giorno))(?:\\s+e\\s+(?:mezza|mezzo|un\\s+quarto|tre\\s+quarti|(?:\\d+|${NWB})(?:\\s*(?:minuti|min))?))?`;

function parseClock(s) {
  s = s.replace(/\s+/g, ' ').trim();
  const c = { h: 0, mi: 0, per: null, mid: false };
  const pm = s.match(/ (?:di|del|della|in) (mattina|mattino|pomeriggio|sera|notte)$/);
  if (pm) { c.per = pm[1] === 'mattino' ? 'mattina' : pm[1]; s = s.slice(0, pm.index); }
  const hm = s.match(/^(\d{1,2})[:.](\d{2})/);
  let rest;
  if (hm) { c.h = +hm[1]; c.mi = +hm[2]; rest = s.slice(hm[0].length); }
  else {
    const w = s.split(' ')[0];
    if (w === 'mezzogiorno') c.h = 12; else if (w === 'mezzanotte') { c.h = 0; c.mid = true; } else c.h = toNum(w);
    rest = s.slice(w.length);
  }
  const t = rest.trim().match(/^(e|meno) (.+)$/);
  if (t) {
    const q = t[2], v = q === 'mezza' || q === 'mezzo' ? 30 : q === 'un quarto' ? 15 : q === 'tre quarti' ? 45 : toNum(q);
    if (v != null) c.mi += t[1] === 'e' ? v : -v;
  }
  return c.h == null || c.h > 24 || c.mi >= 60 || c.mi <= -60 ? null : c;
}
/* minuti dalla mezzanotte; senza indicazioni le ore da 1 a 6 sono del pomeriggio (non per le sveglie) */
function clockMin(c, per, auto, isEnd) {
  if (c.mid) return isEnd ? 1440 : 0;
  let h = c.h;
  const p = c.per || per;
  if ((p === 'pomeriggio' || p === 'sera') && h < 12) h += 12;
  else if (p === 'notte' && h >= 8 && h < 12) h += 12;
  else if (!p && auto && h >= 1 && h <= 6) h += 12;
  return h * 60 + c.mi;
}
function qtyToMin(q) {
  q = q.replace(/\s+/g, ' ').trim();
  let extra = 0;
  const em = q.match(/ e (mezza|mezzo|un quarto|tre quarti|(\S+)(?: (?:minuti|min))?)$/);
  if (em) {
    extra = em[1] === 'mezza' || em[1] === 'mezzo' ? 30 : em[1] === 'un quarto' ? 15 : em[1] === 'tre quarti' ? 45 : toNum(em[2]);
    if (extra == null) return null;
    q = q.slice(0, em.index);
  }
  let base = null;
  if (/^un'? ?ora$/.test(q)) base = 60;
  else if (/^mezz'? ?ora$/.test(q)) base = 30;
  else if (/^un quarto d'? ?ora$/.test(q)) base = 15;
  else if (/^tre quarti d'? ?ora$/.test(q)) base = 45;
  else if (/^(un|il) giorno$/.test(q)) base = 1440;
  else {
    const m = q.match(/^(\S+?)\s*(minuti|minuto|min|ore|ora|h|giorni|giorno)$/);
    const n = m && toNum(m[1]);
    if (n == null) return null;
    base = /^(ore|ora|h)$/.test(m[2]) ? n * 60 : /^giorn/.test(m[2]) ? n * 1440 : n;
  }
  return base + extra;
}
function makeDate(y, m, d) {
  if (m < 0 || m > 11 || d == null || d < 1) return null;
  const ms = `${y}-${pad(m + 1)}-01`;
  if (d > daysInMonth(ms)) return null;
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}
function guessYear(m, d, today) {
  const y = +today.slice(0, 4);
  const s = makeDate(y, m, d);
  if (s && diffDays(s, today) > 60) return y + 1;
  return y;
}
/* giorno del mese: questo mese, o il prossimo se è già passato */
function dayOfMonth(d, today) {
  let s = makeDate(+today.slice(0, 4), mnum(today), d);
  if (s && s < today) { const nm = addMonths(monthStart(today), 1); s = makeDate(+nm.slice(0, 4), mnum(nm), d); }
  return s;
}

export function parseText(text, cats = [], today = todayStr()) {
  const low = text.replace(/[’`]/g, "'").toLowerCase();
  const used = new Array(low.length).fill(false);
  const ranges = [];
  const res = { type: null, date: null, endDate: null, start: null, end: null, dur: null, alert: null, repeat: null, cat: null, address: null, notes: null, allDay: false };
  let ts = null, te = null, per = null, until = null;
  const mark = (s, e, kind) => { for (let i = s; i < e; i++) used[i] = true; ranges.push([s, e, kind]); };
  const free = (s, e) => { for (let i = s; i < e; i++) if (used[i]) return false; return true; };
  const take = (re, fn, prefixed = true) => {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(low))) {
      const s = m.index + (prefixed ? m[1].length : 0), e = m.index + m[0].length;
      if (e === m.index) { re.lastIndex++; continue; }
      if (!free(s, e)) continue;
      const kind = fn(m, s, e);
      if (kind) mark(s, e, kind);
    }
  };
  const tail = (m) => m.index + m[0].length - m[m.length - 1].length;
  // note: tutto ciò che segue "con nota" o "note:"
  take(new RegExp(`${B}(?:con\\s+(?:la\\s+)?nota|con\\s+(?:le\\s+)?note|note?\\s*:)\\s*:?\\s*(.+)$`, 'g'), (m) => { res.notes = text.slice(tail(m)).trim(); return res.notes ? 'note' : false; });
  // indirizzo: "indirizzo ..." o "in via ...", fino alla parola chiave successiva
  const STOP = `\\s+(?:alle|all'|dalle|dall'|domani|dopodomani|oggi|stasera|stamattina|il|dal|per|tra|fra|ogni|tutti|tutte|avvisami|ricordamelo|ricordamela|categoria|nella|con|${WD_RE})(?![${L}])`;
  take(new RegExp(`${B}(?:(?:all')?indirizzo\\s*:?\\s*|in\\s+(?=(?:via|viale|piazza|piazzale|corso|vicolo|largo|strada|località)\\s))(\\S.*?)(?=${STOP}|\\s*[,;]|\\s*$)`, 'g'), (m) => { res.address = text.slice(tail(m), m.index + m[0].length).trim(); return res.address ? 'note' : false; });
  // categoria: #lavoro, oppure a voce "categoria lavoro" (anche "categoria personale viaggio lisbona")
  take(/#([^\s#,;:!?]+)/g, (m) => {
    const q = norm(m[1]);
    if (!q) return false;
    const sorted = [...cats].sort((a, b) => (a.parent ? 0 : 1) - (b.parent ? 0 : 1));
    const hit = sorted.find((c) => norm(c.name) === q) || sorted.find((c) => norm(c.name).startsWith(q)) || sorted.find((c) => norm(c.name).includes(q));
    if (hit) res.cat = hit.id;
    return 'cat';
  }, false);
  {
    const re = new RegExp(`${B}(?:nella\\s+|in\\s+)?categoria\\s+`, 'g');
    const names = cats.flatMap((c) => {
      const p = c.parent && catOf(cats, c.parent);
      return [[c.name, c.id], ...(p ? [[p.name + ' ' + c.name, c.id]] : [])];
    }).map(([n, id]) => [deacc(n.toLowerCase()).replace(/\s+/g, ' '), id]).sort((a, b) => b[0].length - a[0].length);
    let m;
    while ((m = re.exec(low))) {
      const s = m.index + m[1].length, at = m.index + m[0].length;
      const rest = deacc(low.slice(at)).replace(/\s/g, ' ');
      const hit = names.find(([n]) => rest.startsWith(n) && !new RegExp(`^[${L}]`).test(rest.slice(n.length)));
      if (hit && free(s, at + hit[0].length)) { res.cat = hit[1]; mark(s, at + hit[0].length, 'cat'); }
    }
  }
  // avviso: avvisami 10 minuti prima, ricordamelo un'ora prima, con avviso il giorno prima
  take(new RegExp(`${B}(?:ricordamelo|ricordamela|ricordameli|avvisami|con\\s+avviso|con\\s+preavviso|avviso|preavviso)\\s+(?:di\\s+)?(${DUR})\\s+prima${E}`, 'g'), (m) => {
    const v = qtyToMin(m[2]);
    if (v == null) return false;
    res.alert = v;
    return 'alert';
  });
  take(new RegExp(`${B}(?:avvisami|con\\s+avviso)(?:\\s+all'ora)?${E}`, 'g'), () => { if (res.alert != null) return false; res.alert = 0; return 'alert'; });
  // ripetizione
  take(new RegExp(`${B}(?:ogni|tutti\\s+i|tutte\\s+le|nei)\\s+(?:giorn[oi]\\s+)?ferial[ei]${E}`, 'g'), () => { res.repeat = { f: 'week', days: [0, 1, 2, 3, 4], until: null }; return 'rep'; });
  take(new RegExp(`${B}(?:ogni|tutti\\s+i|tutte\\s+le)\\s+(?:weekend|fine\\s+settimana)${E}`, 'g'), () => { res.repeat = { f: 'week', days: [5, 6], until: null }; return 'rep'; });
  take(new RegExp(`${B}dal\\s+(${WD_RE})\\s+al\\s+(${WD_RE})${E}`, 'g'), (m) => {
    const a = wdIndex(m[2]), b = wdIndex(m[3]), days = [];
    for (let i = a; days.length < 7; i = (i + 1) % 7) { days.push(i); if (i === b) break; }
    res.repeat = { f: 'week', days: days.sort(), until: null };
    return 'rep';
  });
  take(new RegExp(`${B}(?:ogni|tutti\\s+gli|tutti\\s+i|tutte\\s+le)\\s+(\\d+|${NWB})\\s+(giorni|settimane|mesi|anni)${E}`, 'g'), (m) => {
    const n = toNum(m[2]);
    if (!n) return false;
    res.repeat = { f: { g: 'day', s: 'week', m: 'month', a: 'year' }[m[3][0]], days: [], until: null };
    if (n > 1) res.repeat.every = n;
    return 'rep';
  });
  take(new RegExp(`${B}(?:ogni|tutti\\s+i|tutte\\s+le)\\s+(giorno|giorni|settimana|settimane|mese|mesi|anno|anni|(?:${WD_RE})(?:\\s*(?:,|e)?\\s*(?:${WD_RE})${E})*)${E}`, 'g'), (m) => {
    const w = m[2];
    if (/^giorn/.test(w)) res.repeat = { f: 'day', days: [], until: null };
    else if (/^settiman/.test(w)) res.repeat = { f: 'week', days: [], until: null };
    else if (/^mes/.test(w)) res.repeat = { f: 'month', days: [], until: null };
    else if (/^ann/.test(w)) res.repeat = { f: 'year', days: [], until: null };
    else {
      const days = (w.match(new RegExp(WD_RE, 'g')) || []).map(wdIndex).filter((i) => i >= 0);
      res.repeat = { f: 'week', days: [...new Set(days)].sort(), until: null };
    }
    return 'rep';
  });
  // date: dal 23 al 25 ottobre, fino al 30 novembre
  const DT = `${DAYN}(?:\\s*\\/\\s*(\\d{1,2})(?:\\/(\\d{2,4}))?|\\s+(${MON_RE}))?`;
  const dtOf = (d0, mo0, y0, mon0, fallbackMo) => {
    const d = toNum(d0);
    const mo = mo0 ? +mo0 - 1 : mon0 ? monIndex(mon0) : fallbackMo;
    const y = y0 ? (+y0 < 100 ? 2000 + +y0 : +y0) : null;
    return { d, mo, y };
  };
  take(new RegExp(`${B}dal\\s+${DT}\\s+al\\s+${DT}${E}`, 'g'), (m) => {
    const b = dtOf(m[6], m[7], m[8], m[9], mnum(today));
    if (b.y == null) b.y = guessYear(b.mo, b.d, today);
    const a = dtOf(m[2], m[3], m[4], m[5], b.mo);
    if (a.y == null) a.y = a.mo > b.mo ? b.y - 1 : b.y;
    const da = makeDate(a.y, a.mo, a.d), db = makeDate(b.y, b.mo, b.d);
    if (!da || !db || db < da) return false;
    res.date = da; res.endDate = db;
    return 'date';
  });
  take(new RegExp(`${B}fino\\s+al\\s+${DT}${E}`, 'g'), (m) => {
    const x = dtOf(m[2], m[3], m[4], m[5], null);
    const s = x.mo == null ? dayOfMonth(x.d, today) : makeDate(x.y ?? guessYear(x.mo, x.d, today), x.mo, x.d);
    if (!s) return false;
    until = s;
    return 'date';
  });
  // 15/10 o 15/10/2026
  take(new RegExp(`${B}(\\d{1,2})\\/(\\d{1,2})(?:\\/(\\d{2,4}))?${E}`, 'g'), (m) => {
    if (res.date) return false;
    const d = +m[2], mo = +m[3] - 1;
    const y = m[4] ? (+m[4] < 100 ? 2000 + +m[4] : +m[4]) : guessYear(mo, d, today);
    const s = makeDate(y, mo, d);
    if (!s) return false;
    res.date = s;
    return 'date';
  });
  // 15 ottobre 2026, il primo novembre, ventitré ottobre
  take(new RegExp(`${B}(?:il\\s+|l')?${DAYN}\\s+(${MON_RE})(?:\\s+(\\d{4}))?${E}`, 'g'), (m) => {
    if (res.date) return false;
    const d = toNum(m[2]), mo = monIndex(m[3]);
    const y = m[4] ? +m[4] : guessYear(mo, d, today);
    const s = makeDate(y, mo, d);
    if (!s) return false;
    res.date = s;
    return 'date';
  });
  // parole relative, anche con la parte del giorno: domani sera, stamattina
  take(new RegExp(`${B}(oggi|stasera|stamattina|stamani|stanotte|domani|dopodomani)(?:\\s+(mattina|pomeriggio|sera|notte))?${E}`, 'g'), (m) => {
    if (res.date) return false;
    res.date = /^dopodomani/.test(m[2]) ? addDays(today, 2) : /^domani/.test(m[2]) ? addDays(today, 1) : today;
    per = m[3] || (m[2] === 'stasera' ? 'sera' : m[2] === 'stanotte' ? 'notte' : /^stam/.test(m[2]) ? 'mattina' : null);
    return 'date';
  });
  take(new RegExp(`${B}(?:la\\s+)?(?:prossima\\s+settimana|settimana\\s+prossima)${E}`, 'g'), () => {
    if (res.date) return false;
    res.date = addDays(startOfWeek(today), 7);
    return 'date';
  });
  take(new RegExp(`${B}(?:tra|fra)\\s+(\\d+|${NWB})\\s+(giorni|giorno|settimane|settimana|mesi|mese)${E}`, 'g'), (m) => {
    if (res.date) return false;
    const n = toNum(m[2]) || 1;
    res.date = /^mes/.test(m[3]) ? addMonths(today, n) : addDays(today, /^settiman/.test(m[3]) ? n * 7 : n);
    return 'date';
  });
  // il 15, il primo
  take(new RegExp(`${B}il\\s+${DAYN}${E}(?!\\s*(?:[:.]\\d))`, 'g'), (m) => {
    if (res.date) return false;
    const s = dayOfMonth(toNum(m[2]), today);
    if (!s) return false;
    res.date = s;
    return 'date';
  });
  // lunedì 19 (giorno della settimana seguito dal numero)
  take(new RegExp(`${B}(?:${WD_RE})\\s+${DAYN}${E}(?!\\s*(?:[:.]\\d|-))`, 'g'), (m) => {
    if (res.date) return false;
    const s = dayOfMonth(toNum(m[2]), today);
    if (!s) return false;
    res.date = s;
    return 'date';
  });
  // giorno della settimana: venerdì, prossimo venerdì, venerdì prossimo, anche con la parte del giorno
  take(new RegExp(`${B}(?:(prossim[oa])\\s+)?(${WD_RE})(?:\\s+(prossim[oa]))?(?:\\s+(mattina|pomeriggio|sera|notte))?${E}`, 'g'), (m) => {
    if (res.date) return false;
    const target = wdIndex(m[3]);
    let n = (target - wd(today) + 7) % 7;
    if ((m[2] || m[4]) && n === 0) n = 7;
    res.date = addDays(today, n);
    if (m[5]) per = m[5];
    return 'date';
  });
  // tutto il giorno
  take(new RegExp(`${B}(?:tutto\\s+il\\s+giorno|tutta\\s+la\\s+giornata)${E}`, 'g'), () => { res.allDay = true; return 'time'; });
  // durata: per 2 ore, per un'ora e mezza, per 90 minuti
  take(new RegExp(`${B}(?:per|durata(?:\\s+di)?)\\s+(${DUR})${E}`, 'g'), (m) => {
    const v = qtyToMin(m[2]);
    if (!v || v >= 1440) return false;
    res.dur = v;
    return 'time';
  });
  // fascia oraria: 9-11, dalle 9 alle 11, dalle nove e mezza a mezzogiorno, tra le 9 e le 11
  const range = (m) => {
    const a = parseClock(m[2]), b = parseClock(m[3]);
    if (!a || !b) return false;
    ts = a; te = b;
    return 'time';
  };
  take(new RegExp(`${B}(?:dalle\\s+)?(\\d{1,2}(?:[:.]\\d{2})?${PERIOD}?)\\s*(?:-|–|alle)\\s*(\\d{1,2}(?:[:.]\\d{2})?${PERIOD}?)${E}`, 'g'), range);
  take(new RegExp(`${B}(?:dalle\\s+ore|dalle|dall')\\s*(${CLOCK})\\s*(?:-|–|fino\\s+alle|fino\\s+all'|fino\\s+a|alle|all'|a)\\s*(${CLOCK})${E}`, 'g'), range);
  take(new RegExp(`${B}(?:tra|fra)\\s+le\\s+(${CLOCK})\\s+e\\s+(?:le\\s+)?(${CLOCK})${E}`, 'g'), range);
  // ora singola: alle 15, alle 15:30, 15:30, dalle 9, alle tre e mezza, a mezzogiorno
  const single = (m) => {
    if (ts) return false;
    const c = parseClock(m[2]);
    if (!c) return false;
    ts = c;
    return 'time';
  };
  take(new RegExp(`${B}(?:alle\\s+ore|alle|all'|ore|h|dalle|dall'|verso\\s+le|verso\\s+l'|per\\s+le)\\s*(${CLOCK})${E}`, 'g'), single);
  take(new RegExp(`${B}(\\d{1,2}[:.]\\d{2}${PERIOD}?)${E}`, 'g'), single);
  take(new RegExp(`${B}a\\s+(mezzogiorno|mezzanotte)${E}`, 'g'), single);
  // parte del giorno da sola: di sera, la mattina
  take(new RegExp(`${B}(?:di|in|la|il)\\s+(mattina|mattino|pomeriggio|sera|notte)${E}`, 'g'), (m) => { per = per || (m[2] === 'mattino' ? 'mattina' : m[2]); return 'time'; });
  // tipo, anche con un comando a voce: metti un evento, nuovo promemoria, imposta la sveglia
  const ART = '\\s+(?:un|una|uno|un\'|la|il)';
  take(new RegExp(`^(\\s*)(?:(?:(?:metti|mettimi|aggiungi|inserisci|segna|segnami)(?:${ART})?|(?:crea|fissa|imposta|programma)${ART})(?:\\s+(evento|promemoria|sveglia))?|(?:(?:nuovo|nuova)\\s+)?(evento|promemoria|sveglia))${E}`, 'g'), (m, s, e) => {
    if (s === e) return false;
    const k = m[2] || m[3];
    if (k) res.type = k;
    return 'type';
  });
  take(new RegExp(`${B}(ricordami(?:\\s+di)?|ricorda(?:\\s+di)?|promemoria:?|devo|da\\s+fare)${E}`, 'g'), () => { if (res.type) return false; res.type = 'promemoria'; return 'type'; });

  // titolo: ciò che resta
  let title = '';
  for (let i = 0; i < text.length; i++) title += used[i] ? ' ' : text[i];
  title = title.replace(/\s+/g, ' ').trim();
  const edge = /^(?:il|lo|la|l'|i|gli|le|di|del|della|a|al|alle|ad|per|e|ed|con|,|;|-|:|\.)\s+|\s+(?:il|lo|la|i|gli|le|di|del|a|al|alle|ad|per|e|ed|con|,|;|-|:|\.)$|^[,;:.\-]+|[,;:.\-]+$/i;
  for (let k = 0; k < 6; k++) { const nt = title.replace(edge, '').trim(); if (nt === title) break; title = nt; }
  res.title = title ? cap(title) : '';
  if (!res.type) res.type = 'evento';
  // orari risolti alla fine, quando si conosce il tipo
  const auto = res.type !== 'sveglia';
  if (ts && !res.allDay) {
    if (te) {
      const pa = ts.per || (te.per && ts.h <= te.h ? te.per : per);
      const a = clockMin(ts, pa, auto && !te.per, false);
      let b = clockMin(te, te.per || per, false, true);
      if (!te.per && !per && b <= a && b < 720 && b + 720 > a) b += 720;
      if (b > a && a >= 0 && b <= 1440) { res.start = a; res.end = b; }
    } else {
      const a = clockMin(ts, per, auto, false);
      if (a >= 0 && a < 1440) res.start = a;
    }
  }
  if (res.start != null && res.end == null && res.type === 'evento') res.end = Math.min(res.start + (res.dur || 60), 1440);
  if (until) {
    if (res.repeat) res.repeat.until = until;
    else if (res.type === 'evento' && (!res.date || until > res.date)) res.endDate = until;
  }
  res.ranges = ranges.sort((a, b) => a[0] - b[0]);
  return res;
}
/* comando finale a voce: "... salva" o "... conferma" */
export const voiceSave = (s) => { const m = s.match(/^(.*?)[\s,.]+(?:salva|conferma)[.!]?\s*$/i); return m ? m[1] : null; };

/* ============ Blocchi da Claude (righe con "|") ============ */
export function looksLikeBlock(text) {
  const lines = text.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  if (!lines.length) return false;
  if (/^#(hora|marea)/i.test(lines[0])) return true;
  return lines.filter((l) => l.includes('|')).length >= 2;
}
const LINE_DT = /^(\d{4})-(\d{2})-(\d{2})|^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/;
function parseDateTok(s, today) {
  const m = s.match(LINE_DT);
  if (!m) return null;
  if (m[1]) return makeDate(+m[1], +m[2] - 1, +m[3]);
  const d = +m[4], mo = +m[5] - 1;
  const y = m[6] ? (+m[6] < 100 ? 2000 + +m[6] : +m[6]) : guessYear(mo, d, today);
  return makeDate(y, mo, d);
}
function parseLine(line, cats, today) {
  const parts = line.split('|').map((s) => s.trim());
  const d = { type: 'evento', title: '', date: null, endDate: null, start: null, end: null, alert: null, repeat: { ...NO_REPEAT }, address: '', link: '', notes: '', catPath: '' };
  // data e ora
  const p0 = parts[0] || '';
  const segs = p0.split(/\s+/);
  const dateStr = segs[0] || '';
  const [ds1, ds2] = dateStr.split(/-(?=\d{1,2}\/)/);
  d.date = parseDateTok(ds1 || '', today);
  if (ds2) { const e = parseDateTok(ds2, today); if (e && d.date && e > d.date) d.endDate = e; }
  const tm = p0.slice(dateStr.length).match(/(\d{1,2})[:.](\d{2})(?:\s*-\s*(\d{1,2})[:.](\d{2}))?/);
  if (tm) { d.start = +tm[1] * 60 + +tm[2]; if (tm[3]) d.end = +tm[3] * 60 + +tm[4]; }
  d.title = parts[1] || '';
  let rest = parts.slice(2);
  if (rest[0] && /^(evento|event|promemoria|reminder|todo|sveglia|alarm)$/i.test(rest[0])) { d.type = /^(promemoria|reminder|todo)$/i.test(rest[0]) ? 'promemoria' : /^(sveglia|alarm)$/i.test(rest[0]) ? 'sveglia' : 'evento'; rest = rest.slice(1); }
  for (const f of rest) {
    if (!f) continue;
    const low = f.toLowerCase();
    if (/^(ripete|ogni|tutti)/.test(low)) { const r = parseText(low.replace(/^ripete\s+/, 'ogni '), [], today).repeat; if (r) d.repeat = r; continue; }
    if (/^(avviso|avvisami|ricordamelo)/.test(low)) { const q = low.replace(/^(avviso|avvisami|ricordamelo)\s*:?\s*/, '').replace(/\s*prima$/, ''); const v = qtyToMin(q); if (v != null) d.alert = v; continue; }
    if (/^indirizzo\s*:?/.test(low)) { d.address = f.replace(/^indirizzo\s*:?\s*/i, ''); continue; }
    if (/^link\s*:?/.test(low) || /^https?:\/\//.test(low)) { d.link = f.replace(/^link\s*:?\s*/i, ''); continue; }
    if (/^note\s*:?/.test(low)) { d.notes = f.replace(/^note\s*:?\s*/i, ''); continue; }
    if (!d.catPath) d.catPath = f;
  }
  if (!d.date || !d.title) return null;
  if (d.type === 'evento' && d.start != null && d.end == null) d.end = d.endDate ? d.start : Math.min(d.start + 60, 1440);
  if (d.type !== 'evento') d.endDate = null;
  if (d.type === 'sveglia') { if (d.start == null) d.start = 420; d.alert = 0; d.catPath = ''; }
  return d;
}
export function resolveCat(path, cats) {
  if (!path) return { cat: null, missing: null };
  const names = path.split(/\s*(?:›|>|\/)\s*/).map((s) => s.trim()).filter(Boolean);
  if (!names.length) return { cat: null, missing: null };
  const top = cats.find((c) => !c.parent && norm(c.name) === norm(names[0]));
  if (names.length === 1) {
    if (top) return { cat: top.id, missing: null };
    const sub = cats.find((c) => c.parent && norm(c.name) === norm(names[0]));
    return sub ? { cat: sub.id, missing: null } : { cat: null, missing: [names[0]] };
  }
  if (!top) return { cat: null, missing: names.slice(0, 2) };
  const sub = cats.find((c) => c.parent === top.id && norm(c.name) === norm(names[1]));
  return sub ? { cat: sub.id, missing: null } : { cat: null, missing: [top.name, names[1]] };
}
export function parseBlock(text, cats, today = todayStr()) {
  const out = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    let d;
    if (line.includes('|')) d = parseLine(line, cats, today);
    else {
      const p = parseText(line, cats, today);
      if (!p.title) continue;
      d = { type: p.type, title: p.title, date: p.date || today, endDate: p.endDate, start: p.start, end: p.end, alert: p.alert, repeat: p.repeat || { ...NO_REPEAT }, address: p.address || '', link: '', notes: p.notes || '', catPath: '', cat: p.cat };
      if (d.type === 'sveglia') { if (d.start == null) d.start = 420; d.alert = 0; d.cat = null; }
    }
    if (!d) continue;
    if (d.catPath) { const r = resolveCat(d.catPath, cats); d.cat = r.cat; d.missing = r.missing; }
    out.push(d);
  }
  return out;
}

/* ============ File .ics ============ */
const icsEsc = (s) => String(s || '').replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
const icsUnesc = (s) => String(s || '').replace(/\\n/gi, '\n').replace(/\\([,;\\])/g, '$1');
const icsDate = (s) => s.replace(/-/g, '');
const icsDT = (s, m) => `${icsDate(s)}T${pad(Math.floor(m / 60) % 24)}${pad(m % 60)}00`;
const BYDAY = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
const FREQ = { day: 'DAILY', week: 'WEEKLY', month: 'MONTHLY', year: 'YEARLY' };
export function toICS(items, cats) {
  const L2 = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//nautargo//hora ' + VERSION + '//IT', 'CALSCALE:GREGORIAN'];
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  for (const it of items) {
    L2.push('BEGIN:VEVENT', `UID:${it.icsUid || it.id + '@hora.nautargo.com'}`, `DTSTAMP:${stamp}`, `SUMMARY:${icsEsc(it.title)}`);
    if (it.start == null) {
      L2.push(`DTSTART;VALUE=DATE:${icsDate(it.date)}`, `DTEND;VALUE=DATE:${icsDate(addDays(it.endDate || it.date, 1))}`);
    } else if (isTimedMulti(it)) {
      L2.push(`DTSTART:${icsDT(it.date, it.start)}`, `DTEND:${icsDT(it.endDate, it.end ?? it.start)}`);
    } else {
      const e = it.type === 'evento' ? (it.end ?? it.start + 60) : it.start;
      L2.push(`DTSTART:${icsDT(it.date, it.start)}`, e >= 1440 ? `DTEND:${icsDT(addDays(it.date, 1), 0)}` : `DTEND:${icsDT(it.date, e)}`);
    }
    const r = it.repeat || NO_REPEAT;
    if (r.f && r.f !== 'none') {
      let rr = 'RRULE:FREQ=' + FREQ[r.f];
      if (r.every > 1) rr += ';INTERVAL=' + r.every;
      if (r.f === 'week' && r.days && r.days.length) rr += ';BYDAY=' + r.days.map((d) => BYDAY[d]).join(',');
      if (r.f === 'month' && r.wk) rr += ';BYDAY=' + r.wk.n + BYDAY[r.wk.d];
      if (r.until) rr += ';UNTIL=' + icsDate(r.until);
      L2.push(rr);
      for (const d of r.skip || []) L2.push(it.start == null ? `EXDATE;VALUE=DATE:${icsDate(d)}` : `EXDATE:${icsDT(d, it.start)}`);
    }
    if (it.address) L2.push(`LOCATION:${icsEsc(it.address)}`);
    if (it.link) L2.push(`URL:${icsEsc(it.link)}`);
    if (it.notes) L2.push(`DESCRIPTION:${icsEsc(it.notes)}`);
    if (it.cat) L2.push(`CATEGORIES:${icsEsc(catLabel(cats, it.cat))}`);
    if (it.type !== 'evento') L2.push('X-HORA-TYPE:' + it.type);
    if (it.onlyAlert) L2.push('X-HORA-ONLYALERT:1');
    if (it.alert != null) L2.push('BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${icsEsc(it.title)}`, `TRIGGER:-PT${it.alert}M`, 'END:VALARM');
    L2.push('END:VEVENT');
  }
  L2.push('END:VCALENDAR');
  return L2.join('\r\n');
}
/* ora di un fuso (TZID) convertita nell'ora di questo dispositivo */
function tzLocal(y, mo, d, h, mi, tz) {
  try {
    const f = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    const off = (ts) => { const p = Object.fromEntries(f.formatToParts(new Date(ts)).map((x) => [x.type, x.value])); return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute) - ts; };
    const guess = Date.UTC(y, mo - 1, d, h, mi);
    return new Date(guess - off(guess - off(guess)));
  } catch (e) { return null; }
}
function icsWhen(v, params = '') {
  const m = v.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?/);
  if (!m) return null;
  if (!m[4] || /VALUE=DATE(?!-)/.test(params)) return { date: `${m[1]}-${m[2]}-${m[3]}`, min: null };
  let dt = null;
  if (m[7]) dt = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]));
  else { const tz = (params.match(/TZID=("?)([^";:]+)\1/) || [])[2]; if (tz) dt = tzLocal(+m[1], +m[2], +m[3], +m[4], +m[5], tz); }
  if (dt && !isNaN(dt)) return { date: ymd(dt), min: dt.getHours() * 60 + dt.getMinutes() };
  return { date: `${m[1]}-${m[2]}-${m[3]}`, min: +m[4] * 60 + +m[5] };
}
const durMin = (v) => { const m = String(v).match(/^-?P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?)?/); return m ? (+(m[1] || 0)) * 10080 + (+(m[2] || 0)) * 1440 + (+(m[3] || 0)) * 60 + (+(m[4] || 0)) : null; };
/* Legge un file .ics, anche l'export di Google: ripetizioni con intervallo, numero di volte, n-esimo giorno,
   occorrenze cancellate o modificate, fusi orari. Il nome del calendario diventa la categoria. */
export function parseICS(text, calFallback = '') {
  const lines = text.replace(/\r?\n[ \t]/g, '').split(/\r?\n/);
  const raw = [];
  let cur = null, inAlarm = false, calName = calFallback;
  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') { cur = { EXDATE: [] }; continue; }
    if (line === 'BEGIN:VALARM') { inAlarm = true; continue; }
    if (line === 'END:VALARM') { inAlarm = false; continue; }
    if (line === 'END:VEVENT' && cur) { raw.push(cur); cur = null; continue; }
    const i = line.indexOf(':');
    if (i < 0) continue;
    const head = line.slice(0, i), v = line.slice(i + 1);
    const [name, ...ps] = head.split(';');
    if (!cur) { if (name === 'X-WR-CALNAME' && v.trim()) calName = icsUnesc(v.trim()); continue; }
    if (inAlarm) {
      if (name === 'TRIGGER' && cur.alarm == null) { const m = durMin(v); if (m != null) cur.alarm = m; }
      continue;
    }
    if (name === 'EXDATE') { for (const x of v.split(',')) { const w = icsWhen(x, ps.join(';')); if (w) cur.EXDATE.push(w.date); } continue; }
    if (!cur[name]) cur[name] = { v, p: ps.join(';') };
  }
  const calCat = calName && !calName.includes('@') ? calName : '';
  const masters = new Map(), out = [], overrides = [];
  for (const c of raw) {
    const s = c.DTSTART && icsWhen(c.DTSTART.v, c.DTSTART.p);
    if (!s || !c.SUMMARY) continue;
    const cancelled = c.STATUS && /CANCELLED/i.test(c.STATUS.v);
    const kind = ((c['X-HORA-TYPE'] || c['X-MAREA-TYPE'] || {}).v || '').toLowerCase();
    const type = /promemoria/.test(kind) ? 'promemoria' : /sveglia/.test(kind) ? 'sveglia' : 'evento';
    const d = {
      type, title: icsUnesc(c.SUMMARY.v), date: s.date, endDate: null, start: s.min, end: null, alert: c.alarm ?? null, repeat: { ...NO_REPEAT },
      address: icsUnesc(c.LOCATION && c.LOCATION.v), link: icsUnesc(c.URL && c.URL.v), notes: icsUnesc(c.DESCRIPTION && c.DESCRIPTION.v),
      catPath: type === 'sveglia' ? '' : c.CATEGORIES ? icsUnesc(c.CATEGORIES.v).split(',')[0] : calCat, icsUid: c.UID ? c.UID.v : null
    };
    if (c['X-HORA-ONLYALERT']) d.onlyAlert = true;
    let e = c.DTEND && icsWhen(c.DTEND.v, c.DTEND.p);
    if (!e && c.DURATION && s.min != null) { const m = durMin(c.DURATION.v); if (m != null) { const tot = s.min + m; e = { date: addDays(s.date, Math.floor(tot / 1440)), min: tot % 1440 }; } }
    if (e) {
      if (s.min == null) { const last = addDays(e.date, -1); if (last > s.date) d.endDate = last; }
      else if (type === 'evento') {
        if (e.date <= s.date) d.end = Math.max(e.min, s.min + 15);
        else if (e.date === addDays(s.date, 1) && e.min === 0) d.end = 1440;
        else { d.endDate = e.date; d.end = e.min; }
      }
    } else if (type === 'evento' && s.min != null) d.end = Math.min(s.min + 60, 1440);
    if (c.RRULE) {
      const r = Object.fromEntries(c.RRULE.v.split(';').map((kv) => kv.split('=')));
      const f = { DAILY: 'day', WEEKLY: 'week', MONTHLY: 'month', YEARLY: 'year' }[r.FREQ];
      if (f) {
        const rep = { f, days: [], until: r.UNTIL ? `${r.UNTIL.slice(0, 4)}-${r.UNTIL.slice(4, 6)}-${r.UNTIL.slice(6, 8)}` : null };
        if (+r.INTERVAL > 1) rep.every = +r.INTERVAL;
        const bd = (r.BYDAY || '').split(',').filter(Boolean).map((x) => { const m = x.match(/^([+-]?\d+)?([A-Z]{2})$/); return m ? { n: m[1] ? +m[1] : +(r.BYSETPOS || 0), d: BYDAY.indexOf(m[2]) } : null; }).filter((x) => x && x.d >= 0);
        if (f === 'week') rep.days = bd.map((x) => x.d);
        if (f === 'month' && bd.length === 1 && bd[0].n) rep.wk = { n: bd[0].n, d: bd[0].d };
        if (c.EXDATE.length) rep.skip = [...new Set(c.EXDATE)];
        if (r.COUNT && !rep.until) {
          const k = +r.COUNT, per = { day: 1, week: 7, month: 31, year: 366 }[f] * (rep.every || 1);
          const occ = occurrences({ ...d, repeat: { ...rep, skip: [] } }, d.date, addDays(d.date, per * (k + 1) + 7));
          if (occ.length) rep.until = occ[Math.min(k, occ.length) - 1];
        }
        d.repeat = rep;
      }
    }
    if (c['RECURRENCE-ID']) { const w = icsWhen(c['RECURRENCE-ID'].v, c['RECURRENCE-ID'].p); overrides.push({ d, uid: d.icsUid, rid: w && w.date, cancelled }); continue; }
    if (cancelled) continue;
    if (d.icsUid) masters.set(d.icsUid, d);
    out.push(d);
  }
  // occorrenze modificate: la serie salta quel giorno, la versione modificata diventa un elemento a sé
  for (const o of overrides) {
    const m = o.uid && masters.get(o.uid);
    if (m && o.rid && m.repeat.f !== 'none') m.repeat.skip = [...new Set([...(m.repeat.skip || []), o.rid])];
    if (!o.cancelled) out.push({ ...o.d, icsUid: o.d.icsUid ? o.d.icsUid + '#' + (o.rid || o.d.date) : null });
  }
  return out;
}

/* ============ Archivio .zip (export di Google) ============ */
export async function unzip(buf) {
  const u8 = new Uint8Array(buf), dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  let e = u8.length - 22;
  while (e >= 0 && dv.getUint32(e, true) !== 0x06054b50) e--;
  if (e < 0) throw new Error('zip');
  const n = dv.getUint16(e + 10, true);
  let p = dv.getUint32(e + 16, true);
  const dec = new TextDecoder(), out = [];
  for (let i = 0; i < n && dv.getUint32(p, true) === 0x02014b50; i++) {
    const method = dv.getUint16(p + 10, true), size = dv.getUint32(p + 20, true);
    const nl = dv.getUint16(p + 28, true), xl = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true), lo = dv.getUint32(p + 42, true);
    const name = dec.decode(u8.subarray(p + 46, p + 46 + nl));
    p += 46 + nl + xl + cl;
    if (name.endsWith('/')) continue;
    const at = lo + 30 + dv.getUint16(lo + 26, true) + dv.getUint16(lo + 28, true);
    const data = u8.slice(at, at + size);
    let bytes = null;
    if (method === 0) bytes = data;
    else if (method === 8) bytes = new Uint8Array(await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());
    if (bytes) out.push({ name, text: dec.decode(bytes) });
  }
  return out;
}
/* tutti i calendari di un .zip: il nome del file fa da nome del calendario se manca X-WR-CALNAME */
export async function parseZip(buf) {
  const files = (await unzip(buf)).filter((f) => /\.ics$/i.test(f.name));
  return files.flatMap((f) => parseICS(f.text, f.name.split('/').pop().replace(/\.ics$/i, '').replace(/_/g, ' ')));
}

/* ============ Alba e tramonto (equazione dell'alba, precisione di un paio di minuti) ============ */
export function sunTimes(date, lat, lon) {
  const [y, m, d] = date.split('-').map(Number);
  const R = Math.PI / 180;
  const J = Date.UTC(y, m - 1, d, 12) / 864e5 + 2440587.5 - 2451545 + 0.0008 - lon / 360;
  const M = (357.5291 + 0.98560028 * J) % 360;
  const C = 1.9148 * Math.sin(M * R) + 0.02 * Math.sin(2 * M * R) + 0.0003 * Math.sin(3 * M * R);
  const L = (M + C + 282.9372) % 360;
  const Jt = 2451545 + J + 0.0053 * Math.sin(M * R) - 0.0069 * Math.sin(2 * L * R);
  const dec = Math.asin(Math.sin(L * R) * Math.sin(23.4397 * R));
  const cosH = (Math.sin(-0.833 * R) - Math.sin(lat * R) * Math.sin(dec)) / (Math.cos(lat * R) * Math.cos(dec));
  if (cosH < -1 || cosH > 1) return null;
  const H = Math.acos(cosH) / R / 360;
  const min = (jd) => { const t = new Date((jd - 2440587.5) * 864e5); return t.getHours() * 60 + t.getMinutes(); };
  return { rise: min(Jt - H), set: min(Jt + H) };
}
/* media di alba e tramonto sui giorni visualizzati */
export function sunAvg(dates, lat, lon) {
  const v = dates.map((d) => sunTimes(d, lat, lon)).filter(Boolean);
  if (!v.length) return null;
  return { rise: Math.round(v.reduce((a, x) => a + x.rise, 0) / v.length), set: Math.round(v.reduce((a, x) => a + x.set, 0) / v.length) };
}

/* ============ Filtro: tipi e categorie ============ */
export const ALL_TYPES = ['evento', 'promemoria', 'sveglia'];
export const NO_FILTER = { types: ALL_TYPES, cats: [] };
export const filterOn = (f) => f.types.length < ALL_TYPES.length || f.cats.length > 0;
export function makePass(f, cats) {
  const ids = f.cats.length ? new Set(f.cats.flatMap((id) => (id === '__none' ? [id] : catFamily(cats, id)))) : null;
  return (it) => f.types.includes(it.type) && (!ids || it.type === 'sveglia' || ids.has(it.cat && catOf(cats, it.cat) ? it.cat : '__none'));
}
/* categoria per i nuovi elementi: la prima scelta nel filtro, nell'ordine delle categorie */
export function filterCat(f, cats) {
  if (!f.cats.length) return null;
  const tree = cats.filter((c) => !c.parent).sort(byOrder).flatMap((c) => [c, ...cats.filter((x) => x.parent === c.id).sort(byOrder)]);
  const hit = tree.find((c) => f.cats.includes(c.id));
  return hit ? hit.id : null;
}
