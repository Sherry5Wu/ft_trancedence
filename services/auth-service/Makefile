# Makefile for auth-service

# Image name
IMAGE_NAME=auth-service
# Container name
CONTAINER_NAME=auth-service-container
# SQLite data path (adjust if different)
DATA_PATH=./data

.PHONY: all build run clean fclean

# Default: build and run
all: build run

# Build the Docker image
build:
	docker build -t $(IMAGE_NAME) .

# Run the container
run:
	docker run -d --name $(CONTAINER_NAME) -p 3000:3000 \
		-v $(DATA_PATH):/app/data \
		$(IMAGE_NAME)

# Stop and remove the container, remove image
clean:
	-docker stop $(CONTAINER_NAME)
	-docker rm $(CONTAINER_NAME)
	docker rmi -f $(IMAGE_NAME)

# Full clean: remove container, image, and SQLite data
fclean: clean
	-rm -rf $(DATA_PATH)
