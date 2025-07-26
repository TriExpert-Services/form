# 🚀 Guía de Deployment en Dokploy

Esta guía te ayudará a desplegar la aplicación de **Solicitudes de Traducción** en Dokploy de manera fácil y rápida.

## 📋 Prerrequisitos

- [ ] Acceso a un servidor con Dokploy instalado
- [ ] Repositorio Git con el código fuente
- [ ] Configuración de Supabase (URL y API Key)

## 🔧 Configuración Previa

### 1. ⚠️ **CRÍTICO - Variables de Entorno**

**🚨 IMPORTANTE:** Debes configurar estas variables EN DOKPLOY **ANTES** del deploy:

```bash
# Variables requeridas (reemplaza con tus valores reales):
NODE_ENV=production
VITE_SUPABASE_URL=https://abcdefg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

**🔍 Cómo verificar que funcionó:**
En los logs de build debes ver:
```
🔍 VARIABLES DE ENTORNO DURANTE BUILD:
VITE_SUPABASE_URL: https://abcdefg.supabase.co  ← ✅ DEBE TENER VALOR
VITE_SUPABASE_ANON_KEY length: 234              ← ✅ DEBE SER > 100
```

**❌ Si ves esto en los logs = PROBLEMA:**
```
VITE_SUPABASE_URL:                               ← ❌ VACÍO
VITE_SUPABASE_ANON_KEY length: 1                ← ❌ MUY CORTO
```

### 2. Configuración de Supabase

Asegúrate de tener:
- ✅ Base de datos configurada con la tabla `solicitudes_traduccion`
- ✅ Storage bucket `solicitudes-traduccion-files` creado
- ✅ Políticas RLS configuradas correctamente

## 🚀 Pasos de Deployment

### Paso 1: Crear Nueva Aplicación

1. **Accede a tu panel de Dokploy**
2. **Haz clic en "New Application"**
3. **Selecciona "Docker"** como tipo de aplicación

### Paso 2: Configurar Repositorio

1. **Conecta tu repositorio Git:**
   ```
   Repository URL: [tu-repo-git-url]
   Branch: main
   ```

2. **Configurar Build:**
   ```
   Build Path: ./
   Dockerfile: Dockerfile
   ```

### Paso 3: ⚠️ **CRÍTICO - Configurar Variables ANTES del Deploy**

**🚨 IMPORTANTE:** Las variables deben configurarse **ANTES** de hacer build/deploy.

1. **Ve a tu aplicación en Dokploy**
2. **Haz clic en "Environment"**
3. **Agrega EXACTAMENTE estas variables:**
   ```
   Nombre: NODE_ENV
   Valor: production
   
   Nombre: VITE_SUPABASE_URL  
   Valor: https://tu-proyecto-real.supabase.co
   
   Nombre: VITE_SUPABASE_ANON_KEY
   Valor: tu_clave_completa_real_aqui
   ```

4. **Configurar Puerto:**
   ```
   Port: 80
   ```

### Paso 4: Deploy y Verificar

1. **Haz clic en "Deploy"**
2. **⚠️ MONITOREA LOS LOGS** durante el build
3. **Busca esta sección en los logs:**
   ```
   🔍 VARIABLES DE ENTORNO DURANTE BUILD:
   VITE_SUPABASE_URL: https://abcdefg.supabase.co  ← ✅ DEBE APARECER TU URL
   VITE_SUPABASE_ANON_KEY length: 234              ← ✅ DEBE SER > 100
   NODE_ENV: production                             ← ✅ DEBE SER production
   ```

4. **Si las variables aparecen vacías:**
   - ❌ **Para el deploy**
   - 🔧 **Configura las variables**
   - 🔄 **Redeploy**

### Paso 5: Verificar en Browser

1. **Abre la aplicación**
2. **F12 > Console**
3. **Busca:**
   ```
   [ENV CHECK] { SUPABASE_URL: "https://..." }  ← ✅ DEBE TENER VALOR
   ```
4. **Si ves `undefined`:**
   - Variables mal configuradas
   - Redeploy necesario

## 🚨 **Troubleshooting Pantalla en Blanco**

### **Si ves pantalla en blanco:**
**🚨 Si no se configuran las variables ANTES del build, tendrás pantalla en blanco.**
1. **Verifica las variables en el build log:**
   ```
   Building with VITE_SUPABASE_URL: undefined  ← ❌ MAL
   Building with VITE_SUPABASE_URL: https://... ← ✅ BIEN
   ```

2. **En el browser, abre DevTools > Console:**
   ```
   [ENV CHECK] { SUPABASE_URL: undefined }     ← ❌ MAL
   [ENV CHECK] { SUPABASE_URL: "https://..." } ← ✅ BIEN
   ```
**Debug si hay problemas:**
3. **Si las variables están undefined:**
   - Configura las variables en Dokploy
   - **Redeploy** completamente (no solo restart)
1. Ver logs del build en Dokploy
### **Script de Debug Local:**
```bash
# Descargar y usar script de debug
chmod +x docker-debug.sh
export VITE_SUPABASE_URL="tu_url"
export VITE_SUPABASE_ANON_KEY="tu_key"
./docker-debug.sh
```
3. Usar [DEBUG_DOCKER.md](./DEBUG_DOCKER.md) para troubleshooting
   ```
