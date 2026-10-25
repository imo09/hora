
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

