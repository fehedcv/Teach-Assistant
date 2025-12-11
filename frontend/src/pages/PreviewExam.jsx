import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Download, ArrowLeft, ArrowRight,
  Printer, CheckCircle, Clock, Users, Link, Copy, Share2, Zap
} from 'lucide-react';

const PreviewExam = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copyStatus, setCopyStatus] = useState(false); // State for copy status

  // Retrieve examId from state → fallback to localStorage
  const examId = location.state?.examId || localStorage.getItem("exam_id");

  // Define the base URL for the exam session
  const CONDUCT_EXAM_BASE_URL = window.location.origin;
  const examSessionLink = examData ? `${CONDUCT_EXAM_BASE_URL}/conduct-exam/${examData.exam_id}` : '';

  useEffect(() => {
    if (!examId) return;

    const fetchExam = async () => {
      try {
        setLoading(true);
        // NOTE: The IP is hardcoded in the original code, this is kept for consistency
        const res = await fetch(`http://localhost:8000/api/v1/questions/exam/${examId}`);
        const data = await res.json();

        if (!data || !data[0]) {
          console.error("Exam data not found or invalid");
          setExamData(null);
          return;
        }

        const rawData = data[0];

        // --- FIX: Simplified Mapping Logic (Logic preserved) ---
        const mcqs = (rawData.mcq || []).map(q => ({ ...q, type: 'MCQ', marks: 1 }));
        const shortAnswers = (rawData.three_mark || []).map(q => ({ ...q, type: 'Short Answer', marks: 3 }));

        const longAnswersList = [
          ...(rawData.one_mark || []),
          ...(rawData.seven_mark || []),
          ...(rawData.five_mark || []),
          ...(rawData.long_answer || [])
        ];
        const longAnswers = longAnswersList.map(q => ({ ...q, type: 'Long Answer', marks: 7 }));

        const questions = [
          ...mcqs,
          ...shortAnswers,
          ...longAnswers
        ];

        setExamData({
          exam_id: rawData.exam_id,
          questions,
          totalMarks: questions.reduce((sum, q) => sum + (q.marks || 0), 0),
          title: `Exam #${rawData.exam_id}`
        });
      } catch (err) {
        console.error("Failed to fetch exam:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [examId]);

  // Handler for copying the exam link
  const handleCopyLink = () => {
    if (examSessionLink) {
      navigator.clipboard.writeText(examSessionLink).then(() => {
        setCopyStatus(true);
        setTimeout(() => setCopyStatus(false), 2000); // Reset status after 2 seconds
      }).catch(err => {
        console.error('Failed to copy link: ', err);
      });
    }
  };

  if (!examId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
        <h2 className="text-xl font-bold text-neutral-200">No Exam ID Found</h2>
        <button onClick={() => navigate('/dashboard')} className="mt-4 text-white underline decoration-white/30 hover:decoration-white">Back to Dashboard</button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <span className="text-white font-bold text-lg animate-pulse tracking-widest uppercase text-xs">Loading Exam Data...</span>
      </div>
    );
  }

  if (!examData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
        <h2 className="text-xl font-bold text-neutral-200">Failed to Load Exam</h2>
        <button onClick={() => navigate('/dashboard')} className="mt-4 text-white underline decoration-white/30 hover:decoration-white">Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-12 px-4 sm:px-6 lg:px-8 font-sans text-neutral-200 selection:bg-white/20 relative overflow-hidden">

      {/* Background Ambient Glow (Kept Dark) */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-neutral-900/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-neutral-800/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Header Navigation (Kept Dark) */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">

          {/* Back to Dashboard Button */}
          <button
            onClick={() => navigate('/dashboard')}
            className="group flex items-center gap-3 text-neutral-400 hover:text-white transition-colors pl-2"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-white/20 transition-all">
              <ArrowLeft size={18} />
            </div>
            <span className="text-sm font-medium tracking-wide">Back to Dashboard</span>
          </button>

          <div className="px-4 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-bold flex items-center gap-2 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)] uppercase tracking-wider">
            <CheckCircle size={12} /> AI Generated Successfully
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: The Exam Canvas (SWITCHED TO LIGHT THEME) */}
          <div className="lg:col-span-8 w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              // Lightened background
              className="bg-white shadow-2xl rounded-2xl border border-slate-200 overflow-hidden flex flex-col relative"
              style={{ height: '850px', maxHeight: '85vh' }}
            >
              
              {/* Document Top Bar (Visual) */}
              <div className="flex-none h-1 w-full bg-gradient-to-r from-slate-200 via-indigo-200 to-slate-200 opacity-50"></div>

              {/* Paper Header */}
              <div className="flex-none p-8 md:p-10 text-center border-b border-slate-100 bg-white">
                <h1 className="text-3xl font-serif font-bold text-slate-800 tracking-wide mb-6">
                  {examData.title}
                </h1>
                
                <div className="inline-flex flex-wrap justify-center gap-px bg-slate-200 p-px rounded-lg overflow-hidden">
                  <div className="bg-white px-6 py-2 flex flex-col items-center min-w-[100px]">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Total Marks</span>
                    <span className="text-slate-900 font-mono font-bold text-lg">{examData.totalMarks}</span>
                  </div>
                  <div className="bg-white px-6 py-2 flex flex-col items-center min-w-[100px]">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Duration</span>
                    <span className="text-slate-900 font-mono font-bold text-lg">60m</span>
                  </div>
                  <div className="bg-white px-6 py-2 flex flex-col items-center min-w-[100px]">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Questions</span>
                    <span className="text-slate-900 font-mono font-bold text-lg">{examData.questions.length}</span>
                  </div>
                </div>
              </div>

              {/* Questions Area - Readable Type Canvas */}
              <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent bg-slate-50">
                {examData.questions.map((q, idx) => (
                  <div key={idx} className="relative group">
                    <div className="flex gap-6">
                      
                      {/* Accurate Numbering Column */}
                      <div className="flex-none pt-1">
                        <span className="block w-8 h-8 rounded-full border border-slate-300 text-slate-800 font-mono text-sm flex items-center justify-center bg-white shadow-md">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start gap-4 mb-4">
                          
                          {/* Markdown Rendered Question (Inverted Prose removed) */}
                          <div className="text-lg text-slate-900 leading-relaxed font-normal prose max-w-none prose-p:leading-relaxed prose-headings:font-serif prose-code:text-indigo-600 prose-code:bg-indigo-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {q.question}
                            </ReactMarkdown>
                          </div>
                          
                          <span className="flex-none text-xs font-mono text-slate-500 pt-1">
                            [{q.marks} pts]
                          </span>
                        </div>

                        {/* MCQ Options */}
                        {q.type === 'MCQ' && (
                          <div className="grid grid-cols-1 gap-3 pl-2">
                            {q.options.map((opt, i) => (
                              <div key={i} className="group/opt flex items-center gap-4 p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-white transition-all cursor-pointer">
                                <span className="flex-none w-6 h-6 rounded border border-slate-400 flex items-center justify-center text-xs text-slate-600 group-hover/opt:border-indigo-600 group-hover/opt:text-indigo-600 transition-colors">
                                  {String.fromCharCode(65+i)}
                                </span>
                                <div className="text-slate-700 transition-colors prose prose-sm m-0">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{opt}</ReactMarkdown>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Theory Lines */}
                        {q.type !== 'MCQ' && (
                            <div className="mt-8 space-y-3 opacity-50 border-l border-slate-200/50 pl-4">
                               <div className="h-px bg-slate-300 w-full" />
                               <div className="h-px bg-slate-300 w-full" />
                               <div className="h-px bg-slate-300 w-full" />
                               {q.marks > 3 && <div className="h-px bg-slate-300 w-full" />}
                               {q.marks > 5 && <div className="h-px bg-slate-300 w-full" />}
                            </div>
                        )}

                      </div>
                    </div>
                  </div>
                ))}
                
                {/* End of Paper Indicator */}
                <div className="flex items-center justify-center gap-4 py-8 opacity-50 text-slate-500">
                    <div className="h-px w-12 bg-slate-300"></div>
                    <span className="text-xs uppercase tracking-widest">End of Exam</span>
                    <div className="h-px w-12 bg-slate-300"></div>
                </div>
              </div>

            </motion.div>
          </div>

          {/* Right Column: Actions (Kept Dark) */}
          <div className="lg:col-span-4 space-y-6">

            {/* --- SHARE EXAM LINK CARD (Replaced Conduct Exam) --- */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="relative group"
            >
              {/* Gradient Border Glow */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400/30 to-indigo-400/10 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
              
              <div className="relative bg-[#0F0F0F] p-8 rounded-[1.4rem] border border-white/10 h-full overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <Link size={120} />
                </div>

                <div className="relative z-10 flex flex-col h-full">
                  <div className="w-12 h-12 bg-indigo-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                    <Share2 size={24} fill="currentColor" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2">Share Exam Link</h3>
                  <p className="text-neutral-400 text-sm mb-6 leading-relaxed">
                    Copy the unique link to share with students for the live session.
                  </p>

                  <div className="flex flex-col gap-3">
                    {/* Display/Copy Link */}
                    <div className="flex items-center bg-neutral-800/50 rounded-xl p-3 border border-neutral-700/50 text-xs text-neutral-400">
                      <Link size={14} className="flex-none mr-2 text-indigo-400" />
                      <span className="truncate">{examSessionLink || 'Link not available'}</span>
                    </div>

                    {/* Copy Button */}
                    <button 
                      onClick={handleCopyLink}
                      className={`w-full relative overflow-hidden rounded-xl py-3 px-6 font-bold transition-transform active:scale-[0.98] flex items-center justify-center gap-2 text-sm ${
                        copyStatus 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      {copyStatus ? (
                        <>
                          <CheckCircle size={16} /> Link Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={16} /> Copy Exam Link
                        </>
                      )}
                    </button>

                    {/* Optional: Launch Button for immediate testing/launch */}
                    {/* <button
                      onClick={() => navigate(`/conduct-exam/${examData.exam_id}`)}
                      className="w-full group/btn relative overflow-hidden rounded-xl bg-black border border-white/10 text-neutral-400 py-3 px-6 font-bold hover:bg-white/5 hover:text-white transition-all active:scale-95 text-sm"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                           Go to Session <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform"/>
                        </span>
                    </button> */}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Export PDF */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-neutral-900/40 backdrop-blur-md p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-colors"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-neutral-800 text-neutral-300 rounded-2xl border border-white/5">
                  <Printer size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Export Paper</h3>
                  <p className="text-xs text-neutral-500">PDF Format • A4 Size</p>
                </div>
              </div>

              <button
                onClick={() => {
                  const pdfUrl = `http://localhost:8000/api/v1/questions/exam/${examData.exam_id}/pdf`;
                  window.open(pdfUrl, "_blank");
                }}
                className="w-full flex items-center justify-center gap-2 bg-black border border-white/10 text-neutral-400 py-3 rounded-xl font-bold hover:bg-white/5 hover:text-white transition-all active:scale-95 text-sm"
              >
                <Download size={16} />
                Download PDF
              </button>
            </motion.div>
            
            {/* View Results Button */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-neutral-900/40 backdrop-blur-md p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-colors"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-neutral-800 text-neutral-300 rounded-2xl border border-white/5">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">View Results</h3>
                  <p className="text-xs text-neutral-500">See student performance & analytics</p>
                </div>
              </div>

              <button
                onClick={() => {
                  localStorage.setItem("exam_id", examData.exam_id); // persist exam id
                  navigate(`/result-exam/${examData.exam_id}`);
                }}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition-all active:scale-95 text-sm shadow-lg shadow-indigo-500/20"
              >
                <ArrowRight size={16} />
                Open Results
              </button>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewExam;