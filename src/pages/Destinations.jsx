// src/pages/Destinations.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { AIRPORTS, TODAY } from '../utils/flightData';
import { fadeUp, staggerReveal } from '../utils/anime';

const DEST_DATA = [
  { code:'LHR', city:'London',      country:'UK',          region:'Europe',       price:41500, img:'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&h=380&fit=crop', desc:'The historic capital, home to world-class museums, theatre, and iconic landmarks.', tag:'Popular' },
  { code:'DXB', city:'Dubai',       country:'UAE',         region:'Middle East',  price:18900, img:'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=380&fit=crop', desc:'A dazzling city of superlatives — world\'s tallest towers, luxury malls, golden beaches.', tag:'Hub' },
  { code:'CDG', city:'Paris',       country:'France',      region:'Europe',       price:37200, img:'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&h=380&fit=crop', desc:'The city of light — art, fashion, gastronomy and the Eiffel Tower.', tag:'Romantic' },
  { code:'JFK', city:'New York',    country:'USA',         region:'Americas',     price:54800, img:'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=600&h=380&fit=crop', desc:'The city that never sleeps — Times Square, Central Park, world-class dining.', tag:'Popular' },
  { code:'SIN', city:'Singapore',   country:'Singapore',   region:'Asia Pacific', price:23400, img:'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&h=380&fit=crop', desc:'A seamless fusion of cultures, futuristic gardens, and unbeatable street food.', tag:'New route' },
  { code:'NRT', city:'Tokyo',       country:'Japan',       region:'Asia Pacific', price:49600, img:'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=380&fit=crop', desc:'Ancient temples meet neon-lit streets in this extraordinary city of contrasts.', tag:'Popular' },
  { code:'SYD', city:'Sydney',      country:'Australia',   region:'Asia Pacific', price:58200, img:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=380&fit=crop', desc:'Opera House, Bondi Beach, harbour cruises — Australia\'s iconic gateway city.', tag:'' },
  { code:'HKG', city:'Hong Kong',   country:'China',       region:'Asia Pacific', price:32100, img:'https://images.unsplash.com/photo-1598300056393-4afc1c3d5b10?w=600&h=380&fit=crop', desc:'A stunning skyline, night markets, dim sum and stunning harbour views.', tag:'' },
  { code:'FRA', city:'Frankfurt',   country:'Germany',     region:'Europe',       price:34800, img:'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=600&h=380&fit=crop', desc:'Germany\'s financial hub, gateway to the Rhine valley and Bavarian countryside.', tag:'' },
  { code:'BKK', city:'Bangkok',     country:'Thailand',    region:'Asia Pacific', price:21600, img:'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600&h=380&fit=crop', desc:'Vibrant temples, street markets, nightlife and unbeatable Thai cuisine.', tag:'Deal' },
  { code:'CAI', city:'Cairo',       country:'Egypt',       region:'Africa',       price:19800, img:'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600&h=380&fit=crop', desc:'The Pyramids, Sphinx, and ancient Pharaonic wonders of the Nile Valley.', tag:'' },
  { code:'IST', city:'Istanbul',    country:'Turkey',      region:'Europe',       price:22400, img:'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600&h=380&fit=crop', desc:'Where East meets West — bazaars, mosques, and Bosphorus sunsets.', tag:'' },
];

const REGIONS = ['All','Europe','Middle East','Asia Pacific','Americas','Africa'];
const CABINS  = ['Economy','Premium Economy','Business','First'];
const CABIN_MULT = { Economy:1, 'Premium Economy':1.7, Business:2.85, First:4.6 };

