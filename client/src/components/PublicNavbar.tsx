import { Link } from 'react-router-dom';
import { FaUserShield, FaDice } from 'react-icons/fa';

const PublicNavbar = () => {
  return (
    <nav className="absolute top-0 left-0 w-full z-50 bg-transparent px-4 md:px-8 py-4 md:py-6 pointer-events-auto">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo / Brand */}
        <div className="flex items-center gap-2 md:gap-3">
          <div className="bg-security-900/50 backdrop-blur-md p-1.5 md:p-2 rounded-lg border border-security-700">
            <FaDice className="text-xl md:text-3xl text-white" />
          </div>
          <div>
            <h1 className="text-lg md:text-2xl font-black text-white tracking-wider leading-none">
              SAFE<span className="text-security-primary">PLAY</span>
            </h1>
            <p className="text-[10px] md:text-xs text-security-400 font-medium tracking-widest uppercase opacity-80">
              Control de Acceso
            </p>
          </div>
        </div>

        {/* Actions */}
        <Link 
          to="/login" 
          className="flex items-center gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-full bg-security-900/30 hover:bg-security-800/50 backdrop-blur-md border border-security-700 transition-all duration-300 group"
        >
          <span className="text-xs md:text-sm font-semibold text-white group-hover:text-security-primary transition-colors">
            Acceso <span className="hidden sm:inline">Admin</span>
          </span>
          <FaUserShield className="text-white group-hover:text-security-primary transition-colors text-sm md:text-base" />
        </Link>
      </div>
    </nav>
  );
};

export default PublicNavbar;
