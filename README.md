# FoodCompass

A real-time food rescue platform for UNSW. Societies, clubs and Arc often have untouched food left over after events. FoodCompass lets them post that food in a couple of minutes, and nearby students can claim it before it goes to waste.

FoodCompass was built by **Enactus UNSW** as a social-impact project to reduce on-campus food waste and help students facing food insecurity.

## How it works

- **No accounts.** Nobody has to sign up or log in.
- **Donors** go to `/redistribute` to post a listing with the food's details, pickup location, allergens and how long it will keep. They get a private link they can use to edit or close the listing.
- **Students** browse live listings at `/collect`, which updates in real time. To claim food, they enter their name, email and an estimated arrival time.
- **Automatic expiry.** Listings drop off the feed once their expiry time passes.

## Tech stack

| Area      | Tools                                                    |
| --------- | -------------------------------------------------------- |
| Framework | Next.js 16 (App Router, Turbopack), React 19, TypeScript |
| Styling   | Tailwind CSS 4, shadcn/ui, Framer Motion, GSAP           |
| Database  | Supabase (Postgres, Realtime, Storage)                   |
| Forms     | React Hook Form + Zod                                    |
| Email     | Resend                                                   |
| Hosting   | Vercel (incl. Vercel Analytics)                          |

## Getting started

### Prerequisites

- Node.js 20.9 or later
- A Supabase project (or the [Supabase CLI](https://supabase.com/docs/guides/cli) to run one locally)
- A Resend API key (only needed for sending emails)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # server-only; never expose to the client
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set up the database

The schema, plus the storage bucket for listing photos, lives in `supabase/migrations/`. To apply it to your linked Supabase project:

```bash
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

To run Supabase locally instead, use `npx supabase start`. It applies the migrations and loads `supabase/seed.sql`.

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command            | Description                |
| ------------------ | -------------------------- |
| `npm run dev`      | Start the dev server       |
| `npm run build`    | Production build           |
| `npm run start`    | Serve the production build |
| `npm run lint`     | Run ESLint                 |
| `npm run prettier` | Format the codebase        |

## Project structure

```
src/app/          Routes: (marketing), collect, redistribute, manage/[token]
components/       UI components (shadcn primitives in components/ui)
lib/              Supabase clients, server actions, Zod schemas, utilities
hooks/            Client hooks (countdowns, locally tracked claims)
supabase/         Migrations, seed data and local config
```
