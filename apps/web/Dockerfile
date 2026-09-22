FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/package.json
RUN pnpm install --filter @marketsentry/web... --frozen-lockfile=false
COPY apps/web apps/web
RUN pnpm --filter @marketsentry/web build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/apps/web/.output apps/web/.output
EXPOSE 3000
CMD ["node", "apps/web/.output/server/index.mjs"]
