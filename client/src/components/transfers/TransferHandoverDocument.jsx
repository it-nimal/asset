import React from 'react';
import { Printer, X, ShieldCheck, ArrowRightLeft } from 'lucide-react';
import logo from '../photos/VitromedLogo.png';

export default function TransferHandoverDocument({
  transfer,
  asset,
  onClose,
}) {
  const handlePrint = () => {
    window.print();
  };

  const formattedDate = transfer?.transferDate
    ? new Date(transfer.transferDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 110 }}>
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
        <div
          className="no-print"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem',
            borderBottom: '1px solid #e2e8f0',
            paddingBottom: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowRightLeft size={18} color="#0284c7" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
              Official Asset Transfer & Custody Handover Document
            </h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={handlePrint}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#0284c7', borderColor: '#0284c7', color: '#fff' }}
            >
              <Printer size={14} />
              Print Handover Document
            </button>
            <button type="button" onClick={onClose} className="btn btn-ghost btn-icon btn-xs" style={{ color: '#64748b' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0284c7', paddingBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <img src={logo} alt="Vitromed Logo" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
              <div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
                  VITROMED HEALTHCARE
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Information Technology • Inter-Custodian Asset Transfer Form
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0284c7', fontFamily: 'monospace' }}>
                {transfer?.transferId || 'TRF-VIT-OFFICIAL'}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                Transfer Date: <strong>{formattedDate}</strong>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                Facility / Site: <strong>{transfer?.destinationLocation || transfer?.toLocation || 'Vitromed'}</strong>
              </div>
            </div>
          </div>

          {/* Section 1: Custodians (From -> To) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* From Custodian */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.75rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', borderBottom: '1px solid #fecaca', paddingBottom: '2px' }}>
                1. Previous Custodian (Transferor)
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '3px 4px', color: '#64748b', width: '40%' }}>Employee Name:</td>
                    <td style={{ padding: '3px 4px', fontWeight: 700, color: '#0f172a' }}>{transfer?.fromEmployeeName || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '3px 4px', color: '#64748b' }}>Employee Code:</td>
                    <td style={{ padding: '3px 4px', fontWeight: 700, fontFamily: 'monospace', color: '#0284c7' }}>{transfer?.fromEmpCode || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '3px 4px', color: '#64748b' }}>Department:</td>
                    <td style={{ padding: '3px 4px', fontWeight: 600, color: '#0f172a' }}>{transfer?.fromDepartment || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '3px 4px', color: '#64748b' }}>Plant / Location:</td>
                    <td style={{ padding: '3px 4px', color: '#0f172a' }}>{transfer?.fromLocation || 'Vitromed'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* To Custodian */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.75rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', borderBottom: '1px solid #bbf7d0', paddingBottom: '2px' }}>
                2. Destination Custodian (Transferee)
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '3px 4px', color: '#64748b', width: '40%' }}>Employee Name:</td>
                    <td style={{ padding: '3px 4px', fontWeight: 700, color: '#0f172a' }}>{transfer?.toEmployeeName || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '3px 4px', color: '#64748b' }}>Employee Code:</td>
                    <td style={{ padding: '3px 4px', fontWeight: 700, fontFamily: 'monospace', color: '#16a34a' }}>{transfer?.toEmpCode || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '3px 4px', color: '#64748b' }}>Department:</td>
                    <td style={{ padding: '3px 4px', fontWeight: 600, color: '#0f172a' }}>{transfer?.toDepartment || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '3px 4px', color: '#64748b' }}>Destination Site:</td>
                    <td style={{ padding: '3px 4px', color: '#0f172a' }}>{transfer?.destinationLocation || transfer?.toLocation || 'Vitromed'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Asset Details */}
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '2px' }}>
              3. Transferred IT Equipment & Hardware Specifications
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', border: '1px solid #e2e8f0' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 700, color: '#475569' }}>Asset Tag</th>
                  <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 700, color: '#475569' }}>Category / Type</th>
                  <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 700, color: '#475569' }}>Make & Model</th>
                  <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 700, color: '#475569' }}>Serial Number</th>
                  <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 700, color: '#475569' }}>Condition</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '6px 8px', fontWeight: 700, fontFamily: 'monospace', color: '#0284c7' }}>{transfer?.assetTag || asset?.assetNo || 'N/A'}</td>
                  <td style={{ padding: '6px 8px' }}>{transfer?.assetCategory || asset?.deviceType || 'Computing'}</td>
                  <td style={{ padding: '6px 8px', fontWeight: 600 }}>{transfer?.assetMake || asset?.make} {transfer?.assetModel || asset?.model}</td>
                  <td style={{ padding: '6px 8px', fontFamily: 'monospace', color: '#475569' }}>{transfer?.assetSerial || asset?.sr || 'N/A'}</td>
                  <td style={{ padding: '6px 8px', fontWeight: 600, color: '#16a34a' }}>{transfer?.assetCondition || 'Good'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 3: Accessories & Transfer Purpose */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.75rem', fontSize: '0.78rem' }}>
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.3rem' }}>Accessories Transferred:</div>
              <div style={{ color: '#475569', lineHeight: 1.4 }}>
                {transfer?.accessoriesTransferred ? '✓ Power Adapter, Power Cable, Mouse / Carrying Bag' : '✗ No external accessories transferred'}
                {transfer?.accessoryNotes ? ` — ${transfer.accessoryNotes}` : ''}
              </div>
            </div>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.75rem', fontSize: '0.78rem' }}>
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.3rem' }}>Transfer Reason & Remarks:</div>
              <div style={{ color: '#475569', lineHeight: 1.4 }}>
                <strong>Reason: </strong> {transfer?.reason || 'Employee Transfer'}
                {transfer?.remarks ? `<br /><strong>Notes: </strong> ${transfer.remarks}` : ''}
              </div>
            </div>
          </div>

          {/* Section 4: Undertaking Declaration */}
          <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.74rem', color: '#334155', lineHeight: 1.5 }}>
            <strong>CUSTODY & USAGE UNDERTAKING:</strong>
            <br />
            I hereby acknowledge receipt of the IT asset and accessories detailed above in good and operational working condition. I agree to abide by Vitromed Healthcare's Information Security and Acceptable Usage Policies, and accept full responsibility for the proper care, safeguarding, and business use of this equipment.
          </div>

          {/* Section 5: Signature Blocks */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem', marginTop: '1.5rem', paddingTop: '0.5rem' }}>
            <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '0.4rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>{transfer?.fromEmployeeName || 'Previous Custodian'}</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Transferor Signature & Date</div>
            </div>

            <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '0.4rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>{transfer?.toEmployeeName || 'New Custodian'}</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Transferee Signature & Date</div>
            </div>

            <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '0.4rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>{transfer?.approvedBy || 'IT / Authorized Person'}</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>IT Department Signature</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
