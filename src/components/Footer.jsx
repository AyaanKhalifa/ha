// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const COLS = {
  'Plan & Book':  [['/book','Flights'],['/hotels','Hotels'],['/manage','Manage booking'],['/check-in','Check in'],['/flight-status','Flight status'],['/baggage','Baggage info']],
  'Experience':   [['/experience','Economy'],['/experience','Premium Economy'],['/experience','Business Class'],['/experience','First Class'],['/experience','Dining'],['/special-needs','Special assistance']],
  'Destinations': [['/destinations','India'],['/destinations','Middle East'],['/destinations','Europe'],['/destinations','Americas'],['/travel-guide','Travel guides'],['/visa-info','Visa information']],
  'Loyalty':      [['/loyalty','Skywards overview'],['/loyalty','Earn miles'],['/loyalty','Redeem miles'],['/loyalty','Tier benefits'],['/loyalty','Partner earn'],['/register','Join free']],
  'Company':      [['/about','About us'],['/careers','Careers'],['/press','Media & press'],['/safety','Safety'],['/contact','Contact us'],['/contact','Help & FAQs']],
};

export default function Footer() {
  return (
    <footer style={{ background:'#0A0A0A', color:'rgba(255,255,255,.5)', fontFamily:'DM Sans,sans-serif', marginTop:'auto' }}>
      <div style={{ borderBottom:'1px solid rgba(255,255,255,.06)', padding:'10px 0' }}>
        <div className="container" style={{ display:'flex', justifyContent:'center', gap:28, flexWrap:'wrap' }}>
          {["🏆 World's Best Airline 2025","⭐ 5-Star Skytrax","🥇 Best Business Class","✈ IATA Certified","🌍 150+ Destinations","🛡 Perfect Safety Record"].map(a=>(
            <span key={a} style={{ fontSize:11.5, color:'rgba(255,255,255,.28)' }}>{a}</span>
          ))}
        </div>
      </div>
      <div className="container" style={{ padding:'44px 24px 28px', display:'grid', gridTemplateColumns:'1.3fr repeat(5,1fr)', gap:22 }}>
        <div>
          <Link to="/" style={{ display:'flex', alignItems:'center', gap:9, marginBottom:14 }}>
            <div style={{ width:36, height:36, borderRadius:'50%', background:'#C8102E', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Cormorant Garamond,serif', fontWeight:700, fontSize:11, color:'#fff' }}>HA</div>
            <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:17, fontWeight:600, color:'#fff' }}>Habibi Airways</div>
          </Link>
          <p style={{ fontSize:12.5, color:'rgba(255,255,255,.35)', lineHeight:1.75, marginBottom:18 }}>Connecting the world with award‑winning service since 2009. 150+ destinations across six continents.</p>
          <div style={{ display:'flex', gap:7 }}>
            {['f','𝕏','in','▶','📷'].map(s=>(
              <a key={s} href="#" style={{ width:30, height:30, borderRadius:'50%', background:'rgba(255,255,255,.07)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, color:'rgba(255,255,255,.4)', transition:'all .2s' }}
                onMouseEnter={e=>{e.currentTarget.style.background='#C8102E';e.currentTarget.style.color='#fff';}}
                onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,.07)';e.currentTarget.style.color='rgba(255,255,255,.4)';}}>
                {s}
              </a>
            ))}
          </div>
        </div>
        {Object.entries(COLS).map(([title,links])=>(
          <div key={title}>
            <h4 style={{ fontSize:10.5, fontWeight:700, textTransform:'uppercase', letterSpacing:'1.6px', color:'rgba(255,255,255,.75)', marginBottom:14 }}>{title}</h4>
            <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:9 }}>
              {links.map(([path,label])=>(
                <li key={label}><Link to={path} style={{ fontSize:12.5, color:'rgba(255,255,255,.38)', transition:'color .15s' }} onMouseEnter={e=>e.currentTarget.style.color='#fff'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,.38)'}>{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div style={{ borderTop:'1px solid rgba(255,255,255,.07)', padding:'13px 0' }}>
        <div className="container" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
          <div style={{ fontSize:11.5, color:'rgba(255,255,255,.22)' }}>© 2025 Habibi Airways · IATA: HA · ICAO: HAB · Dubai, UAE</div>
          <div style={{ display:'flex', gap:16 }}>
            {['Privacy','Terms','Cookies','Accessibility'].map(l=>(
              <Link key={l} to="/contact" style={{ fontSize:11.5, color:'rgba(255,255,255,.28)', transition:'color .15s' }} onMouseEnter={e=>e.currentTarget.style.color='#fff'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,.28)'}>{l}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
