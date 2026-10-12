#!/bin/bash

if ! [ -x "$(command -v docker)" ]; then
  echo 'Error: docker is not installed.' >&2
  exit 1
fi

domains=(api.buyootna.cloud daralnokhba.online app.daralnokhba.online api.daralnokhba.online buyootna.cloud,www.buyootna.cloud companies.buyootna.cloud offices.buyootna.cloud management.buyootna.cloud admin.buyootna.cloud docs.buyootna.cloud buyootna.com api.buyootna.com management.buyootna.com companies.buyootna.com offices.buyootna.com admin.buyootna.com docs.buyootna.com)
rsa_key_size=4096
data_path="./certbot"
email="" # Set your email here (recommended for renewal notices)
staging=0 # Set to 1 if you're testing to avoid hitting request limits

# Select appropriate email arg
email_arg="--register-unsafely-without-email"
if [ -n "$email" ]; then email_arg="--email $email --no-eff-email"; fi

# Enable staging mode if needed
staging_arg=""
if [ $staging -ne 0 ]; then staging_arg="--staging"; fi

if [ ! -s "$data_path/conf/options-ssl-nginx.conf" ]; then
  echo "### Downloading recommended TLS parameters ..."
  mkdir -p "$data_path/conf"
  # certbot's repo layout has moved before (the old master/certbot-nginx
  # path now 404s) and silently overwrote a good file with an empty/404
  # response, since `curl -s` alone doesn't fail on HTTP errors -- `-f`
  # makes curl fail loudly (and this whole command fail) instead of
  # writing bad content, and `-s` guards against ever running on an
  # existing, non-empty file that just wasn't caught by the check above.
  if ! curl -fsSL https://raw.githubusercontent.com/certbot/certbot/main/certbot/src/certbot/_internal/plugins/nginx/tls_configs/options-ssl-nginx.conf -o "$data_path/conf/options-ssl-nginx.conf"; then
    echo "ERROR: failed to download options-ssl-nginx.conf -- aborting rather than risk writing a broken file nginx can't parse." >&2
    exit 1
  fi
  echo
fi

if [ ! -s "$data_path/conf/ssl-dhparams.pem" ]; then
  echo "### Generating ssl-dhparams.pem locally ..."
  # certbot no longer ships/publishes this file for download (both its old
  # and current repo locations 404) -- DH params aren't secret, but rather
  # than hardcode PEM content here, generate it locally via the certbot
  # container's openssl, which is already part of this stack.
  mkdir -p "$data_path/conf"
  docker compose run --rm --entrypoint "openssl dhparam -out /etc/letsencrypt/ssl-dhparams.pem 2048" certbot
  echo
fi

domains_to_request=()
for domain in "${domains[@]}"; do
  dir_name=$(echo "$domain" | cut -d',' -f1)
  if [ -d "$data_path/conf/live/$dir_name" ]; then
    read -p "Existing data found for $dir_name. Continue and replace existing certificate? (y/N) " decision
    if [ "$decision" != "Y" ] && [ "$decision" != "y" ]; then
      echo "Skipping certificate request for $domain (retaining existing certificate)."
      continue
    fi
  fi
  domains_to_request+=("$domain")
done

# If no domains to request, we just make sure Nginx is running and exit
if [ ${#domains_to_request[@]} -eq 0 ]; then
  echo "No new certificates to request. Starting/ensuring nginx is running..."
  docker compose up --force-recreate -d nginx
  exit 0
fi

for domain in "${domains_to_request[@]}"; do
  dir_name=$(echo "$domain" | cut -d',' -f1)
  echo "### Creating dummy certificate for $dir_name ($domain) ..."
  path="/etc/letsencrypt/live/$dir_name"
  mkdir -p "$data_path/conf/live/$dir_name"
  docker compose run --rm --entrypoint "\
    openssl req -x509 -nodes -newkey rsa:$rsa_key_size -days 1 \
      -keyout '$path/privkey.pem' \
      -out '$path/fullchain.pem' \
      -subj '/CN=localhost'" certbot
  echo
done

echo "### Starting nginx ..."
docker compose up --force-recreate -d nginx
echo

for domain in "${domains_to_request[@]}"; do
  dir_name=$(echo "$domain" | cut -d',' -f1)
  echo "### Deleting dummy certificate for $dir_name ..."
  # `docker compose run --entrypoint "cmd1 && cmd2 && cmd3"` does NOT invoke
  # a shell -- it whitespace-splits the whole string into a single exec's
  # argv, so `&&` and everything after the first command become literal,
  # ignored arguments. That silently no-op'd this cleanup on every run,
  # which is why stale renewal configs kept forcing certbot into
  # ever-incrementing -0001/-0002 lineages instead of reusing the
  # canonical name nginx's config actually points at. `rm` takes multiple
  # paths in one call, so no chaining is needed at all.
  docker compose run --rm --entrypoint "rm -Rf /etc/letsencrypt/live/$dir_name /etc/letsencrypt/archive/$dir_name /etc/letsencrypt/renewal/$dir_name.conf" certbot
  echo

  echo "### Requesting Let's Encrypt certificate for $domain ..."
  docker compose run --rm --entrypoint "\
    certbot certonly --webroot -w /var/www/certbot \
      $staging_arg \
      $email_arg \
      -d $domain \
      --rsa-key-size $rsa_key_size \
      --agree-tos \
      --force-renewal" certbot
  echo
done

echo "### Reloading nginx ..."
docker compose exec nginx nginx -s reload

echo "### Done! SSL certificate setup complete."
