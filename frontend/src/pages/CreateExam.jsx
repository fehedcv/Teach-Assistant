import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, CheckCircle, FileUp, ListChecks, Layers, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// Change this section in your code
import * as pdfjsLib from 'pdfjs-dist';

// IMPORT THE WORKER DIRECTLY FROM NODE_MODULES
// Note the .mjs extension and ?url suffix
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Configure the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const CreateExam = () => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [inputType, setInputType] = useState('text');
  const [examMode, setExamMode] = useState('normal');
  const [formData, setFormData] = useState({
    topic: '',
    syllabusText: '',
    file: null,
    fileTopic: '', // Note: Currently not used in API payload, but kept for UI state
    difficulty: 'Medium',
    normalMcqCount: 5,
    q3Count: 4,
    q7Count: 2,
    totalMcqOnly: 20
  });

  const handleChange = (e) => {
  const { name, value } = e.target;

  // 1. Handle all string fields (Topic, Syllabus, Difficulty, File Topic) directly
  if (['topic', 'syllabusText', 'difficulty', 'fileTopic'].includes(name)) {
    setFormData((prev) => ({ ...prev, [name]: value }));
    return;
  }

  // 2. Handle all numeric count fields
  let val = parseInt(value, 10) || 0;
  val = Math.max(0, val); // Ensure non-negative

  // Apply maximum constraints
  if (name === 'normalMcqCount') val = Math.min(val, 20);
  else if (['q3Count', 'q7Count'].includes(name)) val = Math.min(val, 10);
  else if (name === 'totalMcqOnly') val = Math.min(val, 50);

  setFormData((prev) => ({ ...prev, [name]: val }));
};

  // ------------------------------
  // 📌 EXTRACT TEXT FROM PDF USING pdfjs-dist (Browser-Friendly)
  // ------------------------------
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

  const API_URL = 'http://localhost:5678/webhook/exam/generate-ai';

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsGenerating(true);

    let syllabusContent = null; // Renamed from syllabusUrl to better reflect content

    // ------------------------------
    // 📌 EXTRACT TEXT OR USE ENTERED TEXT
    // ------------------------------
    if (inputType === 'file' && formData.file) {
      try {
        syllabusContent = await extractTextFromPDF(formData.file);
      } catch (err) {
        setIsGenerating(false);
        console.error(err);
        alert('Error extracting text from PDF. Please ensure the file is valid.');
        return;
      }
    } else {
      syllabusContent = formData.syllabusText || null;
    }
    
    // Ensure either a topic or syllabus content is provided
    if (!formData.topic && !syllabusContent) {
         setIsGenerating(false);
         alert('Please enter a Topic or provide Syllabus Content.');
         return;
    }


    let counts;
    if (examMode === 'mcq') {
      counts = {
        mcq: formData.totalMcqOnly,
        three_mark: 0,
        one_mark: 0 // Using 'one_mark' for 7-mark questions as per original code context, though 'seven_mark' might be clearer.
      };
    } else {
      counts = {
        mcq: formData.normalMcqCount,
        three_mark: formData.q3Count,
        one_mark: formData.q7Count
      };
    }

    const payload = {
      topic: formData.topic || formData.fileTopic, // Use topic or fileTopic for the main exam title
      teacher_id: 1, // Assuming static ID for now
      class_id: 1,   // Assuming static ID for now
      difficulty: formData.difficulty.toLowerCase(),
      counts,
      syllabus_url: syllabusContent // Sending the text content in the payload
    };

    console.log('FINAL REQUEST PAYLOAD:', payload);

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      const examId = data.exam_id;

      localStorage.setItem('exam_id', examId);

      setIsGenerating(false);

      navigate('/preview-exam', {
        state: { examData: data, examId }
      });
    } catch (err) {
      setIsGenerating(false);
      console.error('Error generating exam:', err);
      alert(`Failed to generate exam! Details: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-black pt-12 pb-12 px-4 sm:px-6 lg:px-8 font-sans text-neutral-200">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate('/dashboard')}
          className="group flex items-center gap-2 text-neutral-500 hover:text-white mb-6"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>

        {/* MAIN CARD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-neutral-900/60 border rounded-3xl p-8"
        >
          <div className="flex items-center gap-4 mb-8">
            <Brain size={24} className="text-white" />
            <div>
              <h1 className="text-2xl font-bold text-white">Create New Exam</h1>
            </div>
          </div>

          <form onSubmit={handleGenerate} className="space-y-8">
            {/* INPUT SWITCH */}
            <div>
              <label className="text-xs text-neutral-400">Content Source</label>
              <div className="flex bg-neutral-800 p-1 rounded-xl mb-4">
                <button
                  type="button"
                  onClick={() => setInputType('text')}
                  className={`flex-1 py-2 rounded-lg transition-colors ${inputType === 'text' ? 'bg-neutral-700 text-white' : 'text-neutral-400'}`}
                >
                  Text Topic
                </button>
                <button
                  type="button"
                  onClick={() => setInputType('file')}
                  className={`flex-1 py-2 rounded-lg transition-colors ${inputType === 'file' ? 'bg-neutral-700 text-white' : 'text-neutral-400'}`}
                >
                  Upload PDF
                </button>
              </div>

              <AnimatePresence>
                {inputType === 'text' ? (
                  <motion.div key="text" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
                    <input
                      type="text"
                      name="topic"
                      value={formData.topic}
                      onChange={handleChange}
                      placeholder="Enter Exam Topic (Required)"
                      className="w-full p-3 bg-neutral-900 border border-neutral-700 rounded-xl focus:ring-1 focus:ring-white focus:border-white"
                      required
                    />

                    <textarea
                      name="syllabusText"
                      rows="3"
                      value={formData.syllabusText}
                      onChange={handleChange}
                      className="w-full p-3 mt-3 bg-neutral-900 border border-neutral-700 rounded-xl focus:ring-1 focus:ring-white focus:border-white"
                      placeholder="Paste syllabus/detailed notes (Optional, highly recommended for quality)"
                    />
                  </motion.div>
                ) : (
                  <motion.div key="file" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
                    <label className="flex flex-col items-center justify-center w-full h-32 border border-dashed border-neutral-600 rounded-xl cursor-pointer bg-neutral-900/40 hover:border-white transition-colors">
                      {formData.file ? (
                        <>
                          <CheckCircle className="text-green-400 mb-2" />
                          <p className="text-sm font-medium">{formData.file.name}</p>
                        </>
                      ) : (
                        <>
                          <FileUp className="text-neutral-500 mb-2" />
                          <p className="text-sm text-neutral-400">Click to Upload PDF</p>
                        </>
                      )}

                      <input
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => setFormData((prev) => ({ ...prev, file: e.target.files[0], topic: '' }))} // Clear text topic when file is selected
                      />
                    </label>

                    {formData.file && (
                      <div className="mt-3">
                        <input
                          type="text"
                          name="fileTopic"
                          value={formData.fileTopic}
                          onChange={handleChange}
                          placeholder="Enter Topic for Uploaded PDF (Required)"
                          className="w-full p-3 bg-neutral-900 border border-neutral-700 rounded-xl focus:ring-1 focus:ring-white focus:border-white"
                          required
                        />
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* EXAM MODE */}
            <div>
              <label className="text-xs text-neutral-400 mb-2 block">Exam Format</label>
              <div className="grid grid-cols-2 gap-4">
                <div
                  onClick={() => setExamMode('normal')}
                  className={`p-5 rounded-xl cursor-pointer transition-colors border ${examMode === 'normal' ? 'bg-neutral-800 border-white' : 'bg-neutral-900 border-neutral-700'}`}
                >
                  <Layers />
                  <p className="mt-2 text-sm font-medium">Normal Exam (Mixed)</p>
                </div>

                <div
                  onClick={() => setExamMode('mcq')}
                  className={`p-5 rounded-xl cursor-pointer transition-colors border ${examMode === 'mcq' ? 'bg-neutral-800 border-white' : 'bg-neutral-900 border-neutral-700'}`}
                >
                  <ListChecks />
                  <p className="mt-2 text-sm font-medium">MCQ Only</p>
                </div>
              </div>
            </div>

            {/* QUESTION SETTINGS */}
            <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-700">
              <h3 className="text-lg font-semibold mb-4 text-white">Question Counts</h3>
              
              <AnimatePresence mode="wait">
                {examMode === 'normal' ? (
                  <motion.div key="normal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="flex justify-between items-center py-2 border-b border-neutral-800">
                      <span>MCQs (Max 20)</span>
                      <input
                        type="number"
                        name="normalMcqCount"
                        value={formData.normalMcqCount}
                        onChange={handleChange}
                        className="w-20 p-2 bg-black/50 border border-neutral-700 rounded-lg text-center"
                      />
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-neutral-800">
                      <span>3 Mark Questions (Max 10)</span>
                      <input
                        type="number"
                        name="q3Count"
                        value={formData.q3Count}
                        onChange={handleChange}
                        className="w-20 p-2 bg-black/50 border border-neutral-700 rounded-lg text-center"
                      />
                    </div>

                    <div className="flex justify-between items-center py-2">
                      <span>7 Mark Questions (Max 10)</span>
                      <input
                        type="number"
                        name="q7Count"
                        value={formData.q7Count}
                        onChange={handleChange}
                        className="w-20 p-2 bg-black/50 border border-neutral-700 rounded-lg text-center"
                      />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="mcq" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="flex justify-between items-center py-2">
                      <span>Total MCQs (Max 50)</span>
                      <input
                        type="number"
                        name="totalMcqOnly"
                        value={formData.totalMcqOnly}
                        onChange={handleChange}
                        className="w-20 p-2 bg-black/50 border border-neutral-700 rounded-lg text-center"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* GENERATE BUTTON */}
            <button 
              type="submit"
              disabled={isGenerating} 
              className="w-full bg-white text-black py-4 rounded-xl font-bold transition-all duration-200 hover:bg-neutral-200 disabled:bg-neutral-500 disabled:text-neutral-900"
            >
              {isGenerating ? 'AI is generating... Please wait' : 'Generate Exam'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateExam;
