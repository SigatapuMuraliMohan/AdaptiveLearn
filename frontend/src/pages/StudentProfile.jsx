import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  BrainCircuit,
  TrendingUp,
  Activity,
  User,
  Lock,
  Save,
  Check,
  AlertCircle
} from 'lucide-react';

const StudentProfile = () => {
  const { user } = useAuth();

  const [profileData, setProfileData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [courses, setCourses] = useState([]);
  const [riskPrediction, setRiskPrediction] = useState(null);
  const [loading, setLoading] = useState(true);

  // Account Settings Form State
  const [fullName, setFullName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingAccount, setSavingAccount] = useState(false);
  const [accountSuccess, setAccountSuccess] = useState('');
  const [accountError, setAccountError] = useState('');

  const fetchProfile = async () => {
    try {
      const [pRes, rRes, cRes, riskRes] = await Promise.allSettled([
        api.get('/student/profile'),
        api.get('/recommendations'),
        api.get('/courses'),
        api.get('/student/risk-prediction')
      ]);

      if (pRes.status === 'fulfilled') {
        setProfileData(pRes.value.data);
        setFullName(pRes.value.data?.fullName || user?.fullName || '');
      }
      if (rRes.status === 'fulfilled') setRecommendations(rRes.value.data || []);
      if (cRes.status === 'fulfilled') setCourses(cRes.value.data || []);
      if (riskRes.status === 'fulfilled') setRiskPrediction(riskRes.value.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    setAccountSuccess('');
    setAccountError('');

    if (newPassword && newPassword !== confirmPassword) {
      setAccountError('New password and confirm password do not match.');
      return;
    }

    setSavingAccount(true);
    try {
      const payload = {
        fullName: fullName.trim(),
        currentPassword: currentPassword || null,
        newPassword: newPassword ? newPassword.trim() : null
      };

      const res = await api.put('/auth/profile', payload);

      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...storedUser, fullName: res.data.fullName };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setAccountSuccess('Profile and security credentials updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setProfileData((prev) => ({ ...prev, fullName: res.data.fullName }));
    } catch (err) {
      setAccountError(err.response?.data?.message || 'Failed to update account settings.');
    } finally {
      setSavingAccount(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-white">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-2 border-crimson-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-slate-500">Loading student mastery telemetry...</p>
        </div>
      </div>
    );
  }

  const skills = profileData?.skills || [];
  const riskLevel = riskPrediction?.risk_level || 'LOW';
  const isHighRisk = riskLevel === 'HIGH';
  const isMedRisk = riskLevel === 'MEDIUM';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* 1. Profile Header Card */}
      <div className="architectural-card p-8 bg-white border border-stroke-subtle shadow-card relative">
        <div className="wireframe-corner-crimson" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="w-16 h-16 rounded-sm bg-crimson-600 flex items-center justify-center text-white font-mono font-black text-2xl shadow-sm">
              {profileData?.fullName?.charAt(0) || user?.fullName?.charAt(0) || 'S'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-extrabold text-obsidian-deep tracking-tight">
                  {profileData?.fullName || user?.fullName}
                </h1>
                <span className="px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Authenticated Student</span>
                </span>
              </div>
              <p className="text-xs text-slate-500">{profileData?.email || user?.email}</p>
              <div className="pt-2">
                <span className="text-xs font-bold px-3 py-1 rounded-sm bg-slate-100 text-obsidian-base border border-stroke-subtle">
                  {courses.length} Active Curriculum Tracks
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-6 p-4 rounded-sm bg-slate-50 border border-stroke-subtle self-start sm:self-center">
            <div>
              <div className="text-xl font-bold font-mono text-obsidian-deep">{skills.length}</div>
              <div className="text-[11px] text-slate-500">Tracked Skills</div>
            </div>
            <div className="h-8 w-px bg-stroke-subtle" />
            <div>
              <div className="text-xl font-bold font-mono text-crimson-600">
                {skills.filter((s) => s.status === 'MASTERED').length}
              </div>
              <div className="text-[11px] text-slate-500">Mastered</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Account & Security Settings */}
      <div className="architectural-card p-6 sm:p-8 bg-white border border-stroke-subtle shadow-card space-y-6">
        <div className="flex items-center justify-between border-b border-stroke-subtle pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-sm bg-crimson-50 text-crimson-600 border border-crimson-200">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-obsidian-deep">Account & Security Credentials</h2>
              <p className="text-xs text-slate-500">Update your name or modify your password</p>
            </div>
          </div>
        </div>

        {accountSuccess && (
          <div className="p-3.5 rounded-sm bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>{accountSuccess}</span>
          </div>
        )}

        {accountError && (
          <div className="p-3.5 rounded-sm bg-crimson-50 border border-crimson-200 text-crimson-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{accountError}</span>
          </div>
        )}

        <form onSubmit={handleUpdateAccount} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-obsidian-base uppercase tracking-wider mb-1 font-mono">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-sm text-obsidian-base text-xs focus:outline-none focus:border-crimson-600 focus:ring-1 focus:ring-crimson-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-obsidian-base uppercase tracking-wider mb-1 font-mono">
                Email (Read Only)
              </label>
              <input
                type="email"
                disabled
                value={profileData?.email || user?.email || ''}
                className="w-full px-3.5 py-2 bg-slate-100 border border-stroke-subtle rounded-sm text-slate-500 text-xs cursor-not-allowed"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-stroke-subtle">
            <h3 className="text-xs font-bold text-obsidian-base uppercase tracking-wider mb-3 flex items-center space-x-1.5 font-mono">
              <Lock className="w-3.5 h-3.5 text-crimson-600" />
              <span>Change Password (Leave blank to keep unchanged)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-sm text-obsidian-base text-xs focus:outline-none focus:border-crimson-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-sm text-obsidian-base text-xs focus:outline-none focus:border-crimson-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-sm text-obsidian-base text-xs focus:outline-none focus:border-crimson-600"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingAccount}
              className="px-5 py-2.5 bg-crimson-600 hover:bg-crimson-700 text-white text-xs font-bold uppercase tracking-wider rounded-sm shadow-sm flex items-center space-x-1.5 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingAccount ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. Main Grid: Skills Matrix & ML Predictive Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Skills Breakdown (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="architectural-card p-6 sm:p-8 bg-white border border-stroke-subtle shadow-card space-y-6">
            <div className="flex items-center justify-between border-b border-stroke-subtle pb-4">
              <h2 className="text-sm font-bold text-obsidian-deep flex items-center space-x-2">
                <BrainCircuit className="w-4 h-4 text-crimson-600" />
                <span>Personal Skill Knowledge Matrix</span>
              </h2>
              <span className="text-xs font-mono text-slate-500">CALIBRATED BY TEST ATTEMPTS</span>
            </div>

            {skills.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 font-mono">
                No skill telemetry recorded yet. Complete module quizzes to build your knowledge matrix.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {skills.map((sk) => {
                  const mastery = Math.round(sk.masteryPercentage || 0);
                  const isMastered = sk.status === 'MASTERED';
                  const needsRevision = sk.status === 'NEEDS_REVISION';

                  return (
                    <div
                      key={sk.id}
                      className={`p-4 rounded-sm border transition-all ${
                        isMastered
                          ? 'border-emerald-200 bg-emerald-50/20'
                          : needsRevision
                          ? 'border-crimson-200 bg-crimson-50/20'
                          : 'border-stroke-subtle bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-xs text-obsidian-deep truncate">{sk.skillName}</span>
                        <span className={`text-xs font-mono font-bold ${isMastered ? 'text-emerald-700' : needsRevision ? 'text-crimson-600' : 'text-slate-600'}`}>
                          {mastery}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-sm h-1.5 overflow-hidden">
                        <div
                          className={`h-1.5 transition-all duration-700 ${
                            isMastered ? 'bg-emerald-600' : needsRevision ? 'bg-crimson-600' : 'bg-obsidian-base'
                          }`}
                          style={{ width: `${mastery}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Predictive Dropout Risk & Next Actions (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Dropout Risk Card */}
          <div className="architectural-card p-6 bg-white border border-stroke-subtle shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-stroke-subtle pb-3">
              <span className="text-xs font-bold text-obsidian-deep flex items-center space-x-1.5">
                <Activity className="w-4 h-4 text-crimson-600" />
                <span>Dropout Risk Telemetry</span>
              </span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm ${
                isHighRisk ? 'bg-crimson-50 text-crimson-700 border border-crimson-200' : isMedRisk ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {riskLevel} RISK
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {riskPrediction?.explanation || 'Telemetry analytics evaluating test velocity, repeat error frequency, and session retention.'}
            </p>

            <div className="pt-2 border-t border-stroke-subtle text-[10px] text-slate-500 font-mono flex items-center justify-between">
              <span>Scikit-Learn Classifier</span>
              <span className="font-bold text-obsidian-base">{riskPrediction?.risk_score ? `${Math.round(riskPrediction.risk_score * 100)}% Index` : 'Active'}</span>
            </div>
          </div>

          {/* Recommendations Card */}
          <div className="architectural-card p-6 bg-white border border-stroke-subtle shadow-card space-y-4">
            <div className="flex items-center space-x-2 border-b border-stroke-subtle pb-3">
              <TrendingUp className="w-4 h-4 text-crimson-600" />
              <h3 className="text-xs font-bold text-obsidian-deep uppercase tracking-wider font-mono">
                Targeted Next Actions
              </h3>
            </div>

            {recommendations.length === 0 ? (
              <p className="text-xs text-slate-500">Continue working through your active roadmap modules.</p>
            ) : (
              <div className="space-y-2.5">
                {recommendations.slice(0, 3).map((rec, idx) => (
                  <div key={idx} className="p-3 rounded-sm bg-slate-50 border border-stroke-subtle space-y-1">
                    <div className="text-xs font-bold text-obsidian-deep">{rec.title || rec.topicName}</div>
                    <div className="text-[11px] text-slate-500 leading-relaxed">{rec.reason || 'Recommended based on recent quiz scores.'}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default StudentProfile;
