import React, { useState } from 'react';
import {
  Wrench,
  CheckCircle2,
  Building2,
  Clock,
  Plus,
  DollarSign,
  Search,
  AlertCircle,
  X,
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from './common/Toast';

export default function MaintenanceTracker({ assets = [], onRefresh, loading }) {
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [serviceData, setServiceData] = useState({
    maintenanceNotes: '',
    serviceVendor: 'Dell Authorized Service Center',
    repairCost: 0,
    maintenanceStartDate: new Date().toISOString().split('T')[0],
  });
  const [submitting, setSubmitting] = useState(false);

  // Filter lists
  const maintenanceAssets = assets.filter((item) => item.status === 'Under Maintenance');
  const availableOrInUseAssets = assets.filter((item) => item.status !== 'Under Maintenance');

  // Open modal
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

      toast.success(
        `Service ticket logged for "${selectedAsset.make} ${selectedAsset.model}".`,
        'Under Maintenance'
      );
      setIsModalOpen(false);
      setSelectedAsset(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err.message, 'Maintenance Log Failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Mark Repaired
  const handleMarkRepaired = async (asset) => {
    if (!window.confirm(`Mark "${asset.make} ${asset.model}" as Repaired and return to available stock?`)) return;

    try {
      await api.updateAsset(asset._id, {
        status: 'Available',
        userName: 'Unassigned',
        empCode: '',
        maintenanceNotes: `Repaired on ${new Date().toLocaleDateString()}: ${asset.maintenanceNotes || ''}`,
      });

      toast.success(`"${asset.make} ${asset.model}" marked repaired and returned to stock!`);
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err.message, 'Update Failed');
    }
  };

  const filteredList = maintenanceAssets.filter((item) => {
    const q = searchTerm.toLowerCase();
    return (
      (item.make || '').toLowerCase().includes(q) ||
      (item.model || '').toLowerCase().includes(q) ||
      (item.sr || '').toLowerCase().includes(q) ||
      (item.serviceVendor || '').toLowerCase().includes(q) ||
      (item.maintenanceNotes || '').toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ padding: '1.5rem 2rem 4rem', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Maintenance & Service Tracker
        </h1>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          Track hardware repairs, warranty partner service center tickets, and turnaround resolution times.
        </p>
      </div>

      {/* KPI Metric Boxes */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          marginBottom: '1.75rem',
        }}
      >
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Active Repairs
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Wrench size={16} color="#fbbf24" />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fbbf24', marginTop: '0.75rem', lineHeight: 1 }}>
            {maintenanceAssets.length}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginTop: '0.35rem' }}>
            Devices under repair
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Operational Fleet
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={16} color="#34d399" />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#34d399', marginTop: '0.75rem', lineHeight: 1 }}>
            {availableOrInUseAssets.length}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginTop: '0.35rem' }}>
            Healthy systems in service
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Service Centers
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(99, 102, 241, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Building2 size={16} color="#818cf8" />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#818cf8', marginTop: '0.75rem', lineHeight: 1 }}>
            3 Partners
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginTop: '0.35rem' }}>
            Authorized OEM vendors
          </div>
        </div>
      </div>

      {/* Main Repair Tickets Table */}
      <div className="table-container">
        {/* Table Search & Filter Header */}
        <div
          style={{
            padding: '0.85rem 1.25rem',
            borderBottom: '1px solid var(--border-default)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
            backgroundColor: 'rgba(9, 15, 26, 0.4)',
          }}
        >
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
            <input
              type="text"
              placeholder="Search repair tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '2rem', height: '32px', fontSize: '0.78rem' }}
            />
          </div>

          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Showing <strong>{filteredList.length}</strong> active repair tickets
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table-modern">
            <thead>
              <tr>
                <th>Asset / Serial No</th>
                <th>Hardware Model</th>
                <th>Service Center Vendor</th>
                <th>Diagnosis & Issue Notes</th>
                <th>Repair Cost</th>
                <th>Date Initiated</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle2 size={32} color="#34d399" style={{ opacity: 0.8 }} />
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        All Equipment Healthy
                      </div>
                      <div style={{ color: 'var(--text-faint)', fontSize: '0.78rem' }}>
                        No hardware assets currently marked under maintenance or service.
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredList.map((asset) => (
                  <tr key={asset._id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#818cf8' }}>
                          {asset.assetNo || 'AST-N/A'}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>
                          S/N: {asset.sr}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {asset.make} {asset.model}
                      </span>
                    </td>

                    <td>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {asset.serviceVendor || 'Authorized Service Partner'}
                      </span>
                    </td>

                    <td style={{ maxWidth: '280px' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                        {asset.maintenanceNotes || 'Routine diagnostic inspection'}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontWeight: 700, color: '#fbbf24', fontVariantNumeric: 'tabular-nums' }}>
                        ₹{(asset.repairCost || 0).toLocaleString()}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        <Clock size={12} />
                        <span>{asset.maintenanceStartDate ? new Date(asset.maintenanceStartDate).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => handleMarkRepaired(asset)}
                        className="btn btn-outline btn-xs"
                        style={{ color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.3)' }}
                      >
                        <CheckCircle2 size={13} />
                        <span>Mark Repaired</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Service Log Modal */}
      {isModalOpen && selectedAsset && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Wrench size={18} color="#fbbf24" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Log Maintenance Ticket</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="btn btn-ghost btn-icon btn-xs"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleConfirmMaintenance}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ padding: '0.65rem 0.85rem', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontWeight: 600 }}>{selectedAsset.make} {selectedAsset.model}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Tag: {selectedAsset.assetNo} • S/N: {selectedAsset.sr}</div>
                </div>

                <div className="form-group">
                  <label className="form-label">Service Vendor / Partner</label>
                  <input
                    type="text"
                    required
                    value={serviceData.serviceVendor}
                    onChange={(e) => setServiceData({ ...serviceData, serviceVendor: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Diagnostic Notes & Issue Description</label>
                  <textarea
                    rows={3}
                    required
                    value={serviceData.maintenanceNotes}
                    onChange={(e) => setServiceData({ ...serviceData, maintenanceNotes: e.target.value })}
                    className="form-control"
                    placeholder="e.g. Battery replacement and motherboard diagnostic"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Estimated Cost (₹)</label>
                    <input
                      type="number"
                      value={serviceData.repairCost}
                      onChange={(e) => setServiceData({ ...serviceData, repairCost: e.target.value })}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Dispatch Date</label>
                    <input
                      type="date"
                      value={serviceData.maintenanceStartDate}
                      onChange={(e) => setServiceData({ ...serviceData, maintenanceStartDate: e.target.value })}
                      className="form-control"
                      style={{ colorScheme: 'dark' }}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-outline btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary btn-sm"
                >
                  {submitting ? 'Saving...' : 'Confirm Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
