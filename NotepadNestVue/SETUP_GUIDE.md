# 📖 Complete Setup & Run Guide

## Project Overview

**Notepad NestVue** is a full-stack web application for creating, editing, and managing notes.

- **Frontend**: Vue 3 + Vite (React-like composition API)
- **Backend**: NestJS REST API (Node.js framework)
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: Docker, GitHub Actions CI/CD

---

## 📦 Installation

### Prerequisites
- **Node.js 18+** - [Download](https://nodejs.org/)
- **PostgreSQL 12+** - [Download](https://www.postgresql.org/download/) OR Docker
- **Git** - [Download](https://git-scm.com/)

### Clone Repository
```bash
git clone https://github.com/1mhmd1/Notepad-NestVue-DH.git
cd NotepadNestVue
```

---

## 🗄️ Database Setup

### Option A: Docker (Recommended)
```bash
docker-compose up -d
```
This starts PostgreSQL on `localhost:5432`

### Option B: Manual PostgreSQL
```sql
CREATE DATABASE notepad;
```
Then update `backend/.env`:
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/notepad?schema=public
```

---

## 🔧 Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Run database migrations (creates tables)
npm run prisma:migrate

# Start development server (auto-reload)
npm run start:dev
```

**Backend runs on**: http://localhost:3000

### Useful Backend Commands
```bash
npm run start:dev      # Development with hot reload
npm run build          # Build TypeScript
npm test              # Run unit tests
npm run lint          # Check code quality
npm run prisma:studio # Open database GUI at http://localhost:5555
```

---

## 🎨 Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file (or use default)
cp .env.example .env

# Start development server with hot reload
npm run dev
```

**Frontend runs on**: http://localhost:5173

### Useful Frontend Commands
```bash
npm run dev     # Development server with hot reload
npm run build   # Build for production
npm run preview # Preview production build
```

---

## 🚀 Running Both Servers

### Terminal 1: Backend
```bash
cd backend
npm install
npm run prisma:migrate
npm run start:dev
```

### Terminal 2: Frontend
```bash
cd frontend
npm install
npm run dev
```

### Terminal 3: Database (if not using Docker)
Ensure PostgreSQL is running.

---

## 📝 API Endpoints

All endpoints work with JSON requests/responses.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/notes` | Get all notes |
| `GET` | `/notes/:id` | Get single note |
| `POST` | `/notes` | Create note |
| `PUT` | `/notes/:id` | Update note |
| `DELETE` | `/notes/:id` | Delete note |

### Example Requests
```bash
# Get all notes
curl http://localhost:3000/notes

# Create note
curl -X POST http://localhost:3000/notes \
  -H "Content-Type: application/json" \
  -d '{"title":"My Note","content":"Note content"}'

# Update note (id=1)
curl -X PUT http://localhost:3000/notes/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated","content":"New content"}'

# Delete note (id=1)
curl -X DELETE http://localhost:3000/notes/1
```

---

## 🧪 Testing

### Backend Unit Tests
```bash
cd backend
npm test          # Run tests once
npm run test:watch # Run tests in watch mode
```

### Build Verification
```bash
cd backend
npm run build

cd ../frontend
npm run build
```

---

## 🔍 Debugging

### Prisma Studio (Database GUI)
```bash
cd backend
npm run prisma:studio
```
Opens http://localhost:5555 with interactive database browser.

### Backend Logs
Check server output for request/response logs.

### Frontend DevTools
Press `F12` in browser to open developer tools.

---

## 📁 Project Structure

```
NotepadNestVue/
├── backend/
│   ├── src/
│   │   ├── notes/          # Notes CRUD logic
│   │   │   ├── notes.controller.ts
│   │   │   ├── notes.service.ts
│   │   │   ├── notes.module.ts
│   │   │   ├── dto/        # Data validation
│   │   │   └── entities/   # Database models
│   │   ├── prisma/         # Database service
│   │   └── main.ts         # Entry point
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── migrations/     # Database versions
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Vue components
│   │   │   ├── NotesList.vue
│   │   │   └── NoteEditor.vue
│   │   ├── App.vue         # Main component
│   │   └── main.js         # Entry point
│   └── package.json
└── docker-compose.yml      # PostgreSQL setup
```

---

## 🐛 Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution**: Ensure PostgreSQL is running or use `docker-compose up -d`

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution**: Kill the process or use a different port in `.env`

### Prisma Migration Failed
```bash
# Regenerate Prisma Client
npm run prisma:generate

# Reset database (⚠️ deletes all data!)
npx prisma migrate reset
```

### Frontend API Call Fails
Check `frontend/.env` has correct `VITE_API_URL`:
```
VITE_API_URL=http://localhost:3000
```

---

## 📚 Documentation Files

- **README.md** - Project overview
- **DATABASE_SETUP.md** - PostgreSQL & Prisma detailed guide
- **PRISMA_INTEGRATION.md** - ORM integration details
- **GITHUB_SETUP.md** - Repository information

---

## 🚀 Production Build

### Backend
```bash
cd backend
npm run build
npm run start:prod
```

### Frontend
```bash
cd frontend
npm run build
# Outputs optimized files to dist/
```

---

## 🔄 CI/CD Pipeline

GitHub Actions automatically tests on every push:
- `.github/workflows/main.yml` runs:
  - Dependency installation
  - Linting
  - Unit tests
  - Production builds

View status: https://github.com/1mhmd1/Notepad-NestVue-DH/actions

---

## 🤝 Contributing

1. Create a new branch: `git checkout -b feature/your-feature`
2. Make changes
3. Commit: `git commit -m "feat: description"`
4. Push: `git push origin feature/your-feature`
5. Create Pull Request on GitHub

---

## 📞 Support

- Check documentation files
- Review error messages in terminal/console
- Ensure all prerequisites are installed
- Check port availability (3000, 5173, 5432)

---

## 📄 License

UNLICENSED (Private project)

---

**Happy coding! 🎉**
