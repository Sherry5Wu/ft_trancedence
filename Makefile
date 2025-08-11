DOCKER_COMPOSE_FILE = ./docker-compose.yml
DOCKER_COMPOSE = docker compose
BUILD_MARKER_BACKEND = .backend_build
BUILD_MARKER_FRONTEND = .frontend_build
ENV_FILE = .env

# Explicitly list all relevant files
TOURNAMENT_FILES = services/tournament-service/dockerfile services/tournament-service/tournamentdata.js
STATS_FILES = services/stats-service/dockerfile \
				services/stats-service/app.js \
				services/stats-service/db/init.js \
				services/stats-service/routes/matchHistory.js \
				services/stats-service/routes/rivals.js \
				services/stats-service/routes/scoreHistory.js \
				services/stats-service/routes/userMatchData.js \
				services/stats-service/utils/auth.js \
				services/stats-service/utils/calculations.js \
				services/stats-service/utils/updateFunctions.js

GATEWAY_FILES= gateway/dockerfile gateway/nginx.conf

FRONTEND_FILES= $(shell find frontend/ -type f)

AUTH_FILES = services/auth-service/Dockerfile services/auth-service/package.json $(shell find services/auth-service/src -type f)
BACKEND_FILES = $(DOCKER_COMPOSE_FILE) $(TOURNAMENT_FILES) $(STATS_FILES) $(GATEWAY_FILES) $(AUTH_FILES) $(ENV_FILE)
BACKEND_SERVICES = tournament-service gateway-service auth-service
FRONTEND_SERVICES = frontend-service

All: backend frontend

backend: $(BUILD_MARKER_BACKEND)

$(BUILD_MARKER_BACKEND): $(BACKEND_FILES)
				@echo "🚧 Building backend containers..."
				@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) stop $(BACKEND_SERVICES)
				@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) build $(BACKEND_SERVICES)
				@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) up -d $(BACKEND_SERVICES)
				@touch $(BUILD_MARKER_BACKEND)
				@echo "✅ Backend is up."

frontend: $(BUILD_MARKER_FRONTEND)

$(BUILD_MARKER_FRONTEND): $(FRONTEND_FILES)
					@echo "🚧 Building frontend container..."
					@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) build $(FRONTEND_SERVICES)
					@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) up -d $(FRONTEND_SERVICES)
					@touch $(BUILD_MARKER_FRONTEND)
					@echo "✅ Frontend is up."

clean:
	@echo "🧹 Stopping and removing containers..."
	@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) down -v
	@rm -f $(BUILD_MARKER_BACKEND)
	@rm -f $(BUILD_MARKER_FRONTEND)

# Show logs for debugging
logs:
	@echo "📋 Showing container logs..."
	@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) logs --tail=50

# Check container status
status:
	@echo "📊 Container status:"
	@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) ps

fclean:
	@$(MAKE) clean
	@docker system prune -a -f

re: fclean frontend backend


.PHONY: frontend backend rebuild logs status fclean clean