import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

export const displayValue = (value: any): string => {
  if (value === null || value === undefined || value === '') {
    return '\u2014'; // em dash
  }
  return String(value);
};

export const formatCurrency = (amount: number | string | undefined | null): string => {
  if (amount === undefined || amount === null) return displayValue(null);
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return displayValue(null);
  
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

export const formatDate = (dateString: string | Date | undefined | null): string => {
  if (!dateString) return displayValue(null);
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return format(date, 'dd MMM yyyy', { locale: enUS });
  } catch {
    return displayValue(null);
  }
};

export const formatDateTime = (dateString: string | Date | undefined | null): string => {
  if (!dateString) return displayValue(null);
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return format(date, 'dd MMM yyyy, HH:mm', { locale: enUS });
  } catch {
    return displayValue(null);
  }
};

export const formatWeight = (kg: number | string | undefined | null): string => {
  if (kg === undefined || kg === null) return displayValue(null);
  const num = typeof kg === 'string' ? parseFloat(kg) : kg;
  if (isNaN(num)) return displayValue(null);
  
  return `${num.toFixed(2)} kg`;
};

export const formatPercentage = (pct: number | string | undefined | null): string => {
  if (pct === undefined || pct === null) return displayValue(null);
  const num = typeof pct === 'string' ? parseFloat(pct) : pct;
  if (isNaN(num)) return displayValue(null);
  
  return `${num.toFixed(2)}%`;
};

export const formatTrackingId = (id: string | undefined | null): string => {
  if (!id) return displayValue(null);
  return id.toUpperCase();
};
