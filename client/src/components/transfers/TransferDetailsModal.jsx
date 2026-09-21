import React, { useState } from 'react';
import {
  X,
  ArrowRightLeft,
  CheckCircle2,
  XCircle,
  Printer,
  Calendar,
  Clock,
  Laptop,
  User,
  Building2,
  MapPin,
  Tag,
  ShieldCheck,
  Send,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../common/Toast';
import { useAuth } from '../../context/AuthContext';
import TransferStatusBadge from './TransferStatusBadge';
import TransferHandoverDocument from './TransferHandoverDocument';

export default function TransferDetailsModal({
  transfer,
  onClose,
  onUpdate,
}) {
  const { user } = useAuth();
  const toast = useToast();

  const [currentTransfer, setCurrentTransfer] = useState(transfer);
  const [loadingAction, setLoadingAction] = useState(false);
  const [showHandoverDoc, setShowHandoverDoc] = useState(false);
  const [actionNotes, setActionNotes] = useState('');
  const [showActionPrompt, setShowActionPrompt] = useState(null); // 'approve' | 'handover' | 'acknowledge' | 'cancel'

  const formattedDate = currentTransfer?.transferDate
    ? new Date(currentTransfer.transferDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'N/A';

  // Handle Approve
  const handleApprove = async () => {
    setLoadingAction(true);
    try {
      const res = await api.approveTransfer(currentTransfer.transferId || currentTransfer._id, {
        actorName: user?.name || 'IT Admin',
        notes: actionNotes,
      });
      toast.success('Transfer approved successfully!', 'Approved');
      setCurrentTransfer(res.data);
      setShowActionPrompt(null);
      setActionNotes('');
      if (onUpdate) onUpdate(res.data);
    } catch (err) {
      toast.error(err.message, 'Approval Failed');
    } finally {
      setLoadingAction(false);
    }
  };

  // Handle Handover
  const handleHandover = async () => {
    setLoadingAction(true);
    try {
      const res = await api.handoverTransfer(currentTransfer.transferId || currentTransfer._id, {
        actorName: user?.name || 'IT Admin',
        notes: actionNotes,
      });
      toast.success('Physical handover recorded. Awaiting employee acknowledgement.', 'Handover Dispatched');
      setCurrentTransfer(res.data);
      setShowActionPrompt(null);
      setActionNotes('');
      if (onUpdate) onUpdate(res.data);
    } catch (err) {
      toast.error(err.message, 'Handover Failed');
    } finally {
      setLoadingAction(false);
    }
  };

  // Handle Acknowledge
  const handleAcknowledge = async () => {
    setLoadingAction(true);
    try {
      const res = await api.acknowledgeTransfer(currentTransfer.transferId || currentTransfer._id, {
        actorName: user?.name || currentTransfer.toEmployeeName || 'Employee',
        notes: actionNotes || 'Transfer acknowledged and custody accepted',
      });
      toast.success('Transfer completed! Asset custody updated.', 'Custody Transferred');
      setCurrentTransfer(res?.data?.transfer || res.data);
      setShowActionPrompt(null);
      setActionNotes('');
      if (onUpdate) onUpdate(res?.data?.asset || res.data);
    } catch (err) {
      toast.error(err.message, 'Acknowledgement Failed');
    } finally {
      setLoadingAction(false);
    }
  };

  // Handle Cancel
  const handleCancel = async () => {
    setLoadingAction(true);
    try {
      const res = await api.cancelTransfer(currentTransfer.transferId || currentTransfer._id, {
        actorName: user?.name || 'IT Admin',
        cancellationReason: actionNotes || 'Cancelled by IT Administrator',
      });
      toast.success('Transfer request cancelled. Asset remains with original custodian.', 'Transfer Cancelled');
      setCurrentTransfer(res.data);
      setShowActionPrompt(null);
      setActionNotes('');
      if (onUpdate) onUpdate(res.data);
    } catch (err) {
      toast.error(err.message, 'Cancellation Failed');
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose} style={{ zIndex: 90 }}>
        <div
          className="modal-content"
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: '780px', width: '95vw', maxHeight: '92vh', overflowY: 'auto' }}
        >
          {/* Modal Header */}
          <div className="modal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(56, 189, 248, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38bdf8',
                }}
              >
                <ArrowRightLeft size={18} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>
                    {currentTransfer.transferId}
                  </h3>
                  <TransferStatusBadge status={currentTransfer.status} />
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                  Initiated on {formattedDate} • Reason: {currentTransfer.reason}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setShowHandoverDoc(true)}
                className="btn btn-outline btn-xs"
                style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <Printer size={13} />
                Handover Sheet
              </button>
              <button type="button" onClick={onClose} className="btn btn-ghost btn-icon btn-xs">
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.25rem 1.5rem' }}>
            {/* Custodian Transition Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.75rem', alignItems: 'center' }}>
              {/* Previous Custodian */}
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: 'rgba(239, 68, 68, 0.04)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
                  From Custodian
                </div>
                <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                  {currentTransfer.fromEmployeeName}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#38bdf8', fontFamily: 'var(--font-mono)', marginTop: '0.15rem' }}>
                  {currentTransfer.fromEmpCode || 'NO-CODE'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  {currentTransfer.fromDepartment} • {currentTransfer.fromLocation || 'Vitromed'}
                </div>
              </div>

              {/* Arrow Icon */}
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-surface-raised)',
                  border: '1px solid var(--border-default)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38bdf8',
                }}
              >
                <ArrowRightLeft size={16} />
              </div>

              {/* New Custodian */}
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: 'rgba(16, 185, 129, 0.04)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
                  To Custodian
                </div>
                <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                  {currentTransfer.toEmployeeName}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#34d399', fontFamily: 'var(--font-mono)', marginTop: '0.15rem' }}>
                  {currentTransfer.toEmpCode || 'NO-CODE'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  {currentTransfer.toDepartment} • {currentTransfer.destinationLocation || currentTransfer.toLocation || 'Vitromed'}
                </div>
              </div>
            </div>

            {/* Asset Snapshot Card */}
            <div
              style={{
                padding: '1rem 1.25rem',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <Laptop size={20} color="#38bdf8" />
                  <div>
                    <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                      {currentTransfer.assetMake} {currentTransfer.assetModel}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Category: {currentTransfer.assetCategory || 'Computing'}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      backgroundColor: 'rgba(56, 189, 248, 0.12)',
                      color: '#38bdf8',
                      padding: '0.2rem 0.5rem',
                      borderRadius: 'var(--radius-xs)',
                    }}
                  >
                    {currentTransfer.assetTag || 'AST-N/A'}
                  </span>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                    S/N: {currentTransfer.assetSerial || 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* Transfer Parameters Details */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '0.75rem',
                padding: '0.85rem 1rem',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.78rem',
              }}
            >
              <div>
                <div style={{ color: 'var(--text-faint)', fontSize: '0.7rem' }}>Condition</div>
                <div style={{ fontWeight: 600, color: '#34d399', marginTop: '0.15rem' }}>
                  {currentTransfer.assetCondition || 'Good'}
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--text-faint)', fontSize: '0.7rem' }}>Accessories Included</div>
                <div style={{ fontWeight: 600, color: currentTransfer.accessoriesTransferred ? '#34d399' : '#f87171', marginTop: '0.15rem' }}>
                  {currentTransfer.accessoriesTransferred ? 'Yes' : 'No'}
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--text-faint)', fontSize: '0.7rem' }}>Approved By</div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.15rem' }}>
                  {currentTransfer.approvedBy || 'Pending'}
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--text-faint)', fontSize: '0.7rem' }}>Acknowledged By</div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.15rem' }}>
                  {currentTransfer.acknowledgedBy || 'Pending'}
                </div>
              </div>
            </div>

            {/* Remarks & Notes */}
            {(currentTransfer.accessoryNotes || currentTransfer.remarks) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.78rem' }}>
                {currentTransfer.accessoryNotes && (
                  <div style={{ padding: '0.6rem 0.85rem', backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <strong style={{ color: 'var(--text-secondary)' }}>Accessories: </strong>
                    <span style={{ color: 'var(--text-muted)' }}>{currentTransfer.accessoryNotes}</span>
                  </div>
                )}
                {currentTransfer.remarks && (
                  <div style={{ padding: '0.6rem 0.85rem', backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <strong style={{ color: 'var(--text-secondary)' }}>Handover Remarks: </strong>
                    <span style={{ color: 'var(--text-muted)' }}>{currentTransfer.remarks}</span>
                  </div>
                )}
              </div>
            )}

            {/* Action Dialog Prompt (Approve / Handover / Acknowledge / Cancel) */}
            {showActionPrompt && (
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: 'rgba(56, 189, 248, 0.05)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                  {showActionPrompt === 'approve' && 'Approve Asset Transfer Request'}
                  {showActionPrompt === 'handover' && 'Confirm Physical Equipment Handover'}
                  {showActionPrompt === 'acknowledge' && 'Acknowledge Receipt & Finalize Custody Transfer'}
                  {showActionPrompt === 'cancel' && 'Cancel Asset Transfer Request'}
                </div>

                <textarea
                  rows={2}
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder={
                    showActionPrompt === 'cancel'
                      ? 'Enter cancellation reason (required)...'
                      : 'Optional notes or verification remarks...'
                  }
                  className="form-control form-control-sm"
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowActionPrompt(null)}
                    className="btn btn-outline btn-xs"
                  >
                    Cancel
                  </button>

                  {showActionPrompt === 'approve' && (
                    <button
                      type="button"
                      disabled={loadingAction}
                      onClick={handleApprove}
                      className="btn btn-primary btn-xs"
                    >
                      {loadingAction ? 'Approving...' : 'Confirm Approval'}
                    </button>
                  )}

                  {showActionPrompt === 'handover' && (
                    <button
                      type="button"
                      disabled={loadingAction}
                      onClick={handleHandover}
                      className="btn btn-primary btn-xs"
                    >
                      {loadingAction ? 'Updating...' : 'Confirm Handover'}
                    </button>
                  )}

                  {showActionPrompt === 'acknowledge' && (
                    <button
                      type="button"
                      disabled={loadingAction}
                      onClick={handleAcknowledge}
                      className="btn btn-success btn-xs"
                    >
                      {loadingAction ? 'Completing...' : 'Confirm Receipt & Complete'}
                    </button>
                  )}

                  {showActionPrompt === 'cancel' && (
                    <button
                      type="button"
                      disabled={loadingAction}
                      onClick={handleCancel}
                      className="btn btn-danger btn-xs"
                    >
                      {loadingAction ? 'Cancelling...' : 'Yes, Cancel Transfer'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Timeline Audit Trail */}
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
                Transfer Activity & Audit History
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {(currentTransfer.history || []).map((h, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      padding: '0.65rem 0.85rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.78rem',
                    }}
                  >
                    <Clock size={14} color="#38bdf8" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>{h.action}</strong>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>
                          {new Date(h.date).toLocaleString('en-GB')}
                        </span>
                      </div>
                      <div style={{ color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        {h.details} • <span style={{ color: '#38bdf8' }}>By {h.performedBy}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Workflow Actions Footer */}
          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              {currentTransfer.status !== 'Completed' && currentTransfer.status !== 'Cancelled' && (
                <button
                  type="button"
                  onClick={() => setShowActionPrompt('cancel')}
                  className="btn btn-danger btn-sm"
                  style={{ fontSize: '0.78rem' }}
                >
                  Cancel Transfer
                </button>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {currentTransfer.status === 'Pending' && (
                <button
                  type="button"
                  onClick={() => setShowActionPrompt('approve')}
                  className="btn btn-primary btn-sm"
                >
                  Approve Transfer
                </button>
              )}

              {(currentTransfer.status === 'Approved' || currentTransfer.status === 'Handover Pending') && (
                <button
                  type="button"
                  onClick={() => setShowActionPrompt('handover')}
                  className="btn btn-primary btn-sm"
                >
                  Confirm Physical Handover
                </button>
              )}

              {currentTransfer.status === 'Acknowledgement Pending' && (
                <button
                  type="button"
                  onClick={() => setShowActionPrompt('acknowledge')}
                  className="btn btn-success btn-sm"
                >
                  Acknowledge Receipt & Complete
                </button>
              )}

              <button type="button" onClick={onClose} className="btn btn-outline btn-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {showHandoverDoc && (
        <TransferHandoverDocument
          transfer={currentTransfer}
          asset={{
            assetNo: currentTransfer.assetTag,
            make: currentTransfer.assetMake,
            model: currentTransfer.assetModel,
            sr: currentTransfer.assetSerial,
            deviceType: currentTransfer.assetCategory,
          }}
          onClose={() => setShowHandoverDoc(false)}
        />
      )}
    </>
  );
}
