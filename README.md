# Rick & Morty Favorites Dashboard

A Next.js application that allows users to explore Rick and Morty characters and save their favorites. Built with Supabase for authentication and database, using Edge Functions to fetch data from the Rick & Morty GraphQL API.

## 🚀 Tech Stack

- **Frontend**: Next.js 16.1+ (App Router), React 19, TypeScript, Tailwind CSS 4
- **State Management**: TanStack Query v5 (server state, optimistic updates, infinite scroll)
- **Virtualization**: TanStack Virtual v3 (windowed grid for large favorites lists)
- **Validation**: Zod v4 (runtime schema validation)
- **Backend**: Supabase (PostgreSQL + Auth)
- **Edge Functions**: Deno (Supabase Edge Functions, in-memory caching)
- **API**: Rick & Morty GraphQL API
- **Testing**: Vitest + React Testing Library (unit/component), Playwright (E2E), Deno test (Edge Functions)

## 📁 Project Structure

```
├── src/                          # Frontend (Next.js)
│   ├── app/                      # App Router pages
│   │   ├── dashboard/            # Characters list with infinite scroll
│   │   ├── favorites/            # User favorites with export
│   │   ├── login/                # Login page
│   │   ├── signup/               # Sign up page
│   │   └── not-found.tsx         # Custom 404 page
│   ├── components/               # React components
│   │   ├── CharacterCard.tsx     # Character card (favorite + comparison buttons)
│   │   ├── CharacterModal.tsx    # Character details modal (accessible)
│   │   ├── CharacterFilters.tsx  # Search/filter controls (debounced, URL-synced)
│   │   ├── ComparisonModal.tsx   # Side-by-side character comparison (2–3 chars)
│   │   ├── ErrorBoundary.tsx     # Global error boundary
│   │   ├── Loading.tsx           # Skeleton loaders
│   │   ├── Navbar.tsx            # Navigation with active links
│   │   ├── Pagination.tsx        # Page navigation (legacy)
│   │   ├── PasswordStrength.tsx  # Password requirements indicator
│   │   ├── Toast.tsx             # Toast notification system
│   │   └── icons/                # Reusable SVG icon components
│   ├── lib/                      # Utilities & Supabase clients
│   │   ├── constants.ts          # Centralized constants
│   │   ├── hooks/                # Custom React hooks
│   │   │   ├── useDebounce.ts    # Debounce hook for values/callbacks
│   │   │   ├── useFavorites.ts   # Favorites with TanStack Query optimistic updates
│   │   │   ├── useUrlFilters.ts  # URL-synced filter state (clean URLs)
│   │   │   ├── useInfiniteCharactersQuery.ts # Infinite scroll query hook
│   │   │   ├── useCharactersQuery.ts  # Paginated query (legacy)
│   │   │   ├── useCurrentUser.ts # Auth user hook
│   │   │   ├── useLock.ts        # Lock mechanism for async operations
│   │   │   └── useUrlPagination.ts # URL-synced pagination (legacy)
│   │   ├── providers.tsx         # QueryClientProvider wrapper
│   │   ├── schemas.ts            # Zod validation schemas
│   │   ├── logger.ts             # Structured logger
│   │   └── supabase/             # Supabase clients
│   │       ├── client.ts         # Browser client
│   │       ├── server.ts         # Server client
│   │       ├── middleware.ts     # Middleware client
│   │       └── hooks.ts          # useSupabase singleton hook
│   ├── test/                     # Test setup
│   │   └── setup.ts              # Vitest global setup
│   └── types/                    # TypeScript types
│
├── supabase/                     # Backend (Supabase)
│   ├── functions/                # Edge Functions
│   │   └── get-characters/       # GraphQL proxy with validation + in-memory cache
│   │       ├── index.ts          # Function handler (exported for testing)
│   │       └── index.test.ts     # Deno unit tests
│   └── migrations/               # SQL migrations
│
├── tests/                        # E2E tests
│   └── e2e/
│       ├── auth.spec.ts          # Auth flows (login, signup, redirect)
│       └── favorites.spec.ts     # Favorites flows (add, remove, export, filter)
│
├── vitest.config.ts              # Vitest configuration
└── playwright.config.ts          # Playwright configuration
```
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Supabase CLI (optional, for local development)

### 1. Clone the repository

