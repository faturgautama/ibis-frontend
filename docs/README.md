# IBIS - Integrated Bonded Inventory System - Documentation

Dokumentasi lengkap untuk IBIS (Integrated Bonded Inventory System).

## 📑 Table of Contents

### Setup & Configuration

- **[Setup Complete](SETUP_COMPLETE.md)** - Installation status, libraries, dan configuration
  - Installed libraries dan versions
  - Environment configuration (demo/production)
  - Available commands
  - Technology stack summary

### Architecture & Structure

- **[Folder Structure](FOLDER_STRUCTURE.md)** - Project architecture dan organization
  - Angular 20 standalone components structure
  - Feature-based architecture
  - NgRx store organization
  - Service implementation patterns (API vs Demo)
  - Environment configuration examples

## 🎯 Quick Links

### For Developers

- [Folder Structure](FOLDER_STRUCTURE.md#angular-20-standalone-components-architecture) - Understand project structure
- [Service Pattern](FOLDER_STRUCTURE.md#service-implementation-pattern) - API vs Demo service pattern
- [Environment Config](FOLDER_STRUCTURE.md#environment-configuration) - Demo vs Production setup

### For Setup

- [Installed Libraries](SETUP_COMPLETE.md#installed-libraries) - What's installed
- [Available Commands](SETUP_COMPLETE.md#available-commands) - How to run the app
- [Design System](SETUP_COMPLETE.md#design-system) - Color palette and design principles

## 📂 Spec Files

Spec files (requirements, design, tasks) akan tersimpan di:

```
.kiro/specs/kek-inventory-traceability/
├── requirements.md
├── design.md
└── tasks.md
```

## 🚀 Getting Started

1. Read [Setup Complete](SETUP_COMPLETE.md) untuk memahami technology stack
2. Read [Folder Structure](FOLDER_STRUCTURE.md) untuk memahami architecture
3. Run `npm start` untuk development mode (demo/localStorage)
4. Run `npm run start:prod` untuk production mode (real API)

## 📝 Notes

- Semua documentation files ada di folder `docs/`
- Spec files ada di folder `.kiro/specs/`
- README.md di root project untuk quick reference
