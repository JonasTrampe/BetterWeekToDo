# Build the static Vue application. This image is not used at runtime.
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json yarn.lock ./
RUN corepack enable \
    && corepack prepare yarn@1.22.22 --activate \
    && yarn install --frozen-lockfile --ignore-engines \
    && yarn cache clean

COPY . .
RUN yarn build

# HAProxy terminates TLS and proxies HTTP to this unprivileged static server.
FROM nginxinc/nginx-unprivileged:1.28-alpine

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080
