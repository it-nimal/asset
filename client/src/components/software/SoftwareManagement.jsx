import React, { useState } from 'react';
import {
  Layers,
  KeyRound,
  AlertTriangle,
  CheckCircle2,
  Plus,
  ShieldCheck,
  Calendar,
  X,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../common/Toast';

export default function SoftwareManagement({ software = [], onRefresh }) {
  const toast = useToast();
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
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createSoftware(newSoft);
      toast.success(`License for "${newSoft.softwareName}" registered!`, 'Software Registered');
      setShowAddModal(false);
      setNewSoft({
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
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err.message, 'Registration Failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Metrics
  const totalPurchased = software.reduce((acc, s) => acc + (s.licenseCount || 0), 0);
  const totalAllocated = software.reduce((acc, s) => acc + (s.usedLicenses || 0), 0);
  const totalInvestment = software.reduce((acc, s) => acc + (s.cost || 0), 0);

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
            Software Portfolio & License Management (SAM)
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Monitor cloud enterprise subscriptions, seat utilization ratios, renewal terms, and audit compliance.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary btn-sm"
        >
          <Plus size={14} />
          <span>Add License</span>
        </button>
      </div>

      {/* Utilization Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          marginBottom: '1.75rem',
        }}
      >
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total License Seats</div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.5rem', lineHeight: 1 }}>
            {totalPurchased} Seats
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginTop: '0.35rem' }}>
            Across {software.length} licensed packages
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Seats Utilized</div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#34d399', marginTop: '0.5rem', lineHeight: 1 }}>
            {totalAllocated} Active
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginTop: '0.35rem' }}>
            {totalPurchased > 0 ? `${Math.round((totalAllocated / totalPurchased) * 100)}% portfolio utilization` : '0%'}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Annual License Investment</div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.5rem', lineHeight: 1 }}>
            ₹{totalInvestment > 0 ? `${(totalInvestment / 100000).toFixed(2)} L` : 'Covered'}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginTop: '0.35rem' }}>
            Verified corporate standing
          </div>
        </div>
      </div>

      {/* Software Inventory Table */}
      <div className="table-container">
        <div style={{ overflowX: 'auto' }}>
          <table className="table-modern">
            <thead>
              <tr>
                <th>Software Product</th>
                <th>Vendor</th>
                <th>License Model</th>
                <th>Key / Serial</th>
                <th>Total Seats</th>
                <th>Used Seats</th>
                <th>Available</th>
                <th>Utilization</th>
                <th>Renewal Expiry</th>
              </tr>
            </thead>
            <tbody>
              {software.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <Layers size={32} color="var(--text-faint)" />
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>No Software Packages Registered</div>
                      <div style={{ color: 'var(--text-faint)', fontSize: '0.78rem' }}>
                        Click "Add License" above to register commercial software and enterprise cloud suites.
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                software.map((s, idx) => {
                  const used = s.usedLicenses || 0;
                  const total = s.licenseCount || 1;
                  const available = Math.max(0, total - used);
                  const pct = Math.min(100, Math.round((used / total) * 100));

                  let isExpiringSoon = false;
                  if (s.expiryDate) {
                    const days = Math.ceil((new Date(s.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                    if (days >= 0 && days <= 30) isExpiringSoon = true;
                  }

                  return (
                    <tr key={s._id || idx}>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{s.softwareName}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>v{s.version || '1.0'}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ color: 'var(--text-secondary)' }}>{s.vendor || 'Independent'}</span>
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: 'rgba(99, 102, 241, 0.1)',
                            color: '#a5b4fc',
                            borderColor: 'rgba(99, 102, 241, 0.25)',
                          }}
                        >
                          {s.licenseType}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {s.licenseKey ? `${s.licenseKey.substring(0, 8)}...` : 'Pre-Activated'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{total}</span>
                      </td>
                      <td>
                        <span style={{ color: '#38bdf8', fontWeight: 600 }}>{used}</span>
                      </td>
                      <td>
                        <span style={{ color: available > 0 ? '#34d399' : '#f87171', fontWeight: 600 }}>
                          {available}
                        </span>
                      </td>
                      <td style={{ minWidth: '120px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div
                            style={{
                              flex: 1,
                              height: '5px',
                              backgroundColor: 'rgba(255, 255, 255, 0.06)',
                              borderRadius: 'var(--radius-full)',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                width: `${pct}%`,
                                height: '100%',
                                backgroundColor: pct > 85 ? '#f59e0b' : '#34d399',
                                borderRadius: 'var(--radius-full)',
                              }}
                            />
                          </div>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                            {pct}%
                          </span>
                        </div>
                      </td>
                      <td>
                        {s.expiryDate ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Calendar size={12} color={isExpiringSoon ? '#fbbf24' : 'var(--text-faint)'} />
                            <span style={{ color: isExpiringSoon ? '#fbbf24' : 'var(--text-muted)', fontWeight: isExpiringSoon ? 700 : 400 }}>
                              {new Date(s.expiryDate).toLocaleDateString()}
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-faint)', fontSize: '0.75rem' }}>Perpetual</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Software Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <KeyRound size={18} color="#818cf8" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Register Software License</h3>
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
                <div className="form-group">
                  <label className="form-label">Software Name <span style={{ color: '#f87171' }}>*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Adobe Creative Cloud, Microsoft 365 E5"
                    value={newSoft.softwareName}
                    onChange={(e) => setNewSoft({ ...newSoft, softwareName: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Vendor</label>
                    <input
                      type="text"
                      placeholder="e.g. Microsoft, Adobe"
                      value={newSoft.vendor}
                      onChange={(e) => setNewSoft({ ...newSoft, vendor: e.target.value })}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Version</label>
                    <input
                      type="text"
                      placeholder="e.g. 2026, CC"
                      value={newSoft.version}
                      onChange={(e) => setNewSoft({ ...newSoft, version: e.target.value })}
                      className="form-control"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Total Purchased Seats</label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={newSoft.licenseCount}
                      onChange={(e) => setNewSoft({ ...newSoft, licenseCount: parseInt(e.target.value) || 1 })}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Renewal Expiry Date</label>
                    <input
                      type="date"
                      value={newSoft.expiryDate}
                      onChange={(e) => setNewSoft({ ...newSoft, expiryDate: e.target.value })}
                      className="form-control"
                      style={{ colorScheme: 'dark' }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">License Key or Entitlement Identifier</label>
                  <input
                    type="text"
                    placeholder="e.g. XXXXX-XXXXX-XXXXX-XXXXX"
                    value={newSoft.licenseKey}
                    onChange={(e) => setNewSoft({ ...newSoft, licenseKey: e.target.value })}
                    className="form-control"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  />
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
                  {submitting ? 'Registering...' : 'Register Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}