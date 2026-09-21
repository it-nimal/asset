/**
 * Date formatting and utility functions
 */

export const formatDate = (dateVal, options = {}) => {
  if (!dateVal) return '-';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    
    if (options.month === 'short') {
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return String(dateVal);
  }
};

export const formatDateTime = (dateVal) => {
  if (!dateVal) return '-';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    const dateStr = formatDate(d);
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${dateStr} ${hours}:${minutes} ${ampm}`;
  } catch {
    return String(dateVal);
  }
};

export const formatDateInput = (dateVal) => {
  if (!dateVal) return '';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return '';
  }
};

export const isDateExpired = (dateVal) => {
  if (!dateVal) return false;
  try {
    const target = new Date(dateVal);
    const now = new Date();
    return target.getTime() < now.getTime();
  } catch {
    return false;
  }
};

export const getDaysRemaining = (dateVal) => {
  if (!dateVal) return null;
  try {
    const target = new Date(dateVal);
    const now = new Date();
    const diff = target.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  } catch {
    return null;
  }
};
