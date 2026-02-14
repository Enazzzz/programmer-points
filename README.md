# Programmer Points

A Vercel-deployable website that tracks **programmer points** as a currency. One admin can log in to give points, add people, and add/manage redeems.

## Features

- **Public leaderboard** – See everyone's points and redeem options
- **Admin-only actions** – Add people, give points, add redeems, process redeems
- **Single admin login** – Sign in with GitHub only; admin set in `config/admin.ts`
- **Neon Postgres** – Persistent storage via Vercel Neon integration

## Quick Start (Local)

```bash
npm install
cp .env.example .env
# Edit .env with your values (see below)
npm run dev
```

## Deploy to Vercel

1. **Push to GitHub** and import the repo in [Vercel](https://vercel.com).

2. **Add Neon Postgres**  
   In your Vercel project: **Storage → Create Database → Neon**. This sets `DATABASE_URL`.

3. **Set environment variables** in Vercel (Settings → Environment Variables):

   | Variable             | Description                              |
   |----------------------|------------------------------------------|
   | `DATABASE_URL`       | Auto-set by Neon integration             |
   | `AUTH_SECRET`        | Run `npx auth secret` to generate        |
   | `GITHUB_CLIENT_ID`   | From GitHub OAuth App                    |
   | `GITHUB_CLIENT_SECRET` | From GitHub OAuth App                  |

4. **Set admin in code** – Edit `config/admin.ts` and set `ADMIN_GITHUB_USERNAME` to the GitHub username of the only person who can sign in as admin.

5. **Deploy** – Vercel builds and deploys.

6. **Initialize DB** – After first deploy, sign in at `/admin` with GitHub and click **Init DB** in the header. This creates the tables.

**GitHub OAuth setup:** Create an OAuth App at [GitHub → Settings → Developer settings → OAuth Apps](https://github.com/settings/developers). Use `https://your-domain.com/api/auth/callback/github` as the callback URL (or `http://localhost:3000/api/auth/callback/github` for local dev).

## Project Structure

```
app/
  page.tsx          # Public leaderboard
  admin/
    login/page.tsx  # Admin login
    page.tsx        # Admin dashboard (give points, add people, add redeems)
  api/
    auth/[...nextauth]  # NextAuth (GitHub OAuth)
    people/         # list, add
    redeems/        # list, add
    points/         # give points
    redeem/         # process redeem
    init/           # init DB schema (admin only)
config/
  admin.ts          # ADMIN_GITHUB_USERNAME - who can sign in
lib/
  db.ts             # Neon Postgres client
  auth.ts           # isAdmin() using NextAuth session
```

## API

| Method | Endpoint         | Auth   | Description              |
|--------|------------------|--------|--------------------------|
| GET    | /api/people      | Public | List people              |
| POST   | /api/people      | Admin  | Add person               |
| GET    | /api/redeems     | Public | List redeems             |
| POST   | /api/redeems     | Admin  | Add redeem               |
| POST   | /api/points      | Admin  | Give points to a person  |
| POST   | /api/redeem      | Admin  | Process a redeem         |
| POST   | /api/init        | Admin  | Initialize DB schema     |
