# Quin69 VODs

Next.js archive for Quin69 Twitch VODs with chat replay. Forked from [OP-Archives/Quin69-site](https://github.com/OP-Archives/Quin69-site).

Live repo: [github.com/mihaissh/Quin69VODS](https://github.com/mihaissh/Quin69VODS)

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Video | react-youtube |
| Chat | Custom replay with BTTV / FFZ / 7TV emotes |

## Quick start

```bash
npm install
npm run dev
```

Create `.env.local` with the variables below (Vercel uses the same names).

## Environment variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_VODS_API_BASE` | VODs API base (`https://archive.overpowered.tv/api/v1/quin69`) |
| `NEXT_PUBLIC_CHANNEL` | Twitch channel name |
| `NEXT_PUBLIC_TWITCH_ID` | Twitch user ID for emotes |

## Routes

| Route | Description |
|-------|-------------|
| `/` | Paginated VOD archive with filters |
| `/vods/[vodId]` | VOD player with chat replay |
| `/live/[vodId]` | Redirects to `/vods/[vodId]` |
| `/youtube/[vodId]` | Redirects to `/vods/[vodId]` |

## Features

- Paginated archive with date, title, and game filters
- YouTube player with theater, side-by-side, and video-only layouts
- Synchronized chat replay with adjustable delay
- Previous / next stream navigation
- Multi-part VOD switching
- Timestamp link copying
- Third-party emote support (BTTV, FFZ, 7TV)

## Commands

```bash
npm run dev     # development
npm run build   # production build
npm run start   # run production build locally
npm run lint    # eslint
```
