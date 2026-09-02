# Build the static Vue application. This image is not used at runtime.
FROM node:24-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts && npm cache clean --force

COPY . .
RUN npm run build

# HAProxy terminates TLS and proxies HTTP to this unprivileged static server.
FROM nginxinc/nginx-unprivileged:1.30-alpine-slim

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080
