// ================================================================
// FILE: frontend/src/modules/customer/pages/CartPage.jsx
// ✅ Mobile-first — single column on phone, side-by-side on tablet+
// ✅ Fixed bottom bar on mobile (total + Place Order)
// ✅ Touch-friendly 44px tap targets, no horizontal scroll
// ✅ Nunito 900, glass cards, dark/light ThemeContext
// ✅ GSAP stagger animations
// ================================================================

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Trash2, Plus, Minus, ShoppingBag,
  Gift, ChevronRight, FileText, Tag,
} from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { toast } from 'react-toastify';
import axios from 'axios';
import gsap from 'gsap';
import SuccessAnimation from '../../../shared/components/SuccessAnimation';
import soundPlayer from '../../../shared/utils/soundPlayer';
import vibrationManager from '../../../shared/utils/vibration';
import { useTheme } from '../../../shared/context/ThemeContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/* ── Google Font ─────────────────────────────────────────────── */
if (typeof document !== 'undefined' && !document.getElementById('nunito-font')) {
  const l = document.createElement('link');
  l.id = 'nunito-font'; l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap';
  document.head.appendChild(l);
}

/* ── Responsive hook ─────────────────────────────────────────── */
const useIsMobile = () => {
  const [m, setM] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : true);
  useEffect(() => {
    const fn = () => setM(window.innerWidth < 768);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return m;
};

/* ── Tokens ──────────────────────────────────────────────────── */
const SHADOW = {
  card:   '0 2px 16px rgba(0,0,0,0.07)',
  orange: '0 10px 32px rgba(234,88,12,0.36)',
  lift:   '0 10px 32px rgba(0,0,0,0.12)',
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

const Spinner = ({ size = 18 }) => (
  <svg style={{ animation: 'sp 1s linear infinite', width: size, height: size }} viewBox="0 0 24 24" fill="none">
    <style>{`@keyframes sp{to{transform:rotate(360deg)}}`}</style>
    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.28)" strokeWidth="3" />
    <circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="3" strokeDasharray="16 48" strokeLinecap="round" />
  </svg>
);

/* ════════════════════════════════════════════════════════════════
   CART PAGE
════════════════════════════════════════════════════════════════ */
const CartPage = () => {
  const navigate  = useNavigate();
  const { theme } = useTheme();
  const d         = theme === 'dark';
  const isMobile  = useIsMobile();

  const {
    cart, updateQuantity: updateCartQty,
    removeFromCart: removeCartItem,
    clearCart: clearBackendCart,
    totals, loading: cartLoading, validateCart,
  } = useCart();

  const [promoCode, setPromoCode]       = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [discount, setDiscount]         = useState(0);
  const [notes, setNotes]               = useState('');
  const [orderLoading, setOrderLoading] = useState(false);
  const [showSuccess, setShowSuccess]   = useState(false);

  const navRef     = useRef(null);
  const summaryRef = useRef(null);
  const itemRefs   = useRef([]);

  const subtotal       = totals.subtotal || 0;
  const discountAmount = subtotal * (discount / 100);
  const finalTax       = (subtotal - discountAmount) * 0.10;
  const total          = subtotal - discountAmount + finalTax;

  /* entrance animation */
  useEffect(() => {
    if (cartLoading || !cart?.length) return;
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.fromTo(navRef.current, { y: -18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.46 });
    const els = itemRefs.current.filter(Boolean);
    tl.fromTo(els, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.38, stagger: 0.07, ease: 'back.out(1.4)' }, '-=0.28');
    if (summaryRef.current) tl.fromTo(summaryRef.current, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.40 }, '-=0.24');
  }, [cartLoading, cart]);

  const handleApplyPromo = () => {
    const c = promoCode.toUpperCase().trim();
    if      (c === 'FIRST10') { setDiscount(10); setPromoApplied(true); toast.success('10% discount applied! 🎉'); }
    else if (c === 'LOYAL15') { setDiscount(15); setPromoApplied(true); toast.success('15% loyalty discount! ✨'); }
    else                      { toast.error('Invalid promo code'); }
  };

  const handleUpdateQty = async (id, qty) => {
    if (qty === 0) { const ok = await removeCartItem(id); if (ok) toast.success('Item removed'); }
    else           { await updateCartQty(id, qty); }
  };

  const handleClearCart = async () => {
    const ok = await clearBackendCart();
    if (ok) toast.success('Cart cleared');
  };

  const handlePlaceOrder = async () => {
    if (!cart?.length) { toast.error('Your cart is empty!'); return; }
    const session    = JSON.parse(localStorage.getItem('customerSession') || '{}');
    const customerId = session.customerId;
    if (!customerId) { toast.error('Please login'); navigate('/customer/login'); return; }

    try {
      setOrderLoading(true);
      const validation = await validateCart();
      if (!validation.isValid) { toast.error('Some items are no longer available'); return; }

      const items = cart.map(item => ({
        menuItemId: item.menuItemId._id || item.menuItemId,
        quantity: item.quantity || 1,
        price: item.menuItemId?.price || 0,
        subtotal: (item.menuItemId?.price || 0) * (item.quantity || 1),
        customizations: item.customizations || {},
        name: item.menuItemId?.name || 'Unknown',
        category: item.menuItemId?.category || 'Food',
        preparationTime: item.menuItemId?.preparationTime || 15,
        specialInstructions: item.specialInstructions || null,
      }));

      const response = await axios.post(`${API_URL}/orders`, {
        customerId, tableId: session.tableId, sessionId: session.sessionId,
        items, subtotal, tax: finalTax, discount: discountAmount, total,
        promoCode: promoCode || null, specialInstructions: notes || null,
        status: 'pending', paymentStatus: 'pending',
        metadata: { source: 'tablet', sessionId: session.sessionId, timestamp: new Date().toISOString() },
      });

      if (response.success || response.data?.success) {
        const order = response._id ? response : response.data;
        soundPlayer.play('newOrder');
        vibrationManager.orderPlaced();
        setShowSuccess(true);
        setTimeout(async () => {
          await clearBackendCart();
          setTimeout(() => navigate('/customer/orders', { state: { orderId: order._id || order.id, orderNumber: order.orderNumber, justCreated: true }, replace: true }), 2000);
        }, 4000);
      } else {
        throw new Error(response.message || 'Failed to create order');
      }
    } catch (err) {
      soundPlayer.play('error');
      vibrationManager.error();
      toast.error(err.response?.data?.message || err.message || 'Failed to place order.', { position: 'top-center', autoClose: 5000 });
    } finally {
      setOrderLoading(false);
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
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.018,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.80' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: '160px',
      }} />
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );

  /* Loading */
  if (cartLoading) return (
    <Shell>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ position: 'relative', width: 56, height: 56, margin: '0 auto 20px' }}>
            <svg style={{ animation: 'sp 1s linear infinite', width: 56, height: 56 }} viewBox="0 0 56 56" fill="none">
              <style>{`@keyframes sp{to{transform:rotate(360deg)}}`}</style>
              <circle cx="28" cy="28" r="22" stroke={d ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)'} strokeWidth="4" />
              <circle cx="28" cy="28" r="22" stroke="url(#lg)" strokeWidth="4" strokeDasharray="36 102" strokeLinecap="round" />
              <defs><linearGradient id="lg" x1="0" y1="0" x2="56" y2="56"><stop stopColor="#f97316" /><stop offset="1" stopColor="#dc2626" /></linearGradient></defs>
            </svg>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: d ? 'rgba(255,255,255,0.45)' : 'rgba(100,40,8,0.52)' }}>Loading cart…</div>
        </div>
      </div>
    </Shell>
  );

  /* Empty */
  if (!cart || cart.length === 0) return (
    <Shell>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', maxWidth: 300, width: '100%' }}>
          <div style={{ width: 88, height: 88, borderRadius: '50%', margin: '0 auto 22px', ...glass(d, { display: 'flex', alignItems: 'center', justifyContent: 'center' }) }}>
            <ShoppingBag size={36} color={d ? 'rgba(255,255,255,0.30)' : 'rgba(100,40,8,0.35)'} />
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: d ? '#fff' : '#1a0800', marginBottom: 10, lineHeight: 1.2 }}>Your cart is empty</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: d ? 'rgba(255,255,255,0.45)' : 'rgba(100,40,8,0.54)', marginBottom: 26, lineHeight: 1.6 }}>
            Add some delicious items to get started!
          </div>
          <button onClick={() => navigate('/customer/menu')} style={{
            padding: '14px 28px', borderRadius: 999, border: 'none', cursor: 'pointer',
            fontFamily: "'Nunito',sans-serif", fontSize: 15, fontWeight: 900, color: '#fff',
            background: 'linear-gradient(118deg,#f97316,#dc2626)', boxShadow: SHADOW.orange,
            display: 'inline-flex', alignItems: 'center', gap: 8,
            WebkitTapHighlightColor: 'transparent',
          }}>
            Browse Menu <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </Shell>
  );

  /* Order summary — reused in both mobile (inline) and desktop (sticky) */
  const OrderSummary = () => (
    <div ref={summaryRef} style={{ borderRadius: 20, padding: '20px 16px', ...glass(d), boxShadow: SHADOW.card }}>
      <div style={{ fontSize: 16, fontWeight: 900, color: d ? '#fff' : '#1a0800', marginBottom: 16 }}>Order Summary</div>

      {/* promo */}
      <div style={{ borderRadius: 14, padding: '14px', marginBottom: 14, background: d ? 'rgba(139,92,246,0.10)' : 'rgba(139,92,246,0.06)', border: `1px solid ${d ? 'rgba(139,92,246,0.22)' : 'rgba(139,92,246,0.16)'}` }}>
        <label style={{ ...eyebrow(d), display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, color: d ? 'rgba(167,139,250,0.85)' : 'rgba(109,40,217,0.70)' }}>
          <Gift size={11} /> Promo Code
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={promoCode} onChange={e => setPromoCode(e.target.value.toUpperCase())}
            placeholder="Enter code" disabled={promoApplied}
            style={{
              flex: 1, minWidth: 0, padding: '10px 12px', borderRadius: 10, outline: 'none',
              border: `1px solid ${d ? 'rgba(139,92,246,0.22)' : 'rgba(139,92,246,0.18)'}`,
              background: d ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.80)',
              fontFamily: "'Nunito',sans-serif", fontSize: 14, fontWeight: 800,
              color: d ? '#fff' : '#1a0800', letterSpacing: '0.04em',
            }}
          />
          <button onClick={handleApplyPromo} disabled={promoApplied} style={{
            padding: '10px 14px', borderRadius: 10, border: 'none',
            cursor: promoApplied ? 'default' : 'pointer',
            fontFamily: "'Nunito',sans-serif", fontSize: 13, fontWeight: 900, color: '#fff',
            background: promoApplied ? '#10b981' : 'linear-gradient(118deg,#a855f7,#7c3aed)',
            flexShrink: 0, whiteSpace: 'nowrap', WebkitTapHighlightColor: 'transparent',
          }}>
            {promoApplied ? '✓' : 'Apply'}
          </button>
        </div>
        {discount > 0 && (
          <div style={{ marginTop: 8, fontSize: 12, fontWeight: 800, color: '#10b981', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Tag size={11} /> {discount}% discount applied!
          </div>
        )}
      </div>

      {/* breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        {[
          { label: 'Subtotal', value: `Rs.${subtotal.toFixed(2)}` },
          ...(discount > 0 ? [{ label: `Discount (${discount}%)`, value: `− Rs.${discountAmount.toFixed(2)}`, green: true }] : []),
          { label: 'Tax (10%)', value: `Rs.${finalTax.toFixed(2)}` },
        ].map((row, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: row.green ? '#10b981' : (d ? 'rgba(255,255,255,0.50)' : 'rgba(100,40,8,0.56)') }}>{row.label}</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: row.green ? '#10b981' : (d ? 'rgba(255,255,255,0.72)' : 'rgba(100,40,8,0.78)') }}>{row.value}</span>
          </div>
        ))}
        <div style={{ height: 1, background: `linear-gradient(to right,transparent,${d ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.07)'},transparent)`, margin: '4px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 16, fontWeight: 900, color: d ? '#fff' : '#1a0800' }}>Total</span>
          <span style={{ fontSize: 26, fontWeight: 900, color: d ? '#fff' : '#1a0800' }}>Rs.{total.toFixed(2)}</span>
        </div>
      </div>

      {/* CTA — only shown in summary on desktop; mobile uses bottom bar */}
      {!isMobile && (
        <button
          onClick={handlePlaceOrder} disabled={orderLoading || cartLoading}
          style={{
            width: '100%', padding: '17px 24px', borderRadius: 999, border: 'none',
            cursor: orderLoading || cartLoading ? 'not-allowed' : 'pointer',
            fontFamily: "'Nunito',sans-serif", fontSize: 16, fontWeight: 900, color: '#fff',
            background: orderLoading || cartLoading ? (d ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.09)') : 'linear-gradient(118deg,#f97316,#dc2626)',
            boxShadow: orderLoading || cartLoading ? 'none' : SHADOW.orange,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            opacity: orderLoading || cartLoading ? 0.45 : 1,
            marginBottom: 10, transition: 'transform 0.18s, box-shadow 0.18s',
          }}
          onMouseEnter={e => { if (!orderLoading && !cartLoading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 44px rgba(234,88,12,.48)'; }}}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = orderLoading || cartLoading ? 'none' : SHADOW.orange; }}
        >
          {orderLoading ? <><Spinner /> Processing…</> : <><ShoppingBag size={17} strokeWidth={2.5} /> Place Order</>}
        </button>
      )}

      {!isMobile && (
        <div style={{ fontSize: 11, fontWeight: 600, textAlign: 'center', color: d ? 'rgba(255,255,255,0.26)' : 'rgba(100,40,8,0.36)', lineHeight: 1.5 }}>
          By placing an order you agree to our terms of service
        </div>
      )}
    </div>
  );

  return (
    <Shell>
      <SuccessAnimation isVisible={showSuccess} onComplete={() => setShowSuccess(false)} message="Order Placed Successfully!" />

      {/* NavBar */}
      <div ref={navRef} style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
        backgroundColor: d ? 'rgba(16,12,8,0.92)' : 'rgba(253,248,238,0.94)',
        borderBottom: `1px solid ${d ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}`,
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <button onClick={() => navigate('/customer/menu')} style={{
          width: 40, height: 40, borderRadius: 11, border: 'none', cursor: 'pointer', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: d ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.06)',
          color: d ? 'rgba(255,255,255,0.72)' : 'rgba(100,40,8,0.78)',
          WebkitTapHighlightColor: 'transparent',
        }}>
          <ArrowLeft size={18} strokeWidth={2.3} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 900, color: d ? '#fff' : '#1a0800' }}>Your Cart</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: d ? 'rgba(255,255,255,0.44)' : 'rgba(100,40,8,0.54)' }}>
            {cart.length} item{cart.length !== 1 ? 's' : ''}
          </div>
        </div>
        <button onClick={handleClearCart} style={{
          padding: '8px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', flexShrink: 0,
          fontFamily: "'Nunito',sans-serif", fontSize: 13, fontWeight: 800,
          background: 'rgba(239,68,68,0.10)', color: '#ef4444',
          WebkitTapHighlightColor: 'transparent',
        }}>
          Clear All
        </button>
      </div>

      {/* Body */}
      <div style={{
        maxWidth: 960, margin: '0 auto',
        padding: isMobile ? '14px 12px 100px' : '20px 20px 60px',
      }}>
        <div style={{
          display: isMobile ? 'flex' : 'grid',
          flexDirection: isMobile ? 'column' : undefined,
          gridTemplateColumns: isMobile ? undefined : 'minmax(0,1fr) 340px',
          gap: isMobile ? 10 : 20,
          alignItems: 'start',
        }}>

          {/* ── Items column ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {cart.map((item, i) => {
              const price     = item.menuItemId?.price || 0;
              const lineTotal = (price * item.quantity).toFixed(2);
              return (
                <div
                  key={item._id || i}
                  ref={el => itemRefs.current[i] = el}
                  style={{
                    borderRadius: 18, overflow: 'hidden', display: 'flex',
                    ...glass(d), boxShadow: SHADOW.card,
                  }}
                >
                  {/* image */}
                  <div style={{ width: isMobile ? 90 : 100, flexShrink: 0, alignSelf: 'stretch', overflow: 'hidden' }}>
                    <img
                      src={item.menuItemId?.image || '/images/placeholder-food.jpg'}
                      alt={item.menuItemId?.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      onError={e => e.target.src = '/images/placeholder-food.jpg'}
                    />
                  </div>

                  {/* details */}
                  <div style={{ flex: 1, padding: isMobile ? '12px 12px' : '14px 16px', display: 'flex', flexDirection: 'column', gap: 7, minWidth: 0 }}>

                    {/* name + delete */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: d ? '#fff' : '#1a0800', lineHeight: 1.3, marginBottom: 3 }}>
                          {item.menuItemId?.name || 'Unknown Item'}
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: d ? 'rgba(255,255,255,0.40)' : 'rgba(100,40,8,0.50)' }}>
                          {item.menuItemId?.category || 'Food'} · Rs.{price.toFixed(2)} each
                        </div>
                      </div>
                      <button
                        onClick={() => handleUpdateQty(item._id, 0)}
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

                    {/* qty + line total */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', borderRadius: 10, overflow: 'hidden',
                        background: d ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.06)',
                        border: `1px solid ${d ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'}`,
                      }}>
                        <button
                          onClick={() => handleUpdateQty(item._id, item.quantity - 1)}
                          style={{ width: 38, height: 38, border: 'none', cursor: 'pointer', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: d ? 'rgba(255,255,255,0.78)' : 'rgba(100,40,8,0.85)', WebkitTapHighlightColor: 'transparent' }}
                        >
                          <Minus size={14} strokeWidth={2.5} />
                        </button>
                        <span style={{ width: 38, textAlign: 'center', fontSize: 15, fontWeight: 900, color: d ? '#fff' : '#1a0800' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQty(item._id, item.quantity + 1)}
                          style={{ width: 38, height: 38, border: 'none', cursor: 'pointer', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: d ? 'rgba(255,255,255,0.78)' : 'rgba(100,40,8,0.85)', WebkitTapHighlightColor: 'transparent' }}
                        >
                          <Plus size={14} strokeWidth={2.5} />
                        </button>
                      </div>
                      <div style={{ fontSize: 17, fontWeight: 900, color: d ? '#fff' : '#1a0800' }}>
                        Rs.{lineTotal}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Special instructions */}
            <div style={{ borderRadius: 18, padding: '16px', ...glass(d), boxShadow: SHADOW.card }}>
              <label style={{ ...eyebrow(d), display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                <FileText size={11} /> Special Instructions
              </label>
              <textarea
                value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Dietary restrictions, allergies, preferences…"
                rows={3}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '12px 14px', borderRadius: 12, outline: 'none', resize: 'none',
                  border: `1px solid ${d ? 'rgba(255,255,255,0.11)' : 'rgba(0,0,0,0.08)'}`,
                  background: d ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  fontFamily: "'Nunito',sans-serif", fontSize: 14, fontWeight: 600,
                  color: d ? '#fff' : '#1a0800', lineHeight: 1.6,
                }}
                onFocus={e  => e.target.style.borderColor = d ? 'rgba(249,115,22,0.50)' : 'rgba(249,115,22,0.45)'}
                onBlur={e   => e.target.style.borderColor = d ? 'rgba(255,255,255,0.11)' : 'rgba(0,0,0,0.08)'}
              />
            </div>

            {/* On mobile: order summary sits here below items */}
            {isMobile && <OrderSummary />}
          </div>

          {/* Desktop: sticky sidebar */}
          {!isMobile && (
            <div style={{ position: 'sticky', top: 80 }}>
              <OrderSummary />
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile: fixed bottom bar ── */}
      {isMobile && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
          padding: '12px 14px env(safe-area-inset-bottom, 14px)',
          backgroundColor: d ? 'rgba(16,12,8,0.97)' : 'rgba(253,248,238,0.98)',
          borderTop: `1px solid ${d ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
          backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: d ? 'rgba(255,255,255,0.42)' : 'rgba(100,40,8,0.50)', marginBottom: 2 }}>Total</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: d ? '#fff' : '#1a0800', lineHeight: 1.1 }}>Rs.{total.toFixed(2)}</div>
          </div>
          <button
            onClick={handlePlaceOrder} disabled={orderLoading || cartLoading}
            style={{
              padding: '14px 24px', borderRadius: 999, border: 'none', flexShrink: 0,
              cursor: orderLoading || cartLoading ? 'not-allowed' : 'pointer',
              fontFamily: "'Nunito',sans-serif", fontSize: 15, fontWeight: 900, color: '#fff',
              background: orderLoading || cartLoading ? (d ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)') : 'linear-gradient(118deg,#f97316,#dc2626)',
              boxShadow: orderLoading || cartLoading ? 'none' : SHADOW.orange,
              display: 'flex', alignItems: 'center', gap: 8,
              opacity: orderLoading || cartLoading ? 0.50 : 1,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {orderLoading ? <><Spinner size={16} /> Processing…</> : <><ShoppingBag size={16} /> Place Order</>}
          </button>
        </div>
      )}
    </Shell>
  );
};

export default CartPage;