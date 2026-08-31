import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import {
  BookOpen,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Sliders,
  ChevronRight,
  Plus,
  Trash2,
  Edit2,
  X,
  Compass,
  ArrowLeft
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

const CourseRoadmap = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [showAiRetuneModal, setShowAiRetuneModal] = useState(false);
  const [aiIntent, setAiIntent] = useState('');
  const [retuning, setRetuning] = useState(false);

  const [showAdaptGoalModal, setShowAdaptGoalModal] = useState(false);
  const [adaptGoalInput, setAdaptGoalInput] = useState('');
  const [adaptingGoal, setAdaptingGoal] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newDifficulty, setNewDifficulty] = useState('INTERMEDIATE');
  const [newMinutes, setNewMinutes] = useState(45);
  const [addingModule, setAddingModule] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTopic, setEditTopic] = useState('');
  const [editDifficulty, setEditDifficulty] = useState('INTERMEDIATE');
  const [editMinutes, setEditMinutes] = useState(45);
  const [savingEdit, setSavingEdit] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deletingModule, setDeletingModule] = useState(false);

  const fetchCourse = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/courses/${id}`);
      setCourse(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const handleAiRetune = async (e) => {
    e.preventDefault();
    if (!aiIntent.trim()) return;
    setRetuning(true);

    try {
      const res = await api.post(`/courses/${id}/modify-roadmap`, {
        modificationIntent: aiIntent.trim()
      });
      setCourse(res.data);
      setShowAiRetuneModal(false);
      setAiIntent('');
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to re-tune roadmap with AI');
    } finally {
      setRetuning(false);
    }
  };

  const handleAdaptGoal = async (e) => {
    e.preventDefault();
    if (!adaptGoalInput.trim()) return;
    setAdaptingGoal(true);

    try {
      const res = await api.post(`/courses/${id}/adapt-goal`, {
        newGoal: adaptGoalInput.trim()
      });
      setCourse(res.data);
      setShowAdaptGoalModal(false);
      setAdaptGoalInput('');
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to adapt course goal');
    } finally {
      setAdaptingGoal(false);
    }
  };

  const handleAddModule = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setAddingModule(true);

    try {
      const res = await api.post(`/courses/${id}/items`, {
        title: newTitle.trim(),
        topicName: newTopic.trim() || newTitle.trim(),
        difficultyLevel: newDifficulty,
        estimatedMinutes: parseInt(newMinutes) || 45
      });
      setCourse(res.data);
      setShowAddModal(false);
      setNewTitle('');
      setNewTopic('');
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add custom module');
    } finally {
      setAddingModule(false);
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditTopic(item.topicName || item.title);
    setEditDifficulty(item.difficultyLevel || 'INTERMEDIATE');
    setEditMinutes(item.estimatedMinutes || 45);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    setSavingEdit(true);

    try {
      const res = await api.put(`/courses/items/${editingItem.id}`, {
        title: editTitle.trim(),
        topicName: editTopic.trim() || editTitle.trim(),
        difficultyLevel: editDifficulty,
        estimatedMinutes: parseInt(editMinutes) || 45
      });
      setCourse(res.data);
      setShowEditModal(false);
      setEditingItem(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update module');
    } finally {
      setSavingEdit(false);
    }
  };

  const openDeleteModal = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setDeletingModule(true);

    try {
      const res = await api.delete(`/courses/items/${itemToDelete.id}`);
      setCourse(res.data);
      setShowDeleteModal(false);
      setItemToDelete(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete module');
    } finally {
      setDeletingModule(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-white">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-2 border-crimson-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-slate-500">Loading curriculum roadmap...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-obsidian-deep">Could not load course roadmap</h2>
        <p className="text-xs text-slate-500">{error || 'Course not found'}</p>
        <button
          onClick={() => navigate('/courses')}
          className="px-5 py-2 bg-crimson-600 hover:bg-crimson-700 text-white text-xs font-bold uppercase rounded-sm"
        >
          Back to Course Hub
        </button>
      </div>
    );
  }

  const items = course.items || [];
  const completedCount = items.filter((i) => i.status === 'COMPLETED').length;
  const progressPct = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* 1. Top Header Card */}
      <div className="architectural-card p-8 bg-white border border-stroke-subtle shadow-card relative space-y-6">
        <div className="wireframe-corner-crimson" />

        <div className="flex items-center justify-between flex-wrap gap-4">
          <button
            onClick={() => navigate('/courses')}
            className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-obsidian-base transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Courses</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAiRetuneModal(true)}
              className="px-3.5 py-1.5 rounded-sm bg-crimson-50 hover:bg-crimson-100 text-crimson-700 border border-crimson-200 text-xs font-bold flex items-center space-x-1.5 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>AI Re-Tune</span>
            </button>

            <button
              onClick={() => setShowAdaptGoalModal(true)}
              className="px-3.5 py-1.5 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 border border-stroke-subtle text-xs font-bold flex items-center space-x-1.5 transition-colors"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Adapt Goal</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-1.5 rounded-sm bg-obsidian-base hover:bg-obsidian-deep text-white text-xs font-bold flex items-center space-x-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Module</span>
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-xs font-mono font-bold text-crimson-600 uppercase tracking-widest">
            [ Active Curriculum Track ]
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-obsidian-deep tracking-tight">
            {course.goalText}
          </h1>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 pt-2 border-t border-stroke-subtle">
          <div className="flex justify-between text-xs font-mono text-slate-500">
            <span>Milestone Completion</span>
            <span className="font-bold text-obsidian-base">{completedCount} of {items.length} Modules ({progressPct}%)</span>
          </div>
          <div className="w-full bg-slate-100 rounded-sm h-1.5 overflow-hidden">
            <div
              className="bg-crimson-600 h-1.5 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Sequential Milestone Tree */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-stroke-subtle">
          <h2 className="text-base font-bold text-obsidian-deep flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-crimson-600" />
            <span>Milestone Progression Tree</span>
          </h2>
          <span className="text-xs font-mono text-slate-500">SEQUENTIAL ORDER</span>
        </div>

        <div className="space-y-3.5">
          {items.map((item, idx) => {
            const isCompleted = item.status === 'COMPLETED';
            const isCurrent = item.status === 'UNLOCKED' || item.status === 'IN_PROGRESS';
            const isLocked = item.status === 'LOCKED';
            const isRemedial = item.itemType === 'REMEDIAL' || item.difficultyLevel === 'REMEDIAL';

            return (
              <div
                key={item.id}
                className={`architectural-card p-5 transition-all ${
                  isCompleted
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : isCurrent
                    ? 'border-2 border-crimson-600 bg-white shadow-card'
                    : isRemedial
                    ? 'border-amber-300 bg-amber-50/30'
                    : 'border-stroke-subtle bg-slate-50/50 opacity-65'
                }`}
              >
                {isCurrent && <div className="wireframe-corner-crimson" />}
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start space-x-4">
                    <div
                      className={`w-9 h-9 rounded-sm flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : isCurrent
                          ? 'bg-crimson-600 text-white'
                          : isRemedial
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : `0${idx + 1}`}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <span className="text-[11px] font-mono font-bold text-slate-500">
                          Module {item.sequenceOrder}
                        </span>
                        {isRemedial && (
                          <span className="px-1.5 py-0.5 rounded-sm text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300 uppercase">
                            Remedial Lab
                          </span>
                        )}
                        <span className="text-xs text-slate-400">• ~{formatDuration(item.estimatedMinutes)}</span>
                        <span className="text-xs text-slate-400 font-mono">• {item.difficultyLevel}</span>
                      </div>

                      <h3 className="text-base font-bold text-obsidian-deep">{item.title}</h3>
                      <p className="text-xs text-slate-500">Focus: {item.topicName || item.title}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="p-2 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                      title="Edit Details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => openDeleteModal(item)}
                      className="p-2 rounded-sm hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete Module"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {!isLocked ? (
                      <Link
                        to={`/lesson/${item.id}`}
                        className={`px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-all ${
                          isCompleted
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            : 'bg-crimson-600 hover:bg-crimson-700 text-white shadow-sm'
                        }`}
                      >
                        <span>{isCompleted ? 'Review Notes' : 'Start Module'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <div className="px-3.5 py-2 rounded-sm bg-slate-100 text-slate-400 text-xs font-mono font-semibold flex items-center space-x-1.5 border border-stroke-subtle">
                        <Lock className="w-3 h-3" />
                        <span>Locked</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Re-tune Modal */}
      {showAiRetuneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="architectural-card w-full max-w-lg p-7 bg-white border border-stroke-subtle shadow-modal relative space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stroke-subtle">
              <div className="space-y-0.5">
                <span className="text-xs font-mono font-bold text-crimson-600 uppercase tracking-widest">
                  [ AI Calibration ]
                </span>
                <h3 className="text-base font-bold text-obsidian-deep">Re-tune Curriculum</h3>
              </div>
              <button onClick={() => setShowAiRetuneModal(false)} className="text-slate-400 hover:text-obsidian-base">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAiRetune} className="space-y-4">
              <textarea
                rows={4}
                required
                placeholder="Describe how to adjust your curriculum..."
                value={aiIntent}
                onChange={(e) => setAiIntent(e.target.value)}
                className="w-full p-3.5 bg-white border border-slate-300 rounded-sm text-obsidian-base text-xs focus:outline-none focus:border-crimson-600 focus:ring-1 focus:ring-crimson-600"
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
                  disabled={retuning}
                  className="px-5 py-2 bg-crimson-600 hover:bg-crimson-700 text-white text-xs font-bold uppercase rounded-sm shadow-sm flex items-center space-x-1.5 disabled:opacity-50"
                >
                  {retuning ? 'Applying...' : 'Apply Changes'}
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
                <span className="text-xs font-mono font-bold text-crimson-600 uppercase tracking-widest">
                  [ Mid-Track Pivot ]
                </span>
                <h3 className="text-base font-bold text-obsidian-deep">Adapt Course Goal</h3>
              </div>
              <button onClick={() => setShowAdaptGoalModal(false)} className="text-slate-400 hover:text-obsidian-base">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdaptGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-obsidian-base uppercase tracking-wider mb-1 font-mono">
                  New Goal Target
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Full-Stack Cloud Architect with Spring & AWS"
                  value={adaptGoalInput}
                  onChange={(e) => setAdaptGoalInput(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-sm text-obsidian-base text-xs focus:outline-none focus:border-crimson-600 focus:ring-1 focus:ring-crimson-600"
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

      {/* Add Custom Module Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="architectural-card w-full max-w-lg p-7 bg-white border border-stroke-subtle shadow-modal relative space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stroke-subtle">
              <h3 className="text-base font-bold text-obsidian-deep">Add Custom Module</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-obsidian-base">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddModule} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-obsidian-base uppercase tracking-wider mb-1 font-mono">Module Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Distributed Caching with Redis"
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-sm text-obsidian-base text-xs focus:outline-none focus:border-crimson-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-obsidian-base uppercase tracking-wider mb-1 font-mono">Topic Focus</label>
                <input
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="e.g. Redis Architecture, Eviction Policies"
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-sm text-obsidian-base text-xs focus:outline-none focus:border-crimson-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-obsidian-base uppercase tracking-wider mb-1 font-mono">Difficulty</label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-sm text-obsidian-base text-xs focus:outline-none focus:border-crimson-600"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-obsidian-base uppercase tracking-wider mb-1 font-mono">Est. Minutes</label>
                  <input
                    type="number"
                    min="15"
                    max="180"
                    value={newMinutes}
                    onChange={(e) => setNewMinutes(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-sm text-obsidian-base text-xs focus:outline-none focus:border-crimson-600"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingModule}
                  className="px-5 py-2 bg-crimson-600 hover:bg-crimson-700 text-white text-xs font-bold uppercase rounded-sm shadow-sm"
                >
                  {addingModule ? 'Adding...' : 'Add to Roadmap'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Module Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="architectural-card w-full max-w-lg p-7 bg-white border border-stroke-subtle shadow-modal relative space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stroke-subtle">
              <h3 className="text-base font-bold text-obsidian-deep">Edit Module Details</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-obsidian-base">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-obsidian-base uppercase tracking-wider mb-1 font-mono">Module Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-sm text-obsidian-base text-xs focus:outline-none focus:border-crimson-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-obsidian-base uppercase tracking-wider mb-1 font-mono">Topic Focus</label>
                <input
                  type="text"
                  value={editTopic}
                  onChange={(e) => setEditTopic(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-sm text-obsidian-base text-xs focus:outline-none focus:border-crimson-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-obsidian-base uppercase tracking-wider mb-1 font-mono">Difficulty</label>
                  <select
                    value={editDifficulty}
                    onChange={(e) => setEditDifficulty(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-sm text-obsidian-base text-xs focus:outline-none focus:border-crimson-600"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                    <option value="REMEDIAL">Remedial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-obsidian-base uppercase tracking-wider mb-1 font-mono">Est. Minutes</label>
                  <input
                    type="number"
                    min="15"
                    max="180"
                    value={editMinutes}
                    onChange={(e) => setEditMinutes(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-sm text-obsidian-base text-xs focus:outline-none focus:border-crimson-600"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 bg-crimson-600 hover:bg-crimson-700 text-white text-xs font-bold uppercase rounded-sm shadow-sm"
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="architectural-card w-full max-w-md p-6 bg-white border border-stroke-subtle shadow-modal relative space-y-4 text-center">
            <div className="w-10 h-10 rounded-sm bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-obsidian-deep">Delete Milestone?</h3>
            <p className="text-xs text-slate-600">
              Remove <strong className="text-obsidian-base">"{itemToDelete?.title}"</strong> from your roadmap?
            </p>
            <div className="flex justify-center space-x-2 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deletingModule}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase rounded-sm shadow-sm"
              >
                {deletingModule ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CourseRoadmap;
