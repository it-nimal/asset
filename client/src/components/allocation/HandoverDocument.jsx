import React from 'react';
import { Printer, X, Download, ShieldCheck } from 'lucide-react';
import logo from '../photos/VitromedLogo.png';

export default function HandoverDocument({
  allocationRef,
  employee,
  issuedAssets = [],
  allocationDate,
  location,
  purpose,
  remarks,
  onClose,
}) {
  const handlePrint = () => {
    window.print();
  };

  const formattedDate = allocationDate
    ? new Date(allocationDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 100 }}>
      <div
        className="modal-content handover-printable-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '850px',
          width: '95vw',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          color: '#0f172a',
          padding: '1.5rem',
          borderRadius: '10px',
          overflowY: 'auto',
        }}
      >
        {/* Top Screen Action Bar */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={18} color="#0284c7" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
              Official IT Asset Handover & Undertaking
            </h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button type="button" onClick={handlePrint} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Printer size={14} />
              Print Handover Sheet
            </button>
            <button type="button" onClick={onClose} className="btn btn-ghost btn-icon btn-xs" style={{ color: '#64748b' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0284c7', paddingBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <img src={logo} alt="Vitromed Logo" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
              <div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
                  VITROMED HEALTHCARE
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Information Technology Asset Custody & Undertaking
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0284c7', fontFamily: 'monospace' }}>
                {allocationRef || 'ALC-VIT-OFFICIAL'}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                Date: <strong>{formattedDate}</strong>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                Facility: <strong>{location || 'Vitromed'}</strong>
              </div>
            </div>
          </div>

          {/* Section 1: Employee Information */}
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '2px' }}>
              1. Custodian Details
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '4px 8px', width: '25%', color: '#64748b', fontWeight: 600 }}>Employee Name:</td>
                  <td style={{ padding: '4px 8px', width: '25%', fontWeight: 700, color: '#0f172a' }}>{employee?.name}</td>
                  <td style={{ padding: '4px 8px', width: '25%', color: '#64748b', fontWeight: 600 }}>Employee ID:</td>
                  <td style={{ padding: '4px 8px', width: '25%', fontWeight: 700, fontFamily: 'monospace', color: '#0284c7' }}>{employee?.employeeId || 'N/A'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 8px', color: '#64748b', fontWeight: 600 }}>Department:</td>
                  <td style={{ padding: '4px 8px', color: '#0f172a' }}>{employee?.department || 'General'}</td>
                  <td style={{ padding: '4px 8px', color: '#64748b', fontWeight: 600 }}>Designation:</td>
                  <td style={{ padding: '4px 8px', color: '#0f172a' }}>{employee?.designation || 'Staff'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 8px', color: '#64748b', fontWeight: 600 }}>Official Email:</td>
                  <td style={{ padding: '4px 8px', color: '#0f172a' }}>{employee?.email || '—'}</td>
                  <td style={{ padding: '4px 8px', color: '#64748b', fontWeight: 600 }}>Issuance Purpose:</td>
                  <td style={{ padding: '4px 8px', color: '#0f172a', fontWeight: 600 }}>{purpose || 'Regular Work'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 2: Issued Hardware Items Table */}
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '2px' }}>
              2. Issued IT Assets & Serial Inventory
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem', border: '1px solid #cbd5e1' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                  <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 700 }}>#</th>
                  <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 700 }}>Asset Tag</th>
                  <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 700 }}>Device / Category</th>
                  <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 700 }}>Make & Model</th>
                  <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 700 }}>Serial Number</th>
                  <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 700 }}>Specs & Accessories</th>
                </tr>
              </thead>
              <tbody>
                {issuedAssets.map((asset, idx) => (
                  <tr key={asset._id || idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '6px 8px', fontWeight: 600 }}>{idx + 1}</td>
                    <td style={{ padding: '6px 8px', fontFamily: 'monospace', fontWeight: 800, color: '#0284c7' }}>
                      {asset.assetNo || asset.sr}
                    </td>
                    <td style={{ padding: '6px 8px' }}>{asset.deviceType || asset.category || 'Hardware'}</td>
                    <td style={{ padding: '6px 8px', fontWeight: 700 }}>{asset.make} {asset.model}</td>
                    <td style={{ padding: '6px 8px', fontFamily: 'monospace' }}>{asset.sr || 'N/A'}</td>
                    <td style={{ padding: '6px 8px', color: '#475569', fontSize: '0.72rem' }}>
                      {[
                        asset.processor,
                        asset.ramSize ? 'RAM: ' + asset.ramSize : null,
                        asset.storage ? 'SSD: ' + asset.storage : null,
                        asset.accessories ? 'Acc: ' + asset.accessories : null
                      ].filter(Boolean).join(' | ') || 'Standard Equipment'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 3: Employee Terms & Undertaking */}
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '2px' }}>
              3. Custodian Undertaking & Security Terms
            </div>
            <div style={{ fontSize: '0.72rem', color: '#334155', lineHeight: 1.5, backgroundColor: '#f8fafc', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <ol style={{ margin: 0, paddingLeft: '1.2rem' }}>
                <li>I hereby acknowledge receipt of the corporate IT hardware listed above in good working condition.</li>
                <li>I agree to use the equipment exclusively for authorized business operations of Vitromed Healthcare.</li>
                <li>I agree to protect all company confidential data and uphold cybersecurity policies.</li>
                <li>In the event of separation, exit, or transfer, I agree to immediately return all issued equipment and accessories intact to the IT Department.</li>
              </ol>
            </div>
          </div>

          {/* Section 4: Signatures */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #cbd5e1' }}>
            <div style={{ width: '40%', textAlign: 'center' }}>
              <div style={{ height: '45px', borderBottom: '1px dashed #64748b', marginBottom: '0.35rem' }} />
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>{employee?.name}</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Employee Signature & Date</div>
            </div>

            <div style={{ width: '40%', textAlign: 'center' }}>
              <div style={{ height: '45px', borderBottom: '1px dashed #64748b', marginBottom: '0.35rem' }} />
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>IT Department Representative</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Authorized IT Officer & Date</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
