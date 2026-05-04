// src/pages/TravelGuide.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const GUIDES = [
  { city:'Dubai',     img:'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=380&fit=crop', code:'DXB', season:'Oct–Apr', budget:'₹8,000–15,000/day', highlights:['Burj Khalifa','Palm Jumeirah','Dubai Mall','Gold Souk','Desert Safari'], tips:['Use Metro — affordable and efficient','Friday brunch is a must-try experience','Dress modestly in public areas','Bargain at traditional souks'] },
  { city:'London',    img:'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&h=380&fit=crop', code:'LHR', season:'May–Sep', budget:'₹12,000–20,000/day', highlights:['Tower of London','Buckingham Palace','British Museum','Borough Market','Hyde Park'], tips:['Get an Oyster card for transport','Visit free museums — they are world-class','Book popular restaurants in advance','Weather is unpredictable — bring a jacket'] },
  { city:'Singapore', img:'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&h=380&fit=crop', code:'SIN', season:'Year round', budget:'₹6,000–12,000/day', highlights:['Marina Bay Sands','Gardens by the Bay','Sentosa','Chinatown','Hawker Centres'], tips:['Hawker centres for best cheap food','MRT is excellent','Gardens by the Bay free at night','Grab app for transport'] },
  { city:'Paris',     img:'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&h=380&fit=crop', code:'CDG', season:'Apr–Jun, Sep–Oct', budget:'₹10,000–18,000/day', highlights:['Eiffel Tower','Louvre Museum','Notre-Dame','Montmartre','Palace of Versailles'], tips:['Book Eiffel Tower tickets online in advance','Learn basic French — locals appreciate it','Many museums free on first Sunday','Buy a carnet of Metro tickets'] },
  { city:'Tokyo',     img:'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=380&fit=crop', code:'NRT', season:'Mar–May, Sep–Nov', budget:'₹5,000–10,000/day', highlights:['Shinjuku','Asakusa Temple','Shibuya Crossing','Mount Fuji day trip','Tsukiji Market'], tips:['IC card for all public transport','Cash is still widely used','Convenience stores are excellent','Cherry blossom season books out a year ahead'] },
  { city:'New York',  img:'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=600&h=380&fit=crop', code:'JFK', season:'Apr–Jun, Sep–Nov', budget:'₹15,000–25,000/day', highlights:['Central Park','Statue of Liberty','Times Square','Brooklyn Bridge','MoMA'], tips:['Get a MetroCard — cheapest way around','Tip 18–20% at restaurants','Buy a CityPASS for multiple attractions','Walk the High Line for free city views'] },
];

