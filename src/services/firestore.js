// src/services/firestore.js
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';

// ─────────────────────────────────────────────────────────────────
// GENERIC HELPERS
// ─────────────────────────────────────────────────────────────────

export const getDocument = async (collectionName, id) => {
  try {
    const snap = await getDoc(doc(db, collectionName, id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch (err) {
    console.warn(`Error fetching doc ${collectionName}/${id}:`, err);
    return null;
  }
};

export const getCollection = async (collectionName) => {
  try {
    const snap = await getDocs(collection(db, collectionName));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn(`Error fetching collection ${collectionName}:`, err);
    return [];
  }
};

export const addDocument = async (collectionName, data) => {
  const ref = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const setDocument = async (collectionName, id, data) => {
  await setDoc(doc(db, collectionName, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const updateDocument = async (collectionName, id, updates) => {
  await updateDoc(doc(db, collectionName, id), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const deleteDocument = async (collectionName, id) => {
  await deleteDoc(doc(db, collectionName, id));
};

export const queryCollection = async (collectionName, filters = [], sortBy = null, limitTo = null) => {
  try {
    const constraints = [];
    filters.forEach(([field, op, value]) => constraints.push(where(field, op, value)));
    if (sortBy) constraints.push(orderBy(sortBy.field, sortBy.dir || 'asc'));
    if (limitTo) constraints.push(limit(limitTo));
    const snap = await getDocs(query(collection(db, collectionName), ...constraints));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn(`Error querying collection ${collectionName}:`, err);
    return [];
  }
};

// ─────────────────────────────────────────────────────────────────
// HABIBI AIRWAYS COLLECTIONS (10 CORE MODULES)
// ─────────────────────────────────────────────────────────────────

export const getFlights = async (from = null, to = null, date = null) => {
  // To avoid composite index requirements, we query by route structure first.
  // We'll fetch all flights for this route and filter by date in JavaScript.
  const filters = [];
  if (from && to) {
    // If we have a routeId field (BOM-DXB), use it.
    filters.push(['routeId', '==', `${from}-${to}`]);
  } else {
    if (from) filters.push(['route.from', '==', from]);
    if (to) filters.push(['route.to', '==', to]);
  }

  const allFlights = await queryCollection('flights', filters);
  
  if (!date) return allFlights;

  // Filter by date in memory
  return allFlights.filter(f => {
    const d = f.departureTime || f.schedule?.departureTime || f.dep;
    return d && d.startsWith(date);
  }).sort((a, b) => {
    const da = a.departureTime || a.schedule?.departureTime || a.dep;
    const db = b.departureTime || b.schedule?.departureTime || b.dep;
    return new Date(da) - new Date(db);
  });
};

// 2. USERS
export const getUser = async (uid) => getDocument('users', uid);
export const createUser = async (uid, data) => setDocument('users', uid, data);

export const createUserProfile = async (uid, { name, email, phone = '' }) => {
  await setDocument('users', uid, {
    name, email, phone,
    role: 'Passenger',
  });
};

export const getUserProfile = async (uid) => getDocument('users', uid);

export const subscribeToUserProfile = (uid, callback) => {
  return onSnapshot(doc(db, 'users', uid), snap => {
    callback(snap.exists() ? { id: snap.id, ...snap.data() } : null);
  }, err => {
    console.error('subscribeToUserProfile error:', err);
    callback(null);
  });
};

// 3. BOOKINGS
export const createBooking = async (data) => addDocument('bookings', data);
export const getBooking = async (id) => getDocument('bookings', id);
export const getUserBookings = async (userId) => queryCollection('bookings', [['userId', '==', userId]]);

/** Live updates when a booking document changes (Manage / My Trips). */
export const subscribeToBooking = (bookingId, callback) => {
  return onSnapshot(doc(db, 'bookings', bookingId), (snap) => {
    callback(snap.exists() ? { id: snap.id, ...snap.data() } : null);
  }, err => {
    console.error('subscribeToBooking error:', err);
    callback(null);
  });
};

// 4. SEATS
export const getFlightSeats = async (flightId) => queryCollection('seats', [['flightId', '==', flightId]]);
export const updateSeatStatus = async (seatId, isBooked, passengerId = null) => 
  updateDocument('seats', seatId, { isBooked, passengerId });

// 5. PAYMENTS
export const recordPayment = async (data) => addDocument('payments', data);

// 6. AIRPORTS
export const getAirports = async () => getCollection('airports');
export const getAirportByCode = async (code) => getDocument('airports', code);

// 7. AIRCRAFTS
export const getAircrafts = async () => getCollection('aircrafts');

// 8. CREW
export const getFlightCrew = async (flightId) => queryCollection('crew', [['assignedFlight', '==', flightId]]);

// 9. ADMINS
export const getAdmin = async (uid) => getDocument('admins', uid);

export const adminGetAllBookings = async (statusFilter = null) => {
  const filters = statusFilter ? [['status', '==', statusFilter]] : [];
  return queryCollection('bookings', filters);
};

export const adminGetAllUsers = async () => getCollection('users');

export const adminGetAllFlights = async () => getCollection('flight_status');

export const adminGetDashboardStats = async () => {
  const [b, u, f] = await Promise.all([
    getCollection('bookings'),
    getCollection('users'),
    getCollection('flight_status')
  ]);
  return {
    bookings: b.length,
    users: u.length,
    flights: f.length,
    revenue: b.filter(x => x.status !== 'cancelled').reduce((s, x) => s + (x.totalAmount || 0), 0)
  };
};

// 10. TICKETS
export const issueTicket = async (data) => addDocument('tickets', data);
export const getTicketByBooking = async (bookingId) => queryCollection('tickets', [['bookingId', '==', bookingId]]);

// ─────────────────────────────────────────────────────────────────
// firestoreService OBJECT (Export for use across app)
// ─────────────────────────────────────────────────────────────────

export const firestoreService = {
  getDocument,
  getCollection,
  addDocument,
  setDocument,
  updateDocument,
  deleteDocument,
  queryCollection,
  getFlights,
  getUser,
  createUser,
  createUserProfile,
  getUserProfile,
  subscribeToUserProfile,
  createBooking,
  getBooking,
  getUserBookings,
  subscribeToBooking,
  adminGetAllBookings,
  adminGetAllUsers,
  adminGetAllFlights,
  adminGetDashboardStats,
  getFlightSeats,
  updateSeatStatus,
  recordPayment,
  getAirports,
  getAirportByCode,
  getAircrafts,
  getFlightCrew,
  getAdmin,
  issueTicket,
  getTicketByBooking,
};

export default firestoreService;