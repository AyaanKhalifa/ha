// src/pages/Hotels.jsx — Full hotel booking with Booking.com + Royal Vista
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import toast from '../utils/toast';

const HOTELS = [
  { id:'H001', name:'Atlantis The Palm',      city:'Dubai',    country:'UAE',       stars:5, rating:9.2, reviews:4821, priceINR:22500, img:'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=380&fit=crop', amenities:['Pool','Spa','Beach','Wi-Fi','Restaurant','Gym'], tag:'Bestseller', source:'habibi', miles:'1,125 miles' },
  { id:'H002', name:'Burj Al Arab Jumeirah',  city:'Dubai',    country:'UAE',       stars:5, rating:9.8, reviews:2340, priceINR:185000,img:'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=380&fit=crop', amenities:['Pool','Spa','Beach','Helipad','Butler','Rolls Royce'], tag:'Ultra Luxury', source:'habibi', miles:'9,250 miles' },
  { id:'H003', name:'Royale Vista Hotel',       city:'Dubai',    country:'UAE',       stars:5, rating:9.4, reviews:1876, priceINR:45000, img:'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&h=380&fit=crop', amenities:['Pool','Spa','Restaurant','Bar','Conference','Wi-Fi'], tag:'Exclusive', source:'royalvista', miles:'2,250 miles', royalVistaUrl:'https://royalevista.infinityfree.me/' },
  { id:'H004', name:'The Savoy',               city:'London',   country:'UK',        stars:5, rating:9.5, reviews:3210, priceINR:55000, img:'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&h=380&fit=crop', amenities:['Spa','Bar','Wi-Fi','Concierge','Restaurant'], tag:'Iconic', source:'booking', miles:'2,750 miles', bookingUrl:'https://www.booking.com/hotel/gb/the-savoy-london.html' },
  { id:'H005', name:'Raffles Singapore',       city:'Singapore',country:'Singapore', stars:5, rating:9.4, reviews:2987, priceINR:38000, img:'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=380&fit=crop', amenities:['Pool','Spa','Bar','Wi-Fi','Restaurant'], tag:'Popular', source:'booking', miles:'1,900 miles', bookingUrl:'https://www.booking.com/hotel/sg/raffles-singapore.html' },
  { id:'H006', name:'The Ritz Paris',          city:'Paris',    country:'France',    stars:5, rating:9.6, reviews:1843, priceINR:72000, img:'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&h=380&fit=crop', amenities:['Spa','Pool','Michelin Dining','Wi-Fi','Garden'], tag:'Luxury', source:'booking', miles:'3,600 miles', bookingUrl:'https://www.booking.com/hotel/fr/ritz-paris.html' },
  { id:'H007', name:'Mandarin Oriental Tokyo', city:'Tokyo',    country:'Japan',     stars:5, rating:9.3, reviews:2654, priceINR:44000, img:'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&h=380&fit=crop', amenities:['Spa','Pool','Wi-Fi','Restaurant','Panoramic views'], tag:'', source:'booking', miles:'2,200 miles', bookingUrl:'https://www.booking.com/hotel/jp/mandarin-oriental-tokyo.html' },
  { id:'H008', name:'Park Hyatt Sydney',       city:'Sydney',   country:'Australia', stars:5, rating:9.1, reviews:3102, priceINR:29000, img:'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&h=380&fit=crop', amenities:['Pool','Spa','Bar','Wi-Fi','Harbour views'], tag:'', source:'booking', miles:'1,450 miles', bookingUrl:'https://www.booking.com/hotel/au/park-hyatt-sydney.html' },
  { id:'H009', name:'JW Marriott Marquis',     city:'Dubai',    country:'UAE',       stars:5, rating:8.9, reviews:5621, priceINR:18000, img:'https://images.unsplash.com/photo-1625244724120-1fd1d34d00f6?w=600&h=380&fit=crop', amenities:['Pool','Gym','Wi-Fi','Restaurant','Spa'], tag:'Value', source:'booking', miles:'900 miles', bookingUrl:'https://www.booking.com/hotel/ae/jw-marriott-marquis-dubai.html' },
  { id:'H010', name:'Four Seasons New York',   city:'New York', country:'USA',       stars:5, rating:9.2, reviews:2140, priceINR:68000, img:'https://images.unsplash.com/photo-1587985064135-0366536eab42?w=600&h=380&fit=crop', amenities:['Spa','Restaurant','Bar','Wi-Fi','Concierge','Gym'], tag:'', source:'booking', miles:'3,400 miles', bookingUrl:'https://www.booking.com/hotel/us/four-seasons-new-york.html' },
];

