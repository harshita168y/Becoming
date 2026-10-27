# Becoming — Next.js consistency tracker

A responsive personal-growth dashboard for a 60-active-day reset with 4 reset days. The challenge begins on the date of the first habit check-in; there is no pre-filled start date.

## Requirements
- Node.js 20.9 or later
- npm

## Run locally
```bash
npm install
npm run dev
```
Open http://localhost:3000.

## Production build
```bash
npm run build
npm run start
```

## Deploy
1. Create a Git repository and push this folder.
2. Import the repository into Vercel.
3. Keep the default Next.js build settings and deploy.

## What it includes
- Daily habit check-ins for movement, nutrition, study, career-building, and mind/reflection.
- The first tick starts the challenge automatically.
- 60 active days and four reset days, with a reset day after each 15 active days.
- Calendar view; select any challenge day to edit that day's check-ins and reflection.
- Progress cards and full-day completion tracking.
- Responsive layout for desktop and mobile.
- Local browser persistence via `localStorage`; no account or database required.

## Important notes
- Data is saved only in the browser/device where you use the app. Clearing browser data or switching devices will not carry progress over.
- The four reset days are scheduled as calendar days 16, 32, 48 and 64, leaving 60 active days total.
- The New Year countdown is informational; the 64-day challenge is anchored to your first check-in and may finish before or after New Year depending on when you start.
- To clear the tracker, use the circular reset icon in the top bar.
