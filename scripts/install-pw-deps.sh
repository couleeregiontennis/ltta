#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$SCRIPT_DIR/.."
DEPS_DIR="$ROOT_DIR/playwright-deps"

echo "Installing Playwright Chromium system dependencies to $DEPS_DIR ..."

mkdir -p "$DEPS_DIR"

TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT

cat > "$TMPDIR/sources.list" <<'EOF'
deb http://deb.debian.org/debian bookworm main
deb http://deb.debian.org/debian bookworm-updates main
EOF

mkdir -p "$TMPDIR/lists/partial" "$TMPDIR/sourceparts" "$TMPDIR/archives"

apt-get -o Dir::Etc::sourcelist="$TMPDIR/sources.list" \
  -o Dir::Etc::sourceparts="$TMPDIR/sourceparts" \
  -o Dir::State::lists="$TMPDIR/lists" \
  -o Dir::Cache="$TMPDIR" \
  -o Dir::Cache::archives="$TMPDIR/archives" \
  update

PACKAGES="libasound2 libatk-bridge2.0-0 libatk1.0-0 libatspi2.0-0 libcairo2 libcups2 libdbus-1-3 libdrm2 libgbm1 libglib2.0-0 libnspr4 libnss3 libpango-1.0-0 libx11-6 libxcb1 libxcomposite1 libxdamage1 libxext6 libxfixes3 libxkbcommon0 libxrandr2 libxi6 libwayland-server0"

cd "$TMPDIR/archives"
apt-get -o Dir::Etc::sourcelist="$TMPDIR/sources.list" \
  -o Dir::Etc::sourceparts="$TMPDIR/sourceparts" \
  -o Dir::State::lists="$TMPDIR/lists" \
  -o Dir::Cache="$TMPDIR" \
  -o Dir::Cache::archives="$TMPDIR/archives" \
  download $PACKAGES

for f in *.deb; do
  dpkg-deb -x "$f" "$DEPS_DIR"
done

echo "Playwright dependencies installed to $DEPS_DIR"
echo "Run tests with: npm run test:e2e:local"
