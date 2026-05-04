// src/services/api.js
// ═══════════════════════════════════════════════════════════
//  HABIBI AIRWAYS - API SERVICE LAYER
//  All business logic talking to Firestore
// ═══════════════════════════════════════════════════════════

const DEFAULT_CURRENCIES = {
  INR: { symbol: '₹',   name: 'Indian Rupee',       rate: 1      },
  USD: { symbol: '$',   name: 'US Dollar',           rate: 0.012  },
  AED: { symbol: 'AED ',name: 'UAE Dirham',          rate: 0.044  },
  GBP: { symbol: '£',   name: 'British Pound',       rate: 0.0095 },
  EUR: { symbol: '€',   name: 'Euro',                rate: 0.011  },
  SGD: { symbol: 'S$',  name: 'Singapore Dollar',    rate: 0.016  },
  JPY: { symbol: '¥',   name: 'Japanese Yen',        rate: 1.81   },
  AUD: { symbol: 'A$',  name: 'Australian Dollar',   rate: 0.018  },
};

// ── Currency ─────────────────────────────────────────────────────────
export const currencyService = {
  getRate: (currency) => DEFAULT_CURRENCIES[currency] || DEFAULT_CURRENCIES.INR,
  convert: (amountINR, currency) => {
    const r = DEFAULT_CURRENCIES[currency] || DEFAULT_CURRENCIES.INR;
    const val = Math.round(amountINR * r.rate);
    if (currency === 'INR') return `₹${val.toLocaleString('en-IN')}`;
    return `${r.symbol}${val.toLocaleString()}`;
  },
  convertRaw: (amountINR, currency) => {
    const r = DEFAULT_CURRENCIES[currency] || DEFAULT_CURRENCIES.INR;
    return Math.round(amountINR * r.rate);
  },
};

import { firestoreService } from './firestore';

// ── Airports ─────────────────────────────────────────────────────────
export const airportService = {
  getAll: () => firestoreService.getAirports(),
  getById: (id) => firestoreService.getDocument('airports', id),
  search: async (query) => {
    const all = await firestoreService.getAirports();
    const q = query.toLowerCase();
    return all.filter(a =>
      [a.id, a.city, a.country, a.name, a.code].some(s => s && s.toLowerCase().includes(q))
    );
  },
  getByRegion: async (region) => {
    const all = await firestoreService.getAirports();
    return all.filter(a => a.region === region);
  },
};

