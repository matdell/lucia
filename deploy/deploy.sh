#!/usr/bin/env bash
# Publica site/ en el VPS (74.208.218.120) bajo lucia.hollywoodsoft.com.
# Uso: SSH_USER=root ./deploy/deploy.sh   (desde la raíz del repo)
set -euo pipefail
HOST="${SSH_USER:-root}@74.208.218.120"
DOMAIN="lucia.hollywoodsoft.com"
ROOT="/var/www/$DOMAIN"
DIR="$(cd "$(dirname "$0")/.." && pwd)"

ssh "$HOST" "mkdir -p $ROOT"
rsync -avz --delete "$DIR/site/" "$HOST:$ROOT/"
scp "$DIR/deploy/$DOMAIN.conf" "$HOST:/etc/nginx/sites-available/$DOMAIN"
ssh "$HOST" "ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/$DOMAIN && nginx -t && systemctl reload nginx"
# HTTPS (una sola vez): ssh $HOST "certbot --nginx -d $DOMAIN"
echo "Listo: http://$DOMAIN"
