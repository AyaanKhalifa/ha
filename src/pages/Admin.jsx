// src/pages/Admin.jsx — COMPLETE HABIBI AIRWAYS ADMIN PANEL
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  adminGetAllBookings, adminGetAllUsers, adminGetAllFlights, adminGetDashboardStats,
  getCollection, updateDocument, addDocument, deleteDocument, firestoreService,
} from '../services/firestore';
import { 
  currencyService, bookingService, revenueService, fleetService, settingsService, promoService, auditService, notificationService, checkinService 
} from '../services/api';
import { CURRENCIES } from '../context/AppContext';
// Inline toast utility (no external dep needed)
const toast = {
  success: (msg) => { const d=document.createElement('div'); d.textContent='✅ '+msg; d.style.cssText='position:fixed;bottom:24px;right:24px;background:#1A1A1A;color:#fff;padding:12px 18px;border-radius:6px;font-size:14px;font-family:DM Sans,sans-serif;z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,.3);border-left:4px solid #22c55e'; document.body.appendChild(d); setTimeout(()=>d.remove(),2800); },
  error:   (msg) => { const d=document.createElement('div'); d.textContent='❌ '+msg; d.style.cssText='position:fixed;bottom:24px;right:24px;background:#1A1A1A;color:#fff;padding:12px 18px;border-radius:6px;font-size:14px;font-family:DM Sans,sans-serif;z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,.3);border-left:4px solid #C8102E'; document.body.appendChild(d); setTimeout(()=>d.remove(),2800); },
};

// ─── Colour helpers ────────────────────────────────────────────────
const SC = { confirmed:'#2E7D32', pending:'#F57F17', cancelled:'#C8102E', refund_pending:'#6A1B9A', 'On Time':'#2E7D32', Delayed:'#F57F17', Boarding:'#1565C0', Scheduled:'#607D8B', Landed:'#1B5E20', 'In Flight':'#0D47A1', 'In flight':'#0D47A1', active:'#2E7D32', Active:'#2E7D32', maintenance:'#F57F17', Maintenance:'#F57F17', suspended:'#C8102E', expired:'#C8102E', paid:'#2E7D32', processing:'#F57F17', issued:'#2E7D32', completed:'#2E7D32' };
const TC = { Blue:'#1565C0', Silver:'#607D8B', Gold:'#F57F17', Platinum:'#6A1B9A' };
const Badge = ({ s, sm }) => { const c = SC[s]||'#888'; return <span style={{ fontSize:sm?10:11.5, fontWeight:700, color:c, background:c+'1A', padding:sm?'2px 7px':'3px 10px', borderRadius:100, whiteSpace:'nowrap', textTransform:'capitalize' }}>{(s||'').replace(/_/g,' ')}</span>; };
const Card = ({ ch, sty }) => <div style={{ background:'#fff', border:'1px solid #E8E8E8', borderRadius:6, ...sty }}>{ch}</div>;
const SI = ({ v, onChange, ph }) => <div style={{ position:'relative', flex:1, maxWidth:360 }}><span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#BBB' }}>🔍</span><input value={v} onChange={e=>onChange(e.target.value)} placeholder={ph||'Search…'} className="field-input" style={{ paddingLeft:32 }}/></div>;
const fmtINR = n => {
  const code = localStorage.getItem('ha_currency') || 'INR';
  const cfg = CURRENCIES[code] || CURRENCIES.INR;
  const converted = Math.round((n||0) * cfg.rate);
  return `${cfg.symbol}${converted.toLocaleString()}`;
};

// ─── SIDEBAR ITEMS ─────────────────────────────────────────────────
const TABS = [
  { id:'',          icon:'📊', label:'Dashboard'    },
  { id:'bookings',  icon:'📋', label:'Bookings'     },
  { id:'flights',   icon:'✈',  label:'Flights'      },
  { id:'users',     icon:'👥', label:'Users'        },
  { id:'revenue',   icon:'💰', label:'Revenue'      },
  { id:'fleet',     icon:'🛩', label:'Fleet'        },
  { id:'routes',    icon:'🗺', label:'Routes'       },
  { id:'promos',    icon:'🎫', label:'Promotions'   },
  { id:'loyalty',   icon:'🏆', label:'Loyalty'      },
  { id:'payments',  icon:'💳', label:'Payments'     },
  { id:'audit',     icon:'📜', label:'Audit Logs'   },
  { id:'settings',  icon:'⚙',  label:'Settings'     },
];

// ══════════════════════════════════════════════════════════════════
// SECTION COMPONENTS
// ══════════════════════════════════════════════════════════════════

