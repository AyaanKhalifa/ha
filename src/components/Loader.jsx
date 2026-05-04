import React from 'react';
export default function Loader({ text='Loading…' }) {
  return (
    <div style={{ minHeight:'50vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:14 }}>
      <div style={{ position:'relative', width:48, height:48 }}>
        <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:'4px solid #F0F0F0' }} />
        <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:'4px solid #C8102E', borderTopColor:'transparent', animation:'spin .85s linear infinite' }} />
        <span style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>✈</span>
      </div>
      <div style={{ fontSize:13, color:'#888', fontFamily:'DM Sans,sans-serif' }}>{text}</div>
    </div>
  );
}
