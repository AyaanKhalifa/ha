// src/pages/Summary.jsx — Full booking summary with outbound/return toggle
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { useApp } from '../context/AppContext';
import WizardSteps from '../components/WizardSteps';
import { AIRPORTS } from '../utils/flightData';
import toast from '../utils/toast';

const AP = Object.fromEntries(AIRPORTS.map(a=>[a.code,a]));

function SegmentBox({ flight, cabin, fare, label, isReturn }) {
  if (!flight) return null;
  const from = AP[flight.from] || { city:flight.from, code:flight.from, name:flight.from };
  const to   = AP[flight.to]   || { city:flight.to,   code:flight.to,   name:flight.to };
  const dateStr = flight.date
    ? new Date(flight.date+'T00:00:00').toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'})
    : '';
  const arrDate = new Date(flight.arr);
  const depDate = new Date(flight.dep);
  const nextDay = arrDate.toDateString() !== depDate.toDateString();

  return (
    <div style={{ border:'1px solid #E0E0E0', borderRadius:6, overflow:'hidden', marginBottom:16 }}>
      {/* Header */}
      <div style={{ background:'#1A1A1A', padding:'11px 18px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:30, height:30, borderRadius:'50%', background:'linear-gradient(135deg,#C8102E,#8b0000)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <span style={{ fontFamily:'Cormorant Garamond,serif', fontWeight:700, fontSize:10, color:'#fff' }}>HA</span>
          </div>
          <span style={{ fontSize:13, fontWeight:700, color:'rgba(255,255,255,.9)', textTransform:'uppercase', letterSpacing:1 }}>{label}</span>
        </div>
        <span style={{ fontSize:12, color:'rgba(255,255,255,.5)' }}>{dateStr}</span>
      </div>

      <div style={{ padding:'20px 22px' }}>
        {/* Route */}
        <div style={{ display:'flex', alignItems:'center', gap:0, marginBottom:18 }}>
          {/* Depart */}
          <div style={{ minWidth:120 }}>
            <div style={{ fontSize:38, fontWeight:900, color:'#1A1A1A', letterSpacing:-2, lineHeight:1 }}>{flight.depStr}</div>
            <div style={{ fontSize:14, fontWeight:700, color:'#333', marginTop:5 }}>{from.code}</div>
            <div style={{ fontSize:12, color:'#888' }}>{from.city}</div>
            {from.name && <div style={{ fontSize:11.5, color:'#AAA', marginTop:2, maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{from.name}</div>}
          </div>

          {/* Duration / line */}
          <div style={{ flex:1, padding:'0 20px', textAlign:'center' }}>
            <div style={{ fontSize:12.5, color:'#888', marginBottom:8 }}>{flight.dur}</div>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div style={{ flex:1, height:1.5, background:'#E0E0E0' }}/>
              {flight.stops > 0 && (
                <>
                  <div style={{ width:10, height:10, borderRadius:'50%', background:'#fff', border:'2px solid #888' }}/>
                  <div style={{ flex:1, height:1.5, background:'#E0E0E0' }}/>
                </>
              )}
              <svg width="16" height="10" viewBox="0 0 16 10"><path d="M0 7l3-3 2 1 4-5 2 2 5-2" stroke="#555" strokeWidth="1.5" fill="none"/></svg>
            </div>
            <div style={{ fontSize:12, color:'#888', marginTop:6 }}>
              {flight.stops === 0 ? 'Non-stop' : `1 stop · ${AP[flight.via]?.city||flight.via}`}
            </div>
          </div>

          {/* Arrive */}
          <div style={{ minWidth:120, textAlign:'right' }}>
            <div style={{ fontSize:38, fontWeight:900, color:'#1A1A1A', letterSpacing:-2, lineHeight:1 }}>
              {flight.arrStr}
              {nextDay && <sup style={{ fontSize:13, color:'#C8102E', marginLeft:2 }}>+1</sup>}
            </div>
            <div style={{ fontSize:14, fontWeight:700, color:'#333', marginTop:5 }}>{to.code}</div>
            <div style={{ fontSize:12, color:'#888' }}>{to.city}</div>
            {to.name && <div style={{ fontSize:11.5, color:'#AAA', marginTop:2, maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginLeft:'auto' }}>{to.name}</div>}
          </div>
        </div>

        {/* Details row */}
        <div style={{ display:'flex', gap:18, flexWrap:'wrap', padding:'13px 0', borderTop:'1px solid #F5F5F5', borderBottom:'1px solid #F5F5F5', marginBottom:14 }}>
          {[
            ['✈', `${flight.flightNum} · ${flight.aircraft}`],
            ['💼', cabin],
            ...(fare ? [['🎫', fare.name]] : []),
            ['🧳', fare?.bag || (cabin==='Business'?'40 kg':'25 kg + 7 kg cabin')],
            ['🔄', fare?.changes || 'Free changes'],
          ].map(([ic,v]) => (
            <div key={v} style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'#555' }}>
              <span>{ic}</span><span>{v}</span>
            </div>
          ))}
        </div>

        {/* Fare features */}
        {fare && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
            {[
              ['🧳', 'Baggage', fare.bag],
              ['🔄', 'Changes', fare.changes],
              ['💰', 'Refund', fare.refund || (fare.refundable===true?'Full refund':fare.refundable==='partial'?'Partial refund':'Non-refundable')],
            ].map(([ic,k,v]) => (
              <div key={k} style={{ padding:'10px 12px', background:'#F8F7F4', borderRadius:5, border:'1px solid #EBEBEB' }}>
                <div style={{ fontSize:10, color:'#AAA', textTransform:'uppercase', letterSpacing:.8, marginBottom:3 }}>{ic} {k}</div>
                <div style={{ fontSize:12.5, fontWeight:700, color:'#1A1A1A' }}>{v}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Summary() {
  const { searchParams, setSearchParams } = useBooking();
  const { convertPrice } = useApp();
  const navigate = useNavigate();

  const sp = searchParams || {};
  const flight   = sp.selectedFlight;
  const cabin    = sp.cabinClass || 'Economy';
  const fare     = sp.fare;
  const returnFare = sp.returnFare;
  const tripType = sp.tripType || 'one-way';
  const multiCityFlights = sp.multiCityFlights || [];
  
  const pax      = (sp.passengers?.adults||1) + (sp.passengers?.children||0) + (sp.passengers?.infants||0);
  const paxAdults   = sp.passengers?.adults||1;
  const paxChildren = sp.passengers?.children||0;
  const paxInfants  = sp.passengers?.infants||0;

  // Prices calculation
  let totalBaseFare = 0;
  let taxes = 0;
  let total = 0;

  if (tripType === 'multi-city' && multiCityFlights.length > 0) {
    multiCityFlights.forEach(sec => {
      const legBase = sec.selectedFlight?.prices?.[cabin] || sec.selectedFlight?.price || 0;
      const legExtra = sec.selectedFare?.price || 0;
      const legTotalPerPax = legBase + legExtra;
      const legTotal = legTotalPerPax * pax;
      totalBaseFare += (isNaN(legTotal) ? 0 : legTotal);
    });
    taxes = Math.round(totalBaseFare * 0.18);
    total = totalBaseFare + taxes;
  } else {
    // Current trip logic (One-way/Return)
    const outboundBase = flight?.prices?.[cabin] || 0;
    const outboundFare = fare?.price || 0;
    let outboundBaseFare = (outboundBase + outboundFare) * pax;

    // Return logic
    const returnFlight = tripType === 'return' ? (sp.returnFlight || null) : null;
    const returnBase = returnFlight?.prices?.[cabin] || 0;
    const returnFareExtra = (returnFare?.price || fare?.price || 0);
    const returnBaseFare = returnFlight ? (returnBase + returnFareExtra) * pax : 0;

    totalBaseFare = outboundBaseFare + returnBaseFare;
    
    // Fallback if base calculation resulted in 0 (e.g. data missing from DB)
    if (totalBaseFare <= 0 && sp.totalAmount) {
      totalBaseFare = sp.totalAmount;
    }

    taxes = Math.round(totalBaseFare * 0.18);
    total = totalBaseFare + taxes;
  }

  // Switch outbound/return removed for vertical layout

  // Handle continuing — change flight navigates back to book
  const handleChangeFlight = () => {
    navigate('/book');
    toast.success('Select a different flight');
  };

  const handleContinue = () => {
    setSearchParams(prev => ({ ...prev, totalAmount: total }));
    navigate('/passenger');
  };

  const hasLegs = tripType === 'multi-city' && multiCityFlights.length > 0;
  const canContinue = tripType === 'multi-city' ? (multiCityFlights.every(l => !!l.selectedFlight)) : (tripType !== 'return' || !!sp.returnFlight);

  return (
    <div style={{ background:'#F8F7F4', minHeight:'100vh', fontFamily:'DM Sans,sans-serif' }}>
      <WizardSteps active={0}/>

      <div className="container" style={{ padding:'24px 24px 56px', display:'grid', gridTemplateColumns:'1fr 320px', gap:22, alignItems:'start' }}>
        <div>
          {/* Multi-city legs list */}
          {tripType === 'multi-city' && (
            <div style={{ display:'flex', flexDirection:'column', gap:16, marginBottom:24 }}>
              <div style={{ fontSize:22, fontWeight:700, color:'#1A1A1A', marginBottom:8 }}>Your Itinerary</div>
              {multiCityFlights.map((sec, i) => (
                <div key={i}>
                  <SegmentBox
                    flight={sec.selectedFlight}
                    cabin={cabin}
                    fare={sec.selectedFare}
                    label={`Flight ${i + 1}: ${AP[sec.from]?.city || sec.from} → ${AP[sec.to]?.city || sec.to}`}
                    isReturn={false}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Regular Outbound / Return Vertical Stack */}
          {tripType !== 'multi-city' && flight && (
            <div style={{ marginBottom:32 }}>
                <div style={{ fontSize:22, fontWeight:700, color:'#1A1A1A', marginBottom:16 }}>Your Itinerary</div>
                <SegmentBox
                  flight={flight}
                  cabin={cabin}
                  fare={fare}
                  label="✈ Outbound flight"
                  isReturn={false}
                />
                
                {tripType === 'return' && sp.returnFlight && (
                  <div style={{ marginTop:24 }}>
                    <SegmentBox
                      flight={sp.returnFlight}
                      cabin={cabin}
                      fare={returnFare || fare}
                      label="✈ Return flight"
                      isReturn={true}
                    />
                  </div>
                )}
            </div>
          )}

          {/* No flight selected */}
          {!flight && !hasLegs && (
            <div style={{ background:'#fff', border:'1px solid #E0E0E0', borderRadius:6, padding:'40px', textAlign:'center' }}>
              <div style={{ fontSize:48, marginBottom:16 }}>✈</div>
              <div style={{ fontSize:17, fontWeight:700, marginBottom:8 }}>No flight selected</div>
              <div style={{ fontSize:14, color:'#888', marginBottom:20 }}>Please go back and select a flight first</div>
              <button onClick={()=>navigate('/book')} className="btn-red" style={{ padding:'11px 24px', fontSize:14 }}>Search flights</button>
            </div>
          )}

          {/* Passengers summary */}
          <div style={{ background:'#fff', border:'1px solid #E0E0E0', borderRadius:6, padding:'18px 22px', marginBottom:16 }}>
            <div style={{ fontSize:15, fontWeight:700, marginBottom:12 }}>Passengers</div>
          <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
              {paxAdults>0   && <div style={{ padding:'8px 16px', background:'#E3F2FD', borderRadius:5, fontSize:13.5, fontWeight:600, color:'#1565C0' }}>{paxAdults} Adult{paxAdults>1?'s':''}</div>}
              {paxChildren>0 && <div style={{ padding:'8px 16px', background:'#E8F5E9', borderRadius:5, fontSize:13.5, fontWeight:600, color:'#2E7D32' }}>{paxChildren} Child{paxChildren>1?'ren':''}</div>}
              {paxInfants>0  && <div style={{ padding:'8px 16px', background:'#FFF8E1', borderRadius:5, fontSize:13.5, fontWeight:600, color:'#F57F17' }}>{paxInfants} Infant{paxInfants>1?'s':''}</div>}
            </div>
            <div style={{ marginTop:12, fontSize:13, color:'#888' }}>
              {cabin} · {fare?.name || 'Flex+'} fare
            </div>
          </div>

          {/* Actions */}
          <div style={{ display:'flex', gap:12 }}>
            <button onClick={handleChangeFlight} className="btn-ghost" style={{ padding:'13px 22px', fontSize:14 }}>← Change flight</button>
            <button
              onClick={handleContinue}
              disabled={!canContinue}
              className="btn-red"
              style={{ flex:1, padding:'13px', fontSize:15, justifyContent:'center', opacity:canContinue?1:.55, cursor:canContinue?'pointer':'not-allowed' }}
            >
              Continue to passenger details →
            </button>
          </div>
        </div>

        {/* Price breakdown */}
        <div style={{ background:'#fff', border:'1px solid #E0E0E0', borderRadius:6, overflow:'hidden', position:'sticky', top:90 }}>
          <div style={{ padding:'14px 18px', background:'#1A1A1A', color:'#fff' }}>
            <div style={{ fontSize:14, fontWeight:700 }}>Price breakdown</div>
          </div>
          <div style={{ padding:'16px 18px' }}>
            {tripType === 'multi-city' ? (
              multiCityFlights.map((sec, i) => sec.selectedFlight && (
                <div key={i} style={{ padding:'11px', background:'#F8F7F4', borderRadius:5, marginBottom:10, border:'1px solid #EBEBEB' }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'#1A1A1A' }}>
                    Flight {i+1}: {AP[sec.from]?.city} → {AP[sec.to]?.city}
                  </div>
                  <div style={{ fontSize:11.5, color:'#888', marginTop:2 }}>{sec.selectedFlight.flightNum} · {cabin}</div>
                </div>
              ))
            ) : (
              flight && (
                <div style={{ padding:'11px', background:'#F8F7F4', borderRadius:5, marginBottom:14, border:'1px solid #EBEBEB' }}>
                  <div style={{ fontSize:13.5, fontWeight:700, color:'#1A1A1A' }}>
                    {AP[flight.from]?.city} → {AP[flight.to]?.city}
                  </div>
                  <div style={{ fontSize:12, color:'#888', marginTop:2 }}>{flight.flightNum} · {cabin}</div>
                </div>
              )
            )}

            {[
              [`Base fare (${pax} pax${tripType === 'return' ? ' · Round Trip' : tripType === 'multi-city' ? ' · Multi-City' : ''})`, convertPrice(totalBaseFare)],
              ['Taxes & surcharges (18%)',                                                           convertPrice(taxes)],
            ].map(([k,v]) => (
              <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'9px 0', borderBottom:'1px solid #F5F5F5', fontSize:13.5 }}>
                <span style={{ color:'#888' }}>{k}</span>
                <span style={{ fontWeight:600, color:'#1A1A1A' }}>{v}</span>
              </div>
            ))}

            <div style={{ display:'flex', justifyContent:'space-between', padding:'12px 0', borderTop:'2px solid #1A1A1A', marginTop:6 }}>
              <span style={{ fontSize:15, fontWeight:700 }}>Total</span>
              <span style={{ fontSize:22, fontWeight:900, color:'#C8102E', letterSpacing:-1 }}>{convertPrice(total)}</span>
            </div>

            <div style={{ padding:'10px 12px', background:'#E8F5E9', borderRadius:5, fontSize:13, color:'#2E7D32', marginTop:4 }}>
              ⭐ Earn ~{Math.round(total/100).toLocaleString()} Skywards miles
            </div>

            <div style={{ marginTop:14, fontSize:12.5, color:'#888', lineHeight:1.7 }}>
              <div>✓ Price includes all taxes</div>
              <div>✓ No hidden fees</div>
              <div>✓ {(sp.returnFlight ? (sp.returnFare || sp.fare)?.refundable : sp.fare?.refundable) ? 'Refundable fare' : 'Non-refundable'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
