# DurianPay — Payment Monitoring Dashboard

An internal dashboard for monitoring incoming payments. Built with **Go** (backend) and **React + Vite** (frontend).

---

## Tech Stack

| Layer     | Tech                                      |
|-----------|-------------------------------------------|
| Backend   | Go 1.21+, Chi router, SQLite, JWT         |
| Frontend  | React 19, TypeScript, Vite, Zustand, TanStack Query |
| API Spec  | OpenAPI 3.0 (`openapi.yaml`)              |
| Auth      | JWT Bearer tokens                         |

---

## Prerequisites

| Tool       | Version  |
|------------|----------|
| Go         | v1.21+   |
| Node.js    | v20+     |
| Make       | any      |
| Docker     | optional |
| GCC / CGO  | required (for SQLite) |

> macOS: GCC is available after installing Xcode Command Line Tools — `xcode-select --install`

---

## Quick Start (Local)

### 1. Backend

```bash
cd backend

# Copy env file and configure
cp env.sample .env

# Install dependencies
go mod tidy

# Run backend (starts on :8080)
make run
```

The backend auto-creates the SQLite database (`dashboard.db`) and seeds:
- **2 users**: `cs@test.com` / `operation@test.com` (password: `password`)
- **50 payments** with mixed statuses

### 2. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy env and set API base URL
cp .env.example .env

# Run dev server (starts on :5173)
npm run dev
```

Open **http://localhost:5173** and log in with one of the demo accounts.

---

## Quick Start (Docker Compose)

```bash
# From repo root
docker-compose up --build
```

| Service   | URL                      |
|-----------|--------------------------|
| Backend   | http://localhost:8080    |
| Frontend  | http://localhost:5173    |

---

## Build for Production

### Backend
```bash
cd backend
make build
# Binary at: backend/bin/mygolangapp
./bin/mygolangapp
```

### Frontend
```bash
cd frontend
npm run build
# Output at: frontend/dist/
npm run preview   # preview production build locally
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable              | Default              | Description              |
|-----------------------|----------------------|--------------------------|
| `HTTP_ADDR`           | `:8080`              | Server listen address    |
| `JWT_SECRET`          | `your-very-secret`   | JWT signing secret       |
| `JWT_EXPIRED`         | `24h`                | Token expiry duration    |
| `OPENAPIYAML_LOCATION`| `../openapi.yaml`    | Path to OpenAPI spec     |

> Generate a secure JWT secret: `cd backend && make gen-secret`

### Frontend (`frontend/.env`)

| Variable           | Default                                   | Description     |
|--------------------|-------------------------------------------|-----------------|
| `VITE_API_BASE_URL`| `http://localhost:8080/dashboard/v1`      | Backend API URL |

---

## API Documentation

OpenAPI spec is at `openapi.yaml` in the repo root.

### Endpoints

| Method | Path                         | Auth     | Description              |
|--------|------------------------------|----------|--------------------------|
| POST   | `/dashboard/v1/auth/login`   | None     | Login, returns JWT token |
| GET    | `/dashboard/v1/payments`     | Bearer   | List all payments        |
| GET    | `/dashboard/v1/payments?status=completed` | Bearer | Filter by status |

### Login
```bash
curl -X POST http://localhost:8080/dashboard/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"cs@test.com","password":"password"}'
```

### List Payments
```bash
curl http://localhost:8080/dashboard/v1/payments \
  -H "Authorization: Bearer <your_token>"
```

### Filter by Status
```bash
curl "http://localhost:8080/dashboard/v1/payments?status=failed" \
  -H "Authorization: Bearer <your_token>"
```

---

## Demo Credentials

| Role        | Email                  | Password   |
|-------------|------------------------|------------|
| CS          | cs@test.com            | password   |
| Operations  | operation@test.com     | password   |

---

## Project Structure

```
.
├── openapi.yaml              # API specification
├── README.md
├── docker-compose.yml
├── backend/
│   ├── main.go               # Entry point, DB init & seed
│   ├── Makefile
│   ├── env.sample
│   └── internal/
│       ├── api/              # HTTP handlers (route dispatch)
│       ├── config/           # Env config
│       ├── entity/           # Domain models
│       ├── module/
│       │   ├── auth/         # Login, JWT usecase
│       │   └── payment/      # Payment repository & usecase
│       ├── openapigen/       # Generated OpenAPI types
│       ├── service/http/     # Chi server, CORS, JWT middleware
│       └── transport/        # JSON error helpers
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    └── src/
        ├── App.tsx            # Router setup
        ├── main.tsx
        ├── components/
        │   └── ProtectedRoute.tsx
        ├── features/
        │   ├── auth/
        │   │   └── authStore.ts   # Zustand auth state
        │   └── payments/
        │       └── usePayments.ts # TanStack Query hook
        ├── lib/
        │   └── axios.ts           # Axios instance + interceptor
        └── pages/
            ├── LoginPage.tsx
            └── DashboardPage.tsx
```

---

## Testing

### Backend unit tests
```bash
cd backend
go test ./...
```

### Frontend lint
```bash
cd frontend
npm run lint
```
