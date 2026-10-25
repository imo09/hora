/* hora 1.4 - calendario locale di nautargo
   File unico React. Build: node build.mjs */
import React, { useState, useEffect, useRef, useMemo, useLayoutEffect } from 'react';
import { createRoot } from 'react-dom/client';

export const VERSION = '1.4';

/* ============ Testi IT / EN ============ */
const STR = {
  it: {
    today: 'Oggi', day: 'Giorno', days3: '3 giorni', days5: '5 giorni', week: 'Settimana', month: 'Mese', gantt: 'Attività',
    all: 'Tutto', events: 'Eventi', reminders: 'Promemoria', event: 'Evento', reminder: 'Promemoria',
    search: 'Cerca', settings: 'Impostazioni', back: 'Indietro', close: 'Chiudi', prev: 'Precedente', next: 'Successivo',
    writeOrDictate: 'Scrivi o detta', dictate: 'Detta', listening: 'Ti ascolto...', category: 'Categoria', categories: 'Categorie',
    unassigned: 'Non assegnate', newItem: 'Nuovo', editItem: 'Modifica', understood: 'Ho capito così',
    smartPh: 'es. riunione giovedì 9-11 #lavoro', title: 'Titolo', titlePh: 'Cosa devi fare?', dateL: 'Giorno', untilDay: 'Fino al',
    allDay: 'Tutto il giorno', start: 'Inizio', end: 'Fine', time: 'Ora', alert: 'Avviso', none: 'Nessuno', atTime: "All'ora",
    min10: '10 minuti prima', min30: '30 minuti prima', h1: '1 ora prima', h2: '2 ore prima', d1: '1 giorno prima',
    repeat: 'Si ripete', no: 'No', everyDay: 'Ogni giorno', everyWeek: 'Ogni settimana', everyMonth: 'Ogni mese', everyYear: 'Ogni anno',
    repeatUntil: 'Fino al', optional: 'facoltativo', address: 'Indirizzo', addressPh: 'Via, città', openMaps: 'Apri in Google Maps',
    link: 'Link', linkPh: 'https://', openLink: 'Apri il link', notes: 'Note', notesPh: 'Dettagli utili: cosa portare, persone, codici',
    add: 'Aggiungi', save: 'Salva', del: 'Elimina', cancel: 'Annulla', done: 'Fatto', confirm: 'Conferma', markDone: 'Fatto',
    delItemQ: 'Eliminare questo elemento?', delItemRep: 'Si ripete: verrà eliminata tutta la serie.',
    searchPh: 'Cerca negli elementi', noResults: 'Nessun risultato', searchCatPh: 'Cerca o crea una categoria',
    recent: 'Recenti', allCats: 'Tutte', manageCats: 'Gestisci categorie', createCat: 'Crea', catHint: 'Trascina dalla maniglia per riordinare. Una sottocategoria si sposta anche dentro un\'altra categoria.',
    newCat: 'Nuova categoria', newSub: 'Nuova sottocategoria', name: 'Nome', icon: 'Icona', color: 'Colore', more: 'Altro', less: 'Meno',
    details: 'Dettagli', detailsPh: 'Informazioni su questa categoria', subcats: 'Sottocategorie', addSub: 'Aggiungi sottocategoria',
    asParent: 'Come la categoria', delCat: 'Elimina categoria', delCatQ: 'Eliminare la categoria?', delCatTxt: 'Gli elementi restano, in Non assegnate.',
    delCatSubsTxt: 'Anche le sottocategorie verranno eliminate. Tutti gli elementi restano, in Non assegnate.',
    nameNeeded: 'Serve un nome', ganttWhat: 'Cosa entra nel gantt', ganttHint: 'Il gantt si costruisce da solo con le categorie che scegli.',
    weeks: 'Settimane', months: 'Mesi', openAll: 'Apri tutto', closeAll: 'Chiudi tutto', showUnassigned: 'Mostra "Non assegnate"',
    toAdd: 'Da aggiungere', toAddTxt: 'Togli quelli che non vuoi, cambia categoria con un tocco, poi conferma.',
    fromLink: 'Origine: link', fromPaste: 'Origine: testo incollato', fromIcs: 'Origine: file .ics', nothingSaved: 'Niente viene salvato finché non confermi.',
    addN: 'Aggiungi {n}', added: '{n} elementi aggiunti', addedOne: 'Aggiunto', newTag: 'nuova', chosen: '{n} di {m} scelti', noneFound: 'Nessun elemento riconosciuto',
    sCats: 'Categorie', sGantt: 'Gantt', sNotify: 'Avvisi', sNotifyTxt: 'Funzionano mentre hora è aperta.', sNotifyOn: 'Mostra gli avvisi',
    sData: 'Dati', expJson: 'Esporta backup (.json)', impJson: 'Ripristina backup', expIcs: 'Esporta calendario (.ics)', impIcs: 'Importa calendario (.ics o .zip di Google)',
    restoreQ: 'Ripristinare il backup?', restoreTxt: 'Sostituisce tutti gli elementi e le categorie attuali.', restored: 'Backup ripristinato', badFile: 'File non valido',
    sLang: 'Lingua', sInfo: 'Informazioni', localTxt: 'I dati restano su questo dispositivo.', micFallback: 'Usa il microfono della tastiera',
    openDay: 'Apri il giorno', empty: 'Niente in programma', allDayShort: 'giorno', more1: 'altri {n}', savedOk: 'Salvato', deleted: 'Eliminato',
    reminderAt: 'Promemoria', notifyBlocked: 'Avvisi non consentiti dal browser', noTitle: 'Senza titolo',
    alarm: 'Sveglia', alarms: 'Sveglie', toComplete: 'Da completare', toCompleteTxt: 'Spento: solo avviso, senza casella da spuntare.',
    from: 'Dal', to: 'Al', label: 'Etichetta', alarmDays: 'Ripeti', alarmOnce: 'Una volta: tocca i giorni per ripeterla',
    openAlarms: 'Apri le sveglie del telefono', alarmIos: "Su iPhone apri l'app Orologio",
    alarmNote: 'Nella web app suona solo con hora aperta: per svegliarti imposta anche la sveglia del telefono.',
    filter: 'Filtro', types: 'Tipi', showAll: 'Mostra tutto', filterCatTxt: 'I nuovi elementi entrano nella prima categoria scelta.',
    sSun: 'Alba e tramonto', sSunOn: 'Mostra nel calendario', sSunTxt: 'Riga media del giorno o dei giorni che stai guardando.',
    place: 'Località', myPos: 'Usa la mia posizione', posHere: 'Posizione attuale', posFail: 'Posizione non disponibile',
    sunrise: 'alba', sunset: 'tramonto', already: 'già presente', tapDetails: 'Tocca per i dettagli',
    everyNDays: 'Ogni {n} giorni', everyNWeeks: 'Ogni {n} settimane', everyNMonths: 'Ogni {n} mesi', everyNYears: 'Ogni {n} anni', lastShort: 'ultimo',
    views: 'Viste', sCal: 'Calendario', sFree: 'Scorrimento continuo', sFreeTxt: 'Spento: si passa al periodo prima o dopo. Acceso: scorre liberamente. Attività scorre sempre.',
    sCatsTxt: 'Nomi, icone, colori e ordine', manage: 'Gestisci', voiceHelp: 'Come dettare', voiceTxt: 'Parla in modo semplice, poi controlla i campi qui sotto. Di\' "salva" alla fine per aggiungere subito.',
    voiceEx: 'dentista giovedì alle 15 e 30|riunione domani dalle 9 alle 11 categoria lavoro|palestra dalle 18 per due ore ogni martedì|ricordami di pagare le bollette lunedì avvisami un\'ora prima|sveglia alle 6 e 45 dal lunedì al venerdì|cena da Anna in via Roma 10 sabato alle 20 con nota portare il vino',
    goDate: 'Vai a data', splashSub: 'ogni cosa a suo tempo', tapToEnter: 'Tocca lo schermo per entrare', copied: 'Copiato',
    aiImport: 'Importa da un\'altra app', aiShort: 'Con l\'aiuto di un\'IA, ad esempio Claude', aiTxt: 'Per app e agende che non esportano in .ics: un\'IA converte i dati nel formato di hora.',
    aiStep1: 'Esporta o copia i dati dall\'altra app: file, testo, anche una foto.', aiStep2: 'Dai all\'IA i dati insieme a queste istruzioni.', aiStep3: 'Incolla qui il blocco che ti restituisce, poi controlla e conferma.',
    copyMd: 'Copia istruzioni', downloadMd: 'Scarica .md', pasteHere: 'Incolla qui', readBlock: 'Leggi e controlla',
    agenda: 'Elenco', evRem: 'Eventi e promemoria', onceOn: 'una volta, {d}', untilD: 'fino al {d}', newGroup: 'Nuovo gruppo', noGroup: 'Senza gruppo', up: 'Su', down: 'Giù',
    newAlarm: 'Nuova sveglia', past: 'Anche passati', showMore: 'Mostra altri', noAlarms: 'Nessuna sveglia', suggested: 'Suggerite', hideTips: 'Nascondi',
    tplTxt: 'Gruppi pronti da aggiungere. Le sveglie suonano a un\'ora precisa e si ripetono: utili quando non si può rimandare, come un medicinale.',
    sLook: 'Aspetto', theme: 'Tema', thAuto: 'Auto', thLight: 'Chiaro', thDark: 'Scuro', sSplash: 'Schermata iniziale', sSplashTxt: 'Il marchio all\'apertura, finché non tocchi lo schermo',
    sSync: 'Sincronizzazione', dbxNoKey: 'Pronta: manca la chiave dell\'app Dropbox', soon: 'presto', dbxLink: 'Collega Dropbox', dbxSync: 'Sincronizza ora', syncing: 'Sincronizzazione...',
    lastSync: 'Ultima: {d}', never: 'Mai', dbxUnlink: 'Scollega Dropbox', syncConflictQ: 'Dati diversi su Dropbox', syncConflictTxt: 'Sono cambiati sia qui sia su un altro dispositivo. Quali tieni?',
    useDbx: 'Usa Dropbox', useHere: 'Usa questi', syncOk: 'Sincronizzato', syncFail: 'Sincronizzazione non riuscita', newVer: 'Nuova versione {v}', reload: 'Ricarica', group: 'Gruppo', active: 'Attiva',
    expData: 'Esporta', impData: 'Importa', gantt2: 'Attività', ganttTxt: 'Cronoprogramma per categorie'
  },
  en: {
    today: 'Today', day: 'Day', days3: '3 days', days5: '5 days', week: 'Week', month: 'Month', gantt: 'Timeline',
    all: 'All', events: 'Events', reminders: 'Reminders', event: 'Event', reminder: 'Reminder',
    search: 'Search', settings: 'Settings', back: 'Back', close: 'Close', prev: 'Previous', next: 'Next',
    writeOrDictate: 'Type or dictate', dictate: 'Dictate', listening: 'Listening...', category: 'Category', categories: 'Categories',
    unassigned: 'Unassigned', newItem: 'New', editItem: 'Edit', understood: 'Here is what I got',
    smartPh: 'e.g. meeting thursday 9-11 #work', title: 'Title', titlePh: 'What do you need to do?', dateL: 'Day', untilDay: 'Until',
    allDay: 'All day', start: 'Start', end: 'End', time: 'Time', alert: 'Alert', none: 'None', atTime: 'At time',
    min10: '10 minutes before', min30: '30 minutes before', h1: '1 hour before', h2: '2 hours before', d1: '1 day before',
    repeat: 'Repeats', no: 'No', everyDay: 'Every day', everyWeek: 'Every week', everyMonth: 'Every month', everyYear: 'Every year',
    repeatUntil: 'Until', optional: 'optional', address: 'Address', addressPh: 'Street, city', openMaps: 'Open in Google Maps',
    link: 'Link', linkPh: 'https://', openLink: 'Open link', notes: 'Notes', notesPh: 'Useful details: what to bring, people, codes',
    add: 'Add', save: 'Save', del: 'Delete', cancel: 'Cancel', done: 'Done', confirm: 'Confirm', markDone: 'Done',
    delItemQ: 'Delete this item?', delItemRep: 'It repeats: the whole series will be deleted.',
    searchPh: 'Search items', noResults: 'No results', searchCatPh: 'Search or create a category',
    recent: 'Recent', allCats: 'All', manageCats: 'Manage categories', createCat: 'Create', catHint: 'Drag the handle to reorder. A subcategory can also move into another category.',
    newCat: 'New category', newSub: 'New subcategory', name: 'Name', icon: 'Icon', color: 'Color', more: 'More', less: 'Less',
    details: 'Details', detailsPh: 'Information about this category', subcats: 'Subcategories', addSub: 'Add subcategory',
    asParent: 'Same as category', delCat: 'Delete category', delCatQ: 'Delete the category?', delCatTxt: 'Items stay, under Unassigned.',
    delCatSubsTxt: 'Subcategories will be deleted too. All items stay, under Unassigned.',
    nameNeeded: 'A name is needed', ganttWhat: 'What goes in the timeline', ganttHint: 'The timeline builds itself from the categories you choose.',
    weeks: 'Weeks', months: 'Months', openAll: 'Open all', closeAll: 'Close all', showUnassigned: 'Show "Unassigned"',
    toAdd: 'To add', toAddTxt: 'Remove what you do not want, change category with a tap, then confirm.',
    fromLink: 'Source: link', fromPaste: 'Source: pasted text', fromIcs: 'Source: .ics file', nothingSaved: 'Nothing is saved until you confirm.',
    addN: 'Add {n}', added: '{n} items added', addedOne: 'Added', newTag: 'new', chosen: '{n} of {m} selected', noneFound: 'No items recognised',
    sCats: 'Categories', sGantt: 'Timeline', sNotify: 'Alerts', sNotifyTxt: 'They work while hora is open.', sNotifyOn: 'Show alerts',
    sData: 'Data', expJson: 'Export backup (.json)', impJson: 'Restore backup', expIcs: 'Export calendar (.ics)', impIcs: 'Import calendar (.ics or Google .zip)',
    restoreQ: 'Restore the backup?', restoreTxt: 'It replaces all current items and categories.', restored: 'Backup restored', badFile: 'Invalid file',
    sLang: 'Language', sInfo: 'About', localTxt: 'Your data stays on this device.', micFallback: 'Use the keyboard microphone',
    openDay: 'Open day', empty: 'Nothing planned', allDayShort: 'day', more1: '{n} more', savedOk: 'Saved', deleted: 'Deleted',
    reminderAt: 'Reminder', notifyBlocked: 'Alerts blocked by the browser', noTitle: 'Untitled',
    alarm: 'Alarm', alarms: 'Alarms', toComplete: 'To complete', toCompleteTxt: 'Off: just an alert, no checkbox.',
    from: 'From', to: 'To', label: 'Label', alarmDays: 'Repeat', alarmOnce: 'Once: tap the days to repeat it',
    openAlarms: 'Open the phone alarms', alarmIos: 'On iPhone open the Clock app',
    alarmNote: 'In the web app it rings only while hora is open: to wake up, also set the phone alarm.',
    filter: 'Filter', types: 'Types', showAll: 'Show all', filterCatTxt: 'New items go into the first chosen category.',
    sSun: 'Sunrise and sunset', sSunOn: 'Show in the calendar', sSunTxt: 'Average line for the day or days you are viewing.',
    place: 'Place', myPos: 'Use my location', posHere: 'Current location', posFail: 'Location unavailable',
    sunrise: 'sunrise', sunset: 'sunset', already: 'already there', tapDetails: 'Tap for details',
    everyNDays: 'Every {n} days', everyNWeeks: 'Every {n} weeks', everyNMonths: 'Every {n} months', everyNYears: 'Every {n} years', lastShort: 'last',
    views: 'Views', sCal: 'Calendar', sFree: 'Continuous scrolling', sFreeTxt: 'Off: swipe to the previous or next period. On: scrolls freely. Timeline always scrolls.',
    sCatsTxt: 'Names, icons, colors and order', manage: 'Manage', voiceHelp: 'How to dictate', voiceTxt: 'The microphone always listens in Italian. Check the fields below; say "salva" at the end to add right away.',
    voiceEx: 'dentista giovedì alle 15 e 30|riunione domani dalle 9 alle 11 categoria lavoro|palestra dalle 18 per due ore ogni martedì|sveglia alle 6 e 45 dal lunedì al venerdì',
    goDate: 'Go to date', splashSub: 'everything in its time', tapToEnter: 'Tap the screen to enter', copied: 'Copied',
    aiImport: 'Import from another app', aiShort: 'With the help of an AI, e.g. Claude', aiTxt: 'For apps and planners without .ics export: an AI converts the data into hora\'s format.',
    aiStep1: 'Export or copy the data from the other app: file, text, even a photo.', aiStep2: 'Give the AI the data together with these instructions.', aiStep3: 'Paste here the block it returns, then check and confirm.',
    copyMd: 'Copy instructions', downloadMd: 'Download .md', pasteHere: 'Paste here', readBlock: 'Read and check',
    agenda: 'List', evRem: 'Events and reminders', onceOn: 'once, {d}', untilD: 'until {d}', newGroup: 'New group', noGroup: 'No group', up: 'Up', down: 'Down',
    newAlarm: 'New alarm', past: 'Include past', showMore: 'Show more', noAlarms: 'No alarms', suggested: 'Suggested', hideTips: 'Hide',
    tplTxt: 'Ready-made groups. Alarms ring at an exact time and repeat: useful when something cannot wait, like a medicine.',
    sLook: 'Appearance', theme: 'Theme', thAuto: 'Auto', thLight: 'Light', thDark: 'Dark', sSplash: 'Start screen', sSplashTxt: 'The logo on opening, until you tap the screen',
    sSync: 'Sync', dbxNoKey: 'Ready: the Dropbox app key is missing', soon: 'soon', dbxLink: 'Connect Dropbox', dbxSync: 'Sync now', syncing: 'Syncing...',
    lastSync: 'Last: {d}', never: 'Never', dbxUnlink: 'Disconnect Dropbox', syncConflictQ: 'Different data on Dropbox', syncConflictTxt: 'Data changed both here and on another device. Which do you keep?',
    useDbx: 'Use Dropbox', useHere: 'Use these', syncOk: 'Synced', syncFail: 'Sync failed', newVer: 'New version {v}', reload: 'Reload', group: 'Group', active: 'On',
    expData: 'Export', impData: 'Import', gantt2: 'Timeline', ganttTxt: 'Schedule by category'
  }
};
let LANG = 'it';
export const setLang = (l) => { LANG = STR[l] ? l : 'it'; };
export const t = (k, v) => {
  let s = (STR[LANG] && STR[LANG][k]) || STR.it[k] || k;
  if (v) for (const n in v) s = s.replace('{' + n + '}', v[n]);
  return s;
};
const WD_SHORT = { it: ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'], en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] };
const WD_LONG = { it: ['lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato', 'domenica'], en: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] };
const WD_LETTER = { it: ['L', 'M', 'M', 'G', 'V', 'S', 'D'], en: ['M', 'T', 'W', 'T', 'F', 'S', 'S'] };
const MONTHS = {
  it: ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
};
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/* ============ Date (stringhe AAAA-MM-GG, ora locale) ============ */
const pad = (n) => String(n).padStart(2, '0');
export const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const toDate = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d, 12); };
export const addDays = (s, n) => { const d = toDate(s); d.setDate(d.getDate() + n); return ymd(d); };
export const diffDays = (a, b) => Math.round((toDate(b) - toDate(a)) / 864e5);
export const wd = (s) => (toDate(s).getDay() + 6) % 7;
export const startOfWeek = (s) => addDays(s, -wd(s));
export const daysInMonth = (s) => { const [y, m] = s.split('-').map(Number); return new Date(y, m, 0).getDate(); };
export const monthStart = (s) => s.slice(0, 8) + '01';
export const addMonths = (s, n) => {
  const [y, m, d] = s.split('-').map(Number);
  const dt = new Date(y, m - 1 + n, 1, 12);
  const ms = ymd(dt);
  return ms.slice(0, 8) + pad(Math.min(d, daysInMonth(ms)));
};
export const todayStr = () => ymd(new Date());
export const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
export const fmtTime = (m) => `${Math.floor(m / 60)}:${pad(m % 60)}`;
export const toHHMM = (m) => (m == null ? '' : `${pad(Math.floor(m / 60) % 24)}:${pad(m % 60)}`);
export const fromHHMM = (s) => { if (!s) return null; const [h, m] = s.split(':').map(Number); return h * 60 + (m || 0); };
const dnum = (s) => +s.slice(8);
const mnum = (s) => +s.slice(5, 7) - 1;
export const fmtDayLong = (s) => `${WD_SHORT[LANG][wd(s)]} ${dnum(s)} ${MONTHS[LANG][mnum(s)]}`;
export const fmtDayShort = (s) => `${WD_SHORT[LANG][wd(s)]} ${pad(dnum(s))}/${pad(mnum(s) + 1)}`;
export const fmtMonthYear = (s) => `${cap(MONTHS[LANG][mnum(s)])} ${s.slice(0, 4)}`;
const mab = (s) => MONTHS[LANG][mnum(s)].slice(0, 3);
export const fmtRange = (a, b) => {
  if (a.slice(0, 7) === b.slice(0, 7)) return `${dnum(a)} - ${dnum(b)} ${MONTHS[LANG][mnum(a)]}`;
  return `${dnum(a)} ${mab(a)} - ${dnum(b)} ${mab(b)}`;
};
/* intestazione di una colonna su una riga, secondo lo spazio: lunedì 8 settembre 2026, lun 8 settembre, lun 8/09, lun 8, L 8 */
export const fmtHead = (s, w) => {
  const n = dnum(s), ws = WD_SHORT[LANG][wd(s)].toLowerCase();
  if (w >= 230) return `${WD_LONG[LANG][wd(s)]} ${n} ${MONTHS[LANG][mnum(s)]} ${s.slice(0, 4)}`;
  if (w >= 150) return `${ws} ${n} ${MONTHS[LANG][mnum(s)]}`;
  if (w >= 92) return `${ws} ${n}/${pad(mnum(s) + 1)}`;
  if (w >= 56) return `${ws} ${n}`;
  return `${WD_LETTER[LANG][wd(s)]} ${n}`;
};
/* titolo di un intervallo: Ottobre 2026, Ott - Nov 2026, Dic 2026 - Gen 2027 */
export const fmtSpan = (a, b) => {
  if (a.slice(0, 7) === b.slice(0, 7)) return fmtMonthYear(a);
  const m = (s) => cap(mab(s));
  return a.slice(0, 4) === b.slice(0, 4) ? `${m(a)} - ${m(b)} ${a.slice(0, 4)}` : `${m(a)} ${a.slice(0, 4)} - ${m(b)} ${b.slice(0, 4)}`;
};
export const fmtFull = (s) => `${fmtDayLong(s)} ${s.slice(0, 4)}`;

/* ============ Colori (tenui) ============ */
const hexRgb = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const mix = (a, b, k) => { const x = hexRgb(a), y = hexRgb(b); return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * k).toString(16).padStart(2, '0')).join(''); };
export const PALETTE = [
  ['verderame', '#2F9184'], ['ottone', '#C99A4E'], ['mare', '#4F7CA8'], ['salvia', '#7E9A6B'],
  ['prugna', '#8C6A8E'], ['ruggine', '#B4544A'], ['sabbia', '#A38B62'], ['ardesia', '#5F6F7A'],
  ['petrolio', '#2E6E86'], ['muschio', '#6F8A4E'], ['terracotta', '#C27350'], ['rosa', '#B9788A'],
  ['oliva', '#8E8A4B'], ['cielo', '#6A9BC3'], ['menta', '#5BA58E'], ['ambra', '#D19A3E'],
  ['malva', '#9C7AA6'], ['corallo', '#CF7A6A'], ['grafite', '#4A5560'], ['tabacco', '#8C6B4A'],
  ['acqua', '#4FA3A5'], ['glicine', '#8F86C2'], ['argilla', '#A8705A'], ['lavanda', '#7B7FB8']
];
const PAL = Object.fromEntries(PALETTE);
/* tema chiaro o scuro: i toni delle categorie si adattano allo sfondo */
let THEME = 'light';
export const setTheme = (th) => { THEME = th === 'dark' ? 'dark' : 'light'; };
export const isDark = () => THEME === 'dark';
export const tones = (hex) => (THEME === 'dark'
  ? { c: mix(hex, '#FFFFFF', 0.12), tint: mix(hex, '#16232B', 0.7), ink: mix(hex, '#FFFFFF', 0.55) }
  : { c: hex, tint: mix(hex, '#FFFFFF', 0.82), ink: mix(hex, '#0E1D2A', 0.45) });
export const noneTone = () => (THEME === 'dark' ? { c: '#7F8D96', tint: '#23313A', ink: '#C3CDD2' } : { c: '#8A979F', tint: '#E8ECEE', ink: '#3C4952' });
export const colorHex = (id) => PAL[id] || PAL.verderame;

