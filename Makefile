# Makefile for Mobile Fitness App Backend

.PHONY: help build run-dev run-prod stop clean db-up db-down logs setup-env

# Default target
help:
	@echo "Mobile Fitness App Backend - Makefile Commands"
	@echo ""
	@echo "Usage:"
	@echo "  make build      - Build Docker images"
	@echo "  make run-dev    - Run development environment"
	@echo "  make run-prod   - Run production environment"
	@echo "  make stop       - Stop all running containers"
	@echo "  make clean      - Remove all containers, images, and volumes"
	@echo "  make db-up      - Start only the database service"
	@echo "  make db-down    - Stop the database service"
	@echo "  make logs       - Show logs from all services"
	@echo "  make setup-env  - Create environment file from template"
	@echo "  make help       - Show this help message"

# Build Docker images
build:
	@echo "Building Docker images..."
	docker build -t mobile-fitness-app-backend .

# Run development environment
run-dev:
	@echo "Starting development environment..."
	docker-compose -f docker-compose.dev.yaml up -d

# Run production environment
run-prod:
	@echo "Starting production environment..."
	docker-compose up -d

# Stop all running containers
stop:
	@echo "Stopping all containers..."
	docker-compose down
	docker-compose -f docker-compose.dev.yaml down

# Clean up: remove containers, images, and volumes
clean: stop
	@echo "Cleaning up..."
	docker rmi -f mobile-fitness-app-backend || true
	docker volume prune -f
	docker system prune -f

# Start only the database
db-up:
	@echo "Starting database service..."
	docker-compose up -d db

# Stop only the database
db-down:
	@echo "Stopping database service..."
	docker-compose down

# Show logs from all services
logs:
	@echo "Showing logs from all services..."
	docker-compose logs -f

# Run tests inside the container
test:
	@echo "Running tests..."
	docker-compose run app pnpm test

# Run tests in development environment
test-dev:
	@echo "Running tests in development mode..."
	docker-compose -f docker-compose.dev.yaml run app-dev pnpm test

# Create environment file from template
setup-env:
	@echo "Creating environment file from template..."
	@echo "# Database Configuration" > .env
	@echo "DB_HOST=localhost" >> .env
	@echo "DB_PORT=5432" >> .env
	@echo "DB_NAME=fitness_app" >> .env
	@echo "DB_USER=fitness_user" >> .env
	@echo "DB_PASSWORD=your_secure_password" >> .env
	@echo "" >> .env
	@echo "# Application Configuration" >> .env
	@echo "NODE_ENV=development" >> .env
	@echo "PORT=3000" >> .env
	@echo ".env file created. Update with your values before using."
