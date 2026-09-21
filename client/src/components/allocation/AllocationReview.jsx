import React from 'react';
import { User, Laptop, Calendar, MapPin, Tag, FileText, CheckCircle2, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function AllocationReview({
  employee,
  selectedAssets = [],
  allocationDate,
  location,
  purpose,
  expectedReturnDate,
  remarks,
  onBack,
  onConfirm,
  loading = false,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ backgroundColor: 'rgba(2, 132, 199, 0.08)', border: '1px solid rgba(2, 132, 199, 0.25)', borderRadius: '8px', padding: '0.85rem 1rem' }}>
        <h4 style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0284c7', margin: 0, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <ShieldCheck size={16} />
          Review Asset Allocation & Issuance Details
        </h4>
        <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '3px 0 0' }}>
          Please verify the recipient custodian, hardware tags, and issuance parameters before generating custody records.
        </p>
      </div>

      {/* 1. Recipient Employee Bio */}
      <div style={{ backgroundColor: 'var(--bg-surface-raised, #f8fafc)', border: '1px solid var(--border-default)', borderRadius: '8px', padding: '1rem' }}>
        <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          Custodian Information
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.82rem' }}>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Name</span>
            <strong style={{ color: 'var(--text-primary)' }}>{employee.name}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Employee ID</span>
            <strong style={{ fontFamily: 'monospace', color: '#0284c7' }}>{employee.employeeId || 'NO-ID'}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Department</span>
            <span>{employee.department || 'General'}</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Designation</span>
            <span>{employee.designation || 'Staff'}</span>
          </div>
        </div>
      </div>

      {/* 2. Issued Hardware Fleet */}
      <div style={{ backgroundColor: 'var(--bg-surface-raised, #f8fafc)', border: '1px solid var(--border-default)', borderRadius: '8px', padding: '1rem' }}>
        <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          Hardware Issued in this Transaction ({selectedAssets.length} item{selectedAssets.length > 1 ? 's' : ''})
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {selectedAssets.map((asset, idx) => (
            <div
              key={asset._id || idx}
              style={{
                backgroundColor: 'var(--bg-surface, #ffffff)',
                border: '1px solid var(--border-default)',
                borderRadius: '6px',
                padding: '0.65rem 0.85rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#0284c7', fontSize: '0.84rem' }}>
                    {asset.assetNo || asset.sr}
                  </span>
                  <strong style={{ fontSize: '0.84rem', color: 'var(--text-primary)' }}>
                    {asset.make} {asset.model}
                  </strong>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    ({asset.deviceType || 'Hardware'})
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  S/N: {asset.sr || 'N/A'} {asset.accessories ? '• Acc: ' + asset.accessories : ''}
                </div>
              </div>

              <span style={{ fontSize: '0.7rem', padding: '0.12rem 0.45rem', borderRadius: '4px', backgroundColor: 'rgba(2, 132, 199, 0.1)', color: '#0284c7', fontWeight: 700 }}>
                Will change to: Assigned
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Issuance Parameters */}
      <div style={{ backgroundColor: 'var(--bg-surface-raised, #f8fafc)', border: '1px solid var(--border-default)', borderRadius: '8px', padding: '1rem' }}>
        <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          Issuance Parameters
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.82rem' }}>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Allocation Date</span>
            <strong>{allocationDate ? new Date(allocationDate).toLocaleDateString('en-GB') : 'Today'}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Issuing Facility</span>
            <strong>{location}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Purpose</span>
            <strong>{purpose}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Expected Return</span>
            <span>{expectedReturnDate ? new Date(expectedReturnDate).toLocaleDateString('en-GB') : 'Permanent / Ongoing'}</span>
          </div>
        </div>
        {remarks && (
          <div style={{ marginTop: '0.65rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-default)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            <strong>Remarks:</strong> {remarks}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="btn btn-outline btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <ArrowLeft size={14} />
          Back to Edit
        </button>

        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="btn btn-primary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}
        >
          <CheckCircle2 size={15} />
          {loading ? 'Committing Allocation...' : 'Confirm & Issue Hardware'}
        </button>
      </div>
    </div>
  );
}
