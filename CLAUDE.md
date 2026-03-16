# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
pnpm dev          # Start dev server (port 3000)
pnpm build        # Production build
pnpm preview      # Preview production build

# Code quality
pnpm lint         # Lint with Biome
pnpm format       # Format with Biome
pnpm check        # Lint + format + organize imports

# Testing
pnpm test         # Run Vitest

# Database
pnpm db:generate  # Regenerate Prisma client (run after schema changes)
pnpm db:push      # Push schema to DB without migration
pnpm db:migrate   # Create and apply a migration
pnpm db:studio    # Open Prisma Studio
pnpm db:seed      # Seed DB with sample todos

# Deployment
pnpm deploy       # Build and deploy to Cloudflare Workers
```

## Architecture

**Stack:** TanStack Start (React 19 + SSR) + TanStack Router + TanStack Query + Prisma + PostgreSQL, deployed to Cloudflare Workers.

**Routing:** File-based via TanStack Router. Routes live in `src/routes/`. `routeTree.gen.ts` is auto-generated — never edit it manually. Loaders and server functions are colocated within route files.

**Data fetching:** TanStack Query for client-side caching; server functions (TanStack Start) for server-side mutations. The query provider is set up in `src/integrations/tanstack-query/root-provider.tsx`.

**Database:** Prisma ORM with PostgreSQL. Client is generated to `src/generated/prisma/` — never edit those files. The DB singleton with connection pooling is in `src/db.ts`. Schema is at `prisma/schema.prisma`.

**Styling:** Tailwind CSS v4. Theme variables (colors, surfaces) are defined as CSS custom properties in `src/styles.css`. Dark mode is toggled via `data-theme="dark"` on the root element and persisted to localStorage.

**Linting/Formatting:** Biome (not ESLint/Prettier). Config in `biome.json` — uses tabs, double quotes.

## Dev Environment

The devcontainer sets up Node 22 + PostgreSQL 17 automatically. `DATABASE_URL` is pre-configured in `.env.local`:

```
DATABASE_URL="postgresql://db_user:db_password@localhost:5432/dev"
```

After the container starts, run `pnpm db:push` and `pnpm db:seed` to initialize the database.

## Path Aliases

`@/*` and `#/*` both resolve to `src/*` (configured in `tsconfig.json`).
