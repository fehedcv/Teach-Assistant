import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Hash, ArrowRight, BookOpen } from 'lucide-react';

const StudentLogin = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    rollNo: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.rollNo) {
      // Pass the data to the parent component instead of navigating
      onLogin(formData);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-800 relative overflow-hidden">
      
      {/* Background Effect */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl p-8 shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600">
            <BookOpen size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Student Exam Portal</h1>
          <p className="text-slate-500 text-sm mt-1">Enter your details to join the session.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
         

          {/* Roll No Input */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Roll Number</label>
            <div className="relative">
              <Hash className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                name="rollNo"
                value={formData.rollNo}
                onChange={handleChange}
                placeholder="e.g. 24CS101"
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium"
                required
              />
            </div>
          </div>

          {/* Join Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 mt-4"
          >
            Start Exam <ArrowRight size={20} />
          </motion.button>

        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400">
            Ensure you have a stable internet connection before starting.
          </p>
        </div>

      </motion.div>
    </div>
  );
};

export default StudentLogin;