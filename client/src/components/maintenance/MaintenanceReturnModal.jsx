import React, { useState } from 'react';
import { ArrowLeftRight, X, AlertTriangle, Package, UserCheck, Trash2 } from 'lucide-react';
import { api } from '../../services/api';

export default function MaintenanceReturnModal({ isOpen, onClose, ticket, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [disposition, setDisposition] = useState(
    ticket?.employeeName ? 'Return to Employee' : 'Return to Stock'
  );
  const [serviceNotes, setServiceNotes] = useState(ticket?.serviceNotes || '');
  const [repairCost, setRepairCost] = useState(ticket?.repairCost || 0);

  if (!isOpen || !ticket) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.completeMaintenance(ticket._id, {
        finalDisposition: disposition,
        serviceNotes,
        repairCost: Number(repairCost) || 0,
        actorName: 'IT Admin',
      });
      if (onSuccess) onSuccess(res.data);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to complete maintenance return');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 110 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '560px', width: '95vw' }}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(13, 148, 136, 0.12)',
                color: '#0d9488',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ArrowLeftRight size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Maintenance Return & Disposition
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                Restore equipment to custodian, central stock, or decommission
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-icon btn-xs">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                <AlertTriangle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Equipment Recap */}
            <div
              style={{
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-default)',
                fontSize: '0.78rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Equipment:</span>
                <strong style={{ color: 'var(--text-primary)' }}>
                  {ticket.assetMake} {ticket.assetModel} ({ticket.assetTag || ticket.assetSerial})
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Original Custodian:</span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {ticket.employeeName || 'Unassigned (Central Stock)'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>QC Evaluation:</span>
                <span style={{ color: '#0d9488', fontWeight: 700 }}>
                  {ticket.qcResult || 'Passed & Ready'}
                </span>
              </div>
            </div>

            {/* Disposition Selector */}
            <div>
              <label className="form-label" style={{ fontWeight: 700, marginBottom: '0.45rem' }}>
                Final Disposition Action <span style={{ color: '#ef4444' }}>*</span>
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {ticket.employeeName && (
                  <div
                    onClick={() => setDisposition('Return to Employee')}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-lg)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease',
                      backgroundColor:
                        disposition === 'Return to Employee'
                          ? 'rgba(13, 148, 136, 0.08)'
                          : 'var(--bg-canvas)',
                      border:
                        disposition === 'Return to Employee'
                          ? '2px solid #0d9488'
                          : '1px solid var(--border-default)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <UserCheck size={18} color="#0d9488" />
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          Return to {ticket.employeeName}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Restores asset status to "Assigned" under custodian
                        </div>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="disposition"
                      checked={disposition === 'Return to Employee'}
                      onChange={() => setDisposition('Return to Employee')}
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                )}

                <div
                  onClick={() => setDisposition('Return to Stock')}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-lg)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease',
                    backgroundColor:
                      disposition === 'Return to Stock'
                        ? 'rgba(59, 130, 246, 0.08)'
                        : 'var(--bg-canvas)',
                    border:
                      disposition === 'Return to Stock'
                        ? '2px solid #3b82f6'
                        : '1px solid var(--border-default)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <Package size={18} color="#3b82f6" />
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Return to Central Stock (Available)
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Unlinks custodian; makes asset available for future allocations
                      </div>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="disposition"
                    checked={disposition === 'Return to Stock'}
                    onChange={() => setDisposition('Return to Stock')}
                    style={{ cursor: 'pointer' }}
                  />
                </div>

                <div
                  onClick={() => setDisposition('Retire')}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-lg)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease',
                    backgroundColor:
                      disposition === 'Retire'
                        ? 'rgba(239, 68, 68, 0.08)'
                        : 'var(--bg-canvas)',
                    border:
                      disposition === 'Retire'
                        ? '2px solid #ef4444'
                        : '1px solid var(--border-default)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <Trash2 size={18} color="#ef4444" />
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Retire / Decommission Asset
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Permanently mark hardware as Retired / Scrapped
                      </div>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="disposition"
                    checked={disposition === 'Retire'}
                    onChange={() => setDisposition('Retire')}
                    style={{ cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>

            {/* Cost & Service Notes */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              <div>
                <label className="form-label" style={{ fontWeight: 600, marginBottom: '0.35rem' }}>
                  Total Repair Cost (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={repairCost}
                  onChange={(e) => setRepairCost(e.target.value)}
                  placeholder="0"
                  className="form-input"
                  style={{ fontSize: '0.8rem' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 600, marginBottom: '0.35rem' }}>
                  Service Completion Notes
                </label>
                <input
                  type="text"
                  value={serviceNotes}
                  onChange={(e) => setServiceNotes(e.target.value)}
                  placeholder="e.g. Battery replaced, burn-in tested"
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
              disabled={loading}
              className="btn btn-primary btn-sm"
              style={{
                backgroundColor: '#0d9488',
                borderColor: '#0d9488',
                color: '#ffffff',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              {loading ? 'Completing...' : 'Complete & Return Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
