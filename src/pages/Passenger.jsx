// src/pages/Passenger.jsx — Full passenger details form
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import WizardSteps from '../components/WizardSteps';
import { AIRPORTS } from '../utils/flightData';
import toast from '../utils/toast';

const AP = Object.fromEntries(AIRPORTS.map(a=>[a.code,a]));
const TITLES  = ['Mr','Mrs','Ms','Miss','Dr','Prof'];
const NATIONS = ['India','UAE','USA','UK','Pakistan','Australia','Germany','France',
  'Japan','Singapore','Canada','Saudi Arabia','Qatar','Kuwait'];
const MEALS   = ['Standard','Vegetarian','Vegan','Halal','Kosher','Gluten-free',
  'Hindu Vegetarian','Diabetic','Child meal'];

function PassengerForm({ index, type, data, onChange, isOpen, onToggle }) {
  const lbl = type === 'adult'
    ? index === 0 ? 'Lead passenger' : `Adult ${index + 1}`
    : type === 'child' ? `Child ${index + 1}` : `Infant ${index + 1}`;
  
  const upd = (k, v) => onChange({ ...data, [k]: v });

  return (
    <div style={{ background:'#fff', border:`1.5px solid ${isOpen ? '#C8102E' : '#E0E0E0'}`, borderRadius:8,
      overflow:'hidden', marginBottom:16, transition: 'all 0.2s', boxShadow: isOpen ? '0 4px 12px rgba(200,16,46,0.08)' : 'none' }}>
      
      <div 
        onClick={onToggle}
        style={{ padding:'18px 24px', background: isOpen ? '#FFF5F5' : '#FAFAFA',
        borderBottom: isOpen ? '1px solid #F0F0F0' : 'none', display:'flex',
        justifyContent:'space-between', alignItems:'center', cursor: 'pointer' }}>
        <div style={{ display:'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize:16, fontWeight:800, color:'#1A1A1A' }}>
              {index === 0 && type === 'adult' ? '👤 ' : '👥 '}{lbl}
            </div>
            {!isOpen && data.firstName && data.lastName && (
               <div style={{ fontSize: 14, color: '#555', fontWeight: 600 }}>— {data.title} {data.firstName} {data.lastName}</div>
            )}
            {!isOpen && (!data.firstName || !data.lastName) && (
               <div style={{ fontSize: 13, color: '#C8102E', fontWeight: 600 }}>— Incomplete</div>
            )}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {index === 0 && (
              <span style={{ fontSize:12, background:'#E3F2FD', color:'#1565C0',
                padding:'4px 10px', borderRadius:100, fontWeight:700 }}>
                Contact person
              </span>
            )}
            <span style={{ fontSize: 24, color: '#C8102E', fontWeight: 300, width:24, textAlign:'center' }}>
                {isOpen ? '−' : '+'}
            </span>
        </div>
      </div>

      {isOpen && (
      <div style={{ padding:'24px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'100px 1fr 1fr', gap:16, marginBottom:20 }}>
          <div>
            <label className="field-label">Title *</label>
            <select value={data.title || ''} onChange={e => upd('title', e.target.value)}
              className="field-input" style={{ cursor:'pointer' }}>
              <option value="">—</option>
              {TITLES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">First name *</label>
            <input value={data.firstName || ''} onChange={e => upd('firstName', e.target.value)}
              className="field-input" placeholder="As on passport" />
          </div>
          <div>
            <label className="field-label">Last name *</label>
            <input value={data.lastName || ''} onChange={e => upd('lastName', e.target.value)}
              className="field-input" placeholder="As on passport" />
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
          <div>
            <label className="field-label">Date of birth *</label>
            <input type="date" value={data.dob || ''} onChange={e => upd('dob', e.target.value)}
              className="field-input" />
          </div>
          <div>
            <label className="field-label">Nationality *</label>
            <select value={data.nationality || 'India'}
              onChange={e => upd('nationality', e.target.value)}
              className="field-input" style={{ cursor:'pointer' }}>
              {NATIONS.map(n => <option key={n}>{n}</option>)}
            </select>
          </div>
        </div>

        {type !== 'infant' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
            <div>
              <label className="field-label">Passport / ID number</label>
              <input value={data.passportNo || ''} onChange={e => upd('passportNo', e.target.value.toUpperCase())}
                className="field-input" placeholder="e.g. Z9876543" />
            </div>
            <div>
              <label className="field-label">Passport expiry date</label>
              <input type="date" value={data.passportExpiry || ''}
                onChange={e => upd('passportExpiry', e.target.value)}
                className="field-input" />
            </div>
          </div>
        )}

        {/* Frequent Flyer inline */}
        {type === 'adult' && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20, padding:'16px', background:'#FAFAFA', borderRadius:6, border:'1px solid #EEE' }}>
                <div>
                <label className="field-label">Frequent flyer programme</label>
                <select className="field-input"><option>Habibi Skywards</option></select>
                </div>
                <div>
                <label className="field-label">Membership number</label>
                <input value={data.ffNumber || ''} onChange={e => upd('ffNumber', e.target.value)}
                    className="field-input" placeholder="e.g. 12345678" />
                </div>
            </div>
        )}

        <div style={{ display:'grid',
          gridTemplateColumns: index === 0 && type === 'adult' ? '1fr 1fr 1fr' : '1fr', gap:16 }}>
          {index === 0 && type === 'adult' && (
            <>
              <div>
                <label className="field-label">Email address *</label>
                <input type="email" value={data.email || ''}
                  onChange={e => upd('email', e.target.value)}
                  className="field-input" placeholder="name@example.com" />
              </div>
              <div>
                <label className="field-label">Phone number *</label>
                <input type="tel" value={data.phone || ''}
                  onChange={e => upd('phone', e.target.value)}
                  className="field-input" placeholder="+91 98765 43210" />
              </div>
            </>
          )}
          <div>
            <label className="field-label">Meal preference (Optional)</label>
            <select value={data.meal || 'Standard'}
              onChange={e => upd('meal', e.target.value)}
              className="field-input" style={{ cursor:'pointer' }}>
              {MEALS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

export default function Passenger() {
  const { searchParams, setSearchParams, setPassenger } = useBooking();
  const { user, userProfile } = useAuth();
  const { convertPrice } = useApp();
  const navigate = useNavigate();
  const sp = searchParams || {};
  const pax = sp.passengers || { adults:1, children:0, infants:0 };

  const [openIndex, setOpenIndex] = useState(0);

  const buildInitial = () => {
    const list = [];
    for (let i = 0; i < (pax.adults || 1); i++) {
      list.push({
        type:'adult', title:'Mr',
        firstName: i === 0 && userProfile?.name ? userProfile.name.split(' ')[0] : '',
        lastName: i === 0 && userProfile?.name ? userProfile.name.split(' ').slice(1).join(' ') : '',
        dob:'', nationality:'India', passportNo:'', passportExpiry:'', meal:'Standard',
        email: i === 0 ? (user?.email || '') : '',
        phone: i === 0 ? '' : '',
        ffNumber: i === 0 ? (userProfile?.loyaltyId || '') : ''
      });
    }
    for (let i = 0; i < (pax.children || 0); i++) {
      list.push({ type:'child', title:'Miss', firstName:'', lastName:'', dob:'',
        nationality:'India', passportNo:'', passportExpiry:'', meal:'Child meal' });
    }
    for (let i = 0; i < (pax.infants || 0); i++) {
      list.push({ type:'infant', title:'Master', firstName:'', lastName:'', dob:'',
        nationality:'India', meal:'Standard' });
    }
    return list;
  };

  const [passengers, setPassengers] = useState(() => {
    if (sp.allPassengers && sp.allPassengers.length === ((pax.adults||1) + (pax.children||0) + (pax.infants||0))) {
      return sp.allPassengers;
    }
    return buildInitial();
  });

  const updatePax = (idx, data) => {
    setPassengers(prev => prev.map((p, i) => i === idx ? data : p));
  };

  const autofill = () => {
    if (!userProfile && !user) { toast.error('Please log in to autofill'); return; }
    updatePax(0, {
      ...passengers[0],
      title: 'Mr',
      firstName: userProfile?.name?.split(' ')[0] || 'Demo',
      lastName: userProfile?.name?.split(' ').slice(1).join(' ') || 'User',
      email: user?.email || 'demo@habibi.com',
      phone: '+91 98765 43210',
      dob: '1992-06-15',
      nationality: 'India',
      passportNo: 'Z9876543',
      passportExpiry: '2028-06-14',
      meal: 'Standard',
      ffNumber: userProfile?.loyaltyId || '12345678'
    });
    toast.success('Details filled from your profile');
    setOpenIndex(1 < passengers.length ? 1 : 0);
  };

  const validate = () => {
    for (const [i, p] of passengers.entries()) {
      if (!p.title) { toast.error(`Please select a title for passenger ${i+1}`); setOpenIndex(i); return false; }
      if (!p.firstName?.trim()) { toast.error(`Please enter first name for passenger ${i+1}`); setOpenIndex(i); return false; }
      if (!p.lastName?.trim()) { toast.error(`Please enter last name for passenger ${i+1}`); setOpenIndex(i); return false; }
      if (!p.dob) { toast.error(`Please enter date of birth for passenger ${i+1}`); setOpenIndex(i); return false; }
      if (i === 0 && !p.email?.trim()) { toast.error(`Please enter email for contact person`); setOpenIndex(0); return false; }
      if (i === 0 && !p.phone?.trim()) { toast.error(`Please enter phone for contact person`); setOpenIndex(0); return false; }
    }
    return true;
  };

  const handleContinue = () => {
    if (!validate()) return;
    setPassenger(passengers[0]);
    setSearchParams(prev => ({
      ...prev,
      passenger: passengers[0],
      allPassengers: passengers,
      ffNumber: passengers[0].ffNumber // backwards compatibility
    }));
    navigate('/addons');
  };

  return (
    <div style={{ background:'#F8F7F4', minHeight:'100vh', fontFamily:'DM Sans,sans-serif' }}>
      <WizardSteps active={1}/>

      <div style={{ background:'linear-gradient(135deg,#C8102E,#7a0018)', padding:'24px 24px' }}>
        <div className="container">
          <div style={{ fontSize:24, fontWeight:700, color:'#fff', marginBottom:4 }}>Passenger details</div>
          <div style={{ fontSize:14, color:'rgba(255,255,255,.8)' }}>
            Enter details exactly as they appear on your passport or ID.
          </div>
        </div>
      </div>

      <div className="container" style={{ padding:'32px 24px 56px',
        display:'grid', gridTemplateColumns:'1fr 340px', gap:32, alignItems:'start' }}>
        <div>
          {user && (
            <div style={{ background:'#E3F2FD', border:'1px solid #BBDEFB', borderRadius:8, padding:'16px 20px', marginBottom:24, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ fontSize:14, color:'#1565C0', fontWeight:600 }}>💡 Save time by autofilling from your profile</div>
              <button onClick={autofill} style={{ padding:'10px 24px', background:'#1565C0', border:'none', color:'#fff', fontWeight:700, fontSize:14, borderRadius:4, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>Autofill My Details</button>
            </div>
          )}

          {passengers.map((p, i) => (
            <PassengerForm 
              key={i} 
              index={i} 
              type={p.type} 
              data={p} 
              onChange={d => updatePax(i, d)} 
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
            />
          ))}

          <div style={{ display:'flex', gap:16, marginTop:24 }}>
            <button onClick={() => navigate('/summary')} style={{ padding:'16px 24px', background:'#fff', border:'1px solid #E0E0E0', color:'#1A1A1A', fontWeight:700, borderRadius:8, cursor:'pointer' }}>← Back to summary</button>
            <button onClick={handleContinue} className="btn-red" style={{ flex:1, padding:'16px', fontSize:16, justifyContent:'center', borderRadius:8 }}>Save & Continue to Extras →</button>
          </div>
        </div>

        <div style={{ position:'sticky', top:90 }}>
          <div style={{ background:'#fff', border:'1px solid #E0E0E0', borderRadius:8, overflow:'hidden', boxShadow:'0 4px 12px rgba(0,0,0,.03)' }}>
            <div style={{ background:'#1A1A1A', color:'#fff', padding:'16px 20px', fontWeight:700, fontSize:14 }}> Booking overview</div>
            <div style={{ padding:'20px' }}>
              {[
                ['Route', sp.tripType==='multi-city'?'Multi-city':`${sp.from} → ${sp.to}`],
                ['Cabin', sp.cabinClass || 'Economy'],
                ['Passengers', (pax.adults||1)+(pax.children||0)+(pax.infants||0)],
              ].map(([k,v]) => (
                <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #F5F5F5', fontSize:13 }}>
                  <span style={{ color:'#888', textTransform:'uppercase', letterSpacing:1, fontSize:11 }}>{k}</span>
                  <span style={{ fontWeight:700, color:'#1A1A1A' }}>{v}</span>
                </div>
              ))}
              
              <div style={{ display:'flex', justifyContent:'space-between', paddingTop:'16px', marginTop:6 }}>
                <span style={{ fontSize:14, fontWeight:700 }}>Total</span>
                <span style={{ fontSize:22, fontWeight:900, color:'#C8102E', letterSpacing:-1 }}>{convertPrice(sp.totalAmount || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
