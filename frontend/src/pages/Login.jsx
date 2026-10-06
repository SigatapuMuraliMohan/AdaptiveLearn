import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { ArrowRight, Lock, Mail, AlertCircle, HelpCircle, X, CheckCircle2, KeyRound, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP & New Pass, 3: Success
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState('');

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

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotLoading(true);
    try {
      const res = await api.post('/auth/forgot-password/send-otp', { email: forgotEmail });
      setForgotSuccessMsg(res.data?.message || `A 6-digit verification code was dispatched to ${forgotEmail}`);
      if (res.data?.devOtpPreview) {
        setOtp(res.data.devOtpPreview);
      }
      setForgotStep(2);
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Failed to send verification code. Please verify the email address.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotError('');

    if (newPassword.length < 6) {
      setForgotError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match. Please re-enter.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await api.post('/auth/forgot-password/reset', {
        email: forgotEmail,
        otp: otp.trim(),
        newPassword: newPassword.trim()
      });
      setForgotSuccessMsg(res.data?.message || 'Password updated successfully!');
      setForgotStep(3);
      setEmail(forgotEmail);
      setPassword('');
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Invalid or expired verification code.');
    } finally {
      setForgotLoading(false);
    }
  };

  const openForgotModal = () => {
    setForgotEmail(email);
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setForgotError('');
    setForgotSuccessMsg('');
    setForgotStep(1);
    setShowForgotModal(true);
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
                  onClick={openForgotModal}
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

      {/* ------------------------------------------------------------------ */}
      {/* Real Email OTP Password Reset Modal                                */}
      {/* ------------------------------------------------------------------ */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="architectural-card w-full max-w-md p-7 bg-white border border-stroke-subtle shadow-modal relative space-y-4">
            <div className="wireframe-corner-crimson" />

            <div className="flex items-center justify-between pb-3 border-b border-stroke-subtle">
              <div className="flex items-center space-x-2 text-crimson-600 font-bold text-sm">
                <KeyRound className="w-4 h-4" />
                <h3 className="text-obsidian-deep">Password Recovery (Email OTP)</h3>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-obsidian-base"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {forgotError && (
              <div className="p-3 rounded-sm bg-crimson-50 border border-crimson-200 flex items-start space-x-2 text-crimson-700 text-xs">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            {/* STEP 1: Enter Email to Receive OTP */}
            {forgotStep === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enter your registered student email address. Our security system will dispatch a 6-digit verification code to your inbox from <code className="text-crimson-700 font-mono text-xs bg-crimson-50 px-1 py-0.5 rounded-sm">adpativelearnai@gmail.com</code>.
                </p>

                <div>
                  <label className="block text-xs font-bold text-obsidian-base uppercase tracking-wider mb-1 font-mono">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-sm text-obsidian-base text-xs focus:outline-none focus:border-crimson-600 focus:ring-1 focus:ring-crimson-600"
                      placeholder="student@example.com"
                    />
                  </div>
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
                    disabled={forgotLoading}
                    className="px-5 py-2 bg-crimson-600 hover:bg-crimson-700 text-white text-xs font-bold uppercase rounded-sm shadow-sm flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    {forgotLoading ? (
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <span>Send Verification Code</span>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: Enter OTP & New Password */}
            {forgotStep === 2 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-sm text-xs text-emerald-800">
                  {forgotSuccessMsg}
                </div>

                <div>
                  <label className="block text-xs font-bold text-obsidian-base uppercase tracking-wider mb-1 font-mono">
                    6-Digit Verification Code (OTP)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-sm text-obsidian-base font-mono font-bold text-center text-lg tracking-widest focus:outline-none focus:border-crimson-600 focus:ring-1 focus:ring-crimson-600"
                    placeholder="123456"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-obsidian-base uppercase tracking-wider mb-1 font-mono">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-sm text-obsidian-base text-xs focus:outline-none focus:border-crimson-600 focus:ring-1 focus:ring-crimson-600"
                      placeholder="At least 6 characters"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-obsidian-base uppercase tracking-wider mb-1 font-mono">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-sm text-obsidian-base text-xs focus:outline-none focus:border-crimson-600 focus:ring-1 focus:ring-crimson-600"
                      placeholder="Repeat new password"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => { setForgotStep(1); setForgotError(''); }}
                    className="text-xs text-slate-500 hover:text-obsidian-base underline"
                  >
                    Resend Code
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-5 py-2 bg-crimson-600 hover:bg-crimson-700 text-white text-xs font-bold uppercase rounded-sm shadow-sm flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    {forgotLoading ? (
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <span>Update Password</span>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: Success Confirmation */}
            {forgotStep === 3 && (
              <div className="text-center py-4 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-extrabold text-obsidian-deep">Password Successfully Reset</h4>
                  <p className="text-xs text-slate-600">
                    Your password has been updated. You can now sign in with your new password.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="w-full py-2.5 px-4 bg-crimson-600 hover:bg-crimson-700 text-white text-xs font-bold uppercase rounded-sm shadow-sm transition-all"
                  >
                    Sign In to Platform Now
                  </button>
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
