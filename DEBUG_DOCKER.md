# 🐛 Debug Docker Deployment - Pantalla en Blanco

## 🔍 **Diagnóstico Paso a Paso**

### **1. Verificar Build Local**
```bash
# Construir localmente para verificar
npm install
npm run build

# Verificar que se generó dist/
ls -la dist/
```

### **2. Test Docker Local**
```bash
# Build imagen
docker build -t solicitudes-traduccion-test .

# Ejecutar con variables de entorno
docker run -p 8080:80 \
  -e VITE_SUPABASE_URL=tu_supabase_url \
  -e VITE_SUPABASE_ANON_KEY=tu_supabase_key \
  solicitudes-traduccion-test

# Acceder a http://localhost:8080
```

### **3. Debug en Contenedor**
```bash
# Entrar al contenedor en ejecución
docker exec -it <container-id> sh

# Verificar archivos
ls -la /usr/share/nginx/html/

# Verificar nginx
nginx -t
cat /etc/nginx/conf.d/default.conf

# Ver logs de nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### **4. Health Check**
```bash
# Verificar endpoint de salud
curl http://localhost:8080/health

# Debería retornar: "healthy"
```

## 🚨 **Causas Comunes de Pantalla en Blanco**

### **A. Variables de Entorno**
```bash
# ❌ INCORRECTO - Variables no definidas en build
VITE_SUPABASE_URL=undefined

# ✅ CORRECTO - Variables definidas antes del build
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
```

### **B. Rutas Incorrectas**
```nginx
# ❌ INCORRECTO
root /usr/share/nginx/html/dist;

# ✅ CORRECTO
root /usr/share/nginx/html;
```

### **C. Archivos No Copiados**
```dockerfile
# Verificar que el build stage funcionó
COPY --from=builder /app/dist /usr/share/nginx/html
```

## 🛠️ **Soluciones por Problema**

### **Problema 1: Variables de Entorno**
```bash
# En Dokploy, configurar ANTES del deploy:
VITE_SUPABASE_URL=https://xyzabc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
NODE_ENV=production
```

### **Problema 2: Error en Build**
```bash
# Ver logs de build en Dokploy
# Si falla, revisar package.json dependencies
```

### **Problema 3: Nginx Config**
```bash
# Verificar que nginx.conf esté copiado correctamente
# El archivo debe estar en el proyecto root
```

### **Problema 4: Permisos**
```bash
# El Dockerfile ya incluye:
RUN chown -R nginx:nginx /usr/share/nginx/html
```

## 🔧 **Commands de Debug**

### **En Dokploy:**
```bash
# Ver logs del contenedor
docker logs <container-name>

# Entrar al contenedor
docker exec -it <container-name> sh

# Verificar archivos
ls -la /usr/share/nginx/html/
cat /usr/share/nginx/html/index.html
```

### **Test Local con Docker Compose:**
```bash
# Usar docker-compose.yml incluido
docker-compose up --build

# Ver logs
docker-compose logs -f
```

## 📋 **Checklist de Verificación**

- [ ] ✅ Variables de entorno configuradas en Dokploy
- [ ] ✅ Build local funciona (`npm run build`)
- [ ] ✅ Archivo `dist/index.html` existe después del build
- [ ] ✅ Dockerfile multi-stage funciona
- [ ] ✅ nginx.conf está en la raíz del proyecto
- [ ] ✅ Puerto 80 expuesto correctamente
- [ ] ✅ Health check responde

## 🆘 **Si Sigue sin Funcionar**

### **1. Verificar Console Errors:**
```javascript
// Abrir DevTools > Console
// Buscar errores rojos
```

### **2. Network Tab:**
```javascript
// DevTools > Network
// Ver si hay recursos 404 o 500
```

### **3. Application Tab:**
```javascript
// DevTools > Application > Local Storage
// Verificar si hay errores de Supabase
```

### **4. Test Manual:**
```bash
# Crear index.html simple para test
echo "<h1>Test</h1>" > test-index.html

# Reemplazar en contenedor
docker cp test-index.html <container>:/usr/share/nginx/html/index.html
```

## 🚀 **Solución Rápida**

Si nada funciona, usa esta configuración mínima:

```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

¡Con estos pasos deberías identificar y resolver el problema de la pantalla en blanco! 🎯