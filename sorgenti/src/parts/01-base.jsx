/* hora 1.5 - calendario locale di nautargo
   File unico React. Build: node build.mjs */
import React, { useState, useEffect, useRef, useMemo, useLayoutEffect } from 'react';
import { createRoot } from 'react-dom/client';

export const VERSION = '1.5';

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
    lockQ: 'Modifiche da un altro dispositivo', lockTxt: 'Su Dropbox si sta lavorando da un altro dispositivo: qui puoi solo guardare. Vuoi proseguire da questo? L\'altro passerà in sola lettura.', lockOk: 'Prosegui da qui',
    notDone: 'Da fare di nuovo', roHere: 'Sola lettura su questo dispositivo', roShort: 'Sola lettura', roTxt: 'Sta modificando: {d}. Per modificare da qui basta iniziare e confermare.', otherDev: 'un altro dispositivo',
    editHere: 'Modifiche da questo dispositivo', editTxt: 'Gli altri dispositivi collegati vedono soltanto, finché non prendono il controllo.', showTips: 'Mostra le sveglie suggerite',
    dateRange: 'Intervallo di date', rangeFrom: 'Dal giorno', rangeTo: 'Al giorno', searchHint: 'Cerca un testo, vai a una data o scegli un intervallo per vedere tutti gli elementi.', dbxSyncTxt: 'Allinea ai dati su Dropbox. Avviene da solo all\'apertura e ogni 5 minuti.',
    goDate: 'Vai a data', splashSub: 'ogni cosa a suo tempo', tapToEnter: 'Tocca lo schermo per entrare', copied: 'Copiato',
    aiImport: 'Importa da un\'altra app', aiShort: 'Con l\'aiuto di un\'IA, ad esempio Claude', aiTxt: 'Per app e agende che non esportano in .ics: un\'IA converte i dati nel formato di hora.',
    aiStep1: 'Esporta o copia i dati dall\'altra app: file, testo, anche una foto.', aiStep2: 'Dai all\'IA i dati insieme a queste istruzioni.', aiStep3: 'Incolla qui il blocco che ti restituisce, poi controlla e conferma.',
    copyMd: 'Copia istruzioni', downloadMd: 'Scarica .md', pasteHere: 'Incolla qui', readBlock: 'Leggi e controlla',
    agenda: 'Elenco', evRem: 'Eventi e promemoria', onceOn: 'una volta, {d}', untilD: 'fino al {d}', newGroup: 'Nuovo gruppo', noGroup: 'Senza gruppo', up: 'Su', down: 'Giù',
    newAlarm: 'Nuova sveglia', past: 'Anche passati', showMore: 'Mostra altri', noAlarms: 'Nessuna sveglia', suggested: 'Suggerite', hideTips: 'Nascondi',
    tplTxt: 'Gruppi pronti da aggiungere. Le sveglie suonano a un\'ora precisa e si ripetono: utili quando non si può rimandare, come un medicinale.',
    sLook: 'Aspetto', theme: 'Tema', thAuto: 'Auto', thLight: 'Chiaro', thDark: 'Scuro', sSplash: 'Schermata iniziale', sSplashTxt: 'Il marchio all\'apertura, finché non tocchi lo schermo',
    sSync: 'Sincronizzazione', dbxNoKey: 'Pronta: manca la chiave dell\'app Dropbox', soon: 'presto', dbxLink: 'Collega Dropbox', dbxSync: 'Sincronizza', syncing: 'Sincronizzazione...',
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
    lockQ: 'Edits from another device', lockTxt: 'Another device is editing on Dropbox: here you can only view. Continue from this one? The other will become read-only.', lockOk: 'Continue here',
    notDone: 'Mark as not done', roHere: 'Read-only on this device', roShort: 'Read-only', roTxt: 'Editing: {d}. To edit from here just start and confirm.', otherDev: 'another device',
    editHere: 'Editing from this device', editTxt: 'Other connected devices can only view, until they take over.', showTips: 'Show suggested alarms',
    dateRange: 'Date range', rangeFrom: 'From', rangeTo: 'To', searchHint: 'Search text, go to a date or pick a range to see all items.', dbxSyncTxt: 'Aligns with the data on Dropbox. Happens on opening and every 5 minutes.',
    goDate: 'Go to date', splashSub: 'everything in its time', tapToEnter: 'Tap the screen to enter', copied: 'Copied',
    aiImport: 'Import from another app', aiShort: 'With the help of an AI, e.g. Claude', aiTxt: 'For apps and planners without .ics export: an AI converts the data into hora\'s format.',
    aiStep1: 'Export or copy the data from the other app: file, text, even a photo.', aiStep2: 'Give the AI the data together with these instructions.', aiStep3: 'Paste here the block it returns, then check and confirm.',
    copyMd: 'Copy instructions', downloadMd: 'Download .md', pasteHere: 'Paste here', readBlock: 'Read and check',
    agenda: 'List', evRem: 'Events and reminders', onceOn: 'once, {d}', untilD: 'until {d}', newGroup: 'New group', noGroup: 'No group', up: 'Up', down: 'Down',
    newAlarm: 'New alarm', past: 'Include past', showMore: 'Show more', noAlarms: 'No alarms', suggested: 'Suggested', hideTips: 'Hide',
    tplTxt: 'Ready-made groups. Alarms ring at an exact time and repeat: useful when something cannot wait, like a medicine.',
    sLook: 'Appearance', theme: 'Theme', thAuto: 'Auto', thLight: 'Light', thDark: 'Dark', sSplash: 'Start screen', sSplashTxt: 'The logo on opening, until you tap the screen',
    sSync: 'Sync', dbxNoKey: 'Ready: the Dropbox app key is missing', soon: 'soon', dbxLink: 'Connect Dropbox', dbxSync: 'Sync', syncing: 'Syncing...',
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
  done: 'M4 5h16v14H4zM8 12l3 3 5-6', edit: 'M4 20l1-4L16 5l3 3L8 19zM14 7l3 3', eye: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z', tap: 'M9 11V5.5a1.5 1.5 0 0 1 3 0V10l4.6 1.2a2 2 0 0 1 1.4 2.3L17 19a2 2 0 0 1-2 1.6h-4.2a2 2 0 0 1-1.6-.8L6 15.5a1.5 1.5 0 0 1 2.2-2L9 14.3', list: 'M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01', moon: 'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z', cloud: 'M7 18a4 4 0 0 1-.5-8 5.5 5.5 0 0 1 10.6 1.5A3.3 3.3 0 0 1 17 18zM12 11v6M9.5 14.5L12 17l2.5-2.5', ai: 'M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8zM18.5 15l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z', copy: 'M8 8h11v12H8zM5 16V4h11', palette: 'M12 3a9 9 0 1 0 0 18c1 0 1.5-.8 1.5-1.5 0-1.2-1-1.5-1-2.5s.8-1.5 2-1.5H17a4 4 0 0 0 4-4c0-4.4-4-8.5-9-8.5zM7.5 11.5h.01M10 7.5h.01M15 7.5h.01', type: 'M12 3l9 5-9 5-9-5zM3 13l9 5 9-5'
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
