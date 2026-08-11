# MamaLink Mobile App

This is the React Native mobile application for MamaLink - an AI-powered Care Coordination Platform for Community Maternal and Newborn Health.

## Project Overview

MamaLink is a Care Coordination Platform that helps CHPS workers proactively manage maternal and newborn care in Ghana. For full project documentation, see the [main documentation directory](../docs/).

## Technology Stack

- **Framework:** React Native (Expo)
- **Language:** TypeScript
- **State Management:** Zustand
- **Data Fetching:** TanStack Query
- **Database:** Supabase (PostgreSQL)
- **Styling:** NativeWind (Tailwind CSS)
- **Navigation:** Expo Router

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI

### Installation

```bash
cd mobile
npm install
```

### Environment Setup

Create a `.env` file:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Running the App

```bash
# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Project Structure

```
src/
├── app/              # Expo Router screens
├── features/         # Feature modules
├── hooks/            # React hooks (query/mutations)
├── lib/              # Utilities and configurations
├── services/         # API services
├── shared/           # Shared components and stores
└── assets/           # Images and fonts
```

## Key Features

- 🔐 Authentication & authorization
- 👥 Household & person management
- 🤰 Pregnancy registration with automatic care journey generation
- 📊 Care journey tracking with milestones
- 🏥 Clinical assessment recording
- ⚠️ Risk detection and alerts
- 📱 Offline-first data sync
- 🌍 Multi-language support

## Documentation

For detailed documentation, see:

- [Project Overview](../docs/README.md)
- [Care Journey Specification](../docs/specifications/Care Journey.md)
- [Data Dictionary](../docs/reference/DATA_DICTIONARY.md)
- [TanStack Query Guide](../docs/guides/QUERY_GUIDE.md)
