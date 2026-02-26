# SillCon 2026

Lawton, Oklahoma's premier anime convention at Fort Sill.

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + shadcn/ui + Custom Theme System (10 themes)
- **Backend:** Supabase (Auth, Database, Storage)
- **Hosting:** Git-based deployment

## Local Development

```bash
npm install
npm run dev
```

## Project Structure

```
src/
├── components/       # UI components
│   ├── admin/        # Admin CMS panels (15 tabs)
│   └── ui/           # shadcn/ui components
├── hooks/            # Data hooks (useData, useAuth, useTheme, useWeather, etc.)
├── integrations/     # Supabase client & types
├── pages/            # Route pages (public + admin)
└── types/            # TypeScript interfaces
```

## Key Features

- **10 site-wide themes** with live switching from admin
- **Full admin CMS** with 15 tab panels
- **Media Library** with 500MB storage, upload/delete/browse
- **Vendor management** with booth assignments, contracts, payments
- **Schedule builder** with day/event management
- **News/blog system** with publish/draft, categories, tags
- **Cosplay contest** registration and admin approval workflow
- **Volunteer applications** with status pipeline
- **Newsletter signups** with CSV export
- **Weather widget** (OpenWeatherMap, Lawton OK)
- **Countdown timer** to event start
