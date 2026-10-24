#!/usr/bin/env bash
# Moves the production database from Neon into this server's `postgres`
# container (docker-compose.yaml), then optionally points the API at it.
#
# Run on the server, from the repo root (~/buyootna):
#
#   scripts/migrate-from-neon.sh "<NEON_DIRECT_URL>"            # copy + check
#   scripts/migrate-from-neon.sh "<NEON_DIRECT_URL>" --switch   # …and switch the API
#
# <NEON_DIRECT_URL> is Neon's direct connection string (the host WITHOUT
# "-pooler"): pg_dump needs a real session. Neon must be reachable: while it
# is over its plan's quota (error 53000) every connection is refused, so
# lift the quota (upgrade) or wait for it to reset first.
#
# What it does:
#   1. Makes sure the container runs Postgres 17 (Neon's version). An EMPTY
#      volume left by the old postgres:16 image is replaced, after asking;
#      a volume that holds data stops the script.
#   2. Refuses to load into a database that already has tables.
#   3. Dumps Neon (read-only) to backups/neon-<time>.sql and loads it,
#      stopping at the first error. Prisma's migration history comes along,
#      so CD's `prisma migrate deploy` carries on from where Neon was.
#   4. Compares row counts of the main tables on both sides.
#   5. With --switch: backs up apps/api/.env, sets DATABASE_URL and
#      DIRECT_URL to the container, and restarts the API.
# Neon itself is never written to.
set -euo pipefail

NEON_URL="${1:-}"
SWITCH="${2:-}"
if [[ -z "$NEON_URL" ]]; then
  sed -n '2,13p' "$0"
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
VOLUME="${PROJECT}_postgres_data"
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

echo "1/5 The container's Postgres"
if docker volume inspect "$VOLUME" >/dev/null 2>&1; then
  OLD="$(docker run --rm -v "$VOLUME":/d alpine cat /d/PG_VERSION 2>/dev/null || true)"
  if [[ -n "$OLD" && "$OLD" != "17" ]]; then
    echo "  The volume $VOLUME holds a Postgres $OLD cluster; Neon is 17."
    docker compose stop postgres postgres-backup >/dev/null 2>&1 || true
    CHECK="buyootna-pg${OLD}-check"
    docker run -d --rm --name "$CHECK" -v "$VOLUME":/var/lib/postgresql/data \
      "postgres:${OLD}-alpine" >/dev/null
    until docker exec "$CHECK" pg_isready -h 127.0.0.1 -U "$POSTGRES_USER" >/dev/null 2>&1; do sleep 1; done
    TABLES="$(docker exec "$CHECK" psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Atc \
      "select count(*) from information_schema.tables where table_schema = 'public'" 2>/dev/null || echo 0)"
    docker stop "$CHECK" >/dev/null
    if [[ "$TABLES" != "0" ]]; then
      echo "✗ It has $TABLES tables: not touching it. Upgrade it by hand (dump with"
      echo "  postgres:${OLD}, load into a fresh 17 volume) before running this again."
      exit 1
    fi
    read -r -p "  It's empty. Replace it with a Postgres 17 volume? [y/N] " OK
    [[ "$OK" == "y" || "$OK" == "Y" ]] || { echo "Stopped. Nothing was changed."; exit 1; }
    docker compose rm -f postgres postgres-backup >/dev/null
    docker volume rm "$VOLUME" >/dev/null
    echo "  ✓ Replaced"
  fi
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
TABLES="$(psql_box -Atc "select count(*) from information_schema.tables where table_schema = 'public'")"
[[ "$TABLES" == "0" ]] || {
  echo "✗ The container's database already has $TABLES tables: refusing to load over it."
  exit 1
}
echo "  ✓ Postgres ${VERSION:0:2}, empty"

echo "2/5 Dumping Neon (read-only) → $DUMP"
docker run --rm "$PG17" pg_dump "$NEON_URL" --no-owner --no-privileges >"$DUMP"
echo "  ✓ $(du -h "$DUMP" | cut -f1)"

echo "3/5 Loading it into the container"
psql_box -o /dev/null <"$DUMP"
echo "  ✓ Loaded"

echo "4/5 Row counts (Neon → container)"
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
  echo "✗ The counts differ (was the app writing to Neon meanwhile?). The API still uses Neon."
  exit 1
}

# The container's address for the API, with the password URL-encoded
PASSWORD="$(docker compose run --rm --no-deps -T api node -e \
  'process.stdout.write(encodeURIComponent(process.argv[1]))' "$POSTGRES_PASSWORD")"
BOX_URL="postgresql://${POSTGRES_USER}:${PASSWORD}@postgres:5432/${POSTGRES_DB}"

if [[ "$SWITCH" != "--switch" ]]; then
  echo "5/5 Not switched. When ready, set in apps/api/.env:"
  echo "  DATABASE_URL=postgresql://${POSTGRES_USER}:<password>@postgres:5432/${POSTGRES_DB}"
  echo "  DIRECT_URL=  (the same)"
  echo "  then: docker compose up -d --force-recreate api"
  echo "  (or run this again with --switch on an empty container)"
  exit 0
fi

echo "5/5 Switching the API to the container"
cp apps/api/.env "apps/api/.env.neon-${STAMP}"
grep -vE '^(DATABASE_URL|DIRECT_URL)=' "apps/api/.env.neon-${STAMP}" >apps/api/.env
{
  echo "DATABASE_URL=${BOX_URL}"
  echo "DIRECT_URL=${BOX_URL}"
} >>apps/api/.env
docker compose up -d --force-recreate api
echo "  ✓ The API now uses the container. The old .env is apps/api/.env.neon-${STAMP}"
echo "  Watch it with: docker compose logs -f api"
