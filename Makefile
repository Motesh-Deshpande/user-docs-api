# Variables
COMPOSE_FILE = docker-compose.yml
COMPOSE_DEV_FILE = docker-compose.dev.yml
PROJECT_NAME = user-docs

# Default target
.DEFAULT_GOAL := help

.PHONY: help
help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Production commands
.PHONY: build
build: ## Build the production Docker image
	docker-compose -f $(COMPOSE_FILE) build

.PHONY: up
up: ## Start the production environment
	docker-compose -f $(COMPOSE_FILE) up -d

.PHONY: down
down: ## Stop the production environment
	docker-compose -f $(COMPOSE_FILE) down

.PHONY: logs
logs: ## View logs from production services
	docker-compose -f $(COMPOSE_FILE) logs -f

.PHONY: restart
restart: ## Restart the production environment
	docker-compose -f $(COMPOSE_FILE) restart

# Development commands
.PHONY: dev-build
dev-build: ## Build the development Docker image
	docker-compose -f $(COMPOSE_DEV_FILE) build

.PHONY: dev-up
dev-up: ## Start the development environment
	docker-compose -f $(COMPOSE_DEV_FILE) up

.PHONY: dev-down
dev-down: ## Stop the development environment
	docker-compose -f $(COMPOSE_DEV_FILE) down

.PHONY: dev-logs
dev-logs: ## View logs from development services
	docker-compose -f $(COMPOSE_DEV_FILE) logs -f

.PHONY: dev-shell
dev-shell: ## Access shell in the development app container
	docker-compose -f $(COMPOSE_DEV_FILE) exec app sh

# Database commands
.PHONY: db-migrate
db-migrate: ## Run database migrations
	docker-compose -f $(COMPOSE_FILE) exec app npm run migration:run

.PHONY: db-seed
db-seed: ## Seed the database with initial data
	docker-compose -f $(COMPOSE_FILE) exec app npm run seed

.PHONY: db-reset
db-reset: ## Reset the database (drop and recreate)
	docker-compose -f $(COMPOSE_FILE) exec app npm run migration:reset

# Testing commands
.PHONY: test
test: ## Run tests inside the container
	docker-compose -f $(COMPOSE_DEV_FILE) exec app npm test

.PHONY: test-coverage
test-coverage: ## Run tests with coverage
	docker-compose -f $(COMPOSE_DEV_FILE) exec app npm run test:cov

.PHONY: test-e2e
test-e2e: ## Run end-to-end tests
	docker-compose -f $(COMPOSE_DEV_FILE) exec app npm run test:e2e

# Utility commands
.PHONY: clean
clean: ## Remove all containers, volumes, and images
	docker-compose -f $(COMPOSE_FILE) down -v --rmi all
	docker-compose -f $(COMPOSE_DEV_FILE) down -v --rmi all
	docker system prune -f

.PHONY: ps
ps: ## Show running containers
	docker-compose -f $(COMPOSE_FILE) ps

.PHONY: dev-ps
dev-ps: ## Show running development containers
	docker-compose -f $(COMPOSE_DEV_FILE) ps

.PHONY: backup-db
backup-db: ## Backup the production database
	docker-compose -f $(COMPOSE_FILE) exec postgres pg_dump -U postgres user_docs > backup_$(shell date +%Y%m%d_%H%M%S).sql

.PHONY: restore-db
restore-db: ## Restore database from backup (usage: make restore-db FILE=backup.sql)
	docker-compose -f $(COMPOSE_FILE) exec -T postgres psql -U postgres user_docs < $(FILE) 