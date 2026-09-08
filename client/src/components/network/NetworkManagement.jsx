import React, { useState } from 'react';
import { Radio, Server, Shield, Wifi, Plus, Globe, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';

export default function NetworkManagement({ devices = [], onRefresh }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDev, setNewDev] = useState({
    hostname: '',
    deviceType: 'Switch',
    ipAddress: '',
    managementIp: '',
    macAddress: '',
    serialNumber: '',
    vendor: 'Cisco',
    model: 'Catalyst 9300',
    firmwareVersion: 'v17.9',
    location: 'Vitromed HQ - Delhi NCR',
    rack: 'Rack-A01',
    uPosition: 'U40',
    status: 'Online',
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.createNetworkDevice(newDev);
      alert('✅ Network hardware node registered!');
      setShowAddModal(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div style={{ padding: '1.75rem 2rem 4rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#818cf8', letterSpacing: '0.05em' }}>
            INFRASTRUCTURE HARDWARE (SECTION 15)
          </span>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginTop: '0.2rem' }}>
            Switches, Routers, Firewalls & HCI Racks
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            Monitor physical network switches, border gateways, Wi-Fi APs, rack U-positions, and IP mapping.
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
          <span>Add Network Device</span>
        </button>
      </div>

      {/* Network Devices Table */}
      <div style={{ backgroundColor: '#131d36', border: '1px solid #1e293b', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#0b1329', borderBottom: '1px solid #1e293b' }}>
                <th style={thStyle}>Hostname</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>IP Address</th>
                <th style={thStyle}>Management IP</th>
                <th style={thStyle}>MAC Address</th>
                <th style={thStyle}>Vendor & Model</th>
                <th style={thStyle}>Location & Facility</th>
                <th style={thStyle}>Rack / U-Pos</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((dev, idx) => (
                <tr key={dev._id || idx} style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#818cf8' }}>
                    {dev.hostname}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: '#1e293b', color: '#f8fafc', fontSize: '0.75rem', fontWeight: 600 }}>
                      {dev.deviceType}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', color: '#34d399' }}>
                    {dev.ipAddress}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', color: '#94a3b8', fontSize: '0.78rem' }}>
                    {dev.managementIp || '—'}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', color: '#94a3b8', fontSize: '0.75rem' }}>
                    {dev.macAddress || '—'}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#cbd5e1' }}>
                    <div>{dev.vendor} {dev.model}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>FW: {dev.firmwareVersion}</div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#cbd5e1' }}>
                    {dev.location}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#f8fafc', fontWeight: 600 }}>
                    <span style={{ color: '#38bdf8' }}>{dev.rack}</span> • {dev.uPosition}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span
                      style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '9999px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        backgroundColor: dev.status === 'Online' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: dev.status === 'Online' ? '#34d399' : '#f87171',
                        border: `1px solid ${dev.status === 'Online' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                      }}
                    >
                      ● {dev.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div onClick={() => setShowAddModal(false)} style={overlayStyle}>
          <div onClick={(e) => e.stopPropagation()} style={modalBoxStyle}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '1.25rem' }}>
              Register Infrastructure Hardware Node
            </h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Hostname *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. VIT-SW-CORE-02"
                    value={newDev.hostname}
                    onChange={(e) => setNewDev({ ...newDev, hostname: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Device Type</label>
                  <select
                    value={newDev.deviceType}
                    onChange={(e) => setNewDev({ ...newDev, deviceType: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="Switch">Switch</option>
                    <option value="Router">Router</option>
                    <option value="Firewall">Firewall</option>
                    <option value="Access Point">Access Point</option>
                    <option value="Server">Server</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>IP Address *</label>
                  <input
                    required
                    type="text"
                    placeholder="192.168.1.10"
                    value={newDev.ipAddress}
                    onChange={(e) => setNewDev({ ...newDev, ipAddress: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Management IP</label>
                  <input
                    type="text"
                    placeholder="10.10.1.10"
                    value={newDev.managementIp}
                    onChange={(e) => setNewDev({ ...newDev, managementIp: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Rack ID</label>
                  <input
                    type="text"
                    placeholder="Rack-A01"
                    value={newDev.rack}
                    onChange={(e) => setNewDev({ ...newDev, rack: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>U Position</label>
                  <input
                    type="text"
                    placeholder="U22"
                    value={newDev.uPosition}
                    onChange={(e) => setNewDev({ ...newDev, uPosition: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={cancelBtnStyle}>Cancel</button>
                <button type="submit" style={submitBtnStyle}>Save Node</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

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