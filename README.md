# DurianPay — Payment Monitoring Dashboard

An internal dashboard for monitoring incoming payments. Built with **Go** (backend) and **React + Vite** (frontend).

---

## Tech Stack

| Layer    | Tech                                                |
| -------- | --------------------------------------------------- |
| Backend  | Go 1.24, Chi router, SQLite, JWT                    |
| Frontend | React 19, TypeScript, Vite, Zustand, TanStack Query |
| API Spec | OpenAPI 3.0 (`openapi.yaml`)                        |
| Auth     | JWT Bearer tokens                                   |

---

## Prerequisites

| Tool      | Version               |
| --------- | --------------------- |
| Go        | v1.21+                |
| Node.js   | v20+                  |
| Make      | any                   |
| GCC / CGO | required (for SQLite) |
| Docker    | optional              |

> **macOS:** GCC comes with Xcode Command Line Tools — `xcode-select --install`

---

## Quick Start (Local)

### 1. Backend

```bash
cd backend

# Copy env file
cp env.sample .env

# Install dependencies
go mod tidy

# Run (starts on :8080)
make run
```

On first run the backend auto-creates `dashboard.db` and seeds:

- **2 users**: `cs@test.com` / `operation@test.com` (password: `password`)
- **200 randomized payments** across completed / processing / failed statuses

### 2. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy env
cp .env.example .env

# Run dev server (starts on :5173)
npm run dev
```

Open **http://localhost:5173** and log in with one of the demo accounts.

---

## Quick Start (Docker Compose)

```bash
# From repo root
docker compose up --build
```

| Service  | URL                   |
| -------- | --------------------- |
| Backend  | http://localhost:8080 |
| Frontend | http://localhost:5173 |

---

## Build for Production

### Backend

```bash
cd backend
make build
# Binary output: backend/bin/server
./bin/server
```

### Frontend

```bash
cd frontend
npm run build
# Output: frontend/dist/
npm run preview   # preview production build locally
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable               | Default            | Description           |
| ---------------------- | ------------------ | --------------------- |
| `HTTP_ADDR`            | `:8080`            | Server listen address |
| `JWT_SECRET`           | `your-very-secret` | JWT signing secret    |
| `JWT_EXPIRED`          | `24h`              | Token expiry duration |
| `OPENAPIYAML_LOCATION` | `../openapi.yaml`  | Path to OpenAPI spec  |

> Generate a secure secret: `cd backend && make gen-secret`

### Frontend (`frontend/.env`)

| Variable            | Default                              | Description     |
| ------------------- | ------------------------------------ | --------------- |
| `VITE_API_BASE_URL` | `http://localhost:8080/dashboard/v1` | Backend API URL |

---

## API Documentation

Full spec is at `openapi.yaml` in the repo root.

### Endpoints

| Method | Path                       | Auth   | Description        |
| ------ | -------------------------- | ------ | ------------------ |
| POST   | `/dashboard/v1/auth/login` | None   | Login, returns JWT |
| GET    | `/dashboard/v1/payments`   | Bearer | List payments      |

### Query Parameters — GET /dashboard/v1/payments

| Parameter | Type    | Default           | Description                                    |
| --------- | ------- | ----------------- | ---------------------------------------------- |
| `status`  | string  | —                 | Filter: `completed`, `processing`, or `failed` |
| `search`  | string  | —                 | Search by merchant name or payment ID          |
| `sort`    | string  | `created_at:desc` | Field + direction e.g. `amount:desc`           |
| `limit`   | integer | `20`              | Rows per page (max 100)                        |
| `offset`  | integer | `0`               | Rows to skip                                   |

### Response — GET /dashboard/v1/payments

```json
{
  "data": [...],
  "total": 15,
  "summary": {
    "total": 200,
    "completed": 118,
    "processing": 42,
    "failed": 40
  }
}
```

`total` = rows matching current filter (for pagination).
`summary` = global counts always unaffected by filters.

### Example requests

```bash
# Login
curl -X POST http://localhost:8080/dashboard/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"cs@test.com","password":"password"}'

# List payments (page 1)
curl "http://localhost:8080/dashboard/v1/payments?limit=20&offset=0" \
  -H "Authorization: Bearer <token>"

# Filter by status
curl "http://localhost:8080/dashboard/v1/payments?status=failed" \
  -H "Authorization: Bearer <token>"

# Search + sort
curl "http://localhost:8080/dashboard/v1/payments?search=Tokopedia&sort=amount:desc" \
  -H "Authorization: Bearer <token>"
```

---

## Demo Credentials

| Role       | Email              | Password |
| ---------- | ------------------ | -------- |
| CS         | cs@test.com        | password |
| Operations | operation@test.com | password |

---

## Project Structure

```
.
├── README.md
├── Makefile                         # Root shortcuts: dev-backend, dev-frontend, docker-up
├── docker-compose.yml
├── openapi.yaml                     # OpenAPI 3.0 spec
├── backend/
│   ├── main.go                      # Entry point — DB init, seed, wire dependencies
│   ├── Makefile                     # run, build, gen-secret, openapi-gen
│   ├── env.sample
│   ├── Dockerfile
│   └── internal/
│       ├── api/
│       │   └── api_handler.go       # Payments handler — pagination, search, sort, summary
│       ├── config/
│       │   └── env.go               # Env var loading
│       ├── entity/
│       │   ├── user.go
│       │   ├── payment.go
│       │   └── error.go
│       ├── module/
│       │   ├── auth/
│       │   │   ├── handler/auth.go      # Login HTTP handler
│       │   │   ├── repository/user.go   # DB user lookup
│       │   │   └── usecase/auth.go      # JWT generation + bcrypt verify
│       │   └── payment/
│       │       ├── repository/payment.go
│       │       └── usecase/payment.go
│       ├── openapigen/
│       │   └── openapi.gen.go       # Auto-generated types + server interface
│       ├── service/http/
│       │   ├── server.go            # Chi router, CORS, JWT middleware
│       │   └── jwt.go               # JWT validation helper
│       └── transport/
│           └── jsonerror.go
└── frontend/
    ├── index.html                   # Tailwind CDN, fonts, animations
    ├── package.json
    ├── vite.config.ts
    ├── Dockerfile
    ├── nginx.conf
    ├── .env.example
    └── src/
        ├── App.tsx                  # React Router setup
        ├── main.tsx
        ├── store/
        │   └── authStore.ts         # Zustand — JWT + role, persisted to localStorage
        ├── hooks/
        │   └── usePayments.ts       # TanStack Query hook with all params
        ├── lib/
        │   └── axios.ts             # Axios instance + auth interceptor
        ├── components/
        │   ├── ProtectedRoute.tsx   # Redirects to /login if unauthenticated
        │   ├── StatCards.tsx        # Summary widget (total/completed/processing/failed)
        │   ├── PaymentTable.tsx     # Table with sortable columns + skeleton loading
        │   ├── SearchBar.tsx        # Debounced search + status filter tabs
        │   ├── Pagination.tsx       # Page numbers with ellipsis
        │   └── StatusBadge.tsx      # Colored pill badge per status
        └── pages/
            ├── LoginPage.tsx        # Split-panel login form
            └── DashboardPage.tsx    # Orchestrates all components + owns state
```

---

## Testing

### Backend unit tests

```bash
cd backend
go test ./...
```

Tests cover: JWT generation/validation, auth login (success + wrong password + not found), payment handler (filter by status, pagination, search).

### Frontend lint + format

```bash
cd frontend
npm run lint
npm run format
```
