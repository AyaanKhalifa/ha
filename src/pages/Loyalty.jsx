// src/pages/Loyalty.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingService } from '../services/api';
import { fadeUp, staggerReveal, countUp } from '../utils/anime';

const TIERS = [
  { id:'blue',     label:'Blue',     miles:'0 – 24,999',    color:'#1565C0', features:['Earn miles on all flights','Access to Skywards portal','Partner earn & burn','Birthday bonus miles'] },
  { id:'silver',   label:'Silver',   miles:'25,000 – 49,999', color:'#607D8B', features:['All Blue benefits','25% miles bonus','Lounge access (1 guest)','Priority check-in','Extra baggage 5 kg'] },
  { id:'gold',     label:'Gold',     miles:'50,000 – 99,999', color:'#F57F17', features:['All Silver benefits','50% miles bonus','Lounge access + guest','Priority boarding','Extra baggage 15 kg','Upgrade requests'] },
  { id:'platinum', label:'Platinum', miles:'100,000+',        color:'#6A1B9A', features:['All Gold benefits','100% miles bonus','Unlimited lounge access','Guaranteed upgrades','Dedicated concierge','Extra baggage 30 kg','Same-day flight changes'] },
];

const PARTNERS = [
  { name:'Marriott Hotels',   cat:'Hotels',     logo:'🏨', earn:'5 miles/₹100' },
  { name:'Hertz Car Rental',  cat:'Car Rental', logo:'🚗', earn:'3 miles/₹100' },
  { name:'American Express',  cat:'Credit Card',logo:'💳', earn:'2 miles/₹150' },
  { name:'Carrefour',         cat:'Retail',     logo:'🛒', earn:'1 mile/₹100' },
  { name:'Booking.com',       cat:'Hotels',     logo:'🏩', earn:'4 miles/₹100' },
  { name:'Uber',              cat:'Transport',  logo:'🚕', earn:'2 miles/trip' },
  { name:'Starbucks',         cat:'Dining',     logo:'☕', earn:'1 mile/₹50' },
  { name:'Amazon',            cat:'Shopping',   logo:'📦', earn:'1 mile/₹200' },
];

const REDEEM = [
  { icon:'✈', title:'Upgrade your seat', desc:'Use miles to upgrade from Economy to Business or First Class on eligible flights.' },
  { icon:'🎟', title:'Reward flights',   desc:'Book free flights using miles to 150+ destinations worldwide.' },
  { icon:'🏨', title:'Hotel stays',      desc:'Redeem miles at 700+ partner hotels — from budget to ultra-luxury.' },
  { icon:'🎁', title:'Gift & shop',      desc:'Spend miles in our rewards store for tech, fashion, experiences, and more.' },
  { icon:'💳', title:'Transfer to cash', desc:'Convert miles to wallet credit on selected partner cards.' },
  { icon:'👨‍👩‍👧', title:'Share miles',       desc:'Pool and share miles with up to 8 family members.' },
];

