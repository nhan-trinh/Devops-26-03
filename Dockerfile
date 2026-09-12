FROM node:22-alpine AS frontend

WORKDIR /app/client

ARG VITE_BASEURL=http://localhost:4000
ARG VITE_CLERK_PUBLISHABLE_KEY=pk_test_Zm9uZC1tdWxlLTIzLmNsZXJrLmFjY291bnRzLmRldiQ
ENV VITE_BASEURL=$VITE_BASEURL
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY

COPY client/package.json client/package-lock.json ./
RUN npm ci

COPY client/ .
RUN npm run build

FROM node:22-alpine

WORKDIR /app/server

COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev

COPY server/ .
COPY --from=frontend /app/client/dist /app/client/dist

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

CMD ["node", "server.js"]
