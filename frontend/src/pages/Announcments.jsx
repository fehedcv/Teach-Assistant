import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Megaphone, Wand2, Send, Copy, 
  CheckCircle, MessageCircle, Sparkles, 
  AlignLeft, AlertCircle, Smile,
  ChevronLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Announcement = () => {
  const navigate = useNavigate();
  const [rawText, setRawText] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [tone, setTone] = useState('Professional');

  // --- SEND REQUEST TO SERVER (REVISED) ---
  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!rawText.trim()) return;

    setIsGenerating(true);
    setGeneratedText('');
    setIsCopied(false); // Reset copy status

    // --- API Configuration ---
    const API_ENDPOINT = 'http://localhost:5678/webhook/announcements/format';
    // Construct the prompt string including the raw text and the selected tone
    const prompt_content = `Raw Text: ${rawText}. Tone: ${tone}`;

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // NOTE: Add any necessary authorization headers here if your API requires them.
        },
        body: JSON.stringify({
          prompt: prompt_content,
        }),
      });

      if (!response.ok) {
        // Throw an error if the HTTP status is not 2xx
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      
      // The API response is expected to have the key "output"
      if (data && data.output) {
        setGeneratedText(data.output);
      } else {
        // Handle cases where the response is missing the expected key
        setGeneratedText("⚠️ Error: API response was successful but missing the 'output' data.");
      }

    } catch (error) {
      console.error("API Call Error:", error);
      // Display a user-friendly error message to the user
      setGeneratedText(`⚠️ Error: Unable to format message. Details: ${error.message || "Network/Server issue."}`);
    }

    setIsGenerating(false);
  };


  // --- ACTIONS ---
  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    // Note: This opens the web version of WhatsApp and relies on the user being logged in.
    const url = `https://web.whatsapp.com/send?text=${encodeURIComponent(generatedText)}`;
    window.open(url, '_blank');
  };

  // -------------------------------------------------------------------
  // --- UI STRUCTURE (Glassmorphism & Monochrome Theme) ---
  // -------------------------------------------------------------------

  // Framer Motion Variants for Smoother Animations
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.7, 
        ease: [0.17, 0.55, 0.55, 1], // Smooth custom easing
      }
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  const cardVariants = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    // Base style: Black background
    <div className="min-h-screen bg-black font-sans flex flex-col text-white antialiased">
      
      {/* Subtle background grid pattern with reduced visibility/opacity */}
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:30px_30px]" />

      {/* HEADER: Glassmorphism Effect */}
      <header className="h-20 bg-white/5 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6 lg:px-12 sticky top-0 z-20 shadow-xl shadow-black/50">
        <div className="flex items-center gap-3">
          {/* Logo icon - Black/White with subtle shadow */}
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-black shadow-lg shadow-white/20">
            <Megaphone size={20} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">AI Announcer</h1>
            <p className="text-xs text-white/70 hidden sm:block">Transforming drafts into polished notices</p>
          </div>
        </div>
        
        <motion.button 
          onClick={() => navigate('/dashboard')}
          whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          whileTap={{ scale: 0.95 }}
          // Black/White button styles with smooth transitions
          className="group flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white transition-all px-4 py-2 rounded-lg hover:bg-white/10"
        >
          <ChevronLeft size={18} className="transition-transform group-hover:-translate-x-1" /> 
          Back to Dashboard
        </motion.button>
      </header>

      {/* MAIN LAYOUT */}
      <main className="flex-1 p-4 lg:p-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 h-full">
          
          {/* LEFT SIDE: Input and Controls */}
          <motion.div 
            variants={cardVariants}
            initial="initial"
            animate="animate"
            className="flex flex-col h-full space-y-8"
          >
            {/* Title Section */}
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Draft & Refine 📝</h2>
              <p className="text-white/70 max-w-md">Input your raw message, select the desired tone, and let AI format it perfectly for immediate use.</p>
            </div>

            {/* Input Card - Glassmorphism Effect */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-2xl shadow-black/50 flex-1 flex flex-col">
              
              {/* TONE SELECTOR (Monochrome Tabs) */}
              <div className="flex gap-1.5 mb-5 p-1 bg-black/50 rounded-xl w-fit border border-white/10">
                {['Professional', 'Urgent', 'Friendly'].map((t) => (
                  <motion.button
                    key={t}
                    onClick={() => setTone(t)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                      tone === t 
                        ? 'bg-white/20 text-white shadow-md shadow-black/50' 
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {t === 'Professional' && <AlignLeft size={14} className={tone === t ? 'text-white' : 'text-white/40'} />}
                    {t === 'Urgent' && <AlertCircle size={14} className={tone === t ? 'text-white' : 'text-white/40'} />}
                    {t === 'Friendly' && <Smile size={14} className={tone === t ? 'text-white' : 'text-white/40'} />}
                    {t}
                  </motion.button>
                ))}
              </div>

              {/* TEXT INPUT - Glassmorphism Inner Style */}
              <div className="relative flex-1">
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="e.g., No class tomorrow due to heavy rain. Exam postponed to Monday."
                  // Inner text area style changed to a darker, subtle glass
                  className="w-full h-full min-h-[300px] p-5 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-white/50 focus:border-white/30 outline-none resize-none text-lg text-white/90 leading-relaxed font-medium placeholder-white/40 transition-colors"
                />
                {/* Character count updated for better visibility */}
                <div className="absolute bottom-4 right-4 text-xs font-medium text-white/60 bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/10 shadow-sm">
                  {rawText.length} chars
                </div>
              </div>

              {/* GENERATE BUTTON - White/Black with smooth motion */}
              <motion.button
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGenerate}
                disabled={isGenerating || !rawText}
                className="mt-6 w-full bg-white text-black py-4 rounded-xl font-bold text-lg shadow-xl shadow-white/30 hover:bg-gray-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed relative group"
              >
                {isGenerating ? (
                  <>
                    <motion.span 
                      animate={{ rotate: 360 }} 
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full" 
                    />
                    Formatting...
                  </>
                ) : (
                  <>
                    <Wand2 size={20} className="transition-transform group-hover:rotate-12" />
                    Generate Formal Message
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* RIGHT SIDE: Output and Actions */}
          <div className="flex flex-col h-full lg:pt-16">
            <AnimatePresence mode="wait">
              {!generatedText ? (
                // Empty State - Glassmorphism Effect
                <motion.div 
                  key="empty"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-white/20 rounded-2xl bg-white/5 backdrop-blur-lg min-h-[400px] shadow-2xl shadow-black/50"
                >
                  <motion.div 
                    initial={{ scale: 0.5, rotate: 0 }}
                    animate={{ scale: 1, rotate: 360 }}
                    transition={{ type: "spring", stiffness: 100, damping: 10 }}
                    className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center shadow-inner mb-4 border border-white/10"
                  >
                    <Sparkles size={28} className="text-white/50" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-white/70">AI Output Pending</h3>
                  <p className="text-white/50 max-w-xs mt-2 text-sm">
                    Your polished announcement will appear here, ready for instant sharing.
                  </p>
                </motion.div>
              ) : (
                // Result State - Glassmorphism Effect
                <motion.div 
                  key="result"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="h-full flex flex-col"
                >
                  <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl shadow-black/50 flex-1 flex flex-col overflow-hidden">
                    
                    {/* HEADER - Black/White Glass */}
                    <div className="bg-white/10 p-4 px-6 flex justify-between items-center text-white border-b border-white/10">
                      <div className="flex items-center gap-2">
                        {/* Status dot remains slightly green for functional clarity */}
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" /> 
                        <span className="font-bold text-sm tracking-wider">FORMATTED ANNOUNCEMENT</span>
                      </div>
                      <span className="text-xs font-mono text-white/50 bg-black/50 px-2 py-1 rounded-md border border-white/10">
                        {tone.toUpperCase()}
                      </span>
                    </div>

                    {/* CONTENT - Black/White Inner Glass */}
                    <div className="p-8 bg-black/10 flex-1 overflow-y-auto">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="bg-black/60 p-6 rounded-xl border border-white/10 shadow-lg text-white/85 leading-relaxed whitespace-pre-wrap font-medium text-base"
                      >
                        {generatedText}
                      </motion.div>
                    </div>

                    {/* ACTIONS - Black/White Glass */}
                    <div className="p-6 bg-white/5 border-t border-white/10 flex flex-col gap-3">
                      
                      {/* WhatsApp Button - Accent remains for functional clarity */}
                      <motion.button 
                        onClick={handleWhatsApp}
                        whileHover={{ scale: 1.01, backgroundColor: '#10B981' }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center justify-center gap-3 bg-emerald-500 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-950/40 active:scale-95"
                      >
                        <MessageCircle size={20} />
                        Send via WhatsApp
                      </motion.button>

                      {/* Copy Button - Black/White style with smooth motion */}
                      <motion.button 
                        onClick={handleCopy}
                        whileHover={{ scale: 1.01, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white/80 py-3.5 rounded-xl font-bold hover:bg-white/20 transition-all active:scale-95"
                      >
                        {isCopied ? <CheckCircle size={18} className="text-white/50" /> : <Copy size={18} />}
                        {isCopied ? 'Text Copied!' : 'Copy Text'}
                      </motion.button>

                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Announcement;