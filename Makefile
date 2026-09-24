API_DIR = apps/api

# ── Docker ────────────────────────────────────────────────────────────────────

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

ai-up:
	docker compose --profile ai up -d ollama ollama-model

ai-down:
	docker compose --profile ai stop ollama ollama-model

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
	cd $(API_DIR) && npx mikro-orm migration:fresh --seed DatabaseSeeder

# ── Seeds ─────────────────────────────────────────────────────────────────────

seed:
	cd $(API_DIR) && npx mikro-orm seeder:run

seed-demo:
	cd $(API_DIR) && npx mikro-orm seeder:run --class DemoSeeder

# ── Setup ─────────────────────────────────────────────────────────────────────

setup:
	cp apps/api/.env.example apps/api/.env; \
	cp apps/web/.env.example apps/web/.env; \
	$(MAKE) up

.PHONY: up down logs ai-up ai-down migration-create migration-up migration-down migration-status db-refresh seed seed-demo setup
