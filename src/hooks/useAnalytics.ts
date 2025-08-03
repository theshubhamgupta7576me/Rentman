import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { DateFilter, DateRange, DashboardStats } from '../types';
import { getDateRange, isDateInRange, getCurrentMonth, getMonthFromDate } from '../utils/dateUtils';

export function useAnalytics(filter: DateFilter, customRange?: DateRange) {
  const { state } = useApp();
  const dateRange = getDateRange(filter, customRange);

  const stats: DashboardStats = useMemo(() => {
    const filteredLogs = state.rentLogs.filter(log => 
      isDateInRange(log.date, dateRange)
    );

    const totalRentCollected = filteredLogs.reduce((sum, log) => sum + log.rentPaid, 0);
    const totalElectricityBill = filteredLogs.reduce((sum, log) => sum + log.meterBill, 0);

    // Calculate tenants with dues (no rent log for current month) - exclude archived tenants
    const currentMonth = getCurrentMonth();
    const tenantsWithLogs = new Set(
      state.rentLogs
        .filter(log => getMonthFromDate(log.date) === currentMonth)
        .map(log => log.tenantId)
    );
    
    const activeTenants = state.tenants.filter(tenant => !tenant.isArchived);
    const tenantsWithDues = activeTenants.filter(tenant => 
      !tenantsWithLogs.has(tenant.id)
    ).length;

    return {
      totalRentCollected,
      totalElectricityBill,
      tenantsWithDues,
      totalTenants: activeTenants.length,
    };
  }, [state.rentLogs, state.tenants, dateRange]);

  const chartData = useMemo(() => {
    const filteredLogs = state.rentLogs.filter(log => 
      isDateInRange(log.date, dateRange)
    );

    // Group by month
    const monthlyData = filteredLogs.reduce((acc, log) => {
      const month = log.date.substring(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = { rent: 0, electricity: 0 };
      }
      acc[month].rent += log.rentPaid;
      acc[month].electricity += log.meterBill;
      return acc;
    }, {} as Record<string, { rent: number; electricity: number }>);

    const sortedMonths = Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-IN', { 
          month: 'short', 
          year: 'numeric' 
        }),
        rent: data.rent,
        electricity: data.electricity,
      }));

    return {
      rentTrend: sortedMonths,
      electricityTrend: sortedMonths,
    };
  }, [state.rentLogs, dateRange]);

  const recentLogs = useMemo(() => {
    return state.rentLogs
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
  }, [state.rentLogs]);

  return { stats, chartData, recentLogs };
}