export default function Hotels() {
  const { convertPrice } = useApp();
  const [city, setCity]       = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests]   = useState(2);
  const [rooms, setRooms]     = useState(1);
  const [maxPrice, setMaxPrice] = useState(200000);
  const [minStars, setMinStars] = useState(0);
  const [sortBy, setSortBy]   = useState('rating');
  const [selected, setSelected] = useState(null);
  const [bookingModal, setBookingModal] = useState(null);
  const [bookingForm, setBookingForm] = useState({ name:'', email:'', phone:'', specialReq:'' });
  const [booked, setBooked]   = useState(new Set());

  const nights = checkIn&&checkOut ? Math.max(1,Math.round((new Date(checkOut)-new Date(checkIn))/(1000*60*60*24))) : 1;

  const filtered = useMemo(()=>{
    let list = HOTELS;
    if (city) list = list.filter(h=>[h.city,h.country,h.name].some(s=>s.toLowerCase().includes(city.toLowerCase())));
    list = list.filter(h=>h.priceINR<=maxPrice && h.stars>=minStars);
    if (sortBy==='price-asc') list=[...list].sort((a,b)=>a.priceINR-b.priceINR);
    else if (sortBy==='price-desc') list=[...list].sort((a,b)=>b.priceINR-a.priceINR);
    else list=[...list].sort((a,b)=>b.rating-a.rating);
    return list;
  },[city,maxPrice,minStars,sortBy]);

  const handleBook = (hotel) => {
    if (hotel.source==='booking' && hotel.bookingUrl) {
      window.open(hotel.bookingUrl, '_blank');
      return;
    }
    if (hotel.source==='royalvista') {
      window.open(hotel.royalVistaUrl||'http://localhost/wtf7/index.php', '_blank');
      return;
    }
    setBookingModal(hotel);
  };

  const submitBooking = () => {
    if (!bookingForm.name || !bookingForm.email) { toast.error('Please fill required fields'); return; }
    setBooked(prev=>new Set([...prev, bookingModal.id]));
    setBookingModal(null);
    toast.success(`${bookingForm.name}, your booking at ${bookingModal.name} is confirmed! Check your email.`);
    setBookingForm({ name:'', email:'', phone:'', specialReq:'' });
  };

  return (
    <div style={{ background:'#F8F7F4',minHeight:'100vh',fontFamily:'DM Sans,sans-serif' }}>
      {/* Hero */}
      <div style={{ background:'linear-gradient(135deg,#1A1A1A,#2d2d2d)',padding:'44px 24px' }}>
        <div className="container">
          <div style={{ fontSize:11,color:'rgba(255,255,255,.45)',letterSpacing:'4px',textTransform:'uppercase',marginBottom:10 }}>Habibi Hotels</div>
          <h1 style={{ fontFamily:'Cormorant Garamond,serif',fontSize:'clamp(2rem,4vw,2.8rem)',fontWeight:400,color:'#fff',marginBottom:10 }}>Your perfect stay, every time</h1>
          <p style={{ fontSize:14,color:'rgba(255,255,255,.6)',marginBottom:24 }}>Earn 2× Skywards miles on every stay. Bundle with flights and save 25%.</p>
          {/* Search bar */}
          <div style={{ display:'grid',gridTemplateColumns:'2fr 1fr 1fr auto auto auto auto',gap:10,alignItems:'end',background:'rgba(255,255,255,.08)',border:'1px solid rgba(255,255,255,.15)',borderRadius:6,padding:'16px 18px',flexWrap:'wrap' }}>
            {[['Destination','text',city,setCity,'City or hotel name'],['Check-in','date',checkIn,setCheckIn,''],['Check-out','date',checkOut,setCheckOut,'']].map(([lbl,type,val,set,ph])=>(
              <div key={lbl}>
                <label style={{ display:'block',fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'1.5px',color:'rgba(255,255,255,.5)',marginBottom:5 }}>{lbl}</label>
                <input type={type} value={val} onChange={e=>set(e.target.value)} placeholder={ph}
                  style={{ width:'100%',padding:'10px 12px',border:'1px solid rgba(255,255,255,.2)',borderRadius:4,background:'rgba(255,255,255,.1)',color:'#fff',fontSize:14,outline:'none',fontFamily:'DM Sans,sans-serif',colorScheme:'dark',boxSizing:'border-box',WebkitTextFillColor:type==='date'&&!val?'rgba(255,255,255,.4)':'#fff' }}/>
              </div>
            ))}
            <div>
              <label style={{ display:'block',fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'1.5px',color:'rgba(255,255,255,.5)',marginBottom:5 }}>Guests</label>
              <select value={guests} onChange={e=>setGuests(+e.target.value)} style={{ padding:'10px 12px',border:'1px solid rgba(255,255,255,.2)',borderRadius:4,background:'rgba(255,255,255,.1)',color:'#fff',fontSize:14,fontFamily:'DM Sans,sans-serif',outline:'none',cursor:'pointer' }}>
                {[1,2,3,4,5,6].map(n=><option key={n} style={{ background:'#333' }}>{n}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display:'block',fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'1.5px',color:'rgba(255,255,255,.5)',marginBottom:5 }}>Rooms</label>
              <select value={rooms} onChange={e=>setRooms(+e.target.value)} style={{ padding:'10px 12px',border:'1px solid rgba(255,255,255,.2)',borderRadius:4,background:'rgba(255,255,255,.1)',color:'#fff',fontSize:14,fontFamily:'DM Sans,sans-serif',outline:'none',cursor:'pointer' }}>
                {[1,2,3,4].map(n=><option key={n} style={{ background:'#333' }}>{n}</option>)}
              </select>
            </div>
            <button onClick={()=>toast.success(`Found ${filtered.length} hotels!`)} className="btn-red" style={{ padding:'10px 22px',fontSize:14,height:44,alignSelf:'flex-end' }}>Search</button>
          </div>
          {nights>1&&checkIn&&checkOut&&<div style={{ marginTop:10,fontSize:13,color:'rgba(255,255,255,.5)' }}>📅 {nights} nights · {guests} guest{guests>1?'s':''} · {rooms} room{rooms>1?'s':''}</div>}
        </div>
      </div>

      {/* Results */}
      <div className="container" style={{ padding:'24px 24px 56px',display:'grid',gridTemplateColumns:'240px 1fr',gap:22,alignItems:'start' }}>
        {/* Filters */}
        <div style={{ background:'#fff',border:'1px solid #E0E0E0',borderRadius:6,padding:'18px',position:'sticky',top:80 }}>
          <div style={{ fontSize:14,fontWeight:700,color:'#1A1A1A',marginBottom:18 }}>Filters</div>
          <div style={{ marginBottom:18 }}>
            <div style={{ fontSize:12,fontWeight:600,color:'#555',marginBottom:8,textTransform:'uppercase',letterSpacing:.5 }}>Max price/night</div>
            <input type="range" min={5000} max={200000} step={1000} value={maxPrice} onChange={e=>setMaxPrice(+e.target.value)} style={{ width:'100%',accentColor:'#C8102E' }}/>
            <div style={{ display:'flex',justifyContent:'space-between',fontSize:12,color:'#888',marginTop:4 }}>
              <span>₹5K</span><span style={{ fontWeight:700,color:'#C8102E' }}>{convertPrice(maxPrice)}</span>
            </div>
          </div>
          <div style={{ marginBottom:18 }}>
            <div style={{ fontSize:12,fontWeight:600,color:'#555',marginBottom:8,textTransform:'uppercase',letterSpacing:.5 }}>Star rating</div>
            <div style={{ display:'flex',gap:5,flexWrap:'wrap' }}>
              {[0,3,4,5].map(n=>(
                <button key={n} onClick={()=>setMinStars(n)} style={{ padding:'5px 10px',border:`1px solid ${minStars===n?'#C8102E':'#E0E0E0'}`,borderRadius:4,background:minStars===n?'#FFF0F0':'#fff',color:minStars===n?'#C8102E':'#555',fontSize:12,cursor:'pointer',fontFamily:'DM Sans,sans-serif',transition:'all .15s' }}>
                  {n===0?'All':n+'★'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize:12,fontWeight:600,color:'#555',marginBottom:8,textTransform:'uppercase',letterSpacing:.5 }}>Sort by</div>
            {[['rating','Top rated'],['price-asc','Price low→high'],['price-desc','Price high→low']].map(([v,l])=>(
              <label key={v} style={{ display:'flex',alignItems:'center',gap:8,padding:'6px 0',cursor:'pointer',fontSize:13 }}>
                <span onClick={()=>setSortBy(v)} style={{ width:16,height:16,borderRadius:'50%',border:`2px solid ${sortBy===v?'#C8102E':'#E0E0E0'}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,cursor:'pointer' }}>
                  {sortBy===v&&<span style={{ width:8,height:8,borderRadius:'50%',background:'#C8102E',display:'block' }}/>}
                </span>
                <span style={{ color:sortBy===v?'#C8102E':'#555',fontWeight:sortBy===v?600:400 }}>{l}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Hotel cards */}
        <div>
          <div style={{ display:'flex',justifyContent:'space-between',marginBottom:14,alignItems:'center' }}>
            <div style={{ fontSize:14,color:'#888' }}><strong style={{ color:'#1A1A1A',fontSize:16 }}>{filtered.length}</strong> hotels {city?`in ${city}`:''}</div>
            <div style={{ fontSize:12,color:'#888' }}>Earn 2× Skywards miles on every stay</div>
          </div>
          <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
            {filtered.map(h=>(
              <div key={h.id} style={{ background:'#fff',border:'1px solid #EBEBEB',borderRadius:8,overflow:'hidden',display:'grid',gridTemplateColumns:'280px 1fr',boxShadow:'0 1px 6px rgba(0,0,0,.05)',transition:'all .3s',cursor:'pointer' }}
                onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 8px 32px rgba(0,0,0,.12)';e.currentTarget.style.transform='translateY(-1px)';}}
                onMouseLeave={e=>{e.currentTarget.style.boxShadow='0 1px 6px rgba(0,0,0,.05)';e.currentTarget.style.transform='translateY(0)';}}>
                <div style={{ position:'relative',overflow:'hidden' }}>
                  <img src={h.img} alt={h.name} style={{ width:'100%',height:'100%',objectFit:'cover',transition:'transform .45s' }}
                    onMouseEnter={e=>e.target.style.transform='scale(1.06)'}
                    onMouseLeave={e=>e.target.style.transform='scale(1)'}/>
                  {h.tag&&<span style={{ position:'absolute',top:10,left:10,background:h.tag==='Ultra Luxury'?'#6A1B9A':h.tag==='Exclusive'?'#C8102E':'#C8102E',color:'#fff',fontSize:10.5,fontWeight:700,padding:'3px 9px',borderRadius:100 }}>{h.tag}</span>}
                  {h.source==='royalvista'&&<span style={{ position:'absolute',bottom:10,left:10,background:'rgba(0,0,0,.7)',color:'#C9A84C',fontSize:10,fontWeight:700,padding:'3px 9px',borderRadius:100 }}>★ Royal Vista Partner</span>}
                  {h.source==='booking'&&<span style={{ position:'absolute',bottom:10,left:10,background:'rgba(0,77,160,.85)',color:'#fff',fontSize:10,fontWeight:700,padding:'3px 9px',borderRadius:100 }}>Booking.com</span>}
                  <div style={{ position:'absolute',top:10,right:10,background:'rgba(0,0,0,.6)',color:'#fff',borderRadius:5,padding:'4px 8px',display:'flex',alignItems:'center',gap:4 }}>
                    <span style={{ color:'#FFD700',fontSize:12 }}>★</span>
                    <span style={{ fontSize:12,fontWeight:700 }}>{h.rating}</span>
                    <span style={{ fontSize:10,color:'rgba(255,255,255,.6)' }}>({h.reviews.toLocaleString()})</span>
                  </div>
                </div>
                <div style={{ padding:'18px 22px',display:'flex',flexDirection:'column' }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:4 }}>
                      <h3 style={{ fontSize:17,fontWeight:700,color:'#0D0D0D' }}>{h.name}</h3>
                      <div style={{ fontSize:11,color:'#C8102E',fontWeight:700,background:'#FFF0F0',padding:'3px 8px',borderRadius:100,whiteSpace:'nowrap',marginLeft:10,flexShrink:0 }}>+{h.miles}</div>
                    </div>
                    <div style={{ fontSize:13,color:'#888',marginBottom:10 }}>📍 {h.city}, {h.country} · {'⭐'.repeat(h.stars)}</div>
                    <div style={{ display:'flex',gap:6,flexWrap:'wrap',marginBottom:12 }}>
                      {h.amenities.slice(0,4).map(a=><span key={a} style={{ fontSize:11.5,padding:'3px 9px',background:'#F5F5F0',borderRadius:100,color:'#555' }}>{a}</span>)}
                      {h.amenities.length>4&&<span style={{ fontSize:11.5,padding:'3px 9px',background:'#F5F5F0',borderRadius:100,color:'#888' }}>+{h.amenities.length-4} more</span>}
                    </div>
                  </div>
                  <div style={{ borderTop:'1px solid #F0F0F0',paddingTop:12,display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                    <div>
                      <div style={{ fontSize:10.5,color:'#AAA' }}>Per night from</div>
                      <div style={{ fontSize:22,fontWeight:900,color:'#C8102E',letterSpacing:-1 }}>{convertPrice(h.priceINR)}</div>
                      {nights>1&&<div style={{ fontSize:11.5,color:'#888',marginTop:1 }}>{convertPrice(h.priceINR*nights)} for {nights} nights</div>}
                    </div>
                    <div style={{ display:'flex',gap:8 }}>
                      <button onClick={()=>setSelected(h)} style={{ padding:'9px 14px',border:'1px solid #E0E0E0',borderRadius:4,background:'#fff',color:'#555',fontSize:13,cursor:'pointer',fontFamily:'DM Sans,sans-serif',transition:'all .15s' }}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor='#C8102E';e.currentTarget.style.color='#C8102E';}}
                        onMouseLeave={e=>{e.currentTarget.style.borderColor='#E0E0E0';e.currentTarget.style.color='#555';}}>
                        View details
                      </button>
                      <button onClick={()=>handleBook(h)} disabled={booked.has(h.id)}
                        style={{ padding:'9px 18px',background:booked.has(h.id)?'#2E7D32':'#C8102E',border:'none',color:'#fff',fontWeight:700,fontSize:13,borderRadius:4,cursor:booked.has(h.id)?'default':'pointer',fontFamily:'DM Sans,sans-serif',transition:'background .15s' }}>
                        {booked.has(h.id)?'✓ Booked':h.source==='booking'?'Book on Booking.com →':h.source==='royalvista'?'Book at Royal Vista →':'Book now'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hotel detail modal */}
      {selected&&(
        <div onClick={()=>setSelected(null)} style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.6)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20 }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:'#fff',borderRadius:8,overflow:'hidden',maxWidth:680,width:'100%',maxHeight:'88vh',overflowY:'auto',boxShadow:'0 24px 72px rgba(0,0,0,.3)' }}>
            <div style={{ position:'relative',height:260,overflow:'hidden' }}>
              <img src={selected.img} alt={selected.name} style={{ width:'100%',height:'100%',objectFit:'cover' }}/>
              <button onClick={()=>setSelected(null)} style={{ position:'absolute',top:14,right:14,width:36,height:36,borderRadius:'50%',background:'rgba(0,0,0,.5)',border:'none',color:'#fff',fontSize:18,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>×</button>
            </div>
            <div style={{ padding:'22px 24px' }}>
              <h2 style={{ fontFamily:'Cormorant Garamond,serif',fontSize:24,fontWeight:500,marginBottom:6 }}>{selected.name}</h2>
              <div style={{ fontSize:13,color:'#888',marginBottom:14 }}>📍 {selected.city}, {selected.country} · {'⭐'.repeat(selected.stars)} · <span style={{ color:'#F57F17',fontWeight:700 }}>★ {selected.rating}</span> ({selected.reviews.toLocaleString()} reviews)</div>
              <div style={{ display:'flex',gap:6,flexWrap:'wrap',marginBottom:16 }}>
                {selected.amenities.map(a=><span key={a} style={{ fontSize:12.5,padding:'5px 11px',background:'#F5F5F0',borderRadius:100,color:'#555',border:'1px solid #E8E8E8' }}>{a}</span>)}
              </div>
              {selected.source==='royalvista'&&(
                <div style={{ padding:'12px 14px',background:'#FFF8E1',border:'1px solid #FFE082',borderRadius:5,marginBottom:14,fontSize:13,color:'#E65100' }}>
                  ⭐ <strong>Royale Vista Partner Hotel</strong> — Book directly for exclusive Habibi Airways member rates and bonus miles.
                </div>
              )}
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 0',borderTop:'1px solid #EBEBEB' }}>
                <div>
                  <div style={{ fontSize:11,color:'#AAA',marginBottom:2 }}>Per night from</div>
                  <div style={{ fontSize:28,fontWeight:900,color:'#C8102E',letterSpacing:-1 }}>{convertPrice(selected.priceINR)}</div>
                  <div style={{ fontSize:12,color:'#C8102E',fontWeight:700,marginTop:2 }}>+{selected.miles} on this stay</div>
                </div>
                <button onClick={()=>{setSelected(null);handleBook(selected);}} style={{ padding:'13px 28px',background:'#C8102E',border:'none',color:'#fff',fontWeight:700,fontSize:15,borderRadius:4,cursor:'pointer',fontFamily:'DM Sans,sans-serif' }}>
                  {selected.source==='booking'?'Book on Booking.com →':selected.source==='royalvista'?'Book at Royal Vista →':'Book this hotel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking modal for Habibi hotels */}
      {bookingModal&&(
        <div onClick={()=>setBookingModal(null)} style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.6)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center',padding:20 }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:'#fff',borderRadius:8,overflow:'hidden',maxWidth:480,width:'100%',boxShadow:'0 24px 72px rgba(0,0,0,.3)' }}>
            <div style={{ background:'#C8102E',padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
              <div style={{ color:'#fff',fontSize:15,fontWeight:700 }}>Book {bookingModal.name}</div>
              <button onClick={()=>setBookingModal(null)} style={{ background:'none',border:'none',color:'rgba(255,255,255,.7)',fontSize:20,cursor:'pointer' }}>×</button>
            </div>
            <div style={{ padding:'22px' }}>
              <div style={{ display:'flex',flexDirection:'column',gap:13 }}>
                <div><label className="field-label">Full name *</label><input value={bookingForm.name} onChange={e=>setBookingForm(f=>({...f,name:e.target.value}))} className="field-input" placeholder="As on ID"/></div>
                <div><label className="field-label">Email address *</label><input type="email" value={bookingForm.email} onChange={e=>setBookingForm(f=>({...f,email:e.target.value}))} className="field-input" placeholder="you@example.com"/></div>
                <div><label className="field-label">Phone number</label><input type="tel" value={bookingForm.phone} onChange={e=>setBookingForm(f=>({...f,phone:e.target.value}))} className="field-input" placeholder="+91 98765 43210"/></div>
                <div><label className="field-label">Special requests</label><textarea value={bookingForm.specialReq} onChange={e=>setBookingForm(f=>({...f,specialReq:e.target.value}))} rows={2} className="field-input" style={{ resize:'vertical' }} placeholder="High floor, anniversary, etc."/></div>
                <div style={{ padding:'12px 14px',background:'#F8F7F4',borderRadius:5,border:'1px solid #EBEBEB',fontSize:13 }}>
                  <div style={{ display:'flex',justifyContent:'space-between',marginBottom:4 }}>
                    <span style={{ color:'#888' }}>Room</span><span style={{ fontWeight:700 }}>{convertPrice(bookingModal.priceINR)}/night</span>
                  </div>
                  {nights>1&&<div style={{ display:'flex',justifyContent:'space-between',borderTop:'1px solid #EBEBEB',paddingTop:8,marginTop:4 }}>
                    <span style={{ color:'#888' }}>{nights} nights total</span><span style={{ fontWeight:800,color:'#C8102E' }}>{convertPrice(bookingModal.priceINR*nights)}</span>
                  </div>}
                </div>
                <button onClick={submitBooking} className="btn-red" style={{ padding:'13px',fontSize:15,justifyContent:'center' }}>Confirm booking</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
