import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Send,
  Plus,
  BookOpen,
  Terminal,
  Layers,
  Video,
  ExternalLink,
  ChevronRight,
  Compass,
  ArrowRight,
  CheckCircle2,
  Trash2,
  Sliders,
  X,
  Play,
  Check,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

const formatDuration = (minutes) => {
  if (!minutes || minutes <= 0) return '45 mins';
  if (minutes < 60) return `${minutes} mins`;
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  if (remainingMins === 0) return `${hours} hr${hours > 1 ? 's' : ''}`;
  return `${hours} hr${hours > 1 ? 's' : ''} ${remainingMins}m`;
};

const ChatWorkspace = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Courses & Active Course State
  const [courses, setCourses] = useState([]);
  const [activeCourse, setActiveCourse] = useState(null);
  const [loadingCourses, setLoadingCourses] = useState(true);

  // Chat State
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const messagesEndRef = useRef(null);

  // Slide-out Tool Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState('quiz'); // 'quiz' | 'sandbox' | 'roadmap' | 'videos'

  // Assessment Drawer State
  const [assessmentData, setAssessmentData] = useState(null);
  const [assessmentAnswers, setAssessmentAnswers] = useState({});
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [activeItemForQuiz, setActiveItemForQuiz] = useState(null);

  // Code Sandbox State
  const [sandboxCode, setSandboxCode] = useState('// Write or paste your code here\npublic class Solution {\n    public static void main(String[] args) {\n        System.out.println("Hello from the Adaptive Learning Code Sandbox!");\n    }\n}');
  const [sandboxLanguage, setSandboxLanguage] = useState('java');
  const [sandboxOutput, setSandboxOutput] = useState('');
  const [evaluatingCode, setEvaluatingCode] = useState(false);

  // New Course Modal State
  const [showNewCourseModal, setShowNewCourseModal] = useState(false);
  const [newGoal, setNewGoal] = useState('');
  const [newLevel, setNewLevel] = useState('BEGINNER');
  const [newWeeklyHours, setNewWeeklyHours] = useState(8);
  const [creatingCourse, setCreatingCourse] = useState(false);

  // Course Deletion & AI Retune Modal States
  const [showDeleteCourseModal, setShowDeleteCourseModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [deletingCourse, setDeletingCourse] = useState(false);
  const [showAiRetuneModal, setShowAiRetuneModal] = useState(false);
  const [aiIntent, setAiIntent] = useState('');
  const [retuningRoadmap, setRetuningRoadmap] = useState(false);
  const [showAdaptGoalModal, setShowAdaptGoalModal] = useState(false);
  const [adaptGoalInput, setAdaptGoalInput] = useState('');
  const [adaptingGoal, setAdaptingGoal] = useState(false);

  // Fetch student courses on mount
  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      const courseList = res.data || [];
      setCourses(courseList);

      if (courseList.length > 0) {
        const selected = courseId
          ? courseList.find((c) => String(c.id) === String(courseId)) || courseList[0]
          : courseList[0];
        setActiveCourse(selected);
        initChatWithCourse(selected);
      } else {
        setMessages([
          {
            sender: 'AI',
            text: `### Welcome **${user?.fullName || 'Student'}**.\n\nI am your **Socratic AI Learning Mentor**. What subject or career milestone would you like to master? (e.g. *Java Backend Development, Distributed Systems, Cloud Architecture, Python Data Science*).\n\nEnter your objective below to synthesize your personalized curriculum roadmap.`,
            chips: [
              'Java Backend & Spring Boot 3',
              'Distributed Systems & Kafka',
              'Cloud Architecture on AWS',
              'Full Stack React & TypeScript'
            ]
          }
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [courseId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initChatWithCourse = (course) => {
    const total = course.totalMilestones || course.items?.length || 1;
    const done = course.completedMilestones || course.items?.filter((i) => i.status === 'COMPLETED').length || 0;
    const currentItem = course.items?.find((i) => i.status === 'UNLOCKED' || i.status === 'IN_PROGRESS') || course.items?.[0];

    const modulesText = course.items
      ? course.items.map((m) => `* **Module ${m.sequenceOrder}: ${m.title}** (${m.difficultyLevel} • ~${formatDuration(m.estimatedMinutes)})`).join('\n')
      : 'Curriculum loading...';

    setMessages([
      {
        sender: 'AI',
        text: `### Active Curriculum Track: ${course.goalText}\n\n**Progress Overview: ${done}/${total} Milestones Mastered**\n\n${modulesText}\n\nCurrently Active Module: **${currentItem?.title || 'Module 1'}**.\n\nReady to begin lecture reading, resolve conceptual questions, or launch verification assessment?`,
        chips: [
          `Start: ${currentItem?.topicName || 'Module 1'}`,
          'Explain with a mental model analogy',
          'Take verification quiz on active topic',
          'Open Code Sandbox'
        ],
        activeItem: currentItem
      }
    ]);
  };

  const handleSendMessage = async (textToSend = null) => {
    const text = textToSend || inputMsg;
    if (!text.trim() || sendingChat) return;

    const userMessage = { sender: 'STUDENT', text };
    setMessages((prev) => [...prev, userMessage]);
    setInputMsg('');
    setSendingChat(true);

    if (courses.length === 0 || text.toLowerCase().startsWith('i want to learn') || text.toLowerCase().startsWith('create course')) {
      try {
        const goalClean = text.replace(/i want to learn/i, '').replace(/create course/i, '').trim() || text;
        const res = await api.post('/courses/generate', {
          goal: goalClean,
          experienceLevel: 'BEGINNER',
          weeklyHours: 8,
          learningStyle: 'hands-on with analogies'
        });
        const newC = res.data;
        setCourses((prev) => [newC, ...prev]);
        setActiveCourse(newC);
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        initChatWithCourse(newC);
        setSendingChat(false);
        return;
      } catch (e) {
        console.error(e);
      }
    }

    try {
      const activeItem = activeCourse?.items?.find((i) => i.status === 'UNLOCKED' || i.status === 'IN_PROGRESS') || activeCourse?.items?.[0];
      const res = await api.post('/tutor/chat', {
        itemId: activeItem?.id || null,
        message: text
      });

      const aiReply = res.data.reply;
      const chips = [
        'Explain with another analogy',
        'Open Code Sandbox',
        'Take Module Assessment',
        'What is the next architectural step?'
      ];

      if (res.data.adaptedCourse) {
        const updatedCourse = res.data.adaptedCourse;
        setCourses((prev) => prev.map((c) => (c.id === updatedCourse.id ? updatedCourse : c)));
        setActiveCourse(updatedCourse);
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'AI',
          text: aiReply,
          chips,
          activeItem
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'AI',
          text: 'Service momentarily unavailable. Please retry your inquiry.'
        }
      ]);
    } finally {
      setSendingChat(false);
    }
  };

  const handleDeleteCourseInSidebar = async () => {
    if (!courseToDelete) return;
    setDeletingCourse(true);
    try {
      await api.delete(`/courses/${courseToDelete.id}`);
      setShowDeleteCourseModal(false);
      const remaining = courses.filter((c) => c.id !== courseToDelete.id);
      setCourses(remaining);
      setCourseToDelete(null);
      if (activeCourse?.id === courseToDelete.id) {
        if (remaining.length > 0) {
          setActiveCourse(remaining[0]);
          initChatWithCourse(remaining[0]);
        } else {
          setActiveCourse(null);
          setMessages([
            {
              sender: 'AI',
              text: 'Curriculum deleted. What subject or milestone would you like to master next?',
              chips: ['Java Backend & Spring Boot', 'Cloud Architecture on AWS', 'Python Machine Learning']
            }
          ]);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete course');
    } finally {
      setDeletingCourse(false);
    }
  };

  const handleAiRetuneInWorkspace = async (e) => {
    e.preventDefault();
    if (!activeCourse || !aiIntent.trim()) return;
    setRetuningRoadmap(true);
    try {
      const res = await api.post(`/courses/${activeCourse.id}/modify-roadmap`, {
        modificationIntent: aiIntent.trim()
      });
      const updated = res.data;
      setCourses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setActiveCourse(updated);
      setShowAiRetuneModal(false);
      setAiIntent('');
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      setMessages((prev) => [
        ...prev,
        {
          sender: 'AI',
          text: `### Curriculum Successfully Re-tuned\n\nRestructured milestones based on your guidance: *"${aiIntent.trim()}"*.\n\nYour upcoming modules have been updated.`,
          chips: ['Start Next Module', 'View Roadmap Tree', 'Open Sandbox']
        }
      ]);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to re-tune roadmap');
    } finally {
      setRetuningRoadmap(false);
    }
  };

  const handleAdaptGoalInWorkspace = async (e) => {
    e.preventDefault();
    if (!activeCourse || !adaptGoalInput.trim()) return;
    setAdaptingGoal(true);
    try {
      const res = await api.post(`/courses/${activeCourse.id}/adapt-goal`, {
        newGoal: adaptGoalInput.trim()
      });
      const updated = res.data;
      setCourses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setActiveCourse(updated);
      setShowAdaptGoalModal(false);
      setAdaptGoalInput('');
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      setMessages((prev) => [
        ...prev,
        {
          sender: 'AI',
          text: `### Goal Successfully Adapted to: **${updated.goalText}**\n\nAll completed foundation milestones were preserved, and forward topics have been restructured.`,
          chips: ['Start Next Module', 'View Roadmap Tree', 'Open Sandbox']
        }
      ]);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to adapt course goal');
    } finally {
      setAdaptingGoal(false);
    }
  };

  const handleChipClick = (chipText, activeItem) => {
    if (chipText.startsWith('Start:') || chipText.includes('Explain with') || chipText.includes('next')) {
      handleSendMessage(chipText);
    } else if (chipText.includes('verification quiz') || chipText.includes('Assessment')) {
      openAssessmentDrawer(activeItem);
    } else if (chipText.includes('Code Sandbox')) {
      setDrawerTab('sandbox');
      setDrawerOpen(true);
    } else if (chipText.includes('YouTube') || chipText.includes('Videos')) {
      setDrawerTab('videos');
      setDrawerOpen(true);
    } else {
      handleSendMessage(chipText);
    }
  };

  const openAssessmentDrawer = async (item) => {
    const targetItem = item || activeCourse?.items?.find((i) => i.status === 'UNLOCKED') || activeCourse?.items?.[0];
    if (!targetItem) return;

    setActiveItemForQuiz(targetItem);
    setDrawerTab('quiz');
    setDrawerOpen(true);
    setQuizResult(null);
    setAssessmentAnswers({});

    try {
      const res = await api.post(`/assessments/generate-custom/${targetItem.id}`, {
        difficulty: targetItem.difficultyLevel || 'BEGINNER',
        mcqCount: 3,
        includeDescriptive: true,
        includeCoding: true
      });
      setAssessmentData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssessmentSubmit = async () => {
    if (!assessmentData) return;
    setSubmittingQuiz(true);

    try {
      const res = await api.post(`/assessments/${assessmentData.id}/submit`, assessmentAnswers);
      setQuizResult(res.data);

      if (res.data.passed) {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
        if (activeItemForQuiz) {
          await api.put(`/courses/items/${activeItemForQuiz.id}/complete`);
          const updatedCourses = await api.get('/courses');
          setCourses(updatedCourses.data || []);
          const updatedActive = updatedCourses.data?.find((c) => c.id === activeCourse.id);
          if (updatedActive) setActiveCourse(updatedActive);
        }

        setMessages((prev) => [
          ...prev,
          {
            sender: 'AI',
            text: `### Assessment Passed: Score ${res.data.percentage}%\n\n* **Strengths:** ${res.data.strengths?.join(', ') || 'Solid concept mastery'}\n* **Result:** Subsequent module unlocked in your roadmap.`,
            chips: ['Proceed to Next Module', 'Open Learning Profile']
          }
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const handleEvaluateSandboxCode = async () => {
    setEvaluatingCode(true);
    setSandboxOutput('Evaluating syntax, logic, and edge cases...');

    try {
      const res = await api.post('/tutor/chat', {
        itemId: null,
        message: `Please review and evaluate this ${sandboxLanguage} code. Check for syntax correctness, edge cases, and performance:\n\n\`\`\`${sandboxLanguage}\n${sandboxCode}\n\`\`\``
      });
      setSandboxOutput(res.data.reply);
    } catch (err) {
      setSandboxOutput('Evaluation error: Please retry.');
    } finally {
      setEvaluatingCode(false);
    }
  };

  const handleCreateNewCourse = async (e) => {
    e.preventDefault();
    if (!newGoal.trim()) return;
    setCreatingCourse(true);

    try {
      const res = await api.post('/courses/generate', {
        goal: newGoal.trim(),
        experienceLevel: newLevel,
        weeklyHours: parseInt(newWeeklyHours),
        learningStyle: 'hands-on with analogies'
      });

      const created = res.data;
      setCourses((prev) => [created, ...prev]);
      setActiveCourse(created);
      setShowNewCourseModal(false);
      setNewGoal('');
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      initChatWithCourse(created);
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingCourse(false);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-white overflow-hidden">
      
      {/* ------------------------------------------------------------------ */}
      {/* 1. LEFT SIDEBAR: Active Tracks Navigation                          */}
      {/* ------------------------------------------------------------------ */}
      <aside className="w-64 border-r border-stroke-subtle bg-slate-50 flex flex-col justify-between hidden md:flex">
        <div className="p-4 space-y-4 overflow-y-auto">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-crimson-600 uppercase tracking-wider">
              Enrolled Tracks ({courses.length})
            </span>
            <button
              onClick={() => setShowNewCourseModal(true)}
              className="p-1 rounded-sm bg-white hover:bg-slate-100 text-slate-600 hover:text-crimson-600 border border-stroke-subtle transition-colors"
              title="Add New Track"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1">
            {loadingCourses ? (
              <div className="py-6 text-center text-xs font-mono text-slate-500">Loading tracks...</div>
            ) : courses.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-500 space-y-2">
                <p>No active tracks</p>
                <button
                  onClick={() => setShowNewCourseModal(true)}
                  className="text-xs text-crimson-600 font-bold hover:underline"
                >
                  + Add Track
                </button>
              </div>
            ) : (
              courses.map((course) => {
                const isActive = activeCourse?.id === course.id;
                const total = course.totalMilestones || course.items?.length || 1;
                const done = course.completedMilestones || course.items?.filter((i) => i.status === 'COMPLETED').length || 0;
                const pct = Math.round((done / total) * 100);

                return (
                  <div
                    key={course.id}
                    onClick={() => {
                      setActiveCourse(course);
                      initChatWithCourse(course);
                    }}
                    className={`p-3 rounded-sm border cursor-pointer transition-colors group flex items-center justify-between ${
                      isActive
                        ? 'bg-white border-crimson-600 text-obsidian-deep shadow-sm'
                        : 'border-transparent text-slate-600 hover:bg-white hover:text-obsidian-base'
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="text-xs font-bold truncate">{course.goalText}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{done}/{total} Done ({pct}%)</div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCourseToDelete(course);
                        setShowDeleteCourseModal(true);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded-sm transition-opacity"
                      title="Delete Course"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="p-4 border-t border-stroke-subtle">
          <button
            onClick={() => navigate('/courses')}
            className="w-full py-2 bg-white hover:bg-slate-100 border border-stroke-subtle text-slate-700 text-xs font-bold rounded-sm flex items-center justify-center space-x-1.5 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-crimson-600" />
            <span>Course Hub Overview</span>
          </button>
        </div>
      </aside>

      {/* ------------------------------------------------------------------ */}
      {/* 2. MAIN CENTER: Conversational Socratic Stream                     */}
      {/* ------------------------------------------------------------------ */}
      <main className="flex-1 flex flex-col min-w-0 bg-white relative">
        
        {/* Workspace Top Action Ribbon */}
        {activeCourse && (
          <div className="px-6 py-2.5 border-b border-stroke-subtle bg-slate-50/90 flex items-center justify-between gap-4">
            <div className="flex items-center space-x-2 truncate">
              <span className="text-xs font-bold text-obsidian-deep truncate">{activeCourse.goalText}</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm bg-crimson-50 border border-crimson-200 text-crimson-700">
                ACTIVE
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAiRetuneModal(true)}
                className="px-2.5 py-1 rounded-sm bg-white hover:bg-slate-100 border border-stroke-subtle text-slate-700 text-xs font-bold flex items-center space-x-1 transition-colors"
              >
                <Sliders className="w-3.5 h-3.5 text-crimson-600" />
                <span className="hidden sm:inline">AI Re-Tune</span>
              </button>

              <button
                onClick={() => setShowAdaptGoalModal(true)}
                className="px-2.5 py-1 rounded-sm bg-white hover:bg-slate-100 border border-stroke-subtle text-slate-700 text-xs font-bold flex items-center space-x-1 transition-colors"
              >
                <Compass className="w-3.5 h-3.5 text-crimson-600" />
                <span className="hidden sm:inline">Adapt Goal</span>
              </button>

              <button
                onClick={() => {
                  setDrawerTab('roadmap');
                  setDrawerOpen(true);
                }}
                className="px-2.5 py-1 rounded-sm bg-white hover:bg-slate-100 border border-stroke-subtle text-slate-700 text-xs font-bold flex items-center space-x-1 transition-colors"
              >
                <Layers className="w-3.5 h-3.5 text-crimson-600" />
                <span>Roadmap</span>
              </button>

              <button
                onClick={() => {
                  setDrawerTab('sandbox');
                  setDrawerOpen(true);
                }}
                className="px-2.5 py-1 rounded-sm bg-white hover:bg-slate-100 border border-stroke-subtle text-slate-700 text-xs font-bold flex items-center space-x-1 transition-colors"
              >
                <Terminal className="w-3.5 h-3.5 text-crimson-600" />
                <span>Sandbox</span>
              </button>
            </div>
          </div>
        )}

        {/* Message Feed */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {messages.map((m, idx) => {
            const isAi = m.sender === 'AI';
            return (
              <div
                key={idx}
                className={`flex items-start space-x-3 ${isAi ? 'justify-start' : 'justify-end'}`}
              >
                {isAi && (
                  <div className="w-7 h-7 rounded-sm bg-crimson-600 text-white font-mono text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    S
                  </div>
                )}

                <div className={`max-w-3xl space-y-2.5 ${isAi ? 'w-full' : ''}`}>
                  <div
                    className={`p-4 sm:p-5 rounded-sm leading-relaxed text-xs sm:text-sm ${
                      isAi
                        ? 'architectural-card bg-white border border-stroke-subtle text-slate-700 markdown-body shadow-sm'
                        : 'bg-obsidian-base text-white shadow-sm ml-auto w-fit'
                    }`}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {m.text || m.messageText}
                    </ReactMarkdown>
                  </div>

                  {/* Suggestion Chips */}
                  {isAi && m.chips && m.chips.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {m.chips.map((chip, cIdx) => (
                        <button
                          key={cIdx}
                          onClick={() => handleChipClick(chip, m.activeItem)}
                          className="px-2.5 py-1 rounded-sm bg-slate-50 border border-stroke-subtle hover:border-crimson-300 text-slate-600 hover:text-crimson-700 text-[11px] font-medium transition-colors text-left"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {sendingChat && (
            <div className="flex items-center space-x-2 text-slate-500 text-xs p-2 font-mono">
              <div className="w-3.5 h-3.5 border-2 border-crimson-600 border-t-transparent rounded-full animate-spin" />
              <span>Socratic mentor formulating response...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-stroke-subtle bg-slate-50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="max-w-4xl mx-auto flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Ask a question, request an analogy, or type a new goal..."
              className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-sm text-obsidian-base text-xs focus:outline-none focus:border-crimson-600 focus:ring-1 focus:ring-crimson-600"
            />
            <button
              type="submit"
              disabled={sendingChat || !inputMsg.trim()}
              className="px-5 py-2.5 bg-crimson-600 hover:bg-crimson-700 text-white rounded-sm text-xs font-bold uppercase tracking-wider disabled:opacity-40 transition-colors flex items-center space-x-1.5 shadow-sm"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

      </main>

      {/* ------------------------------------------------------------------ */}
      {/* 3. RIGHT SLIDE-OUT UTILITY DRAWER                                  */}
      {/* ------------------------------------------------------------------ */}
      {drawerOpen && (
        <div className="w-96 border-l border-stroke-subtle bg-white flex flex-col justify-between animate-fade-in shadow-modal">
          
          {/* Drawer Header & Tabs */}
          <div className="p-4 border-b border-stroke-subtle bg-slate-50">
            <div className="flex items-center justify-between pb-3">
              <span className="text-xs font-bold text-obsidian-deep uppercase tracking-wider font-mono">
                [ Workspace Utilities ]
              </span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="text-slate-400 hover:text-obsidian-base p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-1 p-1 bg-white rounded-sm border border-stroke-subtle text-[11px] font-bold">
              <button
                onClick={() => setDrawerTab('quiz')}
                className={`py-1 rounded-sm ${drawerTab === 'quiz' ? 'bg-crimson-600 text-white' : 'text-slate-600 hover:text-obsidian-base'}`}
              >
                Quiz
              </button>
              <button
                onClick={() => setDrawerTab('sandbox')}
                className={`py-1 rounded-sm ${drawerTab === 'sandbox' ? 'bg-crimson-600 text-white' : 'text-slate-600 hover:text-obsidian-base'}`}
              >
                Sandbox
              </button>
              <button
                onClick={() => setDrawerTab('roadmap')}
                className={`py-1 rounded-sm ${drawerTab === 'roadmap' ? 'bg-crimson-600 text-white' : 'text-slate-600 hover:text-obsidian-base'}`}
              >
                Roadmap
              </button>
              <button
                onClick={() => setDrawerTab('videos')}
                className={`py-1 rounded-sm ${drawerTab === 'videos' ? 'bg-crimson-600 text-white' : 'text-slate-600 hover:text-obsidian-base'}`}
              >
                Videos
              </button>
            </div>
          </div>

          {/* Drawer Tab Content Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
            
            {/* Tab: Quiz */}
            {drawerTab === 'quiz' && (
              <div className="space-y-4">
                {!quizResult ? (
                  assessmentData ? (
                    <div className="space-y-4">
                      {assessmentData.questions?.map((q, qIdx) => (
                        <div key={q.id || qIdx} className="p-3.5 rounded-sm bg-slate-50 border border-stroke-subtle space-y-2">
                          <span className="text-[10px] font-bold text-crimson-600 font-mono">Q{qIdx + 1}: {q.topic}</span>
                          <p className="text-xs font-bold text-obsidian-base">{q.question_text}</p>
                          <div className="space-y-1.5 pt-1">
                            {q.options?.map((opt, oIdx) => {
                              const isSelected = assessmentAnswers[q.id] === opt;
                              return (
                                <div
                                  key={oIdx}
                                  onClick={() => setAssessmentAnswers({ ...assessmentAnswers, [q.id]: opt })}
                                  className={`p-2.5 rounded-sm border cursor-pointer transition-colors text-[11px] flex items-center justify-between ${
                                    isSelected
                                      ? 'border-crimson-600 bg-crimson-50 text-obsidian-deep font-bold'
                                      : 'border-stroke-subtle bg-white text-slate-700 hover:border-slate-300'
                                  }`}
                                >
                                  <span>{opt}</span>
                                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-crimson-600" />}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}

                      <button
                        onClick={handleAssessmentSubmit}
                        disabled={submittingQuiz}
                        className="w-full py-2.5 bg-crimson-600 hover:bg-crimson-700 text-white font-bold text-xs uppercase rounded-sm shadow-sm flex items-center justify-center space-x-1.5 disabled:opacity-50"
                      >
                        {submittingQuiz ? 'Grading...' : 'Submit Answers'}
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-slate-500 space-y-3">
                      <p>No active assessment loaded.</p>
                      <button
                        onClick={() => openAssessmentDrawer()}
                        className="px-4 py-2 bg-crimson-600 hover:bg-crimson-700 text-white font-bold rounded-sm text-xs uppercase"
                      >
                        Generate Verification Quiz
                      </button>
                    </div>
                  )
                ) : (
                  <div className="p-5 rounded-sm bg-slate-50 border border-stroke-subtle text-center space-y-3">
                    <Award className="w-8 h-8 text-crimson-600 mx-auto" />
                    <h4 className="text-lg font-bold text-obsidian-deep">Score: {quizResult.percentage}%</h4>
                    <p className="text-xs text-slate-600">{quizResult.summary}</p>
                    <button
                      onClick={() => setDrawerOpen(false)}
                      className="px-4 py-2 bg-crimson-600 text-white text-xs font-bold uppercase rounded-sm"
                    >
                      Return to Workspace
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Sandbox */}
            {drawerTab === 'sandbox' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-obsidian-base font-mono">Language:</span>
                  <select
                    value={sandboxLanguage}
                    onChange={(e) => setSandboxLanguage(e.target.value)}
                    className="px-2 py-1 bg-white border border-slate-300 rounded-sm text-obsidian-base text-xs font-mono"
                  >
                    <option value="java">Java</option>
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="sql">SQL</option>
                  </select>
                </div>

                <textarea
                  rows={9}
                  value={sandboxCode}
                  onChange={(e) => setSandboxCode(e.target.value)}
                  className="w-full p-3 bg-obsidian-base text-slate-100 rounded-sm font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-crimson-500"
                />

                <button
                  onClick={handleEvaluateSandboxCode}
                  disabled={evaluatingCode}
                  className="w-full py-2 bg-crimson-600 hover:bg-crimson-700 text-white font-bold text-xs uppercase rounded-sm"
                >
                  {evaluatingCode ? 'Analyzing Code...' : 'Analyze & Evaluate Code'}
                </button>

                {sandboxOutput && (
                  <div className="p-3 rounded-sm bg-slate-50 border border-stroke-subtle text-[11px] font-mono whitespace-pre-wrap text-slate-700">
                    {sandboxOutput}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Roadmap */}
            {drawerTab === 'roadmap' && (
              <div className="space-y-2">
                {activeCourse?.items?.map((item) => {
                  const isDone = item.status === 'COMPLETED';
                  const isUnl = item.status === 'UNLOCKED' || item.status === 'IN_PROGRESS';
                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-sm border flex items-center justify-between ${
                        isDone
                          ? 'border-emerald-200 bg-emerald-50/30'
                          : isUnl
                          ? 'border-crimson-600 bg-white'
                          : 'border-stroke-subtle opacity-50'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-bold text-obsidian-base truncate">{item.title}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{item.difficultyLevel} • ~{formatDuration(item.estimatedMinutes)}</div>
                      </div>
                      {isUnl && (
                        <button
                          onClick={() => {
                            setDrawerOpen(false);
                            handleSendMessage(`Start deep lecture on ${item.topicName}`);
                          }}
                          className="px-2.5 py-1 bg-crimson-600 text-white text-[10px] font-bold uppercase rounded-sm"
                        >
                          Study
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tab: Videos */}
            {drawerTab === 'videos' && (
              <div className="space-y-2">
                <p className="text-[11px] text-slate-500">Recommended tutorials for active module.</p>
                <div className="space-y-2 pt-1">
                  <a
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(activeCourse?.goalText || 'Tutorial')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-sm bg-slate-50 border border-stroke-subtle hover:border-crimson-300 block text-xs"
                  >
                    <div className="font-bold text-obsidian-base">YouTube Masterclass Search</div>
                    <div className="text-[10px] text-crimson-600 font-bold mt-1 flex items-center space-x-1">
                      <span>Search "{activeCourse?.goalText}"</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </a>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 4. MODALS (New Track, Delete, AI Re-tune, Adapt Goal)              */}
      {/* ------------------------------------------------------------------ */}
      {showNewCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="architectural-card w-full max-w-lg bg-white border border-stroke-subtle p-7 shadow-modal relative space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stroke-subtle">
              <div className="space-y-0.5">
                <span className="text-xs font-mono font-bold text-crimson-600 uppercase tracking-widest">[ New Track ]</span>
                <h3 className="text-base font-bold text-obsidian-deep">Synthesize Learning Track</h3>
              </div>
              <button onClick={() => setShowNewCourseModal(false)} className="text-slate-400 hover:text-obsidian-base">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-obsidian-base uppercase tracking-wider mb-1 font-mono">Learning Target</label>
                <input
                  type="text"
                  required
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  placeholder="e.g. Distributed Database Engineering"
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-sm text-obsidian-base text-xs focus:outline-none focus:border-crimson-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-obsidian-base uppercase tracking-wider mb-1 font-mono">Level</label>
                  <select
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-sm text-obsidian-base text-xs focus:outline-none focus:border-crimson-600"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-obsidian-base uppercase tracking-wider mb-1 font-mono">Hours / Week</label>
                  <input
                    type="number"
                    min="2"
                    max="40"
                    value={newWeeklyHours}
                    onChange={(e) => setNewWeeklyHours(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-sm text-obsidian-base text-xs focus:outline-none focus:border-crimson-600"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowNewCourseModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingCourse}
                  className="px-5 py-2 bg-crimson-600 hover:bg-crimson-700 text-white text-xs font-bold uppercase rounded-sm shadow-sm flex items-center space-x-1.5 disabled:opacity-50"
                >
                  {creatingCourse ? 'Generating...' : 'Create Track'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Course Modal */}
      {showDeleteCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="architectural-card w-full max-w-md p-6 bg-white border border-stroke-subtle shadow-modal space-y-4 text-center">
            <div className="w-10 h-10 rounded-sm bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-obsidian-deep">Delete Track?</h3>
              <p className="text-xs text-slate-600">
                Remove <strong className="text-obsidian-base">"{courseToDelete?.goalText}"</strong> from your workspace?
              </p>
            </div>
            <div className="flex justify-center space-x-2 pt-2">
              <button
                onClick={() => setShowDeleteCourseModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCourseInSidebar}
                disabled={deletingCourse}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase rounded-sm shadow-sm"
              >
                {deletingCourse ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Re-tune Modal */}
      {showAiRetuneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="architectural-card w-full max-w-lg p-7 bg-white border border-stroke-subtle shadow-modal relative space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stroke-subtle">
              <div className="space-y-0.5">
                <span className="text-xs font-mono font-bold text-crimson-600 uppercase tracking-widest">[ AI Calibration ]</span>
                <h3 className="text-base font-bold text-obsidian-deep">Re-tune Active Track</h3>
              </div>
              <button onClick={() => setShowAiRetuneModal(false)} className="text-slate-400 hover:text-obsidian-base">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAiRetuneInWorkspace} className="space-y-4">
              <textarea
                rows={4}
                required
                placeholder="Describe how to adjust your curriculum..."
                value={aiIntent}
                onChange={(e) => setAiIntent(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-sm text-obsidian-base text-xs focus:outline-none focus:border-crimson-600"
              />

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAiRetuneModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={retuningRoadmap}
                  className="px-5 py-2 bg-crimson-600 hover:bg-crimson-700 text-white text-xs font-bold uppercase rounded-sm shadow-sm flex items-center space-x-1.5 disabled:opacity-50"
                >
                  {retuningRoadmap ? 'Re-tuning...' : 'Apply Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adapt Goal Modal */}
      {showAdaptGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="architectural-card w-full max-w-lg p-7 bg-white border border-stroke-subtle shadow-modal relative space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stroke-subtle">
              <div className="space-y-0.5">
                <span className="text-xs font-mono font-bold text-crimson-600 uppercase tracking-widest">[ Mid-Track Pivot ]</span>
                <h3 className="text-base font-bold text-obsidian-deep">Adapt Learning Goal</h3>
              </div>
              <button onClick={() => setShowAdaptGoalModal(false)} className="text-slate-400 hover:text-obsidian-base">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdaptGoalInWorkspace} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-obsidian-base uppercase tracking-wider mb-1 font-mono">New Goal Target</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Full-Stack Cloud Architect"
                  value={adaptGoalInput}
                  onChange={(e) => setAdaptGoalInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-sm text-obsidian-base text-xs focus:outline-none focus:border-crimson-600"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAdaptGoalModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adaptingGoal}
                  className="px-5 py-2 bg-crimson-600 hover:bg-crimson-700 text-white text-xs font-bold uppercase rounded-sm shadow-sm flex items-center space-x-1.5 disabled:opacity-50"
                >
                  {adaptingGoal ? 'Adapting...' : 'Pivot Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ChatWorkspace;
