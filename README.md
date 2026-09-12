# ALLAround GDP

An interactive way to explore how the world's economies have grown since 1990.
Spin a 3D globe, click any country, and see its GDP, growth rate and GDP per
capita - all from real World Bank data, refreshed automatically every week.

**Live site:** https://all-around-gdp.vercel.app

## What it does

- **Globe** - a 3D globe you can spin and click. Selecting a country pulls up
  its latest GDP, growth rate and per-capita figures.
- **History** - GDP trends from 1990 to today, with countries compared side by
  side on a single chart.
- **News** - current economy, business and finance headlines.
- **Games** - *Higher / Lower*, a quick game that asks whether the next
  country's GDP is higher or lower than the last.

## Tech stack

| Layer    | Choice                                              |
| -------- | --------------------------------------------------- |
| Framework| Next.js (App Router) + TypeScript                   |
| Styling  | Tailwind CSS                                        |
| Database | Neon Postgres, accessed through Prisma              |
| Charts   | Recharts                                            |
| Globe    | react-globe.gl (three.js)                           |
| Hosting  | Vercel, with a weekly cron job                      |

## Data sources

| Source                                                  | Used for                              |
| ------------------------------------------------------- | ------------------------------------- |
| [World Bank Open Data](https://data.worldbank.org/)      | GDP, growth and per-capita figures    |
| [Currents API](https://currentsapi.services/)            | Economy and business headlines        |
| [Wikipedia](https://en.wikipedia.org/)                   | Country economy background            |
| [Natural Earth](https://www.naturalearthdata.com/)       | Map and country boundaries            |

Figures are republished as-is for educational use. For anything official,
go to the original source.

## Running it locally

Requires Node.js 20+ and a Postgres database (Neon works well, and has a free
tier).

```bash
git clone https://github.com/Pansony67/ALLAround-GDP.git
cd ALLAround-GDP
npm install
```

Create a `.env` file in the project root:

```bash
# Postgres connection string (Neon, Supabase, local Postgres - anything)
DATABASE_URL="postgresql://..."

# Optional. Without it, the News page renders empty instead of failing.
CURRENTS_API_KEY="..."

# Optional. Powers the AI country explanations.
ANTHROPIC_API_KEY="..."

# Any random string. Protects the weekly sync endpoint from being
# triggered by anyone who finds the URL.
CRON_SECRET="..."
```

Then set up the database and start the dev server:

```bash
npx prisma generate
npx prisma db push
npm run dev
```

Open http://localhost:3000.

## How the data stays current

`vercel.json` schedules `/api/cron/sync-gdp` to run every Monday at 03:00 UTC.
That endpoint pulls the latest figures from the World Bank API and upserts them
into Postgres, so the site never needs manual updating. The endpoint checks
`CRON_SECRET` before doing anything.

## Project layout

```
src/
  app/
    api/            Route handlers (countries, history, news, explain, cron)
    explore/        3D globe
    history/        GDP-over-time charts
    news/           Headlines
    games/          Higher / Lower
    donate/         PayPal + PromptPay
  components/       Globe, charts, navbar, footer, music player
  lib/              Prisma client, country codes, flags, Wikipedia links
prisma/
  schema.prisma     Country, GdpRecord, Explanation models
```

## License and credits

Built by [Pannadhorn Rugseree](https://github.com/Pansony67).

This project is a personal/educational build. GDP data belongs to the World
Bank and is used under their open data terms; news content belongs to its
respective publishers.
