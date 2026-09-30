.PHONY: dev dev-down dev-logs dev-restart prod prod-down prod-logs prod-restart

DC_DEV = docker compose -f docker-compose.dev.yml
DC_PROD = docker compose -f docker-compose.prod.yml

dev:
	$(DC_DEV) up -d

dev-down:
	$(DC_DEV) down

dev-logs:
	$(DC_DEV) logs -f

dev-restart:
	$(DC_DEV) restart

prod:
	$(DC_PROD) up -d

prod-down:
	$(DC_PROD) down

prod-logs:
	$(DC_PROD) logs -f

prod-restart:
	$(DC_PROD) restart
