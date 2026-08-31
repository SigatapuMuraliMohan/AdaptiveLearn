import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Award, MessageSquare, LayoutDashboard, ArrowRight, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="border-b border-stroke-subtle bg-white/95 backdrop-blur-md sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo - Architectural Swiss Monogram */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-8 h-8 rounded-sm bg-crimson-600 flex items-center justify-center text-white font-mono font-black text-sm shadow-sm group-hover:bg-crimson-700 transition-colors">
              AL
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-extrabold text-obsidian-base tracking-tight">
                AdaptiveLearn
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-crimson-50 text-crimson-700 border border-crimson-200 uppercase tracking-wider font-mono">
                Platform
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          {user ? (
            <div className="flex items-center space-x-6">
              <Link
                to="/courses"
                className={`flex items-center space-x-2 text-xs font-semibold tracking-wide transition-colors relative py-1 ${
                  location.pathname === '/courses' || location.pathname.startsWith('/courses/')
                    ? 'text-crimson-600 font-bold'
                    : 'text-slate-600 hover:text-obsidian-base'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Course Hub</span>
                {(location.pathname === '/courses' || location.pathname.startsWith('/courses/')) && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-crimson-600 rounded-full" />
                )}
              </Link>

              <Link
                to="/dashboard"
                className={`flex items-center space-x-2 text-xs font-semibold tracking-wide transition-colors relative py-1 ${
                  location.pathname === '/dashboard' || location.pathname.startsWith('/learn')
                    ? 'text-crimson-600 font-bold'
                    : 'text-slate-600 hover:text-obsidian-base'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>AI Workspace</span>
                {(location.pathname === '/dashboard' || location.pathname.startsWith('/learn')) && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-crimson-600 rounded-full" />
                )}
              </Link>

              <Link
                to="/profile"
                className={`flex items-center space-x-2 text-xs font-semibold tracking-wide transition-colors relative py-1 ${
                  location.pathname === '/profile'
                    ? 'text-crimson-600 font-bold'
                    : 'text-slate-600 hover:text-obsidian-base'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Skill Mastery</span>
                {location.pathname === '/profile' && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-crimson-600 rounded-full" />
                )}
              </Link>

              <div className="h-5 w-px bg-stroke-subtle" />

              <div className="flex items-center space-x-3">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2.5 hover:opacity-85 transition-opacity"
                  title="View Account & Security Profile"
                >
                  <div className="w-7 h-7 rounded-sm bg-slate-100 text-obsidian-base flex items-center justify-center text-xs font-bold border border-stroke-subtle">
                    {user.fullName?.charAt(0) || 'U'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-bold text-obsidian-base leading-tight">{user.fullName}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">{user.role}</div>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-sm bg-white border border-stroke-subtle hover:border-crimson-300 hover:bg-crimson-50 text-slate-500 hover:text-crimson-700 transition-all"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-bold text-obsidian-base hover:text-crimson-600 border border-stroke-subtle hover:border-stroke-neutral bg-white rounded-sm transition-all"
              >
                Sign In
              </Link>

              <Link
                to="/register"
                className="px-4 py-2 text-xs font-bold text-white bg-crimson-600 hover:bg-crimson-700 rounded-sm shadow-sm flex items-center space-x-1.5 transition-all"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
