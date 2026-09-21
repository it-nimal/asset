import React from 'react';

const STATUS_STYLES = {
  Reported: {
    bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    dot: 'bg-blue-400',
    label: 'Reported',
  },
  'Under Diagnosis': {
    bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    dot: 'bg-indigo-400',
    label: 'Under Diagnosis',
  },
  'In Repair': {
    bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    dot: 'bg-amber-400 animate-pulse',
    label: 'In Repair',
  },
  'Awaiting Vendor': {
    bg: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    dot: 'bg-sky-400',
    label: 'Awaiting Vendor',
  },
  'Awaiting Parts': {
    bg: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    dot: 'bg-yellow-400',
    label: 'Awaiting Parts',
  },
  'QC Pending': {
    bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    dot: 'bg-purple-400 animate-pulse',
    label: 'QC Pending',
  },
  Ready: {
    bg: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
    dot: 'bg-teal-400',
    label: 'Ready for Return',
  },
  Returned: {
    bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    dot: 'bg-emerald-400',
    label: 'Returned & Closed',
  },
  Cancelled: {
    bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    dot: 'bg-rose-400',
    label: 'Cancelled',
  },
  // Legacy / fallback
  Open: {
    bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    dot: 'bg-blue-400',
    label: 'Open',
  },
  'In Progress': {
    bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    dot: 'bg-amber-400 animate-pulse',
    label: 'In Progress',
  },
  Resolved: {
    bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    dot: 'bg-emerald-400',
    label: 'Resolved',
  },
};

export default function MaintenanceStatusBadge({ status, size = 'md' }) {
  const conf = STATUS_STYLES[status] || {
    bg: 'bg-slate-800 text-slate-400 border-slate-700',
    dot: 'bg-slate-400',
    label: status || 'Unknown',
  };

  const sizeClasses = size === 'sm'
    ? 'text-xs px-2 py-0.5 gap-1.5'
    : 'text-xs px-2.5 py-1 gap-2 font-medium';

  return (
    <span
      className={`inline-flex items-center rounded-full border ${conf.bg} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${conf.dot}`} />
      {conf.label}
    </span>
  );
}
