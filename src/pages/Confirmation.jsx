// src/pages/Confirmation.jsx — Multi-passenger boarding pass + download
import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { AIRPORTS } from '../utils/flightData';
import { fadeUp, staggerReveal, flyPlane } from '../utils/anime';
import toast from '../utils/toast';
import { jsPDF } from 'jspdf';

const AP = Object.fromEntries(AIRPORTS.map(a=>[a.code,a]));

function Confetti({ active }) {
  const colors = ['#C8102E','#C9A84C','#1565C0','#2E7D32','#6A1B9A'];
  if (!active) return null;
  return (
    <div style={{ position:'fixed',inset:0,pointerEvents:'none',overflow:'hidden',zIndex:5000 }}>
      {Array(80).fill(0).map((_,i)=>(
        <div key={i} style={{
          position:'absolute',
          left:`${Math.random()*100}%`,
          top:`-${Math.random()*20+5}%`,
          width:`${Math.random()*8+4}px`,
          height:`${Math.random()*14+6}px`,
          background:colors[i%colors.length],
          borderRadius:Math.random()>0.5?'50%':'2px',
          animation:`confettiFall ${Math.random()*2+2}s linear ${Math.random()*2}s both`,
          transform:`rotate(${Math.random()*360}deg)`,
          opacity:0.9,
        }}/>
      ))}
    </div>
  );
}

function BoardingPass({ flight, passenger, pnr, seat, cabin, fare }) {
  const from = AP[flight?.from] || { city:flight?.from||'Mumbai', code:flight?.from||'BOM' };
  const to   = AP[flight?.to]   || { city:flight?.to||'Dubai',   code:flight?.to||'DXB' };
  const flightNum = flight?.flightNum || 'HA101';
  const dateStr = flight?.date || 'Today';
  const gate = flight?.gate || 'B22';
  const terminal = flight?.terminal || 'T3';

  return (
    <div className="js-confirm-card" style={{ background:'#fff',borderRadius:12,overflow:'hidden',boxShadow:'0 15px 45px rgba(0,0,0,.12)',maxWidth:720,margin:'0 auto 20px',display:'flex',position:'relative', border:'1px solid #EEE' }}>
      <div style={{ width:20,background:'linear-gradient(180deg,#C8102E,#7a0018)',flexShrink:0,display:'flex',flexDirection:'column',justifyContent:'space-around',padding:'10px 0' }}>
         {Array(10).fill(0).map((_,i)=><div key={i} style={{ width:8,height:8,borderRadius:'50%',background:'#F8F7F4',margin:'0 auto' }}/>)}
      </div>
      <div style={{ flex:1,background:'linear-gradient(135deg,#C8102E 0%,#9e0b22 100%)',color:'#fff',padding:'24px' }}>
        <div style={{ display:'flex',justifyContent:'space-between',marginBottom:20 }}>
          <div style={{ display:'flex',alignItems:'center',gap:10 }}>
            <div style={{ width:32,height:32,borderRadius:'50%',background:'rgba(255,255,255,.2)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:10 }}>HA</div>
            <div style={{ fontSize:16,fontWeight:700 }}>Habibi Airways</div>
          </div>
          <div style={{ textAlign:'right' }}><div style={{ fontSize:10,opacity:.6 }}>CLASS</div><div style={{ fontSize:14,fontWeight:800 }}>{cabin.toUpperCase()}</div></div>
        </div>
        <div style={{ display:'flex',alignItems:'center',gap:0,marginBottom:20 }}>
          <div style={{ flex:1 }}><div style={{ fontSize:48,fontWeight:900,letterSpacing:-2 }}>{from.code}</div><div style={{ fontSize:12,opacity:.7 }}>{from.city}</div></div>
          <div style={{ flex:1,textAlign:'center' }}><div style={{ fontSize:18 }}>✈</div><div style={{ height:1,background:'rgba(255,255,255,.3)',margin:'4px 0' }}/></div>
          <div style={{ flex:1,textAlign:'right' }}><div style={{ fontSize:48,fontWeight:900,letterSpacing:-2 }}>{to.code}</div><div style={{ fontSize:12,opacity:.7 }}>{to.city}</div></div>
        </div>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,borderTop:'1px solid rgba(255,255,255,.2)',paddingTop:15 }}>
          {[
            ['👤', 'Passenger', `${passenger?.firstName} ${passenger?.lastName}`],
            ['🧳', 'Baggage', fare.bag],
            ['🔄', 'Changes', fare.changes],
            ['💰', 'Refund', fare.refund || (fare.refundable===true?'Full refund':fare.refundable==='partial'?'Partial refund':'Non-refundable')],
            ['🏢', 'Terminal', flight.terminal || 'T3'],
            ['🚪', 'Gate', flight.gate || 'TBA'],
          ].map(([ic,k,v]) => (
            <div key={k}><div style={{ fontSize:9,opacity:.6,textTransform:'uppercase' }}>{ic} {k}</div><div style={{ fontSize:12,fontWeight:700 }}>{v}</div></div>
          ))}
        </div>
      </div>
      <div style={{ width:1,borderLeft:'2px dashed #DDD',position:'relative' }}>
         <div style={{ position:'absolute',top:-10,left:-6,width:12,height:12,borderRadius:'50%',background:'#F8F7F4' }}/>
         <div style={{ position:'absolute',bottom:-10,left:-6,width:12,height:12,borderRadius:'50%',background:'#F8F7F4' }}/>
      </div>
      <div style={{ width:150,padding:'24px',background:'#fff',textAlign:'center',display:'flex',flexDirection:'column',justifyContent:'space-between' }}>
         <div><div style={{ fontSize:10,color:'#AAA' }}>PNR</div><div style={{ fontSize:18,fontWeight:900,color:'#C8102E' }}>{pnr}</div></div>
         <div style={{ width:80,height:80,background:'#EEE',margin:'10px auto',borderRadius:4,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,color:'#999' }}>QR Code</div>
         <div><div style={{ fontSize:10,color:'#AAA' }}>GATE</div><div style={{ fontSize:18,fontWeight:900 }}>{gate}</div></div>
      </div>
    </div>
  );
}

