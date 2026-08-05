#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${ENV_FILE:-${SCRIPT_DIR}/.env}"
IMAGE_NAME="${IMAGE_NAME:-dashboard-image}"
CONTAINER_NAME="${CONTAINER_NAME:-dashboard}"
HOST_PORT="${HOST_PORT:-3334}"
NETWORK_NAME="${NETWORK_NAME:-mariadb-network}"

cd "${SCRIPT_DIR}"

if ! command -v docker >/dev/null 2>&1; then
  echo "Erreur : Docker n'est pas installé ou n'est pas accessible." >&2
  exit 1
fi

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Erreur : fichier .env introuvable (${ENV_FILE})." >&2
  exit 1
fi

CONTAINER_PORT="${CONTAINER_PORT:-$(
  sed -n 's/^[[:space:]]*PORT[[:space:]]*=[[:space:]]*//p' "${ENV_FILE}" |
    tail -n 1 |
    tr -d '\r'
)}"
CONTAINER_PORT="${CONTAINER_PORT:-3000}"

if ! [[ "${HOST_PORT}" =~ ^[0-9]+$ && "${CONTAINER_PORT}" =~ ^[0-9]+$ ]]; then
  echo "Erreur : HOST_PORT et PORT doivent être des nombres valides." >&2
  exit 1
fi

if ! docker network inspect "${NETWORK_NAME}" >/dev/null 2>&1; then
  echo "Erreur : le réseau Docker '${NETWORK_NAME}' n'existe pas." >&2
  echo "Crée-le avec : docker network create ${NETWORK_NAME}" >&2
  exit 1
fi

DB_HOST_VALUE="${DB_HOST_DOCKER:-$(
  sed -n 's/^[[:space:]]*DB_HOST[[:space:]]*=[[:space:]]*//p' "${ENV_FILE}" |
    tail -n 1 |
    tr -d '\r'
)}"

if [[ -z "${DB_HOST_VALUE}" || "${DB_HOST_VALUE}" == "localhost" || "${DB_HOST_VALUE}" == "127.0.0.1" ]]; then
  echo "Erreur : DB_HOST doit être le nom du conteneur MySQL/MariaDB sur '${NETWORK_NAME}', pas localhost." >&2
  echo "Modifie DB_HOST dans .env ou lance : DB_HOST_DOCKER=<nom-mariadb> ./build.sh" >&2
  exit 1
fi

echo "Build de l'image ${IMAGE_NAME}:latest..."
DOCKER_BUILDKIT=1 docker build -t "${IMAGE_NAME}:latest" .

echo "Remplacement du conteneur ${CONTAINER_NAME}..."
docker rm -f "${CONTAINER_NAME}" 2>/dev/null || true

echo "Lancement du conteneur sur 127.0.0.1:${HOST_PORT}..."
docker run -d \
  --init \
  --env-file "${ENV_FILE}" \
  --env "DB_HOST=${DB_HOST_VALUE}" \
  -p "127.0.0.1:${HOST_PORT}:${CONTAINER_PORT}" \
  --network "${NETWORK_NAME}" \
  --name "${CONTAINER_NAME}" \
  --restart unless-stopped \
  "${IMAGE_NAME}:latest"

echo "Logs du conteneur..."
docker logs --tail 50 "${CONTAINER_NAME}"

echo "Dashboard redémarré."
