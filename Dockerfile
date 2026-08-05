FROM node:22.22-bookworm-slim AS frontend-builder

WORKDIR /app/client

COPY client/package.json client/package-lock.json ./
RUN npm ci

COPY client/ ./
RUN npm run build


FROM node:22.22-bookworm-slim AS backend-builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY nest-cli.json tsconfig.json tsconfig.build.json ./
COPY src/ ./src/
RUN npm run build


FROM node:22.22-bookworm-slim AS runtime

ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=backend-builder --chown=node:node /app/dist ./dist
COPY --from=frontend-builder --chown=node:node /app/client/dist ./client/dist

USER node

EXPOSE 3000

CMD ["node", "dist/main.js"]
