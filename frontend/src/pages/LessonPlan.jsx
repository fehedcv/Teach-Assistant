import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Clock, GraduationCap, AlignLeft, Sparkles, UploadCloud, 
  FileType, Trash2, ChevronLeft, Minus, Plus, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ------------------------------
// 1. PDFJS Imports and Configuration
// ------------------------------
import * as pdfjsLib from 'pdfjs-dist';
// IMPORT THE WORKER DIRECTLY FROM NODE_MODULES (Vite/Bundler specific)
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Configure the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
// ------------------------------

const LessonPlan = () => {

  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [syllabusMode, setSyllabusMode] = useState('text');
  const [isGenerating, setIsGenerating] = useState(false);

  const gradeOptions = [
    { label: "Schooling", options: ["Kindergarten", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"] },
    { label: "Diploma / Vocational", options: ["Polytechnic Diploma", "ITI (Industrial Training)", "Vocational Course"] },
    { label: "Undergraduate (UG)", options: ["B.Tech / B.E.", "B.Sc", "B.Com", "B.A.", "BBA", "BCA", "MBBS", "B.Pharm"] },
    { label: "Postgraduate (PG)", options: ["M.Tech / M.E.", "M.Sc", "M.Com", "M.A.", "MBA", "MCA", "PhD / Research"] },
  ];

  const [gradeSelect, setGradeSelect] = useState('Grade 10');
  const [formData, setFormData] = useState({
    topic: '',
    duration: 1.0,
    grade: 'Grade 10',
    syllabusText: '',
    syllabusFile: null
  });

  // -----------------------
  // PDF Text Extraction Logic
  // -----------------------
  const extractTextFromPDF = async (file) => {
    // 1. Read file as ArrayBuffer
    const data = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });

    try {
      // 2. Load the PDF document
      const pdf = await pdfjsLib.getDocument({ data }).promise;
      let fullText = '';

      // 3. Iterate through all pages
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        // 4. Extract and join text items, separated by a space/newline
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
      }

      return fullText;
    } catch (error) {
      console.error("PDF Parsing Error:", error);
      throw new Error("Could not parse PDF content.");
    }
  };
  // -----------------------

  // -----------------------
  // Helpers & Handlers
  // -----------------------

  const handleDurationChange = (amount) => {
    setFormData(prev => ({
      ...prev,
      duration: Math.max(0.5, +(prev.duration + amount).toFixed(1))
    }));
  };

  const formatDurationDisplay = (hours) => {
    if (hours < 1) return `${Math.round(hours * 60)} Mins`;
    if (hours === 1) return "1 Hour";
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m === 0 ? `${h} Hours` : `${h} Hr ${m} Mins`;
  };

  const handleGradeSelectChange = (e) => {
    const value = e.target.value;
    setGradeSelect(value);

    setFormData(prev => ({
      ...prev,
      grade: value === "Other" ? "" : value
    }));
  };

  const handleCustomGradeChange = (e) => {
    setFormData(prev => ({ ...prev, grade: e.target.value }));
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // When a file is selected, switch to 'upload' mode and clear any text input
      setSyllabusMode("upload"); 
      setFormData(prev => ({ ...prev, syllabusFile: file, syllabusText: '' }));
    }
  };

  const removeFile = () => {
    setFormData(prev => ({ ...prev, syllabusFile: null }));
    if (fileInputRef.current) fileInputRef.current.value = "";
    // Optionally switch back to text mode if the file was removed
    setSyllabusMode("text"); 
  };

  // -----------------------
  // UPDATED SUBMIT WITH PDF PARSING 🔥
  // -----------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (gradeSelect === "Other" && !formData.grade.trim()) {
      alert("Please enter a custom grade level.");
      return;
    }
    
    // Ensure Topic is provided
    if (!formData.topic.trim()) {
      alert("Please enter a Topic/Chapter Name.");
      return;
    }

    setIsGenerating(true);

    let specificFocusContent = formData.syllabusText || "";
    const endpoint = "http://localhost:5678/webhook/lessonplan/generate";

    try {
      // 1. Handle PDF file extraction first
      if (formData.syllabusFile) {
        specificFocusContent = await extractTextFromPDF(formData.syllabusFile);
      }
      
      // 2. Determine API payload structure
      let response;

      // Note: The previous component's file logic passed the file directly 
      // via FormData. This component is designed to send *text* in the payload 
      // regardless of the source (text input or PDF extract).
      // We are converting the file to text and sending a single JSON payload.

      const payload = {
        topic: formData.topic,
        grade: formData.grade, // Added grade to the payload
        hours: formData.duration,
        specific_focus: specificFocusContent // This contains the extracted PDF text or syllabusText
      };
      
      console.log('Final Lesson Plan Payload:', payload);

      response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });


      // -------- SAFE JSON PARSER FIX (Same as previous fix) -------- //
      const raw = await response.text();

      if (!response.ok) {
        console.error("SERVER ERROR:", raw);
        alert(`Server error (${response.status}). Details in console.`);
        return;
      }

      if (!raw) {
        console.error("EMPTY RESPONSE FROM SERVER");
        alert("Server returned empty response.");
        return;
      }

      let data;
      try {
        data = JSON.parse(raw);
      } catch (err) {
        console.error("INVALID JSON FROM SERVER:", raw);
        alert("Server returned invalid JSON. Check console.");
        return;
      }
      // -------------------------------------- //

      console.log("API RESPONSE:", data);

      const id = data.id || Math.floor(Math.random() * 1000);

      navigate(`/dashboard/lesson-plan/preview/${id}`, {
        state: { lessonPlan: data.output }
      });

    } catch (err) {
      console.error("GENERATION ERROR:", err);
      // More specific error based on source
      const errorMsg = formData.syllabusFile && err.message.includes("PDF") 
        ? "Failed to extract text from PDF. Please try again or use text input." 
        : "Failed to connect to the server or generate the plan.";
        
      alert(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  // -----------------------
  // JSX UI (Remains unchanged below this point)
  // -----------------------

  return (
    <div className="min-h-screen bg-black font-sans flex flex-col text-neutral-200 selection:bg-white/20 relative overflow-hidden">

      {/* Background Ambient Glow */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-neutral-900/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-neutral-800/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="h-20 bg-black/50 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/10 border border-white/10 rounded-xl flex items-center justify-center text-white">
            <BookOpen size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Lesson Plan Generator</h1>
            <p className="text-xs text-neutral-500 hidden sm:block tracking-wide">Create structured teaching guides</p>
          </div>
        </div>

        <button 
          onClick={() => navigate('/dashboard')}
          className="group flex items-center gap-2 text-sm text-neutral-400 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-all"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Back to Dashboard
        </button>
      </header>

      {/* MAIN */}
      <main className="flex-1 overflow-y-auto p-4 lg:p-10 relative z-10">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >

          <div className="bg-neutral-900/60 backdrop-blur-xl p-6 lg:p-10 rounded-3xl shadow-2xl border border-white/10">

            <h2 className="text-lg font-bold text-white mb-8 flex items-center gap-3 border-b border-white/5 pb-4">
              <span className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center text-sm font-bold">1</span>
              Configure Lesson Details
            </h2>

            <form onSubmit={handleSubmit} className="space-y-8">

              {/* TOPIC */}
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wider">Topic / Chapter Name</label>
                <div className="relative group">
                  <BookOpen className="absolute left-4 top-3.5 text-neutral-500 group-hover:text-white transition-colors" size={18} />
                  <input 
                    type="text"
                    name="topic"
                    value={formData.topic}
                    onChange={handleInputChange}
                    placeholder="e.g. Thermodynamics, Data Structures..."
                    required
                    disabled={isGenerating}
                    className="w-full pl-11 pr-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:ring-1 focus:ring-white/30 focus:border-white/30 outline-none text-white placeholder:text-neutral-600 transition-all"
                  />
                </div>
              </div>

              {/* GRID */}
              <div className="grid grid-cols-1 md:grid-cols-1 gap-1">

                {/* Grade selection */}
                <div className="flex flex-col">
                  

                  <AnimatePresence>
                    {gradeSelect === "Other" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      >
                        <input 
                          type="text"
                          value={formData.grade}
                          onChange={handleCustomGradeChange}
                          disabled={isGenerating}
                          placeholder="Enter custom grade..."
                          className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:ring-1 focus:ring-white/30 focus:border-white/30 outline-none"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wider">Duration</label>
                  <div className="flex items-center gap-3">

                    <button type="button"
                      disabled={isGenerating}
                      onClick={() => handleDurationChange(-0.5)}
                      className="w-12 h-[50px] flex items-center justify-center rounded-xl border border-white/10 bg-black/50 hover:bg-white/10 text-white transition-colors disabled:opacity-50"
                    >
                      <Minus size={20} />
                    </button>

                    <div className="flex-1 relative group">
                      <Clock className="absolute left-4 top-3.5 text-neutral-500 group-hover:text-white transition-colors" size={18} />
                      <div className="w-full pl-11 py-3 bg-black/50 border border-white/10 rounded-xl text-center font-semibold text-white">
                        {formatDurationDisplay(formData.duration)}
                      </div>
                    </div>

                    <button type="button"
                      disabled={isGenerating}
                      onClick={() => handleDurationChange(0.5)}
                      className="w-12 h-[50px] flex items-center justify-center rounded-xl border border-white/10 bg-black/50 hover:bg-white/10 text-white transition-colors disabled:opacity-50"
                    >
                      <Plus size={20} />
                    </button>

                  </div>
                </div>

              </div>

              {/* SYLLABUS CONTEXT */}
              <div className="p-6 bg-black/30 rounded-2xl border border-white/5">

                <label className="block text-xs font-semibold text-neutral-400 mb-4 uppercase tracking-wider">Syllabus Context (Optional)</label>

                <div className="flex bg-black/50 p-1 rounded-xl mb-4 border border-white/10">
                  <button
                    type="button"
                    onClick={() => setSyllabusMode("text")}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                      syllabusMode === "text" ? "bg-neutral-800 text-white shadow-lg border border-white/10" : "text-neutral-500 hover:text-neutral-300"
                    }`}
                  >
                    <AlignLeft size={16} /> Text
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setSyllabusMode("upload")}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                      syllabusMode === "upload" ? "bg-neutral-800 text-white shadow-lg border border-white/10" : "text-neutral-500 hover:text-neutral-300"
                    }`}
                  >
                    <UploadCloud size={16} /> Upload
                  </button>
                </div>

                {syllabusMode === "text" ? (
                  <textarea 
                    name="syllabusText"
                    value={formData.syllabusText}
                    onChange={handleInputChange}
                    rows="5"
                    disabled={isGenerating}
                    placeholder="Paste syllabus modules here..."
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl resize-none text-white focus:ring-1 focus:ring-white/30 focus:border-white/30 outline-none placeholder:text-neutral-600"
                  />
                ) : (
                  <div 
                    className="border border-dashed border-neutral-700 rounded-xl p-8 text-center bg-black/20 hover:bg-black/40 transition-colors"
                  >
                    {formData.syllabusFile ? (
                      <div className="flex items-center justify-between bg-neutral-800/50 p-3 rounded-lg border border-white/10">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-black/50 rounded-lg flex items-center justify-center text-white border border-white/10">
                            <FileType size={20} />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-bold text-white">{formData.syllabusFile.name}</p>
                            <p className="text-xs text-neutral-500">
                              {(formData.syllabusFile.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>

                        <button 
                          type="button" 
                          onClick={removeFile} 
                          className="text-neutral-500 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={isGenerating}
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full cursor-pointer group"
                      >
                        <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-neutral-700 transition-colors">
                          <UploadCloud className="h-6 w-6 text-neutral-400 group-hover:text-white" />
                        </div>
                        <p className="text-sm font-medium text-neutral-300 group-hover:text-white">Click to upload PDF</p>
                        <p className="text-xs text-neutral-500">Max size: 10MB</p>
                      </button>
                    )}

                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                )}

              </div>

              {/* SUBMIT BUTTON */}
              <button 
                type="submit"
                disabled={!formData.topic || !formData.grade || isGenerating}
                className="w-full bg-white hover:bg-neutral-200 text-black font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Generate Lesson Plan
                  </>
                )}
              </button>

            </form>

          </div>

        </motion.div>

      </main>

    </div>
  );
};

export default LessonPlan;