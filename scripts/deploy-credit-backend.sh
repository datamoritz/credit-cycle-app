#!/usr/bin/env bash
set -euo pipefail

SSH_TARGET="${SSH_TARGET:-root@5.78.134.84}"
APP_PATH="${APP_PATH:-/opt/credit-cycle-app}"
LOG_TAIL_LINES="${LOG_TAIL_LINES:-100}"

echo "Deploying credit backend on ${SSH_TARGET}:${APP_PATH}"

ssh "${SSH_TARGET}" \
  "APP_PATH='${APP_PATH}' LOG_TAIL_LINES='${LOG_TAIL_LINES}' /bin/bash -seuo pipefail" <<'REMOTE'
cd "${APP_PATH}"

echo "==> Pull latest code"
git pull --ff-only origin main

echo "==> Build backend"
docker compose build backend

echo "==> Restart backend"
docker compose up -d --no-deps backend

echo "==> Recent backend logs"
docker compose logs --tail="${LOG_TAIL_LINES}" backend
REMOTE
