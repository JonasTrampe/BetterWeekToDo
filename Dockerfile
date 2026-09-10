# Build the Vue application for the API container to serve.
FROM node:26-alpine@sha256:ef24c5053d50fdc3e4e56eb4e7ddb7861874ab0fdc797046ba897581deb8e868 AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts && npm cache clean --force

COPY . .
RUN npm run build

FROM node:26-alpine@sha256:ef24c5053d50fdc3e4e56eb4e7ddb7861874ab0fdc797046ba897581deb8e868

WORKDIR /app
ENV NODE_ENV=production

COPY server/package.json server/package-lock.json ./
RUN apk upgrade --no-cache \
    && npm ci --omit=dev --ignore-scripts \
    && npm cache clean --force \
    && rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx

COPY server/src ./src
COPY --from=build /app/dist ./public
COPY LICENSE NOTICE ./public/

USER node
EXPOSE 3000
CMD ["node", "src/index.js"]
