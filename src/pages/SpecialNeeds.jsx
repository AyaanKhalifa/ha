// src/pages/SpecialNeeds.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const SERVICES = [
  { icon:'♿', title:'Wheelchair assistance',   desc:'Complimentary wheelchair service throughout the airport. Available for boarding, deplaning, and connecting flights. Request at least 48 hours before departure.', code:'WCHR' },
  { icon:'👁', title:'Visually impaired',       desc:'Priority boarding, sighted guide service, Braille menus available on request, assistance with safety briefing. Guide dogs accepted in cabin.', code:'BLND' },
  { icon:'👂', title:'Hearing impaired',        desc:'Visual safety demonstrations, written communication available, hearing loop facilities at select airports. Pre-notification required.', code:'DEAF' },
  { icon:'🧠', title:'Cognitive disabilities',  desc:'Dedicated assistance staff, quiet boarding option, sensory kits available. Please contact us in advance to discuss your specific needs.', code:'COGS' },
  { icon:'🍼', title:'Travelling with infants', desc:'Bassinets available on request, priority boarding with infants, baby food, nappy-changing facilities onboard. Infant fare 10% of adult fare.', code:'INFT' },
  { icon:'👵', title:'Elderly passengers',      desc:'Priority boarding and disembarkation, dedicated assistance staff, extra time allocation for boarding process. Complimentary wheelchair available.', code:'MEDA' },
  { icon:'🤰', title:'Pregnant passengers',     desc:'Up to 28 weeks: no restrictions. 28–36 weeks: medical certificate required. After 36 weeks: not permitted to fly. Please inform us when booking.', code:'PREG' },
  { icon:'💊', title:'Medical conditions',       desc:'Notify us at booking for conditions requiring medical clearance. Our medical team reviews each case. Equipment (CPAP, oxygen) may be carried.', code:'MEDA' },
];

export default function SpecialNeeds() {
  const [form, setForm] = useState({ name:'', email:'', phone:'', pnr:'', assistance:'', details:'', submitted:false });

  const handleSubmit = e => {
    e.preventDefault();
    setForm(f => ({ ...f, submitted:true }));
  };

  return (
    <div style={{ background:'#F8F7F4', minHeight:'100vh', fontFamily:'DM Sans,sans-serif' }}>
      <div style={{ background:'linear-gradient(135deg,#1565C0,#0D47A1)', padding:'48px 24px', textAlign:'center' }}>
        <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(2rem,4vw,2.8rem)', fontWeight:400, color:'#fff', marginBottom:10 }}>Special Assistance</h1>
        <p style={{ fontSize:14.5, color:'rgba(255,255,255,.8)', maxWidth:560, margin:'0 auto' }}>We are committed to making air travel accessible and comfortable for all passengers. Our dedicated team is ready to support your journey.</p>
      </div>

      <div className="container" style={{ padding:'36px 24px 56px', display:'grid', gridTemplateColumns:'1fr 360px', gap:28 }}>
        <div>
          <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:26, fontWeight:400, color:'#0D0D0D', marginBottom:22 }}>Our services</h2>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:28 }}>
            {SERVICES.map(s => (
              <div key={s.code} style={{ background:'#fff', border:'1px solid #E0E0E0', borderRadius:8, padding:'18px 20px', transition:'box-shadow .2s' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow='0 4px 20px rgba(0,0,0,.08)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow='none'}>
                <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:8 }}>
                  <span style={{ fontSize:22 }}>{s.icon}</span>
                  <div style={{ fontSize:14.5, fontWeight:700, color:'#1A1A1A' }}>{s.title}</div>
                </div>
                <p style={{ fontSize:13, color:'#666', lineHeight:1.65, marginBottom:8 }}>{s.desc}</p>
                <span style={{ fontSize:11, color:'#1565C0', fontWeight:700, background:'#E3F2FD', padding:'2px 8px', borderRadius:100 }}>Code: {s.code}</span>
              </div>
            ))}
          </div>

          <div style={{ background:'#E8F5E9', border:'1px solid #C8E6C9', borderRadius:8, padding:'16px 20px', fontSize:13.5, color:'#2E7D32', lineHeight:1.7 }}>
            ✅ <strong>How to request assistance:</strong> You can request special assistance when booking online, by calling our helpline on <strong>+971 600 555 555</strong>, or by emailing <strong>special.needs@habibiairways.com</strong>. Please request at least 48 hours before departure.
          </div>
        </div>

        {/* Request form */}
        <div style={{ position:'sticky', top:90 }}>
          <div style={{ background:'#fff', border:'1px solid #E0E0E0', borderRadius:8, padding:'22px' }}>
            {form.submitted ? (
              <div style={{ textAlign:'center', padding:'24px 0' }}>
                <div style={{ fontSize:48, marginBottom:14 }}>✅</div>
                <h3 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:22, fontWeight:500, marginBottom:8 }}>Request received</h3>
                <p style={{ fontSize:13.5, color:'#666', lineHeight:1.65, marginBottom:16 }}>Our special assistance team will contact you within 24 hours to confirm your arrangements.</p>
                <button onClick={() => setForm(f => ({...f,submitted:false}))} className="btn-outline" style={{ fontSize:13 }}>Submit another request</button>
              </div>
            ) : (
              <>
                <h3 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:20, fontWeight:500, marginBottom:16, color:'#0D0D0D' }}>Request assistance</h3>
                <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:13 }}>
                  {[['Name','name','text'],['Email','email','email'],['Phone','phone','tel'],['Booking PNR','pnr','text']].map(([lbl,key,type]) => (
                    <div key={key}>
                      <label className="field-label">{lbl}</label>
                      <input type={type} value={form[key]} onChange={e => setForm(f=>({...f,[key]:e.target.value}))} className="field-input" placeholder={lbl} />
                    </div>
                  ))}
                  <div>
                    <label className="field-label">Type of assistance</label>
                    <select value={form.assistance} onChange={e => setForm(f=>({...f,assistance:e.target.value}))} className="field-input" style={{ cursor:'pointer' }}>
                      <option value="">Select type…</option>
                      {SERVICES.map(s => <option key={s.code} value={s.code}>{s.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="field-label">Additional details</label>
                    <textarea value={form.details} onChange={e => setForm(f=>({...f,details:e.target.value}))} rows={3} className="field-input" placeholder="Please describe your specific needs…" style={{ resize:'vertical' }}/>
                  </div>
                  <button type="submit" className="btn-red" style={{ justifyContent:'center', padding:'12px' }}>Submit request</button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
