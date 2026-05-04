import React, { useState } from 'react';
import { seedDatabase } from '../utils/seedDatabase';

export default function SeedDb() {
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const runSeed = async () => {
    setProcessing(true);
    setDone(false);
    try {
      await seedDatabase();
      setDone(true);
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{ 
      padding: 60, 
      minHeight: '80vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#fcfcfc',
      fontFamily: '"Outfit", sans-serif'
    }}>
      <div style={{ 
        maxWidth: 600, 
        textAlign: 'center', 
        padding: 40, 
        background: '#fff', 
        borderRadius: 20, 
        boxShadow: '0 20px 40px rgba(0,0,0,0.05)' 
      }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#1a1a1a', marginBottom: 16 }}>
          Habibi Airways Seeder
        </h1>
        <p style={{ fontSize: 16, color: '#666', lineHeight: 1.6, marginBottom: 32 }}>
          Inject the complete 10-collection industry-standard data structure into your Firestore database. This includes flights, airports, crew, aircrafts, and more.
        </p>
        
        <button 
          onClick={runSeed} 
          disabled={processing}
          style={{ 
            padding: '16px 40px', 
            fontSize: 16, 
            fontWeight: 600,
            background: processing ? '#ccc' : '#C8102E', 
            color: '#fff', 
            border: 'none', 
            borderRadius: 12, 
            cursor: processing ? 'default' : 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: processing ? 'none' : '0 10px 20px rgba(200, 16, 46, 0.2)'
          }}
        >
          {processing ? 'Processing Data...' : 'Insert Raw Data Now'}
        </button>

        {done && (
          <div style={{ marginTop: 24, color: '#2e7d32', fontWeight: 600, padding: '12px 24px', background: '#e8f5e9', borderRadius: 8 }}>
            ✅ Database Seeded Successfully!
          </div>
        )}

        <div style={{ marginTop: 40, borderTop: '1px solid #eee', paddingTop: 24, textAlign: 'left' }}>
          <h4 style={{ fontSize: 14, textTransform: 'uppercase', color: '#999', letterSpacing: 1, marginBottom: 12 }}>
            Collections Prepared:
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13, color: '#444' }}>
            <div>• flights</div>
            <div>• airports</div>
            <div>• aircrafts</div>
            <div>• crew</div>
            <div>• users</div>
            <div>• bookings</div>
            <div>• seats</div>
            <div>• payments</div>
            <div>• admins</div>
            <div>• tickets</div>
          </div>
        </div>
      </div>
    </div>
  );
}
