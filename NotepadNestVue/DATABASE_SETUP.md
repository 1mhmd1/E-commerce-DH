# PostgreSQL & Prisma Setup Guide

This project uses **PostgreSQL** for persistent data storage with **Prisma ORM** for type-safe database access.

## Option 1: Docker (Recommended for Development)

### Prerequisites
- Docker and Docker Compose installed

### Quick Start
```bash
# Start PostgreSQL container
docker-compose up -d

# Run migrations
cd backend
npm run prisma:migrate

# Start backend
npm run start:dev
```

The PostgreSQL database will be available at:
```
postgresql://postgres:postgres@localhost:5432/notepad
```

To stop:
```bash
docker-compose down
```

## Option 2: Manual PostgreSQL Installation

### Prerequisites
- PostgreSQL 12+ installed locally
- psql client

### Setup
1. Create database:
   ```bash
   createdb -U postgres notepad
   ```

2. Update `backend/.env`:
   ```
   DATABASE_URL=postgresql://postgres:password@localhost:5432/notepad?schema=public
   ```

3. Run migrations:
   ```bash
   cd backend
   npm run prisma:migrate
   ```

## Database Migrations

### Create Migration
After modifying `prisma/schema.prisma`:
```bash
cd backend
npm run prisma:migrate
```

This will:
1. Detect schema changes
2. Create a new migration file
3. Apply it to the database
4. Regenerate Prisma Client

### View Pending Migrations
```bash
cd backend
npm run prisma:migrate -- --draft
```

### Apply Migrations (CI/CD)
```bash
cd backend
npm run prisma:migrate:deploy
```

## Prisma Studio

Open interactive database GUI:
```bash
cd backend
npm run prisma:studio
```

This opens a web interface at `http://localhost:5555` where you can:
- View all notes
- Add/edit/delete notes
- Inspect database schema

## Database Schema

The `Note` model in `prisma/schema.prisma`:
```prisma
model Note {
  id        Int     @id @default(autoincrement())
  title     String  @db.VarChar(120)
  content   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Generates PostgreSQL table:
```sql
CREATE TABLE "Note" (
  "id" SERIAL PRIMARY KEY,
  "title" VARCHAR(120) NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL
);
```

## Prisma Client Usage

In `backend/src/notes/notes.service.ts`:
```typescript
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    // Prisma type-safe query
    return this.prisma.note.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: CreateNoteDto) {
    return this.prisma.note.create({ data });
  }
}
```

## Troubleshooting

### Connection Refused
- Verify PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- For Docker: run `docker-compose ps` to see container status

### Migration Conflicts
- Check `prisma/migrations/` for conflicting migration files
- Delete local migrations and re-run if needed
- Never modify applied migrations

### Prisma Client Errors
Regenerate Prisma Client:
```bash
cd backend
npm run prisma:generate
```

### Reset Database (Development Only)
⚠️ **WARNING**: This deletes all data!
```bash
cd backend
npx prisma migrate reset
```

## Environment Variables

**backend/.env**:
```bash
PORT=3000
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]?schema=public
```

**Connection String Components**:
- `user`: PostgreSQL username (default: `postgres`)
- `password`: PostgreSQL password
- `host`: Database host (default: `localhost`)
- `port`: Database port (default: `5432`)
- `database`: Database name (default: `notepad`)
- `schema`: Prisma schema (default: `public`)

## Further Reading

- [Prisma Documentation](https://www.prisma.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
