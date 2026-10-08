FROM node:22-alpine AS build
WORKDIR /app
RUN apk add --no-cache openssl
COPY package*.json ./
RUN npm ci
COPY tsconfig*.json ./
COPY prisma ./prisma
RUN npx prisma generate
COPY src ./src
RUN npm run build
RUN npm prune --omit=dev

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl
RUN addgroup -S agrimac && adduser -S agrimac -G agrimac
COPY --from=build --chown=agrimac:agrimac /app/node_modules ./node_modules
COPY --from=build --chown=agrimac:agrimac /app/dist ./dist
COPY --from=build --chown=agrimac:agrimac /app/prisma ./prisma
COPY --chown=agrimac:agrimac docker/entrypoint.sh ./docker/entrypoint.sh
RUN mkdir -p /app/storage/private && chown -R agrimac:agrimac /app/storage
USER agrimac
EXPOSE 3000
ENTRYPOINT ["/bin/sh", "/app/docker/entrypoint.sh"]
