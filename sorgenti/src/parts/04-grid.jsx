
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
      {box && box.cc
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
    <div className={'rem' + (ghost ? ' ghost' : '') + (selected ? ' sel' : '') + (faded ? ' faded' : '')} data-key={ghost ? undefined : o.key} style={{ top: (start / 60) * hourH, ...(box ? { left: box.left, width: box.width, zIndex: box.zIndex } : laneBox(lane, nl, span)), ...(selected ? { zIndex: 6 } : null), borderColor: tn.c, background: tn.tint }}>
      {only
        ? <span className="chk"><TypeShape type="promemoria" only color={tn.c} size={14} /></span>
        : <button className="chk" data-chk="1" aria-label={t('markDone') + ': ' + o.it.title} onClick={() => onToggle && onToggle(o.it, o.date)}>
            <TypeShape type="promemoria" color={tn.c} done={done} size={14} />
          </button>}
      <span className={done && !only ? 'strike' : ''}>{o.it.title || t('noTitle')}</span>
    </div>
  );
}
/* sveglia: riga spessa all'ora esatta */
function AlarmLine({ o, start, hourH, ghost, selected, faded }) {
  return (
    <div className={'alm' + (ghost ? ' ghost' : '') + (selected ? ' sel' : '') + (faded ? ' faded' : '')} data-key={ghost ? undefined : o.key} style={{ top: (start / 60) * hourH - 14 }}>
      <span><TypeShape type="sveglia" color="currentColor" size={10} />{fmtTime(start)} {o.it.title || t('alarm')}</span><i />
    </div>
  );
}
const ALARM_C = '#6E4F7E';
const Block = (p) => (p.o.it.type === 'evento' ? <EvBlock {...p} /> : p.o.it.type === 'sveglia' ? <AlarmLine {...p} /> : <RemRow {...p} />);

