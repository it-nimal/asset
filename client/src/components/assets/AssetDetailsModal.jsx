import React, { useState, useEffect } from 'react';
import {
  X,
  Laptop,
  User,
  History,
  Wrench,
  ShieldCheck,
  FileText,
  Clock,
  Calendar,
  Cpu,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  Layers,
  MapPin,
  Building2,
  ExternalLink,
  UserCheck,
  ArrowRightLeft,
  Undo2,
  Edit3,
  Trash2,
} from 'lucide-react';
import { STATUS_COLORS } from './AssetTable';

export default function AssetDetailsModal({
  asset,
  onClose,
  initialTab = 'overview',
  onAssign,
  onTransfer,
  onReturn,
  onEdit,
  onMaintenance,
  onDelete,
}) {
  const [tab, setTab] = useState(initialTab);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!asset) return null;

  const st = STATUS_COLORS[asset.status] || STATUS_COLORS.Available;

  // Calculate days remaining on warranty
  let warrantyDaysRemaining = null;
  if (asset.warrantyEndDate) {
    const diffTime = new Date(asset.warrantyEndDate) - new Date();
    warrantyDaysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Laptop },
    { id: 'specs', label: 'Specifications', icon: Cpu },
    { id: 'assignment', label: 'Custodian History', icon: User },
    { id: 'warranty', label: 'Warranty & AMC', icon: ShieldCheck },
    { id: 'history', label: 'Audit Trail', icon: History },
    { id: 'documents', label: 'Invoice & Docs', icon: FileText },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '880px' }}
      >
        {/* Header */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {asset.make} {asset.model}
              </h2>
              <span
                className="badge"
                style={{
                  color: st.text,
                  backgroundColor: st.bg,
                  borderColor: st.border,
                  border: `1px solid ${st.border}`,
                }}
              >
                ● {asset.status}
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#818cf8', fontWeight: 600, marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
              Tag: {asset.assetNo || 'AST-VIT-NEW'} • S/N: {asset.sr || 'N/A'} • Plant: {asset.plant}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-icon btn-sm"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation Bar */}
        <div
          style={{
            display: 'flex',
            gap: '0.35rem',
            padding: '0.65rem 1.25rem',
            borderBottom: '1px solid var(--border-default)',
            backgroundColor: 'rgba(9, 15, 26, 0.4)',
            overflowX: 'auto',
          }}
        >
          {tabs.map((t) => {
            const Icon = t.icon;
            const isAct = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.42rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid',
                  borderColor: isAct ? 'rgba(99, 102, 241, 0.3)' : 'transparent',
                  backgroundColor: isAct ? 'var(--primary-light)' : 'transparent',
                  color: isAct ? '#ffffff' : 'var(--text-muted)',
                  fontSize: '0.78rem',
                  fontWeight: isAct ? 700 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={14} color={isAct ? '#818cf8' : 'var(--text-faint)'} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body Contents */}
        <div className="modal-body">
          {/* TAB 1: OVERVIEW */}
          {tab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="card" style={{ padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>Current Custodian</span>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                    {asset.userName || 'Unassigned (In Stock)'}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#818cf8', marginTop: '2px' }}>
                    {asset.empCode ? `ID: ${asset.empCode}` : 'Available for allocation'}
                  </div>
                </div>

                <div className="card" style={{ padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>Department & Plant</span>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                    {asset.department || 'General IT'}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {asset.plant}
                  </div>
                </div>

                <div className="card" style={{ padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>Invoice & Inward Ref</span>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                    {asset.billNo || 'N/A'}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {asset.vendorName || 'OEM Authorized'}
                  </div>
                </div>
              </div>

              {/* Hardware Quick Summary */}
              <div className="card" style={{ padding: '1.25rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem' }}>System Summary</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8rem' }}>
                  <div><span style={{ color: 'var(--text-faint)' }}>Device Category:</span> <strong>{asset.deviceType}</strong></div>
                  <div><span style={{ color: 'var(--text-faint)' }}>Serial Number:</span> <strong style={{ fontFamily: 'var(--font-mono)' }}>{asset.sr}</strong></div>
                  <div><span style={{ color: 'var(--text-faint)' }}>IP Address:</span> <strong style={{ fontFamily: 'var(--font-mono)', color: '#34d399' }}>{asset.ipAddress || 'DHCP'}</strong></div>
                  <div><span style={{ color: 'var(--text-faint)' }}>Hostname:</span> <strong style={{ fontFamily: 'var(--font-mono)' }}>{asset.hostName || 'N/A'}</strong></div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SPECIFICATIONS */}
          {tab === 'specs' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div className="card" style={{ padding: '1rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>Processor (CPU)</span>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                  {asset.processor || 'Intel Core i5 / AMD Ryzen'}
                </div>
              </div>
              <div className="card" style={{ padding: '1rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>System Memory (RAM)</span>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                  {asset.ramSize || '8 GB DDR4/DDR5'}
                </div>
              </div>
              <div className="card" style={{ padding: '1rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>Internal Storage</span>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                  {asset.storage || '512 GB NVMe SSD'}
                </div>
              </div>
              <div className="card" style={{ padding: '1rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>Operating System</span>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                  {asset.osVersion || 'Windows 11 Pro 64-bit'}
                </div>
              </div>
              <div className="card" style={{ padding: '1rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>Antivirus Protection</span>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                  {asset.antivirus || 'QuickHeal Endpoint Security'}
                </div>
              </div>
              <div className="card" style={{ padding: '1rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>Office Productivity</span>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                  {asset.officeSoftware || 'MS Office 2021'}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ASSIGNMENT */}
          {tab === 'assignment' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="card" style={{ padding: '1.25rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>Active Custody Details</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8rem' }}>
                  <div><span style={{ color: 'var(--text-faint)' }}>Assigned Employee:</span> <strong>{asset.userName || 'None (In Stock)'}</strong></div>
                  <div><span style={{ color: 'var(--text-faint)' }}>Employee Code:</span> <strong>{asset.empCode || 'N/A'}</strong></div>
                  <div><span style={{ color: 'var(--text-faint)' }}>Department:</span> <strong>{asset.department || 'N/A'}</strong></div>
                  <div><span style={{ color: 'var(--text-faint)' }}>Assigned Location:</span> <strong>{asset.plant || 'N/A'}</strong></div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: WARRANTY */}
          {tab === 'warranty' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="card" style={{ padding: '1.25rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem' }}>OEM Warranty Contract</h4>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  {asset.warrantyDetails || '3 Years Comprehensive On-Site OEM Coverage'}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8rem' }}>
                  <div><span style={{ color: 'var(--text-faint)' }}>Purchase Date:</span> <strong>{asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : 'N/A'}</strong></div>
                  <div><span style={{ color: 'var(--text-faint)' }}>Delivery Date:</span> <strong>{asset.deliveryDate ? new Date(asset.deliveryDate).toLocaleDateString() : 'N/A'}</strong></div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: HISTORY */}
          {tab === 'history' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {(!asset.history || asset.history.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-faint)' }}>
                  No historical lifecycle logs recorded for this machine.
                </div>
              ) : (
                asset.history.map((h, i) => (
                  <div
                    key={h._id || i}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '1rem',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                        {h.action}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {h.details}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)', marginTop: '4px' }}>
                        Actor: {h.user || 'System Ingestion'}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)', whiteSpace: 'nowrap' }}>
                      {h.date ? new Date(h.date).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 6: DOCUMENTS */}
          {tab === 'documents' && (
            <div>
              {asset.invoiceImage ? (
                <div style={{ textAlign: 'center' }}>
                  <img
                    src={asset.invoiceImage}
                    alt="Invoice proof"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '420px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-default)',
                    }}
                  />
                  <div style={{ marginTop: '0.75rem' }}>
                    <a
                      href={asset.invoiceImage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline btn-sm"
                    >
                      <ExternalLink size={14} />
                      <span>Open Document in New Tab</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-faint)' }}>
                  <FileText size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                  <div>No invoice scan or delivery receipt uploaded for this system.</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer with Direct Actions */}
        <div
          className="modal-footer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div className="modal-footer-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            {asset.status === 'Available' && onAssign && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onAssign(asset);
                }}
                className="btn btn-primary btn-sm"
                style={{ backgroundColor: '#059669', borderColor: '#059669' }}
              >
                <UserCheck size={14} />
                <span>Assign to Staff</span>
              </button>
            )}

            {asset.status === 'Assigned' && onTransfer && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onTransfer(asset);
                }}
                className="btn btn-primary btn-sm"
                style={{ backgroundColor: '#4f46e5', borderColor: '#4f46e5' }}
              >
                <ArrowRightLeft size={14} />
                <span>Transfer Custody</span>
              </button>
            )}

            {asset.status === 'Assigned' && onReturn && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onReturn(asset);
                }}
                className="btn btn-outline btn-sm"
                style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)' }}
              >
                <Undo2 size={14} />
                <span>Return to Stock</span>
              </button>
            )}

            {asset.status === 'Under Maintenance' && onReturn && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onReturn(asset);
                }}
                className="btn btn-primary btn-sm"
                style={{ backgroundColor: '#059669', borderColor: '#059669' }}
              >
                <CheckCircle2 size={14} />
                <span>Mark Repaired / In Stock</span>
              </button>
            )}

            {onMaintenance && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onMaintenance(asset);
                }}
                className="btn btn-outline btn-sm"
                style={{ color: '#fbbf24', borderColor: 'rgba(251, 191, 36, 0.4)' }}
              >
                <Wrench size={14} />
                <span>Log Service</span>
              </button>
            )}

            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(asset);
                }}
                className="btn btn-outline btn-sm"
              >
                <Edit3 size={14} />
                <span>Edit Asset</span>
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDelete(asset);
                }}
                className="btn btn-ghost btn-sm"
                style={{ color: '#f87171' }}
                title="Permanently remove asset record"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            )}
          </div>

          <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}