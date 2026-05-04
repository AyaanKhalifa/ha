// src/utils/flightData.js
export const TODAY = new Date().toISOString().split('T')[0];

export const AIRPORTS = [
  { code:'BOM', city:'Mumbai',       name:'Chhatrapati Shivaji Maharaj Intl', country:'India',       region:'South Asia'   },
  { code:'DEL', city:'Delhi',        name:'Indira Gandhi International',       country:'India',       region:'South Asia'   },
  { code:'MAA', city:'Chennai',      name:'Chennai International',             country:'India',       region:'South Asia'   },
  { code:'BLR', city:'Bengaluru',    name:'Kempegowda International',          country:'India',       region:'South Asia'   },
  { code:'HYD', city:'Hyderabad',    name:'Rajiv Gandhi International',        country:'India',       region:'South Asia'   },
  { code:'COK', city:'Kochi',        name:'Cochin International',              country:'India',       region:'South Asia'   },
  { code:'AMD', city:'Ahmedabad',    name:'Sardar Vallabhbhai Patel Intl',     country:'India',       region:'South Asia'   },
  { code:'CCU', city:'Kolkata',      name:'Netaji Subhas Chandra Bose Intl',   country:'India',       region:'South Asia'   },
  { code:'DXB', city:'Dubai',        name:'Dubai International',               country:'UAE',         region:'Middle East'  },
  { code:'AUH', city:'Abu Dhabi',    name:'Zayed International',               country:'UAE',         region:'Middle East'  },
  { code:'DOH', city:'Doha',         name:'Hamad International',               country:'Qatar',       region:'Middle East'  },
  { code:'RUH', city:'Riyadh',       name:'King Khalid International',         country:'Saudi Arabia',region:'Middle East'  },
  { code:'CAI', city:'Cairo',        name:'Cairo International',               country:'Egypt',       region:'Africa'       },
  { code:'NBO', city:'Nairobi',      name:'Jomo Kenyatta International',       country:'Kenya',       region:'Africa'       },
  { code:'JNB', city:'Johannesburg', name:"O.R. Tambo International",          country:'South Africa',region:'Africa'       },
  { code:'LHR', city:'London',       name:'Heathrow Airport',                  country:'UK',          region:'Europe'       },
  { code:'CDG', city:'Paris',        name:'Charles de Gaulle Airport',         country:'France',      region:'Europe'       },
  { code:'FRA', city:'Frankfurt',    name:'Frankfurt Airport',                 country:'Germany',     region:'Europe'       },
  { code:'AMS', city:'Amsterdam',    name:'Schiphol Airport',                  country:'Netherlands', region:'Europe'       },
  { code:'ZRH', city:'Zurich',       name:'Zürich Airport',                    country:'Switzerland', region:'Europe'       },
  { code:'IST', city:'Istanbul',     name:'Istanbul Airport',                  country:'Turkey',      region:'Europe'       },
  { code:'FCO', city:'Rome',         name:'Leonardo da Vinci Airport',         country:'Italy',       region:'Europe'       },
  { code:'BCN', city:'Barcelona',    name:'El Prat Airport',                   country:'Spain',       region:'Europe'       },
  { code:'JFK', city:'New York',     name:'John F Kennedy International',      country:'USA',         region:'Americas'     },
  { code:'LAX', city:'Los Angeles',  name:'Los Angeles International',         country:'USA',         region:'Americas'     },
  { code:'ORD', city:'Chicago',      name:"O'Hare International",              country:'USA',         region:'Americas'     },
  { code:'YYZ', city:'Toronto',      name:'Pearson International',             country:'Canada',      region:'Americas'     },
  { code:'SIN', city:'Singapore',    name:'Changi Airport',                    country:'Singapore',   region:'Asia Pacific' },
  { code:'BKK', city:'Bangkok',      name:'Suvarnabhumi Airport',              country:'Thailand',    region:'Asia Pacific' },
  { code:'KUL', city:'Kuala Lumpur', name:'KLIA International',                country:'Malaysia',    region:'Asia Pacific' },
  { code:'NRT', city:'Tokyo',        name:'Narita International',              country:'Japan',       region:'Asia Pacific' },
  { code:'HKG', city:'Hong Kong',    name:'Hong Kong International',           country:'China',       region:'Asia Pacific' },
  { code:'SYD', city:'Sydney',       name:'Kingsford Smith International',     country:'Australia',   region:'Asia Pacific' },
  { code:'MEL', city:'Melbourne',    name:'Melbourne Airport',                 country:'Australia',   region:'Asia Pacific' },
];

export const CITY_MAP = Object.fromEntries(AIRPORTS.map(a => [a.code, a.city]));

