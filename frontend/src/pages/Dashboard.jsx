import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Plus,
  ArrowRight,
  Compass,
  Layers,
  Play,
  Trash2,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCourseToDelete, setSelectedCourseToDelete] = useState(null);

  // New Course Modal State
  const [showModal, setShowModal] = useState(false);
  const [goal, setGoal] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('BEGINNER');
  const [weeklyHours, setWeeklyHours] = useState(8);
  const [learningStyle, setLearningStyle] = useState('hands-on with analogies');
  const [error, setError] = useState('');

  const handleDeleteCourse = async () => {
    if (!selectedCourseToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/courses/${selectedCourseToDelete.id}`);
      setShowDeleteModal(false);
      setSelectedCourseToDelete(null);
      await fetchCourses();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete course');
    } finally {
      setDeleting(false);
    }
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/courses');
      setCourses(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!goal.trim()) return;
    setCreating(true);
    setError('');

    try {
      const res = await api.post('/courses/generate', {
        goal: goal.trim(),
        experienceLevel,
        weeklyHours: parseInt(weeklyHours),
        learningStyle
      });

      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      setShowModal(false);
      setGoal('');
      navigate(`/courses/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to synthesize curriculum roadmap.');
    } finally {
      setCreating(false);
    }
  };

  const sampleGoals = [
    'Java Backend Developer with Spring Boot & Microservices',
    'IELTS Academic Preparation (Reading, Writing, Speaking)',
    'Full Stack React, TypeScript & Node.js',
    'Machine Learning & Deep Learning with Python'
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* 1. Header Banner */}
      <div className="architectural-card p-8 bg-white border border-stroke-subtle shadow-card relative">
        <div className="wireframe-corner-crimson" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-crimson-600 uppercase tracking-widest">
              [ Learning Headquarters ]
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-obsidian-deep tracking-tight">
              Welcome, {user?.fullName || 'Student'}
            </h1>
            <p className="text-xs text-slate-600">
              Manage your active personalized roadmaps or synthesize a new subject track.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 bg-crimson-600 hover:bg-crimson-700 text-white font-bold text-xs uppercase tracking-wider rounded-sm shadow-sm flex items-center space-x-1.5 transition-all self-start md:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>Generate New Track</span>
          </button>
        </div>
      </div>

      {/* 2. Course Grid Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-stroke-subtle">
          <h2 className="text-base font-bold text-obsidian-deep flex items-center space-x-2">
            <Layers className="w-4 h-4 text-crimson-600" />
            <span>Active Curriculum Tracks ({courses.length})</span>
          </h2>
          <span className="text-xs font-mono text-slate-500">SELECT TO VIEW ROADMAP</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 font-mono">
            <div className="w-8 h-8 border-2 border-crimson-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading active learning tracks...
          </div>
        ) : courses.length === 0 ? (
          <div className="architectural-card p-12 text-center space-y-4 bg-white border border-stroke-subtle">
            <Compass className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-obsidian-deep">No Active Tracks</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Generate a sequential curriculum for any programming language, framework, or exam.
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-5 py-2 bg-crimson-600 hover:bg-crimson-700 text-white text-xs font-bold uppercase tracking-wider rounded-sm shadow-sm"
            >
              + Create First Track
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {courses.map((course) => {
              const totalItems = course.totalMilestones || course.items?.length || 1;
              const completed = course.completedMilestones || course.items?.filter((i) => i.status === 'COMPLETED').length || 0;
              const pct = Math.round((completed / totalItems) * 100);

              return (
                <div
                  key={course.id}
                  onClick={() => navigate(`/courses/${course.id}`)}
                  className="architectural-card p-6 bg-white border border-stroke-subtle hover:border-crimson-300 transition-all cursor-pointer flex flex-col justify-between group shadow-card"
                >
                  <div className="wireframe-corner" />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm bg-crimson-50 text-crimson-700 border border-crimson-200 uppercase">
                        {course.status}
                      </span>
                      <span className="font-mono text-slate-500">
                        {completed}/{totalItems} Milestones
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-obsidian-deep group-hover:text-crimson-600 transition-colors">
                      {course.goalText}
                    </h3>
                  </div>

                  <div className="mt-6 pt-4 border-t border-stroke-subtle space-y-3">
                    <div className="flex justify-between text-xs font-mono text-slate-500">
                      <span>Progress Meter</span>
                      <span className="font-bold text-obsidian-base">{pct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-sm h-1.5 overflow-hidden">
                      <div
                        className="bg-crimson-600 h-1.5 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-bold text-crimson-600 flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                        <span>Open Curriculum</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>

                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCourseToDelete(course);
                            setShowDeleteModal(true);
                          }}
                          className="p-1.5 rounded-sm hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete Track"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="p-1.5 rounded-sm bg-slate-100 text-slate-600 group-hover:bg-crimson-600 group-hover:text-white transition-colors">
                          <Play className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="architectural-card w-full max-w-md p-6 bg-white border border-stroke-subtle shadow-modal relative space-y-4 text-center">
            <div className="w-10 h-10 rounded-sm bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-obsidian-deep">Delete Course Track?</h3>
              <p className="text-xs text-slate-600">
                Are you sure you want to delete <strong className="text-obsidian-base">"{selectedCourseToDelete?.goalText}"</strong>? All modules and lecture progress will be removed.
              </p>
            </div>
            <div className="flex justify-center space-x-2 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCourse}
                disabled={deleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase rounded-sm shadow-sm"
              >
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. New Course Synthesis Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="architectural-card w-full max-w-lg p-7 bg-white border border-stroke-subtle shadow-modal relative space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stroke-subtle">
              <div className="space-y-0.5">
                <span className="text-xs font-mono font-bold text-crimson-600 uppercase tracking-widest">
                  [ New Curriculum ]
                </span>
                <h3 className="text-base font-bold text-obsidian-deep">Synthesize Course Track</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-obsidian-base">
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-sm bg-crimson-50 border border-crimson-200 text-crimson-700 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-obsidian-base uppercase tracking-wider mb-1 font-mono">
                  Learning Target
                </label>
                <input
                  type="text"
                  required
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g. Distributed Systems Architecture & Kafka"
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-sm text-obsidian-base text-xs focus:outline-none focus:border-crimson-600 focus:ring-1 focus:ring-crimson-600"
                />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {sampleGoals.map((sample) => (
                    <button
                      key={sample}
                      type="button"
                      onClick={() => setGoal(sample)}
                      className="text-[11px] px-2 py-0.5 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-crimson-700 border border-stroke-subtle transition-colors text-left"
                    >
                      + {sample}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-obsidian-base uppercase tracking-wider mb-1 font-mono">
                    Experience Level
                  </label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-sm text-obsidian-base text-xs focus:outline-none focus:border-crimson-600"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-obsidian-base uppercase tracking-wider mb-1 font-mono">
                    Hours / Week
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="40"
                    value={weeklyHours}
                    onChange={(e) => setWeeklyHours(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-sm text-obsidian-base text-xs focus:outline-none focus:border-crimson-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-obsidian-base uppercase tracking-wider mb-1 font-mono">
                  Learning Style
                </label>
                <select
                  value={learningStyle}
                  onChange={(e) => setLearningStyle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-sm text-obsidian-base text-xs focus:outline-none focus:border-crimson-600"
                >
                  <option value="hands-on with analogies">Hands-on with Analogies</option>
                  <option value="step-by-step">Sequential Technical Breakdown</option>
                  <option value="socratic">Socratic & Practice First</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 bg-crimson-600 hover:bg-crimson-700 text-white text-xs font-bold uppercase rounded-sm shadow-sm flex items-center space-x-1.5 disabled:opacity-50"
                >
                  {creating ? 'Synthesizing...' : 'Generate Track'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