```bash
git clone <repository-url>
cd mindpal_task
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings → API to get your credentials
3. Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 4. Run database migrations

Navigate to your Supabase project's SQL Editor and run the migration file:

```sql
-- Copy contents from: supabase/migrations/create_favorite_characters.sql
```

This will create:
- `favorite_characters` table
- Row Level Security (RLS) policies
- Necessary indexes

### 5. Deploy Edge Function

Using Supabase CLI:

```bash
# Login to Supabase (will open browser for authentication)
npx supabase login

# Link your local project to remote Supabase project
npx supabase link --project-ref <your-project-ref>

# Deploy the Edge Function (--no-verify-jwt makes it publicly accessible)
npx supabase functions deploy get-characters --no-verify-jwt
```

> **Note**: The `--no-verify-jwt` flag is required because this function proxies a public API and doesn't need authentication. Without this flag, you'll get 401 Unauthorized errors.

You can find your `project-ref` in your Supabase Dashboard URL: `https://supabase.com/dashboard/project/<project-ref>`

Or manually via Supabase Dashboard:
1. Go to Edge Functions in your Supabase Dashboard
2. Create a new function named `get-characters`
3. Copy the code from `supabase/functions/get-characters/index.ts`
4. In function settings, disable "Verify JWT"

### 6. Configure Authentication

In your Supabase Dashboard:
1. Go to Authentication → Settings
2. Enable Email/Password sign-in
3. (Optional) Disable email confirmation for easier testing

### 7. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous (anon) key |
| `NEXT_PUBLIC_APP_URL` | (Optional) Canonical app URL for OG metadata |
| `E2E_TEST_EMAIL` | (E2E only) Test account email |
| `E2E_TEST_PASSWORD` | (E2E only) Test account password |
| `PLAYWRIGHT_BASE_URL` | (E2E only) Base URL for Playwright (default: `http://localhost:3000`) |

## 📊 Database Schema

### favorite_characters

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to auth.users |
| `character_id` | INT | Rick & Morty character ID |
| `character_name` | TEXT | Character name |
| `character_image` | TEXT | Character image URL (optional) |
| `character_status` | TEXT | Character status (Alive/Dead/unknown) |
| `character_species` | TEXT | Character species |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

**Constraints:**
- Unique constraint on `(user_id, character_id)`
- RLS enabled: users can only access their own favorites

## 🔒 Row Level Security Policies

- **SELECT**: Users can only view their own favorites
- **INSERT**: Users can only insert favorites for themselves
- **DELETE**: Users can only delete their own favorites

## 🌐 Edge Function

The `get-characters` Edge Function acts as a proxy to the Rick & Morty GraphQL API:

- Fetches paginated character data
- Validates input parameters against a strict whitelist
- **In-memory caching** (5-minute TTL) with `X-Cache: HIT/MISS` response header
- Adds `Cache-Control: public, s-maxage=300, stale-while-revalidate=60` for CDN caching
- Handles errors gracefully
- Returns formatted JSON response
- Exports `validateFilter` and `handleRequest` for unit testing (Deno test)

**Endpoint**: `POST /functions/v1/get-characters`

**Request body**:
```json
{
  "page": 1,
  "filter": {
    "name": "Rick",
    "status": "Alive"
  }
}
```

## 🎯 Key Technical Decisions

1. **GraphQL via Edge Function**: All Rick & Morty API requests go through Supabase Edge Functions, not directly from the frontend. This provides:
   - Better security
   - Rate limiting control
   - Server-side error handling
   - **Input validation** (filter values validated against whitelist)
   - **In-memory response caching** (5-minute TTL, Cache-Control headers)

2. **TanStack Query v5**: Server state managed with `useQuery`, `useMutation`, and `useInfiniteQuery`. Provides automatic cache invalidation, background refetching, and optimistic updates for favorites.

3. **Infinite Scroll**: Dashboard uses `useInfiniteCharactersQuery` (TanStack Query `useInfiniteQuery`) with an `IntersectionObserver` sentinel element at the bottom of the grid to auto-load the next page.

4. **URL-Synced Filters**: `useUrlFilters` keeps filter state in URL search params. Empty params are removed to keep URLs clean. This enables deep linking and back-button support.

5. **Character Comparison**: Select 2–3 characters using the compare button on each card. A floating action bar appears and opens `ComparisonModal` showing a side-by-side attribute table.

6. **Export Favorites**: Favorites can be exported as JSON or CSV via a dropdown button. Pure client-side — uses `Blob` + `URL.createObjectURL`, no server round-trip.

