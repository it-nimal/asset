import React, { useState } from 'react';
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
  DollarSign,
  Cpu,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { STATUS_COLORS } from './AssetTable';

export default function AssetDetailsModal({ asset, onClose, initialTab = 'overview' }) {
  const [tab, setTab] = useState(initialTab);

  if (!asset) return null;

  const stColor = STATUS_COLORS[asset.status] || STATUS_COLORS.Available;

  // Calculate days remaining on warranty
  let warrantyDaysRemaining = null;
  if (asset.warrantyEndDate) {
    const diffTime = new Date(asset.warrantyEndDate) - new Date();
    warrantyDaysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        zIndex: 999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#131d36',
          border: '1px solid #334155',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '920px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header Banner */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#0b1329',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em' }}>
                {asset.make} {asset.model}
              </h2>
              <span
                style={{
                  padding: '0.2rem 0.65rem',
                  borderRadius: '9999px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  backgroundColor: stColor.bg,
                  color: stColor.text,
                  border: `1px solid ${stColor.border}`,
                }}
              >
                ● {asset.status}
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 600, marginTop: '2px' }}>
              Tag: {asset.assetNo || 'AST-N/A'} • Serial No: {asset.sr} • Plant: {asset.plant}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '0.4rem',
              borderRadius: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* 6 Tabs Bar (Section 6: Overview, Assignment, History, Maintenance, Warranty, Documents) */}
        <div
          style={{
            display: 'flex',
            gap: '0.4rem',
            padding: '0.75rem 1.75rem',
            borderBottom: '1px solid #1e293b',
            backgroundColor: '#0f172a',
            overflowX: 'auto',
          }}
        >
          {[
            { id: 'overview', label: '1. Overview', icon: Laptop },
            { id: 'assignment', label: '2. Assignment', icon: User },
            { id: 'history', label: '3. Lifecycle History', icon: History },
            { id: 'maintenance', label: '4. Maintenance', icon: Wrench },
            { id: 'warranty', label: '5. Warranty', icon: ShieldCheck },
            { id: 'documents', label: '6. Documents & Invoices', icon: FileText },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.5rem 0.9rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: isActive ? '#4f46e5' : 'transparent',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  fontSize: '0.82rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon size={15} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body Content */}
        <div style={{ padding: '1.75rem', overflowY: 'auto', flex: 1, backgroundColor: '#131d36' }}>
          {/* TAB 1: OVERVIEW */}
          {tab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
              <div style={sectionBoxStyle}>
                <h4 style={sectionTitleStyle}>💻 Hardware Specifications</h4>
                <div style={infoRowStyle}><span style={labelStyle}>Device Type:</span> <span>{asset.deviceType || 'Laptop'}</span></div>
                <div style={infoRowStyle}><span style={labelStyle}>Processor:</span> <span>{asset.processor || 'N/A'}</span></div>
                <div style={infoRowStyle}><span style={labelStyle}>RAM Memory:</span> <span>{asset.ramSize || 'N/A'}</span></div>
                <div style={infoRowStyle}><span style={labelStyle}>Primary Storage:</span> <span>{asset.storage || 'N/A'}</span></div>
                <div style={infoRowStyle}><span style={labelStyle}>Condition:</span> <span>{asset.workingCondition || 'Good'}</span></div>
              </div>

              <div style={sectionBoxStyle}>
                <h4 style={sectionTitleStyle}>🌐 Network & Identity</h4>
                <div style={infoRowStyle}><span style={labelStyle}>Hostname:</span> <code style={{ color: '#38bdf8' }}>{asset.hostName || 'VIT-WKS'}</code></div>
                <div style={infoRowStyle}><span style={labelStyle}>IP Address:</span> <span>{asset.ipAddress || 'DHCP Dynamic'}</span></div>
                <div style={infoRowStyle}><span style={labelStyle}>MAC Address:</span> <span style={{ fontFamily: 'monospace' }}>{asset.macAddress || 'N/A'}</span></div>
                <div style={infoRowStyle}><span style={labelStyle}>Location:</span> <span>{asset.plant || 'Vitromed HQ'}</span></div>
                <div style={infoRowStyle}><span style={labelStyle}>Floor / Cabin:</span> <span>{asset.floorCabin || 'IT Stock Room'}</span></div>
              </div>

              <div style={sectionBoxStyle}>
                <h4 style={sectionTitleStyle}>💰 Procurement & Commercials</h4>
                <div style={infoRowStyle}><span style={labelStyle}>Purchase Price:</span> <span style={{ fontWeight: 700, color: '#34d399' }}>₹{asset.purchasePrice?.toLocaleString() || '0'}</span></div>
                <div style={infoRowStyle}><span style={labelStyle}>Current Value:</span> <span>₹{asset.currentValue?.toLocaleString() || '0'}</span></div>
                <div style={infoRowStyle}><span style={labelStyle}>Vendor Name:</span> <span>{asset.vendorName || 'Direct Vendor'}</span></div>
                <div style={infoRowStyle}><span style={labelStyle}>PO Number:</span> <span>{asset.po || 'N/A'}</span></div>
                <div style={infoRowStyle}><span style={labelStyle}>Bill Number:</span> <span>{asset.billNo || 'N/A'}</span></div>
              </div>

              <div style={sectionBoxStyle}>
                <h4 style={sectionTitleStyle}>🔑 Software & OS Licenses</h4>
                <div style={infoRowStyle}><span style={labelStyle}>Operating System:</span> <span>{asset.osVersion || 'Windows 11 Pro'}</span></div>
                <div style={infoRowStyle}><span style={labelStyle}>Windows Key:</span> <code style={{ color: '#34d399', fontSize: '0.75rem' }}>{asset.windowsKey || 'OEM Digital'}</code></div>
                <div style={infoRowStyle}><span style={labelStyle}>Office Suite:</span> <span>{asset.officeSoftware || 'Office 365'}</span></div>
                <div style={infoRowStyle}><span style={labelStyle}>Endpoint Antivirus:</span> <span>{asset.antivirus || 'QuickHeal'}</span></div>
              </div>
            </div>
          )}

          {/* TAB 2: ASSIGNMENT */}
          {tab === 'assignment' && (
            <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={sectionBoxStyle}>
                <h4 style={sectionTitleStyle}>👤 Current Allocation State</h4>
                <div style={infoRowStyle}><span style={labelStyle}>Assigned Employee:</span> <span style={{ fontWeight: 700, color: '#ffffff' }}>{asset.userName || 'Unassigned (In Stock)'}</span></div>
                <div style={infoRowStyle}><span style={labelStyle}>Employee ID:</span> <span>{asset.empCode || '—'}</span></div>
                <div style={infoRowStyle}><span style={labelStyle}>Official Email:</span> <span>{asset.mailId || '—'}</span></div>
                <div style={infoRowStyle}><span style={labelStyle}>Department:</span> <span>{asset.department || '—'}</span></div>
                <div style={infoRowStyle}><span style={labelStyle}>Assignment Date:</span> <span>{asset.assignedDate ? new Date(asset.assignedDate).toLocaleDateString() : '—'}</span></div>
                <div style={infoRowStyle}><span style={labelStyle}>Expected Return:</span> <span>{asset.expectedReturnDate ? new Date(asset.expectedReturnDate).toLocaleDateString() : 'Permanent Assignment'}</span></div>
              </div>
              <div style={sectionBoxStyle}>
                <h4 style={sectionTitleStyle}>📝 Handover Remarks & Notes</h4>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.5 }}>
                  {asset.remarks || 'No handover remarks recorded for this device.'}
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: LIFECYCLE TIMELINE HISTORY */}
          {tab === 'history' && (
            <div>
              <h4 style={{ ...sectionTitleStyle, marginBottom: '1.25rem' }}>⏳ Complete Lifecycle Audit Timeline</h4>
              {(!asset.history || asset.history.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No timeline events logged yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '2px solid #334155', paddingLeft: '1.25rem', marginLeft: '0.75rem' }}>
                  {asset.history.map((h, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      <div
                        style={{
                          position: 'absolute',
                          left: '-1.65rem',
                          top: '2px',
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: h.action === 'Assigned' ? '#06b6d4' : (h.action === 'Maintenance' ? '#f59e0b' : '#6366f1'),
                        }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.88rem' }}>{h.action}</span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{new Date(h.date || Date.now()).toLocaleDateString()}</span>
                      </div>
                      <div style={{ color: '#818cf8', fontSize: '0.75rem', fontWeight: 600, marginTop: '2px' }}>by {h.user || 'Admin'}</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: '0.35rem' }}>{h.details}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MAINTENANCE */}
          {tab === 'maintenance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={sectionBoxStyle}>
                <h4 style={sectionTitleStyle}>🛠️ Service & Repair Profile</h4>
                <div style={infoRowStyle}><span style={labelStyle}>Current Health State:</span> <span>{asset.status === 'Under Maintenance' ? '⚠️ Under Maintenance / In Service' : '✅ Active & Operational'}</span></div>
                <div style={infoRowStyle}><span style={labelStyle}>Working Condition:</span> <span>{asset.workingCondition || 'Good'}</span></div>
                <div style={infoRowStyle}><span style={labelStyle}>Maintenance Support:</span> <span>Authorized OEM Partner Service</span></div>
              </div>
            </div>
          )}

          {/* TAB 5: WARRANTY */}
          {tab === 'warranty' && (
            <div style={{ maxWidth: '650px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={sectionBoxStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={sectionTitleStyle}>🛡️ Warranty Information</h4>
                  {warrantyDaysRemaining !== null && (
                    <span
                      style={{
                        padding: '0.3rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: warrantyDaysRemaining <= 30 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                        color: warrantyDaysRemaining <= 30 ? '#f87171' : '#34d399',
                        border: `1px solid ${warrantyDaysRemaining <= 30 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
                      }}
                    >
                      {warrantyDaysRemaining > 0 ? `${warrantyDaysRemaining} Days Remaining` : 'Warranty Expired'}
                    </span>
                  )}
                </div>

                <div style={infoRowStyle}><span style={labelStyle}>Warranty Provider:</span> <span>{asset.make} OEM Direct Support</span></div>
                <div style={infoRowStyle}><span style={labelStyle}>Coverage Scope:</span> <span>{asset.warrantyDetails || '3 Years Comprehensive On-Site'}</span></div>
                <div style={infoRowStyle}><span style={labelStyle}>Warranty Start Date:</span> <span>{asset.warrantyStartDate ? new Date(asset.warrantyStartDate).toLocaleDateString() : 'N/A'}</span></div>
                <div style={infoRowStyle}><span style={labelStyle}>Warranty End Date:</span> <span style={{ fontWeight: 700, color: '#f8fafc' }}>{asset.warrantyEndDate ? new Date(asset.warrantyEndDate).toLocaleDateString() : 'N/A'}</span></div>
              </div>
            </div>
          )}

          {/* TAB 6: DOCUMENTS & INVOICES (PDF/IMAGE VIEWER) */}
          {tab === 'documents' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {asset.invoiceImage ? (
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '1rem' }}>
                    <span style={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.9rem' }}>
                      🧾 Attached Tax Invoice / Bill Copy (Bill No: {asset.billNo || 'N/A'})
                    </span>
                    <a
                      href={asset.invoiceImage}
                      download={`Invoice_${asset.sr || 'asset'}.${asset.invoiceImage?.startsWith('data:application/pdf') ? 'pdf' : 'jpg'}`}
                      style={{
                        padding: '0.35rem 0.85rem',
                        backgroundColor: '#4f46e5',
                        color: '#fff',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                      }}
                    >
                      ⬇️ Download Original
                    </a>
                  </div>

                  {asset.invoiceImage?.startsWith('data:application/pdf') ? (
                    <iframe
                      src={asset.invoiceImage}
                      title="Invoice PDF Preview"
                      style={{
                        width: '100%',
                        height: '60vh',
                        border: '1px solid #334155',
                        borderRadius: '10px',
                        backgroundColor: '#0f172a',
                      }}
                    />
                  ) : (
                    <img
                      src={asset.invoiceImage}
                      alt="Invoice Copy"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '60vh',
                        borderRadius: '10px',
                        objectFit: 'contain',
                        border: '1px solid #334155',
                      }}
                    />
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748b' }}>
                  <FileText size={36} style={{ marginBottom: '0.5rem', opacity: 0.4 }} />
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#94a3b8' }}>No Invoice Document Attached</div>
                  <div style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>You can attach tax invoices or gate pass receipts during asset inward entry.</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const sectionBoxStyle = {
  backgroundColor: '#0b1329',
  border: '1px solid #1e293b',
  borderRadius: '10px',
  padding: '1.25rem',
};

const sectionTitleStyle = {
  fontSize: '0.88rem',
  fontWeight: 700,
  color: '#818cf8',
  marginBottom: '0.85rem',
  borderBottom: '1px solid #1e293b',
  paddingBottom: '0.45rem',
};

const infoRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0.35rem 0',
  fontSize: '0.8rem',
  color: '#cbd5e1',
};

const labelStyle = {
  color: '#64748b',
  fontWeight: 600,
};