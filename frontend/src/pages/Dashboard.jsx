import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  FileText, 
  Megaphone, 
  BookOpen, 
  Users, 
  Search,
  Bell,
  LogOut,
  Sparkles,
  Cpu,
  BarChart3,
  X 
} from 'lucide-react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

// --- Mock Data: Minimal Feature List ---
const features = [
  { 
    id: 1, 
    title: 'Neural Grading', 
    desc: 'Automated assessment with human-level accuracy.',
    icon: Cpu 
  },
  { 
    id: 2, 
    title: 'Predictive Analytics', 
    desc: 'Forecasting student performance trends.',
    icon: BarChart3 
  },
  { 
    id: 3, 
    title: 'Generative Planning', 
    desc: 'Lesson plans created in milliseconds.',
    icon: Sparkles 
  }
];

// --- Sub-Components ---

const DockItem = ({ icon: Icon, label, isActive, onClick }) => {
    return (
        <button 
            onClick={onClick}
            className="group flex flex-col items-center justify-end gap-2 min-w-[64px] pb-2 relative"
        >
            <motion.div
                whileHover={{ y: -6, scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`
                    w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 backdrop-blur-md
                    ${isActive 
                        ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]' 
                        : 'bg-neutral-800/50 text-neutral-400 hover:bg-neutral-700 hover:text-white border border-white/5'}
                `}
            >
                <Icon size={22} strokeWidth={1.5} />
            </motion.div>
            
            {/* Label is hidden by default, visible on hover or active for cleaner look */}
            <span className={`
                text-[10px] font-medium tracking-wide transition-opacity duration-300 absolute -bottom-4
                ${isActive ? 'opacity-100 text-white' : 'opacity-0 group-hover:opacity-100 text-neutral-400'}
            `}>
                {label}
            </span>

            {isActive && (
                <motion.div 
                    layoutId="activeDot"
                    className="absolute -bottom-1 w-1 h-1 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]" 
                />
            )}
        </button>
    );
};

const GlassModal = ({ children, onClose }) => {
    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-8 pb-36" 
        >
            <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-neutral-900/90 backdrop-blur-2xl w-full max-w-5xl h-full max-h-[85vh] rounded-3xl border border-white/10 overflow-hidden flex flex-col relative shadow-2xl"
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5">
                    <div className="flex gap-2">
                        <button onClick={onClose} className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors"></button>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} className="text-neutral-400" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide text-neutral-200">
                    {children}
                </div>
            </motion.div>
        </motion.div>
    );
};

// --- Main Component ---
const MacOsDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isDashboardHome = location.pathname === '/dashboard' || location.pathname === '/dashboard/';

    const handleNavigation = (path) => {
        navigate(path);
    };

    const closeModal = () => {
        navigate('/dashboard');
    };

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { staggerChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    return (
        <div className="h-screen w-full bg-black text-white relative overflow-hidden flex flex-col font-sans selection:bg-white/20">
            
            {/* Background Ambient Glow */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-violet-900/10 rounded-full blur-[120px] pointer-events-none" />

            {/* --- Top Bar --- */}
            <header className="h-20 px-6 md:px-12 flex items-center justify-between z-10 sticky top-0">
            
                
                <div className="hidden md:flex items-center">
                   <span className="text-[10px] text-neutral-500 tracking-[0.2em] font-light">SYSTEM STATUS: ONLINE</span>
                </div>

            </header>

            {/* --- Main Content Area --- */}
            <main className="flex-1 relative z-0 flex flex-col items-center justify-center p-6 pb-32">
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="max-w-5xl w-full flex flex-col items-center text-center"
                >
                    
                    {/* Hero Text */}
                    <motion.div variants={itemVariants} className="mb-16 relative">
                        <h1 className="text-6xl md:text-9xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 mb-6">
                            Teach.
                        </h1>
                        <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto font-light leading-relaxed">
                            The intelligence layer for your classroom. <br />
                            Grading, planning, and analytics—reimagined.
                        </p>
                    </motion.div>

                    {/* Features Grid (Replaces Exams Section) */}
                    <motion.div 
                        variants={itemVariants}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl"
                    >
                        {features.map((feature) => (
                            <div 
                                key={feature.id}
                                className="group relative bg-neutral-900/30 border border-white/10 p-8 rounded-2xl hover:bg-neutral-900/60 transition-all duration-500 backdrop-blur-sm overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                
                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="mb-4 text-neutral-500 group-hover:text-white transition-colors duration-300">
                                        <feature.icon size={28} strokeWidth={1} />
                                    </div>
                                    <h3 className="text-lg font-semibold text-neutral-200 mb-2">{feature.title}</h3>
                                    <p className="text-sm text-neutral-500 leading-relaxed max-w-[200px]">
                                        {feature.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </motion.div>

                    
                    {/* Decoration Text */}
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        transition={{ delay: 1.5, duration: 2 }}
                        className="absolute bottom-0 left-6 text-[10px] text-neutral-700 font-mono hidden md:block text-left"
                    >
                        <p>AI Teacher goes Global: Announcing our landmark <br/> partnership with Education Systems worldwide.</p>
                        <br/>
                        <a href="#" className="underline hover:text-white transition-colors">Read Announcement v2.0 →</a>
                    </motion.div>

                </motion.div>
            </main>

            {/* --- The Popup / Modal Layer --- */}
            <AnimatePresence>
                {!isDashboardHome && (
                    <GlassModal onClose={closeModal}>
                        <Outlet />
                    </GlassModal>
                )}
            </AnimatePresence>

            {/* --- The Dock (Fixed Bottom) --- */}
            <div className="fixed bottom-8 left-0 right-0 flex justify-center z-50 pointer-events-none px-4">
                <motion.div 
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.5 }}
                    className="bg-neutral-900/80 backdrop-blur-xl border border-white/10 shadow-2xl px-6 py-4 rounded-[2.5rem] flex items-center gap-2 pointer-events-auto"
                >
                    <DockItem 
                        icon={LayoutDashboard} 
                        label="Dashboard" 
                        isActive={isDashboardHome} 
                        onClick={() => handleNavigation('/dashboard')} 
                    />
                    
                    <div className="w-px h-8 bg-white/10 mx-2"></div>
                    
                    <DockItem 
                        icon={FileText} 
                        label="Exams" 
                        isActive={location.pathname.includes('exams') || location.pathname.includes('create-exam')} 
                        onClick={() => handleNavigation('/dashboard/create-exam')} 
                    />
                    <DockItem 
                        icon={BookOpen} 
                        label="Lessons" 
                        isActive={location.pathname.includes('lesson-plan')} 
                        onClick={() => handleNavigation('/dashboard/lesson-plan')} 
                    />
                    <DockItem 
                        icon={Megaphone} 
                        label="Notice" 
                        isActive={location.pathname.includes('announcements')} 
                        onClick={() => handleNavigation('/dashboard/announcements')} 
                    />
            
                    
                    <div className="w-px h-8 bg-white/10 mx-2"></div>

                    <DockItem 
                        icon={LogOut} 
                        label="Logout" 
                        isActive={false} 
                        onClick={() => navigate('/')} 
                    />
                </motion.div>
            </div>
        </div>
    );
};

export default MacOsDashboard;