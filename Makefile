DOCKER_COMPOSE_FILE = ./docker-compose.yml
DOCKER_COMPOSE = docker compose
BUILD_MARKER = .build

# Explicitly list all relevant files
STATS_FILES = services/stats/dockerfile services/stats/tournamentdata.js
USER_FILES = services/user/dockerfile services/user/backendtest.js
GATEWAY_FILES= gateway/dockerfile gateway/nginx.conf
BACKEND_FILES = $(DOCKER_COMPOSE_FILE) $(STATS_FILES) $(USER_FILES) $(GATEWAY_FILES)

backend: $(BUILD_MARKER)

$(BUILD_MARKER): $(BACKEND_FILES)
				@echo "🚧 Building backend containers..."
				@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) build
				@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) up -d
				@touch $(BUILD_MARKER)
				@echo "✅ Backend is up."



clean:
	@echo "🧹 Stopping and removing containers..."
	@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) down -v
	@rm -f $(BUILD_MARKER)

fclean:
	@$(MAKE) clean
	@docker system prune -a -f


.PHONY: backend fclean clean