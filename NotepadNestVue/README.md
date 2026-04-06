# NotepadNestVue

Full-stack Notepad app with persistent PostgreSQL database:

- `backend/` - NestJS REST API with Prisma ORM
- `frontend/` - Vue 3 + Vite web app
- `.github/workflows/main.yml` - CI/CD pipeline for install/lint/test/build
- `docker-compose.yml` - PostgreSQL database container

## Quick start

### 1. Start PostgreSQL (Docker required)

```bash
docker-compose up -d
```

Or install PostgreSQL manually and create a database:
```sql
CREATE DATABASE notepad;
```

### 2. Setup Backend

```bash
cd backend
npm install
npm run prisma:migrate
npm run start:dev
```

Server runs on `http://localhost:3000`

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs on `http://localhost:5173`

## Environment Variables

**Backend** (`backend/.env`):
```
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/notepad?schema=public
```

**Frontend** (`frontend/.env`):
```
VITE_API_URL=http://localhost:3000
```

## CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/main.yml`) runs on every push/PR:
- Install dependencies (backend & frontend)
- Lint backend
- Run backend tests
- Build backend (NestJS)
- Build frontend (Vue)

## API Endpoints

All CRUD operations on `/notes`:
- `POST /notes` - Create note
- `GET /notes` - List all notes
- `GET /notes/:id` - Get single note
- `PUT /notes/:id` - Update note
- `DELETE /notes/:id` - Delete note

## Development

### Rebuild Prisma Client
```bash
cd backend
npm run prisma:generate
```

### Open Database Studio
```bash
cd backend
npm run prisma:studio
```

### Run Tests
```bash
cd backend
npm test
```

## Tech Stack

- **Backend**: NestJS, Prisma, PostgreSQL
- **Frontend**: Vue 3, Vite, Axios
- **Database**: PostgreSQL 12+
- **DevOps**: GitHub Actions, Docker