export default function Destinations() {
  const navigate = useNavigate();
  const { setSearchParams } = useBooking();
  const [region, setRegion]   = useState('All');
  const [cabin, setCabin]     = useState('Economy');
  const [search, setSearch]   = useState('');
  const [sort, setSort]       = useState('popular');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fadeUp('.dest-hero', 0);
    setTimeout(() => staggerReveal('.dest-grid-card'), 200);
  }, [region]);

  const filtered = useMemo(() => {
    let list = DEST_DATA;
    if (region !== 'All') list = list.filter(d=>d.region===region);
    if (search) list = list.filter(d=>[d.city,d.country,d.region].some(s=>s.toLowerCase().includes(search.toLowerCase())));
    if (sort==='price-asc') list = [...list].sort((a,b)=>a.price-b.price);
    else if (sort==='price-desc') list = [...list].sort((a,b)=>b.price-a.price);
    else if (sort==='az') list = [...list].sort((a,b)=>a.city.localeCompare(b.city));
    return list;
  }, [region, search, sort]);

  const bookDest = (code) => {
    setSearchParams({ tripType:'return', from:'BOM', to:code, departureDate:TODAY, returnDate:'', passengers:{adults:1,children:0,infants:0}, cabinClass:cabin });
    navigate('/book');
  };

  const fmtPrice = (p) => `₹${Math.round(p*CABIN_MULT[cabin]).toLocaleString('en-IN')}`;

  return (
    <div style={{ background:'#F5F5F0', minHeight:'100vh', fontFamily:'DM Sans,sans-serif' }}>
      {/* Hero */}
      <div style={{ background:'linear-gradient(135deg,#0D0D0D 0%,#1A1A2E 100%)', padding:'48px 24px 56px', textAlign:'center' }}>
        <div className="dest-hero" style={{ opacity:0 }}>
          <div style={{ fontSize:11, color:'rgba(255,255,255,.45)', letterSpacing:'4px', textTransform:'uppercase', marginBottom:10 }}>150+ destinations</div>
          <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(2.2rem,5vw,3.2rem)', fontWeight:400, color:'#fff', marginBottom:10 }}>Where will you fly next?</h1>
          <p style={{ fontSize:14.5, color:'rgba(255,255,255,.6)', maxWidth:480, margin:'0 auto 28px' }}>Explore our global network across six continents</p>

          {/* Search */}
          <div style={{ maxWidth:560, margin:'0 auto', display:'flex', gap:10 }}>
            <div style={{ flex:1, position:'relative' }}>
              <span style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'rgba(255,255,255,.4)', fontSize:15 }}>🔍</span>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search city or country…" style={{ width:'100%', padding:'12px 12px 12px 38px', border:'1px solid rgba(255,255,255,.2)', borderRadius:5, background:'rgba(255,255,255,.1)', color:'#fff', fontSize:14, outline:'none', fontFamily:'DM Sans,sans-serif', boxSizing:'border-box' }} />
            </div>
            <select value={cabin} onChange={e=>setCabin(e.target.value)} style={{ padding:'12px 14px', border:'1px solid rgba(255,255,255,.2)', borderRadius:5, background:'rgba(255,255,255,.1)', color:'#fff', fontSize:13.5, outline:'none', fontFamily:'DM Sans,sans-serif', cursor:'pointer' }}>
              {CABINS.map(c=><option key={c} value={c} style={{ background:'#333' }}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Region filters */}
      <div style={{ background:'#fff', borderBottom:'1px solid #E8E8E8', position:'sticky', top:66, zIndex:50 }}>
        <div style={{ maxWidth:1320, margin:'0 auto', padding:'0 24px', display:'flex', gap:0, overflowX:'auto', alignItems:'center' }}>
          {REGIONS.map(r=>(
            <button key={r} onClick={()=>setRegion(r)} style={{ padding:'14px 18px', border:'none', background:'none', fontSize:13.5, fontWeight: region===r?700:400, color: region===r?'#C8102E':'#666', borderBottom:`3px solid ${region===r?'#C8102E':'transparent'}`, cursor:'pointer', fontFamily:'DM Sans,sans-serif', whiteSpace:'nowrap', transition:'all .2s' }}>
              {r}
            </button>
          ))}
          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:8 }}>
            <label style={{ fontSize:12, color:'#888', whiteSpace:'nowrap' }}>Sort:</label>
            <select value={sort} onChange={e=>setSort(e.target.value)} style={{ padding:'6px 10px', border:'1px solid #E0E0E0', borderRadius:4, fontSize:12.5, fontFamily:'DM Sans,sans-serif', outline:'none', cursor:'pointer' }}>
              <option value="popular">Popular</option>
              <option value="price-asc">Price ↑</option>
              <option value="price-desc">Price ↓</option>
              <option value="az">A–Z</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1320, margin:'0 auto', padding:'28px 24px 56px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <div style={{ fontSize:14, color:'#888' }}><strong style={{ color:'#1A1A1A', fontSize:16 }}>{filtered.length}</strong> destinations found</div>
          <div style={{ fontSize:12.5, color:'#888' }}>Prices shown from Mumbai · {cabin} class · Return</div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))', gap:20 }}>
          {filtered.map((d,i)=>(
            <div key={d.code} className="dest-grid-card" style={{ background:'#fff', borderRadius:8, overflow:'hidden', border:'1px solid #EBEBEB', cursor:'pointer', transition:'all .3s', opacity:0 }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 12px 36px rgba(0,0,0,.11)';}}
              onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';}}>
              <div style={{ position:'relative', height:190, overflow:'hidden' }}>
                <img src={d.img} alt={d.city} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform .5s' }}
                  onMouseEnter={e=>e.target.style.transform='scale(1.07)'}
                  onMouseLeave={e=>e.target.style.transform='scale(1)'} />
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,.4) 0%,transparent 55%)' }} />
                {d.tag&&<span style={{ position:'absolute', top:11, left:11, background: d.tag==='Deal'?'#2E7D32':d.tag==='New route'?'#1565C0':'#C8102E', color:'#fff', fontSize:10.5, fontWeight:700, padding:'3px 9px', borderRadius:100, textTransform:'uppercase', letterSpacing:.5 }}>{d.tag}</span>}
                <div style={{ position:'absolute', bottom:11, left:12, color:'#fff' }}>
                  <div style={{ fontSize:22, fontWeight:800, letterSpacing:-.5 }}>{d.city}</div>
                  <div style={{ fontSize:12, opacity:.8 }}>{d.country} · {d.region}</div>
                </div>
              </div>
              <div style={{ padding:'14px 16px' }}>
                <p style={{ fontSize:12.5, color:'#777', lineHeight:1.6, marginBottom:14 }}>{d.desc}</p>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <div style={{ fontSize:10.5, color:'#AAA' }}>Return from</div>
                    <div style={{ fontSize:19, fontWeight:800, color:'#C8102E', letterSpacing:-.5 }}>{fmtPrice(d.price)}</div>
                  </div>
                  <button onClick={()=>bookDest(d.code)} style={{ padding:'9px 18px', background:'#C8102E', border:'none', color:'#fff', fontWeight:700, fontSize:13, borderRadius:4, cursor:'pointer', fontFamily:'DM Sans,sans-serif', transition:'background .15s' }}
                    onMouseEnter={e=>e.currentTarget.style.background='#9e0b22'}
                    onMouseLeave={e=>e.currentTarget.style.background='#C8102E'}>
                    Book now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length===0&&(
          <div style={{ textAlign:'center', padding:'60px 24px', color:'#888' }}>
            <div style={{ fontSize:44, marginBottom:14 }}>🌍</div>
            <div style={{ fontSize:16, fontWeight:700, color:'#1A1A1A', marginBottom:6 }}>No destinations found</div>
            <div style={{ fontSize:13.5 }}>Try a different search or region</div>
          </div>
        )}
      </div>
    </div>
  );
}
