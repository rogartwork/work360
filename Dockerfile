FROM node:20-alpine AS base
RUN apk add --no-cache openssl python3 make g++

FROM base AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
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

# No modo standalone do Next 14, pasta node_modules é parcial dentro do standalone, 
# mas para rodar npx prisma precisamos do node_modules original ou devDeps.
# Vamos copiar os node_modules para garantir o prisma cli.
COPY --from=builder /app/node_modules ./node_modules

RUN mkdir -p /app/data

EXPOSE 3001
ENV PORT 3001
ENV HOSTNAME "0.0.0.0"

# Sincroniza o banco e inicia
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node server.js"]
