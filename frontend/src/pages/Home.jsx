import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bot,
  Award,
  Video,
  Compass,
  Check,
  ChevronRight
} from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-white text-obsidian-base selection:bg-crimson-100 selection:text-crimson-900">
      
      {/* ------------------------------------------------------------------ */}
      {/* 1. HERO SECTION: Clean Editorial Focused Hero                       */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative pt-20 pb-24 border-b border-stroke-subtle architectural-grid overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-sm bg-crimson-50 border border-crimson-200 text-crimson-700 text-xs font-bold uppercase tracking-wider font-mono">
              <span className="w-2 h-2 rounded-full bg-crimson-600 animate-pulse" />
              <span>AI-Calibrated Education Engine</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-obsidian-deep leading-[1.1]">
              Master Any Subject.{' '}
              <span className="text-crimson-600 block mt-2">
                Engineered For Human Mastery.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Transform complex learning objectives into an adaptive, structured mastery curriculum powered by Socratic mentoring, automated remediation, and Scikit-learn predictive telemetry.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 bg-crimson-600 hover:bg-crimson-700 text-white font-bold text-xs uppercase tracking-wider rounded-sm shadow-sm flex items-center justify-center space-x-2 transition-all transform active:scale-98"
              >
                <span>Start Learning Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-obsidian-base border border-slate-300 font-bold text-xs uppercase tracking-wider rounded-sm transition-all text-center shadow-subtle"
              >
                Sign In to Course Hub
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 2. CORE CAPABILITIES: Architectural Geometric Cards                */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-20 border-b border-stroke-subtle bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="text-xs font-mono font-bold text-crimson-600 uppercase tracking-widest">
              [ Systematic Architecture ]
            </span>
            <h2 className="text-3xl font-extrabold text-obsidian-deep tracking-tight">
              Precision Infrastructure For Learning
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              An engineering-grade framework calibrated to take you from foundational basics to industry mastery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                icon: Compass,
                title: 'Adaptive Roadmaps',
                desc: 'Sequential, milestone-based learning trees generated from natural language career goals.'
              },
              {
                step: '02',
                icon: Bot,
                title: 'Socratic Mentoring',
                desc: 'Contextual AI tutoring that explains concepts using mental models, analogies, and code.'
              },
              {
                step: '03',
                icon: Video,
                title: 'Curated Video Lectures',
                desc: 'Direct integration with top industry video tutorials matched specifically to each module.'
              },
              {
                step: '04',
                icon: Award,
                title: 'Automated Remediation',
                desc: 'If verification score drops below 70%, targeted remedial modules automatically generate.'
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className="architectural-card p-6 border border-stroke-subtle bg-white hover:border-crimson-300 transition-all flex flex-col justify-between"
              >
                <div className="wireframe-corner" />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-sm bg-crimson-50 text-crimson-600 border border-crimson-200 flex items-center justify-center font-bold">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-400">/{item.step}</span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-obsidian-deep">{item.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-stroke-subtle flex items-center text-[11px] font-bold text-crimson-600">
                  <span>Architecture Verified</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 3. COMPARISON: Traditional vs. Adaptive Precision Engine          */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-20 border-b border-stroke-subtle bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-mono font-bold text-crimson-600 uppercase tracking-widest">
              [ Benchmarking ]
            </span>
            <h2 className="text-3xl font-extrabold text-obsidian-deep tracking-tight">
              Traditional vs. Adaptive Precision
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Traditional static courses */}
            <div className="architectural-card p-7 border border-stroke-subtle bg-slate-50/60 space-y-4">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                Traditional Video Courses
              </span>
              <h3 className="text-lg font-bold text-obsidian-base">Linear & One-Size-Fits-All</h3>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-start space-x-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Static pre-recorded videos that cannot answer your specific questions.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>No concept verification; students watch passively without retention checks.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>No remediation when you encounter difficulty or fail a test.</span>
                </li>
              </ul>
            </div>

            {/* Adaptive Platform */}
            <div className="architectural-card p-7 border-2 border-crimson-600 bg-white space-y-4 shadow-card">
              <div className="wireframe-corner-crimson" />
              <span className="text-xs font-mono font-bold text-crimson-600 uppercase tracking-wider">
                AdaptiveLearn Platform
              </span>
              <h3 className="text-lg font-bold text-obsidian-deep">Dynamic & Conceptually Calibrated</h3>
              <ul className="space-y-2.5 text-xs text-slate-700 font-medium">
                <li className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Personalized 24/7 Socratic mentor to answer doubts with targeted analogies.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Multi-modal testing: Objective MCQs, conceptual essay rubrics, and sandbox code.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Automated remedial module synthesis whenever comprehension scores drop below 70%.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 4. FOOTER / FINAL CTA                                              */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-20 bg-obsidian-deep text-white">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <span className="text-xs font-mono text-crimson-400 uppercase tracking-widest">
            [ Ready to Build Mastery ]
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Experience Education Calibrated To You
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            Create your custom curriculum in seconds. Test baseline knowledge, receive Socratic guidance, and unlock verified milestone achievements.
          </p>
          <div className="pt-4">
            <Link
              to="/register"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-crimson-600 hover:bg-crimson-700 text-white font-bold text-xs uppercase tracking-wider rounded-sm shadow-sm transition-all"
            >
              <span>Synthesize Your First Track</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
