# Carsale App

A car-buying recommender built with Next.js. You tell it your monthly budget, credit score, down payment and vehicle type, and it works out what you can actually afford to finance, then pulls matching cars from the inventory.

## How it works

1. On the home page you enter your preferences: credit score, monthly budget, vehicle type, down payment, and whether you have a trade-in.
2. The app converts the credit score into an interest rate, assumes a 60-month loan, and calculates the maximum loan amount and price range you can afford.
3. It queries the Supabase inventory table, filtering by price and vehicle type, and estimates a monthly payment for every car that fits.
4. The results page lets you sort and filter the matches (price, make, vehicle type, mileage) and shows the estimated monthly payment on each card.

If the database is unreachable or the table structure doesn't match, the app degrades gracefully instead of crashing.

## Tech stack

- Next.js 15 (App Router) with TypeScript
- React 19
- Tailwind CSS + shadcn/ui components
- Redux Toolkit for state
- Supabase (Postgres) for the inventory
- csv-parse for the data import script

## Getting started

```bash
npm install
npm run dev
```

Create a `.env.local` with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Inventory data

The app reads from a Supabase table (it auto-detects the table name, defaulting to `inventory_row`) and handles two shapes:

- A CSV-style schema (`Name`, `Year`, `Make`, `Model`, `Kms`, `Exterior Color`, `Retail Price`, `Cost`, ...)
- A looser legacy schema, where price/type/make columns are detected dynamically

A helper script (`scripts/import-csv.ts`) is included for loading a CSV inventory into Supabase. It expects a `data/cars-inventory.csv` file, reads `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from the environment, and inserts into the `inventory_row` table. It is TypeScript and disabled by default — uncomment the `importCsv()` call and run it with a TS runner (e.g. `npx tsx scripts/import-csv.ts`).

## Production build

```bash
npm run build
npm start
```
