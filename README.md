# Spendly

Spendly is a responsive personal finance dashboard built with React, Vite, Recharts, and Lucide. It includes transaction management, monthly analytics, category spending breakdowns, search and filters, CSV export, a JSON Server API, and browser storage fallback.

## Getting started

Install dependencies and start both the Vite app and JSON Server:

```bash
npm install
npm run dev:full
```

Open [http://localhost:5173](http://localhost:5173). Without Supabase credentials, the sign-in screen offers a clearly labeled local demo workspace. Demo transactions use the existing Vite proxy to JSON Server at port `3001`.

To run either service separately:

```bash
npm run api
npm run dev
```

The mock API is seeded from `db.json`. When it is unavailable, Spendly reports the API status and uses browser-local storage for transaction changes.

## Supabase accounts

Authenticated accounts use Supabase Auth and a private `transactions` table protected by row-level security. The JSON Server and browser-storage fallback are reserved for the local demo workspace; authenticated data never falls back to the shared mock API.

1. Create a Supabase project.
2. In the Supabase SQL Editor, run [`supabase/migrations/20261115000000_create_transactions.sql`](./supabase/migrations/20261115000000_create_transactions.sql).
3. Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` using the project URL and publishable/anon key. Never put a Supabase service-role key in the browser app.
4. In Supabase Authentication URL configuration, allow the app origin (for local development, `http://localhost:5173`) for email confirmation and password-reset links.
5. Restart Vite after changing environment variables.

When Supabase is configured, the app requires a signed-in session. New users may need to confirm their email before signing in, depending on the project’s Auth settings. The local demo remains available only in development when Supabase is not configured.

## Scripts

- `npm run dev` — start the Vite development server.
- `npm run api` — start JSON Server.
- `npm run dev:full` — start both services.
- `npm run build` — create a production build in `dist`.
- `npm run preview` — preview the production build.