// Currency conversion
const RATE_MAP = { INR:1, USD:0.012, AED:0.044, GBP:0.0095, EUR:0.011, SGD:0.016, JPY:1.81, AUD:0.018, CAD:0.016, CHF:0.011 };
const SYM_MAP  = { INR:'₹', USD:'$', AED:'AED ', GBP:'£', EUR:'€', SGD:'S$', JPY:'¥', AUD:'A$', CAD:'C$', CHF:'Fr ' };

export function formatPrice(amountINR, currency = 'INR') {
  const rate = RATE_MAP[currency] || 1;
  const sym  = SYM_MAP[currency] || currency + ' ';
  const val  = Math.round(amountINR * rate);
  if (currency === 'INR') return '₹' + val.toLocaleString('en-IN');
  return sym + val.toLocaleString();
}

export function formatTime(iso) {
  if (!iso) return '--:--';
  const d = new Date(iso);
  return String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
}

export function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short', year:'numeric' });
}

export const FARE_CLASSES = {
  Economy: [
    { name:'Saver',  mult:1.00, baggage:'7kg cabin only',   changeFee:5000,  refundable:false, milesEarnPct:50  },
    { name:'Flex',   mult:1.22, baggage:'25kg + 7kg cabin',  changeFee:2500,  refundable:'partial', milesEarnPct:100 },
    { name:'Flex+',  mult:1.50, baggage:'30kg + 7kg cabin',  changeFee:0,     refundable:true,  milesEarnPct:125 },
  ],
  'Premium Economy': [
    { name:'Saver',  mult:1.00, baggage:'25kg + 10kg cabin', changeFee:3500,  refundable:false, milesEarnPct:75  },
    { name:'Flex+',  mult:1.35, baggage:'35kg + 10kg cabin', changeFee:0,     refundable:true,  milesEarnPct:150 },
  ],
  Business: [
    { name:'Flex',   mult:1.00, baggage:'40kg + 12kg cabin', changeFee:0,     refundable:true,  milesEarnPct:150 },
    { name:'Flex+',  mult:1.25, baggage:'50kg + 12kg cabin', changeFee:0,     refundable:true,  milesEarnPct:200 },
  ],
  First: [
    { name:'Suite',  mult:1.00, baggage:'Unlimited',          changeFee:0,     refundable:true,  milesEarnPct:300 },
  ],
};

export const CABIN_MULT = { Economy:1, 'Premium Economy':1.7, Business:2.85, First:4.6 };

export const POPULAR_DESTINATIONS = [
  { code:'LHR', city:'London',    country:'United Kingdom', priceINR:41500, img:'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&h=400&fit=crop' },
  { code:'DXB', city:'Dubai',     country:'UAE',            priceINR:18900, img:'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=400&fit=crop' },
  { code:'CDG', city:'Paris',     country:'France',         priceINR:37200, img:'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&h=400&fit=crop' },
  { code:'JFK', city:'New York',  country:'USA',            priceINR:54800, img:'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=600&h=400&fit=crop' },
  { code:'SIN', city:'Singapore', country:'Singapore',      priceINR:23400, img:'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&h=400&fit=crop' },
  { code:'NRT', city:'Tokyo',     country:'Japan',          priceINR:49600, img:'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=400&fit=crop' },
];

export function generateFlights(from, to, date, cabin = 'Economy', pax = 1) {
  if (!from || !to || from === to) return [];
  const base = 14000 + Math.floor(Math.random() * 8000);
  const mult = CABIN_MULT[cabin] || 1;
  return [0,1,2].map(i => {
    const dep = new Date(`${date}T${['06','10','18'][i]}:00:00`);
    const dur = 180 + Math.floor(Math.random()*420);
    const arr = new Date(dep.getTime() + dur*60000);
    return {
      id: `FL-${from}-${to}-${i}`,
      flightNum: `HA${100+i*100}`,
      from, to, date,
      dep: dep.toISOString(),
      arr: arr.toISOString(),
      depStr: String(dep.getHours()).padStart(2,'0')+':'+String(dep.getMinutes()).padStart(2,'0'),
      arrStr: String(arr.getHours()).padStart(2,'0')+':'+String(arr.getMinutes()).padStart(2,'0'),
      durM: dur,
      dur: `${Math.floor(dur/60)}h ${dur%60}m`,
      stops: i===1?1:0,
      via: i===1?'DXB':null,
      aircraft: ['Airbus A380','Boeing 777-300ER','Airbus A350-900'][i],
      prices: { Economy:base, 'Premium Economy':Math.round(base*1.7), Business:Math.round(base*2.85), First:Math.round(base*4.6) },
      price: Math.round(base * mult * pax),
    };
  });
}
