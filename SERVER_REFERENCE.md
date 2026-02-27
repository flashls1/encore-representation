# ENCORE Representation — Deployment & Server Reference

## Live Site
- **URL:** https://encorerepresentation.com
- **Admin Login:** https://encorerepresentation.com/login
- **GitHub:** https://github.com/flashls1/encore-representation

## Server
- **Provider:** GCP (AG8-Server)
- **IP:** 35.188.155.233
- **Orchestration:** Coolify (http://35.188.155.233:8000)
  - **Login:** admin@ag8.local / AG8CoolifyAdmin2026!
  - **Project:** "The Girls Girl" → production
  - **App:** encore-representation (Dockerfile build)

## Supabase (Self-Hosted — Independent Instance)
- **Service:** supabase-girls-girl (UUID: s00gsowcgco444s448wskoks)
- **API URL:** https://api.encorerepresentation.com
- **Studio:** http://supabasestudio-s00gsowcgco444s448wskoks.35.188.155.233.sslip.io
  - **Login:** syj3McEnpmWKXr15 / PaBY79VY4NwBZiq7ms7c3r96MrWEpou6
- **Anon Key:** eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3MTY1MjI4MCwiZXhwIjo0OTI3MzI1ODgwLCJyb2xlIjoiYW5vbiJ9.--2EG7_4nH4OT3MNaE7dvYff8UKqkEzI9JEzUnpG4i4
- **Service Role Key:** eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3MTY1MjI4MCwiZXhwIjo0OTI3MzI1ODgwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.82vucf3sWMdUKF5ewlvVDII-TVTiG3ItoMOyrrm-930
- **Postgres Password:** witCYyxn0CcXY1EncCSl9Oy9Z0v9toF6
- **JWT Secret:** 64Ay3JqQaO9ymXcRkwaEQ8gi1i3K4Huq

## DNS (GoDaddy)
| Type | Name | Value |
|------|------|-------|
| A | @ | 35.188.155.233 |
| A | www | 35.188.155.233 |
| A | api | 35.188.155.233 |

## Admin User
- **Email:** imflash144@gmail.com
- **Password:** 12345678
- **User ID:** 55e39a24-c795-4ecd-a7fb-2cc2936bd5fc
- **Role:** admin

## Database Tables
talents, talent_roles, talent_images, site_settings, home_content, contact_settings, contact_submissions, media_library, navigation_items, user_roles

## Key Notes
- This is a SEPARATE Supabase instance from TMPRO (supabase-main)
- TMPRO uses api.talentmanagementpro.com — do NOT share or cross-connect
- Coolify auto-deploys from GitHub on "Redeploy" button click
- The Dockerfile does a multi-stage build (Node → Nginx)
