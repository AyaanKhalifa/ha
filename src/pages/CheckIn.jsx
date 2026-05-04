// src/pages/CheckIn.jsx — Full online check-in with multi-segment and multi-passenger support
import React, { useState } from 'react';
import { checkinService } from '../services/api';
import { AIRPORTS } from '../utils/flightData';
import toast from '../utils/toast';
import { jsPDF } from 'jspdf';
import WizardSteps from '../components/WizardSteps';

const AP = Object.fromEntries(AIRPORTS.map(a=>[a.code,a]));

function BoardingPass({ flight, passenger, pnr, seat, cabin }) {
  const paxName = typeof passenger === 'string' ? passenger : `${passenger.firstName} ${passenger.lastName}`;
  const gate = flight.gate || 'B22';
  const terminal = flight.terminal || 'T3';
  const boardGroup = cabin === 'First' ? 'A' : cabin === 'Business' ? 'B' : 'C';
  
  return (
    <div className="js-boarding-pass" style={{ background:'linear-gradient(135deg,#C8102E,#7a0018)', borderRadius:12, padding:'28px', color:'#fff', maxWidth:680, margin:'0 auto 24px', position:'relative', overflow:'hidden', boxShadow:'0 20px 60px rgba(200,16,46,.25)' }}>
      <div style={{ position:'absolute', top:-60, right:-60, width:240, height:240, borderRadius:'50%', background:'rgba(255,255,255,.03)' }}/>
      
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:22, fontWeight:600 }}>Habibi Airways</div>
          <div style={{ fontSize:10, opacity:.7, letterSpacing:'3px', textTransform:'uppercase', marginTop:2 }}>Official Boarding Pass</div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:10, opacity:.6, textTransform:'uppercase', letterSpacing:1 }}>Cabin Class</div>
          <div style={{ fontSize:16, fontWeight:900, color:'#C9A84C' }}>{cabin.toUpperCase()}</div>
        </div>
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:0, marginBottom:28 }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:56, fontWeight:900, letterSpacing:-3, lineHeight:1 }}>{flight.from}</div>
          <div style={{ fontSize:14, opacity:.8, marginTop:6 }}>{AP[flight.from]?.city||flight.from}</div>
        </div>
        <div style={{ flex:1, textAlign:'center', position:'relative' }}>
          <div style={{ position:'absolute', top:'50%', left:0, right:0, height:1, background:'rgba(255,255,255,.2)', zIndex:0 }}/>
          <span style={{ position:'relative', zIndex:1, background:'rgba(200,16,46,1)', padding:'0 12px', fontSize:22 }}>✈</span>
        </div>
        <div style={{ flex:1, textAlign:'right' }}>
          <div style={{ fontSize:56, fontWeight:900, letterSpacing:-3, lineHeight:1 }}>{flight.to}</div>
          <div style={{ fontSize:14, opacity:.8, marginTop:6 }}>{AP[flight.to]?.city||flight.to}</div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, borderTop:'1px solid rgba(255,255,255,.2)', paddingTop:20, marginBottom:20 }}>
        {[
          ['Passenger Name', paxName],
          ['Flight No.', flight.flightNum],
          ['Date', flight.date],
          ['Boarding Time', '08:45']
        ].map(([k,v])=>(
          <div key={k}>
            <div style={{ fontSize:9, opacity:.5, textTransform:'uppercase', letterSpacing:1.2, marginBottom:5 }}>{k}</div>
            <div style={{ fontSize:14, fontWeight:700 }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
        {[
          ['Gate', gate],
          ['Terminal', terminal],
          ['Zone', boardGroup],
          ['Seat', seat?.id || 'TBA']
        ].map(([k,v])=>(
          <div key={k} style={{ background:'rgba(0,0,0,.15)', borderRadius:8, padding:'12px', textAlign:'center', border:'1px solid rgba(255,255,255,.1)' }}>
            <div style={{ fontSize:9, opacity:.6, textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>{k}</div>
            <div style={{ fontSize:22, fontWeight:900, letterSpacing:-1 }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop:24, paddingTop:16, borderTop:'1px dashed rgba(255,255,255,.3)', display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
        <div>
          <div style={{ fontSize:9, opacity:.6, textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>Booking Reference (PNR)</div>
          <div style={{ fontFamily:'monospace', fontSize:26, fontWeight:900, letterSpacing:4 }}>{pnr}</div>
        </div>
        <div style={{ background:'#fff', color:'#C8102E', padding:'6px 12px', borderRadius:4, fontSize:10, fontWeight:900, letterSpacing:1 }}>SKYWARDS MEMBER</div>
      </div>
    </div>
  );
}

export default function CheckIn() {
  const [step, setStep]         = useState(1); // 1=lookup, 2=itinerary, 3=confirm, 4=boarding-pass
  const [pnr, setPnr]           = useState('');
  const [lastName, setLastName] = useState('');
  const [booking, setBooking]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [selectedLegs, setSelectedLegs] = useState([]);

  const lookup = async () => {
    if (!pnr.trim() || !lastName.trim()) {
      toast.error('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const data = await checkinService.lookup(pnr, lastName);
      if (!data) {
        toast.error('Booking not found. Please check your PNR and last name.');
      } else if (data.status !== 'confirmed') {
        toast.error('Check-in is only available for confirmed bookings.');
      } else {
        setBooking(data);
        setStep(2);
        toast.success('Booking found!');
      }
    } catch (e) {
      toast.error('Failed to look up booking');
    } finally {
      setLoading(false);
    }
  };

  const allPassengers = booking?.passengerList || [];

  const segments = [];
  if (booking?.tripType === 'multi-city' && booking.multiCityFlights) {
     booking.multiCityFlights.forEach(l => segments.push(l.selectedFlight || l));
  } else if (booking) {
     if (booking.flight) segments.push(booking.flight);
     if (booking.returnFlight) segments.push(booking.returnFlight);
  }

  const handleSegmentToggle = (idx) => {
    setSelectedLegs(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  };

  const doCheckin = async () => {
    if (selectedLegs.length === 0) { toast.error('Select at least one flight segment'); return; }
    setLoading(true);
    try {
      await checkinService.doCheckin(booking.id, 'AUTO');
      setStep(4);
      toast.success('Check-in successful! 🎉');
    } catch (e) {
      toast.error('Check-in failed');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    let pageCount = 0;
    
    selectedLegs.forEach((idx) => {
      const f = segments[idx];
      allPassengers.forEach((p, pIdx) => {
        if (pageCount > 0) doc.addPage();
        pageCount++;
        
        // Premium Header
        doc.setFillColor(200, 16, 46);
        doc.rect(0, 0, 210, 45, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(26);
        doc.text('HABIBI AIRWAYS', 20, 28);
        doc.setFontSize(14);
        doc.text('BOARDING PASS', 155, 28);
        
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(36);
        doc.text(`${f.from}`, 20, 75);
        doc.setFontSize(18);
        doc.text('→', 65, 75);
        doc.setFontSize(36);
        doc.text(`${f.to}`, 85, 75);
        
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text('PASSENGER', 20, 95);
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.text(`${p.firstName.toUpperCase()} ${p.lastName.toUpperCase()}`, 20, 102);

        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text('FLIGHT', 20, 120);
        doc.text('DATE', 70, 120);
        doc.text('CLASS', 120, 120);
        
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.text(`${f.flightNum}`, 20, 128);
        doc.text(`${f.date || booking.date}`, 70, 128);
        doc.text(`${booking.cabinClass.toUpperCase()}`, 120, 128);

        doc.setFillColor(245, 245, 245);
        doc.rect(20, 140, 170, 40, 'F');
        
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text('GATE', 30, 153);
        doc.text('TERMINAL', 75, 153);
        doc.text('SEAT', 125, 153);
        doc.text('PNR', 160, 153);

        doc.setTextColor(200, 16, 46);
        doc.setFontSize(22);
        doc.text(`${f.gate || 'B22'}`, 30, 168);
        doc.text(`${f.terminal || 'T3'}`, 75, 168);
        
        const seat = (booking.selectedSeats?.[f.id]?.id) ? booking.selectedSeats[f.id] : booking.selectedSeats?.[f.id]?.[pIdx];
        doc.text(`${seat?.id || 'TBA'}`, 125, 168);
        doc.text(`${booking.pnr}`, 160, 168);
        
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(9);
        doc.text('Please arrive at the gate at least 45 minutes before departure.', 20, 195);
      });
    });
    
    doc.save(`Habibi_BoardingPasses_${booking.pnr}.pdf`);
    toast.success('PDF generated successfully!');
  };

  return (
    <div style={{ background:'#F8F7F4', minHeight:'100vh', fontFamily:'DM Sans,sans-serif' }}>
      <WizardSteps active={4} />
      
      <div style={{ background:'linear-gradient(135deg,#C8102E,#7a0018)', padding:'48px 24px' }}>
        <div className="container">
          <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(2.2rem,4vw,3.2rem)', fontWeight:400, color:'#fff', marginBottom:8 }}>Online Check-in</h1>
          <p style={{ fontSize:15, color:'rgba(255,255,255,.8)' }}>Manage your journey and generate boarding passes instantly.</p>
        </div>
      </div>

      <div className="container" style={{ padding:'32px 24px 80px', maxWidth:800 }}>
        {step===1 && (
          <div style={{ background:'#fff', border:'1px solid #E0E0E0', borderRadius:12, padding:'40px', boxShadow:'0 10px 30px rgba(0,0,0,.05)', maxWidth:560, margin:'0 auto' }}>
            <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:28, fontWeight:500, marginBottom:12 }}>Retrieve Booking</h2>
            <p style={{ fontSize:14, color:'#888', marginBottom:32 }}>Enter your 6-character PNR code and last name to begin.</p>
            <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
              <div>
                <label className="field-label">Booking Reference (PNR)</label>
                <input value={pnr} onChange={e=>setPnr(e.target.value.toUpperCase())} className="field-input" style={{ fontSize:22, fontWeight:900, letterSpacing:4, fontFamily:'monospace', textAlign:'center', height:60 }} placeholder="E.G. HAX782" maxLength={6}/>
              </div>
              <div>
                <label className="field-label">Last Name</label>
                <input value={lastName} onChange={e=>setLastName(e.target.value)} className="field-input" placeholder="As on passport" style={{ height:54 }}/>
              </div>
              <button onClick={lookup} disabled={loading} className="btn-red" style={{ padding:'16px', fontSize:16, justifyContent:'center', borderRadius:8, marginTop:10 }}>{loading?'Identifying booking…':'Find Booking'}</button>
            </div>
          </div>
        )}

        {step===2 && booking && (
          <div style={{ maxWidth:600, margin:'0 auto' }}>
            <h3 style={{ fontSize:22, fontWeight:800, marginBottom:20, color:'#1A1A1A' }}>Select segments for check-in</h3>
            {segments.map((f, i) => (
              <div key={i} onClick={() => handleSegmentToggle(i)} style={{ background:'#fff', border:`2.5px solid ${selectedLegs.includes(i)?'#C8102E':'#EEE'}`, borderRadius:10, padding:'24px', marginBottom:16, cursor:'pointer', transition:'all .2s', boxShadow: selectedLegs.includes(i) ? '0 8px 24px rgba(200,16,46,.1)' : 'none' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <div style={{ fontWeight:900, fontSize:20, color:'#1A1A1A' }}>{f.from} → {f.to}</div>
                    <div style={{ fontSize:14, color:'#666', marginTop:6 }}>{f.flightNum} · {f.date || booking.date} · {f.depStr}</div>
                  </div>
                  <div style={{ width:30, height:30, borderRadius:'50%', border:`2px solid ${selectedLegs.includes(i)?'#C8102E':'#EEE'}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {selectedLegs.includes(i) && <span style={{ color:'#C8102E', fontWeight:900 }}>✓</span>}
                  </div>
                </div>
              </div>
            ))}
            <button onClick={() => setStep(3)} disabled={selectedLegs.length===0} className="btn-red" style={{ width:'100%', padding:'16px', fontSize:16, justifyContent:'center', marginTop:16, borderRadius:8 }}>Proceed to Confirmation</button>
          </div>
        )}

        {step===3 && (
          <div style={{ background:'#fff', border:'1px solid #E0E0E0', borderRadius:12, padding:'40px', textAlign:'center', maxWidth:560, margin:'0 auto' }}>
            <div style={{ fontSize:48, marginBottom:20 }}>📄</div>
            <h3 style={{ fontSize:24, fontWeight:800, marginBottom:12 }}>Confirm Departure</h3>
            <p style={{ fontSize:16, color:'#555', marginBottom:32, lineHeight:1.6 }}>You are about to check in <strong>{allPassengers.length}</strong> traveler(s) for <strong>{selectedLegs.length}</strong> flight segment(s). Please ensure your travel documents are valid.</p>
            <div style={{ display:'flex', gap:12 }}>
              <button onClick={()=>setStep(2)} className="btn-ghost" style={{ flex:1, padding:'14px' }}>Back</button>
              <button onClick={doCheckin} disabled={loading} className="btn-red" style={{ flex:2, padding:'14px', fontSize:16, justifyContent:'center' }}>{loading?'Confirming…':'Complete Check-in'}</button>
            </div>
          </div>
        )}

        {step===4 && (
          <div>
            <div style={{ textAlign:'center', marginBottom:48 }}>
              <div style={{ width:80, height:80, background:'#E8F5E9', borderRadius:'50%', color:'#2E7D32', fontSize:40, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>✓</div>
              <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:36, fontWeight:500, color:'#1A1A1A' }}>Check-in Complete</h2>
              <p style={{ fontSize:16, color:'#666', marginTop:8 }}>Your boarding passes are ready for download.</p>
            </div>
            
            <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
              {selectedLegs.map(idx => (
                allPassengers.map((p, pIdx) => {
                  const seat = (booking.selectedSeats?.[segments[idx].id]?.id) ? booking.selectedSeats[segments[idx].id] : booking.selectedSeats?.[segments[idx].id]?.[pIdx];
                  return (
                    <BoardingPass 
                      key={`${idx}-${pIdx}`}
                      flight={segments[idx]} 
                      passenger={p}
                      pnr={booking.pnr}
                      seat={seat}
                      cabin={booking.cabinClass}
                    />
                  );
                })
              ))}
            </div>
            
            <div style={{ marginTop:48, background:'#fff', padding:'32px', borderRadius:12, border:'1px solid #E0E0E0', textAlign:'center' }}>
                <button onClick={downloadPDF} className="btn-red" style={{ padding:'18px 48px', fontSize:16, fontWeight:800, borderRadius:8, boxShadow:'0 10px 30px rgba(200,16,46,0.2)' }}>
                   ⬇ Download All Boarding Passes (PDF)
                </button>
                <div style={{ marginTop:20, fontSize:13, color:'#888' }}>
                  A copy of these boarding passes has also been sent to your registered email.
                </div>
            </div>
          </div>
        )}
      </div>
      <style>{`
        .field-label { display:block; fontSize:12; fontWeight:800; textTransform:uppercase; letterSpacing:1; color:#888; marginBottom:8; textAlign:left; }
        .field-input { width:100%; border:2px solid #EEE; borderRadius:8; padding:12px 16px; fontSize:15; outline:none; transition:border-color .2s; }
        .field-input:focus { border-color:#C8102E; }
      `}</style>
    </div>
  );
}
