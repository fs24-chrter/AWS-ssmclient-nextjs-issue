FROM node:18-alpine as builder
WORKDIR /my-space

COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine as runner
WORKDIR /my-space

COPY --from=builder /my-space/.next ./.next
COPY --from=builder /my-space/package.json .
COPY --from=builder /my-space/package-lock.json .
COPY --from=builder /my-space/next.config.mjs ./
COPY --from=builder /my-space/public ./public
COPY --from=builder /my-space/.next/static ./.next/static

RUN npm ci

EXPOSE 3000
ENTRYPOINT ["npm", "start"]