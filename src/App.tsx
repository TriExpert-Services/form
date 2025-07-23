import React, { useState } from 'react';
import { Send, Upload, Calendar, Globe, Phone, Mail, Clock, FileText, MessageSquare, User, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from './lib/supabase';

interface FormData {
  nombre: string;
  telefono: string;
  correo: string;
  idioma_origen: string;
  idioma_destino: string;
  tiempo_procesamiento: string;
  formato_deseado: string;
  numero_hojas: string;
  tipo_documento: string;
  instrucciones: string;
  archivos: File[];
  fecha_solicitud: string;
}

function App() {
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    telefono: '',
    correo: '',
    idioma_origen: '',
    idioma_destino: '',
    tiempo_procesamiento: '',
    formato_deseado: '',
    numero_hojas: '',
    tipo_documento: '',
    instrucciones: '',
    archivos: [],
    fecha_solicitud: new Date().toISOString().split('T')[0]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [submitMessage, setSubmitMessage] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const idiomas = [
    { value: 'es', label: 'Español', flag: '🇪🇸' },
    { value: 'en', label: 'Inglés', flag: '🇺🇸' },
    { value: 'fr', label: 'Francés', flag: '🇫🇷' },
    { value: 'de', label: 'Alemán', flag: '🇩🇪' },
    { value: 'it', label: 'Italiano', flag: '🇮🇹' },
    { value: 'pt', label: 'Portugués', flag: '🇧🇷' },
    { value: 'zh', label: 'Chino Mandarín', flag: '🇨🇳' },
    { value: 'ja', label: 'Japonés', flag: '🇯🇵' },
    { value: 'ko', label: 'Coreano', flag: '🇰🇷' },
    { value: 'ar', label: 'Árabe', flag: '🇸🇦' },
    { value: 'ru', label: 'Ruso', flag: '🇷🇺' },
    { value: 'hi', label: 'Hindi', flag: '🇮🇳' }
  ];

  const tiemposProcesamiento = [
    { value: 'normal', label: 'Normal (8 a 12 horas)', icon: '⏰', color: 'text-green-400' },
    { value: 'urgente', label: 'Urgente (1 a 2 horas + 50%)', icon: '🚀', color: 'text-orange-400' }
  ];

  const formatosDeseados = [
    { value: 'digital', label: 'Digital', icon: '💻' },
    { value: 'fisico-envio', label: 'Físico + Envío', icon: '📦' },
    { value: 'fisico-retiro', label: 'Físico + Retiro Personal', icon: '🏪' }
  ];

  const tiposDocumento = [
    { value: 'legal', label: 'Documentos Legales', icon: '⚖️', precio: 30 },
    { value: 'academico', label: 'Documentos Académicos', icon: '🎓', precio: 25 },
    { value: 'medico', label: 'Documentos Médicos', icon: '🏥', precio: 35 },
    { value: 'tecnico', label: 'Documentos Técnicos', icon: '🔧', precio: 35 },
    { value: 'comercial', label: 'Documentos Comerciales', icon: '💼', precio: 30 },
    { value: 'certificados', label: 'Certificados', icon: '📜', precio: 20 },
    { value: 'contratos', label: 'Contratos', icon: '📋', precio: 33 },
    { value: 'manuales', label: 'Manuales', icon: '📖', precio: 40 },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        archivos: Array.from(e.target.files || [])
      }));
    }
  };

  // Función para calcular el total
  const calcularTotal = () => {
    const numeroHojas = parseInt(formData.numero_hojas) || 0;
    const tipoSeleccionado = tiposDocumento.find(tipo => tipo.value === formData.tipo_documento);
    if (tipoSeleccionado && numeroHojas > 0) {
      const subtotal = numeroHojas * tipoSeleccionado.precio;
      const esUrgente = formData.tiempo_procesamiento === 'urgente';
      return esUrgente ? Math.round(subtotal * 1.5) : subtotal;
    }
    return 0;
  };

  const total = calcularTotal();
  const esUrgente = formData.tiempo_procesamiento === 'urgente';
  const subtotal = total / (esUrgente ? 1.5 : 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    setSubmitMessage('');

    try {
      // Verificar que los campos requeridos estén completos
      const requiredFields = ['nombre', 'telefono', 'correo', 'idioma_origen', 'idioma_destino', 'tiempo_procesamiento', 'formato_deseado', 'numero_hojas', 'tipo_documento'];
      const missingFields = requiredFields.filter(field => !formData[field as keyof FormData]);
      
      if (missingFields.length > 0) {
        throw new Error(`Campos requeridos faltantes: ${missingFields.join(', ')}`);
      }

      // Subir archivos a Supabase Storage y obtener URLs públicas
      const archivosUrls: string[] = [];
      
      for (let i = 0; i < formData.archivos.length; i++) {
        const archivo = formData.archivos[i];
        const fileName = `${Date.now()}-${i}-${archivo.name}`;
        
        // Subir archivo a Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('solicitudes-traduccion-files')
          .upload(fileName, archivo);
          
        if (uploadError) {
          console.error('Error subiendo archivo:', uploadError);
          throw new Error(`Error subiendo archivo ${archivo.name}: ${uploadError.message}`);
        }
        
        // Obtener URL pública
        const { data: urlData } = supabase.storage
          .from('solicitudes-traduccion-files')
          .getPublicUrl(fileName);
          
        if (urlData?.publicUrl) {
          archivosUrls.push(urlData.publicUrl);
        }
      }
      
      // Preparar datos para Supabase
      const solicitudData = {
        nombre: formData.nombre,
        telefono: formData.telefono,
        correo: formData.correo,
        idioma_origen: formData.idioma_origen,
        idioma_destino: formData.idioma_destino,
        tiempo_procesamiento: formData.tiempo_procesamiento,
        formato_deseado: [formData.formato_deseado],
        numero_hojas: parseInt(formData.numero_hojas),
        tipo_documento: formData.tipo_documento,
        instrucciones: formData.instrucciones || null,
        fecha_solicitud: formData.fecha_solicitud,
        archivos_urls: archivosUrls.length > 0 ? archivosUrls : null
      };

      console.log('Guardando en Supabase:', solicitudData);
      
      // Guardar en Supabase
      const { data: supabaseData, error: supabaseError } = await supabase
        .from('solicitudes_traduccion')
        .insert(solicitudData)
        .select()
        .single();

      if (supabaseError) {
        console.error('Error de Supabase:', supabaseError);
        throw new Error(`Error al guardar en base de datos: ${supabaseError.message}`);
      }

      console.log('Guardado exitosamente en Supabase:', supabaseData);
      
      // Crear FormData para enviar archivos binarios
      const formDataToSend = new FormData();
      
      // Agregar campos del formulario
      formDataToSend.append('nombre', formData.nombre);
      formDataToSend.append('telefono', formData.telefono);
      formDataToSend.append('correo', formData.correo);
      formDataToSend.append('idioma_origen', formData.idioma_origen);
      formDataToSend.append('idioma_destino', formData.idioma_destino);
      formDataToSend.append('tiempo_procesamiento', formData.tiempo_procesamiento);
      formDataToSend.append('formato_deseado', formData.formato_deseado);
      formDataToSend.append('numero_hojas', formData.numero_hojas);
      formDataToSend.append('tipo_documento', formData.tipo_documento);
      formDataToSend.append('instrucciones', formData.instrucciones);
      formDataToSend.append('fecha_solicitud', formData.fecha_solicitud);
      
      // Agregar el ID de Supabase para referencia
      formDataToSend.append('supabase_id', supabaseData.id);
      
      // Agregar archivos como binary data
      formData.archivos.forEach((file, index) => {
        formDataToSend.append(`archivo_${index}`, file, file.name);
      });
      
      formDataToSend.append('cantidad_archivos', formData.archivos.length.toString());

      console.log('FormData creado, enviando a n8n...');

      // Use direct URL in production, proxy URL in development
      const apiUrl = import.meta.env.PROD 
        ? 'https://app.n8n-tech.cloud/webhook-test/b1a77e5e-14a9-4a7b-a01c-6d12354c5e3d'
        : '/api/webhook-test/b1a77e5e-14a9-4a7b-a01c-6d12354c5e3d';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Authorization': `Basic ${btoa('Triexpert:20391793_Junio')}`,
          'Accept': 'application/json',
          'Origin': window.location.origin
        },
        body: formDataToSend
      });

      console.log('Respuesta de n8n recibida:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`Error en el servidor: ${response.status} ${response.statusText}`);
      }

      // Verificar si la respuesta contiene JSON antes de parsear
      let responseData = {};
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        try {
          responseData = await response.json();
        } catch (jsonError) {
          console.warn('Error parsing JSON response:', jsonError);
          responseData = {};
        }
      } else {
        console.log('Response is not JSON, treating as successful without payment link');
      }
      
      console.log('Respuesta de n8n:', responseData);

      // Verificar si hay un link de pago en la respuesta
      if (responseData.payment_link || responseData.paymentLink || responseData.link) {
        const paymentLink = responseData.payment_link || responseData.paymentLink || responseData.link;
        
        console.log('Link de pago recibido:', paymentLink);
        
        setSubmitStatus('success');
        setSubmitMessage('¡Solicitud procesada exitosamente! Redirigiendo al pago...');
        
        // Esperar un momento para que el usuario vea el mensaje y luego redirigir
        setTimeout(() => {
          window.location.href = paymentLink;
        }, 2000);
        
      } else {
        // Si no hay link de pago, mostrar mensaje de éxito normal
        setSubmitStatus('success');
        setSubmitMessage('¡Solicitud guardada y enviada exitosamente! Te contactaremos pronto.');
      }
      
      // Limpiar formulario después del éxito
      setTimeout(() => {
        setFormData({
          nombre: '',
          telefono: '',
          correo: '',
          idioma_origen: '',
          idioma_destino: '',
          tiempo_procesamiento: '',
          formato_deseado: '',
          numero_hojas: '',
          tipo_documento: '',
          instrucciones: '',
          archivos: [],
          fecha_solicitud: new Date().toISOString().split('T')[0]
        });
        
        // Limpiar input de archivos
        const fileInput = document.getElementById('archivos') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      }, 3000); // Limpiar después de 3 segundos
    } catch (error) {
      console.error('Error detallado:', error);
      setSubmitStatus('error');
      
      if (error instanceof Error) {
        setSubmitMessage(`Error: ${error.message}`);
      } else {
        setSubmitMessage('Error desconocido al enviar la solicitud. Por favor, inténtalo de nuevo.');
      }
      
      // Si es un error de red, mostrar mensaje específico
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setSubmitMessage('Error de conexión. Verifica tu conexión a internet e inténtalo de nuevo.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-8 px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="flex justify-center mb-5">
            <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-5 rounded-full shadow-2xl transform hover:scale-110 transition-transform duration-500 animate-bounce-slow">
              <Globe className="w-10 h-10 text-white drop-shadow-lg" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text mb-5 drop-shadow-lg animate-gradient">
            Solicitud de Traducción
          </h1>
          <p className="text-xl text-gray-300 font-light animate-fade-in-up delay-300">
            Completa el formulario para recibir una cotización personalizada
          </p>
          <div className="flex justify-center mt-5">
            <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-gradient-to-br from-gray-800/90 via-gray-900/90 to-black/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-700/50 hover:border-purple-500/30 transition-all duration-700 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Información Personal */}
            <div className="border-b border-gray-700/50 pb-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center group">
                <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-2.5 rounded-xl mr-3 group-hover:scale-110 transition-transform duration-300">
                  <User className="w-6 h-6 text-white" />
                </div>
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Información Personal
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label htmlFor="nombre" className="block text-sm font-semibold text-gray-300 mb-2 group-hover:text-white transition-colors duration-300">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('nombre')}
                    onBlur={() => setFocusedField(null)}
                    required
                    className={`w-full px-5 py-3 bg-gray-700/50 border-2 border-gray-600/50 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-300 text-white placeholder-gray-400 hover:bg-gray-700/70 backdrop-blur-sm ${
                      focusedField === 'nombre' ? 'shadow-lg shadow-purple-500/20 transform scale-105' : ''
                    }`}
                    placeholder="Ingresa tu nombre completo"
                  />
                </div>

                <div className="group">
                  <label htmlFor="telefono" className="block text-sm font-semibold text-gray-300 mb-2 group-hover:text-white transition-colors duration-300 flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-green-400" />
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('telefono')}
                    onBlur={() => setFocusedField(null)}
                    required
                    className={`w-full px-5 py-3 bg-gray-700/50 border-2 border-gray-600/50 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-300 text-white placeholder-gray-400 hover:bg-gray-700/70 backdrop-blur-sm ${
                      focusedField === 'telefono' ? 'shadow-lg shadow-purple-500/20 transform scale-105' : ''
                    }`}
                    placeholder="+1 234 567 8900"
                  />
                </div>

                <div className="md:col-span-2 group">
                  <label htmlFor="correo" className="block text-sm font-semibold text-gray-300 mb-2 group-hover:text-white transition-colors duration-300 flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-blue-400" />
                    Correo electrónico *
                  </label>
                  <input
                    type="email"
                    id="correo"
                    name="correo"
                    value={formData.correo}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('correo')}
                    onBlur={() => setFocusedField(null)}
                    required
                    className={`w-full px-5 py-3 bg-gray-700/50 border-2 border-gray-600/50 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-300 text-white placeholder-gray-400 hover:bg-gray-700/70 backdrop-blur-sm ${
                      focusedField === 'correo' ? 'shadow-lg shadow-purple-500/20 transform scale-105' : ''
                    }`}
                    placeholder="tu@email.com"
                  />
                </div>
              </div>
            </div>

            {/* Detalles de Traducción */}
            <div className="border-b border-gray-700/50 pb-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center group">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-2.5 rounded-xl mr-3 group-hover:scale-110 transition-transform duration-300">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  Detalles de Traducción
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label htmlFor="idioma_origen" className="block text-sm font-semibold text-gray-300 mb-2 group-hover:text-white transition-colors duration-300">
                    Idioma de origen *
                  </label>
                  <select
                    id="idioma_origen"
                    name="idioma_origen"
                    value={formData.idioma_origen}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('idioma_origen')}
                    onBlur={() => setFocusedField(null)}
                    required
                    className={`w-full px-5 py-3 bg-gray-700/50 border-2 border-gray-600/50 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-300 text-white hover:bg-gray-700/70 backdrop-blur-sm ${
                      focusedField === 'idioma_origen' ? 'shadow-lg shadow-purple-500/20 transform scale-105' : ''
                    }`}
                  >
                    <option value="" className="bg-gray-800">Selecciona el idioma</option>
                    {idiomas.map(idioma => (
                      <option key={idioma.value} value={idioma.value} className="bg-gray-800">
                        {idioma.flag} {idioma.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="group">
                  <label htmlFor="idioma_destino" className="block text-sm font-semibold text-gray-300 mb-2 group-hover:text-white transition-colors duration-300">
                    Idioma de destino *
                  </label>
                  <select
                    id="idioma_destino"
                    name="idioma_destino"
                    value={formData.idioma_destino}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('idioma_destino')}
                    onBlur={() => setFocusedField(null)}
                    required
                    className={`w-full px-5 py-3 bg-gray-700/50 border-2 border-gray-600/50 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-300 text-white hover:bg-gray-700/70 backdrop-blur-sm ${
                      focusedField === 'idioma_destino' ? 'shadow-lg shadow-purple-500/20 transform scale-105' : ''
                    }`}
                  >
                    <option value="" className="bg-gray-800">Selecciona el idioma</option>
                    {idiomas.map(idioma => (
                      <option key={idioma.value} value={idioma.value} className="bg-gray-800">
                        {idioma.flag} {idioma.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="group">
                  <label htmlFor="tiempo_procesamiento" className="block text-sm font-semibold text-gray-300 mb-2 group-hover:text-white transition-colors duration-300 flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-orange-400" />
                    Tiempo de procesamiento *
                  </label>
                  <select
                    id="tiempo_procesamiento"
                    name="tiempo_procesamiento"
                    value={formData.tiempo_procesamiento}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('tiempo_procesamiento')}
                    onBlur={() => setFocusedField(null)}
                    required
                    className={`w-full px-5 py-3 bg-gray-700/50 border-2 border-gray-600/50 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-300 text-white hover:bg-gray-700/70 backdrop-blur-sm ${
                      focusedField === 'tiempo_procesamiento' ? 'shadow-lg shadow-purple-500/20 transform scale-105' : ''
                    }`}
                  >
                    <option value="" className="bg-gray-800">Selecciona el tiempo</option>
                    {tiemposProcesamiento.map(tiempo => (
                      <option key={tiempo.value} value={tiempo.value} className="bg-gray-800">
                        {tiempo.icon} {tiempo.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="group">
                  <label htmlFor="formato_deseado" className="block text-sm font-semibold text-gray-300 mb-2 group-hover:text-white transition-colors duration-300 flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-cyan-400" />
                    Formato deseado *
                  </label>
                  <select
                    id="formato_deseado"
                    name="formato_deseado"
                    value={formData.formato_deseado}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('formato_deseado')}
                    onBlur={() => setFocusedField(null)}
                    required
                    className={`w-full px-5 py-3 bg-gray-700/50 border-2 border-gray-600/50 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-300 text-white hover:bg-gray-700/70 backdrop-blur-sm ${
                      focusedField === 'formato_deseado' ? 'shadow-lg shadow-purple-500/20 transform scale-105' : ''
                    }`}
                  >
                    <option value="" className="bg-gray-800">Selecciona el formato</option>
                    {formatosDeseados.map(formato => (
                      <option key={formato.value} value={formato.value} className="bg-gray-800">
                        {formato.icon} {formato.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="group">
                  <label htmlFor="numero_hojas" className="block text-sm font-semibold text-gray-300 mb-2 group-hover:text-white transition-colors duration-300 flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-purple-400" />
                    Número de hojas *
                  </label>
                  <input
                    type="number"
                    id="numero_hojas"
                    name="numero_hojas"
                    value={formData.numero_hojas}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('numero_hojas')}
                    onBlur={() => setFocusedField(null)}
                    required
                    min="1"
                    className={`w-full px-5 py-3 bg-gray-700/50 border-2 border-gray-600/50 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-300 text-white placeholder-gray-400 hover:bg-gray-700/70 backdrop-blur-sm ${
                      focusedField === 'numero_hojas' ? 'shadow-lg shadow-purple-500/20 transform scale-105' : ''
                    }`}
                    placeholder="Ejemplo: 5"
                  />
                </div>

                <div className="group">
                  <label htmlFor="tipo_documento" className="block text-sm font-semibold text-gray-300 mb-2 group-hover:text-white transition-colors duration-300 flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-pink-400" />
                    Tipo de documento *
                  </label>
                  <select
                    id="tipo_documento"
                    name="tipo_documento"
                    value={formData.tipo_documento}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('tipo_documento')}
                    onBlur={() => setFocusedField(null)}
                    required
                    className={`w-full px-5 py-3 bg-gray-700/50 border-2 border-gray-600/50 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-300 text-white hover:bg-gray-700/70 backdrop-blur-sm ${
                      focusedField === 'tipo_documento' ? 'shadow-lg shadow-purple-500/20 transform scale-105' : ''
                    }`}
                  >
                    <option value="" className="bg-gray-800">Selecciona el tipo</option>
                    {tiposDocumento.map(tipo => (
                      <option key={tipo.value} value={tipo.value} className="bg-gray-800">
                        {tipo.icon} {tipo.label} - ${tipo.precio}/hoja
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mostrar total calculado */}
                {total > 0 && (
                  <div className="md:col-span-2 animate-fade-in">
                    <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-2 border-emerald-500/30 rounded-xl p-5 backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-2.5 rounded-xl mr-3">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-emerald-400 mb-1">Total Estimado</h3>
                            <p className="text-gray-300 text-sm">
                              {formData.numero_hojas} hojas × ${tiposDocumento.find(t => t.value === formData.tipo_documento)?.precio || 0}/hoja = ${Math.round(subtotal)}
                            </p>
                            {esUrgente && (
                              <p className="text-orange-300 text-sm font-medium">
                                🚀 Recargo urgente (+50%): +${Math.round(subtotal * 0.5)}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text">
                            ${total}
                          </div>
                          <p className="text-gray-400 text-sm">USD</p>
                          {esUrgente && (
                            <p className="text-orange-400 text-xs font-medium">
                              ⚡ Urgente
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="md:col-span-2 group">
                  <label htmlFor="fecha_solicitud" className="block text-sm font-semibold text-gray-300 mb-2 group-hover:text-white transition-colors duration-300 flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-indigo-400" />
                    Fecha de solicitud
                  </label>
                  <input
                    type="date"
                    id="fecha_solicitud"
                    name="fecha_solicitud"
                    value={formData.fecha_solicitud}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('fecha_solicitud')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full px-5 py-3 bg-gray-700/50 border-2 border-gray-600/50 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-300 text-white hover:bg-gray-700/70 backdrop-blur-sm ${
                      focusedField === 'fecha_solicitud' ? 'shadow-lg shadow-purple-500/20 transform scale-105' : ''
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Archivos e Instrucciones */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center group">
                <div className="bg-gradient-to-br from-orange-500 to-red-500 p-2.5 rounded-xl mr-3 group-hover:scale-110 transition-transform duration-300">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                  Archivos e Instrucciones
                </span>
              </h2>
              <div className="space-y-6">
                <div className="group">
                  <label htmlFor="archivos" className="block text-sm font-semibold text-gray-300 mb-3 group-hover:text-white transition-colors duration-300">
                    Archivos a traducir
                  </label>
                  <div className="border-2 border-dashed border-gray-600/50 rounded-2xl p-6 hover:border-purple-400/70 transition-all duration-500 bg-gray-700/20 hover:bg-gray-700/30 group">
                    <input
                      type="file"
                      id="archivos"
                      name="archivos"
                      multiple
                      onChange={handleFileChange}
                      className="w-full text-gray-300 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-gradient-to-r file:from-purple-500 file:to-pink-500 file:text-white hover:file:from-purple-600 hover:file:to-pink-600 file:transition-all file:duration-300 file:cursor-pointer file:shadow-lg"
                      accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.svg,.webp"
                    />
                    <p className="text-sm text-gray-400 mt-3 group-hover:text-gray-300 transition-colors duration-300">
                      📎 Formatos aceptados: PDF, Word, PowerPoint, Excel, TXT, JPG, PNG, GIF, SVG, WebP
                    </p>
                    {formData.archivos.length > 0 && (
                      <div className="mt-4 animate-fade-in">
                        <p className="text-sm font-semibold text-gray-200 mb-2 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                          Archivos seleccionados:
                        </p>
                        <ul className="space-y-1.5">
                          {formData.archivos.map((file, index) => (
                            <li key={index} className="flex items-center bg-gray-700/50 rounded-lg p-2.5 hover:bg-gray-700/70 transition-colors duration-300">
                              <FileText className="w-5 h-5 mr-3 text-blue-400" />
                              <span className="text-gray-200 font-medium">{file.name}</span>
                              <span className="text-gray-400 text-sm ml-auto">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="group">
                  <label htmlFor="instrucciones" className="block text-sm font-semibold text-gray-300 mb-3 group-hover:text-white transition-colors duration-300 flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2 text-yellow-400" />
                    Instrucciones especiales
                  </label>
                  <textarea
                    id="instrucciones"
                    name="instrucciones"
                    value={formData.instrucciones}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('instrucciones')}
                    onBlur={() => setFocusedField(null)}
                    rows={5}
                    className={`w-full px-5 py-3 bg-gray-700/50 border-2 border-gray-600/50 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-300 text-white placeholder-gray-400 resize-none hover:bg-gray-700/70 backdrop-blur-sm ${
                      focusedField === 'instrucciones' ? 'shadow-lg shadow-purple-500/20 transform scale-105' : ''
                    }`}
                    placeholder="Describe cualquier instrucción especial, contexto o preferencias para la traducción..."
                  />
                </div>
              </div>
            </div>

            {/* Mensaje de estado */}
            {submitStatus && (
              <div className={`p-5 rounded-2xl border-2 animate-fade-in ${submitStatus === 'success' 
                ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-300 border-green-500/30 shadow-lg shadow-green-500/20' 
                : 'bg-gradient-to-r from-red-500/10 to-pink-500/10 text-red-300 border-red-500/30 shadow-lg shadow-red-500/20'
              }`}>
                <div className="flex items-center">
                  {submitStatus === 'success' ? (
                    <CheckCircle className="w-6 h-6 mr-3 text-green-400" />
                  ) : (
                    <AlertCircle className="w-6 h-6 mr-3 text-red-400" />
                  )}
                  <span className="font-medium">{submitMessage}</span>
                </div>
              </div>
            )}

            {/* Botón de envío */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white py-5 px-6 rounded-2xl font-bold text-lg hover:from-purple-700 hover:via-indigo-700 hover:to-blue-700 focus:ring-4 focus:ring-purple-500/30 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 hover:-translate-y-1 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    <span className="relative z-10">Generando enlace de pago...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                    <span className="relative z-10">Proceder al Pago</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-10 animate-fade-in-up delay-500">
          <p className="text-gray-300 text-lg font-light">
            ⚡ Recibirás una respuesta en minutos
          </p>
          <div className="flex justify-center mt-3 space-x-2">
            <div className="h-2 w-2 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="h-2 w-2 bg-purple-400 rounded-full animate-pulse delay-100"></div>
            <div className="h-2 w-2 bg-pink-400 rounded-full animate-pulse delay-200"></div>
          </div>
        </div>
      </div>

      {/* Pantalla de Carga Completa */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center animate-fade-in">
          <div className="text-center animate-fade-in-up">
            {/* Logo animado */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-500 p-6 rounded-full shadow-2xl animate-pulse">
                  <Globe className="w-12 h-12 text-white drop-shadow-lg animate-spin" style={{ animationDuration: '3s' }} />
                </div>
                {/* Anillos animados */}
                <div className="absolute inset-0 border-4 border-purple-400/30 rounded-full animate-ping"></div>
                <div className="absolute inset-2 border-2 border-blue-400/50 rounded-full animate-pulse"></div>
              </div>
            </div>
            
            {/* Texto de carga */}
            <h2 className="text-3xl font-bold text-white mb-3 animate-pulse">
              Procesando tu solicitud
            </h2>
            <p className="text-lg text-gray-300 mb-6 animate-fade-in delay-500">
              Generando enlace de pago personalizado...
            </p>
            
            {/* Barra de progreso animada */}
            <div className="w-72 bg-gray-700/50 rounded-full h-2.5 mx-auto mb-5 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 rounded-full animate-pulse" 
                   style={{ animation: 'loading-bar 2s ease-in-out infinite' }}>
              </div>
            </div>
            
            {/* Indicadores de paso */}
            <div className="flex justify-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center animate-fade-in">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                Solicitud recibida
              </div>
              <div className="flex items-center animate-fade-in delay-300">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></div>
                Calculando cotización
              </div>
              <div className="flex items-center animate-fade-in delay-500">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
                Generando pago
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;