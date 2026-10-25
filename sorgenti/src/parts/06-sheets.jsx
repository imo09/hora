
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
