// src/pages/AddOns.jsx — Full seat map + all add-ons with per-segment and per-passenger support
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { useApp } from '../context/AppContext';
import WizardSteps from '../components/WizardSteps';
import { firestoreService } from '../services/firestore';
import toast from '../utils/toast';

// ── Seat Map Generator ────────────────────────────────────────────
function generateSeatMap(cabin, bookedSeatNumbers = new Set(), flightId = null) {
  const layouts = {
    First:           { rows:[[2,'AB','-','DE']],                  cols:'ABDE',    rowCount:7,  startRow:1  },
    Business:        { rows:[[4,'ACDF']],                          cols:'ACDF',    rowCount:14, startRow:1  },
    'Premium Economy':{ rows:[[7,'ABCDEFG']],                      cols:'ABCDEFG', rowCount:9,  startRow:20 },
    Economy:         { rows:[[9,'ABCDEFGHI']],                     cols:'ABCDEFGHI',rowCount:50,startRow:30 },
  };
  const cfg = layouts[cabin] || layouts.Economy;
  const colList = cfg.cols.split('');
  const seats = [];
  for (let r=cfg.startRow; r<cfg.startRow+cfg.rowCount; r++) {
    const row = { rowNum:r, seats:[] };
    colList.forEach((col) => {
      const id = `${r}${col}`;
      const isExit = r===cfg.startRow+1||r===cfg.startRow+3;
      const isWindow = col===colList[0]||col===colList[colList.length-1];
      const isAisle = col==='C'||col==='G'||col==='D'||col==='F';
      let type = 'standard';
      if (isExit) type='exit';
      else if (isWindow) type='window';
      else if (isAisle) type='aisle';
      row.seats.push({
        id, row:r, col, type,
        status: bookedSeatNumbers?.has(String(id).toUpperCase()) ? 'occupied' : 'available',
        seatDocId: flightId ? `SEAT_${flightId}_${id}` : undefined,
        price: isExit?4500:isWindow?1200:isAisle?1200:0,
        extraLegroom: isExit,
      });
    });
    seats.push(row);
  }
  return { seats, colList };
}

const SEAT_COLORS = {
  available_standard: '#E8F5E9', available_window:'#E3F2FD', available_aisle:'#FFF9C4',
  available_exit:'#F3E5F5', occupied:'#ECEFF1', selected:'#C8102E',
};
const SEAT_BORDER = { available_standard:'#A5D6A7', available_window:'#90CAF9', available_aisle:'#F9E69B', available_exit:'#CE93D8', occupied:'#CFD8DC', selected:'#9e0b22' };

