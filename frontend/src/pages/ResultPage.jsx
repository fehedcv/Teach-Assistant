import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Award, Zap, CheckCircle, XCircle, ArrowLeft } from 'lucide-react'; // Added relevant icons

const ResultPage = () => {
  const { examId, studentId } = useParams();
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        // API Endpoint logic is preserved
        const res = await axios.get(
          `http://localhost:8000/api/v1/exams/${examId}/student/${studentId}`
        );
        setResultData(res.data);
      } catch (err) {
        console.error("Failed to fetch results:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [examId, studentId]);

  // --- Loading/Error States (Themed) ---
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-black"><span className="text-white font-bold text-lg animate-pulse">Loading Results...</span></div>;
  if (!resultData) return <div className="min-h-screen flex items-center justify-center bg-black"><span className="text-white font-bold text-lg">No results found for student {studentId}.</span></div>;

  const scorePercentage = (resultData.score / resultData.total_marks) * 100;
  const passed = scorePercentage >= 50; // Assuming 50% is passing

  // --- Main Render ---
  return (
    <div className="min-h-screen bg-black pt-12 pb-12 px-4 sm:px-6 lg:px-8 font-sans text-neutral-200 relative">
      {/* Background Ambient Glow */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-neutral-900/40 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">
        
        {/* Header Block & Summary */}
        <header className="mb-8 p-6 bg-neutral-900 border border-white/10 rounded-2xl shadow-xl">
            <div className="flex items-center gap-4 border-b border-white/5 pb-4 mb-4">
                <Award size={36} className={passed ? 'text-emerald-400' : 'text-red-500'} />
                <h1 className="text-3xl font-bold text-white tracking-tight">Exam Results</h1>
            </div>

            <div className="flex justify-between items-center">
                <p className="text-lg font-medium text-neutral-300">
                    <strong className="text-white">Student ID:</strong> {studentId}
                </p>
           
            </div>
        </header>

        {/* Question-by-Question Feedback */}
        <h2 className="text-xl font-bold mb-4 text-neutral-300 flex items-center gap-2">
            <Zap size={20} className="text-white/80" /> Detailed Breakdown
        </h2>
        
        <div className="space-y-4">
            {resultData.results.map((item, idx) => {
                const isCorrect = item.is_correct;
                const borderClass = isCorrect ? 'border-emerald-500/30' : 'border-red-500/30';
                const icon = isCorrect ? <CheckCircle size={20} className="text-emerald-500" /> : <XCircle size={20} className="text-red-500" />;
                const statusText = isCorrect ? 'Correct' : 'Incorrect';

                return (
                    <div key={idx} className={`p-4 bg-neutral-900/50 border-l-4 rounded-xl space-y-3 shadow-md ${borderClass}`}>
                        
                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                            <p className="font-bold text-lg text-white flex items-center gap-2">
                                Q{idx + 1}: {icon} {statusText}
                            </p>
                            <span className="text-xs font-mono text-neutral-400">
                                {isCorrect ? `+${item.marks}` : `+0`} pts
                            </span>
                        </div>

                        <p className="text-sm text-neutral-300">
                            <strong className="text-white">Your Answer:</strong> {item.student_answer || 'N/A'}
                        </p>
                        
                        {/* Only show Correct Answer if it was missed or needed */}
                        {!isCorrect && (
                             <p className="text-sm text-red-400">
                                <strong className="text-white">Expected:</strong> {item.correct_answer || 'N/A'}
                            </p>
                        )}
                        
                        {item.feedback && (
                            <div className="text-xs p-3 bg-black/30 rounded text-neutral-400 border border-white/5">
                                <strong>AI Feedback:</strong> {item.feedback}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>

      
        
      </div>
    </div>
  );
};

export default ResultPage;