// src/pages/Careers.jsx
import React, { useState } from 'react';

const JOBS = [
  { id:'J001', title:'Senior Cabin Crew',           dept:'Cabin Services',    location:'Dubai, UAE',     type:'Full-time',    posted:'2025-03-15', deadline:'2025-04-15' },
  { id:'J002', title:'Revenue Management Analyst',  dept:'Commercial',        location:'Dubai, UAE',     type:'Full-time',    posted:'2025-03-10', deadline:'2025-04-10' },
  { id:'J003', title:'Software Engineer (Full Stack)',dept:'Technology',       location:'Dubai / Remote', type:'Full-time',    posted:'2025-03-18', deadline:'2025-04-20' },
  { id:'J004', title:'First Officer (B777)',         dept:'Flight Operations', location:'Dubai, UAE',     type:'Full-time',    posted:'2025-03-05', deadline:'2025-04-05' },
  { id:'J005', title:'Airport Services Manager',    dept:'Ground Services',   location:'Mumbai, India',  type:'Full-time',    posted:'2025-03-20', deadline:'2025-04-25' },
  { id:'J006', title:'Digital Marketing Executive', dept:'Marketing',         location:'Dubai, UAE',     type:'Full-time',    posted:'2025-03-22', deadline:'2025-04-30' },
  { id:'J007', title:'UX Designer',                 dept:'Technology',        location:'Dubai / Remote', type:'Full-time',    posted:'2025-03-12', deadline:'2025-04-12' },
  { id:'J008', title:'Customer Service Agent',      dept:'Customer Relations', location:'Bengaluru, India',type:'Full-time', posted:'2025-03-25', deadline:'2025-05-01' },
];

const DEPTS = ['All', ...new Set(JOBS.map(j => j.dept))];

export default function Careers() {
  const [dept, setDept]     = useState('All');
  const [search, setSearch] = useState('');
  const [applied, setApplied] = useState(new Set());

  const filtered = JOBS
    .filter(j => dept === 'All' || j.dept === dept)
    .filter(j => !search || j.title.toLowerCase().includes(search.toLowerCase()));

  const apply = (id) => { setApplied(prev => new Set([...prev, id])); };

  return (
    <div style={{ background:'#F8F7F4', minHeight:'100vh', fontFamily:'DM Sans,sans-serif' }}>
      {/* Hero */}
      <div style={{ background:'linear-gradient(135deg,#C8102E,#7a0018)', padding:'56px 24px', textAlign:'center' }}>
        <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(2rem,4vw,3rem)', fontWeight:400, color:'#fff', marginBottom:10 }}>Careers at Habibi Airways</h1>
        <p style={{ fontSize:15, color:'rgba(255,255,255,.8)', maxWidth:550, margin:'0 auto 24px' }}>Join our team of 40,000 passionate professionals and be part of an award-winning airline that connects the world.</p>
        <div style={{ display:'flex', gap:24, justifyContent:'center', flexWrap:'wrap' }}>
          {[['40K+','Employees'],['80','Nationalities'],['5⭐','Workplace rating']].map(([n,l]) => (
            <div key={l} style={{ textAlign:'center' }}>
              <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:32, fontWeight:600, color:'#fff' }}>{n}</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,.55)', textTransform:'uppercase', letterSpacing:1.5 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="container" style={{ padding:'36px 24px 56px' }}>
        {/* Filters */}
        <div style={{ display:'flex', gap:12, marginBottom:22, flexWrap:'wrap', alignItems:'center' }}>
          <div style={{ position:'relative', flex:1, maxWidth:340 }}>
            <span style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:'#CCC' }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search roles…" className="field-input" style={{ paddingLeft:34 }} />
          </div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {DEPTS.map(d => (
              <button key={d} onClick={() => setDept(d)} style={{ padding:'7px 14px', border:`1.5px solid ${dept===d?'#C8102E':'#E0E0E0'}`, borderRadius:100, background:dept===d?'#FFF0F0':'#fff', color:dept===d?'#C8102E':'#666', fontSize:12.5, fontWeight:dept===d?700:400, cursor:'pointer', fontFamily:'DM Sans,sans-serif', transition:'all .15s' }}>{d}</button>
            ))}
          </div>
          <div style={{ marginLeft:'auto', fontSize:13, color:'#888' }}>{filtered.length} roles</div>
        </div>

        {/* Job listings */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {filtered.map(j => (
            <div key={j.id} style={{ background:'#fff', border:'1px solid #E0E0E0', borderRadius:8, padding:'18px 22px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:14, transition:'box-shadow .2s' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow='0 4px 20px rgba(0,0,0,.08)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow='none'}>
              <div>
                <div style={{ fontSize:16, fontWeight:700, color:'#0D0D0D', marginBottom:5 }}>{j.title}</div>
                <div style={{ display:'flex', gap:14, fontSize:13, color:'#777' }}>
                  <span>🏢 {j.dept}</span>
                  <span>📍 {j.location}</span>
                  <span>💼 {j.type}</span>
                  <span>📅 Deadline: {j.deadline}</span>
                </div>
              </div>
              <button
                onClick={() => apply(j.id)}
                disabled={applied.has(j.id)}
                style={{ padding:'10px 22px', background:applied.has(j.id)?'#E8F5E9':'#C8102E', border:'none', color:applied.has(j.id)?'#2E7D32':'#fff', fontWeight:700, fontSize:13.5, borderRadius:4, cursor:applied.has(j.id)?'default':'pointer', fontFamily:'DM Sans,sans-serif', transition:'all .2s', whiteSpace:'nowrap', minWidth:120 }}>
                {applied.has(j.id) ? '✓ Applied' : 'Apply now'}
              </button>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding:'48px', textAlign:'center', color:'#AAA', background:'#fff', borderRadius:8, border:'1px solid #E0E0E0' }}>No roles match your search</div>
          )}
        </div>

        {/* Benefits */}
        <div style={{ marginTop:48 }}>
          <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:28, fontWeight:400, color:'#0D0D0D', marginBottom:24, textAlign:'center' }}>Why work with us</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
            {[['✈','Fly the world','Staff travel privileges on Habibi Airways and partner airlines'],['🏥','Full health cover','Comprehensive medical, dental and vision for you and family'],['📚','Learning & growth','World-class training programmes and career development'],['🏡','Housing benefit','Subsidised housing for international employees in Dubai'],['💰','Competitive pay','Market-leading salaries with performance bonuses'],['🌍','Diversity','80+ nationalities — a truly global team']].map(([ic,t,d]) => (
              <div key={t} style={{ background:'#fff', border:'1px solid #EBEBEB', borderRadius:8, padding:'20px', display:'flex', gap:14 }}>
                <div style={{ width:44, height:44, borderRadius:10, background:'#FFF5F5', border:'1px solid #FFCDD2', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>{ic}</div>
                <div>
                  <div style={{ fontSize:14.5, fontWeight:700, color:'#1A1A1A', marginBottom:4 }}>{t}</div>
                  <div style={{ fontSize:13, color:'#777', lineHeight:1.6 }}>{d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
