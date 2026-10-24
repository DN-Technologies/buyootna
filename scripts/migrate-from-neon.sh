#!/usr/bin/env bash
# Moves the production database from Neon into this server's `postgres`
# container (docker-compose.yaml), then optionally points the API at it.
#
# Run on the server, from the repo root (~/buyootna):
#
#   scripts/migrate-from-neon.sh '<NEON_DIRECT_URL>'                      # copy + check
#   scripts/migrate-from-neon.sh '<NEON_DIRECT_URL>' --switch             # …and switch the API
#   scripts/migrate-from-neon.sh '<NEON_DIRECT_URL>' --replace --switch   # over existing data
#
# Keep the URL in quotes: its "&" would otherwise end the command.
#
# <NEON_DIRECT_URL> is Neon's direct connection string (the host WITHOUT
# "-pooler"): pg_dump needs a real session. While Neon is over its plan's
# quota (error 53000) it refuses every connection: the script then stops
# before changing anything.
#
# What it does, in this order:
#   1. Copies Neon (read-only) to backups/neon-<time>.sql. Nothing on the
#      server has changed yet; if Neon can't be read, it stops here.
#   2. Saves the old postgres:16 cluster (volume postgres_data, never
#      changed) to backups/pg16-<time>.sql, once.
#   3. Makes sure Postgres 17 runs on its own volume (postgres17_data),
#      asking first if that replaces the container the API is using now.
#   4. Loads the copy into an empty database. With --replace, a database
#      that already has tables is saved to backups/box-<time>.sql and
#      emptied first; without it, the script refuses.
#   5. Compares row counts of the main tables on both sides.
#   6. With --switch: backs up apps/api/.env, sets DATABASE_URL and
#      DIRECT_URL to the container, and restarts the API.
# Neon itself is never written to.
set -euo pipefail

NEON_URL="${1:-}"
shift || true
SWITCH=""
REPLACE=""
for FLAG in "$@"; do
  case "$FLAG" in
    --switch) SWITCH=1 ;;
    --replace) REPLACE=1 ;;
    *) echo "✗ Unknown option: $FLAG"; exit 1 ;;
  esac
done
if [[ -z "$NEON_URL" || "$NEON_URL" == --* ]]; then
  sed -n '2,30p' "$0"
  exit 1
fi
if [[ "$NEON_URL" == *-pooler* ]]; then
  echo "✗ That's Neon's pooled host. Use the direct one (the same URL without \"-pooler\")."
  exit 1
fi

cd "$(dirname "$0")/.."
[[ -f .env.postgres ]] || { echo "✗ .env.postgres is missing (POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB)."; exit 1; }
set -a
# shellcheck disable=SC1091
. ./.env.postgres
set +a
: "${POSTGRES_USER:?POSTGRES_USER missing in .env.postgres}"
: "${POSTGRES_PASSWORD:?POSTGRES_PASSWORD missing in .env.postgres}"
: "${POSTGRES_DB:?POSTGRES_DB missing in .env.postgres}"

PROJECT="${COMPOSE_PROJECT_NAME:-$(basename "$PWD")}"
OLD_VOLUME="${PROJECT}_postgres_data"
NEW_VOLUME="${PROJECT}_postgres17_data"
STAMP="$(date +%Y%m%d-%H%M%S)"
DUMP="backups/neon-${STAMP}.sql"
mkdir -p backups
PG17="postgres:17-alpine"

psql_box() {
  docker compose exec -T postgres psql -v ON_ERROR_STOP=1 -X -q \
    -U "$POSTGRES_USER" -d "$POSTGRES_DB" "$@"
}
psql_neon() {
  docker run --rm -i "$PG17" psql "$NEON_URL" -v ON_ERROR_STOP=1 -X -q "$@"
}

echo "1/6 Copying Neon (read-only) → $DUMP"
if ! docker run --rm "$PG17" pg_dump "$NEON_URL" --no-owner --no-privileges >"$DUMP"; then
  rm -f "$DUMP"
  echo "✗ Neon couldn't be read (over its quota? wrong URL?). Nothing on the server was changed."
  exit 1
fi
if ! grep -q '^CREATE TABLE' "$DUMP"; then
  echo "✗ The copy has no tables ($DUMP kept to look at). Nothing on the server was changed."
  exit 1
fi
echo "  ✓ $(du -h "$DUMP" | cut -f1), $(grep -c '^CREATE TABLE' "$DUMP") tables"

