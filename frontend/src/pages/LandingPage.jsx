import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

// --- NAVBAR COMPONENT (Integrated directly to fix import error) ---
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
       
       {/* Minimal Login Button */}
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

// --- MAIN LANDING PAGE ---
const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full bg-[#020202] text-white overflow-hidden font-sans selection:bg-white selection:text-black">
      
      {/* --- 1. MASS CINEMATIC LIGHTING --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        
        {/* Main Light Beam (Left Side - Intensified) */}
        <div 
            className="absolute top-[-40%] left-[-25%] w-[90vw] h-[160vh] bg-gradient-to-r from-white via-blue-100/20 to-transparent rotate-[-25deg] blur-[120px] opacity-70"
            style={{ mixBlendMode: "screen" }}
        ></div>

        {/* Ambient Glow */}
        <div 
            className="absolute top-[-30%] left-[-10%] w-[100vw] h-[100vh] bg-blue-500/10 rotate-[-25deg] blur-[150px] opacity-50"
            style={{ mixBlendMode: "overlay" }}
        ></div>

        {/* Moving Fog Layers */}
        <motion.div 
          animate={{ 
            x: [0, 60, -60, 0],
            y: [0, -40, 40, 0],
            opacity: [0.4, 0.6, 0.4]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] left-[5%] w-[50vw] h-[50vh] bg-white/10 rounded-full blur-[100px]"
          style={{ mixBlendMode: "overlay" }}
        />

        <motion.div 
           animate={{ 
            x: [0, -80, 40, 0],
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-10%] right-[-10%] w-[80vw] h-[80vh] bg-indigo-950/40 rounded-full blur-[180px]"
        />

        {/* Cinematic Grain Texture */}
        <div className="absolute inset-0 opacity-[0.08] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
      </div>

      {/* --- 2. NAVBAR (Included directly) --- */}
      <Navbar />

      {/* --- 3. HERO SECTION --- */}
      <section className="relative z-10 h-screen flex flex-col items-center justify-center text-center px-4">
        
        {/* Hero Title */}
        <motion.h1 
          initial={{ opacity: 0, scale: 0.95, filter: "blur(20px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="text-[18vw] md:text-[13rem] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white/80 to-white/10 drop-shadow-[0_0_80px_rgba(255,255,255,0.3)]"
        >
          Teach.
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 1.5, delay: 1 }}
           className="mt-8 text-lg md:text-xl text-white/50 max-w-2xl font-light tracking-wide"
        >
           The intelligence layer for your classroom. <br className="hidden md:block"/>
           Grading, planning, and analytics—reimagined.
        </motion.p>

        {/* --- PREMIUM CTA BUTTON --- */}
        <motion.div
           initial={{ opacity: 0, y: 40 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 1.5, delay: 1.4 }}
           className="mt-14"
        >
           <motion.button 
              onClick={() => navigate('/login')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="group relative px-14 py-5 bg-white text-black rounded-full font-bold text-xs tracking-[0.2em] shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_80px_rgba(255,255,255,0.6)] transition-all duration-500 overflow-hidden"
           >
              {/* Shimmer Effect inside button */}
              <div className="absolute inset-0 overflow-hidden rounded-full">
                  <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-[-25deg] group-hover:animate-shine" />
              </div>

              {/* Text & Icon with spacing animation */}
              <span className="relative flex items-center gap-3 group-hover:gap-5 transition-all duration-500 z-10">
                 GET STARTED <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </span>
           </motion.button>
        </motion.div>

      </section>

      {/* --- 4. BOTTOM INFO --- */}
      <div className="absolute bottom-0 w-full p-8 md:p-12 flex flex-col md:flex-row justify-between items-end z-20 gap-6">
         <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
            className="text-[10px] md:text-xs text-white/30 max-w-sm font-mono tracking-wide leading-relaxed"
         >
            <span className="text-white/60 font-bold block mb-2">SYSTEM STATUS: ONLINE</span>
            AI Teacher goes Global: Announcing our landmark partnership with Education Systems worldwide.
            <br/> <span className="text-white/80 cursor-pointer hover:text-white transition-colors underline decoration-white/30 underline-offset-4 mt-2 inline-block">Read Announcement_v2.0 →</span>
         </motion.div>

         {/* Scroll Line */}
         <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "4rem", opacity: 1 }}
            transition={{ delay: 3, duration: 1.5 }}
            className="hidden md:block w-[1px] bg-gradient-to-b from-white/80 to-transparent relative"
         >
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full shadow-[0_0_10px_white]"></div>
         </motion.div>
      </div>

      {/* Shine Animation Style */}
      <style>{`
        @keyframes shine {
            0% { left: -100%; opacity: 0; }
            50% { opacity: 0.5; }
            100% { left: 200%; opacity: 0; }
        }
        .animate-shine {
            animation: shine 1.5s infinite;
        }
      `}</style>

    </div>
  );
};

export default LandingPage;