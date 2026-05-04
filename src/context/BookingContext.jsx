// src/context/BookingContext.jsx — Persistent global state for an Emirates-grade booking flow
import React, { createContext, useContext, useState, useEffect } from 'react';

const BookingContext = createContext();
export const useBooking = () => useContext(BookingContext);

// LocalStorage helpers
const save = (k, v) => localStorage.setItem(`ha_${k}`, JSON.stringify(v));
const load = (k) => {
  const v = localStorage.getItem(`ha_${k}`);
  try { return v ? JSON.parse(v) : null; } catch(e) { return null; }
};

export function BookingProvider({ children }) {
  // ── States initializaed from localStorage ────────────────────────
  const [searchParams, setSearchParamsState] = useState(() => load('searchParams'));
  const [selectedFlight, setSelectedFlightState] = useState(() => load('selectedFlight'));
  const [selectedFare, setSelectedFareState] = useState(() => load('selectedFare'));
  const [passenger, setPassengerState] = useState(() => load('passenger'));
  const [allPassengers, setAllPassengersState] = useState(() => load('allPassengers'));
  const [selectedLegs, setSelectedLegsState] = useState(() => load('selectedLegs') || []);

  // ── Persistent Updaters ──────────────────────────────────────────
  const setSearchParams = (updater) => {
    setSearchParamsState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      save('searchParams', next);
      return next;
    });
  };

  const setSelectedFlight = (v) => {
    setSelectedFlightState(v);
    save('selectedFlight', v);
  };

  const setSelectedFare = (v) => {
    setSelectedFareState(v);
    save('selectedFare', v);
  };

  const setPassenger = (v) => {
    setPassengerState(v);
    save('passenger', v);
  };

  const setAllPassengers = (v) => {
    setAllPassengersState(v);
    save('allPassengers', v);
  };

  const addLeg = (leg, idx) => {
    setSelectedLegsState(prev => {
      const next = [...prev];
      next[idx] = leg;
      save('selectedLegs', next);
      return next;
    });
  };

  const clearBooking = () => {
    setSearchParamsState(null);
    setSelectedFlightState(null);
    setSelectedFareState(null);
    setPassengerState(null);
    setAllPassengersState(null);
    setSelectedLegsState([]);
    // Clear all storage
    ['searchParams','selectedFlight','selectedFare','passenger','allPassengers','selectedLegs'].forEach(k => localStorage.removeItem(`ha_${k}`));
  };

  // Sync to searchParams for common patterns
  useEffect(() => {
    if (selectedFlight && searchParams && !searchParams.selectedFlight) {
        setSearchParams(prev => ({ ...prev, selectedFlight }));
    }
  }, [selectedFlight]);

  return (
    <BookingContext.Provider value={{
      searchParams, setSearchParams,
      selectedFlight, setSelectedFlight,
      selectedFare, setSelectedFare,
      passenger, setPassenger,
      allPassengers, setAllPassengers,
      selectedLegs, addLeg, clearBooking,
    }}>
      {children}
    </BookingContext.Provider>
  );
}
