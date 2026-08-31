import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import api from '../api/client';
import {
  BookOpen,
  ArrowLeft,
  CheckCircle2,
  Terminal,
  Send,
  Sliders,
  PlayCircle,
  ExternalLink,
  Award,
  Copy,
  Check,
  Compass,
  AlertTriangle,
  ChevronRight,
  X
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

const LessonViewer = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();

  const [lessonData, setLessonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);

  // Socratic AI Chat State
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const [suggestedFollowups, setSuggestedFollowups] = useState([]);

  // Assessment Modal State
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [mcqCount, setMcqCount] = useState(3);
  const [includeDescriptive, setIncludeDescriptive] = useState(true);
  const [includeCoding, setIncludeCoding] = useState(true);
  const [quizDifficulty, setQuizDifficulty] = useState('INTERMEDIATE');

  const messagesEndRef = useRef(null);

  const fetchLesson = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/courses/items/${itemId}/content`);
      const data = res.data || {};
      const topicName = data.topic_name || data.topicName || 'Module Concepts';
      setLessonData({
        ...data,
        topic_name: topicName
      });

      setMessages([
        {
          sender: 'AI',
          messageText: `👋 Hello! I am your Socratic AI Tutor for **${topicName}**.\n\nAsk any conceptual questions, request mental models, or ask for code explanations as you read through.`
        }
      ]);
      setSuggestedFollowups([
        `Explain ${topicName} with a real-world analogy`,
        `What are the most common pitfalls in ${topicName}?`,
        `Give me a quick 1-minute conceptual challenge!`
      ]);
    } catch (err) {
      console.error(err);
      setLessonData({
        topic_name: 'Module Concepts',
        overview: 'Welcome to this module. Use the Socratic companion on the right to explore key concepts.',
        core_concepts_markdown: '### Core Module Notes\n- Master fundamental principles\n- Apply modular workflows\n- Test edge cases',
        practical_examples_markdown: '```\n// Example Code\n```',
        recommended_video_resources: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLesson();
  }, [itemId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (msgToSend = null) => {
    const text = msgToSend || inputMsg;
    if (!text.trim() || sendingChat) return;

    const userMessage = { sender: 'STUDENT', messageText: text };
    setMessages((prev) => [...prev, userMessage]);
    setInputMsg('');
    setSendingChat(true);

    try {
      const res = await api.post('/tutor/chat', {
        itemId: parseInt(itemId),
        message: text
      });

      const aiMessage = { sender: 'AI', messageText: res.data.reply };
      setMessages((prev) => [...prev, aiMessage]);
      if (res.data.suggestedFollowups) {
        setSuggestedFollowups(res.data.suggestedFollowups);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'AI', messageText: 'Service momentarily unavailable. Please retry your inquiry.' }
      ]);
    } finally {
      setSendingChat(false);
    }
  };

  const handleMarkCompleted = async () => {
    try {
      await api.put(`/courses/items/${itemId}/complete`);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      setShowAssessmentModal(true);
    } catch (err) {
      console.error(err);
      setShowAssessmentModal(true);
    }
  };

  const handleStartCustomAssessment = async () => {
    setGeneratingQuiz(true);
    try {
      const res = await api.post(`/assessments/generate/${itemId}`, {
        difficultyLevel: quizDifficulty,
        mcqCount: parseInt(mcqCount),
        includeDescriptive,
        includeCoding
      });

      navigate(`/assessment/${res.data.id}`);
    } catch (err) {
      console.error(err);
      setGeneratingQuiz(false);
    }
  };

  const handleCopyPractical = () => {
    if (lessonData?.practical_examples_markdown) {
      navigator.clipboard.writeText(lessonData.practical_examples_markdown);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-white">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-2 border-crimson-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-slate-500">Synthesizing comprehensive lecture curriculum...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-stroke-subtle">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-obsidian-base transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Roadmap</span>
        </button>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setShowAssessmentModal(true)}
            className="px-3.5 py-1.5 rounded-sm bg-slate-100 hover:bg-slate-200 border border-stroke-subtle text-slate-700 text-xs font-bold flex items-center space-x-1.5 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-crimson-600" />
            <span>Customize Assessment</span>
          </button>

          <button
            onClick={handleMarkCompleted}
            className="px-4 py-1.5 rounded-sm bg-crimson-600 hover:bg-crimson-700 text-white text-xs font-bold uppercase tracking-wider shadow-sm flex items-center space-x-1.5 transition-all"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Take Module Quiz</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Column Reading Environment (7 cols), Right Column Socratic Companion (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Knowledge Platform Reading Environment (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Module Title Card */}
          <div className="architectural-card p-8 bg-white border border-stroke-subtle shadow-card space-y-3 relative">
            <div className="wireframe-corner-crimson" />
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-crimson-50 text-crimson-700 border border-crimson-200">
                Interactive Lecture
              </span>
              <span className="text-xs font-mono text-slate-500">• ~{formatDuration(lessonData?.estimated_minutes || 45)}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-obsidian-deep tracking-tight">
              {lessonData?.topic_name}
            </h1>

            {/* Overview / Mental Model */}
            {lessonData?.overview && (
              <div className="pt-2 text-xs sm:text-sm text-slate-600 leading-relaxed markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {lessonData.overview}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* Deep Core Concepts */}
          {lessonData?.core_concepts_markdown && (
            <div className="architectural-card p-8 bg-white border border-stroke-subtle shadow-card space-y-4">
              <div className="flex items-center space-x-2 pb-3 border-b border-stroke-subtle">
                <BookOpen className="w-4 h-4 text-crimson-600" />
                <h2 className="text-sm font-bold text-obsidian-deep">Core Architectural Principles</h2>
              </div>
              <div className="markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {lessonData.core_concepts_markdown}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {/* Practical Examples & Code Demonstration */}
          {lessonData?.practical_examples_markdown && (
            <div className="architectural-card p-8 bg-white border border-stroke-subtle shadow-card space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stroke-subtle">
                <div className="flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-crimson-600" />
                  <h2 className="text-sm font-bold text-obsidian-deep">Practical Solved Implementation</h2>
                </div>
                <button
                  onClick={handleCopyPractical}
                  className="px-2.5 py-1 rounded-sm bg-slate-100 border border-stroke-subtle hover:bg-slate-200 text-[11px] font-bold text-slate-700 flex items-center space-x-1.5 transition-colors"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>

              <div className="markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {lessonData.practical_examples_markdown}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {/* Common Pitfalls & Mistakes */}
          {lessonData?.common_pitfalls_markdown && (
            <div className="architectural-card p-6 bg-crimson-50/40 border border-crimson-200 space-y-2">
              <div className="flex items-center space-x-2 text-crimson-800">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <h3 className="text-xs font-bold uppercase tracking-wider font-mono">Common Pitfalls & Antipatterns</h3>
              </div>
              <div className="markdown-body text-xs text-slate-700">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {lessonData.common_pitfalls_markdown}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {/* Curated Video Resources */}
          {lessonData?.recommended_video_resources && lessonData.recommended_video_resources.length > 0 && (
            <div className="architectural-card p-8 bg-white border border-stroke-subtle shadow-card space-y-4">
              <div className="flex items-center space-x-2 pb-3 border-b border-stroke-subtle">
                <PlayCircle className="w-4 h-4 text-crimson-600" />
                <h2 className="text-sm font-bold text-obsidian-deep">Curated Video References</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {lessonData.recommended_video_resources.map((v, idx) => (
                  <a
                    key={idx}
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(v.search_query || v.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-sm bg-slate-50 border border-stroke-subtle hover:border-crimson-300 transition-colors flex flex-col justify-between group"
                  >
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-obsidian-deep group-hover:text-crimson-600 transition-colors line-clamp-2">
                        {v.title}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">{v.channel_name || 'Video Lecture'}</div>
                    </div>
                    <div className="pt-3 flex items-center justify-between text-[11px] font-bold text-crimson-600">
                      <span>Watch Tutorial</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Module Complete Action */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleMarkCompleted}
              className="px-6 py-3 bg-crimson-600 hover:bg-crimson-700 text-white font-bold text-xs uppercase tracking-wider rounded-sm shadow-sm flex items-center space-x-2 transition-all"
            >
              <span>Complete Module & Launch Assessment</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Right Column: Socratic AI Tutor Companion (5 cols) */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="architectural-card bg-white border border-stroke-subtle shadow-card flex flex-col h-[650px] overflow-hidden">
            
            {/* Header */}
            <div className="p-4 border-b border-stroke-subtle flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-sm bg-crimson-600 text-white flex items-center justify-center font-mono text-xs font-bold">
                  S
                </div>
                <div>
                  <h3 className="text-xs font-bold text-obsidian-deep">Socratic AI Mentor</h3>
                  <p className="text-[10px] text-slate-500 font-mono">Concept & analogy guidance</p>
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>

            {/* Conversation Stream */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
              {messages.map((m, idx) => {
                const isAi = m.sender === 'AI';
                return (
                  <div
                    key={idx}
                    className={`flex items-start space-x-2.5 ${isAi ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`p-3.5 rounded-sm leading-relaxed max-w-[90%] ${
                        isAi
                          ? 'bg-slate-50 text-slate-700 border border-stroke-subtle markdown-body'
                          : 'bg-obsidian-base text-white'
                      }`}
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {m.messageText}
                      </ReactMarkdown>
                    </div>
                  </div>
                );
              })}
              {sendingChat && (
                <div className="flex items-center space-x-2 text-slate-500 text-[11px] p-2 font-mono">
                  <div className="w-3 h-3 border border-crimson-600 border-t-transparent rounded-full animate-spin" />
                  <span>Formulating Socratic guidance...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Followups */}
            {suggestedFollowups.length > 0 && (
              <div className="px-4 py-2 border-t border-stroke-subtle bg-slate-50/50 flex flex-wrap gap-1.5">
                {suggestedFollowups.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(chip)}
                    className="text-[10px] px-2.5 py-1 rounded-sm bg-white border border-stroke-subtle hover:border-crimson-300 text-slate-600 hover:text-crimson-700 transition-colors text-left"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 border-t border-stroke-subtle bg-slate-50 flex items-center space-x-2"
            >
              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder="Ask any conceptual question..."
                className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-sm text-obsidian-base text-xs focus:outline-none focus:border-crimson-600 focus:ring-1 focus:ring-crimson-600"
              />
              <button
                type="submit"
                disabled={sendingChat || !inputMsg.trim()}
                className="p-2 bg-crimson-600 hover:bg-crimson-700 text-white rounded-sm disabled:opacity-40 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

          </div>
        </div>

      </div>

      {/* Custom Assessment Modal */}
      {showAssessmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="architectural-card w-full max-w-lg p-7 bg-white border border-stroke-subtle shadow-modal relative space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stroke-subtle">
              <div className="space-y-0.5">
                <span className="text-xs font-mono font-bold text-crimson-600 uppercase tracking-widest">
                  [ Evaluation Settings ]
                </span>
                <h3 className="text-base font-bold text-obsidian-deep">Configure Milestone Test</h3>
              </div>
              <button onClick={() => setShowAssessmentModal(false)} className="text-slate-400 hover:text-obsidian-base">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-obsidian-base uppercase tracking-wider mb-1 font-mono">
                  Difficulty Level
                </label>
                <select
                  value={quizDifficulty}
                  onChange={(e) => setQuizDifficulty(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-sm text-obsidian-base text-xs focus:outline-none focus:border-crimson-600"
                >
                  <option value="BEGINNER">Beginner (Core Syntax & Concepts)</option>
                  <option value="INTERMEDIATE">Intermediate (Production Patterns & Edge Cases)</option>
                  <option value="ADVANCED">Advanced (Architecture & Performance)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-obsidian-base uppercase tracking-wider mb-1 font-mono">
                  Multiple Choice Questions
                </label>
                <select
                  value={mcqCount}
                  onChange={(e) => setMcqCount(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-sm text-obsidian-base text-xs focus:outline-none focus:border-crimson-600"
                >
                  <option value={3}>3 Questions</option>
                  <option value={5}>5 Questions</option>
                  <option value={7}>7 Questions</option>
                </select>
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeDescriptive}
                    onChange={(e) => setIncludeDescriptive(e.target.checked)}
                    className="rounded-sm border-slate-300 text-crimson-600 focus:ring-0"
                  />
                  <span className="text-slate-700 font-semibold">Include Conceptual Essay / Rubric Question</span>
                </label>

                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeCoding}
                    onChange={(e) => setIncludeCoding(e.target.checked)}
                    className="rounded-sm border-slate-300 text-crimson-600 focus:ring-0"
                  />
                  <span className="text-slate-700 font-semibold">Include Practical Code Sandbox Problem</span>
                </label>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAssessmentModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStartCustomAssessment}
                  disabled={generatingQuiz}
                  className="px-5 py-2 bg-crimson-600 hover:bg-crimson-700 text-white text-xs font-bold uppercase rounded-sm shadow-sm flex items-center space-x-1.5 disabled:opacity-50"
                >
                  {generatingQuiz ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Start Assessment</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LessonViewer;
