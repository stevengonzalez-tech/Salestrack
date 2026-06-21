# SalesTrack Pro

Sales pipeline management for high-performance teams.

## Stack

- **Next.js 15** — App Router, Server Components
- **TypeScript** — strict mode
- **Tailwind CSS** — utility-first styling
- **Supabase** — PostgreSQL + Auth + Row Level Security

## Roles

| Role   | Capabilities |
|--------|-------------|
| Admin  | Full access — all records, team, settings |
| Leader | All leads/deals/contacts, reports, team view |
| Agent  | Own leads, deals, and contacts only |

## Quick Start

```bash
# 1. Clone and install
npm install

# 2. Set up environment
cp .env.local.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

# 3. Run migrations in Supabase SQL editor
# supabase/migrations/001_initial_schema.sql

# 4. (Optional) Load seed data
# supabase/seed.sql

# 5. Start dev server
npm run dev
```

## Project Structure

```
app/
  (auth)/login/         — Login page
  (dashboard)/
    dashboard/          — KPI overview + charts
    leads/              — Lead management (CRUD)
    deals/              — Kanban pipeline board
    contacts/           — Contact directory
    reports/            — Revenue & funnel reports
    team/               — Team member roster
    settings/           — Workspace settings & permissions
  api/                  — REST API routes
components/
  auth/                 — Login form
  dashboard/            — Stats cards, charts, activity feed
  deals/                — Kanban board, deal forms
  leads/                — Lead cards and forms
  contacts/             — Contact forms
  layout/               — Sidebar, header
  ui/                   — Button, Card, Badge, Input, Modal
lib/
  supabase/             — Client & server helpers
  hooks/                — useLeads, useDeals, useAuth
  types/                — Shared TypeScript interfaces
  utils/                — formatCurrency, formatDate, etc.
supabase/
  migrations/           — SQL schema with RLS policies
  seed.sql              — Demo data
```
