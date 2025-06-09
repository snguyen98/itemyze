# Makefile for Django + React application

# Variables
ENV_DEV = .env.dev
ENV_PROD = .env.prod
DC_DEV = docker-compose -f docker-compose.dev.yml
DC_PROD = docker-compose -f docker-compose.prod.yml

# Help command
.PHONY: help
help:
	@echo "Available commands:"
	@echo "  make dev              - Start development environment"
	@echo "  make prod             - Start production environment"
	@echo "  make down             - Stop all containers"
	@echo "  make clean            - Stop and remove containers, volumes, and images"
	@echo "  make ssl DOMAIN=example.com - Setup SSL certificates"
	@echo "  make push USERNAME=dockerhub_username - Push to Docker Hub"
	@echo "  make migrate          - Run Django migrations (development)"
	@echo "  make migrate-prod     - Run Django migrations (production)"
	@echo "  make static           - Collect static files (production)"
	@echo "  make logs             - View logs"
	@echo "  make shell            - Start Django shell (development)"
	@echo "  make createsuperuser  - Create Django superuser (development)"

# Development commands
.PHONY: dev
dev:
	$(DC_DEV) up --build -d

.PHONY: migrate
migrate:
	$(DC_DEV) run --rm backend python manage.py migrate --settings=itemyze.settings.dev

.PHONY: shell
shell:
	$(DC_DEV) exec backend python manage.py shell --settings=itemyze.settings.dev

.PHONY: createsuperuser
createsuperuser:
	$(DC_DEV) exec backend python manage.py createsuperuser --settings=itemyze.settings.dev

# Production commands
.PHONY: prod
prod:
	@echo "Starting production environment..."
	@echo "Building..."
	@$(DC_PROD) build
	@echo "Starting backend and frontend first..."
	$(DC_PROD) up -d backend frontend
	@echo "Waiting for backend to be ready..."
	@sleep 3
	@echo "Starting nginx..."
	$(DC_PROD) up -d nginx
	@echo "Production environment started."

.PHONY: migrate-prod
migrate-prod:
	$(DC_PROD) run --rm backend python manage.py migrate --settings=itemyze.settings.prod

.PHONY: createsuperuser-prod
createsuperuser-prod:
	$(DC_PROD) exec backend python manage.py createsuperuser --settings=itemyze.settings.prod

.PHONY: static
static:
	$(DC_PROD) exec backend python manage.py collectstatic --noinput --settings=itemyze.settings.prod

# Docker Hub commands
.PHONY: push
push:
	@if [ -z "$(USERNAME)" ]; then \
		echo "Usage: make push USERNAME=dockerhub_username"; \
		exit 1; \
	fi
	@echo "Building Docker images..."
	@$(DC_PROD) build
	@echo "Tagging images..."
	@VERSION=$$(date +"%Y%m%d%H%M%S"); \
	docker tag itemyze-backend $(USERNAME)/itemyze:backend-$$VERSION; \
	docker tag itemyze-frontend $(USERNAME)/itemyze:frontend-$$VERSION; \
	docker tag itemyze-nginx $(USERNAME)/itemyze:nginx-$$VERSION; \
	echo "Pushing images to Docker Hub..."; \
	docker push $(USERNAME)/itemyze:backend-$$VERSION; \
	docker push $(USERNAME)/itemyze:frontend-$$VERSION; \
	docker push $(USERNAME)/itemyze:nginx-$$VERSION; \
	echo "Tagging as latest..."; \
	docker tag itemyze-backend $(USERNAME)/itemyze:backend-latest; \
	docker tag itemyze-frontend $(USERNAME)/itemyze:frontend-latest; \
	docker tag itemyze-nginx $(USERNAME)/itemyze:nginx-latest; \
	echo "Pushing latest tags..."; \
	docker push $(USERNAME)/itemyze:backend-latest; \
	docker push $(USERNAME)/itemyze:frontend-latest; \
	docker push $(USERNAME)/itemyze:nginx-latest; \
	echo "Images successfully pushed to Docker Hub as $(USERNAME)/itemyze"

# Common commands
.PHONY: down
down:
	$(DC_DEV) down
	$(DC_PROD) down

.PHONY: clean
clean:
	$(DC_DEV) down -v --rmi all
	$(DC_PROD) down -v --rmi all

.PHONY: logs
logs:
	$(DC_DEV) logs -f

.PHONY: logs-prod
logs-prod:
	$(DC_PROD) logs -f
