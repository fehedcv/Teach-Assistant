import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Download,
  Copy,
  Check,
  Save,
  Share2,
  Sparkles,
  Printer
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

// --- LessonPreview Component (Dark Theme) ---
const LessonPreview = () => {
  // Hooks for Navigation and State retrieval
  const navigate = useNavigate();
  const location = useLocation();

  // State from react-router-dom
  const passedLessonPlan = location.state?.lessonPlan || "";
  const passedLessonDetails = location.state?.lessonDetails || null;
  
  // Internal Component State
  const [loading, setLoading] = useState(true);
  const [generatedPlan, setGeneratedPlan] = useState("");
  const [copied, setCopied] = useState(false);

  // Load the lesson plan with a simulated delay
  useEffect(() => {
    setTimeout(() => {
      setGeneratedPlan(passedLessonPlan || "⚠️ No lesson plan data was provided.");
      setLoading(false);
    }, 500);
  }, [passedLessonPlan]);

  // Handler for Copy to Clipboard
  const handleCopy = () => {
    if (generatedPlan) {
      navigator.clipboard.writeText(generatedPlan);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  // ------------------------------------------------------------------
  // 💡 FUNCTIONALITY HANDLERS (Print, Export PDF, Save, Share)
  // ------------------------------------------------------------------

  // 1. Print Handler
  const handlePrint = () => {
    // Triggers the browser's native print dialog
    window.print();
  };

  // 2. Export PDF Handler (UPDATED FOR CLARITY - Uses Print-to-PDF method)
  const handleExportPDF = () => {
    // This function tells the browser to open the print dialog.
    // The user must then select 'Save as PDF' from the destination/printer options.
    handlePrint();
  };

  // 3. Save Handler (Saves content as a .txt file)
  const handleSave = () => {
    const filename = `${passedLessonDetails?.topic || "Lesson_Plan"}_${new Date().toLocaleDateString()}.txt`;
    const element = document.createElement('a');
    
    // Create a Blob containing the content
    const file = new Blob([generatedPlan], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element); 
    element.click();
    document.body.removeChild(element); 
  };

  // 4. Share Handler (Uses Web Share API or falls back to an alert)
  const handleShare = async () => {
    const shareData = {
      title: `Lesson Plan: ${passedLessonDetails?.topic || 'Untitled'}`,
      text: generatedPlan.substring(0, 100) + '...', // Short preview of content
      url: window.location.href, // Link to the preview page
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        console.log('Lesson shared successfully.');
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback
      alert(`Share functionality not supported. Copy the URL:\n${window.location.href}`);
    }
  };
  
  // ------------------------------------------------------------------
  // 💡 Function to process Markdown (Placeholder)
  // ------------------------------------------------------------------
  const renderMarkdown = (markdownText) => {
    // Simple simulation of formatting:
    let html = markdownText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // Bold
    html = html.replace(/\n\n/g, '<p>'); // Convert double newline to paragraphs
    html = html.replace(/\n\-/g, '<li>'); // Convert hyphen newlines to list items (simple simulation)

    return html;
  };

  // --- UI Structure (Dark Theme) ---
  return (
    <div className="min-h-screen bg-gray-900 font-sans flex flex-col antialiased">
      
      {/* 🚀 Header: Sticky Navigation Bar */}
      <header className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 shadow-xl">
        
        {/* 🔄 Back to Dashboard Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")} 
            className="p-2 hover:bg-gray-700 rounded-full text-gray-300 transition-colors flex items-center gap-2 group"
            aria-label="Back to Dashboard"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-sm hidden sm:inline">Back to Dashboard</span>
          </button>
        </div>

        {/* Action Buttons */}
        {!loading && (
          <div className="flex gap-3">
            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 bg-gray-900 border border-gray-700 rounded-lg hover:bg-gray-700 hover:text-indigo-400 transition-colors active:scale-95"
            >
              {copied ? (
                <Check size={16} className="text-emerald-400" />
              ) : (
                <Copy size={16} />
              )}
              {copied ? "Copied" : "Copy Text"}
            </button>

            {/* Export PDF Button (Primary Action - calls handleExportPDF) */}
            <button 
              onClick={handleExportPDF} // <-- Attached handler
              className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 shadow-lg shadow-indigo-800/40 transition-all active:scale-95"
              aria-label="Export as PDF"
            >
              <Download size={18} />
              Export PDF
            </button>
          </div>
        )}
      </header>

      {/* 📝 Main Content Area */}
      <main className="flex-1 p-4 lg:p-10 flex items-start justify-center">
        
        {loading ? (
          // --- Loading State UI ---
          <div className="flex flex-col items-center justify-center mt-20 text-center space-y-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-indigo-900 border-t-indigo-400 rounded-full animate-spin"></div>
              <Sparkles
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-indigo-400"
                size={32}
              />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-100">
                Generating Lesson Plan…
              </h2>
              <p className="text-gray-400 mt-2">
                Topic:
                <span className="font-semibold text-indigo-400 ml-1">
                  {passedLessonDetails?.topic || "N/A"}
                </span>
              </p>
            </div>
          </div>
        ) : (
          // --- Result Display UI ---
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-4xl bg-gray-800 min-h-[85vh] shadow-2xl border border-gray-700 rounded-xl overflow-hidden flex flex-col"
          >
            {/* Document Toolbar */}
            <div className="h-14 bg-gray-900 border-b border-gray-700 flex items-center justify-between px-6">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Lesson Plan Preview
              </span>

              {/* Utility Icons */}
              <div className="flex gap-1">
                {/* Print Button */}
                <button 
                  onClick={handlePrint} // <-- Attached handler
                  className="p-2 text-gray-500 hover:text-indigo-400 hover:bg-gray-700 rounded transition-all" 
                  aria-label="Print"
                >
                  <Printer size={18} />
                </button>
                {/* Save Button */}
                <button 
                  onClick={handleSave} // <-- Attached handler
                  className="p-2 text-gray-500 hover:text-indigo-400 hover:bg-gray-700 rounded transition-all" 
                  aria-label="Save"
                >
                  <Save size={18} />
                </button>
                {/* Share Button */}
                <button 
                  onClick={handleShare} // <-- Attached handler
                  className="p-2 text-gray-500 hover:text-indigo-400 hover:bg-gray-700 rounded transition-all" 
                  aria-label="Share"
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            {/* Lesson Plan Content - Now using formatted HTML */}
            <div className="flex-1 p-8 md:p-16 overflow-y-auto">
              <div 
                className="prose prose-lg prose-invert max-w-none text-gray-300"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(generatedPlan) }}
              >
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-900 p-4 border-t border-gray-700 text-center text-xs text-gray-500">
              Generated by AI • Loaded via navigation state • {new Date().toLocaleDateString()}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default LessonPreview;