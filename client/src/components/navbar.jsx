import React from 'react';
import logo from './photos/VitromedLogo.png';

export default function Navbar({ activeTab, setActiveTab, dbConnected, onRefresh, stats }) {
  const tabs = [
    { id: 'dashboard', label: '📊 Dashboard', count: stats?.total },
    { id: 'inward', label: '➕ Inward Asset' },
    { id: 'allocation', label: '👤 User Allocation', count: stats?.inUse },
    { id: 'maintenance', label: '🛠️ Maintenance', count: stats?.maintenance },
    { id: 'plants', label: '🏢 Plant Inventory' },
  ];

  return (
    <header
      style={{
        backgroundColor: '#0f172a',
        borderBottom: '1px solid #334155',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
      }}
    >
      <div
        style={{
          maxWidth: '1300px',
          margin: '0 auto',
          padding: '0.85rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        {/* Brand Logo & Portal Title */}
        <div
          onClick={() => setActiveTab('dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
        >
          <img
            src={logo}
            alt="Vitromed Logo"
            style={{ height: '42px', width: 'auto', objectFit: 'contain' }}
          />
          <div style={{ borderLeft: '1px solid #334155', paddingLeft: '1rem' }}>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em' }}>
              Vitromed <span style={{ color: '#818cf8' }}>IT Asset Portal</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Enterprise Device Lifecycle & Management
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.55rem 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#ffffff' : '#94a3b8',
                  backgroundColor: isActive ? '#4f46e5' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease-in-out',
                }}
              >
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && tab.count > 0 && (
                  <span
                    style={{
                      fontSize: '0.7rem',
                      padding: '0.1rem 0.45rem',
                      borderRadius: '9999px',
                      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.25)' : 'rgba(51, 65, 85, 0.8)',
                      color: '#ffffff',
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Live MongoDB Atlas Connectivity Badge & Refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: dbConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
              color: dbConnected ? '#34d399' : '#fbbf24',
              border: `1px solid ${dbConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
            }}
          >
            <span style={{ fontSize: '0.6rem' }}>●</span>
            <span>Atlas: {dbConnected ? 'Online' : 'Offline'}</span>
          </div>

          <button
            onClick={onRefresh}
            title="Refresh Real-time Data"
            style={{
              padding: '0.45rem 0.65rem',
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            🔄
          </button>
        </div>
      </div>
    </header>
  );
}