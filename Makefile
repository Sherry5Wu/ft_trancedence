DOCKER_COMPOSE_FILE = ./docker-compose.yml
DOCKER_COMPOSE = docker compose
BUILD_MARKER = .build
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
AUTH_FILES = services/auth-service/Dockerfile services/auth-service/package.json $(shell find services/auth-service/src -type f)
BACKEND_FILES = $(DOCKER_COMPOSE_FILE) $(TOURNAMENT_FILES) $(STATS_FILES) $(GATEWAY_FILES) $(AUTH_FILES) $(ENV_FILE)

backend: $(BUILD_MARKER)

$(BUILD_MARKER): $(BACKEND_FILES)
				@echo "🚧 Building backend containers..."
				@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) down -v
				@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) build
				@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) up -d
				@touch $(BUILD_MARKER)
				@echo "✅ Backend is up."

clean:
	@echo "🧹 Stopping and removing containers..."
	@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) down -v
	@rm -f $(BUILD_MARKER)

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


.PHONY: backend rebuild logs status fclean clean