// ================================================================
// FILE: frontend/src/modules/customer/components/PaymentMethodModal.jsx
// ✅ Matches app style — dark #1e1912 sheet, glass rows, Nunito 900
// ✅ Real eSewa/Khalti logos via img with emoji fallback
// ✅ GSAP entrance + stagger + row pulse on selection
// ✅ Light/Dark via data-theme on <html>
// ================================================================

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { X, Shield } from 'lucide-react';

const METHODS = [
  {
    id:       'esewa',
    name:     'eSewa',
    desc:     'Digital wallet · instant',
    tag:      'Popular',
    emoji:    '📱',
    logo:     'https://imgs.search.brave.com/z3RNOtlfHHxw104uw1_juJERgTtKLlnu64UyZgnzDak/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9wNy5o/aWNsaXBhcnQuY29t/L3ByZXZpZXcvMjYx/LzYwOC8xMDAxL2Vz/ZXdhLXpvbmUtb2Zm/aWNlLWJheWFsYmFz/LWdvb2dsZS1wbGF5/LWlwaG9uZS1pcGhv/bmUtdGh1bWJuYWls/LmpwZw',
    accent:   '#10b981',
    tagBg:    'rgba(16,185,129,.18)',
    tagColor: '#34d399',
    checkBg:  'linear-gradient(135deg,#10b981,#059669)',
  },
  {
    id:       'khalti',
    name:     'Khalti',
    desc:     'Quick digital payment',
    tag:      'Fast',
    emoji:    '💜',
    logo:     'https://imgs.search.brave.com/uRwGiuNY4Rc74tXFKa5jkB0J_3H_7h2pn34fBdSeoro/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/cG5na2l0LmNvbS9w/bmcvZnVsbC80NjYt/NDY2ODY5MV90aGUt/YXBwLWtoYWx0aS1h/aW1zLXRvLWJlY29t/ZS1ldmVyeS1uZXBh/bGlzLnBuZw',
    accent:   '#a855f7',
    tagBg:    'rgba(168,85,247,.18)',
    tagColor: '#c084fc',
    checkBg:  'linear-gradient(135deg,#a855f7,#7c3aed)',
  },
  {
    id:       'mobile_banking',
    name:     'Mobile Banking',
    desc:     'Direct bank transfer',
    tag:      'Secure',
    emoji:    '🏦',
    logo:     null,
    accent:   '#3b82f6',
    tagBg:    'rgba(59,130,246,.18)',
    tagColor: '#60a5fa',
    checkBg:  'linear-gradient(135deg,#3b82f6,#2563eb)',
  },
  {
    id:       'cash',
    name:     'Cash',
    desc:     'Pay at the counter',
    tag:      'Classic',
    emoji:    '💵',
    logo:     'https://static.vecteezy.com/system/resources/previews/058/303/680/non_2x/payment-cash-3d-icon-free-png.png',
    accent:   '#f59e0b',
    tagBg:    'rgba(245,158,11,.18)',
    tagColor: '#fbbf24',
    checkBg:  'linear-gradient(135deg,#f59e0b,#d97706)',
  },
];