export default function TravelGuide() {
  const [sel, setSel] = useState(null);

  if (sel) {
    const g = GUIDES.find(g => g.code === sel);
    return (
      <div style={{ background:'#F8F7F4', minHeight:'100vh', fontFamily:'DM Sans,sans-serif' }}>
        <div style={{ position:'relative', height:340, overflow:'hidden' }}>
          <img src={g.img} alt={g.city} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.5)' }}/>
          <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', justifyContent:'flex-end', padding:'24px 32px' }}>
            <button onClick={() => setSel(null)} style={{ position:'absolute', top:20, left:24, padding:'8px 14px', background:'rgba(255,255,255,.15)', border:'1px solid rgba(255,255,255,.3)', borderRadius:4, color:'#fff', fontSize:13, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>← Back</button>
            <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(2rem,5vw,3rem)', fontWeight:400, color:'#fff', marginBottom:6 }}>{g.city} Travel Guide</h1>
            <div style={{ display:'flex', gap:18, fontSize:13, color:'rgba(255,255,255,.7)' }}>
              <span>🌤 Best time: {g.season}</span>
              <span>💰 Budget: {g.budget}</span>
            </div>
          </div>
        </div>
        <div className="container" style={{ padding:'32px 24px 56px', display:'grid', gridTemplateColumns:'1fr 280px', gap:22 }}>
          <div>
            <div style={{ background:'#fff', border:'1px solid #E0E0E0', borderRadius:8, padding:'22px 24px', marginBottom:16 }}>
              <h3 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:22, fontWeight:500, marginBottom:16 }}>Must-see highlights</h3>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {g.highlights.map(h => (
                  <div key={h} style={{ display:'flex', alignItems:'center', gap:9, padding:'10px 13px', background:'#F8F7F4', borderRadius:5, border:'1px solid #EBEBEB', fontSize:13.5, color:'#333' }}>
                    <span style={{ color:'#C8102E', fontWeight:700 }}>✓</span> {h}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background:'#fff', border:'1px solid #E0E0E0', borderRadius:8, padding:'22px 24px' }}>
              <h3 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:22, fontWeight:500, marginBottom:16 }}>Insider tips</h3>
              {g.tips.map((t, i) => (
                <div key={i} style={{ display:'flex', gap:12, padding:'11px 0', borderBottom:'1px solid #F5F5F5', fontSize:13.5, color:'#555', lineHeight:1.6 }}>
                  <span style={{ fontFamily:'Cormorant Garamond,serif', fontSize:18, fontWeight:700, color:'#C8102E', flexShrink:0, lineHeight:1.4 }}>{i+1}.</span> {t}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ background:'#fff', border:'1px solid #E0E0E0', borderRadius:8, padding:'18px', marginBottom:12 }}>
              <h4 style={{ fontSize:14, fontWeight:700, marginBottom:14 }}>Book your trip</h4>
              <Link to="/book" className="btn-red" style={{ width:'100%', justifyContent:'center', marginBottom:10 }}>✈ Flights to {g.city}</Link>
              <Link to="/hotels" className="btn-ghost" style={{ width:'100%', justifyContent:'center', display:'flex' }}>🏨 Hotels in {g.city}</Link>
            </div>
            <div style={{ background:'#E3F2FD', border:'1px solid #BBDEFB', borderRadius:8, padding:'16px', fontSize:13, color:'#1565C0' }}>
              💡 <strong>Tip:</strong> Bundle your flight + hotel and save up to 25%
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background:'#F8F7F4', minHeight:'100vh', fontFamily:'DM Sans,sans-serif' }}>
      <div style={{ background:'linear-gradient(135deg,#1A1A1A,#2d2d2d)', padding:'48px 24px', textAlign:'center' }}>
        <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(2rem,4vw,2.8rem)', fontWeight:400, color:'#fff', marginBottom:10 }}>Travel Guides</h1>
        <p style={{ fontSize:14.5, color:'rgba(255,255,255,.7)', maxWidth:500, margin:'0 auto' }}>Expert tips, highlights and insider knowledge for every destination we fly to.</p>
      </div>
      <div className="container" style={{ padding:'36px 24px 56px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
          {GUIDES.map(g => (
            <div key={g.code} onClick={() => setSel(g.code)} style={{ borderRadius:8, overflow:'hidden', background:'#fff', border:'1px solid #EBEBEB', cursor:'pointer', transition:'all .3s' }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 16px 48px rgba(0,0,0,.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; }}>
              <div style={{ height:180, overflow:'hidden', position:'relative' }}>
                <img src={g.img} alt={g.city} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform .45s' }}
                  onMouseEnter={e => e.target.style.transform='scale(1.06)'}
                  onMouseLeave={e => e.target.style.transform='scale(1)'}/>
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,.4) 0%,transparent 55%)' }}/>
                <div style={{ position:'absolute', bottom:12, left:14, fontSize:18, fontWeight:700, color:'#fff', fontFamily:'Cormorant Garamond,serif' }}>{g.city}</div>
              </div>
              <div style={{ padding:'14px 16px' }}>
                <div style={{ display:'flex', gap:14, fontSize:12, color:'#888', marginBottom:10 }}>
                  <span>🌤 {g.season}</span>
                  <span>💰 {g.budget}</span>
                </div>
                <div style={{ fontSize:13, color:'#555', lineHeight:1.5 }}>{g.highlights.slice(0,3).join(' · ')}</div>
                <div style={{ marginTop:12, fontSize:13, color:'#C8102E', fontWeight:600 }}>Read guide →</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
