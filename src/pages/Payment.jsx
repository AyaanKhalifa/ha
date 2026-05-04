// src/pages/Payment.jsx — Full payment with vertical accordion and baggage payload
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import WizardSteps from '../components/WizardSteps';
import { AIRPORTS } from '../utils/flightData';
import { promoService, bookingService } from '../services/api';
import { anime } from '../utils/anime';
import toast from '../utils/toast';

const AP = Object.fromEntries(AIRPORTS.map(a=>[a.code,a]));

const CARD_BRANDS = [
  { name:'Visa',       img:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png', bg:'#1A1F71' },
  { name:'Mastercard', img:'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/200px-Mastercard-logo.svg.png', bg:'#EB001B' },
  { name:'Amex',       img:'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/American_Express_logo_%282018%29.svg/200px-American_Express_logo_%282018%29.svg.png', bg:'#2E77BC' },
];

const UPI_APPS = [
  { id:'gpay',   name:'Google Pay',    icon:'G',  color:'#4285F4' },
  { id:'phonepe',name:'PhonePe',       icon:'₱',  color:'#5F259F' },
  { id:'paytm',  name:'Paytm',         icon:'P',  color:'#00BAF2' },
  { id:'bhim',   name:'BHIM UPI',      icon:'B',  color:'#00529C' },
];

const EMI_OPTIONS = [3,6,9,12,18,24];

export default function Payment() {
  const { searchParams, setSearchParams } = useBooking();
  const { convertPrice } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [expandedMethod, setExpandedMethod] = useState('card');
  const [cardNum,   setCardNum]   = useState('');
  const [cardName,  setCardName]  = useState('');
  const [expiry,    setExpiry]    = useState('');
  const [cvv,       setCvv]       = useState('');
  const [selUpi,    setSelUpi]    = useState('gpay');
  const [upiId,     setUpiId]     = useState('');
  const [selBank,   setSelBank]   = useState('');
  const [selEmi,    setSelEmi]    = useState(6);
  const [promo,     setPromo]     = useState('');
  const [discount,  setDiscount]  = useState(0);
  const [processing,setProcessing]= useState(false);
  const [step3d,    setStep3d]    = useState(false);
  const [otp,       setOtp]       = useState('');
  const [successAnim, setSuccessAnim] = useState(false);
  const planeRef = useRef(null);

  const base    = searchParams?.totalAmount || 0;
  const addons  = (searchParams?.addonTotal || 0);
  const taxes   = Math.round(base * 0.18);
  const grand   = (base + taxes + addons) - (discount || 0);

  const sp = searchParams || {};
  const flight = sp.selectedFlight;
  const from = AP[flight?.from] || { city:flight?.from||'Mumbai',   code:flight?.from||'BOM' };
  const to   = AP[flight?.to]   || { city:flight?.to||'Dubai',     code:flight?.to||'DXB'   };

  const fmtCard = (v) => v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim();
  const fmtExp  = (v) => { const d=v.replace(/\D/g,'').slice(0,4); return d.length>2?d.slice(0,2)+'/'+d.slice(2):d; };

  const applyPromo = async () => {
    try {
      const result = await promoService.validate(promo.toUpperCase(), grand);
      if (!result) { toast.error('Invalid or expired promo code'); return; }
      setDiscount(result.discount);
      toast.success(`Promo applied! You save ${convertPrice(result.discount)}`);
    } catch (e) {
      console.error('Promo error:', e);
      toast.error('Could not apply promo');
    }
  };

  const handlePay = async () => {
    if (expandedMethod==='card') {
      if (cardNum.replace(/\s/g,'').length<16) { toast.error('Enter a valid 16-digit card number'); return; }
      if (!cardName.trim()) { toast.error('Enter the cardholder name'); return; }
      if (expiry.length<5)  { toast.error('Enter card expiry date'); return; }
      if (cvv.length<3)     { toast.error('Enter CVV'); return; }
    }
    if (expandedMethod==='upi' && !upiId.trim()) { toast.error('Enter your UPI ID'); return; }
    if (expandedMethod==='netbanking' && !selBank) { toast.error('Select your bank'); return; }

    setProcessing(true);
    console.log('Initiating payment for method:', expandedMethod);
    
    if (expandedMethod==='card') {
      await new Promise(r=>setTimeout(r,1200));
      setStep3d(true);
      setProcessing(false);
      return;
    }
    await processPayment();
  };

  const verify3ds = async () => {
    if (otp.length < 4) { toast.error('Enter the OTP sent to your phone (Try 1234)'); return; }
    setProcessing(true);
    await processPayment();
  };

  const processPayment = async () => {
    setProcessing(true);
    console.log('Processing booking and payment record...');
    
    try {
      const paxTotal = (sp.passengers?.adults || 1) + (sp.passengers?.children || 0) + (sp.passengers?.infants || 0);
      
      const bookingData = {
        userId: user?.uid || 'guest',
        totalAmount: grand,
        currency: 'INR',
        passengers: paxTotal,
        passengerCount: paxTotal,
        allPassengers: sp.allPassengers || [],
        cabinClass: sp.cabinClass || 'Economy',
        fareClass: 'Flex+',
        contactEmail: user?.email || sp.allPassengers?.[0]?.email || 'guest@example.com',
        contactPhone: sp.allPassengers?.[0]?.phone || '+91 98765 43210',
        tripType: sp.tripType || 'one-way',
        from: sp.from,
        to: sp.to,
        departureDate: sp.departureDate,
        returnDate: sp.returnDate || null,
        multiCityLegs: sp.multiCityLegs || null,
        multiCityFlights: sp.multiCityFlights || null,
        flight: sp.selectedFlight || {},
        flightId: sp.selectedFlight?.id || null,
        returnFlight: sp.returnFlight || null,
        selectedSeats: sp.selectedSeats || {},
        segmentExtras: sp.segmentExtras || {},
        passengerBaggage: sp.passengerBaggage || {},
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      console.log('Creating booking document:', bookingData);
      const bk = await bookingService.create(bookingData);
      
      if (bk) {
        console.log('Booking created successfully. ID:', bk.id);
        console.log('Confirming payment...');
        await bookingService.confirmPayment(bk.id, { 
          amount: grand, 
          method: expandedMethod, 
          currency: 'INR',
          paidAt: new Date().toISOString()
        });
        
        setSearchParams(prev => ({ 
          ...prev, 
          pnr: bk.pnr, 
          totalAmount: grand, 
          paymentMethod: expandedMethod, 
          paidAt: new Date().toISOString() 
        }));
        
        console.log('Payment life-cycle complete.');
      } else {
        throw new Error('Failed to create booking reference');
      }
    } catch (e) {
      console.error('CRITICAL PAYMENT ERROR:', e);
      toast.error(e?.message || 'Payment failed. Please check your network and try again.');
      setProcessing(false);
      setStep3d(false);
      return;
    }

    setProcessing(false);
    setSuccessAnim(true);
    toast.success('Payment successful! 🎉');
    await new Promise(r=>setTimeout(r,100));

    // Success Animation logic
    try {
      const tl = anime.timeline({ easing: 'easeInOutSine' });
      tl.add({
        targets: '#flightPath',
        strokeDashoffset: [anime.setDashoffset, 0],
        duration: 2500,
        easing: 'easeInOutSine',
      });

      const pathElem = document.querySelector('#flightPath');
      if (pathElem) {
        const path = anime.path('#flightPath');
        anime({
          targets: planeRef.current,
          translateX: path('x'),
          translateY: path('y'),
          rotate: path('angle'),
          easing: 'easeInOutSine',
          duration: 2500,
        });
      }

      anime({
        targets: planeRef.current,
        scale: [0, 1.5, 1],
        opacity: [0, 1, 1, 0],
        duration: 2500,
        easing: 'easeInOutSine',
      });

      anime({
        targets: '.js-cloud',
        translateX: () => anime.random(-150, 150),
        translateY: () => anime.random(-50, 50),
        opacity: [0, 0.8, 0],
        scale: [0.8, 1.4],
        duration: 3000,
        delay: anime.stagger(150),
        easing: 'easeOutExpo'
      });
    } catch (animErr) {
      console.warn('Animation failed but payment was successful:', animErr);
    }

    await new Promise(r=>setTimeout(r, 2600));
    navigate('/confirmation');
  };

  const METHODS = [
    { id:'card',       icon:'💳', label:'Credit / Debit Card', sub:'Visa, Mastercard, Amex' },
    { id:'upi',        icon:'📱', label:'UPI', sub:'Google Pay, PhonePe, Paytm' },
    { id:'netbanking', icon:'🏦', label:'Net Banking', sub:'All major Indian banks' },
    { id:'emi',        icon:'📅', label:'EMI', sub:'Pay in easy installments' },
    { id:'wallet',     icon:'👛', label:'Wallets', sub:'Paytm, Amazon Pay, Mobikwik' },
  ];
  const BANKS = ['State Bank of India','HDFC Bank','ICICI Bank','Axis Bank','Kotak Mahindra Bank','Punjab National Bank','Bank of Baroda'];

  return (
    <div style={{ background:'#F8F7F4', minHeight:'100vh', fontFamily:'DM Sans,sans-serif' }}>
      <WizardSteps active={3}/>

      <div className="container" style={{ padding:'24px 24px 56px', display:'grid', gridTemplateColumns:'1fr 340px', gap:32, alignItems:'start' }}>
        <div>
          {step3d && (
            <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
              <div style={{ background:'#fff', borderRadius:8, overflow:'hidden', maxWidth:420, width:'100%', boxShadow:'0 24px 72px rgba(0,0,0,.3)' }}>
                <div style={{ background:'#1565C0', padding:'16px 20px', color:'#fff' }}>
                  <div style={{ fontSize:15, fontWeight:700 }}>🔒 Secure Payment Verification</div>
                  <div style={{ fontSize:12, opacity:.8, marginTop:2 }}>3D Secure Authentication</div>
                </div>
                <div style={{ padding:'22px' }}>
                  <div style={{ padding:'12px 14px', background:'#E3F2FD', borderRadius:5, marginBottom:16, fontSize:13.5, color:'#1565C0' }}>An OTP has been sent to your phone. (Use 123456)</div>
                  <div style={{ marginBottom:14 }}>
                    <label className="field-label">Enter OTP</label>
                    <input value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,'').slice(0,6))} className="field-input" placeholder="Enter 6-digit OTP" style={{ fontFamily:'monospace', fontSize:22, fontWeight:700, letterSpacing:8, textAlign:'center' }}/>
                  </div>
                  <div style={{ display:'flex', gap:10 }}>
                    <button onClick={()=>setStep3d(false)} style={{ flex:1, padding:'11px', border:'1px solid #E0E0E0', borderRadius:4, background:'#fff', color:'#555', cursor:'pointer', fontFamily:'DM Sans,sans-serif', fontSize:13.5 }}>Cancel</button>
                    <button onClick={verify3ds} disabled={processing} className="btn-red" style={{ flex:2, padding:'11px', fontSize:13.5, justifyContent:'center' }}>{processing?'Verifying…':'Verify & Pay'}</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <h2 style={{ fontSize:22, fontWeight:700, marginBottom:16, color:'#1A1A1A' }}>How would you like to pay?</h2>

          <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:24 }}>
            {METHODS.map(m => (
               <div key={m.id} style={{ border:`1.5px solid ${expandedMethod === m.id ? '#C8102E' : '#E0E0E0'}`, borderRadius:8, background:'#fff', overflow:'hidden', transition:'all .2s', boxShadow: expandedMethod === m.id ? '0 4px 12px rgba(200,16,46,0.06)' : 'none' }}>
                  <div onClick={() => setExpandedMethod(m.id)} style={{ padding:'18px 24px', background:expandedMethod === m.id ? '#FFF5F5' : '#fff', cursor:'pointer', display:'flex', alignItems:'center', gap:16 }}>
                      <input type="radio" checked={expandedMethod === m.id} readOnly style={{ width:18, height:18, accentColor:'#C8102E', cursor:'pointer' }} />
                      <div style={{ fontSize:24 }}>{m.icon}</div>
                      <div>
                          <div style={{ fontSize:15, fontWeight:700, color:'#1A1A1A' }}>{m.label}</div>
                          <div style={{ fontSize:12.5, color:'#777', marginTop:2 }}>{m.sub}</div>
                      </div>
                  </div>

                  {expandedMethod === m.id && (
                     <div style={{ padding:'24px', borderTop:'1px solid #F0F0F0', background:'#fff' }}>
                        {m.id === 'card' && (
                          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                            <div style={{ display:'flex', gap:8, marginBottom:4 }}>
                              {CARD_BRANDS.map(cb => (
                                <div key={cb.name} style={{ padding:'4px 10px', background:cb.bg+'18', borderRadius:4, border:`1px solid ${cb.bg}33` }}><div style={{ fontSize:10.5, fontWeight:700, color:cb.bg }}>{cb.name}</div></div>
                              ))}
                            </div>
                            <div><label className="field-label">Card number</label><input value={cardNum} onChange={e=>setCardNum(fmtCard(e.target.value))} className="field-input" placeholder="1234 5678 9012 3456" style={{ fontFamily:'monospace', fontSize:18, letterSpacing:4 }} maxLength={19}/></div>
                            <div><label className="field-label">Cardholder name</label><input value={cardName} onChange={e=>setCardName(e.target.value.toUpperCase())} className="field-input" placeholder="AS ON CARD" style={{ textTransform:'uppercase', letterSpacing:1 }}/></div>
                            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                              <div><label className="field-label">Expiry date</label><input value={expiry} onChange={e=>setExpiry(fmtExp(e.target.value))} className="field-input" placeholder="MM/YY" style={{ fontFamily:'monospace', fontSize:16, letterSpacing:2 }} maxLength={5}/></div>
                              <div><label className="field-label">CVV</label><input type="password" value={cvv} onChange={e=>setCvv(e.target.value.replace(/\D/g,'').slice(0,4))} className="field-input" placeholder="•••" style={{ fontFamily:'monospace', fontSize:18, letterSpacing:6 }} maxLength={4}/></div>
                            </div>
                          </div>
                        )}

                        {m.id === 'upi' && (
                          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:4 }}>
                              {UPI_APPS.map(app => (
                                <button key={app.id} onClick={()=>setSelUpi(app.id)}
                                  style={{ padding:'16px 8px', border:`2px solid ${selUpi===app.id?'#C8102E':'#E0E0E0'}`, borderRadius:8, background:selUpi===app.id?'#FFF5F5':'#fff', cursor:'pointer', textAlign:'center', transition:'all .15s', fontFamily:'DM Sans,sans-serif' }}>
                                  <div style={{ width:40, height:40, borderRadius:'50%', background:app.color, color:'#fff', fontWeight:900, fontSize:18, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 10px' }}>{app.icon}</div>
                                  <div style={{ fontSize:12, fontWeight:700, color:selUpi===app.id?'#C8102E':'#555' }}>{app.name}</div>
                                </button>
                              ))}
                            </div>
                            <div><label className="field-label">Your UPI ID</label><input value={upiId} onChange={e=>setUpiId(e.target.value)} className="field-input" placeholder={`yourname@${selUpi}`}/></div>
                          </div>
                        )}

                        {m.id === 'netbanking' && (
                          <div>
                            <label className="field-label">Select your bank</label>
                            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                              {BANKS.map(bank => (
                                <button key={bank} onClick={()=>setSelBank(bank)}
                                  style={{ padding:'14px', border:`1.5px solid ${selBank===bank?'#C8102E':'#E0E0E0'}`, borderRadius:6, background:selBank===bank?'#FFF5F5':'#fff', color:selBank===bank?'#C8102E':'#333', fontWeight:selBank===bank?700:400, fontSize:13.5, cursor:'pointer', fontFamily:'DM Sans,sans-serif', textAlign:'left', transition:'all .15s', display:'flex', alignItems:'center', gap:10 }}>
                                  🏦 {bank}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {m.id === 'emi' && (
                          <div>
                            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:16 }}>
                              {EMI_OPTIONS.map(emi => (
                                <button key={emi} onClick={()=>setSelEmi(emi)}
                                  style={{ padding:'16px 12px', border:`2px solid ${selEmi===emi?'#C8102E':'#E0E0E0'}`, borderRadius:8, background:selEmi===emi?'#FFF5F5':'#fff', cursor:'pointer', fontFamily:'DM Sans,sans-serif', textAlign:'center', transition:'all .15s' }}>
                                  <div style={{ fontSize:20, fontWeight:900, color:selEmi===emi?'#C8102E':'#1A1A1A', letterSpacing:-1 }}>{emi}</div>
                                  <div style={{ fontSize:11, color:'#888', textTransform:'uppercase', letterSpacing:1, marginBottom:6 }}>months</div>
                                  <div style={{ fontSize:15, fontWeight:700, color:'#555' }}>{convertPrice(Math.ceil(grand/emi))}/mo</div>
                                </button>
                              ))}
                            </div>
                            <div><label className="field-label">Card number (for EMI)</label><input value={cardNum} onChange={e=>setCardNum(fmtCard(e.target.value))} className="field-input" placeholder="1234 5678 9012 3456" style={{ fontFamily:'monospace', fontSize:18, letterSpacing:4 }} maxLength={19}/></div>
                          </div>
                        )}

                        {m.id === 'wallet' && (
                          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                            {[['Paytm Wallet','#00BAF2','₱'],['Amazon Pay','#FF9900','A'],['Mobikwik','#0A3785','M'],['Freecharge','#FF6B00','F']].map(([name,color,icon]) => (
                               <button key={name} onClick={()=>toast.success(`${name} selected`)}
                                 style={{ padding:'16px', border:'1.5px solid #E0E0E0', borderRadius:8, background:'#fff', cursor:'pointer', fontFamily:'DM Sans,sans-serif', display:'flex', alignItems:'center', gap:14, transition:'all .15s' }}>
                                 <div style={{ width:40, height:40, borderRadius:'50%', background:color, color:'#fff', fontWeight:900, fontSize:18, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{icon}</div>
                                 <span style={{ fontSize:14, fontWeight:700, color:'#333' }}>{name}</span>
                               </button>
                            ))}
                          </div>
                        )}
                     </div>
                  )}
               </div>
            ))}
          </div>

          <div style={{ background:'#fff', border:'1px solid #E0E0E0', borderRadius:8, padding:'24px', marginBottom:24 }}>
            <div style={{ fontSize:15, fontWeight:700, marginBottom:12 }}>Promo code</div>
            <div style={{ display:'flex', gap:12 }}>
              <input value={promo} onChange={e=>setPromo(e.target.value.toUpperCase())} className="field-input" placeholder="Enter promo code" style={{ fontFamily:'monospace', letterSpacing:2, fontWeight:700 }}/>
              <button onClick={applyPromo} style={{ padding:'10px 24px', background:'#1A1A1A', border:'none', color:'#fff', fontWeight:700, fontSize:14, borderRadius:6, cursor:'pointer', fontFamily:'DM Sans,sans-serif', whiteSpace:'nowrap', transition:'background .15s' }}>Apply</button>
            </div>
          </div>

          <div style={{ display:'flex', gap:16 }}>
            <button onClick={() => navigate('/addons')} className="btn-ghost" style={{ padding:'16px 24px', fontSize:14 }}>← Back</button>
            <button onClick={handlePay} disabled={processing} className="btn-red"
              style={{ flex:1, padding:'16px', fontSize:17, justifyContent:'center', borderRadius:8 }}>
              {processing ? 'Processing…' : `🔒 Pay ${convertPrice(grand)}`}
            </button>
          </div>
        </div>

        <div style={{ position:'sticky', top:90 }}>
          <div style={{ background:'#fff', border:'1px solid #E0E0E0', borderRadius:8, overflow:'hidden', marginBottom:12, boxShadow:'0 4px 12px rgba(0,0,0,.03)' }}>
            <div style={{ padding:'16px 20px', background:'#1A1A1A', color:'#fff' }}><div style={{ fontSize:14, fontWeight:700 }}>Order summary</div></div>
            <div style={{ padding:'20px' }}>
              {(sp.tripType === 'multi-city' && sp.multiCityFlights ? sp.multiCityFlights : [{ selectedFlight: flight }]).map((leg, i) => {
                const f = leg.selectedFlight;
                if (!f) return null;
                const paxSeats = sp.selectedSeats?.[f.id] || {};
                
                return (
                  <div key={i} style={{ padding:'14px', background:'#FAFAFA', borderRadius:6, marginBottom:12, border:'1px solid #EBEBEB' }}>
                    <div style={{ fontSize:13, fontWeight:700, color:'#1A1A1A', marginBottom:4 }}>{f.from} → {f.to}</div>
                    <div style={{ fontSize:12, color:'#888', marginBottom:8 }}>{f.flightNum} · {f.date}</div>
                    
                    {Object.entries(paxSeats).map(([pidx, s]) => (
                      <div key={pidx} style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#555', marginBottom:2 }}>
                        <span>Pax {Number(pidx)+1} Seat</span>
                        <span style={{ fontWeight:700 }}>{s.id}</span>
                      </div>
                    ))}
                    
                    {i === 0 && sp.returnFlight && (
                       <div style={{ marginTop:10, paddingTop:10, borderTop:'1px dashed #DDD' }}>
                          <div style={{ fontSize:13, fontWeight:700 }}>Return: {sp.returnFlight.from} → {sp.returnFlight.to}</div>
                          <div style={{ fontSize:12, color:'#888', marginBottom:6 }}>{sp.returnFlight.flightNum} · {sp.returnFlight.date}</div>
                          {Object.entries(sp.selectedSeats?.[sp.returnFlight.id] || {}).map(([pidx, s]) => (
                            <div key={pidx} style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#555' }}>
                              <span>Pax {Number(pidx)+1} Seat</span>
                              <span style={{ fontWeight:700 }}>{s.id}</span>
                            </div>
                          ))}
                       </div>
                    )}
                  </div>
                );
              })}

              <div style={{ fontSize:12.5, color:'#777', marginBottom:16, fontWeight:600 }}>{((sp.passengers?.adults||1)+(sp.passengers?.children||0))} passenger(s)</div>

              {[
                ['Base fare',          convertPrice(base)],
                ['Taxes & fees (18%)', convertPrice(taxes)],
                ...(addons>0?[['Add-ons Total', convertPrice(addons)]]:[] ),
                ...(discount>0?[['Promo discount', `-${convertPrice(discount)}`]]:[] ),
              ].map(([k,v]) => (
                <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #F5F5F5', fontSize:13.5 }}>
                  <span style={{ color:'#888' }}>{k}</span>
                  <span style={{ fontWeight:600, color:v.startsWith('-')?'#2E7D32':'#1A1A1A' }}>{v}</span>
                </div>
              ))}

              <div style={{ display:'flex', justifyContent:'space-between', padding:'16px 0 0 0', borderTop:'2px solid #1A1A1A', marginTop:6 }}>
                <span style={{ fontSize:16, fontWeight:700 }}>Total</span>
                <span style={{ fontSize:24, fontWeight:900, color:'#C8102E', letterSpacing:-1 }}>{convertPrice(grand)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {successAnim && (
        <div style={{ position:'fixed', inset:0, zIndex:5000, pointerEvents:'none', background:'radial-gradient(circle at center, rgba(10,25,60,0.85) 0%, rgba(5,16,35,0.95) 100%)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
          <div style={{ position:'absolute', width:'100%', height:'100%', top:0, left:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="600" height="400" viewBox="0 0 600 400" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ overflow:'visible' }}>
              <path id="flightPath" d="M -100,350 Q 150,350 300,200 T 700,50" stroke="url(#trailGrad)" strokeWidth="4" strokeLinecap="round" fill="none" />
              <defs><linearGradient id="trailGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="rgba(255,255,255,0)" /><stop offset="50%" stopColor="rgba(255,255,255,0.8)" /><stop offset="100%" stopColor="rgba(255,255,255,1)" /></linearGradient></defs>
            </svg>
          </div>
          <div ref={planeRef} style={{ position:'absolute', top:0, left:0, width:48, height:48, marginLeft:'calc(50% - 300px)', marginTop:'calc(50vh - 200px)', opacity:0 }}>
            <svg viewBox="0 0 24 24" fill="#FFF" xmlns="http://www.w3.org/2000/svg"><path d="M22.016 10l-2.016-1-3 7L4 12V9l13 4 3-6-2-2-4 5L3 7 1 6l13-4 8 4 1 2-1 2z"/></svg>
          </div>
          <div style={{ position:'absolute', bottom:'20%', left:'50%', transform:'translateX(-50%)', color:'#fff', fontWeight:800, fontSize:32, letterSpacing:4, textTransform:'uppercase' }}>Payment Confirmed</div>
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
