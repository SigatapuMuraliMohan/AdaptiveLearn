import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Award,
  ArrowLeft,
  Terminal,
  Check,
  Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';

const AssessmentRunner = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const fetchAssessment = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/assessments/${itemId}`);
      setAssessment(res.data);

      const initialAnswers = {};
      res.data.questions?.forEach((q) => {
        if (q.questionType === 'CODING' && q.correctAnswer) {
          initialAnswers[q.id] = q.correctAnswer;
        }
      });
      setAnswers(initialAnswers);
    } catch (err) {
      setError('Failed to load assessment questions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessment();
  }, [itemId]);

  const handleOptionSelect = (qId, option) => {
    setAnswers({
      ...answers,
      [qId]: option
    });
  };

  const handleTextChange = (qId, text) => {
    setAnswers({
      ...answers,
      [qId]: text
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');

    try {
      const res = await api.post(`/assessments/${assessment.id}/submit`, answers);
      setResult(res.data);

      if (res.data.passed) {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
        if (assessment.pathItem?.id) {
          await api.put(`/courses/items/${assessment.pathItem.id}/complete`);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Submission evaluation failed. Please retry.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-white">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-2 border-crimson-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-slate-500">Assembling verification test sandbox...</p>
        </div>
      </div>
    );
  }

  const questions = assessment?.questions || [];

  if (!assessment || questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="architectural-card p-10 bg-white border border-stroke-subtle shadow-card space-y-4">
          <AlertCircle className="w-10 h-10 text-crimson-600 mx-auto" />
          <h2 className="text-xl font-bold text-obsidian-deep">Assessment Verification Initializing</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            {error || "The assessment for this module is being prepared or was not loaded yet."}
          </p>
          <div className="pt-2 flex justify-center space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
            >
              Back to Lecture
            </button>
            <button
              onClick={fetchAssessment}
              className="px-5 py-2 rounded-sm bg-crimson-600 hover:bg-crimson-700 text-white text-xs font-bold uppercase tracking-wider"
            >
              Generate / Load Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      
      {/* Top Navigation Ribbon */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-obsidian-base transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Lecture</span>
        </button>

        <span className="text-xs font-mono font-bold px-3 py-1 rounded-sm bg-crimson-50 text-crimson-700 border border-crimson-200">
          Total Points: {assessment?.totalPoints}
        </span>
      </div>

      {!result ? (
        <div className="architectural-card p-8 sm:p-10 bg-white border border-stroke-subtle shadow-card space-y-8 relative">
          <div className="wireframe-corner-crimson" />

          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-crimson-600 uppercase tracking-widest">
              [ Milestone Verification ]
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-obsidian-deep tracking-tight">
              {assessment?.title}
            </h1>
            <p className="text-xs text-slate-600">
              Multi-Modal Assessment: Objective MCQs, Conceptual Rubrics, and Code Execution.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-sm bg-crimson-50 border border-crimson-200 text-crimson-700 text-xs">
              {error}
            </div>
          )}

          {/* Question List */}
          <div className="space-y-6">
            {questions.map((q, idx) => {
              let options = [];
              if (Array.isArray(q.optionsJson)) {
                options = q.optionsJson;
              } else if (typeof q.optionsJson === 'string') {
                try {
                  const parsed = JSON.parse(q.optionsJson);
                  options = Array.isArray(parsed) ? parsed : [];
                } catch (e) {
                  options = [];
                }
              }
              const safeOptions = Array.isArray(options) ? options : [];

              return (
                <div key={q.id || idx} className="p-6 rounded-sm bg-slate-50 border border-stroke-subtle space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-crimson-600 uppercase tracking-wider">
                      Question 0{idx + 1} ({q.questionType})
                    </span>
                    <span className="text-xs font-mono text-slate-500">{q.points || 1} pt(s)</span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-obsidian-deep leading-relaxed whitespace-pre-line">
                    {q.questionText}
                  </h3>

                  {/* MCQ Selector */}
                  {q.questionType === 'MCQ' && (
                    <div className="space-y-2 pt-2">
                      {safeOptions.map((opt, oIdx) => {
                        const isSelected = answers[q.id] === opt;
                        return (
                          <div
                            key={oIdx}
                            onClick={() => handleOptionSelect(q.id, opt)}
                            className={`p-3.5 rounded-sm border cursor-pointer transition-all flex items-center justify-between text-xs ${
                              isSelected
                                ? 'border-crimson-600 bg-crimson-50 text-obsidian-deep font-bold shadow-sm'
                                : 'border-stroke-subtle bg-white text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <span>{opt}</span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-crimson-600 flex-shrink-0 ml-3" />}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Conceptual Descriptive Essay */}
                  {q.questionType === 'DESCRIPTIVE' && (
                    <div className="pt-2">
                      <textarea
                        rows={4}
                        value={answers[q.id] || ''}
                        onChange={(e) => handleTextChange(q.id, e.target.value)}
                        placeholder="Type your explanation or essay here. The AI rubric engine will analyze conceptual accuracy, depth, and clarity..."
                        className="w-full p-3.5 bg-white border border-slate-300 rounded-sm text-obsidian-base text-xs focus:outline-none focus:border-crimson-600 focus:ring-1 focus:ring-crimson-600 leading-relaxed"
                      />
                    </div>
                  )}

                  {/* Coding Workspace / Sandbox */}
                  {q.questionType === 'CODING' && (
                    <div className="pt-2 space-y-1">
                      <div className="flex items-center justify-between text-xs text-slate-300 bg-obsidian-deep px-4 py-2 rounded-t-sm border border-b-0 border-obsidian-slate font-mono">
                        <span className="flex items-center space-x-2">
                          <Terminal className="w-3.5 h-3.5 text-crimson-400" />
                          <span>Code Editor Sandbox</span>
                        </span>
                        <span className="text-[10px] text-emerald-400 uppercase font-bold">AI Evaluated</span>
                      </div>
                      <textarea
                        rows={8}
                        value={answers[q.id] || ''}
                        onChange={(e) => handleTextChange(q.id, e.target.value)}
                        placeholder="// Type your implementation code here..."
                        className="w-full p-4 bg-obsidian-base border border-obsidian-slate rounded-b-sm text-slate-100 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-crimson-500 leading-relaxed"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-6 border-t border-stroke-subtle flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-8 py-3.5 bg-crimson-600 hover:bg-crimson-700 text-white font-bold text-xs uppercase tracking-wider rounded-sm shadow-sm flex items-center space-x-2 transition-all transform active:scale-98 disabled:opacity-50"
            >
              {submitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>AI Evaluating Answers & Code...</span>
                </div>
              ) : (
                <>
                  <span>Submit for LLM Evaluation</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Evaluation Results View */
        <div className="architectural-card p-8 sm:p-10 bg-white border border-stroke-subtle shadow-card text-center space-y-8 relative">
          <div className="wireframe-corner-crimson" />

          <div className="w-12 h-12 rounded-sm bg-crimson-50 text-crimson-600 border border-crimson-200 flex items-center justify-center mx-auto">
            <Flame className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <span className={`text-xs font-mono font-bold px-3 py-1 rounded-sm ${result.passed ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-crimson-50 text-crimson-700 border border-crimson-200'}`}>
              {result.passed ? 'MODULE PASSED & NEXT TOPIC UNLOCKED' : 'NEEDS REVISION (< 70%)'}
            </span>
            <h2 className="text-3xl font-extrabold text-obsidian-deep mt-2">Score: {result.percentage}%</h2>
            <p className="text-slate-600 text-xs max-w-md mx-auto">{result.summary}</p>
          </div>

          {/* Feedback Breakdown */}
          <div className="space-y-4 text-left max-w-lg mx-auto">
            {result.strengths && result.strengths.length > 0 && (
              <div className="p-4 rounded-sm bg-emerald-50/50 border border-emerald-200 space-y-1.5">
                <span className="text-xs font-bold text-emerald-800 flex items-center space-x-1.5">
                  <Check className="w-4 h-4" />
                  <span>Strengths Demonstrated</span>
                </span>
                <ul className="list-disc pl-5 text-xs text-slate-700 space-y-1">
                  {result.strengths.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.weaknesses && result.weaknesses.length > 0 && (
              <div className="p-4 rounded-sm bg-crimson-50/40 border border-crimson-200 space-y-1.5">
                <span className="text-xs font-bold text-crimson-700 flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4" />
                  <span>Areas Needing Review</span>
                </span>
                <ul className="list-disc pl-5 text-xs text-slate-700 space-y-1">
                  {result.weaknesses.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.triggeredRemediation && (
              <div className="p-4 rounded-sm bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-1">
                <div className="font-bold flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4" />
                  <span>Automated Remedial Lab Triggered</span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  Because your score was below 70%, the AI engine has automatically inserted a targeted remedial module into your curriculum to help reinforce prerequisites.
                </p>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-stroke-subtle flex justify-center space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-sm"
            >
              Back to Lecture
            </button>
            <button
              onClick={() => navigate('/courses')}
              className="px-6 py-2.5 bg-crimson-600 hover:bg-crimson-700 text-white text-xs font-bold uppercase tracking-wider rounded-sm shadow-sm flex items-center space-x-1.5"
            >
              <span>View Full Roadmap</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default AssessmentRunner;
