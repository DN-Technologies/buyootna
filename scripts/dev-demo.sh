#!/usr/bin/env bash
# Brings the LOCAL database up to date and fills one account with the demo
# data for the home pill's notch («النبض») and the studio («الاستوديو»), to
# test them in the simulator. Local databases only (it refuses any other).
#
# Run from the repo root:
#
#   scripts/dev-demo.sh                          migrate + every demo, for dev@youssef.app
#   scripts/dev-demo.sh --email you@example.com  another local account
#   scripts/dev-demo.sh --clear                  removes the demo data (keeps the migrations)
#
# What it does:
#   1. Checks apps/api/.env points at a local database, and that it answers.
#   2. Applies pending migrations (prisma migrate deploy) and regenerates the
#      Prisma client.
#   3. Seeds, on the account: individual (an offer, an ad expiring tomorrow,
#      an alert match, a saved company's story), its company (an overdue
#      invoice, requests, an accepted offer, a live story), its office (ad
#      expiring, no credits, a live story; skipped if it has none and you
#      don't want a demo one: see below), and the studio (archive + highlights).
#   4. Checks the API has the new routes (a running API on :8000 that wasn't
#      restarted since pulling answers 404).
# A company or office the account doesn't have is created as a demo one,
# which --clear removes. Then: pull to refresh the app, and switch profile
# with a double tap on the photo.
set -euo pipefail

EMAIL="dev@youssef.app"
CLEAR=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --email) EMAIL="${2:?--email needs an address}"; shift 2 ;;
    --clear) CLEAR=1; shift ;;
    -h|--help) sed -n '2,26p' "$0"; exit 0 ;;
    *) echo "✗ Unknown option: $1"; exit 1 ;;
  esac
done

cd "$(dirname "$0")/.."
# Meant for a developer's machine, never the server: there the database is
# production and the API runs in Docker (no node on the host)
if ! command -v node >/dev/null || ! command -v pnpm >/dev/null; then
  echo "✗ This is for your own machine (it needs node and pnpm), not the server."
  echo "  On the server, migrations run with the deploy (CD); demo data never goes to production."
  exit 1
fi
API_ENV="apps/api/.env"
[[ -f "$API_ENV" ]] || { echo "✗ $API_ENV is missing."; exit 1; }

# 1. Local only: the URL migrate uses (DIRECT_URL first, as prisma.config.ts)
DB_URL="$(grep -E '^DIRECT_URL=' "$API_ENV" | cut -d= -f2- | tr -d '"' || true)"
[[ -n "$DB_URL" ]] || DB_URL="$(grep -E '^DATABASE_URL=' "$API_ENV" | cut -d= -f2- | tr -d '"')"
DB_HOST="$(node -e 'process.stdout.write(new URL(process.argv[1]).hostname)' "$DB_URL")"
case "$DB_HOST" in
  localhost|127.0.0.1|::1) ;;
  *) echo "✗ $API_ENV points at \"$DB_HOST\": this script only touches a local database."; exit 1 ;;
esac
DB_PORT="$(node -e 'process.stdout.write(new URL(process.argv[1]).port || "5432")' "$DB_URL")"
if ! node -e "require('net').connect(+process.argv[1], process.argv[2]).on('connect', () => process.exit(0)).on('error', () => process.exit(1))" "$DB_PORT" "$DB_HOST"; then
  echo "✗ Nothing answers on $DB_HOST:$DB_PORT. Start it: docker compose up -d postgres"
  exit 1
fi
echo "1/4 Local database at $DB_HOST:$DB_PORT ✓"

if [[ -n "$CLEAR" ]]; then
  pnpm --filter api --silent pulse:demo clear
  exit 0
fi

# 2. Migrations and client
echo "2/4 Migrations"
pnpm --filter api --silent exec prisma migrate deploy 2>&1 | grep -E 'applied|Applying|No pending|Error' || true
pnpm --filter api --silent exec prisma generate >/dev/null 2>&1
echo "    ✓ up to date, client generated"

# 3. Demo data
echo "3/4 Demo data for $EMAIL"
for c in all company office studio; do
  pnpm --filter api --silent pulse:demo "$c" --email "$EMAIL" | grep -E '✓|✗|^ {10,}' || {
    echo "✗ pulse:demo $c failed (run it alone to see why: pnpm --filter api pulse:demo $c --email $EMAIL)"
    exit 1
  }
done

# 4. The running API
echo "4/4 API on :8000"
code="$(curl -s -o /dev/null -m 5 -w '%{http_code}' http://localhost:8000/stories/me/highlights || true)"
case "$code" in
  401) echo "    ✓ running, with the new routes" ;;
  404) echo "    ✗ running an older build: restart it (pnpm --filter api start:dev)" ;;
  000) echo "    ✗ not running: pnpm --filter api start:dev" ;;
  *) echo "    ? answered $code" ;;
esac

echo
echo "Done. In the simulator: pull to refresh; double-tap your photo to switch to the company/office."
echo "Undo the demo data: scripts/dev-demo.sh --clear"
