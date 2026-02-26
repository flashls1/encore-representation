# Stage 1: Build the Vite app
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files and install
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Set env vars at build time (Vite inlines them)
ENV VITE_SUPABASE_URL=http://supabasekong-b4ok40cwswc8cwwg44c0w0o4.35.188.155.233.sslip.io
ENV VITE_SUPABASE_PUBLISHABLE_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3MDM5NTQwMCwiZXhwIjo0OTI2MDY5MDAwLCJyb2xlIjoiYW5vbiJ9.mql5XiNqb1NkT8CuJ4hondQzeXt1w8cuBxqkSpAORvE

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
