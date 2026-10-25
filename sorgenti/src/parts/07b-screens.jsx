
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

/* ============ Elenco di occorrenze raggruppate per giorno (Elenco e Cerca) ============ */
const groupByDay = (list) => {
  const g = [];
  for (const o of list) { if (!g.length || g[g.length - 1].d !== o.date) g.push({ d: o.date, list: [] }); g[g.length - 1].list.push(o); }
  return g;
};
const byWhen = (a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : (a.it.start ?? -1) - (b.it.start ?? -1));
function OccList({ st, days, onOpen }) {
  const today = todayStr();
  return days.map((g) => (
    <section key={g.d} className="ag-day">
      <h3 className={g.d === today ? 'today' : ''}>{fmtHead(g.d, 999)}</h3>
      <div className="card list">
        {g.list.map((o) => {
          const it = o.it, al = it.type === 'sveglia', tn = al ? { c: 'var(--alarm)' } : catTone(st.cats, it.cat), done = isDone(it, o.date);
          return (
            <button key={o.key} className={'li ag-row' + (al && it.off ? ' off' : '')} onClick={() => onOpen(o)}>
              <span className="ag-time">{it.start == null ? t('allDayShort') : o.date === it.date || !isMulti(it) ? fmtTime(it.start) : ''}</span>
              <span className="ag-bar" style={{ background: tn.c }} />
              <span className="li-t col"><span className={done && it.type === 'promemoria' && !it.onlyAlert ? 'strike' : ''}>{it.title || (al ? t('alarm') : t('noTitle'))}</span><small>{al ? alarmText(it) : catLabel(st.cats, it.cat)}{isMulti(it) ? ' - ' + fmtRange(o.date, o.end) : ''}</small></span>
              <TypeShape type={it.type} only={it.onlyAlert} done={done} color={tn.c} size={12} />
            </button>
          );
        })}
      </div>
    </section>
  ));
}

