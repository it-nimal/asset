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

export const formatDateTimeIST = (dateVal, includeSeconds = true) => {
  if (!dateVal) return '-';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);

    // Format in Asia/Kolkata timezone
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: includeSeconds ? '2-digit' : undefined,
      hour12: true,
    });

    const parts = formatter.formatToParts(d);
    let day = '', month = '', year = '', hour = '', minute = '', second = '', dayPeriod = '';
    for (const part of parts) {
      if (part.type === 'day') day = part.value;
      if (part.type === 'month') month = part.value;
      if (part.type === 'year') year = part.value;
      if (part.type === 'hour') hour = part.value;
      if (part.type === 'minute') minute = part.value;
      if (part.type === 'second') second = part.value;
      if (part.type === 'dayPeriod') dayPeriod = part.value.toUpperCase();
    }

    const timeStr = includeSeconds
      ? `${hour}:${minute}:${second} ${dayPeriod}`
      : `${hour}:${minute} ${dayPeriod}`;

    return `${day}-${month}-${year} ${timeStr} IST`;
  } catch {
    return String(dateVal);
  }
};

export const formatDateTime = (dateVal) => {
  return formatDateTimeIST(dateVal, false);
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
