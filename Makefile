.DEFAULT_GOAL := help

help:
	@echo "Available commands:"
	@echo "  make dev-backend   - Run backend locally"
	@echo "  make dev-frontend  - Run frontend dev server"
	@echo "  make docker-up     - Start both services via Docker Compose"
	@echo "  make docker-down   - Stop Docker Compose"
	@echo "  make test-backend  - Run Go unit tests"
	@echo "  make build-backend - Build Go binary"
	@echo "  make build-frontend- Build frontend for production"

dev-backend:
	cd backend && make run

dev-frontend:
	cd frontend && npm install && npm run dev

docker-up:
	docker-compose up --build

docker-down:
	docker-compose down

test-backend:
	cd backend && go test ./...

build-backend:
	cd backend && make build

build-frontend:
	cd frontend && npm install && npm run build

setup: ## First-time setup
	cd backend && cp env.sample .env
	cd frontend && cp .env.example .env && npm install
	@echo "✅ Setup complete. Run 'make dev-backend' and 'make dev-frontend' in separate terminals."
