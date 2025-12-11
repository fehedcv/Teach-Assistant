import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, Hash, AlertCircle, 
  Send, CheckCircle 
} from 'lucide-react';

const StudentExam = () => {
  // --- 1. Mock Data ---
  const student = {
    name: "Alex Johnson",
    rollNo: "CS-24-105",
    avatar: "A"
  };

  const examData = {
    title: "Mid-Term Computer Science",
    duration: 1, // 1 Minute duration for testing
    questions: [
      {
        id: 1,
        type: "MCQ",
        marks: 1,
        question: "Which of the following is a React Hook?",
        options: ["useState", "getState", "fetchState", "pushState"]
      },
      {
        id: 2,
        type: "MCQ",
        marks: 1,
        question: "What is the virtual DOM?",
        options: ["A direct copy of HTML", "A lightweight copy of DOM", "A browser engine", "None of above"]
      },
      {
        id: 3,
        type: "Theory",
        marks: 3,
        question: "Explain the concept of 'Props' in React components with an example."
      },
      {
        id: 4,
        type: "Theory",
        marks: 5,
        question: "Describe the component lifecycle methods in detail."
      }
    ]
  };

  // --- 2. State Management ---
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(examData.duration * 60); 
  const [isSubmitted, setIsSubmitted] = useState(false);

  // --- 3. Timer Logic & Auto Submit ---
  useEffect(() => {
    if (isSubmitted) return; 

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        // If time runs out (0 seconds)
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true); // Auto-submit
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted]);

  // Format Time (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Handle Input Changes
  const handleAnswerChange = (qId, value) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  // --- Handle Submit ---
  const handleSubmit = (autoSubmit = false) => {
    if (!autoSubmit) {
      const confirmSubmit = window.confirm("Are you sure you want to submit the exam?");
      if (!confirmSubmit) return;
    }
    
    // Logic to save answers (e.g., API call)
    console.log("Submitting Answers:", answers); 
    
    setIsSubmitted(true);
    window.scrollTo(0, 0);
  };

  // --- 4. Render Success Screen (No Dashboard Button) ---
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 text-center border border-slate-200"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Exam Submitted!</h2>
          <p className="text-slate-500 mb-6">
            Thank you, {student.name}. <br />
            {timeLeft === 0 ? "Time's up! Your answers were auto-submitted." : "Your responses have been recorded."}
          </p>
          
          <div className="bg-slate-100 p-4 rounded-xl">
             <p className="text-sm text-slate-600 font-medium">
                You answered <span className="text-indigo-600 font-bold">{Object.keys(answers).length}</span> out of {examData.questions.length} questions.
             </p>
          </div>

          {/* Return button removed as requested */}

        </motion.div>
      </div>
    );
  }

  // --- 5. Main Exam UI ---
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      
      {/* HEADER: Student Info & Timer */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
              {student.name.charAt(0)}
            </div>
            <div>
              <h2 className="font-bold text-slate-900">{student.name}</h2>
              <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1"><Hash size={12}/> {student.rollNo}</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                <span>{examData.title}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-900 text-white px-4 py-2 rounded-xl shadow-lg">
            <Clock size={18} className={timeLeft < 30 ? "text-red-400 animate-pulse" : "text-emerald-400"} />
            <span className={`font-mono text-lg font-bold tracking-widest ${timeLeft < 30 ? "text-red-400" : ""}`}>
              {formatTime(timeLeft)}
            </span>
          </div>

        </div>
      </div>

      {/* EXAM CONTENT */}
      <div className="max-w-3xl mx-auto px-4 pt-8 space-y-8">
        
        {examData.questions.map((q, index) => (
          <motion.div 
            key={q.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex gap-3">
                <span className="text-slate-400 select-none">{index + 1}.</span> 
                {q.question}
              </h3>
              <span className="shrink-0 text-xs font-bold px-2 py-1 bg-slate-100 text-slate-500 rounded border border-slate-200">
                {q.marks} Marks
              </span>
            </div>

            {/* RENDER BASED ON QUESTION TYPE */}
            {q.type === 'MCQ' ? (
              <div className="space-y-3 pl-8">
                {q.options.map((option, i) => (
                  <label 
                    key={i} 
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      answers[q.id] === option 
                        ? 'border-indigo-500 bg-indigo-50' 
                        : 'border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      answers[q.id] === option ? 'border-indigo-600' : 'border-slate-300'
                    }`}>
                      {answers[q.id] === option && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full" />}
                    </div>
                    <input 
                      type="radio" 
                      name={`question-${q.id}`} 
                      value={option}
                      onChange={() => handleAnswerChange(q.id, option)}
                      className="hidden"
                    />
                    <span className={`text-sm font-medium ${answers[q.id] === option ? 'text-indigo-900' : 'text-slate-600'}`}>
                      {option}
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="pl-8">
                <textarea 
                  rows={q.marks > 2 ? 6 : 3}
                  placeholder="Type your answer here..."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-slate-700 text-sm leading-relaxed resize-none transition-all"
                  value={answers[q.id] || ''}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                />
                <div className="flex justify-end mt-2">
                  <span className="text-xs text-slate-400 font-medium">
                    {answers[q.id]?.length || 0} characters
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        ))}

        {/* SUBMIT FOOTER */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-30">
          <div className="max-w-3xl mx-auto flex justify-between items-center">
            <div className="text-sm text-slate-500 hidden sm:block">
              <AlertCircle size={14} className="inline mr-1 text-amber-500"/>
              Ensure you have answered all questions.
            </div>
            <button 
              onClick={() => handleSubmit(false)}
              className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-indigo-500/30 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
            >
              Submit Exam <Send size={18} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentExam;