// src/components/SearchBox.jsx — Premium Emirates-style Search Interface
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { useApp } from '../context/AppContext';
import { TODAY } from '../utils/flightData';
import { fadeUp, pulse } from '../utils/anime';
import toast from '../utils/toast';

const EK_RED = '#C8102E';

const FL = ({ text, darkMode }) => (
  <div style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'2px', color: darkMode ? 'rgba(255,255,255,.5)' : '#888', marginBottom:6, userSelect:'none' }}>{text}</div>
);

const VD = ({ darkMode }) => <div className="hide-mobile" style={{ width:1, background: darkMode ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,.15)', alignSelf:'stretch', flexShrink:0, margin:'0 4px' }} />;

function AirportField({ label, value, onChange, placeholder, darkMode }) {
  const { airports } = useApp();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 440 });
  const ref = useRef(null);
  const iRef = useRef(null);
  
  const sel = airports.find(a => a.code === value);

  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const openToggle = () => {
    if (ref.current) {
      const r = ref.current.getBoundingClientRect();
      const vw = window.innerWidth;
      const desired = Math.max(r.width, 420);
      const left = Math.min(Math.max(12, r.left), vw - desired - 12);
      setDropPos({ top: r.bottom + 10, left, width: desired });
    }
    setOpen(!open);
    setQ('');
  };

  useEffect(() => {
    if (open) setTimeout(() => iRef.current?.focus(), 50);
  }, [open]);

  const list = airports.filter(a => 
    !q || [a.code, a.city, a.name].some(s => s?.toLowerCase().includes(q.toLowerCase()))
  ).slice(0, 15);

  return (
    <div ref={ref} style={{ flex:1, minWidth:140, padding:'0 16px', position:'relative', marginBottom: 12 }}>
      <FL text={label} darkMode={darkMode} />
      <div 
        onClick={openToggle}
        style={{ 
          cursor:'pointer', 
          borderBottom:`2.5px solid ${open ? EK_RED : darkMode ? 'rgba(255,255,255,.25)' : 'rgba(0,0,0,.1)'}`,
          paddingBottom:12,
          transition:'border-color .2s'
        }}
      >
        {sel ? (
          <div style={{ display:'flex', gap:8, alignItems:'baseline' }}>
            <span style={{ fontSize:24, fontWeight:900, color: darkMode ? '#fff' : '#1A1A1A', letterSpacing:'-0.5px' }}>{sel.city}</span>
            <span style={{ fontSize:12, fontWeight:700, color: EK_RED }}>{sel.code}</span>
          </div>
        ) : (
          <span style={{ fontSize:18, color: darkMode ? 'rgba(255,255,255,.3)' : '#999', fontWeight:500 }}>{placeholder}</span>
        )}
      </div>

      {open && (
        <div style={{ position:'fixed', top:dropPos.top, left:dropPos.left, width:dropPos.width, background:'#fff', borderRadius:4, boxShadow:'0 24px 64px rgba(0,0,0,.25)', zIndex:9999, overflow:'hidden', border:'1px solid #E0E0E0', animation:'fadeIn .15s ease-out' }}>
          <div style={{ padding:'12px', borderBottom:'1px solid #F0F0F0' }}>
            <input 
              ref={iRef}
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search city or airport..."
              style={{ width:'100%', border:'none', padding:'8px 4px', fontSize:15, outline:'none' }}
            />
          </div>
          <div style={{ maxHeight:300, overflowY:'auto' }}>
            {list.map(a => (
              <div 
                key={a.code}
                onClick={() => { onChange(a.code); setOpen(false); }}
                style={{ padding:'12px 16px', cursor:'pointer', borderBottom:'1px solid #F8F8F8', display:'flex', justifyContent:'space-between', alignItems:'center' }}
                onMouseEnter={e => e.currentTarget.style.background='#F5F5F5'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}
              >
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:'#1A1A1A' }}>{a.city} ({a.code})</div>
                  <div style={{ fontSize:12, color:'#888' }}>{a.name}</div>
                </div>
                <span style={{ fontSize:11, color:'#AAA' }}>{a.country}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DateField({ label, value, onChange, min, darkMode, hasError }) {
  return (
    <div style={{ flex:1, minWidth:140, padding:'0 16px', marginBottom: 12 }}>
      <FL text={label} darkMode={darkMode} />
      <div style={{ borderBottom:`2.5px solid ${hasError ? '#FF4444' : darkMode ? 'rgba(255,255,255,.25)' : 'rgba(0,0,0,.1)'}`, paddingBottom:8 }}>
        <input 
          type="date"
          value={value}
          min={min}
          onChange={e => onChange(e.target.value)}
          style={{ width:'100%', border:'none', background:'transparent', outline:'none', fontSize:18, fontWeight:800, color: darkMode ? '#fff' : '#1A1A1A', colorScheme: darkMode ? 'dark' : 'light', cursor:'pointer' }}
        />
      </div>
    </div>
  );
}

function PassengerField({ pax, setPax, darkMode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const update = (type, delta) => {
    setPax(prev => {
      const next = { ...prev, [type]: prev[type] + delta };
      if (next.adults < 1) next.adults = 1;
      if (next.children < 0) next.children = 0;
      if (next.infants < 0) next.infants = 0;
      if (next.infants > next.adults) next.infants = next.adults; // Max 1 infant per adult
      return next;
    });
  };

  return (
    <div ref={ref} style={{ flex:1, minWidth:120, padding:'0 16px', position:'relative', marginBottom: 12 }}>
      <FL text="Passengers" darkMode={darkMode} />
      <div 
        onClick={() => setOpen(!open)}
        style={{ borderBottom:`2.5px solid ${open ? EK_RED : darkMode ? 'rgba(255,255,255,.25)' : 'rgba(0,0,0,.1)'}`, paddingBottom:8, cursor:'pointer', display:'flex', alignItems:'baseline', gap:8 }}
      >
        <div style={{ fontSize:22, fontWeight:900, color: darkMode ? '#fff' : '#1A1A1A' }}>
          {(pax.adults + pax.children + pax.infants)}
        </div>
        <div style={{ fontSize:11, color: darkMode ? 'rgba(255,255,255,.5)' : '#888' }}>Travelers</div>
      </div>
      {open && (
        <div style={{ position:'absolute', top:'100%', left:0, marginTop:10, width:260, background:'#fff', borderRadius:4, boxShadow:'0 16px 40px rgba(0,0,0,.2)', zIndex:9999, padding:'16px', border:'1px solid #E0E0E0', animation:'fadeIn .15s ease-out' }}>
          {[
            { k:'adults', lbl:'Adults', sub:'12+ years' },
            { k:'children', lbl:'Children', sub:'2-11 years' },
            { k:'infants', lbl:'Infants', sub:'Under 2 years' },
          ].map(row => (
            <div key={row.k} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:'#1A1A1A' }}>{row.lbl}</div>
                <div style={{ fontSize:11, color:'#888' }}>{row.sub}</div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <button 
                  onClick={(e) => { e.stopPropagation(); update(row.k, -1); }} 
                  style={{ width:32, height:32, borderRadius:'50%', border:'1px solid #E0E0E0', background:'#FAFAFA', fontSize:18, cursor:'pointer', color:'#1A1A1A' }}
                  disabled={row.k==='adults' ? pax.adults <= 1 : pax[row.k] <= 0}
                >−</button>
                <div style={{ fontSize:16, fontWeight:700, color:'#1A1A1A', width:20, textAlign:'center' }}>{pax[row.k]}</div>
                <button 
                  onClick={(e) => { e.stopPropagation(); update(row.k, 1); }} 
                  style={{ width:32, height:32, borderRadius:'50%', border:'1px solid #E0E0E0', background:'#FAFAFA', fontSize:18, cursor:'pointer', color:'#1A1A1A' }}
                  disabled={(pax.adults + pax.children + pax.infants) >= 9}
                >+</button>
              </div>
            </div>
          ))}
          <div style={{ textAlign:'right', marginTop:12 }}>
            <button onClick={(e) => { e.stopPropagation(); setOpen(false); }} style={{ padding:'8px 16px', background:EK_RED, color:'#fff', border:'none', borderRadius:4, cursor:'pointer', fontWeight:700, fontSize:13 }}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchBox({ darkMode = true }) {
  const navigate = useNavigate();
  const { searchParams, setSearchParams } = useBooking();

  // Initialize from context if available
  const [trip, setTrip] = useState(searchParams?.tripType || 'return');
  const [from, setFrom] = useState(searchParams?.from || 'BOM');
  const [to, setTo] = useState(searchParams?.to || '');
  const [dep, setDep] = useState(searchParams?.departureDate || TODAY);
  const [ret, setRet] = useState(searchParams?.returnDate || '');
  const [pax, setPax] = useState(searchParams?.passengers || { adults: 1, children: 0, infants: 0 });
  const [cabinClass, setCabinClass] = useState(searchParams?.cabinClass || 'Economy');
  
  const [multiSegments, setMultiSegments] = useState(
    searchParams?.multiCitySegments || [
      { from: searchParams?.from || 'BOM', to: searchParams?.to || '', dep: searchParams?.departureDate || TODAY },
      { from: searchParams?.to || '', to: '', dep: TODAY }
    ]
  );
  
  const [errors, setErrors] = useState({});

  const search = () => {
    const e = {};
    if (trip === 'multi-city') {
      multiSegments.forEach((seg, i) => {
        if (!seg.from) e[`mc_from_${i}`] = true;
        if (!seg.to) e[`mc_to_${i}`] = true;
      });
    } else {
      if (!from) e.from = true;
      if (!to) e.to = true;
      if (trip === 'return' && !ret) e.ret = true;
    }
    
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    const payload = {
      tripType: trip,
      from: trip === 'multi-city' ? multiSegments[0].from : from,
      to: trip === 'multi-city' ? multiSegments[0].to : to,
      departureDate: trip === 'multi-city' ? multiSegments[0].dep : dep,
      returnDate: trip === 'return' ? ret : null,
      passengers: pax,
      cabinClass: cabinClass,
      multiCitySegments: trip === 'multi-city' ? multiSegments : null,
    };
    
    setSearchParams(payload);
    navigate('/book');
  };

  const updateSeg = (i, field, val) => {
    const next = [...multiSegments];
    next[i][field] = val;
    setMultiSegments(next);
  };

  const addSeg = () => {
    if (multiSegments.length < 4) {
      const last = multiSegments[multiSegments.length - 1];
      setMultiSegments([...multiSegments, { from: last.to, to: '', dep: last.dep }]);
    }
  };

  const removeSeg = (i) => {
    setMultiSegments(multiSegments.filter((_, idx) => idx !== i));
  };

  const commonControls = (
    <>
      <VD darkMode={darkMode} />
      <PassengerField pax={pax} setPax={setPax} darkMode={darkMode} />

      <VD darkMode={darkMode} />
      <div style={{ flex:1, minWidth:120, padding:'0 16px', marginBottom: 12 }}>
        <FL text="Class" darkMode={darkMode} />
        <div style={{ borderBottom:`2.5px solid ${darkMode ? 'rgba(255,255,255,.25)' : 'rgba(0,0,0,.1)'}`, paddingBottom:8 }}>
          <select 
            value={cabinClass} 
            onChange={e => setCabinClass(e.target.value)}
            style={{ width:'100%', border:'none', background:'transparent', outline:'none', fontSize:18, fontWeight:800, color: darkMode ? '#fff' : '#1A1A1A', cursor:'pointer' }}
          >
            <option value="Economy" style={{ color: '#000' }}>Economy</option>
            <option value="Premium Economy" style={{ color: '#000' }}>Prem. Economy</option>
            <option value="Business" style={{ color: '#000' }}>Business</option>
            <option value="First" style={{ color: '#000' }}>First Class</option>
          </select>
        </div>
      </div>
      <div style={{ paddingLeft:16 }}>
        <button 
          onClick={search}
          style={{ 
            background:EK_RED, color:'#fff', border:'none', padding:'18px 48px', borderRadius:4, fontSize:16, fontWeight:700, 
            cursor:'pointer', boxShadow:`0 8px 24px ${EK_RED}44`, textTransform:'uppercase', letterSpacing:'1px', transition:'all .2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=`0 12px 32px ${EK_RED}66`; }}
          onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow=`0 8px 24px ${EK_RED}44`; }}
        >
          Search
        </button>
      </div>
    </>
  );

  return (
    <div style={{ background: darkMode ? 'rgba(0,0,0,.85)' : '#fff', padding:'32px', borderRadius: 8, boxShadow: darkMode ? '0 32px 80px rgba(0,0,0,.5)' : '0 12px 40px rgba(0,0,0,.1)', border: darkMode ? '1px solid rgba(255,255,255,.1)' : 'none' }}>
      {/* Trip options */}
      <div style={{ display:'flex', gap:24, marginBottom:24 }}>
        {[['one-way','One Way'],['return','Return'],['multi-city','Multi-city']].map(([v,l]) => (
          <label key={v} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', color: darkMode ? '#fff' : '#555', fontSize:14, fontWeight:600 }}>
            <input type="radio" checked={trip===v} onChange={() => setTrip(v)} style={{ accentColor:EK_RED }} />
            {l}
          </label>
        ))}
      </div>

      {trip !== 'multi-city' ? (
        <div style={{ display:'flex', gap:0, flexWrap:'wrap', alignItems:'flex-start' }}>
          <AirportField label="From" value={from} onChange={setFrom} placeholder="Where from?" darkMode={darkMode} />
          <VD darkMode={darkMode} />
          <AirportField label="To" value={to} onChange={setTo} placeholder="Where to?" darkMode={darkMode} />
          <VD darkMode={darkMode} />
          <DateField label="Departure" value={dep} onChange={setDep} min={TODAY} darkMode={darkMode} />
          {trip === 'return' && (
            <>
              <VD darkMode={darkMode} />
              <DateField label="Return" value={ret} onChange={setRet} min={dep} darkMode={darkMode} hasError={errors.ret} />
            </>
          )}
          {commonControls}
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {multiSegments.map((seg, i) => (
            <div key={i} style={{ display:'flex', gap:0, flexWrap:'wrap', alignItems:'flex-start', position:'relative', borderBottom: darkMode ? '1px solid rgba(255,255,255,.05)' : '1px solid #F0F0F0', paddingBottom:16 }}>
              <div style={{ position:'absolute', top:24, left:-24, color: darkMode ? 'rgba(255,255,255,.3)' : '#AAA', fontWeight:800 }}>{i + 1}</div>
              <AirportField label="From" value={seg.from} onChange={v => updateSeg(i, 'from', v)} placeholder="City" darkMode={darkMode} />
              <VD darkMode={darkMode} />
              <AirportField label="To" value={seg.to} onChange={v => updateSeg(i, 'to', v)} placeholder="City" darkMode={darkMode} />
              <VD darkMode={darkMode} />
              <DateField label="Date" value={seg.dep} onChange={v => updateSeg(i, 'dep', v)} min={TODAY} darkMode={darkMode} />
              {multiSegments.length > 2 && (
                <div style={{ paddingLeft:16, paddingTop:24 }}>
                  <button onClick={() => removeSeg(i)} style={{ background:'transparent', border:'none', color:'#ff4444', cursor:'pointer', fontSize:14, fontWeight:700 }}>✕ Remove</button>
                </div>
              )}
            </div>
          ))}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:8 }}>
            {multiSegments.length < 4 ? (
              <button onClick={addSeg} style={{ background:'transparent', border:'none', color:EK_RED, cursor:'pointer', fontSize:14, fontWeight:700 }}>+ Add another flight</button>
            ) : <div/>}
            <div style={{ display:'flex', alignItems:'flex-start' }}>
              {commonControls}
            </div>
          </div>
        </div>
      )}

      {(Object.keys(errors).length > 0) && (
        <div style={{ marginTop:16, color:'#ff4444', fontSize:13, fontWeight:600 }}>
          ⚠ Please correctly select all required airport destinations and dates.
        </div>
      )}
    </div>
  );
}
