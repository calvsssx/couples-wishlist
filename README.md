# Couples Wishlist

A private wishlist app for two people. List things you want, see your partner's list, and secretly mark items as already bought — they'll never know which ones you got them.

The "secret" part is enforced at the database layer using Supabase Row Level Security, so it's not just hidden in the UI — your partner literally cannot read which items you've bought.

## Setup (one-time)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure your Supabase credentials

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Then edit `.env.local` and paste your values from the Supabase dashboard:
- **Settings → API** → Project URL → `VITE_SUPABASE_URL`
- **Settings → API** → anon/publishable key → `VITE_SUPABASE_ANON_KEY`

### 3. Confirm your database schema is set up

You should have already run the SQL schema in the Supabase SQL editor. It creates `profiles`, `items`, and `purchases` tables plus the RLS policies and pairing function.

### 4. Disable email confirmation (for easier testing)

In Supabase dashboard: **Authentication → Providers → Email** → uncheck "Confirm email" while you're getting started. You can re-enable later if you want.

## Run locally

```bash
npm run dev
```

Opens at http://localhost:5173

## First-time use

1. Sign up with your email and password.
2. Sign up your partner separately on their device (or the same browser using an incognito window).
3. One of you copies their pair code from the pairing screen.
4. The other enters that code. You're now paired.
5. Both add items to your lists. Switch to the "Theirs" tab to view and secretly check off items on your partner's list.

## Deploy to Vercel

1. Push this repo to GitHub or GitLab.
2. Go to vercel.com, click "Add New → Project", import the repo.
3. Add the two environment variables in Vercel project settings (same names as `.env.local`).
4. Deploy. You'll get a URL like `couples-wishlist.vercel.app`.

## Install as an app on your phone

After deploying:

**iPhone (Safari):**
1. Open the Vercel URL in Safari
2. Tap the Share button
3. Tap "Add to Home Screen"

**Android (Chrome):**
1. Open the URL in Chrome
2. Tap the menu (three dots)
3. Tap "Install app" or "Add to Home Screen"

The app will run full-screen like a native app, with its own icon on your home screen.

## Tech stack

- Vite + React + TypeScript
- Supabase (Postgres + Auth + Realtime)
- vite-plugin-pwa for installable PWA support
- Row-Level Security for the secret-bought privacy guarantee

## Project structure

```
src/
  lib/
    supabase.ts       Supabase client
    types.ts          Shared TypeScript types
    auth.ts           Session and profile hooks
    useItems.ts       Items + purchases data hook
  components/
    Icons.tsx         SVG icons
  pages/
    AuthPage.tsx      Sign in / sign up
    PairPage.tsx      Link with partner via code
    MyListPage.tsx    Your wishlist
    PartnerListPage.tsx  Partner's list with secret-bought toggles
    SettingsPage.tsx  Display name, unpair, sign out
  App.tsx             Router and tab bar
  main.tsx            Entry point
  styles.css          Global styles
```
