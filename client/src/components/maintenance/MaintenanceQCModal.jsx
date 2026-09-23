import React, { useState } from 'react';
import { CheckCircle2, XCircle, X, AlertTriangle, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';

export default function MaintenanceQCModal({ isOpen, onClose, ticket, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [qcResult, setQcResult] = useState('Passed');
  const [qcNotes, setQcNotes] = useState('');
  const [qcBy, setQcBy] = useState('QC Engineer');

  if (!isOpen || !ticket) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.qcMaintenance(ticket._id, {
        qcResult,
        qcNotes,
        qcBy,
      });
      if (onSuccess) onSuccess(res.data);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit QC evaluation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 110 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '540px', width: '95vw' }}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(168, 85, 247, 0.12)',
                color: '#a855f7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Quality Control (QC) Inspection
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                Validate hardware repair & testing before return
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

            {/* Ticket Summary Card */}
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
                <span style={{ color: 'var(--text-muted)' }}>Ticket ID:</span>
                <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                  {ticket.maintenanceId}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Equipment:</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                  {ticket.assetMake} {ticket.assetModel} ({ticket.assetTag || ticket.assetSerial})
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Fault Reported:</span>
                <span style={{ color: 'var(--text-secondary)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ticket.issueDescription}
                </span>
              </div>
            </div>

            {/* Pass / Fail Selection */}
            <div>
              <label className="form-label" style={{ fontWeight: 700, marginBottom: '0.45rem' }}>
                QC Evaluation Outcome <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setQcResult('Passed')}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    backgroundColor:
                      qcResult === 'Passed'
                        ? 'rgba(13, 148, 136, 0.12)'
                        : 'var(--bg-canvas)',
                    border:
                      qcResult === 'Passed'
                        ? '2px solid #0d9488'
                        : '1px solid var(--border-default)',
                    color: qcResult === 'Passed' ? '#0d9488' : 'var(--text-secondary)',
                  }}
                >
                  <CheckCircle2 size={18} color={qcResult === 'Passed' ? '#0d9488' : 'var(--text-muted)'} />
                  <span>Passed & Ready</span>
                </button>

                <button
                  type="button"
                  onClick={() => setQcResult('Failed')}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    backgroundColor:
                      qcResult === 'Failed'
                        ? 'rgba(239, 68, 68, 0.12)'
                        : 'var(--bg-canvas)',
                    border:
                      qcResult === 'Failed'
                        ? '2px solid #ef4444'
                        : '1px solid var(--border-default)',
                    color: qcResult === 'Failed' ? '#ef4444' : 'var(--text-secondary)',
                  }}
                >
                  <XCircle size={18} color={qcResult === 'Failed' ? '#ef4444' : 'var(--text-muted)'} />
                  <span>Failed (Rework)</span>
                </button>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.45rem', marginBottom: 0 }}>
                {qcResult === 'Passed'
                  ? 'Equipment will be marked as "Ready for Return" to custodian or central stock.'
                  : 'Equipment will be reverted back to "In Repair" for further technician rework.'}
              </p>
            </div>

            {/* QC Notes */}
            <div>
              <label className="form-label" style={{ fontWeight: 600, marginBottom: '0.35rem' }}>
                QC Checklist / Inspection Notes
              </label>
              <textarea
                rows={3}
                value={qcNotes}
                onChange={(e) => setQcNotes(e.target.value)}
                placeholder="e.g. Bench burn-in passed, OS boots cleanly, display and ports verified..."
                className="form-input"
                style={{ fontSize: '0.8rem', resize: 'vertical' }}
              />
            </div>

            {/* Inspector Name */}
            <div>
              <label className="form-label" style={{ fontWeight: 600, marginBottom: '0.35rem' }}>
                Inspected By
              </label>
              <input
                type="text"
                value={qcBy}
                onChange={(e) => setQcBy(e.target.value)}
                className="form-input"
                style={{ fontSize: '0.8rem' }}
              />
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
                backgroundColor: '#a855f7',
                borderColor: '#a855f7',
                color: '#ffffff',
                fontWeight: 700,
              }}
            >
              {loading ? 'Submitting...' : 'Record QC Result'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
