# PokeDex Community

Greenfield full-stack: **Expo SDK 54 (React 19.1 / RN 0.81.5)** + **Express 5 (TypeScript)** + **MySQL**.

## Conventions

- Frontend: `.tsx` only. Backend: `.ts` only. No `.js`/`.jsx`.
- Styling: NativeWind (Tailwind) with `dark:` prefix everywhere.
- Stack: Expo Router file-based routing, Zustand stores, `react-hook-form` + `zod` validation.

## Dual-API Architecture (Critical)

| API | Client | Auth |
|-----|--------|------|
| PokeAPI (`https://pokeapi.co/api/v2`) | `services/pokeapi/pokeapi.client.ts` | None |
| Backend (`http://localhost:3000/v1`) | `services/api/client.ts` | Bearer JWT + auto-refresh interceptor |

- `services/api/client.ts` has a **queue-based refresh interceptor** that enqueues concurrent 401 requests while refreshing a single token.
- `services/pokeapi/pokeapi.client.ts` is a plain axios instance — no auth.

## `pokemon_id` = PokeAPI ID

Columns `pokemon_id` in `favorites`, `team_pokemon`, `reviews` store the **PokeAPI integer ID** (e.g. 25 = Pikachu). No local `pokemons` table. MySQL stores only user refs + ID + cached name/sprite.

## JWT Auth

| Token | Lifetime | Storage |
|-------|----------|---------|
| Access token | 15 min | Zustand memory |
| Refresh token | 7 days | `expo-secure-store` (`utils/tokenStorage.ts`) |

**Flow**: 401 → queue → `POST /auth/refresh` → retry. On refresh failure → `clearAuth()` redirects to login. Logout calls `POST /auth/logout` + removes local tokens.

## Backend Specifics

- **Express 5** — middleware that sends responses MUST `return` explicitly (no implicit `return` like Express 4).
- **Routes implemented** (prefix `/v1`): `auth/*` (register, login, refresh, logout, forgot-password), `users/*` (profile, update-profile), `reviews/*` (CRUD), `notifications/*` (get, mark-read), `favorites/*` (CRUD), `teams/*` (CRUD).
- `forgotPassword` is a **mock** (console.log only, no email).
- DB: `mysql2/promise` connection pool (`backend/src/config/database.ts`). Prepared statements enforced.
- Dev: `npm run dev` (nodemon + ts-node). Build: `npm run build` (tsc → `dist/`).
- `app.listen` guarded by `if (process.env.NODE_ENV !== 'test')` for supertest.
- Avatar upload: multer → Cloudinary → temp file deleted. Max 2MB, jpeg/png/webp only.

## Frontend Routes

- `app/(auth)/` → Stack (no tabs): login, register, forgot-password
- `app/(tabs)/` → Bottom tabs: index (home), pokemon (list / `[id]` / search / filter / create-review / edit-review / select-team), favorites, teams (list / create / `[id]` / `[id]/edit`), profile (index / edit)
- Modals: `onboarding/` (3-slide carousel), `notifications/`, `settings/` (index / about / privacy / terms)

## Commands

```bash
# Frontend (root)
npm start           # expo start
npm run android     # expo start --android
npm run ios         # expo start --ios

# Backend (backend/)
npm run dev         # nodemon src/app.ts
npm run build       # tsc
npm start           # node dist/app.js
```

- No dedicated lint or test scripts exist yet.
- Typechecking can be run manually with `npx tsc --noEmit` in both the root (frontend) and `backend/` directories.

## Database

Schema at `backend/database_schema.sql`. Run tables in order: users → favorites → teams → team_pokemon → reviews → notifications (FK dependency chain).

Key constraints:
- `favorites`: UNIQUE(user_id, pokemon_id)
- `reviews`: UNIQUE(user_id, pokemon_id) — 1 review per pokemon per user
- `team_pokemon`: UNIQUE(team_id, pokemon_id) + UNIQUE(team_id, slot) — max 6 per team (CHECK slot BETWEEN 1 AND 6)
- `teams.name`: UNIQUE per user_id (not global)
- All FK → CASCADE DELETE

## Environment

`backend/.env` has placeholder values — agent must configure before dev. `backend/.env*.local` gitignored; `.env` itself is tracked.

## Business Rules

- Review: rating 1–5, comment 10–1000 chars
- Bio: max 200 chars, name: min 2 chars
- Rate limits: 100 req/min global, 5 login/15min, 3 register/IP/hr
- Search pokemon: 300ms debounce
- PokeAPI pagination: `?limit=20&offset=X`

## State (Zustand Stores)

| Store | Key Pattern |
|-------|-------------|
| `auth.store.ts` | Token in memory, refresh in SecureStore |
| `pokemon.store.ts` | PokeAPI cache + pagination, `fetchPokemons(reset?)` |
| `favorites.store.ts` | Optimistic update with rollback |
| `review.store.ts` | Indexed `Record<pokemon_id, Review[]>` |
| `teams.store.ts` | CRUD + addPokemonToTeam / removePokemonFromTeam |

## Colors

Defined in `tailwind.config.js` and `constants/config.ts`. Primary `#CC0000`, Secondary `#003A8C`, Accent `#FFCB05`.