export default function Loyalty() {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [calcMiles, setCalcMiles] = useState('');
  const [calcRoute, setCalcRoute] = useState('BOM-DXB');
  const [calcCabin, setCalcCabin] = useState('Economy');
  const milesRef = React.useRef(null);

  const [stats, setStats] = useState({ miles: 0, countries: 0, cities: 0 });

  useEffect(() => {
    fadeUp('.loyalty-hero-content', 0);
    staggerReveal('.tier-card', 200);
    staggerReveal('.partner-chip', 400);

    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && milesRef.current) {
        countUp(milesRef.current, 2500000, 1800, '', '+');
        obs.disconnect();
      }
    }, { threshold: 0.3 });
    if (milesRef.current) obs.observe(milesRef.current);

    return () => obs.disconnect();
  }, [user]);

  const ROUTE_MILES = { 'BOM-DXB': 1200, 'DEL-LHR': 4200, 'BOM-JFK': 7800, 'BLR-SIN': 1600 };
  const CABIN_MULT  = { Economy: 1, 'Premium Economy': 1.5, Business: 2, First: 3 };
  const estimatedMiles = Math.round((ROUTE_MILES[calcRoute] || 1200) * (CABIN_MULT[calcCabin] || 1));

  const currentTier = userProfile?.tier || 'Blue';
  const currentMiles = userProfile?.skywardsMiles || 0;
  const tierData = TIERS.find(t => t.label === currentTier) || TIERS[0];
  const nextTier = TIERS[TIERS.findIndex(t => t.label === currentTier) + 1];
  
  // Correctly parse the lower bound of the next tier (e.g. "25,000 – 49,999" -> 25000)
  const nextTierRequirement = nextTier ? parseInt(nextTier.miles?.split('–')[0]?.replace(/\D/g,'') || 25000) : 100000;
  const progressPct = nextTier ? Math.min(100, Math.round(currentMiles / nextTierRequirement * 100)) : 100;

  return (
    <div style={{ background:'#fff', minHeight:'100vh', fontFamily:'DM Sans,sans-serif' }}>

      {/* Hero */}
      <div style={{ background:'linear-gradient(135deg,#C8102E 0%,#7a0018 100%)', padding:'56px 24px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-80, right:-80, width:320, height:320, borderRadius:'50%', background:'rgba(255,255,255,.05)' }} />
        <div style={{ position:'absolute', bottom:-60, left:-60, width:240, height:240, borderRadius:'50%', background:'rgba(255,255,255,.04)' }} />
        <div className="loyalty-hero-content" style={{ position:'relative', opacity:0 }}>
          <div style={{ fontSize:11, color:'rgba(255,255,255,.55)', letterSpacing:'4px', textTransform:'uppercase', marginBottom:12 }}>Habibi Skywards</div>
          <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(2.4rem,5vw,3.6rem)', fontWeight:400, color:'#fff', marginBottom:14, lineHeight:1.1 }}>Every mile,<br/>a new adventure</h1>
          <p style={{ fontSize:15, color:'rgba(255,255,255,.8)', maxWidth:500, margin:'0 auto 28px' }}>Join 2.5 million members earning and redeeming miles with Habibi Airways and 50+ partners worldwide.</p>
          <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:52, fontWeight:600, color:'#fff', letterSpacing:-3, lineHeight:1, marginBottom:6 }}>
            <span ref={milesRef}>0</span>
          </div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,.5)', marginBottom:28, textTransform:'uppercase', letterSpacing:2 }}>Miles awarded this year</div>
          {!user && (
            <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
              <Link to="/register" style={{ padding:'13px 30px', background:'#fff', color:'#C8102E', fontWeight:700, fontSize:14.5, borderRadius:4, textDecoration:'none', transition:'all .2s' }}>Join free — earn 1,000 miles</Link>

            </div>
          )}
        </div>
      </div>

      {/* Logged-in dashboard */}
      {user && (
        <div style={{ background:'#1A1A1A', padding:'24px' }}>
          <div style={{ maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:20, alignItems:'center' }}>
            <div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,.45)', textTransform:'uppercase', letterSpacing:1.5, marginBottom:6 }}>Your balance</div>
              <div style={{ fontSize:36, fontWeight:900, color:'#fff', letterSpacing:-2 }}>{currentMiles.toLocaleString()}<span style={{ fontSize:14, fontWeight:400, color:'rgba(255,255,255,.5)', marginLeft:6 }}>miles</span></div>
              <div style={{ display:'inline-block', marginTop:8, padding:'4px 12px', background:`${tierData.color}33`, borderRadius:100, fontSize:12, fontWeight:700, color:tierData.color }}>{currentTier} Member</div>
            </div>
            <div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,.45)', textTransform:'uppercase', letterSpacing:1.5, marginBottom:8 }}>
                Progress to {nextTier?.label || 'top tier'}
              </div>
              <div style={{ height:8, background:'rgba(255,255,255,.1)', borderRadius:4, overflow:'hidden', marginBottom:6 }}>
                <div style={{ height:'100%', width:`${progressPct}%`, background:'linear-gradient(90deg,#C8102E,#ff3355)', borderRadius:4, transition:'width 1s ease' }} />
              </div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,.45)' }}>
                {currentMiles.toLocaleString()} / {nextTier ? parseInt(nextTier.miles).toLocaleString() : '∞'} miles {nextTier ? `to ${nextTier.label}` : '— Maximum tier reached!'}
              </div>
            </div>
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
              <Link to="/my-trips" style={{ padding:'10px 18px', background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.2)', color:'#fff', borderRadius:4, fontSize:13, textDecoration:'none', transition:'all .2s' }}>My trips</Link>
              <button onClick={()=>navigate('/book')} style={{ padding:'10px 20px', background:'#C8102E', border:'none', color:'#fff', fontWeight:700, fontSize:13, borderRadius:4, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>Earn miles now →</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'56px 24px' }}>

        {/* Tier comparison */}
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:32, fontWeight:400, color:'#0D0D0D', marginBottom:8 }}>Skywards tiers</h2>
          <p style={{ fontSize:14, color:'#777' }}>The more you fly, the more you unlock</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:64 }}>
          {TIERS.map(t => {
            const isCurrentTier = t.label === currentTier && !!user;
            return (
              <div key={t.id} className="tier-card" style={{ border:`2px solid ${isCurrentTier?t.color:'#EBEBEB'}`, borderRadius:8, overflow:'hidden', background: isCurrentTier?`${t.color}08`:'#fff', transition:'all .3s', opacity:0 }}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow=`0 10px 36px ${t.color}22`;}}
                onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';}}>
                <div style={{ background:t.color, padding:'16px 18px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <div style={{ fontSize:18, fontWeight:800, color:'#fff' }}>{t.label}</div>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,.65)', marginTop:2 }}>{t.miles} miles</div>
                  </div>
                  {isCurrentTier && <span style={{ fontSize:11, fontWeight:700, background:'rgba(255,255,255,.2)', color:'#fff', padding:'3px 9px', borderRadius:100 }}>Your tier</span>}
                </div>
                <div style={{ padding:'16px 18px' }}>
                  {t.features.map(f=>(
                    <div key={f} style={{ display:'flex', gap:8, fontSize:12.5, color:'#555', padding:'5px 0', borderBottom:'1px solid #F5F5F5', lineHeight:1.5 }}>
                      <span style={{ color:t.color, fontWeight:700, flexShrink:0 }}>✓</span> {f}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* How to earn */}
        <div style={{ background:'#F8F7F4', borderRadius:8, padding:'40px', marginBottom:64, border:'1px solid #EBEBEB' }}>
          <h3 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:26, fontWeight:400, color:'#0D0D0D', marginBottom:28 }}>How to earn miles</h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24 }}>
            {[
              { icon:'✈', t:'Flying',    d:'Earn miles on every Habibi Airways flight — multiplied by your tier bonus.' },
              { icon:'💳', t:'Partners',  d:'Earn miles shopping, dining, staying in hotels, and renting cars.' },
              { icon:'🎁', t:'Promotions',d:'Bonus miles campaigns, birthday rewards, and seasonal offers.' },
            ].map(({icon,t,d})=>(
              <div key={t} style={{ display:'flex', gap:14 }}>
                <div style={{ width:48, height:48, borderRadius:10, background:'#FFF', border:'1px solid #FFCDD2', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>{icon}</div>
                <div><div style={{ fontSize:14.5, fontWeight:700, color:'#1A1A1A', marginBottom:5 }}>{t}</div><div style={{ fontSize:13, color:'#777', lineHeight:1.6 }}>{d}</div></div>
              </div>
            ))}
          </div>
        </div>

        {/* Miles calculator */}
        <div style={{ background:'#fff', border:'1px solid #E0E0E0', borderRadius:8, padding:'32px 36px', marginBottom:64 }}>
          <h3 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:26, fontWeight:400, color:'#0D0D0D', marginBottom:6 }}>Miles calculator</h3>
          <p style={{ fontSize:13.5, color:'#888', marginBottom:24 }}>See how many miles you'd earn on a flight</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr auto', gap:14, alignItems:'end' }}>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#555', marginBottom:6 }}>Route</label>
              <select value={calcRoute} onChange={e=>setCalcRoute(e.target.value)} style={{ width:'100%', padding:'11px 13px', border:'1px solid #E0E0E0', borderRadius:5, fontSize:13.5, fontFamily:'DM Sans,sans-serif', outline:'none', cursor:'pointer' }}>
                <option value="BOM-DXB">Mumbai → Dubai</option>
                <option value="DEL-LHR">Delhi → London</option>
                <option value="BOM-JFK">Mumbai → New York</option>
                <option value="BLR-SIN">Bengaluru → Singapore</option>
              </select>
            </div>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#555', marginBottom:6 }}>Cabin class</label>
              <select value={calcCabin} onChange={e=>setCalcCabin(e.target.value)} style={{ width:'100%', padding:'11px 13px', border:'1px solid #E0E0E0', borderRadius:5, fontSize:13.5, fontFamily:'DM Sans,sans-serif', outline:'none', cursor:'pointer' }}>
                {['Economy','Premium Economy','Business','First'].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ padding:'12px 20px', background:'#C8102E', borderRadius:5, textAlign:'center', minWidth:160 }}>
              <div style={{ fontSize:11, color:'rgba(255,255,255,.7)', marginBottom:3 }}>You'd earn</div>
              <div style={{ fontSize:24, fontWeight:800, color:'#fff', letterSpacing:-1 }}>{estimatedMiles.toLocaleString()}</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,.7)' }}>base miles</div>
            </div>
          </div>
          <div style={{ marginTop:14, fontSize:12, color:'#AAA' }}>
            * Base miles shown. Multiply by your tier bonus: Silver ×1.25, Gold ×1.5, Platinum ×2.0
          </div>
        </div>

        {/* Redeem */}
        <h3 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:28, fontWeight:400, color:'#0D0D0D', marginBottom:8 }}>Redeem your miles</h3>
        <p style={{ fontSize:14, color:'#777', marginBottom:28 }}>Your miles can unlock incredible rewards</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:64 }}>
          {REDEEM.map(r=>(
            <div key={r.title} style={{ padding:'22px', border:'1px solid #EBEBEB', borderRadius:6, background:'#FAFAFA', transition:'all .2s', cursor:'pointer' }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='#C8102E';e.currentTarget.style.background='#FFF5F5';}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='#EBEBEB';e.currentTarget.style.background='#FAFAFA';}}>
              <div style={{ fontSize:26, marginBottom:10 }}>{r.icon}</div>
              <div style={{ fontSize:14.5, fontWeight:700, color:'#1A1A1A', marginBottom:6 }}>{r.title}</div>
              <div style={{ fontSize:13, color:'#777', lineHeight:1.6 }}>{r.desc}</div>
            </div>
          ))}
        </div>

        {/* Partners */}
        <h3 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:28, fontWeight:400, color:'#0D0D0D', marginBottom:8 }}>Earn with our partners</h3>
        <p style={{ fontSize:14, color:'#777', marginBottom:24 }}>Earn miles every day with 50+ partners across shopping, dining, hotels and more</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:40 }}>
          {PARTNERS.map(p=>(
            <div key={p.name} className="partner-chip" style={{ border:'1px solid #E0E0E0', borderRadius:6, padding:'16px', display:'flex', gap:12, alignItems:'center', background:'#fff', transition:'all .2s', cursor:'pointer', opacity:0 }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='#C8102E';e.currentTarget.style.transform='translateY(-2px)';}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='#E0E0E0';e.currentTarget.style.transform='translateY(0)';}}>
              <div style={{ width:40, height:40, borderRadius:8, background:'#F5F5F0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{p.logo}</div>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:'#1A1A1A' }}>{p.name}</div>
                <div style={{ fontSize:11, color:'#888', marginTop:2 }}>{p.cat}</div>
                <div style={{ fontSize:11.5, fontWeight:700, color:'#C8102E', marginTop:2 }}>{p.earn}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        {!user && (
          <div style={{ background:'linear-gradient(135deg,#C8102E,#7a0018)', borderRadius:8, padding:'44px', textAlign:'center' }}>
            <h3 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:30, fontWeight:400, color:'#fff', marginBottom:10 }}>Ready to start earning?</h3>
            <p style={{ fontSize:14.5, color:'rgba(255,255,255,.8)', marginBottom:24 }}>Join Skywards free and earn 1,000 welcome miles instantly</p>
            <Link to="/register" style={{ padding:'14px 36px', background:'#fff', color:'#C8102E', fontWeight:700, fontSize:15, borderRadius:4, textDecoration:'none', display:'inline-block', transition:'all .2s' }}>Join Skywards free →</Link>
          </div>
        )}
      </div>
    </div>
  );
}
