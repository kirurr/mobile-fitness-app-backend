# Mobile Fitness App Backend

## Requirements

- Docker + Docker Compose
- bun

## Get the code

Clone the repository locally before launch (download the folder from GitHub).

## .env

- Copy `.env.example` to `.env`
- Set at least: `JWT_SECRET`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `PORT`
- Docker Compose loads `.env` automatically via `env_file`

## Run with Docker

```bash
docker compose build --no-cache app
docker compose up -d
```

## Migrations

After the containers are up, you must run migrations:

```bash
docker compose exec app bun run db:push
```

## Seed data

After migrations, you must run the seed command to provide initial data to database:

```bash
docker compose exec app bun run db:seed
```

## Important

- Run the project only via Docker so the database is started as well.
- Database credentials must match in `.env` and `docker-compose.yaml`.
