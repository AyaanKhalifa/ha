// src/pages/FlightStatus.jsx — Real-time style flight status
import React, { useState, useEffect } from 'react';
import { flightService } from '../services/api';
import { useApp } from '../context/AppContext';

const STATUS_STYLE = {
  'On Time':  { bg:'#E8F5E9', color:'#2E7D32', dot:'#4CAF50' },
  Delayed:    { bg:'#FFF8E1', color:'#F57F17', dot:'#FF8F00' },
  Boarding:   { bg:'#E3F2FD', color:'#1565C0', dot:'#1976D2' },
  'In Flight':{ bg:'#EDE7F6', color:'#4527A0', dot:'#5E35B1' },
  Landed:     { bg:'#E8F5E9', color:'#1B5E20', dot:'#2E7D32' },
  Cancelled:  { bg:'#FFEBEE', color:'#C62828', dot:'#C8102E' },
  Scheduled:  { bg:'#F5F5F5', color:'#555',    dot:'#888'    },
};

function ProgressBar({ status, progress }) {
  const pct = status==='Landed'?100:status==='In Flight'?(progress||60):status==='Boarding'?15:0;
  if (pct===0) return null;
  return (
    <div style={{ marginTop:8 }}>
      <div style={{ display:'flex',justifyContent:'space-between',fontSize:11,color:'#888',marginBottom:4 }}>
        <span>Departed</span><span>{pct}% complete</span><span>Arriving</span>
      </div>
      <div style={{ height:6,background:'#F0F0F0',borderRadius:3,overflow:'hidden' }}>
        <div style={{ height:'100%',width:`${pct}%`,background:pct===100?'#2E7D32':'#C8102E',borderRadius:3,transition:'width .9s ease',position:'relative' }}>
          {pct<100&&pct>0&&<span style={{ position:'absolute',right:-8,top:-8,fontSize:16 }}>✈</span>}
        </div>
      </div>
    </div>
  );
}

