import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Globe, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Calendar, 
  Phone, 
  Mail, 
  FileText, 
  Clock, 
  DollarSign,
  User,
  ChevronLeft,
  ChevronRight,
  Home,
  Loader,
  AlertCircle,
  CheckCircle,
  XCircle,
  Plus
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SolicitudTraduccion {
  id: string;
  nombre: string;
  telefono: string;
  correo: string;
  idioma_origen: string;
  idioma_destino: string;
  tiempo_procesamiento: string;
  formato_deseado: string[];
  numero_hojas: number;
  tipo_documento: string;
  instrucciones: string | null;
  fecha_solicitud: string;
  archivos_urls: string[] | null;
  creado_en: string;
}

const ITEMS_PER_PAGE = 10;

const tiposDocumento = {
  legal: { label: 'Documentos Legales', icon: '⚖️', precio: 30 },
  academico: { label: 'Documentos Académicos', icon: '🎓', precio: 25 },
  medico: { label: 'Documentos Médicos', icon: '🏥', precio: 35 },
  tecnico: { label: 'Documentos Técnicos', icon: '🔧', precio: 35 },
  comercial: { label: 'Documentos Comerciales', icon: '💼', precio: 30 },
  certificados: { label: 'Certificados', icon: '📜', precio: 20 },
  contratos: { label: 'Contratos', icon: '📋', precio: 33 },
  manuales: { label: 'Manuales', icon: '📖', precio: 40 },
};

const idiomas = {
  es: { label: 'Español', flag: '🇪🇸' },
  en: { label: 'Inglés', flag: '🇺🇸' },
  fr: { label: 'Francés', flag: '🇫🇷' },
  de: { label: 'Alemán', flag: '🇩🇪' },
  it: { label: 'Italiano', flag: '🇮🇹' },
  pt: { label: 'Portugués', flag: '🇧🇷' },
  zh: { label: 'Chino Mandarín', flag: '🇨🇳' },
  ja: { label: 'Japonés', flag: '🇯🇵' },
  ko: { label: 'Coreano', flag: '🇰🇷' },
  ar: { label: 'Árabe', flag: '🇸🇦' },
  ru: { label: 'Ruso', flag: '🇷🇺' },
  hi: { label: 'Hindi', flag: '🇮🇳' }
};

