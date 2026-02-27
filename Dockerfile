# Stage 1: Build the Vite app
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files and install
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Set env vars at build time (Vite inlines them)
ENV VITE_SUPABASE_URL=https://api.encorerepresentation.com
ENV VITE_SUPABASE_PUBLISHABLE_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3MTY1MjI4MCwiZXhwIjo0OTI3MzI1ODgwLCJyb2xlIjoiYW5vbiJ9.--2EG7_4nH4OT3MNaE7dvYff8UKqkEzI9JEzUnpG4i4

# Build production bundle
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx config for SPA routing
RUN printf 'server {\n\
    listen 80;\n\
    server_name encorerepresentation.com www.encorerepresentation.com;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    location / {\n\
    try_files $uri $uri/ /index.html;\n\
    }\n\
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|webp|mp4)$ {\n\
    expires 1y;\n\
    add_header Cache-Control "public, immutable";\n\
    }\n\
    gzip on;\n\
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;\n\
    }\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
