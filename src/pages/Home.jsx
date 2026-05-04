// src/pages/Home.jsx
import React, { useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { useApp } from '../context/AppContext';
import SearchBox from '../components/SearchBox';
import { POPULAR_DESTINATIONS, TODAY } from '../utils/flightData';
import { anime, fadeUp, staggerReveal, countUp, cardEntrance } from '../utils/anime';

import { offerService, destinationService, airportService } from '../services/api';

const CABINS = [
  { title: 'First Class', desc: 'Private suites, shower spa, full-flat bed, chauffeur service', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=360&fit=crop' },
  { title: 'Business Class', desc: 'Lie-flat seats, lounge access, premium champagne & dining', img: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&h=360&fit=crop' },
  { title: 'Premium Economy', desc: 'Extra legroom, enhanced meals, dedicated check-in lane', img: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=600&h=360&fit=crop' },
  { title: 'Economy', desc: 'Personal screen, hot meals, generous seat pitch', img: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=600&h=360&fit=crop' },
];
const WHY = [
  { icon: '🌍', t: '150+ Destinations', d: 'Six continents from our Dubai hub' },
  { icon: '🏆', t: '5-Star Rated', d: 'Skytrax award 15 years running' },
  { icon: '🎬', t: '4,500+ Channels', d: 'Movies, music & podcasts onboard' },
  { icon: '🍽', t: 'Award Dining', d: 'Chef-crafted menus every flight' },
  { icon: '📶', t: 'Onboard Wi-Fi', d: 'Stay connected at 40,000 ft' },
  { icon: '🛡', t: 'Safe & Reliable', d: 'Perfect safety record since 2009' },
];
const STATS_INITIAL = [
  { end: 150, suf: '+', lbl: 'Destinations' },
  { end: 250, suf: '+', lbl: 'Fleet size' },
  { end: 42, suf: 'M', lbl: 'Passengers/yr' },
  { end: 15, suf: '', lbl: 'Years 5-star' },
];

export default function Home() {
  const { setSearchParams } = useBooking();
  const { convertPrice } = useApp();
  const navigate = useNavigate();
  const planeRef = useRef(null);
  const statsRef = useRef(null);
  const statEls = useRef([]);

  const [offers, setOffers] = React.useState([]);
  const [destinations, setDestinations] = React.useState([]);
  const [stats, setStats] = React.useState(STATS_INITIAL);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [o, d, airports] = await Promise.all([
          offerService.getActive(),
          destinationService.getTop(6),
          airportService.getAll()
        ]);
        setOffers(o);
        setDestinations(d);
        if (airports.length > 0) {
          setStats(prev => {
            const next = [...prev];
            next[0].end = airports.length + 100; // Realistic scaling
            return next;
          });
        }
      } catch (err) {
        console.error("Home data load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    fadeUp('.hero-eyebrow,.hero-h1,.hero-sub', 300);

    const loopPlane = () => {
      if (!planeRef.current) return;
      anime({ targets: planeRef.current, translateX: ['-130%', '130%'], opacity: [0, .5, .5, 0], duration: 7000, easing: 'easeInOutSine', complete: () => setTimeout(loopPlane, 3000) });
    };
    setTimeout(loopPlane, 1400);

    setTimeout(() => cardEntrance('.offer-card'), 700);
    setTimeout(() => staggerReveal('.dest-card'), 900);

    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        statEls.current.forEach((el, i) => el && countUp(el, stats[i].end, 1400));
        obs.disconnect();
      }
    }, { threshold: .3 });
    if (statsRef.current) obs.observe(statsRef.current);

    const cabObs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { cardEntrance('.cabin-card'); cabObs.disconnect(); }
    }, { threshold: .1 });
    const cs = document.querySelector('.cabin-section');
    if (cs) cabObs.observe(cs);

    return () => { obs.disconnect(); cabObs.disconnect(); };
  }, []);

  const quickBook = code => {
    setSearchParams({ tripType: 'return', from: 'BOM', to: code, departureDate: TODAY, returnDate: '', passengers: { adults: 1, children: 0, infants: 0 }, cabinClass: 'Economy' });
    navigate('/book');
  };

  return (
    <div style={{ background: '#fff' }}>

      {/* ── HERO ── */}
      <div style={{ position: 'relative', height: 630 }}>
        <img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&h=700&fit=crop&q=85"
          alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,rgba(0,0,0,.32) 0%,rgba(0,0,0,.14) 36%,rgba(0,0,0,.62) 100%)' }} />
        <div style={{ position: 'absolute', top: '20%', overflow: 'hidden', width: '100%', height: 44, pointerEvents: 'none' }}>
          <span ref={planeRef} style={{ display: 'inline-block', fontSize: 26, color: 'rgba(255,255,255,.42)' }}>✈</span>
        </div>
        <div style={{ position: 'absolute', top: '24%', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', color: '#fff', width: '100%', padding: '0 24px' }}>
          <div className="hero-eyebrow" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '5px', textTransform: 'uppercase', marginBottom: 14, opacity: 0 }}>Award-Winning Airline · 150+ Destinations</div>
          <h1 className="hero-h1" style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 'clamp(2.8rem,6vw,4.5rem)', fontWeight: 400, lineHeight: 1.1, marginBottom: 13, opacity: 0 }}>Fly Better.<br />Arrive in Style.</h1>
          <p className="hero-sub" style={{ fontSize: 16, fontWeight: 300, opacity: 0, maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>Premium service across six continents · Skywards rewards on every flight</p>
        </div>
      </div>

      {/* ── SEARCH BOX overlapping hero ── */}
      <div style={{ maxWidth: 1200, margin: '-140px auto 0', padding: '0 24px', position: 'relative', zIndex: 50 }}>
        <SearchBox darkMode={false} />
      </div>

      {/* ── QUICK LINKS ── */}
      <div style={{ background: '#F8F7F4', borderBottom: '1px solid #E8E8E8' }}>
        <div className="container" style={{ padding: '13px 24px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[['✈', 'Flights', '/book'], ['🏨', 'Hotels', '/hotels'], ['📋', 'Manage', '/manage'], ['🛂', 'Check In', '/check-in'], ['📡', 'Flight Status', '/flight-status'], ['🌍', 'Destinations', '/destinations']].map(([ic, lbl, path]) => (
            <Link key={path} to={path} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', background: '#fff', border: '1px solid #E0E0E0', borderRadius: 100, fontSize: 13, fontWeight: 500, color: '#555', transition: 'all .2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#C8102E'; e.currentTarget.style.color = '#C8102E'; e.currentTarget.style.background = '#FFF5F5'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E0E0E0'; e.currentTarget.style.color = '#555'; e.currentTarget.style.background = '#fff'; }}>
              {ic} {lbl}
            </Link>
          ))}
        </div>
      </div>

      {/* ── OFFERS ── */}
      <div className="container" style={{ padding: '60px 24px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 30, fontWeight: 500, color: '#0D0D0D' }}>Offers &amp; inspiration</h2>
          <Link to="/destinations" style={{ fontSize: 13, color: '#C8102E', fontWeight: 600 }}>View all →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
          {offers.map((c, i) => (
            <div key={c.id || i} className="offer-card card-hover" onClick={() => navigate(c.link || '/book')}
              style={{ borderRadius: 6, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,.07)', border: '1px solid #EBEBEB', cursor: 'pointer', opacity: 0 }}>
              <div style={{ position: 'relative', height: 195, overflow: 'hidden' }}>
                <img
                  src={c.image || c.img || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&h=360&fit=crop'}
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=600&h=360&fit=crop'; }}
                  alt={c.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .5s' }}
                  onMouseEnter={e => e.target.style.transform = 'scale(1.06)'}
                  onMouseLeave={e => e.target.style.transform = 'scale(1)'} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,.42) 0%,transparent 55%)' }} />
                <span className="tag tag-red" style={{ position: 'absolute', top: 12, left: 12 }}>{c.type || c.tag || 'Offer'}</span>
              </div>
              <div style={{ padding: '15px 17px' }}>
                <h3 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 19, fontWeight: 500, color: '#0D0D0D', marginBottom: 5 }}>{c.title}</h3>
                <p style={{ fontSize: 13, color: '#777', marginBottom: 12 }}>{c.description || c.sub}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: '#C8102E', fontWeight: 600 }}>Explore →</span>
                  {c.code && <span style={{ fontSize: 11, fontWeight: 700, color: '#666', background: '#F0F0F0', padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace' }}>{c.code}</span>}
                </div>
              </div>
            </div>
          ))}
          {loading && [1, 2, 3].map(i => <div key={i} style={{ height: 300, background: '#F0F0F0', borderRadius: 6, animation: 'pulse 1.5s infinite' }} />)}
        </div>
      </div>

      {/* ── POPULAR DESTINATIONS — prices update with currency ── */}
      <div className="container" style={{ padding: '56px 24px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 30, fontWeight: 500, color: '#0D0D0D' }}>Popular from India</h2>
          <Link to="/destinations" style={{ fontSize: 13, color: '#C8102E', fontWeight: 600 }}>All destinations →</Link>
        </div>
        <p style={{ fontSize: 12.5, color: '#999', marginBottom: 22 }}>Return fares per person, taxes included</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
          {destinations.map((c, i) => (
            <div key={c.id || i} className="dest-card card-hover" onClick={() => quickBook(c.code)}
              style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #EBEBEB', cursor: 'pointer', boxShadow: '0 1px 6px rgba(0,0,0,.05)', opacity: 0 }}>
              <div style={{ height: 175, overflow: 'hidden' }}>
                <img
                  src={c.image || c.img || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&h=360&fit=crop'}
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=600&h=360&fit=crop'; }}
                  alt={c.title || c.name || c.city}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .5s' }}
                  onMouseEnter={e => e.target.style.transform = 'scale(1.06)'}
                  onMouseLeave={e => e.target.style.transform = 'scale(1)'} />
              </div>
              <div style={{ padding: '13px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 15.5, fontWeight: 700, color: '#0D0D0D' }}>{c.name || c.city}</div>
                  <div style={{ fontSize: 11.5, color: '#AAA', marginTop: 2 }}>{c.country}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10.5, color: '#AAA' }}>From</div>
                  <div style={{ fontSize: 17, fontWeight: 900, color: '#C8102E', letterSpacing: -.5 }}>{convertPrice(c.price || c.priceINR)}</div>
                </div>
              </div>
            </div>
          ))}
          {loading && [1, 2, 3].map(i => <div key={i} style={{ height: 250, background: '#F0F0F0', borderRadius: 8, animation: 'pulse 1.5s infinite' }} />)}
        </div>
      </div>

      {/* ── STATS ── */}
      <div ref={statsRef} style={{ background: '#0D0D0D', margin: '64px 0 0', padding: '56px 24px' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 32 }}>
          {stats.map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 56, fontWeight: 600, color: '#fff', lineHeight: 1, letterSpacing: -2 }}>
                <span ref={el => statEls.current[i] = el}>0</span>{s.suf}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.38)', marginTop: 8, letterSpacing: 2, textTransform: 'uppercase' }}>{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CABIN EXPERIENCE ── */}
      <div className="cabin-section" style={{ background: '#F8F7F4', padding: '64px 24px' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <h2 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 32, fontWeight: 400, color: '#0D0D0D', marginBottom: 8 }}>The Habibi Experience</h2>
            <p style={{ fontSize: 14, color: '#777' }}>Award-winning comfort across every cabin class</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18 }}>
            {CABINS.map((c, i) => (
              <div key={i} className="cabin-card card-hover" onClick={() => navigate('/experience')}
                style={{ borderRadius: 8, overflow: 'hidden', background: '#fff', border: '1px solid #EBEBEB', cursor: 'pointer', opacity: 0 }}>
                <div style={{ height: 155, overflow: 'hidden' }}>
                  <img src={c.img} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .45s' }}
                    onMouseEnter={e => e.target.style.transform = 'scale(1.07)'}
                    onMouseLeave={e => e.target.style.transform = 'scale(1)'} />
                </div>
                <div style={{ padding: '14px 15px' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0D0D0D', marginBottom: 5 }}>{c.title}</div>
                  <div style={{ fontSize: 12.5, color: '#777', lineHeight: 1.6, marginBottom: 11 }}>{c.desc}</div>
                  <span style={{ fontSize: 12.5, color: '#C8102E', fontWeight: 600 }}>Learn more →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SKYWARDS ── */}
      <div style={{ background: 'linear-gradient(135deg,#C8102E,#7a0018)', padding: '64px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 52, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,.5)', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: 12 }}>Habibi Skywards</div>
            <h2 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 40, fontWeight: 400, color: '#fff', marginBottom: 14, lineHeight: 1.12 }}>Every mile, a new adventure</h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,.8)', lineHeight: 1.7, marginBottom: 26 }}>Earn miles on every flight. Redeem for upgrades, hotels, and exclusive experiences with 50+ partners worldwide.</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <Link to="/register" style={{ padding: '13px 28px', background: '#fff', color: '#C8102E', fontWeight: 700, fontSize: 14, borderRadius: 4, transition: 'all .2s', display: 'inline-block' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>Join free →</Link>
              <Link to="/loyalty" style={{ padding: '13px 22px', border: '1px solid rgba(255,255,255,.35)', background: 'none', color: '#fff', fontSize: 14, borderRadius: 4, display: 'inline-block', transition: 'background .2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}>Learn more</Link>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[['Blue', '0–24,999 miles'], ['Silver', '25,000–49,999'], ['Gold', '50,000–99,999'], ['Platinum', '100,000+']].map(([tier, range]) => (
              <Link key={tier} to="/loyalty" style={{ padding: 16, background: 'rgba(255,255,255,.1)', borderRadius: 8, border: '1px solid rgba(255,255,255,.15)', backdropFilter: 'blur(8px)', display: 'block', transition: 'background .2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.18)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.1)'}>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 5 }}>{tier}</div>
                <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.5)' }}>{range}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── WHY ── */}
      <div style={{ padding: '64px 24px', background: '#fff' }}>
        <div className="container">
          <h2 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 30, fontWeight: 400, color: '#0D0D0D', textAlign: 'center', marginBottom: 44 }}>Why choose Habibi Airways</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 30 }}>
            {WHY.map(({ icon, t, d }) => (
              <div key={t} style={{ display: 'flex', gap: 16, padding: '18px 0' }}>
                <div style={{ width: 52, height: 52, borderRadius: 12, background: '#FFF5F5', border: '1px solid #FFCDD2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{icon}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0D0D0D', marginBottom: 6 }}>{t}</div>
                  <div style={{ fontSize: 13, color: '#777', lineHeight: 1.65 }}>{d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── APP DOWNLOAD ── */}
      <div style={{ background: '#F8F7F4', padding: '48px 24px', borderTop: '1px solid #EBEBEB' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 48, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontSize: 10.5, color: '#C8102E', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>Mobile App</div>
            <h3 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 26, fontWeight: 500, color: '#0D0D0D', marginBottom: 11 }}>Your journey in your pocket</h3>
            <p style={{ fontSize: 13.5, color: '#777', marginBottom: 22, lineHeight: 1.7 }}>Mobile boarding passes, real-time flight updates, seat selection and exclusive app-only fares.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              {['App Store', 'Google Play'].map(s => (
                <a key={s} href="#" onClick={e => e.preventDefault()} style={{ padding: '10px 20px', background: '#1A1A1A', color: '#fff', borderRadius: 6, fontSize: 12.5, fontWeight: 600, transition: 'background .2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#C8102E'}
                  onMouseLeave={e => e.currentTarget.style.background = '#1A1A1A'}>{s}</a>
              ))}
            </div>
          </div>
          <div style={{ fontSize: 90, lineHeight: 1, filter: 'drop-shadow(0 8px 24px rgba(0,0,0,.1))' }}>📱</div>
        </div>
      </div>

    </div>
  );
}
