// src/pages/VisaInfo.jsx
import React, { useState } from 'react';

const VISA_DATA = {
  DXB: [
    { nationality:'India', visaRequired:true,  type:'Visa on Arrival',  duration:'30 days', fee:'AED 120', notes:'Available at Dubai airport for Indian passport holders' },
    { nationality:'USA',   visaRequired:false, type:'Visa Free',        duration:'90 days', fee:'Free',    notes:'No visa required' },
    { nationality:'UK',    visaRequired:false, type:'Visa Free',        duration:'30 days', fee:'Free',    notes:'No visa required' },
    { nationality:'EU',    visaRequired:false, type:'Visa Free',        duration:'90 days', fee:'Free',    notes:'No visa required' },
  ],
  LHR: [
    { nationality:'India', visaRequired:true,  type:'UK Standard Visa', duration:'6 months',fee:'£115',   notes:'Apply at VFS Global at least 3 weeks in advance' },
    { nationality:'USA',   visaRequired:false, type:'Visa Free',        duration:'6 months',fee:'Free',   notes:'ESTA not required for UK' },
    { nationality:'EU',    visaRequired:false, type:'Visa Free',        duration:'6 months',fee:'Free',   notes:'Post-Brexit rules apply' },
  ],
  JFK: [
    { nationality:'India', visaRequired:true,  type:'B1/B2 Tourist Visa',duration:'10 years',fee:'$185', notes:'Schedule interview at US Embassy/Consulate' },
    { nationality:'UK',    visaRequired:false, type:'ESTA Required',   duration:'90 days', fee:'$21',    notes:'ESTA approval required before travel' },
    { nationality:'EU',    visaRequired:false, type:'ESTA Required',   duration:'90 days', fee:'$21',    notes:'VWP countries — ESTA required' },
  ],
  SIN: [
    { nationality:'India', visaRequired:true,  type:'Singapore Visa',  duration:'30 days', fee:'SGD 30', notes:'Apply online via ICA website' },
    { nationality:'USA',   visaRequired:false, type:'Visa Free',        duration:'30 days', fee:'Free',   notes:'No visa required' },
    { nationality:'UK',    visaRequired:false, type:'Visa Free',        duration:'30 days', fee:'Free',   notes:'No visa required' },
  ],
};

const DESTINATIONS = [
  { code:'DXB', name:'Dubai, UAE' },
  { code:'LHR', name:'London, UK' },
  { code:'JFK', name:'New York, USA' },
  { code:'SIN', name:'Singapore' },
];

export default function VisaInfo() {
  const [dest, setDest] = useState('DXB');
  const [nat, setNat] = useState('India');

  const data = VISA_DATA[dest] || [];
  const filtered = nat ? data.filter(d => d.nationality === nat) : data;
  const allNats = [...new Set(data.map(d => d.nationality))];

  return (
    <div style={{ background:'#F8F7F4', minHeight:'100vh', fontFamily:'DM Sans,sans-serif' }}>
      <div style={{ background:'linear-gradient(135deg,#1A1A1A,#2d2d2d)', padding:'48px 24px', textAlign:'center' }}>
        <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(2rem,4vw,2.8rem)', fontWeight:400, color:'#fff', marginBottom:10 }}>Visa Information</h1>
        <p style={{ fontSize:14.5, color:'rgba(255,255,255,.7)', maxWidth:500, margin:'0 auto' }}>Check visa requirements for your destination. Information updated regularly but always verify with the official consulate.</p>
      </div>

      <div className="container" style={{ padding:'36px 24px 56px' }}>
        {/* Filters */}
        <div style={{ background:'#fff', border:'1px solid #E0E0E0', borderRadius:8, padding:'20px 24px', marginBottom:20, display:'flex', gap:20, flexWrap:'wrap', alignItems:'end' }}>
          <div style={{ flex:1, minWidth:180 }}>
            <label className="field-label">Destination</label>
            <select value={dest} onChange={e => setDest(e.target.value)} className="field-input" style={{ cursor:'pointer' }}>
              {DESTINATIONS.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
            </select>
          </div>
          <div style={{ flex:1, minWidth:160 }}>
            <label className="field-label">Your nationality</label>
            <select value={nat} onChange={e => setNat(e.target.value)} className="field-input" style={{ cursor:'pointer' }}>
              <option value="">All nationalities</option>
              {allNats.map(n => <option key={n}>{n}</option>)}
            </select>
          </div>
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div style={{ background:'#fff', border:'1px solid #E0E0E0', borderRadius:8, padding:'48px', textAlign:'center', color:'#AAA' }}>No visa data for this combination. Please check the official consulate website.</div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {filtered.map((v, i) => (
              <div key={i} style={{ background:'#fff', border:`2px solid ${v.visaRequired?'#FFCDD2':'#C8E6C9'}`, borderRadius:8, padding:'20px 24px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:14 }}>
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                      <span style={{ fontSize:22 }}>{v.visaRequired?'📋':'✅'}</span>
                      <span style={{ fontSize:18, fontWeight:700, color:'#1A1A1A' }}>{v.nationality} passport → {DESTINATIONS.find(d=>d.code===dest)?.name}</span>
                    </div>
                    <span style={{ display:'inline-block', padding:'4px 12px', borderRadius:100, fontSize:13, fontWeight:700, background:v.visaRequired?'#FFEBEE':'#E8F5E9', color:v.visaRequired?'#C8102E':'#2E7D32', marginBottom:10 }}>
                      {v.type}
                    </span>
                    <div style={{ fontSize:13.5, color:'#555', lineHeight:1.7 }}>{v.notes}</div>
                  </div>
                  <div style={{ display:'flex', gap:16, flexShrink:0 }}>
                    <div style={{ textAlign:'center', padding:'12px 18px', background:'#F8F7F4', borderRadius:6, border:'1px solid #EBEBEB' }}>
                      <div style={{ fontSize:10.5, color:'#AAA', textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>Duration</div>
                      <div style={{ fontSize:15, fontWeight:700, color:'#1A1A1A' }}>{v.duration}</div>
                    </div>
                    <div style={{ textAlign:'center', padding:'12px 18px', background:'#F8F7F4', borderRadius:6, border:'1px solid #EBEBEB' }}>
                      <div style={{ fontSize:10.5, color:'#AAA', textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>Fee</div>
                      <div style={{ fontSize:15, fontWeight:700, color:'#C8102E' }}>{v.fee}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop:22, padding:'16px 20px', background:'#FFF8E1', border:'1px solid #FFE082', borderRadius:8, fontSize:13, color:'#E65100' }}>
          ⚠ <strong>Disclaimer:</strong> Visa information is provided for guidance only. Always verify current requirements with the official embassy or consulate before travelling. Requirements can change without notice.
        </div>
      </div>
    </div>
  );
}
