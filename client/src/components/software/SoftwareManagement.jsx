import React, { useState } from 'react';
import { Layers, KeyRound, AlertTriangle, CheckCircle2, Plus, Download, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';

export default function SoftwareManagement({ software = [], onRefresh }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSoft, setNewSoft] = useState({
    softwareName: '',
    version: '1.0',
    vendor: '',
    licenseType: 'Subscription / Cloud',
    licenseKey: '',
    licenseCount: 10,
    usedLicenses: 0,
    cost: 0,
    expiryDate: '',
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.createSoftware(newSoft);
      alert('✅ Software license registered successfully!');
      setShowAddModal(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Metrics
  const totalPurchased = software.reduce((acc, s) => acc + (s.licenseCount || 0), 0);
  const totalAllocated = software.reduce((acc, s) => acc + (s.usedLicenses || 0), 0);
  const totalInvestment = software.reduce((acc, s) => acc + (s.cost || 0), 0);

  return (
    <div style={{ padding: '1.75rem 2rem 4rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#818cf8', letterSpacing: '0.05em' }}>
            SOFTWARE ASSET MANAGEMENT (SAM)
          </span>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginTop: '0.2rem' }}>
            Enterprise Software & License Portfolio
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            Monitor cloud subscriptions, perpetual keys, utilization rates, and renewal expiries.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: '#4f46e5',
            color: '#ffffff',
            border: 'none',
            padding: '0.55rem 1.1rem',
            borderRadius: '8px',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <Plus size={16} />
          <span>Add Software License</span>
        </button>
      </div>

      {/* Utilization Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div style={cardStyle}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Total License Seats</div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.3rem' }}>{totalPurchased} Seats</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>Across {software.length} licensed packages</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Active Seats Utilized</div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#34d399', marginTop: '0.3rem' }}>{totalAllocated} Active</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
            {totalPurchased > 0 ? `${Math.round((totalAllocated / totalPurchased) * 100)}% utilization rate` : '0%'}
          </div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Annual License Investment</div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.3rem' }}>₹{(totalInvestment / 100000).toFixed(2)} Lakhs</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>Verified compliance standing</div>
        </div>
      </div>

      {/* Software Inventory Table (Section 14) */}
      <div style={{ backgroundColor: '#131d36', border: '1px solid #1e293b', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#0b1329', borderBottom: '1px solid #1e293b' }}>
                <th style={thStyle}>Software Product</th>
                <th style={thStyle}>Vendor</th>
                <th style={thStyle}>License Type</th>
                <th style={thStyle}>License Key</th>
                <th style={thStyle}>Total Seats</th>
                <th style={thStyle}>Used Seats</th>
                <th style={thStyle}>Available</th>
                <th style={thStyle}>Utilization</th>
                <th style={thStyle}>Renewal Expiry</th>
              </tr>
            </thead>
            <tbody>
              {software.map((s, idx) => {
                const used = s.usedLicenses || 0;
                const total = s.licenseCount || 1;
                const available = Math.max(0, total - used);
                const pct = Math.min(100, Math.round((used / total) * 100));

                let isExpiringSoon = false;
                if (s.expiryDate) {
                  const days = Math.ceil((new Date(s.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                  if (days <= 60 && days > 0) isExpiringSoon = true;
                }

                return (
                  <tr key={s._id || idx} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#ffffff' }}>
                      <div>{s.softwareName}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>v{s.version || '1.0'}</div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#cbd5e1' }}>{s.vendor}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: '#1e293b', color: '#818cf8', fontSize: '0.75rem', fontWeight: 600 }}>
                        {s.licenseType}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', color: '#34d399', fontSize: '0.75rem' }}>
                      {s.licenseKey || 'Digital Cloud Subscription'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#f8fafc' }}>{s.licenseCount}</td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#38bdf8' }}>{used}</td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: available > 0 ? '#34d399' : '#f87171' }}>{available}</td>
                    <td style={{ padding: '0.85rem 1rem', minWidth: '130px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8', marginBottom: '3px' }}>
                        <span>{pct}%</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', backgroundColor: '#0b1329', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: pct >= 90 ? '#f87171' : '#34d399', borderRadius: '3px' }} />
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{ color: isExpiringSoon ? '#f87171' : '#cbd5e1', fontWeight: isExpiringSoon ? 700 : 500 }}>
                        {s.expiryDate ? new Date(s.expiryDate).toLocaleDateString() : 'Perpetual'}
                      </span>
                      {isExpiringSoon && <span style={{ fontSize: '0.68rem', display: 'block', color: '#f87171' }}>Expiring Soon</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Software Modal */}
      {showAddModal && (
        <div onClick={() => setShowAddModal(false)} style={overlayStyle}>
          <div onClick={(e) => e.stopPropagation()} style={modalBoxStyle}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '1.25rem' }}>
              Register Enterprise Software License
            </h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Software Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Adobe Creative Cloud Enterprise"
                  value={newSoft.softwareName}
                  onChange={(e) => setNewSoft({ ...newSoft, softwareName: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Vendor *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Adobe"
                    value={newSoft.vendor}
                    onChange={(e) => setNewSoft({ ...newSoft, vendor: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Version</label>
                  <input
                    type="text"
                    placeholder="e.g. 2024"
                    value={newSoft.version}
                    onChange={(e) => setNewSoft({ ...newSoft, version: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Total License Count *</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={newSoft.licenseCount}
                    onChange={(e) => setNewSoft({ ...newSoft, licenseCount: parseInt(e.target.value) || 1 })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>License Key / Code</label>
                  <input
                    type="text"
                    placeholder="e.g. ADOBE-CC-VIT-99"
                    value={newSoft.licenseKey}
                    onChange={(e) => setNewSoft({ ...newSoft, licenseKey: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Cost (₹)</label>
                  <input
                    type="number"
                    value={newSoft.cost}
                    onChange={(e) => setNewSoft({ ...newSoft, cost: parseInt(e.target.value) || 0 })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Expiry Date</label>
                  <input
                    type="date"
                    value={newSoft.expiryDate}
                    onChange={(e) => setNewSoft({ ...newSoft, expiryDate: e.target.value })}
                    style={{ ...inputStyle, colorScheme: 'dark' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={cancelBtnStyle}>Cancel</button>
                <button type="submit" style={submitBtnStyle}>Save Software</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const cardStyle = {
  backgroundColor: '#131d36',
  border: '1px solid #1e293b',
  borderRadius: '12px',
  padding: '1.25rem',
  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
};

const thStyle = {
  padding: '0.85rem 1rem',
  color: '#64748b',
  fontWeight: 700,
  fontSize: '0.72rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.8)',
  backdropFilter: 'blur(5px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1.5rem',
  zIndex: 999,
};

const modalBoxStyle = {
  backgroundColor: '#131d36',
  border: '1px solid #334155',
  borderRadius: '14px',
  width: '100%',
  maxWidth: '560px',
  padding: '1.75rem',
};

const labelStyle = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: '#cbd5e1',
  marginBottom: '0.35rem',
};

const inputStyle = {
  width: '100%',
  padding: '0.6rem 0.85rem',
  backgroundColor: '#070d1e',
  border: '1px solid #334155',
  borderRadius: '8px',
  color: '#f8fafc',
  fontSize: '0.85rem',
  outline: 'none',
};

const cancelBtnStyle = {
  padding: '0.55rem 1rem',
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  color: '#cbd5e1',
  borderRadius: '8px',
  fontSize: '0.82rem',
  fontWeight: 600,
  cursor: 'pointer',
};

const submitBtnStyle = {
  padding: '0.55rem 1.25rem',
  backgroundColor: '#4f46e5',
  border: 'none',
  color: '#ffffff',
  borderRadius: '8px',
  fontSize: '0.82rem',
  fontWeight: 700,
  cursor: 'pointer',
};