#!/usr/bin/env bash

set -Eeuo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  DOCKER_COMMAND=(docker)
elif command -v docker.exe >/dev/null 2>&1 && docker.exe compose version >/dev/null 2>&1; then
  DOCKER_COMMAND=(docker.exe)
else
  echo "Error: Docker Compose is required but was not found or is not reachable." >&2
  exit 1
fi

docker_compose() {
  "${DOCKER_COMMAND[@]}" compose "$@"
}

if ! command -v npm >/dev/null 2>&1; then
  echo "Error: Node.js/npm is required to run the frontend but was not found in PATH." >&2
  exit 1
fi

if ! command -v curl >/dev/null 2>&1; then
  echo "Error: curl is required to wait for the backend services." >&2
  exit 1
fi

if command -v mvn >/dev/null 2>&1; then
  MAVEN_MODE=system
elif [[ -f "$ROOT_DIR/microservices/platform/api-gateway/mvnw.cmd" ]] && command -v cmd.exe >/dev/null 2>&1; then
  MAVEN_MODE=windows-wrapper
elif [[ -f "$ROOT_DIR/microservices/platform/api-gateway/mvnw" ]]; then
  MAVEN_MODE=unix-wrapper
else
  echo "Error: Maven or the Maven wrapper was not found." >&2
  exit 1
fi

CMD_SWITCH_PREFIX="/"
if [[ "${OSTYPE:-}" == cygwin* || "${OSTYPE:-}" == msys* ]]; then
  CMD_SWITCH_PREFIX="//"
fi

build_service() {
  local service_dir="$1"
  echo "Building $service_dir..."

  case "$MAVEN_MODE" in
    system)
      (
        cd "$ROOT_DIR/$service_dir"
        mvn -q -DskipTests package
      )
      ;;
    windows-wrapper)
      (
        cd "$ROOT_DIR/$service_dir"
        cmd.exe "${CMD_SWITCH_PREFIX}d" "${CMD_SWITCH_PREFIX}c" call mvnw.cmd -q -DskipTests package
      )
      ;;
    unix-wrapper)
      (
        cd "$ROOT_DIR/$service_dir"
        bash ./mvnw -q -DskipTests package
      )
      ;;
  esac
}

build_service "microservices/platform/eureka-server"
build_service "microservices/platform/config-server"
build_service "microservices/auth-service"
build_service "microservices/product-service"
build_service "microservices/cart-service"
build_service "microservices/platform/api-gateway"

if [[ ! -d "$ROOT_DIR/frontend/node_modules" ]]; then
  echo "Installing frontend dependencies..."
  (
    cd "$ROOT_DIR/frontend"
    npm ci
  )
fi

echo "Building Docker images..."
docker_compose build

wait_for_http() {
  local url="$1"
  local name="$2"
  local attempts=45

  echo "Waiting for $name..."
  for ((attempt = 1; attempt <= attempts; attempt++)); do
    if curl --silent --show-error --fail --max-time 5 "$url" >/dev/null 2>&1; then
      echo "$name is ready."
      return 0
    fi
    sleep 2
  done

  echo "Error: $name did not become ready: $url" >&2
  docker_compose ps >&2
  exit 1
}

wait_for_eureka_service() {
  local service_name="$1"
  local attempts=45
  local consecutive_matches=0

  echo "Waiting for $service_name registration in Eureka..."
  for ((attempt = 1; attempt <= attempts; attempt++)); do
    if curl --silent --show-error --fail --max-time 5 "http://localhost:8761/eureka/apps" \
      | grep --quiet --fixed-strings "<name>${service_name}</name>"; then
      consecutive_matches=$((consecutive_matches + 1))
      if ((consecutive_matches >= 3)); then
        echo "$service_name is registered in Eureka."
        return 0
      fi
    else
      consecutive_matches=0
    fi
    sleep 2
  done

  echo "Error: $service_name did not register in Eureka." >&2
  docker_compose ps >&2
  exit 1
}

echo "Starting infrastructure services..."
docker_compose up -d zookeeper kafka eureka-server
wait_for_http "http://localhost:8761/eureka/apps" "Eureka"

echo "Starting Config Server and Auth Service..."
docker_compose up -d config-server auth-service
wait_for_http "http://localhost:8888/product-service/default" "Config Server"
wait_for_http "http://localhost:8086/api/auth/test" "Auth service"
wait_for_eureka_service "AUTH-SERVICE"

echo "Starting Product Service..."
docker_compose up -d product-service
wait_for_http "http://localhost:8081/api/products" "Product service"
wait_for_eureka_service "PRODUCT-SERVICE"

echo "Starting Cart Service..."
docker_compose up -d cart-service
wait_for_http "http://localhost:8082/api/cart/readiness" "Cart service"
wait_for_eureka_service "CART-SERVICE"

echo "Starting API Gateway..."
docker_compose up -d api-gateway
wait_for_http "http://localhost:8080/internal/readiness" "gateway discovery readiness"
wait_for_http "http://localhost:8080/api/products" "gateway product route"
wait_for_http "http://localhost:8080/api/auth/test" "gateway auth route"

echo
docker_compose ps
echo
echo "Application gateway: http://localhost:8080"
echo "Auth service direct: http://localhost:8086"
echo "Frontend: http://localhost:5173"

FRONTEND_PID=""

cleanup() {
  if [[ -n "$FRONTEND_PID" ]] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
    echo
    echo "Stopping frontend..."
    kill "$FRONTEND_PID" 2>/dev/null || true
    wait "$FRONTEND_PID" 2>/dev/null || true
  fi
}

trap cleanup EXIT INT TERM

(
  cd "$ROOT_DIR/frontend"
  npm run dev -- --host 0.0.0.0
) &
FRONTEND_PID=$!

wait "$FRONTEND_PID"
