#!/usr/bin/env bash

set -Eeuo pipefail

FRONTEND_PORT=3000
BACKEND_PORT=8000
BIND_HOST="127.0.0.1"

usage() {
  printf '%s\n' \
    "Usage: $0 [--frontend-port PORT] [--backend-port PORT] [--host IP]" \
    "" \
    "Options:" \
    "  --frontend-port PORT  Frontend port (default: 3000)" \
    "  --backend-port PORT   Backend port (default: 8000)" \
    "  --host IP             Bind address (default: 127.0.0.1)" \
    "  -h, --help            Show this help"
}

require_value() {
  if [[ $# -lt 2 || -z "$2" ]]; then
    printf 'Missing value for %s.\n' "$1" >&2
    usage >&2
    exit 2
  fi
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --frontend-port)
      require_value "$@"
      FRONTEND_PORT="$2"
      shift 2
      ;;
    --backend-port)
      require_value "$@"
      BACKEND_PORT="$2"
      shift 2
      ;;
    --host)
      require_value "$@"
      BIND_HOST="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      printf 'Unknown argument: %s\n' "$1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

validate_port() {
  local name="$1"
  local port="$2"
  if [[ ! "$port" =~ ^[0-9]+$ ]] || ((port < 1 || port > 65535)); then
    printf '%s must be an integer from 1 to 65535: %s\n' "$name" "$port" >&2
    exit 2
  fi
}

validate_port "Frontend port" "$FRONTEND_PORT"
validate_port "Backend port" "$BACKEND_PORT"

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
BACKEND_DIR="$PROJECT_ROOT/backend"
BACKEND_ENV="$BACKEND_DIR/.env"

[[ -d "$FRONTEND_DIR" ]] || { printf 'Frontend directory was not found: %s\n' "$FRONTEND_DIR" >&2; exit 1; }
[[ -d "$BACKEND_DIR" ]] || { printf 'Backend directory was not found: %s\n' "$BACKEND_DIR" >&2; exit 1; }
[[ -f "$BACKEND_ENV" ]] || { printf 'Backend environment file was not found: %s\n' "$BACKEND_ENV" >&2; exit 1; }

if [[ -x "$BACKEND_DIR/.venv/bin/python" ]]; then
  BACKEND_PYTHON="$BACKEND_DIR/.venv/bin/python"
elif [[ -x "$BACKEND_DIR/.venv/Scripts/python.exe" ]]; then
  BACKEND_PYTHON="$BACKEND_DIR/.venv/Scripts/python.exe"
else
  printf 'Backend virtual environment was not found under backend/.venv.\n' >&2
  exit 1
fi

if command -v pnpm >/dev/null 2>&1; then
  PACKAGE_RUNNER=(pnpm)
elif command -v corepack >/dev/null 2>&1; then
  PACKAGE_RUNNER=(corepack pnpm)
else
  printf 'Neither pnpm nor corepack was found. Install Node.js with Corepack support.\n' >&2
  exit 1
fi

assert_port_available() {
  local service_name="$1"
  local host="$2"
  local port="$3"
  if ! "$BACKEND_PYTHON" - "$host" "$port" <<'PY'
import socket
import sys

host = sys.argv[1]
port = int(sys.argv[2])
family = socket.AF_INET6 if ":" in host else socket.AF_INET
try:
    with socket.socket(family, socket.SOCK_STREAM) as listener:
        listener.bind((host, port))
except OSError:
    raise SystemExit(1)
PY
  then
    printf '%s port %s is already in use or cannot bind on %s.\n' "$service_name" "$port" "$host" >&2
    exit 1
  fi
}

assert_port_available "Frontend" "$BIND_HOST" "$FRONTEND_PORT"
assert_port_available "Backend" "$BIND_HOST" "$BACKEND_PORT"

if [[ "$BIND_HOST" == "0.0.0.0" || "$BIND_HOST" == "::" ]]; then
  CLIENT_HOST="127.0.0.1"
else
  CLIENT_HOST="$BIND_HOST"
fi

FRONTEND_URL="http://$CLIENT_HOST:$FRONTEND_PORT"
BACKEND_URL="http://$CLIENT_HOST:$BACKEND_PORT"
export CORS_ORIGINS="[\"http://localhost:$FRONTEND_PORT\",\"http://127.0.0.1:$FRONTEND_PORT\"]"
export NEXT_PUBLIC_API_URL="$BACKEND_URL"

BACKEND_PID=""
FRONTEND_PID=""

terminate_tree() {
  local pid="$1"
  [[ -n "$pid" ]] || return 0
  kill -0 "$pid" 2>/dev/null || return 0

  if command -v pkill >/dev/null 2>&1; then
    pkill -TERM -P "$pid" 2>/dev/null || true
  fi
  kill -TERM "$pid" 2>/dev/null || true
}

cleanup() {
  trap - EXIT INT TERM
  printf '\nStopping development services...\n'
  terminate_tree "$FRONTEND_PID"
  terminate_tree "$BACKEND_PID"
  [[ -z "$FRONTEND_PID" ]] || wait "$FRONTEND_PID" 2>/dev/null || true
  [[ -z "$BACKEND_PID" ]] || wait "$BACKEND_PID" 2>/dev/null || true
}

handle_signal() {
  exit 130
}

trap cleanup EXIT
trap handle_signal INT TERM

(
  cd "$BACKEND_DIR"
  exec "$BACKEND_PYTHON" -m uvicorn app.main:app --reload --host "$BIND_HOST" --port "$BACKEND_PORT"
) &
BACKEND_PID=$!

(
  cd "$FRONTEND_DIR"
  exec "${PACKAGE_RUNNER[@]}" dev --port "$FRONTEND_PORT"
) &
FRONTEND_PID=$!

printf 'Backend: %s\n' "$BACKEND_URL"
printf 'Frontend: %s\n' "$FRONTEND_URL"
printf 'Press Ctrl+C to stop both services.\n'

while kill -0 "$BACKEND_PID" 2>/dev/null && kill -0 "$FRONTEND_PID" 2>/dev/null; do
  sleep 0.5
done

if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
  set +e
  wait "$BACKEND_PID"
  EXIT_CODE=$?
  set -e
  printf 'Backend exited with code %s.\n' "$EXIT_CODE" >&2
else
  set +e
  wait "$FRONTEND_PID"
  EXIT_CODE=$?
  set -e
  printf 'Frontend exited with code %s.\n' "$EXIT_CODE" >&2
fi

exit "$EXIT_CODE"
