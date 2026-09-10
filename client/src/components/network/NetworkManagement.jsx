import React, { useState } from 'react';
import {
  Radio,
  Server,
  Shield,
  Plus,
  CheckCircle2,
  X,
  MapPin,
  Layers,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../common/Toast';

export default function NetworkManagement({ devices = [], onRefresh }) {
  const toast = useToast();
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
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createNetworkDevice(newDev);
      toast.success(`Network node "${newDev.hostname}" registered!`, 'Network Device Added');
      setShowAddModal(false);
      setNewDev({
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
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err.message, 'Registration Failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '1.5rem 2rem 4rem', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.75rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Infrastructure Hardware & Network Racks
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Enterprise switches, border firewalls, Wi-Fi access points, rack unit positions, and IP bindings.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary btn-sm"
        >
          <Plus size={14} />
          <span>Add Network Node</span>
        </button>
      </div>

      {/* Network Devices Table */}
      <div className="table-container">
        <div style={{ overflowX: 'auto' }}>
          <table className="table-modern">
            <thead>
              <tr>
                <th>Hostname</th>
                <th>Device Type</th>
                <th>IP Address</th>
                <th>Management IP</th>
                <th>MAC Address</th>
                <th>Vendor & Model</th>
                <th>Facility & Plant</th>
                <th>Rack / Slot</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {devices.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <Radio size={32} color="var(--text-faint)" />
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>No Network Nodes Registered</div>
                      <div style={{ color: 'var(--text-faint)', fontSize: '0.78rem' }}>
                        Register core switches, firewalls, and server rack gear using "+ Add Network Node".
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                devices.map((dev, idx) => (
                  <tr key={dev._id || idx}>
                    <td>
                      <span style={{ fontWeight: 700, color: '#818cf8', fontFamily: 'var(--font-mono)' }}>
                        {dev.hostname}
                      </span>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {dev.deviceType}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', color: '#34d399', fontWeight: 600, fontSize: '0.78rem' }}>
                        {dev.ipAddress}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        {dev.managementIp || '—'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-faint)', fontSize: '0.72rem' }}>
                        {dev.macAddress || '—'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {dev.vendor} {dev.model}
                        </span>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)' }}>
                          FW: {dev.firmwareVersion || 'Latest'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-secondary)' }}>{dev.location}</span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          padding: '0.15rem 0.45rem',
                          borderRadius: 'var(--radius-xs)',
                          backgroundColor: 'rgba(56, 189, 248, 0.1)',
                          color: '#38bdf8',
                          fontWeight: 700,
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {dev.rack} / {dev.uPosition}
                      </span>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: dev.status === 'Online' ? 'var(--status-available-bg)' : 'var(--status-lost-bg)',
                          color: dev.status === 'Online' ? 'var(--status-available-text)' : 'var(--status-lost-text)',
                          border: `1px solid ${dev.status === 'Online' ? 'var(--status-available-border)' : 'var(--status-lost-border)'}`,
                        }}
                      >
                        {dev.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Network Node Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Radio size={18} color="#818cf8" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Register Network Infrastructure Node</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="btn btn-ghost btn-icon btn-xs"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Hostname <span style={{ color: '#f87171' }}>*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SW-CORE-01"
                      value={newDev.hostname}
                      onChange={(e) => setNewDev({ ...newDev, hostname: e.target.value })}
                      className="form-control"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Node Type</label>
                    <select
                      value={newDev.deviceType}
                      onChange={(e) => setNewDev({ ...newDev, deviceType: e.target.value })}
                      className="form-select"
                    >
                      <option value="Switch">Switch (L2/L3)</option>
                      <option value="Router">Border Gateway / Router</option>
                      <option value="Firewall">UTM Firewall</option>
                      <option value="Access Point">Wi-Fi Access Point</option>
                      <option value="Server Rack">HCI Rack Enclosure</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Production IP Address <span style={{ color: '#f87171' }}>*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="192.168.1.1"
                      value={newDev.ipAddress}
                      onChange={(e) => setNewDev({ ...newDev, ipAddress: e.target.value })}
                      className="form-control"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Management / OOB IP</label>
                    <input
                      type="text"
                      placeholder="10.0.0.1"
                      value={newDev.managementIp}
                      onChange={(e) => setNewDev({ ...newDev, managementIp: e.target.value })}
                      className="form-control"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Vendor</label>
                    <input
                      type="text"
                      value={newDev.vendor}
                      onChange={(e) => setNewDev({ ...newDev, vendor: e.target.value })}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Model</label>
                    <input
                      type="text"
                      value={newDev.model}
                      onChange={(e) => setNewDev({ ...newDev, model: e.target.value })}
                      className="form-control"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Rack Identifier</label>
                    <input
                      type="text"
                      placeholder="Rack-A01"
                      value={newDev.rack}
                      onChange={(e) => setNewDev({ ...newDev, rack: e.target.value })}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">U-Position Slot</label>
                    <input
                      type="text"
                      placeholder="U40"
                      value={newDev.uPosition}
                      onChange={(e) => setNewDev({ ...newDev, uPosition: e.target.value })}
                      className="form-control"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-outline btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary btn-sm"
                >
                  {submitting ? 'Registering...' : 'Confirm Node'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}