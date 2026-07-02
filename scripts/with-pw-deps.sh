#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$SCRIPT_DIR/.."
DEPS_DIR="$ROOT_DIR/playwright-deps"

if [ ! -d "$DEPS_DIR" ]; then
  echo "Playwright local dependencies not found at $DEPS_DIR"
  echo "Install with: npm run pw:install-deps"
  echo "Continuing without local dependency override..."
else
  export LD_LIBRARY_PATH="$DEPS_DIR/usr/lib/x86_64-linux-gnu:$DEPS_DIR/lib/x86_64-linux-gnu${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"
fi

exec "$@"
