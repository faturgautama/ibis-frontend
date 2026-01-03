/**
 * Environment Configuration - Production Mode
 * 
 * This configuration is used for production deployment.
 * Production mode integrates with backend API, IT Inventory, and CEISA.
 */
export const environment = {
    production: true,
    demoMode: false,
    apiUrl: 'https://api.kek-inventory.com',
    apiTimeout: 30000,
    features: {
        rfidScanner: true,
        customsIntegration: true,
    },
    customs: {
        itInventoryUrl: 'https://it-inventory.beacukai.go.id',
        ceisaUrl: 'https://ceisa.beacukai.go.id',
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
