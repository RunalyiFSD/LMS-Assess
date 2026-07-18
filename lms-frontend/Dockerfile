FROM node:20-alpine as build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Use Nginx to serve the static files
FROM nginx:alpine
COPY --from=build /usr/src/app/dist /usr/share/nginx/html
# SPA Routing configuration for Nginx
RUN echo "server { listen 5173; location / { root /usr/share/nginx/html; index index.html; try_files \$uri \$uri/ /index.html; } }" > /etc/nginx/conf.d/default.conf

EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]
