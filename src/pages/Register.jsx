// src/pages/Register.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { anime } from '../utils/anime';
import toast from '../utils/toast';

export default function Register() {
  const { register, loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    if (user) navigate('/');
    if (cardRef.current) anime({ targets: cardRef.current, opacity: [0, 1], translateY: [30, 0], duration: 600, easing: 'easeOutExpo' });
  }, [user, navigate]);

  const strength = () => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };
  const sw = strength();
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColor = ['', '#e74c3c', '#f39c12', '#2ecc71', '#27ae60'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form.email, form.password, form.name);
      toast.success('Welcome to Skywards! 1,000 bonus miles added 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.code === 'auth/email-already-in-use' ? 'Email already registered' : 'Registration failed. Check Firebase config.');
    } finally { setLoading(false); }
  };

  const S = {
    page: { minHeight: '100vh', background: 'linear-gradient(135deg, #0D0D0D 0%, #1A0008 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' },
    card: { background: 'rgba(255,255,255,.97)', borderRadius: 10, padding: '36px 42px', width: '100%', maxWidth: 480, boxShadow: '0 30px 80px rgba(0,0,0,.4)', opacity: 0 },
    label: { display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 5 },
    input: { width: '100%', padding: '11px 13px', border: '1px solid #E0E0E0', borderRadius: 5, fontSize: 14, color: '#1A1A1A', outline: 'none', fontFamily: 'DM Sans,sans-serif', transition: 'border .2s', boxSizing: 'border-box' },
  };

  return (
    <div style={S.page}>
      <div ref={cardRef} style={S.card}>
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <div style={{ width: 50, height: 50, borderRadius: '50%', background: '#C8102E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 11px', boxShadow: '0 4px 14px rgba(200,16,46,.4)' }}>
            <span style={{ fontFamily: 'Cormorant Garamond,serif', fontWeight: 700, fontSize: 15, color: '#fff' }}>HA</span>
          </div>
          <h1 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 24, fontWeight: 600, color: '#0D0D0D', marginBottom: 4 }}>Join Skywards</h1>
          <p style={{ fontSize: 13, color: '#888' }}>Create your free account and earn 1,000 welcome miles</p>
        </div>

        <button onClick={async () => { try { await loginWithGoogle(); toast.success('Account created!'); navigate('/'); } catch { toast.error('Google sign-up failed'); } }}
          style={{ width: '100%', padding: '11px 16px', border: '1px solid #E0E0E0', borderRadius: 5, background: '#fff', fontSize: 14, fontWeight: 600, color: '#333', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all .2s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#C8102E'; e.currentTarget.style.background = '#FFF5F5'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#E0E0E0'; e.currentTarget.style.background = '#fff'; }}>
          <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
          Sign up with Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: '#EBEBEB' }} />
          <span style={{ fontSize: 12, color: '#BBB' }}>or create with email</span>
          <div style={{ flex: 1, height: 1, background: '#EBEBEB' }} />
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[['Full name', 'name', 'text', 'Aryan Sharma'], ['Email address', 'email', 'email', 'you@example.com']].map(([l, k, t, ph]) => (
            <div key={k}>
              <label style={S.label}>{l}</label>
              <input type={t} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} placeholder={ph} required style={S.input}
                onFocus={e => e.target.style.borderColor = '#C8102E'}
                onBlur={e => e.target.style.borderColor = '#E0E0E0'} />
            </div>
          ))}
          <div>
            <label style={S.label}>Password</label>
            <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min 6 characters" required style={S.input}
              onFocus={e => e.target.style.borderColor = '#C8102E'}
              onBlur={e => e.target.style.borderColor = '#E0E0E0'} />
            {form.password && (
              <div style={{ marginTop: 6 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                  {[1, 2, 3, 4].map(i => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= sw ? strengthColor[sw] : '#EBEBEB', transition: 'all .3s' }} />)}
                </div>
                <span style={{ fontSize: 11, color: strengthColor[sw], fontWeight: 600 }}>{strengthLabel[sw]}</span>
              </div>
            )}
          </div>
          <div>
            <label style={S.label}>Confirm password</label>
            <input type="password" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} placeholder="Repeat password" required style={{ ...S.input, borderColor: form.confirm && form.confirm !== form.password ? '#e74c3c' : '#E0E0E0' }}
              onFocus={e => e.target.style.borderColor = '#C8102E'}
              onBlur={e => e.target.style.borderColor = form.confirm && form.confirm !== form.password ? '#e74c3c' : '#E0E0E0'} />
          </div>
          <button type="submit" disabled={loading} style={{ padding: 13, background: '#C8102E', border: 'none', color: '#fff', fontWeight: 700, fontSize: 15, borderRadius: 5, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans,sans-serif', boxShadow: '0 4px 14px rgba(200,16,46,.35)', opacity: loading ? 0.7 : 1, marginTop: 4, transition: 'all .2s' }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#9e0b22'; }}
            onMouseLeave={e => e.currentTarget.style.background = '#C8102E'}>
            {loading ? 'Creating account…' : 'Create Skywards account'}
          </button>
        </form>
        <p style={{ textAlign: 'center', fontSize: 13, color: '#888', marginTop: 20 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#C8102E', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
