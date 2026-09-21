import React from 'react';
import { Monitor, Keyboard, Headphones, Cable, Zap, Layers, Check, X } from 'lucide-react';

const STANDARD_ACCESSORIES = [
  { key: 'monitor', label: 'Monitor', icon: Monitor, defaultDesc: 'Display Screen' },
  { key: 'keyboard', label: 'Keyboard', icon: Keyboard, defaultDesc: 'USB Standard Keyboard' },
  { key: 'mouse', label: 'Mouse', icon: Layers, defaultDesc: 'Optical USB Mouse' },
  { key: 'powerAdapter', label: 'Power Adapter / Charger', icon: Zap, defaultDesc: 'Power Supply & AC Cord' },
  { key: 'cables', label: 'Cables & Connectivity', icon: Cable, defaultDesc: 'HDMI / LAN / Power Cables' },
  { key: 'other', label: 'Other Accessories', icon: Layers, defaultDesc: 'Bag, Headset, Adapter etc.' },
];

export default function AccessoryChecklist({ accessories = {}, onChange }) {
  const handleToggle = (key, received) => {
    const current = accessories[key] || { received: false, description: '' };
    onChange({
      ...accessories,
      [key]: {
        received,
        description: received ? (current.description || '') : '',
      },
    });
  };

  const handleDescChange = (key, description) => {
    const current = accessories[key] || { received: true, description: '' };
    onChange({
      ...accessories,
      [key]: {
        ...current,
        received: true,
        description,
      },
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '0.75rem',
        }}
      >
        {STANDARD_ACCESSORIES.map((item) => {
          const accState = accessories[item.key] || { received: false, description: '' };
          const isReceived = Boolean(accState.received);
          const Icon = item.icon;

          return (
            <div
              key={item.key}
              style={{
                backgroundColor: isReceived ? 'rgba(2, 132, 199, 0.05)' : 'var(--bg-surface-raised, #f8fafc)',
                border: isReceived ? '1px solid rgba(2, 132, 199, 0.3)' : '1px solid var(--border-default, #e2e8f0)',
                borderRadius: '8px',
                padding: '0.75rem 0.85rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                transition: 'all 0.15s ease',
              }}
            >
              {/* Toggle Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Icon size={15} color={isReceived ? '#0284c7' : 'var(--text-muted)'} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: isReceived ? '#0284c7' : 'var(--text-primary)' }}>
                    {item.label}
                  </span>
                </div>

                {/* Yes / No Toggle Button Group */}
                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '6px', padding: '2px' }}>
                  <button
                    type="button"
                    onClick={() => handleToggle(item.key, true)}
                    style={{
                      padding: '2px 8px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      backgroundColor: isReceived ? '#0284c7' : 'transparent',
                      color: isReceived ? '#ffffff' : 'var(--text-muted)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggle(item.key, false)}
                    style={{
                      padding: '2px 8px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      backgroundColor: !isReceived ? '#64748b' : 'transparent',
                      color: !isReceived ? '#ffffff' : 'var(--text-muted)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    No
                  </button>
                </div>
              </div>

              {/* Simple Description Field (Shown only when Yes is selected) */}
              {isReceived && (
                <div style={{ marginTop: '2px' }}>
                  <input
                    type="text"
                    placeholder={'e.g. ' + item.defaultDesc}
                    value={accState.description || ''}
                    onChange={(e) => handleDescChange(item.key, e.target.value)}
                    className="form-control"
                    style={{
                      fontSize: '0.76rem',
                      padding: '0.35rem 0.55rem',
                      backgroundColor: 'var(--bg-surface, #ffffff)',
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
