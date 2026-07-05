#!/bin/bash

if ! [ -x "$(command -v docker)" ]; then
  echo 'Error: docker is not installed.' >&2
  exit 1
fi

domains=(api.buyootna.cloud daralnokhba.online buyootna.cloud,www.buyootna.cloud)
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

if [ ! -e "$data_path/conf/options-ssl-nginx.conf" ] || [ ! -e "$data_path/conf/ssl-dhparams.pem" ]; then
  echo "### Downloading recommended TLS parameters ..."
  mkdir -p "$data_path/conf"
  curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > "$data_path/conf/options-ssl-nginx.conf"
  curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > "$data_path/conf/ssl-dhparams.pem"
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
  docker compose run --rm --entrypoint "\
    rm -Rf /etc/letsencrypt/live/$dir_name && \
    rm -Rf /etc/letsencrypt/archive/$dir_name && \
    rm -Rf /etc/letsencrypt/renewal/$dir_name.conf" certbot
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