// ── Flights ───────────────────────────────────────────────────────────
export const flightService = {
  getAll: () => firestoreService.getCollection('flights'),
  
  getById: (id) => firestoreService.getDocument('flights', id),
  
  search: async ({ from, to, date, cabin = 'Economy', passengers = 1 }) => {
    const pad2 = (n) => String(n).padStart(2, '0');
    const fmtTime = (d) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

    const departOnDate = (f, dateStr) => {
      const iso = f.schedule?.departureTime || (typeof f.departureTime === 'string' && f.departureTime.includes('T') ? f.departureTime : null);
      if (iso && typeof iso === 'string' && iso.includes('T')) {
        const time = (iso.split('T')[1] || '12:00:00').slice(0, 5);
        return new Date(`${dateStr}T${time}:00`);
      }
      const t = typeof f.departureTime === 'string' && !f.departureTime.includes('T') ? f.departureTime : '12:00';
      return new Date(`${dateStr}T${t}:00`);
    };

    let routes = await firestoreService.queryCollection('routes', [['origin', '==', from], ['destination', '==', to], ['status', '==', 'active']]);
    let route = routes[0];
    let allFlights = [];

    if (route) {
      allFlights = await firestoreService.queryCollection('flights', [['routeId', '==', route.id]]);
    }
    if (!allFlights.length) {
      const pool = await firestoreService.getCollection('flights');
      allFlights = pool.filter(
        (f) =>
          (f.route?.from === from && f.route?.to === to) ||
          f.routeId === `${from}-${to}`
      );
    }
    if (!route && allFlights.length) {
      route = {
        id: `${from}-${to}`,
        origin: from,
        destination: to,
        flightTimeH: 3,
        status: 'active',
      };
    }

    if (!route || !allFlights.length) return [];

    const [seasonalPrices, aircrafts] = await Promise.all([
      firestoreService.getCollection('seasonal_prices'),
      firestoreService.getCollection('aircrafts'),
    ]);

    const flightHrs = route.flightTimeH || 3;

    const results = allFlights.map((f) => {
      const aircraftDoc = aircrafts.find((a) => a.id === f.aircraftId);
      const aircraftStr =
        aircraftDoc?.type ||
        aircraftDoc?.model ||
        f.aircraft?.model ||
        f.aircraft?.type ||
        'Boeing 777';

      const depDate = departOnDate(f, date);
      const arrDate = new Date(depDate.getTime() + flightHrs * 3600000);

      const month = depDate.getMonth() + 1;
      const seasonal = seasonalPrices.find((sp) => sp.routeId === route.id && sp.months?.includes(month));
      const seasonalMult = seasonal?.multiplier || 1;

      const basePriceINR = Math.round((f.basePrice || f.pricing?.economy * 50 || 10000) * seasonalMult);
      const cabinMultMap = { Economy: 1, 'Premium Economy': 1.7, Business: 2.85, First: 4.6 };

      const prices = {};
      Object.entries(cabinMultMap).forEach(([cab, mult]) => {
        prices[cab] = Math.round(basePriceINR * mult * passengers);
      });

      const stopCount = Array.isArray(f.stops) ? f.stops.length : f.stops === 0 ? 0 : Number(f.stops) || 0;
      const numStops = typeof f.stops === 'number' ? f.stops : stopCount;

      const fn = String(f.flightNumber || f.flightNum || 'HA000').replace(/^HA-/, 'HA');
      const terminal = f.terminal || 'T3'; 
      const gate = f.gate || ['A12','B2','C5','D8','A20','B15','C10'][Math.floor(Math.random()*7)];

      return {
        ...f,
        route,
        aircraft: aircraftStr,
        departureDateTime: depDate.toISOString(),
        arrivalDateTime: arrDate.toISOString(),
        durationMins: Math.round(flightHrs * 60),
        durationStr: `${Math.floor(flightHrs)}h ${Math.round((flightHrs % 1) * 60)}m`,
        stops: numStops,
        stopInfo: numStops ? `${numStops} stop(s)` : 'Non-stop',
        prices,
        basePriceINR,
        availableSeats: (() => {
          const a = f.availability || {};
          const cabinKey =
            cabin === 'Economy' ? 'economy' :
            cabin === 'Premium Economy' ? (a.premium != null ? 'premium' : 'economy') :
            cabin === 'Business' ? 'business' :
            cabin === 'First' ? 'firstClass' :
            'economy';
          const raw = a?.[cabinKey];
          if (typeof raw === 'number') return raw;
          if (typeof f.availableSeats === 'number') return f.availableSeats;
          return 0;
        })(),
        amenities: {
          wifi: aircraftStr.includes('A380') || aircraftStr.includes('B777'),
          ife: true,
          usb: true,
          meals: true,
          lounge: cabin === 'Business' || cabin === 'First',
        },
        id: f.id || `${fn}-${date}`,
        from,
        to,
        date,
        flightNum: fn,
        terminal,
        gate,
        dep: depDate.toISOString(),
        arr: arrDate.toISOString(),
        depStr: fmtTime(depDate),
        arrStr: fmtTime(arrDate),
        dur: `${Math.floor(flightHrs)}h ${Math.round((flightHrs % 1) * 60)}m`,
        durM: Math.round(flightHrs * 60),
        via: f.stops?.[0]?.airport || f.via || null,
        price: prices[cabin],
      };
    });

    return results.sort((a, b) => new Date(a.dep) - new Date(b.dep));
  },

  getStatus: async (date) => {
    const [statusList, allFlights, gateInfo, allDelays] = await Promise.all([
      firestoreService.getCollection('flight_status'),
      firestoreService.getCollection('flights'),
      firestoreService.getCollection('gate_info'),
      firestoreService.getCollection('delays')
    ]);

    const merged = statusList
      .filter(fs => !date || fs.date === date)
      .map((fs) => {
        const gateRec = gateInfo.find((g) => g.flightStatusId === fs.id);
        const delayRec = allDelays.find((d) => d.flightStatusId === fs.id);
        const fromGateRec = gateRec && (gateRec.gate ?? gateRec.gateNumber);
        const gateStr =
          fromGateRec != null && fromGateRec !== ''
            ? String(fromGateRec)
            : typeof fs.gate === 'string'
              ? fs.gate
              : fs.gate && fs.gate !== '-'
                ? String(fs.gate)
                : '—';
        return {
          ...fs,
          flight: allFlights.find((f) => f.id === fs.flightId),
          gate: gateStr,
          gateInfo: gateRec || fs.gateInfo,
          delay: delayRec || fs.delay,
        };
      });
    return merged;
  },
};

