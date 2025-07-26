# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG NODE_ENV=production

# Set environment variables for build
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV NODE_ENV=$NODE_ENV

# Debug: Print environment variables (remove in production)
RUN echo "Building with VITE_SUPABASE_URL: $VITE_SUPABASE_URL"
RUN echo "Building with NODE_ENV: $NODE_ENV"

# Build the application
RUN npm run build

# Debug: List build output
RUN ls -la dist/
RUN head -20 dist/index.html

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

# Debug: Verify files were copied
RUN ls -la /usr/share/nginx/html/
RUN head -10 /usr/share/nginx/html/index.html

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/health || exit 1

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]