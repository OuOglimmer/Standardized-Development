#!/usr/bin/env bash
set -Eeuo pipefail

BACKEND_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
cd "$BACKEND_DIR"

PYTHON_BIN="${PYTHON_BIN:-}"
if [[ -z "$PYTHON_BIN" ]]; then
  if [[ -x "$BACKEND_DIR/.venv/bin/python" ]]; then
    PYTHON_BIN="$BACKEND_DIR/.venv/bin/python"
  elif command -v python3 >/dev/null 2>&1; then
    PYTHON_BIN="$(command -v python3)"
  else
    echo "python3 not found. Create a virtual environment and install requirements first." >&2
    exit 1
  fi
fi

if ! "$PYTHON_BIN" -c "import uvicorn" >/dev/null 2>&1; then
  echo "uvicorn not found. Run: $PYTHON_BIN -m pip install -r requirements.txt" >&2
  exit 1
fi

HOST="${HOST:-0.0.0.0}"
PORT="${PORT:-8000}"
RELOAD="${RELOAD:-true}"

case "$RELOAD" in
  true | 1 | yes | on)
    exec "$PYTHON_BIN" -m uvicorn app.main:app --host "$HOST" --port "$PORT" --reload
    ;;
  false | 0 | no | off)
    exec "$PYTHON_BIN" -m uvicorn app.main:app --host "$HOST" --port "$PORT"
    ;;
  *)
    echo "Invalid RELOAD value: $RELOAD. Use true or false." >&2
    exit 1
    ;;
esac
