import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import OnboardingWizard from './pages/OnboardingWizard';
import DiagnosticQuiz from './pages/DiagnosticQuiz';
import Dashboard from './pages/Dashboard';
import CourseRoadmap from './pages/CourseRoadmap';
import LessonViewer from './pages/LessonViewer';
import AssessmentRunner from './pages/AssessmentRunner';
import ChatWorkspace from './pages/ChatWorkspace';
import StudentProfile from './pages/StudentProfile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-white text-obsidian-base flex flex-col font-sans">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/onboarding" element={<OnboardingWizard />} />
                <Route path="/diagnostic-quiz" element={<DiagnosticQuiz />} />
                <Route path="/dashboard" element={<ChatWorkspace />} />
                <Route path="/learn" element={<ChatWorkspace />} />
                <Route path="/learn/:courseId" element={<ChatWorkspace />} />
                <Route path="/courses" element={<Dashboard />} />
                <Route path="/courses/:id" element={<CourseRoadmap />} />
                <Route path="/lesson/:itemId" element={<LessonViewer />} />
                <Route path="/assessment/:itemId" element={<AssessmentRunner />} />
                <Route path="/profile" element={<StudentProfile />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