// ── Bookings ──────────────────────────────────────────────────────────
export const bookingService = {
  getAll: () => firestoreService.queryCollection('bookings'),

  getById: (id) => firestoreService.getDocument('bookings', id),

  getByUser: (userId) => firestoreService.queryCollection('bookings', [['userId', '==', userId]]),

  getByPNR: async (pnr) => {
    const results = await firestoreService.queryCollection('bookings', [['pnr', '==', pnr.toUpperCase()]]);
    return results[0] || null;
  },

  /** PNR + last name (matches lead passenger). */
  lookupByPnrAndLastName: async (pnr, lastName) => {
    const results = await firestoreService.queryCollection('bookings', [['pnr', '==', pnr.trim().toUpperCase()]]);
    const b = results[0];
    if (!b) return null;
    const want = lastName.trim().toLowerCase();
    if (!want) return null;
    const list = b.passengerList || [];
    const primary = (b.primaryLastName || list[0]?.lastName || '').trim().toLowerCase();
    const anyMatch = list.some((p) => (p.lastName || '').trim().toLowerCase() === want);
    if (primary && primary === want) return b;
    if (anyMatch) return b;
    if (!list.length && !primary) return b;
    return null;
  },

  subscribeToBooking: (bookingId, callback) => firestoreService.subscribeToBooking(bookingId, callback),

  create: async (data) => {
    const pnrChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const pnr = Array(6).fill(0).map(() => pnrChars[Math.floor(Math.random() * pnrChars.length)]).join('');
    const passengers = data.allPassengers || [];
    const primaryPax = passengers[0] || {};
    const primaryLastName = (primaryPax.lastName || '').trim();
    
    // Flatten first flight info for Manage/Check-in UI convenience
    const firstFlight = data.flight || {};
    
    const booking = {
      ...data,
      pnr,
      primaryLastName,
      passengerList: passengers,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Top-level fields for Manage UI lookup and display
      flightNum: firstFlight.flightNum || 'TBA',
      depStr: firstFlight.depStr || '--:--',
      arrStr: firstFlight.arrStr || '--:--',
      dur: firstFlight.dur || '--:--',
      aircraft: firstFlight.aircraft || 'Airbus A380',
      gate: firstFlight.gate || 'TBA',
      terminal: firstFlight.terminal || 'T3',
      baggage: firstFlight.bag || data.fare?.bag || '30kg',
      changes: data.fare?.changes || 'Permitted',
      history: [{
        status: 'pending',
        changedAt: new Date().toISOString(),
        reason: 'Booking initiated',
      }],
    };

    const id = `BK_${pnr}_${Date.now()}`;
    await firestoreService.setDocument('bookings', id, booking);
    
    // Lock all selected seats for each passenger in each segment
    if (data.selectedSeats) {
       for (const [flightId, paxSeats] of Object.entries(data.selectedSeats)) {
         if (!paxSeats) continue;
         // Handle both old (direct seat object) and new (paxIndex -> seat) structures
         const seatMap = (paxSeats.id) ? { "0": paxSeats } : paxSeats;
         
         for (const [paxIdx, seat] of Object.entries(seatMap)) {
           if (seat && seat.id) {
             const seatDocId = `SEAT_${flightId}_${seat.id}`;
             await firestoreService.setDocument('seats', seatDocId, {
               flightId,
               seatNumber: seat.id,
               class: seat.type || 'Economy',
               isBooked: true,
               bookingId: id,
               passengerId: passengers[paxIdx]?.id || `passenger_${paxIdx}`,
               updatedAt: new Date().toISOString()
             });
           }
         }
       }
    }
    
    return { id, ...booking };
  },

  confirmPayment: async (bookingId, paymentData) => {
    const prev = await firestoreService.getDocument('bookings', bookingId);
    if (!prev) return null;
    const history = [...(prev?.history || [])];
    history.push({
      status: 'confirmed',
      changedAt: new Date().toISOString(),
      reason: 'Payment received',
    });
    await firestoreService.updateDocument('bookings', bookingId, {
      status: 'confirmed',
      updatedAt: new Date().toISOString(),
      history,
    });
    
    const payment = {
      bookingId,
      amount: paymentData.amount,
      currency: paymentData.currency || 'INR',
      method: paymentData.method,
      status: 'completed',
      paidAt: new Date().toISOString(),
      gateway: paymentData.method === 'card' ? 'stripe' : 'razorpay'
    };
    
    return firestoreService.addDocument('payments', payment);
  },

  cancel: async (id, userId, reason) => {
    const prev = await firestoreService.getDocument('bookings', id);
    if (!prev) return;
    const history = [...(prev?.history || [])];
    history.push({
      status: 'cancelled',
      changedAt: new Date().toISOString(),
      reason: reason || 'Customer request',
    });
    
    await firestoreService.updateDocument('bookings', id, {
      status: 'cancelled',
      updatedAt: new Date().toISOString(),
      history,
    });

    // Release all seats associated with this booking
    if (prev.selectedSeats) {
      for (const [flightId, paxSeats] of Object.entries(prev.selectedSeats)) {
        if (!paxSeats) continue;
        const seatMap = (paxSeats.id) ? { "0": paxSeats } : paxSeats;
        
        for (const seat of Object.values(seatMap)) {
          if (seat && seat.id) {
            const seatDocId = `SEAT_${flightId}_${seat.id}`;
            const seatRef = await firestoreService.getDocument('seats', seatDocId);
            if (seatRef && seatRef.bookingId === id) {
              await firestoreService.updateDocument('seats', seatDocId, {
                isBooked: false,
                bookingId: null,
                passengerId: null,
              });
            }
          }
        }
      }
    }
  },
};

