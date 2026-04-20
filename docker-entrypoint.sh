#!/bin/sh
set -e

: "${BACKEND_URL:?BACKEND_URL must be set (e.g. http://coopplus-backend:8080)}"

envsubst '${BACKEND_URL}' \
  < /etc/nginx/templates/default.conf.template \
  > /etc/nginx/conf.d/default.conf

echo "nginx config:"
cat /etc/nginx/conf.d/default.conf

exec "$@"
