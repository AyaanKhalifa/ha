// src/pages/Baggage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const CABIN_ALLOWANCES = [
  { cabin:'Economy',         checked:'25 kg', cabin_bag:'7 kg',  extra:'5/10/20/32 kg available', seat:'17-18"', personal:'Handbag/laptop bag' },
  { cabin:'Premium Economy', checked:'35 kg', cabin_bag:'10 kg', extra:'5/10/20/32 kg available', seat:'19"',    personal:'Handbag/laptop bag' },
  { cabin:'Business',        checked:'40 kg', cabin_bag:'12 kg', extra:'10/20/32 kg available',   seat:'23"',    personal:'Handbag/laptop bag' },
  { cabin:'First',           checked:'Unlimited', cabin_bag:'Unlimited', extra:'N/A',              seat:'34"',    personal:'Any personal item'  },
];

const EXTRA_BAGS = [
  { weight:'+5 kg',  price:'₹3,800',  desc:'Total 30 kg' },
  { weight:'+10 kg', price:'₹5,600',  desc:'Total 35 kg' },
  { weight:'+20 kg', price:'₹9,200',  desc:'Total 45 kg' },
  { weight:'+32 kg', price:'₹14,500', desc:'Total 57 kg' },
];

const RESTRICTED = [
  { item:'Lithium batteries (>100Wh)', where:'Checked & cabin — restricted quantity' },
  { item:'Aerosols, liquids >100ml',   where:'Checked baggage only' },
  { item:'Sharp objects (knives)',      where:'Checked baggage only' },
  { item:'Flammable liquids',          where:'Both — prohibited on board' },
  { item:'Firearms/weapons',           where:'Checked only with declaration' },
  { item:'Fresh fruit & vegetables',   where:'Check destination country rules' },
];

