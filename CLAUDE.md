# RoadshowAttendance

Monorepo with two apps sharing a Supabase backend.

## Apps

- `apps/web-app` — Next.js 16 admin dashboard
- `apps/mobile-app` — Expo 54 attendance scanner for field use

## Commands

### Web (`apps/web-app`)
```
npm run dev      # development server
npm run build    # production build
npm start        # production server
npm run lint
```

### Mobile (`apps/mobile-app`)
```
npm start           # Expo dev server
npm run android
npm run ios
npm run web
npm run lint
```

## Architecture

**Web:** Next.js App Router, Tailwind CSS 4, Recharts, Supabase Auth. Auth middleware redirects unauthenticated users to `/auth/login`. Dashboard calculations live in `useDashboardMetrics()`.

**Mobile:** Expo Router, SQLite offline-first with an outbox pattern for sync. `useSync()` triggers sync every 10s over WiFi. SQLite DAOs are in `lib/sqlite/dao/`.

**Shared backend:** Supabase (Postgres + Auth). Both apps talk directly to Supabase — no intermediate API layer.

## Environment Variables

Web (`.env.local` in `apps/web-app`):
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Mobile (`.env` in `apps/mobile-app`):
```
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_KEY
```