function SeatMap({ cabin, flightId, bookedSeatNumbers, onSeatSelect, selectedSeatsForSegment, activePaxIdx }) {
  const { seats, colList } = generateSeatMap(cabin, bookedSeatNumbers, flightId);
  const [hoveredSeat, setHoveredSeat] = useState(null);
  const aisle = cabin==='Economy'?['C','D','G','H']:cabin==='Business'?['B','C']:[];

  const currentSelection = selectedSeatsForSegment?.[activePaxIdx];

  return (
    <div style={{ fontFamily:'DM Sans,sans-serif' }}>
      <div style={{ display:'flex',gap:14,flexWrap:'wrap',marginBottom:16,padding:'12px 16px',background:'#F8F8F8',borderRadius:5,border:'1px solid #EBEBEB' }}>
        {[['Available','#E8F5E9','#A5D6A7'],['Window','#E3F2FD','#90CAF9'],['Aisle','#FFF9C4','#F9E69B'],['Extra legroom','#F3E5F5','#CE93D8'],['Occupied','#ECEFF1','#CFD8DC'],['Selected','#C8102E','#9e0b22']].map(([l,bg,bdr])=>(
          <div key={l} style={{ display:'flex',alignItems:'center',gap:6,fontSize:12 }}>
            <div style={{ width:16,height:16,borderRadius:3,background:bg,border:`1.5px solid ${bdr}` }}/>
            {l}
          </div>
        ))}
      </div>

      <div style={{ overflowX:'auto' }}>
        <div style={{ minWidth:320,margin:'0 auto',maxWidth:480 }}>
          <div style={{ display:'flex',justifyContent:'center',gap:4,marginBottom:6,paddingLeft:36 }}>
            {colList.map((c,i)=>(
              <React.Fragment key={c}>
                {aisle.includes(c)&&i>0&&<div style={{ width:20 }}/>}
                <div style={{ width:28,textAlign:'center',fontSize:11,fontWeight:700,color:'#888' }}>{c}</div>
              </React.Fragment>
            ))}
          </div>

          {seats.map(row=>(
            <div key={row.rowNum} style={{ display:'flex',alignItems:'center',gap:4,marginBottom:4,justifyContent:'center' }}>
              <div style={{ width:28,textAlign:'right',fontSize:11,color:'#AAA',marginRight:4,flexShrink:0 }}>{row.rowNum}</div>
              {row.seats.map((seat,si)=>{
                // Check if anyone in this flight segment has this seat
                const isSelectedByCurrent = currentSelection?.id === seat.id;
                const selectedByOther = Object.entries(selectedSeatsForSegment || {})
                  .find(([idx, s]) => Number(idx) !== activePaxIdx && s?.id === seat.id);
                
                const isSelected = isSelectedByCurrent || !!selectedByOther;
                
                const statusKey = isSelectedByCurrent ? 'selected' : (selectedByOther ? 'occupied' : `${seat.status}_${seat.type}`);
                const bg = isSelectedByCurrent ? '#C8102E' : (SEAT_COLORS[statusKey] || '#EEE');
                const border = isSelectedByCurrent ? '#9e0b22' : (SEAT_BORDER[statusKey] || '#CCC');
                const isAisleGap = aisle.includes(seat.col)&&si>0;
                
                return (
                  <React.Fragment key={seat.id}>
                    {isAisleGap&&<div style={{ width:16 }}/>}
                    <div
                      onClick={()=>seat.status!=='occupied'&&!selectedByOther&&onSeatSelect(seat)}
                      onMouseEnter={()=>seat.status!=='occupied'&&!selectedByOther&&setHoveredSeat(seat)}
                      onMouseLeave={()=>setHoveredSeat(null)}
                      style={{ 
                        width:28,height:26,borderRadius:4,background:bg,border:`1.5px solid ${border}`,
                        cursor: (seat.status==='occupied' || !!selectedByOther) ? 'not-allowed' : 'pointer',
                        display:'flex',alignItems:'center',justifyContent:'center',fontSize:9.5,fontWeight:700,
                        color:isSelectedByCurrent?'#fff':(seat.status==='occupied'||selectedByOther)?'#AAA':'#555',
                        transition:'all .15s',position:'relative',flexShrink:0,
                        transform:hoveredSeat?.id===seat.id?'scale(1.12)':'scale(1)',
                        boxShadow:isSelectedByCurrent?'0 2px 8px rgba(200,16,46,.4)':hoveredSeat?.id===seat.id?'0 2px 6px rgba(0,0,0,.15)':'none' 
                      }}>
                      {isSelectedByCurrent?'✓':(seat.status==='occupied'||selectedByOther)?'×':seat.extraLegroom?'E':''}
                      {hoveredSeat?.id===seat.id&&(
                        <div style={{ position:'absolute',bottom:'calc(100% + 5px)',left:'50%',transform:'translateX(-50%)',background:'#1A1A1A',color:'#fff',borderRadius:4,padding:'5px 9px',fontSize:11,whiteSpace:'nowrap',zIndex:10,pointerEvents:'none' }}>
                          {seat.id} · {seat.type}{seat.price>0?` · ₹${seat.price}`:' · Free'}
                          <div style={{ position:'absolute',top:'100%',left:'50%',transform:'translateX(-50%)',width:0,height:0,borderLeft:'4px solid transparent',borderRight:'4px solid transparent',borderTop:'4px solid #1A1A1A' }}/>
                        </div>
                      )}
                    </div>
                  </React.Fragment>
                );
              })}
              <div style={{ width:28,textAlign:'left',fontSize:11,color:'#AAA',marginLeft:4 }}>{row.rowNum}</div>
            </div>
          ))}
        </div>
      </div>

      {currentSelection&&(
        <div style={{ marginTop:14,padding:'12px 16px',background:'#E8F5E9',border:'1px solid #C8E6C9',borderRadius:5,display:'flex',justifyContent:'space-between',alignItems:'center' }}>
          <div>
            <div style={{ fontSize:14,fontWeight:700,color:'#2E7D32' }}>✓ Passenger {activePaxIdx+1}: Seat {currentSelection.id}</div>
            <div style={{ fontSize:12.5,color:'#555',marginTop:2 }}>{currentSelection.type==='exit'?'Extra legroom · Exit row':currentSelection.type==='window'?'Window seat':currentSelection.type==='aisle'?'Aisle seat':'Standard seat'} {currentSelection.price>0?`· ₹${currentSelection.price}`:''}</div>
          </div>
          <button onClick={()=>onSeatSelect(null)} style={{ background:'none',border:'1px solid #C8E6C9',borderRadius:4,padding:'5px 12px',color:'#2E7D32',cursor:'pointer',fontSize:12,fontFamily:'DM Sans,sans-serif' }}>Remove seat</button>
        </div>
      )}
    </div>
  );
}

