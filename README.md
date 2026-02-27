# Encore Representation

Universal CMS for talent representation and event management.

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + shadcn/ui + Custom Theme System (11 themes)
- **Backend:** Supabase (Auth, Database, Storage)
- **Hosting:** Coolify on GCP (Dockerfile → Nginx)

## Local Development

```bash
npm install
npm run dev
```

## Project Structure

```
src/
├── components/       # UI components
│   ├── admin/        # Admin CMS panels
│   └── ui/           # shadcn/ui components
├── hooks/            # Data hooks (useData, useAuth, useTheme, etc.)
├── integrations/     # Supabase client & types
├── pages/            # Route pages (public + admin)
└── types/            # TypeScript interfaces
```

## Key Features

- **11 site-wide themes** with live switching from admin
- **Full admin CMS** with tabbed panels
- **Media Library** with 500MB storage, upload/delete/browse
- **Talent management** with headshots, roles, bios
- **Contact form** with admin review
- **Responsive design** (mobile + desktop)
