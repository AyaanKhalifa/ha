// seed-bulk.mjs
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, doc, writeBatch, serverTimestamp 
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const AIRPORTS = [
  { id: 'BOM', name: 'Chhatrapati Shivaji Maharaj Int\'l', city: 'Mumbai', country: 'India', code: 'BOM', lat: 19.0896, lng: 72.8656, region: 'Asia', timezone: 'Asia/Kolkata' },
  { id: 'DEL', name: 'Indira Gandhi International', city: 'Delhi', country: 'India', code: 'DEL', lat: 28.5562, lng: 77.1000, region: 'Asia', timezone: 'Asia/Kolkata' },
  { id: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'UAE', code: 'DXB', lat: 25.2532, lng: 55.3657, region: 'Middle East', timezone: 'Asia/Dubai' },
  { id: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'UK', code: 'LHR', lat: 51.4700, lng: -0.4543, region: 'Europe', timezone: 'Europe/London' },
  { id: 'SIN', name: 'Changi Airport', city: 'Singapore', country: 'Singapore', code: 'SIN', lat: 1.3644, lng: 103.9915, region: 'Asia', timezone: 'Asia/Singapore' },
  { id: 'JFK', name: 'John F. Kennedy Int\'l', city: 'New York', country: 'USA', code: 'JFK', lat: 40.6413, lng: -73.7781, region: 'North America', timezone: 'America/New_York' },
  { id: 'SYD', name: 'Sydney Airport', city: 'Sydney', country: 'Australia', code: 'SYD', lat: -33.9399, lng: 151.1753, region: 'Oceania', timezone: 'Australia/Sydney' },
  { id: 'HND', name: 'Haneda Airport', city: 'Tokyo', country: 'Japan', code: 'HND', lat: 35.5494, lng: 139.7798, region: 'Asia', timezone: 'Asia/Tokyo' },
  { id: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', code: 'CDG', lat: 49.0097, lng: 2.5479, region: 'Europe', timezone: 'Europe/Paris' },
  { id: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', code: 'FRA', lat: 50.0379, lng: 8.5622, region: 'Europe', timezone: 'Europe/Berlin' },
  { id: 'AMS', name: 'Schiphol Airport', city: 'Amsterdam', country: 'Netherlands', code: 'AMS', lat: 52.3105, lng: 4.7683, region: 'Europe', timezone: 'Europe/Amsterdam' },
  { id: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'USA', code: 'LAX', lat: 33.9416, lng: -118.4085, region: 'North America', timezone: 'America/Los_Angeles' },
  { id: 'ORD', name: 'O\'Hare International', city: 'Chicago', country: 'USA', code: 'ORD', lat: 41.9742, lng: -87.9073, region: 'North America', timezone: 'America/Chicago' },
  { id: 'YYZ', name: 'Pearson International', city: 'Toronto', country: 'Canada', code: 'YYZ', lat: 43.6777, lng: -79.6248, region: 'North America', timezone: 'America/Toronto' },
  { id: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey', code: 'IST', lat: 41.2753, lng: 28.7519, region: 'Europe', timezone: 'Europe/Istanbul' },
  { id: 'CAI', name: 'Cairo International', city: 'Cairo', country: 'Egypt', code: 'CAI', lat: 30.1219, lng: 31.4056, region: 'Africa', timezone: 'Africa/Cairo' },
  { id: 'JNB', name: 'O.R. Tambo International', city: 'Johannesburg', country: 'South Africa', code: 'JNB', lat: -26.1367, lng: 28.2411, region: 'Africa', timezone: 'Africa/Johannesburg' },
  { id: 'GRU', name: 'Guarulhos International', city: 'Sao Paulo', country: 'Brazil', code: 'GRU', lat: -23.4356, lng: -46.4731, region: 'South America', timezone: 'America/Sao_Paulo' },
  { id: 'HKG', name: 'Hong Kong International', city: 'Hong Kong', country: 'China', code: 'HKG', lat: 22.3080, lng: 113.9185, region: 'Asia', timezone: 'Asia/Hong_Kong' }
];

const AIRCRAFTS = [
  { id: 'AC001', type: 'Airbus A380-800', reg: 'A6-EEU', capacity: 525, status: 'Active' },
  { id: 'AC002', type: 'Boeing 777-300ER', reg: 'A6-EQP', capacity: 396, status: 'Active' },
  { id: 'AC003', type: 'Airbus A350-900', reg: 'A6-XWB', capacity: 350, status: 'Active' },
  { id: 'AC004', type: 'Boeing 787-9', reg: 'A6-DRM', capacity: 290, status: 'Maintenance' },
  { id: 'AC005', type: 'Airbus A320neo', reg: 'A6-NEO', capacity: 180, status: 'Active' },
];

const FARE_CLASSES = [
  { id: 'FC001', name: 'Economy Saver', cabin: 'Economy', benefits: ['1x 23kg Bag', 'Standard Meal'], refundFee: 5000 },
  { id: 'FC002', name: 'Economy Flex', cabin: 'Economy', benefits: ['2x 23kg Bag', 'Seat Selection', 'Refundable'], refundFee: 2000 },
  { id: 'FC003', name: 'Business Value', cabin: 'Business', benefits: ['Lounge Access', 'Flat Bed', 'Fine Dining'], refundFee: 10000 },
  { id: 'FC004', name: 'First Class Exclusive', cabin: 'First', benefits: ['Private Suite', 'Chauffeur', 'Shower Spa'], refundFee: 0 },
];

const PRICING_RULES = [
  { id: 'PR001', code: 'HABIBI10', discountType: 'percentage', discountValue: 10, status: 'active', minAmount: 5000 },
  { id: 'PR002', code: 'WELCOME500', discountType: 'fixed', discountValue: 500, status: 'active', minAmount: 2000 },
  { id: 'PR003', code: 'GOLD25', discountType: 'percentage', discountValue: 25, status: 'active', minAmount: 20000 },
];

const SYSTEM_SETTINGS = [
  { id: 'maintenance_mode', value: false },
  { id: 'booking_enabled', value: true },
  { id: 'loyalty_points_multiplier', value: 1.5 },
  { id: 'support_email', value: 'care@habibiairways.com' },
];

const USERS = [
  { id: 'user1', firstName: 'Ayaan', lastName: 'Khan', email: 'ayaan@example.com', phone: '+919876543210', tier: 'Gold', skywardsMiles: 45200 },
  { id: 'user2', firstName: 'Zoya', lastName: 'Sheikh', email: 'zoya@example.com', phone: '+971501234567', tier: 'Platinum', skywardsMiles: 128500 },
  { id: 'user3', firstName: 'Rahul', lastName: 'Sharma', email: 'rahul@example.com', phone: '+918888888888', tier: 'Silver', skywardsMiles: 12000 },
  { id: 'guest', firstName: 'Guest', lastName: 'User', email: 'guest@habibi.com', phone: '000', tier: 'Blue', skywardsMiles: 0 },
];

async function seed() {
  console.log('🚀 Starting Bulk Seeding...');

  const collections = [
    { name: 'airports', data: AIRPORTS },
    { name: 'aircrafts', data: AIRCRAFTS },
    { name: 'fare_classes', data: FARE_CLASSES },
    { name: 'pricing_rules', data: PRICING_RULES },
    { name: 'system_settings', data: SYSTEM_SETTINGS },
    { name: 'users', data: USERS },
  ];

  for (const coll of collections) {
    const batch = writeBatch(db);
    console.log(`- Seeding ${coll.name}...`);
    coll.data.forEach(item => {
      const { id, ...rest } = item;
      batch.set(doc(db, coll.name, id), { ...rest, createdAt: serverTimestamp() });
    });
    await batch.commit();
  }

  // 1. SEED ROUTES (Generated)
  console.log('- Seeding Routes...');
  const routes = [];
  const routeBatch = writeBatch(db);
  for (let i = 0; i < AIRPORTS.length; i++) {
    for (let j = 0; j < AIRPORTS.length; j++) {
      if (i === j) continue;
      const from = AIRPORTS[i];
      const to = AIRPORTS[j];
      const id = `${from.id}-${to.id}`;
      const route = {
        origin: from.id,
        destination: to.id,
        status: 'active',
        flightTimeH: Math.random() * 12 + 1,
        distKM: Math.random() * 8000 + 500,
        basePrice: Math.floor(Math.random() * 40000) + 5000,
      };
      routes.push({ id, ...route });
      routeBatch.set(doc(db, 'routes', id), { ...route, createdAt: serverTimestamp() });
    }
  }
  await routeBatch.commit();

  // 2. SEED FLIGHTS
  console.log('- Seeding Flights (All combinations, 1.5 years)...');
  const now = new Date();
  let flightCount = 0;
  for (let d = -7; d <= 547; d++) {
    const date = new Date(now);
    date.setDate(date.getDate() + d);
    const dateStr = date.toISOString().split('T')[0];

    let currentBatch = writeBatch(db);
    let batchSize = 0;

    for (let r = 0; r < routes.length; r++) { // Every route combination every day
      const route = routes[r];
      const id = `FL-${dateStr}-${r}`;
      const flight = {
        flightNumber: `HA${100 + r}`,
        routeId: route.id,
        aircraftId: AIRCRAFTS[Math.floor(Math.random() * AIRCRAFTS.length)].id,
        departureTime: `${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
        basePrice: route.basePrice,
        status: d < 0 ? 'Landed' : (d === 0 ? 'On Time' : 'Scheduled'),
      };
      currentBatch.set(doc(db, 'flights', id), { ...flight, createdAt: serverTimestamp() });
      
      // Also seed flight_status
      const fsId = `FS-${id}`;
      currentBatch.set(doc(db, 'flight_status', fsId), {
        flightId: id,
        flightNumber: flight.flightNumber,
        date: dateStr,
        status: flight.status,
        gate: ['A1', 'B2', 'C3', 'D4', 'E5', '-'][Math.floor(Math.random() * 6)],
        terminal: ['T1', 'T2', 'T3'][Math.floor(Math.random() * 3)],
        delayMinutes: Math.random() > 0.8 ? Math.floor(Math.random() * 60) : 0,
        route: { origin: route.origin, destination: route.destination },
      });

      batchSize += 2;
      flightCount++;

      if (batchSize >= 450) { // Safety margin for Firebase batch limit (500)
        await currentBatch.commit();
        currentBatch = writeBatch(db);
        batchSize = 0; // Reset batch size to allow more flights in the same day loop
      }
    }
    if (batchSize > 0) {
      await currentBatch.commit();
    }
  }
  console.log(`  Added ${flightCount} flights.`);

  // 3. SEED BOOKINGS (1000+)
  console.log('- Seeding Bookings (1000+)...');
  for (let i = 0; i < 5; i++) { // 200 * 5 = 1000
    const bBatch = writeBatch(db);
    for (let j = 0; j < 200; j++) {
      const pnr = 'HAB' + Math.random().toString(36).substr(2, 6).toUpperCase();
      const user = USERS[Math.floor(Math.random() * USERS.length)];
      const cabin = ['Economy', 'Premium Economy', 'Business', 'First'][Math.floor(Math.random() * 4)];
      const booking = {
        pnr,
        userId: user.id,
        status: Math.random() > 0.1 ? 'confirmed' : 'cancelled',
        totalAmount: Math.floor(Math.random() * 50000) + 10000,
        currency: 'INR',
        passengers: Math.floor(Math.random() * 3) + 1,
        cabinClass: cabin,
        fareClass: 'FC001',
        createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
        updatedAt: serverTimestamp(),
        contactEmail: user.email,
        contactPhone: user.phone,
        tripType: 'one-way',
        from: AIRPORTS[Math.floor(Math.random() * AIRPORTS.length)].id,
        to: AIRPORTS[Math.floor(Math.random() * AIRPORTS.length)].id,
        flightNum: `HA${Math.floor(Math.random() * 900) + 100}`,
      };
      bBatch.set(doc(collection(db, 'bookings')), booking);
    }
    await bBatch.commit();
  }

  console.log('✅ Bulk Seeding Completed Successfully!');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seeding Failed:', err);
  process.exit(1);
});
