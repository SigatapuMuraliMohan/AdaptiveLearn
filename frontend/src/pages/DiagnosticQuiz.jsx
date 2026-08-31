import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, ArrowRight, BrainCircuit, Activity } from 'lucide-react';
import confetti from 'canvas-confetti';

const DiagnosticQuiz = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { updateOnboardingStatus } = useAuth();

  const diagnosticData = location.state?.diagnosticData || {
    goal: 'Software Development',
    questions: [
      {
        id: 1,
        topic: 'Core Syntax & OOP',
        question_text: 'Which principle in OOP is demonstrated when a subclass provides a specific implementation of a method defined in its superclass?',
        options: ['Polymorphism (Method Overriding)', 'Encapsulation', 'Abstraction', 'Composition'],
        correct_answer: 'Polymorphism (Method Overriding)',
        explanation: 'Method overriding is runtime polymorphism.'
      },
      {
        id: 2,
        topic: 'Collections & Data Structures',
        question_text: 'Which Java Collection implementation offers constant time O(1) average performance for basic operations like get() and put()?',
        options: ['HashMap', 'TreeMap', 'ArrayList', 'LinkedList'],
        correct_answer: 'HashMap',
        explanation: 'HashMaps use hashing to access buckets in O(1) average time.'
      },
      {
        id: 3,
        topic: 'Databases & SQL',
        question_text: 'Which SQL clause is used to filter records resulting from a GROUP BY aggregation?',
        options: ['HAVING', 'WHERE', 'ORDER BY', 'LIMIT'],
        correct_answer: 'HAVING',
        explanation: 'HAVING filters aggregated groups, whereas WHERE filters individual rows before grouping.'
      }
    ]
  };

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [topicScores, setTopicScores] = useState([]);
  const [loadingPath, setLoadingPath] = useState(false);
  const [error, setError] = useState('');

  const questions = diagnosticData.questions || [];
  const currentQ = questions[currentIdx];

  const handleSelectOption = (option) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentIdx]: option
    });
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      calculateDiagnosticResults();
    }
  };

  const calculateDiagnosticResults = () => {
    const topicStats = {};
    questions.forEach((q, idx) => {
      const topic = q.topic || 'General';
      if (!topicStats[topic]) {
        topicStats[topic] = { total: 0, correct: 0 };
      }
      topicStats[topic].total += 1;
      if (selectedAnswers[idx] === q.correct_answer) {
        topicStats[topic].correct += 1;
      }
    });

    const calculatedScores = Object.keys(topicStats).map((t) => ({
      topic: t,
      scorePercentage: Math.round((topicStats[t].correct / topicStats[t].total) * 100)
    }));

    setTopicScores(calculatedScores);
    setIsCompleted(true);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
  };

  const handleGeneratePath = async () => {
    setLoadingPath(true);
    setError('');

    const goal = location.state?.goal || diagnosticData.goal || 'Custom Learning Track';
    const experienceLevel = location.state?.experienceLevel || 'BEGINNER';
    const weeklyHours = location.state?.weeklyHours || 8;
    const learningStyle = location.state?.learningStyle || 'hands-on with analogies';

    try {
      await api.post('/courses/generate', {
        goal,
        experienceLevel,
        weeklyHours,
        learningStyle,
        diagnosticScores: topicScores
      });
      updateOnboardingStatus(true);
      navigate('/courses');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to synthesize personalized course roadmap.');
      setLoadingPath(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {!isCompleted ? (
        <div className="space-y-6">
          
          {/* Header & Progress */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-crimson-600 uppercase tracking-widest">
                [ Baseline Diagnostic Assessment ]
              </span>
              <h2 className="text-xl font-bold text-obsidian-deep">{diagnosticData.goal}</h2>
            </div>
            <span className="text-xs font-mono font-bold text-slate-500">
              Q{currentIdx + 1} / {questions.length}
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-sm h-1.5 overflow-hidden">
            <div
              className="bg-crimson-600 h-1.5 transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Card */}
          {currentQ && (
            <div className="architectural-card p-8 bg-white border border-stroke-subtle shadow-card relative">
              <div className="wireframe-corner-crimson" />

              <div className="inline-block px-2.5 py-0.5 rounded-sm bg-slate-100 text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider mb-4 border border-stroke-subtle">
                Topic: {currentQ.topic}
              </div>

              <h3 className="text-base sm:text-lg font-bold text-obsidian-deep mb-6 leading-relaxed">
                {currentQ.question_text}
              </h3>

              <div className="space-y-2.5">
                {currentQ.options?.map((opt, idx) => {
                  const isSelected = selectedAnswers[currentIdx] === opt;
                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectOption(opt)}
                      className={`p-3.5 rounded-sm border cursor-pointer transition-all flex items-center justify-between text-xs ${
                        isSelected
                          ? 'border-crimson-600 bg-crimson-50/40 text-obsidian-deep font-bold shadow-sm'
                          : 'border-stroke-subtle bg-slate-50/50 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>{opt}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-crimson-600 flex-shrink-0 ml-3" />}
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 pt-6 border-t border-stroke-subtle flex justify-end">
                <button
                  type="button"
                  disabled={!selectedAnswers[currentIdx]}
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-crimson-600 hover:bg-crimson-700 text-white font-bold text-xs uppercase tracking-wider rounded-sm shadow-sm flex items-center space-x-1.5 transition-all disabled:opacity-40"
                >
                  <span>{currentIdx === questions.length - 1 ? 'Complete Assessment' : 'Next Question'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      ) : (
        /* Results View */
        <div className="architectural-card p-8 sm:p-10 bg-white border border-stroke-subtle shadow-card text-center space-y-6 relative">
          <div className="wireframe-corner-crimson" />

          <div className="w-12 h-12 rounded-sm bg-crimson-50 text-crimson-600 border border-crimson-200 flex items-center justify-center mx-auto">
            <BrainCircuit className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-crimson-600 uppercase tracking-widest">
              [ Diagnostic Complete ]
            </span>
            <h2 className="text-2xl font-extrabold text-obsidian-deep tracking-tight">
              Baseline Competency Mapped
            </h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Your starter roadmap will be calibrated to skip known fundamentals and focus directly on growth areas.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-sm bg-crimson-50 border border-crimson-200 text-crimson-700 text-xs">
              {error}
            </div>
          )}

          {/* Topic Breakdown */}
          <div className="space-y-3 text-left max-w-md mx-auto pt-2">
            {topicScores.map((ts, idx) => (
              <div key={idx} className="p-3.5 rounded-sm bg-slate-50 border border-stroke-subtle">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-bold text-obsidian-base">{ts.topic}</span>
                  <span className={`text-xs font-mono font-bold ${ts.scorePercentage >= 70 ? 'text-emerald-700' : ts.scorePercentage >= 40 ? 'text-amber-700' : 'text-crimson-600'}`}>
                    {ts.scorePercentage}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-sm h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 transition-all duration-700 ${
                      ts.scorePercentage >= 70 ? 'bg-emerald-600' : ts.scorePercentage >= 40 ? 'bg-amber-500' : 'bg-crimson-600'
                    }`}
                    style={{ width: `${ts.scorePercentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-stroke-subtle">
            <button
              onClick={handleGeneratePath}
              disabled={loadingPath}
              className="w-full py-3.5 bg-crimson-600 hover:bg-crimson-700 text-white font-bold text-xs uppercase tracking-wider rounded-sm shadow-sm flex items-center justify-center space-x-2 transition-all transform active:scale-98 disabled:opacity-50"
            >
              {loadingPath ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Synthesizing Tailored Curriculum...</span>
                </div>
              ) : (
                <>
                  <span>Generate My Personalized Learning Roadmap</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagnosticQuiz;
