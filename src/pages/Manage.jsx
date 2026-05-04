// src/pages/Manage.jsx — Full booking management (Firestore + live updates) with multi-passenger support
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingService } from '../services/api';
import { firestoreService } from '../services/firestore';
import { useApp } from '../context/AppContext';
import { AIRPORTS } from '../utils/flightData';
import toast from '../utils/toast';

const AP = Object.fromEntries(AIRPORTS.map((a) => [a.code, a]));

const TABS = ['Overview', 'Change flight', 'Upgrade', 'Add extras', 'Cancel booking'];

export default function Manage() {
  const navigate = useNavigate();
  const { convertPrice } = useApp();
  const [pnr, setPnr] = useState('');
  const [lastName, setLastName] = useState('');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');
  const [newDate, setNewDate] = useState('');
  const [upgradeTarget, setUpgradeTarget] = useState('');
  const [selectedExtras, setSelectedExtras] = useState(new Set());
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!booking?.id) return undefined;
    const unsub = bookingService.subscribeToBooking(booking.id, (doc) => {
      if (doc) setBooking(doc);
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [booking?.id]);

  const lookup = async () => {
    if (!pnr.trim() || !lastName.trim()) {
      toast.error('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const b = await bookingService.lookupByPnrAndLastName(pnr, lastName);
      if (!b) {
        toast.error('No booking found for this PNR and last name.');
        setBooking(null);
        return;
      }
      setBooking(b);
      toast.success('Booking found!');
    } catch (e) {
      console.error(e);
      toast.error('Could not load booking. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearBooking = () => {
    setBooking(null);
    setPnr('');
    setLastName('');
    setActiveTab('Overview');
  };

  const mergeHistory = async (bookingId, entry) => {
    const prev = await firestoreService.getDocument('bookings', bookingId);
    const history = [...(prev?.history || [])];
    history.push(entry);
    return history;
  };

  const handleChangeDate = async () => {
    if (!newDate || !booking?.id) {
      toast.error('Please select a new date');
      return;
    }
    setLoading(true);
    try {
      const history = await mergeHistory(booking.id, {
        status: 'confirmed',
        changedAt: new Date().toISOString(),
        reason: `Departure date changed to ${newDate}`,
      });
      await firestoreService.updateDocument('bookings', booking.id, {
        departureDate: newDate,
        date: newDate,
        updatedAt: new Date().toISOString(),
        history,
      });
      setNewDate('');
      setActiveTab('Overview');
      toast.success('Flight date updated.');
    } catch (e) {
      toast.error('Could not update date.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    if (!upgradeTarget || !booking?.id) {
      toast.error('Please select an upgrade option');
      return;
    }
    setLoading(true);
    try {
      const history = await mergeHistory(booking.id, {
        status: 'confirmed',
        changedAt: new Date().toISOString(),
        reason: `Cabin upgraded to ${upgradeTarget}`,
      });
      await firestoreService.updateDocument('bookings', booking.id, {
        cabinClass: upgradeTarget,
        updatedAt: new Date().toISOString(),
        history,
      });
      setUpgradeTarget('');
      setActiveTab('Overview');
      toast.success('Upgrade saved.');
    } catch (e) {
      toast.error('Could not apply upgrade.');
    } finally {
      setLoading(false);
    }
  };

  const addExtras = async () => {
    if (!booking?.id || selectedExtras.size === 0) return;
    setLoading(true);
    try {
      const chosen = extras.filter((e) => selectedExtras.has(e.id));
      const history = await mergeHistory(booking.id, {
        status: 'confirmed',
        changedAt: new Date().toISOString(),
        reason: `Extras added: ${chosen.map((x) => x.name).join(', ')}`,
      });
      await firestoreService.updateDocument('bookings', booking.id, {
        bookingExtras: chosen.map((e) => ({ id: e.id, name: e.name, price: e.price })),
        extrasUpdatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history,
      });
      toast.success('Extras saved to your booking.');
    } catch (e) {
      toast.error('Could not save extras.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!booking?.id) return;
    setCancelling(true);
    try {
      await bookingService.cancel(booking.id, 'user', 'Customer request');
      setCancelOpen(false);
      toast.success('Booking cancelled. Refund processed in 5–7 business days.');
      setTimeout(() => navigate('/my-trips'), 2000);
    } catch (e) {
      toast.error('Cancellation failed.');
    } finally {
      setCancelling(false);
    }
  };

  const extras = [
    { id: 'BAG10', name: 'Extra 10 kg baggage', price: 5600 },
    { id: 'LNGE', name: 'Airport lounge access', price: 1999 },
    { id: 'FAST', name: 'Fast track security', price: 799 },
    { id: 'INS', name: 'Travel insurance', price: 899 },
  ];

  const routeTitle = () => {
    if (!booking) return '';
    const legs = booking.multiCityFlights;
    if (Array.isArray(legs) && legs.length > 0) {
      return legs.map((l) => `${AP[l.from]?.city || l.from} → ${AP[l.to]?.city || l.to}`).join(' · ');
    }
    return `${AP[booking.from]?.city || booking.from} → ${AP[booking.to]?.city || booking.to}`;
  };

  const displayDate = booking?.date || booking?.departureDate || '';
  
  const segments = [];
  if (booking?.tripType === 'multi-city' && booking.multiCityFlights) {
     booking.multiCityFlights.forEach(l => segments.push(l.selectedFlight || l));
  } else if (booking) {
     if (booking.flight) segments.push(booking.flight);
     if (booking.returnFlight) segments.push(booking.returnFlight);
  }

  return (
    <div style={{ background: '#F8F7F4', minHeight: '100vh', fontFamily: 'DM Sans,sans-serif' }}>
      <div style={{ background: '#C8102E', padding: '28px 24px' }}>
        <div className="container">
          <h1 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 'clamp(1.8rem,3vw,2.4rem)', fontWeight: 400, color: '#fff', marginBottom: 6 }}>Manage Booking</h1>
          <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.75)' }}>Change, upgrade, or cancel your booking online.</p>
        </div>
      </div>

      <div className="container" style={{ padding: '28px 24px 56px' }}>
        {!booking ? (
          <div style={{ background: '#fff', border: '1px solid #E0E0E0', borderRadius: 8, padding: '36px', maxWidth: 520, margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 24, fontWeight: 500, marginBottom: 8 }}>Retrieve your booking</h2>
            <p style={{ fontSize: 13.5, color: '#888', marginBottom: 24 }}>Enter your PNR and last name as on your ticket.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="field-label">Booking reference (PNR)</label>
                <input value={pnr} onChange={(e) => setPnr(e.target.value.toUpperCase())} className="field-input" style={{ fontSize: 18, fontWeight: 700, letterSpacing: 2, fontFamily: 'monospace' }} placeholder="e.g. HAB1A2BC" />
              </div>
              <div>
                <label className="field-label">Last name</label>
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="field-input" placeholder="As on passport" />
              </div>
              <button onClick={lookup} disabled={loading} className="btn-red" style={{ padding: '13px', fontSize: 15, justifyContent: 'center' }}>
                {loading ? 'Searching…' : 'Find booking'}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ background: '#fff', border: '1px solid #E0E0E0', borderRadius: 8, padding: '18px 22px', marginBottom: 16, display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#C8102E,#8b0000)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cormorant Garamond,serif', fontWeight: 700, fontSize: 13, color: '#fff', flexShrink: 0 }}>HA</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: '#1A1A1A' }}>{routeTitle()}</div>
                <div style={{ fontSize: 12.5, color: '#888', marginTop: 2 }}>
                  {booking.flightNum} · {displayDate} · {booking.cabinClass}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                <button type="button" onClick={clearBooking} style={{ padding: '8px 14px', border: '1px solid #E0E0E0', borderRadius: 4, background: '#fff', fontSize: 12.5, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', color: '#555' }}>
                  Find another booking
                </button>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10.5, color: '#AAA', textTransform: 'uppercase', letterSpacing: 1 }}>PNR</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 900, color: '#1A1A1A', letterSpacing: 2 }}>{booking.pnr}</div>
                </div>
                <span style={{ padding: '5px 14px', background: booking.status === 'confirmed' ? '#E8F5E9' : booking.status === 'cancelled' ? '#FFEBEE' : '#FFF8E1', color: booking.status === 'confirmed' ? '#2E7D32' : booking.status === 'cancelled' ? '#C8102E' : '#F57F17', fontWeight: 700, fontSize: 13, borderRadius: 100 }}>{booking.status}</span>
              </div>
            </div>

            <div style={{ background: '#fff', border: '1px solid #E0E0E0', borderRadius: '6px 6px 0 0', borderBottom: 'none', display: 'flex', overflow: 'hidden' }}>
              {TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setActiveTab(t)}
                  style={{
                    flex: 1,
                    padding: '13px 8px',
                    border: 'none',
                    borderBottom: `3px solid ${activeTab === t ? '#C8102E' : 'transparent'}`,
                    background: activeTab === t ? '#FFF5F5' : '#fff',
                    color: t === 'Cancel booking' ? '#C8102E' : activeTab === t ? '#C8102E' : '#555',
                    fontWeight: activeTab === t ? 700 : 400,
                    fontSize: 12.5,
                    cursor: 'pointer',
                    fontFamily: 'DM Sans,sans-serif',
                    transition: 'all .2s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            <div style={{ background: '#fff', border: '1px solid #E0E0E0', borderRadius: '0 0 6px 6px', borderTop: 'none', padding: '24px' }}>
              {activeTab === 'Overview' && (
                <div>
                  {segments.map((seg, sIdx) => {
                    const depDateStr = seg.date || seg.departureDate || displayDate;
                    return (
                      <div key={sIdx} style={{ marginBottom: 24 }}>
                        <h4 style={{ fontSize: 14, fontWeight: 800, marginBottom: 10, color: '#C8102E' }}>
                          Leg {sIdx + 1}: {AP[seg.from]?.city || seg.from} → {AP[seg.to]?.city || seg.to}
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 14 }}>
                          {[
                            ['Flight', seg.flightNum || booking.flightNum],
                            ['Date', depDateStr],
                            ['Departure', seg.depStr || booking.depStr],
                            ['Arrival', seg.arrStr || booking.arrStr],
                            ['Cabin', booking.cabinClass],
                            ['Aircraft', seg.aircraft || booking.aircraft],
                            ['Terminal', seg.terminal || booking.terminal || 'T3'],
                            ['Gate', seg.gate || booking.gate || 'TBA'],
                          ].map(([k, v]) => (
                            <div key={k} style={{ padding: '12px', background: '#FAFAFA', borderRadius: 5, border: '1px solid #F0F0F0' }}>
                              <div style={{ fontSize: 10, color: '#AAA', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 3 }}>{k}</div>
                              <div style={{ fontSize: 13.5, fontWeight: 700, color: '#1A1A1A' }}>{v != null && v !== '' ? String(v) : '—'}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  <h3 style={{ fontSize:16, fontWeight:800, marginBottom:14, color:'#1A1A1A' }}>Passenger Details & Seats</h3>
                  <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
                    {(booking.passengerList || []).map((p, idx) => (
                      <div key={idx} style={{ padding:'16px', border:'1px solid #EBEBEB', borderRadius:6, background:'#fff' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
                          <div style={{ fontSize:14, fontWeight:700 }}>{p.title} {p.firstName} {p.lastName}</div>
                          <div style={{ fontSize:12, color:'#888' }}>Passenger {idx+1}</div>
                        </div>
                        <div style={{ display:'flex', gap:14, marginTop:10 }}>
                          {segments.map((f, fIdx) => {
                             const seatObj = (booking.selectedSeats?.[f.id]?.id) ? booking.selectedSeats[f.id] : booking.selectedSeats?.[f.id]?.[idx];
                             return (
                               <div key={fIdx} style={{ padding:'8px 12px', background:'#F8F7F4', borderRadius:4, border:'1px solid #EEE' }}>
                                 <div style={{ fontSize:10, color:'#AAA', textTransform:'uppercase', marginBottom:2 }}>{f.from} → {f.to}</div>
                                 <div style={{ fontSize:13, fontWeight:800, color:'#C8102E' }}>Seat {seatObj?.id || '—'}</div>
                               </div>
                             );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ borderTop: '1px solid #F0F0F0', paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 11, color: '#AAA', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>Total paid</div>
                      <div style={{ fontSize: 24, fontWeight: 900, color: '#C8102E', letterSpacing: -1 }}>{convertPrice(booking.totalAmount)}</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Change flight' && (
                <div style={{ maxWidth: 440 }}>
                  <p style={{ fontSize: 14, color: '#555', marginBottom: 22, lineHeight: 1.65 }}>Change your flight date. Free changes apply to Flex and Flex+ fares. Subject to availability.</p>
                  <div style={{ marginBottom: 16 }}>
                    <label className="field-label">New departure date</label>
                    <input type="date" value={newDate} min={new Date().toISOString().split('T')[0]} onChange={(e) => setNewDate(e.target.value)} className="field-input" />
                  </div>
                  <button type="button" onClick={handleChangeDate} disabled={loading || !newDate} className="btn-red" style={{ padding: '12px 28px', fontSize: 14 }}>
                    {loading ? 'Processing…' : 'Confirm date change'}
                  </button>
                </div>
              )}

              {activeTab === 'Upgrade' && (
                <div>
                  <p style={{ fontSize: 14, color: '#555', marginBottom: 20 }}>Upgrade using miles or pay the difference. Subject to availability.</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 500 }}>
                    {[
                      ['Premium Economy', '₹12,500'],
                      ['Business Class', '₹38,000'],
                      ['First Class', '₹85,000'],
                    ].map(([cab, price]) => (
                      <div
                        key={cab}
                        onClick={() => setUpgradeTarget(cab)}
                        style={{
                          padding: '16px 18px',
                          border: `1.5px solid ${upgradeTarget === cab ? '#C8102E' : '#E0E0E0'}`,
                          borderRadius: 6,
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          background: upgradeTarget === cab ? '#FFF5F5' : '#fff',
                          transition: 'all .15s',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>{cab}</div>
                          <div style={{ fontSize: 12.5, color: '#888', marginTop: 2 }}>Upgrade from {booking.cabinClass}</div>
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: '#C8102E' }}>{price}</div>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={handleUpgrade} disabled={loading || !upgradeTarget} className="btn-red" style={{ marginTop: 16, padding: '12px 28px', fontSize: 14 }}>
                    {loading ? 'Processing…' : 'Request upgrade'}
                  </button>
                </div>
              )}

              {activeTab === 'Add extras' && (
                <div>
                  <p style={{ fontSize: 14, color: '#555', marginBottom: 18 }}>Add extras to your booking. Prices shown per booking.</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {extras.map((e) => {
                      const sel = selectedExtras.has(e.id);
                      return (
                        <div
                          key={e.id}
                          onClick={() =>
                            setSelectedExtras((prev) => {
                              const n = new Set(prev);
                              sel ? n.delete(e.id) : n.add(e.id);
                              return n;
                            })
                          }
                          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', border: `1.5px solid ${sel ? '#C8102E' : '#E0E0E0'}`, borderRadius: 6, background: sel ? '#FFF5F5' : '#fff', cursor: 'pointer', transition: 'all .15s' }}
                        >
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>{e.name}</div>
                          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <div style={{ fontSize: 15, fontWeight: 800, color: '#C8102E' }}>{convertPrice(e.price)}</div>
                            <div style={{ width: 22, height: 22, borderRadius: 4, border: `2px solid ${sel ? '#C8102E' : '#DDD'}`, background: sel ? '#C8102E' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{sel && <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>✓</span>}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button type="button" onClick={addExtras} disabled={loading || selectedExtras.size === 0} className="btn-red" style={{ marginTop: 14, padding: '12px 28px', fontSize: 14 }}>
                    {loading ? 'Adding…' : 'Add selected extras'}
                  </button>
                </div>
              )}

              {activeTab === 'Cancel booking' && (
                <div style={{ maxWidth: 500 }}>
                  <div style={{ padding: '14px 16px', background: '#FFEBEE', border: '1px solid #FFCDD2', borderRadius: 6, marginBottom: 18 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#C8102E', marginBottom: 5 }}>⚠ Before you cancel</div>
                    <div style={{ fontSize: 13.5, color: '#555', lineHeight: 1.65 }}>Cancellations on Flex+ fares receive a full refund minus ₹500 fee.</div>
                  </div>
                  <button type="button" onClick={() => setCancelOpen(true)} style={{ width: '100%', padding: '13px', background: '#fff', border: '2px solid #C8102E', color: '#C8102E', fontWeight: 700, fontSize: 14, borderRadius: 4, cursor: 'pointer' }}>
                    Cancel this booking
                  </button>
                  {cancelOpen && (
                    <div style={{ marginTop: 16 }}>
                      <div style={{ padding: '13px', background: '#FFEBEE', border: '1px solid #FFCDD2', borderRadius: 5, marginBottom: 14, fontSize: 13.5, color: '#C8102E', fontWeight: 600, textAlign: 'center' }}>Are you sure? This action cannot be undone.</div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button type="button" onClick={() => setCancelOpen(false)} style={{ flex: 1, padding: '12px', border: '1px solid #E0E0E0', borderRadius: 4, background: '#fff', color: '#555', fontSize: 14, cursor: 'pointer' }}>Keep booking</button>
                        <button type="button" onClick={handleCancel} disabled={cancelling} style={{ flex: 1, padding: '12px', background: cancelling ? '#AAA' : '#C8102E', border: 'none', color: '#fff', fontWeight: 700, fontSize: 14, borderRadius: 4, cursor: 'pointer' }}>{cancelling ? 'Cancelling…' : 'Yes, cancel'}</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
