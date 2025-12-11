import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import Footer from './components/Footer'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import CreateExam from './pages/CreateExam'
import ConductExam from './pages/ConductExam'
import PreviewExam from './pages/PreviewExam'
import Announcement from './pages/Announcments'
import StudentExam from './pages/StudentExam'
import StudentLogin from './pages/StudentLogin'
import LessonPlan from './pages/LessonPlan'
import LessonPreview from './pages/LessonPreview'
import ResultExam from './pages/ResultExam'
import ResultPage from './pages/ResultPage'

const App = () => {
  const location = useLocation();

  // Navbar and Footer ONLY on home page ("/")
  const showLayout = location.pathname === "/";

  return (
    <div className="bg-slate-50 min-h-screen">

      {/* Show Navbar only on home page */}
      {/* {showLayout && <Navbar />} */}

      {/* Routes */}
      <Routes>
        <Route path="/conduct-exam/:examId" element={<ConductExam/>} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/create-exam" element={<CreateExam />} />
        <Route path="/preview-exam" element={<PreviewExam />} />
        <Route path="/result-exam" element={<ResultExam />} />
        <Route path="/dashboard/announcements" element={<Announcement />} />
        <Route path="/student-exam" element={<StudentExam />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/dashboard/lesson-plan" element={<LessonPlan />} />
        <Route path="/dashboard/lesson-plan/preview/:id" element={<LessonPreview />} />
        <Route path="/exam/:examId/student/:studentId/result" element={<ResultPage />} />
        <Route path="*" element={<div className="p-6">Page Not Found</div>} />
        <Route path="/result-exam/:exam_id" element={<ResultExam/>} />
      </Routes>

      {/* Show Footer only on home page */}
      {/* {showLayout && <Footer />} */}

    </div>
  );
};

export default App;
