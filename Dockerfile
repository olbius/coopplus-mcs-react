# syntax=docker/dockerfile:1

FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# API base URL baked into the bundle at build time. Default is a
# same-origin relative path so the nginx proxy in this image forwards
# /rest/* to BACKEND_URL. Override with --build-arg for an app talking
# directly to an external API host (then the backend must allow CORS).
ARG VITE_API_BASE_URL=/rest
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build


FROM nginx:1.27-alpine AS runtime

RUN apk add --no-cache gettext

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY docker-entrypoint.sh /docker-entrypoint-mcs.sh
RUN chmod +x /docker-entrypoint-mcs.sh

ENV BACKEND_URL=http://coopplus-backend:8080

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint-mcs.sh"]
CMD ["nginx", "-g", "daemon off;"]
