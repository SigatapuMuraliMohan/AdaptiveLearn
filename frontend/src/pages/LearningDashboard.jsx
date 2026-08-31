import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import {
  Sparkles,
  BookOpen,
  CheckCircle,
  Lock,
  PlayCircle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Award,
  RefreshCw
} from 'lucide-react';

const LearningDashboard = () => {
  const [learningPath, setLearningPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchActivePath = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/learning-path/current');
      setLearningPath(response.data);
    } catch (err) {
      if (err.response?.status === 404) {
        navigate('/onboarding');
      } else {
        setError('Failed to load your learning pathway.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivePath();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-400">Loading your personalized roadmap...</p>
        </div>
      </div>
    );
  }

  const items = learningPath?.items || [];
  const completedCount = items.filter((i) => i.status === 'COMPLETED').length;
  const progressPct = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-8 border border-slate-800 shadow-2xl relative overflow-hidden mb-10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ACTIVE LEARNING PATH
              </span>
              <span className="text-xs text-slate-400">• Dynamic AI Adapted</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{learningPath?.goalText}</h1>
            <p className="text-slate-400 text-sm mt-1">
              Curated roadmap tailored specifically to your diagnostic knowledge profile.
            </p>
          </div>

          <div className="flex items-center space-x-6 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div>
              <div className="text-2xl font-black text-white">{progressPct}%</div>
              <div className="text-xs text-slate-400">Overall Progress</div>
            </div>
            <div className="h-10 w-px bg-slate-800" />
            <div>
              <div className="text-2xl font-black text-indigo-400">{completedCount}/{items.length}</div>
              <div className="text-xs text-slate-400">Milestones Done</div>
            </div>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="w-full bg-slate-800/80 rounded-full h-2.5 mt-8 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 h-2.5 transition-all duration-700 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Roadmap Tree */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <span>Curriculum Milestones</span>
          </h2>
          <span className="text-xs text-slate-400">Click unlocked lessons to study with the AI Tutor</span>
        </div>

        <div className="relative">
          {/* Vertical Connecting Line */}
          <div className="absolute left-8 top-6 bottom-6 w-0.5 bg-slate-800 hidden sm:block" />

          <div className="space-y-4">
            {items.map((item, index) => {
              const isCompleted = item.status === 'COMPLETED';
              const isRemedial = item.isRemedial || item.status === 'REMEDIAL';
              // First item or unblocked item is accessible
              const isUnlocked = item.status === 'UNLOCKED' || item.status === 'IN_PROGRESS' || item.status === 'REMEDIAL' || (index === 0 && !isCompleted);

              return (
                <div
                  key={item.id}
                  className={`relative glass-panel rounded-2xl p-6 border transition-all ${
                    isRemedial
                      ? 'border-amber-500/40 bg-amber-500/5'
                      : isCompleted
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : isUnlocked
                      ? 'border-indigo-500/50 bg-indigo-500/5 shadow-lg shadow-indigo-500/10'
                      : 'border-slate-800/80 opacity-60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start space-x-4">
                      {/* Status Icon Indicator */}
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 font-bold text-sm ${
                          isCompleted
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : isUnlocked
                            ? isRemedial
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                              : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 animate-pulse'
                            : 'bg-slate-800 text-slate-500 border border-slate-700'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : isUnlocked ? (
                          isRemedial ? <AlertTriangle className="w-6 h-6" /> : <span>{item.sequenceOrder}</span>
                        ) : (
                          <Lock className="w-5 h-5" />
                        )}
                      </div>

                      {/* Milestone Details */}
                      <div>
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <h3 className="font-bold text-white text-base sm:text-lg">{item.title}</h3>
                          {isRemedial && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              REMEDIAL ADAPTATION
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                            {item.difficultyLevel}
                          </span>
                          <span className="text-xs text-slate-500">• {item.estimatedMinutes} mins</span>
                        </div>
                        <p className="text-sm text-slate-400 mt-1.5">{item.description}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-3 self-end sm:self-center">
                      {isCompleted ? (
                        <button
                          onClick={() => navigate(`/lesson/${item.id}`)}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                        >
                          Review Lesson
                        </button>
                      ) : isUnlocked ? (
                        <button
                          onClick={() => navigate(`/lesson/${item.id}`)}
                          className={`px-6 py-2.5 rounded-xl text-white text-xs font-bold shadow-lg flex items-center space-x-2 transition-all transform active:scale-95 ${
                            isRemedial
                              ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-600/30'
                              : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-indigo-600/30'
                          }`}
                        >
                          <PlayCircle className="w-4 h-4" />
                          <span>{isRemedial ? 'Start Remedial Lesson' : 'Start Lesson'}</span>
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-slate-600 flex items-center space-x-1.5 px-4 py-2">
                          <Lock className="w-3.5 h-3.5" />
                          <span>Locked</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningDashboard;
