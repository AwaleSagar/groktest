# SubVault

A mobile-first PWA to track personal subscriptions, budgets by category, and payment details. Built for INR-first use with flexible per-service currency.

## Features

- Dashboard with monthly burn and upcoming renewals
- Subscriptions list with search and filters
- Category budgets with overspend indicators
- Payment mode (UPI, cards, net banking, etc.) and recurring vs manual
- Offline-first storage in IndexedDB
- JSON export/import backup

## Getting started

```bash
npm install
npm run dev
```

Open the dev URL on your phone (use `npm run dev -- --host` for LAN access).

## Live app

https://awalesagar.github.io/groktest/

On first visit, create a passphrase to encrypt your data on-device.

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run preview` — preview production build
- `npm test` — run unit tests
- `npm run deploy` — build and publish to GitHub Pages

## Roadmap

- Passphrase app lock + encrypted vault
- Supabase sync
- Gmail receipt parsing
- Google Sheets export