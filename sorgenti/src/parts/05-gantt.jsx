
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
