import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  
  return (
    <nav className="absolute top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-8 md:px-12">
       
       {/* Logo Area */}
       <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate('/')}>
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-500">
            <Sparkles size={20} className="text-white group-hover:rotate-12 transition-transform duration-500"/>
          </div>
          <span className="font-bold tracking-[0.3em] text-xs md:text-sm text-white/90 group-hover:text-white transition-colors">
            AI TEACHER
          </span>
       </div>
       
       {/* Minimal Login Button - Only Logo & Login as requested */}
       <button 
          onClick={() => navigate('/login')}
          className="relative px-8 py-3 rounded-full border border-white/20 bg-black/20 backdrop-blur-sm text-[10px] md:text-xs font-bold tracking-[0.2em] text-white hover:bg-white hover:text-black hover:border-white transition-all duration-300 overflow-hidden group"
       >
          <span className="relative z-10">LOGIN</span>
          <div className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
       </button>

    </nav>
  );
};

export default Navbar;