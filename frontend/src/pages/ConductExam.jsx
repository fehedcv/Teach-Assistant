import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Users, BookOpen, Lock, Play, ArrowRight, Loader2, CheckCircle, Zap } from 'lucide-react'; 
import { motion, AnimatePresence } from 'framer-motion';

// --- Submission Success Modal Component (X.AI Theme) ---
const SuccessModal = ({ examId, rollNumber, onClose, onRedirect }) => {
    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        >
            <motion.div
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-neutral-900/95 border border-emerald-500/30 p-8 rounded-2xl max-w-sm w-full text-center shadow-2xl space-y-6"
            >
                <CheckCircle size={48} className="text-emerald-500 mx-auto" />
                <h3 className="text-2xl font-bold text-white">Exam Submitted!</h3>
                <p className="text-sm text-neutral-400">
                    Your answers have been securely submitted for grading.
                </p>
                <button 
                    onClick={onRedirect}
                    className="w-full bg-emerald-500 text-black py-3 rounded-xl font-bold hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2"
                >
                    View Results 
                    <ArrowRight size={18} />
                </button>
            </motion.div>
        </motion.div>
    );
};

const ConductExam = () => {
    const { examId } = useParams();
    const navigate = useNavigate();
    const [examData, setExamData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [studentName, setStudentName] = useState('');
    const [rollNumber, setRollNumber] = useState('');
    const [answers, setAnswers] = useState({});
    const [examStarted, setExamStarted] = useState(false);
    
    // New States for UX
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);


    // Fetch exam (Logic updated for null checks)
    useEffect(() => {
        if (!examId) return;
        const fetchExam = async () => {
            try {
                setLoading(true);
                // API endpoint preserved
                const res = await fetch(`http://localhost:8000/api/v1/questions/exam/${examId}`);
                const data = await res.json();

                // 🌟 FIX APPLIED HERE: Use the Logical OR (|| []) to prevent TypeError if a category is null 🌟
                const exam = data[0];
                const mcqQuestions = exam.mcq || [];
                const oneMarkQuestions = exam.one_mark || [];
                const threeMarkQuestions = exam.three_mark || [];

                const questions = [
                    ...mcqQuestions.map(q => ({ ...q, type: 'MCQ', marks: 1 })),
                    ...oneMarkQuestions.map(q => ({ ...q, type: 'Theory', marks: 1 })),
                    ...threeMarkQuestions.map(q => ({ ...q, type: 'Theory', marks: 3 })),
                ];

                setExamData({
                    exam_id: exam.exam_id,
                    questions,
                    totalMarks: questions.reduce((sum, q) => sum + (q.marks || 1), 0),
                    title: `Exam #${exam.exam_id}`
                });
            } catch (err) {
                // The previous error was a TypeError, but we still log generic fetch errors.
                console.error("Failed to fetch exam:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchExam();
    }, [examId]);

    // Cheat prevention (Logic preserved)
    useEffect(() => {
        const handleVisibility = () => {
            if (document.hidden) alert("Switching tabs is not allowed!");
        };
        const handleResize = () => {
            alert("Resizing window is not allowed!");
        };
        document.addEventListener('visibilitychange', handleVisibility);
        window.addEventListener('resize', handleResize);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibility);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleStart = () => {
        if (!studentName || !rollNumber) return alert("Enter name and roll number!");
        setExamStarted(true);
    };

    const handleAnswerChange = (idx, value) => {
        setAnswers(prev => ({ ...prev, [idx]: value }));
    };

    // --- UPDATED SUBMIT HANDLER (Logic Preserved, UX added) ---
    const handleSubmit = async () => {
        const items = examData.questions.map((q, i) => ({
            question: q.question,
            type: q.type === 'MCQ' ? 'mcq' : q.marks === 1 ? 'one_mark' : 'three_mark',
            options: q.options || undefined,
            student_answer: answers[i] || '',
            marks: q.type === 'MCQ' ? (answers[i] === q.correct_answer ? 1 : 0) : q.marks
        }));

        const payload = {
            exam_id: examData.exam_id,
            student_id: rollNumber,
            items
        };

        setIsSubmitting(true); // START LOADING

        try {
            // API endpoint preserved (with fixed URL structure from previous context)
            await axios.post('http://localhost:5678/webhook/exam/submit', payload);
            
            // Replaced alert with modal display
            setShowSuccessModal(true); 
            
        } catch (err) {
            console.error(err);
            alert("Failed to submit exam.");
        } finally {
            setIsSubmitting(false); // STOP LOADING
        }
    };

    // --- Redirect Logic called from Modal (Preserved) ---
    const redirectToResults = () => {
        navigate(`/exam/${examData.exam_id}/student/${rollNumber}/result`);
    };

    // --- Loading/Error States ---
    if (loading) return <div className="min-h-screen flex items-center justify-center bg-black"><span className="text-white font-bold text-lg animate-pulse">Loading Exam...</span></div>;
    if (!examData) return <div className="min-h-screen flex items-center justify-center bg-black"><span className="text-white font-bold text-lg">Exam not found.</span></div>;

    // --- Start Screen ---
    if (!examStarted) {
        return (
            <div className="min-h-screen bg-black pt-12 flex flex-col items-center px-4">
                {/* Ambient Glow */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-900/20 rounded-full blur-[100px]"></div>

                <div className="w-full max-w-md mx-auto mt-24 bg-neutral-900/90 backdrop-blur-md border border-white/10 text-neutral-200 p-8 shadow-2xl rounded-3xl space-y-6 relative z-10">
                    
                    <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                        <Lock size={24} className="text-red-500" />
                        <h2 className="text-2xl font-bold text-white">Secure Exam Start</h2>
                    </div>

                    <input 
                        type="text" placeholder="Full Name" 
                        className="bg-black/50 border border-neutral-700 p-3 w-full rounded-xl text-white placeholder:text-neutral-500 focus:ring-1 focus:ring-white/30"
                        value={studentName} onChange={e => setStudentName(e.target.value)}
                    />
                    <input 
                        type="text" placeholder="Roll Number / Student ID" 
                        className="bg-black/50 border border-neutral-700 p-3 w-full rounded-xl text-white placeholder:text-neutral-500 focus:ring-1 focus:ring-white/30"
                        value={rollNumber} onChange={e => setRollNumber(e.target.value)}
                    />
                    <div className="text-xs text-neutral-500 pt-2">
                        Warning: This exam is proctored. Switching tabs or resizing the window is monitored.
                    </div>
                    <button 
                        onClick={handleStart} 
                        className="w-full bg-white text-black py-3 rounded-xl font-bold mt-4 hover:bg-neutral-200 transition-colors shadow-lg active:scale-[0.99] flex items-center justify-center gap-2"
                    >
                        <Play size={20} fill="currentColor" /> Start Exam
                    </button>
                </div>
            </div>
        );
    }

    // --- Exam Screen ---
    return (
        <div className="min-h-screen bg-black p-6 md:p-10 text-neutral-200">
            
            <AnimatePresence>
                {showSuccessModal && (
                    <SuccessModal 
                        examId={examData.exam_id} 
                        rollNumber={rollNumber} 
                        onClose={() => setShowSuccessModal(false)}
                        onRedirect={redirectToResults}
                    />
                )}
            </AnimatePresence>

            {/* Header/Title Bar */}
            <header className="flex justify-between items-center bg-neutral-900/80 backdrop-blur-md border border-white/10 rounded-xl p-4 mb-8 sticky top-6 z-10 shadow-lg">
                <h1 className="text-xl font-bold text-white flex items-center gap-3">
                    <BookOpen size={20} className="text-emerald-400" /> {examData.title}
                </h1>
                <div className="text-sm font-medium text-neutral-400 flex items-center gap-4">
                    <span className="bg-neutral-800 px-3 py-1 rounded-full border border-white/5">Marks: {examData.totalMarks}</span>
                    <span className="bg-neutral-800 px-3 py-1 rounded-full border border-white/5">Ques: {examData.questions.length}</span>
                </div>
            </header>

            {/* Questions Container */}
            <div className="max-w-4xl mx-auto bg-neutral-900/60 backdrop-blur-sm shadow-2xl rounded-2xl border border-white/10 overflow-hidden p-6 md:p-8 space-y-10">
                
                {examData.questions.map((q, idx) => (
                    <div key={idx} className="space-y-4 border-b border-white/5 pb-6 last:border-b-0">
                        
                        {/* Question Header */}
                        <div className="flex justify-between items-start gap-4">
                            <p className="font-medium text-lg text-neutral-100">
                                <span className="text-neutral-400 font-mono mr-2">{idx + 1}.</span> {q.question}
                            </p>
                            <span className="text-xs text-neutral-500 bg-neutral-800 px-2 py-1 rounded border border-white/5 shrink-0">[{q.marks} pts]</span>
                        </div>

                        {/* Answer Input Area */}
                        {q.type === 'MCQ' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-6">
                                {/* Options are assumed to be [ "A) Option A", "B) Option B", ... ] */}
                                {q.options.map((opt, i) => (
                                    <label key={i} className="flex items-center gap-3 p-3 border border-neutral-700 rounded-xl cursor-pointer hover:bg-neutral-800/50 transition-colors">
                                        <input
                                            type="radio"
                                            name={`question-${idx}`}
                                            value={opt[0]} // Assuming the answer value is the first character (A, B, C...)
                                            checked={answers[idx] === opt[0]}
                                            onChange={e => handleAnswerChange(idx, e.target.value)}
                                            className="form-radio text-emerald-500 bg-neutral-900 border-neutral-700 focus:ring-emerald-500"
                                        />
                                        <span className="text-sm text-neutral-300">{opt}</span>
                                    </label>
                                ))}
                            </div>
                        ) : (
                            <textarea
                                className="bg-neutral-800 border border-neutral-700 p-3 w-full rounded-xl text-white placeholder:text-neutral-500 focus:ring-1 focus:ring-white/30 resize-none min-h-[120px]"
                                rows={q.marks >= 3 ? 6 : 3} // Dynamic height based on marks
                                placeholder="Type your answer here..."
                                value={answers[idx] || ''}
                                onChange={e => handleAnswerChange(idx, e.target.value)}
                            />
                        )}
                    </div>
                ))}

                {/* Submit Button */}
                <button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting} // Disable during submission
                    className="w-full bg-emerald-500 text-black py-3 rounded-xl font-bold mt-6 hover:bg-emerald-400 transition-colors shadow-lg active:scale-[0.99] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <><Loader2 size={20} className="animate-spin" /> Submitting...</>
                    ) : (
                        <><Users size={20} /> Submit Exam</>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ConductExam;