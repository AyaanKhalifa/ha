// src/pages/Press.jsx
import React from 'react';

const NEWS = [
  { date:'2025-03-20', title:'Habibi Airways wins World\'s Best Airline 2025 at Skytrax Awards', category:'Award', excerpt:'For the 15th consecutive year, Habibi Airways has been recognised as the World\'s Best Airline at the prestigious Skytrax World Airline Awards in London.' },
  { date:'2025-03-10', title:'Habibi Airways launches new direct route to Bali from Mumbai', category:'Route Launch', excerpt:'Starting 1 June 2025, Habibi Airways will operate daily non-stop flights between Mumbai (BOM) and Denpasar, Bali (DPS) using an Airbus A350-900.' },
  { date:'2025-02-28', title:'Skywards loyalty programme reaches 10 million members milestone', category:'Milestone', excerpt:'Habibi Airways\' Skywards frequent flyer programme today celebrated reaching 10 million members worldwide, marking a major milestone since its launch in 2012.' },
  { date:'2025-02-15', title:'New First Class Suite unveiled — private showers and a butler service', category:'Product', excerpt:'Habibi Airways unveiled its revolutionary new First Class Suite aboard its latest Airbus A380, featuring private sliding doors, a full-flat bed and an en-suite shower.' },
  { date:'2025-01-30', title:'Habibi Airways orders 50 new Boeing 787-10 Dreamliners', category:'Fleet', excerpt:'In one of the largest fleet orders in airline history, Habibi Airways has placed a firm order for 50 Boeing 787-10 Dreamliner aircraft worth $14 billion.' },
  { date:'2025-01-10', title:'Record passenger numbers: 42 million in 2024', category:'Results', excerpt:'Habibi Airways carried 42 million passengers in 2024, a 12% increase over the previous year, with load factors averaging 84% across the network.' },
];

const CATCOL = { Award:'#6A1B9A', 'Route Launch':'#2E7D32', Milestone:'#1565C0', Product:'#C8102E', Fleet:'#F57F17', Results:'#607D8B' };

export default function Press() {
  return (
    <div style={{ background:'#F8F7F4', minHeight:'100vh', fontFamily:'DM Sans,sans-serif' }}>
      <div style={{ background:'#0D0D0D', padding:'48px 24px', textAlign:'center' }}>
        <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(2rem,4vw,2.8rem)', fontWeight:400, color:'#fff', marginBottom:10 }}>Media & Press Room</h1>
        <p style={{ fontSize:14.5, color:'rgba(255,255,255,.65)', maxWidth:500, margin:'0 auto' }}>Latest news, announcements, media kits and press contacts from Habibi Airways.</p>
      </div>

      <div className="container" style={{ padding:'36px 24px 56px', display:'grid', gridTemplateColumns:'1fr 280px', gap:24 }}>
        <div>
          <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:24, fontWeight:500, color:'#0D0D0D', marginBottom:20 }}>Latest news</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {NEWS.map(n => (
              <div key={n.title} style={{ background:'#fff', border:'1px solid #E0E0E0', borderRadius:8, padding:'18px 22px', transition:'box-shadow .2s', cursor:'pointer' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow='0 4px 20px rgba(0,0,0,.08)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow='none'}>
                <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:8 }}>
                  <span style={{ padding:'3px 10px', borderRadius:100, fontSize:11, fontWeight:700, background:CATCOL[n.category]+'18', color:CATCOL[n.category] }}>{n.category}</span>
                  <span style={{ fontSize:12, color:'#AAA' }}>{new Date(n.date).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</span>
                </div>
                <h3 style={{ fontSize:16, fontWeight:700, color:'#0D0D0D', marginBottom:8, lineHeight:1.4 }}>{n.title}</h3>
                <p style={{ fontSize:13.5, color:'#666', lineHeight:1.65 }}>{n.excerpt}</p>
                <span style={{ display:'block', marginTop:10, fontSize:13, color:'#C8102E', fontWeight:600 }}>Read full release →</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          {[
            { title:'Press contacts', items:[['Media enquiries','media@habibiairways.com'],['Crisis comms','+971 4 555 5501'],['Regional (India)','+91 22 6655 4400']] },
            { title:'Resources', items:[['Brand guidelines','Download PDF'],['Logo assets','Download ZIP'],['Fact sheet 2025','Download PDF'],['Annual report 2024','Download PDF']] },
          ].map(sec => (
            <div key={sec.title} style={{ background:'#fff', border:'1px solid #E0E0E0', borderRadius:8, padding:'18px', marginBottom:14 }}>
              <h4 style={{ fontSize:14, fontWeight:700, color:'#1A1A1A', marginBottom:12 }}>{sec.title}</h4>
              {sec.items.map(([k,v]) => (
                <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #F5F5F5', fontSize:13 }}>
                  <span style={{ color:'#555' }}>{k}</span>
                  <a href="#" onClick={e=>e.preventDefault()} style={{ color:'#C8102E', fontWeight:600 }}>{v}</a>
                </div>
              ))}
            </div>
          ))}
          <div style={{ background:'#E3F2FD', border:'1px solid #BBDEFB', borderRadius:8, padding:'16px', fontSize:13, color:'#1565C0' }}>
            📸 For high-resolution images of our fleet, cabins and destinations, contact our media team at media@habibiairways.com
          </div>
        </div>
      </div>
    </div>
  );
}
