// src/pages/MyTrips.jsx — Full trip history with manage/download
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { bookingService } from '../services/api';
import { FARE_CLASSES } from '../utils/flightData';
import toast from '../utils/toast';

const STATUS_CFG = {
  upcoming: { bg: '#E3F2FD', color: '#1565C0', label: 'Upcoming', dot: '#1976D2' },
  completed: { bg: '#E8F5E9', color: '#2E7D32', label: 'Completed', dot: '#43A047' },
  cancelled: { bg: '#FFEBEE', color: '#C62828', label: 'Cancelled', dot: '#C8102E' },
};
const CABIN_COL = { Economy: '#607D8B', 'Premium Economy': '#1565C0', Business: '#C8102E', First: '#6A1B9A' };

function TripCard({ trip, convertPrice, navigate, airportsMap }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CFG[trip.status] || STATUS_CFG.completed;
  const from = airportsMap[trip.from] || { city: trip.from, code: trip.from };
  const to = airportsMap[trip.to] || { city: trip.to, code: trip.to };
  const dateStr = new Date(trip.date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  const downloadBP = () => {
    const html = `<html><head><title>Boarding Pass ${trip.pnr}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;background:#f0f0f0;display:flex;align-items:center;justify-content:center;min-height:100vh}.pass{background:linear-gradient(135deg,#C8102E,#7a0018);color:#fff;padding:32px;border-radius:12px;max-width:620px;width:calc(100% - 40px);margin:20px}.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px}.airline{font-size:22px;font-weight:700;font-family:Georgia,serif}.route{display:flex;gap:16px;align-items:center;margin-bottom:24px;border-bottom:1px solid rgba(255,255,255,.2);padding-bottom:20px}.code{font-size:52px;font-weight:900;letter-spacing:-2px;line-height:1}.arrow{font-size:24px;opacity:.6}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:16px;border-top:1px solid rgba(255,255,255,.2);padding-top:16px}.item label{font-size:10px;opacity:.6;display:block;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px}.item span{font-size:16px;font-weight:700}.pnr{text-align:center;margin-top:20px;padding:14px;background:rgba(255,255,255,.15);border-radius:8px;font-size:11px;opacity:.6;text-transform:uppercase;letter-spacing:1px}.pnr span{display:block;font-size:28px;font-weight:900;letter-spacing:4px;opacity:1;margin-top:4px;font-family:monospace}</style></head><body><div class="pass"><div class="header"><div class="airline">Habibi Airways</div><div style="font-size:12px;opacity:.6;text-transform:uppercase;letter-spacing:2px">Boarding Pass</div></div><div class="route"><div><div class="code">${trip.from}</div><div style="font-size:13px;opacity:.7;margin-top:4px">${from.city}</div></div><div class="arrow">→</div><div><div class="code">${trip.to}</div><div style="font-size:13px;opacity:.7;margin-top:4px">${to.city}</div></div></div><div class="grid"><div class="item"><label>Passenger</label><span>Traveler</span></div><div class="item"><label>Flight</label><span>${trip.flightNum}</span></div><div class="item"><label>Class</label><span>${trip.cabin}</span></div><div class="item"><label>Date</label><span>${trip.date}</span></div><div class="item"><label>Departure</label><span>${trip.depStr}</span></div><div class="item"><label>Seat</label><span>${trip.seat}</span></div></div><div class="pnr">Booking Reference<span>${trip.pnr}</span></div></div></body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `BoardingPass-${trip.pnr}.html`; a.click();
    URL.revokeObjectURL(url);
    toast.success('Boarding pass downloaded!');
  };

  return (
    <div style={{ background: '#fff', border: `1.5px solid ${expanded ? '#C8102E' : '#E0E0E0'}`, borderRadius: 8, overflow: 'hidden', marginBottom: 12, transition: 'all .2s', boxShadow: expanded ? '0 4px 24px rgba(200,16,46,.1)' : '0 1px 4px rgba(0,0,0,.05)' }}>
      {/* Main row */}
      <div style={{ padding: '18px 22px', display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap', cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>
        {/* Airline logo */}
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#C8102E,#8b0000)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontFamily: 'Cormorant Garamond,serif', fontWeight: 700, fontSize: 13, color: '#fff' }}>HA</span>
        </div>

        {/* Route */}
        <div style={{ flex: 2, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#1A1A1A', letterSpacing: -.5 }}>{from.city}</span>
            <svg width="40" height="12" viewBox="0 0 40 12">
              <path d="M2 8 Q20 2 38 8" stroke="#DDD" strokeWidth="1.5" fill="none" />
              <text x="36" y="8" fill="#888" fontSize="8">✈</text>
            </svg>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#1A1A1A', letterSpacing: -.5 }}>{to.city}</span>
          </div>
          <div style={{ fontSize: 12.5, color: '#888' }}>
            {trip.flightNum} · {dateStr} · {trip.depStr} → {trip.arrStr} · {trip.aircraft}
          </div>
        </div>

        {/* Cabin badge */}
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: CABIN_COL[trip.cabin] || '#555', background: (CABIN_COL[trip.cabin] || '#555') + '18', padding: '4px 12px', borderRadius: 100 }}>{trip.cabin}</span>
          <div style={{ fontSize: 11, color: '#AAA', marginTop: 4, fontFamily: 'monospace', letterSpacing: 1 }}>{trip.pnr}</div>
        </div>

        {/* Amount + status */}
        <div style={{ textAlign: 'right', minWidth: 100 }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#C8102E', letterSpacing: -1 }}>{convertPrice(trip.amount)}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'flex-end', marginTop: 4 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.dot }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: cfg.color }}>{cfg.label}</span>
          </div>
        </div>

        <svg width="10" height="6" viewBox="0 0 10 6" style={{ transition: 'transform .2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}>
          <path d="M1 1l4 4 4-4" stroke="#AAA" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{ borderTop: '1px solid #F0F0F0', padding: '18px 22px', background: '#FAFAFA' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 12, marginBottom: 18 }}>
            {[
              ['From', `${from.city} (${trip.from})`],
              ['To', `${to.city} (${trip.to})`],
              ['Flight', trip.flightNum],
              ['Date', trip.date],
              ['Departure', trip.depStr],
              ['Arrival', trip.arrStr],
              ['Cabin', trip.cabin],
              ['Fare class', trip.fare],
              ['Seat', trip.seat || 'TBA'],
              ['Passengers', trip.passengers],
              ['Aircraft', trip.aircraft],
              ['Amount', convertPrice(trip.amount)],
            ].map(([k, v]) => (
              <div key={k} style={{ padding: '10px 12px', background: '#fff', borderRadius: 5, border: '1px solid #EBEBEB' }}>
                <div style={{ fontSize: 10, color: '#AAA', textTransform: 'uppercase', letterSpacing: .8, marginBottom: 3 }}>{k}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A', wordBreak: 'break-word' }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {trip.status === 'upcoming' && (
              <>
                <button onClick={downloadBP} className="btn-red" style={{ fontSize: 13, padding: '9px 18px' }}>⬇ Download boarding pass</button>
                <button onClick={() => { toast.success('Boarding pass emailed!'); }} style={{ padding: '9px 16px', border: '1px solid #E0E0E0', borderRadius: 4, background: '#fff', color: '#555', fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', transition: 'all .15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#C8102E'; e.currentTarget.style.color = '#C8102E'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#E0E0E0'; e.currentTarget.style.color = '#555'; }}>📧 Email boarding pass</button>
                <Link to="/manage" className="btn-ghost" style={{ fontSize: 13, padding: '9px 16px', display: 'flex', alignItems: 'center' }}>Manage booking</Link>
                <Link to="/check-in" className="btn-ghost" style={{ fontSize: 13, padding: '9px 16px', display: 'flex', alignItems: 'center' }}>Online check-in</Link>
              </>
            )}
            {trip.status === 'completed' && (
              <>
                <button onClick={downloadBP} style={{ padding: '9px 16px', border: '1px solid #E0E0E0', borderRadius: 4, background: '#fff', color: '#555', fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>⬇ Download receipt</button>
                <button onClick={() => toast.success('We value your feedback! Rating submitted.')} style={{ padding: '9px 16px', border: '1px solid #E0E0E0', borderRadius: 4, background: '#fff', color: '#555', fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>⭐ Rate this flight</button>
              </>
            )}
            {trip.status === 'cancelled' && (
              <div style={{ padding: '10px 14px', background: '#FFEBEE', border: '1px solid #FFCDD2', borderRadius: 5, fontSize: 13, color: '#C62828' }}>
                This booking was cancelled. Refund of {convertPrice(Math.round(trip.amount * 0.8))} processed.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MyTrips() {
  const { user, userProfile } = useAuth();
  const { convertPrice, airportsMap } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) { setLoading(false); return; }
      try {
        const data = await bookingService.getByUser(user.uid);
        const formatted = data.map(b => {
          // Calculate miles based on duration (proxy for distance)
          // Average speed ~500mph. durM is in minutes. 
          // Miles = (durM / 60) * 500
          const durM = b.durM || 360;
          const baseMiles = Math.round((durM / 60) * 500);

          // Apply multiplier based on cabin/fare
          const cabin = b.cabinClass || 'Economy';
          const fareName = b.fare?.name || 'Flex';
          const fareClassInfo = (FARE_CLASSES[cabin] || []).find(f => f.name === fareName) || { milesEarnPct: 100 };
          const earnedMiles = Math.round(baseMiles * (fareClassInfo.milesEarnPct / 100));

          // Extract seat for the primary passenger (index 0)
          // New structure: b.selectedSeats[flightId][paxIdx]
          // Old structure: b.selectedSeats[flightId] (direct object)
          const flightId = b.flight?.id || (b.multiCityFlights?.[0]?.selectedFlight?.id);
          const paxSeats = b.selectedSeats?.[flightId];
          const seatObj = (paxSeats?.id) ? paxSeats : paxSeats?.[0];

          return {
            ...b,
            from: b.from || b.flight?.from || 'BOM',
            to: b.to || b.flight?.to || 'DXB',
            amount: b.totalAmount || 0,
            status: b.status === 'confirmed' ? 'upcoming' : b.status,
            flightNum: b.flightNum || b.flight?.flightNum || 'HA101',
            depStr: b.depStr || b.flight?.depStr || '06:00',
            arrStr: b.arrStr || b.flight?.arrStr || '08:30',
            aircraft: b.aircraft || b.flight?.aircraft || 'Airbus A380',
            date: b.date || b.createdAt?.split('T')[0] || '2025-01-01',
            cabin: cabin,
            seat: seatObj?.id || '—',
            earnedMiles,
            country: airportsMap[b.to || b.flight?.to]?.country || 'Unknown',
            fromCountry: airportsMap[b.from || b.flight?.from]?.country || 'Unknown'
          };
        });
        setBookings(formatted);
      } catch (err) {
        console.error("Error loading trips:", err);
        toast.error("Failed to load your trips");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  if (loading) return <div style={{ padding: 100, textAlign: 'center' }}>Loading your journeys…</div>;

  const tabs = [
    { id: 'all', label: 'All trips', count: bookings.length },
    { id: 'upcoming', label: 'Upcoming', count: bookings.filter(t => t.status === 'upcoming').length },
    { id: 'completed', label: 'Completed', count: bookings.filter(t => t.status === 'completed').length },
    { id: 'cancelled', label: 'Cancelled', count: bookings.filter(t => t.status === 'cancelled').length },
  ];
  const filtered = activeTab === 'all' ? bookings : bookings.filter(t => t.status === activeTab);

  const loyalty = { tier: userProfile?.tier || 'Blue', memberId: userProfile?.loyaltyId || 'HA-NEW-001' };

  const activeBookings = bookings.filter(b => b.status !== 'cancelled');
  const uniqueCountries = new Set();
  const uniqueCities = new Set();
  activeBookings.forEach(b => {
    uniqueCities.add(b.from);
    uniqueCities.add(b.to);
    if (b.country && b.country !== 'Unknown') uniqueCountries.add(b.country);
    if (b.fromCountry && b.fromCountry !== 'Unknown') uniqueCountries.add(b.fromCountry);
  });

  const totalMiles = userProfile?.skywardsMiles || 0;

  return (
    <div style={{ background: '#F8F7F4', minHeight: '100vh', fontFamily: 'DM Sans,sans-serif' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#C8102E,#7a0018)', padding: '32px 24px' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'center' }}>
          <div>
            <h1 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 'clamp(1.8rem,3vw,2.4rem)', fontWeight: 400, color: '#fff', marginBottom: 6 }}>
              My Trips
            </h1>
            <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.75)' }}>
              Welcome back, {userProfile?.name?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'Traveler'}
            </p>
          </div>
          {/* Miles card */}
          <div style={{ background: 'rgba(255,255,255,.12)', borderRadius: 8, padding: '16px 24px', border: '1px solid rgba(255,255,255,.2)', textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.55)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>Skywards Miles</div>
            <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 32, fontWeight: 600, color: '#fff', letterSpacing: -1 }}>
              {totalMiles.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.55)', marginTop: 3 }}>
              {loyalty.tier} member · {loyalty.memberId}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E0E0E0' }}>
        <div className="container" style={{ display: 'flex', gap: 0 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ padding: '14px 20px', border: 'none', borderBottom: `3px solid ${activeTab === t.id ? '#C8102E' : 'transparent'}`, background: activeTab === t.id ? '#FFF5F5' : '#fff', color: activeTab === t.id ? '#C8102E' : '#666', fontWeight: activeTab === t.id ? 700 : 400, fontSize: 13.5, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', transition: 'all .2s', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 7 }}>
              {t.label}
              <span style={{ fontSize: 12, background: activeTab === t.id ? '#C8102E' : '#EBEBEB', color: activeTab === t.id ? '#fff' : '#888', padding: '1px 7px', borderRadius: 100 }}>{t.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="container" style={{ padding: '24px 24px 56px' }}>
        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 22 }}>
          {(() => {
            return [
              ['✈', 'Total flights', bookings.length, '#C8102E'],
              ['🌍', 'Countries visited', uniqueCountries.size, '#1565C0'],
              ['📍', 'Cities explored', uniqueCities.size, '#2E7D32'],
              ['🏆', 'Miles earned', totalMiles.toLocaleString('en-IN') + '', '#6A1B9A'],
            ].map(([ic, lbl, val, color]) => (
              <div key={lbl} style={{ background: '#fff', border: '1px solid #E8E8E8', borderRadius: 6, padding: '16px 18px', display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{ic}</div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 900, color, letterSpacing: -1 }}>{val}</div>
                  <div style={{ fontSize: 11.5, color: '#888', marginTop: 2 }}>{lbl}</div>
                </div>
              </div>
            ));
          })()}
        </div>

        {filtered.length === 0 ? (
          <div style={{ background: '#fff', border: '1px dashed #E0E0E0', borderRadius: 8, padding: '48px', textAlign: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>✈</div>
            <h3 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 22, fontWeight: 400, marginBottom: 8 }}>No trips in this category</h3>
            <Link to="/book" className="btn-red" style={{ padding: '12px 28px', fontSize: 14, display: 'inline-flex', marginTop: 8 }}>Book a flight</Link>
          </div>
        ) : (
          filtered.map(t => <TripCard key={t.id} trip={t} convertPrice={convertPrice} navigate={navigate} airportsMap={airportsMap} />)
        )}

        {/* Book more CTA */}
        <div style={{ background: 'linear-gradient(135deg,#1A1A1A,#2d2d2d)', borderRadius: 8, padding: '32px 36px', marginTop: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 24, fontWeight: 400, color: '#fff', marginBottom: 6 }}>Ready for your next adventure?</div>
            <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,.6)' }}>Book a flight and earn Skywards miles on every trip</div>
          </div>
          <Link to="/book" className="btn-red" style={{ padding: '12px 28px', fontSize: 14 }}>Book a flight →</Link>
        </div>
      </div>
    </div>
  );
}
