// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { fadeUp } from '../utils/anime';
import toast from '../utils/toast';
import { userService, bookingService } from '../services/api';

const NATIONS = ['India','UAE','USA','UK','Pakistan','Singapore','Australia','Germany','France','Japan'];
const MEALS   = ['Standard','Vegetarian','Vegan','Halal','Kosher','Gluten-free'];
const TABS    = ['Personal','Travel preferences','Security','Notifications'];

export default function Profile() {
  const { user, userProfile } = useAuth();
  const { airportsMap } = useApp();
  const [activeTab, setActiveTab] = useState('Personal');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', dob: '',
    nationality: 'India', passport: '', passportExpiry: '',
    meal: 'Standard', seatPref: 'Window', cabin: 'Economy',
    notifications: { email:true, sms:false, push:true, offers:true },
    currentPw: '', newPw: '', confirmPw: '',
  });

  const [stats, setStats] = useState({ countries: 0, cities: 0 });

  useEffect(() => {
    if (user || userProfile) {
      setForm(f => ({
        ...f,
        name:  userProfile?.name  || user?.displayName || '',
        email: userProfile?.email || user?.email || '',
        phone: userProfile?.phone || '',
        dob:   userProfile?.dob   || '',
        nationality: userProfile?.nationality || 'India',
        passport:    userProfile?.passport    || '',
        meal:        userProfile?.meal        || 'Standard',
      }));
    }
    
    // Load travel stats for UI
    if (user && Object.keys(airportsMap||{}).length > 0) {
      bookingService.getByUser(user.uid).then(bks => {
        const activeBookings = bks.filter(b => b.status === 'completed' || b.status === 'confirmed');
        const uniqueCities = new Set();
        const uniqueCountries = new Set();
        activeBookings.forEach(b => {
          const fromCity = b.from || b.flight?.from;
          const toCity = b.to || b.flight?.to;
          
          if (fromCity) {
             uniqueCities.add(fromCity);
             if (airportsMap[fromCity]?.country) uniqueCountries.add(airportsMap[fromCity].country);
          }
          if (toCity) {
             uniqueCities.add(toCity);
             if (airportsMap[toCity]?.country) uniqueCountries.add(airportsMap[toCity].country);
          }
        });
        setStats({ countries: uniqueCountries.size || 0, cities: uniqueCities.size || 0 });
      });
    }

    fadeUp('.profile-tab-content', 0);
  }, [user, userProfile, activeTab, airportsMap]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setNested = (parent, k, v) => setForm(f => ({ ...f, [parent]: { ...f[parent], [k]: v } }));

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await userService.updateProfile(user.uid, {
        name: form.name,
        phone: form.phone,
        dob: form.dob,
        nationality: form.nationality,
        passport: form.passport,
        meal: form.meal,
        updatedAt: new Date().toISOString()
      });
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error("Profile update failed:", err);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Add the service import at the top (I'll do this in a separate chunk or just ensure it's there)

  const inputStyle = { width:'100%', padding:'10px 13px', border:'1px solid #E0E0E0', borderRadius:5, fontSize:13.5, fontFamily:'DM Sans,sans-serif', outline:'none', boxSizing:'border-box', transition:'border .2s' };
  const Label = ({ children }) => <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#555', marginBottom:6 }}>{children}</label>;

  const tier = userProfile?.tier || 'Blue';
  const miles = userProfile?.skywardsMiles || 0;
  const TIER_COLOR = { Blue:'#1565C0', Silver:'#607D8B', Gold:'#F57F17', Platinum:'#6A1B9A' };

  return (
    <div style={{ background:'#F5F5F0', minHeight:'100vh', fontFamily:'DM Sans,sans-serif' }}>
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#1A1A1A,#2d2d2d)', padding:'32px 24px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', alignItems:'center', gap:22 }}>
          <div style={{ width:72, height:72, borderRadius:'50%', background:'linear-gradient(135deg,#C8102E,#8b0000)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, fontWeight:800, color:'#fff', flexShrink:0 }}>
            {(userProfile?.name || user?.displayName || 'U')[0].toUpperCase()}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:22, fontWeight:800, color:'#fff' }}>{userProfile?.name || user?.displayName || 'My Profile'}</div>
            <div style={{ fontSize:13, color:'rgba(255,255,255,.55)', marginTop:2 }}>{user?.email}</div>
            <div style={{ display:'flex', gap:12, marginTop:10 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 12px', background:`${TIER_COLOR[tier]}22`, borderRadius:100, border:`1px solid ${TIER_COLOR[tier]}55` }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:TIER_COLOR[tier] }} />
                <span style={{ fontSize:12, fontWeight:700, color:TIER_COLOR[tier] }}>Skywards {tier}</span>
              </div>
              <div style={{ fontSize:13, color:'rgba(255,255,255,.6)', display:'flex', alignItems:'center', gap:4 }}>
                <span style={{ fontWeight:800, color:'#fff', fontSize:15 }}>{miles.toLocaleString()}</span> miles
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab nav */}
      <div style={{ background:'#fff', borderBottom:'1px solid #E0E0E0' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 24px', display:'flex', gap:0 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{ padding:'14px 20px', border:'none', background:'none', fontSize:13.5, fontWeight: activeTab===t?700:400, color: activeTab===t?'#C8102E':'#666', borderBottom:`3px solid ${activeTab===t?'#C8102E':'transparent'}`, cursor:'pointer', fontFamily:'DM Sans,sans-serif', transition:'all .2s', whiteSpace:'nowrap' }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'28px 24px 56px', display:'grid', gridTemplateColumns:'1fr 280px', gap:22, alignItems:'start' }}>

        {/* Main form area */}
        <div className="profile-tab-content" style={{ opacity:0 }}>
          <div style={{ background:'#fff', border:'1px solid #E0E0E0', borderRadius:6, overflow:'hidden' }}>
            <div style={{ padding:'14px 20px', background:'#FAFAFA', borderBottom:'1px solid #EBEBEB' }}>
              <div style={{ fontSize:15, fontWeight:700, color:'#1A1A1A' }}>{activeTab}</div>
            </div>
            <div style={{ padding:'24px 22px' }}>

              {activeTab === 'Personal' && (
                <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                    <div><Label>Full name</Label><input value={form.name} onChange={e=>set('name',e.target.value)} style={inputStyle} onFocus={e=>e.target.style.borderColor='#C8102E'} onBlur={e=>e.target.style.borderColor='#E0E0E0'} /></div>
                    <div><Label>Email address</Label><input type="email" value={form.email} onChange={e=>set('email',e.target.value)} style={inputStyle} onFocus={e=>e.target.style.borderColor='#C8102E'} onBlur={e=>e.target.style.borderColor='#E0E0E0'} /></div>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                    <div><Label>Phone number</Label><input type="tel" value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="+91 98765 43210" style={inputStyle} onFocus={e=>e.target.style.borderColor='#C8102E'} onBlur={e=>e.target.style.borderColor='#E0E0E0'} /></div>
                    <div><Label>Date of birth</Label><input type="date" value={form.dob} onChange={e=>set('dob',e.target.value)} style={inputStyle} /></div>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16 }}>
                    <div><Label>Nationality</Label>
                      <select value={form.nationality} onChange={e=>set('nationality',e.target.value)} style={{ ...inputStyle, cursor:'pointer' }}>
                        {NATIONS.map(n=><option key={n}>{n}</option>)}
                      </select>
                    </div>
                    <div><Label>Passport number</Label><input value={form.passport} onChange={e=>set('passport',e.target.value.toUpperCase())} placeholder="K1234567" style={inputStyle} onFocus={e=>e.target.style.borderColor='#C8102E'} onBlur={e=>e.target.style.borderColor='#E0E0E0'} /></div>
                    <div><Label>Passport expiry</Label><input type="date" value={form.passportExpiry} onChange={e=>set('passportExpiry',e.target.value)} style={inputStyle} /></div>
                  </div>
                </div>
              )}

              {activeTab === 'Travel preferences' && (
                <div style={{ display:'flex', flexDirection:'column', gap:22 }}>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:'#1A1A1A', marginBottom:14 }}>Meal preference</div>
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                      {MEALS.map(m=>(
                        <button key={m} onClick={()=>set('meal',m)} style={{ padding:'9px 16px', border:`1.5px solid ${form.meal===m?'#C8102E':'#E0E0E0'}`, borderRadius:4, background: form.meal===m?'#FFF0F0':'#fff', color: form.meal===m?'#C8102E':'#555', fontSize:13, fontWeight: form.meal===m?700:400, cursor:'pointer', fontFamily:'DM Sans,sans-serif', transition:'all .15s' }}>{m}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:'#1A1A1A', marginBottom:14 }}>Seat preference</div>
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                      {['Window','Aisle','No preference'].map(s=>(
                        <button key={s} onClick={()=>set('seatPref',s)} style={{ padding:'9px 16px', border:`1.5px solid ${form.seatPref===s?'#C8102E':'#E0E0E0'}`, borderRadius:4, background: form.seatPref===s?'#FFF0F0':'#fff', color: form.seatPref===s?'#C8102E':'#555', fontSize:13, fontWeight: form.seatPref===s?700:400, cursor:'pointer', fontFamily:'DM Sans,sans-serif', transition:'all .15s' }}>{s}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:'#1A1A1A', marginBottom:14 }}>Preferred cabin</div>
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                      {['Economy','Premium Economy','Business','First'].map(c=>(
                        <button key={c} onClick={()=>set('cabin',c)} style={{ padding:'9px 16px', border:`1.5px solid ${form.cabin===c?'#C8102E':'#E0E0E0'}`, borderRadius:4, background: form.cabin===c?'#FFF0F0':'#fff', color: form.cabin===c?'#C8102E':'#555', fontSize:13, fontWeight: form.cabin===c?700:400, cursor:'pointer', fontFamily:'DM Sans,sans-serif', transition:'all .15s' }}>{c}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ padding:'16px', background:'#E3F2FD', borderRadius:5, border:'1px solid #BBDEFB', fontSize:13, color:'#1565C0' }}>
                    💡 Your preferences are pre-filled during booking to save you time.
                  </div>
                </div>
              )}

              {activeTab === 'Security' && (
                <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
                  <div style={{ padding:'14px 16px', background:'#FFF8E1', border:'1px solid #FFE082', borderRadius:5, fontSize:13, color:'#E65100' }}>
                    🔒 For security, password changes require your current password.
                  </div>
                  {[['Current password','currentPw'],['New password','newPw'],['Confirm new password','confirmPw']].map(([lbl,k])=>(
                    <div key={k}><Label>{lbl}</Label><input type="password" value={form[k]} onChange={e=>set(k,e.target.value)} placeholder="••••••••" style={inputStyle} onFocus={e=>e.target.style.borderColor='#C8102E'} onBlur={e=>e.target.style.borderColor='#E0E0E0'} /></div>
                  ))}
                  <div style={{ padding:'14px 16px', background:'#F5F5F5', borderRadius:5 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:'#1A1A1A', marginBottom:8 }}>Two-factor authentication</div>
                    <div style={{ fontSize:13, color:'#555', marginBottom:12 }}>Add an extra layer of security with SMS or app-based 2FA.</div>
                    <button style={{ padding:'9px 18px', border:'1px solid #E0E0E0', borderRadius:4, background:'#fff', color:'#555', fontSize:13, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>Enable 2FA</button>
                  </div>
                </div>
              )}

              {activeTab === 'Notifications' && (
                <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
                  {[
                    ['email', 'Email notifications', 'Booking confirmations, flight updates, receipts'],
                    ['sms',   'SMS alerts',           'Check-in reminders and gate change alerts'],
                    ['push',  'Push notifications',   'Real-time flight status via mobile app'],
                    ['offers','Promotional offers',   'Special deals, Skywards promotions, partner offers'],
                  ].map(([key, title, desc]) => (
                    <div key={key} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 0', borderBottom:'1px solid #F5F5F5' }}>
                      <div>
                        <div style={{ fontSize:14, fontWeight:600, color:'#1A1A1A' }}>{title}</div>
                        <div style={{ fontSize:12.5, color:'#888', marginTop:3 }}>{desc}</div>
                      </div>
                      <button onClick={()=>setNested('notifications',key,!form.notifications[key])} style={{ width:48, height:26, borderRadius:13, border:'none', background: form.notifications[key]?'#C8102E':'#DDD', cursor:'pointer', position:'relative', transition:'background .2s', flexShrink:0 }}>
                        <div style={{ width:20, height:20, borderRadius:'50%', background:'#fff', position:'absolute', top:3, left: form.notifications[key]?25:3, transition:'left .2s', boxShadow:'0 1px 4px rgba(0,0,0,.2)' }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ display:'flex', gap:12, marginTop:14 }}>
            <button onClick={handleSave} disabled={saving} style={{ flex:1, padding:'13px', background: saving?'#AAA':'#C8102E', border:'none', color:'#fff', fontWeight:700, fontSize:15, borderRadius:4, cursor: saving?'not-allowed':'pointer', fontFamily:'DM Sans,sans-serif', transition:'all .2s' }}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ position:'sticky', top:20 }}>
          <div style={{ background:'#fff', border:'1px solid #E0E0E0', borderRadius:6, overflow:'hidden', marginBottom:12 }}>
            <div style={{ background:`linear-gradient(135deg,${TIER_COLOR[tier]},${TIER_COLOR[tier]}99)`, padding:'16px 18px' }}>
              <div style={{ fontSize:11, color:'rgba(255,255,255,.65)', textTransform:'uppercase', letterSpacing:1.5, marginBottom:4 }}>Skywards status</div>
              <div style={{ fontSize:22, fontWeight:800, color:'#fff' }}>{tier} member</div>
            </div>
            <div style={{ padding:'14px 18px' }}>
              {[
                ['Miles balance', miles.toLocaleString()],
                ['Countries visited', stats.countries],
                ['Cities explored', stats.cities],
                ['Member since', '2024']
              ].map(([k,v])=>(
                <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #F5F5F5' }}>
                  <span style={{ fontSize:12.5, color:'#888' }}>{k}</span>
                  <span style={{ fontSize:13, fontWeight:700, color:'#1A1A1A' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background:'#fff', border:'1px solid #E0E0E0', borderRadius:6, padding:'14px 18px' }}>
            <div style={{ fontSize:13, fontWeight:700, color:'#1A1A1A', marginBottom:12 }}>Quick links</div>
            {[['✈ My Trips','/my-trips'],['🏆 Skywards','/loyalty'],['📞 Help & Contact','/contact']].map(([lbl,path])=>(
              <a key={lbl} href={path} style={{ display:'block', padding:'9px 0', borderBottom:'1px solid #F5F5F5', fontSize:13.5, color:'#C8102E', textDecoration:'none', transition:'color .15s' }}
                onMouseEnter={e=>e.currentTarget.style.color='#9e0b22'}
                onMouseLeave={e=>e.currentTarget.style.color='#C8102E'}>{lbl}</a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