/* ============ Icone (tratto, griglia 24) ============ */
export const ICONS = {
  tocco: 'p:M2 9l10-5 10 5-10 5z|p:M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5',
  libro: 'p:M3 5h6a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H3zM21 5h-6a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h7z',
  valigetta: 'r:3,7,18,13,2|p:M9 7V5h6v2M3 12h18',
  casa: 'p:M4 11l8-7 8 7v9H4z|p:M10 20v-5h4v5',
  cuore: 'p:M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z',
  aereo: 'p:M21 4L3 11l7 3 3 7z',
  carrello: 'p:M3 4h2l2 11h11l2-8H6|c:9,19.5,1.5|c:17,19.5,1.5',
  calice: 'p:M8 3h8v4a4 4 0 0 1-8 0zM12 11v9M8 21h8',
  foglia: 'p:M5 19c0-8 6-14 14-14 0 8-6 14-14 14zM5 19l7-7',
  stella: 'p:M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z',
  sport: 'p:M6 8v8M18 8v8M3 10v4M21 10v4M6 12h12',
  persone: 'c:9,8,3|p:M3 20a6 6 0 0 1 12 0|c:17,9,2.5|p:M15.5 14.2A5 5 0 0 1 21 19',
  tag: 'p:M3 12V4h8l10 10-8 8z|c:7.5,7.5,1.5',
  auto: 'p:M4 16v-4l2-5h12l2 5v4zM4 16v3M20 16v3|c:7.5,13.5,1|c:16.5,13.5,1',
  bici: 'c:6,16,3.5|c:18,16,3.5|p:M6 16l4-8h5l3 8M8 8h3M12 16l3-8',
  treno: 'r:6,3,12,14,3|p:M6 11h12M9 21l1.5-4M15 21l-1.5-4',
  barca: 'p:M3 15h18l-3 5H6zM12 3v12M12 4l6 9h-6',
  ancora: 'c:12,5,2|p:M12 7v14M5 13a7 7 0 0 0 14 0M9 10h6',
  sole: 'c:12,12,4|p:M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  luna: 'p:M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z',
  nuvola: 'p:M7 18a4 4 0 0 1-.5-8 5.5 5.5 0 0 1 10.6 1.5A3.3 3.3 0 0 1 17 18z',
  ombrello: 'p:M3 12a9 9 0 0 1 18 0zM12 12v6a2 2 0 0 0 4 0',
  musica: 'p:M9 18V5l11-2v13|c:6.5,18,2.5|c:17.5,16,2.5',
  cinema: 'r:3,6,18,13,2|p:M3 10h18M7 6l2 4M12 6l2 4M17 6l2 4',
  foto: 'r:3,7,18,13,2|c:12,13.5,3.5|p:M8 7l1.5-3h5L16 7',
  telefono: 'r:7,2,10,20,2|p:M11 18h2',
  busta: 'r:3,5,18,14,2|p:M3 7l9 6 9-6',
  chat: 'p:M4 5h16v11H9l-5 4z',
  calendario: 'r:3,5,18,16,2|p:M3 10h18M8 3v4M16 3v4',
  orologio: 'c:12,12,9|p:M12 7v5l3 2',
  campana: 'p:M6 16v-5a6 6 0 0 1 12 0v5l2 2H4zM10 21h4',
  bandiera: 'p:M5 21V4h11l-2 4 2 4H5',
  chiave: 'c:8,15,4|p:M11 12l9-9M16 7l3 3',
  martello: 'p:M14 4l6 6-3 3-6-6zM11 7l-8 8 3 3 8-8',
  matita: 'p:M4 20l1-4L16 5l3 3L8 19zM14 7l3 3',
  codice: 'p:M8 7l-5 5 5 5M16 7l5 5-5 5',
  computer: 'r:3,4,18,12,2|p:M8 20h8M12 16v4',
  regalo: 'r:3,8,18,5,1|p:M5 13v8h14v-8M12 8v13M12 8c-2-4-6-4-6-1.5S10 8 12 8zM12 8c2-4 6-4 6-1.5S14 8 12 8z',
  torta: 'p:M4 21h16v-8H4zM4 16c2 1.5 4 1.5 5.3 0s3.4-1.5 5.4 0 4 1.5 5.3 0M8 13V9M12 13V9M16 13V9',
  caffe: 'p:M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 10h1.5a2.5 2.5 0 0 1 0 5H17M8 3v2M12 3v2',
  posate: 'p:M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 0-3 3-3 6s1 3 3 3v9',
  pianta: 'p:M12 21v-9M12 12c0-4-3-6-7-6 0 4 3 6 7 6zM12 15c0-4 3-6 7-6 0 4-3 6-7 6zM8 21h8',
  zampa: 'c:7,9,1.6|c:11,6,1.6|c:15,6,1.6|c:18,9.5,1.6|p:M8 17c0-3 2-5 4.5-5S17 14 17 17a2.5 2.5 0 0 1-3 2.4c-1-.3-2-.3-3 0A2.5 2.5 0 0 1 8 17z',
  pillola: 'p:M10.5 3.5a5 5 0 0 1 7 7l-7 7a5 5 0 0 1-7-7zM7 7l7 7',
  croce: 'p:M9 3h6v6h6v6h-6v6H9v-6H3V9h6z',
  moneta: 'c:12,12,9|p:M14.5 9.5a3 3 0 1 0 0 5M8 11h5M8 13h5',
  montagna: 'p:M3 20l6-11 4 6 3-4 5 9z',
  luogo: 'p:M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z|c:12,10,2.5',
  mondo: 'c:12,12,9|p:M3.5 9.5h17M3.5 14.5h17M12 3c-3 3-3 15 0 18M12 3c3 3 3 15 0 18',
  gioco: 'r:2,7,20,11,5|p:M7 11v3M5.5 12.5h3|c:15.5,11.5,1|c:17.5,13.5,1',
  lucchetto: 'r:5,11,14,10,2|p:M8 11V8a4 4 0 0 1 8 0v3'
};
export const BASE_ICONS = ['tocco', 'libro', 'valigetta', 'casa', 'cuore', 'aereo', 'carrello', 'calice', 'foglia', 'stella', 'sport', 'persone'];

export function Icon({ name, size = 20, sw = 1.8, color = 'currentColor', style }) {
  const spec = ICONS[name] || ICONS.tag;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={color === 'currentColor' ? style : { ...style, color }}>
      {spec.split('|').map((part, i) => {
        const [k, v] = [part[0], part.slice(2)];
        if (k === 'p') return <path key={i} d={v} />;
        const n = v.split(',').map(Number);
        if (k === 'c') return <circle key={i} cx={n[0]} cy={n[1]} r={n[2]} />;
        return <rect key={i} x={n[0]} y={n[1]} width={n[2]} height={n[3]} rx={n[4] || 0} />;
      })}
    </svg>
  );
}

/* Icone di interfaccia */
const UI = {
  search: 'M16 16l4.5 4.5|c', gear: '', left: 'M15 5l-7 7 7 7', right: 'M9 5l7 7-7 7', down: 'M5 9l7 7 7-7', up: 'M5 15l7-7 7 7',
  x: 'M6 6l12 12M18 6L6 18', plus: 'M12 5v14M5 12h14', check: 'M5 12.5l4.5 4.5L19 7.5', mic: '', pin: '', ext: 'M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
  filter: 'M4 6h16M7 12h10M10 18h4', bell: 'M6 16v-5a6 6 0 0 1 12 0v5l2 2H4zM10 21h4',
  expand: 'M7 7l5 5 5-5M7 13l5 5 5-5', collapse: 'M7 11l5-5 5 5M7 17l5-5 5 5', grip: '', trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
  /* viste: colonne del giorno, griglia del mese, barre delle attività */
  day1: 'M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM8 9h8M8 13h5',
  day3: 'M4 5v14M10 5v14M16 5v14M4 5h16v14H4',
  day5: 'M4 5h16v14H4zM7.2 5v14M10.4 5v14M13.6 5v14M16.8 5v14',
  week: 'M3 5h18v14H3zM3 9h18M7.3 9v10M11.6 9v10M15.9 9v10',
  month: 'M4 5h16v15H4zM4 9.5h16M4 14.5h16M9.3 9.5V20M14.7 9.5V20',
  gantt: 'M4 6h9M8 12h10M6 18h7M4 3v18',
  repeat: 'M17 2l3 3-3 3M4 11V9a4 4 0 0 1 4-4h12M7 22l-3-3 3-3M20 13v2a4 4 0 0 1-4 4H4',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  note: 'M5 4h14v16H5zM8 9h8M8 13h8M8 17h5', text: 'M5 7h14M5 12h14M5 17h9',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2', cal: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
  sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  sunrise: 'M3 18h18M7 18a5 5 0 0 1 10 0M12 4v4M9.5 6.5L12 4l2.5 2.5M4.5 11.5l1.4 1.4M19.5 11.5l-1.4 1.4',
  globe: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3.5 9.5h17M3.5 14.5h17M12 3c-3 3-3 15 0 18M12 3c3 3 3 15 0 18',
  download: 'M12 4v11M7 10l5 5 5-5M5 20h14', upload: 'M12 16V5M7 10l5-5 5 5M5 20h14',
  swipe: 'M4 12h16M8 8l-4 4 4 4M16 8l4 4-4 4', tag: 'M3 12V4h8l10 10-8 8zM7.5 6a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z',
  info: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 11v6M12 7.5v.5', help: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17v.5',
  done: 'M4 5h16v14H4zM8 12l3 3 5-6', tap: 'M9 11V5.5a1.5 1.5 0 0 1 3 0V10l4.6 1.2a2 2 0 0 1 1.4 2.3L17 19a2 2 0 0 1-2 1.6h-4.2a2 2 0 0 1-1.6-.8L6 15.5a1.5 1.5 0 0 1 2.2-2L9 14.3', list: 'M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01', moon: 'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z', cloud: 'M7 18a4 4 0 0 1-.5-8 5.5 5.5 0 0 1 10.6 1.5A3.3 3.3 0 0 1 17 18zM12 11v6M9.5 14.5L12 17l2.5-2.5', ai: 'M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8zM18.5 15l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z', copy: 'M8 8h11v12H8zM5 16V4h11', palette: 'M12 3a9 9 0 1 0 0 18c1 0 1.5-.8 1.5-1.5 0-1.2-1-1.5-1-2.5s.8-1.5 2-1.5H17a4 4 0 0 0 4-4c0-4.4-4-8.5-9-8.5zM7.5 11.5h.01M10 7.5h.01M15 7.5h.01', type: 'M12 3l9 5-9 5-9-5zM3 13l9 5 9-5'
};
export function UIcon({ n, size = 20, sw = 1.9, color = 'currentColor' }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true', style: color === 'currentColor' ? undefined : { color } };
  if (n === 'search') return <svg {...common}><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></svg>;
  if (n === 'gear') return <svg {...common} strokeWidth={1.6}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>;
  if (n === 'mic') return <svg {...common} strokeWidth={1.8}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" /></svg>;
  if (n === 'pin') return <svg {...common}><path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>;
  if (n === 'grip') return <svg width={12} height={18} viewBox="0 0 12 18" aria-hidden="true" style={{ color }}>{[3, 9, 15].map((y) => [3, 9].map((x) => <circle key={x + '' + y} cx={x} cy={y} r="1.6" fill="currentColor" />))}</svg>;
  return <svg {...common}><path d={UI[n]} /></svg>;
}

/* Marchio: ciclo quasi chiuso, luna ottone, due onde */
export function Mark({ size = 26, dark = false, anim = false }) {
  const c = dark ? '#54B7A9' : '#2F9184', moon = dark ? '#E0B063' : '#C99A4E';
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" className={anim ? 'mk' : undefined}>
      <circle className="mk-arc" cx="24" cy="24" r="19" fill="none" stroke={c} strokeWidth="3.3" strokeLinecap="round" strokeDasharray="99.5 200" transform="rotate(-90 24 24)" />
      <path className="mk-w1" d="M14 23q3.33-3.4 6.67 0t6.67 0t6.67 0" fill="none" stroke={c} strokeWidth="3.3" strokeLinecap="round" />
      <path className="mk-w2" d="M17.5 30q3.25-3 6.5 0t6.5 0" fill="none" stroke={c} strokeWidth="3.3" strokeLinecap="round" strokeOpacity="0.5" />
      {anim
        ? <g className="mk-moon"><circle cx="24" cy="5" r="4" fill={moon} /></g>
        : <circle cx="7.55" cy="14.5" r="4.2" fill={moon} />}
    </svg>
  );
}


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
    alarmGroups: [],
    cats: [
      { id: uid(), name: lang === 'en' ? 'Work' : 'Lavoro', icon: 'valigetta', color: 'verderame', details: '', parent: null, order: 0, gantt: true },
      { id: uid(), name: lang === 'en' ? 'Personal' : 'Personale', icon: 'persone', color: 'ottone', details: '', parent: null, order: 1, gantt: true },
      { id: uid(), name: lang === 'en' ? 'Home' : 'Casa', icon: 'casa', color: 'salvia', details: '', parent: null, order: 2, gantt: true }
    ],
    settings: { lang, ganttUnassigned: true, hourH: 48, monthTitles: false, ganttScale: 'week', recent: [], notify: false, sun: { ...DEFAULT_SUN }, theme: 'auto', splash: true }
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
  if (!c) return noneTone();
  if (c.color) return tones(colorHex(c.color));
  const p = catOf(cats, c.parent);
  return p ? tones(colorHex(p.color)) : noneTone();
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
  return (it) => !(it.type === 'sveglia' && it.off) && f.types.includes(it.type) && (!ids || it.type === 'sveglia' || ids.has(it.cat && catOf(cats, it.cat) ? it.cat : '__none'));
}
/* categoria per i nuovi elementi: la prima scelta nel filtro, nell'ordine delle categorie */
export function filterCat(f, cats) {
  if (!f.cats.length) return null;
  const tree = cats.filter((c) => !c.parent).sort(byOrder).flatMap((c) => [c, ...cats.filter((x) => x.parent === c.id).sort(byOrder)]);
  const hit = tree.find((c) => f.cats.includes(c.id));
  return hit ? hit.id : null;
}