export default function PaymentMethodModal({ isOpen, onClose, onSelectMethod, total = 0 }) {
  const [selected, setSelected]     = useState(null);
  const [confirming, setConfirming] = useState(false);

  const isDark = () => document.documentElement.getAttribute('data-theme') !== 'light';

  const overlayRef = useRef(null);
  const sheetRef   = useRef(null);
  const headRef    = useRef(null);
  const rowRefs    = useRef([]);
  const footRef    = useRef(null);

  // entrance
  useEffect(() => {
    if (!isOpen) return;
    setSelected(null);
    setConfirming(false);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
      tl.fromTo(overlayRef.current, { opacity:0 }, { opacity:1, duration:.28 }, 0);
      tl.fromTo(sheetRef.current, { y:60, opacity:0 },
        { y:0, opacity:1, duration:.48, ease:'back.out(1.4)' }, 0.04);
      tl.fromTo(headRef.current, { y:-14, opacity:0 },
        { y:0, opacity:1, duration:.38 }, 0.2);
      const rows = rowRefs.current.filter(Boolean);
      tl.fromTo(rows, { x:-16, opacity:0 },
        { x:0, opacity:1, duration:.38, stagger:.07 }, 0.28);
      tl.fromTo(footRef.current, { opacity:0 },
        { opacity:1, duration:.32 }, 0.58);
    });
    return () => ctx.revert();
  }, [isOpen]);

  const handleClose = () => {
    gsap.to(sheetRef.current, { y:40, opacity:0, duration:.22, ease:'power2.in' });
    gsap.to(overlayRef.current, { opacity:0, duration:.28, onComplete: onClose });
  };

  const handleSelect = (m) => {
    if (confirming) return;
    setSelected(m.id);
    setConfirming(true);
    const row = rowRefs.current.find(r => r?.dataset.id === m.id);
    if (row) {
      gsap.timeline()
        .to(row, { x:6,  duration:.12, ease:'power2.out' })
        .to(row, { x:0,  duration:.24, ease:'elastic.out(1,.5)' });
    }
    setTimeout(() => onSelectMethod(m.id), 420);
  };

  if (!isOpen) return null;

  const dark = isDark();

  return (
    <div
      ref={overlayRef}
      onClick={handleClose}
      style={{
        position:'fixed', inset:0, zIndex:200,
        display:'flex', alignItems:'flex-end', justifyContent:'center',
        background:'rgba(0,0,0,0.62)',
        backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)',
      }}
    >
      <div
        ref={sheetRef}
        onClick={e => e.stopPropagation()}
        style={{
          width:'100%', maxWidth:500,
          borderRadius:'28px 28px 0 0',
          overflow:'hidden',
          fontFamily:"'Nunito',sans-serif",
          background: dark ? '#1e1912' : '#fff8f0',
          boxShadow: dark
            ? '0 -8px 60px rgba(0,0,0,.65)'
            : '0 -8px 40px rgba(234,88,12,.18)',
          position:'relative',
        }}
      >
        {/* grain */}
        <div style={{
          position:'absolute', inset:0, pointerEvents:'none', opacity:.025, zIndex:0,
          backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize:'180px',
        }}/>

        {/* ambient glow top */}
        <div style={{
          position:'absolute', top:-60, left:'50%', transform:'translateX(-50%)',
          width:280, height:120, borderRadius:'50%', zIndex:0,
          background: dark ? 'rgba(234,88,12,.10)' : 'rgba(234,88,12,.08)',
          filter:'blur(50px)', pointerEvents:'none',
        }}/>

        <div style={{ position:'relative', zIndex:1 }}>

          {/* drag handle */}
          <div style={{ display:'flex', justifyContent:'center', paddingTop:12, paddingBottom:4 }}>
            <div style={{
              width:36, height:4, borderRadius:999,
              background: dark ? 'rgba(255,255,255,.18)' : 'rgba(234,88,12,.22)',
            }}/>
          </div>

          {/* ── HEADER ── */}
          <div ref={headRef} style={{ padding:'16px 20px 18px' }}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
              <div>
                <p style={{
                  fontSize:11, fontWeight:800, letterSpacing:'0.14em',
                  textTransform:'uppercase', marginBottom:6,
                  color: dark ? 'rgba(255,255,255,.4)' : 'rgba(140,60,10,.5)',
                }}>Choose method</p>
                <h2 style={{
                  fontSize:26, fontWeight:900, lineHeight:1.15,
                  color: dark ? '#fff' : '#1c0a00',
                }}>
                  Pay Rs.{total.toFixed(2)}
                </h2>
              </div>
              <button
                onClick={handleClose}
                style={{
                  width:38, height:38, borderRadius:'50%',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  background: dark ? 'rgba(255,255,255,.10)' : 'rgba(234,88,12,.10)',
                  border: `1px solid ${dark ? 'rgba(255,255,255,.14)' : 'rgba(234,88,12,.16)'}`,
                  cursor:'pointer', color: dark ? 'rgba(255,255,255,.6)' : '#9a4520',
                  transition:'transform .15s',
                  marginTop:2,
                }}
                onMouseEnter={e=>e.currentTarget.style.transform='scale(1.08)'}
                onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}
              >
                <X size={15}/>
              </button>
            </div>

            {/* hairline */}
            <div style={{
              height:1, marginTop:16,
              background: `linear-gradient(to right,transparent,${dark?'rgba(255,255,255,.10)':'rgba(234,88,12,.14)'},transparent)`,
            }}/>
          </div>

          {/* ── METHOD ROWS ── */}
          <div style={{ padding:'4px 12px 8px' }}>
            {METHODS.map((m, i) => {
              const isSel = selected === m.id;
              return (
                <React.Fragment key={m.id}>
                  {i > 0 && (
                    <div style={{
                      height:1, margin:'0 8px',
                      background: dark ? 'rgba(255,255,255,.06)' : 'rgba(234,88,12,.08)',
                    }}/>
                  )}
                  <div
                    ref={el => rowRefs.current[i] = el}
                    data-id={m.id}
                    onClick={() => handleSelect(m)}
                    style={{
                      display:'flex', alignItems:'center', gap:14,
                      padding:'13px 12px', borderRadius:18,
                      cursor: confirming ? 'default' : 'pointer',
                      position:'relative',
                      background: isSel
                        ? (dark ? 'rgba(255,255,255,.09)' : 'rgba(234,88,12,.09)')
                        : 'transparent',
                      transition:'background .18s',
                    }}
                    onMouseEnter={e => {
                      if (!isSel) e.currentTarget.style.background = dark
                        ? 'rgba(255,255,255,.06)' : 'rgba(234,88,12,.06)';
                    }}
                    onMouseLeave={e => {
                      if (!isSel) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    {/* selected left stripe */}
                    {isSel && (
                      <div style={{
                        position:'absolute', left:0, top:10, bottom:10, width:3,
                        borderRadius:999, background: m.accent,
                      }}/>
                    )}

                    {/* logo */}
                    <div style={{
                      width:52, height:52, borderRadius:16, flexShrink:0, overflow:'hidden',
                      background: dark ? 'rgba(255,255,255,.08)' : 'rgba(234,88,12,.08)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      transition:'transform .2s',
                    }}
                    onMouseEnter={e=>e.currentTarget.style.transform='scale(1.07)'}
                    onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
                      {m.logo ? (
                        <img
                          src={m.logo}
                          alt={m.name}
                          style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:16 }}
                          onError={e => {
                            e.target.style.display='none';
                            e.target.parentNode.innerText = m.emoji;
                            e.target.parentNode.style.fontSize = '26px';
                          }}
                        />
                      ) : (
                        <span style={{ fontSize:26 }}>{m.emoji}</span>
                      )}
                    </div>

                    {/* text */}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                        <span style={{
                          fontSize:16, fontWeight:800,
                          color: isSel
                            ? m.accent
                            : (dark ? '#fff' : '#1c0a00'),
                          transition:'color .18s',
                        }}>
                          {m.name}
                        </span>
                        {/* glass pill tag */}
                        <span style={{
                          fontSize:10, fontWeight:800, padding:'3px 9px', borderRadius:999,
                          background: m.tagBg, color: m.tagColor,
                          letterSpacing:'0.06em', textTransform:'uppercase',
                          border:`1px solid ${m.tagColor}30`,
                        }}>
                          {m.tag}
                        </span>
                      </div>
                      <p style={{
                        fontSize:13, fontWeight:600,
                        color: dark ? 'rgba(255,255,255,.45)' : 'rgba(140,60,10,.55)',
                      }}>
                        {m.desc}
                      </p>
                    </div>

                    {/* right — check or chevron */}
                    <div style={{ flexShrink:0 }}>
                      {isSel ? (
                        <div style={{
                          width:26, height:26, borderRadius:'50%',
                          background: m.checkBg,
                          display:'flex', alignItems:'center', justifyContent:'center',
                          boxShadow:`0 4px 14px ${m.accent}55`,
                        }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                               stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        </div>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                             stroke={dark?'rgba(255,255,255,.3)':'rgba(140,60,10,.35)'}
                             strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      )}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>

          {/* ── FOOTER ── */}
          <div ref={footRef} style={{ padding:'12px 20px 28px' }}>
            {/* hairline */}
            <div style={{
              height:1, marginBottom:14,
              background: `linear-gradient(to right,transparent,${dark?'rgba(255,255,255,.08)':'rgba(234,88,12,.12)'},transparent)`,
            }}/>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{
                width:34, height:34, borderRadius:11, flexShrink:0,
                background: dark ? 'rgba(255,255,255,.09)' : 'rgba(234,88,12,.09)',
                border: `1px solid ${dark?'rgba(255,255,255,.13)':'rgba(234,88,12,.15)'}`,
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                <Shield size={16} color="#f97316"/>
              </div>
              <div>
                <p style={{ fontSize:13, fontWeight:800, color: dark?'#fff':'#1c0a00', marginBottom:2 }}>
                  100% Secure Payment
                </p>
                <p style={{ fontSize:12, fontWeight:600, color: dark?'rgba(255,255,255,.45)':'rgba(140,60,10,.55)' }}>
                  Encrypted end-to-end · info never stored
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}