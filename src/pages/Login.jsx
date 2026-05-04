// src/pages/Login.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { anime } from '../utils/anime';
import toast from '../utils/toast';

export default function Login() {
  const { login, loginWithGoogle, user } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from || '/';
  const [email,   setEmail]   = useState('');
  const [pw,      setPw]      = useState('');
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [err,     setErr]     = useState('');
  const cardRef = useRef(null);

  useEffect(() => {
    if (user) navigate(from, { replace:true });
    if (cardRef.current) anime({ targets:cardRef.current, opacity:[0,1], translateY:[28,0], duration:560, easing:'easeOutExpo' });
  }, [user, navigate, from]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!email || !pw) { setErr('Please fill in all fields'); return; }
    setLoading(true); setErr('');
    try {
      await login(email, pw);
      toast.success('Welcome back!');
      navigate(from, { replace:true });
    } catch (ex) {
      const code = ex.code || '';
      console.error('Login error:', ex);
      if (code.includes('user-not-found') || code.includes('invalid-credential') || code.includes('wrong-password')) {
        setErr('Invalid email or password');
      } else if (code.includes('too-many-requests')) {
        setErr('Too many attempts. Please try again later.');
      } else {
        setErr('Login failed. Please check your credentials and connection.');
      }
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setLoading(true); setErr('');
    try { 
      await loginWithGoogle(); 
      toast.success('Signed in!'); 
      navigate(from, { replace:true }); 
    } catch (ex) { 
      console.error('Google login error:', ex);
      setErr('Google sign-in failed.'); 
    } finally { 
      setLoading(false); 
    }
  };

  const inp = { className:'field-input', style:{ marginBottom:0 } };

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#0D0D0D 0%,#1A0008 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 24px', position:'relative', overflow:'hidden' }}>
      {/* BG decoration */}
      <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(200,16,46,.14) 0%,transparent 70%)', top:'8%', left:'8%', pointerEvents:'none' }}/>
      <div style={{ position:'absolute', width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle,rgba(200,16,46,.09) 0%,transparent 70%)', bottom:'12%', right:'12%', pointerEvents:'none' }}/>

      <div ref={cardRef} style={{ background:'rgba(255,255,255,.97)', borderRadius:10, padding:'40px 44px', width:'100%', maxWidth:440, boxShadow:'0 32px 80px rgba(0,0,0,.42)', opacity:0 }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ width:52, height:52, borderRadius:'50%', background:'#C8102E', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px', boxShadow:'0 4px 16px rgba(200,16,46,.4)' }}>
            <span style={{ fontFamily:'Cormorant Garamond,serif', fontWeight:700, fontSize:16, color:'#fff' }}>HA</span>
          </div>
          <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:25, fontWeight:600, color:'#0D0D0D', marginBottom:5 }}>Welcome back</h1>
          <p style={{ fontSize:13.5, color:'#888' }}>Sign in to your Habibi Airways account</p>
        </div>

        {/* Google */}
        <button onClick={handleGoogle} disabled={loading} style={{ width:'100%', padding:'11px 16px', border:'1px solid #E0E0E0', borderRadius:5, background:'#fff', fontSize:13.5, fontWeight:600, color:'#333', cursor:'pointer', fontFamily:'DM Sans,sans-serif', marginBottom:20, display:'flex', alignItems:'center', justifyContent:'center', gap:10, transition:'all .2s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor='#C8102E'; e.currentTarget.style.background='#FFF5F5'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor='#E0E0E0'; e.currentTarget.style.background='#fff'; }}>
          <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
          Continue with Google
        </button>

        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
          <div style={{ flex:1, height:1, background:'#EBEBEB' }}/><span style={{ fontSize:12, color:'#BBB' }}>or sign in with email</span><div style={{ flex:1, height:1, background:'#EBEBEB' }}/>
        </div>

        {err && (
          <div style={{ padding:'11px 14px', background:'#FFEBEE', border:'1px solid #FFCDD2', borderRadius:5, fontSize:13, color:'#C8102E', marginBottom:16 }}>⚠ {err}</div>
        )}

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:15 }}>
          <div>
            <label className="field-label">Email address</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" {...inp}/>
          </div>
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
              <label className="field-label" style={{ margin:0 }}>Password</label>
              <a href="#" onClick={e=>e.preventDefault()} style={{ fontSize:12, color:'#C8102E', fontWeight:600 }}>Forgot password?</a>
            </div>
            <div style={{ position:'relative' }}>
              <input type={showPw?'text':'password'} value={pw} onChange={e=>setPw(e.target.value)} placeholder="••••••••" {...inp} style={{ paddingRight:40 }}/>
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ position:'absolute', right:11, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:16, color:'#BBB', display:'flex', alignItems:'center' }}>
                {showPw ? '🙈' : '👁'}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-red" style={{ padding:'13px', fontSize:15, marginTop:4, width:'100%', justifyContent:'center' }}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p style={{ textAlign:'center', fontSize:13.5, color:'#888', marginTop:20 }}>
          New to Habibi Airways? <Link to="/register" style={{ color:'#C8102E', fontWeight:600 }}>Join Skywards free</Link>
        </p>
      </div>
    </div>
  );
}
