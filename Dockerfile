# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar los archivos de dependencias
COPY package*.json ./

# Instalar TODAS las dependencias, incluidas las de desarrollo (necesarias para vite)
RUN npm ci

# Copiar el resto del código fuente
COPY . .

# Ejecutar la build de Vite
RUN npm run build

# Production stage
FROM nginx:alpine

# Copiar los archivos generados por Vite al directorio de Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de nginx (opcional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto 80
EXPOSE 80

# Ejecutar nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]