const BAGGAGE_OPTIONS = [
  { id:'BAG0',  icon:'🧳', name:'Standard allowance', price:0,    desc:'Included in fare' },
  { id:'BAG10', icon:'🧳', name:'Extra 10 kg',        price:5600, desc:'Total increased allowance' },
  { id:'BAG20', icon:'🧳', name:'Extra 20 kg',        price:9200, desc:'Total increased allowance' },
  { id:'BAG30', icon:'🧳', name:'Extra 30 kg',        price:12500,desc:'Total increased allowance' },
];

const MEAL_OPTIONS = [
  { id:'SNML',code:'SNML',name:'Standard meal',       icon:'🍽',  price:0,    desc:'Balanced airline meal with your choice of main' },
  { id:'VGML',code:'VGML',name:'Vegetarian',          icon:'🥗',  price:0,    desc:'Lacto-ovo vegetarian meal' },
  { id:'VVML',code:'VVML',name:'Vegan',               icon:'🌱',  price:0,    desc:'100% plant-based meal, no animal products' },
  { id:'GFML',code:'GFML',name:'Gluten-free',         icon:'🌾',  price:0,    desc:'No wheat, barley, rye or oats' },
];

const EXTRAS = [
  { id:'LNGE',  icon:'🏛', name:'Airport lounge access', price:1999,  desc:'Unlimited lounge access' },
  { id:'FAST',  icon:'⚡', name:'Fast track security',   price:799,   desc:'Skip the queue at security' },
  { id:'PRIO',  icon:'🎟', name:'Priority boarding',     price:599,   desc:'Board before Zone 1' },
];

