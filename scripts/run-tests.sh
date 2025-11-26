#!/usr/bin/env bash
set -euo pipefail

wait_for() {
  local name="$1"
  echo "Waiting for container '$name' to be healthy..."

  while true; do
    status=$(docker inspect --format='{{.State.Health.Status}}' "$name" 2>/dev/null || echo "starting")

    if [ "$status" = "healthy" ]; then
      echo "✅ $name is healthy"
      break
    else
      echo "⏳ $name status: $status"
      sleep 2
    fi
  done
}

echo "=== Starting full docker-compose stack ==="
docker compose up  -d

echo "=== Checking required infra services ==="
wait_for postgres
wait_for kafka

echo
echo "=== Running primary_backend integration tests ==="
(cd primary_backend && npm run test:integration)

echo
echo "=== Running Executor unit tests ==="
(cd Executor && npm run test:unit)


echo "=== Shutting down docker-compose stack ==="
docker compose down

echo
echo "✅ All tests finished successfully."

