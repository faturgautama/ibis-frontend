# IBIS - Integrated Bonded Inventory System

Sistem Informasi Inventory Kawasan Berikat dengan integrasi Bea Cukai dan Traceability System.

## Overview

IBIS adalah aplikasi manajemen inventory untuk kawasan berikat yang terintegrasi dengan sistem Bea Cukai Indonesia (IT Inventory & CEISA) dan dilengkapi dengan sistem traceability menggunakan RFID dan batch tracking.

## Features

- **Inventory Management** - Manajemen item, warehouse, stock balance, dan stock mutation
- **Purchasing & Warehouse** - Inbound, outbound, dan stock opname operations
- **Production & Quality Control** - Work orders, material consumption, dan yield tracking
- **Customs Integration** - BC documents (BC23, BC25, BC27, BC30, BC40) dan sinkronisasi IT Inventory
- **CEISA Integration** - Submission tracking dan approval status monitoring
- **Traceability System** - Forward/backward tracing dengan RFID dan batch tracking
- **Reports & Analytics** - Dashboard analytics, scheduled reports, dan export capabilities
- **Audit Trail** - Complete change tracking dan user activity logs
- **User Management** - Role-based access control dan user administration

## Technology Stack

- **Angular** 20.3.0 - Modern frontend framework dengan standalone components
- **TypeScript** 5.9.2 - Type-safe programming language
- **PrimeNG** 20.4.0 - Enterprise UI component library
- **TailwindCSS** 4.1.12 - Utility-first CSS framework
- **NgRx** 20.1.0 - State management dengan Redux pattern
- **Lucide Angular** 0.562.0 - Icon library (1,555+ icons)
- **Chart.js** 4.5.1 - Data visualization untuk dashboard

## Prerequisites

- Node.js 18.x atau lebih tinggi
- npm 9.x atau lebih tinggi
- Angular CLI 20.3.10

## Installation

```bash
# Clone repository
git clone <repository-url>
cd kek-it-inventory

# Install dependencies
npm install
```

## Development

### Development Server

Jalankan development server dengan LocalStorage (demo mode):

```bash
npm start
# atau
npm run start:demo
```

Aplikasi akan berjalan di `http://localhost:4200/`

### Production Mode

Jalankan dengan konfigurasi production (real API):

```bash
npm run start:prod
```

### Build

```bash
# Build untuk demo (LocalStorage)
npm run build:demo

# Build untuk production (Real API)
npm run build:prod
```

Build artifacts akan tersimpan di folder `dist/`

### Running Tests

```bash
npm test
```

## Project Structure

```
src/
├── app/
│   ├── core/              # Core services, guards, interceptors
│   ├── shared/            # Shared components, directives, pipes
│   ├── features/          # Feature modules (lazy loaded)
│   │   ├── dashboard/
│   │   ├── items/
│   │   ├── warehouses/
│   │   ├── inbound/
│   │   ├── outbound/
│   │   ├── production/
│   │   ├── customs-integration/
│   │   ├── traceability/
│   │   └── ...
│   └── store/             # NgRx state management
├── environments/          # Environment configurations
└── styles.scss           # Global styles
```

Dokumentasi lengkap struktur folder: [docs/FOLDER_STRUCTURE.md](docs/FOLDER_STRUCTURE.md)

## Configuration

### Environment Files

- `environment.ts` - Development configuration
- `environment.demo.ts` - Demo mode dengan LocalStorage
- `environment.prod.ts` - Production configuration dengan real API

### Tailwind Configuration

Konfigurasi Tailwind CSS tersedia di `tailwind.config.js` dengan custom theme extensions.

## Documentation

Dokumentasi lengkap tersedia di folder `docs/`:

- **[Setup Complete](docs/SETUP_COMPLETE.md)** - Installation status dan technology stack
- **[Folder Structure](docs/FOLDER_STRUCTURE.md)** - Project architecture dan folder organization
- **[Navigation Guide](docs/NAVIGATION.md)** - Menu structure dan routing
- **[Build Success](docs/BUILD_SUCCESS.md)** - Build status dan fixes applied

## Design System

- **Primary Color**: Sky Blue (`sky-500`)
- **Style**: Modern, minimalist, professional
- **Theme**: White dominant dengan subtle blue accents
- **Typography**: Inter font family dengan variable font support
- **Icons**: Lucide Angular untuk consistent icon system

## Code Scaffolding

Generate komponen baru menggunakan Angular CLI:

```bash
# Generate component
ng generate component component-name

# Generate service
ng generate service service-name

# Generate module
ng generate module module-name

# Lihat semua opsi
ng generate --help
```

## Code Quality

Project ini menggunakan:

- **Prettier** - Code formatting dengan custom configuration
- **TypeScript Strict Mode** - Type safety enforcement
- **ESLint** - Code linting (jika dikonfigurasi)

Format code:

```bash
npx prettier --write "src/**/*.{ts,html,scss}"
```

## Contributing

1. Create feature branch dari `main`
2. Commit changes dengan descriptive messages
3. Push ke branch
4. Create Pull Request

## License

Private project - All rights reserved

## Support

Untuk pertanyaan atau issue, silakan hubungi tim development.

---

**Version**: 0.0.0  
**Last Updated**: January 2026  
**Built with**: Angular CLI 20.3.10