export default function AddOns() {
  const { searchParams, setSearchParams } = useBooking();
  const { convertPrice } = useApp();
  const navigate = useNavigate();

  const tripType = searchParams?.tripType || 'one-way';
  const segments = [];
  if (tripType === 'multi-city' && searchParams?.multiCityFlights) {
     searchParams.multiCityFlights.forEach(l => segments.push(l.selectedFlight));
  } else {
     if (searchParams?.selectedFlight) segments.push(searchParams.selectedFlight);
     if (searchParams?.returnFlight) segments.push(searchParams.returnFlight);
  }

  const allPassengers = searchParams?.allPassengers || [];
  const adults = searchParams?.passengers?.adults || 1;
  const children = searchParams?.passengers?.children || 0;
  const totalPax = adults + children;

  const [activeLeg, setActiveLeg] = useState(0); 
  const [activePaxIdx, setActivePaxIdx] = useState(0);
  const [tab, setTab]           = useState('seat');
  
  // structure: { [flightId]: { [paxIdx]: seatObject } }
  const [selectedSeats, setSelectedSeats] = useState(searchParams?.selectedSeats || {}); 
  
  // Baggage is per passenger for the whole trip
  // structure: { [paxIdx]: baggageId }
  const [passengerBaggage, setPassengerBaggage] = useState(searchParams?.passengerBaggage || {});
  
  const [passengerMeals, setPassengerMeals] = useState(searchParams?.passengerMeals || {});
  const [passengerSegmentExtras, setPassengerSegmentExtras] = useState(searchParams?.passengerSegmentExtras || {});
  
  const cabin = searchParams?.cabinClass || 'Economy';
  const currentFlight = segments[activeLeg];
  const flightId = currentFlight?.id;
  const [bookedSeatNumbers, setBookedSeatNumbers] = useState(new Set());

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!flightId) {
        if (alive) setBookedSeatNumbers(new Set());
        return;
      }
      const docs = await firestoreService.getFlightSeats(flightId);
      if (!alive) return;
      const booked = new Set(
        docs.filter((s) => s?.isBooked).map((s) => String(s.seatNumber || '').toUpperCase()).filter(Boolean)
      );
      setBookedSeatNumbers(booked);
    })().catch(() => {
      if (alive) setBookedSeatNumbers(new Set());
    });
    return () => { alive = false; };
  }, [flightId]);

  const setPaxMeal = (pIdx, mealId) => {
    setPassengerMeals(prev => ({ ...prev, [pIdx]: mealId }));
  };

  const togglePaxExtra = (pIdx, extraId) => {
    if (!flightId) return;
    setPassengerSegmentExtras(prev => {
      const segObj = prev[flightId] || {};
      const paxExtras = segObj[pIdx] || [];
      const nextExtras = paxExtras.includes(extraId) 
          ? paxExtras.filter(x => x !== extraId) 
          : [...paxExtras, extraId];
      return { ...prev, [flightId]: { ...segObj, [pIdx]: nextExtras } };
    });
  };

  const setPaxBaggage = (pIdx, bagId) => {
    setPassengerBaggage(prev => ({ ...prev, [pIdx]: bagId }));
  };

  const handleSeatSelect = (seat) => {
    if (!flightId) return;
    setSelectedSeats(prev => {
      const segSeats = prev[flightId] || {};
      const newSegSeats = { ...segSeats };
      if (seat) {
        newSegSeats[activePaxIdx] = seat;
      } else {
        delete newSegSeats[activePaxIdx];
      }
      return { ...prev, [flightId]: newSegSeats };
    });
  };

  // Totals
  const seatsTotal = Object.values(selectedSeats).reduce((acc, paxMap) => {
    return acc + Object.values(paxMap || {}).reduce((s, st) => s + (st?.price || 0), 0);
  }, 0);
  
  const baggageTotal = Object.values(passengerBaggage).reduce((sum, bagId) => {
     return sum + (BAGGAGE_OPTIONS.find(b => b.id === bagId)?.price || 0);
  }, 0);

  const extrasTotal = Object.entries(passengerSegmentExtras).reduce((acc, [fId, paxMap]) => {
     let sum = 0;
     for (const pIdx in paxMap) {
         sum += paxMap[pIdx].reduce((s, id) => s + (EXTRAS.find(e => e.id === id)?.price || 0), 0);
     }
     return acc + sum;
  }, 0);
  
  const addonsTotal = seatsTotal + baggageTotal + extrasTotal;

  const handleContinue = () => {
    setSearchParams(prev => ({
      ...prev,
      selectedSeats, passengerMeals,
      passengerSegmentExtras,
      passengerBaggage,
      addonTotal: addonsTotal,
    }));
    navigate('/payment');
  };

  const TABS = [['seat','🪑 Seat selection'],['baggage','🧳 Extra baggage'],['meal','🍽 Meal preference'],['extras','✨ Extras']];

  return (
    <div style={{ background:'#F8F7F4',minHeight:'100vh',fontFamily:'DM Sans,sans-serif' }}>
      <WizardSteps active={2}/>
      <div className="container" style={{ padding:'24px 24px 56px',display:'grid',gridTemplateColumns:'1fr 340px',gap:22,alignItems:'start' }}>
        <div>
          {segments.length > 1 && tab !== 'baggage' && (
            <div style={{ display:'flex', gap:10, marginBottom:16, overflowX:'auto', paddingBottom:4 }}>
              {segments.map((f, i) => {
                const count = Object.keys(selectedSeats[f.id] || {}).length;
                return (
                  <button key={f.id} onClick={() => {setActiveLeg(i); setActivePaxIdx(0);}} style={{ 
                    padding:'10px 18px', borderRadius:8, border:`1.5px solid ${activeLeg===i?'#C8102E':'#E0E0E0'}`,
                    background:activeLeg===i?'#FFF5F5':'#fff', color:activeLeg===i?'#C8102E':'#666',
                    fontWeight:700, fontSize:13, cursor:'pointer', whiteSpace:'nowrap', transition:'all .2s'
                  }}>
                    Leg {i+1}: {f.from} → {f.to} {count > 0 ? `(${count}/${totalPax} seats)` : ''}
                  </button>
                );
              })}
            </div>
          )}

          <div style={{ background:'#fff',border:'1px solid #E0E0E0',borderRadius:6,overflow:'hidden',marginBottom:16 }}>
            <div style={{ display:'flex',borderBottom:'1px solid #EBEBEB' }}>
              {TABS.map(([id,lbl])=>(
                <button key={id} onClick={()=>setTab(id)} style={{ flex:1,padding:'14px',border:'none',borderBottom:`3px solid ${tab===id?'#C8102E':'transparent'}`,background:tab===id?'#FFF5F5':'#fff',color:tab===id?'#C8102E':'#666',fontWeight:tab===id?700:400,fontSize:13.5,cursor:'pointer',fontFamily:'DM Sans,sans-serif',transition:'all .2s' }}>{lbl}</button>
              ))}
            </div>

            <div style={{ padding:'20px' }}>
              {tab==='seat'&&(
                <div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:12 }}>
                    <h3 style={{ fontFamily:'Cormorant Garamond,serif',fontSize:24,fontWeight:500,color:'#1A1A1A' }}>{totalPax > 1 ? `Select seats for ${totalPax} passengers` : 'Select your seat'}</h3>
                    {segments.length > 1 && <span style={{ fontSize:12, color:'#C8102E', fontWeight:700 }}>Leg {activeLeg + 1} of {segments.length}</span>}
                  </div>

                  {totalPax > 1 && (
                    <div style={{ display:'flex', gap:8, marginBottom:20 }}>
                      {allPassengers.slice(0, totalPax).map((p, idx) => {
                        const sel = selectedSeats[flightId]?.[idx];
                        return (
                          <button key={idx} onClick={() => setActivePaxIdx(idx)} style={{
                            flex:1, padding:'10px', borderRadius:6, border:`1.5px solid ${activePaxIdx===idx?'#C8102E':(sel?'#2E7D32':'#E0E0E0')}`,
                            background: activePaxIdx===idx ? '#FFF5F5' : (sel ? '#E8F5E9' : '#fff'),
                            color: activePaxIdx===idx ? '#C8102E' : (sel ? '#2E7D32' : '#666'),
                            fontWeight: 700, fontSize:12.5, cursor:'pointer', transition:'all .2s'
                          }}>
                            {p.firstName} {p.lastName} {sel ? `(${sel.id})` : ''}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <p style={{ fontSize:13.5,color:'#888',marginBottom:18 }}>{cabin} cabin · {currentFlight?.from} to {currentFlight?.to}</p>
                  
                  <SeatMap
                    cabin={cabin}
                    flightId={flightId}
                    bookedSeatNumbers={bookedSeatNumbers}
                    onSeatSelect={handleSeatSelect}
                    selectedSeatsForSegment={selectedSeats[flightId]}
                    activePaxIdx={activePaxIdx}
                  />
                </div>
              )}

              {tab==='baggage'&&(
                <div>
                  <h3 style={{ fontFamily:'Cormorant Garamond,serif',fontSize:24,fontWeight:500,color:'#1A1A1A',marginBottom:8 }}>Extra Baggage</h3>
                  <p style={{ fontSize:13.5,color:'#888',marginBottom:24 }}>Select additional checked baggage allowance per passenger. This allowance applies to your entire journey.</p>
                  
                  <div style={{ display:'flex',flexDirection:'column',gap:24 }}>
                    {allPassengers.slice(0, totalPax).map((p, pIdx) => {
                       const currentBag = passengerBaggage[pIdx] || 'BAG0';
                       return (
                         <div key={pIdx} style={{ background:'#FAFAFA', border:'1px solid #EBEBEB', borderRadius:8, padding:'20px' }}>
                            <div style={{ fontSize:16, fontWeight:700, color:'#1A1A1A', marginBottom:16 }}>👤 {p.firstName} {p.lastName}</div>
                            <div style={{ display:'grid', gridTemplateColumns:`repeat(${BAGGAGE_OPTIONS.length}, 1fr)`, gap:12 }}>
                                {BAGGAGE_OPTIONS.map(b => (
                                   <div key={b.id} onClick={() => setPaxBaggage(pIdx, b.id)} style={{
                                       border:`1.5px solid ${currentBag === b.id ? '#C8102E' : '#E0E0E0'}`,
                                       background:currentBag === b.id ? '#FFF5F5' : '#fff',
                                       borderRadius:6, padding:'16px', cursor:'pointer', textAlign:'center', transition:'all .2s'
                                   }}>
                                      <div style={{ fontSize:20, marginBottom:8 }}>{b.icon}</div>
                                      <div style={{ fontSize:14, fontWeight:700, color:'#1A1A1A' }}>{b.name}</div>
                                      <div style={{ fontSize:12, color:'#888', marginTop:4 }}>{b.desc}</div>
                                      <div style={{ fontSize:14, fontWeight:800, color: currentBag === b.id ? '#C8102E' : '#1A1A1A', marginTop:12 }}>
                                         {b.price === 0 ? 'Included' : `+${convertPrice(b.price)}`}
                                      </div>
                                   </div>
                                ))}
                            </div>
                         </div>
                       )
                    })}
                  </div>
                </div>
              )}

              {tab==='meal'&&(
                <div>
                  <h3 style={{ fontFamily:'Cormorant Garamond,serif',fontSize:22,fontWeight:500,marginBottom:5,color:'#1A1A1A' }}>Meal preference</h3>
                  <p style={{ fontSize:13.5,color:'#888',marginBottom:18 }}>Select a meal preference for each passenger on this itinerary.</p>
                  
                  <div style={{ display:'flex',flexDirection:'column',gap:24 }}>
                    {allPassengers.slice(0, totalPax).map((p, pIdx) => {
                       const currentMeal = passengerMeals[pIdx] || 'SNML';
                       return (
                         <div key={pIdx} style={{ background:'#FAFAFA', border:'1px solid #EBEBEB', borderRadius:8, padding:'20px' }}>
                            <div style={{ fontSize:16, fontWeight:700, color:'#1A1A1A', marginBottom:16 }}>👤 {p.firstName} {p.lastName}</div>
                            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
                              {MEAL_OPTIONS.map(m=>(
                                <div key={m.id} onClick={()=>setPaxMeal(pIdx, m.id)}
                                  style={{ border:`2px solid ${currentMeal===m.id?'#C8102E':'#E0E0E0'}`,borderRadius:6,padding:'14px 16px',cursor:'pointer',background:currentMeal===m.id?'#FFF5F5':'#fff',transition:'all .15s',display:'flex',gap:12,alignItems:'flex-start' }}>
                                  <span style={{ fontSize:24,flexShrink:0 }}>{m.icon}</span>
                                  <div>
                                    <div style={{ fontWeight:700,fontSize:14,color:'#1A1A1A',marginBottom:3 }}>{m.name}</div>
                                    <div style={{ fontSize:12.5,color:'#777',lineHeight:1.5 }}>{m.desc}</div>
                                    <div style={{ fontSize:12,color:'#2E7D32',fontWeight:700,marginTop:4 }}>Free</div>
                                  </div>
                                  {currentMeal===m.id&&<span style={{ marginLeft:'auto',color:'#C8102E',fontSize:18,flexShrink:0 }}>✓</span>}
                                </div>
                              ))}
                            </div>
                         </div>
                       )
                    })}
                  </div>
                </div>
              )}

              {tab==='extras'&&(
                <div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:5 }}>
                    <h3 style={{ fontFamily:'Cormorant Garamond,serif',fontSize:22,fontWeight:500,color:'#1A1A1A' }}>Leg {activeLeg+1} Extras</h3>
                    {segments.length > 1 && <span style={{ fontSize:12, color:'#C8102E', fontWeight:700 }}>Segment Specific</span>}
                  </div>
                  <p style={{ fontSize:13.5,color:'#888',marginBottom:18 }}>Enhance your journey for the flight from {currentFlight?.from} to {currentFlight?.to}. Select extras per passenger.</p>
                  
                  <div style={{ display:'flex',flexDirection:'column',gap:24 }}>
                    {allPassengers.slice(0, totalPax).map((p, pIdx) => {
                       const currentExtras = passengerSegmentExtras[flightId]?.[pIdx] || [];
                       return (
                         <div key={pIdx} style={{ background:'#FAFAFA', border:'1px solid #EBEBEB', borderRadius:8, padding:'20px' }}>
                            <div style={{ fontSize:16, fontWeight:700, color:'#1A1A1A', marginBottom:16 }}>👤 {p.firstName} {p.lastName}</div>
                            <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
                              {EXTRAS.map(e=>{
                                const sel = currentExtras.includes(e.id);
                                return (
                                  <div key={e.id} style={{ border:`1.5px solid ${sel?'#C8102E':'#E0E0E0'}`,borderRadius:6,padding:'14px 18px',display:'flex',alignItems:'center',gap:14,background:sel?'#FFF5F5':'#fff',transition:'all .15s',cursor:'pointer' }} onClick={()=>togglePaxExtra(pIdx, e.id)}>
                                    <span style={{ fontSize:22,flexShrink:0 }}>{e.icon}</span>
                                    <div style={{ flex:1 }}>
                                      <div style={{ fontWeight:700,fontSize:14,color:'#1A1A1A' }}>{e.name}</div>
                                      <div style={{ fontSize:12.5,color:'#777',marginTop:2 }}>{e.desc}</div>
                                    </div>
                                    <div style={{ textAlign:'right',flexShrink:0 }}>
                                      <div style={{ fontSize:16,fontWeight:800,color:'#C8102E' }}>{convertPrice(e.price)}</div>
                                    </div>
                                    <div style={{ width:24,height:24,borderRadius:4,border:`2px solid ${sel?'#C8102E':'#DDD'}`,background:sel?'#C8102E':'#fff',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all .15s' }}>
                                      {sel&&<span style={{ color:'#fff',fontSize:14,fontWeight:700 }}>✓</span>}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                         </div>
                       )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={{ display:'flex',gap:12, marginTop:24 }}>
            <button onClick={()=>navigate('/passenger')} className="btn-ghost" style={{ padding:'13px 22px',fontSize:14 }}>← Back</button>
            <button onClick={handleContinue} className="btn-red" style={{ flex:1,padding:'13px',fontSize:15,justifyContent:'center' }}>Continue to payment →</button>
          </div>
        </div>

        <div style={{ position:'sticky',top:90 }}>
          <div style={{ background:'#fff',border:'1px solid #E0E0E0',borderRadius:6,overflow:'hidden' }}>
            <div style={{ padding:'14px 18px',background:'#1A1A1A',color:'#fff' }}>
              <div style={{ fontSize:14,fontWeight:700 }}>Add-ons summary</div>
            </div>
            <div style={{ padding:'16px 18px' }}>
              {segments.map((f, i) => {
                 const paxSeats = selectedSeats[f.id] || {};
                 const paxExtrasObj = passengerSegmentExtras[f.id] || {};
                 const hasSelection = Object.keys(paxSeats).length > 0 || Object.values(paxExtrasObj).some(arr => arr.length > 0);
                 if (!hasSelection) return null;
                 
                 return (
                   <div key={f.id} style={{ marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid #F5F5F5' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#C8102E', textTransform: 'uppercase', marginBottom: 4 }}>Leg {i+1}: {f.from} → {f.to}</div>
                      {allPassengers.slice(0, totalPax).map((px, pidx) => {
                          const s = paxSeats[pidx];
                          const pxExtras = paxExtrasObj[pidx] || [];
                          if (!s && pxExtras.length === 0) return null;
                          return (
                            <div key={pidx} style={{ marginBottom: 6 }}>
                              {s && (
                                <div style={{ display:'flex',justifyContent:'space-between',fontSize:12.5, color:'#444' }}>
                                  <span>{px.firstName} ({s.id})</span>
                                  <span style={{ fontWeight:700 }}>{s.price>0?convertPrice(s.price):'Free'}</span>
                                </div>
                              )}
                              {pxExtras.map(eid => {
                                  const e = EXTRAS.find(x => x.id === eid);
                                  return (
                                    <div key={eid} style={{ display:'flex',justifyContent:'space-between',fontSize:12.5, color:'#444', marginTop:2 }}>
                                      <span style={{ paddingLeft: s ? 12 : 0 }}>{px.firstName} ({e?.name})</span>
                                      <span style={{ fontWeight:700 }}>{convertPrice(e?.price || 0)}</span>
                                    </div>
                                  );
                              })}
                            </div>
                          );
                      })}
                   </div>
                 );
              })}

              {Object.keys(passengerBaggage).length > 0 && (
                 <div style={{ marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid #F5F5F5' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#C8102E', textTransform: 'uppercase', marginBottom: 4 }}>Baggage</div>
                    {Object.entries(passengerBaggage).map(([pIdx, bagId]) => {
                        if (bagId === 'BAG0') return null;
                        const px = allPassengers[pIdx];
                        const b = BAGGAGE_OPTIONS.find(x => x.id === bagId);
                        return (
                          <div key={pIdx} style={{ display:'flex',justifyContent:'space-between',fontSize:12.5, marginBottom:4, color:'#444' }}>
                            <span>{px?.firstName} (+{b?.name.replace('Extra ','')})</span>
                            <span style={{ fontWeight:700 }}>{convertPrice(b?.price || 0)}</span>
                          </div>
                        );
                    })}
                 </div>
              )}
              
              <div style={{ display:'flex',justifyContent:'space-between',padding:'12px 0',borderTop:'2px solid #1A1A1A',marginTop:6 }}>
                <span style={{ fontSize:14,fontWeight:700 }}>Subtotal</span>
                <span style={{ fontSize:16,fontWeight:800,color:'#C8102E' }}>{convertPrice(addonsTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
