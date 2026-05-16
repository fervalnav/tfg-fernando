API_DIR = apps/api

# ── Docker ────────────────────────────────────────────────────────────────────

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

# ── Migrations ────────────────────────────────────────────────────────────────

migration-create:
	cd $(API_DIR) && npx mikro-orm migration:create

migration-up:
	cd $(API_DIR) && npx mikro-orm migration:up

migration-down:
	cd $(API_DIR) && npx mikro-orm migration:down

migration-status:
	cd $(API_DIR) && npx mikro-orm migration:list

db-refresh:
	cd $(API_DIR) && npx mikro-orm schema:drop --run && npx mikro-orm migration:up

# ── Seeds ─────────────────────────────────────────────────────────────────────

seed:
	cd $(API_DIR) && npx mikro-orm seeder:run

# ── Setup ─────────────────────────────────────────────────────────────────────

setup:
	cp apps/api/.env.example apps/api/.env; \
	cp apps/web/.env.example apps/web/.env; \
	$(MAKE) up

.PHONY: up down logs migration-create migration-up migration-down migration-status db-refresh seed setup
