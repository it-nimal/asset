import React, { useState } from 'react';

const PLANTS = [
  { id: 'All', name: 'All Locations & Plants', icon: '🌐' },
  { id: 'Vitromed HQ - Main Office', name: 'Vitromed HQ - Delhi NCR', icon: '🏢' },
  { id: 'Plant 1 - Bangalore', name: 'Plant 1 - Bangalore', icon: '🏭' },
  { id: 'Plant 2 - Pune', name: 'Plant 2 - Pune', icon: '🏭' },
  { id: 'Plant 3 - Jaipur', name: 'Plant 3 - Jaipur', icon: '🏭' },
  { id: 'Work From Home (Remote)', name: 'Remote / Work From Home', icon: '🏠' },
];

export default function PlantInventory({ assets, onRefresh, loading }) {
  const [selectedPlant, setSelectedPlant] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter by plant and search
  const filteredAssets = assets.filter((item) => {
    const matchesPlant = selectedPlant === 'All' || (item.location || 'Vitromed HQ - Main Office') === selectedPlant;
    const matchesSearch =
      (item.make || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.model || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.sr || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.assignedTo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.department || '').toLowerCase().includes(searchTerm.toLowerCase());

    return matchesPlant && matchesSearch;
  });

  return (
    <div style={{ maxWidth: '1250px', margin: '2rem auto 5rem', padding: '0 1.5rem' }}>
      {/* Section Header */}
      <div style={{ marginBottom: '2rem' }}>
        <span
          style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            color: '#818cf8',
            letterSpacing: '0.05em',
          }}
        >
          Multi-Location & Factory Inventory
        </span>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff', marginTop: '0.25rem' }}>
          🏢 Plant-wise IT Asset Distribution
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Monitor hardware deployment, branch stock levels, and factory unit allocations.
        </p>
      </div>

      {/* Plant Selector Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2.5rem',
        }}
      >
        {PLANTS.map((plant) => {
          const isSelected = selectedPlant === plant.id;
          const count =
            plant.id === 'All'
              ? assets.length
              : assets.filter((a) => (a.location || 'Vitromed HQ - Main Office') === plant.id).length;

          return (
            <div
              key={plant.id}
              onClick={() => setSelectedPlant(plant.id)}
              style={{
                backgroundColor: isSelected ? '#1e293b' : '#0f172a',
                border: `2px solid ${isSelected ? '#818cf8' : '#334155'}`,
                borderRadius: '12px',
                padding: '1.25rem',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease',
                boxShadow: isSelected ? '0 8px 20px rgba(129, 140, 248, 0.2)' : 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.75rem' }}>{plant.icon}</span>
                <span
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: isSelected ? '#818cf8' : '#ffffff',
                  }}
                >
                  {count}
                </span>
              </div>
              <div
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: isSelected ? '#ffffff' : '#94a3b8',
                  marginTop: '1rem',
                }}
              >
                {plant.name}
              </div>
            </div>
          );
        })}
      </div>

      {/* Assets in Selected Plant Table */}
      <div
        style={{
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 20px 35px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div
          style={{
            padding: '1.5rem 2rem',
            borderBottom: '1px solid #334155',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: 600 }}>
              📍 Assets in {selectedPlant === 'All' ? 'All Locations' : selectedPlant} ({filteredAssets.length})
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '2px' }}>
              Showing all IT devices registered at this branch/factory
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="🔍 Search in this location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                color: '#f8fafc',
                fontSize: '0.85rem',
                minWidth: '220px',
                outline: 'none',
              }}
            />

            <button
              onClick={onRefresh}
              style={{
                padding: '0.5rem 0.9rem',
                backgroundColor: '#334155',
                color: '#f8fafc',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', color: '#94a3b8', borderBottom: '1px solid #334155' }}>
                <th style={{ padding: '0.9rem 1.25rem' }}>Device Details</th>
                <th style={{ padding: '0.9rem 1.25rem' }}>Serial No (SR)</th>
                <th style={{ padding: '0.9rem 1.25rem' }}>Status</th>
                <th style={{ padding: '0.9rem 1.25rem' }}>Assigned Employee</th>
                <th style={{ padding: '0.9rem 1.25rem' }}>Department</th>
                <th style={{ padding: '0.9rem 1.25rem' }}>Branch / Location</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    Loading plant inventory...
                  </td>
                </tr>
              ) : filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3.5rem', color: '#94a3b8' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏢</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc' }}>
                      No assets found in this location
                    </div>
                    <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                      When assigning devices to users, select this location to list them here.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredAssets.map((item) => (
                  <tr key={item._id} style={{ borderBottom: '1px solid #334155' }}>
                    <td style={{ padding: '1rem 1.25rem', color: '#ffffff', fontWeight: 600 }}>
                      {item.make} {item.model}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <code style={{ backgroundColor: '#0f172a', padding: '3px 8px', borderRadius: '4px', color: '#818cf8' }}>
                        {item.sr}
                      </code>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
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
                        {item.status === 'In Use' ? '🔵 Allocated' : item.status === 'Under Maintenance' ? '🛠️ Maintenance' : '🟢 In Stock'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: '#cbd5e1' }}>
                      {item.assignedTo !== 'Unassigned' ? item.assignedTo : <span style={{ color: '#64748b' }}>Unassigned</span>}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: '#cbd5e1' }}>
                      {item.department || 'IT'}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: '#818cf8', fontWeight: 500 }}>
                      {item.location || 'Vitromed HQ'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