export default function FlightStatus() {
  const { airportsMap } = useApp();
  const [q, setQ]             = useState('');
  const [allData, setAllData] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [liveTime, setLiveTime] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState('all');

  // Live clock
  useEffect(()=>{
    const t=setInterval(()=>setLiveTime(new Date()),1000);
    return ()=>clearInterval(t);
  },[]);

  // Auto-load all flights
  useEffect(()=>{ loadAll(); },[]);

  const loadAll = async () => {
    setLoading(true);
    const data = await flightService.getStatus();
    setAllData(data || []);
    setLoading(false);
  };

  const search = async () => {
    // Client-side filtering for status page is fine given data volume
    if (!q.trim()) { loadAll(); return; }
  };

  const filteredResults = allData.filter(fs => {
    const matchStatus = statusFilter === 'all' || fs.status === statusFilter;
    if (!matchStatus) return false;
    if (!q.trim()) return true;
    const searchLow = q.toLowerCase();
    return (
      fs.flightNumber?.toLowerCase().includes(searchLow) ||
      fs.route?.origin?.toLowerCase().includes(searchLow) ||
      fs.route?.destination?.toLowerCase().includes(searchLow) ||
      airportsMap[fs.route?.origin]?.city?.toLowerCase().includes(searchLow) ||
      airportsMap[fs.route?.destination]?.city?.toLowerCase().includes(searchLow)
    );
  });

  return (
    <div style={{ background:'#F8F7F4',minHeight:'100vh',fontFamily:'DM Sans,sans-serif' }}>
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#1A1A1A,#2d2d2d)',padding:'32px 24px' }}>
        <div className="container">
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12 }}>
            <div>
              <h1 style={{ fontFamily:'Cormorant Garamond,serif',fontSize:'clamp(1.8rem,3vw,2.4rem)',fontWeight:400,color:'#fff',marginBottom:6 }}>Flight Status</h1>
              <p style={{ fontSize:13.5,color:'rgba(255,255,255,.65)' }}>Real-time updates on all Habibi Airways flights</p>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:11,color:'rgba(255,255,255,.4)',textTransform:'uppercase',letterSpacing:1,marginBottom:4 }}>Local time</div>
              <div style={{ fontFamily:'monospace',fontSize:22,fontWeight:700,color:'#fff',letterSpacing:2 }}>
                {liveTime.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false})}
              </div>
              <div style={{ fontSize:12,color:'rgba(255,255,255,.4)',marginTop:2 }}>{liveTime.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short',year:'numeric'})}</div>
            </div>
          </div>
          {/* Search */}
          <div style={{ display:'flex',gap:10,marginTop:20 }}>
            <input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&search()}
              placeholder="Search by flight number (e.g. HA101) or city (e.g. Mumbai)"
              style={{ flex:1,padding:'11px 16px',border:'1px solid rgba(255,255,255,.2)',borderRadius:5,background:'rgba(255,255,255,.1)',color:'#fff',fontSize:14,outline:'none',fontFamily:'DM Sans,sans-serif' }}
              onFocus={e=>e.target.style.borderColor='#C8102E'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,.2)'}/>
            <button onClick={search} className="btn-red" style={{ padding:'11px 24px',fontSize:14 }}>🔍 Search</button>
            <button onClick={loadAll} style={{ padding:'11px 18px',border:'1px solid rgba(255,255,255,.25)',borderRadius:5,background:'rgba(255,255,255,.1)',color:'#fff',fontSize:13,cursor:'pointer',fontFamily:'DM Sans,sans-serif',transition:'all .2s' }}>All flights</button>
          </div>
        </div>
      </div>

      {/* Status summary */}
      <div style={{ background:'#fff',borderBottom:'1px solid #E0E0E0' }}>
        <div className="container" style={{ display:'flex',gap:0,overflow:'auto' }}>
          {[['all','All','#555'],['On Time','#2E7D32'],['Delayed','#F57F17'],['Boarding','#1565C0'],['In Flight','#6A1B9A'],['Landed','#1B5E20'],['Cancelled','#C8102E']].map(([s,c])=>{
            const cnt = allData.filter(r=>r.status===s).length;
            const isAll = s === 'all';
            const displayCount = isAll ? allData.length : cnt;
            return (
              <button key={s} onClick={()=>setStatusFilter(s)} style={{ padding:'13px 18px',border:'none',borderBottom:`3px solid ${statusFilter===s?c:'transparent'}`,background:statusFilter===s?'#FAFAFA':'transparent',cursor:'pointer',fontFamily:'DM Sans,sans-serif',whiteSpace:'nowrap',display:'flex',alignItems:'center',gap:7,fontSize:13,color:statusFilter===s?c:'#666',transition:'all .2s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderBottomColor=c;e.currentTarget.style.color=c;}}
                onMouseLeave={e=>{if(statusFilter!==s){e.currentTarget.style.borderBottomColor='transparent';e.currentTarget.style.color='#666';}}}>
                <div style={{ width:8,height:8,borderRadius:'50%',background:c }}/>
                {isAll ? 'All' : s} <strong style={{ color:c }}>{displayCount}</strong>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results */}
      <div className="container" style={{ padding:'22px 24px 56px' }}>
        {loading&&(
          <div style={{ textAlign:'center',padding:'48px' }}>
            <div style={{ display:'inline-block',width:40,height:40,border:'4px solid #F0F0F0',borderTop:'4px solid #C8102E',borderRadius:'50%',animation:'spin .85s linear infinite' }}/>
            <div style={{ marginTop:12,fontSize:13,color:'#888' }}>Loading flight data…</div>
          </div>
        )}
        {!loading&&filteredResults.length===0&&(
          <div style={{ textAlign:'center',padding:'48px',background:'#fff',borderRadius:8,border:'1px solid #E0E0E0' }}>
            <div style={{ fontSize:48,marginBottom:16 }}>✈</div>
            <div style={{ fontSize:18,fontWeight:700,color:'#1A1A1A',marginBottom:8 }}>No flights found</div>
            <div style={{ fontSize:14,color:'#888' }}>Try a different flight number or city</div>
          </div>
        )}
        {!loading&&filteredResults.map(fs=>{
          const style = STATUS_STYLE[fs.status] || STATUS_STYLE.Scheduled;
          const from = airportsMap[fs.route?.origin] || { city:fs.route?.origin||'—', code:fs.route?.origin||'—' };
          const to   = airportsMap[fs.route?.destination] || { city:fs.route?.destination||'—', code:fs.route?.destination||'—' };
          const isSelected = selected?.id===fs.id;
          return (
            <div key={fs.id} style={{ background:'#fff',border:`1.5px solid ${isSelected?'#C8102E':'#E8E8E8'}`,borderRadius:8,marginBottom:12,overflow:'hidden',boxShadow:isSelected?'0 4px 24px rgba(200,16,46,.12)':'0 1px 4px rgba(0,0,0,.05)',transition:'all .2s' }}>
              {/* Main row */}
              <div style={{ padding:'18px 22px',display:'flex',alignItems:'center',gap:18,flexWrap:'wrap',cursor:'pointer' }} onClick={()=>setSelected(isSelected?null:fs)}>
                {/* Flight number */}
                <div style={{ minWidth:80,flexShrink:0 }}>
                  <div style={{ fontFamily:'monospace',fontSize:20,fontWeight:900,color:'#C8102E',letterSpacing:.5 }}>{fs.flightNumber}</div>
                  <div style={{ fontSize:11,color:'#AAA',marginTop:2 }}>{fs.aircraft?.type?.replace('Airbus ','A').replace('Boeing ','')}</div>
                </div>

                {/* Route */}
                <div style={{ flex:2,minWidth:200 }}>
                  <div style={{ display:'flex',alignItems:'center',gap:14 }}>
                    <div>
                      <div style={{ fontSize:22,fontWeight:800,color:'#1A1A1A',letterSpacing:-.5 }}>{from.code}</div>
                      <div style={{ fontSize:12,color:'#888' }}>{from.city}</div>
                      <div style={{ fontSize:14,fontWeight:700,color:'#333',marginTop:3 }}>{fs.departureActual||'—'}</div>
                    </div>
                    <div style={{ flex:1,textAlign:'center' }}>
                      <div style={{ display:'flex',alignItems:'center',gap:3 }}>
                        <div style={{ flex:1,height:1.5,background:'#DDD' }}/>
                        <svg width="14" height="8" viewBox="0 0 14 8"><path d="M0 6l2-2 2 1 3-4 2 2 5-3" stroke="#555" strokeWidth="1.5" fill="none"/></svg>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize:22,fontWeight:800,color:'#1A1A1A',letterSpacing:-.5 }}>{to.code}</div>
                      <div style={{ fontSize:12,color:'#888' }}>{to.city}</div>
                      <div style={{ fontSize:14,fontWeight:700,color:'#333',marginTop:3 }}>{fs.arrivalActual||'—'}</div>
                    </div>
                  </div>
                  <ProgressBar status={fs.status} progress={fs.progress}/>
                </div>

                {/* Status */}
                <div style={{ minWidth:120,textAlign:'center' }}>
                  <div style={{ display:'inline-flex',alignItems:'center',gap:6,padding:'6px 14px',background:style.bg,borderRadius:100 }}>
                    <div style={{ width:8,height:8,borderRadius:'50%',background:style.dot,animation:fs.status==='In Flight'?'blink 1.5s ease infinite':'none' }}/>
                    <span style={{ fontSize:13.5,fontWeight:700,color:style.color }}>{fs.status}</span>
                  </div>
                  {fs.delayMinutes>0&&<div style={{ fontSize:12,color:'#F57F17',fontWeight:700,marginTop:5 }}>+{fs.delayMinutes} min delay</div>}
                </div>

                {/* Gate */}
                <div style={{ minWidth:80,textAlign:'center' }}>
                  <div style={{ fontSize:10.5,color:'#AAA',textTransform:'uppercase',letterSpacing:1,marginBottom:3 }}>Gate</div>
                  <div style={{ fontSize:20,fontWeight:900,color:'#1A1A1A' }}>{fs.gate&&fs.gate!=='-'?fs.gate:'—'}</div>
                  <div style={{ fontSize:11,color:'#888' }}>{fs.terminal&&fs.terminal!=='-'?'Terminal '+String(fs.terminal).replace('T',''):''}</div>
                </div>

                <div style={{ fontSize:13,color:'#C8102E',fontWeight:600,flexShrink:0 }}>{isSelected?'▲ Less':'▼ More'}</div>
              </div>

              {/* Expanded details */}
              {isSelected&&(
                <div style={{ padding:'16px 22px',borderTop:'1px solid #F0F0F0',background:'#FAFAFA',display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:14 }}>
                  {[
                    ['Aircraft',fs.aircraft?.type||'—'],
                    ['Registration',fs.aircraft?.reg||'—'],
                    ['Date',fs.date],
                    ['Scheduled dep',fs.departureActual||fs.flight?.departureTime||'—'],
                    ['Delay reason',fs.delay?.reason||'On schedule'],
                    ['Gate',fs.gate&&fs.gate!=='-'?fs.gate:'TBA'],
                    ['Terminal',fs.terminal&&fs.terminal!=='-'?fs.terminal:'TBA'],
                    ['Boarding',fs.gateInfo?.boardingStartsAt||'—'],
                    ['Cancel reason',fs.cancelReason||'N/A'],
                  ].map(([k,v])=>(
                    <div key={k} style={{ padding:'11px',background:'#fff',borderRadius:5,border:'1px solid #EBEBEB' }}>
                      <div style={{ fontSize:10,color:'#AAA',textTransform:'uppercase',letterSpacing:.8,marginBottom:3 }}>{k}</div>
                      <div style={{ fontSize:13,fontWeight:700,color:'#1A1A1A',wordBreak:'break-word' }}>{v}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