export default function Dashboard() {
  const [solicitudes, setSolicitudes] = useState<SolicitudTraduccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<SolicitudTraduccion | null>(null);

  useEffect(() => {
    loadSolicitudes();
  }, []);

  const loadSolicitudes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('solicitudes_traduccion')
        .select('*')
        .order('creado_en', { ascending: false });

      if (error) throw error;
      setSolicitudes(data || []);
    } catch (error) {
      console.error('Error loading solicitudes:', error);
      setError('Error al cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const calcularTotal = (solicitud: SolicitudTraduccion) => {
    const tipo = tiposDocumento[solicitud.tipo_documento as keyof typeof tiposDocumento];
    if (!tipo) return 0;
    
    const subtotal = solicitud.numero_hojas * tipo.precio;
    const esUrgente = solicitud.tiempo_procesamiento === 'urgente';
    return esUrgente ? Math.round(subtotal * 1.5) : subtotal;
  };

  const filteredSolicitudes = solicitudes.filter(solicitud => {
    const matchesSearch = solicitud.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         solicitud.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         solicitud.telefono.includes(searchTerm);
    
    const matchesType = !filterType || solicitud.tipo_documento === filterType;
    const matchesDate = !filterDate || solicitud.fecha_solicitud === filterDate;
    
    return matchesSearch && matchesType && matchesDate;
  });

  const totalPages = Math.ceil(filteredSolicitudes.length / ITEMS_PER_PAGE);
  const paginatedSolicitudes = filteredSolicitudes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const exportToCSV = () => {
    const headers = ['ID', 'Nombre', 'Email', 'Teléfono', 'Tipo Documento', 'Idioma Origen', 'Idioma Destino', 'Hojas', 'Total', 'Fecha'];
    const csvData = filteredSolicitudes.map(s => [
      s.id,
      s.nombre,
      s.correo,
      s.telefono,
      tiposDocumento[s.tipo_documento as keyof typeof tiposDocumento]?.label || s.tipo_documento,
      idiomas[s.idioma_origen as keyof typeof idiomas]?.label || s.idioma_origen,
      idiomas[s.idioma_destino as keyof typeof idiomas]?.label || s.idioma_destino,
      s.numero_hojas,
      calcularTotal(s),
      s.fecha_solicitud
    ]);

    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solicitudes-traduccion-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 rounded-full shadow-2xl animate-pulse mb-6">
            <Loader className="w-12 h-12 text-white animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Cargando Dashboard</h2>
          <p className="text-gray-300">Obteniendo solicitudes de traducción...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={loadSolicitudes}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-xl border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-3 rounded-xl shadow-xl">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text">
                  Panel de Control
                </h1>
                <p className="text-gray-300 mt-1">Gestión de Solicitudes de Traducción</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-300"
              >
                <Home className="w-5 h-5" />
                <span>Inicio</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm font-medium">Total Solicitudes</p>
                <p className="text-3xl font-bold text-blue-400">{solicitudes.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm font-medium">Hojas Totales</p>
                <p className="text-3xl font-bold text-green-400">
                  {solicitudes.reduce((sum, s) => sum + s.numero_hojas, 0)}
                </p>
              </div>
              <Plus className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm font-medium">Ingresos Estimados</p>
                <p className="text-3xl font-bold text-purple-400">
                  ${solicitudes.reduce((sum, s) => sum + calcularTotal(s), 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm font-medium">Urgentes</p>
                <p className="text-3xl font-bold text-orange-400">
                  {solicitudes.filter(s => s.tiempo_procesamiento === 'urgente').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre, email o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition-all duration-300 text-white placeholder-gray-400"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition-all duration-300 text-white"
            >
              <option value="">Todos los tipos</option>
              {Object.entries(tiposDocumento).map(([key, value]) => (
                <option key={key} value={key}>{value.icon} {value.label}</option>
              ))}
            </select>

            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition-all duration-300 text-white"
            />

            <button
              onClick={exportToCSV}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-3 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 font-medium"
            >
              <Download className="w-5 h-5" />
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-700/50 to-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Cliente</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Tipo</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Idiomas</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Hojas</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Total</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Estado</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Fecha</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {paginatedSolicitudes.map((solicitud) => {
                  const tipoDoc = tiposDocumento[solicitud.tipo_documento as keyof typeof tiposDocumento];
                  const idiomaOrigen = idiomas[solicitud.idioma_origen as keyof typeof idiomas];
                  const idiomaDestino = idiomas[solicitud.idioma_destino as keyof typeof idiomas];
                  
                  return (
                    <tr key={solicitud.id} className="hover:bg-gray-700/20 transition-colors duration-300">
                      <td className="px-6 py-4">
                        <div>
                          <div className="flex items-center">
                            <User className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="font-medium text-white">{solicitud.nombre}</span>
                          </div>
                          <div className="flex items-center mt-1">
                            <Mail className="w-3 h-3 text-gray-500 mr-1" />
                            <span className="text-sm text-gray-400">{solicitud.correo}</span>
                          </div>
                          <div className="flex items-center mt-1">
                            <Phone className="w-3 h-3 text-gray-500 mr-1" />
                            <span className="text-sm text-gray-400">{solicitud.telefono}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className="text-lg mr-2">{tipoDoc?.icon}</span>
                          <span className="text-sm text-gray-300">{tipoDoc?.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-300">
                            {idiomaOrigen?.flag} {idiomaOrigen?.label}
                          </span>
                          <span className="text-gray-500">→</span>
                          <span className="text-sm text-gray-300">
                            {idiomaDestino?.flag} {idiomaDestino?.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white font-medium">{solicitud.numero_hojas}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 text-green-400 mr-1" />
                          <span className="font-bold text-green-400">
                            {calcularTotal(solicitud).toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {solicitud.tiempo_procesamiento === 'urgente' ? (
                            <>
                              <Clock className="w-4 h-4 text-orange-400 mr-2" />
                              <span className="text-orange-400 font-medium">Urgente</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                              <span className="text-green-400 font-medium">Normal</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-300">
                            {new Date(solicitud.fecha_solicitud).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedOrder(solicitud)}
                          className="flex items-center space-x-1 text-purple-400 hover:text-purple-300 transition-colors duration-300"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="text-sm">Ver</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-700/20 px-6 py-4 flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredSolicitudes.length)} de {filteredSolicitudes.length} solicitudes
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-300">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700/50 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Detalle de Solicitud</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Cliente Info */}
              <div className="bg-gray-700/30 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-400" />
                  Información del Cliente
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Nombre</p>
                    <p className="text-white font-medium">{selectedOrder.nombre}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="text-white font-medium">{selectedOrder.correo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Teléfono</p>
                    <p className="text-white font-medium">{selectedOrder.telefono}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Fecha de Solicitud</p>
                    <p className="text-white font-medium">
                      {new Date(selectedOrder.fecha_solicitud).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Translation Details */}
              <div className="bg-gray-700/30 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-green-400" />
                  Detalles de Traducción
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Tipo de Documento</p>
                    <p className="text-white font-medium">
                      {tiposDocumento[selectedOrder.tipo_documento as keyof typeof tiposDocumento]?.icon}{' '}
                      {tiposDocumento[selectedOrder.tipo_documento as keyof typeof tiposDocumento]?.label}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Número de Hojas</p>
                    <p className="text-white font-medium">{selectedOrder.numero_hojas}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Idioma de Origen</p>
                    <p className="text-white font-medium">
                      {idiomas[selectedOrder.idioma_origen as keyof typeof idiomas]?.flag}{' '}
                      {idiomas[selectedOrder.idioma_origen as keyof typeof idiomas]?.label}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Idioma de Destino</p>
                    <p className="text-white font-medium">
                      {idiomas[selectedOrder.idioma_destino as keyof typeof idiomas]?.flag}{' '}
                      {idiomas[selectedOrder.idioma_destino as keyof typeof idiomas]?.label}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Tiempo de Procesamiento</p>
                    <p className={`font-medium ${selectedOrder.tiempo_procesamiento === 'urgente' ? 'text-orange-400' : 'text-green-400'}`}>
                      {selectedOrder.tiempo_procesamiento === 'urgente' ? '🚀 Urgente (1-2 horas)' : '⏰ Normal (8-12 horas)'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Formato Deseado</p>
                    <p className="text-white font-medium">{selectedOrder.formato_deseado.join(', ')}</p>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-green-400" />
                  Cotización
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Subtotal ({selectedOrder.numero_hojas} hojas × ${tiposDocumento[selectedOrder.tipo_documento as keyof typeof tiposDocumento]?.precio})</span>
                    <span className="text-white">
                      ${(selectedOrder.numero_hojas * (tiposDocumento[selectedOrder.tipo_documento as keyof typeof tiposDocumento]?.precio || 0)).toLocaleString()}
                    </span>
                  </div>
                  {selectedOrder.tiempo_procesamiento === 'urgente' && (
                    <div className="flex justify-between">
                      <span className="text-orange-300">Recargo urgente (+50%)</span>
                      <span className="text-orange-300">
                        +${Math.round((selectedOrder.numero_hojas * (tiposDocumento[selectedOrder.tipo_documento as keyof typeof tiposDocumento]?.precio || 0)) * 0.5).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-green-500/20 pt-2 flex justify-between">
                    <span className="text-lg font-bold text-green-400">Total</span>
                    <span className="text-xl font-bold text-green-400">
                      ${calcularTotal(selectedOrder).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              {selectedOrder.instrucciones && (
                <div className="bg-gray-700/30 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-yellow-400" />
                    Instrucciones Especiales
                  </h3>
                  <p className="text-gray-300">{selectedOrder.instrucciones}</p>
                </div>
              )}

              {/* Files */}
              {selectedOrder.archivos_urls && selectedOrder.archivos_urls.length > 0 && (
                <div className="bg-gray-700/30 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-purple-400" />
                    Archivos ({selectedOrder.archivos_urls.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedOrder.archivos_urls.map((url, index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between bg-gray-600/30 rounded-lg p-3 hover:bg-gray-600/50 transition-colors duration-300"
                      >
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 text-blue-400 mr-2" />
                          <span className="text-white">Archivo {index + 1}</span>
                        </div>
                        <Eye className="w-4 h-4 text-gray-400" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}