import React, { useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Mail, Lock, ArrowRight, Eye, EyeOff, ArrowLeft, AlertCircle, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

// --- 🔐 DUMMY CREDENTIALS ---
const MOCK_CREDENTIALS = {
  email: "user@test.com",
  password: "password123"
};

// --- 🎨 ICONS ---
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.52 12.273c0-.851-.076-1.67-.218-2.455H12v4.637h6.455c-.279 1.504-1.127 2.778-2.4 3.633v3.018h3.887c2.274-2.094 3.585-5.176 3.585-8.833z" fill="#4285F4"/>
    <path d="M12 24c3.24 0 5.957-1.074 7.942-2.909l-3.887-3.018c-1.075.72-2.451 1.145-4.055 1.145-3.127 0-5.773-2.112-6.72-4.953H1.29v3.115C3.266 21.291 7.334 24 12 24z" fill="#34A853"/>
    <path d="M5.28 14.265c-.24-.72-.375-1.491-.375-2.265s.135-1.545.375-2.265V6.62H1.29C.466 8.265 0 10.083 0 12c0 1.917.466 3.735 1.29 5.38l3.99-3.115z" fill="#FBBC05"/>
    <path d="M12 4.773c1.763 0 3.345.606 4.59 1.794l3.44-3.44C17.953 1.188 15.236 0 12 0 7.334 0 3.266 2.709 1.29 6.62l3.99 3.115c.947-2.841 3.593-4.962 6.72-4.962z" fill="#EA4335"/>
  </svg>
);

