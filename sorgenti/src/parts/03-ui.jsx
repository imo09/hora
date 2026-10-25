
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
