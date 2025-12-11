import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileDown, RefreshCw, Search, Trophy, 
  Users, TrendingUp, AlertCircle, ArrowLeft,
  CheckCircle, XCircle, Zap, Activity
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

// --- Sub-Component: Stat Card (Updated for Dark Theme) ---
const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-xl flex items-center gap-4 transition-all hover:border-cyan-600/50">
    <div className={`p-3 rounded-xl ${bg} ${color}`}>
      <Icon size={24} strokeWidth={2.5} />
    </div>
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-3xl font-extrabold text-white mt-1">{value}</p>
    </div>
  </div>
);

const ResultExam = () => {
  const navigate = useNavigate();
  const { exam_id } = useParams();

  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [examStats, setExamStats] = useState({
    title: "AI & Machine Learning Exam Results",
    date: "2025-12-05",
    totalStudents: 0,
    averageScore: 0,
    highestScore: 0,
    passPercentage: 0
  });

  const [students, setStudents] = useState([]);

  // ================================
  // FETCH API DATA (Logic remains the same)
  // ================================
  useEffect(() => {
    const fetchExamStats = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/v1/exams/${exam_id}/stats`
        );
        const data = await response.json();

        if (!data || !data.stats) {
          setIsLoading(false);
          return;
        }

        // Group results by student_id
        const grouped = {};
        data.stats.forEach(item => {
          if (!grouped[item.student_id]) {
            grouped[item.student_id] = {
              id: item.student_id,
              name: item.name,
              total: 0,
              max: 0
            };
          }
          grouped[item.student_id].total += item.total_marks;
          grouped[item.student_id].max += item.max_marks;
        });

        // Grade calculation (kept as is)
        const calculateGrade = (percentage) => {
          if (percentage >= 90) return 'A+';
          if (percentage >= 80) return 'A';
          if (percentage >= 70) return 'B+';
          if (percentage >= 60) return 'B';
          if (percentage >= 50) return 'C';
          return 'F';
        };

        // Process each student
        const processedStudents = Object.values(grouped).map(student => {
          const percentage = student.max > 0 
            ? (student.total / student.max) * 100 
            : 0;

          return {
            id: student.id,
            rollNo: `STU${String(student.id).padStart(3, "0")}`,
            name: student.name,
            marks: student.total,
            total: student.max,
            grade: calculateGrade(percentage),
            status: percentage >= 50 ? "Pass" : "Fail"
          };
        });

        processedStudents.sort((a, b) => b.marks - a.marks);

        // Compute global exam stats
        const totalStudents = processedStudents.length;
        const averageScore = totalStudents > 0
          ? Math.round(
              processedStudents.reduce(
                (acc, s) => acc + (s.marks / s.total) * 100,
                0
              ) / totalStudents
            )
          : 0;

        const highestScore = Math.max(...processedStudents.map(s => s.marks), 0);
        // Assuming max possible score is for all students is the max score of a single student * total students,
        // but the current logic is to just take the highest student's score, which is correct for "Highest Score" display.
        const passPercentage = totalStudents > 0 ? Math.round(
          (processedStudents.filter(s => s.status === "Pass").length / totalStudents) * 100
        ) : 0;

        setStudents(processedStudents);
        setExamStats(prev => ({
          ...prev,
          totalStudents,
          averageScore,
          highestScore,
          passPercentage
        }));

        setIsLoading(false);

      } catch (error) {
        console.error("Error fetching exam stats:", error);
        setIsLoading(false);
      }
    };

    fetchExamStats();
  }, [exam_id]);


  // SEARCH FILTER
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-24 pb-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-50">

      {/* Background Grid - Dark/Futuristic */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#1f293722_1px,transparent_1px),linear-gradient(to_bottom,#1f293722_1px,transparent_1px)] bg-[size:40px_40px] opacity-30" />
      {/* Subtle radial glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 -z-10 animate-pulse-slow" />


      <div className="max-w-7xl mx-auto space-y-10">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors mb-2 font-medium"
            >
              <ArrowLeft size={18} /> Back to Analytics Dashboard
            </button>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">{examStats.title}</h1>
            <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
                <Zap size={14} className="text-cyan-400" /> 
                Deployment ID: <span className="text-white font-mono">{exam_id}</span> | Date: {examStats.date}
            </p>
          </div>

          
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={Users} color="text-cyan-400" bg="bg-cyan-900/40" label="Total Students" value={examStats.totalStudents} />
          <StatCard icon={TrendingUp} color="text-emerald-400" bg="bg-emerald-900/40" label="Average Score" value={`${examStats.averageScore}%`} />
          <StatCard icon={Trophy} color="text-fuchsia-400" bg="bg-fuchsia-900/40" label="Highest Score" value={examStats.highestScore} />
          <StatCard icon={Activity} color="text-amber-400" bg="bg-amber-900/40" label="Pass Percentage" value={`${examStats.passPercentage}%`} />
        </div>

        {/* STUDENT TABLE */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl shadow-black/50 overflow-hidden"
        >

          {/* Toolbar */}
          <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-bold text-white">Student Performance Matrix</h2>

            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-3.5 text-slate-500 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search by Name or Student ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-700">
                  <th className="px-6 py-4">Student ID</th>
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4 text-center">Score / Max</th>
                  <th className="px-6 py-4 text-center">Performance (%)</th>
                  <th className="px-6 py-4 text-center">Grade</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {isLoading ? (
                  // Loading skeleton (updated colors)
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-5"><div className="h-4 w-20 bg-slate-800 rounded"></div></td>
                      <td className="px-6 py-5"><div className="h-4 w-40 bg-slate-800 rounded"></div></td>
                      <td className="px-6 py-5"><div className="h-4 w-16 bg-slate-800 rounded mx-auto"></div></td>
                      <td className="px-6 py-5"><div className="h-4 w-24 bg-slate-800 rounded mx-auto"></div></td>
                      <td className="px-6 py-5"><div className="h-6 w-10 bg-slate-800 rounded-lg mx-auto"></div></td>
                      <td className="px-6 py-5"><div className="h-6 w-20 bg-slate-800 rounded-full mx-auto"></div></td>
                    </tr>
                  ))
                ) : (
                  filteredStudents.map(student => (
                    <tr key={student.id} className="hover:bg-slate-800/70 transition-colors group">
                      <td className="px-6 py-5 font-mono text-sm text-cyan-400">{student.rollNo}</td>
                      <td className="px-6 py-5">
                        <div className="font-semibold text-white">{student.name}</div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="font-bold text-white">{student.marks}</span>
                        <span className="text-slate-500 text-sm"> / {student.total}</span>
                      </td>

                      <td className="px-6 py-5 text-center">
                        <div className="w-full bg-slate-700 rounded-full h-1.5 max-w-[100px] mx-auto overflow-hidden">
                          <div 
                            className="bg-cyan-500 h-full rounded-full transition-all duration-700" 
                            style={{ width: `${(student.marks / student.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-400 mt-1 block font-mono">
                          {Math.round((student.marks / student.total) * 100)}%
                        </span>
                      </td>

                      <td className="px-6 py-5 text-center">
                        <span className={`inline-block w-10 h-10 leading-10 rounded-lg text-lg font-extrabold shadow-md ${
                          student.grade.startsWith('A') ? 'bg-emerald-700/50 text-emerald-300 border border-emerald-600' :
                          student.grade.startsWith('B') ? 'bg-blue-700/50 text-blue-300 border border-blue-600' :
                          student.grade === 'F' ? 'bg-red-700/50 text-red-300 border border-red-600' :
                          'bg-amber-700/50 text-amber-300 border border-amber-600'
                        } border`}>
                          {student.grade}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-inner ${
                          student.status === 'Pass'
                            ? 'bg-green-900/40 text-green-400 border border-green-700'
                            : 'bg-red-900/40 text-red-400 border border-red-700'
                        } transition-transform duration-300`}>
                          {student.status === 'Pass' ? <CheckCircle size={14} className="animate-pulse-slow"/> : <XCircle size={14}/>}
                          {student.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {!isLoading && filteredStudents.length === 0 && (
              <div className="p-12 text-center text-slate-600">
                <Search size={32} className="mx-auto mb-3" />
                No student records match the search term: <span className="text-white font-mono">"{searchTerm}"</span>
              </div>
            )}
            
            {!isLoading && students.length === 0 && filteredStudents.length === 0 && searchTerm === '' && (
              <div className="p-12 text-center text-slate-600">
                <AlertCircle size={32} className="mx-auto mb-3" />
                No results data available for this exam yet.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResultExam;