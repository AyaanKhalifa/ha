// src/pages/Contact.jsx
import React, { useState, useEffect } from 'react';
import { fadeUp } from '../utils/anime';
import toast from '../utils/toast';

const FAQS = [
  ['Can I change my flight?', 'Yes, changes are allowed subject to your fare conditions. Flex and Flex+ fares allow free changes.'],
  ['How do I earn Skywards miles?', 'You earn miles on every Habibi Airways flight. Simply log in when booking — miles are credited within 24h.'],
  ['What is the baggage allowance?', 'Economy: 25 kg. Premium Economy: 35 kg. Business: 40 kg. First: Unlimited checked + 12 kg cabin.'],
  ['How early should I arrive?', 'We recommend 3 hours for international flights and 2 hours for domestic.'],
  ['Can I travel with an infant?', 'Infants under 2 years travel on a discounted fare with a lap seat. One infant per adult.'],
];

export default function Contact() {
  const [form, setForm] = useState({ name:'', email:'', subject:'', message:'' });
  const [openFaq, setOpenFaq] = useState(null);
  useEffect(() => { fadeUp('.contact-left,.contact-right', 100); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Message sent! We\'ll reply within 24 hours');
    setForm({ name:'', email:'', subject:'', message:'' });
  };

  return (
    <div style={{ background:'#F5F5F0', minHeight:'100vh', fontFamily:'DM Sans,sans-serif' }}>
      <div style={{ background:'#C8102E', padding:'32px 24px', textAlign:'center' }}>
        <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:30, fontWeight:400, color:'#fff', marginBottom:6 }}>Contact & Help</h1>
        <p style={{ fontSize:14, color:'rgba(255,255,255,.75)' }}>We're here for you — 24 hours, 7 days a week</p>
      </div>

      <div style={{ maxWidth:1280, margin:'0 auto', padding:'36px 24px 56px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:28, alignItems:'start' }}>

        {/* Left: contact channels + FAQ */}
        <div className="contact-left" style={{ opacity:0 }}>
          <div style={{ background:'#fff', border:'1px solid #E0E0E0', borderRadius:6, padding:'22px', marginBottom:18 }}>
            <h3 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:20, fontWeight:500, color:'#1A1A1A', marginBottom:18 }}>Get in touch</h3>
            {[
              { ic:'📞', t:'24/7 Helpline', v:'+971 600 555 555', c:'#C8102E' },
              { ic:'✉', t:'Email support', v:'support@habibiairways.com', c:'#C8102E' },
              { ic:'💬', t:'Live chat', v:'Available on all pages', c:'#2E7D32' },
              { ic:'📱', t:'WhatsApp', v:'+971 50 555 5555', c:'#25D366' },
            ].map(item => (
              <div key={item.t} style={{ display:'flex', gap:14, padding:'12px 0', borderBottom:'1px solid #F5F5F5' }}>
                <span style={{ fontSize:20, flexShrink:0, marginTop:1 }}>{item.ic}</span>
                <div><div style={{ fontSize:13, fontWeight:700, color:'#1A1A1A' }}>{item.t}</div><div style={{ fontSize:13.5, color:item.c, fontWeight:600, marginTop:2 }}>{item.v}</div></div>
              </div>
            ))}
          </div>

          <div style={{ background:'#fff', border:'1px solid #E0E0E0', borderRadius:6, padding:'22px' }}>
            <h3 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:20, fontWeight:500, color:'#1A1A1A', marginBottom:16 }}>Frequently asked questions</h3>
            {FAQS.map(([q,a],i) => (
              <div key={i} style={{ borderBottom:'1px solid #F5F5F5' }}>
                <button onClick={() => setOpenFaq(openFaq===i?null:i)} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', width:'100%', padding:'13px 0', background:'none', border:'none', cursor:'pointer', textAlign:'left', fontFamily:'DM Sans,sans-serif', fontSize:13.5, fontWeight:600, color:'#1A1A1A' }}>
                  {q} <span style={{ fontSize:14, color:'#C8102E', flexShrink:0, marginLeft:8, transition:'transform .2s', display:'inline-block', transform: openFaq===i?'rotate(180deg)':'rotate(0)' }}>▾</span>
                </button>
                {openFaq===i && <div style={{ fontSize:13.5, color:'#555', paddingBottom:13, lineHeight:1.65 }}>{a}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Right: form */}
        <div className="contact-right" style={{ opacity:0 }}>
          <div style={{ background:'#fff', border:'1px solid #E0E0E0', borderRadius:6, padding:'28px' }}>
            <h3 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:20, fontWeight:500, color:'#1A1A1A', marginBottom:4 }}>Send a message</h3>
            <p style={{ fontSize:13.5, color:'#888', marginBottom:22 }}>We typically respond within 2–4 hours</p>
            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:15 }}>
              {[['Full name','name','text','Your name'],['Email address','email','email','you@example.com'],['Subject','subject','text','How can we help?']].map(([l,k,t,ph]) => (
                <div key={k}>
                  <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#555', marginBottom:5 }}>{l}</label>
                  <input type={t} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} placeholder={ph} required style={{ width:'100%', padding:'10px 12px', border:'1px solid #E0E0E0', borderRadius:5, fontSize:13.5, outline:'none', fontFamily:'DM Sans,sans-serif', boxSizing:'border-box' }} onFocus={e=>e.target.style.borderColor='#C8102E'} onBlur={e=>e.target.style.borderColor='#E0E0E0'} />
                </div>
              ))}
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#555', marginBottom:5 }}>Message</label>
                <textarea value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))} placeholder="Tell us how we can help…" required rows={5} style={{ width:'100%', padding:'10px 12px', border:'1px solid #E0E0E0', borderRadius:5, fontSize:13.5, outline:'none', fontFamily:'DM Sans,sans-serif', resize:'vertical', boxSizing:'border-box' }} onFocus={e=>e.target.style.borderColor='#C8102E'} onBlur={e=>e.target.style.borderColor='#E0E0E0'} />
              </div>
              <button type="submit" style={{ padding:13, background:'#C8102E', border:'none', color:'#fff', fontWeight:700, fontSize:15, borderRadius:4, cursor:'pointer', fontFamily:'DM Sans,sans-serif', boxShadow:'0 3px 10px rgba(200,16,46,.3)', transition:'all .2s' }} onMouseEnter={e=>e.currentTarget.style.background='#9e0b22'} onMouseLeave={e=>e.currentTarget.style.background='#C8102E'}>Send message</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
