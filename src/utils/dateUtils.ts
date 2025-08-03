import { DateFilter, DateRange } from '../types';

export function getDateRange(filter: DateFilter, customRange?: DateRange): DateRange {
  const now = new Date();
  const end = now.toISOString().split('T')[0];

  switch (filter) {
    case '30days':
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);
      return { start: thirtyDaysAgo.toISOString().split('T')[0], end };
    
    case '6months':
      const sixMonthsAgo = new Date(now);
      sixMonthsAgo.setMonth(now.getMonth() - 6);
      return { start: sixMonthsAgo.toISOString().split('T')[0], end };
    
    case '1year':
      const oneYearAgo = new Date(now);
      oneYearAgo.setFullYear(now.getFullYear() - 1);
      return { start: oneYearAgo.toISOString().split('T')[0], end };
    
    case 'custom':
      return customRange || { start: end, end };
    
    default:
      return { start: end, end };
  }
}

export function isDateInRange(date: string, range: DateRange): boolean {
  return date >= range.start && date <= range.end;
}

export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function getMonthFromDate(date: string): string {
  const dateObj = new Date(date);
  return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}