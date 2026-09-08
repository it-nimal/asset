import React from 'react';

export default function Hero({ stats, onNavigate, assets }) {
  const cards = [
    {
      title: 'Total IT Assets',
      count: stats?.total || 0,
      desc: 'All hardware & devices in MongoDB Atlas',
      icon: '💻',
      status: 'Active Database',
      badgeColor: 'rgba(99, 102, 241, 0.2)',
      textColor: '#818cf8',
      targetTab: 'inward',
    },
    {
      title: 'Allocated to Users',
      count: stats?.inUse || 0,
      desc: 'Currently assigned to employees',
      icon: '👤',
      status: 'In Active Use',
      badgeColor: 'rgba(6, 182, 212, 0.2)',
      textColor: '#22d3ee',
      targetTab: 'allocation',
    },
    {
      title: 'Available in Stock',
      count: stats?.available || 0,
      desc: 'Ready for employee assignment',
      icon: '📦',
      status: 'Ready in Stock',
      badgeColor: 'rgba(16, 185, 129, 0.2)',
      textColor: '#34d399',
      targetTab: 'allocation',
    },
    {
      title: 'Under Maintenance',
      count: stats?.maintenance || 0,
      desc: 'Devices in repair / IT service',
      icon: '🛠️',
      status: 'Service Log',
      badgeColor: 'rgba(245, 158, 11, 0.2)',
      textColor: '#fbbf24',
      targetTab: 'maintenance',
    },
  ];

  return (
    <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      {/* Top Banner */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <span
          style={{
            display: 'inline-block',
            padding: '0.4rem 1rem',
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '9999px',
            color: '#818cf8',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '1rem',
          }}
        >
          ⚡ Vitromed IT Asset Hub • Real-time Cloud Sync
        </span>
        <h1 style={{ fontSize: '2.6rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
          IT Asset & Device Lifecycle Dashboard
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '650px', margin: '0 auto', lineHeight: 1.6 }}>
          Track hardware procurement, allocate laptops to employees across plants, log maintenance repairs, and audit inventory in real-time.
        </p>

        {/* Quick Action CTA Buttons */}
        <div style={{ marginTop: '1.75rem', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => onNavigate('inward')}
            style={{
              padding: '0.75rem 1.75rem',
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(79, 70, 229, 0.4)',
            }}
          >
            ➕ Register New Asset
          </button>
          <button
            onClick={() => onNavigate('allocation')}
            style={{
              padding: '0.75rem 1.75rem',
              backgroundColor: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #334155',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            👤 User Allocation Hub
          </button>
          <button
            onClick={() => onNavigate('plants')}
            style={{
              padding: '0.75rem 1.75rem',
              backgroundColor: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #334155',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            🏢 Plant Inventory
          </button>
        </div>
      </div>

      {/* 4 Interactive KPI Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem',
        }}
      >
        {cards.map((card, index) => (
          <div
            key={index}
            onClick={() => onNavigate(card.targetTab)}
            style={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '14px',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
              cursor: 'pointer',
              transition: 'transform 0.15s ease, border-color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = card.textColor;
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#334155';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '2rem' }}>{card.icon}</span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '0.25rem 0.65rem',
                    borderRadius: '9999px',
                    backgroundColor: card.badgeColor,
                    color: card.textColor,
                  }}
                >
                  {card.status}
                </span>
              </div>

              <h3 style={{ fontSize: '1.25rem', color: '#f8fafc', marginBottom: '0.4rem', fontWeight: 600 }}>
                {card.title}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.4 }}>
                {card.desc}
              </p>
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff' }}>
                {card.count}
              </span>
              <span style={{ fontSize: '0.8rem', color: card.textColor, fontWeight: 600 }}>
                Manage Tab →
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Devices Overview */}
      <div
        style={{
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 20px 35px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: 700 }}>
              🕒 Recently Registered Assets
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '2px' }}>
              Latest hardware entries synced with MongoDB Atlas
            </p>
          </div>
          <button
            onClick={() => onNavigate('allocation')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            View All Assets →
          </button>
        </div>

        {(!assets || assets.length === 0) ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📦</div>
            <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '1.1rem' }}>No assets registered yet</div>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Click "+ Register New Asset" above to add your first IT device to MongoDB.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ color: '#94a3b8', borderBottom: '1px solid #334155', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Make & Model</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Serial No (SR)</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Assigned To</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Plant Location</th>
                </tr>
              </thead>
              <tbody>
                {assets.slice(0, 5).map((item) => (
                  <tr key={item._id} style={{ borderBottom: '1px solid #334155' }}>
                    <td style={{ padding: '0.9rem 1rem', color: '#ffffff', fontWeight: 600 }}>
                      {item.make} {item.model}
                    </td>
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <code style={{ backgroundColor: '#0f172a', padding: '3px 8px', borderRadius: '4px', color: '#818cf8' }}>
                        {item.sr}
                      </code>
                    </td>
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <span
                        style={{
                          padding: '0.25rem 0.65rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor:
                            item.status === 'In Use'
                              ? 'rgba(6, 182, 212, 0.15)'
                              : item.status === 'Under Maintenance'
                              ? 'rgba(245, 158, 11, 0.15)'
                              : 'rgba(16, 185, 129, 0.15)',
                          color:
                            item.status === 'In Use'
                              ? '#22d3ee'
                              : item.status === 'Under Maintenance'
                              ? '#fbbf24'
                              : '#34d399',
                        }}
                      >
                        {item.status === 'In Use' ? '🔵 Allocated' : item.status === 'Under Maintenance' ? '🛠️ Maintenance' : '🟢 Available in Stock'}
                      </span>
                    </td>
                    <td style={{ padding: '0.9rem 1rem', color: '#cbd5e1' }}>
                      {item.assignedTo !== 'Unassigned' ? item.assignedTo : <span style={{ color: '#64748b' }}>—</span>}
                    </td>
                    <td style={{ padding: '0.9rem 1rem', color: '#cbd5e1' }}>
                      {item.location || 'Vitromed HQ'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}