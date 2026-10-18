
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
function Confirm({ q, txt, ok, onOk, onCancel, danger }) {
  return (
    <div className="ov center" onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="dlg" role="alertdialog" aria-label={q}>
        <h3>{q}</h3>
        {txt && <p>{txt}</p>}
        <div className="dlg-b">
          <button className="btn" onClick={onCancel}>{t('cancel')}</button>
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
  if (type === 'sveglia') {
    return (
      <svg width={size} height={size} viewBox="0 0 12 12" aria-hidden="true" style={{ flex: 'none' }}>
        <circle cx="6" cy="6.6" r="4.3" fill="none" stroke={color} strokeWidth="1.6" /><path d="M6 4.4v2.3l1.5 1M1.6 2.6l1.6-1.3M10.4 2.6L8.8 1.3" fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === 'promemoria' && only) {
    return (
      <svg width={size} height={size} viewBox="0 0 12 12" aria-hidden="true" style={{ flex: 'none' }}>
        <path d="M3 8.2V5.6a3 3 0 0 1 6 0v2.6l1 1H2zM5 10.8h2" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === 'promemoria') {
    return (
      <svg width={size} height={size} viewBox="0 0 12 12" aria-hidden="true" style={{ flex: 'none' }}>
        <circle cx="6" cy="6" r="4.6" fill={done ? color : 'none'} stroke={color} strokeWidth="1.8" />
      </svg>
    );
  }
  return <svg width={size} height={size} viewBox="0 0 12 12" aria-hidden="true" style={{ flex: 'none' }}><rect x="1" y="1" width="10" height="10" rx="3" fill={color} /></svg>;
}
function whenText(it, d) {
  const date = d || it.date;
  let s = fmtDayShort(date);
  if (isTimedMulti(it)) return `${s} ${fmtTime(it.start)} - ${fmtDayShort(addDays(date, spanDays(it)))} ${fmtTime(it.end ?? it.start)}`;
  if (isMulti(it)) s = `${fmtDayShort(date)} - ${fmtDayShort(addDays(date, spanDays(it)))}`;
  else if (it.start != null) s += ', ' + fmtTime(it.start) + (it.type === 'evento' && it.end != null ? ' - ' + fmtTime(it.end) : '');
  return s;
}

/* ============ Splash ============ */
function Splash({ onDone }) {
  const [out, setOut] = useState(false);
  useEffect(() => {
    const a = setTimeout(() => setOut(true), 2300);
    const b = setTimeout(onDone, 2750);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, []);
  return (
    <div className={'splash' + (out ? ' out' : '')} onClick={() => { setOut(true); setTimeout(onDone, 300); }}>
      <div className="sp-mid">
        <Mark size={128} anim />
        <div className="sp-word">hora</div>
      </div>
      <div className="sp-foot"><b>nautargo</b></div>
    </div>
  );
}
