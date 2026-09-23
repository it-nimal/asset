import React, { useState, useEffect } from 'react';
import {
  Wrench,
  X,
  AlertTriangle,
  Search,
  User,
  Laptop,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../../services/api';

export default function MaintenanceForm({ isOpen, onClose, onSuccess, initialAsset = null }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [assets, setAssets] = useState([]);
  const [searchAsset, setSearchAsset] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(initialAsset);
  const [vendors, setVendors] = useState([]);

  const [formData, setFormData] = useState({
    issueDescription: '',
    issueCategory: 'Hardware',
    priority: 'Medium',
    reportedBy: 'IT Staff',
    repairType: 'Internal IT Repair',
    vendor: '',
    warrantyStatus: 'In Warranty',
    expectedReturnDate: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
      if (initialAsset) {
        setSelectedAsset(initialAsset);
      }
    }
  }, [isOpen, initialAsset]);

  const loadInitialData = async () => {
    try {
      const [assetsRes, vendorsRes] = await Promise.all([
        api.getAssets ? api.getAssets() : [],
        api.getVendors ? api.getVendors() : [],
      ]);
      setAssets(Array.isArray(assetsRes) ? assetsRes : (assetsRes?.data || []));
      setVendors(Array.isArray(vendorsRes) ? vendorsRes : (vendorsRes?.data || []));
    } catch (err) {
      console.error('Failed to load asset list for maintenance:', err);
    }
  };

  if (!isOpen) return null;

  const filteredAssets = assets.filter((a) => {
    if (a.status === 'Under Maintenance' || a.status === 'Retired' || a.status === 'Disposed') return false;
    if (!searchAsset) return true;
    const q = searchAsset.toLowerCase();
    return (
      (a.assetNo && a.assetNo.toLowerCase().includes(q)) ||
      (a.sr && a.sr.toLowerCase().includes(q)) ||
      (a.make && a.make.toLowerCase().includes(q)) ||
      (a.model && a.model.toLowerCase().includes(q)) ||
      (a.userName && a.userName.toLowerCase().includes(q))
    );
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAsset) {
      setError('Please select an asset to log maintenance for.');
      return;
    }
    if (!formData.issueDescription.trim()) {
      setError('Please provide a detailed issue description.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        assetId: selectedAsset._id,
        issueDescription: formData.issueDescription,
        issueCategory: formData.issueCategory,
        priority: formData.priority,
        reportedBy: formData.reportedBy,
        repairType: formData.repairType,
        vendor: formData.vendor,
        serviceVendor: formData.vendor,
        warrantyStatus: formData.warrantyStatus,
        expectedReturnDate: formData.expectedReturnDate || undefined,
        employeeName: selectedAsset.userName !== 'Unassigned' ? selectedAsset.userName : '',
        empCode: selectedAsset.empCode || '',
        department: selectedAsset.department || '',
      };

      const res = await api.createMaintenance(payload);
      if (onSuccess) onSuccess(res.data);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit maintenance request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 100 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px', width: '95vw' }}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                color: '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Wrench size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Log Maintenance Request
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                Initiate equipment repair & service workflow
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-icon btn-xs">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {error && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  color: '#ef4444',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <AlertTriangle size={16} style={{ shrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {/* Asset Selection */}
            <div>
              <label className="form-label" style={{ fontWeight: 700, marginBottom: '0.35rem' }}>
                Target Equipment <span style={{ color: '#ef4444' }}>*</span>
              </label>

              {selectedAsset ? (
                <div
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-surface)',
                        color: '#f59e0b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid var(--border-default)',
                      }}
                    >
                      <Laptop size={18} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                          {selectedAsset.make} {selectedAsset.model}
                        </span>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            padding: '0.1rem 0.4rem',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--bg-canvas)',
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-default)',
                          }}
                        >
                          {selectedAsset.assetNo || selectedAsset.sr}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.2rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <User size={12} />
                          Custodian: <strong style={{ color: 'var(--text-primary)' }}>{selectedAsset.userName || 'Unassigned'}</strong>
                        </span>
                        {selectedAsset.department && <span>Dept: {selectedAsset.department}</span>}
                      </div>
                    </div>
                  </div>

                  {!initialAsset && (
                    <button
                      type="button"
                      onClick={() => setSelectedAsset(null)}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '0.75rem',
                        color: '#f59e0b',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textDecoration: 'underline',
                      }}
                    >
                      Change
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ position: 'relative' }}>
                    <Search
                      size={14}
                      style={{
                        position: 'absolute',
                        left: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                      }}
                    />
                    <input
                      type="text"
                      value={searchAsset}
                      onChange={(e) => setSearchAsset(e.target.value)}
                      placeholder="Search by Asset Tag, Serial, Model, Custodian..."
                      className="form-input"
                      style={{ paddingLeft: '2.2rem', paddingRight: searchAsset ? '2rem' : '0.75rem', fontSize: '0.8rem' }}
                    />
                    {searchAsset && (
                      <button
                        type="button"
                        onClick={() => setSearchAsset('')}
                        style={{
                          position: 'absolute',
                          right: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-faint)',
                          padding: '3px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '4px',
                        }}
                        title="Clear search"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  <div
                    style={{
                      maxHeight: '160px',
                      overflowY: 'auto',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-default)',
                      backgroundColor: 'var(--bg-canvas)',
                    }}
                  >
                    {filteredAssets.length === 0 ? (
                      <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        No eligible assets found.
                      </div>
                    ) : (
                      filteredAssets.slice(0, 15).map((a) => (
                        <div
                          key={a._id}
                          onClick={() => setSelectedAsset(a)}
                          style={{
                            padding: '0.6rem 0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderBottom: '1px solid var(--border-subtle)',
                            cursor: 'pointer',
                            transition: 'background-color 0.15s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span>{a.make} {a.model}</span>
                              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-surface)', padding: '0.1rem 0.35rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
                                {a.assetNo || a.sr}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                              Custodian: {a.userName || 'Unassigned'} • {a.department || 'Vitromed'}
                            </div>
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f59e0b' }}>
                            Select
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Category & Priority */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
              <div>
                <label className="form-label" style={{ fontWeight: 600, marginBottom: '0.35rem' }}>
                  Issue Category <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={formData.issueCategory}
                  onChange={(e) => setFormData({ ...formData, issueCategory: e.target.value })}
                  className="form-select"
                  style={{ fontSize: '0.8rem' }}
                >
                  <option value="Hardware">Hardware Fault</option>
                  <option value="Software">Software / OS Issue</option>
                  <option value="Network">Network / WiFi</option>
                  <option value="Power">Power / Battery / Adapter</option>
                  <option value="Physical Damage">Physical Screen / Body Damage</option>
                  <option value="Performance">Performance / Overheating</option>
                  <option value="Other">Other Maintenance</option>
                </select>
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 600, marginBottom: '0.35rem' }}>
                  Priority Level <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="form-select"
                  style={{ fontSize: '0.8rem' }}
                >
                  <option value="Low">Low - Minor issue / Workable</option>
                  <option value="Medium">Medium - Normal workflow affected</option>
                  <option value="High">High - Critical / Work blocked</option>
                </select>
              </div>
            </div>

            {/* Issue Description */}
            <div>
              <label className="form-label" style={{ fontWeight: 600, marginBottom: '0.35rem' }}>
                Issue Symptoms & Description <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                rows={3}
                value={formData.issueDescription}
                onChange={(e) => setFormData({ ...formData, issueDescription: e.target.value })}
                placeholder="Describe the exact fault, error messages, broken parts, or observed behavior..."
                className="form-input"
                style={{ fontSize: '0.8rem', resize: 'vertical' }}
              />
            </div>

            {/* Repair Pathway & Vendor */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
              <div>
                <label className="form-label" style={{ fontWeight: 600, marginBottom: '0.35rem' }}>
                  Repair Pathway
                </label>
                <select
                  value={formData.repairType}
                  onChange={(e) => setFormData({ ...formData, repairType: e.target.value })}
                  className="form-select"
                  style={{ fontSize: '0.8rem' }}
                >
                  <option value="Internal IT Repair">Internal IT Support</option>
                  <option value="Vendor Repair">External Vendor Service</option>
                  <option value="Warranty Repair">OEM / Brand Warranty Claim</option>
                  <option value="Replacement">Equipment Replacement</option>
                </select>
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 600, marginBottom: '0.35rem' }}>
                  Service Vendor / Partner
                </label>
                <input
                  type="text"
                  list="maintenance-vendor-options"
                  value={formData.vendor}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  placeholder="e.g. Dell Support, Central IT..."
                  className="form-input"
                  style={{ fontSize: '0.8rem' }}
                />
                <datalist id="maintenance-vendor-options">
                  {vendors.map((v) => (
                    <option key={v._id || v.name} value={v.name} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Reported By & Expected Return */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
              <div>
                <label className="form-label" style={{ fontWeight: 600, marginBottom: '0.35rem' }}>
                  Reported By (Technician / Custodian)
                </label>
                <input
                  type="text"
                  value={formData.reportedBy}
                  onChange={(e) => setFormData({ ...formData, reportedBy: e.target.value })}
                  className="form-input"
                  style={{ fontSize: '0.8rem' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 600, marginBottom: '0.35rem' }}>
                  Target Completion Date
                </label>
                <input
                  type="date"
                  value={formData.expectedReturnDate}
                  onChange={(e) => setFormData({ ...formData, expectedReturnDate: e.target.value })}
                  className="form-input"
                  style={{ fontSize: '0.8rem' }}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-outline btn-sm">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedAsset}
              className="btn btn-primary btn-sm"
              style={{
                backgroundColor: '#f59e0b',
                borderColor: '#f59e0b',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontWeight: 700,
              }}
            >
              {loading ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Initiate Maintenance</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
