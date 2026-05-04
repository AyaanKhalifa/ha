// src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp, CURRENCIES, LANGUAGES } from '../context/AppContext';

const NAV = [
  { label:'Book',         path:'/book'         },
  { label:'Manage',       path:'/manage'        },
  { label:'Experience',   path:'/experience'    },
  { label:'Destinations', path:'/destinations'  },
  { label:'Loyalty',      path:'/loyalty'       },
  { label:'Help',         path:'/contact'       },
];
const TIER_COL = { Blue:'#1565C0', Silver:'#607D8B', Gold:'#F57F17', Platinum:'#6A1B9A' };

/* Reusable floating dropdown */
function FloatMenu({ open, children }) {
  if (!open) return null;
  return (
    <div className="animate-slideDown" style={{
      position:'absolute', top:'calc(100% + 8px)', left:0,
      background:'#fff', border:'1px solid #E8E8E8', borderRadius:7,
      boxShadow:'0 16px 56px rgba(0,0,0,.18)', zIndex:1100,
      overflow:'hidden', minWidth:200,
    }}>{children}</div>
  );
}

export default function Navbar() {
  const { user, userProfile, logout, isAdmin } = useAuth();
  const { currency, setCurrency, language, setLanguage } = useApp();
  const navigate  = useNavigate();
  const location  = useLocation();

  const [scrolled, setScrolled]   = useState(false);
  const [userOpen, setUserOpen]   = useState(false);
  const [langOpen, setLangOpen]   = useState(false);
  const [curOpen, setCurOpen]     = useState(false);

  const userRef = useRef(null);
  const langRef = useRef(null);
  const curRef  = useRef(null);

  const isHome = location.pathname === '/';

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', fn, { passive:true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const fn = e => {
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
      if (curRef.current  && !curRef.current.contains(e.target))  setCurOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  useEffect(() => { setUserOpen(false); }, [location.pathname]);

  const glass  = isHome && !scrolled;
  const navBg  = glass ? 'rgba(0,0,0,.52)' : '#fff';
  const bdr    = glass ? 'transparent' : '#E8E8E8';
  const lkCol  = glass ? '#fff' : '#1A1A1A';
  const shadow = scrolled ? '0 2px 20px rgba(0,0,0,.1)' : 'none';

  const doLogout = async () => { await logout(); navigate('/'); };

  const curCfg  = CURRENCIES[currency]  || CURRENCIES.INR;
  const langCfg = LANGUAGES[language]   || LANGUAGES.en;

  /* tiny sub-components */
  const UtilBtn = ({ onClick, children }) => (
    <button onClick={onClick} style={{ background:'none', border:'none', color:'rgba(255,255,255,.42)', fontSize:11, cursor:'pointer', padding:'0 11px', fontFamily:'DM Sans,sans-serif', transition:'color .15s', display:'flex', alignItems:'center', gap:4 }}
      onMouseEnter={e => e.currentTarget.style.color='#fff'}
      onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,.42)'}>
      {children}
    </button>
  );

  return (
    <>
      {/* ══════════ UTILITY BAR ══════════ */}
      <div style={{ background:'#0A0A0A', height:34, display:'flex', alignItems:'center', position:'relative', zIndex:902 }}>
        <div className="container" style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          {/* Left: Language + Currency pickers */}
          <div style={{ display:'flex', gap:0, alignItems:'center' }}>

            {/* Language */}
            <div ref={langRef} style={{ position:'relative' }}>
              <UtilBtn onClick={() => { setLangOpen(x => !x); setCurOpen(false); }}>
                {langCfg.flag} {langCfg.name} ▾
              </UtilBtn>
              <FloatMenu open={langOpen}>
                <div style={{ padding:'8px 0' }}>
                  {Object.entries(LANGUAGES).map(([code, cfg]) => (
                    <button key={code} onClick={() => { setLanguage(code); setLangOpen(false); }}
                      style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'9px 16px', background: language===code?'#FFF5F5':'none', border:'none', cursor:'pointer', fontSize:13.5, color: language===code?'#C8102E':'#333', fontFamily:'DM Sans,sans-serif', fontWeight: language===code?700:400, transition:'background .1s' }}
                      onMouseEnter={e => { if (language!==code) e.currentTarget.style.background='#F8F8F8'; }}
                      onMouseLeave={e => { if (language!==code) e.currentTarget.style.background='none'; }}>
                      <span style={{ fontSize:18 }}>{cfg.flag}</span>
                      <span>{cfg.name}</span>
                      {language===code && <span style={{ marginLeft:'auto', color:'#C8102E', fontSize:14 }}>✓</span>}
                    </button>
                  ))}
                </div>
              </FloatMenu>
            </div>

            {/* Currency */}
            <div ref={curRef} style={{ position:'relative' }}>
              <UtilBtn onClick={() => { setCurOpen(x => !x); setLangOpen(false); }}>
                {curCfg.symbol.trim()} {currency} ▾
              </UtilBtn>
              <FloatMenu open={curOpen}>
                <div style={{ padding:'8px 0', maxHeight:320, overflowY:'auto' }}>
                  {Object.entries(CURRENCIES).map(([code, cfg]) => (
                    <button key={code} onClick={() => { setCurrency(code); setCurOpen(false); }}
                      style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'9px 16px', background: currency===code?'#FFF5F5':'none', border:'none', cursor:'pointer', fontSize:13.5, color: currency===code?'#C8102E':'#333', fontFamily:'DM Sans,sans-serif', fontWeight: currency===code?700:400, transition:'background .1s' }}
                      onMouseEnter={e => { if (currency!==code) e.currentTarget.style.background='#F8F8F8'; }}
                      onMouseLeave={e => { if (currency!==code) e.currentTarget.style.background='none'; }}>
                      <span style={{ fontSize:16, fontWeight:800, minWidth:28, color:'#C8102E' }}>{cfg.symbol}</span>
                      <span style={{ flex:1 }}>{cfg.name}</span>
                      <span style={{ fontSize:12, color:'#AAA' }}>{code}</span>
                      {currency===code && <span style={{ color:'#C8102E', fontSize:14 }}>✓</span>}
                    </button>
                  ))}
                </div>
              </FloatMenu>
            </div>
          </div>

          {/* Right: Sub-brands */}
          <div style={{ display:'flex', gap:0 }}>
            {['Business travel','Habibi Cargo','Holidays'].map(t => (
              <Link key={t} to="/about" style={{ color:'rgba(255,255,255,.38)', fontSize:11, padding:'0 12px', transition:'color .15s' }}
                onMouseEnter={e => e.currentTarget.style.color='#fff'}
                onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,.38)'}>{t}</Link>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════ MAIN NAV ══════════ */}
      <nav style={{
        position:'sticky', top:0, zIndex:900,
        background:navBg, borderBottom:`1px solid ${bdr}`,
        boxShadow:shadow, backdropFilter: glass?'blur(14px)':'none',
        transition:'background .3s, box-shadow .3s, border-color .3s',
        height:'var(--nav-h)', display:'flex', alignItems:'center',
      }}>
        <div className="container" style={{ display:'flex', alignItems:'center', gap:0 }}>

          {/* Logo */}
          <Link to="/" style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0, marginRight:10 }}>
            <div style={{ width:42, height:42, borderRadius:'50%', background: glass?'rgba(255,255,255,.15)':'#C8102E', border: glass?'1.5px solid rgba(255,255,255,.3)':'none', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .3s' }}>
              <span style={{ fontFamily:'Cormorant Garamond,serif', fontWeight:700, fontSize:13, color:'#fff', letterSpacing:.5 }}>HA</span>
            </div>
            <div className="hide-mobile">
              <div style={{ fontFamily:'Cormorant Garamond,serif', fontWeight:600, fontSize:19, color: glass?'#fff':'#1A1A1A', lineHeight:1, transition:'color .3s' }}>Habibi Airways</div>
              <div style={{ fontSize:8.5, letterSpacing:'3.5px', textTransform:'uppercase', color: glass?'rgba(255,255,255,.42)':'#BBB', marginTop:2, transition:'color .3s' }}>FLY BETTER · ARRIVE IN STYLE</div>
            </div>
          </Link>

          {/* Nav links */}
          <div style={{ display:'flex', alignItems:'center', flex:1, gap:0 }}>
            {NAV.map(l => {
              const active = location.pathname===l.path || (l.path!=='/book'&&location.pathname.startsWith(l.path+'/'));
              return (
                <Link key={l.path} to={l.path} style={{
                  padding:'0 12px', height:'var(--nav-h)', display:'flex', alignItems:'center',
                  fontSize:13.5, fontWeight:active?700:500, color:active?'#C8102E':lkCol,
                  borderBottom:`2.5px solid ${active?'#C8102E':'transparent'}`,
                  transition:'all .2s', whiteSpace:'nowrap',
                }}
                  onMouseEnter={e => { if(!active){ e.currentTarget.style.color='#C8102E'; e.currentTarget.style.borderBottomColor='rgba(200,16,46,.3)'; }}}
                  onMouseLeave={e => { if(!active){ e.currentTarget.style.color=lkCol; e.currentTarget.style.borderBottomColor='transparent'; }}}>
                  {l.label}
                </Link>
              );
            })}
            {[['Check-in','/check-in'],['Flight Status','/flight-status']].map(([lbl,path]) => (
              <Link key={path} to={path} style={{ padding:'0 10px', height:'var(--nav-h)', display:'flex', alignItems:'center', fontSize:12.5, fontWeight:500, color: glass?'rgba(255,255,255,.6)':'#777', transition:'color .2s', whiteSpace:'nowrap' }}
                onMouseEnter={e => e.currentTarget.style.color='#C8102E'}
                onMouseLeave={e => e.currentTarget.style.color=glass?'rgba(255,255,255,.6)':'#777'}>
                {lbl}
              </Link>
            ))}
          </div>

          {/* User */}
          <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
            {user ? (
              <div ref={userRef} style={{ position:'relative' }}>
                <button onClick={() => setUserOpen(x => !x)} style={{ display:'flex', alignItems:'center', gap:9, padding:'5px 13px 5px 5px', background: glass?'rgba(255,255,255,.12)':'#F5F5F5', border:`1px solid ${glass?'rgba(255,255,255,.22)':'#E0E0E0'}`, borderRadius:100, cursor:'pointer', transition:'all .2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor='#C8102E'}
                  onMouseLeave={e => e.currentTarget.style.borderColor=glass?'rgba(255,255,255,.22)':'#E0E0E0'}>
                  <div style={{ width:30, height:30, borderRadius:'50%', background:'linear-gradient(135deg,#C8102E,#8b0000)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:13 }}>
                    {(userProfile?.name||user.displayName||user.email||'U')[0].toUpperCase()}
                  </div>
                  <div style={{ textAlign:'left' }}>
                    <div style={{ fontSize:12.5, fontWeight:700, color:glass?'#fff':'#1A1A1A', lineHeight:1.1 }}>{(userProfile?.name||user.displayName||'Traveler').split(' ')[0]}</div>
                    <div style={{ fontSize:10, color:TIER_COL[userProfile?.tier]||'#C8102E', marginTop:1 }}>Skywards {userProfile?.tier||'Blue'}</div>
                  </div>
                  <svg width="9" height="5" viewBox="0 0 9 5" fill="none" style={{ marginLeft:2 }}>
                    <path d="M1 1l3.5 3L8 1" stroke={glass?'rgba(255,255,255,.5)':'#AAA'} strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                </button>

                {userOpen && (
                  <div className="animate-slideDown" style={{ position:'absolute', right:0, top:'calc(100% + 10px)', background:'#fff', border:'1px solid #E8E8E8', borderRadius:8, minWidth:248, boxShadow:'0 16px 56px rgba(0,0,0,.18)', overflow:'hidden', zIndex:1000 }}>
                    <div style={{ padding:'14px 16px', background:'#FAFAFA', borderBottom:'1px solid #F0F0F0' }}>
                      <div style={{ fontSize:14, fontWeight:700, color:'#1A1A1A' }}>{userProfile?.name||user.displayName||'Traveler'}</div>
                      <div style={{ fontSize:11, color:'#AAA', marginTop:2 }}>{user.email}</div>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:11 }}>
                        <div style={{ textAlign:'center', padding:'8px 4px', background:'#fff', borderRadius:5, border:'1px solid #EBEBEB' }}>
                          <div style={{ fontSize:16, fontWeight:900, color:'#C8102E' }}>{(userProfile?.skywardsMiles||0).toLocaleString('en-IN')}</div>
                          <div style={{ fontSize:9.5, color:'#AAA', marginTop:1, textTransform:'uppercase', letterSpacing:1 }}>Miles</div>
                        </div>
                        <div style={{ textAlign:'center', padding:'8px 4px', background:'#fff', borderRadius:5, border:'1px solid #EBEBEB' }}>
                          <div style={{ fontSize:14, fontWeight:800, color:TIER_COL[userProfile?.tier]||'#C8102E' }}>{userProfile?.tier||'Blue'}</div>
                          <div style={{ fontSize:9.5, color:'#AAA', marginTop:1, textTransform:'uppercase', letterSpacing:1 }}>Tier</div>
                        </div>
                      </div>
                    </div>
                    {[
                      { icon:'✈', lbl:'My Trips',   path:'/my-trips'  },
                      { icon:'👤', lbl:'My Profile', path:'/profile'   },
                      { icon:'🏆', lbl:'Skywards',   path:'/loyalty'   },
                      { icon:'🏨', lbl:'My Hotels',  path:'/hotels'    },
                      ...(isAdmin?[{ icon:'⚙', lbl:'Admin Panel', path:'/admin' }]:[]),
                    ].map(item => (
                      <button key={item.path} onClick={() => { navigate(item.path); setUserOpen(false); }}
                        style={{ display:'flex', alignItems:'center', gap:11, width:'100%', padding:'11px 16px', background:'none', border:'none', borderBottom:'1px solid #F8F8F8', cursor:'pointer', fontSize:13.5, color:'#333', textAlign:'left', fontFamily:'DM Sans,sans-serif', transition:'background .1s' }}
                        onMouseEnter={e => e.currentTarget.style.background='#FFF5F5'}
                        onMouseLeave={e => e.currentTarget.style.background='none'}>
                        <span style={{ fontSize:16, width:22 }}>{item.icon}</span>
                        {item.lbl}
                        {item.path==='/admin' && <span style={{ marginLeft:'auto', fontSize:10.5, background:'#C8102E', color:'#fff', padding:'1px 7px', borderRadius:100 }}>Admin</span>}
                      </button>
                    ))}
                    <button onClick={doLogout} style={{ display:'flex', alignItems:'center', gap:11, width:'100%', padding:'11px 16px', background:'none', border:'none', cursor:'pointer', fontSize:13.5, color:'#C8102E', fontFamily:'DM Sans,sans-serif', fontWeight:600 }}>
                      <span style={{ fontSize:16, width:22 }}>↗</span> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" style={{ padding:'8px 18px', fontSize:13, fontWeight:600, color:glass?'#fff':'#C8102E', border:`1.5px solid ${glass?'rgba(255,255,255,.4)':'#C8102E'}`, borderRadius:4, background:'transparent', transition:'all .2s' }}
                  onMouseEnter={e => e.currentTarget.style.background=glass?'rgba(255,255,255,.1)':'rgba(200,16,46,.05)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>Log in</Link>
                <Link to="/register" style={{ padding:'8px 18px', fontSize:13, fontWeight:700, background:'#C8102E', color:'#fff', borderRadius:4, boxShadow:'0 2px 10px rgba(200,16,46,.35)', transition:'background .2s' }}
                  onMouseEnter={e => e.currentTarget.style.background='#9e0b22'}
                  onMouseLeave={e => e.currentTarget.style.background='#C8102E'}>Join Skywards</Link>

              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
