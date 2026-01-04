export const environment = {
    production: false,
    demoMode: true,
    apiUrl: '',
    ceisaApiUrl: '',
    apiTimeout: 30000,
    features: {
        rfidScanner: false,
        customsIntegration: false,
    },
    customs: {
        itInventoryUrl: '',
        ceisaUrl: '',
    },
    session: {
        timeoutMinutes: 30,
        refreshTokenBeforeExpiry: 5, // minutes
    },
    pagination: {
        defaultPageSize: 50,
        pageSizeOptions: [10, 25, 50, 100],
    },
    alerts: {
        lowStockThreshold: 10,
        expiryWarningDays: 30,
        licenseExpiryWarningDays: 30,
    },
    dashboard: {
        refreshIntervalMinutes: 5,
    },
};