echo "2/6 The old Postgres 16 data"
if docker volume inspect "$OLD_VOLUME" >/dev/null 2>&1 && ! ls backups/pg16-*.sql >/dev/null 2>&1; then
  OLD="$(docker run --rm -v "$OLD_VOLUME":/d:ro alpine cat /d/PG_VERSION 2>/dev/null || true)"
  if [[ -n "$OLD" ]]; then
    OLD_DUMP="backups/pg${OLD}-${STAMP}.sql"
    RUNNING="$(docker ps -q --filter volume="$OLD_VOLUME" | head -n1)"
    if [[ -n "$RUNNING" ]]; then
      # Still served by a container: dump through it (never two servers on one volume)
      docker exec "$RUNNING" pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" >"$OLD_DUMP"
    else
      CHECK="buyootna-pg${OLD}-save"
      docker run -d --rm --name "$CHECK" -v "$OLD_VOLUME":/var/lib/postgresql/data \
        --env-file .env.postgres "postgres:${OLD}-alpine" >/dev/null
      until docker exec "$CHECK" pg_isready -h 127.0.0.1 -U "$POSTGRES_USER" >/dev/null 2>&1; do sleep 1; done
      docker exec "$CHECK" pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" >"$OLD_DUMP"
      docker stop "$CHECK" >/dev/null
    fi
    echo "  ✓ Saved to $OLD_DUMP ($(du -h "$OLD_DUMP" | cut -f1)); the volume is left as it was"
  fi
else
  echo "  ✓ Already saved, or none"
fi

echo "3/6 Postgres 17 on its own volume"
CURRENT="$(docker compose ps -q postgres 2>/dev/null || true)"
if [[ -n "$CURRENT" ]] && ! docker inspect "$CURRENT" --format '{{range .Mounts}}{{.Name}} {{end}}' | grep -q "$NEW_VOLUME"; then
  echo "  The running postgres container uses another volume; it will be replaced by one"
  echo "  on $NEW_VOLUME. An API pointed at \"postgres\" sees that database from then on."
  read -r -p "  Go on? [y/N] " OK
  [[ "$OK" == "y" || "$OK" == "Y" ]] || { echo "Stopped. Only the copies in backups/ were made."; exit 1; }
fi
docker compose up -d postgres postgres-backup
# Over TCP: a fresh volume's first start runs a socket-only init server
# that answers pg_isready, then restarts
until docker compose exec -T postgres pg_isready -h 127.0.0.1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" >/dev/null 2>&1; do
  sleep 1
done
VERSION="$(psql_box -Atc 'show server_version_num')"
[[ "${VERSION:0:2}" -ge 17 ]] || {
  echo "✗ The container runs Postgres $VERSION; docker-compose.yaml should say postgres:17-alpine."
  exit 1
}
echo "  ✓ Postgres ${VERSION:0:2}"

echo "4/6 Loading the copy"
TABLES="$(psql_box -Atc "select count(*) from information_schema.tables where table_schema = 'public'")"
if [[ "$TABLES" != "0" ]]; then
  if [[ -z "$REPLACE" ]]; then
    echo "✗ The container's database already has $TABLES tables: refusing to load over it."
    echo "  To replace them with Neon's data, run again with --replace (they're saved first)."
    exit 1
  fi
  BOX_DUMP="backups/box-${STAMP}.sql"
  docker compose exec -T postgres pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" >"$BOX_DUMP"
  echo "  Its $TABLES tables are saved to $BOX_DUMP ($(du -h "$BOX_DUMP" | cut -f1))"
  psql_box -c 'drop schema public cascade; create schema public;'
fi
psql_box -o /dev/null <"$DUMP"
echo "  ✓ Loaded"

echo "5/6 Row counts (Neon → container)"
MISMATCH=0
for TABLE in User Identity Property Story Conversation Message Notification _prisma_migrations; do
  SQL="select count(*) from \"$TABLE\""
  A="$(psql_neon -Atc "$SQL" 2>/dev/null || echo '-')"
  B="$(psql_box -Atc "$SQL" 2>/dev/null || echo '-')"
  MARK="✓"
  [[ "$A" == "$B" ]] || { MARK="✗"; MISMATCH=1; }
  printf '  %s %-20s %8s → %s\n' "$MARK" "$TABLE" "$A" "$B"
done
[[ "$MISMATCH" == "0" ]] || {
  echo "✗ The counts differ (was the app writing to Neon meanwhile?). The API wasn't switched."
  exit 1
}

# The container's address for the API, with the password URL-encoded
PASSWORD="$(docker compose run --rm --no-deps -T api node -e \
  'process.stdout.write(encodeURIComponent(process.argv[1]))' "$POSTGRES_PASSWORD")"
BOX_URL="postgresql://${POSTGRES_USER}:${PASSWORD}@postgres:5432/${POSTGRES_DB}"

if [[ -z "$SWITCH" ]]; then
  echo "6/6 Not switched. When ready, set in apps/api/.env:"
  echo "  DATABASE_URL=postgresql://${POSTGRES_USER}:<password>@postgres:5432/${POSTGRES_DB}"
  echo "  DIRECT_URL=  (the same)"
  echo "  then: docker compose up -d --force-recreate api"
  exit 0
fi

echo "6/6 Switching the API to the container"
cp apps/api/.env "apps/api/.env.before-${STAMP}"
grep -vE '^(DATABASE_URL|DIRECT_URL)=' "apps/api/.env.before-${STAMP}" >apps/api/.env
{
  echo "DATABASE_URL=${BOX_URL}"
  echo "DIRECT_URL=${BOX_URL}"
} >>apps/api/.env
docker compose up -d --force-recreate api
echo "  ✓ The API now uses the container. The old .env is apps/api/.env.before-${STAMP}"
echo "  Watch it with: docker compose logs -f api"
