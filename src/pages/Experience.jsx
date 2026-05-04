// src/pages/Experience.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fadeUp, staggerReveal } from '../utils/anime';

const CABINS = [
  {
    id:'first', label:'First Class', tagline:'The pinnacle of air travel', color:'#C8102E',
    img:'https://media.cntraveller.com/photos/6245613be0d357e9da9e6612/4:3/w_3560,h_2670,c_limit/Air-France-La-Premiere.jpg',
    price:'₹4,60,000', features:[
      '🛌 Private suite with fully-flat bed (214 cm)',
      '🍽 5-course chef-curated menu, served when you wish',
      '🥂 Dom Pérignon champagne & premium spirits',
      '🛁 Shower spa onboard A380',
      '🚗 Complimentary chauffeur in 95 cities',
      '🏨 24h lounge access worldwide',
      '🎬 28" HD personal screen, 5,000+ channels',
      '👔 Designer amenity kit & pyjamas',
    ]
  },
  {
    id:'business', label:'Business Class', tagline:'Arrive ready for anything', color:'#1565C0',
    img:'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=900&h=500&fit=crop',
    price:'₹2,85,000', features:[
      '💺 Lie-flat seat, 72-inch fully flat bed',
      '🥂 Welcome drink & gourmet dining',
      '📺 23" HD touchscreen entertainment',
      '🏛 Lounge access at 120+ airports',
      '🧴 Bulgari amenity kit',
      '🎒 40 kg checked baggage allowance',
      '⚡ Priority boarding & fast track',
      '📶 High-speed Wi-Fi included',
    ]
  },
  {
    id:'premium', label:'Premium Economy', tagline:'More space, more comfort', color:'#2E7D32',
    img:'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=900&h=500&fit=crop',
    price:'₹1,70,000', features:[
      '💺 Extra-wide seat with 38" pitch',
      '🍽 Enhanced dining with wider menu',
      '🎬 21" HD personal screen',
      '🏛 Lounge access on Flex+ fares',
      '🧳 35 kg checked baggage',
      '✈ Priority boarding',
      '🔌 USB-C & universal power outlet',
      '🎁 Premium amenity kit',
    ]
  },
  {
    id:'economy', label:'Economy Class', tagline:'Outstanding value, exceptional comfort', color:'#555',
    img:'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=900&h=500&fit=crop',
    price:'₹18,000', features:[
      '💺 Ergonomic seat, 32" pitch',
      '🍽 Hot meals & complimentary beverages',
      '📺 13.3" HD personal screen, 4,500+ channels',
      '🧳 25 kg checked baggage',
      '🔌 USB power & universal socket',
      '😴 Blanket, pillow & amenity kit',
      '🎵 Noise-cancelling headphones',
      '📶 Wi-Fi available',
    ]
  },
];

const AMENITIES = [
  { icon:'🎬', title:'ice — Inflight Entertainment', desc:'4,500+ channels: the latest blockbusters, box sets, music, and podcasts on personal HD screens.' },
  { icon:'🍽', title:'Award-Winning Dining', desc:'Multi-course meals designed by celebrity chefs, featuring regional and international cuisine with premium beverages.' },
  { icon:'📶', title:'Onboard Wi-Fi', desc:'Stay connected with high-speed satellite Wi-Fi, available on all long-haul flights from your seat.' },
  { icon:'🛍', title:'Duty-Free Shopping', desc:'Shop premium brands at 35,000 feet — perfumes, electronics, fashion and exclusive Habibi souvenirs.' },
  { icon:'✈', title:'Modern Fleet', desc:'Our A380, B777-300ER and A350 fleet features the latest cabin interiors with optimal cabin pressure and humidity.' },
  { icon:'🛡', title:'Safety First', desc:'Triple-redundant safety systems, industry-leading maintenance protocols, and a perfect safety record.' },
];

