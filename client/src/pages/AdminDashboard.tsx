import { useState, useEffect, useRef } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { FaUpload, FaFilePdf, FaSignOutAlt, FaSearch, FaDownload, FaDatabase, FaShieldAlt, FaDice, FaDesktop, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface LudopataRecord {
  id: number;
  numRegistro: string;
  personaInscrita: string;
  documento: string;
  contacto: string;
  ubigeo: string;
  fechaPublicacion: string;
}

const AdminDashboard = () => {
  const [records, setRecords] = useState<LudopataRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [lastUpload, setLastUpload] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/ludopatas', {
        params: { search }
      });
      setRecords(response.data.data);
      setLastUpload(response.data.lastUpload);
      setCurrentPage(1); // Reset to first page on new data
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [search]);

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = records.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(records.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('pdf', file);

    setUploading(true);
    try {
      await api.post('/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Base de datos actualizada correctamente');
      fetchRecords();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Error al subir el archivo';
      alert(`Error: ${errorMessage}`);
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(records);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ludopatas");
    XLSX.writeFile(wb, "Base_Ludopatas_SafePlay.xlsx");
  };

  return (
    <div className="min-h-screen bg-security-950 bg-grid-pattern font-sans text-white selection:bg-security-primary/30">
      {/* Navbar */}
      <nav className="bg-security-900/80 backdrop-blur-md border-b border-security-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="bg-security-800/50 p-2 rounded-lg border border-security-700">
                <FaShieldAlt className="text-2xl text-security-primary" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white tracking-wider leading-none">
                  SAFE<span className="text-security-primary">PLAY</span>
                </h1>
                <p className="text-[0.6rem] text-security-400 font-bold tracking-[0.2em] uppercase">
                  Admin Console
                </p>
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-6">
              <div className="hidden md:block text-right">
                <p className="text-xs text-security-500 uppercase tracking-wider font-bold">Última Actualización</p>
                <div className="flex items-center justify-end gap-2">
                  <div className={`w-2 h-2 rounded-full ${lastUpload ? 'bg-security-success animate-pulse' : 'bg-security-danger'}`} />
                  <p className="font-mono text-sm text-security-300">
                    {lastUpload ? new Date(lastUpload).toLocaleString() : 'Pendiente'}
                  </p>
                </div>
              </div>
              
              <div className="h-8 w-px bg-security-800 hidden md:block" />

              <button 
                onClick={() => navigate('/security')}
                className="flex items-center gap-2 text-security-400 hover:text-white transition-colors text-sm font-medium px-3 py-2 rounded-lg hover:bg-security-800"
              >
                <FaDesktop /> 
                <span className="hidden sm:inline">Ir al Escáner</span>
              </button>

              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-security-400 hover:text-security-danger transition-colors text-sm font-medium px-3 py-2 rounded-lg hover:bg-security-danger/10"
              >
                <FaSignOutAlt /> 
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Stats / Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <FaDatabase className="text-security-primary" />
              Base de Datos
            </h2>
            <p className="text-security-400">Gestión de registros del sistema de exclusión.</p>
          </div>
          <div className="flex gap-2">
            <div className="bg-security-900/50 border border-security-800 px-4 py-2 rounded-lg">
              <span className="text-xs text-security-500 uppercase font-bold block">Total Registros</span>
              <span className="text-xl font-mono font-bold text-white">{records.length}</span>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 bg-security-900/40 p-4 rounded-xl border border-security-800 backdrop-blur-sm">
          {/* Search */}
          <div className="relative flex-1 w-full md:min-w-[300px]">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-security-500" />
            <input
              type="text"
              placeholder="Buscar por DNI o Nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-security-950/50 border border-security-700 rounded-lg focus:ring-2 focus:ring-security-primary/50 focus:border-security-primary focus:outline-none text-white placeholder-security-600 transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <input
              type="file"
              accept=".pdf,.xlsx,.xls"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-security-primary hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-all shadow-lg shadow-security-primary/20 disabled:opacity-50 disabled:cursor-not-allowed font-medium border border-white/10"
            >
              {uploading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FaUpload />
              )}
              {uploading ? 'Procesando...' : 'Importar PDF / Excel'}
            </button>

            <button 
              onClick={exportToExcel}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-security-900 hover:bg-security-800 text-security-success border border-security-success/30 px-6 py-3 rounded-lg transition-all shadow-lg hover:shadow-security-success/10 font-medium"
            >
              <FaDownload /> 
              <span className="inline">Excel</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-security-900/40 backdrop-blur-md rounded-xl border border-security-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-security-950/50 border-b border-security-800">
                  <th className="px-6 py-5 text-xs font-bold text-security-400 uppercase tracking-wider">N° Registro</th>
                  <th className="px-6 py-5 text-xs font-bold text-security-400 uppercase tracking-wider">Persona Inscrita</th>
                  <th className="px-6 py-5 text-xs font-bold text-security-400 uppercase tracking-wider">Documento</th>
                  <th className="px-6 py-5 text-xs font-bold text-security-400 uppercase tracking-wider">Fecha Pub.</th>
                  <th className="px-6 py-5 text-xs font-bold text-security-400 uppercase tracking-wider">Ubigeo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-security-800/50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <div className="w-10 h-10 border-4 border-security-primary/30 border-t-security-primary rounded-full animate-spin" />
                        <p className="text-security-400 animate-pulse">Cargando registros...</p>
                      </div>
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-security-500">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <FaSearch className="text-4xl text-security-800" />
                        <p>No se encontraron registros en la base de datos</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((record) => (
                    <tr key={record.id} className="group hover:bg-security-800/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-sm text-security-300 group-hover:text-security-primary transition-colors">
                        {record.numRegistro || '-'}
                      </td>
                      <td className="px-6 py-4 font-medium text-white">
                        {record.personaInscrita}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-security-primary/10 text-security-primary border border-security-primary/20">
                          <FaDice className="text-[0.6rem]" />
                          {record.documento}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-security-400 font-mono">
                        {record.fechaPublicacion || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-security-400">
                        {record.ubigeo || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination / Footer */}
          <div className="px-6 py-4 bg-security-950/30 border-t border-security-800 text-sm text-security-500 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
               <span>Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, records.length)} de {records.length} registros</span>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-security-900/50 border border-security-700 hover:bg-security-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-security-400 hover:text-white"
                >
                  <FaChevronLeft className="text-xs" />
                </button>
                
                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === 'number' ? handlePageChange(page) : null}
                    disabled={typeof page !== 'number'}
                    className={`min-w-[32px] h-8 flex items-center justify-center rounded-lg text-xs font-medium border transition-all ${
                      page === currentPage 
                        ? 'bg-security-primary text-white border-security-primary shadow-lg shadow-security-primary/20' 
                        : typeof page === 'number'
                          ? 'bg-security-900/50 border-security-700 text-security-400 hover:text-white hover:bg-security-800 hover:border-security-600'
                          : 'bg-transparent border-transparent text-security-600 cursor-default'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-security-900/50 border border-security-700 hover:bg-security-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-security-400 hover:text-white"
                >
                  <FaChevronRight className="text-xs" />
                </button>
              </div>
            )}

            <div className="hidden md:flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-security-success" />
              <span>Sistema Operativo</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;