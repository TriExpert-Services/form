import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://supabase.n8n-tech.cloud'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE'

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase configuration:', { supabaseUrl, supabaseAnonKey: supabaseAnonKey ? 'Present' : 'Missing' })
  throw new Error(`Missing Supabase environment variables. URL: ${supabaseUrl ? 'Present' : 'Missing'}, Key: ${supabaseAnonKey ? 'Present' : 'Missing'}`)
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
          formato_deseado: string[]
          numero_hojas: number
          tipo_documento: string
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
          formato_deseado: string[]
          numero_hojas: number
          tipo_documento: string
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
          formato_deseado?: string[]
          numero_hojas?: number
          tipo_documento?: string
          instrucciones?: string | null
          fecha_solicitud?: string
          archivos_urls?: string[] | null
          creado_en?: string
        }
      }
    }
  }
}