export default function Baggage() {
  const [active, setActive] = useState('Economy');

  const sel = CABIN_ALLOWANCES.find(c => c.cabin === active) || CABIN_ALLOWANCES[0];

  const Sec = ({ title, children }) => (
    <div style={{ background:'#fff', border:'1px solid #E0E0E0', borderRadius:8, padding:'22px 24px', marginBottom:18 }}>
      <h3 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:20, fontWeight:500, color:'#0D0D0D', marginBottom:14 }}>{title}</h3>
      {children}
    </div>
  );

  return (
    <div style={{ background:'#F8F7F4', minHeight:'100vh', fontFamily:'DM Sans,sans-serif' }}>
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#C8102E,#7a0018)', padding:'48px 24px', textAlign:'center' }}>
        <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(2rem,4vw,2.8rem)', fontWeight:400, color:'#fff', marginBottom:10 }}>Baggage Information</h1>
        <p style={{ fontSize:14.5, color:'rgba(255,255,255,.75)', maxWidth:500, margin:'0 auto' }}>Everything you need to know about your baggage allowance, fees, and restrictions.</p>
      </div>

      <div className="container" style={{ padding:'36px 24px 56px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:24, alignItems:'start' }}>
          <div>
            {/* Cabin selector */}
            <Sec title="Baggage allowance by cabin">
              <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
                {CABIN_ALLOWANCES.map(c => (
                  <button key={c.cabin} onClick={() => setActive(c.cabin)}
                    style={{ padding:'8px 18px', border:`1.5px solid ${active===c.cabin?'#C8102E':'#E0E0E0'}`, borderRadius:100, background:active===c.cabin?'#FFF0F0':'#fff', color:active===c.cabin?'#C8102E':'#555', fontWeight:active===c.cabin?700:400, fontSize:13.5, cursor:'pointer', fontFamily:'DM Sans,sans-serif', transition:'all .15s' }}>
                    {c.cabin}
                  </button>
                ))}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                {[['✈ Checked baggage',sel.checked],['💼 Cabin bag',sel.cabin_bag],['👜 Personal item',sel.personal],['📐 Seat width',sel.seat]].map(([lbl,val]) => (
                  <div key={lbl} style={{ padding:'16px', background:'#F8F7F4', borderRadius:6, border:'1px solid #EBEBEB' }}>
                    <div style={{ fontSize:11, color:'#AAA', textTransform:'uppercase', letterSpacing:1, marginBottom:5 }}>{lbl}</div>
                    <div style={{ fontSize:16, fontWeight:700, color:'#0D0D0D' }}>{val}</div>
                  </div>
                ))}
              </div>
              {sel.extra !== 'N/A' && (
                <div style={{ marginTop:14, padding:'12px 16px', background:'#E3F2FD', border:'1px solid #BBDEFB', borderRadius:5, fontSize:13, color:'#1565C0' }}>
                  💡 Extra baggage available: {sel.extra}
                </div>
              )}
            </Sec>

            {/* Extra baggage */}
            <Sec title="Purchase additional baggage">
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
                {EXTRA_BAGS.map(b => (
                  <div key={b.weight} style={{ border:'1.5px solid #E0E0E0', borderRadius:6, padding:'14px', textAlign:'center', cursor:'pointer', transition:'all .15s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor='#C8102E'; e.currentTarget.style.background='#FFF5F5'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor='#E0E0E0'; e.currentTarget.style.background='#fff'; }}>
                    <div style={{ fontSize:17, fontWeight:800, color:'#C8102E', marginBottom:4 }}>{b.weight}</div>
                    <div style={{ fontSize:11, color:'#AAA', marginBottom:8 }}>{b.desc}</div>
                    <div style={{ fontSize:14.5, fontWeight:700, color:'#1A1A1A' }}>{b.price}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:16 }}>
                <Link to="/book" className="btn-red" style={{ fontSize:13.5 }}>Add baggage when booking →</Link>
              </div>
            </Sec>

            {/* Restricted items */}
            <Sec title="Restricted & prohibited items">
              <table className="data-table">
                <thead><tr><th>Item</th><th>Restriction</th></tr></thead>
                <tbody>
                  {RESTRICTED.map(r => (
                    <tr key={r.item}><td style={{ fontWeight:600 }}>{r.item}</td><td style={{ color:'#555' }}>{r.where}</td></tr>
                  ))}
                </tbody>
              </table>
            </Sec>

            {/* Liquids rule */}
            <Sec title="Liquids rule (cabin baggage)">
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14 }}>
                {[['💧 100ml max','Each container must not exceed 100ml'],['🛍 1 litre bag','All liquids in a single resealable transparent bag'],['✅ At security','Bag must be presented separately at security check']].map(([t,d]) => (
                  <div key={t} style={{ padding:'14px', background:'#F8F7F4', borderRadius:6, border:'1px solid #EBEBEB' }}>
                    <div style={{ fontSize:14, fontWeight:700, marginBottom:5 }}>{t}</div>
                    <div style={{ fontSize:12.5, color:'#777', lineHeight:1.6 }}>{d}</div>
                  </div>
                ))}
              </div>
            </Sec>
          </div>

          {/* Sidebar */}
          <div style={{ position:'sticky', top:90 }}>
            <div style={{ background:'#fff', border:'1px solid #E0E0E0', borderRadius:8, padding:'20px', marginBottom:14 }}>
              <h4 style={{ fontSize:15, fontWeight:700, marginBottom:14, color:'#1A1A1A' }}>Quick links</h4>
              {[['✈ Book a flight','/book'],['🛂 Online check-in','/check-in'],['📋 Manage booking','/manage'],['📞 Contact us','/contact']].map(([lbl,path]) => (
                <Link key={lbl} to={path} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 0', borderBottom:'1px solid #F5F5F5', fontSize:13.5, color:'#C8102E', fontWeight:600, transition:'color .15s' }}
                  onMouseEnter={e => e.currentTarget.style.color='#9e0b22'}
                  onMouseLeave={e => e.currentTarget.style.color='#C8102E'}>{lbl}</Link>
              ))}
            </div>
            <div style={{ background:'#E3F2FD', border:'1px solid #BBDEFB', borderRadius:8, padding:'18px' }}>
              <div style={{ fontSize:13.5, fontWeight:700, color:'#1565C0', marginBottom:8 }}>ℹ Oversize baggage</div>
              <div style={{ fontSize:12.5, color:'#555', lineHeight:1.65 }}>Items over 32kg or 158cm (L+W+H) must be sent as cargo. Contact our cargo team for assistance.</div>
              <a href="/contact" style={{ display:'block', marginTop:12, fontSize:13, color:'#1565C0', fontWeight:600 }}>Contact cargo team →</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