/* ============ Cerca: testo, Vai a data, intervallo di date con tipi e categorie ============ */
function SearchScreen({ st, onClose, onOpen, onGoDate }) {
  const today = todayStr();
  const [q, setQ] = useState('');
  const [range, setRange] = useState(null);
  const [pick, setPick] = useState(null);
  const [types, setTypes] = useState(ALL_TYPES);
  const [cat, setCat] = useState('');
  const ref = useRef(null);
  useEffect(() => { setTimeout(() => ref.current && ref.current.focus(), 100); }, []);
  const tops = st.cats.filter((c) => !c.parent).sort(byOrder);
  const days = useMemo(() => {
    const nq = q.trim().toLowerCase();
    if (!nq && !range) return [];
    const fam = cat && cat !== '__none' ? new Set(catFamily(st.cats, cat)) : null;
    const its = st.items.filter((it) => types.includes(it.type)
      && (!cat || it.type === 'sveglia' || (cat === '__none' ? !it.cat || !catOf(st.cats, it.cat) : fam.has(it.cat)))
      && (!nq || [it.title, it.notes, it.address].some((x) => (x || '').toLowerCase().includes(nq))));
    const list = range ? expand(its, range[0], range[1]) : its.map((it) => ({ it, date: it.date, end: addDays(it.date, spanDays(it)), key: it.id + '@' + it.date }));
    return groupByDay(list.sort(byWhen).slice(0, 400));
  }, [q, range, types, cat, st.items, st.cats]);
  const tog = (v) => { const n = types.includes(v) ? types.filter((x) => x !== v) : [...types, v]; if (n.length) setTypes(n); };
  return (
    <Screen title={t('search')} onBack={onClose}>
      <div className="pad-x ag-tools">
        <div className="search"><UIcon n="search" size={18} color="var(--muted)" /><input ref={ref} value={q} aria-label={t('searchPh')} placeholder={t('searchPh')} onChange={(e) => setQ(e.target.value)} /></div>
        <div className="chips">
          <button className="chip" onClick={() => setPick('go')}><UIcon n="cal" size={15} />{t('goDate')}</button>
          <button className={'chip' + (range ? ' on' : '')} onClick={() => setPick('from')}><UIcon n="swipe" size={15} />{range ? fmtRange(range[0], range[1]) : t('dateRange')}</button>
          {range && <button className="chip" aria-label={t('close')} onClick={() => setRange(null)}><UIcon n="x" size={14} /></button>}
        </div>
        <div className="chips">
          {[['evento', 'events'], ['promemoria', 'reminders'], ['sveglia', 'alarms']].map(([v, k]) => (
            <button key={v} className={'chip' + (types.includes(v) ? ' on' : '')} aria-pressed={types.includes(v)} onClick={() => tog(v)}><TypeShape type={v} color="currentColor" size={12} />{t(k)}</button>
          ))}
          <select className="chip sel" value={cat} aria-label={t('category')} onChange={(e) => setCat(e.target.value)}>
            <option value="">{t('allCats')}</option>
            {tops.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            <option value="__none">{t('unassigned')}</option>
          </select>
        </div>
      </div>
      {!days.length && (q.trim() || range) && <p className="muted pad">{t('noResults')}</p>}
      {!q.trim() && !range && <p className="muted pad">{t('searchHint')}</p>}
      <OccList st={st} days={days} onOpen={onOpen} />
      {pick === 'go' && <DatePicker value={today} onPick={onGoDate} onClose={() => setPick(null)} />}
      {pick === 'from' && <DatePicker key="f" title={t('rangeFrom')} value={range ? range[0] : today} onPick={(d) => { setRange([d, range && range[1] >= d ? range[1] : addDays(d, 6)]); setTimeout(() => setPick('to'), 0); }} onClose={() => setPick((p) => (p === 'from' ? null : p))} />}
      {pick === 'to' && <DatePicker key="t" title={t('rangeTo')} value={range ? range[1] : today} onPick={(d) => setRange((r) => (r && d >= r[0] ? [r[0], d] : [d, d]))} onClose={() => setPick((p) => (p === 'to' ? null : p))} />}
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
    return groupByDay(expand(its, past ? addDays(today, -365) : today, addDays(today, span)).sort(byWhen));
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
          <OccList st={st} days={days} onOpen={onOpen} />
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
          {st.settings.alarmTips === false && tpls.length > 0 && <div className="pad-x"><button className="lnk sm" onClick={() => onSetting({ alarmTips: true })}><UIcon n="plus" size={16} />{t('showTips')}</button></div>}
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
/* dispositivo: identificativo locale e nome breve, per sapere chi sta modificando */
const devId = () => { try { let v = localStorage.getItem('hora.dev'); if (!v) { v = uid() + uid(); localStorage.setItem('hora.dev', v); } return v; } catch (e) { return 'web'; } };
const devName = () => { const u = (typeof navigator !== 'undefined' && navigator.userAgent) || ''; return /iPhone/.test(u) ? 'iPhone' : /iPad/.test(u) ? 'iPad' : /Android/.test(u) ? 'Android' : /Mac/.test(u) ? 'Mac' : /Windows/.test(u) ? 'Windows' : 'web'; };
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
        {!DBX_KEY && <button className="li off" disabled><SIcon n="cloud" /><span className="li-t col"><span className="b">{t('dbxSync')}</span><small>{t('dbxSyncTxt')}</small></span></button>}
        {DBX_KEY && !sync.linked && <button className="li teal-t" onClick={onLink}><SIcon n="cloud" />{t('dbxLink')}</button>}
        {DBX_KEY && sync.linked && (
          <>
            <div className="li"><SIcon n={sync.ro ? 'eye' : 'edit'} /><span className="li-t col"><span>{sync.ro ? t('roHere') : t('editHere')}</span><small>{sync.ro ? t('roTxt', { d: sync.editorName || t('otherDev') }) : t('editTxt')}</small></span></div>
            <button className="li" onClick={onSyncNow}><SIcon n="cloud" /><span className="li-t col"><span className="b">{t('dbxSync')}</span><small>{sync.busy ? t('syncing') : (sync.last ? t('lastSync', { d: new Date(sync.last).toLocaleString(LANG === 'en' ? 'en-GB' : 'it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) }) : t('never')) + '. ' + t('dbxSyncTxt')}</small></span></button>
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
