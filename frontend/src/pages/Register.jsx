import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Lock, Mail, User, AlertCircle } from 'lucide-react';

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(fullName, email, password);
      navigate('/onboarding');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Email address may already be registered.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50 architectural-grid">
      <div className="w-full max-w-md">
        
        {/* Architectural Swiss Register Card */}
        <div className="architectural-card p-8 sm:p-9 bg-white border border-stroke-subtle shadow-modal relative">
          <div className="wireframe-corner-crimson" />

          <div className="text-center mb-8 space-y-2">
            <div className="w-10 h-10 rounded-sm bg-crimson-600 text-white font-mono font-bold text-sm flex items-center justify-center mx-auto shadow-sm">
              AL
            </div>
            <h2 className="text-2xl font-extrabold text-obsidian-deep tracking-tight">Create Account</h2>
            <p className="text-xs text-slate-500">Initialize your personalized education track</p>
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
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-sm text-obsidian-base text-xs placeholder-slate-400 focus:outline-none focus:border-crimson-600 focus:ring-1 focus:ring-crimson-600 transition-colors"
                  placeholder="e.g. Rahul Sharma"
                />
              </div>
            </div>

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
              <label className="block text-xs font-bold text-obsidian-base uppercase tracking-wider mb-1.5 font-mono">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-sm text-obsidian-base text-xs placeholder-slate-400 focus:outline-none focus:border-crimson-600 focus:ring-1 focus:ring-crimson-600 transition-colors"
                  placeholder="Minimum 6 characters"
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
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-stroke-subtle text-center text-xs text-slate-500">
            Already registered?{' '}
            <Link to="/login" className="text-crimson-600 font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;
