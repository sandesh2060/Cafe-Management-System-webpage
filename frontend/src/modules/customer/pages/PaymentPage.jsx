// ================================================================
// FILE: frontend/src/modules/customer/pages/PaymentPage.jsx
// ✅ Mobile-first — works on every screen size
// ✅ useIsMobile hook drives layout decisions
// ✅ Custom split: stacked card per person on mobile
// ✅ Touch-friendly 44px tap targets everywhere
// ✅ Nunito 900, crimson radial card, dark/light ThemeContext
// ✅ GSAP entrance animations
// ================================================================

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle, Shield, CreditCard,
  Users, Minus, Plus, ChevronRight, Zap, Shuffle, Trash2,
} from 'lucide-react';
import { toast } from 'react-toastify';
import gsap from 'gsap';
import PaymentMethodModal from '../components/PaymentMethodModal';
import { useTheme } from '../../../shared/context/ThemeContext';

/* ── Google Font ─────────────────────────────────────────────── */
if (typeof document !== 'undefined' && !document.getElementById('nunito-font')) {
  const l = document.createElement('link');
  l.id = 'nunito-font'; l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap';
  document.head.appendChild(l);
}

/* ── Responsive hook ─────────────────────────────────────────── */
const useIsMobile = () => {
  const [m, setM] = useState(typeof window !== 'undefined' ? window.innerWidth < 480 : true);
  useEffect(() => {
    const fn = () => setM(window.innerWidth < 480);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return m;
};

/* ── Tokens ──────────────────────────────────────────────────── */
const SHADOW = {
  orange: '0 10px 32px rgba(234,88,12,.36)',
  purple: '0 8px 26px rgba(139,92,246,.38)',
  green:  '0 14px 44px rgba(16,185,129,.36)',
};
const AVATAR_GRADS = [
  ['#f97316','#dc2626'], ['#3b82f6','#2563eb'], ['#10b981','#059669'],
  ['#a855f7','#7c3aed'], ['#f59e0b','#d97706'], ['#ec4899','#db2777'],
  ['#06b6d4','#0891b2'], ['#84cc16','#65a30d'],
];

/* ── Helpers ─────────────────────────────────────────────────── */
const glass = (d, extra = {}) => ({
  background:           d ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.80)',
  border:               `1px solid ${d ? 'rgba(255,255,255,0.11)' : 'rgba(0,0,0,0.07)'}`,
  backdropFilter:       'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  ...extra,
});
const eyebrow = (d) => ({
  fontSize: 10, fontWeight: 800, letterSpacing: '0.13em', textTransform: 'uppercase',
  color: d ? 'rgba(255,255,255,0.36)' : 'rgba(100,40,8,0.48)',
});

/* ── Shared atoms ────────────────────────────────────────────── */
const RoundBtn = ({ d, onClick, children }) => (
  <button onClick={onClick} style={{
    width: 44, height: 44, borderRadius: '50%', border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    ...glass(d), color: d ? 'rgba(255,255,255,0.85)' : 'rgba(100,40,8,0.85)',
    transition: 'transform 0.14s',
  }}
    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.10)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    onMouseDown={e  => e.currentTarget.style.transform = 'scale(0.90)'}
    onMouseUp={e    => e.currentTarget.style.transform = 'scale(1.10)'}
  >{children}</button>
);

const PayButton = ({ d, label, disabled, onClick }) => (
  <button onClick={onClick} disabled={disabled} style={{
    width: '100%', padding: '17px 20px', borderRadius: 999, border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: "'Nunito',sans-serif", fontSize: 16, fontWeight: 900, color: '#fff',
    background: disabled
      ? (d ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.09)')
      : 'linear-gradient(118deg,#f97316 0%,#ea580c 52%,#dc2626 100%)',
    boxShadow: disabled ? 'none' : SHADOW.orange,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
    opacity: disabled ? 0.45 : 1,
    transition: 'transform 0.18s, box-shadow 0.18s',
  }}
    onMouseEnter={e => { if (!disabled) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 44px rgba(234,88,12,.48)'; }}}
    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = disabled ? 'none' : SHADOW.orange; }}
    onMouseDown={e  => { if (!disabled) e.currentTarget.style.transform = 'scale(0.97)'; }}
    onMouseUp={e    => { if (!disabled) e.currentTarget.style.transform = 'translateY(-2px)'; }}
  >
    <CreditCard size={17} strokeWidth={2.5} />{label}
  </button>
);

