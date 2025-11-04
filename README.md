# Mobile Fitness App Backend

## Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- pnpm package manager

## Quick Start with Docker

The easiest way to run the application is using Docker:

### Using Makefile (Recommended)

1. Build the Docker images:
   ```bash
   make build
   ```

2. Start the development environment:
   ```bash
   make run-dev
   ```

3. Or start the production environment:
   ```bash
   make run-prod
   ```

4. Access the application at `http://localhost:3000`

5. To stop the services:
   ```bash
   make stop
   ```

### Using Docker Compose Directly

#### Development Environment

```bash
docker-compose -f docker-compose.dev.yaml up
```

#### Production Environment

```bash
docker-compose up -d
```

## Running Locally Without Docker

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Run in development mode:
   ```bash
   pnpm dev
   ```

3. Or build and run in production mode:
   ```bash
   pnpm build
   pnpm start
   ```

## Makefile Commands

The project includes a Makefile with the following commands:

- `make build` - Build Docker images
- `make run-dev` - Run development environment
- `make run-prod` - Run production environment
- `make stop` - Stop all running containers
- `make clean` - Remove all containers, images, and volumes
- `make db-up` - Start only the database service
- `make db-down` - Stop the database service
- `make logs` - Show logs from all services
- `make test` - Run tests inside the container
- `make test-dev` - Run tests in development environment
- `make help` - Show help message

## Project Structure

- `src/index.ts` - Main application entry point
- `Dockerfile` - Multi-stage Docker configuration
- `docker-compose.yaml` - Production Docker Compose configuration
- `docker-compose.dev.yaml` - Development Docker Compose configuration
- `Makefile` - Convenience commands for Docker operations
- `tsconfig.json` - TypeScript configuration

## Database

The application is configured to work with PostgreSQL. The database service is defined in the docker-compose files and is automatically set up with the following environment variables:

### Environment Variables

When running with Docker, the application uses these environment variables:

- `NODE_ENV` - Environment mode (development/production)
- `DB_HOST` - Database host (defaults to 'db' for Docker Compose networking)
- `DB_PORT` - Database port (defaults to 5432)
- `DB_NAME` - Database name (defaults to 'fitness_app')
- `DB_USER` - Database username (defaults to 'fitness_user')
- `DB_PASSWORD` - Database password (defaults to 'password123')

### Default Credentials

The default database credentials are:
- Database name: `fitness_app`
- Username: `fitness_user`
- Password: `password123`

These should be changed for production deployments.

### Environment Variables Setup

For local development, you can create a `.env` file to customize the configuration:

1. Create a `.env` file from the example:
   ```bash
   make setup-env
   ```

2. Update the values in the generated `.env` file with your specific configuration.

The `.env` file is included in `.gitignore` and will not be committed to the repository, keeping your sensitive information secure.
