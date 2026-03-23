# Facebook Organic Analyzer

Verktyg för att analysera organisk räckvidd och engagemang från Facebook Insights. Ladda upp CSV-exportfiler från Facebook och få automatisk statistik, trender och innehållsrekommendationer per månad.

## Funktioner

- **Dashboard** – aggregerade KPI:er (räckvidd, engagemang, ER, CTR, viralitet) med median/snitt-toggle
- **Månadsvy** – detaljerad statistik per månad med per-inlägg-prestanda och score
- **Jämförelsevy** – jämför upp till 6 månader sida vid sida
- **CSV-uppladdning** – stöder både svenska och engelska Facebook Insights-exportfiler
- **PDF-export** – exportera månads- och årsrapporter
- **Adminpanel** – hantera teammedlemmar och e-posttillträdeslista

## Teknikstack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS**
- **Recharts** – diagram
- **Clerk** – autentisering (Google OAuth)
- **Supabase** – databas (PostgreSQL)
- **Vercel** – hosting

## Sätta upp projektet

### 1. Klona repot

```bash
git clone https://github.com/mangeohult-cell/facebook_organic_analyzer.git
cd facebook_organic_analyzer
npm install
```

### 2. Skapa externa tjänster

Du behöver konton hos tre tjänster:

**Supabase** (`https://supabase.com`)
- Skapa ett nytt projekt
- Gå till **SQL Editor** och kör hela innehållet i `supabase-schema.sql`
- Hämta URL och nycklar under **Settings → API**

**Clerk** (`https://clerk.com`)
- Skapa en ny applikation
- Aktivera **Google** under *User & Authentication → Social Connections*
- Stäng av e-post/lösenord under *User & Authentication → Email, Phone, Username*
- Hämta nycklar under **API Keys**

**Vercel** (`https://vercel.com`)
- Importera repot från GitHub
- Lägg till miljövariabler (se nedan) under *Settings → Environment Variables*

### 3. Konfigurera miljövariabler

Kopiera `.env.example` till `.env.local` och fyll i dina värden:

```bash
cp .env.example .env.local
```

| Variabel | Beskrivning |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase-projektets URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon-nyckel (publik) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role-nyckel (hemlig) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publik nyckel |
| `CLERK_SECRET_KEY` | Clerk hemlig nyckel |
| `ADMIN_EMAIL` | E-post till första administratören |

### 4. Starta lokalt

```bash
npm run dev
```

Öppna `http://localhost:3000`.

## Åtkomstkontroll

Appen tillåter automatiskt alla konton med `@sverigeslarare.se`-domän. Enstaka undantag (t.ex. externa Gmail-adresser) läggs till manuellt i adminpanelen under `/admin`.

## Teknisk dokumentation

Se `CLAUDE.md` för detaljerad beskrivning av arkitektur, databasschema, CSV-parsning och komponentstruktur.