export default function Confirmation() {
  const { searchParams, clearBooking } = useBooking();
  const { convertPrice } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [confetti, setConfetti] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const heroRef = useRef(null);
  const passWrapRef = useRef(null);
  
  const pnr = searchParams?.pnr || 'HAB' + Math.random().toString(36).substring(2,5).toUpperCase();

  const segments = [];
  if (searchParams?.tripType === 'multi-city' && searchParams?.multiCityFlights) {
     searchParams.multiCityFlights.forEach(sec => segments.push(sec.selectedFlight || sec));
  } else {
     if (searchParams?.selectedFlight) segments.push(searchParams.selectedFlight);
     if (searchParams?.returnFlight) segments.push(searchParams.returnFlight);
  }

  const cabin = searchParams?.cabinClass || 'Economy';
  const selectedSeats = searchParams?.selectedSeats || {}; 
  const allPassengers = searchParams?.allPassengers || [{ firstName:'Traveler', lastName:'User' }];
  const total = searchParams?.totalAmount || 0;
  const fare = searchParams?.fare || { bag:'30kg', changes:'Permitted', refund:'Full refund' };

  useEffect(() => {
    fadeUp(heroRef.current);
    staggerReveal(passWrapRef.current?.querySelectorAll('.js-confirm-card'), 150);
    setTimeout(()=>setConfetti(false), 5000);
  }, []);

  const downloadBoardingPass = async () => {
    setDownloading(true);
    toast.success('Generating PDF tickets for all passengers...');
    try {
      const doc = new jsPDF();
      let pageCount = 0;
      
      segments.forEach((f) => {
        allPassengers.forEach((p, pIdx) => {
          if (pageCount > 0) doc.addPage();
          pageCount++;
          
          doc.setFillColor(200, 16, 46);
          doc.rect(0, 0, 210, 40, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(22);
          doc.text('HABIBI AIRWAYS', 20, 25);
          doc.setFontSize(14);
          doc.text(`PNR: ${pnr}`, 160, 25);
          
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(32);
          doc.text(`${f.from} > ${f.to}`, 20, 70);
          
          doc.setFontSize(12);
          doc.text(`Passenger: ${p.firstName} ${p.lastName}`, 20, 90);
          doc.text(`Flight: ${f.flightNum}`, 20, 100);
          doc.text(`Date: ${f.date || 'TBA'}`, 20, 110);
          doc.text(`Terminal: ${f.terminal || 'T3'} | Gate: ${f.gate || 'TBA'}`, 20, 120);
          
          const seat = (selectedSeats[f.id]?.id) ? selectedSeats[f.id] : selectedSeats[f.id]?.[pIdx];
          doc.text(`Seat: ${seat?.id || 'TBA'}`, 20, 130);
          doc.text(`Cabin: ${cabin}`, 20, 140);
        });
      });
      
      doc.save(`Habibi_Airways_Tickets_${pnr}.pdf`);
      toast.success('Tickets downloaded!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div style={{ background:'#F8F7F4',minHeight:'100vh',fontFamily:'DM Sans,sans-serif' }}>
      <Confetti active={confetti}/>
      <div ref={heroRef} style={{ background:'linear-gradient(135deg,#2E7D32,#1B5E20)',padding:'60px 24px',textAlign:'center' }}>
        <div style={{ fontSize:64,marginBottom:15 }}>🎉</div>
        <h1 style={{ fontFamily:'Cormorant Garamond,serif',fontSize:48,color:'#fff',marginBottom:10 }}>Booking Confirmed!</h1>
        <p style={{ fontSize:16,color:'rgba(255,255,255,.8)',marginBottom:30 }}>Your flight to {segments[0]?.to} is secured. PNR: <strong>{pnr}</strong></p>
        <div style={{ display:'inline-flex',gap:24,background:'rgba(255,255,255,.1)',borderRadius:8,padding:'16px 32px' }}>
           <div><div style={{ fontSize:11,opacity:.6 }}>TOTAL PAID</div><div style={{ fontSize:20,fontWeight:900,color:'#fff' }}>{convertPrice(total)}</div></div>
           <div style={{ width:1,background:'rgba(255,255,255,.2)' }}/>
           <div><div style={{ fontSize:11,opacity:.6 }}>STATUS</div><div style={{ fontSize:20,fontWeight:900,color:'#fff' }}>✓ Confirmed</div></div>
        </div>
      </div>

      <div ref={passWrapRef} className="container" style={{ padding:'40px 24px', maxWidth:800 }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:24 }}>
          <h2 style={{ fontFamily:'Cormorant Garamond,serif',fontSize:32,fontWeight:500 }}>Your boarding passes</h2>
          <button onClick={downloadBoardingPass} disabled={downloading} className="btn-red" style={{ padding:'10px 20px',fontSize:13 }}>
            {downloading ? 'Generating…' : '⬇ Download All (PDF)'}
          </button>
        </div>

        {segments.map((f) => (
          allPassengers.map((p, pIdx) => {
            const seat = (selectedSeats[f.id]?.id) ? selectedSeats[f.id] : selectedSeats[f.id]?.[pIdx];
            return (
              <BoardingPass 
                key={`${f.id}-${pIdx}`} 
                flight={f} 
                passenger={p} 
                pnr={pnr} 
                seat={seat} 
                cabin={cabin} 
                fare={fare}
              />
            );
          })
        ))}

        <div style={{ marginTop:40, textAlign:'center' }}>
           <Link to="/my-trips" className="btn-red" style={{ padding:'14px 32px' }}>View all my trips</Link>
           <button onClick={()=>{clearBooking(); navigate('/');}} className="btn-ghost" style={{ marginLeft:14 }}>Back to home</button>
        </div>
      </div>
      <style>{`@keyframes confettiFall{0%{transform:translateY(0) rotate(0)}100%{transform:translateY(110vh) rotate(720deg)}}`}</style>
    </div>
  );
}
