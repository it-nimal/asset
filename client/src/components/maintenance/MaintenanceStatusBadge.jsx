import React from 'react';

const STATUS_CONFIG = {
  Reported: {
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.12)',
    border: 'rgba(59, 130, 246, 0.28)',
    label: 'Reported',
  },
  'Under Diagnosis': {
    color: '#6366f1',
    bg: 'rgba(99, 102, 241, 0.12)',
    border: 'rgba(99, 102, 241, 0.28)',
    label: 'Under Diagnosis',
  },
  'In Repair': {
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.28)',
    label: 'In Repair',
    pulse: true,
  },
  'Awaiting Vendor': {
    color: '#0284c7',
    bg: 'rgba(2, 132, 199, 0.12)',
    border: 'rgba(2, 132, 199, 0.28)',
    label: 'Awaiting Vendor',
  },
  'Awaiting Parts': {
    color: '#ea580c',
    bg: 'rgba(234, 88, 12, 0.12)',
    border: 'rgba(234, 88, 12, 0.28)',
    label: 'Awaiting Parts',
  },
  'QC Pending': {
    color: '#a855f7',
    bg: 'rgba(168, 85, 247, 0.12)',
    border: 'rgba(168, 85, 247, 0.28)',
    label: 'QC Pending',
    pulse: true,
  },
  Ready: {
    color: '#0d9488',
    bg: 'rgba(13, 148, 136, 0.12)',
    border: 'rgba(13, 148, 136, 0.28)',
    label: 'Ready for Return',
  },
  Returned: {
    color: '#16a34a',
    bg: 'rgba(22, 163, 74, 0.12)',
    border: 'rgba(22, 163, 74, 0.28)',
    label: 'Returned & Closed',
  },
  Cancelled: {
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.12)',
    border: 'rgba(239, 68, 68, 0.28)',
    label: 'Cancelled',
  },
  Open: {
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.12)',
    border: 'rgba(59, 130, 246, 0.28)',
    label: 'Open',
  },
  'In Progress': {
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.28)',
    label: 'In Progress',
    pulse: true,
  },
  Resolved: {
    color: '#16a34a',
    bg: 'rgba(22, 163, 74, 0.12)',
    border: 'rgba(22, 163, 74, 0.28)',
    label: 'Resolved',
  },
};

export default function MaintenanceStatusBadge({ status, size = 'md' }) {
  const conf = STATUS_CONFIG[status] || {
    color: 'var(--text-muted)',
    bg: 'rgba(100, 116, 139, 0.12)',
    border: 'var(--border-default)',
    label: status || 'Unknown',
  };

  const isSmall = size === 'sm';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isSmall ? '0.35rem' : '0.45rem',
        padding: isSmall ? '0.2rem 0.55rem' : '0.3rem 0.75rem',
        borderRadius: 'var(--radius-full)',
        fontSize: isSmall ? '0.72rem' : '0.78rem',
        fontWeight: 600,
        backgroundColor: conf.bg,
        color: conf.color,
        border: `1px solid ${conf.border}`,
        whiteSpace: 'nowrap',
        lineHeight: 1.2,
      }}
    >
      <span
        style={{
          width: isSmall ? '5px' : '6px',
          height: isSmall ? '5px' : '6px',
          borderRadius: '50%',
          backgroundColor: conf.color,
          boxShadow: conf.pulse ? `0 0 6px ${conf.color}` : 'none',
        }}
      />
      {conf.label}
    </span>
  );
}
