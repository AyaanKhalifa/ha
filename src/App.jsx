// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import { AppProvider } from './context/AppContext';

import Navbar  from './components/Navbar';
import Footer  from './components/Footer';
import Loader  from './components/Loader';

// ── User pages ──────────────────────────────────────────────────────
import Home          from './pages/Home';
import Login         from './pages/Login';
import Register      from './pages/Register';
import Book          from './pages/Book';
import Summary       from './pages/Summary';
import Passenger     from './pages/Passenger';
import AddOns        from './pages/AddOns';
import Payment       from './pages/Payment';
import Confirmation  from './pages/Confirmation';
import MyTrips       from './pages/MyTrips';
import Manage        from './pages/Manage';
import CheckIn       from './pages/CheckIn';
import FlightStatus  from './pages/FlightStatus';
import Hotels        from './pages/Hotels';
import Destinations  from './pages/Destinations';
import Experience    from './pages/Experience';
import Loyalty       from './pages/Loyalty';
import Profile       from './pages/Profile';
import Contact       from './pages/Contact';
import NotFound      from './pages/NotFound';

// ── New pages ───────────────────────────────────────────────────────
import Baggage       from './pages/Baggage';
import VisaInfo      from './pages/VisaInfo';
import TravelGuide   from './pages/TravelGuide';
import About         from './pages/About';
import Careers       from './pages/Careers';
import Press         from './pages/Press';
import Safety        from './pages/Safety';
import SpecialNeeds  from './pages/SpecialNeeds';

// ── Admin ───────────────────────────────────────────────────────────
import Admin         from './pages/Admin';
import SeedDb        from './pages/SeedDb';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  return user ? children : <Navigate to="/login" replace />;
}
function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

const CookieBanner = () => {
  const [show, setShow] = React.useState(!localStorage.getItem('ha_cookies'));
  if (!show) return null;
  return (
    <div className="animate-slideDown" style={{ position:'fixed', bottom:24, left:24, right:24, background:'#1A1A1A', padding:'20px 24px', borderRadius:8, boxShadow:'0 12px 48px rgba(0,0,0,.3)', zIndex:9999, display:'flex', gap:20, alignItems:'center', justifyContent:'space-between', fontFamily:'DM Sans,sans-serif', border:'1px solid rgba(255,255,255,.1)', maxWidth:1200, margin:'0 auto' }}>
      <div>
        <div style={{ fontSize:15, fontWeight:700, color:'#fff', marginBottom:4 }}>We value your privacy</div>
        <div style={{ fontSize:13, color:'rgba(255,255,255,.7)' }}>Habibi Airways uses cookies to ensure you get the best experience on our website, personalize content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies. <Link to="/contact" style={{color:'#fff', textDecoration:'underline'}}>Learn more</Link></div>
      </div>
      <div style={{ display:'flex', gap:10, flexShrink:0 }}>
        <button onClick={() => { setShow(false); }} style={{ padding:'10px 18px', border:'1px solid rgba(255,255,255,.2)', background:'transparent', borderRadius:5, fontSize:13, fontWeight:600, color:'#fff', cursor:'pointer' }}>Decline</button>
        <button onClick={() => { localStorage.setItem('ha_cookies','1'); setShow(false); }} style={{ padding:'10px 18px', border:'none', background:'#fff', color:'#1A1A1A', borderRadius:5, fontSize:13, fontWeight:700, cursor:'pointer' }}>Accept All</button>
      </div>
    </div>
  );
};

function Shell() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Navbar />
      <div className="page-wrap">
        <Routes>
          {/* ── Public ── */}
          <Route path="/"               element={<Home />} />
          <Route path="/login"          element={<Login />} />
          <Route path="/register"       element={<Register />} />
          <Route path="/book"           element={<Book />} />
          <Route path="/manage"         element={<Manage />} />
          <Route path="/check-in"       element={<CheckIn />} />
          <Route path="/flight-status"  element={<FlightStatus />} />
          <Route path="/hotels"         element={<Hotels />} />
          <Route path="/destinations"   element={<Destinations />} />
          <Route path="/experience"     element={<Experience />} />
          <Route path="/loyalty"        element={<Loyalty />} />
          <Route path="/contact"        element={<Contact />} />
          <Route path="/baggage"        element={<Baggage />} />
          <Route path="/visa-info"      element={<VisaInfo />} />
          <Route path="/travel-guide"   element={<TravelGuide />} />
          <Route path="/about"          element={<About />} />
          <Route path="/careers"        element={<Careers />} />
          <Route path="/press"          element={<Press />} />
          <Route path="/safety"         element={<Safety />} />
          <Route path="/special-needs"  element={<SpecialNeeds />} />

          {/* ── Booking flow ── */}
          <Route path="/summary"        element={<Summary />} />
          <Route path="/passenger"      element={<Passenger />} />
          <Route path="/addons"         element={<AddOns />} />
          <Route path="/payment"        element={<Payment />} />
          <Route path="/confirmation"   element={<Confirmation />} />

          {/* ── Authenticated ── */}
          <Route path="/my-trips"       element={<PrivateRoute><MyTrips /></PrivateRoute>} />
          <Route path="/profile"        element={<PrivateRoute><Profile /></PrivateRoute>} />

          {/* ── Admin ── */}
          <Route path="/admin/*"        element={<AdminRoute><Admin /></AdminRoute>} />
          <Route path="/seed"           element={<SeedDb />} />

          {/* ── 404 ── */}
          <Route path="*"               element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
      <CookieBanner />
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <BookingProvider>
          <Shell />
        </BookingProvider>
      </AuthProvider>
    </AppProvider>
  );
}
