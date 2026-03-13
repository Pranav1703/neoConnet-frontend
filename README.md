## NeoConnect Frontend (Web App)

This is the **Next.js 14 + React 18** frontend for the NeoConnect staff feedback and complaints platform.

It provides:
- Staff submission form (anonymous option, attachments)
- Case inbox and detail views for staff, secretariat, case managers, and management
- Public Hub (quarterly digest, impact tracking, minutes archive)
- Polling (create polls, vote, view results)
- Analytics dashboard (status/category/department breakdown + hotspots)

---

### Tech stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI**: React 18, Tailwind CSS, Radix UI primitives, shadcn‑style components
- **HTTP client**: Axios

---

### Project structure

- `src/app/page.tsx` – root route, redirects based on auth
- `src/app/(app)/layout.tsx` – authenticated layout with sidebar navigation
- `src/app/(app)/dashboard` – role‑aware dashboard
- `src/app/(app)/cases` – case list, case detail, new case form
- `src/app/(app)/polls` – polls listing, create poll
- `src/app/(app)/analytics` – analytics dashboard
- `src/app/(app)/public` – Public Hub (digest, impact tracking, minutes)
- `src/app/public/minutes` – standalone minutes archive route
- `src/app/login`, `src/app/register` – auth pages
- `src/context/AuthContext.tsx` – global auth state (user + token)
- `src/lib/api.ts` – Axios instance and typed API helpers
- `src/components/ui` – shared UI components
- `src/types` – shared TypeScript types

---

### Setup

1. **Install dependencies**

```bash
cd frontend
npm install
```

2. **Configure API base URL (optional)**

By default, the frontend talks to the backend at:

```ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
```

If your backend runs elsewhere, create a `.env.local` in `frontend/` (git‑ignored) and set:

```env
NEXT_PUBLIC_API_URL=http://your-backend-host:port
```

---

### Scripts

From `frontend/`:

- `npm run dev` – start Next.js dev server on `http://localhost:3000`
- `npm run build` – production build
- `npm start` – run the production build

Typical dev flow:

```bash
# backend running on http://localhost:5000

cd frontend
npm run dev
```

Then open `http://localhost:3000` in your browser.

---

### Authentication & roles

- Auth state is managed in `AuthContext` and hydrated on initial load via `/api/auth/me`.
- JWT is stored in localStorage and also sent via `withCredentials` for cookie‑based auth.
- Sidebar navigation and pages are role‑aware:
  - **staff** – dashboard, submit case, my cases, polls, public hub
  - **case_manager** – dashboard, assigned cases, public hub
  - **secretariat / admin / management** – dashboard, all cases, analytics, public hub (+ poll creation for secretariat/admin)

Public Hub at `/public` is accessible from the app sidebar when logged in and also has a public‑facing version at the root `/public` route.

---

### Development notes

- Tailwind CSS and component styles are wired via `tailwind.config.js` and `postcss.config.js`.
- TypeScript configuration is in `tsconfig.json` with path alias `@/*` mapped to `src/*`.
- The app is built using the App Router; new pages should follow the same `app/` directory conventions.

