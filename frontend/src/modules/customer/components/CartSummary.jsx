// ================================================================
// FILE: frontend/src/modules/customer/components/CartSummary.jsx
// ✅ Full-screen panel on mobile (width: 100vw)
// ✅ Capped at 440px on larger screens
// ✅ Touch-friendly 44px tap targets everywhere
// ✅ -webkit-overflow-scrolling: touch for smooth iOS scroll
// ✅ Safe area insets for iPhone notch / home indicator
// ✅ Nunito 900, glass, dark/light ThemeContext
// ✅ GSAP slide-in + stagger animations
// ================================================================

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, ShoppingCart, Plus, Minus, Trash2,
  Users, Edit3, ChevronRight,
} from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useTableSession } from '../hooks/useTableSession';
import { toast } from 'react-toastify';
import gsap from 'gsap';
import SplitBillModal from './SplitBillModal';
import SuccessAnimation from '../../../shared/components/SuccessAnimation';
import soundPlayer from '../../../shared/utils/soundPlayer';
import vibrationManager from '../../../shared/utils/vibration';
import { useTheme } from '../../../shared/context/ThemeContext';

/* ── Google Font ─────────────────────────────────────────────── */
if (typeof document !== 'undefined' && !document.getElementById('nunito-font')) {
  const l = document.createElement('link');
  l.id = 'nunito-font'; l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap';
  document.head.appendChild(l);
}

/* ── Tokens ──────────────────────────────────────────────────── */
const SHADOW = {
  card:   '0 2px 14px rgba(0,0,0,0.07)',
  orange: '0 10px 32px rgba(234,88,12,0.36)',
  panel:  '-6px 0 40px rgba(0,0,0,0.22)',
};

const glass = (d, extra = {}) => ({
  background:           d ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.82)',
  border:               `1px solid ${d ? 'rgba(255,255,255,0.11)' : 'rgba(0,0,0,0.07)'}`,
  backdropFilter:       'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  ...extra,
});

const eyebrow = (d) => ({
  fontSize: 10, fontWeight: 800, letterSpacing: '0.13em', textTransform: 'uppercase',
  color: d ? 'rgba(255,255,255,0.36)' : 'rgba(100,40,8,0.48)',
});

const Spinner = ({ size = 17 }) => (
  <svg style={{ animation: 'csp 1s linear infinite', width: size, height: size }} viewBox="0 0 24 24" fill="none">
    <style>{`@keyframes csp{to{transform:rotate(360deg)}}`}</style>
    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.28)" strokeWidth="3" />
    <circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="3" strokeDasharray="16 48" strokeLinecap="round" />
  </svg>
);

