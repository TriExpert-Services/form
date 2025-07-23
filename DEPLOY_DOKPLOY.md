# 🚀 Guía de Deployment en Dokploy

Esta guía te ayudará a desplegar la aplicación de **Solicitudes de Traducción** en Dokploy de manera fácil y rápida.

## 📋 Prerrequisitos

- [ ] Acceso a un servidor con Dokploy instalado
- [ ] Repositorio Git con el código fuente
- [ ] Configuración de Supabase (URL y API Key)

## 🔧 Configuración Previa

### 1. Variables de Entorno Requeridas

En Dokploy, configura estas variables de entorno:

```bash
NODE_ENV=production
VITE_SUPABASE_URL=tu_supabase_url_aqui
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key_aqui
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

### Paso 3: Configuración de la Aplicación

1. **Configurar Puerto:**
   ```
   Port: 80
   ```

2. **Agregar Variables de Entorno:**
   ```
   NODE_ENV=production
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu_clave_publica_supabase
   ```

### Paso 4: Configurar Dominio (Opcional)

1. **En la sección "Domains":**
   ```
   Domain: tu-dominio.com
   ```

2. **No configurar SSL** (Cloudflare maneja el SSL)

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
- [ ] Dominio personalizado configurado (si aplica)

¡Tu aplicación de Solicitudes de Traducción está lista para producción! 🎉