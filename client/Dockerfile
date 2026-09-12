FROM node:22-alpine AS build

WORKDIR /app

ARG VITE_BASEURL=http://localhost:4000
ARG VITE_CLERK_PUBLISHABLE_KEY=pk_test_Zm9uZC1tdWxlLTIzLmNsZXJrLmFjY291bnRzLmRldiQ
ENV VITE_BASEURL=$VITE_BASEURL
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
