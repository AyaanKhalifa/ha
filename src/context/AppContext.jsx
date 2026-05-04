// src/context/AppContext.jsx
// Global app settings: language, currency, theme, and airports
import React, { createContext, useContext, useState, useEffect } from 'react';
import { firestoreService } from '../services/firestore';
import { AIRPORTS as localAirports } from '../utils/flightData';

export const CURRENCIES = {
  INR: { symbol: '₹',   name: 'Indian Rupee',       rate: 1      },
  USD: { symbol: '$',   name: 'US Dollar',           rate: 0.012  },
  AED: { symbol: 'AED ',name: 'UAE Dirham',          rate: 0.044  },
  GBP: { symbol: '£',   name: 'British Pound',       rate: 0.0095 },
  EUR: { symbol: '€',   name: 'Euro',                rate: 0.011  },
  SGD: { symbol: 'S$',  name: 'Singapore Dollar',    rate: 0.016  },
  JPY: { symbol: '¥',   name: 'Japanese Yen',        rate: 1.81   },
  AUD: { symbol: 'A$',  name: 'Australian Dollar',   rate: 0.018  },
  CAD: { symbol: 'C$',  name: 'Canadian Dollar',     rate: 0.016  },
  CHF: { symbol: 'Fr',  name: 'Swiss Franc',         rate: 0.011  },
  CNY: { symbol: '¥',   name: 'Chinese Yuan',        rate: 0.086  },
};

export const LANGUAGES = {
  en: { name: 'English',  flag: '🇬🇧' },
  ar: { name: 'العربية',  flag: '🇦🇪' },
  hi: { name: 'हिन्दी',   flag: '🇮🇳' },
  fr: { name: 'Français', flag: '🇫🇷' },
  de: { name: 'Deutsch',  flag: '🇩🇪' },
  zh: { name: '中文',      flag: '🇨🇳' },
  es: { name: 'Español',  flag: '🇪🇸' },
  it: { name: 'Italiano', flag: '🇮🇹' },
  ja: { name: '日本語',   flag: '🇯🇵' },
  ko: { name: '한국어',   flag: '🇰🇷' },
  ru: { name: 'Русский',  flag: '🇷🇺' },
  pt: { name: 'Português',flag: '🇵🇹' },
  tr: { name: 'Türkçe',   flag: '🇹🇷' },
  nl: { name: 'Nederlands',flag: '🇳🇱' },
  sv: { name: 'Svenska',  flag: '🇸🇪' },
  pl: { name: 'Polski',   flag: '🇵🇱' },
  th: { name: 'ไทย',      flag: '🇹🇭' },
  id: { name: 'Bahasa Indonesia', flag: '🇮🇩' },
  vi: { name: 'Tiếng Việt', flag: '🇻🇳' },
  el: { name: 'Ελληνικά', flag: '🇬🇷' },
  he: { name: 'עברית',    flag: '🇮🇱' }
};

const AppContext = createContext({});
export const useApp = () => useContext(AppContext);

export function AppProvider({ children }) {
  const [currency, setCurrency] = useState(() => localStorage.getItem('ha_currency') || 'INR');
  const [language, setLanguage] = useState(() => localStorage.getItem('ha_language') || 'en');
  const [airports, setAirports] = useState([]);
  const [airportsMap, setAirportsMap] = useState({});
  const [liveCurrencies, setLiveCurrencies] = useState(CURRENCIES);

  useEffect(() => { localStorage.setItem('ha_currency', currency); }, [currency]);
  useEffect(() => { 
    localStorage.setItem('ha_language', language);
    
    // Robustly trigger Google Translate widget when language changes
    const applyTranslation = (retries = 10) => {
      try {
        const select = document.querySelector('.goog-te-combo');
        if (select) {
          select.value = language === 'zh' ? 'zh-CN' : language;
          select.dispatchEvent(new Event('change'));
        } else if (retries > 0) {
          setTimeout(() => applyTranslation(retries - 1), 500);
        }
      } catch(e) {}
    };
    applyTranslation();
  }, [language]);

  // Fetch live currency rates from API daily
  useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/INR')
      .then(res => res.json())
      .then(data => {
        if (data && data.rates) {
          setLiveCurrencies(prev => {
            const next = { ...prev };
            Object.keys(next).forEach(k => {
              if (data.rates[k]) {
                next[k].rate = data.rates[k];
              }
            });
            return next;
          });
        }
      })
      .catch(err => console.error("Failed to fetch live exchange rates:", err));
  }, []);

  // Fetch airports and currencies on load
  useEffect(() => {
    Promise.all([
      firestoreService.getAirports(),
      firestoreService.getCollection('currency_rates')
    ]).then(([airData, curData]) => {
      const finalAirports = airData && airData.length > 0 ? airData : localAirports;
      setAirports(finalAirports);
      const aMap = {};
      finalAirports.forEach(a => aMap[a.code] = a);
      setAirportsMap(aMap);

      if (curData && curData.length > 0) {
        const cMap = {};
        curData.forEach(c => cMap[c.currency] = c);
        setLiveCurrencies(cMap);
      }
    }).catch(err => {
      console.error("Firestore permissions or network error:", err);
      // Fallback to local data on error
      setAirports(localAirports);
      const aMap = {};
      localAirports.forEach(a => aMap[a.code] = a);
      setAirportsMap(aMap);
    });
  }, []);

  // Convert a base INR price to the selected currency
  const convertPrice = (amountINR) => {
    const cfg = liveCurrencies[currency] || CURRENCIES[currency] || CURRENCIES.INR;
    const converted = Math.round(amountINR * cfg.rate);
    return `${cfg.symbol}${converted.toLocaleString()}`;
  };

  return (
    <AppContext.Provider value={{ currency, setCurrency, language, setLanguage, convertPrice, CURRENCIES: liveCurrencies, LANGUAGES, airports, airportsMap }}>
      {children}
    </AppContext.Provider>
  );
}