### Paso 6: Configurar Dominio (Opcional)
   ```

2. **Verificar Build Args (automático):**
   - ✅ **Cloudflare maneja todo el SSL** automáticamente

### Paso 5: Deploy

1. **Haz clic en "Deploy"**
2. **Espera a que la build termine** (aproximadamente 3-5 minutos)
3. **Verifica que el estado sea "Running"**

## 📁 Estructura de Archivos Importante

```
├── Dockerfile              # Configuración Docker
├── dokploy.json            # Configuración Dokploy
├── nginx.conf              # Configuración Nginx
├── package.json            # Dependencias Node.js
└── src/
    ├── App.tsx             # Aplicación principal
    └── lib/supabase.ts     # Cliente Supabase
```

## ☁️ Configuración Cloudflare

### SSL/TLS Settings (Recomendado)
```
SSL/TLS Mode: Full (strict)
Edge Certificates: Enabled
Always Use HTTPS: Enabled
```

### Proxy Settings
```
Proxy Status: Proxied (orange cloud)
Auto Minify: JavaScript, CSS, HTML
Brotli Compression: Enabled
```

**⚠️ Importante:** Dokploy NO necesita configurar SSL ya que Cloudflare maneja todo el cifrado entre el cliente y el servidor.
## 🐳 Dockerfile Explicación

```dockerfile
# Build stage - Construye la aplicación
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage - Sirve con Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## ⚙️ Configuración Nginx

- **Puerto:** 80
- **Rutas SPA:** Configuradas para React Router
- **Cache:** Recursos estáticos optimizados
- **Gzip:** Compresión habilitada
- **Headers de seguridad:** Incluidos

## 🔍 Verificación Post-Deployment

### 1. Verificar Aplicación
- [ ] ✅ La aplicación carga correctamente
- [ ] ✅ Formulario se muestra sin errores
- [ ] ✅ Estilos CSS aplicados correctamente

### 2. Verificar Funcionalidad
- [ ] ✅ Formulario se puede llenar
- [ ] ✅ Upload de archivos funciona
- [ ] ✅ Calculadora de precios funciona
- [ ] ✅ Envío a Supabase exitoso
- [ ] ✅ Webhook a n8n funciona

### 3. Verificar Supabase
- [ ] ✅ Conexión a base de datos
- [ ] ✅ Subida de archivos al storage
- [ ] ✅ Inserción de registros

## 🛠️ Troubleshooting

### Error: "Unable to connect to Supabase"
```bash
# Verificar variables de entorno
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

### Error: "Build failed"
```bash
# Verificar que package.json tenga todas las dependencias
npm install
npm run build
```

### Error: "Port already in use"
```bash
# Cambiar puerto en dokploy.json si es necesario
"port": 8080
```

## 📊 Monitoreo

### Logs de la Aplicación
1. Ve a tu aplicación en Dokploy
2. Haz clic en "Logs"
3. Revisa logs en tiempo real

### Métricas
- **CPU Usage**
- **Memory Usage**
- **Network Traffic**
- **Response Times**

## 🔄 Updates y Redeploy

### Auto-deploy desde Git
1. **Push cambios a la branch main**
2. **Dokploy detectará cambios automáticamente**
3. **Build y deploy automático**

### Manual Redeploy
1. **Ve a tu aplicación en Dokploy**
2. **Haz clic en "Redeploy"**
3. **Espera confirmación**

## 🆘 Soporte

Si encuentras problemas durante el deployment:

1. **Revisa los logs** en tiempo real en Dokploy
2. **Verifica variables de entorno** están correctas
3. **Confirma que Supabase** está configurado
4. **Verifica la conectividad** del webhook n8n

---

## ✅ Checklist Final

- [ ] Aplicación desplegada exitosamente
- [ ] Variables de entorno configuradas
- [ ] Supabase conectado y funcionando
- [ ] Formulario funciona end-to-end
- [ ] Webhook n8n responde correctamente
- [ ] Cloudflare proxy configurado
- [ ] SSL/TLS automático funcionando (vía Cloudflare)
- [ ] Dominio personalizado configurado (si aplica)

¡Tu aplicación de Solicitudes de Traducción está lista para producción! 🎉