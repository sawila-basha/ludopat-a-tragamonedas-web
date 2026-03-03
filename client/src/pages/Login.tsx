import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { FaUserLock, FaLock, FaEnvelope, FaDice, FaArrowLeft } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      console.log('API URL:', api.defaults.baseURL);
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      localStorage.setItem('token', response.data.token);
      navigate('/admin');
    } catch (err: any) {
      console.error('Login Error:', err);
      if (err.response) {
        if (err.response.status === 401) {
          setError('Credenciales de acceso inválidas');
        } else {
            // Show detailed error if available
            const errorMessage = err.response.data?.details || err.response.data?.error || `Error del servidor: ${err.response.status}`;
            setError(errorMessage);
          }
        } else if (err.request) {
        setError('No hay conexión con el servidor. Verifique que el backend esté activo.');
      } else {
        setError('Error al intentar iniciar sesión');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-security-950 bg-grid-pattern relative overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-security-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-security-danger/5 rounded-full blur-[100px]" />
      </div>

      <div className="z-10 w-full max-w-md p-4 md:p-8">
        <Link to="/security" className="inline-flex items-center gap-2 text-security-400 hover:text-white transition-colors mb-6 text-sm group font-medium">
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          Volver al Escáner
        </Link>

        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8 animate-fade-in-down">
          <div className="bg-security-900/50 backdrop-blur-md p-4 rounded-2xl border border-security-700 shadow-2xl mb-4 relative group">
            <div className="absolute inset-0 bg-security-primary/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500 opacity-0 group-hover:opacity-100" />
            <FaDice className="text-4xl md:text-5xl text-white relative z-10" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-wider leading-none mb-1">
            SAFE<span className="text-security-primary">PLAY</span>
          </h1>
          <p className="text-xs md:text-sm text-security-400 font-medium tracking-[0.3em] uppercase opacity-80">
            Sistema de Control
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-security-900/60 backdrop-blur-xl p-6 md:p-8 rounded-2xl border border-security-700 shadow-2xl relative overflow-hidden">
          {/* Top accent line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-security-primary to-transparent opacity-50" />

          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-security-800/50 rounded-lg border border-security-700 text-security-primary">
              <FaUserLock className="text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Acceso Administrativo</h2>
              <p className="text-xs text-security-400">Ingrese sus credenciales autorizadas</p>
            </div>
          </div>
          
          {error && (
            <div className="bg-security-danger/10 border border-security-danger/20 text-security-danger p-3 rounded-lg mb-6 text-sm flex items-center gap-2 animate-shake">
              <div className="w-1.5 h-1.5 rounded-full bg-security-danger animate-pulse" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1">
              <label className="text-security-300 text-xs font-bold uppercase tracking-wider ml-1">
                Correo Institucional
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-security-500 group-focus-within:text-security-primary transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-security-950/50 border border-security-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-security-primary/50 focus:border-security-primary text-white placeholder-security-600 transition-all font-mono text-sm"
                  placeholder="admin@safeplay.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-security-300 text-xs font-bold uppercase tracking-wider ml-1">
                Contraseña
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-security-500 group-focus-within:text-security-primary transition-colors" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-security-950/50 border border-security-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-security-primary/50 focus:border-security-primary text-white placeholder-security-600 transition-all font-mono text-sm"
                  placeholder="••••••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-security-primary to-blue-600 text-white py-3.5 rounded-lg hover:from-blue-500 hover:to-security-primary transition-all duration-300 font-bold shadow-lg shadow-security-primary/20 border border-white/10 relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? 'Verificando...' : 'Iniciar Sesión Segura'}
                {!loading && <span className="group-hover:translate-x-1 transition-transform">→</span>}
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-security-500">
              Acceso restringido únicamente a personal autorizado.
              <br />Su dirección IP está siendo monitoreada.
            </p>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-4 text-center w-full">
        <p className="text-xs text-security-600 font-mono">
          SAFEPLAY SECURITY SYSTEM v2.4.0
        </p>
      </div>
    </div>
  );
};

export default Login;
