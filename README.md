# 2AM 🌙

> Anonymous, real-time voice conversations for students. No profiles. No usernames. No history. Just open the app, get matched, and talk.

## Overview

2AM is a safe, anonymous voice conversation platform built for students who need someone to talk to — right now. The app matches two strangers based on mood compatibility, enables a structured turn-based voice conversation (5+5+2 minutes), then erases everything when it's done.

**Core Principle:** No identity. No persistence. Just presence.

## Architecture

```
mobile/     React Native (Expo) app
server/     Node.js + Express + Socket.io backend
shared/     Shared TypeScript types
```

## Quick Start

### Prerequisites

- Node.js 18+
- Redis (local or cloud)
- PostgreSQL (local or cloud, optional for MVP)
- Expo CLI (`npm install -g expo-cli`)
- [Agora.io account](https://console.agora.io) (free tier available)

---

### 1. Backend Setup

```bash
cd server
cp .env.example .env
# Edit .env with your credentials
npm install
npm run dev
```

The server runs on `http://localhost:3001`.

**Environment Variables:**

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 3001) |
| `AGORA_APP_ID` | Agora App ID from console.agora.io |
| `AGORA_APP_CERTIFICATE` | Agora App Certificate for token generation |
| `REDIS_URL` | Redis connection URL |
| `DATABASE_URL` | PostgreSQL connection URL |
| `CORS_ORIGINS` | Allowed CORS origins (comma-separated) |

---

### 2. Mobile Setup

```bash
cd mobile
cp .env.example .env
# Edit .env — set EXPO_PUBLIC_SERVER_URL to your server URL
npm install
npm start
```

Then press `i` for iOS simulator, `a` for Android, or scan the QR code with Expo Go.

**Environment Variables:**

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_SERVER_URL` | Backend server URL |
| `EXPO_PUBLIC_AGORA_APP_ID` | Agora App ID |

---

## Project Structure

### Mobile (`mobile/`)

| Path | Description |
|---|---|
| `app/index.tsx` | Home screen — time-aware greeting, CTA, online counter |
| `app/mood.tsx` | Mood selection — 4 tiles (Vent, Casual, Advice, Listen) |
| `app/matching.tsx` | Matching screen — pulsing sonar animation |
| `app/chat.tsx` | Chat room — turn-based voice with timers and reactions |
| `app/end.tsx` | End screen — emoji rating, re-queue, conversation erased |
| `components/` | Reusable UI components |
| `services/socket.ts` | Socket.io client with typed event helpers |
| `services/agora.ts` | Agora voice SDK wrapper (placeholder-ready) |
| `hooks/useSession.ts` | Anonymous session management (device ID based) |
| `hooks/useTimer.ts` | Countdown timer hook |
| `hooks/useMatching.ts` | Matching state management |
| `constants/moods.ts` | Mood definitions and compatibility matrix |
| `constants/theme.ts` | Dark theme with time-aware colors |
| `constants/reactions.ts` | Listener reaction configurations |

### Server (`server/src/`)

| Path | Description |
|---|---|
| `index.ts` | Express + Socket.io server entry point |
| `matching/` | Queue management and matching engine |
| `session/` | Session lifecycle and server-side timers |
| `trust/` | Trust score system and moderation |
| `safety/` | Reports, content filters, shadow-ban logic |
| `events/socketHandlers.ts` | All Socket.io event handlers |
| `db/redis.ts` | Redis connection and key helpers |
| `db/postgres.ts` | PostgreSQL connection and schema |
| `config/index.ts` | Environment configuration |

---

## Conversation Flow

```
Home → Mood Selection → Matching → Chat Room → End Screen
```

### Chat Phases

| Phase | Duration | Description |
|---|---|---|
| Phase 1 | 5 min | User A speaks, User B listens (reactions only) |
| Transition | 5 sec | "Switching roles..." countdown |
| Phase 2 | 5 min | Roles reverse |
| Open | 2 min | Both can speak freely |

---

## Matching Engine

### Mood Compatibility Matrix

| Your Mood | Compatible With |
|---|---|
| 🌊 Vent | Listen, Casual |
| 💬 Casual | Casual, Vent, Advice |
| 🧭 Advice | Listen, Advice |
| 🤝 Listen | Vent, Advice |

### Trust Score System

| Action | Score Change |
|---|---|
| Session completed | +2 |
| Positive rating received | +5 |
| Report received | -10 |
| Confirmed violation | -20 |

- **Score < 20:** Shadow-matched with other low-trust users only
- **Score > 70:** Priority in matching queue
- **Default:** 50/100

### Queue Priority

- Higher trust score = matched faster
- +1 priority per 5 seconds in queue
- Duplicate prevention: same pair not re-matched for 24 hours

---

## Safety System

### Report Flow

1. Tap ⚠️ during conversation
2. Select category: Inappropriate/sexual | Rude/aggressive | Shared personal info | Other
3. Session ends, report filed, trust score adjusted

### Auto-Moderation

- **2 reports in 48h:** 24-hour cooldown
- **3 reports in a week:** Permanent device ban
- **Content filters:** Phone number regex, social media handle detection
- **Shadow-ban:** Low-trust users matched only with other low-trust users

---

## Agora.io Integration

The app uses Agora.io for real-time voice. To activate:

1. Create an account at [console.agora.io](https://console.agora.io)
2. Create a new project → copy App ID and App Certificate
3. Add to `server/.env`: `AGORA_APP_ID` and `AGORA_APP_CERTIFICATE`
4. Add to `mobile/.env`: `EXPO_PUBLIC_AGORA_APP_ID`
5. In production, install `react-native-agora` in the mobile app and implement the `AgoraService` interface in `mobile/services/agora.ts`
6. In `server/src/matching/engine.ts`, uncomment the token generation code using `agora-access-token`

---

## Development Notes

- The app runs in **mock/placeholder mode** without real Agora credentials — UI and matching logic fully functional, voice is simulated
- Redis is required for the matching queue. Start with: `docker run -p 6379:6379 redis`
- PostgreSQL is optional for initial development (trust scores/reports in-memory fallback)
- Socket.io connections use `websocket` transport first with polling fallback

---

## Stack

- **Frontend:** React Native + Expo + Expo Router
- **Backend:** Node.js + Express + Socket.io
- **Voice:** Agora.io (with placeholder/mock)
- **Queue:** Redis (FIFO with priority scoring)
- **Storage:** PostgreSQL (trust scores, reports, bans)
- **Language:** TypeScript (full-stack)

---

*2AM — for the conversations that matter most.*