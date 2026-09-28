# Notes

A small private notes application with email/password authentication and owner-only CRUD operations.

## Features

- Register, log in, and log out.
- List, create, edit, and delete private notes.
- Enforce note ownership in every server-side query.
- Validate note input on the server.

## Stack

- Next.js and React
- TypeScript and plain CSS
- Better Auth for email/password authentication
- Drizzle ORM with PostgreSQL
- Zod for server-side validation
- Vercel-compatible Next.js API routes

## Run locally

Requirements: Node.js 20.9 or newer and PostgreSQL 14 or newer.

```bash
git clone https://github.com/basecaseworks/notes.git
cd notes
npm install
cp .env.example .env.local
npm run db:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`npm run db:seed` only verifies the database connection. Notes are private, so no sample rows are inserted.

## Environment variables

Copy `.env.example` to `.env.local` and set:

- `DATABASE_URL`: PostgreSQL connection string.
- `BETTER_AUTH_SECRET`: high-entropy secret of at least 32 characters.
- `BETTER_AUTH_URL`: the application base URL, such as `http://localhost:3000`.

Never commit `.env.local` or real secrets.

## Database

The application uses ordinary PostgreSQL through Drizzle. Apply committed migrations to a new database with:

```bash
npm run db:migrate
```

After changing `src/db/schema`, generate a migration with:

```bash
npm run db:generate
```

The database is not tied to a provider-specific API, so changing PostgreSQL hosts only requires changing `DATABASE_URL`.

## API

Better Auth is mounted at `/api/auth/[...all]`.

Notes endpoints require an authenticated session:

```text
GET    /api/notes
POST   /api/notes
GET    /api/notes/:id
PATCH  /api/notes/:id
DELETE /api/notes/:id
```

Create and update bodies use JSON with `title` and `content` fields. Titles are required and limited to 200 characters. Content is limited to 100,000 characters.

## Tests

Run the static checks and tests with:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

The integration tests run when `DATABASE_URL` or `TEST_DATABASE_URL` is set and the migrated database is available. `npm run verify` runs linting, type checking, tests, and a production build.

## Deployment

Deploy the repository as a Next.js project on Vercel. Set `DATABASE_URL`, `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL` in the Vercel project environment, run the committed migrations against the production PostgreSQL database, and deploy.

Neon is a suitable hosted PostgreSQL option, but the application uses standard PostgreSQL connections and does not require Neon-specific code.

## Intentionally not included

Folders, tags, rich text, attachments, sharing, collaboration, OAuth, email verification, and account settings are outside this reference implementation.
