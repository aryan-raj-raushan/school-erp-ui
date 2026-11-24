FROM node:24-alpine AS build
ENV HUSKY=0 NEXT_TELEMETRY_DISABLED=1 NODE_OPTIONS=--max-old-space-size=2048
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund --prefer-offline
COPY . .
RUN --mount=type=cache,target=/app/.next/cache npm run build

FROM scratch
COPY --from=build /app/out /
