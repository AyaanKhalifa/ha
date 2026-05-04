// src/pages/NotFound.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { anime } from '../utils/anime';

export default function NotFound() {
  const navigate = useNavigate();
  useEffect(() => {
    anime({ targets:'.nf-plane', translateX:['-150%','150%'], opacity:[0,.7,.7,0], duration:5000, easing:'easeInOutSine', loop:true });
    anime({ targets:'.nf-404', scale:[.85,1], opacity:[0,1], duration:700, easing:'easeOutBack', delay:200 });
    anime({ targets:'.nf-text', opacity:[0,1], translateY:[16,0], duration:500, easing:'easeOutCubic', delay:500 });
  }, []);

  return (
    <div style={{ minHeight:'80vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:32, fontFamily:'DM Sans,sans-serif', background:'#F8F7F4', overflow:'hidden', position:'relative' }}>
      <div style={{ position:'absolute', top:'25%', left:0, right:0, overflow:'hidden', height:40, pointerEvents:'none' }}>
        <span className="nf-plane" style={{ display:'inline-block', fontSize:28, color:'rgba(200,16,46,.4)' }}>✈</span>
      </div>
      <div className="nf-404" style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(5rem,16vw,9rem)', fontWeight:700, color:'#C8102E', lineHeight:1, letterSpacing:-6, opacity:0 }}>404</div>
      <div className="nf-text" style={{ opacity:0 }}>
        <h2 style={{ fontSize:20, fontWeight:700, color:'#1A1A1A', marginBottom:10, marginTop:8 }}>Page not found</h2>
        <p style={{ fontSize:14.5, color:'#777', marginBottom:28, maxWidth:380 }}>It seems this page has taken off somewhere. Let's get you back on track.</p>
        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
          <button onClick={() => navigate('/')} style={{ padding:'12px 28px', background:'#C8102E', border:'none', color:'#fff', fontWeight:700, fontSize:14, borderRadius:4, cursor:'pointer', fontFamily:'DM Sans,sans-serif', boxShadow:'0 3px 10px rgba(200,16,46,.3)', transition:'all .2s' }} onMouseEnter={e=>e.currentTarget.style.background='#9e0b22'} onMouseLeave={e=>e.currentTarget.style.background='#C8102E'}>Back to home</button>
          <button onClick={() => navigate(-1)} style={{ padding:'12px 24px', border:'1px solid #E0E0E0', background:'#fff', color:'#555', fontWeight:600, fontSize:14, borderRadius:4, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>Go back</button>
        </div>
      </div>
    </div>
  );
}