function GridView({ st, dates, anchor, sx, visN = 5, pass, newCat, sun, hourH, setHourH, commitHourH, onOpen, onSave, onToggle, onShift, onPinchDays, onSwipe, onVisible, onNewAt, nonce }) {
  const today = todayStr();
  const scRef = useRef(null), colsRef = useRef(null), topRef = useRef(null);
  const [sel, setSel] = useState(null);
  const [drag, setDrag] = useState(null);
  const [draft, setDraft] = useState(null);
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
  R.current = { dates, anchor, sx, colW, occ, hourH, sel, draft, onOpen, onSave, onShift, onPinchDays, onSwipe, onVisible, onNewAt, setHourH, commitHourH, setSel, setDraft };

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
    let lp = null, dg = null, pinch = null, edge = null, auto = null, md = null, wt = null, sw = null, scT = null;
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
      const h = e.target.closest('[data-h]');
      if (h) { e.preventDefault(); begin(h.dataset.h, h.dataset.key, tc.clientX, tc.clientY); return; }
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
      if (h) { e.preventDefault(); begin(h.dataset.h, h.dataset.key, e.clientX, e.clientY); return; }
      const evEl = e.target.closest('[data-key]');
      md = { x: e.clientX, y: e.clientY, key: evEl ? evEl.dataset.key : null, inCols: !!e.target.closest('.g-cols') };
      if (evEl) e.preventDefault();
    };
    const onMM = (e) => {
      last = { x: e.clientX, y: e.clientY };
      if (dg) { update(e.clientX, e.clientY); return; }
      if (md && md.key && (Math.abs(e.clientX - md.x) > 4 || Math.abs(e.clientY - md.y) > 4)) { const m0 = md; md = null; begin('move', m0.key, m0.x, m0.y); update(e.clientX, e.clientY); }
    };
    const onMU = () => {
      if (dg) { finish(); return; }
      if (md) { const m0 = md; md = null; tap(m0.key, m0.x, m0.y, m0.inCols); }
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
      clearInterval(auto); clearEdge(); cancelLP(); clearTimeout(scT);
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
  const boxOf = (x) => {
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
  return (
    <div className={'grid' + (sx ? ' sx' : '')}>
      <div className={'g-scroll' + (drag ? ' dragging' : '')} ref={scRef}>
        <div className="g-wide" style={sx ? { width: `calc(var(--gut) + ${n * colW}px)` } : undefined}>
          {(
            <div className="g-top" ref={topRef}>
              {(
                <div className="g-head">
                  <span className="g-gut" />
                  {dates.map((d) => (
                    <div key={d} style={cw} className={'g-day' + (d === today ? ' today' : '') + (wd(d) > 4 ? ' we' : '')}><span>{fmtHead(d, headW)}</span></div>
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
                      return (
                        <button key={o.key} className={'ad-chip' + (o.date < dates[0] ? ' cut-l' : '') + (o.end > dates[n - 1] ? ' cut-r' : '')} onClick={() => onOpen(o)}
                          style={{ top: r * 25, left: `calc(${(i / n) * 100}% + 1px)`, width: `calc(${((j - i + 1) / n) * 100}% - 3px)`, background: tn.tint, color: tn.ink, borderColor: tn.c }}>
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
            <div className="g-cols" ref={colsRef} style={gridBg(hourH)}>
              {sun && <div className="night" style={{ top: 0, height: sunY[0] }} aria-hidden="true" />}
              {sun && <div className="night" style={{ top: sunY[1], bottom: 0 }} aria-hidden="true" />}
              {sun && sunY.map((y, i) => <div key={i} className="sun" style={{ top: y }} aria-hidden="true" />)}
              {cols.map((c, ci) => {
                // un solo elenco con chiavi stabili: l'elemento toccato resta nel DOM anche se il giorno cambia durante il trascinamento
                const blocks = [
                  ...c.ev.map((x) => <Block key={x.o.key} o={x.o} box={boxOf(x)} start={x.s} end={x.e} hourH={hourH} cats={st.cats} onToggle={onToggle} selected={sel === x.o.key} faded={!!drag && drag.key === x.o.key} fixed={isTimedMulti(x.o.it)} />),
                  ...c.rem.map((o) => <Block key={o.key} o={o} start={o.it.start} hourH={hourH} cats={st.cats} onToggle={onToggle} selected={sel === o.key} faded={!!drag && drag.key === o.key} />)
                ];
                if (drag && drag.origCol === ci && !blocks.some((b) => b.key === drag.key)) {
                  const oi = drag.orig.it;
                  blocks.push(<Block key={drag.key} o={drag.orig} start={oi.start} end={oi.end ?? oi.start + 60} hourH={hourH} cats={st.cats} faded />);
                }
                return (
                  <div key={ci} style={cw} className={'g-col' + (c.d === today && n > 1 ? ' today' : '')}>
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
  const rowH = () => { const c = scRef.current && scRef.current.querySelector('.m-cell'); return (c && c.offsetHeight) ? c.offsetHeight + 2 : titles ? 88 : 52; };
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
  return (
    <div className="month" ref={ref}>
      <div className="m-wd">{WD_LETTER[LANG].map((l, i) => <span key={i}>{l}</span>)}</div>
      <div className={free ? 'm-scroll' + (titles ? ' titles' : '') : 'm-fix'} ref={scRef}>
      <div className={'m-grid' + (titles ? ' titles' : '')}>
        {days.map((d) => {
          const its = (byDay[d] || []).filter((o) => o.it.type !== 'sveglia');
          const out = d.slice(0, 7) !== ms.slice(0, 7);
          return (
            <button key={d} className={'m-cell' + (out ? ' out' : '') + (d === anchor ? ' sel' : '')} aria-label={fmtFull(d)} onClick={() => tapDay(d)}>
              {free && dnum(d) === 1 && <span className="m-mo">{mab(d)}</span>}
              <span className={'m-n' + (d === today ? ' today' : '')}>{dnum(d)}</span>
              {titles ? (
                <span className="m-tl">
                  {its.slice(0, 3).map((o) => { const tn = catTone(st.cats, o.it.cat); return <span key={o.key} style={{ background: tn.tint, color: tn.ink, borderLeftColor: tn.c }}>{o.it.title}</span>; })}
                  {its.length > 3 && <em>+{its.length - 3}</em>}
                </span>
              ) : (
                <span className="m-dots">
                  {its.slice(0, 4).map((o) => <i key={o.key} style={{ background: catTone(st.cats, o.it.cat).c }} />)}
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
