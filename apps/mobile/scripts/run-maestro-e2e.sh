#!/usr/bin/env bash
# Orchestrates the mobile Maestro E2E suite: spins up an isolated
# testcontainers Postgres, boots a real API instance against it on
# localhost:8000, runs the flows under apps/mobile/.maestro/, then tears
# everything down. See the plan's Part B for why this exists (isolation
# from the shared Neon dev database).
#
# Requires: Docker running, Maestro CLI installed
# (curl -Ls "https://get.maestro.mobile.dev" | bash), and a booted
# simulator/emulator with the app already installed (npx expo run:ios /
# expo run:android).
set -euo pipefail

API_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../api" && pwd)"

cd "$API_DIR"
npx ts-node test/setup/maestro-orchestrate.ts
