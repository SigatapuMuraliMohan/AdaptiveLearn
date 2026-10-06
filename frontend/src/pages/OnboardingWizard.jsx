import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { ArrowRight, Target, Clock, Compass, CheckCircle2 } from 'lucide-react';

const OnboardingWizard = () => {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState('Java Backend Developer');
  const [customGoal, setCustomGoal] = useState('');
  const [statedLevel, setStatedLevel] = useState('BEGINNER');
  const [weeklyHours, setWeeklyHours] = useState(8);
  const [preferredStyle, setPreferredStyle] = useState('hands-on with analogies');
  const [pacePreference, setPacePreference] = useState('MODERATE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    const finalGoal = goal === 'Custom' ? customGoal : goal;

    try {
      const response = await api.post('/student/onboarding', {
        goal: finalGoal,
        statedLevel,
        targetOutcome: `Master production-ready skills for ${finalGoal}`,
        preferredStyle,
        weeklyHours: parseInt(weeklyHours),
        pacePreference
      });

      const diagnosticData = response.data;
      navigate('/diagnostic-quiz', {
        state: {
          diagnosticData,
          goal: finalGoal,
          experienceLevel: statedLevel,
          weeklyHours: parseInt(weeklyHours) || 8,
          learningStyle: preferredStyle || 'hands-on with analogies'
        }
      });
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to initialize onboarding profile.';
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Step Tracker Header */}
      <div className="mb-8 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
          <span>[ STEP 0{step} OF 03 ]</span>
          <span className="text-crimson-600">
            {step === 1 ? 'Target Milestone' : step === 2 ? 'Experience & Pedagogy' : 'Pace & Commitment'}
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-sm h-1.5 overflow-hidden">
          <div
            className="bg-crimson-600 h-1.5 transition-all duration-300 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Questionnaire Card */}
      <div className="architectural-card p-8 sm:p-10 bg-white border border-stroke-subtle shadow-card relative">
        <div className="wireframe-corner-crimson" />

        {error && (
          <div className="mb-6 p-3.5 rounded-sm bg-crimson-50 border border-crimson-200 text-crimson-700 text-xs">
            {error}
          </div>
        )}

        {/* Step 1: Goal Target */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-crimson-600 uppercase tracking-widest">
                [ Curriculum Target ]
              </span>
              <h2 className="text-2xl font-extrabold text-obsidian-deep tracking-tight">
                What skill or career milestone would you like to master?
              </h2>
              <p className="text-xs text-slate-600">
                The AI engine decomposes this target into a sequential mastery roadmap.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {[
                { title: 'Java Backend Developer', desc: 'Spring Boot 3, Microservices, JPA, SQL Architecture' },
                { title: 'Full Stack React & Node', desc: 'React 18, TypeScript, REST APIs, PostgreSQL' },
                { title: 'DevOps & Cloud Engineer', desc: 'Docker, CI/CD Pipelines, Kubernetes, AWS' },
                { title: 'Custom Track', desc: 'Input custom programming language, exam, or framework' },
              ].map((item) => {
                const isSelected = goal === item.title || (item.title === 'Custom Track' && goal === 'Custom');
                return (
                  <div
                    key={item.title}
                    onClick={() => setGoal(item.title === 'Custom Track' ? 'Custom' : item.title)}
                    className={`p-4 rounded-sm border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-crimson-600 bg-crimson-50/40 text-obsidian-deep shadow-sm'
                        : 'border-stroke-subtle bg-slate-50/50 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs">{item.title}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-crimson-600 flex-shrink-0" />}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>

            {goal === 'Custom' && (
              <div className="pt-2">
                <label className="block text-xs font-bold text-obsidian-base uppercase tracking-wider mb-1 font-mono">
                  Enter Custom Learning Target
                </label>
                <input
                  type="text"
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  placeholder="e.g. Machine Learning with PyTorch & Scikit-Learn"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-sm text-obsidian-base text-xs focus:outline-none focus:border-crimson-600 focus:ring-1 focus:ring-crimson-600"
                />
              </div>
            )}
          </div>
        )}

        {/* Step 2: Experience Level & Learning Style */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-crimson-600 uppercase tracking-widest">
                [ Baseline & Pedagogy ]
              </span>
              <h2 className="text-2xl font-extrabold text-obsidian-deep tracking-tight">
                Your experience level and learning preferences
              </h2>
              <p className="text-xs text-slate-600">
                Calibrates lesson pacing, analogy depth, and starter module complexity.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-obsidian-base uppercase tracking-wider font-mono">
                Self-Reported Experience Level
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map((lvl) => (
                  <button
                    type="button"
                    key={lvl}
                    onClick={() => setStatedLevel(lvl)}
                    className={`py-2.5 px-3 rounded-sm border text-xs font-bold transition-all uppercase font-mono ${
                      statedLevel === lvl
                        ? 'border-crimson-600 bg-crimson-50 text-crimson-700'
                        : 'border-stroke-subtle bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-obsidian-base uppercase tracking-wider font-mono">
                Explanation & Mentoring Style
              </label>
              <div className="space-y-2.5">
                {[
                  { id: 'hands-on with analogies', title: 'Hands-on Code with Mental Models & Real-World Analogies', desc: 'Ground architectural principles in relatable physical analogies and runnable code.' },
                  { id: 'step-by-step', title: 'Sequential & Highly Structured Technical Breakdowns', desc: 'Clear bulleted principles, architectural diagrams, and comprehensive notes.' },
                  { id: 'socratic-challenge', title: 'Socratic Challenge & Practice-First Problem Solving', desc: 'Active recall challenges and interactive question prompts before theory.' },
                ].map((s) => {
                  const isSelected = preferredStyle === s.id;
                  return (
                    <div
                      key={s.id}
                      onClick={() => setPreferredStyle(s.id)}
                      className={`p-3.5 rounded-sm border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-crimson-600 bg-crimson-50/40 text-obsidian-deep'
                          : 'border-stroke-subtle bg-slate-50/50 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs text-obsidian-base">{s.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{s.desc}</div>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-crimson-600 flex-shrink-0 ml-3" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Availability & Pace */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-crimson-600 uppercase tracking-widest">
                [ Schedule & Velocity ]
              </span>
              <h2 className="text-2xl font-extrabold text-obsidian-deep tracking-tight">
                Study schedule and pace commitment
              </h2>
              <p className="text-xs text-slate-600">
                Calibrates weekly milestone targets to fit your available study time.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-xs font-bold text-obsidian-base font-mono">
                <span>Weekly Study Availability</span>
                <span className="text-crimson-600">{weeklyHours} Hours / Week</span>
              </div>
              <input
                type="range"
                min="2"
                max="40"
                step="2"
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(e.target.value)}
                className="w-full h-1.5 bg-slate-200 rounded-sm appearance-none cursor-pointer accent-crimson-600"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>2 hrs (Light)</span>
                <span>8 hrs (Standard)</span>
                <span>20+ hrs (Intensive)</span>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <label className="block text-xs font-bold text-obsidian-base uppercase tracking-wider font-mono">
                Pace Preference
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'RELAXED', label: 'Relaxed' },
                  { id: 'MODERATE', label: 'Moderate' },
                  { id: 'INTENSIVE', label: 'Intensive' }
                ].map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => setPacePreference(p.id)}
                    className={`py-2.5 px-3 rounded-sm border text-xs font-bold transition-all uppercase font-mono ${
                      pacePreference === p.id
                        ? 'border-crimson-600 bg-crimson-50 text-crimson-700'
                        : 'border-stroke-subtle bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Wizard Footer Navigation */}
        <div className="mt-8 pt-6 border-t border-stroke-subtle flex justify-between items-center">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-5 py-2 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleNext}
            disabled={loading}
            className="px-6 py-2.5 bg-crimson-600 hover:bg-crimson-700 text-white font-bold text-xs uppercase tracking-wider rounded-sm shadow-sm flex items-center space-x-1.5 transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{step === 3 ? 'Generate Baseline Diagnostic' : 'Next Step'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default OnboardingWizard;