// --- ✨ ANIMATED INPUT COMPONENT (UPDATED) ---
const AnimatedInput = ({ 
  label, 
  name, 
  type = "text", 
  value, 
  onChange, 
  icon: Icon, 
  toggleIcon, 
  onToggle 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value.length > 0;

  return (
    <div className="relative mb-5 group">
      {/* Input Container - Fixed Height for alignment */}
      <div 
        className={`
          relative flex items-center h-[58px] bg-black/40 border rounded-xl overflow-hidden transition-all duration-500 ease-out
          ${isFocused ? "border-white/50 shadow-[0_0_20px_rgba(255,255,255,0.08)]" : "border-white/10 hover:border-white/20"}
        `}
      >
        {/* Left Icon */}
        <div className="pl-4 pr-3 text-white/40 h-full flex items-center justify-center">
          <Icon size={20} className={`transition-colors duration-300 ${isFocused ? "text-white" : ""}`} />
        </div>

        {/* Input Area */}
        <div className="relative w-full h-full flex flex-col justify-center pr-4">
          <motion.label
            initial={false}
            animate={{
              y: isFocused || hasValue ? -8 : 0, // Adjusted vertical movement
              scale: isFocused || hasValue ? 0.75 : 1,
              opacity: isFocused || hasValue ? 0.6 : 0.4,
              x: isFocused || hasValue ? -2 : 0,
            }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} // Ultra smooth easing
            className="absolute left-0 top-[18px] text-white pointer-events-none origin-top-left font-medium tracking-wide"
          >
            {label}
          </motion.label>

          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            // Added pt-4 to push text down slightly to clear the floating label
            className="w-full bg-transparent text-white outline-none font-medium placeholder-transparent relative z-10 pt-4 pb-0 h-full"
          />
        </div>

        {/* Toggle Password Icon */}
        {toggleIcon && (
          <button
            type="button"
            onClick={onToggle}
            className="px-4 h-full flex items-center justify-center text-white/40 hover:text-white transition-colors cursor-pointer relative z-20"
          >
            {toggleIcon}
          </button>
        )}

        {/* Bottom "Scanning" Line Animation - Smoother */}
        <motion.div 
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: isFocused ? 1 : 0, opacity: isFocused ? 1 : 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent origin-center"
        />
      </div>
    </div>
  );
};

// --- 🚀 MAIN LOGIN COMPONENT ---
const Login = () => {
  const navigate = useNavigate(); 
  
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(""); 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      if (
        formData.email === MOCK_CREDENTIALS.email && 
        formData.password === MOCK_CREDENTIALS.password
      ) {
        navigate('/dashboard'); 
      } else {
        setError("Invalid email or password");
        setIsLoading(false);
      }
    }, 1500);
  };

  // --- SMOOTH ANIMATION VARIANTS ---
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08, // Faster stagger for snappier feel
        delayChildren: 0.1,
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    // Replaced spring with a smooth bezier curve
    show: { 
      y: 0, 
      opacity: 1, 
      transition: { 
        duration: 0.6, 
        ease: [0.16, 1, 0.3, 1] // Apple-like smooth ease
      } 
    }
  };

  return (
    <div className="relative min-h-screen w-full flex bg-[#020202] font-sans selection:bg-white selection:text-black overflow-hidden">
      
      {/* --- LEFT SIDE: CINEMATIC VISUALS --- */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center overflow-hidden">
         {/* Background Effects */}
         <div className="absolute inset-0 z-0">
            <div className="absolute top-[-20%] left-[-20%] w-[80vw] h-[150vh] bg-gradient-to-r from-blue-900/10 via-transparent to-transparent rotate-[-15deg] blur-[100px]"></div>
            <motion.div 
              animate={{ 
                scale: [1, 1.15, 1], 
                opacity: [0.2, 0.4, 0.2],
                rotate: [0, 10, 0] 
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[20%] left-[10%] w-[35vw] h-[35vw] bg-indigo-500/5 rounded-full blur-[100px]"
            />
         </div>

         {/* Content */}
         <div className="relative z-10 p-12 text-white">
            <motion.div 
               initial={{ opacity: 0, y: 30 }} 
               animate={{ opacity: 1, y: 0 }} 
               transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
               className="flex items-center gap-3 mb-6"
            >
               <div className="p-2 bg-white/5 rounded-lg backdrop-blur-md border border-white/10">
                  <Sparkles size={24} className="text-white"/>
               </div>
               <span className="text-sm font-bold tracking-[0.3em] opacity-60">AI TEACHER</span>
            </motion.div>
            
            <motion.h1 
               initial={{ opacity: 0, y: 30 }} 
               animate={{ opacity: 1, y: 0 }} 
               transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
               className="text-6xl font-bold leading-tight mb-6"
            >
               Welcome to <br/> the <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">Future.</span>
            </motion.h1>
            
            <motion.p 
               initial={{ opacity: 0, y: 30 }} 
               animate={{ opacity: 1, y: 0 }} 
               transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
               className="text-lg text-white/40 max-w-md leading-relaxed"
            >
               Your intelligent classroom assistant is ready. <br/> Log in to start grading and planning in seconds.
            </motion.p>
         </div>
      </div>

      {/* --- RIGHT SIDE: LOGIN FORM --- */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 relative z-10">
         
         <LayoutGroup> 
           <motion.div 
             layout
             variants={containerVariants}
             initial="hidden"
             animate="show"
             className="w-full max-w-md bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-8 md:p-10 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)] relative z-10 overflow-hidden"
           >
             {/* Subtle Spotlight Effect on Card */}
             <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

             {/* Back Button */}
             <motion.button 
               variants={itemVariants}
               onClick={() => navigate('/')}
               className="absolute top-8 left-8 p-2 rounded-full text-white/30 hover:text-white hover:bg-white/5 transition-all"
             >
               <ArrowLeft size={20} />
             </motion.button>

             <motion.div variants={itemVariants} className="text-center mb-10 pt-6">
                <h2 className="text-3xl font-bold text-white mb-2">Sign In</h2>
                <p className="text-sm text-white/40">Enter your credentials to access the dashboard.</p>
                <motion.p 
                  whileHover={{ scale: 1.02 }}
                  className="text-xs text-white/20 mt-3 font-mono bg-white/5 inline-block px-3 py-1.5 rounded-md cursor-help border border-white/5"
                >
                  user@test.com / password123
                </motion.p>
             </motion.div>

             <form onSubmit={handleSubmit} className="w-full">
                <motion.div variants={itemVariants}>
                  <AnimatedInput
                    label="EMAIL ADDRESS"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    icon={Mail}
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <div className="flex justify-end mb-1">
                     <a href="#" className="text-xs text-white/30 hover:text-white transition-colors">Forgot Password?</a>
                  </div>
                  <AnimatedInput
                    label="PASSWORD"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    icon={Lock}
                    toggleIcon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    onToggle={() => setShowPassword(!showPassword)}
                  />
                </motion.div>

                {/* Error Message */}
                <AnimatePresence mode="wait">
                   {error && (
                      <motion.div 
                         initial={{ opacity: 0, y: -10, height: 0 }}
                         animate={{ opacity: 1, y: 0, height: "auto" }}
                         exit={{ opacity: 0, y: -10, height: 0 }}
                         transition={{ duration: 0.3, ease: "easeOut" }}
                         className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-xl border border-red-500/20 mb-5 overflow-hidden"
                      >
                         <AlertCircle size={16} className="shrink-0" />
                         <span>{error}</span>
                      </motion.div>
                   )}
                </AnimatePresence>

                {/* Submit Button */}
                <motion.div variants={itemVariants}>
                  <motion.button 
                     whileHover={{ scale: 1.01, boxShadow: "0 0 25px rgba(255,255,255,0.1)" }}
                     whileTap={{ scale: 0.98 }}
                     disabled={isLoading}
                     className="w-full relative group overflow-hidden bg-white text-black py-4 rounded-xl font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(255,255,255,0.05)] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
                     
                     {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                           <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                           Processing...
                        </span>
                     ) : (
                        <span className="flex items-center justify-center gap-2 relative z-10">
                           SIGN IN <ArrowRight size={18} />
                        </span>
                     )}
                  </motion.button>
                </motion.div>

             </form>

             <motion.div variants={itemVariants} className="relative my-8">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#0e0e0e] px-2 text-white/30">Or continue with</span></div>
             </motion.div>

             <motion.div variants={itemVariants}>
                <motion.button 
                   whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                   whileTap={{ scale: 0.98 }}
                   className="w-full bg-transparent border border-white/10 text-white/70 py-3.5 rounded-xl font-medium text-sm flex items-center justify-center gap-3 transition-all hover:border-white/20"
                >
                   <GoogleIcon />
                   <span>Google</span>
                </motion.button>
             </motion.div>

             <motion.p variants={itemVariants} className="text-center mt-8 text-sm text-white/30">
                Don't have an account? <Link to="/signup" className="font-semibold text-white hover:underline decoration-white/50 underline-offset-4">Create Account</Link>
             </motion.p>

           </motion.div>
         </LayoutGroup>
      </div>

    </div>
  );
};

export default Login;