// ── Users ──────────────────────────────────────────────────────────────
export const userService = {
  getAll: () => firestoreService.queryCollection('users'),
  getById: (id) => firestoreService.getDocument('users', id),
  updateProfile: async (id, data) => {
    return firestoreService.updateDocument('users', id, { ...data, updatedAt: new Date().toISOString() });
  },
  addMiles: async (userId, miles, reason) => {
    const profile = await firestoreService.getDocument('users', userId);
    if (!profile) return false;
    const newBalance = (profile.skywardsMiles || 0) + miles;
    await firestoreService.updateDocument('users', userId, { 
      skywardsMiles: newBalance,
      updatedAt: new Date().toISOString() 
    });
    return newBalance;
  },
  updateTier: (userId, tier) => {
    return firestoreService.updateDocument('users', userId, { tier, updatedAt: new Date().toISOString() });
  },
};

// ── Revenue ────────────────────────────────────────────────────────────
export const revenueService = {
  getSummary: async () => {
    const bookings = await firestoreService.queryCollection('bookings');
    const confirmedBookings = bookings.filter(b => b.status !== 'cancelled');
    const totalRevenue = confirmedBookings.reduce((s, b) => s + (b.totalAmount || 0), 0);
    const cancelled = bookings.filter(b => b.status === 'cancelled').length;
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;

    const byCabin = ['Economy','Premium Economy','Business','First'].map(cabin => ({
      cabin,
      count: bookings.filter(b => b.cabinClass === cabin).length,
      revenue: bookings.filter(b => b.cabinClass === cabin && b.status !== 'cancelled').reduce((s, b) => s + (b.totalAmount || 0), 0),
    }));

    return { totalRevenue, totalBookings: bookings.length, confirmed, cancelled, byCabin, avgBookingValue: Math.round(totalRevenue / (confirmed || 1)) };
  },
  getAll: () => firestoreService.queryCollection('bookings'),
  getMonthlyTrend: async () => {
    const bookings = await firestoreService.queryCollection('bookings', [['status', '!=', 'cancelled']]);
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const currentYear = new Date().getFullYear();
    
    return months.map((m, i) => {
      const rev = bookings
        .filter(b => {
          const d = new Date(b.createdAt?.seconds ? b.createdAt.seconds * 1000 : b.createdAt);
          return d.getMonth() === i && d.getFullYear() === currentYear;
        })
        .reduce((s, b) => s + (b.totalAmount || 0), 0);
      return { month: m, revenue: Math.round(rev / 100000) }; // in Lakhs
    });
  }
};

// ── Fleet ──────────────────────────────────────────────────────────────
export const fleetService = {
  getAll: () => firestoreService.getCollection('aircrafts'),
  update: (id, data) => firestoreService.updateDocument('aircrafts', id, data),
};

// ── Promotions ─────────────────────────────────────────────────────────
export const promoService = {
  getAll: () => firestoreService.queryCollection('pricing_rules'),
  validate: async (code, amount) => {
    const rules = await firestoreService.queryCollection('pricing_rules', [
      ['code', '==', code.toUpperCase()],
      ['status', '==', 'active']
    ]);
    const rule = rules[0];
    if (!rule) return null;
    const discount = rule.discountType === 'percentage' 
      ? Math.round(amount * rule.discountValue / 100) 
      : rule.discountValue;
    return { valid: true, discount, finalAmount: amount - discount, rule };
  },
};

