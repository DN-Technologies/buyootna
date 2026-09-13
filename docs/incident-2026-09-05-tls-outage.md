# Incident: production TLS certs wiped, 2026-09-05

## Summary

Every production domain ended up serving a 1-day self-signed dummy
certificate (`CN=localhost`) instead of a real Let's Encrypt certificate.
`api.buyootna.cloud` and `admin.buyootna.cloud` are still on the dummy
cert as of this writing, blocked by a Let's Encrypt rate limit until
**2026-09-05 ~14:43-14:44 UTC**. Everything else is fixed.

## Root causes found

1. **`init-letsencrypt.sh`'s dummy-cert step overwrites the live real
   certificate before confirming a replacement succeeds.** Something
   re-ran the script (most likely during the `cd1c279` TLS-bootstrap
   incident response on 2026-09-02), which wiped every domain's real
   cert down to a throwaway 1-day dummy, and the real-certificate step
   then failed for reasons that were never resolved before the dummy
   expired.
2. **`api.buyootna.cloud`'s nginx config had a hand-edited duplicate
   `server { listen 80; server_name api.buyootna.cloud; }` block**
   (found live on the server, uncommitted, with a `.bak` of the
   original next to it) that unconditionally redirected *all* port-80
   traffic — including the ACME HTTP-01 challenge path
   `/.well-known/acme-challenge/...` — to HTTPS, where nothing serves
   that path. This alone would make certificate issuance/renewal for
   `api.buyootna.cloud` fail even without the dummy-cert problem, and
   likely explains why `api` had already burned through Let's
   Encrypt's rate limit (5 real certs/domain/week) from repeated manual
   retries before this incident was even investigated. **Fixed**:
   restored from the `.bak` on the server.
3. **`docker-compose.yaml` never had a `marketing` service.**
   `nginx/conf.d/daralnokhba.online.conf` proxies to
   `http://marketing:7000`, but no such container existed, so Docker's
   embedded DNS returned `SERVFAIL` for every request — the
   `"marketing could not be resolved (2: Server failure)"` errors
   flooding the logs. **Fixed**: added the service in commit
   `edb4fac` (now on `main`).
4. **The production server's `main` checkout was several PRs behind
   `dev`**, meaning it was still running the *old, unsafe*
   `init-letsencrypt.sh` (unsafe `curl -s`, the `&&`-in-single-exec
   entrypoint bug from before `cd1c279`) at the time this incident was
   discovered. Re-running the old script blind could have reproduced
   the exact "took down all of nginx" incident from three days earlier.
   Confirmed fixed by the time certs were reissued (PR #54 merged
   `cd1c279` onto `main`).
5. **`docs.buyootna.cloud` has no DNS record at all** (separate,
   pre-existing, non-urgent — certificate issuance for it will never
   succeed until DNS is pointed at the server).

## What was actually fixed today

- `docker-compose.yaml`: added the missing `marketing` service.
- `nginx/conf.d/api.buyootna.cloud.conf`: restored from `.bak`, removing
  the duplicate/broken redirect block.
- Real Let's Encrypt certificates (expiring 2026-12-04) now serving on:
  `buyootna.cloud` / `www.buyootna.cloud`, `companies.buyootna.cloud`,
  `daralnokhba.online` / `www.daralnokhba.online`,
  `management.buyootna.cloud`, `offices.buyootna.cloud`.
  - These landed in `-0001`-suffixed lineage folders
    (`certbot/conf/live/<domain>-0001/`) rather than the bare-name path,
    because the bare-name `live/<domain>/` dir was still occupied when
    certbot ran. The affected `nginx/conf.d/*.conf` files were
    hand-patched on the server (uncommitted, `.conf.bak2` backups left
    next to each) to point at the `-0001` path directly. **This is a
    workaround, not a real fix — see Follow-ups.**
- `api.buyootna.cloud` and `admin.buyootna.cloud`: given fresh 1-day
  dummy certs (expire 2026-09-06) purely to keep nginx restart-safe
  (it cannot start at all if a referenced cert file is missing).
  Real certs blocked by the Let's Encrypt rate limit.

## Remaining steps (after 2026-09-05 ~14:44 UTC)

Run on the server:

```bash
docker compose run --rm --entrypoint "rm -Rf /etc/letsencrypt/live/api.buyootna.cloud /etc/letsencrypt/archive/api.buyootna.cloud /etc/letsencrypt/renewal/api.buyootna.cloud.conf" certbot
docker compose run --rm --entrypoint "certbot certonly --webroot -w /var/www/certbot --register-unsafely-without-email -d api.buyootna.cloud --rsa-key-size 4096 --agree-tos --force-renewal" certbot

docker compose run --rm --entrypoint "rm -Rf /etc/letsencrypt/live/admin.buyootna.cloud /etc/letsencrypt/archive/admin.buyootna.cloud /etc/letsencrypt/renewal/admin.buyootna.cloud.conf" certbot
docker compose run --rm --entrypoint "certbot certonly --webroot -w /var/www/certbot --register-unsafely-without-email -d admin.buyootna.cloud --rsa-key-size 4096 --agree-tos --force-renewal" certbot

# Check whether either landed in a -0001 folder again before reloading:
ls certbot/conf/live/ | grep -E "api|admin"

docker compose exec nginx nginx -t
# only if that passes cleanly (no "conflicting server name" warnings):
docker compose exec nginx nginx -s reload
```

If either lands in a `-0001` folder again, patch that domain's
`nginx/conf.d/*.conf` the same way the other five were patched:

```bash
d=api.buyootna.cloud   # or admin.buyootna.cloud
cp "nginx/conf.d/$d.conf" "nginx/conf.d/$d.conf.bak2"
sed -i "s#/etc/letsencrypt/live/$d/#/etc/letsencrypt/live/$d-0001/#g" "nginx/conf.d/$d.conf"
docker compose exec nginx nginx -t && docker compose exec nginx nginx -s reload
```

Also still pending, not urgent, not blocked by anything:

```bash
docker compose build marketing
docker compose up -d marketing   # daralnokhba.online was still 502ing as of this doc
```

## Follow-ups (do once things are stable, not urgent)

1. **Clean up the `-0001` lineage mess properly.** Once past the rate
   limit and things are calm: for each of the 5 domains now running on
   a `-0001` cert, fully delete *all* lingering state
   (`live/<domain>*`, `archive/<domain>*`, `renewal/<domain>*.conf` —
   including old orphaned dirs like the leftover `live/www.buyootna.cloud/`
   found during this incident, unrelated to today's `-0001`s and dated
   from the 2026-09-02 incident), then request one clean bare-named
   cert per domain. Revert the `nginx/conf.d/*.conf.bak2` patches once
   the bare-name path is valid again, and delete the `.bak2` files.
2. **Harden `init-letsencrypt.sh`.** The dummy-cert step currently
   destroys the working certificate before the replacement is
   confirmed. It should skip the dummy-then-real dance entirely for any
   domain that already has a valid, non-dummy, non-expired certificate
   — only genuinely new domains need a placeholder to let nginx start
   before the first real cert exists.
3. **Point `docs.buyootna.cloud`'s DNS at the server** if that
   subdomain is still wanted; otherwise remove it from
   `init-letsencrypt.sh`'s `domains` list and `nginx/conf.d/`.
4. **Delete the stray `.bak` / `.bak2` files** left on the server
   (`nginx/conf.d/api.buyootna.cloud.conf.bak`,
   `nginx/conf.d/*.conf.bak2`) once their corresponding fixes are
   confirmed permanent and merged properly through git — right now they
   exist only as uncommitted, server-local safety copies.
