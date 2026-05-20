# Quin69 VODs — Next-Gen Archive

Next.js rebuild of the [Quin69 VOD archive](https://github.com/mihaissh/Quin69VODS). Forked from [OP-Archives/Quin69-site](https://github.com/OP-Archives/Quin69-site).

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 (CSS-first config) |
| Animation | CSS keyframes + Framer Motion ready |
| Video | react-youtube |
| Chat | Custom parser w/ FFZ / BTTV / 7TV emotes |

## Quick start

```bash
# 1. Copy environment variables
cp .env.local.example .env.local   # or edit .env.local directly

# 2. Install
npm install

# 3. Dev
npm run dev        # http://localhost:3000

# 4. Build
npm run build
```

## Environment variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_VODS_API_BASE` | Base URL of the VODs API (`https://archive.overpowered.tv/api/v1/quin69`) |
| `NEXT_PUBLIC_CHANNEL` | Twitch channel name |
| `NEXT_PUBLIC_TWITCH_ID` | Twitch numeric user ID (for emotes) |
| `NEXT_PUBLIC_DEFAULT_DELAY` | Default chat delay in seconds |

## Routes

| Route | Description |
|-------|-------------|
| `/` | VOD archive with infinite scroll |
| `/vods/[vodId]` | VOD player (type=vod) |
| `/live/[vodId]` | Live recording player |
| `/youtube/[vodId]` | Alias → redirects to `/vods/[vodId]` |

## Architecture

```
src/
├── app/                   # Next.js App Router pages
│   ├── page.tsx           # Archive (infinite scroll grid)
│   ├── vods/[vodId]/      # VOD player
│   ├── live/[vodId]/      # Live recording player
│   └── youtube/[vodId]/   # Redirect alias
├── components/
│   ├── layout/            # Navbar
│   ├── ui/                # Atomic: Skeleton
│   ├── vods/              # Feature: VodCard, VodGrid, VodFilters, FeaturedVod
│   └── player/            # Feature: VodPlayer, YouTubePlayer, ChatPanel,
│                          #          ChaptersTimeline, PartSelector
├── hooks/                 # useVods, useDebounce
├── lib/                   # api.ts, utils.ts
└── types/                 # vod.ts
```

## New VOD viewing features

- **Theater mode** — full-width player with floating glass chat overlay
- **Side-by-side mode** — classic layout with pinned 320px chat panel
- **Chat-hidden mode** — distraction-free player
- **Chapter timeline** — color-coded visual bar; click any segment to seek
- **Chapter jump buttons** — labeled shortcuts with timestamps
- **Part selector** — seamless multi-part VOD navigation
- **Timestamp copy** — share a link to any moment in one click
- **Infinite scroll** archive (IntersectionObserver-based)
- **Featured hero card** — latest VOD showcased at the top
- **Third-party emotes** — FFZ, BTTV, 7TV loaded automatically
- **Chat delay controls** — fine-tune sync with ±5s buttons
- **Auto-scroll with pause** — chat auto-scrolls; pauses on manual scroll