// ── System Settings ────────────────────────────────────────────────────
export const settingsService = {
  getAll: async () => {
    const list = await firestoreService.getCollection('system_settings');
    const settings = {};
    list.forEach(s => { settings[s.id] = s.value; });
    return settings;
  },
  get: async (key) => {
    const doc = await firestoreService.getDocument('system_settings', key);
    return doc?.value;
  },
  update: (key, value) => {
    return firestoreService.setDocument('system_settings', key, { value, updatedAt: new Date().toISOString() });
  },
};

// ── Audit ─────────────────────────────────────────────────────────────
export const auditService = {
  log: async (userId, action, target, details, ip = '0.0.0.0') => {
    await firestoreService.addDocument('audit_logs', { userId, action, target, ip, details });
  },
  getAll: (limit = 100) => firestoreService.queryCollection('audit_logs', [], { field: 'createdAt', dir: 'desc' }, limit),
};

// ── Notifications ──────────────────────────────────────────────────────
export const notificationService = {
  getForUser: (userId) => firestoreService.queryCollection('notifications', [['userId', '==', userId]], { field: 'createdAt', dir: 'desc' }),
  markRead: (id) => firestoreService.updateDocument('notifications', id, { read: true }),
  markAllRead: async (userId) => {
    const list = await firestoreService.queryCollection('notifications', [['userId', '==', userId], ['read', '==', false]]);
    for (const n of list) {
      await firestoreService.updateDocument('notifications', n.id, { read: true });
    }
  },
  send: (userId, type, title, message) => {
    return firestoreService.addDocument('notifications', { userId, type, title, message, read: false });
  },
  getUnreadCount: async (userId) => {
    const list = await firestoreService.queryCollection('notifications', [['userId', '==', userId], ['read', '==', false]]);
    return list.length;
  },
};

// ── Check-in ──────────────────────────────────────────────────────────
export const checkinService = {
  lookup: async (pnr, lastName) => bookingService.lookupByPnrAndLastName(pnr, lastName),
  doCheckin: async (bookingId, seatNumber, documentNumber = null, bags = null) => {
    const booking = await firestoreService.getDocument('bookings', bookingId);
    if (!booking) throw new Error('Booking not found.');
    if (booking.status !== 'confirmed') throw new Error('Booking is not confirmed.');
    
    // Handle multi-segment check-in? For now, update root checkin object.
    await firestoreService.updateDocument('bookings', bookingId, {
      'checkin.status': 'checked-in',
      'checkin.at': new Date().toISOString(),
      'checkin.documentNumber': documentNumber || '',
      'checkin.bags': bags,
    });
    return true;
  },
};

// ── Popular Destinations ──────────────────────────────────────────
export const destinationService = {
  getAll: () => firestoreService.getCollection('popular_destinations'),
  getTop: async (limit = 6) => {
    const all = await firestoreService.getCollection('popular_destinations');
    return all.slice(0, limit);
  }
};

// ── Offers & Promotions ──────────────────────────────────────────────
export const offerService = {
  getAll: () => firestoreService.getCollection('offers'),
  getActive: async () => {
    const all = await firestoreService.getCollection('offers');
    return all;
  }
};

// ── Hotels (mock) ────────────────────────────────────────────────────
export const hotelService = {
  search: ({ city }) => {
    const hotels = [
      { id:'H001', name:'Atlantis The Palm',     city:'Dubai',     stars:5, rating:9.2, reviews:4821, priceINR:22500, img:'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=380&fit=crop', amenities:['Pool','Spa','Beach','Wi-Fi','Restaurant'], tag:'Bestseller' },
      { id:'H002', name:'The Savoy',             city:'London',    stars:5, rating:9.5, reviews:3210, priceINR:55000, img:'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&h=380&fit=crop', amenities:['Spa','Bar','Wi-Fi','Concierge'],           tag:'Iconic'     },
      { id:'H003', name:'Raffles Singapore',     city:'Singapore', stars:5, rating:9.4, reviews:2987, priceINR:38000, img:'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&h=380&fit=crop', amenities:['Pool','Spa','Bar','Wi-Fi'],                tag:'Popular'    },
    ];
    if (!city) return hotels;
    return hotels.filter(h => h.city.toLowerCase().includes(city.toLowerCase()));
  },
};

const api = { 
  currencyService, 
  airportService, 
  flightService, 
  bookingService, 
  userService, 
  revenueService, 
  fleetService, 
  promoService, 
  settingsService, 
  auditService, 
  notificationService, 
  checkinService, 
  hotelService,
  destinationService,
  offerService 
};

export default api;
