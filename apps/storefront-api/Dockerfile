FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json yarn.lock ./
COPY packages/ packages/
COPY apps/storefront-api/ apps/storefront-api/

RUN yarn install --frozen-lockfile
RUN yarn build storefront-api

FROM node:18-alpine AS runtime

WORKDIR /app

COPY package*.json yarn.lock ./
RUN yarn install --production --frozen-lockfile

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/packages ./packages

EXPOSE 3000

CMD ["node", "dist/apps/storefront-api/main.js"]