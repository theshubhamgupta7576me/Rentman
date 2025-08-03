export function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return defaultValue;
  }
}

export function exportAllData() {
  const tenants = loadFromStorage('tenants', []);
  const rentLogs = loadFromStorage('rentLogs', []);
  const rentCollectors = loadFromStorage('rentCollectors', []);
  const settings = loadFromStorage('settings', {});

  // Convert data to CSV format
  let csvContent = '';

  // Tenants CSV
  if (tenants.length > 0) {
    csvContent += 'TENANTS\n';
    csvContent += 'Name,Property Name,Phone Number,Monthly Rent,Security Deposit,Start Date,Start Meter Reading,Property Type,Notes,Is Archived,Closing Date,Closing Notes\n';
    tenants.forEach(tenant => {
      csvContent += `"${tenant.name}","${tenant.propertyName}","${tenant.phoneNumber || ''}","${tenant.monthlyRent}","${tenant.securityDeposit}","${tenant.startDate}","${tenant.startMeterReading}","${tenant.propertyType}","${tenant.notes || ''}","${tenant.isArchived}","${tenant.closingDate || ''}","${tenant.closingNotes || ''}"\n`;
    });
    csvContent += '\n';
  }

  // Rent Logs CSV
  if (rentLogs.length > 0) {
    csvContent += 'RENT LOGS\n';
    csvContent += 'Tenant Name,Date,Rent Paid,Previous Meter Reading,Current Meter Reading,Units,Unit Price,Meter Bill,Total,Collector,Payment Mode,Notes\n';
    rentLogs.forEach(log => {
      csvContent += `"${log.tenantName}","${log.date}","${log.rentPaid}","${log.previousMeterReading}","${log.currentMeterReading}","${log.units}","${log.unitPrice}","${log.meterBill}","${log.total}","${log.collector}","${log.paymentMode}","${log.notes || ''}"\n`;
    });
    csvContent += '\n';
  }

  // Rent Collectors CSV
  if (rentCollectors.length > 0) {
    csvContent += 'RENT COLLECTORS\n';
    csvContent += 'Name,Created At\n';
    rentCollectors.forEach(collector => {
      csvContent += `"${collector.name}","${collector.createdAt}"\n`;
    });
    csvContent += '\n';
  }

  // Settings CSV
  csvContent += 'SETTINGS\n';
  csvContent += 'Default Unit Price\n';
  csvContent += `"${settings.defaultUnitPrice || 8}"\n`;

  const dataBlob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `rentman-data-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function wipeAllData(): void {
  localStorage.removeItem('tenants');
  localStorage.removeItem('rentLogs');
  localStorage.removeItem('rentCollectors');
  localStorage.removeItem('settings');
}