function Dashboard() {
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [promos, setPromos] = useState([]); 
  const [flightStatus, setFlightStatus] = useState([]);      
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [dbLoading, setDbLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminGetAllBookings(),
      adminGetAllUsers(),
      getCollection('notifications'),
      getCollection('pricing_rules'),
      getCollection('flight_status'),
      revenueService.getMonthlyTrend()
    ]).then(([b, u, n, p, fs, rt]) => {
      setBookings(b || []);
      setUsers(u || []);
      setNotifications(n || []);
      setPromos(p || []);
      setFlightStatus(fs || []);
      setRevenueTrend(rt || []);
      setDbLoading(false);
    }).catch(() => {
      setDbLoading(false);
    });
  }, []);

  const totalRev = bookings.filter(b=>b.status!=='cancelled').reduce((s,b)=>s+(b.totalAmount||0),0);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    getCollection('audit_logs').then(l => setLogs(l.slice(-6).reverse()));
  }, []);

  if(dbLoading) return <div style={{padding:40,textAlign:'center',color:'#888'}}>Loading live data…</div>;
  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:18 }}>
        {[['📋','Total Bookings',bookings.length,'#C8102E',12],['👥','Users',users.length,'#1565C0',8],['💰','Revenue',fmtINR(totalRev),'#2E7D32',15],['✈','Flights Today',flightStatus.length,'#6A1B9A',null]].map(([ic,l,v,c,tr])=>(
          <div key={l} style={{ background:'#fff', border:'1px solid #E8E8E8', borderRadius:6, padding:'18px 20px', borderLeft:`4px solid ${c}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#999', textTransform:'uppercase', letterSpacing:.8 }}>{l}</div>
              <span style={{ fontSize:22 }}>{ic}</span>
            </div>
            <div style={{ fontSize:26, fontWeight:900, color:c, letterSpacing:-1 }}>{v}</div>
            {tr&&<div style={{ fontSize:11, color:tr>=0?'#2E7D32':'#C8102E', marginTop:5 }}>↑ {tr}% vs last month</div>}
          </div>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:18 }}>
        {[['✓','Confirmed',bookings.filter(b=>b.status==='confirmed').length,'#2E7D32'],['⏳','Pending',bookings.filter(b=>b.status==='pending').length,'#F57F17'],['🔔','Unread Notifs',notifications.filter(n=>!n.read).length,'#C9A84C'],['🎫','Active Promos',promos.filter(p=>p.status==='active').length,'#607D8B']].map(([ic,l,v,c])=>(
          <div key={l} style={{ background:'#fff', border:'1px solid #E8E8E8', borderRadius:6, padding:'14px 18px', display:'flex', gap:14, alignItems:'center' }}>
            <div style={{ width:40, height:40, borderRadius:8, background:c+'18', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{ic}</div>
            <div>
              <div style={{ fontSize:22, fontWeight:900, color:c, letterSpacing:-1 }}>{v}</div>
              <div style={{ fontSize:11, color:'#AAA', textTransform:'uppercase', letterSpacing:.8 }}>{l}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16, marginBottom:16 }}>
        <div style={{ background:'#fff', border:'1px solid #E8E8E8', borderRadius:6, gridColumn:'span 2', overflow:'hidden' }}>
          <div style={{ padding:'13px 18px', borderBottom:'1px solid #F0F0F0', display:'flex', justifyContent:'space-between' }}>
            <div style={{ fontSize:14, fontWeight:700 }}>Recent bookings</div>
            <button onClick={()=>{}} style={{ fontSize:12.5, color:'#C8102E', fontWeight:600, background:'none', border:'none', cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>View all</button>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table className="data-table">
              <thead><tr>{['PNR','Passenger','Cabin','Amount','Status'].map(h=><th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {bookings.slice(0,6).map(b=>{
                  const u=users.find(x=>x.id===b.userId);
                  return (<tr key={b.id}><td><span style={{ fontFamily:'monospace', fontWeight:700, color:'#C8102E', fontSize:12 }}>{b.pnr}</span></td><td>{u?.firstName} {u?.lastName}</td><td>{b.cabinClass}</td><td style={{ fontWeight:700 }}>{fmtINR(b.totalAmount)}</td><td><Badge s={b.status} sm/></td></tr>);
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div style={{ background:'#fff', border:'1px solid #E8E8E8', borderRadius:6 }}>
          <div style={{ padding:'13px 18px', borderBottom:'1px solid #F0F0F0', display:'flex', alignItems:'center', gap:7 }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:'#2E7D32', animation:'blink 1.5s ease infinite' }}/>
            <div style={{ fontSize:14, fontWeight:700 }}>Live activity</div>
          </div>
          {logs.map((a,i)=>(
            <div key={i} style={{ padding:'10px 14px', borderBottom:'1px solid #F8F8F8', display:'flex', gap:9 }}>
              <span style={{ fontSize:14, flexShrink:0 }}>{a.action?.includes('booking')?'📋':a.action?.includes('user')?'👤':'⚙'}</span>
              <div>
                <div style={{ fontSize:12.5, color:'#333', lineHeight:1.4 }}>{a.details}</div>
                <div style={{ fontSize:10.5, color:'#BBB', marginTop:2 }}>{new Date(a.timestamp).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
        <div style={{ background:'#fff', border:'1px solid #E8E8E8', borderRadius:6, padding:'18px' }}>
          <div style={{ fontSize:14, fontWeight:700, marginBottom:14 }}>Booking status</div>
          {[['confirmed',bookings.filter(b=>b.status==='confirmed').length,'#2E7D32'],['pending',bookings.filter(b=>b.status==='pending').length,'#F57F17'],['cancelled',bookings.filter(b=>b.status==='cancelled').length,'#C8102E']].map(([s,c,col])=>{
            const p = bookings.length?Math.round(c/bookings.length*100):0;
            return (<div key={s} style={{ marginBottom:11 }}><div style={{ display:'flex', justifyContent:'space-between', fontSize:12.5, marginBottom:4 }}><span style={{ fontWeight:600, color:col, textTransform:'capitalize' }}>{s}</span><span style={{ color:'#888' }}>{c} ({p}%)</span></div><div style={{ height:6, background:'#F0F0F0', borderRadius:3, overflow:'hidden' }}><div style={{ height:'100%', width:`${p}%`, background:col, borderRadius:3, transition:'width .9s' }}/></div></div>);
          })}
        </div>
        <div style={{ background:'#fff', border:'1px solid #E8E8E8', borderRadius:6, padding:'18px' }}>
          <div style={{ fontSize:14, fontWeight:700, marginBottom:14 }}>Today's flights</div>
          {flightStatus.map(fs=>(
            <div key={fs.id} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid #F5F5F5', fontSize:13 }}>
              <span style={{ fontFamily:'monospace', fontWeight:700 }}>{fs.flightNumber}</span>
              <span style={{ color:'#888', fontSize:12 }}>{fs.gate!=='-'?`Gate ${fs.gate}`:'-'}</span>
              {fs.delayMinutes>0&&<span style={{ color:'#F57F17', fontSize:11, fontWeight:700 }}>+{fs.delayMinutes}m</span>}
              <Badge s={fs.status} sm/>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background:'#fff', border:'1px solid #E8E8E8', borderRadius:6, padding:'20px' }}>
        <div style={{ fontSize:14, fontWeight:700, marginBottom:18 }}>Monthly revenue {new Date().getFullYear()} (₹ Lakhs)</div>
        <div style={{ display:'flex', gap:5, alignItems:'flex-end', height:150 }}>
          {revenueTrend.map(({ month, revenue: h }, i) => {
            const max = Math.max(...revenueTrend.map(r => r.revenue), 1);
            return (
              <div key={month} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                <div style={{ fontSize:9, color:'#AAA', fontWeight:700 }}>₹{h}L</div>
                <div style={{ width:'100%', background:'linear-gradient(to top,#C8102E,#ff3355)', borderRadius:'3px 3px 0 0', height:`${(h/max)*140}px`, minHeight:4, cursor:'pointer', transition:'opacity .2s' }} />
                <div style={{ fontSize:9.5, color:'#AAA' }}>{month}</div>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
    </div>
  );
}

function BookingsSection() {
  const [bks, setBks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [f, setF] = useState('all');
  const [sel, setSel] = useState(null);

  useEffect(() => {
    Promise.all([adminGetAllBookings(), adminGetAllUsers()]).then(([b, u]) => {
      setBks(b || []);
      setUsers(u || []);
      setLoading(false);
    });
  }, []);

  const fil = bks.filter(b => f === 'all' || b.status === f).filter(b => !q || [b.pnr, b.contactEmail].some(s => s?.toLowerCase().includes(q.toLowerCase())));

  const doCancel = async id => {
    if (!window.confirm('Cancel booking?')) return;
    await updateDocument('bookings', id, { status: 'cancelled' });
    const b = await adminGetAllBookings();
    setBks(b);
    setSel(null);
    toast.success('Cancelled');
  };

  const doConfirm = async id => {
    await updateDocument('bookings', id, { status: 'confirmed' });
    const b = await adminGetAllBookings();
    setBks(b);
    toast.success('Confirmed');
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading bookings…</div>;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10, marginBottom: 14 }}>
        {[['all', 'All', bks.length, '#C8102E'], ['confirmed', 'Confirmed', bks.filter(b => b.status === 'confirmed').length, '#2E7D32'], ['pending', 'Pending', bks.filter(b => b.status === 'pending').length, '#F57F17'], ['cancelled', 'Cancelled', bks.filter(b => b.status === 'cancelled').length, '#888'], ['refund_pending', 'Refund', bks.filter(b => b.status === 'refund_pending').length, '#6A1B9A']].map(([v, l, c, col]) => (
          <button key={v} onClick={() => setF(v)} style={{ padding: '10px', border: `1.5px solid ${f === v ? col : '#E0E0E0'}`, borderRadius: 5, background: f === v ? col + '12' : '#fff', color: f === v ? col : '#666', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', textAlign: 'center', transition: 'all .15s' }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: f === v ? col : '#555' }}>{c}</div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: .8, marginTop: 2 }}>{l}</div>
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}><SI v={q} onChange={setQ} ph="Search PNR, email…"/></div>
      <div style={{ background: '#fff', border: '1px solid #E8E8E8', borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead><tr>{['PNR', 'Passenger', 'Email', 'Cabin', 'Pax', 'Amount', 'Status', 'Date', 'Actions'].map(h => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {fil.map(b => {
                const u = users.find(x => x.id === b.userId) || { firstName: b.contactEmail?.split('@')[0] || 'User', lastName: '' };
                return (<tr key={b.id}>
                  <td><span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#C8102E', letterSpacing: 1, fontSize: 12 }}>{b.pnr}</span></td>
                  <td><div style={{ fontWeight: 600 }}>{u?.firstName} {u?.lastName}</div><div style={{ fontSize: 11, color: '#AAA' }}>{b.userId}</div></td>
                  <td style={{ fontSize: 12, color: '#555' }}>{b.contactEmail}</td>
                  <td>{b.cabinClass}</td>
                  <td style={{ textAlign: 'center', fontWeight: 700 }}>{b.passengers}</td>
                  <td style={{ fontWeight: 800 }}>{fmtINR(b.totalAmount)}</td>
                  <td><Badge s={b.status} sm/></td>
                  <td style={{ fontSize: 12, color: '#888' }}>{new Date(b.createdAt?.seconds ? b.createdAt.seconds * 1000 : b.createdAt).toLocaleDateString('en-IN')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => setSel(b)} style={{ fontSize: 11.5, padding: '3px 9px', border: '1px solid #E0E0E0', borderRadius: 3, background: '#fff', color: '#555', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', transition: 'all .15s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = '#C8102E'; e.currentTarget.style.color = '#C8102E'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = '#E0E0E0'; e.currentTarget.style.color = '#555'; }}>View</button>
                      {b.status === 'pending' && <button onClick={() => doConfirm(b.id)} style={{ fontSize: 11.5, padding: '3px 9px', border: 'none', borderRadius: 3, background: '#E8F5E9', color: '#2E7D32', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', fontWeight: 600 }}>Confirm</button>}
                      {!['cancelled', 'refund_pending'].includes(b.status) && <button onClick={() => doCancel(b.id)} style={{ fontSize: 11.5, padding: '3px 9px', border: 'none', borderRadius: 3, background: '#FFEBEE', color: '#C8102E', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', fontWeight: 600 }}>Cancel</button>}
                    </div>
                  </td>
                </tr>);
              })}
            </tbody>
          </table>
        </div>
      </div>
      {sel&&(
        <div onClick={()=>setSel(null)} style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.55)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center',padding:20 }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:'#fff',borderRadius:8,overflow:'hidden',maxWidth:600,width:'100%',boxShadow:'0 24px 72px rgba(0,0,0,.25)',maxHeight:'90vh',overflowY:'auto' }}>
            <div style={{ background:'#C8102E',padding:'14px 20px',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
              <div style={{ fontSize:16,fontWeight:800,color:'#fff' }}>Booking {sel.pnr}</div>
              <button onClick={()=>setSel(null)} style={{ width:32,height:32,borderRadius:'50%',background:'rgba(255,255,255,.15)',border:'none',color:'#fff',fontSize:18,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>×</button>
            </div>
            <div style={{ padding:'20px 22px' }}>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:11,marginBottom:14 }}>
                {(() => {
                  const flightId = sel.flight?.id || (sel.multiCityFlights?.[0]?.selectedFlight?.id);
                  const paxSeats = sel.selectedSeats?.[flightId];
                  const seatStr = (paxSeats?.id) ? paxSeats.id : Object.values(paxSeats || {}).map(s => s.id).filter(Boolean).join(', ') || '—';

                  return [['Cabin',sel.cabinClass],['Fare',sel.fareClass],['Seats', seatStr],['Passengers',sel.passengers],['Contact',sel.contactEmail],['Phone',sel.contactPhone],['Amount',fmtINR(sel.totalAmount)],['Status',sel.status],['Created',new Date(sel.createdAt).toLocaleString('en-IN')]].map(([k,v])=>(
                    <div key={k} style={{ padding:'9px 12px',background:'#FAFAFA',borderRadius:5,border:'1px solid #F0F0F0' }}>
                      <div style={{ fontSize:10,color:'#AAA',textTransform:'uppercase',letterSpacing:.8,marginBottom:2 }}>{k}</div>
                      <div style={{ fontSize:13.5,fontWeight:700,color:'#1A1A1A' }}>{v||'—'}</div>
                    </div>
                  ));
                })()}
              </div>
              {sel.history&&sel.history.length>0&&(
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontSize:13,fontWeight:700,marginBottom:8 }}>Status history</div>
                  {sel.history.map((h,i)=>(<div key={i} style={{ display:'flex',gap:10,padding:'6px 0',borderBottom:'1px solid #F5F5F5',fontSize:12.5 }}><Badge s={h.status} sm/><span style={{ color:'#888' }}>{new Date(h.changedAt).toLocaleString('en-IN')}</span><span style={{ color:'#555',flex:1 }}>{h.reason}</span></div>))}
                </div>
              )}
              <div style={{ display:'flex',gap:8 }}>
                <button onClick={()=>setSel(null)} style={{ flex:1,padding:'10px',border:'1px solid #E0E0E0',borderRadius:4,background:'#fff',color:'#555',cursor:'pointer',fontFamily:'DM Sans,sans-serif',fontSize:13.5 }}>Close</button>
                <button onClick={()=>toast.success('Email sent to '+sel.contactEmail)} style={{ flex:1,padding:'10px',background:'#1565C0',border:'none',color:'#fff',fontWeight:700,fontSize:13.5,borderRadius:4,cursor:'pointer',fontFamily:'DM Sans,sans-serif' }}>📧 Email</button>
                {!['cancelled','refund_pending'].includes(sel.status)&&<button onClick={()=>doCancel(sel.id)} style={{ flex:1,padding:'10px',background:'#C8102E',border:'none',color:'#fff',fontWeight:700,fontSize:13.5,borderRadius:4,cursor:'pointer',fontFamily:'DM Sans,sans-serif' }}>Cancel</button>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FlightsSection() {
  const [flts, setFlts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(null);
  const [ns, setNs] = useState('');
  const [nd, setNd] = useState('');
  const [ng, setNg] = useState('');
  
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ flightNumber: '', routeOrigin: '', routeDestination: '', aircraftType: 'Airbus A320', departureActual: '12:00', arrivalActual: '14:00', gate: 'TBA', terminal: 'T3', status: 'Scheduled' });

  const fetchFlights = async () => {
    const f = await adminGetAllFlights();
    setFlts(f || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchFlights();
  }, []);

  const upd = async id => {
    await updateDocument('flight_status', id, {
      status: ns,
      gate: ng,
      delayMinutes: parseInt(nd) || 0
    });
    await fetchFlights();
    setEdit(null);
    toast.success('Flight updated');
  };

  const add = async () => {
    if (!form.flightNumber || !form.routeOrigin || !form.routeDestination) { toast.error('Fill required fields'); return; }
    await addDocument('flight_status', {
      flightNumber: form.flightNumber.toUpperCase(),
      route: { origin: form.routeOrigin.toUpperCase(), destination: form.routeDestination.toUpperCase() },
      aircraft: { type: form.aircraftType },
      departureActual: form.departureActual,
      arrivalActual: form.arrivalActual,
      gate: form.gate,
      terminal: form.terminal,
      status: form.status,
      delayMinutes: 0
    });
    await fetchFlights();
    setShowNew(false);
    toast.success('Flight created');
  };

  const del = async id => {
    if (!window.confirm('Delete this flight?')) return;
    await deleteDocument('flight_status', id);
    await fetchFlights();
    toast.success('Flight deleted');
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading flights…</div>;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, alignItems: 'center' }}>
        <div style={{ display:'flex', gap:10 }}>
          {[['On Time','#2E7D32'],['Delayed','#F57F17'],['Boarding','#1565C0'],['In Flight','#0D47A1'],['Landed','#1B5E20'],['Scheduled','#607D8B']].map(([s,c])=>(
            <div key={s} style={{ background:'#fff',border:`1px solid ${c}33`,borderRadius:5,padding:'8px 12px',textAlign:'center', minWidth:80 }}>
              <div style={{ fontSize:18,fontWeight:900,color:c }}>{flts.filter(f=>f.status===s).length}</div>
              <div style={{ fontSize:10,color:'#AAA',textTransform:'uppercase',letterSpacing:.8,marginTop:2 }}>{s}</div>
            </div>
          ))}
        </div>
        <button onClick={() => setShowNew(true)} className="btn-red" style={{ padding: '9px 18px', fontSize: 13 }}>+ Create flight</button>
      </div>
      <div style={{ background:'#fff',border:'1px solid #E8E8E8',borderRadius:6,overflow:'hidden' }}>
        <table className="data-table">
          <thead><tr>{['Flight','Route','Aircraft','Dep','Arr','Gate','T','Delay','Status','Actions'].map(h=><th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {flts.map(fs=>(
              <tr key={fs.id}>
                <td><span style={{ fontFamily:'monospace',fontWeight:800,color:'#C8102E' }}>{fs.flightNumber}</span></td>
                <td style={{ fontWeight:600 }}>{fs.route?.origin}→{fs.route?.destination}</td>
                <td style={{ fontSize:12,color:'#666' }}>{fs.aircraft?.type?.replace('Airbus ','A').replace('Boeing ','')}</td>
                <td>{fs.departureActual||'—'}</td><td>{fs.arrivalActual||'—'}</td>
                <td style={{ fontWeight:700 }}>{fs.gate}</td><td>{fs.terminal}</td>
                <td>{fs.delayMinutes>0?<span style={{ color:'#F57F17',fontWeight:700 }}>+{fs.delayMinutes}m</span>:'—'}</td>
                <td><Badge s={fs.status} sm/></td>
                <td><div style={{ display:'flex', gap:6 }}><button onClick={()=>{setEdit(fs);setNs(fs.status);setNg(fs.gate);setNd(fs.delayMinutes||'');}} style={{ fontSize:11.5,padding:'3px 9px',border:'1px solid #E0E0E0',borderRadius:3,background:'#fff',color:'#555',cursor:'pointer',fontFamily:'DM Sans,sans-serif' }} onMouseEnter={e=>{e.currentTarget.style.borderColor='#C8102E';e.currentTarget.style.color='#C8102E';}} onMouseLeave={e=>{e.currentTarget.style.borderColor='#E0E0E0';e.currentTarget.style.color='#555';}}>Edit</button><button onClick={()=>del(fs.id)} style={{ fontSize:11.5,padding:'3px 9px',border:'none',borderRadius:3,background:'#FFEBEE',color:'#C8102E',cursor:'pointer',fontFamily:'DM Sans,sans-serif',fontWeight:600 }}>Delete</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {edit&&<div onClick={()=>setEdit(null)} style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.55)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center',padding:20 }}><div onClick={e=>e.stopPropagation()} style={{ background:'#fff',borderRadius:8,overflow:'hidden',width:440,boxShadow:'0 24px 72px rgba(0,0,0,.25)' }}><div style={{ background:'#1A1A1A',padding:'14px 20px',display:'flex',justifyContent:'space-between',alignItems:'center' }}><div style={{ color:'#fff',fontSize:15,fontWeight:700 }}>Edit {edit.flightNumber}</div><button onClick={()=>setEdit(null)} style={{ background:'none',border:'none',color:'rgba(255,255,255,.6)',fontSize:20,cursor:'pointer' }}>×</button></div><div style={{ padding:'20px 22px',display:'flex',flexDirection:'column',gap:13 }}><div><label className="field-label">Status</label><select value={ns} onChange={e=>setNs(e.target.value)} className="field-input" style={{ cursor:'pointer' }}>{['On Time','Delayed','Boarding','In Flight','Landed','Cancelled','Scheduled'].map(s=><option key={s}>{s}</option>)}</select></div><div><label className="field-label">Delay (mins)</label><input type="number" value={nd} onChange={e=>setNd(e.target.value)} className="field-input" placeholder="0"/></div><div><label className="field-label">Gate</label><input value={ng} onChange={e=>setNg(e.target.value)} className="field-input" placeholder="e.g. B22"/></div><div style={{ display:'flex',gap:10 }}><button onClick={()=>setEdit(null)} style={{ flex:1,padding:'11px',border:'1px solid #E0E0E0',borderRadius:4,background:'#fff',color:'#555',cursor:'pointer',fontFamily:'DM Sans,sans-serif' }}>Cancel</button><button onClick={()=>upd(edit.id)} className="btn-red" style={{ flex:1,padding:'11px',fontSize:13.5 }}>Save</button></div></div></div></div>}
      {showNew&&<div onClick={()=>setShowNew(false)} style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.55)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center',padding:20 }}><div onClick={e=>e.stopPropagation()} style={{ background:'#fff',borderRadius:8,overflow:'hidden',width:500,boxShadow:'0 24px 72px rgba(0,0,0,.25)' }}><div style={{ background:'#C8102E',padding:'14px 20px',display:'flex',justifyContent:'space-between',alignItems:'center' }}><div style={{ color:'#fff',fontSize:15,fontWeight:700 }}>Create new flight</div><button onClick={()=>setShowNew(false)} style={{ background:'none',border:'none',color:'rgba(255,255,255,.7)',fontSize:20,cursor:'pointer' }}>×</button></div><div style={{ padding:'20px 22px',display:'flex',flexDirection:'column',gap:13 }}><div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:13 }}><div><label className="field-label">Flight Number *</label><input value={form.flightNumber} onChange={e=>setForm(f=>({...f,flightNumber:e.target.value}))} className="field-input" placeholder="HA100"/></div><div><label className="field-label">Aircraft Type</label><input value={form.aircraftType} onChange={e=>setForm(f=>({...f,aircraftType:e.target.value}))} className="field-input" placeholder="Airbus A320"/></div></div><div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:13 }}><div><label className="field-label">Origin *</label><input value={form.routeOrigin} onChange={e=>setForm(f=>({...f,routeOrigin:e.target.value}))} className="field-input" placeholder="DXB"/></div><div><label className="field-label">Destination *</label><input value={form.routeDestination} onChange={e=>setForm(f=>({...f,routeDestination:e.target.value}))} className="field-input" placeholder="LHR"/></div></div><div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:13 }}><div><label className="field-label">Departure Times (Actual)</label><input type="time" value={form.departureActual} onChange={e=>setForm(f=>({...f,departureActual:e.target.value}))} className="field-input"/></div><div><label className="field-label">Arrival Times (Actual)</label><input type="time" value={form.arrivalActual} onChange={e=>setForm(f=>({...f,arrivalActual:e.target.value}))} className="field-input"/></div></div><div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:13 }}><div><label className="field-label">Terminal</label><input value={form.terminal} onChange={e=>setForm(f=>({...f,terminal:e.target.value}))} className="field-input" placeholder="T3"/></div><div><label className="field-label">Gate</label><input value={form.gate} onChange={e=>setForm(f=>({...f,gate:e.target.value}))} className="field-input" placeholder="B22"/></div><div><label className="field-label">Status</label><select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))} className="field-input">{['Scheduled','On Time','Delayed','Boarding','In Flight','Landed','Cancelled'].map(s=><option key={s}>{s}</option>)}</select></div></div><div style={{ display:'flex',gap:10,marginTop:6 }}><button onClick={()=>setShowNew(false)} style={{ flex:1,padding:'11px',border:'1px solid #E0E0E0',borderRadius:4,background:'#fff',color:'#555',cursor:'pointer',fontFamily:'DM Sans,sans-serif',fontSize:13.5 }}>Cancel</button><button onClick={add} className="btn-red" style={{ flex:2,padding:'11px',fontSize:13.5 }}>Create Flight</button></div></div></div></div>}
    </div>
  );
}

function UsersSection() {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState('');
  const [fi, setFi] = useState('all');
  const [sel, setSel] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    const u = await adminGetAllUsers();
    setUsers(u || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fil = users.filter(u => fi === 'all' || (fi === 'suspended' ? u.status === 'suspended' : (u.loyalty?.tier || 'Blue').toLowerCase() === fi.toLowerCase())).filter(u => !q || [u.firstName, u.lastName, u.email].some(s => s?.toLowerCase().includes(q.toLowerCase())));

  const suspend = async u => {
    await updateDocument('users', u.id, { status: u.status === 'suspended' ? 'active' : 'suspended' });
    await fetchUsers();
    toast.success(u.status === 'suspended' ? 'Activated' : 'Suspended');
  };

  const addMiles = async (uid, m) => {
    const user = users.find(x => x.id === uid);
    const cur = user?.loyalty?.points || 0;
    await updateDocument('users', uid, { 'loyalty.points': cur + m });
    await fetchUsers();
    toast.success(m.toLocaleString() + ' miles added!');
  };

  const updTier = async (uid, t) => {
    await updateDocument('users', uid, { 'loyalty.tier': t });
    await fetchUsers();
    toast.success(`Tier updated to ${t}`);
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading users…</div>;

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <SI v={q} onChange={setQ} ph="Search name, email…"/>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['all', 'suspended', 'Blue', 'Silver', 'Gold', 'Platinum'].map(v => (<button key={v} onClick={() => setFi(v)} style={{ padding: '6px 13px', border: `1.5px solid ${fi === v ? '#C8102E' : '#E0E0E0'}`, borderRadius: 100, background: fi === v ? '#FFF0F0' : '#fff', color: fi === v ? '#C8102E' : '#666', fontSize: 12, fontWeight: fi === v ? 700 : 400, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', transition: 'all .15s' }}>{v[0].toUpperCase() + v.slice(1)}</button>))}
        </div>
        <span style={{ marginLeft: 'auto', fontSize: 13, color: '#888' }}>{fil.length} users</span>
      </div>
      <div style={{ background: '#fff', border: '1px solid #E8E8E8', borderRadius: 6, overflow: 'hidden' }}>
        <table className="data-table">
          <thead><tr>{['User', 'Email', 'Tier', 'Miles', 'Bookings', 'Status', 'Actions'].map(h => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {fil.map(u => (
              <tr key={u.id}>
                <td><div style={{ display: 'flex', alignItems: 'center', gap: 9 }}><div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg,${TC[u.loyalty?.tier] || '#C8102E'},#8b0000)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 12, flexShrink:0 }}>{(u.firstName || u.name || 'U')[0]}</div><div><div style={{ fontWeight: 700 }}>{u.firstName || u.name} {u.lastName}</div><div style={{ fontSize: 11, color: '#AAA' }}>{u.id}</div></div></div></td>
                <td style={{ color: '#555', fontSize: 12.5 }}>{u.email}</td>
                <td><select value={u.loyalty?.tier || 'Blue'} onChange={e => updTier(u.id, e.target.value)} style={{ padding: '4px 8px', border: `1px solid ${TC[u.loyalty?.tier] || '#CCC'}`, borderRadius: 100, fontSize: 12, fontWeight: 700, color: TC[u.loyalty?.tier] || '#555', background: `${TC[u.loyalty?.tier] || '#CCC'}18`, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', outline: 'none' }}>{['Blue', 'Silver', 'Gold', 'Platinum'].map(t => <option key={t}>{t}</option>)}</select></td>
                <td><div style={{ fontWeight: 700, color: '#C8102E' }}>{(u.loyalty?.points || 0).toLocaleString('en-IN')}</div><button onClick={() => addMiles(u.id, 5000)} style={{ fontSize: 10, color: '#2E7D32', background: '#E8F5E9', border: 'none', borderRadius: 100, padding: '1px 7px', cursor: 'pointer', marginTop: 2, fontFamily: 'DM Sans,sans-serif' }}>+5K</button></td>
                <td style={{ textAlign: 'center', fontWeight: 700 }}>{u.bookingCount || 0}</td>
                <td><Badge s={u.status === 'active' ? 'Active' : 'suspended'} sm/></td>
                <td><div style={{ display: 'flex', gap: 4 }}><button onClick={() => setSel(u)} style={{ fontSize: 11.5, padding: '3px 8px', border: '1px solid #E0E0E0', borderRadius: 3, background: '#fff', color: '#555', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }} onMouseEnter={e => { e.currentTarget.style.borderColor = '#C8102E'; e.currentTarget.style.color = '#C8102E'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = '#E0E0E0'; e.currentTarget.style.color = '#555'; }}>View</button><button onClick={() => suspend(u)} style={{ fontSize: 11.5, padding: '3px 8px', border: 'none', borderRadius: 3, background: u.status === 'suspended' ? '#E8F5E9' : '#FFEBEE', color: u.status === 'suspended' ? '#2E7D32' : '#C8102E', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', fontWeight: 600 }}>{u.status === 'suspended' ? 'Activate' : 'Suspend'}</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sel && <div onClick={() => setSel(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 2000, display: 'flex', alignItems: 'center', justify_content: 'center', padding: 20 }}><div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', maxWidth: 520, width: '100%', boxShadow: '0 24px 72px rgba(0,0,0,.25)', maxHeight: '90vh', overflowY: 'auto' }}><div style={{ background: `linear-gradient(135deg,${TC[sel.loyalty?.tier] || '#C8102E'},${TC[sel.loyalty?.tier] || '#C8102E'}88)`, padding: '18px 22px' }}><div style={{ display: 'flex', gap: 14, alignItems: 'center' }}><div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justify_content: 'center', fontSize: 22, fontWeight: 900, color: '#fff' }}>{(sel.firstName || 'U')[0]}</div><div><div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{sel.firstName} {sel.lastName}</div><div style={{ fontSize: 12, color: 'rgba(255,255,255,.7)', marginTop: 2 }}>{sel.email}</div></div></div></div><div style={{ padding: '20px 22px' }}><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11, marginBottom: 14 }}>{[['Tier', sel.loyalty?.tier || 'Blue'], ['Miles', (sel.loyalty?.points || 0).toLocaleString('en-IN')], ['Bookings', sel.bookingCount || 0], ['Spend', sel.totalSpend ? fmtINR(sel.totalSpend) : '—'], ['Status', sel.status], ['Member ID', sel.loyalty?.memberId || '—']].map(([k, v]) => (<div key={k} style={{ padding: '9px 12px', background: '#FAFAFA', borderRadius: 5, border: '1px solid #F0F0F0' }}><div style={{ fontSize: 10, color: '#AAA', textTransform: 'uppercase', letterSpacing: .8, marginBottom: 2 }}>{k}</div><div style={{ fontSize: 13.5, fontWeight: 700, color: '#1A1A1A' }}>{v}</div></div>))}</div><div style={{ display: 'flex', gap: 8 }}><button onClick={() => setSel(null)} style={{ flex: 1, padding: '10px', border: '1px solid #E0E0E0', borderRadius: 4, background: '#fff', color: '#555', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', fontSize: 13.5 }}>Close</button><button onClick={() => { addMiles(sel.id, 10000); setSel({ ...sel, loyalty: { ...sel.loyalty, points: (sel.loyalty?.points || 0) + 10000 } }); }} style={{ flex: 1, padding: '10px', background: '#2E7D32', border: 'none', color: '#fff', fontWeight: 700, fontSize: 13.5, borderRadius: 4, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>+10K miles</button><button onClick={() => { suspend(sel); setSel({ ...sel, status: sel.status === 'suspended' ? 'active' : 'suspended' }); }} style={{ flex: 1, padding: '10px', background: sel.status === 'suspended' ? '#2E7D32' : '#C8102E', border: 'none', color: '#fff', fontWeight: 700, fontSize: 13.5, borderRadius: 4, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>{sel.status === 'suspended' ? 'Activate' : 'Suspend'}</button></div></div></div></div>}
    </div>
  );
}

function RevenueSection() {
  const [liveBookings2, setLiveBookings2] = useState([]);
  const [loading, setLoading] = useState(true);

  const [monthlyTrend, setMonthlyTrend] = useState([]);

  useEffect(() => {
    Promise.all([
      adminGetAllBookings(),
      revenueService.getMonthlyTrend()
    ]).then(([b, rt]) => {
      setLiveBookings2(b || []);
      setMonthlyTrend(rt || []);
      setLoading(false);
    });
  }, []);

  const totalRevenue = liveBookings2.filter(b => b.status !== 'cancelled').reduce((s, b) => s + (b.totalAmount || 0), 0);
  const confirmed = liveBookings2.filter(b => b.status === 'confirmed').length;
  const cancelled = liveBookings2.filter(b => b.status === 'cancelled').length;
  const avgBookingValue = liveBookings2.length ? Math.round(totalRevenue / liveBookings2.length) : 0;

  const byCabin = ['Economy', 'Premium Economy', 'Business', 'First'].map(cabin => {
    const revenue = liveBookings2.filter(b => b.cabinClass === cabin && b.status !== 'cancelled').reduce((s, b) => s + (b.totalAmount || 0), 0);
    return { cabin, revenue, pct: totalRevenue ? Math.round(revenue / totalRevenue * 100) : 0 };
  });

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthly = months.map((month, i) => ({
    month,
    revenue: liveBookings2.filter(b => b.status !== 'cancelled' && new Date(b.createdAt?.seconds ? b.createdAt.seconds * 1000 : b.createdAt).getMonth() === i).reduce((s, b) => s + (b.totalAmount || 0), 0)
  }));

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading revenue data…</div>;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 18 }}>
        {[[fmtINR(totalRevenue), 'Total Revenue', '#2E7D32', '💰'], [fmtINR(avgBookingValue), 'Avg Booking', '#1565C0', '📊'], [`${Math.round(confirmed / (liveBookings2.length || 1) * 100)}%`, 'Conversion', '#C8102E', '🎯'], [`${cancelled}`, 'Cancelled', '#888', '↩']].map(([v, l, c, ic]) => (
          <div key={l} style={{ background: '#fff', border: '1px solid #E8E8E8', borderRadius: 6, padding: '18px 20px', borderLeft: `4px solid ${c}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}><div style={{ fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: .8 }}>{l}</div><span style={{ fontSize: 22 }}>{ic}</span></div>
            <div style={{ fontSize: 24, fontWeight: 900, color: c, letterSpacing: -1 }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
        <div style={{ background: '#fff', border: '1px solid #E8E8E8', borderRadius: 6, padding: '20px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Revenue by cabin</div>
          {byCabin.map(({ cabin, revenue, pct }) => (<div key={cabin} style={{ marginBottom: 13 }}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}><span style={{ fontWeight: 600 }}>{cabin}</span><span>{fmtINR(revenue)} <span style={{ color: '#AAA' }}>({pct}%)</span></span></div><div style={{ height: 7, background: '#F0F0F0', borderRadius: 3, overflow: 'hidden' }}><div style={{ height: '100%', width: `${pct}%`, background: { 'Economy': '#1565C0', 'Premium Economy': '#2E7D32', 'Business': '#C8102E', 'First': '#6A1B9A' }[cabin] || '#888', borderRadius: 3 }}/></div></div>))}
        </div>
        <div style={{ background: '#fff', border: '1px solid #E8E8E8', borderRadius: 6, padding: '20px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Top recent bookings</div>
          {liveBookings2.filter(b => b.status !== 'cancelled').slice(0, 6).map((b, i) => {
            const pct = totalRevenue ? Math.round((b.totalAmount || 0) / totalRevenue * 100) : 0;
            const cols = ['#C8102E', '#1565C0', '#2E7D32', '#6A1B9A', '#F57F17', '#00838F'];
            return (<div key={b.id} style={{ marginBottom: 11 }}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}><span><strong>{b.pnr}</strong> <span style={{ color: '#AAA' }}>· {b.cabinClass}</span></span><span><strong>{fmtINR(b.totalAmount)}</strong> ({pct}%)</span></div><div style={{ height: 6, background: '#F0F0F0', borderRadius: 3, overflow: 'hidden' }}><div style={{ height: '100%', width: `${pct}%`, background: cols[i % 6], borderRadius: 3 }}/></div></div>);
          })}
        </div>
      </div>
      <div style={{ background: '#fff', border: '1px solid #E8E8E8', borderRadius: 6, padding: '20px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 18 }}>Monthly revenue {new Date().getFullYear()}</div>
        <div style={{ display: 'flex', gap: 5, alignItems: 'flex-end', height: 160 }}>
          {monthlyTrend.map(({ month, revenue }, i) => { 
            const max = Math.max(...monthlyTrend.map(m => m.revenue), 1); 
            return (<div key={month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}><div style={{ fontSize: 9, color: '#AAA', fontWeight: 700 }}>₹{revenue}L</div><div style={{ width: '100%', background: 'linear-gradient(to top,#C8102E,#ff3355)', borderRadius: '3px 3px 0 0', height: `${(revenue / max) * 150}px`, minHeight: 4 }}/><div style={{ fontSize: 9.5, color: '#AAA' }}>{month}</div></div>); 
          })}
        </div>
      </div>
    </div>
  );
}

function FleetSection() {
  const [fleet, setFleet] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fleetService.getAll().then(a => {
      setFleet(a || []);
      setLoading(false);
    });
  }, []);

  const toggle = async id => {
    const a = fleet.find(f => f.id === id);
    if (!a) return;
    const newStatus = a.status === 'active' ? 'maintenance' : 'active';
    await fleetService.update(id, { status: newStatus });
    const updated = await fleetService.getAll();
    setFleet(updated);
    toast.success('Status updated');
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading fleet…</div>;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 18 }}>
        {[['Active', fleet.filter(f => f.status === 'active').length, '#2E7D32'], ['Maintenance', fleet.filter(f => f.status === 'maintenance').length, '#F57F17'], ['Total', fleet.length, '#C8102E'], ['Avg age', Math.round(fleet.reduce((s, a) => s + (a.age || 1), 0) / (fleet.length || 1)) + 'y', '#1565C0']].map(([l, v, c]) => (
          <div key={l} style={{ background: '#fff', border: `1px solid ${c}33`, borderRadius: 5, padding: '12px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: c }}>{v}</div>
            <div style={{ fontSize: 11, color: '#AAA', textTransform: 'uppercase', letterSpacing: .8, marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ background: '#fff', border: '1px solid #E8E8E8', borderRadius: 6, overflow: 'hidden' }}>
        <table className="data-table">
          <thead><tr>{['Registration', 'Type', 'Status', 'Age', 'Cycles', 'Hours', 'Seats', 'Base', 'Next maint', 'Actions'].map(h => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {fleet.map(a => (
              <tr key={a.id}>
                <td><span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#C8102E' }}>{a.reg}</span></td>
                <td style={{ fontWeight: 600 }}>{a.type}</td>
                <td><Badge s={a.status} sm/></td>
                <td>{a.age} yrs</td>
                <td style={{ fontWeight: 600 }}>{(a.cycles || 0).toLocaleString()}</td>
                <td style={{ fontWeight: 600 }}>{(a.hours || 0).toLocaleString()}</td>
                <td style={{ fontWeight: 600 }}>{a.seats}</td>
                <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>{a.base}</td>
                <td style={{ color: new Date(a.nextMaint) < new Date(Date.now() + 30 * 86400000) ? '#F57F17' : '#555', fontSize: 12.5 }}>{a.nextMaint}</td>
                <td><button onClick={() => toggle(a.id)} style={{ fontSize: 11.5, padding: '3px 9px', border: 'none', borderRadius: 3, background: a.status === 'active' ? '#FFF8E1' : '#E8F5E9', color: a.status === 'active' ? '#F57F17' : '#2E7D32', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', fontWeight: 600 }}>{a.status === 'active' ? 'Maint' : 'Activate'}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RoutesSection() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRoutes = async () => {
    const r = await getCollection('routes');
    setRoutes(r);
    setLoading(false);
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const toggle = async id => {
    const r = routes.find(x => x.id === id);
    if (!r) return;
    const newStatus = r.status === 'active' ? 'inactive' : 'active';
    await updateDocument('routes', id, { status: newStatus });
    await fetchRoutes();
    toast.success('Route updated');
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading routes…</div>;
  return (
    <div>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:14 }}>
        {[['Active',routes.filter(r=>r.status==='active').length,'#2E7D32'],['Inactive',routes.filter(r=>r.status!=='active').length,'#C8102E'],['Total',routes.length,'#1565C0'],['Avg load',Math.round(routes.reduce((s,r)=>s+(r.avgLoad||0),0)/(routes.length||1))+'%','#F57F17']].map(([l,v,c])=>(
          <div key={l} style={{ background:'#fff',border:`1px solid ${c}33`,borderRadius:5,padding:'11px',textAlign:'center' }}><div style={{ fontSize:22,fontWeight:900,color:c }}>{v}</div><div style={{ fontSize:11,color:'#AAA',textTransform:'uppercase',letterSpacing:.8,marginTop:2 }}>{l}</div></div>
        ))}
      </div>
      <div style={{ background:'#fff',border:'1px solid #E8E8E8',borderRadius:6,overflow:'hidden' }}>
        <table className="data-table">
          <thead><tr>{['Route','Origin','Dest','Freq','Cabins','Avg load','Rev/wk','Margin','Status','Actions'].map(h=><th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {routes.map(r=>(
              <tr key={r.id}>
                <td style={{ fontFamily:'monospace',fontWeight:700,color:'#C8102E' }}>{r.id}</td>
                <td style={{ fontWeight:600 }}>{r.origin}</td><td style={{ fontWeight:600 }}>{r.destination}</td>
                <td>{r.frequency || 'Daily'}</td>
                <td><span style={{ fontFamily:'monospace',fontSize:11.5,color:'#555' }}>{(r.cabins || []).join('/') || 'Economy'}</span></td>
                <td><div style={{ display:'flex',alignItems:'center',gap:6,minWidth:80 }}><div style={{ flex:1,height:5,background:'#F0F0F0',borderRadius:3,overflow:'hidden' }}><div style={{ height:'100%',width:`${r.avgLoad||0}%`,background:(r.avgLoad||0)>80?'#2E7D32':(r.avgLoad||0)>60?'#F57F17':'#C8102E',borderRadius:3 }}/></div><span style={{ fontSize:12,fontWeight:700,color:(r.avgLoad||0)>80?'#2E7D32':(r.avgLoad||0)>60?'#F57F17':'#C8102E' }}>{r.avgLoad||0}%</span></div></td>
                <td style={{ fontWeight:700 }}>{fmtINR((((r.avgLoad||70)/100)*300*(typeof r.frequency==='string'?r.frequency.split('/')[0]?.replace(/\D/g,''):7)||7)*1500000)}</td>
                <td><span style={{ fontWeight:700,color:(r.profitMargin||0)>30?'#2E7D32':(r.profitMargin||0)>20?'#F57F17':'#C8102E' }}>{r.profitMargin||0}%</span></td>
                <td><Badge s={r.status} sm/></td>
                <td><button onClick={()=>toggle(r.id)} style={{ fontSize:11.5,padding:'3px 9px',border:'none',borderRadius:3,background:r.status==='active'?'#FFEBEE':'#E8F5E9',color:r.status==='active'?'#C8102E':'#2E7D32',cursor:'pointer',fontFamily:'DM Sans,sans-serif',fontWeight:600 }}>{r.status==='active'?'Suspend':'Activate'}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PromosSection() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', discountType: 'percentage', discountValue: 10, cabin: 'All', validFrom: '', validUntil: '', usageLimit: 0 });

  const fetchPromos = async () => {
    const p = await getCollection('pricing_rules');
    setPromos(p || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const add = async () => {
    if (!form.code || !form.name) { toast.error('Fill required fields'); return; }
    const np = { ...form, status: 'active', used: 0 };
    await addDocument('pricing_rules', np);
    await fetchPromos();
    setShowNew(false);
    toast.success('Promo created: ' + form.code);
  };

  const toggle = async id => {
    const p = promos.find(x => x.id === id);
    if (!p) return;
    await updateDocument('pricing_rules', id, { status: p.status === 'active' ? 'expired' : 'active' });
    await fetchPromos();
    toast.success('Updated');
  };

  const del = async id => {
    if (!window.confirm('Delete?')) return;
    await deleteDocument('pricing_rules', id);
    await fetchPromos();
    toast.success('Deleted');
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading promos…</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: '#888' }}>{promos.filter(p => p.status === 'active').length} active / {promos.filter(p => p.status === 'expired').length} expired</span>
        <button onClick={() => setShowNew(true)} className="btn-red" style={{ padding: '9px 18px', fontSize: 13 }}>+ Create promo</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 14 }}>
        {promos.map(p => {
          const usedPct = p.usageLimit > 0 ? Math.round((p.used || 0) / p.usageLimit * 100) : null;
          return (<div key={p.id} style={{ background: '#fff', border: `1.5px solid ${p.status === 'active' ? '#E0E0E0' : '#F5F5F5'}`, borderRadius: 6, padding: '16px 18px', opacity: p.status === 'expired' ? .65 : 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}><div><span style={{ fontFamily: 'monospace', fontSize: 17, fontWeight: 900, color: '#C8102E', letterSpacing: 1 }}>{p.code}</span><div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', marginTop: 3 }}>{p.name}</div></div><Badge s={p.status} sm/></div>
            <div style={{ fontSize: 13.5, color: '#555', marginBottom: 10, fontWeight: 600 }}>{p.discountType === 'percentage' ? `${p.discountValue}% off` : `₹${p.discountValue} off`} {p.cabin !== 'All' ? `• ${p.cabin}` : ''}</div>
            <div style={{ display: 'flex', gap: 14, fontSize: 12, color: '#888', marginBottom: 10 }}><span>📅 Until {p.validUntil}</span><span>🎫 {(p.used || 0).toLocaleString()} used</span>{p.usageLimit > 0 && <span>Limit: {p.usageLimit.toLocaleString()}</span>}</div>
            {usedPct != null && (<div style={{ marginBottom: 12 }}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginBottom: 3 }}><span style={{ color: '#AAA' }}>Usage</span><span style={{ fontWeight: 700, color: usedPct > 80 ? '#C8102E' : usedPct > 60 ? '#F57F17' : '#2E7D32' }}>{usedPct}%</span></div><div style={{ height: 5, background: '#F0F0F0', borderRadius: 3, overflow: 'hidden' }}><div style={{ height: '100%', width: `${usedPct}%`, background: usedPct > 80 ? '#C8102E' : usedPct > 60 ? '#F57F17' : '#2E7D32', borderRadius: 3 }}/></div></div>)}
            <div style={{ display: 'flex', gap: 7 }}>
              <button onClick={() => toggle(p.id)} style={{ flex: 1, padding: '7px', border: '1px solid #E0E0E0', borderRadius: 4, background: '#fff', color: '#555', fontSize: 12.5, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', fontWeight: 600 }} onMouseEnter={e => { e.currentTarget.style.borderColor = '#C8102E'; e.currentTarget.style.color = '#C8102E'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = '#E0E0E0'; e.currentTarget.style.color = '#555'; }}>{p.status === 'active' ? 'Deactivate' : 'Activate'}</button>
              <button onClick={() => del(p.id)} style={{ padding: '7px 13px', border: 'none', borderRadius: 4, background: '#FFEBEE', color: '#C8102E', fontSize: 12.5, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', fontWeight: 600 }}>Delete</button>
            </div>
          </div>);
        })}
      </div>
      {showNew && <div onClick={() => setShowNew(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}><div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', width: 480, boxShadow: '0 24px 72px rgba(0,0,0,.25)' }}><div style={{ background: '#C8102E', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div style={{ color: '#fff', fontSize: 15, fontWeight: 700 }}>Create promo code</div><button onClick={() => setShowNew(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.7)', fontSize: 20, cursor: 'pointer' }}>×</button></div><div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 13 }}><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}><div><label className="field-label">Code *</label><input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} className="field-input" placeholder="SUMMER25"/></div><div><label className="field-label">Name *</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="field-input" placeholder="Summer Sale"/></div></div><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}><div><label className="field-label">Type</label><select value={form.discountType} onChange={e => setForm(f => ({ ...f, discountType: e.target.value }))} className="field-input" style={{ cursor: 'pointer' }}><option value="percentage">Percentage</option><option value="fixed">Fixed amount</option></select></div><div><label className="field-label">Value</label><input type="number" value={form.discountValue} onChange={e => setForm(f => ({ ...f, discountValue: +e.target.value }))} className="field-input"/></div></div><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}><div><label className="field-label">Valid from</label><input type="date" value={form.validFrom} onChange={e => setForm(f => ({ ...f, validFrom: e.target.value }))} className="field-input"/></div><div><label className="field-label">Valid until</label><input type="date" value={form.validUntil} onChange={e => setForm(f => ({ ...f, validUntil: e.target.value }))} className="field-input"/></div></div><div><label className="field-label">Usage limit (0 = unlimited)</label><input type="number" value={form.usageLimit} onChange={e => setForm(f => ({ ...f, usageLimit: +e.target.value }))} className="field-input"/></div><div style={{ display: 'flex', gap: 10 }}><button onClick={() => setShowNew(false)} style={{ flex: 1, padding: '11px', border: '1px solid #E0E0E0', borderRadius: 4, background: '#fff', color: '#555', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', fontSize: 13.5 }}>Cancel</button><button onClick={add} className="btn-red" style={{ flex: 2, padding: '11px', fontSize: 13.5 }}>Create</button></div></div></div></div>}
    </div>
  );
}

function LoyaltySection() {
  const [las, setLas] = useState([]);
  const [pts, setPts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getCollection('loyalty_accounts'),
      getCollection('points_transactions')
    ]).then(([l, p]) => {
      setLas(l);
      setPts(p);
      setLoading(false);
    });
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading loyalty data…</div>;

  return (
    <div>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:18 }}>
        {['Blue','Silver','Gold','Platinum'].map(t=>{const c=TC[t];const n=las.filter(la=>la.tier===t).length;return(<div key={t} style={{ background:'#fff',border:`2px solid ${c}33`,borderRadius:6,padding:'16px',textAlign:'center' }}><div style={{ fontSize:24,fontWeight:900,color:c }}>{n}</div><div style={{ fontSize:12,color:'#AAA',textTransform:'uppercase',letterSpacing:1,marginTop:4 }}>{t} members</div></div>);})}
      </div>
      <div style={{ background:'#fff',border:'1px solid #E8E8E8',borderRadius:6,overflow:'hidden',marginBottom:18 }}>
        <div style={{ padding:'13px 18px',borderBottom:'1px solid #F0F0F0',fontSize:14,fontWeight:700 }}>Loyalty accounts</div>
        <table className="data-table">
          <thead><tr>{['Member ID','Tier','Points','Lifetime Pts','Transactions','Status'].map(h=><th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {las.map(la=>(
              <tr key={la.id}>
                <td><span style={{ fontFamily:'monospace',fontWeight:700,fontSize:12 }}>{la.memberId}</span></td>
                <td><span style={{ fontSize:12,fontWeight:700,color:TC[la.tier],background:TC[la.tier]+'18',padding:'3px 10px',borderRadius:100 }}>{la.tier}</span></td>
                <td style={{ fontWeight:800,color:'#C8102E' }}>{(la.points||0).toLocaleString('en-IN')}</td>
                <td style={{ fontWeight:600,color:'#777' }}>{(la.lifetimePoints||0).toLocaleString('en-IN')}</td>
                <td style={{ textAlign:'center' }}>{pts.filter(pt => pt.loyaltyAccountId === la.id).length}</td>
                <td><Badge s={la.status} sm/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ background:'#fff',border:'1px solid #E8E8E8',borderRadius:6,overflow:'hidden' }}>
        <div style={{ padding:'13px 18px',borderBottom:'1px solid #F0F0F0',fontSize:14,fontWeight:700 }}>Recent points transactions</div>
        <table className="data-table">
          <thead><tr>{['Account','Type','Points','Balance','Description','Date'].map(h=><th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {pts.map(pt=>(
              <tr key={pt.id}>
                <td style={{ fontFamily:'monospace',fontSize:12 }}>{pt.loyaltyAccountId}</td>
                <td><span style={{ fontSize:11.5,fontWeight:700,color:pt.type==='earn'?'#2E7D32':'#C8102E',background:pt.type==='earn'?'#E8F5E9':'#FFEBEE',padding:'2px 8px',borderRadius:100 }}>{pt.type}</span></td>
                <td style={{ fontWeight:800,color:pt.type==='earn'?'#2E7D32':'#C8102E' }}>{pt.type==='earn'?'+':''}{(pt.points||0).toLocaleString()}</td>
                <td style={{ fontWeight:600 }}>{(pt.balance||0).toLocaleString()}</td>
                <td style={{ fontSize:12.5,color:'#555' }}>{pt.description}</td>
                <td style={{ fontSize:12,color:'#888' }}>{new Date(pt.transactionDate).toLocaleDateString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PaymentsSection() {
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getCollection('payments'),
      getCollection('invoices')
    ]).then(([p, i]) => {
      setPayments(p);
      setInvoices(i);
      setLoading(false);
    });
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading payments…</div>;

  return (
    <div>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:18 }}>
        {[['Completed', payments.filter(p=>p.status==='completed').length, '#2E7D32'], ['Pending', payments.filter(p=>p.status==='pending').length, '#F57F17'], ['Refund Initiated', payments.filter(p=>p.status==='refund_initiated').length, '#6A1B9A'], ['Total Rev', fmtINR(payments.filter(p=>p.status==='completed').reduce((s,p)=>s+p.amount,0)), '#C8102E']].map(([l,v,c])=>(
          <div key={l} style={{ background:'#fff',border:`1px solid ${c}33`,borderRadius:5,padding:'12px 16px',textAlign:'center' }}><div style={{ fontSize:20,fontWeight:900,color:c }}>{v}</div><div style={{ fontSize:11,color:'#AAA',textTransform:'uppercase',letterSpacing:.8,marginTop:2 }}>{l}</div></div>
        ))}
      </div>
      <div style={{ background:'#fff',border:'1px solid #E8E8E8',borderRadius:6,overflow:'hidden',marginBottom:16 }}>
        <div style={{ padding:'13px 18px',borderBottom:'1px solid #F0F0F0',fontSize:14,fontWeight:700 }}>All payments</div>
        <table className="data-table">
          <thead><tr>{['Payment ID','Booking PNR','Amount','Method','Gateway','Gateway Ref','Status','Paid At'].map(h=><th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {payments.map(p=>(<tr key={p.id}><td style={{ fontFamily:'monospace',fontSize:11.5,color:'#555' }}>{p.id}</td><td style={{ fontFamily:'monospace',fontWeight:700,color:'#C8102E' }}>{p.pnr}</td><td style={{ fontWeight:800 }}>{fmtINR(p.amount)}</td><td style={{ textTransform:'capitalize' }}>{p.method}</td><td>{p.gateway}</td><td style={{ fontFamily:'monospace',fontSize:11.5,color:'#888' }}>{p.gatewayRef?.slice(0,18)||'—'}</td><td><Badge s={p.status} sm/></td><td style={{ fontSize:12,color:'#888' }}>{p.paidAt?new Date(p.paidAt).toLocaleDateString('en-IN'):'—'}</td></tr>))}
          </tbody>
        </table>
      </div>
      <div style={{ background:'#fff',border:'1px solid #E8E8E8',borderRadius:6,overflow:'hidden' }}>
        <div style={{ padding:'13px 18px',borderBottom:'1px solid #F0F0F0',fontSize:14,fontWeight:700 }}>Invoices</div>
        <table className="data-table">
          <thead><tr>{['Invoice No','Booking PNR','Amount','Status','Issued','Paid'].map(h=><th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {invoices.map(inv=>(<tr key={inv.id}><td style={{ fontFamily:'monospace',fontWeight:700,color:'#1565C0',fontSize:12 }}>{inv.invoiceNumber}</td><td style={{ fontFamily:'monospace',fontWeight:700,color:'#C8102E' }}>{inv.pnr}</td><td style={{ fontWeight:800 }}>{fmtINR(inv.amount)}</td><td><Badge s={inv.status} sm/></td><td style={{ fontSize:12,color:'#888' }}>{new Date(inv.issuedAt).toLocaleDateString('en-IN')}</td><td style={{ fontSize:12,color:'#888' }}>{inv.paidAt?new Date(inv.paidAt).toLocaleDateString('en-IN'):'—'}</td></tr>))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AuditSection() {
  const [q, setQ] = useState('');
  const [logs, setLogs] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getCollection('audit_logs'),
      getCollection('login_attempts')
    ]).then(([l, a]) => {
      setLogs(l);
      setAttempts(a);
      setLoading(false);
    });
  }, []);

  const filteredLogs = logs.slice().reverse().filter(l => !q || [l.userId, l.action, l.target, l.details].some(s => s?.toLowerCase().includes(q.toLowerCase())));

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading audit logs…</div>;


  return (
    <div>
      <div style={{ display:'flex',gap:10,marginBottom:14 }}><SI v={q} onChange={setQ} ph="Search action, user, target…"/></div>
      <div style={{ background:'#fff',border:'1px solid #E8E8E8',borderRadius:6,overflow:'hidden',marginBottom:16 }}>
        <div style={{ padding:'13px 18px',borderBottom:'1px solid #F0F0F0',fontSize:14,fontWeight:700 }}>Audit log — {logs.length} entries</div>
        <table className="data-table">
          <thead><tr>{['Timestamp','User','Action','Target','IP','Details'].map(h=><th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {logs.map(l=>(<tr key={l.id}><td style={{ fontSize:12,color:'#888',whiteSpace:'nowrap' }}>{new Date(l.timestamp).toLocaleString('en-IN')}</td><td style={{ fontFamily:'monospace',fontWeight:700,color:'#1565C0',fontSize:12 }}>{l.userId}</td><td><span style={{ fontSize:12,background:'#F5F5F0',padding:'2px 8px',borderRadius:4,fontFamily:'monospace' }}>{l.action}</span></td><td style={{ fontFamily:'monospace',fontWeight:700,color:'#C8102E',fontSize:12 }}>{l.target}</td><td style={{ fontFamily:'monospace',fontSize:11.5,color:'#AAA' }}>{l.ip}</td><td style={{ fontSize:12.5,color:'#555' }}>{l.details}</td></tr>))}
          </tbody>
        </table>
      </div>
      <div style={{ background:'#fff',border:'1px solid #E8E8E8',borderRadius:6,overflow:'hidden' }}>
        <div style={{ padding:'13px 18px',borderBottom:'1px solid #F0F0F0',fontSize:14,fontWeight:700 }}>Login attempts</div>
        <table className="data-table">
          <thead><tr>{['Timestamp','User','IP','Status','Device'].map(h=><th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {attempts.slice().reverse().map(la=>(<tr key={la.id}><td style={{ fontSize:12,color:'#888' }}>{new Date(la.timestamp).toLocaleString('en-IN')}</td><td style={{ fontFamily:'monospace',fontSize:12 }}>{la.userId}</td><td style={{ fontFamily:'monospace',fontSize:11.5,color:'#AAA' }}>{la.ip}</td><td><span style={{ fontSize:11.5,fontWeight:700,color:la.success?'#2E7D32':'#C8102E',background:la.success?'#E8F5E9':'#FFEBEE',padding:'2px 8px',borderRadius:100 }}>{la.success?'Success':'Failed'}</span></td><td style={{ fontSize:12,color:'#666' }}>{la.userAgent}</td></tr>))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SettingsSection() {
  const [s, setS] = useState({});
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    settingsService.getAll().then(data => {
      setS(data);
      setLoading(false);
    });
  }, []);

  const save = async () => {
    for (const [key, value] of Object.entries(s)) {
      await settingsService.update(key, value);
    }
    setSaved(true);
    toast.success('Settings saved!');
    setTimeout(() => setSaved(false), 2500);
  };

  const upd = (k, v) => setS(x => ({ ...x, [k]: v }));
  
  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading settings…</div>;

  const Toggle = ({ k, label, desc }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #F5F5F5' }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>{label}</div>
        {desc && <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{desc}</div>}
      </div>
      <button onClick={() => upd(k, s[k] === 'true' ? 'false' : 'true')} style={{ width: 48, height: 26, borderRadius: 13, border: 'none', background: s[k] === 'true' ? '#C8102E' : '#DDD', cursor: 'pointer', position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
        <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: s[k] === 'true' ? 25 : 3, transition: 'left .2s', boxShadow: '0 1px 4px rgba(0,0,0,.2)' }} />
      </button>
    </div>
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ background: '#fff', border: '1px solid #E8E8E8', borderRadius: 6, padding: '20px' }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>General settings</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            {[['site_name', 'Airline name'], ['support_email', 'Support email'], ['support_phone', 'Support phone']].map(([k, lbl]) => (
              <div key={k}><label className="field-label">{lbl}</label><input value={s[k] || ''} onChange={e => upd(k, e.target.value)} className="field-input"/></div>
            ))}
          </div>
        </div>
        <div style={{ background:'#fff', border:'1px solid #E8E8E8', borderRadius:6, padding:'20px' }}>
          <div style={{ fontSize:15, fontWeight:700, marginBottom:6 }}>Operations</div>
          <Toggle k="maintenance_mode" label="Maintenance mode" desc="Site shows maintenance page"/>
          <Toggle k="new_bookings" label="Accept bookings" desc="Allow new bookings"/>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ background: '#fff', border: '1px solid #E8E8E8', borderRadius: 6, padding: '20px' }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Skywards settings</div>
          <label className="field-label">Miles multiplier (global)</label>
          <input type="number" step=".1" value={s['loyalty_multiplier'] || '1'} onChange={e => upd('loyalty_multiplier', e.target.value)} className="field-input" style={{ marginBottom: 12 }}/>
          <div style={{ padding: '11px 14px', background: '#E3F2FD', borderRadius: 5, fontSize: 12.5, color: '#1565C0' }}>ℹ Set to 1.5 or 2 for bonus miles campaigns</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={save} className="btn-red" style={{ flex: 2, padding: '13px', fontSize: 14 }}>{saved ? '✓ Saved' : 'Save all settings'}</button>
          <button onClick={()=>toast.success('Exported!')} style={{ flex:1,padding:'13px',border:'1px solid #E0E0E0',borderRadius:4,background:'#fff',color:'#555',fontSize:13.5,cursor:'pointer',fontFamily:'DM Sans,sans-serif' }}>Export</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// MAIN ADMIN SHELL
// ══════════════════════════════════════════════════════════════════
export default function Admin() {
  const { userProfile, user, isAdmin, loading } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const seg = location.pathname.replace('/admin','').replace(/^\//,'').split('/')[0] || '';

  useEffect(() => {
    if (!loading && !isAdmin) {
      toast.error('Access denied. Admin privileges required.');
      navigate('/login', { state: { from: '/admin' } });
    }
  }, [isAdmin, loading, navigate]);

  if (loading) return <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#F5F5F0', color:'#888', fontWeight:600 }}>Verifying Authorization...</div>;
  if (!isAdmin) return null;

  const render = () => {
    switch(seg) {
      case '':          return <Dashboard/>;
      case 'bookings':  return <BookingsSection/>;
      case 'flights':   return <FlightsSection/>;
      case 'users':     return <UsersSection/>;
      case 'revenue':   return <RevenueSection/>;
      case 'fleet':     return <FleetSection/>;
      case 'routes':    return <RoutesSection/>;
      case 'promos':    return <PromosSection/>;
      case 'loyalty':   return <LoyaltySection/>;
      case 'payments':  return <PaymentsSection/>;
      case 'audit':     return <AuditSection/>;
      case 'settings':  return <SettingsSection/>;
      default:          return <Dashboard/>;
    }
  };

  const curLabel = TABS.find(t=>t.id===seg)?.label || 'Dashboard';

  return (
    <div style={{ background:'#F5F5F0', minHeight:'100vh', fontFamily:'DM Sans,sans-serif', display:'flex' }}>
      {/* Sidebar */}
      <div style={{ width:270, background:'#1A1A1A', position:'sticky', top:0, height:'100vh', overflowY:'auto', flexShrink:0, display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'22px 22px 16px', borderBottom:'1px solid rgba(255,255,255,.07)' }}>
          <div style={{ fontSize:11, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:2, marginBottom:5 }}>Admin Panel</div>
          <div style={{ fontSize:16, fontWeight:700, color:'#fff' }}>{userProfile?.name||user?.displayName||'Admin'}</div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,.4)', marginTop:2 }}>{user?.email||'admin@habibi.com'}</div>
        </div>
        <nav style={{ padding:'10px 0', flex:1 }}>
          {TABS.map(t=>{
            const active=seg===t.id;
            return (<button key={t.id} onClick={()=>navigate(`/admin${t.id?'/'+t.id:''}`)} style={{ display:'flex',alignItems:'center',gap:12,width:'100%',padding:'12px 22px',background:active?'rgba(200,16,46,.22)':'none',border:'none',borderLeft:`3px solid ${active?'#C8102E':'transparent'}`,cursor:'pointer',fontFamily:'DM Sans,sans-serif',transition:'all .15s',textAlign:'left' }} onMouseEnter={e=>{if(!active)e.currentTarget.style.background='rgba(255,255,255,.05)';}} onMouseLeave={e=>{if(!active)e.currentTarget.style.background='none';}}><span style={{ fontSize:17,width:22 }}>{t.icon}</span><span style={{ fontSize:14,fontWeight:active?700:400,color:active?'#fff':'rgba(255,255,255,.55)',transition:'color .15s' }}>{t.label}</span>{active&&<div style={{ marginLeft:'auto',width:6,height:6,borderRadius:'50%',background:'#C8102E' }}/>}</button>);
          })}
        </nav>
        <div style={{ padding:'14px 22px', borderTop:'1px solid rgba(255,255,255,.07)' }}>
          <div style={{ display:'flex',alignItems:'center',gap:6,fontSize:11.5,color:'rgba(255,255,255,.4)' }}>
            <div style={{ width:7,height:7,borderRadius:'50%',background:'#4CAF50',animation:'blink 2s ease infinite' }}/>
            All systems operational
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex:1, overflow:'auto' }}>
        <div style={{ background:'#fff', borderBottom:'1px solid #E8E8E8', padding:'16px 30px', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, zIndex:100 }}>
          <div>
            <div style={{ fontSize:22, fontWeight:800, color:'#1A1A1A' }}>{curLabel}</div>
            <div style={{ fontSize:12, color:'#AAA', marginTop:1 }}>{new Date().toLocaleDateString('en-US',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={()=>toast.success('Refreshed!')} style={{ padding:'8px 14px', border:'1px solid #E0E0E0', borderRadius:5, background:'#fff', color:'#555', fontSize:13, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>🔄 Refresh</button>
            <button onClick={()=>navigate('/')} style={{ padding:'8px 14px', border:'1px solid #C8102E', borderRadius:5, background:'transparent', color:'#C8102E', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>↗ View site</button>
          </div>
        </div>
        <div style={{ padding:'30px' }}>{render()}</div>
      </div>
    </div>
  );
}