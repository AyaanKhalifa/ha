// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import {
  createUserProfile,
  getUserProfile,
  subscribeToUserProfile,
} from '../services/firestore';
import { bookingService } from '../services/api';
import { FARE_CLASSES } from '../utils/flightData';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser]               = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    let profileUnsub = () => {};
    const authUnsub = onAuthStateChanged(auth, async (firebaseUser) => {
      profileUnsub();
      if (firebaseUser) {
        setUser(firebaseUser);
        profileUnsub = subscribeToUserProfile(firebaseUser.uid, async (profile) => {
          // Dynamically compute miles from bookings
          try {
            const bks = await bookingService.getByUser(firebaseUser.uid);
            const completed = bks.filter(b => b.status === 'completed' || b.status === 'confirmed');
            
            let earned = 0;
            completed.forEach(b => {
              const durM = b.durM || 360; 
              const baseMiles = Math.round((durM / 60) * 500);
              const cabin = b.cabinClass || 'Economy';
              const fareName = b.fare?.name || 'Flex';
              const fareClassInfo = (FARE_CLASSES[cabin] || []).find(f => f.name === fareName) || { milesEarnPct: 100 };
              earned += Math.round(baseMiles * (fareClassInfo.milesEarnPct / 100));
            });

            // Base 1000 + earned
            const totalMiles = 1000 + earned;
            
            // Calculate dynamic tier
            let tier = 'Blue';
            if (totalMiles >= 100000) tier = 'Platinum';
            else if (totalMiles >= 50000) tier = 'Gold';
            else if (totalMiles >= 25000) tier = 'Silver';

            setUserProfile({ ...profile, skywardsMiles: totalMiles, tier });
          } catch (e) {
            setUserProfile(profile);
          }
        });
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => { authUnsub(); profileUnsub(); };
  }, []);

  const register = async (email, password, name) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    await createUserProfile(cred.user.uid, { 
      name, 
      email,
      role: 'Passenger', // Default role
      tier: 'Blue',
      skywardsMiles: 1000, // 1000 welcome miles
      loyaltyId: `HA-${Math.floor(Math.random()*900000)+100000}`,
      createdAt: new Date().toISOString()
    });
    return cred;
  };

  const login = async (email, password) => signInWithEmailAndPassword(auth, email, password);

  const loginWithGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    const existing = await getUserProfile(cred.user.uid);
    if (!existing) {
      await createUserProfile(cred.user.uid, {
        name: cred.user.displayName || 'User',
        email: cred.user.email,
        phone: cred.user.phoneNumber || '',
        role: 'Passenger',
        tier: 'Blue',
        skywardsMiles: 1000,
        loyaltyId: `HA-${Math.floor(Math.random()*900000)+100000}`,
        createdAt: new Date().toISOString()
      });
    }
    return cred;
  };

  const logout = () => signOut(auth);

  const resetPassword = (email) => sendPasswordResetEmail(auth, email);
  
  // Robust Admin check: role is 'Admin' in Firestore
  const isAdmin = userProfile?.role === 'Admin';

  return (
    <AuthContext.Provider value={{
      user, userProfile, loading, isAdmin,
      register, login, loginWithGoogle, logout, resetPassword,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}