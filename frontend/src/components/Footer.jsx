import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Send, Github, Twitter, Linkedin, Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Helper for Link Groups
  const FooterColumn = ({ title, links }) => (
    <div className="flex flex-col gap-4">
      <h4 className="font-bold text-white tracking-wide">{title}</h4>
      <ul className="flex flex-col gap-2">
        {links.map((link) => (
          <li key={link}>
            <a 
              href="#" 
              className="text-slate-400 hover:text-indigo-400 transition-colors text-sm font-medium"
            >
              {link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer className="bg-slate-900 border-t border-slate-800 pt-20 pb-10 relative overflow-hidden">
      
      {/* Background Glow Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50 shadow-[0_0_30px_rgba(99,102,241,0.5)]" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Top Grid: Logo, Links, Newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* 1. Brand Section */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-900/50">
                <Sparkles size={16} className="fill-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                AI Teacher
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Empowering educators with intelligent tools to automate grading, planning, and communication.
            </p>
            {/* Social Icons */}
            <div className="flex gap-4">
              {[Github, Twitter, Linkedin].map((Icon, idx) => (
                <motion.a 
                  key={idx}
                  whileHover={{ y: -3 }}
                  href="#"
                  className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                >
                  <Icon size={18} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* 2. Product Links */}
          <FooterColumn 
            title="Product" 
            links={['Features', 'Exam Generator', 'Lesson Planner', 'Pricing', 'Updates']} 
          />

          {/* 3. Resources Links */}
          <FooterColumn 
            title="Resources" 
            links={['Help Center', 'Teaching Blog', 'Community', 'Teachers Guide', 'API Docs']} 
          />

          {/* 4. Newsletter (Modern Input) */}
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-white tracking-wide">Stay Updated</h4>
            <p className="text-slate-400 text-sm">Get the latest AI teaching tips right to your inbox.</p>
            <div className="relative">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full bg-slate-800 text-white border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-500 transition-all"
              />
              <button className="absolute right-1 top-1 bottom-1 bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-500 transition-colors shadow-lg">
                <Send size={16} />
              </button>
            </div>
          </div>

        </div>

        {/* Divider */}
        <div className="h-px w-full bg-slate-800 mb-8" />

        {/* Bottom Section: Copyright & Legal */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>© {currentYear} AI Teacher Assistant. All rights reserved.</p>
          
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <span className="flex items-center gap-1 text-slate-600">
              Made with <Heart size={12} className="text-red-500 fill-red-500" /> for Teachers
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;