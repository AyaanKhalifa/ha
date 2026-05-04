// src/pages/About.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const MILESTONES = [
  { year:'2009', event:'Habibi Airways founded, first flight BOM→DXB' },
  { year:'2010', event:'Expanded to 25 destinations across Gulf & South Asia' },
  { year:'2011', event:'Launched long-haul routes to Europe and Americas' },
  { year:'2012', event:'Skywards loyalty programme launched — 1M members in year 1' },
  { year:'2014', event:'Received first 5-Star Skytrax rating' },
  { year:'2016', event:'Fleet reached 100 aircraft, 80 destinations' },
  { year:'2018', event:'New First Class Suite unveiled — industry benchmark' },
  { year:'2020', event:'Navigated COVID-19, maintained safety & operations' },
  { year:'2022', event:'Resumed full network, record passenger satisfaction scores' },
  { year:'2024', event:'150 destinations, 250+ fleet, 42M passengers' },
];

const LEADERSHIP = [
  { name:'Sheikh Hamdan Al Maktoum', role:'Chairman',              img:'👔' },
  { name:'Sir Tim Clark',            role:'President',             img:'🤝' },
  { name:'Adel Al Redha',            role:'Chief Operating Officer',img:'✈' },
  { name:'Patrick Brannelly',        role:'VP Customer Experience', img:'💎' },
];

export default function About() {
  return (
    <div style={{ background:'#fff', fontFamily:'DM Sans,sans-serif', minHeight:'100vh' }}>
      {/* Hero */}
      <div style={{ position:'relative', height:420, overflow:'hidden' }}>
        <img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1400&h=500&fit=crop" alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
        <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.55)' }}/>
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', textAlign:'center', padding:'0 24px' }}>
          <div style={{ fontSize:11, color:'rgba(255,255,255,.5)', letterSpacing:'4px', textTransform:'uppercase', marginBottom:12 }}>Est. 2009 · Dubai, UAE</div>
          <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(2.4rem,5vw,4rem)', fontWeight:400, color:'#fff', marginBottom:12 }}>About Habibi Airways</h1>
          <p style={{ fontSize:15, color:'rgba(255,255,255,.8)', maxWidth:560 }}>Connecting the world with warmth, excellence and award-winning service since 2009.</p>
        </div>
      </div>

      <div className="container" style={{ padding:'60px 24px' }}>
        {/* Mission */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:52, alignItems:'center', marginBottom:72 }}>
          <div>
            <div style={{ width:40, height:3, background:'#C8102E', borderRadius:2, marginBottom:16 }}/>
            <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:32, fontWeight:400, color:'#0D0D0D', marginBottom:16 }}>Our mission</h2>
            <p style={{ fontSize:15, color:'#555', lineHeight:1.8, marginBottom:14 }}>To connect people across the globe through exceptional travel experiences, treating every passenger as a guest in our home — with the warmth and hospitality that defines Habibi.</p>
            <p style={{ fontSize:15, color:'#555', lineHeight:1.8 }}>From our hub in Dubai, we serve 150+ destinations across six continents, carrying over 42 million passengers each year aboard our world-class fleet.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            {[['150+','Destinations'],['250+','Aircraft'],['42M','Passengers/year'],['15','5-Star awards']].map(([n,l]) => (
              <div key={l} style={{ background:'#F8F7F4', borderRadius:8, padding:'22px', textAlign:'center', border:'1px solid #EBEBEB' }}>
                <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:42, fontWeight:600, color:'#C8102E', lineHeight:1 }}>{n}</div>
                <div style={{ fontSize:12, color:'#888', textTransform:'uppercase', letterSpacing:1.5, marginTop:6 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:30, fontWeight:400, color:'#0D0D0D', marginBottom:32, textAlign:'center' }}>Our journey</h2>
        <div style={{ position:'relative', marginBottom:72 }}>
          <div style={{ position:'absolute', left:'50%', top:0, bottom:0, width:2, background:'#EBEBEB', transform:'translateX(-50%)' }}/>
          {MILESTONES.map((m, i) => (
            <div key={m.year} style={{ display:'flex', justifyContent:i%2===0?'flex-end':'flex-start', marginBottom:28, paddingRight:i%2===0?'calc(50% + 24px)':0, paddingLeft:i%2!==0?'calc(50% + 24px)':0, position:'relative' }}>
              <div style={{ background:'#fff', border:'1px solid #E0E0E0', borderRadius:8, padding:'14px 18px', maxWidth:320, boxShadow:'0 2px 8px rgba(0,0,0,.06)' }}>
                <div style={{ fontSize:13, fontWeight:800, color:'#C8102E', marginBottom:4 }}>{m.year}</div>
                <div style={{ fontSize:13.5, color:'#555', lineHeight:1.6 }}>{m.event}</div>
              </div>
              <div style={{ position:'absolute', left:'50%', top:16, width:12, height:12, borderRadius:'50%', background:'#C8102E', transform:'translateX(-50%)', border:'3px solid #fff', boxShadow:'0 0 0 2px #C8102E' }}/>
            </div>
          ))}
        </div>

        {/* Leadership */}
        <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:30, fontWeight:400, color:'#0D0D0D', marginBottom:28, textAlign:'center' }}>Leadership team</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:18, marginBottom:56 }}>
          {LEADERSHIP.map(l => (
            <div key={l.name} style={{ background:'#F8F7F4', borderRadius:8, padding:'24px', textAlign:'center', border:'1px solid #EBEBEB' }}>
              <div style={{ width:64, height:64, borderRadius:'50%', background:'linear-gradient(135deg,#C8102E,#8b0000)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, margin:'0 auto 14px' }}>{l.img}</div>
              <div style={{ fontSize:14.5, fontWeight:700, color:'#1A1A1A', marginBottom:4 }}>{l.name}</div>
              <div style={{ fontSize:12.5, color:'#888' }}>{l.role}</div>
            </div>
          ))}
        </div>

        {/* Values */}
        <div style={{ background:'linear-gradient(135deg,#0D0D0D,#1A1A1A)', borderRadius:10, padding:'44px 40px', textAlign:'center' }}>
          <h3 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:28, fontWeight:400, color:'#fff', marginBottom:28 }}>Our values</h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:24 }}>
            {[['🌍','Global',     'Connecting communities worldwide'],['💎','Excellence',  'Uncompromising quality in everything'],['🤝','Warmth',    'Habibi hospitality in every interaction'],['🛡','Safety',    'Safety is our absolute priority']].map(([ic,t,d]) => (
              <div key={t}>
                <div style={{ fontSize:32, marginBottom:10 }}>{ic}</div>
                <div style={{ fontSize:14, fontWeight:700, color:'#fff', marginBottom:6 }}>{t}</div>
                <div style={{ fontSize:12.5, color:'rgba(255,255,255,.55)', lineHeight:1.65 }}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
