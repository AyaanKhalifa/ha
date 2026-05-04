// src/pages/Safety.jsx
import React from 'react';

const STATS = [{ n:'0', l:'Fatal incidents since founding' }, { n:'100%', l:'IOSA certified' }, { n:'A+', l:'IATA safety rating' }, { n:'#1', l:'Safety ranking Asia-Middle East' }];

const TOPICS = [
  { icon:'✈', title:'Flight safety',        body:'Our pilots undergo 600+ hours of training annually including full-flight simulator sessions. All flight crew are trained to the highest ICAO and EASA standards. We operate a Safety Management System (SMS) across all flight operations.' },
  { icon:'🔧', title:'Aircraft maintenance', body:'Every aircraft undergoes rigorous scheduled maintenance including A-checks (every 600 flight hours), B-checks (quarterly), C-checks (annually), and full D-checks (every 6 years). All maintenance is carried out by GCAA-licensed engineers.' },
  { icon:'🌪', title:'Weather protocols',    body:'Our meteorological team monitors weather conditions globally 24/7. Dispatch team coordinates with crews on routing and fuel planning. We operate with full ACAS/TCAS collision avoidance and enhanced weather radar on all aircraft.' },
  { icon:'👨‍✈', title:'Crew training',        body:'All cabin crew complete initial 8-week training before flying, including First Aid, CPR, AED use, Emergency Procedures, and Fire Fighting. Recurrent training is completed every 12 months including pool evacuations and smoke-filled environment drills.' },
  { icon:'🛡', title:'Security',             body:'We comply with all ICAO Annex 17 security standards. All hold baggage is screened with multi-view X-ray and CTI equipment. We participate in the DHS and EU advance passenger information programmes.' },
  { icon:'🏥', title:'Medical preparedness',  body:'Every flight carries a comprehensive medical kit including AED defibrillators, oxygen, and emergency medications. Our cabin crew are trained First Aiders and we maintain agreements with ground medical services at all airports we serve.' },
];

export default function Safety() {
  return (
    <div style={{ background:'#F8F7F4', minHeight:'100vh', fontFamily:'DM Sans,sans-serif' }}>
      <div style={{ background:'linear-gradient(135deg,#0D0D0D,#1A1A1A)', padding:'56px 24px', textAlign:'center' }}>
        <div style={{ fontSize:11, color:'rgba(255,255,255,.4)', letterSpacing:'4px', textTransform:'uppercase', marginBottom:12 }}>Our commitment</div>
        <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(2rem,4vw,3rem)', fontWeight:400, color:'#fff', marginBottom:12 }}>Safety first — always</h1>
        <p style={{ fontSize:14.5, color:'rgba(255,255,255,.65)', maxWidth:560, margin:'0 auto' }}>Safety is not a priority that competes with others — it is an absolute value that underpins every decision we make.</p>
        <div style={{ display:'flex', gap:32, justifyContent:'center', marginTop:36, flexWrap:'wrap' }}>
          {STATS.map(s => (
            <div key={s.l} style={{ textAlign:'center' }}>
              <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:40, fontWeight:600, color:'#fff', lineHeight:1 }}>{s.n}</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,.45)', textTransform:'uppercase', letterSpacing:1.5, marginTop:5 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="container" style={{ padding:'48px 24px 56px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:18 }}>
          {TOPICS.map(t => (
            <div key={t.title} style={{ background:'#fff', border:'1px solid #E0E0E0', borderRadius:8, padding:'22px 24px' }}>
              <div style={{ display:'flex', gap:14, marginBottom:12, alignItems:'flex-start' }}>
                <div style={{ width:44, height:44, borderRadius:10, background:'#F5F5F0', border:'1px solid #E0E0E0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>{t.icon}</div>
                <h3 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:20, fontWeight:500, color:'#0D0D0D', lineHeight:1.3, paddingTop:6 }}>{t.title}</h3>
              </div>
              <p style={{ fontSize:13.5, color:'#555', lineHeight:1.75 }}>{t.body}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop:36, background:'linear-gradient(135deg,#C8102E,#7a0018)', borderRadius:8, padding:'32px 36px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:20 }}>
          <div>
            <h3 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:24, fontWeight:400, color:'#fff', marginBottom:6 }}>Report a safety concern</h3>
            <p style={{ fontSize:13.5, color:'rgba(255,255,255,.75)' }}>We encourage all passengers and staff to report safety concerns. Your report is confidential and valuable.</p>
          </div>
          <a href="/contact" style={{ padding:'12px 26px', background:'#fff', color:'#C8102E', fontWeight:700, fontSize:14, borderRadius:4, whiteSpace:'nowrap' }}>Submit a report →</a>
        </div>
      </div>
    </div>
  );
}
