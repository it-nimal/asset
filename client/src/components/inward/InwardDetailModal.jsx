import React, { useState } from 'react';
import {
  X,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Boxes,
  Eye,
  Calendar,
  Building,
  FileText,
  Paperclip,
  Check,
  Plus,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../common/Toast';
import { useAuth } from '../../context/AuthContext';

export default function InwardDetailModal({
  inward,
  onClose,
  onViewAsset,
  onRefresh,
}) {
  const { user } = useAuth();
  const toast = useToast();

  const [verifyLoading, setVerifyLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [showVerifyPrompt, setShowVerifyPrompt] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [hasDiscrepancy, setHasDiscrepancy] = useState(false);
  const [discrepancyReason, setDiscrepancyReason] = useState('');

  // Asset creation serial inputs
  const [customSerials, setCustomSerials] = useState(
    Array(inward.quantity || 1).fill('')
  );
  const [assetCondition, setAssetCondition] = useState('Good');
  const [showCreateAssetsForm, setShowCreateAssetsForm] = useState(false);

  // Status styling
  const statusColor =
    inward.status === 'Verified' || inward.status === 'Asset Created' || inward.status === 'Verified & Created'
      ? '#10b981'
      : inward.status === 'Discrepancy'
      ? '#f87171'
      : '#fbbf24';

  const statusBg =
    inward.status === 'Verified' || inward.status === 'Asset Created' || inward.status === 'Verified & Created'
      ? 'rgba(16, 185, 129, 0.12)'
      : inward.status === 'Discrepancy'
      ? 'rgba(248, 113, 113, 0.12)'
      : 'rgba(251, 191, 36, 0.12)';

  // Handle verification submit
  const handleConfirmVerification = async (isVerified) => {
    setVerifyLoading(true);
    try {
      await api.verifyInwardAssets(inward._id, {
        status: isVerified ? 'Verified' : 'Discrepancy',
        verificationNotes,
        hasDiscrepancy: !isVerified,
        discrepancyReason: isVerified ? '' : discrepancyReason,
        actorName: user?.name || 'IT Admin',
      });

      toast.success(
        isVerified ? 'Inward shipment verified successfully!' : 'Discrepancy reported for inward shipment',
        isVerified ? 'Shipment Verified' : 'Discrepancy Logged'
      );
      setShowVerifyPrompt(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err.message || 'Failed to update verification status');
    } finally {
      setVerifyLoading(false);
    }
  };

  // Handle asset creation
  const handleCreateAssets = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      const res = await api.createAssetsFromInward(inward._id, {
        customSerials,
        condition: assetCondition,
        actorName: user?.name || 'IT Admin',
      });

      toast.success(
        `Successfully created ${res.data?.createdAssets?.length || inward.quantity} inventory assets!`,
        'Assets Generated'
      );
      setShowCreateAssetsForm(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err.message || 'Failed to create inventory assets');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '860px',
          width: '95vw',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-surface, #ffffff)',
        }}
      >
        {/* Header */}
        <div
          className="modal-header"
          style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid var(--border-default)',
            backgroundColor: 'var(--bg-surface-raised, #f8fafc)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: 'rgba(2, 132, 199, 0.12)',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Truck size={20} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  {inward.inwardNumber}
                </h3>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.55rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: statusBg,
                    color: statusColor,
                    border: `1px solid ${statusColor}44`,
                    textTransform: 'uppercase',
                  }}
                >
                  ● {inward.status || 'Received'}
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Received from <strong>{inward.vendor}</strong> on{' '}
                {new Date(inward.receivedDate || inward.inwardDate || inward.createdAt).toLocaleDateString('en-GB')}
              </p>
            </div>
          </div>

          <button type="button" onClick={onClose} className="btn btn-ghost btn-icon btn-xs">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div
          className="modal-body"
          style={{
            padding: '1.25rem 1.5rem',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          {/* Top Verification Action Bar */}
          {inward.status !== 'Asset Created' && inward.status !== 'Verified & Created' && (
            <div
              style={{
                backgroundColor: 'rgba(2, 132, 199, 0.06)',
                border: '1px solid rgba(2, 132, 199, 0.25)',
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Receipt Verification & Inventory Conversion
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {inward.status === 'Verified'
                    ? 'Material verified. Ready to create individual Asset Master records.'
                    : 'Inspect physical items against bill/specs and complete verification.'}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {inward.status === 'Verified' ? (
                  <button
                    type="button"
                    onClick={() => setShowCreateAssetsForm(true)}
                    className="btn btn-primary btn-sm"
                    style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <Boxes size={14} />
                    <span>+ Generate {inward.quantity} Inventory Asset(s)</span>
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setHasDiscrepancy(false);
                        setShowVerifyPrompt(true);
                      }}
                      className="btn btn-primary btn-sm"
                      style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <CheckCircle2 size={14} />
                      <span>Verify Received Items</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setHasDiscrepancy(true);
                        setShowVerifyPrompt(true);
                      }}
                      className="btn btn-outline btn-sm"
                      style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: '#ef4444', fontWeight: 600 }}
                    >
                      <AlertTriangle size={13} />
                      <span>Report Discrepancy</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Verification / Discrepancy Prompt */}
          {showVerifyPrompt && (
            <div
              style={{
                backgroundColor: hasDiscrepancy ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                border: hasDiscrepancy ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                padding: '1rem',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: hasDiscrepancy ? '#ef4444' : '#059669' }}>
                {hasDiscrepancy ? 'Report Physical Discrepancy / Damage' : 'Confirm Hardware Receipt Verification'}
              </div>

              {hasDiscrepancy ? (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.76rem' }}>Discrepancy Reason / Issue Details</label>
                  <input
                    type="text"
                    placeholder="e.g. Missing power cable / damaged outer box / incorrect RAM spec"
                    value={discrepancyReason}
                    onChange={(e) => setDiscrepancyReason(e.target.value)}
                    className="form-control"
                    style={{ fontSize: '0.82rem' }}
                  />
                </div>
              ) : (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.76rem' }}>Verification Remarks</label>
                  <input
                    type="text"
                    placeholder="e.g. All items inspected and verified against invoice"
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    className="form-control"
                    style={{ fontSize: '0.82rem' }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowVerifyPrompt(false)}
                  className="btn btn-secondary btn-xs"
                  disabled={verifyLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmVerification(!hasDiscrepancy)}
                  className={hasDiscrepancy ? 'btn btn-danger btn-xs' : 'btn btn-primary btn-xs'}
                  disabled={verifyLoading}
                  style={{ fontWeight: 700 }}
                >
                  {verifyLoading ? 'Saving...' : hasDiscrepancy ? 'Confirm Discrepancy' : 'Confirm Verified'}
                </button>
              </div>
            </div>
          )}

          {/* Create Assets Form */}
          {showCreateAssetsForm && (
            <form
              onSubmit={handleCreateAssets}
              style={{
                backgroundColor: 'rgba(2, 132, 199, 0.08)',
                border: '1px solid rgba(2, 132, 199, 0.3)',
                padding: '1rem',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0284c7' }}>
                Create {inward.quantity} Inventory Asset(s) in Asset Master
              </div>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0 }}>
                Enter serial numbers (S/N) for each received machine. If left blank, sequential Asset Tags will be generated.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.65rem' }}>
                {Array.from({ length: inward.quantity || 1 }).map((_, idx) => (
                  <div key={idx} className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.74rem' }}>
                      Item #{idx + 1} Serial Number
                    </label>
                    <input
                      type="text"
                      placeholder={`e.g. SN-${idx + 101}`}
                      value={customSerials[idx] || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomSerials((prev) => {
                          const next = [...prev];
                          next[idx] = val;
                          return next;
                        });
                      }}
                      className="form-control"
                      style={{ fontSize: '0.8rem' }}
                    />
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateAssetsForm(false)}
                  className="btn btn-secondary btn-xs"
                  disabled={createLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-xs"
                  disabled={createLoading}
                  style={{ fontWeight: 700 }}
                >
                  {createLoading ? 'Generating Assets...' : 'Confirm & Generate Asset Master Records'}
                </button>
              </div>
            </form>
          )}

          {/* SECTION 1: RECEIPT DETAILS */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface-raised, #f8fafc)',
              border: '1px solid var(--border-default, #e2e8f0)',
              borderRadius: '8px',
              padding: '1rem',
            }}
          >
            <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              1. Receipt & Invoice Information
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem', fontSize: '0.82rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Vendor / Supplier</span>
                <strong style={{ color: 'var(--text-primary)' }}>{inward.vendor}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Received Date</span>
                <strong style={{ color: 'var(--text-primary)' }}>
                  {new Date(inward.receivedDate || inward.inwardDate || inward.createdAt).toLocaleDateString('en-GB')}
                </strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Invoice Number</span>
                <span style={{ fontFamily: 'monospace', color: '#0284c7', fontWeight: 600 }}>
                  {inward.invoiceNumber || '—'}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Purchase Order #</span>
                <span style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                  {inward.purchaseOrderNumber || inward.poNumber || '—'}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 2: RECEIVED ITEM & SPECIFICATIONS */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface, #ffffff)',
              border: '1px solid var(--border-default, #e2e8f0)',
              borderRadius: '8px',
              padding: '1rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                2. Received Item & Specifications
              </div>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  backgroundColor: 'rgba(2, 132, 199, 0.1)',
                  color: '#0284c7',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                }}
              >
                Qty: {inward.quantity} {inward.quantity === 1 ? 'Unit' : 'Units'}
              </span>
            </div>

            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              {inward.manufacturer} {inward.model} ({inward.deviceType || 'Hardware'})
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
              Category: <strong>{inward.category}</strong>
            </div>

            {/* Specifications Key-Values Grid */}
            {inward.specifications && Object.keys(inward.specifications).length > 0 ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '0.65rem',
                  backgroundColor: 'var(--bg-surface-raised, #f8fafc)',
                  padding: '0.75rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-default)',
                }}
              >
                {Object.entries(inward.specifications).map(([k, v]) => (
                  <div key={k} style={{ fontSize: '0.78rem' }}>
                    <span style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                      {k.replace(/([A-Z])/g, ' $1')}:{' '}
                    </span>
                    <strong style={{ color: 'var(--text-primary)' }}>{String(v)}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No custom technical parameters entered.
              </div>
            )}
          </div>

          {/* SECTION 3: ACCESSORIES RECEIVED */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface, #ffffff)',
              border: '1px solid var(--border-default, #e2e8f0)',
              borderRadius: '8px',
              padding: '1rem',
            }}
          >
            <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              3. Accessories Received
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {inward.accessories &&
                Object.entries(inward.accessories).map(([k, acc]) => {
                  if (!acc || !acc.received) return null;
                  return (
                    <span
                      key={k}
                      style={{
                        fontSize: '0.76rem',
                        fontWeight: 600,
                        backgroundColor: 'rgba(2, 132, 199, 0.08)',
                        color: '#0284c7',
                        border: '1px solid rgba(2, 132, 199, 0.25)',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '4px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                    >
                      <Check size={12} />
                      <span style={{ textTransform: 'capitalize' }}>
                        {k}: {acc.description || 'Received'}
                      </span>
                    </span>
                  );
                })}

              {(!inward.accessories ||
                !Object.values(inward.accessories).some((a) => a && a.received)) && (
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  No extra accessories or peripherals bundled with this shipment.
                </span>
              )}
            </div>
          </div>

          {/* SECTION 4: CREATED ASSETS MASTER TILES */}
          {inward.createdAssets && inward.createdAssets.length > 0 && (
            <div
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.05)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: '8px',
                padding: '1rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>
                  Generated Inventory Asset Master Records ({inward.createdAssets.length})
                </div>
                <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>
                  ● Active in Central Depot
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.65rem' }}>
                {inward.createdAssets.map((asset, aIdx) => {
                  const tag = typeof asset === 'string' ? asset : asset.assetNo || asset.sr;
                  return (
                    <div
                      key={aIdx}
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid var(--border-default)',
                        borderRadius: '6px',
                        padding: '0.65rem 0.75rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontFamily: 'monospace', fontWeight: 800, color: '#0284c7', fontSize: '0.85rem' }}>
                          #{tag}
                        </div>
                        {typeof asset === 'object' && asset.make && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {asset.make} {asset.model}
                          </div>
                        )}
                      </div>

                      {onViewAsset && typeof asset === 'object' && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onViewAsset(asset);
                          }}
                          className="btn btn-ghost btn-xs"
                          style={{ color: '#0284c7', padding: '2px 6px', fontSize: '0.72rem' }}
                        >
                          View Asset
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ATTACHMENTS & REMARKS */}
          {(inward.notes || (inward.attachments && inward.attachments.length > 0)) && (
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {inward.notes && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Notes:</strong> {inward.notes}
                </div>
              )}

              {inward.attachments && inward.attachments.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                  <strong>Attachments:</strong>
                  {inward.attachments.map((doc, dIdx) => (
                    <a
                      key={dIdx}
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        color: '#0284c7',
                        textDecoration: 'none',
                        backgroundColor: 'var(--bg-surface-raised, #f8fafc)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        border: '1px solid var(--border-default)',
                      }}
                    >
                      <Paperclip size={12} />
                      <span>{doc.fileName || 'Attachment ' + (dIdx + 1)}</span>
                      <ExternalLink size={10} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className="modal-footer"
          style={{
            padding: '0.85rem 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid var(--border-default)',
            backgroundColor: 'var(--bg-surface-raised, #f8fafc)',
          }}
        >
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Logged by: <strong>{inward.createdBy || 'IT Admin'}</strong>
          </div>

          <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
