# 📋 Solicitudes de Traducción

Aplicación web para gestionar solicitudes de traducción con cálculo automático de precios, subida de archivos y procesamiento de pagos.

## 🚀 Características

- **Formulario Intuitivo** - Interfaz moderna y fácil de usar
- **Cálculo Automático** - Precios en tiempo real según tipo de documento
- **Recargo por Urgencia** - +50% para procesamiento urgente
- **Subida de Archivos** - Soporte para múltiples formatos
- **Integración Supabase** - Base de datos y almacenamiento
- **Webhook n8n** - Procesamiento automático y generación de pagos
- **Responsive Design** - Optimizado para móviles y desktop

## 💰 Precios por Tipo de Documento

| Tipo de Documento | Precio por Hoja |
|-------------------|-----------------|
| 📜 Certificados | $20 |
| 🎓 Documentos Académicos | $25 |
| ⚖️ Documentos Legales | $30 |
| 💼 Documentos Comerciales | $30 |
| 📋 Contratos | $33 |
| 🏥 Documentos Médicos | $35 |
| 🔧 Documentos Técnicos | $35 |
| 📖 Manuales | $40 |

### Tiempo de Procesamiento
- **Normal**: 8-12 horas
- **Urgente**: 1-2 horas (+50% recargo)

## 🛠️ Tecnologías

- **Frontend**: React + TypeScript + Vite
- **Estilos**: TailwindCSS con animaciones custom
- **Base de Datos**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Iconos**: Lucide React
- **Deployment**: Docker + Nginx

## 📦 Instalación Local

```bash
# Clonar repositorio
git clone [repo-url]
cd solicitudes-traduccion

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase

# Ejecutar en desarrollo
npm run dev
```

## 🔧 Variables de Entorno

```bash
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_publica_supabase
```

## 🚀 Deployment

### Opción 1: Dokploy (Recomendado)
Ver [DEPLOY_DOKPLOY.md](./DEPLOY_DOKPLOY.md) para instrucciones detalladas.

**✅ SSL Automático**: Cloudflare maneja todo el SSL/TLS automáticamente. No configurar certificados en Dokploy.

### Opción 2: Docker
```bash
# Build imagen
docker build -t solicitudes-traduccion .

# Ejecutar contenedor
docker run -p 80:80 \
  -e VITE_SUPABASE_URL=tu_url \
  -e VITE_SUPABASE_ANON_KEY=tu_key \
  solicitudes-traduccion
```

## 📋 Configuración de Supabase

### 1. Crear Tabla
```sql
CREATE TABLE solicitudes_traduccion (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre text NOT NULL,
  telefono text NOT NULL,
  correo text NOT NULL,
  idioma_origen text NOT NULL,
  idioma_destino text NOT NULL,
  tiempo_procesamiento text NOT NULL,
  formato_deseado text[],
  numero_hojas integer NOT NULL,
  tipo_documento text NOT NULL,
  instrucciones text,
  fecha_solicitud date NOT NULL,
  archivos_urls text[],
  creado_en timestamp with time zone DEFAULT now()
);
```

### 2. Crear Storage Bucket
```sql
-- Crear bucket para archivos (público para permitir acceso anónimo)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'solicitudes-traduccion-files', 
  'solicitudes-traduccion-files', 
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
);

-- Política de storage para permitir upload anónimo
CREATE POLICY "Allow anonymous uploads"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (bucket_id = 'solicitudes-traduccion-files');

-- Política de storage para permitir lectura pública
CREATE POLICY "Allow public read"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'solicitudes-traduccion-files');
```

### 3. Configurar Políticas RLS
```sql
-- Habilitar RLS
ALTER TABLE solicitudes_traduccion ENABLE ROW LEVEL SECURITY;

-- Política para insertar solicitudes
CREATE POLICY "Permitir insertar solicitudes"
ON solicitudes_traduccion
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
```

## 🔗 Integración n8n

El formulario envía datos a un webhook de n8n que:
1. Procesa la información del formulario
2. Calcula el total con recargos
3. Genera enlace de pago
4. Envía confirmaciones por email

**Webhook URL**: `https://app.n8n-tech.cloud/webhook/b1a77e5e-14a9-4a7b-a01c-6d12354c5e3d`

## 🎨 Características de Diseño

- **Gradientes Animados** - Fondos y elementos dinámicos
- **Microinteracciones** - Hover states y transiciones
- **Loading States** - Indicadores de progreso
- **Responsive** - Optimizado para todos los dispositivos
- **Dark Theme** - Esquema de colores profesional

## 🔍 Estructura del Proyecto

```
src/
├── App.tsx              # Componente principal
├── lib/
│   └── supabase.ts      # Cliente Supabase
├── index.css            # Estilos globales y animaciones
└── main.tsx            # Punto de entrada
```

## 📱 Formatos de Archivo Soportados

- **Documentos**: PDF, DOC, DOCX, TXT
- **Presentaciones**: PPT, PPTX
- **Hojas de Cálculo**: XLS, XLSX
- **Imágenes**: JPG, JPEG, PNG, GIF, SVG, WebP

## 🆘 Soporte y Contacto

Para soporte técnico o consultas sobre la aplicación, contacta al equipo de desarrollo.

---

⚡ **Procesamiento rápido y profesional de traducciones** ⚡