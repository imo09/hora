
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
  /* modifiche bloccate se un altro dispositivo collegato a Dropbox sta modificando: si chiede se proseguire da qui */
  const lockRef = useRef(false), claimRef = useRef(null);
  const guard = (fn) => {
    if (!lockRef.current) return fn();
    setConfirm({ q: t('lockQ'), txt: t('lockTxt'), ok: t('lockOk'), onOk: async () => { setConfirm(null); if (claimRef.current) await claimRef.current(); fn(); } });
    return undefined;
  };
  const setSettings = (p) => setSt((s) => ({ ...s, settings: { ...s.settings, ...p } }));
  const setCats = (cats) => guard(() => setSt((s) => ({ ...s, cats })));
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
  const saveItem = (it) => guard(() => setSt((s) => {
    const prev = s.items.find((x) => x.id === it.id);
    const next = { ...it, doneDates: prev ? prev.doneDates : it.doneDates || {} };
    return { ...s, items: prev ? s.items.map((x) => (x.id === it.id ? next : x)) : [...s.items, next] };
  }));
  const toggleDone = (it, d) => guard(() => setSt((s) => ({
    ...s,
    items: s.items.map((x) => {
      if (x.id !== it.id) return x;
      const dd = { ...(x.doneDates || {}) };
      if (dd[d]) delete dd[d]; else dd[d] = true;
      return { ...x, doneDates: dd };
    })
  })));
  const askDelete = (it) => guard(() => setConfirm({
    q: t('delItemQ'), txt: it.repeat && it.repeat.f !== 'none' ? t('delItemRep') : null, ok: t('del'), danger: true,
    onOk: () => { setSt((s) => ({ ...s, items: s.items.filter((x) => x.id !== it.id) })); setSheet(null); setConfirm(null); toast(t('deleted')); }
  }));

  /* categorie */
  const remember = (id) => { if (id) setSettings({ recent: [id, ...(stRef.current.settings.recent || []).filter((x) => x !== id)].slice(0, 6) }); };
  const upsertCat = (c) => guard(() => setSt((s) => {
    const exists = s.cats.some((x) => x.id === c.id);
    if (exists) return { ...s, cats: s.cats.map((x) => (x.id === c.id ? c : x)) };
    const sib = s.cats.filter((x) => (x.parent || null) === (c.parent || null));
    return { ...s, cats: [...s.cats, { ...c, order: sib.length ? Math.max(...sib.map((x) => x.order ?? 0)) + 1 : 0 }] };
  }));
  const createCat = (name) => {
    const c = { id: uid(), name, icon: 'tag', color: nextColor(stRef.current.cats), details: '', parent: null, order: null, gantt: true };
    upsertCat(c);
    return c.id;
  };
  const askDeleteCat = (c) => guard(() => {
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
  });

  const openPicker = (current, cb) => setPicker({ current, cb });

  /* blocchi e importazioni */
  const openBlock = (text, origin) => {
    const drafts = parseBlock(text, stRef.current.cats);
    setSheet(null);
    push({ kind: 'import', drafts, origin });
  };
  const confirmImport = (rows) => guard(() => {
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
  });

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
  /* sincronizzazione con Dropbox: un solo dispositivo modifica alla volta, gli altri vedono e, per modificare, prendono il controllo */
  const [sync, setSync] = useState(() => ({ linked: dbxLinked(), busy: false, last: dbxGet().last || 0, ro: false }));
  const fromSync = useRef(false), firstData = useRef(true), syncT = useRef(null);
  const applyRemote = (r) => { fromSync.current = true; setSt((s) => ({ ...s, items: r.items || [], cats: r.cats || [], alarmGroups: r.alarmGroups || [] })); setLocalUpd(r.updated || Date.now()); };
  const upload = async () => {
    const s0 = stRef.current, u = localUpd() || Date.now();
    await dbxUp({ app: 'hora', version: VERSION, updated: u, editor: devId(), editorName: devName(), items: s0.items, cats: s0.cats, alarmGroups: s0.alarmGroups || [] });
    dbxSet({ last: u });
  };
  const doSync = async (manual) => {
    if (!dbxLinked()) return;
    setSync((x) => ({ ...x, busy: true }));
    try {
      const remote = await dbxDown();
      let ro = false;
      if (!remote) await upload();
      else if (remote.editor && remote.editor !== devId()) {
        // un altro dispositivo sta modificando: qui si guarda soltanto, con i suoi dati
        ro = true;
        if ((remote.updated || 0) !== localUpd()) applyRemote(remote);
      } else if (localUpd() > (remote.updated || 0)) await upload();
      else if ((remote.updated || 0) > localUpd()) applyRemote(remote);
      lockRef.current = ro;
      setSync({ linked: true, busy: false, last: Date.now(), ro, editorName: ro ? remote.editorName || '' : '' });
      if (manual) toast(t('syncOk'));
    } catch (e) { setSync((x) => ({ ...x, busy: false })); if (manual) toast(t('syncFail')); }
  };
  /* prendere il controllo: si scaricano gli ultimi dati, poi questo dispositivo diventa quello che modifica */
  claimRef.current = async () => {
    try {
      const remote = await dbxDown();
      if (remote && (remote.updated || 0) !== localUpd()) applyRemote(remote);
      await new Promise((r) => setTimeout(r, 0));
      await upload();
      lockRef.current = false;
      setSync((x) => ({ ...x, ro: false, last: Date.now() }));
    } catch (e) { lockRef.current = false; setSync((x) => ({ ...x, ro: false })); toast(t('syncFail')); }
  };
  useEffect(() => {
    dbxFinish().then((ok) => { if (ok) setSync((x) => ({ ...x, linked: true })); if (dbxLinked()) doSync(false); }).catch(() => toast(t('syncFail')));
    const vis = () => { if (document.visibilityState === 'visible') doSync(false); };
    document.addEventListener('visibilitychange', vis);
    const iv = setInterval(() => doSync(false), 5 * 60000);
    return () => { document.removeEventListener('visibilitychange', vis); clearInterval(iv); };
  }, []);
  useEffect(() => {
    if (firstData.current) { firstData.current = false; return; }
    if (fromSync.current) { fromSync.current = false; return; }
    setLocalUpd(Date.now());
    if (!dbxLinked() || lockRef.current) return;
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

  /* tocco su un elemento: prima il riepilogo (eventi e promemoria), le sveglie si aprono in modifica */
  const openOcc = (o) => setSheet({ item: o.it, occDate: o.date, isNew: false, view: o.it.type !== 'sveglia' });
  const newDate = () => (view === 'gantt' ? today : view === 'month' ? anchor : vis.includes(today) ? today : vis[0]);
  const newSheet = (autoMic) => guard(() => setSheet({ item: newItem({ date: newDate(), cat: newCat }), isNew: true, autoMic }));
  const onNewAt = (d) => guard(() => setSheet({ item: newItem({ date: d.date, start: d.start, end: d.end, cat: newCat }), isNew: true, preset: true }));
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
          setConfirm({ q: t('restoreQ'), txt: t('restoreTxt'), ok: t('confirm'), onOk: () => guard(() => { setSt({ v: 1, items: data.items, cats: data.cats, alarmGroups: data.alarmGroups || [], settings: { ...st.settings, ...(data.settings || {}) } }); setConfirm(null); toast(t('restored')); }) });
        }}
        onExportIcs={() => download(`hora-${todayStr()}.ics`, toICS(st.items, st.cats), 'text/calendar')}
        onImportCal={importCal} sync={sync} onAgenda={(tab) => push({ kind: 'agenda', tab })} onAi={() => push({ kind: 'ai' })}
        onSyncNow={() => doSync(true)} onLink={() => dbxLink().catch(() => toast(t('syncFail')))} onUnlink={() => { dbxUnlink().then(() => setSync({ linked: false, busy: false, last: 0 })); }} />
    );
    if (sc.kind === 'agenda') return (
      <AgendaScreen key={i} st={st} tab={sc.tab} onBack={pop} onOpen={openOcc} onNewAlarm={(g) => guard(() => setSheet({ item: newItem({ type: 'sveglia', start: 420, group: g, date: todayStr() }), isNew: true }))}
        onSaveItem={saveItem} onSetGroups={(g) => guard(() => setSt((s) => ({ ...s, alarmGroups: g })))} onSetting={setSettings}
        onAddTemplate={(x) => guard(() => setSt((s) => {
          const g = { id: uid(), name: LANG === 'en' ? x.en : x.name, order: (s.alarmGroups || []).length, tpl: x.key };
          const its = x.items.map((a) => newItem({ type: 'sveglia', title: a.title, start: a.start, alert: 0, repeat: tplDays(a.days), group: g.id, date: todayStr() }));
          return { ...s, alarmGroups: [...(s.alarmGroups || []), g], items: [...s.items, ...its] };
        }))} />
    );
    if (sc.kind === 'ai') return <AiImportScreen key={i} onBack={pop} toast={toast} onRead={(txt) => openBlock(txt, 'paste')} />;
    if (sc.kind === 'cats') return <CatsScreen key={i} st={st} onBack={pop} onSetCats={setCats} onEdit={(id) => push({ kind: 'cat', id })} onNew={() => push({ kind: 'cat', id: null, parentId: null })} />;
    if (sc.kind === 'cat') return (
      <CatEdit key={i + (sc.id || 'n') + (sc.parentId || '')} st={st} catId={sc.id} parentId={sc.parentId} onBack={pop} onSave={upsertCat} onDelete={askDeleteCat}
        onOpenSub={(id) => push({ kind: 'cat', id })} onAddSub={(pid) => push({ kind: 'cat', id: null, parentId: pid })} />
    );
    if (sc.kind === 'import') return <ImportScreen key={i} st={st} drafts={sc.drafts} origin={sc.origin} onClose={pop} onConfirm={confirmImport} onPickCat={openPicker} />;
    if (sc.kind === 'search') return <SearchScreen key={i} st={st} onClose={pop} onOpen={openOcc} onGoDate={(d) => { pop(); goDate(view === 'grid' && days === 5 && wd(d) < 5 ? startOfWeek(d) : d); }} />;
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
            {sync.ro && <button className="ctl ro" title={t('roHere')} onClick={() => guard(() => {})}><UIcon n="eye" size={17} /><span>{t('roShort')}</span></button>}
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

      {sheet && sheet.view && (
        <ItemView key={'v' + sheet.item.id} st={st} it={sheet.item} occDate={sheet.occDate} onClose={() => setSheet(null)} onToggleDone={toggleDone}
          onEdit={() => guard(() => setSheet((x) => ({ ...x, view: false })))} />
      )}
      {sheet && !sheet.view && (
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
  // app installata: rotazione libera anche se una versione precedente l'aveva fissata in verticale
  try { const so = screen.orientation; if (so && so.lock && window.matchMedia('(display-mode: standalone)').matches) so.lock('any').catch(() => {}); } catch (e) { /* niente */ }
  createRoot(document.getElementById('root')).render(<App />);
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
}