/* ============ Componenti di base ============ */
function Sheet({ onClose, children, label, tall }) {
  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div className="ov" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <section className={'sheet' + (tall ? ' tall' : '')} role="dialog" aria-label={label}>
        <div className="grab" />
        {children}
      </section>
    </div>
  );
}
function SheetHead({ title, onClose }) {
  return (
    <div className="sh-head">
      <h2>{title}</h2>
      <button className="ib" aria-label={t('close')} onClick={onClose}><UIcon n="x" /></button>
    </div>
  );
}
function Screen({ title, onBack, right, children }) {
  return (
    <div className="screen" role="dialog" aria-label={title}>
      <header className="sc-head">
        <div className="row-c">
          <button className="ib" aria-label={t('back')} onClick={onBack}><UIcon n="left" /></button>
          <h1>{title}</h1>
        </div>
        {right}
      </header>
      <div className="sc-body">{children}</div>
    </div>
  );
}
function Switch({ on, onChange, label }) {
  return (
    <button className={'sw' + (on ? ' on' : '')} role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)}><i /></button>
  );
}
function Confirm({ q, txt, ok, onOk, onCancel, danger, cancel, onCancelAlt }) {
  return (
    <div className="ov center" onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="dlg" role="alertdialog" aria-label={q}>
        <h3>{q}</h3>
        {txt && <p>{txt}</p>}
        <div className="dlg-b">
          <button className="btn" onClick={onCancelAlt || onCancel}>{cancel || t('cancel')}</button>
          <button className={'btn ' + (danger ? 'danger' : 'pri')} onClick={onOk}>{ok}</button>
        </div>
      </div>
    </div>
  );
}
function CatTile({ cats, id, size = 28 }) {
  const tn = catTone(cats, id);
  return (
    <span className="tile" style={{ width: size, height: size, background: tn.tint, color: tn.ink, borderRadius: size * 0.3 }}>
      <Icon name={catIcon(cats, id)} size={Math.round(size * 0.56)} sw={2} />
    </span>
  );
}
function TypeShape({ type, color, done, size = 12, only }) {
  const st = { flex: 'none', color };
  if (type === 'sveglia') {
    return (
      <svg width={size} height={size} viewBox="0 0 12 12" aria-hidden="true" style={st}>
        <circle cx="6" cy="6.6" r="4.3" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M6 4.4v2.3l1.5 1M1.6 2.6l1.6-1.3M10.4 2.6L8.8 1.3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === 'promemoria' && only) {
    return (
      <svg width={size} height={size} viewBox="0 0 12 12" aria-hidden="true" style={st}>
        <path d="M3 8.2V5.6a3 3 0 0 1 6 0v2.6l1 1H2zM5 10.8h2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === 'promemoria') {
    return (
      <svg width={size} height={size} viewBox="0 0 12 12" aria-hidden="true" style={st}>
        <circle cx="6" cy="6" r="4.6" fill={done ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }
  return <svg width={size} height={size} viewBox="0 0 12 12" aria-hidden="true" style={st}><rect x="1" y="1" width="10" height="10" rx="3" fill="currentColor" /></svg>;
}
function whenText(it, d) {
  const date = d || it.date;
  let s = fmtDayShort(date);
  if (isTimedMulti(it)) return `${s} ${fmtTime(it.start)} - ${fmtDayShort(addDays(date, spanDays(it)))} ${fmtTime(it.end ?? it.start)}`;
  if (isMulti(it)) s = `${fmtDayShort(date)} - ${fmtDayShort(addDays(date, spanDays(it)))}`;
  else if (it.start != null) s += ', ' + fmtTime(it.start) + (it.type === 'evento' && it.end != null ? ' - ' + fmtTime(it.end) : '');
  return s;
}

/* pressione lunga: un'azione diversa dal tocco (es. Vai a data su Oggi, titolo e frecce) */
function useLongPress(onLong, onClick, ms = 480) {
  const tm = useRef(null), fired = useRef(false);
  const stop = () => clearTimeout(tm.current);
  return {
    onPointerDown: () => { fired.current = false; stop(); tm.current = setTimeout(() => { fired.current = true; try { if (navigator.vibrate) navigator.vibrate(10); } catch (e) { /* niente */ } onLong(); }, ms); },
    onPointerUp: stop, onPointerLeave: stop, onPointerCancel: stop,
    onContextMenu: (e) => e.preventDefault(),
    onClick: (e) => { if (fired.current) { fired.current = false; e.preventDefault(); return; } if (onClick) onClick(e); }
  };
}

/* ============ Vai a data: anno, mese e giorno in tre tocchi ============ */
function DatePicker({ value, onPick, onClose }) {
  const today = todayStr();
  const [y, setY] = useState(+value.slice(0, 4));
  const [m, setM] = useState(mnum(value));
  const [step, setStep] = useState('year');
  const [y0, setY0] = useState(+value.slice(0, 4) - 4);
  const ms = `${y}-${pad(m + 1)}-01`;
  const lead = wd(ms), dim = daysInMonth(ms);
  const pick = (d) => { onPick(`${y}-${pad(m + 1)}-${pad(d)}`); onClose(); };
  return (
    <Sheet onClose={onClose} label={t('goDate')}>
      <SheetHead title={t('goDate')} onClose={onClose} />
      <div className="dp-crumbs" role="tablist">
        <button className={step === 'year' ? 'on' : ''} onClick={() => setStep('year')}>{y}</button>
        <UIcon n="right" size={14} sw={2.2} color="var(--faint)" />
        <button className={step === 'month' ? 'on' : ''} onClick={() => setStep('month')}>{MONTHS[LANG][m]}</button>
        <UIcon n="right" size={14} sw={2.2} color="var(--faint)" />
        <button className={step === 'day' ? 'on' : ''} onClick={() => setStep('day')}>{t('dateL')}</button>
      </div>
      {step === 'year' && (
        <div className="dp-wrap">
          <button className="ctl" aria-label={t('prev')} onClick={() => setY0(y0 - 12)}><UIcon n="left" size={17} /></button>
          <div className="dp-grid c3">
            {Array.from({ length: 12 }, (_, i) => y0 + i).map((v) => (
              <button key={v} className={(v === y ? 'on' : '') + (v === +today.slice(0, 4) ? ' now' : '')} onClick={() => { setY(v); setStep('month'); }}>{v}</button>
            ))}
          </div>
          <button className="ctl" aria-label={t('next')} onClick={() => setY0(y0 + 12)}><UIcon n="right" size={17} /></button>
        </div>
      )}
      {step === 'month' && (
        <div className="dp-grid c3">
          {MONTHS[LANG].map((n, i) => (
            <button key={n} className={(i === m ? 'on' : '') + (y === +today.slice(0, 4) && i === mnum(today) ? ' now' : '')} onClick={() => { setM(i); setStep('day'); }}>{cap(n.slice(0, 3))}</button>
          ))}
        </div>
      )}
      {step === 'day' && (
        <div className="dp-grid c7">
          {WD_LETTER[LANG].map((l, i) => <span key={'w' + i}>{l}</span>)}
          {Array.from({ length: lead }, (_, i) => <i key={'b' + i} />)}
          {Array.from({ length: dim }, (_, i) => i + 1).map((d) => {
            const s = `${y}-${pad(m + 1)}-${pad(d)}`;
            return <button key={d} className={(s === value ? 'on' : '') + (s === today ? ' now' : '')} onClick={() => pick(d)}>{d}</button>;
          })}
        </div>
      )}
      <div className="sh-foot">
        <button className="btn grow" onClick={() => { onPick(today); onClose(); }}>{t('today')}</button>
      </div>
    </Sheet>
  );
}

/* ============ Splash ============ */
/* resta finché non si tocca lo schermo; si spegne dalle impostazioni */
function Splash({ onDone }) {
  const [out, setOut] = useState(false);
  const go = () => { if (out) return; setOut(true); setTimeout(onDone, 300); };
  useEffect(() => {
    const k = (e) => { if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') go(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  });
  return (
    <div className={'splash' + (out ? ' out' : '')} onClick={go}>
      <div className="sp-mid">
        <Mark size={128} anim dark={isDark()} />
        <div className="sp-word">hora</div>
        <div className="sp-sub">{t('splashSub')}</div>
      </div>
      <div className="sp-foot">
        <span className="sp-tap"><UIcon n="tap" size={16} />{t('tapToEnter')}</span>
        <b>nautargo</b>
      </div>
    </div>
  );
}


/* ============ Griglia oraria: 1, 3 o 7 giorni ============ */
const SNAP = 15;
function layoutDay(list) {
  const ev = list.map((x) => ({ ...x, e: Math.max(x.e, x.s + 15) })).sort((a, b) => a.s - b.s || b.e - a.e);
  const out = [];
  let group = [], gEnd = -1;
  const flush = () => {
    const lanes = [];
    for (const x of group) { let i = lanes.findIndex((le) => le <= x.s); if (i < 0) { i = lanes.length; lanes.push(0); } lanes[i] = x.e; x.lane = i; }
    // ogni elemento si allarga nelle corsie libere alla sua destra
    const n = lanes.length;
    for (const x of group) {
      let span = 1;
      while (x.lane + span < n && !group.some((y) => y.lane === x.lane + span && y.s < x.e && y.e > x.s)) span++;
      x.n = n; x.span = span;
    }
    out.push(...group); group = [];
  };
  for (const x of ev) { if (group.length && x.s >= gEnd) { flush(); gEnd = -1; } group.push(x); gEnd = Math.max(gEnd, x.e); }
  if (group.length) flush();
  return out;
}
const gridBg = (h) => h >= 96
  ? { backgroundImage: 'linear-gradient(to bottom, #DDE2DF 1px, transparent 1px), linear-gradient(to bottom, #EEF0EE 1px, transparent 1px)', backgroundSize: `100% ${h}px, 100% ${h / 4}px` }
  : { backgroundImage: 'linear-gradient(to bottom, #DDE2DF 1px, transparent 1px)', backgroundSize: `100% ${h}px` };

const laneBox = (lane, nl, span) => ({ left: `calc(${(lane / nl) * 100}% + 1px)`, width: `calc(${(span / nl) * 100}% - 3px)` });
function EvBlock({ o, lane = 0, nl = 1, span = 1, box, start, end, hourH, cats, selected, ghost, faded, fixed }) {
  const tn = catTone(cats, o.it.cat);
  const top = (start / 60) * hourH, h = Math.max(((end - start) / 60) * hourH, 18);
  return (
    <div className={'ev' + (selected ? ' sel' : '') + (ghost ? ' ghost' : '') + (faded ? ' faded' : '') + (o.draft ? ' draft' : '')} data-key={ghost ? undefined : o.key}
      style={{ top, height: h, ...(box ? { left: box.left, width: box.width, zIndex: box.zIndex } : laneBox(lane, nl, span)), ...(selected ? { zIndex: 6 } : null), background: tn.tint, color: tn.ink, borderColor: tn.c }}>
      {box && box.mini
        ? <span className="mini">{box.more ? '...' : <Icon name={catIcon(cats, o.it.cat)} size={12} sw={2.2} />}</span>
        : box && box.cc
        ? <b>{o.it.title || t('noTitle')} <small>{fmtTime(start)}</small></b>
        : <><b>{o.it.title || t('noTitle')}</b>{h >= 34 && <span>{fmtTime(start)} - {fmtTime(end)}</span>}</>}
      {o.draft && h >= 50 && <span>{t('tapDetails')}</span>}
      {selected && !ghost && !fixed && <><i className="hd top" data-h="top" data-key={o.key} /><i className="hd bot" data-h="bottom" data-key={o.key} /></>}
      {ghost && o.it.type === 'evento' && <><i className="hd top vis" /><i className="hd bot vis" /></>}
    </div>
  );
}
function RemRow({ o, start, hourH, cats, onToggle, ghost, selected, faded, lane = 0, nl = 1, span = 1, box }) {
  const tn = catTone(cats, o.it.cat);
  const done = isDone(o.it, o.date);
  const only = !!o.it.onlyAlert;
  return (
    <div className={'rem' + (ghost ? ' ghost' : '') + (selected ? ' sel' : '') + (faded ? ' faded' : '') + (box && box.mini ? ' mini' : '')} data-key={ghost ? undefined : o.key} style={{ top: (start / 60) * hourH, ...(box ? { left: box.left, width: box.width, zIndex: box.zIndex } : laneBox(lane, nl, span)), ...(selected ? { zIndex: 6 } : null), borderColor: tn.c, background: tn.tint }}>
      {box && box.more ? <span className="mini">...</span> : only
        ? <span className="chk"><TypeShape type="promemoria" only color={tn.c} size={14} /></span>
        : <button className="chk" data-chk="1" aria-label={t('markDone') + ': ' + o.it.title} onClick={() => onToggle && onToggle(o.it, o.date)}>
            <TypeShape type="promemoria" color={tn.c} done={done} size={14} />
          </button>}
      {!(box && box.mini) && <span className={done && !only ? 'strike' : ''}>{o.it.title || t('noTitle')}</span>}
    </div>
  );
}
/* sveglia: riga spessa all'ora esatta */
function AlarmLine({ o, start, hourH, ghost, selected, faded }) {
  return (
    <div className={'alm' + (ghost ? ' ghost' : '') + (selected ? ' sel' : '') + (faded ? ' faded' : '')} data-key={ghost ? undefined : o.key} style={{ top: (start / 60) * hourH - 14 }}>
      <span><TypeShape type="sveglia" color="currentColor" size={10} /><em>{fmtTime(start)} {o.it.title || t('alarm')}</em></span><i />
    </div>
  );
}
const ALARM_C = 'var(--alarm)';
const Block = (p) => (p.o.it.type === 'evento' ? <EvBlock {...p} /> : p.o.it.type === 'sveglia' ? <AlarmLine {...p} /> : <RemRow {...p} />);

function GridView({ st, dates, anchor, sx, visN = 5, pass, newCat, sun, hourH, setHourH, commitHourH, onOpen, onSave, onToggle, onShift, onPinchDays, onSwipe, onVisible, onNewAt, nonce, draft, setDraft }) {
  const today = todayStr();
  const scRef = useRef(null), colsRef = useRef(null), topRef = useRef(null);
  const [sel, setSel] = useState(null);
  const [drag, setDrag] = useState(null);
  const [adDrag, setAdDrag] = useState(null);
  const [colW, setColW] = useState(0);
  const [headW, setHeadW] = useState(0);
  const from = dates[0], to = dates[dates.length - 1];
  const occ = useMemo(() => {
    const list = expand(st.items, from, to).filter((o) => pass(o.it));
    if (draft && draft.date >= from && draft.date <= to) {
      list.push({ it: { id: '__draft', type: 'evento', title: t('newItem'), date: draft.date, start: draft.start, end: draft.end, cat: newCat, repeat: NO_REPEAT }, date: draft.date, end: draft.date, key: '__draft@' + draft.date, draft: true });
    }
    return list;
  }, [st.items, from, to, pass, draft, newCat]);
  // un promemoria occupa nella corsia lo spazio della sua riga
  const remMin = Math.max(15, Math.ceil(((25 / hourH) * 60) / 15) * 15);
  const cols = useMemo(() => dates.map((d) => {
    const here = occ.filter((o) => o.date <= d && o.end >= d);
    const timed = here.filter((o) => o.it.start != null && o.it.type === 'evento' && (o.date === d || isTimedMulti(o.it)));
    const rems = here.filter((o) => o.it.start != null && o.date === d && o.it.type === 'promemoria');
    return {
      d,
      allday: here.filter((o) => o.it.start == null),
      // eventi e promemoria che si sovrappongono si dividono la colonna in corsie; eventi su più giorni: un tratto per giorno
      ev: layoutDay([
        ...timed.map((o) => ({ o, s: o.date === d ? o.it.start : 0, e: !isTimedMulti(o.it) ? o.it.end ?? o.it.start + 60 : o.end === d ? o.it.end ?? 0 : 1440 })),
        ...rems.map((o) => ({ o, s: o.it.start, e: Math.min(1440, o.it.start + remMin) }))
      ]),
      rem: here.filter((o) => o.it.start != null && o.date === d && o.it.type === 'sveglia')
    };
  }), [occ, dates, remMin]);

  const R = useRef({});
  R.current = { dates, anchor, sx, colW, occ, hourH, sel, draft, onOpen, onSave, onShift, onPinchDays, onSwipe, onVisible, onNewAt, setHourH, commitHourH, setSel, setDraft, setAdDrag };

  useLayoutEffect(() => {
    const el = scRef.current;
    if (!el) return;
    const target = dates.includes(today) ? Math.max(0, nowMin() - 90) : 7 * 60;
    el.scrollTop = (target / 60) * hourH;
  }, [nonce]);
  // larghezza di una colonna per l'intestazione su una riga
  useLayoutEffect(() => {
    const el = scRef.current;
    const m = () => { const g = el.querySelector('.g-hours'); setHeadW((el.clientWidth - (g ? g.offsetWidth : 46) - (sx ? 0 : 8)) / (sx ? visN : dates.length)); };
    m();
    window.addEventListener('resize', m);
    return () => window.removeEventListener('resize', m);
  }, [sx, visN, dates.length]);
  // scorrimento continuo: larghezza di colonna misurata e scorrimento orizzontale sul primo giorno visibile
  useLayoutEffect(() => {
    if (!sx) return;
    const el = scRef.current;
    const m = () => { const g = el.querySelector('.g-hours'); setColW(Math.max(44, (el.clientWidth - (g ? g.offsetWidth : 46)) / visN)); };
    m();
    window.addEventListener('resize', m);
    return () => window.removeEventListener('resize', m);
  }, [sx, visN]);
  useLayoutEffect(() => {
    if (sx && colW && scRef.current) scRef.current.scrollLeft = Math.max(0, diffDays(from, anchor)) * colW;
  }, [sx, colW, from, anchor]);

  useEffect(() => {
    const el = scRef.current;
    let lp = null, dg = null, pinch = null, edge = null, auto = null, md = null, wt = null, sw = null, scT = null, hp = null, adp = null, adg = null;
    let last = { x: 0, y: 0 }, lastTouch = 0;
    const geo = () => { const r = colsRef.current.getBoundingClientRect(); const n = R.current.dates.length; return { r, w: r.width / n, n }; };
    const minAt = (y) => ((y - geo().r.top) / R.current.hourH) * 60;
    const colAt = (x) => { const { r, w, n } = geo(); return Math.max(0, Math.min(n - 1, Math.floor((x - r.left) / w))); };
    const snap = (m) => Math.round(m / SNAP) * SNAP;
    const findOcc = (key) => R.current.occ.find((o) => o.key === key);
    const clearEdge = () => { if (edge) clearTimeout(edge.timer); edge = null; };
    const onScroll = () => {
      if (!R.current.sx || dg) return;
      clearTimeout(scT);
      scT = setTimeout(() => {
        const cw = R.current.colW;
        const d = cw && R.current.dates[Math.round(el.scrollLeft / cw)];
        if (d && d !== R.current.anchor) R.current.onVisible(d);
      }, 160);
    };

    const update = (x, y) => {
      if (!dg) return;
      const m = minAt(y);
      if (dg.mode === 'move') {
        const s = Math.max(0, Math.min(1440 - Math.max(dg.dur, SNAP), snap(m - dg.off)));
        dg.start = s; dg.end = s + dg.dur; dg.col = colAt(x);
        const { r } = geo();
        const dir = R.current.sx ? 0 : x < r.left + 22 ? -1 : x > r.right - 22 ? 1 : 0;
        if (dir !== (edge ? edge.dir : 0)) {
          clearEdge();
          if (dir) {
            const fire = () => { if (!dg) return; R.current.onShift(dir); edge = { dir, timer: setTimeout(fire, 900) }; };
            edge = { dir, timer: setTimeout(fire, 650) };
          }
        }
      } else if (dg.mode === 'top') dg.start = Math.max(0, Math.min(dg.end - SNAP, snap(m)));
      else dg.end = Math.min(1440, Math.max(dg.start + SNAP, snap(m)));
      setDrag({ ...dg });
    };
    const tick = () => {
      if (!dg) return;
      const sr = el.getBoundingClientRect();
      const top = sr.top + (topRef.current ? topRef.current.offsetHeight : 0);
      let mv = false;
      if (last.y < top + 40) { el.scrollTop -= 8; mv = true; } else if (last.y > sr.bottom - 40) { el.scrollTop += 8; mv = true; }
      // 5 giorni: vicino al bordo la vista scorre invece di saltare
      if (R.current.sx && dg.mode === 'move') { if (last.x < sr.left + 70) { el.scrollLeft -= 10; mv = true; } else if (last.x > sr.right - 24) { el.scrollLeft += 10; mv = true; } }
      if (mv) update(last.x, last.y);
    };
    const begin = (mode, key, x, y) => {
      const o = findOcc(key);
      if (!o || isTimedMulti(o.it)) return;
      const it = o.it;
      const end = it.type === 'evento' ? it.end ?? it.start + 60 : it.start;
      const col = R.current.dates.indexOf(o.date);
      dg = { key, mode, col: col < 0 ? 0 : col, origCol: col < 0 ? 0 : col, start: it.start, end, dur: end - it.start, off: minAt(y) - it.start, orig: o };
      setDrag({ ...dg });
      R.current.setSel(key);
      try { if (navigator.vibrate) navigator.vibrate(8); } catch (e) { /* niente */ }
      auto = setInterval(tick, 30);
    };
    const finish = () => {
      clearInterval(auto); auto = null; clearEdge();
      if (!dg) return;
      const g = dg; dg = null;
      const o = g.orig, it = o.it;
      const newDate = R.current.dates[g.col] || o.date;
      setDrag(null);
      if (o.draft) {
        const nd = g.mode === 'move' ? newDate : o.date;
        R.current.setDraft({ date: nd, start: g.start, end: g.end });
        R.current.setSel('__draft@' + nd);
      } else {
        let next;
        if (g.mode === 'move') next = { ...shiftItem(it, diffDays(o.date, newDate)), start: g.start, end: it.type === 'evento' ? g.end : null };
        else next = { ...it, start: g.start, end: g.end };
        R.current.setSel(it.id + '@' + (g.mode === 'move' ? newDate : o.date));
        R.current.onSave(next, true);
      }
      onScroll();
    };
    const tap = (key, x, y, inCols) => {
      const o = key && findOcc(key);
      if (o && o.draft) { const d = R.current.draft; R.current.setDraft(null); R.current.setSel(null); R.current.onNewAt(d); return; }
      if (o) { R.current.onOpen(o); return; }
      if (R.current.sel) { R.current.setSel(null); if (R.current.draft) R.current.setDraft(null); return; }
      if (R.current.draft) { R.current.setDraft(null); return; }
      if (!inCols) return;
      // nuovo blocco di un'ora, dall'ora o mezz'ora toccata
      const m = minAt(y);
      if (m < 0 || m >= 1440) return;
      const s = Math.min(1380, Math.floor(m / 30) * 30), d = R.current.dates[colAt(x)];
      R.current.setDraft({ date: d, start: s, end: s + 60 });
      R.current.setSel('__draft@' + d);
    };
    const cancelLP = () => { if (lp && lp.timer) clearTimeout(lp.timer); lp = null; };
    /* elementi di tutto il giorno: pressione lunga (o trascinamento col mouse) e spostamento su un altro giorno */
    const adStart = (key, x) => { adg = { key, col0: colAt(x), delta: 0 }; R.current.setAdDrag({ key, delta: 0 }); try { if (navigator.vibrate) navigator.vibrate(8); } catch (e) { /* niente */ } };
    const adMove = (x) => { const dlt = colAt(x) - adg.col0; if (dlt !== adg.delta) { adg.delta = dlt; R.current.setAdDrag({ key: adg.key, delta: dlt }); } };
    const adEnd = () => {
      const g = adg; adg = null; R.current.setAdDrag(null);
      R.current.noClick = Date.now();
      const o = findOcc(g.key);
      if (o && g.delta) { R.current.onSave(shiftItem(o.it, g.delta), true); R.current.setSel(o.it.id + '@' + addDays(o.date, g.delta)); }
    };
    const cancelAD = () => { if (adp && adp.timer) clearTimeout(adp.timer); adp = null; };

    const onTS = (e) => {
      lastTouch = Date.now();
      if (e.touches.length === 2) {
        cancelLP(); sw = null;
        if (dg) return;
        const [a, b] = e.touches;
        const sr = el.getBoundingClientRect();
        pinch = { x0: Math.abs(a.clientX - b.clientX), y0: Math.abs(a.clientY - b.clientY), h0: R.current.hourH, axis: null, cy: (a.clientY + b.clientY) / 2 - sr.top, st0: el.scrollTop, done: false };
        e.preventDefault();
        return;
      }
      if (e.touches.length !== 1) return;
      const tc = e.touches[0];
      last = { x: tc.clientX, y: tc.clientY };
      sw = { x: tc.clientX, y: tc.clientY, t: Date.now() };
      if (e.target.closest('[data-chk]')) return;
      // maniglia: si trascina se il dito si muove, un tocco senza movimento apre l'elemento
      const h = e.target.closest('[data-h]');
      if (h) { e.preventDefault(); hp = { mode: h.dataset.h, key: h.dataset.key, x: tc.clientX, y: tc.clientY }; return; }
      const ad = e.target.closest('[data-ad]');
      if (ad) { const k = ad.dataset.ad, x0 = tc.clientX; adp = { x: tc.clientX, y: tc.clientY, timer: setTimeout(() => { adp = null; adStart(k, x0); }, 380) }; return; }
      const evEl = e.target.closest('[data-key]');
      // elemento già selezionato: si sposta subito, senza pressione lunga
      lp = { x: tc.clientX, y: tc.clientY, t: Date.now(), key: evEl ? evEl.dataset.key : null, inCols: !!e.target.closest('.g-cols'), sel: !!evEl && evEl.dataset.key === R.current.sel };
      if (evEl) lp.timer = setTimeout(() => { if (lp) { const k = lp.key, sx0 = lp.x, sy0 = lp.y; lp = null; begin('move', k, sx0, sy0); update(last.x, last.y); } }, 380);
    };
    const onTM = (e) => {
      if (pinch && e.touches.length === 2) {
        e.preventDefault();
        const [a, b] = e.touches;
        const dx = Math.abs(a.clientX - b.clientX), dy = Math.abs(a.clientY - b.clientY);
        if (!pinch.axis && (Math.abs(dx - pinch.x0) > 24 || Math.abs(dy - pinch.y0) > 24)) pinch.axis = Math.abs(dx - pinch.x0) > Math.abs(dy - pinch.y0) ? 'h' : 'v';
        if (pinch.axis === 'v') {
          const h = Math.max(24, Math.min(160, (pinch.h0 * dy) / Math.max(pinch.y0, 40)));
          R.current.setHourH(h);
          el.scrollTop = (pinch.st0 + pinch.cy) * (h / pinch.h0) - pinch.cy;
        } else if (pinch.axis === 'h' && !pinch.done) {
          const r = dx / Math.max(pinch.x0, 40);
          if (r < 0.7) { pinch.done = true; R.current.onPinchDays(1); } else if (r > 1.45) { pinch.done = true; R.current.onPinchDays(-1); }
        }
        return;
      }
      const tc = e.touches[0];
      if (!tc) return;
      last = { x: tc.clientX, y: tc.clientY };
      if (dg) { e.preventDefault(); update(tc.clientX, tc.clientY); return; }
      if (adg) { e.preventDefault(); adMove(tc.clientX); return; }
      if (adp && (Math.abs(tc.clientX - adp.x) > 8 || Math.abs(tc.clientY - adp.y) > 8)) cancelAD();
      if (hp && (Math.abs(tc.clientX - hp.x) > 4 || Math.abs(tc.clientY - hp.y) > 4)) { e.preventDefault(); const h0 = hp; hp = null; begin(h0.mode, h0.key, h0.x, h0.y); update(tc.clientX, tc.clientY); return; }
      if (lp && lp.sel && lp.key && (Math.abs(tc.clientX - lp.x) > 6 || Math.abs(tc.clientY - lp.y) > 6)) {
        e.preventDefault();
        const l = lp; cancelLP();
        begin('move', l.key, l.x, l.y); update(tc.clientX, tc.clientY);
        return;
      }
      if (lp && (Math.abs(tc.clientX - lp.x) > 8 || Math.abs(tc.clientY - lp.y) > 8)) cancelLP();
    };
    const onTE = (e) => {
      if (pinch) { if (e.touches.length < 2) { if (pinch.axis === 'v') R.current.commitHourH(); pinch = null; } return; }
      if (dg) { e.preventDefault(); finish(); sw = null; return; }
      if (adg) { e.preventDefault(); adEnd(); sw = null; return; }
      if (adp) { cancelAD(); sw = null; return; }
      if (hp) { e.preventDefault(); const h0 = hp; hp = null; sw = null; tap(h0.key, h0.x, h0.y, true); return; }
      if (lp) {
        const l = lp, quick = Date.now() - lp.t < 380;
        cancelLP(); sw = null;
        if (quick) { e.preventDefault(); tap(l.key, l.x, l.y, l.inCols); }
        return;
      }
      // scorrimento laterale: periodo precedente o successivo (non nei 5 giorni, che scorrono da soli)
      if (sw && !R.current.sx) {
        const dx = last.x - sw.x, dy = last.y - sw.y;
        if (Math.abs(dx) > 60 && Math.abs(dx) > 1.6 * Math.abs(dy) && Date.now() - sw.t < 700) R.current.onSwipe(dx < 0 ? 1 : -1);
      }
      sw = null;
    };
    const onMD = (e) => {
      if (Date.now() - lastTouch < 800 || e.button !== 0) return;
      if (e.target.closest('[data-chk]')) return;
      last = { x: e.clientX, y: e.clientY };
      const h = e.target.closest('[data-h]');
      if (h) { e.preventDefault(); md = { x: e.clientX, y: e.clientY, key: h.dataset.key, h: h.dataset.h, inCols: true }; return; }
      const ad = e.target.closest('[data-ad]');
      if (ad) { md = { x: e.clientX, y: e.clientY, ad: ad.dataset.ad }; return; }
      const evEl = e.target.closest('[data-key]');
      md = { x: e.clientX, y: e.clientY, key: evEl ? evEl.dataset.key : null, inCols: !!e.target.closest('.g-cols') };
      if (evEl) e.preventDefault();
    };
    const onMM = (e) => {
      last = { x: e.clientX, y: e.clientY };
      if (dg) { update(e.clientX, e.clientY); return; }
      if (adg) { adMove(e.clientX); return; }
      if (md && (md.key || md.ad) && (Math.abs(e.clientX - md.x) > 4 || Math.abs(e.clientY - md.y) > 4)) {
        const m0 = md; md = null;
        if (m0.ad) { adStart(m0.ad, m0.x); adMove(e.clientX); return; }
        begin(m0.h || 'move', m0.key, m0.x, m0.y); update(e.clientX, e.clientY);
      }
    };
    const onMU = () => {
      if (dg) { finish(); return; }
      if (adg) { adEnd(); return; }
      if (md) { const m0 = md; md = null; if (!m0.ad) tap(m0.key, m0.x, m0.y, m0.inCols); }
    };
    const onWheel = (e) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      const sr = el.getBoundingClientRect();
      const cy = e.clientY - sr.top, h0 = R.current.hourH;
      const h = Math.max(24, Math.min(160, h0 * (1 - e.deltaY * 0.01)));
      R.current.setHourH(h);
      el.scrollTop = (el.scrollTop + cy) * (h / h0) - cy;
      clearTimeout(wt); wt = setTimeout(() => R.current.commitHourH(), 400);
    };
    el.addEventListener('touchstart', onTS, { passive: false });
    el.addEventListener('touchmove', onTM, { passive: false });
    el.addEventListener('touchend', onTE, { passive: false });
    el.addEventListener('touchcancel', onTE, { passive: false });
    el.addEventListener('mousedown', onMD);
    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('mousemove', onMM);
    window.addEventListener('mouseup', onMU);
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      clearInterval(auto); clearEdge(); cancelLP(); cancelAD(); clearTimeout(scT);
      el.removeEventListener('touchstart', onTS); el.removeEventListener('touchmove', onTM);
      el.removeEventListener('touchend', onTE); el.removeEventListener('touchcancel', onTE);
      el.removeEventListener('mousedown', onMD); el.removeEventListener('scroll', onScroll);
      window.removeEventListener('mousemove', onMM); window.removeEventListener('mouseup', onMU);
      el.removeEventListener('wheel', onWheel);
    };
  }, []);

  const n = dates.length;
  const nm = nowMin();
  /* più elementi alla stessa ora: affiancati se c'è spazio, altrimenti a cascata (ognuno lascia vedere l'inizio del precedente) */
  const colPx = headW > 0 ? headW : 0;
  /* colonne strette (5 e 7 giorni sul telefono): solo l'icona colorata, al massimo 3 per fascia, poi "..." */
  const narrow = colPx > 0 && colPx < 60;
  const boxOf = (x) => {
    if (narrow) {
      const k = Math.min(x.n, 3);
      if (x.lane >= 3) return null;
      return { ...laneBox(x.lane, k, x.n <= 3 ? x.span : 1), mini: true, more: x.n > 3 && x.lane === 2 };
    }
    if (x.n === 1 || colPx / x.n >= 84) return laneBox(x.lane, x.n, x.span);
    const step = Math.max(10, Math.min(28, (colPx - 64) / (x.n - 1)));
    const left = x.lane * step;
    return { left: `${left + 1}px`, width: `calc(100% - ${left + 3}px)`, zIndex: 1 + x.lane, cc: true };
  };
  /* tutto il giorno: barre continue sui giorni che coprono, su righe libere */
  const adRows = useMemo(() => {
    const seen = new Set(), bars = [], rows = [];
    for (const c of cols) for (const o of c.allday) {
      if (seen.has(o.key)) continue;
      seen.add(o.key);
      const i = Math.max(0, diffDays(dates[0], o.date)), j = Math.min(dates.length - 1, diffDays(dates[0], o.end));
      bars.push({ o, i, j });
    }
    bars.sort((a, b) => a.i - b.i || b.j - b.i - (a.j - a.i));
    for (const b of bars) { let r = rows.findIndex((end) => end < b.i); if (r < 0) { r = rows.length; rows.push(-1); } rows[r] = b.j; b.r = r; }
    return { bars, n: rows.length };
  }, [cols, dates]);
  const showAllday = cols.some((c) => c.allday.length);
  const cw = sx ? { width: colW, flex: 'none' } : undefined;
  const sunY = sun ? [sun.rise, sun.set].map((m) => (m / 60) * hourH) : [];
  /* celle orarie: un rettangolo arrotondato per ogni ora */
  const slots = useMemo(() => Array.from({ length: 24 }, (_, h) => <i key={'s' + h} className="slot" style={{ top: h * hourH + 1.5, height: hourH - 3 }} />), [hourH]);
  return (
    <div className={'grid' + (sx ? ' sx' : '') + (narrow ? ' narrow' : '')}>
      <div className={'g-scroll' + (drag ? ' dragging' : '')} ref={scRef}>
        <div className="g-wide" style={sx ? { width: `calc(var(--gut) + ${n * colW}px)` } : undefined}>
          {(
            <div className="g-top" ref={topRef}>
              {(
                <div className="g-head">
                  <span className="g-gut" />
                  {dates.map((d) => (
                    <div key={d} style={cw} className={'g-day' + (d === today ? ' today' : '') + (wd(d) > 4 ? ' we' : '') + (headW > 0 && headW < 92 ? ' xs' : '')}><span>{fmtHead(d, headW)}</span></div>
                  ))}
                </div>
              )}
              {showAllday && (
                <div className="g-allday">
                  <span className="g-gut small">{t('allDayShort')}</span>
                  <div className="ad-area" style={{ height: adRows.n * 25 + 2, ...(sx ? { width: n * colW, flex: 'none' } : null) }}>
                    {adRows.bars.map(({ o, i, j, r }) => {
                      const tn = catTone(st.cats, o.it.cat);
                      const done = isDone(o.it, o.date);
                      const dl = adDrag && adDrag.key === o.key ? adDrag.delta : 0;
                      return (
                        <button key={o.key} data-ad={o.key} className={'ad-chip' + (o.date < dates[0] ? ' cut-l' : '') + (o.end > dates[n - 1] ? ' cut-r' : '') + (adDrag && adDrag.key === o.key ? ' lift' : '')}
                          onClick={() => { if (Date.now() - (R.current.noClick || 0) > 500) onOpen(o); }}
                          style={{ top: r * 25, left: `calc(${((i + dl) / n) * 100}% + 1px)`, width: `calc(${((j - i + 1) / n) * 100}% - 3px)`, background: tn.tint, color: tn.ink, borderColor: tn.c }}>
                          {o.it.type === 'promemoria' && <TypeShape type="promemoria" only={o.it.onlyAlert} color={tn.c} done={done} size={10} />}
                          <span className={done && !o.it.onlyAlert ? 'strike' : ''}>{o.it.title || t('noTitle')}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="g-body" style={{ height: 24 * hourH }}>
            <div className="g-hours">
              {Array.from({ length: 24 }, (_, h) => (h > 0 && !sunY.some((y) => Math.abs(y - h * hourH) < 18) ? <span key={h} style={{ top: h * hourH }}>{h}:00</span> : null))}
              {sun && <span className="sunl" style={{ top: sunY[0] }} title={t('sunrise')}>↑{fmtTime(sun.rise)}</span>}
              {sun && <span className="sunl" style={{ top: sunY[1] }} title={t('sunset')}>↓{fmtTime(sun.set)}</span>}
            </div>
            <div className="g-cols" ref={colsRef}>
              {sun && <div className="night" style={{ top: 0, height: sunY[0] }} aria-hidden="true" />}
              {sun && <div className="night" style={{ top: sunY[1], bottom: 0 }} aria-hidden="true" />}
              {sun && sunY.map((y, i) => <div key={i} className="sun" style={{ top: y }} aria-hidden="true" />)}
              {cols.map((c, ci) => {
                // un solo elenco con chiavi stabili: l'elemento toccato resta nel DOM anche se il giorno cambia durante il trascinamento
                const blocks = [
                  ...c.ev.filter((x) => boxOf(x) || (drag && drag.key === x.o.key)).map((x) => <Block key={x.o.key} o={x.o} box={boxOf(x)} start={x.s} end={x.e} hourH={hourH} cats={st.cats} onToggle={onToggle} selected={sel === x.o.key} faded={!!drag && drag.key === x.o.key} fixed={isTimedMulti(x.o.it)} />),
                  ...c.rem.map((o) => <Block key={o.key} o={o} start={o.it.start} hourH={hourH} cats={st.cats} onToggle={onToggle} selected={sel === o.key} faded={!!drag && drag.key === o.key} />)
                ];
                if (drag && drag.origCol === ci && !blocks.some((b) => b.key === drag.key)) {
                  const oi = drag.orig.it;
                  blocks.push(<Block key={drag.key} o={drag.orig} start={oi.start} end={oi.end ?? oi.start + 60} hourH={hourH} cats={st.cats} faded />);
                }
                return (
                  <div key={ci} style={cw} className={'g-col' + (c.d === today ? ' today' : '') + (wd(c.d) > 4 ? ' we' : '')}>
                    {slots}
                    {blocks}
                    {drag && drag.col === ci && <Block o={drag.orig} start={drag.start} end={drag.end} hourH={hourH} cats={st.cats} ghost selected />}
                    {drag && drag.col === ci && <div className="drag-time" style={{ top: (drag.start / 60) * hourH }}>{fmtTime(drag.start)}</div>}
                    {c.d === today && <div className="now" style={{ top: (nm / 60) * hourH }} />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ Mese ============ */
const M_WEEKS = 26;
function MonthView({ st, anchor, pass, titles, setTitles, free, onSelect, onOpen, onToggle, onOpenDay, onPinchOut, onSwipe, onVisible }) {
  const today = todayStr();
  const ms = monthStart(anchor);
  // a scorrimento continuo: mezzo anno di settimane prima e dopo il mese guardato
  const gStart = free ? addDays(startOfWeek(ms), -7 * M_WEEKS) : startOfWeek(ms);
  const gEnd = free ? addDays(startOfWeek(ms), 7 * (M_WEEKS + 6) - 1) : addDays(startOfWeek(addDays(addMonths(ms, 1), -1)), 6);
  const days = useMemo(() => { const a = []; for (let d = gStart; d <= gEnd; d = addDays(d, 1)) a.push(d); return a; }, [gStart, gEnd]);
  const byDay = useMemo(() => {
    const m = {};
    for (const d of days) m[d] = [];
    for (const o of expand(st.items, gStart, gEnd)) {
      if (!pass(o.it)) continue;
      for (let d = o.date; d <= o.end; d = addDays(d, 1)) if (m[d]) m[d].push(o);
    }
    for (const d in m) m[d].sort((a, b) => (a.it.start ?? -1) - (b.it.start ?? -1));
    return m;
  }, [st.items, days, pass]);
  const ref = useRef(null), scRef = useRef(null);
  const lastTap = useRef({ d: null, t: 0 });
  const R = useRef({});
  R.current = { setTitles, onPinchOut, onSwipe, titles, onVisible, gStart, ms };
  // scorrimento continuo: la settimana in alto resta ferma quando cambia il mese guardato
  const keep = useRef(null);
  const rowH = () => { const c = scRef.current && scRef.current.querySelector('.m-cell'); return (c && c.offsetHeight) ? c.offsetHeight + 4 : titles ? 90 : 56; };
  const topWeek = () => addDays(gStart, 7 * Math.round(scRef.current.scrollTop / rowH()));
  useLayoutEffect(() => {
    const el = scRef.current;
    if (!free || !el) return;
    const tw = keep.current || startOfWeek(ms);
    keep.current = null;
    el.scrollTop = (diffDays(gStart, tw) / 7) * rowH();
  }, [free, gStart, titles]);
  useEffect(() => {
    const el = scRef.current;
    if (!free || !el) return;
    let tm = null;
    const on = () => {
      clearTimeout(tm);
      tm = setTimeout(() => {
        const h = rowH(), tw = addDays(R.current.gStart, 7 * Math.round(el.scrollTop / h));
        const mid = addDays(tw, 17);
        if (mid.slice(0, 7) !== R.current.ms.slice(0, 7)) { keep.current = tw; R.current.onVisible(mid); }
      }, 160);
    };
    el.addEventListener('scroll', on, { passive: true });
    return () => { clearTimeout(tm); el.removeEventListener('scroll', on); };
  }, [free]);
  useEffect(() => {
    const el = ref.current;
    let p = null, sw = null, last = null;
    const ts = (e) => {
      if (e.touches.length === 1) { sw = { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() }; last = { ...sw }; return; }
      sw = null;
      if (e.touches.length !== 2) return;
      const [a, b] = e.touches;
      p = { x0: Math.abs(a.clientX - b.clientX), y0: Math.abs(a.clientY - b.clientY), axis: null, done: false };
      e.preventDefault();
    };
    const tm = (e) => {
      if (sw && e.touches.length === 1) last = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      if (!p || e.touches.length !== 2) return;
      e.preventDefault();
      const [a, b] = e.touches;
      const dx = Math.abs(a.clientX - b.clientX), dy = Math.abs(a.clientY - b.clientY);
      if (!p.axis && (Math.abs(dx - p.x0) > 24 || Math.abs(dy - p.y0) > 24)) p.axis = Math.abs(dx - p.x0) > Math.abs(dy - p.y0) ? 'h' : 'v';
      if (p.done || !p.axis) return;
      if (p.axis === 'h' && dx / Math.max(p.x0, 40) > 1.45) { p.done = true; R.current.onPinchOut(); }
      if (p.axis === 'v') {
        const r = dy / Math.max(p.y0, 40);
        if (r > 1.3) { p.done = true; R.current.setTitles(true); } else if (r < 0.77) { p.done = true; R.current.setTitles(false); }
      }
    };
    const te = (e) => {
      if (e.touches.length < 2) p = null;
      if (sw && last && !e.touches.length) {
        const dx = last.x - sw.x, dy = last.y - sw.y;
        if (Math.abs(dx) > 60 && Math.abs(dx) > 1.6 * Math.abs(dy) && Date.now() - sw.t < 700) R.current.onSwipe(dx < 0 ? 1 : -1);
        sw = null;
      }
    };
    const wh = (e) => { if (!e.ctrlKey) return; e.preventDefault(); if (e.deltaY < -2) R.current.setTitles(true); else if (e.deltaY > 2) R.current.setTitles(false); };
    el.addEventListener('touchstart', ts, { passive: false });
    el.addEventListener('touchmove', tm, { passive: false });
    el.addEventListener('touchend', te);
    el.addEventListener('wheel', wh, { passive: false });
    return () => { el.removeEventListener('touchstart', ts); el.removeEventListener('touchmove', tm); el.removeEventListener('touchend', te); el.removeEventListener('wheel', wh); };
  }, []);
  // un tocco seleziona il giorno (e il + crea lì), il doppio tocco lo apre
  const tapDay = (d) => {
    const now = Date.now(), lt = lastTap.current;
    lastTap.current = { d, t: now };
    if (lt.d === d && now - lt.t < 380) { lastTap.current = { d: null, t: 0 }; onOpenDay(d); return; }
    if (free && scRef.current) keep.current = topWeek();
    onSelect(d);
  };
  const list = byDay[anchor] || [];
  /* celle strette: niente titoli illeggibili, solo le icone colorate (al massimo 3, poi "...") */
  const [cellW, setCellW] = useState(0);
  useLayoutEffect(() => {
    const m = () => { const el = ref.current; if (el) setCellW((el.clientWidth - 24) / 7); };
    m();
    window.addEventListener('resize', m);
    return () => window.removeEventListener('resize', m);
  }, []);
  const showTitles = titles && cellW >= 72;
  const mark = (o) => {
    const tn = catTone(st.cats, o.it.cat);
    return o.it.type === 'promemoria'
      ? <TypeShape key={o.key} type="promemoria" only={o.it.onlyAlert} done={isDone(o.it, o.date)} color={tn.c} size={11} />
      : <Icon key={o.key} name={catIcon(st.cats, o.it.cat)} size={12} sw={2.2} color={tn.c} />;
  };
  return (
    <div className="month" ref={ref}>
      <div className="m-wd">{WD_LETTER[LANG].map((l, i) => <span key={i}>{l}</span>)}</div>
      <div className={free ? 'm-scroll' + (titles ? ' titles' : '') : 'm-fix'} ref={scRef}>
      <div className={'m-grid' + (titles ? ' titles' : '')}>
        {days.map((d) => {
          const its = (byDay[d] || []).filter((o) => o.it.type !== 'sveglia');
          const out = d.slice(0, 7) !== ms.slice(0, 7);
          return (
            <button key={d} className={'m-cell' + (out ? ' out' : '') + (d === anchor ? ' sel' : '') + (wd(d) > 4 ? ' we' : '')} aria-label={fmtFull(d)} onClick={() => tapDay(d)}>
              {free && dnum(d) === 1 && <span className="m-mo">{mab(d)}</span>}
              <span className={'m-n' + (d === today ? ' today' : '')}>{dnum(d)}</span>
              {showTitles ? (
                <span className="m-tl">
                  {its.slice(0, 3).map((o) => { const tn = catTone(st.cats, o.it.cat); return <span key={o.key} style={{ background: tn.tint, color: tn.ink, borderLeftColor: tn.c }}>{o.it.title}</span>; })}
                  {its.length > 3 && <em>+{its.length - 3}</em>}
                </span>
              ) : (
                <span className={'m-ics' + (titles ? ' col' : '')}>
                  {its.slice(0, 3).map(mark)}
                  {its.length > 3 && <em>...</em>}
                </span>
              )}
            </button>
          );
        })}
      </div>
      </div>
      <div className="m-list">
        <div className="m-lh">
          <h2>{fmtDayLong(anchor)}</h2>
          <button className="lnk" onClick={() => onOpenDay(anchor)}>{t('openDay')}</button>
        </div>
        {!list.length && <p className="muted pad">{t('empty')}</p>}
        {list.map((o) => {
          const it = o.it, tn = it.type === 'sveglia' ? { c: ALARM_C } : catTone(st.cats, it.cat);
          const done = isDone(it, o.date);
          const check = it.type === 'promemoria' && !it.onlyAlert;
          return (
            <div key={o.key} className="m-row">
              <span className="m-time">{it.start != null && (o.date === anchor) ? fmtTime(it.start) : it.start != null ? '' : t('allDayShort')}</span>
              {check
                ? <button className="chk" aria-label={t('markDone') + ': ' + it.title} onClick={() => onToggle(it, o.date)}><TypeShape type="promemoria" color={tn.c} done={done} size={15} /></button>
                : <span className="chk"><TypeShape type={it.type} only={it.onlyAlert} color={tn.c} size={it.type === 'evento' ? 13 : 15} /></span>}
              <button className="m-open" onClick={() => onOpen(o)}>
                <span className={done && check ? 'strike' : ''}>{it.title || (it.type === 'sveglia' ? t('alarm') : t('noTitle'))}</span>
                <small>{it.type === 'sveglia' ? (it.repeat && it.repeat.f !== 'none' ? repText(it.repeat) : t('alarm')) : catLabel(st.cats, it.cat)}</small>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}


/* ============ Attività (gantt) ============ */
const LW = 150;
function Diamond({ x, c, size = 14 }) {
  return <svg className="gm" width={size} height={size} viewBox="0 0 16 16" style={{ left: x - size / 2 }} aria-hidden="true"><path d="M8 1l7 7-7 7-7-7z" fill={c} /></svg>;
}
function Dot({ x, c, done, size = 13 }) {
  return <svg className="gm" width={size} height={size} viewBox="0 0 14 14" style={{ left: x - size / 2 }} aria-hidden="true"><circle cx="7" cy="7" r="5" style={{ fill: done ? c : 'var(--card)' }} stroke={c} strokeWidth="2.2" /></svg>;
}
/* scorrimento infinito: una finestra larga attorno alla data guardata, che si ricentra quando ci si avvicina ai bordi */
const G_WEEKS = 52, G_MONTHS = 48, DW = 20, MW = 64;
function GanttView({ st, anchor, scale, setScale, onOpenItem, onCats, onRecenter, onRange, nonce }) {
  const today = todayStr();
  const [open, setOpen] = useState(() => new Set());
  const scRef = useRef(null), keep = useRef(null);
  const geo = useMemo(() => {
    if (scale === 'week') {
      const from = addDays(startOfWeek(anchor), -7 * (G_WEEKS / 2)), n = G_WEEKS * 7;
      return { from, to: addDays(from, n - 1), W: n * DW, x: (d) => diffDays(from, d) * DW, at: (x) => addDays(from, Math.floor(x / DW)) };
    }
    const from = addMonths(monthStart(anchor), -G_MONTHS / 2);
    const fy = +from.slice(0, 4), fm = +from.slice(5, 7);
    return {
      from, to: addDays(addMonths(from, G_MONTHS), -1), W: G_MONTHS * MW,
      x: (d) => ((+d.slice(0, 4) - fy) * 12 + (+d.slice(5, 7) - fm)) * MW + ((dnum(d) - 1) / daysInMonth(d)) * MW,
      at: (x) => { const m = addMonths(from, Math.floor(x / MW)); return m.slice(0, 8) + pad(Math.min(daysInMonth(m), 1 + Math.floor(((x % MW) / MW) * daysInMonth(m)))); }
    };
  }, [scale, anchor]);
  const { from, to, W } = geo;
  const X = (d) => Math.max(0, Math.min(W, geo.x(d)));
  const XE = (d) => Math.max(0, Math.min(W, geo.x(addDays(d, 1))));
  const R = useRef({});
  R.current = { geo, onRecenter, onRange };
  const report = () => {
    const el = scRef.current;
    if (!el) return;
    const g = R.current.geo, w = Math.max(60, el.clientWidth - LW);
    R.current.onRange(g.at(el.scrollLeft), g.at(Math.min(g.W - 1, el.scrollLeft + w)));
  };
  // Oggi, Vai a data, cambio di scala: la data guardata a sinistra; ricentro: la vista resta ferma
  useLayoutEffect(() => {
    const el = scRef.current;
    if (!el) return;
    if (keep.current) { el.scrollLeft = geo.x(keep.current.d) - keep.current.off; keep.current = null; }
    else el.scrollLeft = Math.max(0, geo.x(anchor) - 40);
    report();
  }, [nonce, scale, from]);
  useEffect(() => {
    const el = scRef.current;
    let tm = null;
    const on = () => {
      clearTimeout(tm);
      tm = setTimeout(() => {
        report();
        const g = R.current.geo, w = el.clientWidth - LW;
        if (el.scrollLeft < g.W * 0.2 || el.scrollLeft + w > g.W * 0.8) {
          const d = g.at(el.scrollLeft + w / 2);
          keep.current = { d, off: g.x(d) - el.scrollLeft };
          R.current.onRecenter(d);
        }
      }, 140);
    };
    el.addEventListener('scroll', on, { passive: true });
    return () => { clearTimeout(tm); el.removeEventListener('scroll', on); };
  }, []);

  const occ = useMemo(() => expand(st.items.filter((it) => it.type !== 'sveglia'), from, to), [st.items, from, to]);
  const rows = useMemo(() => {
    const out = [];
    const tops = st.cats.filter((c) => !c.parent).sort(byOrder);
    const itemRows = (list, level) => {
      const m = new Map();
      for (const o of list) { if (!m.has(o.it.id)) m.set(o.it.id, { kind: 'item', it: o.it, occ: [], level }); m.get(o.it.id).occ.push(o); }
      return [...m.values()].sort((a, b) => (a.occ[0].date < b.occ[0].date ? -1 : 1));
    };
    for (const top of tops) {
      if (!top.gantt) continue;
      const subs = st.cats.filter((c) => c.parent === top.id && c.gantt).sort(byOrder);
      const direct = occ.filter((o) => o.it.cat === top.id);
      const subOcc = subs.map((s) => occ.filter((o) => o.it.cat === s.id));
      out.push({ kind: 'cat', id: top.id, level: 0, occ: [...direct, ...subOcc.flat()] });
      if (!open.has(top.id)) continue;
      subs.forEach((s, i) => {
        out.push({ kind: 'cat', id: s.id, level: 1, occ: subOcc[i] });
        if (open.has(s.id)) out.push(...itemRows(subOcc[i], 2));
      });
      out.push(...itemRows(direct, 1));
    }
    if (st.settings.ganttUnassigned) {
      const none = occ.filter((o) => !o.it.cat || !catOf(st.cats, o.it.cat));
      if (none.length || st.items.some((it) => !it.cat && it.type !== 'sveglia')) {
        out.push({ kind: 'cat', id: '__none', level: 0, occ: none });
        if (open.has('__none')) out.push(...itemRows(none, 1));
      }
    }
    return out;
  }, [st.cats, st.items, st.settings.ganttUnassigned, occ, open]);

  const toggle = (id) => setOpen((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const anyOpen = open.size > 0;
  const allIds = [...st.cats.map((c) => c.id), '__none'];

  // intestazione
  const head = [];
  if (scale === 'week') {
    for (let d = from; d <= to; d = addDays(d, 1)) {
      const x = geo.x(d);
      if (dnum(d) === 1 || d === from) head.push(<span key={'m' + d} className="gh-m" style={{ left: x + 2 }}>{MONTHS[LANG][mnum(d)].slice(0, 3)} {d.slice(2, 4)}</span>);
      head.push(<span key={d} className={'gh-d' + (d === today ? ' today' : '') + (wd(d) > 4 ? ' we' : '')} style={{ left: x, width: DW }}><i>{WD_LETTER[LANG][wd(d)]}</i>{dnum(d)}</span>);
    }
  } else {
    for (let m = from; m <= to; m = addMonths(m, 1)) {
      const x = geo.x(m);
      head.push(<span key={m} className={'gh-mm' + (m.slice(0, 7) === today.slice(0, 7) ? ' today' : '')} style={{ left: x, width: MW }}><i>{m.slice(5, 7) === '01' || m === from ? m.slice(0, 4) : ' '}</i>{MONTHS[LANG][mnum(m)].slice(0, 3)}</span>);
    }
  }
  const bg = [];
  if (scale === 'week') {
    for (let d = from; d <= to; d = addDays(d, 1)) if (wd(d) === 5) bg.push(<i key={d} className="gb-we" style={{ left: geo.x(d), width: 2 * DW }} />);
  } else {
    let k = 0;
    for (let m = from; m <= to; m = addMonths(m, 1), k++) if (k % 2) bg.push(<i key={m} className="gb-we" style={{ left: geo.x(m), width: MW }} />);
  }
  const todayX = today >= from && today <= to ? (scale === 'week' ? geo.x(today) + DW / 2 : geo.x(today)) : null;

  const marker = (o, tn, done) => {
    const it = o.it;
    if (o.end > o.date) {
      const l = X(o.date), w = XE(o.end) - l;
      return w > 0 ? <span key={o.key} className="gbar item" style={{ left: l, width: w, background: tn.tint, borderColor: tn.c }} /> : null;
    }
    if (o.date < from || o.date > to) return null;
    const cx = (X(o.date) + XE(o.date)) / 2;
    return it.type === 'promemoria' ? <Dot key={o.key} x={cx} c={tn.c} done={done} /> : <Diamond key={o.key} x={cx} c={tn.c} />;
  };

  return (
    <div className="gantt">
      <div className="gt-tools">
        <div className="seg sm" role="group" aria-label={t('gantt')}>
          <button className={scale === 'week' ? 'on' : ''} onClick={() => setScale('week')}>{t('weeks')}</button>
          <button className={scale === 'month' ? 'on' : ''} onClick={() => setScale('month')}>{t('months')}</button>
        </div>
        <div className="row-c">
          <button className="pill" onClick={onCats}><Icon name="tag" size={15} sw={2} />{t('categories')}</button>
          <button className="ib" aria-label={anyOpen ? t('closeAll') : t('openAll')} onClick={() => setOpen(anyOpen ? new Set() : new Set(allIds))}><UIcon n={anyOpen ? 'collapse' : 'expand'} /></button>
        </div>
      </div>
      <div className="gt-scroll" ref={scRef}>
        <div className="gt-inner" style={{ width: LW + W }}>
          <div className="gt-head" style={{ width: LW + W }}>
            <div className="gt-corner" style={{ width: LW }} />
            <div className="gt-hd" style={{ width: W }}>{head}</div>
          </div>
          <div className="gt-rows">
            <div className="gt-bg" style={{ left: LW, width: W }}>
              {bg}
              {todayX != null && <i className="gb-today" style={{ left: todayX - 1 }} />}
            </div>
            {rows.map((r) => {
              if (r.kind === 'cat') {
                const isNone = r.id === '__none';
                const c = isNone ? null : catOf(st.cats, r.id);
                const tn = isNone ? noneTone() : catTone(st.cats, r.id);
                const isOpen = open.has(r.id);
                let mark = null;
                if (r.occ.length) {
                  const a = r.occ.reduce((m, o) => (o.date < m ? o.date : m), r.occ[0].date);
                  const b = r.occ.reduce((m, o) => (o.end > m ? o.end : m), r.occ[0].end);
                  if (a === b) mark = <Diamond x={(X(a) + XE(a)) / 2} c={tn.c} size={15} />;
                  else { const l = X(a), w = XE(b) - l; if (w > 0) mark = <span className={'gbar cat lv' + r.level} style={{ left: l, width: w, background: tn.c }} />; }
                }
                return (
                  <div key={'c' + r.id} className={'gt-row cat lv' + r.level}>
                    <button className="gt-label" style={{ width: LW, paddingLeft: 6 + r.level * 14 }} aria-expanded={isOpen} onClick={() => toggle(r.id)}>
                      <UIcon n={isOpen ? 'down' : 'right'} size={13} sw={2.4} color="var(--muted)" />
                      {r.level === 0 ? (isNone ? <span className="tile none" style={{ width: 22, height: 22 }}><Icon name="tag" size={12} sw={2} /></span> : <CatTile cats={st.cats} id={r.id} size={22} />) : <span className="dot" style={{ background: tn.c }} />}
                      <span className="gl-t">{isNone ? t('unassigned') : c.name}</span>
                    </button>
                    <div className="gt-track" style={{ width: W }}>{mark}</div>
                  </div>
                );
              }
              const tn = catTone(st.cats, r.it.cat);
              const allDone = r.it.type === 'promemoria' && r.occ.every((o) => isDone(r.it, o.date));
              return (
                <div key={'i' + r.it.id} className={'gt-row item lv' + r.level}>
                  <button className="gt-label" style={{ width: LW, paddingLeft: 10 + r.level * 14 }} onClick={() => onOpenItem(r.occ[0])}>
                    <TypeShape type={r.it.type} color={tn.c} done={allDone} size={10} />
                    <span className={'gl-t' + (allDone ? ' strike' : '')}>{r.it.title || t('noTitle')}</span>
                  </button>
                  <div className="gt-track" style={{ width: W }}>{r.occ.map((o) => marker(o, tn, isDone(r.it, o.date)))}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function GanttCatsSheet({ st, onClose, onSetCats, onSetting }) {
  const tops = st.cats.filter((c) => !c.parent).sort(byOrder);
  const setTop = (top, on) => onSetCats(st.cats.map((c) => (c.id === top.id || c.parent === top.id ? { ...c, gantt: on } : c)));
  const setSub = (sub, on) => onSetCats(st.cats.map((c) => {
    if (c.id === sub.id) return { ...c, gantt: on };
    if (c.id === sub.parent && on) return { ...c, gantt: true };
    return c;
  }));
  const box = (state) => (
    <span className={'cb' + (state ? ' on' : '')}>
      {state === 'mixed' ? <svg width="12" height="12" viewBox="0 0 12 12"><path d="M3 6h6" stroke="#fff" strokeWidth="2" strokeLinecap="round" /></svg>
        : state ? <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2.5 6.2l2.2 2.2 4.8-4.8" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg> : null}
    </span>
  );
  return (
    <Sheet onClose={onClose} label={t('ganttWhat')}>
      <SheetHead title={t('ganttWhat')} onClose={onClose} />
      <p className="muted sm-p">{t('ganttHint')}</p>
      <div className="list">
        {tops.map((top) => {
          const subs = st.cats.filter((c) => c.parent === top.id).sort(byOrder);
          const onSubs = subs.filter((s) => s.gantt).length;
          const state = !top.gantt ? false : subs.length && onSubs < subs.length ? 'mixed' : true;
          return (
            <div key={top.id}>
              <button className="li" role="checkbox" aria-checked={state === 'mixed' ? 'mixed' : !!state} onClick={() => setTop(top, !top.gantt || state === 'mixed')}>
                {box(state)}<CatTile cats={st.cats} id={top.id} size={26} /><span className="li-t b">{top.name}</span>
              </button>
              {subs.map((s) => (
                <button key={s.id} className="li sub" role="checkbox" aria-checked={!!(s.gantt && top.gantt)} onClick={() => setSub(s, !(s.gantt && top.gantt))}>
                  {box(s.gantt && top.gantt)}<span className="dot" style={{ background: catTone(st.cats, s.id).c }} /><span className="li-t">{s.name}</span>
                </button>
              ))}
            </div>
          );
        })}
        <div className="li">
          <span className="tile none" style={{ width: 26, height: 26 }}><Icon name="tag" size={14} sw={2} /></span>
          <span className="li-t b">{t('unassigned')}</span>
          <Switch on={!!st.settings.ganttUnassigned} onChange={(v) => onSetting({ ganttUnassigned: v })} label={t('showUnassigned')} />
        </div>
      </div>
      <button className="btn pri wide" onClick={onClose}>{t('done')}</button>
    </Sheet>
  );
}


/* ============ Nuovo / modifica elemento ============ */
const SpeechRec = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
const ALERTS = [[null, 'none'], [0, 'atTime'], [10, 'min10'], [30, 'min30'], [60, 'h1'], [120, 'h2'], [1440, 'd1']];
function renderHL(text, ranges) {
  const out = [];
  let i = 0;
  ranges.forEach(([s, e, k], n) => {
    if (s > i) out.push(text.slice(i, s));
    out.push(<mark key={n} className={'k-' + k}>{text.slice(s, e)}</mark>);
    i = e;
  });
  out.push(text.slice(i) + '​');
  return out;
}
const repText = (r) => {
  const N = r.every > 1 ? r.every : 0;
  if (r.f === 'day') return N ? t('everyNDays', { n: N }) : t('everyDay');
  if (r.f === 'month') {
    const base = N ? t('everyNMonths', { n: N }) : t('everyMonth');
    return r.wk ? `${base}, ${r.wk.n < 0 ? t('lastShort') : r.wk.n + '°'} ${WD_SHORT[LANG][r.wk.d].toLowerCase()}` : base;
  }
  if (r.f === 'year') return N ? t('everyNYears', { n: N }) : t('everyYear');
  const days = r.days && r.days.length ? r.days.map((d) => WD_SHORT[LANG][d].toLowerCase()).join(' ') : '';
  return N ? t('everyNWeeks', { n: N }) + (days ? ': ' + days : '') : days || t('everyWeek');
};
export const mapsUrl = (q) => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q);
export const fixLink = (l) => (/^[a-z]+:\/\//i.test(l) ? l : 'https://' + l);
const UA = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
const IS_ANDROID = /Android/i.test(UA);
const IS_IOS = /iPhone|iPad|iPod/i.test(UA) || (typeof navigator !== 'undefined' && navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
/* giorni di una sveglia ripetuta (nessuno = una volta sola) */
/* etichetta di un campo con la sua icona */
const FL = ({ i, children }) => <span className="fl-l"><UIcon n={i} size={16} sw={1.9} />{children}</span>;
const alarmDays = (r, date) => (r.f === 'day' ? [0, 1, 2, 3, 4, 5, 6] : r.f === 'week' ? (r.days && r.days.length ? r.days : [wd(date)]) : []);

function ItemSheet({ st, init, occDate, isNew, autoMic, preset, onClose, onSave, onDelete, onPickCat, onBlock, onToggleDone, toast }) {
  const today = todayStr();
  const [f, setF] = useState(() => ({ ...init, allDay: init.start == null && init.type !== 'sveglia', onlyAlert: !!init.onlyAlert }));
  const [text, setText] = useState('');
  const [ranges, setRanges] = useState([]);
  const [listening, setListening] = useState(false);
  const [help, setHelp] = useState(false);
  const [autoSave, setAutoSave] = useState(false);
  const touched = useRef(new Set());
  const recRef = useRef(null), taRef = useRef(null);
  const set = (k, v) => { touched.current.add(k); setF((p) => ({ ...p, [k]: v })); };
  const fit = () => { const ta = taRef.current; if (ta) { ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px'; } };
  const onText = (v) => {
    setText(v);
    const r = parseText(v, st.cats, today);
    setRanges(r.ranges);
    const u = touched.current, p = {};
    if (!u.has('title')) p.title = r.title;
    if (!u.has('type')) p.type = r.type;
    if (!u.has('date')) p.date = r.date || init.date;
    if (!u.has('endDate')) p.endDate = r.endDate;
    // ora già scelta toccando il calendario: resta finché il testo non ne dice un'altra
    if (!u.has('time') && !(preset && r.start == null && !r.allDay)) { p.start = r.start; p.end = r.end; p.allDay = r.start == null && r.type !== 'sveglia'; }
    if (!u.has('alert')) p.alert = r.alert;
    if (!u.has('repeat')) p.repeat = r.repeat || { ...NO_REPEAT };
    if (!u.has('cat') && r.cat) p.cat = r.cat;
    if (!u.has('address')) p.address = r.address || init.address || '';
    if (!u.has('notes')) p.notes = r.notes || init.notes || '';
    if (p.type === 'sveglia' && (p.start ?? f.start) == null) { p.start = 420; p.allDay = false; }
    setF((x) => ({ ...x, ...p }));
    requestAnimationFrame(fit);
  };
  const mic = () => {
    if (!SpeechRec) { toast(t('micFallback')); if (taRef.current) taRef.current.focus(); return; }
    if (listening) { if (recRef.current) recRef.current.stop(); return; }
    const rec = new SpeechRec();
    rec.lang = 'it-IT'; // la grammatica è italiana: si ascolta sempre in italiano
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    const base = taRef.current && taRef.current.value ? taRef.current.value.trimEnd() + ' ' : '';
    // "... salva" alla fine della frase: aggiunge subito
    rec.onresult = (e) => {
      let s = '', fin = true;
      for (let i = 0; i < e.results.length; i++) { s += e.results[i][0].transcript; if (!e.results[i].isFinal) fin = false; }
      const cut = fin ? voiceSave(base + s) : null;
      if (cut != null) { onText(cut); setAutoSave(true); try { rec.stop(); } catch (x) { /* niente */ } } else onText(base + s);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    try { rec.start(); } catch (e) { setListening(false); }
  };
  useEffect(() => {
    if (isNew && autoMic) mic();
    else if (isNew) setTimeout(() => taRef.current && taRef.current.focus(), 260);
    return () => { try { if (recRef.current) recRef.current.abort(); } catch (e) { /* niente */ } };
  }, []);
  useEffect(() => { if (autoSave) save(); }, [autoSave]);
  const stopMic = () => { if (listening && recRef.current) { try { recRef.current.stop(); } catch (e) { /* niente */ } } };
  const multi = f.type === 'evento' && !!f.endDate && f.endDate > f.date;
  const setTime = (k, v) => {
    touched.current.add('time');
    setF((p) => {
      const n = { ...p, [k]: fromHHMM(v) };
      if (n.start == null) n.start = 540;
      const mm = n.type === 'evento' && n.endDate && n.endDate > n.date;
      if (n.type === 'evento' && !mm && (n.end == null || n.end <= n.start)) n.end = Math.min(n.start + 60, 1440);
      return n;
    });
  };
  const setType = (v) => {
    touched.current.add('type');
    setF((p) => (v === 'sveglia' ? { ...p, type: v, allDay: false, start: p.start ?? 420 } : { ...p, type: v }));
  };
  const setStartDate = (v) => {
    if (!v) return;
    touched.current.add('date');
    setF((p) => ({ ...p, date: v, endDate: p.endDate && p.endDate > v ? p.endDate : null }));
  };
  const setEndDate = (v) => { touched.current.add('endDate'); touched.current.add('time'); setF((p) => ({ ...p, endDate: v && v > p.date ? v : null })); };
  const save = () => {
    let title = (f.title || '').trim();
    if (!title) title = f.type === 'sveglia' ? t('alarm') : text.trim() ? cap(text.trim()) : t('noTitle');
    const it = { ...init, type: f.type, title, date: f.date || today, cat: f.cat || null, alert: f.alert, repeat: f.repeat && f.repeat.f !== 'none' ? f.repeat : { ...NO_REPEAT }, address: (f.address || '').trim(), link: (f.link || '').trim(), notes: f.notes || '', onlyAlert: false };
    if (f.type === 'sveglia') {
      const days = alarmDays(f.repeat || NO_REPEAT, it.date);
      const until = days.length && f.repeat && f.repeat.until ? f.repeat.until : null;
      Object.assign(it, { start: f.start ?? 420, end: null, endDate: null, cat: null, alert: 0, address: '', link: '', notes: '', group: f.group || null, off: !!f.off, repeat: days.length ? { f: 'week', days: [...days].sort(), until } : { ...NO_REPEAT } });
    } else if (f.allDay) {
      it.start = null; it.end = null; it.endDate = f.type === 'evento' && f.endDate && f.endDate > it.date ? f.endDate : null;
    } else {
      it.start = f.start ?? 540;
      if (f.type === 'evento') {
        it.endDate = multi ? f.endDate : null;
        it.end = multi ? f.end ?? it.start : f.end != null && f.end > it.start ? f.end : Math.min(it.start + 60, 1440);
      } else { it.endDate = null; it.end = null; }
    }
    if (f.type === 'promemoria' && f.onlyAlert) { it.onlyAlert = true; if (it.alert == null) it.alert = 0; }
    onSave(it);
  };
  const rep = f.repeat || NO_REPEAT;
  const setRep = (p) => set('repeat', { ...rep, ...p });
  const tn = catTone(st.cats, f.cat);
  const aDays = alarmDays(rep, f.date || today);
  const repLabel = (v, k) => (rep.f === v && (rep.every > 1 || rep.wk) ? repText(rep) : t(k));
  return (
    <Sheet onClose={onClose} label={isNew ? t('newItem') : t('editItem')} tall>
      <SheetHead title={isNew ? t('newItem') : t('editItem')} onClose={onClose} />
      <div className="sh-body">
        {isNew && (
          <>
            <div className={'smart' + (listening ? ' on' : '')}>
              <div className="smart-in">
                <div className="smart-hl" aria-hidden="true">{renderHL(text, ranges)}</div>
                <textarea ref={taRef} className="smart-ta" rows={1} value={text} aria-label={t('writeOrDictate')} placeholder={listening ? t('listening') : t('smartPh')}
                  onFocus={stopMic} onChange={(e) => onText(e.target.value)}
                  onPaste={(e) => { const tx = e.clipboardData && e.clipboardData.getData('text'); if (tx && looksLikeBlock(tx)) { e.preventDefault(); onBlock(tx, 'paste'); } }} />
              </div>
              <button className={'mic' + (listening ? ' on' : '')} aria-label={t('dictate')} onClick={mic}><UIcon n="mic" size={20} /></button>
            </div>
            <button className="lnk sm" aria-expanded={help} onClick={() => setHelp(!help)}><UIcon n="help" size={16} />{t('voiceHelp')}</button>
            {help && (
              <div className="vhelp">
                <p>{t('voiceTxt')}</p>
                {t('voiceEx').split('|').map((x) => <button key={x} className="vex" onClick={() => { onText(x); setHelp(false); }}><UIcon n="mic" size={13} />{x}</button>)}
              </div>
            )}
            <div className="lbl">{t('understood')}</div>
          </>
        )}
        <div className="seg" role="group" aria-label={t('event') + ' / ' + t('reminder') + ' / ' + t('alarm')}>
          {[['evento', 'event', 11], ['promemoria', 'reminder', 12], ['sveglia', 'alarm', 13]].map(([v, k, sz]) => (
            <button key={v} className={f.type === v ? 'on' : ''} onClick={() => setType(v)}><TypeShape type={v} color={f.type === v ? 'var(--ink)' : 'var(--muted)'} size={sz} />{t(k)}</button>
          ))}
        </div>
        {f.type === 'sveglia' ? (
          <div className="form">
            <label className="fl"><FL i="text">{t('label')}</FL><input value={f.title || ''} placeholder={t('alarm')} onChange={(e) => set('title', e.target.value)} /></label>
            <label className="fl"><FL i="clock">{t('time')}</FL><input type="time" value={toHHMM(f.start ?? 420)} onChange={(e) => setTime('start', e.target.value)} /></label>
            <div className="fl col">
              <FL i="repeat">{t('alarmDays')}</FL>
              <div className="wdays bare" role="group" aria-label={t('alarmDays')}>
                {WD_SHORT[LANG].map((w, i) => {
                  const on = aDays.includes(i);
                  return <button key={i} className={on ? 'on' : ''} aria-pressed={on} onClick={() => {
                    touched.current.add('repeat');
                    setF((p) => {
                      const cur = alarmDays(p.repeat || NO_REPEAT, p.date || today);
                      const nd = cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i].sort();
                      return { ...p, repeat: nd.length ? { f: 'week', days: nd, until: (p.repeat && p.repeat.until) || null } : { ...NO_REPEAT } };
                    });
                  }}>{w.slice(0, 2)}</button>;
                })}
              </div>
              {!aDays.length && <small className="muted">{t('alarmOnce')}</small>}
            </div>
            {!!aDays.length && (
              <label className="fl"><FL i="cal">{t('repeatUntil')} <small>{t('optional')}</small></FL>
                <input type="date" min={today} value={(f.repeat && f.repeat.until) || ''} onChange={(e) => { touched.current.add('repeat'); setF((p) => ({ ...p, repeat: { ...(p.repeat || NO_REPEAT), until: e.target.value || null } })); }} />
              </label>
            )}
            <label className="fl"><FL i="list">{t('group')}</FL>
              <select value={f.group || ''} onChange={(e) => set('group', e.target.value || null)}>
                <option value="">{t('noGroup')}</option>
                {[...(st.alarmGroups || [])].sort(byOrder).map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </label>
            <div className="fl"><FL i="bell">{t('active')}</FL><Switch on={!f.off} label={t('active')} onChange={(v) => set('off', !v)} /></div>
            {!aDays.length && <label className="fl"><FL i="cal">{t('dateL')}</FL><input type="date" value={f.date || ''} onChange={(e) => setStartDate(e.target.value)} /></label>}
            {IS_ANDROID && <a className="lnk" href="intent:#Intent;action=android.intent.action.SHOW_ALARMS;end"><TypeShape type="sveglia" color="var(--tealInk)" size={15} />{t('openAlarms')}</a>}
            {IS_IOS && <p className="muted sm-p pt8">{t('alarmIos')}</p>}
            <p className="muted sm-p pt8">{t('alarmNote')}</p>
          </div>
        ) : (
          <div className="form">
            <button className="fl btnrow" onClick={() => onPickCat(f.cat, (id) => set('cat', id))}>
              <FL i="tag">{t('category')}</FL>
              <span className="row-c gap8"><CatTile cats={st.cats} id={f.cat} size={24} /><b style={{ color: f.cat ? tn.ink : 'var(--muted)' }}>{catLabel(st.cats, f.cat)}</b><UIcon n="right" size={14} sw={2.4} color="var(--muted)" /></span>
            </button>
            <label className="fl"><FL i="text">{t('title')}</FL><input value={f.title || ''} placeholder={t('titlePh')} onChange={(e) => set('title', e.target.value)} /></label>
            <div className="fl"><FL i="sun">{t('allDay')}</FL><Switch on={f.allDay} label={t('allDay')} onChange={(v) => { touched.current.add('time'); setF((p) => ({ ...p, allDay: v, start: v ? null : p.start ?? 540, end: v ? null : p.end ?? (p.start ?? 540) + 60 })); }} /></div>
            {f.type === 'evento' && f.allDay && (
              <>
                <label className="fl"><FL i="cal">{t('from')}</FL><input type="date" value={f.date || ''} onChange={(e) => setStartDate(e.target.value)} /></label>
                <label className="fl"><FL i="cal">{t('to')} <small>{t('optional')}</small></FL><input type="date" min={f.date} value={f.endDate || ''} onChange={(e) => setEndDate(e.target.value)} /></label>
              </>
            )}
            {f.type === 'evento' && !f.allDay && (
              <>
                <div className="fl dt"><FL i="clock">{t('start')}</FL><span className="row-c gap6">
                  <input type="date" aria-label={t('start')} value={f.date || ''} onChange={(e) => setStartDate(e.target.value)} />
                  <input type="time" step="900" aria-label={t('start') + ' ' + t('time')} value={toHHMM(f.start)} onChange={(e) => setTime('start', e.target.value)} />
                </span></div>
                <div className="fl dt"><FL i="clock">{t('end')}</FL><span className="row-c gap6">
                  <input type="date" aria-label={t('end')} min={f.date} value={f.endDate || f.date || ''} onChange={(e) => setEndDate(e.target.value)} />
                  <input type="time" step="900" aria-label={t('end') + ' ' + t('time')} value={toHHMM(f.end)} onChange={(e) => setTime('end', e.target.value)} />
                </span></div>
              </>
            )}
            {f.type === 'promemoria' && (
              <>
                <label className="fl"><FL i="cal">{t('dateL')}</FL><input type="date" value={f.date || ''} onChange={(e) => setStartDate(e.target.value)} /></label>
                {!f.allDay && <label className="fl"><FL i="clock">{t('time')}</FL><input type="time" step="900" value={toHHMM(f.start)} onChange={(e) => setTime('start', e.target.value)} /></label>}
                <div className="fl"><span className="col-t"><FL i="done">{t('toComplete')}</FL><small>{t('toCompleteTxt')}</small></span><Switch on={!f.onlyAlert} label={t('toComplete')} onChange={(v) => setF((p) => ({ ...p, onlyAlert: !v, alert: !v && p.alert == null ? 0 : p.alert }))} /></div>
              </>
            )}
            <label className="fl"><FL i="bell">{t('alert')}</FL>
              <select value={f.alert == null ? '' : String(f.alert)} onChange={(e) => set('alert', e.target.value === '' ? null : +e.target.value)}>
                {ALERTS.filter(([v]) => !(f.type === 'promemoria' && f.onlyAlert && v == null)).map(([v, k]) => <option key={k} value={v == null ? '' : String(v)}>{t(k)}</option>)}
                {f.alert != null && !ALERTS.some(([v]) => v === f.alert) && <option value={String(f.alert)}>{f.alert} min</option>}
              </select>
            </label>
            <label className="fl"><FL i="repeat">{t('repeat')}</FL>
              <select value={rep.f || 'none'} onChange={(e) => set('repeat', { f: e.target.value, days: e.target.value === 'week' ? rep.days || [] : [], until: rep.until || null })}>
                <option value="none">{t('no')}</option><option value="day">{repLabel('day', 'everyDay')}</option><option value="week">{repLabel('week', 'everyWeek')}</option>
                <option value="month">{repLabel('month', 'everyMonth')}</option><option value="year">{repLabel('year', 'everyYear')}</option>
              </select>
            </label>
            {rep.f === 'week' && (
              <div className="wdays" role="group" aria-label={t('everyWeek')}>
                {WD_SHORT[LANG].map((w, i) => {
                  const on = (rep.days && rep.days.length ? rep.days : [wd(f.date || today)]).includes(i);
                  return <button key={i} className={on ? 'on' : ''} aria-pressed={on} onClick={() => {
                    const cur = rep.days && rep.days.length ? rep.days : [wd(f.date || today)];
                    const nd = on ? cur.filter((x) => x !== i) : [...cur, i].sort();
                    setRep({ days: nd.length ? nd : cur });
                  }}>{w.slice(0, 2)}</button>;
                })}
              </div>
            )}
            {rep.f && rep.f !== 'none' && (
              <label className="fl"><FL i="cal">{t('repeatUntil')} <small>{t('optional')}</small></FL><input type="date" min={f.date} value={rep.until || ''} onChange={(e) => setRep({ until: e.target.value || null })} /></label>
            )}
            <div className="fl col">
              <label htmlFor="f-addr" className="fl-l"><UIcon n="pin" size={16} />{t('address')}</label>
              <div className="inrow">
                <input id="f-addr" value={f.address || ''} placeholder={t('addressPh')} autoComplete="street-address" onChange={(e) => set('address', e.target.value)} />
                <a className={'ib act' + (f.address ? '' : ' off')} aria-label={t('openMaps')} href={f.address ? mapsUrl(f.address) : undefined} target="_blank" rel="noopener"><UIcon n="pin" /></a>
              </div>
            </div>
            <div className="fl col">
              <label htmlFor="f-link" className="fl-l"><UIcon n="link" size={16} />{t('link')}</label>
              <div className="inrow">
                <input id="f-link" type="url" inputMode="url" value={f.link || ''} placeholder={t('linkPh')} onChange={(e) => set('link', e.target.value)} />
                <a className={'ib act' + (f.link ? '' : ' off')} aria-label={t('openLink')} href={f.link ? fixLink(f.link.trim()) : undefined} target="_blank" rel="noopener"><UIcon n="ext" /></a>
              </div>
            </div>
            <div className="fl col">
              <label htmlFor="f-notes" className="fl-l"><UIcon n="note" size={16} />{t('notes')}</label>
              <textarea id="f-notes" rows={3} value={f.notes || ''} placeholder={t('notesPh')} onChange={(e) => set('notes', e.target.value)} />
            </div>
            {!isNew && init.type === 'promemoria' && !init.onlyAlert && occDate && (
              <div className="fl"><FL i="done">{t('markDone')} <small>{fmtDayShort(occDate)}</small></FL><Switch on={isDone(init, occDate)} label={t('markDone')} onChange={() => onToggleDone(init, occDate)} /></div>
            )}
          </div>
        )}
      </div>
      <div className="sh-foot">
        {!isNew && <button className="btn danger-t" onClick={() => onDelete(init)}><UIcon n="trash" size={18} />{t('del')}</button>}
        <button className="btn pri grow" onClick={save}>{isNew ? t('add') : t('save')}</button>
      </div>
    </Sheet>
  );
}

/* ============ Scelta categoria ============ */
function CatPicker({ st, current, onPick, onClose, onManage, onCreate }) {
  const [q, setQ] = useState('');
  const cur = catOf(st.cats, current);
  const [openIds, setOpenIds] = useState(() => new Set(cur ? [cur.parent || cur.id] : []));
  const tops = st.cats.filter((c) => !c.parent).sort(byOrder);
  const nq = norm(q);
  const hit = (c) => !nq || norm(c.name).includes(nq);
  const exact = nq && st.cats.some((c) => norm(c.name) === nq);
  const recent = (st.settings.recent || []).map((id) => catOf(st.cats, id)).filter(Boolean).slice(0, 4);
  const pick = (id) => { onPick(id); onClose(); };
  const row = (c, sub) => (
    <button key={c.id} className={'li' + (sub ? ' sub' : '') + (current === c.id ? ' cur' : '')} onClick={() => pick(c.id)}>
      {sub ? <span className="dot" style={{ background: catTone(st.cats, c.id).c }} /> : <CatTile cats={st.cats} id={c.id} size={28} />}
      <span className={'li-t' + (sub ? '' : ' b')}>{c.name}</span>
      {current === c.id && <UIcon n="check" size={18} color="var(--tealInk)" sw={2.4} />}
    </button>
  );
  return (
    <Sheet onClose={onClose} label={t('category')} tall>
      <SheetHead title={t('category')} onClose={onClose} />
      <div className="sh-body">
        <div className="search">
          <UIcon n="search" size={18} color="var(--muted)" />
          <input value={q} aria-label={t('searchCatPh')} placeholder={t('searchCatPh')} onChange={(e) => setQ(e.target.value)} />
        </div>
        {q.trim() && !exact && (
          <button className="li create" onClick={() => { const id = onCreate(q.trim()); if (id) pick(id); }}>
            <span className="tile none" style={{ width: 28, height: 28 }}><UIcon n="plus" size={16} /></span><span className="li-t">{t('createCat')} «{q.trim()}»</span>
          </button>
        )}
        {!q && !!recent.length && (
          <>
            <div className="lbl">{t('recent')}</div>
            <div className="chips">
              {recent.map((c) => (
                <button key={c.id} className={'chip' + (current === c.id ? ' on' : '')} onClick={() => pick(c.id)}><CatTile cats={st.cats} id={c.id} size={22} />{c.name}</button>
              ))}
            </div>
          </>
        )}
        <div className="lbl">{t('allCats')}</div>
        <div className="list">
          {tops.map((top) => {
            const subs = st.cats.filter((c) => c.parent === top.id).sort(byOrder);
            const subsHit = subs.filter(hit);
            if (!hit(top) && !subsHit.length) return null;
            const isOpen = !!nq || openIds.has(top.id);
            return (
              <div key={top.id}>
                <div className="li-wrap">
                  {row(top, false)}
                  {!!subs.length && <button className="ib" aria-label={top.name} aria-expanded={isOpen} onClick={() => setOpenIds((s) => { const n = new Set(s); if (n.has(top.id)) n.delete(top.id); else n.add(top.id); return n; })}><UIcon n={isOpen ? 'down' : 'right'} size={16} sw={2.4} color="var(--muted)" /></button>}
                </div>
                {isOpen && (nq ? subsHit : subs).map((s) => row(s, true))}
              </div>
            );
          })}
          <button className={'li' + (!current ? ' cur' : '')} onClick={() => pick(null)}>
            <span className="tile none dashed" style={{ width: 28, height: 28 }} /><span className="li-t muted">{t('unassigned')}</span>
            {!current && <UIcon n="check" size={18} color="var(--tealInk)" sw={2.4} />}
          </button>
        </div>
        <button className="lnk center" onClick={onManage}><Icon name="tag" size={16} sw={2} />{t('manageCats')}</button>
      </div>
    </Sheet>
  );
}

/* ============ Da aggiungere ============ */
function ImportScreen({ st, drafts, origin, onClose, onConfirm, onPickCat }) {
  const [rows, setRows] = useState(() => drafts.map((d, i) => ({ ...d, k: i, on: !d.dup })));
  const upd = (k, p) => setRows((rs) => rs.map((r) => (r.k === k ? { ...r, ...p } : r)));
  const n = rows.filter((r) => r.on).length;
  const originTxt = origin === 'link' ? t('fromLink') : origin === 'ics' ? t('fromIcs') : t('fromPaste');
  return (
    <Screen title={t('toAdd')} onBack={onClose}>
      <p className="muted intro">{t('toAddTxt')}</p>
      <div className="chips pad-x">
        <span className="tag">{originTxt}</span>
        <span className="tag">{t('chosen', { n, m: rows.length })}</span>
      </div>
      {!rows.length && <p className="muted pad">{t('noneFound')}</p>}
      <div className="card list">
        {rows.map((r) => {
          const tn = r.missing ? noneTone() : catTone(st.cats, r.cat);
          return (
            <div key={r.k} className={'imp' + (r.on ? '' : ' off')}>
              <button className={'cb' + (r.on ? ' on' : '')} role="checkbox" aria-checked={r.on} aria-label={r.title} onClick={() => upd(r.k, { on: !r.on })}>
                {r.on && <svg width="13" height="13" viewBox="0 0 12 12"><path d="M2.5 6.2l2.2 2.2 4.8-4.8" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </button>
              <div className="imp-t">
                <span className="row-c gap6"><TypeShape type={r.type} only={r.onlyAlert} color={tn.c} size={11} /><b>{r.title}</b></span>
                <small>{whenText(r, r.date)}{r.repeat && r.repeat.f !== 'none' ? ' - ' + repText(r.repeat) : ''}{r.dup ? ' - ' + t('already') : ''}</small>
              </div>
              {r.type !== 'sveglia' && (
                <button className="catchip" style={{ background: tn.tint, color: tn.ink }} onClick={() => onPickCat(r.cat, (id) => upd(r.k, { cat: id, missing: null }))}>
                  <i style={{ background: tn.c }} />
                  <span>{r.missing ? `${r.missing.join(' › ')} (${t('newTag')})` : catLabel(st.cats, r.cat)}</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
      <p className="muted pad row-c gap8"><Icon name="lucchetto" size={15} sw={2} />{t('nothingSaved')}</p>
      <div className="foot2">
        <button className="btn" onClick={onClose}>{t('cancel')}</button>
        <button className="btn pri" disabled={!n} onClick={() => onConfirm(rows.filter((r) => r.on))}>{t('addN', { n })}</button>
      </div>
    </Screen>
  );
}

/* ============ Ricerca ============ */
function SearchScreen({ st, onClose, onOpen }) {
  const [q, setQ] = useState('');
  const ref = useRef(null);
  useEffect(() => { setTimeout(() => ref.current && ref.current.focus(), 100); }, []);
  const nq = q.trim().toLowerCase();
  const res = nq ? st.items.filter((it) => [it.title, it.notes, it.address].some((s) => (s || '').toLowerCase().includes(nq))).sort((a, b) => (a.date < b.date ? -1 : 1)).slice(0, 80) : [];
  return (
    <Screen title={t('search')} onBack={onClose}>
      <div className="pad-x">
        <div className="search"><UIcon n="search" size={18} color="var(--muted)" /><input ref={ref} value={q} aria-label={t('searchPh')} placeholder={t('searchPh')} onChange={(e) => setQ(e.target.value)} /></div>
      </div>
      {nq && !res.length && <p className="muted pad">{t('noResults')}</p>}
      <div className="card list">
        {res.map((it) => {
          const tn = catTone(st.cats, it.cat);
          return (
            <button key={it.id} className="li tall" onClick={() => onOpen(it)}>
              <TypeShape type={it.type} only={it.onlyAlert} color={tn.c} size={12} />
              <span className="li-t col"><b>{it.title}</b><small>{fmtFull(it.date)} - {catLabel(st.cats, it.cat)}</small></span>
            </button>
          );
        })}
      </div>
    </Screen>
  );
}


/* ============ Categorie: elenco con trascinamento ============ */
export function moveCat(cats, id, tg) {
  const me = cats.find((c) => c.id === id);
  const tops = cats.filter((c) => !c.parent && c.id !== id).sort(byOrder);
  let i = tops.findIndex((c) => c.id === (tg.before || tg.after));
  if (i < 0) i = tops.length; else if (tg.after) i++;
  tops.splice(i, 0, me);
  const ord = new Map(tops.map((c, k) => [c.id, k]));
  return cats.map((c) => (ord.has(c.id) ? { ...c, order: ord.get(c.id) } : c));
}
export function moveSub(cats, id, tg) {
  const parent = tg.into || tg.parent;
  if (!parent) return cats;
  const me = { ...cats.find((c) => c.id === id), parent };
  const sibs = cats.filter((c) => c.parent === parent && c.id !== id).sort(byOrder);
  let i = tg.into ? 0 : sibs.findIndex((c) => c.id === (tg.before || tg.after)) + (tg.after ? 1 : 0);
  if (i < 0) i = sibs.length;
  sibs.splice(i, 0, me);
  const ord = new Map(sibs.map((c, k) => [c.id, k]));
  return cats.map((c) => (c.id === id ? { ...me, order: ord.get(id) } : ord.has(c.id) ? { ...c, order: ord.get(c.id) } : c));
}
export function nextColor(cats) {
  const used = new Set(cats.filter((c) => !c.parent).map((c) => c.color));
  const free = PALETTE.find(([id]) => !used.has(id));
  return free ? free[0] : PALETTE[cats.length % PALETTE.length][0];
}

function CatsScreen({ st, onBack, onEdit, onNew, onSetCats }) {
  const tops = st.cats.filter((c) => !c.parent).sort(byOrder);
  const [closed, setClosed] = useState(() => new Set());
  const [drag, setDrag] = useState(null);
  const listRef = useRef(null), D = useRef(null);
  const fam = (id) => { const ids = catFamily(st.cats, id); return st.items.filter((it) => ids.includes(it.cat)).length; };
  const own = (id) => st.items.filter((it) => it.cat === id).length;
  const unassigned = st.items.filter((it) => !it.cat || !catOf(st.cats, it.cat)).length;

  const onDown = (e, c) => {
    e.preventDefault();
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (x) { /* niente */ }
    const lr = listRef.current.getBoundingClientRect();
    const rows = [...listRef.current.querySelectorAll('[data-row]')].map((r) => {
      const b = r.getBoundingClientRect();
      return { id: r.dataset.id, kind: r.dataset.kind, parent: r.dataset.parent || null, top: b.top - lr.top, bottom: b.bottom - lr.top };
    });
    D.current = { id: c.id, kind: c.parent ? 'sub' : 'cat', y0: e.clientY, rows, target: null };
    setDrag({ id: c.id, dy: 0, ind: null, into: null });
  };
  const onMove = (e) => {
    const d = D.current;
    if (!d) return;
    const y = e.clientY - listRef.current.getBoundingClientRect().top;
    const rows = d.rows.filter((r) => r.id !== d.id && !(d.kind === 'cat' && r.parent === d.id));
    let target = null, ind = null, into = null;
    if (d.kind === 'cat') {
      const blocks = rows.filter((r) => r.kind === 'cat').map((r) => {
        const subs = rows.filter((s) => s.parent === r.id);
        return { id: r.id, top: r.top, bottom: subs.length ? Math.max(r.bottom, ...subs.map((s) => s.bottom)) : r.bottom };
      });
      for (const b of blocks) if (y < (b.top + b.bottom) / 2) { target = { before: b.id }; ind = b.top; break; }
      if (!target && blocks.length) { const b = blocks[blocks.length - 1]; target = { after: b.id }; ind = b.bottom; }
    } else if (rows.length) {
      let r = rows.find((x) => y >= x.top && y < x.bottom);
      if (!r) r = y < rows[0].top ? rows[0] : rows[rows.length - 1];
      if (r.kind === 'cat') { target = { into: r.id }; into = r.id; }
      else {
        const mid = (r.top + r.bottom) / 2;
        target = y < mid ? { before: r.id, parent: r.parent } : { after: r.id, parent: r.parent };
        ind = y < mid ? r.top : r.bottom;
      }
    }
    d.target = target;
    setDrag({ id: d.id, dy: e.clientY - d.y0, ind, into });
  };
  const onUp = () => {
    const d = D.current;
    D.current = null;
    setDrag(null);
    if (!d || !d.target) return;
    if (d.kind === 'cat') onSetCats(moveCat(st.cats, d.id, d.target));
    else {
      onSetCats(moveSub(st.cats, d.id, d.target));
      if (d.target.into) setClosed((s) => { const n = new Set(s); n.delete(d.target.into); return n; });
    }
  };
  const grip = (c) => (
    <span className="grip" role="button" tabIndex={-1} aria-label={c.name} style={{ touchAction: 'none' }}
      onPointerDown={(e) => onDown(e, c)} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
      <UIcon n="grip" color="var(--faint)" />
    </span>
  );
  return (
    <Screen title={t('categories')} onBack={onBack} right={<button className="ib teal" aria-label={t('newCat')} onClick={onNew}><UIcon n="plus" size={22} /></button>}>
      <p className="muted intro">{t('catHint')}</p>
      <div className={'card cats' + (drag ? ' dragging' : '')} ref={listRef}>
        {tops.map((top) => {
          const subs = st.cats.filter((c) => c.parent === top.id).sort(byOrder);
          const isClosed = closed.has(top.id);
          const lifted = drag && drag.id === top.id;
          return (
            <div key={top.id} className={'cblock' + (lifted ? ' lifted' : '')} style={lifted ? { transform: `translateY(${drag.dy}px)` } : undefined}>
              <div className={'crow' + (drag && drag.into === top.id ? ' into' : '')} data-row="1" data-id={top.id} data-kind="cat">
                {grip(top)}
                <button className="crow-main" onClick={() => onEdit(top.id)}>
                  <CatTile cats={st.cats} id={top.id} size={32} />
                  <span className="li-t b">{top.name}</span>
                  <span className="num">{fam(top.id)}</span>
                </button>
                {subs.length > 0 && (
                  <button className="ib" aria-expanded={!isClosed} aria-label={top.name} onClick={() => setClosed((s) => { const n = new Set(s); if (n.has(top.id)) n.delete(top.id); else n.add(top.id); return n; })}>
                    <UIcon n={isClosed ? 'right' : 'down'} size={16} sw={2.4} color="var(--muted)" />
                  </button>
                )}
              </div>
              {!isClosed && subs.map((s) => {
                const sl = drag && drag.id === s.id;
                return (
                  <div key={s.id} className={'crow sub' + (sl ? ' lifted' : '')} style={sl ? { transform: `translateY(${drag.dy}px)` } : undefined} data-row="1" data-id={s.id} data-kind="sub" data-parent={top.id}>
                    {grip(s)}
                    <button className="crow-main" onClick={() => onEdit(s.id)}>
                      <span className="dot lg" style={{ background: catTone(st.cats, s.id).c }} />
                      <span className="li-t">{s.name}</span>
                      <span className="num">{own(s.id)}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          );
        })}
        {drag && drag.ind != null && <div className="drop-ind" style={{ top: drag.ind - 1 }} />}
      </div>
      <div className="unas"><span>{t('unassigned')}</span><span className="num">{unassigned}</span></div>
      <div className="pad-x"><button className="btn wide" onClick={onNew}><UIcon n="plus" size={18} color="var(--tealInk)" />{t('newCat')}</button></div>
    </Screen>
  );
}

/* ============ Modifica categoria ============ */
function CatEdit({ st, catId, parentId, onBack, onSave, onDelete, onOpenSub, onAddSub }) {
  const existing = catId ? catOf(st.cats, catId) : null;
  const parent = catOf(st.cats, existing ? existing.parent : parentId);
  const [c, setC] = useState(() => (existing ? { ...existing } : {
    id: uid(), name: '', icon: parent ? parent.icon : 'tag', color: parent ? null : nextColor(st.cats), details: '', parent: parentId || null, order: null, gantt: true
  }));
  const [moreI, setMoreI] = useState(false);
  const [moreC, setMoreC] = useState(false);
  const [err, setErr] = useState(false);
  const tn = tones(c.color ? colorHex(c.color) : parent ? colorHex(parent.color) : colorHex('verderame'));
  const icons = moreI ? Object.keys(ICONS) : [...new Set([...BASE_ICONS, c.icon])];
  const colors = moreC ? PALETTE.map((p) => p[0]) : [...new Set([...PALETTE.slice(0, 8).map((p) => p[0]), ...(c.color ? [c.color] : [])])];
  const subs = existing && !existing.parent ? st.cats.filter((x) => x.parent === existing.id).sort(byOrder) : [];
  const commit = () => { if (!c.name.trim()) { setErr(true); return false; } onSave({ ...c, name: c.name.trim() }); return true; };
  const back = () => { if (c.name.trim()) commit(); onBack(); };
  return (
    <Screen title={existing ? existing.name : c.parent ? t('newSub') : t('newCat')} onBack={back}
      right={<button className="lnk b" onClick={() => { if (commit()) onBack(); }}>{t('done')}</button>}>
      <div className="ce-top">
        <span className="tile" style={{ width: 56, height: 56, borderRadius: 16, background: tn.tint, color: tn.ink }}><Icon name={c.icon} size={28} /></span>
        <label className="fl col grow">
          <span>{t('name')}</span>
          <input value={c.name} className={err ? 'err' : ''} aria-invalid={err} onChange={(e) => { setErr(false); setC({ ...c, name: e.target.value }); }} />
          {err && <small className="errtxt">{t('nameNeeded')}</small>}
        </label>
      </div>
      <h3 className="lbl pad-x">{t('icon')}</h3>
      <div className="card icons" role="group" aria-label={t('icon')}>
        {icons.map((n) => (
          <button key={n} className={c.icon === n ? 'on' : ''} aria-pressed={c.icon === n} aria-label={n} style={c.icon === n ? { background: tn.tint, color: tn.ink, borderColor: tn.c } : undefined} onClick={() => setC({ ...c, icon: n })}>
            <Icon name={n} size={20} />
          </button>
        ))}
        <button className="more" onClick={() => setMoreI(!moreI)}>{moreI ? t('less') : t('more')}</button>
      </div>
      <h3 className="lbl pad-x">{t('color')}</h3>
      <div className="card swatches" role="group" aria-label={t('color')}>
        {c.parent && (
          <button className={'sws inherit' + (!c.color ? ' on' : '')} aria-pressed={!c.color} aria-label={t('asParent')} title={t('asParent')} onClick={() => setC({ ...c, color: null })}
            style={{ background: parent ? colorHex(parent.color) : '#8A979F' }}><span>=</span></button>
        )}
        {colors.map((id) => (
          <button key={id} className={'sws' + (c.color === id ? ' on' : '')} aria-pressed={c.color === id} aria-label={id} title={id} style={{ background: colorHex(id), boxShadow: c.color === id ? `0 0 0 2px #FBFBF8, 0 0 0 4px ${colorHex(id)}` : undefined }} onClick={() => setC({ ...c, color: id })} />
        ))}
        <button className="more" onClick={() => setMoreC(!moreC)}>{moreC ? t('less') : t('more')}</button>
      </div>
      {c.parent && !c.color && <p className="muted pad-x sm-p">{t('asParent')}</p>}
      <div className="pad-x">
        <label className="fl col">
          <span>{t('details')}</span>
          <textarea rows={3} value={c.details || ''} placeholder={t('detailsPh')} onChange={(e) => setC({ ...c, details: e.target.value })} />
        </label>
      </div>
      {!c.parent && (
        <>
          <h3 className="lbl pad-x">{t('subcats')}</h3>
          <div className="card list">
            {subs.map((s) => (
              <button key={s.id} className="li" onClick={() => { if (commit()) onOpenSub(s.id); }}>
                <span className="dot lg" style={{ background: catTone(st.cats, s.id).c }} />
                <span className="li-t col"><span>{s.name}</span>{s.details ? <small>{s.details.slice(0, 60)}</small> : null}</span>
                <UIcon n="right" size={14} sw={2.4} color="var(--muted)" />
              </button>
            ))}
            <button className="li teal-t" onClick={() => { if (commit()) onAddSub(c.id); }}><UIcon n="plus" size={18} />{t('addSub')}</button>
          </div>
        </>
      )}
      {existing && (
        <div className="center-col">
          <button className="btn danger-t" onClick={() => onDelete(existing)}>{t('delCat')}</button>
          <small className="muted">{t('delCatTxt')}</small>
        </div>
      )}
    </Screen>
  );
}



/* ============ Importare da un'altra app con l'IA ============ */
const AI_GUIDE = `# Istruzioni per l'IA: dati di calendario verso hora

Converti i dati che ti allego (export di un'altra app, testo copiato, foglio, foto di un'agenda) in un blocco di testo che hora sa leggere. Rispondi solo con il blocco, dentro un unico riquadro di codice, senza commenti.

## Formato

Prima riga: \`#hora\`. Poi una riga per ogni elemento, campi separati da \` | \`:

\`\`\`
#hora
13/10 07:00-07:45 | Corsa | evento | Personale | ripete mar gio sab
14/10 18:30 | Spesa | promemoria | Casa | avviso 30 minuti
23/10-25/10 | Lisbona | evento | Personale › Viaggio Lisbona | link: https://...
23/10-24/10 22:00-08:30 | Volo notturno | evento | Personale
13/10 06:45 | Sveglia | sveglia | ripete lun mar mer gio ven
\`\`\`

## Regole

1. Campo 1, quando: data \`GG/MM\` (aggiungi \`/AAAA\` se l'anno non è quello in corso), intervallo \`GG/MM-GG/MM\` per più giorni, poi l'ora \`HH:MM\` o la fascia \`HH:MM-HH:MM\` (24 ore). Senza ora l'elemento vale tutto il giorno.
2. Campo 2: titolo breve, senza il carattere \`|\`.
3. Campo 3, tipo: \`evento\` (ha una durata), \`promemoria\` (una cosa da fare, con o senza ora), \`sveglia\` (suona a un'ora precisa, senza categoria).
4. Campo 4, categoria: una parola o due (es. Lavoro, Casa, Personale); per una sottocategoria usa \`Categoria › Sottocategoria\`. Riusa sempre gli stessi nomi.
5. Campi facoltativi, in qualsiasi ordine dopo la categoria:
   - \`ripete lun mer ven\`, \`ripete ogni giorno\`, \`ripete ogni settimana\`, \`ripete ogni mese\`, \`ripete ogni anno\`
   - \`avviso 10 minuti\`, \`avviso 1 ora\`, \`avviso 1 giorno\`
   - \`indirizzo: Via Roma 10, Parma\`
   - \`link: https://...\`
   - \`note: testo libero su una riga\`
6. Fusi orari: converti tutto nell'ora italiana.
7. Elementi ricorrenti: una sola riga con \`ripete\`, non una riga per ogni volta.
8. Se un dato è incerto, scegli l'interpretazione più probabile e non inventare elementi.

## Dopo

Copia il blocco e incollalo in hora: Impostazioni > Dati > Importa da un'altra app (riquadro "Incolla qui"), oppure nel campo "Scrivi o detta" del Nuovo. hora mostra l'elenco "Da aggiungere": controlla e conferma.
`;
function AiImportScreen({ onBack, onRead, toast }) {
  const [txt, setTxt] = useState('');
  const copy = async () => {
    try { await navigator.clipboard.writeText(AI_GUIDE); toast(t('copied')); }
    catch (e) { download('hora-istruzioni-ia.md', AI_GUIDE, 'text/markdown'); }
  };
  return (
    <Screen title={t('aiImport')} onBack={onBack}>
      <p className="muted intro">{t('aiTxt')}</p>
      <div className="steps">
        <div className="step"><b>1</b><span>{t('aiStep1')}</span></div>
        <div className="step"><b>2</b><span>{t('aiStep2')}</span></div>
        <div className="row-c gap8 pad-x">
          <button className="btn grow" onClick={copy}><UIcon n="copy" size={18} />{t('copyMd')}</button>
          <button className="btn grow" onClick={() => download('hora-istruzioni-ia.md', AI_GUIDE, 'text/markdown')}><UIcon n="download" size={18} />{t('downloadMd')}</button>
        </div>
        <div className="step"><b>3</b><span>{t('aiStep3')}</span></div>
      </div>
      <div className="pad-x">
        <textarea className="paste" rows={7} value={txt} placeholder={'#hora\n13/10 07:00 | ...'} aria-label={t('pasteHere')} onChange={(e) => setTxt(e.target.value)} />
        <button className="btn pri wide" disabled={!txt.trim()} onClick={() => onRead(txt)}>{t('readBlock')}</button>
      </div>
    </Screen>
  );
}

/* ============ Elenco: eventi e promemoria in fila, sveglie a gruppi ============ */
const AL = (title, start, days) => ({ title, start, days });
const ALARM_TEMPLATES = [
  { key: 'mattina', name: 'Mattina', en: 'Morning', items: [AL('Sveglia', 420, [0, 1, 2, 3, 4]), AL('Sveglia del weekend', 540, [5, 6])] },
  { key: 'medicinali', name: 'Medicinali', en: 'Medicines', items: [AL('Medicina del mattino', 480, []), AL('Medicina della sera', 1200, [])] },
  { key: 'lavoro', name: 'Lavoro', en: 'Work', items: [AL('Pausa', 630, [0, 1, 2, 3, 4]), AL('Fine giornata', 1080, [0, 1, 2, 3, 4])] },
  { key: 'riposo', name: 'Riposo', en: 'Rest', items: [AL('Stacca dagli schermi', 1350, []), AL('A letto', 1380, [])] }
];
const tplDays = (d) => (d.length ? { f: 'week', days: d, until: null } : { f: 'day', days: [], until: null });
function alarmText(it) {
  const r = it.repeat || NO_REPEAT;
  let s = r.f === 'day' ? t('everyDay') : r.f === 'week' ? (r.days && r.days.length === 7 ? t('everyDay') : (r.days || []).map((d) => WD_SHORT[LANG][d].toLowerCase()).join(' ')) : t('onceOn', { d: fmtDayShort(it.date) });
  if (r.until) s += ' - ' + t('untilD', { d: fmtDayShort(r.until) });
  return s;
}
function AgendaScreen({ st, tab: tab0, onBack, onOpen, onNewAlarm, onSaveItem, onSetGroups, onAddTemplate, onSetting }) {
  const today = todayStr();
  const [tab, setTab] = useState(tab0 || 'list');
  const [types, setTypes] = useState(['evento', 'promemoria']);
  const [cat, setCat] = useState('');
  const [q, setQ] = useState('');
  const [past, setPast] = useState(false);
  const [span, setSpan] = useState(120);
  const [edit, setEdit] = useState(null);
  const tops = st.cats.filter((c) => !c.parent).sort(byOrder);
  const days = useMemo(() => {
    if (tab !== 'list') return [];
    const fam = cat ? (cat === '__none' ? null : new Set(catFamily(st.cats, cat))) : null;
    const nq = q.trim().toLowerCase();
    const its = st.items.filter((it) => it.type !== 'sveglia' && types.includes(it.type)
      && (!cat || (cat === '__none' ? !it.cat || !catOf(st.cats, it.cat) : fam.has(it.cat)))
      && (!nq || [it.title, it.notes, it.address].some((x) => (x || '').toLowerCase().includes(nq))));
    const list = expand(its, past ? addDays(today, -365) : today, addDays(today, span)).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : (a.it.start ?? -1) - (b.it.start ?? -1)));
    const g = [];
    for (const o of list) { if (!g.length || g[g.length - 1].d !== o.date) g.push({ d: o.date, list: [] }); g[g.length - 1].list.push(o); }
    return g;
  }, [tab, st.items, st.cats, types, cat, q, past, span]);
  const groups = [...(st.alarmGroups || [])].sort(byOrder);
  const alarms = st.items.filter((it) => it.type === 'sveglia').sort((a, b) => (a.start ?? 0) - (b.start ?? 0));
  const moveGroup = (id, dir) => {
    const i = groups.findIndex((g) => g.id === id), j = i + dir;
    if (j < 0 || j >= groups.length) return;
    const ng = [...groups]; [ng[i], ng[j]] = [ng[j], ng[i]];
    onSetGroups(ng.map((g, k) => ({ ...g, order: k })));
  };
  const renameGroup = (id, name) => { if (name.trim()) onSetGroups(groups.map((g) => (g.id === id ? { ...g, name: name.trim() } : g))); setEdit(null); };
  const addGroup = () => { const id = uid(); onSetGroups([...groups, { id, name: t('newGroup'), order: groups.length }]); setEdit(id); };
  const delGroup = (id) => { onSetGroups(groups.filter((g) => g.id !== id)); for (const a of alarms) if (a.group === id) onSaveItem({ ...a, group: null }); };
  const usedTpl = new Set(groups.map((g) => g.tpl).filter(Boolean));
  const tpls = ALARM_TEMPLATES.filter((x) => !usedTpl.has(x.key));
  const alarmRow = (a) => (
    <div key={a.id} className={'al-row' + (a.off ? ' off' : '')}>
      <button className="al-main" onClick={() => onOpen({ it: a, date: a.date, end: a.date, key: a.id + '@' + a.date })}>
        <span className="al-time">{toHHMM(a.start ?? 420)}</span>
        <span className="li-t col"><span>{a.title || t('alarm')}</span><small>{alarmText(a)}</small></span>
      </button>
      <Switch on={!a.off} label={a.title || t('alarm')} onChange={(v) => onSaveItem({ ...a, off: !v })} />
    </div>
  );
  const groupCard = (g) => {
    const list = alarms.filter((a) => (g ? a.group === g.id : !a.group || !groups.some((x) => x.id === a.group)));
    if (!g && !list.length) return null;
    return (
      <section key={g ? g.id : '__none'} className="al-group">
        <div className="al-gh">
          {g && edit === g.id
            ? <input autoFocus defaultValue={g.name} aria-label={t('name')} onBlur={(e) => renameGroup(g.id, e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }} />
            : <h3 onClick={() => g && setEdit(g.id)}>{g ? g.name : t('noGroup')}</h3>}
          {g && (
            <span className="row-c">
              <button className="ib sm" aria-label={t('up')} onClick={() => moveGroup(g.id, -1)}><UIcon n="up" size={16} /></button>
              <button className="ib sm" aria-label={t('down')} onClick={() => moveGroup(g.id, 1)}><UIcon n="down" size={16} /></button>
              <button className="ib sm" aria-label={t('del')} onClick={() => delGroup(g.id)}><UIcon n="trash" size={16} /></button>
            </span>
          )}
        </div>
        {list.map(alarmRow)}
        <button className="li teal-t" onClick={() => onNewAlarm(g ? g.id : null)}><UIcon n="plus" size={18} />{t('newAlarm')}</button>
      </section>
    );
  };
  return (
    <Screen title={t('agenda')} onBack={onBack}>
      <div className="pad-x">
        <div className="seg" role="tablist">
          <button role="tab" aria-selected={tab === 'list'} className={tab === 'list' ? 'on' : ''} onClick={() => setTab('list')}><UIcon n="list" size={17} />{t('evRem')}</button>
          <button role="tab" aria-selected={tab === 'alarms'} className={tab === 'alarms' ? 'on' : ''} onClick={() => setTab('alarms')}><TypeShape type="sveglia" color="currentColor" size={14} />{t('alarms')}</button>
        </div>
      </div>
      {tab === 'list' && (
        <>
          <div className="pad-x ag-tools">
            <div className="search"><UIcon n="search" size={18} color="var(--muted)" /><input value={q} aria-label={t('searchPh')} placeholder={t('searchPh')} onChange={(e) => setQ(e.target.value)} /></div>
            <div className="chips">
              {[['evento', 'events'], ['promemoria', 'reminders']].map(([v, k]) => {
                const on = types.includes(v);
                return <button key={v} className={'chip' + (on ? ' on' : '')} aria-pressed={on} onClick={() => { const n = on ? types.filter((x) => x !== v) : [...types, v]; if (n.length) setTypes(n); }}><TypeShape type={v} color="currentColor" size={12} />{t(k)}</button>;
              })}
              <select className="chip sel" value={cat} aria-label={t('category')} onChange={(e) => setCat(e.target.value)}>
                <option value="">{t('allCats')}</option>
                {tops.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                <option value="__none">{t('unassigned')}</option>
              </select>
              <button className={'chip' + (past ? ' on' : '')} aria-pressed={past} onClick={() => setPast(!past)}>{t('past')}</button>
            </div>
          </div>
          {!days.length && <p className="muted pad">{t('empty')}</p>}
          {days.map((g) => (
            <section key={g.d} className="ag-day">
              <h3 className={g.d === today ? 'today' : ''}>{fmtHead(g.d, 999)}</h3>
              <div className="card list">
                {g.list.map((o) => {
                  const it = o.it, tn = catTone(st.cats, it.cat), done = isDone(it, o.date);
                  return (
                    <button key={o.key} className="li ag-row" onClick={() => onOpen(o)}>
                      <span className="ag-time">{it.start == null ? t('allDayShort') : o.date === it.date || !isMulti(it) ? fmtTime(it.start) : ''}</span>
                      <span className="ag-bar" style={{ background: tn.c }} />
                      <span className="li-t col"><span className={done && it.type === 'promemoria' && !it.onlyAlert ? 'strike' : ''}>{it.title || t('noTitle')}</span><small>{catLabel(st.cats, it.cat)}{isMulti(it) ? ' - ' + fmtRange(o.date, o.end) : ''}</small></span>
                      <TypeShape type={it.type} only={it.onlyAlert} done={done} color={tn.c} size={12} />
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
          <div className="pad-x"><button className="btn wide" onClick={() => setSpan(span + 120)}>{t('showMore')}</button></div>
        </>
      )}
      {tab === 'alarms' && (
        <div className="al-wrap">
          {groups.map(groupCard)}
          {groupCard(null)}
          {!alarms.length && !groups.length && <p className="muted pad">{t('noAlarms')}</p>}
          <div className="pad-x"><button className="btn wide" onClick={addGroup}><UIcon n="plus" size={18} color="var(--tealInk)" />{t('newGroup')}</button></div>
          {st.settings.alarmTips !== false && tpls.length > 0 && (
            <section className="al-tpl">
              <div className="al-gh"><h3>{t('suggested')}</h3><button className="lnk sm" onClick={() => onSetting({ alarmTips: false })}>{t('hideTips')}</button></div>
              <p className="muted sm-p">{t('tplTxt')}</p>
              {tpls.map((x) => (
                <div key={x.key} className="tpl">
                  <div className="li-t col"><b>{LANG === 'en' ? x.en : x.name}</b><small>{x.items.map((a) => `${toHHMM(a.start)} ${a.title}`).join(', ')}</small></div>
                  <button className="ctl txt" onClick={() => onAddTemplate(x)}>{t('add')}</button>
                </div>
              ))}
            </section>
          )}
          <p className="muted sm-p pad">{t('alarmNote')}</p>
        </div>
      )}
    </Screen>
  );
}

/* ============ Sincronizzazione con Dropbox (cartella dell'app, file /hora.json) ============ */
/* Chiave dell'app Dropbox (App key, pubblica: con PKCE non serve il segreto). Vuota finché non viene fornita. */
const DBX_KEY = '';
const DBX = 'hora.dbx', UPD = 'hora.upd';
const dbxGet = () => { try { return JSON.parse(localStorage.getItem(DBX)) || {}; } catch (e) { return {}; } };
const dbxSet = (p) => { const v = { ...dbxGet(), ...p }; try { localStorage.setItem(DBX, JSON.stringify(v)); } catch (e) { /* niente */ } return v; };
const localUpd = () => { try { return +localStorage.getItem(UPD) || 0; } catch (e) { return 0; } };
const setLocalUpd = (v) => { try { localStorage.setItem(UPD, String(v)); } catch (e) { /* niente */ } };
const dbxLinked = () => !!(DBX_KEY && dbxGet().refresh);
const redirectUri = () => location.origin + location.pathname;
const b64url = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
async function dbxLink() {
  const v = b64url(crypto.getRandomValues(new Uint8Array(48)));
  const ch = b64url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(v)));
  sessionStorage.setItem('hora.dbx.v', v);
  location.href = 'https://www.dropbox.com/oauth2/authorize?' + new URLSearchParams({ client_id: DBX_KEY, response_type: 'code', code_challenge: ch, code_challenge_method: 'S256', redirect_uri: redirectUri(), token_access_type: 'offline' });
}
async function dbxToken(params) {
  const r = await fetch('https://api.dropboxapi.com/oauth2/token', { method: 'POST', body: new URLSearchParams({ client_id: DBX_KEY, ...params }) });
  if (!r.ok) throw new Error('token');
  const j = await r.json();
  return dbxSet({ access: j.access_token, exp: Date.now() + ((j.expires_in || 14400) - 60) * 1000, ...(j.refresh_token ? { refresh: j.refresh_token } : null) });
}
/* ritorno da Dropbox dopo l'autorizzazione (?code=...) */
async function dbxFinish() {
  if (typeof location === 'undefined' || !DBX_KEY) return false;
  const code = new URLSearchParams(location.search).get('code');
  let v = null;
  try { v = sessionStorage.getItem('hora.dbx.v'); } catch (e) { /* niente */ }
  if (!code || !v) return false;
  try { history.replaceState(null, '', location.pathname); sessionStorage.removeItem('hora.dbx.v'); } catch (e) { /* niente */ }
  await dbxToken({ code, grant_type: 'authorization_code', redirect_uri: redirectUri(), code_verifier: v });
  return true;
}
async function dbxAccess() {
  const d = dbxGet();
  if (!d.refresh) throw new Error('nolink');
  if (d.access && d.exp > Date.now()) return d.access;
  return (await dbxToken({ grant_type: 'refresh_token', refresh_token: d.refresh })).access;
}
async function dbxDown() {
  const a = await dbxAccess();
  const r = await fetch('https://content.dropboxapi.com/2/files/download', { method: 'POST', headers: { Authorization: 'Bearer ' + a, 'Dropbox-API-Arg': JSON.stringify({ path: '/hora.json' }) } });
  if (r.status === 409) return null;
  if (!r.ok) throw new Error('down');
  return r.json();
}
async function dbxUp(data) {
  const a = await dbxAccess();
  const r = await fetch('https://content.dropboxapi.com/2/files/upload', { method: 'POST', headers: { Authorization: 'Bearer ' + a, 'Content-Type': 'application/octet-stream', 'Dropbox-API-Arg': JSON.stringify({ path: '/hora.json', mode: 'overwrite', mute: true }) }, body: JSON.stringify(data) });
  if (!r.ok) throw new Error('up');
}
async function dbxUnlink() {
  try { const a = await dbxAccess(); await fetch('https://api.dropboxapi.com/2/auth/token/revoke', { method: 'POST', headers: { Authorization: 'Bearer ' + a } }); } catch (e) { /* niente */ }
  try { localStorage.removeItem(DBX); } catch (e) { /* niente */ }
}

/* ============ Impostazioni: elenco in alto, poi gruppi su un solo fondo tenue ============ */
function SGroup({ icon, title, children }) {
  return (
    <section className="sgroup">
      <h3 className="sg-h"><span className="sg-i"><UIcon n={icon} size={16} sw={2} /></span>{title}</h3>
      <div className="sg-list">{children}</div>
    </section>
  );
}
const SIcon = ({ n }) => <span className="si"><UIcon n={n} size={18} sw={1.8} /></span>;
function SettingsScreen({ st, sync, onBack, onCats, onAgenda, onAi, onSetting, onNotify, onMyPos, onExportJson, onImportJson, onExportIcs, onImportCal, onSyncNow, onLink, onUnlink }) {
  const jRef = useRef(null), iRef = useRef(null);
  const sun = st.settings.sun || DEFAULT_SUN;
  const known = PLACES.some((p) => p[0] === sun.name);
  const readFile = (e, cb) => { const f = e.target.files && e.target.files[0]; e.target.value = ''; if (!f) return; const r = new FileReader(); r.onload = () => cb(String(r.result)); r.readAsText(f); };
  const th = st.settings.theme || 'auto';
  const nAl = st.items.filter((it) => it.type === 'sveglia').length;
  const nEv = st.items.filter((it) => it.type !== 'sveglia').length;
  return (
    <Screen title={t('settings')} onBack={onBack}>
      <div className="s-top">
        <button className="s-tile" onClick={() => onAgenda('list')}><UIcon n="list" size={20} /><b>{t('evRem')}</b><small>{nEv}</small></button>
        <button className="s-tile" onClick={() => onAgenda('alarms')}><TypeShape type="sveglia" color="currentColor" size={18} /><b>{t('alarms')}</b><small>{nAl}</small></button>
      </div>
      <SGroup icon="palette" title={t('sLook')}>
        <div className="li"><SIcon n="moon" /><span className="li-t">{t('theme')}</span>
          <div className="seg mini-seg" role="group" aria-label={t('theme')}>
            {[['auto', 'thAuto'], ['light', 'thLight'], ['dark', 'thDark']].map(([v, k]) => <button key={v} className={th === v ? 'on' : ''} onClick={() => onSetting({ theme: v })}>{t(k)}</button>)}
          </div>
        </div>
        <div className="li"><SIcon n="tap" /><span className="li-t col"><span>{t('sSplash')}</span><small>{t('sSplashTxt')}</small></span><Switch on={st.settings.splash !== false} label={t('sSplash')} onChange={(v) => onSetting({ splash: v })} /></div>
        <div className="li"><SIcon n="globe" /><span className="li-t">{t('sLang')}</span>
          <div className="seg mini-seg" role="group" aria-label={t('sLang')}>
            <button className={st.settings.lang === 'it' ? 'on' : ''} onClick={() => onSetting({ lang: 'it' })}>Italiano</button>
            <button className={st.settings.lang === 'en' ? 'on' : ''} onClick={() => onSetting({ lang: 'en' })}>English</button>
          </div>
        </div>
      </SGroup>
      <SGroup icon="cal" title={t('sCal')}>
        <div className="li"><SIcon n="swipe" /><span className="li-t col"><span>{t('sFree')}</span><small>{t('sFreeTxt')}</small></span><Switch on={!!st.settings.freeScroll} label={t('sFree')} onChange={(v) => onSetting({ freeScroll: v })} /></div>
        <div className="li"><SIcon n="sunrise" /><span className="li-t col"><span>{t('sSun')}</span><small>{t('sSunTxt')}</small></span><Switch on={!!sun.on} label={t('sSunOn')} onChange={(v) => onSetting({ sun: { ...sun, on: v } })} /></div>
        {sun.on && (
          <>
            <label className="li"><SIcon n="pin" /><span className="li-t">{t('place')}</span>
              <select className="li-sel" value={known ? sun.name : '__here'} onChange={(e) => { const p = PLACES.find((x) => x[0] === e.target.value); if (p) onSetting({ sun: { on: true, name: p[0], lat: p[1], lon: p[2] } }); }}>
                {PLACES.map(([n]) => <option key={n} value={n}>{n}</option>)}
                {!known && <option value="__here">{t('posHere')}</option>}
              </select>
            </label>
            <button className="li teal-t" onClick={onMyPos}><SIcon n="globe" />{t('myPos')}</button>
          </>
        )}
        <div className="li"><SIcon n="bell" /><span className="li-t col"><span>{t('sNotifyOn')}</span><small>{t('sNotifyTxt')}</small></span><Switch on={!!st.settings.notify} label={t('sNotifyOn')} onChange={onNotify} /></div>
      </SGroup>
      <SGroup icon="tag" title={t('sCats') + ' - ' + t('gantt2')}>
        <button className="li" onClick={onCats}><SIcon n="tag" /><span className="li-t col"><span className="b">{t('sCats')}</span><small>{t('sCatsTxt')}</small></span><span className="num">{st.cats.length}</span><UIcon n="right" size={14} sw={2.4} color="var(--muted)" /></button>
        <div className="li"><SIcon n="gantt" /><span className="li-t">{t('showUnassigned')}</span><Switch on={!!st.settings.ganttUnassigned} label={t('showUnassigned')} onChange={(v) => onSetting({ ganttUnassigned: v })} /></div>
      </SGroup>
      <SGroup icon="cloud" title={t('sSync')}>
        {!DBX_KEY && <div className="li"><SIcon n="cloud" /><span className="li-t col"><span>Dropbox</span><small>{t('dbxNoKey')}</small></span><span className="tag">{t('soon')}</span></div>}
        {DBX_KEY && !sync.linked && <button className="li teal-t" onClick={onLink}><SIcon n="cloud" />{t('dbxLink')}</button>}
        {DBX_KEY && sync.linked && (
          <>
            <button className="li" onClick={onSyncNow}><SIcon n="cloud" /><span className="li-t col"><span>{t('dbxSync')}</span><small>{sync.busy ? t('syncing') : sync.last ? t('lastSync', { d: new Date(sync.last).toLocaleString(LANG === 'en' ? 'en-GB' : 'it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) }) : t('never')}</small></span></button>
            <button className="li" onClick={onUnlink}><SIcon n="x" /><span className="li-t">{t('dbxUnlink')}</span></button>
          </>
        )}
      </SGroup>
      <SGroup icon="download" title={t('sData')}>
        <button className="li" onClick={onExportJson}><SIcon n="download" /><span className="li-t">{t('expJson')}</span></button>
        <button className="li" onClick={() => jRef.current.click()}><SIcon n="upload" /><span className="li-t">{t('impJson')}</span></button>
        <button className="li" onClick={onExportIcs}><SIcon n="download" /><span className="li-t">{t('expIcs')}</span></button>
        <button className="li" onClick={() => iRef.current.click()}><SIcon n="upload" /><span className="li-t">{t('impIcs')}</span></button>
        <button className="li" onClick={onAi}><SIcon n="ai" /><span className="li-t col"><span>{t('aiImport')}</span><small>{t('aiShort')}</small></span><UIcon n="right" size={14} sw={2.4} color="var(--muted)" /></button>
        <input ref={jRef} type="file" accept=".json,application/json" hidden onChange={(e) => readFile(e, onImportJson)} />
        <input ref={iRef} type="file" accept=".ics,.zip,text/calendar,application/zip" hidden onChange={(e) => { const fl = e.target.files && e.target.files[0]; e.target.value = ''; if (fl) onImportCal(fl); }} />
      </SGroup>
      <div className="about">
        <Mark size={36} dark={isDark()} />
        <div><b className="wm">hora</b> {VERSION}</div>
        <small>{t('splashSub')}</small>
        <small>{t('localTxt')}</small>
        <small><b>nautargo</b></small>
      </div>
    </Screen>
  );
}


/* ============ App ============ */
function download(name, text, type) {
  const b = new Blob([text], { type });
  const u = URL.createObjectURL(b);
  const a = document.createElement('a');
  a.href = u; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(u), 1500);
}
function systemNotify(body, tag) {
  try {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((r) => r.showNotification('hora', { body, tag, icon: 'icon-192.png', badge: 'icon-192.png' })).catch(() => {});
    } else new Notification('hora', { body, tag, icon: 'icon-192.png' });
  } catch (e) { /* niente */ }
}
const sysLang = () => { try { return (navigator.language || 'it').toLowerCase().startsWith('it') ? 'it' : 'en'; } catch (e) { return 'it'; } };
const SX_BUF = 14;
const CheckMark = () => <svg width="13" height="13" viewBox="0 0 12 12"><path d="M2.5 6.2l2.2 2.2 4.8-4.8" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>;

/* ============ Filtro: tipi e categorie ============ */
function FilterSheet({ st, filter, onChange, onClose }) {
  const tog = (arr, v) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const tops = st.cats.filter((c) => !c.parent).sort(byOrder);
  const row = (c, sub) => {
    const on = filter.cats.includes(c.id);
    return (
      <button key={c.id} className={'li' + (sub ? ' sub' : '')} role="checkbox" aria-checked={on} onClick={() => onChange({ ...filter, cats: tog(filter.cats, c.id) })}>
        {sub ? <span className="dot" style={{ background: catTone(st.cats, c.id).c }} /> : <CatTile cats={st.cats} id={c.id} size={26} />}
        <span className={'li-t' + (sub ? '' : ' b') + (c.id === '__none' ? ' muted' : '')}>{c.name}</span>
        <span className={'cb' + (on ? ' on' : '')}>{on && <CheckMark />}</span>
      </button>
    );
  };
  return (
    <Sheet onClose={onClose} label={t('filter')}>
      <SheetHead title={t('filter')} onClose={onClose} />
      <div className="sh-body">
        <div className="lbl">{t('types')}</div>
        <div className="chips">
          {[['evento', 'events'], ['promemoria', 'reminders'], ['sveglia', 'alarms']].map(([v, k]) => {
            const on = filter.types.includes(v);
            return <button key={v} className={'chip' + (on ? ' on' : '')} aria-pressed={on} onClick={() => { const ts = tog(filter.types, v); if (ts.length) onChange({ ...filter, types: ts }); }}><TypeShape type={v} color={on ? 'var(--tealDeep)' : 'var(--muted)'} size={12} />{t(k)}</button>;
          })}
        </div>
        <div className="lbl">{t('categories')}</div>
        <div className="list">
          {tops.map((top) => [row(top, false), ...st.cats.filter((c) => c.parent === top.id).sort(byOrder).map((s) => row(s, true))])}
          {row({ id: '__none', name: t('unassigned') }, false)}
        </div>
        <p className="muted sm-p pt8">{t('filterCatTxt')}</p>
      </div>
      <div className="sh-foot">
        <button className="btn" onClick={() => onChange(NO_FILTER)}>{t('showAll')}</button>
        <button className="btn pri grow" onClick={onClose}>{t('done')}</button>
      </div>
    </Sheet>
  );
}

export function App() {
  const [st, setSt] = useState(() => { const s0 = loadState() || defaultState(sysLang()); return s0.alarmGroups ? s0 : { ...s0, alarmGroups: [] }; });
  setLang(st.settings.lang || 'it');
  /* tema: automatico (come il sistema), chiaro o scuro */
  const [sysDark, setSysDark] = useState(() => { try { return window.matchMedia('(prefers-color-scheme: dark)').matches; } catch (e) { return false; } });
  useEffect(() => {
    let mq = null;
    try { mq = window.matchMedia('(prefers-color-scheme: dark)'); } catch (e) { return undefined; }
    const on = (e) => setSysDark(e.matches);
    if (mq.addEventListener) mq.addEventListener('change', on); else if (mq.addListener) mq.addListener(on);
    return () => { if (mq.removeEventListener) mq.removeEventListener('change', on); else if (mq.removeListener) mq.removeListener(on); };
  }, []);
  const theme = st.settings.theme === 'dark' || (st.settings.theme !== 'light' && sysDark) ? 'dark' : 'light';
  setTheme(theme);
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    const m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute('content', theme === 'dark' ? '#0F1A20' : '#F3F4F1');
  }, [theme]);
  useEffect(() => { saveState(st); }, [st]);
  const stRef = useRef(st);
  stRef.current = st;

  const [splash, setSplash] = useState(() => st.settings.splash !== false);
  const [view, setView] = useState('grid');
  const [days, setDays] = useState(1);
  const [anchor, setAnchor] = useState(todayStr());
  const [filter, setFilter] = useState(NO_FILTER);
  const [filterOpen, setFilterOpen] = useState(false);
  const [hourH, setHourH] = useState(st.settings.hourH || 48);
  /* blocco nuovo disegnato nel calendario: si completa con un tocco o con il + */
  const [draft, setDraft] = useState(null);
  useEffect(() => { setDraft(null); }, [view, days]);
  const [nonce, setNonce] = useState(0);
  const [sheet, setSheet] = useState(null);
  const [picker, setPicker] = useState(null);
  const [ganttCats, setGanttCats] = useState(false);
  const [stack, setStack] = useState([]);
  const [confirm, setConfirm] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const toastT = useRef(null);
  const fabRef = useRef(null), mainRef = useRef(null);
  const today = todayStr();

  const toast = (m) => { setToastMsg(m); clearTimeout(toastT.current); toastT.current = setTimeout(() => setToastMsg(null), 2600); };
  const setSettings = (p) => setSt((s) => ({ ...s, settings: { ...s.settings, ...p } }));
  const setCats = (cats) => setSt((s) => ({ ...s, cats }));
  const push = (sc) => setStack((s) => [...s, sc]);
  const pop = () => setStack((s) => s.slice(0, -1));
  const commitHourH = () => setSettings({ hourH: Math.round(hourHRef.current) });
  const hourHRef = useRef(hourH);
  hourHRef.current = hourH;

  /* filtro (le categorie eliminate escono da sole) */
  const fx = useMemo(() => ({ ...filter, cats: filter.cats.filter((id) => id === '__none' || catOf(st.cats, id)) }), [filter, st.cats]);
  const pass = useMemo(() => makePass(fx, st.cats), [fx, st.cats]);
  const newCat = useMemo(() => filterCat(fx, st.cats), [fx, st.cats]);
  const fOn = filterOn(fx);

  /* elementi */
  const saveItem = (it) => setSt((s) => {
    const prev = s.items.find((x) => x.id === it.id);
    const next = { ...it, doneDates: prev ? prev.doneDates : it.doneDates || {} };
    return { ...s, items: prev ? s.items.map((x) => (x.id === it.id ? next : x)) : [...s.items, next] };
  });
  const toggleDone = (it, d) => setSt((s) => ({
    ...s,
    items: s.items.map((x) => {
      if (x.id !== it.id) return x;
      const dd = { ...(x.doneDates || {}) };
      if (dd[d]) delete dd[d]; else dd[d] = true;
      return { ...x, doneDates: dd };
    })
  }));
  const askDelete = (it) => setConfirm({
    q: t('delItemQ'), txt: it.repeat && it.repeat.f !== 'none' ? t('delItemRep') : null, ok: t('del'), danger: true,
    onOk: () => { setSt((s) => ({ ...s, items: s.items.filter((x) => x.id !== it.id) })); setSheet(null); setConfirm(null); toast(t('deleted')); }
  });

  /* categorie */
  const remember = (id) => { if (id) setSettings({ recent: [id, ...(stRef.current.settings.recent || []).filter((x) => x !== id)].slice(0, 6) }); };
  const upsertCat = (c) => setSt((s) => {
    const exists = s.cats.some((x) => x.id === c.id);
    if (exists) return { ...s, cats: s.cats.map((x) => (x.id === c.id ? c : x)) };
    const sib = s.cats.filter((x) => (x.parent || null) === (c.parent || null));
    return { ...s, cats: [...s.cats, { ...c, order: sib.length ? Math.max(...sib.map((x) => x.order ?? 0)) + 1 : 0 }] };
  });
  const createCat = (name) => {
    const c = { id: uid(), name, icon: 'tag', color: nextColor(stRef.current.cats), details: '', parent: null, order: null, gantt: true };
    upsertCat(c);
    return c.id;
  };
  const askDeleteCat = (c) => {
    const hasSubs = st.cats.some((x) => x.parent === c.id);
    setConfirm({
      q: t('delCatQ'), txt: hasSubs ? t('delCatSubsTxt') : t('delCatTxt'), ok: t('del'), danger: true,
      onOk: () => {
        setSt((s) => {
          const ids = catFamily(s.cats, c.id);
          return { ...s, cats: s.cats.filter((x) => !ids.includes(x.id)), items: s.items.map((it) => (ids.includes(it.cat) ? { ...it, cat: null } : it)) };
        });
        setConfirm(null);
        setStack((s) => s.filter((x) => !(x.kind === 'cat' && (x.id === c.id || (x.parentId === c.id)))));
        toast(t('deleted'));
      }
    });
  };
  const openPicker = (current, cb) => setPicker({ current, cb });

  /* blocchi e importazioni */
  const openBlock = (text, origin) => {
    const drafts = parseBlock(text, stRef.current.cats);
    setSheet(null);
    push({ kind: 'import', drafts, origin });
  };
  const confirmImport = (rows) => {
    setSt((s) => {
      let cats = [...s.cats];
      const find = (name, parent) => cats.find((c) => (c.parent || null) === parent && norm(c.name) === norm(name));
      const make = (name, parent) => {
        const sib = cats.filter((c) => (c.parent || null) === parent);
        const c = { id: uid(), name, icon: 'tag', color: parent ? null : nextColor(cats), details: '', parent, order: sib.length ? Math.max(...sib.map((x) => x.order ?? 0)) + 1 : 0, gantt: true };
        cats.push(c);
        return c;
      };
      const items = rows.map((r) => {
        let cat = r.type === 'sveglia' ? null : r.cat || null;
        if (r.type !== 'sveglia' && r.missing && r.missing.length) {
          const top = find(r.missing[0], null) || make(r.missing[0], null);
          cat = top.id;
          if (r.missing[1]) cat = (find(r.missing[1], top.id) || make(r.missing[1], top.id)).id;
        }
        const p = { type: r.type, title: r.title, date: r.date, endDate: r.endDate || null, start: r.start ?? null, end: r.end ?? null, alert: r.alert ?? null, repeat: r.repeat || { ...NO_REPEAT }, address: r.address || '', link: r.link || '', notes: r.notes || '', cat };
        if (r.onlyAlert) p.onlyAlert = true;
        if (r.icsUid) p.icsUid = r.icsUid;
        return newItem(p);
      });
      return { ...s, cats, items: [...s.items, ...items] };
    });
    setStack((s) => s.filter((x) => x.kind !== 'import'));
    if (rows.length) setAnchor(rows.map((r) => r.date).sort()[0]);
    toast(rows.length === 1 ? t('addedOne') : t('added', { n: rows.length }));
  };
  const importCal = async (file) => {
    try {
      const drafts = /\.zip$/i.test(file.name) ? await parseZip(await file.arrayBuffer()) : parseICS(await file.text());
      const s0 = stRef.current;
      const uids = new Set(s0.items.map((x) => x.icsUid).filter(Boolean));
      const sig = new Set(s0.items.map((x) => `${x.title}|${x.date}|${x.start}`));
      push({
        kind: 'import', origin: 'ics',
        drafts: drafts.map((d) => { const r = resolveCat(d.catPath, s0.cats); return { ...d, cat: r.cat, missing: r.missing, dup: !!(d.icsUid && uids.has(d.icsUid)) || sig.has(`${d.title}|${d.date}|${d.start}`) }; })
      });
    } catch (e) { toast(t('badFile')); }
  };
  useEffect(() => {
    const check = () => {
      const h = location.hash;
      if (!h.startsWith('#aggiungi=')) return;
      let txt = h.slice(10);
      try { txt = decodeURIComponent(txt.replace(/\+/g, ' ')); } catch (e) { /* testo grezzo */ }
      try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* niente */ }
      setStack([{ kind: 'import', drafts: parseBlock(txt, stRef.current.cats), origin: 'link' }]);
    };
    check();
    window.addEventListener('hashchange', check);
    return () => window.removeEventListener('hashchange', check);
  }, []);

  /* avvisi e sveglie con l'app aperta */
  const fired = useRef(new Set());
  /* nuova versione pubblicata: avviso con Ricarica */
  const [newVer, setNewVer] = useState(null);
  useEffect(() => {
    const check = () => {
      if (typeof fetch !== 'function' || location.protocol !== 'https:') return;
      fetch('version.json?t=' + Date.now(), { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)).then((j) => { if (j && j.v && j.v !== VERSION) setNewVer(j.v); }).catch(() => {});
    };
    check();
    const iv = setInterval(check, 30 * 60000);
    const vis = () => { if (document.visibilityState === 'visible') check(); };
    document.addEventListener('visibilitychange', vis);
    return () => { clearInterval(iv); document.removeEventListener('visibilitychange', vis); };
  }, []);
  const reloadApp = () => {
    const go = () => location.reload();
    try { if (navigator.serviceWorker) navigator.serviceWorker.getRegistration().then((r) => (r ? r.update() : null)).then(go, go); else go(); } catch (e) { go(); }
  };
  /* sincronizzazione con Dropbox: chi è più recente vince, se sono cambiati entrambi si chiede */
  const [sync, setSync] = useState(() => ({ linked: dbxLinked(), busy: false, last: dbxGet().last || 0 }));
  const fromSync = useRef(false), firstData = useRef(true), syncT = useRef(null);
  const applyRemote = (r) => { fromSync.current = true; setSt((s) => ({ ...s, items: r.items || [], cats: r.cats || [], alarmGroups: r.alarmGroups || [] })); setLocalUpd(r.updated || Date.now()); };
  const doSync = async (manual) => {
    if (!dbxLinked()) return;
    setSync((x) => ({ ...x, busy: true }));
    try {
      const remote = await dbxDown();
      const last = dbxGet().last || 0, l = localUpd(), r = remote ? remote.updated || 0 : 0;
      const s0 = stRef.current, data = { app: 'hora', version: VERSION, updated: l || Date.now(), items: s0.items, cats: s0.cats, alarmGroups: s0.alarmGroups || [] };
      if (!remote || (l > r && r <= last)) { await dbxUp(data); dbxSet({ last: data.updated }); }
      else if (r > l && l <= last) { applyRemote(remote); dbxSet({ last: r }); }
      else if (r !== l && r > last && l > last) {
        setConfirm({ q: t('syncConflictQ'), txt: t('syncConflictTxt'), ok: t('useDbx'), cancel: t('useHere'),
          onOk: () => { applyRemote(remote); dbxSet({ last: r }); setConfirm(null); },
          onCancelAlt: async () => { setConfirm(null); try { await dbxUp(data); dbxSet({ last: data.updated }); } catch (e) { toast(t('syncFail')); } } });
      }
      setSync({ linked: true, busy: false, last: Date.now() });
      if (manual) toast(t('syncOk'));
    } catch (e) { setSync((x) => ({ ...x, busy: false })); if (manual) toast(t('syncFail')); }
  };
  useEffect(() => {
    dbxFinish().then((ok) => { if (ok) setSync((x) => ({ ...x, linked: true })); if (dbxLinked()) doSync(false); }).catch(() => toast(t('syncFail')));
    const vis = () => { if (document.visibilityState === 'visible') doSync(false); };
    document.addEventListener('visibilitychange', vis);
    return () => document.removeEventListener('visibilitychange', vis);
  }, []);
  useEffect(() => {
    if (firstData.current) { firstData.current = false; return; }
    if (fromSync.current) { fromSync.current = false; return; }
    setLocalUpd(Date.now());
    if (!dbxLinked()) return;
    clearTimeout(syncT.current);
    syncT.current = setTimeout(() => doSync(false), 4000);
  }, [st.items, st.cats, st.alarmGroups]);
  useEffect(() => {
    if (!st.settings.notify) return;
    const check = () => {
      const td = todayStr(), nm = nowMin();
      for (const o of expand(stRef.current.items, td, addDays(td, 1))) {
        const it = o.it;
        if (it.alert == null || it.off || fired.current.has(o.key)) continue;
        const at = diffDays(td, o.date) * 1440 + (it.start ?? 540) - it.alert;
        if (nm >= at && nm < at + 10) {
          fired.current.add(o.key);
          const body = (it.start != null ? fmtTime(it.start) + ' - ' : '') + (it.title || t('alarm'));
          toast(body);
          systemNotify(body, o.key);
        }
      }
    };
    check();
    const iv = setInterval(check, 30000);
    return () => clearInterval(iv);
  }, [st.settings.notify]);
  const onNotify = (v) => {
    if (!v) { setSettings({ notify: false }); return; }
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission().then((p) => { setSettings({ notify: true }); if (p !== 'granted') toast(t('notifyBlocked')); }).catch(() => setSettings({ notify: true }));
    } else setSettings({ notify: true });
  };
  const onMyPos = () => {
    if (!navigator.geolocation) { toast(t('posFail')); return; }
    navigator.geolocation.getCurrentPosition(
      (p) => setSettings({ sun: { on: true, name: '__here', lat: Math.round(p.coords.latitude * 100) / 100, lon: Math.round(p.coords.longitude * 100) / 100 } }),
      () => toast(t('posFail')), { timeout: 10000, maximumAge: 3600000 });
  };

  /* il + diventa quasi trasparente mentre ci si muove */
  useEffect(() => {
    const m = mainRef.current;
    let tm = null;
    const on = () => { const f = fabRef.current; if (!f) return; f.classList.add('ghost'); clearTimeout(tm); tm = setTimeout(() => f.classList.remove('ghost'), 700); };
    const mm = (e) => { if (e.buttons) on(); };
    m.addEventListener('scroll', on, true);
    m.addEventListener('touchmove', on, { passive: true });
    m.addEventListener('wheel', on, { passive: true });
    m.addEventListener('mousemove', mm);
    return () => { clearTimeout(tm); m.removeEventListener('scroll', on, true); m.removeEventListener('touchmove', on); m.removeEventListener('wheel', on); m.removeEventListener('mousemove', mm); };
  }, []);

  /* navigazione: di base si passa al periodo precedente o successivo, a scelta lo scorrimento è continuo */
  const free = !!st.settings.freeScroll;
  const sx = free && view === 'grid';
  const dates = useMemo(() => {
    if (sx) return Array.from({ length: days + 2 * SX_BUF }, (_, i) => addDays(anchor, i - SX_BUF));
    if (days === 7) { const s = startOfWeek(anchor); return Array.from({ length: 7 }, (_, i) => addDays(s, i)); }
    return Array.from({ length: days }, (_, i) => addDays(anchor, i));
  }, [days, anchor, sx]);
  const vis = useMemo(() => (sx ? dates.slice(SX_BUF, SX_BUF + days) : dates), [dates, days, sx]);
  const sunCfg = st.settings.sun || DEFAULT_SUN;
  const sun = useMemo(() => (sunCfg.on ? sunAvg(vis, sunCfg.lat, sunCfg.lon) : null), [vis, sunCfg.on, sunCfg.lat, sunCfg.lon]);
  const gScale = st.settings.ganttScale || 'week';
  const step = (dir) => {
    if (view === 'grid') setAnchor((a) => addDays(a, dir * days));
    else if (view === 'month') setAnchor((a) => addMonths(a, dir));
    else setAnchor((a) => (gScale === 'week' ? addDays(a, dir * 28) : addMonths(a, dir * 3)));
  };
  const goToday = () => { const td = todayStr(); setAnchor(view === 'grid' && (days === 7 || (days === 5 && wd(td) < 5)) ? startOfWeek(td) : td); setNonce((n) => n + 1); };
  /* 5 giorni: da lunedì (nel fine settimana, la settimana che arriva); settimana continua: da lunedì */
  const toDays = (n) => {
    if (n === 5) setAnchor((a) => (wd(a) > 4 ? addDays(startOfWeek(a), 7) : startOfWeek(a)));
    else if (n === 7 && sx) setAnchor((a) => startOfWeek(a));
    setDays(n);
  };
  /* pizzico: 1, 3, 5, 7 giorni, poi Mese */
  const pinchDays = (dir) => {
    const seq = [1, 3, 5, 7];
    let i = seq.indexOf(days);
    if (i < 0) i = seq.indexOf(3);
    if (dir > 0) { if (i < seq.length - 1) toDays(seq[i + 1]); else setView('month'); }
    else if (i > 0) toDays(seq[i - 1]);
  };
  const [gRange, setGRange] = useState(null);
  let title;
  if (view === 'grid') title = fmtSpan(vis[0], vis[vis.length - 1]);
  else if (view === 'month') title = fmtMonthYear(anchor);
  else title = gRange ? fmtSpan(gRange[0], gRange[1]) : fmtMonthYear(anchor);
  /* viste: solo icone quando i nomi non ci stanno */
  const navRef = useRef(null);
  const [compact, setCompact] = useState(false);
  useLayoutEffect(() => {
    const m = () => { const n = navRef.current; if (n) setCompact(n.clientWidth < 330); };
    m();
    window.addEventListener('resize', m);
    return () => window.removeEventListener('resize', m);
  }, []);
  const goDate = (v) => { if (!v) return; setAnchor(v); setNonce((n) => n + 1); };
  const [datePick, setDatePick] = useState(false);
  const openPick = () => setDatePick(true);
  const lpTitle = useLongPress(openPick, openPick);
  const lpToday = useLongPress(openPick, () => goToday());
  const lpPrev = useLongPress(openPick, () => step(-1));
  const lpNext = useLongPress(openPick, () => step(1));

  const openOcc = (o) => setSheet({ item: o.it, occDate: o.date, isNew: false });
  const newDate = () => (view === 'gantt' ? today : view === 'month' ? anchor : vis.includes(today) ? today : vis[0]);
  const newSheet = (autoMic) => setSheet({ item: newItem({ date: newDate(), cat: newCat }), isNew: true, autoMic });
  const onNewAt = (d) => setSheet({ item: newItem({ date: d.date, start: d.start, end: d.end, cat: newCat }), isNew: true, preset: true });
  const onSaveSheet = (it) => {
    const isNew = sheet && sheet.isNew;
    saveItem(it);
    setSheet(null);
    toast(isNew ? t('addedOne') : t('savedOk'));
    if (view !== 'gantt' && !(view === 'grid' ? vis.includes(it.date) : it.date.slice(0, 7) === anchor.slice(0, 7))) setAnchor(days === 5 ? startOfWeek(it.date) : it.date);
  };

  const renderScreen = (sc, i) => {
    if (sc.kind === 'settings') return (
      <SettingsScreen key={i} st={st} onBack={pop} onCats={() => push({ kind: 'cats' })} onSetting={setSettings} onNotify={onNotify} onMyPos={onMyPos}
        onExportJson={() => download(`hora-backup-${todayStr()}.json`, JSON.stringify({ app: 'hora', version: VERSION, ...st }, null, 1), 'application/json')}
        onImportJson={(txt) => {
          let data = null;
          try { data = JSON.parse(txt); } catch (e) { /* niente */ }
          if (!data || !Array.isArray(data.items) || !Array.isArray(data.cats)) { toast(t('badFile')); return; }
          setConfirm({ q: t('restoreQ'), txt: t('restoreTxt'), ok: t('confirm'), onOk: () => { setSt({ v: 1, items: data.items, cats: data.cats, alarmGroups: data.alarmGroups || [], settings: { ...st.settings, ...(data.settings || {}) } }); setConfirm(null); toast(t('restored')); } });
        }}
        onExportIcs={() => download(`hora-${todayStr()}.ics`, toICS(st.items, st.cats), 'text/calendar')}
        onImportCal={importCal} sync={sync} onAgenda={(tab) => push({ kind: 'agenda', tab })} onAi={() => push({ kind: 'ai' })}
        onSyncNow={() => doSync(true)} onLink={() => dbxLink().catch(() => toast(t('syncFail')))} onUnlink={() => { dbxUnlink().then(() => setSync({ linked: false, busy: false, last: 0 })); }} />
    );
    if (sc.kind === 'agenda') return (
      <AgendaScreen key={i} st={st} tab={sc.tab} onBack={pop} onOpen={openOcc} onNewAlarm={(g) => setSheet({ item: newItem({ type: 'sveglia', start: 420, group: g, date: todayStr() }), isNew: true })}
        onSaveItem={saveItem} onSetGroups={(g) => setSt((s) => ({ ...s, alarmGroups: g }))} onSetting={setSettings}
        onAddTemplate={(x) => setSt((s) => {
          const g = { id: uid(), name: LANG === 'en' ? x.en : x.name, order: (s.alarmGroups || []).length, tpl: x.key };
          const its = x.items.map((a) => newItem({ type: 'sveglia', title: a.title, start: a.start, alert: 0, repeat: tplDays(a.days), group: g.id, date: todayStr() }));
          return { ...s, alarmGroups: [...(s.alarmGroups || []), g], items: [...s.items, ...its] };
        })} />
    );
    if (sc.kind === 'ai') return <AiImportScreen key={i} onBack={pop} toast={toast} onRead={(txt) => openBlock(txt, 'paste')} />;
    if (sc.kind === 'cats') return <CatsScreen key={i} st={st} onBack={pop} onSetCats={setCats} onEdit={(id) => push({ kind: 'cat', id })} onNew={() => push({ kind: 'cat', id: null, parentId: null })} />;
    if (sc.kind === 'cat') return (
      <CatEdit key={i + (sc.id || 'n') + (sc.parentId || '')} st={st} catId={sc.id} parentId={sc.parentId} onBack={pop} onSave={upsertCat} onDelete={askDeleteCat}
        onOpenSub={(id) => push({ kind: 'cat', id })} onAddSub={(pid) => push({ kind: 'cat', id: null, parentId: pid })} />
    );
    if (sc.kind === 'import') return <ImportScreen key={i} st={st} drafts={sc.drafts} origin={sc.origin} onClose={pop} onConfirm={confirmImport} onPickCat={openPicker} />;
    if (sc.kind === 'search') return <SearchScreen key={i} st={st} onClose={pop} onOpen={(it) => { pop(); setAnchor(days === 5 ? startOfWeek(it.date) : it.date); setSheet({ item: it, occDate: it.date, isNew: false }); }} />;
    return null;
  };

  const dayTab = days === 3 ? t('days3') : days === 5 ? t('days5') : t('day');
  const dayIcon = days === 3 ? 'day3' : days === 5 ? 'day5' : 'day1';
  return (
    <div className="app">
      <header className="hdr">
        <div className={'hdr1' + (compact ? ' compact' : '')}>
          <span className="logo" aria-label="hora"><Mark size={30} /><b className="wm">hora</b></span>
          <nav className="seg tabs" ref={navRef} aria-label={t('views')}>
            <button className={view === 'grid' && days < 7 ? 'on' : ''} aria-label={view === 'grid' ? dayTab : t('day')} onClick={() => { setView('grid'); setDays(1); }}><UIcon n={view === 'grid' ? dayIcon : 'day1'} size={18} sw={1.7} /><span>{view === 'grid' ? dayTab : t('day')}</span></button>
            <button className={view === 'grid' && days === 7 ? 'on' : ''} aria-label={t('week')} onClick={() => { setView('grid'); toDays(7); }}><UIcon n="week" size={18} sw={1.7} /><span>{t('week')}</span></button>
            <button className={view === 'month' ? 'on' : ''} aria-label={t('month')} onClick={() => setView('month')}><UIcon n="month" size={18} sw={1.7} /><span>{t('month')}</span></button>
          </nav>
          <button className={'gbtn' + (view === 'gantt' ? ' on' : '')} aria-label={t('gantt')} aria-pressed={view === 'gantt'} title={t('ganttTxt')} onClick={() => setView('gantt')}><UIcon n="gantt" size={18} sw={2.1} /><span>{t('gantt')}</span></button>
          <button className="ib" aria-label={t('search')} onClick={() => push({ kind: 'search' })}><UIcon n="search" /></button>
          <button className="ib" aria-label={t('settings')} onClick={() => push({ kind: 'settings' })}><UIcon n="gear" /></button>
        </div>
        <div className="hdr2">
          <h1 {...lpTitle} title={t('goDate')}>{title}</h1>
          <div className="row-c gap6">
            {view !== 'gantt' && (
              <button className={'ctl filt' + (fOn ? ' on' : '')} aria-label={t('filter')} aria-pressed={fOn} onClick={() => setFilterOpen(true)}><UIcon n="filter" size={18} />{fOn && <i />}</button>
            )}
            {view === 'gantt' && (
              <button className="ctl date" aria-label={t('goDate')} title={t('goDate')} onClick={openPick}><UIcon n="cal" size={17} /><span>{t('goDate')}</span></button>
            )}
            <button className="ctl txt" {...lpToday}>{t('today')}</button>
            {view !== 'gantt' && (
              <span className="ctl-pair">
                <button className="ctl" aria-label={t('prev')} {...lpPrev}><UIcon n="left" size={17} sw={2.1} /></button>
                <button className="ctl" aria-label={t('next')} {...lpNext}><UIcon n="right" size={17} sw={2.1} /></button>
              </span>
            )}
          </div>
        </div>
      </header>
      <main className="main" ref={mainRef} data-range={view === 'grid' ? vis[0] + '/' + vis[vis.length - 1] : undefined}>
        {view === 'grid' && (
          <GridView st={st} dates={dates} anchor={anchor} sx={sx} visN={days} pass={pass} newCat={newCat} sun={sun} hourH={hourH} setHourH={setHourH} commitHourH={commitHourH} onOpen={openOcc}
            onSave={(it) => saveItem(it)} onToggle={toggleDone} onShift={(dir) => setAnchor((a) => addDays(a, dir * (days === 7 ? 7 : 1)))} onPinchDays={pinchDays}
            onSwipe={step} onVisible={setAnchor} onNewAt={onNewAt} nonce={nonce} draft={draft} setDraft={setDraft} />
        )}
        {view === 'month' && (
          <MonthView st={st} anchor={anchor} pass={pass} titles={!!st.settings.monthTitles} setTitles={(v) => setSettings({ monthTitles: v })} free={free}
            onVisible={(m) => setAnchor((a) => m.slice(0, 8) + pad(Math.min(dnum(a), daysInMonth(m))))}
            onSelect={setAnchor} onOpen={openOcc} onToggle={toggleDone} onOpenDay={(d) => { setAnchor(d); setView('grid'); setDays(1); }}
            onPinchOut={() => { setView('grid'); toDays(7); }} onSwipe={step} />
        )}
        {view === 'gantt' && (
          <GanttView st={st} anchor={anchor} scale={gScale} setScale={(v) => setSettings({ ganttScale: v })} onOpenItem={openOcc} onCats={() => setGanttCats(true)} nonce={nonce}
            onRecenter={setAnchor} onRange={(a, b) => setGRange((r) => (r && r[0] === a && r[1] === b ? r : [a, b]))} />
        )}
      </main>
      <button ref={fabRef} className={'fab' + (draft ? ' ready' : '')} aria-label={t('add')} onClick={() => { if (draft && view === 'grid') { const d = draft; setDraft(null); onNewAt(d); } else newSheet(true); }}><UIcon n="plus" size={26} sw={2.2} /></button>

      {sheet && (
        <ItemSheet key={sheet.item.id} st={st} init={sheet.item} occDate={sheet.occDate} isNew={sheet.isNew} autoMic={sheet.autoMic} preset={sheet.preset}
          onClose={() => setSheet(null)} onSave={onSaveSheet} onDelete={askDelete} onPickCat={openPicker} onBlock={openBlock}
          onToggleDone={toggleDone} toast={toast} />
      )}
      {filterOpen && <FilterSheet st={st} filter={fx} onChange={setFilter} onClose={() => setFilterOpen(false)} />}
      {ganttCats && <GanttCatsSheet st={st} onClose={() => setGanttCats(false)} onSetCats={setCats} onSetting={setSettings} />}
      {stack.map(renderScreen)}
      {picker && (
        <CatPicker st={st} current={picker.current} onClose={() => setPicker(null)} onPick={(id) => { picker.cb(id); remember(id); }}
          onCreate={createCat} onManage={() => { setPicker(null); push({ kind: 'cats' }); }} />
      )}
      {datePick && <DatePicker value={view === 'grid' ? vis[0] : anchor} onPick={(d) => { goDate(view === 'grid' && days === 5 && wd(d) < 5 ? startOfWeek(d) : d); }} onClose={() => setDatePick(false)} />}
      {confirm && <Confirm {...confirm} onCancel={() => setConfirm(null)} />}
      {toastMsg && <div className="toast" role="status">{toastMsg}</div>}
      {newVer && !splash && (
        <div className="upd" role="status">
          <UIcon n="info" size={18} /><span>{t('newVer', { v: newVer })}</span>
          <button className="ctl txt" onClick={reloadApp}>{t('reload')}</button>
          <button className="ib sm" aria-label={t('close')} onClick={() => setNewVer(null)}><UIcon n="x" size={16} /></button>
        </div>
      )}
      {splash && <Splash onDone={() => setSplash(false)} />}
    </div>
  );
}

if (typeof document !== 'undefined' && document.getElementById('root')) {
  try { document.addEventListener('gesturestart', (e) => e.preventDefault()); } catch (e) { /* niente */ }
  createRoot(document.getElementById('root')).render(<App />);
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
}
