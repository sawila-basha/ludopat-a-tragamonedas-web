import { useState, useRef, useEffect } from 'react';
import api from '../api';
import { FaCheckCircle, FaTimesCircle, FaIdCard, FaKeyboard, FaShieldAlt, FaUserShield, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import PublicNavbar from '../components/PublicNavbar';

interface LudopataData {
  personaInscrita: string;
  documento: string;
  numRegistro: string;
  ubigeo: string;
  foto: string;
  fechaPublicacion: string;
}

const SecurityCheck = () => {
  const [dni, setDni] = useState('');
  const [result, setResult] = useState<'idle' | 'allowed' | 'denied'>('idle');
  const [data, setData] = useState<LudopataData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input always
  useEffect(() => {
    const focusInput = () => inputRef.current?.focus();
    focusInput();
    window.addEventListener('click', focusInput);
    return () => window.removeEventListener('click', focusInput);
  }, []);

  const handleSearch = async (searchDni: string) => {
    if (!searchDni) {
      setResult('idle');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      console.log('Searching:', searchDni);
      const response = await api.get(`/security/verify/${searchDni}`);
      if (response.data.found) {
        setResult('denied');
        setData(response.data.data);
      } else {
        setResult('allowed');
        setData(null);
      }
    } catch (err: any) {
      console.error(err);
      if (err.response) {
        setError(`Error del servidor: ${err.response.status}`);
      } else if (err.request) {
        setError('Sin conexión con el servidor. Verifique su red.');
      } else {
        setError('Error al procesar la solicitud.');
      }
      setResult('idle');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleSearch(dni);
      inputRef.current?.select();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDni(e.target.value);
    if (result !== 'idle' || error) {
      setResult('idle');
      setError('');
    }
  };

  // Background Styles
  const getBackground = () => {
    switch (result) {
      case 'denied': return 'bg-security-950 from-security-danger/20 to-security-950';
      case 'allowed': return 'bg-security-950 from-security-success/20 to-security-950';
      default: return 'bg-security-950 from-security-primary/10 to-security-950';
    }
  };

  return (
    <div className={`min-h-screen flex flex-col relative transition-all duration-700 overflow-hidden bg-gradient-to-br ${getBackground()}`}>
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-20 pointer-events-none"></div>
      
      <PublicNavbar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 pt-20 md:pt-24 relative z-10 w-full">
        
        {/* Scanner Input Area */}
        <div className={`w-full max-w-3xl transition-all duration-500 transform ${result === 'idle' ? 'scale-100 translate-y-0' : 'scale-90 -translate-y-4 md:-translate-y-8 opacity-80'}`}>
          <div className="relative group">
            <div className={`absolute -inset-0.5 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000 ${
              result === 'denied' ? 'bg-security-danger' : 
              result === 'allowed' ? 'bg-security-success' : 
              'bg-security-primary'
            }`}></div>
            
            <div className="relative bg-security-900/80 backdrop-blur-xl border border-security-700 rounded-2xl p-2 flex items-center shadow-2xl">
              <div className="p-3 md:p-4 bg-security-800 rounded-xl text-security-primary border border-security-700 shrink-0">
                <FaIdCard className="text-2xl md:text-3xl" />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={dni}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="ESCANEAR DNI..."
                className="w-full bg-transparent text-xl md:text-3xl font-mono font-bold text-white placeholder-security-600 px-4 md:px-6 py-3 md:py-4 focus:outline-none tracking-widest text-center uppercase min-w-0"
                autoComplete="off"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:block animate-pulse-slow">
                {loading ? <FaSpinner className="animate-spin text-security-primary text-2xl" /> : <FaKeyboard className="text-security-600 text-2xl" />}
              </div>
            </div>
            
            {error && (
              <div className="mt-4 bg-security-danger/20 border border-security-danger/50 text-security-danger px-4 py-3 rounded-xl flex items-center justify-center gap-2 animate-shake">
                <FaExclamationTriangle />
                <span className="font-bold">{error}</span>
              </div>
            )}
            
            {result === 'idle' && !error && (
              <div className="text-center mt-6 space-y-2 px-4">
                <p className="text-security-primary font-medium tracking-widest text-xs md:text-sm uppercase flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-security-success rounded-full animate-pulse"></span>
                  Sistema Operativo - Esperando Entrada
                </p>
                <p className="text-security-600 text-[10px] md:text-xs font-mono">
                  v2.4.0-SECURE • CONEXIÓN ENCRIPTADA
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Results Display */}
        <div className="w-full max-w-6xl px-2 md:px-4 mt-4 md:mt-8">
          
          {/* IDLE STATE */}
          {result === 'idle' && (
            <div className="text-center opacity-20 mt-12 md:mt-32 select-none pointer-events-none transform scale-75 md:scale-100">
              <FaShieldAlt className="text-8xl md:text-9xl text-white mx-auto mb-4 md:mb-8" />
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-[0.5em] md:tracking-[1em] ml-4 md:ml-8">SEGURIDAD</h2>
            </div>
          )}

          {/* ALLOWED STATE */}
          {result === 'allowed' && (
            <div className="animate-bounce-in text-center">
              <div className="inline-flex items-center justify-center p-6 md:p-8 bg-security-success/10 rounded-full mb-6 md:mb-8 backdrop-blur-sm border border-security-success/30 shadow-[0_0_60px_rgba(16,185,129,0.2)]">
                <FaCheckCircle className="text-7xl md:text-9xl text-security-success drop-shadow-lg" />
              </div>
              
              <h1 className="text-5xl md:text-7xl lg:text-9xl font-black text-white mb-4 tracking-tighter drop-shadow-2xl break-words">
                PERMITIDO
              </h1>
              <div className="h-1.5 w-24 md:w-32 bg-security-success mx-auto rounded-full mb-6 md:mb-8 shadow-[0_0_20px_rgba(16,185,129,0.5)]"></div>
              
              <p className="text-lg md:text-2xl lg:text-3xl text-security-success font-light tracking-widest uppercase mb-8 md:mb-16 px-4">
                Verificación Exitosa • Sin Antecedentes
              </p>
              
              <div className="bg-security-800/50 backdrop-blur-md px-8 md:px-16 py-6 md:py-8 rounded-3xl inline-block border border-security-700 shadow-xl max-w-full overflow-hidden">
                <p className="text-security-500 text-xs md:text-sm font-bold uppercase tracking-widest mb-2">Documento Verificado</p>
                <p className="text-3xl md:text-6xl font-mono font-bold text-white tracking-widest break-all">{dni}</p>
              </div>
            </div>
          )}

          {/* DENIED STATE */}
          {result === 'denied' && data && (
            <div className="animate-shake max-w-5xl mx-auto w-full">
              <div className="bg-security-900/95 backdrop-blur-xl rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.2)] md:shadow-[0_0_100px_rgba(239,68,68,0.4)] border border-security-danger/50 relative">
                
                {/* Header Banner */}
                <div className="bg-security-danger text-white py-2 md:py-3 px-4 md:px-6 flex justify-between items-center text-xs md:text-base">
                  <span className="font-black tracking-widest flex items-center gap-2">
                    <FaShieldAlt /> <span className="hidden sm:inline">ALERTA DE SEGURIDAD N2</span><span className="sm:hidden">ALERTA</span>
                  </span>
                  <span className="font-mono opacity-80">{new Date().toLocaleTimeString()}</span>
                </div>

                <div className="p-4 md:p-8 lg:p-12 relative">
                  {/* Watermark */}
                  <div className="absolute right-0 bottom-0 text-security-danger/5 transform rotate-0 pointer-events-none">
                     <FaTimesCircle size={200} className="md:w-[500px] md:h-[500px]" />
                  </div>

                  <div className="relative z-10 flex flex-col lg:flex-row gap-6 md:gap-12 items-center lg:items-start">
                    
                    {/* Photo Section */}
                    <div className="flex-shrink-0 flex flex-col items-center">
                      <div className="w-48 h-48 md:w-64 md:h-64 lg:w-72 lg:h-72 bg-security-950 rounded-2xl flex items-center justify-center border-4 border-security-danger shadow-2xl overflow-hidden relative group">
                        {data.foto ? (
                          <img src={data.foto} alt="Foto" className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 transition-all duration-500" />
                        ) : (
                          <div className="flex flex-col items-center text-security-700">
                            <FaUserShield className="text-6xl md:text-8xl mb-4" />
                            <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-center px-2">Sin Fotografía</span>
                          </div>
                        )}
                        
                        {/* Scan Line Animation */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-security-danger/20 to-transparent w-full h-full animate-scan pointer-events-none"></div>
                      </div>
                      <div className="mt-4 md:mt-6 bg-security-danger/10 text-security-danger px-4 md:px-6 py-2 rounded-full font-bold tracking-widest text-xs md:text-sm border border-security-danger/20 animate-pulse text-center">
                        REGISTRO #{data.numRegistro}
                      </div>
                    </div>

                    {/* Info Section */}
                    <div className="flex-1 w-full text-center lg:text-left">
                      <div className="mb-6 md:mb-8 border-b border-security-danger/30 pb-6 md:pb-8">
                        <h2 className="text-security-danger font-bold tracking-widest uppercase mb-2 text-sm md:text-base">Persona Identificada</h2>
                        <h3 className="text-2xl md:text-4xl lg:text-5xl font-black text-white leading-tight break-words">
                          {data.personaInscrita}
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div className="bg-security-950/50 p-4 rounded-xl border border-security-800">
                          <p className="text-security-500 text-xs font-bold uppercase tracking-widest mb-1">Documento</p>
                          <p className="text-xl md:text-2xl font-mono text-white font-bold">{data.documento}</p>
                        </div>
                        <div className="bg-security-950/50 p-4 rounded-xl border border-security-800">
                          <p className="text-security-500 text-xs font-bold uppercase tracking-widest mb-1">Ubigeo</p>
                          <p className="text-sm md:text-lg text-white font-medium truncate">{data.ubigeo || 'NO REGISTRADO'}</p>
                        </div>
                        <div className="bg-security-950/50 p-4 rounded-xl border border-security-800 md:col-span-2">
                          <p className="text-security-500 text-xs font-bold uppercase tracking-widest mb-1">Motivo / Fecha</p>
                          <div className="flex items-center justify-between">
                            <span className="text-white font-medium">LUDOPATÍA / EXCLUSIÓN</span>
                            <span className="text-security-danger font-mono font-bold">{data.fechaPublicacion}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 md:mt-8 p-4 bg-security-danger text-white rounded-xl font-bold text-center uppercase tracking-widest animate-pulse shadow-lg text-sm md:text-base">
                        <span className="mr-2">⚠️</span> Acceso Denegado - Notificar Seguridad
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SecurityCheck;
