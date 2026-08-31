import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Lock, Mail, AlertCircle, HelpCircle, X, CheckCircle2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('rahul@student.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(email, password);
      if (!res.onboardingCompleted) {
        navigate('/onboarding');
      } else {
        navigate('/courses');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    setForgotSubmitted(true);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50 architectural-grid">
      <div className="w-full max-w-md">
        
        {/* Architectural Swiss Auth Card */}
        <div className="architectural-card p-8 sm:p-9 bg-white border border-stroke-subtle shadow-modal relative">
          <div className="wireframe-corner-crimson" />

          <div className="text-center mb-8 space-y-2">
            <div className="w-10 h-10 rounded-sm bg-crimson-600 text-white font-mono font-bold text-sm flex items-center justify-center mx-auto shadow-sm">
              AL
            </div>
            <h2 className="text-2xl font-extrabold text-obsidian-deep tracking-tight">Access Platform</h2>
            <p className="text-xs text-slate-500">Sign in to your personalized AI learning hub</p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-sm bg-crimson-50 border border-crimson-200 flex items-start space-x-2.5 text-crimson-700 text-xs">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-obsidian-base uppercase tracking-wider mb-1.5 font-mono">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-sm text-obsidian-base text-xs placeholder-slate-400 focus:outline-none focus:border-crimson-600 focus:ring-1 focus:ring-crimson-600 transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-obsidian-base uppercase tracking-wider font-mono">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setForgotSubmitted(false);
                    setShowForgotModal(true);
                  }}
                  className="text-xs font-semibold text-crimson-600 hover:text-crimson-700 transition-colors"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-sm text-obsidian-base text-xs placeholder-slate-400 focus:outline-none focus:border-crimson-600 focus:ring-1 focus:ring-crimson-600 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-crimson-600 hover:bg-crimson-700 text-white font-bold text-xs uppercase tracking-wider rounded-sm shadow-sm flex items-center justify-center space-x-2 transition-all transform active:scale-98 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Platform</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-stroke-subtle text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-crimson-600 font-bold hover:underline">
              Create account
            </Link>
          </div>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="architectural-card w-full max-w-md p-7 bg-white border border-stroke-subtle shadow-modal relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stroke-subtle">
              <div className="flex items-center space-x-2 text-crimson-600 font-bold text-sm">
                <HelpCircle className="w-4 h-4" />
                <h3 className="text-obsidian-deep">Password Reset Support</h3>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-obsidian-base"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!forgotSubmitted ? (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enter your registered student email address to contact our administrative support (<code className="text-crimson-700 font-mono text-xs bg-crimson-50 px-1 py-0.5 rounded-sm">adaptivelearnai@gmail.com</code>).
                </p>

                <div>
                  <label className="block text-xs font-bold text-obsidian-base uppercase tracking-wider mb-1 font-mono">
                    Registered Email
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-sm text-obsidian-base text-xs focus:outline-none focus:border-crimson-600 focus:ring-1 focus:ring-crimson-600"
                    placeholder="student@example.com"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-crimson-600 hover:bg-crimson-700 text-white text-xs font-bold uppercase rounded-sm shadow-sm"
                  >
                    Request Reset
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-4 space-y-3">
                <div className="w-10 h-10 rounded-sm bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-obsidian-deep">Support Request Prepared</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Send your password recovery inquiry to our administrator inbox:
                </p>
                <div className="p-3 rounded-sm bg-slate-50 border border-stroke-subtle text-xs font-mono text-crimson-700 select-all font-semibold">
                  adaptivelearnai@gmail.com
                </div>
                <div className="pt-2">
                  <a
                    href={`mailto:adaptivelearnai@gmail.com?subject=Password%20Reset%20Request%20for%20${encodeURIComponent(forgotEmail)}&body=Hello%20AdaptiveLearn%20Team,%0D%0A%0D%0AI%20forgot%20my%20password%20for%20account:%20${encodeURIComponent(forgotEmail)}.%20Please%20assist%20me%20in%20resetting%20it.`}
                    className="inline-block px-5 py-2.5 bg-crimson-600 hover:bg-crimson-700 text-white text-xs font-bold uppercase rounded-sm shadow-sm"
                  >
                    Open Mail Client
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Login;
