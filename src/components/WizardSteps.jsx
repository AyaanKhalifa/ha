// src/components/WizardSteps.jsx
import React from 'react';

const STEPS = ['Flight selection', 'Passenger details', 'Add-ons', 'Payment', 'Confirmation'];

export default function WizardSteps({ active }) {
  return (
    <div style={{ background: '#fff', borderBottom: '1px solid #E8E8E8' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center' }}>
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 0', flexShrink: 0 }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 800,
                background: i < active ? '#2E7D32' : i === active ? '#C8102E' : '#F0F0F0',
                color: i <= active ? '#fff' : '#AAAAAA',
                transition: 'all .3s',
              }}>
                {i < active ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: 12.5, fontWeight: i === active ? 700 : 400, color: i === active ? '#C8102E' : i < active ? '#333' : '#AAAAAA', whiteSpace: 'nowrap', transition: 'all .3s' }}>{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: 1, background: i < active ? '#2E7D32' : '#E8E8E8', minWidth: 12, maxWidth: 48, transition: 'background .3s' }} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
