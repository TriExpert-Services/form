import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      solicitudes_traduccion: {
        Row: {
          id: string
          nombre: string
          telefono: string
          correo: string
          idioma_origen: string
          idioma_destino: string
          tiempo_procesamiento: string
          formato_deseado: string
          instrucciones: string | null
          fecha_solicitud: string
          archivos_urls: string[] | null
          creado_en: string
        }
        Insert: {
          id?: string
          nombre: string
          telefono: string
          correo: string
          idioma_origen: string
          idioma_destino: string
          tiempo_procesamiento: string
          formato_deseado: string
          instrucciones?: string | null
          fecha_solicitud: string
          archivos_urls?: string[] | null
          creado_en?: string
        }
        Update: {
          id?: string
          nombre?: string
          telefono?: string
          correo?: string
          idioma_origen?: string
          idioma_destino?: string
          tiempo_procesamiento?: string
          formato_deseado?: string
          instrucciones?: string | null
          fecha_solicitud?: string
          archivos_urls?: string[] | null
          creado_en?: string
        }
      }
    }
  }
}