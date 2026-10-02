APP_NAME := nagorneva-admin
IMAGE_NAME ?= $(APP_NAME)
PORT ?= 8081
VITE_API_URL ?= http://localhost:8080

.PHONY: install dev build preview docker-build docker-run

install:
	npm install

dev:
	npm run dev

build:
	npm run build

preview:
	npm run preview

docker-build:
	docker build --build-arg VITE_API_URL=$(VITE_API_URL) -t $(IMAGE_NAME) .

docker-run:
	docker run --rm -p $(PORT):80 $(IMAGE_NAME)
