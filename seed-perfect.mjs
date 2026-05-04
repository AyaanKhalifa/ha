// seed-perfect.mjs
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, doc, setDoc, serverTimestamp 
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAw4IJLFnPdA_HnQw5tvSSxgabmdQANwQc",
  authDomain: "habibi-airways-4432.firebaseapp.com",
  projectId: "habibi-airways-4432",
  storageBucket: "habibi-airways-4432.firebasestorage.app",
  messagingSenderId: "539135320722",
  appId: "1:539135320722:web:cd43f5a04d78d1e1543c4b",
  measurementId: "G-6EDCS61B84"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedPerfect() {
  console.log('💎 Seeding Perfect Data Examples...');

  // 1. PERFECT USER
  const userId = 'user_perfect_01';
  const perfectUser = {
    firstName: 'Zayed',
    lastName: 'Habibi',
    email: 'zayed@habibiairways.com',
    phone: '+971 4 123 4567',
    status: 'active',
    loyalty: {
      tier: 'Platinum',
      points: 250000,
      memberId: 'HA-PLAT-777'
    },
    bookingCount: 15,
    totalSpend: 450000,
    createdAt: serverTimestamp()
  };
  await setDoc(doc(db, 'users', userId), perfectUser);
  console.log('✅ Perfect User created: ' + userId);

  // 2. PERFECT BOOKING
  const bookingId = 'book_perfect_01';
  const perfectBooking = {
    pnr: 'HAB777',
    userId: userId,
    status: 'confirmed',
    totalAmount: 45000,
    currency: 'INR',
    passengers: 1,
    cabinClass: 'First',
    fareClass: 'FC004', // First Class Exclusive
    contactEmail: perfectUser.email,
    contactPhone: perfectUser.phone,
    tripType: 'one-way',
    from: 'DXB',
    to: 'LHR',
    flightNum: 'HA777',
    date: '2026-04-10',
    depStr: '10:00',
    arrStr: '14:30',
    aircraft: 'Airbus A380-800',
    createdAt: new Date().toISOString(),
    updatedAt: serverTimestamp()
  };
  await setDoc(doc(db, 'bookings', bookingId), perfectBooking);
  console.log('✅ Perfect Booking created: ' + bookingId);

  // 3. PERFECT TICKET
  const perfectTicket = {
    bookingId: bookingId,
    pnr: 'HAB777',
    passengerName: 'Zayed Habibi',
    ticketNumber: '023-777888999',
    status: 'issued',
    seat: '1A',
    gate: 'A1',
    terminal: 'T3',
    issuedAt: serverTimestamp()
  };
  await setDoc(doc(collection(db, 'tickets')), perfectTicket);
  console.log('✅ Perfect Ticket issued for ' + bookingId);

  console.log('\n🌟 Database standard established!');
  console.log('You can now see these records in the Admin Panel as the "Gold Standard".');
  process.exit(0);
}

seedPerfect().catch(err => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
