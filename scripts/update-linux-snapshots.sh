#!/usr/bin/env bash
# Regenerates the Linux visual baselines (e2e/visual.spec.ts-snapshots/*-linux.png) inside the
# same Playwright image CI uses (.github/workflows/check.yml), so CI compares like with like.
# Needs Docker running. Works on a throwaway copy, so the host's node_modules is untouched.
#
#   bash scripts/update-linux-snapshots.sh
set -euo pipefail

IMAGE="mcr.microsoft.com/playwright:v1.63.0-noble" # keep in step with check.yml
BUN_VERSION="1.4.2"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

docker run --rm --platform linux/amd64 \
  -v "$ROOT":/src:ro \
  -v "$ROOT/e2e/visual.spec.ts-snapshots":/out \
  -e CI=true -e WRANGLER_SEND_METRICS=false \
  "$IMAGE" bash -euo pipefail -c "
    mkdir /work && cd /src
    tar --exclude=./node_modules --exclude=./.output --exclude=./test-results -cf - . | tar -xf - -C /work
    cd /work
    npm install -g bun@$BUN_VERSION >/dev/null
    bun install --frozen-lockfile
    bunx playwright test e2e/visual.spec.ts --update-snapshots=all --reporter=line
    cp e2e/visual.spec.ts-snapshots/*-linux.png /out/
  "

echo "Updated:" && ls "$ROOT/e2e/visual.spec.ts-snapshots/"*-linux.png
