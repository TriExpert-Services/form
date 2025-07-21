import React, { useState } from 'react';
import { Send, Upload, Calendar, Globe, Phone, Mail, Clock, FileText, MessageSquare, User } from 'lucide-react';

interface FormData {
  nombre: string;
  telefono: string;
  correo: string;
  idioma_origen: string;
  idioma_destino: string;
  tiempo_procesamiento: string;
  formato_deseado: string;
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
    instrucciones: '',
    archivos: [],
    fecha_solicitud: new Date().toISOString().split('T')[0]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [submitMessage, setSubmitMessage] = useState('');

  const idiomas = [
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'Inglés' },
    { value: 'fr', label: 'Francés' },
    { value: 'de', label: 'Alemán' },
    { value: 'it', label: 'Italiano' },
    { value: 'pt', label: 'Portugués' },
    { value: 'zh', label: 'Chino Mandarín' },
    { value: 'ja', label: 'Japonés' },
    { value: 'ko', label: 'Coreano' },
    { value: 'ar', label: 'Árabe' },
    { value: 'ru', label: 'Ruso' },
    { value: 'hi', label: 'Hindi' }
  ];

  const tiemposProcesamiento = [
    { value: 'normal', label: 'Normal (8 a 12 horas)' },
    { value: 'urgente', label: 'Urgente (1 a 2 horas + 50%)' }
  ];

  const formatosDeseados = [
    { value: 'word', label: 'Microsoft Word (.docx)' },
    { value: 'pdf', label: 'PDF' },
    { value: 'excel', label: 'Microsoft Excel (.xlsx)' },
    { value: 'powerpoint', label: 'Microsoft PowerPoint (.pptx)' },
    { value: 'texto-plano', label: 'Texto plano (.txt)' },
    { value: 'html', label: 'HTML' },
    { value: 'jpg', label: 'Imagen JPEG (.jpg)' },
    { value: 'png', label: 'Imagen PNG (.png)' },
    { value: 'gif', label: 'Imagen GIF (.gif)' },
    { value: 'svg', label: 'Imagen SVG (.svg)' },
    { value: 'webp', label: 'Imagen WebP (.webp)' },
    { value: 'mismo-formato', label: 'Mismo formato del original' }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    setSubmitMessage('');

    try {
      // Verificar que los campos requeridos estén completos
      const requiredFields = ['nombre', 'telefono', 'correo', 'idioma_origen', 'idioma_destino', 'tiempo_procesamiento', 'formato_deseado'];
      const missingFields = requiredFields.filter(field => !formData[field as keyof FormData]);
      
      if (missingFields.length > 0) {
        throw new Error(`Campos requeridos faltantes: ${missingFields.join(', ')}`);
      }

      console.log('Enviando datos:', formData);
      
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
      formDataToSend.append('instrucciones', formData.instrucciones);
      formDataToSend.append('fecha_solicitud', formData.fecha_solicitud);
      
      // Agregar archivos como binary data
      formData.archivos.forEach((file, index) => {
        formDataToSend.append(`archivo_${index}`, file, file.name);
      });
      
      formDataToSend.append('cantidad_archivos', formData.archivos.length.toString());

      console.log('FormData creado, enviando...');

      // Use direct URL in production, proxy URL in development
      const apiUrl = import.meta.env.PROD 
        ? 'https://app.n8n-tech.cloud/webhook/b1a77e5e-14a9-4a7b-a01c-6d12354c5e3d'
        : '/api/webhook/b1a77e5e-14a9-4a7b-a01c-6d12354c5e3d';
      
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

      console.log('Respuesta recibida:', response.status, response.statusText);
      
      // Intentar leer la respuesta como texto primero
      const responseText = await response.text();
      console.log('Contenido de respuesta:', responseText);

      if (response.ok) {
        setSubmitStatus('success');
        setSubmitMessage('¡Solicitud enviada exitosamente! Te contactaremos pronto.');
        
        // Limpiar formulario
        setFormData({
          nombre: '',
          telefono: '',
          correo: '',
          idioma_origen: '',
          idioma_destino: '',
          tiempo_procesamiento: '',
          formato_deseado: '',
          instrucciones: '',
          archivos: [],
          fecha_solicitud: new Date().toISOString().split('T')[0]
        });
        
        // Limpiar input de archivos
        const fileInput = document.getElementById('archivos') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        throw new Error(`Error del servidor: ${response.status} ${response.statusText}. Respuesta: ${responseText}`);
      }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-full shadow-lg">
              <Globe className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
            Solicitud de Traducción
          </h1>
          <p className="text-xl text-gray-300">
            Completa el formulario para recibir una cotización personalizada
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Personal */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                <User className="w-6 h-6 mr-3 text-purple-600" />
                Información Personal
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white/80"
                    placeholder="Ingresa tu nombre completo"
                  />
                </div>

                <div>
                  <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white/80"
                    placeholder="+1 234 567 8900"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Correo electrónico *
                  </label>
                  <input
                    type="email"
                    id="correo"
                    name="correo"
                    value={formData.correo}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white/80"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>
            </div>

            {/* Detalles de Traducción */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                <Globe className="w-6 h-6 mr-3 text-purple-600" />
                Detalles de Traducción
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="idioma_origen" className="block text-sm font-medium text-gray-700 mb-2">
                    Idioma de origen *
                  </label>
                  <select
                    id="idioma_origen"
                    name="idioma_origen"
                    value={formData.idioma_origen}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white/80"
                  >
                    <option value="">Selecciona el idioma</option>
                    {idiomas.map(idioma => (
                      <option key={idioma.value} value={idioma.value}>
                        {idioma.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="idioma_destino" className="block text-sm font-medium text-gray-700 mb-2">
                    Idioma de destino *
                  </label>
                  <select
                    id="idioma_destino"
                    name="idioma_destino"
                    value={formData.idioma_destino}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white/80"
                  >
                    <option value="">Selecciona el idioma</option>
                    {idiomas.map(idioma => (
                      <option key={idioma.value} value={idioma.value}>
                        {idioma.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="tiempo_procesamiento" className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Tiempo de procesamiento *
                  </label>
                  <select
                    id="tiempo_procesamiento"
                    name="tiempo_procesamiento"
                    value={formData.tiempo_procesamiento}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white/80"
                  >
                    <option value="">Selecciona el tiempo</option>
                    {tiemposProcesamiento.map(tiempo => (
                      <option key={tiempo.value} value={tiempo.value}>
                        {tiempo.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="formato_deseado" className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="w-4 h-4 inline mr-1" />
                    Formato deseado *
                  </label>
                  <select
                    id="formato_deseado"
                    name="formato_deseado"
                    value={formData.formato_deseado}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white/80"
                  >
                    <option value="">Selecciona el formato</option>
                    {formatosDeseados.map(formato => (
                      <option key={formato.value} value={formato.value}>
                        {formato.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="fecha_solicitud" className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Fecha de solicitud
                  </label>
                  <input
                    type="date"
                    id="fecha_solicitud"
                    name="fecha_solicitud"
                    value={formData.fecha_solicitud}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white/80"
                  />
                </div>
              </div>
            </div>

            {/* Archivos e Instrucciones */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                <Upload className="w-6 h-6 mr-3 text-purple-600" />
                Archivos e Instrucciones
              </h2>
              <div className="space-y-6">
                <div>
                  <label htmlFor="archivos" className="block text-sm font-medium text-gray-700 mb-2">
                    Archivos a traducir
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-purple-400 transition-colors duration-200 bg-gray-50/50">
                    <input
                      type="file"
                      id="archivos"
                      name="archivos"
                      multiple
                      onChange={handleFileChange}
                      className="w-full"
                      accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.svg,.webp"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Formatos aceptados: PDF, Word, PowerPoint, Excel, TXT, JPG, PNG, GIF, SVG, WebP
                    </p>
                    {formData.archivos.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700">Archivos seleccionados:</p>
                        <ul className="text-sm text-gray-600 mt-1">
                          {formData.archivos.map((file, index) => (
                            <li key={index} className="flex items-center">
                              <FileText className="w-4 h-4 mr-2" />
                              {file.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="instrucciones" className="block text-sm font-medium text-gray-700 mb-2">
                    <MessageSquare className="w-4 h-4 inline mr-1" />
                    Instrucciones especiales
                  </label>
                  <textarea
                    id="instrucciones"
                    name="instrucciones"
                    value={formData.instrucciones}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 resize-none bg-white/80"
                    placeholder="Describe cualquier instrucción especial, contexto o preferencias para la traducción..."
                  />
                </div>
              </div>
            </div>

            {/* Mensaje de estado */}
            {submitStatus && (
              <div className={`p-4 rounded-lg ${submitStatus === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {submitMessage}
              </div>
            )}

            {/* Botón de envío */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-blue-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Enviando solicitud...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Enviar Solicitud de Traducción
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-300 text-lg">
            Recibirás una respuesta en minutos
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;