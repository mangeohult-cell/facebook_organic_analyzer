# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tech Stack

- **Next.js 14** with App Router + TypeScript
- **Tailwind CSS** with custom brand colors
- **Recharts** for charts
- **Lucide React** for icons
- **Clerk** for authentication (email whitelist)
- **Supabase** for database (PostgreSQL)
- **Papaparse** for CSV parsing
- Deploy target: **Vercel**

## Common Commands

```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run lint      # Lint
```

## Brand Colors (Tailwind config)

```js
colors: {
  vallmo: '#ED5821',   // Primary – buttons, CTA, active states
  ockra:  '#CDAC50',   // Secondary – badges, highlights
  asfalt: '#303942',   // Dark – sidebar, header, text
  light:  '#F5F5F0',   // Light background
  white:  '#FFFFFF',   // Card background
}
```

Font: **Outfit** (Google Fonts) as default. Fallback: Plus Jakarta Sans or Manrope.

## Architecture

### Pages (`/app`)
| Route | Purpose |
|-------|---------|
| `/` | Dashboard – aggregated KPIs across all months |
| `/month` | Monthly view – per-month stats with top/underperformers |
| `/compare` | Compare 2–6 months side by side |
| `/upload` | Upload Facebook Insights CSV files |
| `/admin` | Manage team members and email whitelist (admin only) |
| `/sign-in`, `/sign-up` | Clerk auth pages |

### Key Components
- `Sidebar.tsx` – left nav in Asfalt with Vallmo active state
- `KpiCard.tsx` – stat cards with month-over-month comparison
- `TrendChart.tsx` – reach & engagement line chart over time
- `ContentTypeChart.tsx` – pie chart by post type
- `TopPostsCard.tsx` – top 5 by reach / engagement
- `UnderperformersCard.tsx` – posts with 3000+ reach but low engagement rate
- `FileUploader.tsx` – drag & drop CSV with preview before save
- `CompareTable.tsx` / `CompareChart.tsx` – multi-month comparison

### Database (Supabase)

```sql
files (id, filename, month, uploaded_by, uploaded_by_name, uploaded_at, row_count)
posts (id, file_id → files.id CASCADE, title, published_at, reach, engagement, reactions, comments, shares, post_type)
```

Row Level Security: only authenticated users can read/write. Deleting a file cascades to its posts.

### CSV Parsing (`/lib/csv-parser.ts`)
Must handle both Swedish and English Facebook export column names:
- `Inläggstitel` / `Post title`
- `Publiceringstid` / `Published`
- `Räckvidd` / `Reach`
- `Engagemang` / `Engagement`
- `Reaktioner` / `Reactions`
- `Kommentarer` / `Comments`
- `Delningar` / `Shares`
- `Typ` / `Type`

### Auth (Clerk)
- All routes are protected except `/sign-in` and `/sign-up`
- Only whitelisted emails can register
- Admin route (`/admin`) is restricted to admin role

### Underperformer Logic
Posts qualify as underperformers when: `reach >= 3000` AND `engagement_rate = engagement / reach` is among the lowest for that period. Display with "Needs Improvement" badge (Ockra color).

## Environment Variables

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY   # Krävs för admin-skrivning till whitelist-tabellen
ADMIN_EMAIL                 # E-post till första admin (bootstrap), t.ex. din@email.com
```