export default function Experience() {
  const navigate = useNavigate();
  const [active, setActive] = useState('first');

  useEffect(() => {
    fadeUp('.exp-hero', 0);
    fadeUp('.exp-amenity', 200);
  }, []);

  const cabin = CABINS.find(c=>c.id===active) || CABINS[0];

  return (
    <div style={{ background:'#fff', minHeight:'100vh', fontFamily:'DM Sans,sans-serif' }}>
      {/* Hero */}
      <div style={{ position:'relative', height:400, overflow:'hidden' }}>
        <img src="https://www.rd.com/wp-content/uploads/2020/08/GettyImages-1163842340-e1597169532673.jpg" alt="" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center 30%' }} />
        <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.55)' }} />
        <div className="exp-hero" style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:24, opacity:0 }}>
          <div style={{ fontSize:11, color:'rgba(255,255,255,.55)', letterSpacing:'4px', textTransform:'uppercase', marginBottom:12 }}>The Habibi Experience</div>
          <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(2.4rem,5vw,3.6rem)', fontWeight:400, color:'#fff', marginBottom:12, lineHeight:1.1 }}>Every cabin, exceptional</h1>
          <p style={{ fontSize:15, color:'rgba(255,255,255,.8)', maxWidth:500 }}>From our iconic First Class suite to our award-winning Economy, every seat delivers the Habibi difference.</p>
        </div>
      </div>

      {/* Cabin tabs */}
      <div style={{ background:'#1A1A1A', padding:'0 24px', position:'sticky', top:66, zIndex:50 }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'flex', gap:0 }}>
          {CABINS.map(c=>(
            <button key={c.id} onClick={()=>setActive(c.id)} style={{ flex:1, padding:'16px 8px', border:'none', background:'none', fontSize:13, fontWeight: active===c.id?700:400, color: active===c.id?'#fff':'rgba(255,255,255,.45)', borderBottom:`3px solid ${active===c.id?c.color:'transparent'}`, cursor:'pointer', fontFamily:'DM Sans,sans-serif', transition:'all .2s', whiteSpace:'nowrap' }}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cabin detail */}
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'40px 24px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, alignItems:'start', marginBottom:56 }}>
          <div>
            <div style={{ display:'inline-block', padding:'4px 12px', background:`${cabin.color}18`, borderRadius:100, fontSize:11, fontWeight:700, color:cabin.color, textTransform:'uppercase', letterSpacing:1, marginBottom:14 }}>{cabin.label}</div>
            <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:36, fontWeight:400, color:'#0D0D0D', marginBottom:8, lineHeight:1.15 }}>{cabin.tagline}</h2>
            <div style={{ fontSize:13, color:'#888', marginBottom:6 }}>Starting from</div>
            <div style={{ fontSize:32, fontWeight:800, color:cabin.color, letterSpacing:-1.5, marginBottom:22 }}>{cabin.price}</div>
            <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:28 }}>
              {cabin.features.map((f,i)=>(
                <div key={i} style={{ display:'flex', gap:10, fontSize:14, color:'#444', lineHeight:1.5 }}>
                  <span style={{ flexShrink:0, marginTop:1 }}>{f.slice(0,2)}</span>
                  <span>{f.slice(2).trim()}</span>
                </div>
              ))}
            </div>
            <button onClick={()=>navigate('/book')} style={{ padding:'13px 32px', background:cabin.color, border:'none', color:'#fff', fontWeight:700, fontSize:15, borderRadius:4, cursor:'pointer', fontFamily:'DM Sans,sans-serif', boxShadow:`0 4px 16px ${cabin.color}44`, transition:'all .2s' }}
              onMouseEnter={e=>e.currentTarget.style.transform='translateY(-1px)'}
              onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
              Book {cabin.label} →
            </button>
          </div>
          <div style={{ borderRadius:8, overflow:'hidden', boxShadow:'0 12px 48px rgba(0,0,0,.18)' }}>
            <img src={cabin.img} alt={cabin.label} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
          </div>
        </div>

        {/* Amenities grid */}
        <div style={{ borderTop:'1px solid #EBEBEB', paddingTop:48 }}>
          <h3 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:28, fontWeight:400, color:'#0D0D0D', textAlign:'center', marginBottom:36 }}>Onboard amenities</h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24 }}>
            {AMENITIES.map(a=>(
              <div key={a.title} className="exp-amenity" style={{ padding:'22px 20px', borderRadius:6, border:'1px solid #EBEBEB', background:'#FAFAFA', opacity:0, transition:'all .2s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='#C8102E';e.currentTarget.style.background='#FFF5F5';}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='#EBEBEB';e.currentTarget.style.background='#FAFAFA';}}>
                <div style={{ fontSize:28, marginBottom:12 }}>{a.icon}</div>
                <div style={{ fontSize:14.5, fontWeight:700, color:'#1A1A1A', marginBottom:7 }}>{a.title}</div>
                <div style={{ fontSize:13, color:'#777', lineHeight:1.65 }}>{a.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
