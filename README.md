# SLYD

A React + Vite app, ready to deploy on Vercel.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Install dependencies

```bash
npm install
```

### Configure environment

Create a `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

Fill in your backend API URL:

```
VITE_API_BASE_URL=https://your-api.vercel.app/api
```

### Run the dev server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Deploy to Vercel

1. Push to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Set `VITE_API_BASE_URL` in your Vercel project's Environment Variables
4. Deploy

## Backend

This app calls a REST API at `VITE_API_BASE_URL`. You'll need to implement a backend with the following routes:

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/auth/me | Returns current authenticated user |
| GET | /api/auth/status | Returns `{ isAuthenticated: boolean }` |
| POST | /api/auth/logout | Clears session |
| GET | /api/entities/:entity | Filter records (query params as filters) |
| GET | /api/entities/:entity/:id | Get single record |
| POST | /api/entities/:entity | Create record |
| PATCH | /api/entities/:entity/:id | Update record |
| DELETE | /api/entities/:entity/:id | Delete record |
| POST | /api/upload | Upload file, returns `{ file_url }` |

## Entities

The data models live in `entities/` and document the shape of each record:

- `UserProfile` — user profile data
- `Conversation` — chat conversations
- `Message` — chat messages
- `Favorite` — favorite profiles
- `Block` — blocked users
- `Report` — user reports
- `ProfileView` — profile view events

## Image Assets

Replace the placeholder image references in the app with your own hosted assets:

- `/images/logo.png` — app logo (used in header and loading screen)
- `/images/mascot.png` — background mascot graphic

Place these files in the `public/images/` directory.
