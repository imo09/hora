/* ============ 1.7: da fare del giorno, nota in folio, esportazione a scelta, pannello del giorno ============ */

/* ---- Da fare: una lista semplice per giorno, che resta in hora ---- */
function TodoBox({ date, list = [], onChange, onMove, strip, open, onOpen }) {
  const [txt, setTxt] = useState('');
  const [edit, setEdit] = useState(null);
  const inRef = useRef(null);
  const doneN = list.filter((x) => x.done).length;
  const undone = list.filter((x) => !x.done);
  const focusIn = () => setTimeout(() => inRef.current && inRef.current.focus(), 0);
  const add = () => { const v = txt.trim(); if (!v) return; onChange([...list, { id: uid(), t: v, done: false }]); setTxt(''); focusIn(); };
  const tog = (id) => onChange(list.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
  const del = (id) => onChange(list.filter((x) => x.id !== id));
  const saveEdit = () => {
    if (!edit) return;
    const v = edit.t.trim();
    onChange(v ? list.map((x) => (x.id === edit.id ? { ...x, t: v } : x)) : list.filter((x) => x.id !== edit.id));
    setEdit(null);
  };
  const head = (
    <button className="td-h" aria-expanded={strip ? !!open : undefined} onClick={strip ? () => { onOpen(!open); if (!open && !list.length) focusIn(); } : () => focusIn()}>
      <span className="td-ic"><UIcon n="done" size={17} /></span>
      <b>{t('todo')}</b>
      {list.length ? <span className={'td-n' + (doneN === list.length ? ' all' : '')}>{doneN}/{list.length}</span> : <small>{t('todoEmpty')}</small>}
      {strip && <span className="td-chev"><UIcon n={open ? 'up' : 'down'} size={16} sw={2.2} /></span>}
    </button>
  );
  if (strip && !open) return <section className="todo strip">{head}</section>;
  return (
    <section className={'todo' + (strip ? ' strip open' : '')}>
      {head}
      {list.length > 0 && (
        <ul className="td-list">
          {list.map((x) => (
            <li key={x.id} className={x.done ? 'done' : ''}>
              <button className={'cb' + (x.done ? ' on' : '')} role="checkbox" aria-checked={!!x.done} aria-label={x.t} onClick={() => tog(x.id)}>{x.done && <CheckMark />}</button>
              {edit && edit.id === x.id
                ? <input className="td-in" autoFocus value={edit.t} aria-label={t('editItem')} onChange={(e) => setEdit({ ...edit, t: e.target.value })} onBlur={saveEdit} onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEdit(null); }} />
                : <span className="td-t" onClick={() => setEdit({ id: x.id, t: x.t })}>{x.t}</span>}
              <button className="ib sm" aria-label={t('del') + ': ' + x.t} onClick={() => del(x.id)}><UIcon n="x" size={15} /></button>
            </li>
          ))}
        </ul>
      )}
      <div className="td-add">
        <UIcon n="plus" size={16} color="var(--tealInk)" />
        <input ref={inRef} value={txt} placeholder={t('todoPh')} aria-label={t('todoPh')} enterKeyHint="done" onChange={(e) => setTxt(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') add(); }} />
        {txt.trim() && <button className="lnk" onClick={add}>{t('add')}</button>}
      </div>
      {undone.length > 0 && date <= todayStr() && onMove && <button className="lnk td-move" onClick={() => onMove(date)}><UIcon n="right" size={14} sw={2.2} />{t('todoMove', { n: undone.length })}</button>}
    </section>
  );
}

/* ---- Nota in folio: un Foglio legato a un evento, a una serie o a più eventi ---- */
/* indirizzo di folio; per le prove in locale si può cambiare con localStorage 'hora.folio' */
const FOLIO_URL = (() => { try { const v = localStorage.getItem('hora.folio'); if (v && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/$/.test(v)) return v; } catch (e) { /* niente */ } return 'https://folio.nautargo.com/'; })();
const FOLIO_ORIGIN = FOLIO_URL.replace(/\/$/, '');
const folioWhen = (it, d) => (it ? whenText(it, d || it.date) + (it.repeat && it.repeat.f !== 'none' ? ', ' + repText(it.repeat) : '') : '');
export function folioUrl(f, it, d) {
  if (!f) return '';
  if (f.by === 'folio') return FOLIO_URL + '#foglio=' + encodeURIComponent(f.id);
  return FOLIO_URL + '#hora?' + new URLSearchParams({ id: f.id, t: f.title || (it && it.title) || '', q: folioWhen(it, d) }).toString();
}
/* ponte con folio: una pagina di folio aperta in modo invisibile legge, crea e riscrive i Fogli.
   Stesso dominio (nautargo.com): folio vede i propri dati anche dentro hora. Senza risposta, si apre folio. */
const PONTE = { fr: null, ready: null, ok: false, n: 0, wait: new Map(), subs: new Set() };
function ponte() {
  if (PONTE.ready) return PONTE.ready;
  PONTE.ready = new Promise((res) => {
    try {
      if (typeof document === 'undefined' || !document.body || !(location.protocol === 'https:' || /^(localhost|127\.0\.0\.1)$/.test(location.hostname))) { res(false); return; }
      window.addEventListener('message', (e) => {
        if (e.origin !== FOLIO_ORIGIN || !PONTE.fr || e.source !== PONTE.fr.contentWindow) return;
        const m = e.data || {};
        if (m.ponte === 'pronto') { PONTE.ok = true; res(true); }
        else if (m.ponte === 'risposta' && PONTE.wait.has(m.req)) { const f = PONTE.wait.get(m.req); PONTE.wait.delete(m.req); f(m); }
        else if (m.ponte === 'cambiato') PONTE.subs.forEach((f) => f());
      });
      const fr = document.createElement('iframe');
      fr.src = FOLIO_URL + 'ponte.html';
      fr.title = 'folio';
      fr.setAttribute('aria-hidden', 'true');
      fr.tabIndex = -1;
      fr.style.cssText = 'position:absolute;width:0;height:0;border:0;visibility:hidden';
      document.body.appendChild(fr);
      PONTE.fr = fr;
      setTimeout(() => res(PONTE.ok), 8000);
    } catch (e) { res(false); }
  });
  return PONTE.ready;
}
export async function folioAsk(op, data) {
  if (!(await ponte())) return null;
  return new Promise((res) => {
    const req = ++PONTE.n;
    PONTE.wait.set(req, res);
    try { PONTE.fr.contentWindow.postMessage({ hora: 1, req, op, ...data }, FOLIO_ORIGIN); } catch (e) { PONTE.wait.delete(req); res(null); return; }
    setTimeout(() => { if (PONTE.wait.has(req)) { PONTE.wait.delete(req); res(null); } }, 9000);
  });
}
const folioOn = (f) => { PONTE.subs.add(f); return () => PONTE.subs.delete(f); };
const folioCreate = (f, it) => folioAsk('crea', { hid: f.id, titolo: f.title || it.title || '', quando: folioWhen(it) });
/* anteprima del markdown di un Foglio: righe semplici, senza segni */
const mdInline = (s) => s.replace(/!\[[^\]]*\]\([^)]*\)/g, '[' + t('image') + ']').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/\*\*|__|~~|`/g, '').replace(/(^|\s)[*_]([^*_]+)[*_](?=\s|$|[.,;:!?])/g, '$1$2').replace(/\\([\\`*_[\]<>#|])/g, '$1');
function mdLite(md, max = 12) {
  const out = [];
  let code = false;
  for (const raw of String(md || '').split('\n')) {
    if (out.length >= max) { out.push(<span key="more" className="fo-more">...</span>); break; }
    const l = raw.trimEnd();
    if (/^```/.test(l.trim())) { code = !code; continue; }
    if (!l.trim() || /^\s*<!--.*-->\s*$/.test(l) || /^\s*\|?[\s:-]+\|[\s|:-]*$/.test(l) || /^\s*([-*_])\1{2,}\s*$/.test(l)) continue;
    if (/^\s*\[[^\]]*\]\(https:\/\/hora\.nautargo\.com\/[^)]*\)\s*$/.test(l)) continue;
    const k = out.length;
    let m;
    if (code) out.push(<code key={k} className="fo-l code">{l}</code>);
    else if ((m = l.match(/^(#{1,6})\s+(.*)$/))) out.push(<b key={k} className={'fo-l fo-h h' + m[1].length}>{mdInline(m[2])}</b>);
    else if ((m = l.match(/^(\s*)[-*+]\s+\[([ xX])\]\s+(.*)$/))) out.push(<span key={k} className={'fo-l fo-cb' + (m[2] !== ' ' ? ' on' : '')} style={{ paddingLeft: m[1].length * 6 }}><i />{mdInline(m[3])}</span>);
    else if ((m = l.match(/^(\s*)([-*+]|\d+[.)])\s+(.*)$/))) out.push(<span key={k} className="fo-l fo-li" style={{ paddingLeft: m[1].length * 6 }}><em>{/\d/.test(m[2]) ? m[2] : '•'}</em>{mdInline(m[3])}</span>);
    else if ((m = l.match(/^>\s?(.*)$/))) out.push(<span key={k} className="fo-l fo-q">{mdInline(m[1])}</span>);
    else if (/^\s*\|/.test(l)) out.push(<span key={k} className="fo-l">{mdInline(l.replace(/^\s*\||\|\s*$/g, '').split('|').map((x) => x.trim()).join(' - '))}</span>);
    else out.push(<span key={k} className="fo-l">{mdInline(l)}</span>);
  }
  return out;
}
/* collegamento incollato da folio ("Copia collegamento") o da hora */
export function parseFolioLink(s) {
  const v = String(s || '').trim();
  let m = v.match(/#foglio=([^&\s]+)/);
  if (m) { try { return { by: 'folio', id: decodeURIComponent(m[1]) }; } catch (e) { return { by: 'folio', id: m[1] }; } }
  m = v.match(/#(?:hora\?(?:.*&)?id=|nota=)([A-Za-z0-9_-]{4,40})/);
  if (m) return { by: 'hora', id: m[1] };
  return null;
}
const openExt = (u) => { try { window.open(u, '_blank', 'noopener'); } catch (e) { location.href = u; } };
function FolioSheet({ st, it, onLink, onPick, onClose, onMade }) {
  const [paste, setPaste] = useState('');
  const same = st.items.filter((x) => x.id !== it.id && x.type !== 'sveglia' && norm(x.title || '') && norm(x.title || '') === norm(it.title || ''));
  const [all, setAll] = useState(false);
  /* note già legate ad altri elementi di hora */
  const known = useMemo(() => {
    const m = new Map();
    for (const x of st.items) if (x.folio && x.id !== it.id) { const k = x.folio.by + ':' + x.folio.id; if (!m.has(k)) m.set(k, { f: x.folio, n: 0, title: x.folio.title || x.title }); m.get(k).n++; }
    return [...m.values()];
  }, [st.items, it.id]);
  const ids = () => [it.id, ...(all ? same.map((x) => x.id) : [])];
  useEffect(() => { ponte(); }, []);
  const link = (f, create) => {
    if (onPick) { onPick(f, create); onClose(); return; }
    onLink(ids(), f); onClose();
    if (!create) return;
    /* con il ponte pronto il Foglio nasce in folio senza lasciare hora; altrimenti si apre folio */
    if (PONTE.ok) folioCreate(f, it).then((r) => { if (r && r.ok) onMade && onMade(f, r.nota); else openExt(folioUrl(f, it)); });
    else openExt(folioUrl(f, it));
  };
  const parsed = parseFolioLink(paste);
  return (
    <Sheet onClose={onClose} label={t('folioNote')}>
      <SheetHead title={t('folioNote')} onClose={onClose} />
      <div className="sh-body">
        <p className="muted sm-p">{t('folioTxt')}</p>
        {same.length > 0 && !onPick && (
          <div className="li fo-all"><SIcon n="repeat" /><span className="li-t col"><span>{t('folioAll', { n: same.length })}</span><small>{it.title}</small></span><Switch on={all} label={t('folioAll', { n: same.length })} onChange={setAll} /></div>
        )}
        <button className="btn pri wide fo-new" onClick={() => link({ by: 'hora', id: uid(), title: it.title || '' }, true)}><UIcon n="plus" size={18} />{t('folioNew')}</button>
        {known.length > 0 && (
          <>
            <div className="lbl">{t('folioKnown')}</div>
            <div className="list">
              {known.map((k) => (
                <button key={k.f.by + k.f.id} className="li" onClick={() => link(k.f, false)}>
                  <SIcon n="note" /><span className="li-t col"><span>{k.title || t('noTitle')}</span><small>{t('folioUsed', { n: k.n })}</small></span>
                </button>
              ))}
            </div>
          </>
        )}
        <div className="lbl">{t('folioPaste')}</div>
        <div className="search"><UIcon n="link" size={18} color="var(--muted)" /><input value={paste} placeholder="https://folio.nautargo.com/#foglio=..." aria-label={t('folioPaste')} onChange={(e) => setPaste(e.target.value)} /></div>
        <p className="muted sm-p pt8">{paste && !parsed ? t('folioBad') : t('folioPasteTxt')}</p>
      </div>
      <div className="sh-foot">
        <button className="btn" onClick={onClose}>{t('cancel')}</button>
        <button className="btn pri grow" disabled={!parsed} onClick={() => link({ ...parsed, title: it.title || '' }, false)}>{t('folioLink')}</button>
      </div>
    </Sheet>
  );
}
function FolioRow({ it, d, onPick, onUnlink, onCache, toast }) {
  if (!it.folio) return (
    <button className="iv-row fo-row add" onClick={onPick}>
      <span className="iv-i"><UIcon n="note" size={18} /></span>
      <span className="li-t col"><span className="teal-t b">{t('folioAdd')}</span><small>{t('folioAddTxt')}</small></span>
      <UIcon n="right" size={14} sw={2.4} color="var(--muted)" />
    </button>
  );
  return <FolioCard key={it.folio.by + it.folio.id} it={it} d={d} onUnlink={onUnlink} onCache={onCache} toast={toast} />;
}
/* nota legata: anteprima che si aggiorna da folio, modificabile anche da qui */
function FolioCard({ it, d, onUnlink, onCache, toast }) {
  const f = it.folio, key = f.by + ':' + f.id;
  const [s, setS] = useState({ stato: 'carico', nota: null });
  const [edit, setEdit] = useState(null);
  const [busy, setBusy] = useState(false);
  const R = useRef({ alive: false });
  R.current.onCache = onCache;
  R.current.edit = edit;
  const load = async () => {
    const r = await folioAsk('leggi', { chiavi: [{ by: f.by, id: f.id }] });
    if (!R.current.alive) return;
    if (!r) { setS((x) => ({ ...x, stato: 'off' })); return; }
    if (!r.ok) { setS({ stato: r.motivo === 'vuoto' ? 'vuoto' : 'off', nota: null }); return; }
    const n = r.note && r.note[key];
    if (!n || !n.trovato) { setS({ stato: 'assente', nota: null }); return; }
    setS({ stato: n.protetto ? 'protetto' : 'ok', nota: n });
    if (R.current.onCache) R.current.onCache(f, n);
  };
  useEffect(() => {
    R.current.alive = true;
    load();
    const off = folioOn(() => { if (!R.current.edit) load(); });
    const vis = () => { if (document.visibilityState === 'visible' && !R.current.edit) load(); };
    document.addEventListener('visibilitychange', vis);
    return () => { R.current.alive = false; off(); document.removeEventListener('visibilitychange', vis); };
  }, [key]);
  const n = s.nota;
  const md = n ? n.md : f.prev || '';
  const create = async () => {
    setBusy(true);
    const r = await folioCreate(f, it);
    setBusy(false);
    if (r && r.ok) { setS({ stato: 'ok', nota: r.nota }); if (onCache) onCache(f, r.nota); toast && toast(t('folioMade')); } else openExt(folioUrl(f, it, d));
  };
  const save = async () => {
    setBusy(true);
    const r = await folioAsk('scrivi', { chiave: { by: f.by, id: f.id }, md: edit });
    setBusy(false);
    if (r && r.ok) { setS({ stato: 'ok', nota: r.nota }); setEdit(null); if (onCache) onCache(f, r.nota); toast && toast(t('folioSaved')); } else toast && toast(r && r.motivo === 'lettura' ? t('folioRo') : t('folioFail'));
  };
  const when = n && n.modificata ? new Date(n.modificata).toLocaleString(LANG === 'en' ? 'en-GB' : 'it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
  return (
    <div className="fo-card">
      <div className="iv-row fo-row">
        <span className="iv-i"><UIcon n="note" size={18} /></span>
        <span className="li-t col"><span>{(n && n.titolo) || f.title || it.title}</span><small>{n && n.percorso ? 'folio - ' + n.percorso : t('folioNote')}</small></span>
        {s.stato === 'ok' && !edit && <button className="ib act" aria-label={t('folioEdit')} title={t('folioEdit')} onClick={() => setEdit(n.md)}><UIcon n="edit" size={17} /></button>}
        <button className="ib act" aria-label={t('folioUnlink')} title={t('folioUnlink')} onClick={onUnlink}><UIcon n="x" size={17} /></button>
        <a className="ib act" aria-label={t('folioOpen')} title={t('folioOpen')} href={folioUrl(f, it, d)} target="_blank" rel="noopener"><UIcon n="ext" size={18} /></a>
      </div>
      {edit != null ? (
        <div className="fo-edit">
          <textarea value={edit} rows={8} aria-label={t('folioEdit')} onChange={(e) => setEdit(e.target.value)} />
          <small className="muted">{t('folioMdTxt')}</small>
          <div className="row-c gap6 fo-eb">
            <button className="btn" onClick={() => setEdit(null)}>{t('cancel')}</button>
            <button className="btn pri grow" disabled={busy} onClick={save}>{t('folioSave')}</button>
          </div>
        </div>
      ) : (
        <>
          {md && s.stato !== 'protetto' && <div className={'fo-prev' + (s.stato === 'ok' ? '' : ' old')} onClick={s.stato === 'ok' ? () => setEdit(n.md) : undefined}>{mdLite(md)}</div>}
          {s.stato === 'ok' && !md && <p className="fo-st muted">{t('folioEmpty')}</p>}
          {s.stato === 'protetto' && <p className="fo-st muted"><UIcon n="eye" size={14} /> {t('folioLocked')}</p>}
          {s.stato === 'assente' && (
            <div className="fo-st"><span className="muted">{f.by === 'hora' ? t('folioNotYet') : t('folioMissing')}</span>
              {f.by === 'hora' && <button className="lnk" disabled={busy} onClick={create}>{t('folioCreateNow')}</button>}</div>
          )}
          {(s.stato === 'off' || s.stato === 'vuoto') && <p className="fo-st muted">{s.stato === 'vuoto' ? t('folioNoApp') : t('folioOff')}</p>}
          {s.stato === 'carico' && !md && <p className="fo-st muted">{t('folioLoading')}</p>}
          {when && <small className="fo-when">{t('folioMod', { d: when })}</small>}
        </>
      )}
    </div>
  );
}

/* ---- Esportazione a scelta: tipi, categorie, periodo ---- */
export function pickExport(st, o) {
  const fam = o.cats ? new Set(o.cats.flatMap((id) => (id === '__none' ? [id] : catFamily(st.cats, id)))) : null;
  const inRange = (it) => {
    const rep = it.repeat && it.repeat.f !== 'none';
    const end = rep ? (it.repeat.until || '9999-12-31') : (it.endDate || it.date);
    return (!o.from || end >= o.from) && (!o.to || it.date <= o.to);
  };
  const items = st.items.filter((it) => o.types.includes(it.type)
    && (it.type === 'sveglia' || !fam || fam.has(it.cat && catOf(st.cats, it.cat) ? it.cat : '__none')) && inRange(it));
  const need = new Set();
  for (const it of items) if (it.cat) { const c = catOf(st.cats, it.cat); if (c) { need.add(c.id); if (c.parent) need.add(c.parent); } }
  const cats = st.cats.filter((c) => (o.allCats ? !fam || fam.has(c.id) || (c.parent && fam.has(c.parent)) : need.has(c.id)));
  const gids = new Set(items.filter((x) => x.type === 'sveglia' && x.group).map((x) => x.group));
  const alarmGroups = (st.alarmGroups || []).filter((g) => gids.has(g.id));
  const todos = {};
  if (o.todos) for (const d in st.todos || {}) if ((!o.from || d >= o.from) && (!o.to || d <= o.to) && st.todos[d].length) todos[d] = st.todos[d];
  return { items, cats, alarmGroups, todos };
}
function ExportSheet({ st, onClose, onExport }) {
  const [fmt, setFmt] = useState('json');
  const [types, setTypes] = useState(ALL_TYPES);
  const [todos, setTodos] = useState(true);
  const [cats, setCats] = useState(null);
  const [per, setPer] = useState('all');
  const [from, setFrom] = useState(todayStr());
  const [to, setTo] = useState(addDays(todayStr(), 90));
  const [pick, setPick] = useState(null);
  const tops = st.cats.filter((c) => !c.parent).sort(byOrder);
  const tog = (arr, v) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const everything = types.length === ALL_TYPES.length && (todos || fmt === 'ics') && !cats && per === 'all';
  const o = { types, cats, todos: fmt === 'json' && todos, allCats: fmt === 'json' && !cats ? true : !!cats, from: per === 'all' ? null : from, to: per === 'range' ? to : null };
  const sel = useMemo(() => pickExport(st, o), [st, types, cats, todos, per, from, to, fmt]);
  const nTd = Object.keys(sel.todos).length;
  const setAll = () => { setTypes(ALL_TYPES); setTodos(true); setCats(null); setPer('all'); };
  const go = () => { onExport(fmt, sel, everything); onClose(); };
  return (
    <Sheet onClose={onClose} label={t('export')} tall>
      <SheetHead title={t('export')} onClose={onClose} />
      <div className="sh-body ex-body">
        <div className="lbl">{t('exFormat')}</div>
        <div className="seg mini-seg wide-seg" role="group" aria-label={t('exFormat')}>
          <button className={fmt === 'json' ? 'on' : ''} onClick={() => setFmt('json')}>{t('exJson')}</button>
          <button className={fmt === 'ics' ? 'on' : ''} onClick={() => setFmt('ics')}>{t('exIcs')}</button>
        </div>
        <p className="muted sm-p">{fmt === 'json' ? t('exJsonTxt') : t('exIcsTxt')}</p>
        <div className="lbl">{t('exWhat')}</div>
        <div className="chips">
          <button className={'chip' + (everything ? ' on' : '')} aria-pressed={everything} onClick={setAll}><UIcon n="done" size={14} />{t('all')}</button>
          {[['evento', 'events'], ['promemoria', 'reminders'], ['sveglia', 'alarms']].map(([v, k]) => (
            <button key={v} className={'chip' + (types.includes(v) ? ' on' : '')} aria-pressed={types.includes(v)} onClick={() => { const n = tog(types, v); if (n.length || (todos && fmt === 'json')) setTypes(n); }}><TypeShape type={v} color="currentColor" size={12} />{t(k)}</button>
          ))}
          {fmt === 'json' && <button className={'chip' + (todos ? ' on' : '')} aria-pressed={todos} onClick={() => { if (todos && !types.length) return; setTodos(!todos); }}><UIcon n="done" size={14} />{t('todo')}</button>}
        </div>
        <div className="lbl">{t('categories')}</div>
        <div className="chips">
          <button className={'chip' + (!cats ? ' on' : '')} aria-pressed={!cats} onClick={() => setCats(null)}>{t('allCats')}</button>
          {[...tops, { id: '__none', name: t('unassigned') }].map((c) => {
            const on = !!cats && cats.includes(c.id);
            return <button key={c.id} className={'chip' + (on ? ' on' : '')} aria-pressed={on} onClick={() => { const n = tog(cats || [], c.id); setCats(n.length ? n : null); }}>{c.id !== '__none' && <span className="dot" style={{ background: catTone(st.cats, c.id).c }} />}{c.name}</button>;
          })}
        </div>
        <div className="lbl">{t('exPeriod')}</div>
        <div className="chips">
          <button className={'chip' + (per === 'all' ? ' on' : '')} onClick={() => setPer('all')}>{t('exAlways')}</button>
          <button className={'chip' + (per === 'from' ? ' on' : '')} onClick={() => { setPer('from'); setPick('from'); }}>{per === 'from' ? t('exFromD', { d: fmtDayShort(from) }) : t('exFrom')}</button>
          <button className={'chip' + (per === 'range' ? ' on' : '')} onClick={() => { setPer('range'); setPick('rfrom'); }}>{per === 'range' ? fmtRange(from, to) : t('dateRange')}</button>
        </div>
        <p className="ex-sum"><b>{t('exItems', { n: sel.items.length })}</b>{fmt === 'json' && todos ? ' - ' + t('exTodos', { n: nTd }) : ''}{fmt === 'json' ? ' - ' + t('exCats', { n: sel.cats.length }) : ''}</p>
      </div>
      <div className="sh-foot">
        <button className="btn" onClick={onClose}>{t('cancel')}</button>
        <button className="btn pri grow" disabled={!sel.items.length && !(fmt === 'json' && (nTd || everything))} onClick={go}><UIcon n="download" size={18} />{t('exGo')}</button>
      </div>
      {pick === 'from' && <DatePicker key="f" title={t('exFrom')} value={from} onPick={setFrom} onClose={() => setPick(null)} />}
      {pick === 'rfrom' && <DatePicker key="rf" title={t('rangeFrom')} value={from} onPick={(d) => { setFrom(d); if (to < d) setTo(addDays(d, 30)); setTimeout(() => setPick('rto'), 0); }} onClose={() => setPick((p) => (p === 'rfrom' ? null : p))} />}
      {pick === 'rto' && <DatePicker key="rt" title={t('rangeTo')} value={to} onPick={(d) => setTo(d >= from ? d : from)} onClose={() => setPick((p) => (p === 'rto' ? null : p))} />}
    </Sheet>
  );
}

/* ---- Pannello del giorno (tablet e computer): mese piccolo, elementi del giorno, da fare, prossimi giorni ---- */
function MiniMonth({ value, st, pass, onPick }) {
  const today = todayStr();
  const [ms, setMs] = useState(monthStart(value));
  useEffect(() => { setMs(monthStart(value)); }, [value.slice(0, 7)]);
  const g0 = startOfWeek(ms), g1 = addDays(startOfWeek(addDays(addMonths(ms, 1), -1)), 6);
  const busy = useMemo(() => {
    const b = new Set();
    for (const o of expand(st.items, g0, g1)) if (pass(o.it) && o.it.type !== 'sveglia') for (let d = o.date; d <= o.end; d = addDays(d, 1)) b.add(d);
    for (const d in st.todos || {}) if (st.todos[d].some((x) => !x.done)) b.add(d);
    return b;
  }, [st.items, st.todos, g0, g1, pass]);
  const hol = st.settings.holidays !== false ? holidaysIn(g0, g1) : {};
  const cells = [];
  for (let d = g0; d <= g1; d = addDays(d, 1)) {
    if (wd(d) === 0) cells.push(<span key={'w' + d} className="mm-wk">{isoWeek(d)}</span>);
    cells.push(
      <button key={d} className={'mm-d' + (d.slice(0, 7) !== ms.slice(0, 7) ? ' out' : '') + (d === value ? ' sel' : '') + (d === today ? ' today' : '') + (wd(d) > 4 || hol[d] ? ' we' : '')} aria-label={fmtFull(d)} title={hol[d] || undefined} onClick={() => onPick(d)}>
        {dnum(d)}{busy.has(d) && <i />}
      </button>
    );
  }
  return (
    <div className="mm">
      <div className="mm-h">
        <b>{fmtMonthYear(ms)}</b>
        <span className="ctl-pair">
          <button className="ctl" aria-label={t('prev')} onClick={() => setMs(addMonths(ms, -1))}><UIcon n="left" size={15} sw={2.1} /></button>
          <button className="ctl" aria-label={t('next')} onClick={() => setMs(addMonths(ms, 1))}><UIcon n="right" size={15} sw={2.1} /></button>
        </span>
      </div>
      <div className="mm-g">
        <span className="mm-wk h">{t('wkShort')}</span>
        {WD_LETTER[LANG].map((l, i) => <span key={i} className="mm-l">{l}</span>)}
        {cells}
      </div>
    </div>
  );
}
function DayRows({ st, list, date, onOpen, onToggle }) {
  return list.map((o) => {
    const it = o.it, tn = it.type === 'sveglia' ? { c: ALARM_C } : catTone(st.cats, it.cat);
    const done = isDone(it, o.date);
    const check = it.type === 'promemoria' && !it.onlyAlert;
    return (
      <div key={o.key} className={'m-row' + (it.type === 'sveglia' && it.off ? ' off' : '')}>
        <span className="m-time">{it.start != null && o.date === date ? fmtTime(it.start) : it.start != null ? '' : t('allDayShort')}</span>
        {check
          ? <button className="chk" aria-label={t('markDone') + ': ' + it.title} onClick={() => onToggle(it, o.date)}><TypeShape type="promemoria" color={tn.c} done={done} size={15} /></button>
          : <span className="chk"><TypeShape type={it.type} only={it.onlyAlert} color={tn.c} size={it.type === 'evento' ? 13 : 15} /></span>}
        <button className="m-open" onClick={() => onOpen(o)}>
          <span className={done && check ? 'strike' : ''}>{it.title || (it.type === 'sveglia' ? t('alarm') : t('noTitle'))}{it.folio && <i className="fo-mark" title={t('folioNote')}><UIcon n="note" size={12} /></i>}</span>
          <small>{it.type === 'sveglia' ? (it.repeat && it.repeat.f !== 'none' ? repText(it.repeat) : t('alarm')) : catLabel(st.cats, it.cat)}</small>
        </button>
      </div>
    );
  });
}
function DayPanel({ st, date, pass, onPick, onOpen, onToggle, onTodos, onMove, onOpenDay, mini = true }) {
  const today = todayStr();
  const hol = st.settings.holidays !== false ? holidaysIn(date, date) : {};
  const list = useMemo(() => expand(st.items, date, date).filter((o) => pass(o.it)).sort((a, b) => (a.it.start ?? -1) - (b.it.start ?? -1)), [st.items, date, pass]);
  const next = useMemo(() => groupByDay(expand(st.items, addDays(date, 1), addDays(date, 7)).filter((o) => pass(o.it) && o.it.type !== 'sveglia').sort(byWhen)).slice(0, 4), [st.items, date, pass]);
  return (
    <aside className="side" aria-label={t('dayPanel')}>
      {mini && <MiniMonth value={date} st={st} pass={pass} onPick={onPick} />}
      <section className="sd-day">
        <div className="sd-h">
          <h2 className={date === today ? 'today' : ''}>{fmtHead(date, 999)}{hol[date] ? <em className="hol-n">{hol[date]}</em> : null}</h2>
          <span className="sd-wk">{t('wkLong', { n: isoWeek(date) })}</span>
          {onOpenDay && <button className="lnk" onClick={() => onOpenDay(date)}>{t('openDay')}</button>}
        </div>
        {!list.length && <p className="muted sd-empty">{t('empty')}</p>}
        <DayRows st={st} list={list} date={date} onOpen={onOpen} onToggle={onToggle} />
      </section>
      <TodoBox key={date} date={date} list={(st.todos || {})[date] || []} onChange={(l) => onTodos(date, l)} onMove={onMove} />
      {next.length > 0 && (
        <section className="sd-next">
          <div className="lbl">{t('nextDays')}</div>
          {next.map((g) => (
            <div key={g.d} className="sd-g">
              <button className="sd-gh" onClick={() => onPick(g.d)}>{fmtHead(g.d, 160)}</button>
              <DayRows st={st} list={g.list} date={g.d} onOpen={onOpen} onToggle={onToggle} />
            </div>
          ))}
        </section>
      )}
    </aside>
  );
}
