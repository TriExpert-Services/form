# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_SUPABASE_URL=https://supabase.n8n-tech.cloud
ARG VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE
ARG NODE_ENV=production

# Set environment variables for build
ENV VITE_SUPABASE_URL=https://supabase.n8n-tech.cloud
ENV VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE
ENV NODE_ENV=$NODE_ENV

# Debug: Print environment variables - CRÍTICO PARA VERIFICAR
RUN echo "🔍 VARIABLES DE ENTORNO DURANTE BUILD:"
RUN echo "VITE_SUPABASE_URL: $VITE_SUPABASE_URL"
RUN echo "VITE_SUPABASE_ANON_KEY length: $(echo $VITE_SUPABASE_ANON_KEY | wc -c)"
RUN echo "NODE_ENV: $NODE_ENV"

# Verificar que las variables no estén vacías
RUN if [ -z "$VITE_SUPABASE_URL" ]; then echo "❌ ERROR: VITE_SUPABASE_URL is empty!" && exit 1; fi
RUN if [ -z "$VITE_SUPABASE_ANON_KEY" ]; then echo "❌ ERROR: VITE_SUPABASE_ANON_KEY is empty!" && exit 1; fi

# Build the application
RUN npm run build

# Verify build output
RUN ls -la dist/
RUN echo "✅ Build completed successfully"

# Production stage
FROM nginx:alpine

# Remove default nginx config
RUN rm -rf /usr/share/nginx/html/*

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create nginx user and set permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/health || exit 1

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]