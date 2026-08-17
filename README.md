# PRIME™ E-Commerce

A Telegram Mini App shopfront with an admin panel, built on Hercules + Convex.

## Stack
- **Frontend**: React 19 + Vite + TypeScript + Tailwind CSS 4
- **Backend**: Convex (serverless functions + database)
- **Auth**: Hercules Auth (admin) + Telegram Mini App SDK (customers)
- **Address**: Geoapify autocomplete (Philippines-biased)
- **PWA**: Service Worker, web manifest, offline page

## Key Features
- Telegram Mini App customer shopfront
- Multi-step checkout with address autocomplete
- Order queue with real-time stats
- Admin panel with order management workflow
- Product management with image uploads
- Payment method & courier management

## Secrets required
- `ADMIN_ACCESS_CODE` — admin panel access code
- `GEOAPIFY_API_KEY` — address autocomplete
- `TELEGRAM_BOT_TOKEN` — Telegram auth validation
- `TELEGRAM_ADMIN_ID` — admin Telegram ID for notifications
- `HERCULES_API_KEY` — Hercules AI Gateway

## Deployed
- Mini App URL: `https://merce-771996.onhercules.app`
