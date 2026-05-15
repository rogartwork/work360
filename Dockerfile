FROM node:20-alpine AS base
RUN apk add --no-cache openssl python3 make g++

FROM base AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

# Build args para o Prisma funcionar durante o build (sem banco real)
ARG DATABASE_URL=file:/tmp/build.db
ARG SESSION_PASSWORD=build_placeholder_32_chars_minimum_x
ENV DATABASE_URL=${DATABASE_URL}
ENV SESSION_PASSWORD=${SESSION_PASSWORD}

RUN npx prisma generate
RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Copiar tudo que o Next standalone e o Prisma precisam
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

# node_modules completo para o prisma e o seed
COPY --from=builder /app/node_modules ./node_modules

RUN mkdir -p /app/data

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# No runtime DATABASE_URL é injetada pelo docker-compose
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node prisma/seed-admin.js && node server.js"]
