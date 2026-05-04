/* eslint-disable no-console */
import { db } from "../firebase";
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs } from "firebase/firestore";
import { SAMPLE_DATA } from "../data/sampleData";

export const seedDatabase = async () => {
  console.log("🚀 Starting comprehensive database initialization...");

  try {
    // 1. Connection Ping
    console.log("📡 Pinging Firestore...");
    const pingDoc = doc(db, "_system", "ping");
    await setDoc(pingDoc, { lastPing: new Date().toISOString() });
    console.log("✅ Connection verified.");

    // 2. Clear critical collections to ensure fresh state (optional but recommended for "fully working" feel)
    const collectionsToClear = ["flights", "flight_status", "seats", "offers", "popular_destinations"];
    for (const colName of collectionsToClear) {
      console.log(`🧹 Clearing ${colName}...`);
      const snapshot = await getDocs(collection(db, colName));
      for (const d of snapshot.docs) {
        await deleteDoc(doc(db, colName, d.id));
      }
    }

    // 3. Seed Static Collections
    const staticCollections = [
      "airports",
      "routes",
      "aircrafts",
      "offers",
      "popular_destinations",
      "pricing_rules",
      "seasonal_prices",
      "system_settings",
    ];

    for (const colName of staticCollections) {
      const dataSet = SAMPLE_DATA[colName] || [];
      console.log(`📂 Seeding ${colName} (${dataSet.length} items)...`);
      for (const item of dataSet) {
        const { id, ...rest } = item;
        await setDoc(doc(db, colName, id), { ...rest, _seededAt: new Date().toISOString() });
      }
    }

    // 4. DYNAMIC FLIGHT GENERATION (Next 30 Days)
    console.log("✈️ Generating dynamic flight schedule for the next 30 days...");
    const routes = SAMPLE_DATA.routes;
    const aircrafts = SAMPLE_DATA.aircrafts;
    const now = new Date();
    let flightCount = 0;

    for (let i = 0; i < 30; i++) {
        const date = new Date(now);
        date.setDate(now.getDate() + i);
        const dateStr = date.toISOString().split("T")[0];

        for (const route of routes) {
            // Generate 2-3 flights per route per day
            const dailyFreq = Math.floor(Math.random() * 2) + 2; 
            for (let f = 0; f < dailyFreq; f++) {
                const hour = 6 + (f * 6) + Math.floor(Math.random() * 2);
                const minute = Math.random() > 0.5 ? "00" : "30";
                const depTime = `${hour.toString().padStart(2, "0")}:${minute}`;
                
                const flightId = `FLIGHT_${route.id}_${dateStr}_${f}`;
                const flightNum = `HA${Math.floor(Math.random() * 900) + 100}`;
                const ac = aircrafts[Math.floor(Math.random() * aircrafts.length)];

                const departureDateTime = new Date(`${dateStr}T${depTime}:00Z`);
                const arrivalDateTime = new Date(departureDateTime.getTime() + route.flightTimeH * 3600000);

                const flightDoc = {
                    flightNumber: flightNum,
                    routeId: route.id,
                    airline: "Habibi Airways",
                    aircraftId: ac.id,
                    aircraft: { model: ac.model, registration: ac.registration, totalSeats: ac.totalSeats },
                    route: { from: route.origin, to: route.destination, duration: `${Math.floor(route.flightTimeH)}h ${Math.round((route.flightTimeH % 1) * 60)}m` },
                    schedule: { 
                        departureTime: departureDateTime.toISOString(), 
                        arrivalTime: arrivalDateTime.toISOString(),
                    },
                    departureTime: depTime,
                    basePrice: 8000 + (Math.random() * 15000),
                    pricing: {
                        economy: 200 + Math.floor(Math.random() * 100),
                        business: 800 + Math.floor(Math.random() * 400),
                        firstClass: 1800 + Math.floor(Math.random() * 1000)
                    },
                    status: i === 0 && hour < now.getHours() ? "Arrived" : i === 0 && hour === now.getHours() ? "Boarding" : "Scheduled",
                    gate: String.fromCharCode(65 + Math.floor(Math.random() * 4)) + (Math.floor(Math.random() * 20) + 1),
                    terminal: "T3",
                    _seededAt: new Date().toISOString()
                };

                await setDoc(doc(db, "flights", flightId), flightDoc);
                
                // Also create a status record for today's flights
                if (i === 0) {
                    await setDoc(doc(db, "flight_status", `STATUS_${flightId}`), {
                        flightId,
                        flightNumber: flightNum,
                        date: dateStr,
                        route: { origin: route.origin, destination: route.destination },
                        status: flightDoc.status,
                        departureActual: depTime,
                        arrivalActual: arrivalDateTime.toISOString().split("T")[1].slice(0, 5),
                        gate: flightDoc.gate,
                        terminal: flightDoc.terminal,
                        _seededAt: new Date().toISOString()
                    });
                }
                flightCount++;
            }
        }
    }

    console.log(`✅ Success! Seeded ${flightCount} flights across 30 days.`);
    alert(`DATABASE INITIALIZED!\n\n${flightCount} flights generated for the next 30 days.\nAirports, Routes, and Offers updated.`);
    
  } catch (error) {
    console.error("❌ SEEDING FAILED:", error);
    alert(`ERROR: ${error.message}`);
  }
};
