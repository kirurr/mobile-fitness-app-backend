.PHONY: build dev prod stop db-up

build:
	docker compose build --no-cache app

dev:
	docker compose -f docker-compose.dev.yaml up -d

prod:
	docker compose up -d

stop:
	docker compose down
	docker compose -f docker-compose.dev.yaml down

db-up:
	docker compose up -d db
