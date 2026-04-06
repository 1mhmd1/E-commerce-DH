# Backend (NestJS + Prisma + PostgreSQL)

REST API for the Notepad app with persistent PostgreSQL database using Prisma ORM.

## Prerequisites

- Node.js 18+
- PostgreSQL 12+
- npm or pnpm

## Environment variables

Create a `.env` file (copy from `.env.example`):

```
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/notepad?schema=public
```

### DATABASE_URL format

```
postgresql://[user[:password]@][netloc][:port][/dbname][?param1=value1&...]
```

Example for local PostgreSQL:
```
postgresql://postgres:postgres@localhost:5432/notepad?schema=public
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create PostgreSQL database:
   ```sql
   CREATE DATABASE notepad;
   ```

3. Run Prisma migrations:
   ```bash
   npm run prisma:migrate
   ```

   This will:
   - Create the initial migration
   - Apply it to the database
   - Generate Prisma Client

4. Start the server:
   ```bash
   npm run start:dev
   ```

## Available Scripts

- `npm run start` - Start production server
- `npm run start:dev` - Start dev server with hot reload
- `npm run build` - Build TypeScript to dist/
- `npm run test` - Run unit tests
- `npm run lint` - Run ESLint
- `npm run prisma:generate` - Regenerate Prisma Client
- `npm run prisma:migrate` - Create and apply migrations
- `npm run prisma:migrate:deploy` - Apply migrations (CI/CD)
- `npm run prisma:studio` - Open Prisma Studio GUI

## API Endpoints

All endpoints return JSON and accept JSON requests.

### Create Note
```
POST /notes
Content-Type: application/json

{
  "title": "My Note",
  "content": "Note content here"
}
```

### Get All Notes
```
GET /notes
```

### Get Single Note
```
GET /notes/:id
```

### Update Note
```
PUT /notes/:id
Content-Type: application/json

{
  "title": "Updated title",
  "content": "Updated content"
}
```

### Delete Note
```
DELETE /notes/:id
```

## Database Schema

Notes table:
- `id` - Int, primary key, auto-increment
- `title` - VARCHAR(120), required
- `content` - TEXT, required
- `createdAt` - TIMESTAMP, auto-set on creation
- `updatedAt` - TIMESTAMP, auto-update on changes

## Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running
- Check DATABASE_URL is correct
- Ensure database exists

### Migration Failed
- Check for syntax errors in `prisma/schema.prisma`
- Run `npm run prisma:generate` to regenerate Prisma Client
- Check migration files in `prisma/migrations/`

### Prisma Studio
Open the GUI database browser:
```bash
npm run prisma:studio
```

