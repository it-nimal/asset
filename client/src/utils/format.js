/**
 * Data and text formatting utilities
 */

export const formatMakeModel = (make, model) => {
  if (make && model) return `${make} ${model}`;
  return make || model || '-';
};

export const formatCurrency = (amount, currencySymbol = '₹') => {
  if (amount === undefined || amount === null || amount === '') return '-';
  const num = Number(amount);
  if (isNaN(num)) return String(amount);
  return `${currencySymbol} ${num.toLocaleString('en-IN')}`;
};

export const truncateText = (str, maxLength = 30) => {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
};

export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};
