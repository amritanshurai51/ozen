#!/bin/bash

# ── OZEN dev runner ──────────────────────────────────────────────────────────
# Usage:
#   ./run.sh          → just start the server (no rebuild)
#   ./run.sh --build  → build frontend first, then start server

set -e  # stop on any error

ROOT="$(cd "$(dirname "$0")" && pwd)"  # always Stage/ regardless of where you run from


if [ "$1" == "--build" ]; then
  echo "🔨 Building frontend..."
  cd "$ROOT/static"
  npm run build
  # Add this line after npm run build in run.sh:
  cp "$ROOT/static/sample.jpg" "$ROOT/static/dist/sample.jpg"
  cp "$ROOT/static/src/logo.jpeg" "$ROOT/static/dist/logo.jpeg" 
  
  echo "✅ Build done"
fi

echo "🚀 Starting FastAPI server..."
cd "$ROOT"
uvicorn app.main:app --reload --port 8000