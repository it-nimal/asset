/**
 * Enterprise Warranty & AMC Calculation Utility
 * Provides standardized status calculation, formatting, and color badge styles.
 */

export const getWarrantyStatus = (warrantyEndDate) => {
  if (!warrantyEndDate) {
    return {
      status: 'none',
      badgeClass: 'badge-neutral',
      color: '#64748b',
      bg: 'rgba(100, 116, 139, 0.1)',
      border: 'rgba(100, 116, 139, 0.3)',
      daysLeft: null,
      label: 'No Expiry Set',
      isCritical: false,
    };
  }

  const end = new Date(warrantyEndDate);
  if (isNaN(end.getTime())) {
    return {
      status: 'invalid',
      badgeClass: 'badge-neutral',
      color: '#64748b',
      bg: 'rgba(100, 116, 139, 0.1)',
      border: 'rgba(100, 116, 139, 0.3)',
      daysLeft: null,
      label: 'Invalid Date',
      isCritical: false,
    };
  }

  const now = new Date();
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const daysAgo = Math.abs(diffDays);
    return {
      status: 'expired',
      badgeClass: 'badge-expired',
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.12)',
      border: 'rgba(239, 68, 68, 0.35)',
      daysLeft: diffDays,
      label: `Expired (${daysAgo}d ago)`,
      isCritical: true,
    };
  }

  if (diffDays <= 30) {
    return {
      status: 'urgent',
      badgeClass: 'badge-urgent',
      color: '#f97316',
      bg: 'rgba(249, 115, 22, 0.12)',
      border: 'rgba(249, 115, 22, 0.35)',
      daysLeft: diffDays,
      label: `${diffDays}d left (Urgent)`,
      isCritical: true,
    };
  }

  if (diffDays <= 60) {
    return {
      status: 'warning',
      badgeClass: 'badge-warning',
      color: '#eab308',
      bg: 'rgba(234, 179, 8, 0.12)',
      border: 'rgba(234, 179, 8, 0.35)',
      daysLeft: diffDays,
      label: `${diffDays}d left`,
      isCritical: false,
    };
  }

  return {
    status: 'active',
    badgeClass: 'badge-active',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.35)',
    daysLeft: diffDays,
    label: `${diffDays}d (Active)`,
    isCritical: false,
  };
};

export const countExpiringWarranties = (assets = []) => {
  let expired = 0;
  let urgent = 0;
  let warning = 0;
  let active = 0;

  assets.forEach((asset) => {
    const info = getWarrantyStatus(asset.warrantyEndDate);
    if (info.status === 'expired') expired++;
    else if (info.status === 'urgent') urgent++;
    else if (info.status === 'warning') warning++;
    else if (info.status === 'active') active++;
  });

  return {
    expired,
    urgent,
    warning,
    active,
    criticalTotal: expired + urgent,
  };
};
