import React, { useState } from 'react';
import {
  Wrench,
  X,
  User,
  Laptop,
  Clock,
  ShieldCheck,
  Truck,
  Activity,
  AlertCircle,
  ArrowLeftRight,
} from 'lucide-react';
import MaintenanceStatusBadge from './MaintenanceStatusBadge';
import MaintenanceQCModal from './MaintenanceQCModal';
import MaintenanceReturnModal from './MaintenanceReturnModal';
import { api } from '../../services/api';

export default function MaintenanceDetailsModal({ isOpen, onClose, ticket, onUpdated }) {
  const [showQCModal, setShowQCModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosisData, setDiagnosisData] = useState({
    diagnosis: ticket?.diagnosis || '',
    rootCause: ticket?.rootCause || '',
    recommendedAction: ticket?.recommendedAction || '',
  });

  if (!isOpen || !ticket) return null;

  const handleSaveDiagnosis = async () => {
    try {
      const res = await api.diagnoseMaintenance(ticket._id, diagnosisData);
      setIsDiagnosing(false);
      if (onUpdated) onUpdated(res.data);
    } catch (err) {
      alert('Failed to save diagnosis: ' + err.message);
    }
  };

  const handleStartRepair = async (type) => {
    try {
      const res = await api.startRepairMaintenance(ticket._id, {
        repairType: type || ticket.repairType || 'Internal IT Repair',
      });
      if (onUpdated) onUpdated(res.data);
    } catch (err) {
      alert('Failed to start repair: ' + err.message);
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose} style={{ zIndex: 100 }}>
        <div
          className="modal-content"
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: '780px', width: '95vw' }}
        >
          {/* Header */}
          <div className="modal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(245, 158, 11, 0.12)',
                  color: '#f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Wrench size={20} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-mono)' }}>
                    {ticket.maintenanceId}
                  </h3>
                  <MaintenanceStatusBadge status={ticket.status} size="sm" />
                  <span
                    style={{
                      fontSize: '0.72rem',
                      padding: '0.15rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 700,
                      backgroundColor:
                        ticket.priority === 'High'
                          ? 'rgba(239, 68, 68, 0.12)'
                          : 'rgba(245, 158, 11, 0.12)',
                      color: ticket.priority === 'High' ? '#ef4444' : '#f59e0b',
                      border: `1px solid ${
                        ticket.priority === 'High'
                          ? 'rgba(239, 68, 68, 0.25)'
                          : 'rgba(245, 158, 11, 0.25)'
                      }`,
                    }}
                  >
                    {ticket.priority} Priority
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                  Reported on {new Date(ticket.reportedDate || ticket.createdAt).toLocaleDateString('en-GB')}
                </p>
              </div>
            </div>

            <button type="button" onClick={onClose} className="btn btn-ghost btn-icon btn-xs">
              <X size={16} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {/* Action Ribbon */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--bg-canvas)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-default)',
                flexWrap: 'wrap',
                gap: '0.65rem',
              }}
            >
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                Workflow Actions:
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                {ticket.status === 'Reported' && (
                  <button
                    type="button"
                    onClick={() => setIsDiagnosing(true)}
                    className="btn btn-sm"
                    style={{
                      backgroundColor: '#6366f1',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    Start Diagnosis
                  </button>
                )}

                {(ticket.status === 'Reported' || ticket.status === 'Under Diagnosis') && (
                  <button
                    type="button"
                    onClick={() => handleStartRepair('Internal IT Repair')}
                    className="btn btn-sm"
                    style={{
                      backgroundColor: '#f59e0b',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    Send to Repair
                  </button>
                )}

                {['Reported', 'Under Diagnosis', 'In Repair', 'Awaiting Vendor', 'Awaiting Parts', 'QC Pending'].includes(
                  ticket.status
                )}
                {['Reported', 'Under Diagnosis', 'In Repair', 'Awaiting Vendor', 'Awaiting Parts', 'QC Pending'].includes(
                  ticket.status
                ) && (
                  <button
                    type="button"
                    onClick={() => setShowQCModal(true)}
                    className="btn btn-sm"
                    style={{
                      backgroundColor: 'rgba(168, 85, 247, 0.12)',
                      color: '#a855f7',
                      border: '1px solid rgba(168, 85, 247, 0.3)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <ShieldCheck size={14} />
                    Perform QC Inspection
                  </button>
                )}

                {ticket.status === 'Ready' && (
                  <button
                    type="button"
                    onClick={() => setShowReturnModal(true)}
                    className="btn btn-primary btn-sm"
                    style={{
                      backgroundColor: '#0d9488',
                      borderColor: '#0d9488',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      boxShadow: '0 2px 8px rgba(13, 148, 136, 0.25)',
                    }}
                  >
                    <ArrowLeftRight size={14} />
                    Return / Complete Disposition
                  </button>
                )}
              </div>
            </div>

            {/* Grid Information */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
              {/* Asset Details */}
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-default)',
                  backgroundColor: 'var(--bg-surface-raised)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    textTransform: 'uppercase',
                    marginBottom: '0.75rem',
                  }}
                >
                  <Laptop size={15} color="#f59e0b" />
                  Equipment Details
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.78rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Make & Model:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>
                      {ticket.assetMake} {ticket.assetModel}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Asset Tag / ID:</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                      {ticket.assetTag || 'N/A'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Serial (SR):</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                      {ticket.assetSerial || 'N/A'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Category:</span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {ticket.assetCategory || 'Computing'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Custodian Details */}
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-default)',
                  backgroundColor: 'var(--bg-surface-raised)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    textTransform: 'uppercase',
                    marginBottom: '0.75rem',
                  }}
                >
                  <User size={15} color="#3b82f6" />
                  Custodian & Report Info
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.78rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Custodian:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>
                      {ticket.employeeName || 'Unassigned / Central Stock'}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Employee Code:</span>
                    <span style={{ color: 'var(--text-primary)' }}>{ticket.empCode || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Department:</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{ticket.department || 'Vitromed'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Reported By:</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{ticket.reportedBy || 'IT Staff'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Issue Description */}
            <div
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-default)',
                backgroundColor: 'var(--bg-surface-raised)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  textTransform: 'uppercase',
                  marginBottom: '0.5rem',
                }}
              >
                <AlertCircle size={15} color="#f59e0b" />
                Issue Description & Symptoms
              </div>
              <p
                style={{
                  fontSize: '0.82rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-default)',
                  margin: 0,
                }}
              >
                {ticket.issueDescription}
              </p>
            </div>

            {/* Diagnosis Section */}
            <div
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-default)',
                backgroundColor: 'var(--bg-surface-raised)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.75rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    textTransform: 'uppercase',
                  }}
                >
                  <Activity size={15} color="#6366f1" />
                  Technical Diagnosis
                </div>
                {!isDiagnosing && (
                  <button
                    type="button"
                    onClick={() => setIsDiagnosing(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '0.75rem',
                      color: '#6366f1',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Edit Diagnosis
                  </button>
                )}
              </div>

              {isDiagnosing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                      Diagnosis Findings
                    </label>
                    <input
                      type="text"
                      value={diagnosisData.diagnosis}
                      onChange={(e) => setDiagnosisData({ ...diagnosisData, diagnosis: e.target.value })}
                      placeholder="e.g. Defective cooling fan causing thermal throttling"
                      className="form-input"
                      style={{ fontSize: '0.8rem' }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                        Root Cause
                      </label>
                      <input
                        type="text"
                        value={diagnosisData.rootCause}
                        onChange={(e) => setDiagnosisData({ ...diagnosisData, rootCause: e.target.value })}
                        placeholder="e.g. Dust clogging / bearing failure"
                        className="form-input"
                        style={{ fontSize: '0.8rem' }}
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                        Recommended Action
                      </label>
                      <input
                        type="text"
                        value={diagnosisData.recommendedAction}
                        onChange={(e) => setDiagnosisData({ ...diagnosisData, recommendedAction: e.target.value })}
                        placeholder="e.g. Fan replacement and thermal paste refresh"
                        className="form-input"
                        style={{ fontSize: '0.8rem' }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <button
                      type="button"
                      onClick={() => setIsDiagnosing(false)}
                      className="btn btn-outline btn-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveDiagnosis}
                      className="btn btn-primary btn-xs"
                      style={{ backgroundColor: '#6366f1', borderColor: '#6366f1' }}
                    >
                      Save Diagnosis
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.78rem' }}>
                  <div
                    style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-canvas)',
                      border: '1px solid var(--border-default)',
                    }}
                  >
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem', marginBottom: '0.2rem' }}>
                      Finding:
                    </span>
                    <strong style={{ color: 'var(--text-primary)' }}>
                      {ticket.diagnosis || 'Pending technical inspection'}
                    </strong>
                  </div>
                  <div
                    style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-canvas)',
                      border: '1px solid var(--border-default)',
                    }}
                  >
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem', marginBottom: '0.2rem' }}>
                      Root Cause:
                    </span>
                    <span style={{ color: 'var(--text-secondary)' }}>{ticket.rootCause || 'N/A'}</span>
                  </div>
                  <div
                    style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-canvas)',
                      border: '1px solid var(--border-default)',
                    }}
                  >
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem', marginBottom: '0.2rem' }}>
                      Action:
                    </span>
                    <span style={{ color: 'var(--text-secondary)' }}>{ticket.recommendedAction || 'N/A'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Repair & QC Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-default)',
                  backgroundColor: 'var(--bg-surface-raised)',
                  fontSize: '0.78rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.45rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    textTransform: 'uppercase',
                    marginBottom: '0.25rem',
                  }}
                >
                  <Truck size={15} color="#0284c7" />
                  Service & Vendor Details
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Repair Type:</span>
                  <span style={{ color: 'var(--text-primary)' }}>{ticket.repairType || 'Internal IT'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Vendor:</span>
                  <span style={{ color: 'var(--text-primary)' }}>{ticket.vendor || ticket.serviceVendor || 'Internal IT'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Repair Cost:</span>
                  <strong style={{ color: '#0d9488' }}>₹{ticket.repairCost || ticket.cost || 0}</strong>
                </div>
              </div>

              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-default)',
                  backgroundColor: 'var(--bg-surface-raised)',
                  fontSize: '0.78rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.45rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    textTransform: 'uppercase',
                    marginBottom: '0.25rem',
                  }}
                >
                  <ShieldCheck size={15} color="#a855f7" />
                  QC & Inspection Results
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)' }}>QC Status:</span>
                  <span
                    style={{
                      fontWeight: 700,
                      padding: '0.15rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor:
                        ticket.qcResult === 'Passed'
                          ? 'rgba(13, 148, 136, 0.12)'
                          : ticket.qcResult === 'Failed'
                          ? 'rgba(239, 68, 68, 0.12)'
                          : 'var(--bg-canvas)',
                      color:
                        ticket.qcResult === 'Passed'
                          ? '#0d9488'
                          : ticket.qcResult === 'Failed'
                          ? '#ef4444'
                          : 'var(--text-muted)',
                      border: `1px solid ${
                        ticket.qcResult === 'Passed'
                          ? 'rgba(13, 148, 136, 0.25)'
                          : ticket.qcResult === 'Failed'
                          ? 'rgba(239, 68, 68, 0.25)'
                          : 'var(--border-default)'
                      }`,
                    }}
                  >
                    {ticket.qcResult || 'Not Tested'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>QC Notes:</span>
                  <span style={{ color: 'var(--text-secondary)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ticket.qcNotes || 'N/A'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Inspector:</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{ticket.qcBy || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Timeline History */}
            {ticket.history && ticket.history.length > 0 && (
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-default)',
                  backgroundColor: 'var(--bg-surface-raised)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    textTransform: 'uppercase',
                    marginBottom: '0.75rem',
                  }}
                >
                  <Clock size={15} color="var(--text-muted)" />
                  Activity History & Audit Trail
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {ticket.history.map((h, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem',
                        fontSize: '0.75rem',
                        borderLeft: '2px solid var(--border-strong)',
                        paddingLeft: '0.65rem',
                      }}
                    >
                      <div style={{ minWidth: '110px', color: 'var(--text-muted)' }}>
                        {new Date(h.date).toLocaleString('en-GB', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </div>
                      <div>
                        <strong style={{ color: 'var(--text-primary)', marginRight: '0.4rem' }}>
                          {h.action}
                        </strong>
                        <span style={{ color: 'var(--text-secondary)' }}>{h.details}</span>
                        {h.performedBy && (
                          <span style={{ color: 'var(--text-muted)', marginLeft: '0.4rem' }}>
                            by {h.performedBy}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showQCModal && (
        <MaintenanceQCModal
          isOpen={showQCModal}
          ticket={ticket}
          onClose={() => setShowQCModal(false)}
          onSuccess={(updated) => {
            setShowQCModal(false);
            if (onUpdated) onUpdated(updated);
          }}
        />
      )}

      {showReturnModal && (
        <MaintenanceReturnModal
          isOpen={showReturnModal}
          ticket={ticket}
          onClose={() => setShowReturnModal(false)}
          onSuccess={(updated) => {
            setShowReturnModal(false);
            if (onUpdated) onUpdated(updated.maintenance || updated);
          }}
        />
      )}
    </>
  );
}
