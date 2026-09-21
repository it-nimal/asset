import React from 'react';
import { ArrowRightLeft, User, Laptop, CheckCircle2, Calendar, MapPin, Tag, Shield, AlertCircle, ArrowLeft } from 'lucide-react';

export default function TransferReview({
  transferData,
  asset,
  fromEmployee,
  toEmployee,
  onBack,
  onConfirm,
  loading = false,
}) {
  const formattedDate = transferData?.transferDate
    ? new Date(transferData.transferDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Overview Banner */}
      <div
        style={{
          padding: '1rem 1.25rem',
          backgroundColor: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'rgba(56, 189, 248, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#38bdf8',
            flexShrink: 0,
          }}
        >
          <ArrowRightLeft size={20} />
        </div>
        <div>
          <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.98rem' }}>
            Review Custody Transfer Request
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            Please verify all details before submitting. Once approved and acknowledged, custody will atomically switch to the new employee.
          </div>
        </div>
      </div>

      {/* From -> To Comparison Block */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.75rem', alignItems: 'center' }}>
        {/* Previous Custodian */}
        <div
          style={{
            padding: '1rem',
            backgroundColor: 'rgba(239, 68, 68, 0.05)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            Current Custodian (From)
          </div>
          <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
            {asset?.userName || fromEmployee?.name || 'Current Custodian'}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#38bdf8', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
            {asset?.empCode || fromEmployee?.employeeId || 'NO-CODE'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            {asset?.department || fromEmployee?.department || 'N/A'} • {asset?.plant || fromEmployee?.location || 'Vitromed'}
          </div>
        </div>

        {/* Transfer Arrow Icon */}
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

        {/* Destination Custodian */}
        <div
          style={{
            padding: '1rem',
            backgroundColor: 'rgba(16, 185, 129, 0.05)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            New Custodian (To)
          </div>
          <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
            {toEmployee?.name || transferData?.toEmployeeName || 'New Employee'}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#34d399', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
            {toEmployee?.employeeId || transferData?.toEmpCode || 'NO-CODE'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            {toEmployee?.department || transferData?.toDepartment || 'N/A'} • {transferData?.destinationLocation || toEmployee?.location || 'Vitromed'}
          </div>
        </div>
      </div>

      {/* Asset Specifications Card */}
      <div
        style={{
          padding: '1rem 1.25rem',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Laptop size={18} color="#38bdf8" />
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                {asset?.make} {asset?.model}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {asset?.deviceType || asset?.category || 'Hardware Equipment'}
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
              {asset?.assetNo || 'AST-N/A'}
            </span>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
              S/N: {asset?.sr || 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Transfer Parameters Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.75rem',
          padding: '1rem',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.8rem',
        }}
      >
        <div>
          <div style={{ color: 'var(--text-faint)', fontSize: '0.72rem' }}>Transfer Date</div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.15rem' }}>
            {formattedDate}
          </div>
        </div>

        <div>
          <div style={{ color: 'var(--text-faint)', fontSize: '0.72rem' }}>Transfer Reason</div>
          <div style={{ fontWeight: 600, color: '#38bdf8', marginTop: '0.15rem' }}>
            {transferData?.reason || 'Employee Transfer'}
          </div>
        </div>

        <div>
          <div style={{ color: 'var(--text-faint)', fontSize: '0.72rem' }}>Asset Condition</div>
          <div style={{ fontWeight: 600, color: '#34d399', marginTop: '0.15rem' }}>
            {transferData?.assetCondition || 'Good'}
          </div>
        </div>

        <div>
          <div style={{ color: 'var(--text-faint)', fontSize: '0.72rem' }}>Accessories Transferred</div>
          <div style={{ fontWeight: 600, color: transferData?.accessoriesTransferred ? '#34d399' : '#f87171', marginTop: '0.15rem' }}>
            {transferData?.accessoriesTransferred ? 'Yes (Moving with asset)' : 'No (Retained in dept)'}
          </div>
        </div>
      </div>

      {/* Accessories & Remarks */}
      {(transferData?.accessoryNotes || transferData?.remarks) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.78rem' }}>
          {transferData?.accessoryNotes && (
            <div style={{ padding: '0.6rem 0.85rem', backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <strong style={{ color: 'var(--text-secondary)' }}>Accessories List: </strong>
              <span style={{ color: 'var(--text-muted)' }}>{transferData.accessoryNotes}</span>
            </div>
          )}
          {transferData?.remarks && (
            <div style={{ padding: '0.6rem 0.85rem', backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <strong style={{ color: 'var(--text-secondary)' }}>Remarks / Handover Notes: </strong>
              <span style={{ color: 'var(--text-muted)' }}>{transferData.remarks}</span>
            </div>
          )}
        </div>
      )}

      {/* Action Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '0.5rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-default)',
        }}
      >
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
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: '160px', justifyContent: 'center' }}
        >
          {loading ? (
            'Initiating Transfer...'
          ) : (
            <>
              <CheckCircle2 size={16} />
              Confirm & Initiate Transfer
            </>
          )}
        </button>
      </div>
    </div>
  );
}
