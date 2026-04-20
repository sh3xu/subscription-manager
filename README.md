# Sub Tracker

Subscription tracking app built with Expo + React Native.

Track recurring subscriptions, convert multi-currency spend into a base currency, and visualize monthly spend distribution by service.

## Features

- Add, edit, and delete subscriptions
- Billing cycles:
  - Monthly
  - Yearly
  - Custom every N days
- Base currency projections:
  - Monthly projection
  - Yearly projection
- Multi-currency support with FX conversion
- Historical FX snapshot caching (date-based)
- Current month spend-share pie chart by service
- Timeline of upcoming charges
- Local persistence using SQLite
- State management with Zustand

## Tech Stack

- Expo (SDK 55)
- React 19 / React Native 0.83
- Expo Router
- Expo SQLite
- Zustand
- react-native-svg (for pie chart)

## Project Structure

- `src/app/` - routes/screens (home, timeline, settings, subscription forms)
- `src/components/` - reusable UI and feature components
- `src/lib/` - billing math, currency/fx logic, formatters, notifications
- `src/store/` - Zustand stores
- `src/db/` - database layer, migrations, queries
- `src/constants/` - currencies, theme, service presets
- `src/types/` - shared types

## Environment Variables

Create a `.env` file in project root:

EXPO_PUBLIC_EXCHANGE_API_BASE_URL=https://shekhu.vercel.app/api/internal/exchange