7. **Virtualized Favorites Grid**: When the favorites list exceeds 50 items, TanStack Virtual renders only visible rows, preventing DOM bloat.

8. **Supabase SSR**: Using `@supabase/ssr` for proper server-side rendering and cookie-based authentication in Next.js App Router.

9. **Row Level Security**: Database-level security ensures users can only access their own data, even if the client is compromised.

10. **Middleware Protection**: Routes `/dashboard` and `/favorites` are protected at the middleware level, redirecting unauthenticated users to login.

11. **Debounced Filters**: Search input uses debounce (300ms delay) to reduce API calls while typing.

12. **Accessibility**: Modal components include focus trap, ARIA attributes, and keyboard navigation support.

## 📝 Features

### Core Features
- ✅ User authentication (Sign up / Login)
- ✅ Protected routes with middleware
- ✅ Character listing with **infinite scroll** (auto-loads next page)
- ✅ Add/Remove favorites (optimistic updates via TanStack Query)
- ✅ Favorites page with virtual grid (>50 items)
- ✅ Row Level Security (users own data only)
- ✅ Edge Function for GraphQL proxy with validation + **in-memory caching**

### New Features
- ✅ **Infinite Scroll** — no pagination buttons; characters load as you scroll
- ✅ **URL-synced Filters** — name/status/species reflected in URL; empty params removed (clean URLs)
- ✅ **Character Comparison** — select 2–3 characters for side-by-side comparison modal
- ✅ **Export Favorites** — download your favorites list as JSON or CSV

### UI/UX Features
- ✅ **Character Details Modal** - Click on any card to see detailed info
- ✅ **Toast Notifications** - Feedback on add/remove favorites
- ✅ **Active Navigation Links** - Visual indication of current page
- ✅ **Custom 404 Page** - Rick & Morty themed error page
- ✅ **Skeleton Loading** - Animated loading cards
- ✅ **Password Strength Indicator** - Visual password requirements
- ✅ **Responsive Design** - Mobile-friendly
- ✅ **Dark Theme** - Modern dark UI

### Architecture Features
- ✅ **TanStack Query v5** — server state, cache, optimistic updates
- ✅ **TanStack Virtual v3** — windowed grid for large favorites lists
- ✅ **Zod Validation** — runtime schema validation at boundaries
- ✅ **Error Boundary** — Global error handling with recovery UI
- ✅ **Debounced Search** — Auto-apply filters after 300ms typing pause
- ✅ **Operation Locking** — Prevents double-click race conditions
- ✅ **Accessible Modals** — Focus trap, ARIA attributes, keyboard navigation
- ✅ **Reusable Icons** — SVG icon components library
- ✅ **Centralized Constants** — No magic strings

## 🖼️ Screenshots

### Login Page
![Login](docs/screenshots/login.png)

### Signup with Password Strength
![Signup](docs/screenshots/signup.png)

### Custom 404 Page
![404](docs/screenshots/404.png)

### Dashboard
Characters grid with filters, pagination, and clickable cards.
![Dashboard](docs/screenshots/dashboard.png)

### Character Modal
Detailed character information including status, species, gender, origin, location, and episode count.
![Character Modal](docs/screenshots/modal.png)

### Favorites
Personal collection with local search and status filter.
![Favorites](docs/screenshots/favorites.png)

## 🧪 Testing

```bash
# Unit and component tests (Vitest + React Testing Library)
npm test

# Run tests with coverage report
npm run test:coverage

# E2E tests (Playwright) — requires a running dev server or uses webServer config
npm run test:e2e

# Edge Function tests (Deno)
deno test supabase/functions/get-characters/index.test.ts

# Type-check and lint
npm run build
npm run lint
```

**Test coverage includes:**
- Hook unit tests: `useDebounce`, `useUrlPagination`, `useFavorites`
- Component tests: `CharacterCard`, `CharacterFilters`, `CharacterModal`
- E2E auth flow: login, signup, redirect protection
- E2E favorites flow: add/remove favorites, search, filter, export
- Edge Function: `validateFilter` and `handleRequest` handler tests

## 🔧 Supabase CLI Commands

```bash
# Login to Supabase
npx supabase login

# Link project (run once per project)
npx supabase link --project-ref <your-project-ref>

# Deploy Edge Function
npx supabase functions deploy get-characters --no-verify-jwt

# Push database migrations
npx supabase db push

# View function logs
npx supabase functions logs get-characters
```

## 📄 License

MIT