/* ════════════════════════════════════════════════════════════════
   STEP 1 — Pay Now | Group Pay
════════════════════════════════════════════════════════════════ */
function PaymentModeStep({ total, d, onPayNow, onGroupPay }) {
  const ref = useRef(null);
  useEffect(() => {
    gsap.fromTo(ref.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.44, ease: 'expo.out' });
  }, []);

  const Card = ({ onClick, emoji, title, desc, pill, pillStyle }) => (
    <div onClick={onClick} style={{
      flex: 1, borderRadius: 20, padding: '20px 14px 18px', cursor: 'pointer',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
      ...glass(d), textAlign: 'center',
      boxShadow: '0 2px 14px rgba(0,0,0,0.05)',
      transition: 'transform 0.20s, box-shadow 0.20s, border-color 0.20s',
      WebkitTapHighlightColor: 'transparent',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(0,0,0,0.11)'; e.currentTarget.style.borderColor = d ? 'rgba(249,115,22,0.38)' : 'rgba(249,115,22,0.32)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 14px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = d ? 'rgba(255,255,255,0.11)' : 'rgba(0,0,0,0.07)'; }}
      onMouseDown={e  => e.currentTarget.style.transform = 'scale(0.97)'}
      onMouseUp={e    => e.currentTarget.style.transform = 'translateY(-3px)'}
    >
      <div style={{ fontSize: 28, lineHeight: 1 }}>{emoji}</div>
      <div style={{ fontSize: 15, fontWeight: 900, color: d ? '#fff' : '#1a0800' }}>{title}</div>
      <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.55, color: d ? 'rgba(255,255,255,0.46)' : 'rgba(100,40,8,0.56)' }}>
        {desc}
      </div>
      <div style={{ marginTop: 2, padding: '7px 14px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 900, ...pillStyle }}>
        {pill}
      </div>
    </div>
  );

  return (
    <div ref={ref}>
      <p style={{ ...eyebrow(d), display: 'block', marginBottom: 14 }}>How would you like to pay?</p>
      <div style={{ display: 'flex', gap: 10 }}>
        <Card onClick={onPayNow} emoji="💳" title="Pay Now" desc="Pay the full amount yourself"
          pill={<><span>Rs.{total?.toFixed(2)}</span><ChevronRight size={12} /></>}
          pillStyle={{ background: 'linear-gradient(118deg,#f97316,#dc2626)', color: '#fff', boxShadow: SHADOW.orange }}
        />
        <Card onClick={onGroupPay} emoji="👥" title="Group Pay" desc="Split the bill with friends"
          pill={<><Users size={11} /><span>Split</span><ChevronRight size={12} /></>}
          pillStyle={{ background: d ? 'rgba(255,255,255,0.11)' : 'rgba(0,0,0,0.07)', color: d ? 'rgba(255,255,255,0.78)' : 'rgba(100,40,8,0.78)' }}
        />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   STEP 2 — Equal Split | Custom Split
════════════════════════════════════════════════════════════════ */
function GroupSplitStep({ total, d, onPay, onBack }) {
  const isMobile = useIsMobile();
  const [tab, setTab]       = useState('equal');
  const [count, setCount]   = useState(2);
  const share               = +(total / count).toFixed(2);

  const [splits, setSplits] = useState([
    { id: 1, name: '', amount: '' },
    { id: 2, name: '', amount: '' },
  ]);

  const assigned   = splits.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
  const remaining  = +(total - assigned).toFixed(2);
  const isBalanced = Math.abs(remaining) < 0.01;
  const myAmt      = parseFloat(splits[0]?.amount ?? 0);
  const anyAmt     = splits.some(p => p.amount !== '');

  const addPerson    = () => setSplits(p => [...p, { id: Date.now(), name: '', amount: '' }]);
  const removePerson = (id) => {
    if (splits.length <= 2) { toast.error('Minimum 2 people'); return; }
    setSplits(p => p.filter(x => x.id !== id));
  };
  const update = (id, field, val) =>
    setSplits(p => p.map(x => x.id === id ? { ...x, [field]: val } : x));

  const luckyPay = () => {
    const n    = splits.length;
    const cuts = Array.from({ length: n - 1 }, () => Math.random() * total).sort((a, b) => a - b);
    const pts  = [0, ...cuts, total];
    const amts = pts.slice(1).map((v, i) => +(v - pts[i]).toFixed(2));
    const used = amts.slice(0, -1).reduce((a, b) => a + b, 0);
    amts[amts.length - 1] = +(total - used).toFixed(2);
    setSplits(prev => prev.map((p, i) => ({ ...p, amount: String(amts[i] ?? '') })));
    toast.success('🎲 Lucky amounts assigned!', { autoClose: 1600 });
  };

  const statusColor = isBalanced ? '#10b981' : remaining < 0 ? '#ef4444' : '#f59e0b';
  const statusBg    = isBalanced ? 'rgba(16,185,129,0.13)' : remaining < 0 ? 'rgba(239,68,68,0.13)' : 'rgba(245,158,11,0.13)';
  const statusText  = isBalanced ? '✓ Balanced' : remaining > 0 ? `Rs.${remaining.toFixed(2)} left` : `Rs.${Math.abs(remaining).toFixed(2)} over`;

  const payLabel = !isBalanced ? statusText : myAmt > 0 ? `Pay Rs.${myAmt.toFixed(2)}` : "Confirm — being treated 🎉";

  const ref = useRef(null);
  useEffect(() => {
    gsap.fromTo(ref.current, { x: 22, opacity: 0 }, { x: 0, opacity: 1, duration: 0.40, ease: 'expo.out' });
  }, []);

  const tabBtn = (t) => ({
    flex: 1, padding: '10px 8px', borderRadius: 999, border: 'none', cursor: 'pointer',
    fontFamily: "'Nunito',sans-serif", fontSize: 13, fontWeight: 800,
    transition: 'all 0.20s', WebkitTapHighlightColor: 'transparent',
    ...(tab === t
      ? { background: 'linear-gradient(118deg,#f97316,#dc2626)', color: '#fff', boxShadow: '0 4px 14px rgba(234,88,12,0.32)' }
      : { background: 'transparent', color: d ? 'rgba(255,255,255,0.36)' : 'rgba(100,40,8,0.42)' }),
  });

  const inp = {
    background: 'transparent', border: 'none', outline: 'none',
    fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: 14,
    color: d ? '#fff' : '#1a0800', width: '100%',
  };

  return (
    <div ref={ref}>
      {/* back */}
      <button onClick={onBack} style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        marginBottom: 18, padding: '9px 16px 9px 12px', borderRadius: 999,
        border: 'none', cursor: 'pointer', fontFamily: "'Nunito',sans-serif",
        fontSize: 13, fontWeight: 800, WebkitTapHighlightColor: 'transparent',
        ...glass(d, { color: d ? 'rgba(255,255,255,0.62)' : 'rgba(100,40,8,0.68)' }),
      }}>
        <ArrowLeft size={13} /> Back
      </button>

      <p style={{ ...eyebrow(d), display: 'block', marginBottom: 14 }}>Split method</p>

      {/* tab switcher */}
      <div style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 999, marginBottom: 20, ...glass(d) }}>
        <button style={tabBtn('equal')} onClick={() => setTab('equal')}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Users size={13} /> Equal Split</span>
        </button>
        <button style={tabBtn('custom')} onClick={() => setTab('custom')}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Shuffle size={13} /> Custom Split</span>
        </button>
      </div>

      {/* ══ EQUAL ══ */}
      {tab === 'equal' && (
        <>
          <div style={{ ...glass(d, { borderRadius: 20, padding: '20px 24px', marginBottom: 14 }) }}>
            <p style={{ ...eyebrow(d), display: 'block', marginBottom: 18 }}>Number of people</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <RoundBtn d={d} onClick={() => setCount(c => Math.max(2, c - 1))}><Minus size={16} /></RoundBtn>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 56, fontWeight: 900, lineHeight: 1, color: d ? '#fff' : '#1a0800' }}>{count}</div>
                <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4, color: d ? 'rgba(255,255,255,0.40)' : 'rgba(100,40,8,0.50)' }}>
                  {count === 1 ? 'person' : 'people'}
                </div>
              </div>
              <RoundBtn d={d} onClick={() => setCount(c => Math.min(20, c + 1))}><Plus size={16} /></RoundBtn>
            </div>
          </div>

          <div style={{ ...glass(d, { borderRadius: 20, padding: '16px 20px', marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }) }}>
            <div>
              <p style={{ ...eyebrow(d), display: 'block', marginBottom: 6 }}>Each person pays</p>
              <div style={{ fontSize: 30, fontWeight: 900, color: d ? '#fff' : '#1a0800' }}>Rs.{share.toFixed(2)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: d ? 'rgba(255,255,255,0.28)' : 'rgba(100,40,8,0.36)' }}>Bill total</div>
              <div style={{ fontSize: 15, fontWeight: 800, marginTop: 3, color: d ? 'rgba(255,255,255,0.50)' : 'rgba(100,40,8,0.56)' }}>Rs.{total?.toFixed(2)}</div>
            </div>
          </div>

          {/* person pills — wrap naturally */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {Array.from({ length: count }, (_, i) => {
              const [c1, c2] = AVATAR_GRADS[i % AVATAR_GRADS.length];
              return (
                <div key={i} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '6px 12px 6px 6px', borderRadius: 999,
                  ...glass(d, { color: d ? 'rgba(255,255,255,0.78)' : 'rgba(100,40,8,0.82)' }),
                }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, background: `linear-gradient(135deg,${c1},${c2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, color: '#fff' }}>{i + 1}</div>
                  <span style={{ fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>P{i + 1}</span>
                  <span style={{ fontSize: 12, fontWeight: 900, color: d ? '#fb923c' : '#ea580c', whiteSpace: 'nowrap' }}>Rs.{share.toFixed(2)}</span>
                </div>
              );
            })}
          </div>

          <PayButton d={d} label={`Pay my share — Rs.${share.toFixed(2)}`} onClick={() => onPay(share)} />
        </>
      )}

      {/* ══ CUSTOM ══ */}
      {tab === 'custom' && (
        <>
          {/* status */}
          <div style={{ ...glass(d, { borderRadius: 14, padding: '10px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }) }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: d ? 'rgba(255,255,255,0.56)' : 'rgba(100,40,8,0.60)' }}>
              Total: <strong style={{ color: d ? '#fff' : '#1a0800' }}>Rs.{total?.toFixed(2)}</strong>
            </span>
            <span style={{ fontSize: 12, fontWeight: 800, padding: '4px 12px', borderRadius: 999, background: statusBg, color: statusColor, whiteSpace: 'nowrap' }}>
              {statusText}
            </span>
          </div>

          {/* person cards — STACKED on mobile, row on desktop */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
            {splits.map((p, i) => {
              const [c1, c2] = AVATAR_GRADS[i % AVATAR_GRADS.length];
              const hasAmt   = p.amount !== '';
              return (
                <div key={p.id} style={{
                  borderRadius: 16, padding: '14px',
                  ...glass(d),
                  position: 'relative',
                }}>
                  {/* top row: avatar + name + delete */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 11, flexShrink: 0,
                      background: `linear-gradient(135deg,${c1},${c2})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, fontWeight: 900, color: '#fff',
                      boxShadow: `0 3px 10px ${c1}44`,
                    }}>
                      {(p.name || `${i + 1}`).charAt(0).toUpperCase()}
                    </div>

                    {/* name input */}
                    <div style={{ flex: 1, ...glass(d, { borderRadius: 10, padding: '8px 12px' }) }}>
                      <input
                        style={{ ...inp, fontSize: 14 }}
                        placeholder={i === 0 ? 'Your name (you)' : `Person ${i + 1} name`}
                        value={p.name}
                        onChange={e => update(p.id, 'name', e.target.value)}
                      />
                    </div>

                    {/* remove */}
                    <button onClick={() => removePerson(p.id)} style={{
                      width: 36, height: 36, borderRadius: 10, border: 'none', cursor: 'pointer', flexShrink: 0,
                      background: 'rgba(239,68,68,0.10)', color: '#ef4444',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* bottom row: amount input full-width */}
                  <div style={{
                    ...glass(d, {
                      borderRadius: 10, padding: '10px 14px',
                      display: 'flex', alignItems: 'center', gap: 6,
                      ...(hasAmt ? { borderColor: isBalanced ? 'rgba(16,185,129,0.40)' : remaining < 0 ? 'rgba(239,68,68,0.40)' : 'rgba(245,158,11,0.40)' } : {}),
                    }),
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 800, flexShrink: 0, color: d ? 'rgba(255,255,255,0.45)' : 'rgba(100,40,8,0.50)' }}>Rs.</span>
                    <input
                      style={{ ...inp, textAlign: 'right', fontSize: 18, fontWeight: 900 }}
                      type="number" inputMode="decimal" placeholder="0.00" min="0"
                      value={p.amount}
                      onChange={e => update(p.id, 'amount', e.target.value)}
                    />
                    {i === 0 && (
                      <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 999, background: 'rgba(249,115,22,0.16)', color: '#f97316', flexShrink: 0, whiteSpace: 'nowrap' }}>You</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* actions */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
            <button onClick={addPerson} style={{
              flex: 1, padding: '12px 14px', borderRadius: 12, border: 'none', cursor: 'pointer',
              fontFamily: "'Nunito',sans-serif", fontSize: 13, fontWeight: 800,
              ...glass(d, { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: d ? 'rgba(255,255,255,0.60)' : 'rgba(100,40,8,0.65)' }),
              WebkitTapHighlightColor: 'transparent',
            }}>
              <Plus size={14} /> Add Person
            </button>
            <button onClick={luckyPay} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              padding: '12px 18px', borderRadius: 12, border: 'none', cursor: 'pointer',
              fontFamily: "'Nunito',sans-serif", fontSize: 13, fontWeight: 900, color: '#fff',
              background: 'linear-gradient(118deg,#a855f7,#7c3aed)',
              boxShadow: SHADOW.purple, flexShrink: 0,
              WebkitTapHighlightColor: 'transparent',
            }}>
              <Zap size={14} strokeWidth={2.5} /> Lucky Pay
            </button>
          </div>

          {/* who pays what */}
          {anyAmt && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ ...eyebrow(d), display: 'block', marginBottom: 10 }}>Who pays what</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {splits.map((p, i) => {
                  const amt   = parseFloat(p.amount) || 0;
                  const pct   = total > 0 ? Math.min(100, (amt / total) * 100) : 0;
                  const isMe  = i === 0;
                  const shown = p.amount !== '';
                  const [c1, c2] = AVATAR_GRADS[i % AVATAR_GRADS.length];
                  return (
                    <div key={p.id} style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 14,
                      background: isMe ? (d ? 'rgba(249,115,22,0.12)' : 'rgba(249,115,22,0.08)') : (d ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.72)'),
                      border: `1px solid ${isMe ? (d ? 'rgba(249,115,22,0.26)' : 'rgba(249,115,22,0.22)') : (d ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)')}`,
                    }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: `linear-gradient(135deg,${c1},${c2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, color: '#fff', boxShadow: `0 3px 10px ${c1}44` }}>
                        {(p.name || `${i + 1}`).charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                          <span style={{ fontSize: 13, fontWeight: 800, color: d ? '#fff' : '#1a0800', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {p.name || `Person ${i + 1}`}
                          </span>
                          {isMe && <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 999, background: 'rgba(249,115,22,0.16)', color: '#f97316', flexShrink: 0, letterSpacing: '0.06em', textTransform: 'uppercase' }}>You</span>}
                        </div>
                        <div style={{ height: 4, borderRadius: 999, background: d ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)', overflow: 'hidden' }}>
                          <div style={{ height: '100%', borderRadius: 999, width: `${pct}%`, background: `linear-gradient(90deg,${c1},${c2})`, transition: 'width 0.5s cubic-bezier(0.34,1.56,0.64,1)' }} />
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 60 }}>
                        <div style={{ fontSize: 15, fontWeight: 900, color: shown ? (d ? '#fff' : '#1a0800') : (d ? 'rgba(255,255,255,0.20)' : 'rgba(100,40,8,0.25)') }}>
                          {shown ? `Rs.${amt.toFixed(2)}` : '—'}
                        </div>
                        <div style={{ fontSize: 10, fontWeight: 700, marginTop: 2, color: d ? 'rgba(255,255,255,0.33)' : 'rgba(100,40,8,0.40)' }}>
                          {shown ? `${pct.toFixed(0)}%` : ''}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* your share summary */}
          <div style={{ ...glass(d, { borderRadius: 16, padding: '14px 18px', marginBottom: 14 }) }}>
            <p style={{ ...eyebrow(d), display: 'block', marginBottom: 5 }}>Your share — {splits[0]?.name || 'Person 1'}</p>
            <div style={{ fontSize: 28, fontWeight: 900, color: d ? '#fff' : '#1a0800' }}>
              {splits[0]?.amount === '0' ? 'Rs.0.00 — being treated 🎉' : myAmt > 0 ? `Rs.${myAmt.toFixed(2)}` : '—'}
            </div>
          </div>

          <PayButton d={d} label={payLabel} disabled={!isBalanced} onClick={() => { if (isBalanced) onPay(myAmt); }} />
        </>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════════ */
export default function PaymentPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { theme } = useTheme();
  const d         = theme === 'dark';

  const [step, setStep]                       = useState('choose');
  const [showModal, setShowModal]             = useState(false);
  const [processing, setProcessing]           = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [payAmt, setPayAmt]                   = useState(0);

  const navRef     = useRef(null);
  const cardRef    = useRef(null);
  const methodsRef = useRef(null);
  const stepRef    = useRef(null);
  const successRef = useRef(null);

  const { orderId, orderNumber, total, items } = location.state || {};

  useEffect(() => {
    if (!orderId || !total) { toast.error('No order found'); navigate('/customer/orders'); }
  }, []);

  useEffect(() => {
    if (processing || paymentComplete) return;
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.fromTo(navRef.current,     { y: -18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.48 });
    tl.fromTo(cardRef.current,    { y: 28, opacity: 0, scale: 0.97 }, { y: 0, opacity: 1, scale: 1, duration: 0.55 }, '-=0.32');
    tl.fromTo(methodsRef.current, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.42 }, '-=0.28');
    tl.fromTo(stepRef.current,    { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.38 }, '-=0.24');
  }, [processing, paymentComplete]);

  useEffect(() => {
    if (paymentComplete && successRef.current)
      gsap.fromTo(successRef.current, { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.65, ease: 'back.out(1.6)' });
  }, [paymentComplete]);

  const handlePay = (amt) => { setPayAmt(amt); setShowModal(true); };

  const handleMethodSelect = async (method) => {
    setShowModal(false); setProcessing(true);
    try {
      await new Promise(r => setTimeout(r, 2000));
      setProcessing(false); setPaymentComplete(true);
      toast.success('Payment successful! 🎉');
      setTimeout(() => navigate('/customer/orders', { state: { orderId, orderNumber, total, method } }), 2500);
    } catch {
      setProcessing(false);
      toast.error('Payment failed. Please try again.');
    }
  };

  /* Shell */
  const Shell = ({ children }) => (
    <div style={{
      minHeight: '100vh', fontFamily: "'Nunito',sans-serif",
      backgroundColor: d ? '#161210' : '#faf4ec',
      transition: 'background-color 0.4s', overflowX: 'hidden',
    }}>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.020,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.80' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: '160px',
      }} />
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );

  /* NavBar */
  const NavBar = () => (
    <div ref={navRef} style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
      backgroundColor: d ? 'rgba(16,12,8,0.92)' : 'rgba(253,248,238,0.94)',
      borderBottom: `1px solid ${d ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}`,
      backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      <button onClick={() => navigate(-1)} style={{
        width: 40, height: 40, borderRadius: 11, border: 'none', cursor: 'pointer', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: d ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.06)',
        color: d ? 'rgba(255,255,255,0.72)' : 'rgba(100,40,8,0.78)',
        WebkitTapHighlightColor: 'transparent',
      }}>
        <ArrowLeft size={18} strokeWidth={2.3} />
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 900, color: d ? '#fff' : '#1a0800' }}>Complete Payment</div>
        <div style={{ fontSize: 11, fontWeight: 600, marginTop: 1, color: d ? 'rgba(255,255,255,0.44)' : 'rgba(100,40,8,0.54)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          Order #{orderNumber} · Secure Checkout
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 999, background: d ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.10)', flexShrink: 0 }}>
        <Shield size={11} color="#10b981" strokeWidth={2.5} />
        <span style={{ fontSize: 11, fontWeight: 800, color: '#10b981' }}>Secure</span>
      </div>
    </div>
  );

  /* Processing */
  if (processing) return (
    <Shell><NavBar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ position: 'relative', width: 76, height: 76, margin: '0 auto 28px' }}>
            <svg style={{ animation: 'spin 1s linear infinite', width: 76, height: 76 }} viewBox="0 0 76 76" fill="none">
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              <circle cx="38" cy="38" r="30" stroke={d ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)'} strokeWidth="4.5" />
              <circle cx="38" cy="38" r="30" stroke="url(#spg)" strokeWidth="4.5" strokeDasharray="48 142" strokeLinecap="round" />
              <defs><linearGradient id="spg" x1="0" y1="0" x2="76" y2="76"><stop stopColor="#f97316" /><stop offset="1" stopColor="#dc2626" /></linearGradient></defs>
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={19} color="#f97316" strokeWidth={2.3} />
            </div>
          </div>
          <div style={{ fontSize: 21, fontWeight: 900, color: d ? '#fff' : '#1a0800', marginBottom: 8 }}>Processing payment…</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: d ? 'rgba(255,255,255,0.42)' : 'rgba(100,40,8,0.52)' }}>Please don't close this page</div>
        </div>
      </div>
    </Shell>
  );

  /* Success */
  if (paymentComplete) return (
    <Shell><NavBar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: '0 20px' }}>
        <div ref={successRef} style={{ textAlign: 'center', maxWidth: 310, width: '100%' }}>
          <div style={{ position: 'relative', width: 96, height: 96, margin: '0 auto 28px' }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(16,185,129,0.16)', animation: 'ping 2s ease-in-out infinite' }} />
            <style>{`@keyframes ping{0%,100%{transform:scale(1);opacity:.65}50%{transform:scale(1.6);opacity:0}}`}</style>
            <div style={{ position: 'relative', width: 96, height: 96, borderRadius: '50%', background: 'linear-gradient(135deg,#34d399,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: SHADOW.green }}>
              <CheckCircle size={46} color="#fff" strokeWidth={2.5} />
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: d ? '#fff' : '#1a0800', marginBottom: 10, lineHeight: 1.2 }}>Payment Done! 🎉</div>
          <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.75, color: d ? 'rgba(255,255,255,0.52)' : 'rgba(100,40,8,0.62)' }}>
            <span style={{ color: '#34d399', fontWeight: 900 }}>Rs.{payAmt?.toFixed(2)}</span> paid successfully.<br />Redirecting…
          </div>
        </div>
      </div>
    </Shell>
  );

  /* ── MAIN ── */
  return (
    <Shell>
      <NavBar />
      {/* single-column, full width — works on every phone */}
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '16px 14px 64px' }}>

        {/* Order card */}
        <div ref={cardRef} style={{
          borderRadius: 22, padding: '20px 16px 20px', marginBottom: 18,
          position: 'relative', overflow: 'hidden',
          background: d
            ? 'radial-gradient(ellipse at 22% 0%, #cc2d1e 0%, #921a10 44%, #5e0f08 100%)'
            : 'radial-gradient(ellipse at 22% 0%, #ffe4cc 0%, #ffcfa0 46%, #ffb470 100%)',
          boxShadow: d
            ? '0 18px 56px rgba(0,0,0,0.48), inset 0 1px 0 rgba(255,255,255,0.11)'
            : '0 10px 40px rgba(234,88,12,0.16), inset 0 1px 0 rgba(255,255,255,0.95)',
        }}>
          <div style={{ position: 'absolute', top: -55, right: -35, width: 190, height: 190, borderRadius: '50%', background: 'rgba(255,255,255,0.055)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -48, left: -28, width: 155, height: 155, borderRadius: '50%', background: 'rgba(0,0,0,0.11)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, position: 'relative' }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0, background: d ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.68)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🧾</div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 900, color: d ? '#fff' : '#1a0800', lineHeight: 1.2 }}>Order Summary</div>
              <div style={{ fontSize: 12, fontWeight: 600, marginTop: 2, color: d ? 'rgba(255,255,255,0.55)' : 'rgba(100,40,8,0.65)' }}>
                {items?.length || 0} item{items?.length !== 1 ? 's' : ''} · Table order
              </div>
            </div>
          </div>

          {/* items */}
          <div style={{ marginBottom: 14, position: 'relative' }}>
            {items?.length > 0 ? items.map((item, i) => {
              const lt = ((item.price ?? (item.subtotal / item.quantity)) * item.quantity).toFixed(2);
              return (
                <div key={item._id || i}>
                  {i > 0 && <div style={{ height: 1, margin: '2px 0', background: `linear-gradient(to right,transparent,${d ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.06)'},transparent)` }} />}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 26, height: 26, borderRadius: 7, flexShrink: 0, background: d ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: d ? '#fff' : '#9a3412' }}>{item.quantity}</div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: d ? '#fff' : '#1a0800' }}>{item.name}</span>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 800, flexShrink: 0, marginLeft: 8, color: d ? '#fff' : '#1a0800' }}>Rs.{lt}</span>
                  </div>
                </div>
              );
            }) : <p style={{ textAlign: 'center', padding: '12px 0', fontSize: 13, fontWeight: 600, color: d ? 'rgba(255,255,255,0.40)' : 'rgba(100,40,8,0.46)' }}>No items</p>}
          </div>

          {/* total */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 12, background: d ? 'rgba(0,0,0,0.22)' : 'rgba(255,255,255,0.55)', border: `1px solid ${d ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.92)'}`, backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: d ? 'rgba(255,255,255,0.68)' : 'rgba(100,40,8,0.74)' }}>Total Amount</span>
            <span style={{ fontSize: 24, fontWeight: 900, color: d ? '#fff' : '#1a0800' }}>Rs.{total?.toFixed(2)}</span>
          </div>
        </div>

        {/* Accepted methods */}
        <div ref={methodsRef} style={{ marginBottom: 20 }}>
          <p style={{ ...eyebrow(d), display: 'block', marginBottom: 10 }}>Accepted methods</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { name: 'eSewa',          bg: '#1a9e46', logo: 'https://imgs.search.brave.com/z3RNOtlfHHxw104uw1_juJERgTtKLlnu64UyZgnzDak/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9wNy5o/aWNsaXBhcnQuY29t/L3ByZXZpZXcvMjYx/LzYwOC8xMDAxL2Vz/ZXdhLXpvbmUtb2Zm/aWNlLWJheWFsYmFz/LWdvb2dsZS1wbGF5/LWlwaG9uZS1pcGhv/bmUtdGh1bWJuYWls/LmpwZw' },
              { name: 'Khalti',         bg: '#5a189a', logo: 'https://imgs.search.brave.com/uRwGiuNY4Rc74tXFKa5jkB0J_3H_7h2pn34fBdSeoro/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/cG5na2l0LmNvbS9w/bmcvZnVsbC80NjYt/NDY2ODY5MV90aGUt/YXBwLWtoYWx0aS1h/aW1zLXRvLWJlY29t/ZS1ldmVyeS1uZXBh/bGlzLnBuZw' },
              { name: 'Mobile Banking', bg: '#1d4ed8', emoji: '🏦' },
              { name: 'Cash',           bg: d ? '#26201a' : '#eee8de', tc: d ? '#c8a87a' : '#6b3a1f', emoji: '💵' },
            ].map(m => (
              <div key={m.name} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 11px 6px 6px', borderRadius: 999, flexShrink: 0,
                background: m.bg, color: m.tc ?? '#fff', fontSize: 12, fontWeight: 800,
                boxShadow: `0 2px 10px ${m.bg}44`,
                border: m.tc ? `1px solid ${d ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)'}` : 'none',
              }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontSize: 12 }}>
                  {m.logo ? <img src={m.logo} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} /> : m.emoji}
                </div>
                {m.name}
              </div>
            ))}
          </div>
        </div>

        {/* Step */}
        <div ref={stepRef}>
          {step === 'choose' && (
            <PaymentModeStep total={total} d={d} onPayNow={() => handlePay(total)} onGroupPay={() => setStep('group')} />
          )}
          {step === 'group' && (
            <GroupSplitStep total={total} d={d} onPay={handlePay} onBack={() => setStep('choose')} />
          )}
        </div>
      </div>

      <PaymentMethodModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSelectMethod={handleMethodSelect}
        total={payAmt || total || 0}
      />
    </Shell>
  );
}