/* ════════════════════════════════════════════════════════════════
   CART SUMMARY SIDEBAR
════════════════════════════════════════════════════════════════ */
const CartSummary = ({ isOpen, onClose }) => {
  const navigate  = useNavigate();
  const { theme } = useTheme();
  const d         = theme === 'dark';

  const sidebarRef = useRef(null);
  const overlayRef = useRef(null);
  const itemRefs   = useRef([]);
  const footerRef  = useRef(null);

  const { cart, updateQuantity, removeFromCart, cartTotals, loading: cartLoading } = useCart();
  const { tableNumber, sessionData, updateSessionCart } = useTableSession();

  const [showSplitBill, setShowSplitBill] = useState(false);
  const [showSuccess, setShowSuccess]     = useState(false);
  const [notes, setNotes]                 = useState('');

  const totals = cartTotals();

  /* lock body scroll when cart is open */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  /* GSAP open / close */
  useEffect(() => {
    if (!sidebarRef.current || !overlayRef.current) return;
    if (isOpen) {
      gsap.set(sidebarRef.current, { x: '100%' });
      gsap.set(overlayRef.current, { opacity: 0, display: 'block' });
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
      tl.to(overlayRef.current,  { opacity: 1, duration: 0.26 });
      tl.to(sidebarRef.current,  { x: '0%', duration: 0.46, ease: 'power3.out' }, '-=0.16');
      const items = itemRefs.current.filter(Boolean);
      if (items.length)
        tl.fromTo(items, { x: 16, opacity: 0 }, { x: 0, opacity: 1, duration: 0.34, stagger: 0.06, ease: 'back.out(1.3)' }, '-=0.20');
      if (footerRef.current)
        tl.fromTo(footerRef.current, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.28 }, '-=0.14');
    } else {
      gsap.to(sidebarRef.current, { x: '100%', duration: 0.32, ease: 'power2.in' });
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.22, onComplete: () => {
        if (overlayRef.current) gsap.set(overlayRef.current, { display: 'none' });
      }});
    }
  }, [isOpen]);

  useEffect(() => {
    if (sessionData && cart.length > 0) updateSessionCart(cart);
  }, [cart, sessionData]);

  const handleQty = (id, qty) => {
    if (qty === 0)    { removeFromCart(id); toast.success('Item removed'); }
    else if (qty > 99){ toast.warning('Max quantity is 99'); }
    else              { updateQuantity(id, qty); }
  };

  const handleProceed = () => {
    if (!cart.length) { toast.error('Your cart is empty!'); return; }
    setShowSplitBill(true);
  };

  const handleSplitComplete = () => {
    soundPlayer.play('newOrder');
    vibrationManager.orderPlaced();
    setShowSuccess(true);
    setShowSplitBill(false);
    setTimeout(() => {
      onClose();
      toast.success('Order placed! 🎉');
      navigate('/customer/orders');
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <>
      <SuccessAnimation isVisible={showSuccess} onComplete={() => setShowSuccess(false)} message="Order Placed Successfully!" />

      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 40,
          background: 'rgba(0,0,0,0.60)',
          backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
          display: 'none',
        }}
      />

      {/* Sliding panel — 100vw on mobile, max 440px on larger screens */}
      <div
        ref={sidebarRef}
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 50,
          width: '100vw', maxWidth: 440,
          display: 'flex', flexDirection: 'column',
          fontFamily: "'Nunito',sans-serif",
          backgroundColor: d ? '#1a1612' : '#faf4ec',
          boxShadow: SHADOW.panel,
          transform: 'translateX(100%)',
          overflowY: 'hidden',
        }}
      >
        {/* grain */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.018,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.80' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '160px',
        }} />

        {/* ── Header ── */}
        <div style={{
          position: 'relative', zIndex: 1, flexShrink: 0,
          padding: '12px 14px',
          paddingTop: 'max(12px, env(safe-area-inset-top))',
          backgroundColor: d ? 'rgba(16,12,8,0.95)' : 'rgba(253,248,238,0.97)',
          borderBottom: `1px solid ${d ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}`,
          backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 13, flexShrink: 0,
            background: 'linear-gradient(135deg,#f97316,#dc2626)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(234,88,12,0.38)',
          }}>
            <ShoppingCart size={20} color="#fff" strokeWidth={2.5} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: d ? '#fff' : '#1a0800' }}>Your Cart</div>
            <div style={{ fontSize: 12, fontWeight: 600, marginTop: 1, color: d ? 'rgba(255,255,255,0.44)' : 'rgba(100,40,8,0.54)' }}>
              Table {tableNumber || '—'} · {cart.length} item{cart.length !== 1 ? 's' : ''}
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 44, height: 44, borderRadius: 12, border: 'none', cursor: 'pointer', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: d ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.06)',
            color: d ? 'rgba(255,255,255,0.70)' : 'rgba(100,40,8,0.75)',
            WebkitTapHighlightColor: 'transparent',
          }}>
            <X size={18} strokeWidth={2.3} />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '12px 12px 8px',
          position: 'relative', zIndex: 1,
          WebkitOverflowScrolling: 'touch',
        }}>
          {cart.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', margin: '0 auto 20px', ...glass(d, { display: 'flex', alignItems: 'center', justifyContent: 'center' }) }}>
                <ShoppingCart size={32} color={d ? 'rgba(255,255,255,0.28)' : 'rgba(100,40,8,0.32)'} />
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, color: d ? '#fff' : '#1a0800', marginBottom: 8 }}>Cart is empty</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: d ? 'rgba(255,255,255,0.42)' : 'rgba(100,40,8,0.50)', marginBottom: 24, lineHeight: 1.6 }}>
                Add something delicious from the menu!
              </div>
              <button onClick={() => { onClose(); navigate('/customer/menu'); }} style={{
                padding: '14px 28px', borderRadius: 999, border: 'none', cursor: 'pointer',
                fontFamily: "'Nunito',sans-serif", fontSize: 14, fontWeight: 900, color: '#fff',
                background: 'linear-gradient(118deg,#f97316,#dc2626)', boxShadow: SHADOW.orange,
                display: 'inline-flex', alignItems: 'center', gap: 7,
                WebkitTapHighlightColor: 'transparent',
              }}>
                Browse Menu <ChevronRight size={14} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

              {/* Item cards */}
              {cart.map((item, i) => (
                <div
                  key={`${item.id}-${i}`}
                  ref={el => itemRefs.current[i] = el}
                  style={{ borderRadius: 18, overflow: 'hidden', display: 'flex', ...glass(d), boxShadow: SHADOW.card }}
                >
                  {/* image */}
                  <div style={{ width: 88, flexShrink: 0, alignSelf: 'stretch', overflow: 'hidden' }}>
                    <img
                      src={item.image || '/images/placeholder-food.jpg'}
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      onError={e => e.target.src = '/images/placeholder-food.jpg'}
                    />
                  </div>

                  {/* details */}
                  <div style={{ flex: 1, padding: '12px 13px', display: 'flex', flexDirection: 'column', gap: 7, minWidth: 0 }}>

                    {/* name + delete */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <span style={{ flex: 1, fontSize: 14, fontWeight: 800, color: d ? '#fff' : '#1a0800', lineHeight: 1.3 }}>
                        {item.name}
                      </span>
                      <button
                        onClick={() => { removeFromCart(item.id); toast.success('Item removed'); }}
                        disabled={cartLoading}
                        style={{
                          width: 32, height: 32, borderRadius: 9, border: 'none', cursor: 'pointer', flexShrink: 0,
                          background: 'rgba(239,68,68,0.10)', color: '#ef4444',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          WebkitTapHighlightColor: 'transparent',
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {/* unit price */}
                    <div style={{ fontSize: 12, fontWeight: 700, color: d ? 'rgba(255,255,255,0.42)' : 'rgba(100,40,8,0.52)' }}>
                      Rs.{item.price.toFixed(2)} × {item.quantity}
                    </div>

                    {/* stepper + line total */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      {/* − N + */}
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', borderRadius: 10, overflow: 'hidden',
                        background: d ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.06)',
                        border: `1px solid ${d ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'}`,
                      }}>
                        <button
                          onClick={() => handleQty(item.id, item.quantity - 1)}
                          disabled={cartLoading}
                          style={{
                            width: 40, height: 40, border: 'none', cursor: 'pointer', background: 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: d ? 'rgba(255,255,255,0.80)' : 'rgba(100,40,8,0.85)',
                            WebkitTapHighlightColor: 'transparent',
                          }}
                        >
                          <Minus size={14} strokeWidth={2.5} />
                        </button>
                        <span style={{ width: 36, textAlign: 'center', fontSize: 15, fontWeight: 900, color: d ? '#fff' : '#1a0800' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQty(item.id, item.quantity + 1)}
                          disabled={cartLoading || item.quantity >= 99}
                          style={{
                            width: 40, height: 40, border: 'none', cursor: 'pointer', background: 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: d ? 'rgba(255,255,255,0.80)' : 'rgba(100,40,8,0.85)',
                            WebkitTapHighlightColor: 'transparent',
                          }}
                        >
                          <Plus size={14} strokeWidth={2.5} />
                        </button>
                      </div>

                      <span style={{ fontSize: 16, fontWeight: 900, color: d ? '#fff' : '#1a0800' }}>
                        Rs.{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Special instructions */}
              <div style={{ borderRadius: 18, padding: '14px', ...glass(d) }}>
                <label style={{ ...eyebrow(d), display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <Edit3 size={11} /> Special Instructions
                </label>
                <textarea
                  value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Allergies, preferences…" rows={2}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '11px 13px', borderRadius: 10, resize: 'none', outline: 'none',
                    border: `1px solid ${d ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.07)'}`,
                    background: d ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                    fontFamily: "'Nunito',sans-serif", fontSize: 14, fontWeight: 600,
                    color: d ? '#fff' : '#1a0800', lineHeight: 1.55,
                  }}
                  onFocus={e  => e.target.style.borderColor = d ? 'rgba(249,115,22,0.48)' : 'rgba(249,115,22,0.42)'}
                  onBlur={e   => e.target.style.borderColor = d ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.07)'}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        {cart.length > 0 && (
          <div
            ref={footerRef}
            style={{
              position: 'relative', zIndex: 1, flexShrink: 0,
              padding: '14px 14px',
              paddingBottom: 'max(14px, env(safe-area-inset-bottom))',
              backgroundColor: d ? 'rgba(16,12,8,0.97)' : 'rgba(253,248,238,0.98)',
              borderTop: `1px solid ${d ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}`,
              backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            }}
          >
            {/* totals */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: d ? 'rgba(255,255,255,0.48)' : 'rgba(100,40,8,0.54)' }}>Subtotal</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: d ? 'rgba(255,255,255,0.70)' : 'rgba(100,40,8,0.75)' }}>Rs.{totals.subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: d ? 'rgba(255,255,255,0.48)' : 'rgba(100,40,8,0.54)' }}>Tax (10%)</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: d ? 'rgba(255,255,255,0.70)' : 'rgba(100,40,8,0.75)' }}>Rs.{totals.tax.toFixed(2)}</span>
              </div>
              <div style={{ height: 1, background: `linear-gradient(to right,transparent,${d ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)'},transparent)`, margin: '2px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 16, fontWeight: 900, color: d ? '#fff' : '#1a0800' }}>Total</span>
                <span style={{ fontSize: 26, fontWeight: 900, color: d ? '#fff' : '#1a0800' }}>Rs.{totals.total.toFixed(2)}</span>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handleProceed}
              disabled={cartLoading}
              style={{
                width: '100%', padding: '17px 24px', borderRadius: 999, border: 'none',
                cursor: cartLoading ? 'not-allowed' : 'pointer',
                fontFamily: "'Nunito',sans-serif", fontSize: 16, fontWeight: 900, color: '#fff',
                background: cartLoading ? (d ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.09)') : 'linear-gradient(118deg,#f97316,#dc2626)',
                boxShadow: cartLoading ? 'none' : SHADOW.orange,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                opacity: cartLoading ? 0.45 : 1,
                marginBottom: sessionData ? 8 : 0,
                transition: 'transform 0.18s, box-shadow 0.18s',
                WebkitTapHighlightColor: 'transparent',
              }}
              onMouseEnter={e => { if (!cartLoading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 44px rgba(234,88,12,.48)'; }}}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = cartLoading ? 'none' : SHADOW.orange; }}
              onMouseDown={e  => { if (!cartLoading) e.currentTarget.style.transform = 'scale(0.97)'; }}
              onMouseUp={e    => { if (!cartLoading) e.currentTarget.style.transform = 'translateY(-2px)'; }}
            >
              {cartLoading ? <><Spinner /> Loading…</> : <><Users size={17} strokeWidth={2.5} /> Proceed to Payment</>}
            </button>

            {sessionData && (
              <div style={{ fontSize: 10, fontWeight: 700, textAlign: 'center', color: d ? 'rgba(255,255,255,0.22)' : 'rgba(100,40,8,0.32)', letterSpacing: '0.04em' }}>
                Session {sessionData.id?.slice(-6)} · Active
              </div>
            )}
          </div>
        )}
      </div>

      {/* Split Bill Modal */}
      {showSplitBill && (
        <SplitBillModal
          isOpen={showSplitBill}
          onClose={() => setShowSplitBill(false)}
          cart={cart} totals={totals}
          tableNumber={tableNumber} notes={notes}
          onComplete={handleSplitComplete}
        />
      )}
    </>
  );
};

export default CartSummary;