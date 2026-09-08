import React, { useState } from 'react';
import { api } from '../services/api';

export default function MaintenanceTracker({ assets, onRefresh, loading }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [serviceData, setServiceData] = useState({
    maintenanceNotes: '',
    serviceVendor: '',
    repairCost: 0,
    maintenanceStartDate: new Date().toISOString().split('T')[0],
  });
  const [submitting, setSubmitting] = useState(false);

  // Filter maintenance assets
  const maintenanceAssets = assets.filter((item) => item.status === 'Under Maintenance');
  const availableOrInUseAssets = assets.filter((item) => item.status !== 'Under Maintenance');

  // Open modal to log maintenance
  const handleOpenMaintenanceModal = (asset) => {
    setSelectedAsset(asset);
    setServiceData({
      maintenanceNotes: asset.maintenanceNotes || '',
      serviceVendor: asset.serviceVendor || 'Dell Authorized Service Center',
      repairCost: asset.repairCost || 0,
      maintenanceStartDate: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  // Submit maintenance log
  const handleConfirmMaintenance = async (e) => {
    e.preventDefault();
    if (!selectedAsset) return;
    setSubmitting(true);

    try {
      await api.updateAsset(selectedAsset._id, {
        status: 'Under Maintenance',
        maintenanceNotes: serviceData.maintenanceNotes,
        serviceVendor: serviceData.serviceVendor,
        repairCost: parseFloat(serviceData.repairCost) || 0,
        maintenanceStartDate: serviceData.maintenanceStartDate,
      });

      setIsModalOpen(false);
      setSelectedAsset(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(`Maintenance log failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Mark Repaired & Return to Stock
  const handleMarkRepaired = async (asset) => {
    if (!window.confirm(`Mark "${asset.make} ${asset.model}" as Repaired and return to available stock?`)) return;

    try {
      await api.updateAsset(asset._id, {
        status: 'Available',
        assignedTo: 'Unassigned',
        employeeId: '',
        maintenanceNotes: `Repaired on ${new Date().toLocaleDateString()}: ${asset.maintenanceNotes || ''}`,
      });

      if (onRefresh) onRefresh();
    } catch (err) {
      alert(`Status update failed: ${err.message}`);
    }
  };

  // Filtered maintenance list
  const filteredList = maintenanceAssets.filter((item) => {
    return (
      (item.make || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.model || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.sr || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.serviceVendor || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.maintenanceNotes || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div style={{ maxWidth: '1250px', margin: '2rem auto 5rem', padding: '0 1.5rem' }}>
      {/* Overview Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2.5rem',
        }}
      >
        <div style={statBoxStyle}>
          <div style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: 600, textTransform: 'uppercase' }}>
            🛠️ Active Repairs
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', marginTop: '0.3rem' }}>
            {maintenanceAssets.length}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            Devices currently under service
          </div>
        </div>

        <div style={statBoxStyle}>
          <div style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 600, textTransform: 'uppercase' }}>
            📦 Healthy Devices
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', marginTop: '0.3rem' }}>
            {availableOrInUseAssets.length}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            Active in stock or assigned
          </div>
        </div>

        <div style={statBoxStyle}>
          <div style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 600, textTransform: 'uppercase' }}>
            🏢 Service Vendors
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', marginTop: '0.3rem' }}>
            3 Partners
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            Authorized warranty providers
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div
        style={{
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 20px 35px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Header & Controls */}
        <div
          style={{
            padding: '1.75rem 2rem',
            borderBottom: '1px solid #334155',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.25rem',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                color: '#fbbf24',
                letterSpacing: '0.05em',
              }}
            >
              Hardware Repair & IT Maintenance Log
            </span>
            <h2 style={{ fontSize: '1.5rem', color: '#ffffff', fontWeight: 700, marginTop: '0.2rem' }}>
              🛠️ Devices Under Service ({filteredList.length})
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="🔍 Search repairs, vendor, SR..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={inputStyle}
            />

            {/* Quick Send to Maintenance Button */}
            {availableOrInUseAssets.length > 0 && (
              <button
                onClick={() => handleOpenMaintenanceModal(availableOrInUseAssets[0])}
                style={{
                  padding: '0.6rem 1.25rem',
                  backgroundColor: '#f59e0b',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 10px rgba(245, 158, 11, 0.3)',
                }}
              >
                ➕ Log New Repair
              </button>
            )}
          </div>
        </div>

        {/* Maintenance Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', color: '#94a3b8', borderBottom: '1px solid #334155' }}>
                <th style={{ padding: '1rem 1.25rem' }}>Device Details</th>
                <th style={{ padding: '1rem 1.25rem' }}>Serial No (SR)</th>
                <th style={{ padding: '1rem 1.25rem' }}>Issue Description</th>
                <th style={{ padding: '1rem 1.25rem' }}>Service Vendor</th>
                <th style={{ padding: '1rem 1.25rem' }}>Sent Date</th>
                <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3.5rem', color: '#94a3b8' }}>
                    Loading maintenance logs...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '4rem 1rem', color: '#94a3b8' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✅</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 600, color: '#f8fafc' }}>
                      All IT Devices are Operating Normally!
                    </div>
                    <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                      No hardware is currently marked under maintenance.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr key={item._id} style={{ borderBottom: '1px solid #334155' }}>
                    <td style={{ padding: '1.1rem 1.25rem' }}>
                      <div style={{ color: '#ffffff', fontWeight: 600 }}>
                        {item.make} {item.model}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#fbbf24', marginTop: '2px' }}>
                        🛠️ Under Service
                      </div>
                    </td>

                    <td style={{ padding: '1.1rem 1.25rem' }}>
                      <code style={{ backgroundColor: '#0f172a', padding: '3px 8px', borderRadius: '4px', color: '#818cf8', fontWeight: 600 }}>
                        {item.sr}
                      </code>
                    </td>

                    <td style={{ padding: '1.1rem 1.25rem', color: '#f8fafc', maxWidth: '300px' }}>
                      {item.maintenanceNotes || 'General hardware diagnosis & service'}
                    </td>

                    <td style={{ padding: '1.1rem 1.25rem', color: '#cbd5e1' }}>
                      {item.serviceVendor || 'Authorized Service'}
                      {item.repairCost > 0 && (
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Est. Cost: ${item.repairCost}</div>
                      )}
                    </td>

                    <td style={{ padding: '1.1rem 1.25rem', color: '#cbd5e1' }}>
                      {item.maintenanceStartDate ? new Date(item.maintenanceStartDate).toLocaleDateString() : 'Recent'}
                    </td>

                    <td style={{ padding: '1.1rem 1.25rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleMarkRepaired(item)}
                        style={{
                          backgroundColor: 'rgba(16, 185, 129, 0.15)',
                          color: '#34d399',
                          border: '1px solid rgba(16, 185, 129, 0.4)',
                          padding: '0.45rem 0.9rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                        }}
                      >
                        ✅ Repaired (Back to Stock)
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Maintenance Modal */}
      {isModalOpen && selectedAsset && (
        <div
          onClick={() => setIsModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '560px',
              padding: '2rem',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', color: '#ffffff', fontWeight: 700 }}>
                  🛠️ Log IT Device for Repair
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#fbbf24', marginTop: '2px' }}>
                  {selectedAsset.make} {selectedAsset.model} • SR: {selectedAsset.sr}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmMaintenance}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Select Asset */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={labelStyle}>Select Hardware Device to Send</label>
                  <select
                    value={selectedAsset._id}
                    onChange={(e) => {
                      const found = assets.find((a) => a._id === e.target.value);
                      if (found) setSelectedAsset(found);
                    }}
                    style={modalInputStyle}
                  >
                    {availableOrInUseAssets.map((a) => (
                      <option key={a._id} value={a._id}>
                        {a.make} {a.model} (SR: {a.sr}) - {a.status}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fault Issue Description */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={labelStyle}>Issue / Fault Description <span style={{ color: '#f87171' }}>*</span></label>
                  <textarea
                    required
                    rows="3"
                    placeholder="e.g. Display screen flickering, battery health below 50%, keyboard keys not responding"
                    value={serviceData.maintenanceNotes}
                    onChange={(e) => setServiceData({ ...serviceData, maintenanceNotes: e.target.value })}
                    style={modalInputStyle}
                  ></textarea>
                </div>

                {/* Service Vendor */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={labelStyle}>Service Center / Vendor Name <span style={{ color: '#f87171' }}>*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dell Official Service Center, Local IT Hardware Partner"
                    value={serviceData.serviceVendor}
                    onChange={(e) => setServiceData({ ...serviceData, serviceVendor: e.target.value })}
                    style={modalInputStyle}
                  />
                </div>

                {/* Estimated Repair Cost */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={labelStyle}>Estimated Repair Cost ($ / ₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 150"
                    value={serviceData.repairCost}
                    onChange={(e) => setServiceData({ ...serviceData, repairCost: e.target.value })}
                    style={modalInputStyle}
                  />
                </div>
              </div>

              <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '0.65rem 1.25rem',
                    backgroundColor: '#334155',
                    color: '#cbd5e1',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '0.65rem 1.75rem',
                    backgroundColor: '#f59e0b',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
                  }}
                >
                  {submitting ? 'Logging...' : '🛠️ Confirm Repair Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const statBoxStyle = {
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '14px',
  padding: '1.5rem',
  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
};

const labelStyle = {
  fontSize: '0.85rem',
  fontWeight: 600,
  color: '#cbd5e1',
};

const inputStyle = {
  backgroundColor: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '8px',
  padding: '0.55rem 1rem',
  color: '#f8fafc',
  fontSize: '0.85rem',
  minWidth: '240px',
  outline: 'none',
};

const modalInputStyle = {
  backgroundColor: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '8px',
  padding: '0.7rem 1rem',
  color: '#f8fafc',
  fontSize: '0.9rem',
  outline: 'none',
};
