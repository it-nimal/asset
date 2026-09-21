import React from 'react';

const STATUS_STYLES = {
  Pending: {
    bg: 'var(--status-pending-bg, #fffbeb)',
    text: 'var(--status-pending-text, #92400e)',
    border: 'var(--status-pending-border, #fde68a)',
    dot: 'var(--status-pending-accent, #d97706)',
    label: 'Pending Approval',
  },
  Approved: {
    bg: 'var(--status-assigned-bg, #eff6ff)',
    text: 'var(--status-assigned-text, #1e40af)',
    border: 'var(--status-assigned-border, #bfdbfe)',
    dot: 'var(--status-assigned-accent, #2563eb)',
    label: 'Approved',
  },
  'Handover Pending': {
    bg: 'var(--status-pending-bg, #fffbeb)',
    text: 'var(--status-pending-text, #92400e)',
    border: 'var(--status-pending-border, #fde68a)',
    dot: 'var(--status-pending-accent, #d97706)',
    label: 'Handover Pending',
  },
  'Acknowledgement Pending': {
    bg: 'var(--status-warning-bg, #fff7ed)',
    text: 'var(--status-warning-text, #9a3412)',
    border: 'var(--status-warning-border, #fed7aa)',
    dot: 'var(--status-warning-accent, #ea580c)',
    label: 'Ack. Pending',
  },
  Completed: {
    bg: 'var(--status-available-bg, #f0fdf4)',
    text: 'var(--status-available-text, #166534)',
    border: 'var(--status-available-border, #bbf7d0)',
    dot: 'var(--status-available-accent, #16a34a)',
    label: 'Completed',
  },
  Cancelled: {
    bg: 'var(--status-lost-bg, #fef2f2)',
    text: 'var(--status-lost-text, #991b1b)',
    border: 'var(--status-lost-border, #fecaca)',
    dot: 'var(--status-lost-accent, #dc2626)',
    label: 'Cancelled',
  },
};

export default function TransferStatusBadge({ status, size = 'md' }) {
  const conf = STATUS_STYLES[status] || {
    bg: 'var(--bg-surface-raised, #f1f5f9)',
    text: 'var(--text-muted, #64748b)',
    border: 'var(--border-default, #e2e8f0)',
    dot: 'var(--text-muted, #64748b)',
    label: status || 'Unknown',
  };

  const isSmall = size === 'sm';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: isSmall ? '0.12rem 0.45rem' : '0.18rem 0.55rem',
        borderRadius: '9999px',
        fontSize: isSmall ? '0.7rem' : '0.74rem',
        fontWeight: 600,
        backgroundColor: conf.bg,
        color: conf.text,
        border: `1px solid ${conf.border}`,
        whiteSpace: 'nowrap',
        letterSpacing: '0.01em',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: conf.dot,
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
      {conf.label}
    </span>
  );
}
