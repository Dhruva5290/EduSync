import React, { useState } from 'react';
import { User, Subject } from '../types';
import {
  GraduationCap,
  Sparkles,
  ShieldCheck,
  UserCheck,
  ChevronDown,
  BookOpen,
  Zap,
  RefreshCw,
  LogOut,
  Building2,
  Sun,
  Moon,
  Shield,
  Eye
} from 'lucide-react';

interface HeaderProps {
  currentUser: User;
  allUsers: User[];
  onSwitchUser: (userId: string) => void;
  onLogout?: () => void;
  subjects: Subject[];
  activeSubjectId: string;
  onSelectSubject: (subjectId: string) => void;
  rateLimitRemaining?: number;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  isAuditing?: boolean;
  onExitAudit?: () => void;
  activeTab?: string;
  onOpenPersonalization?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  allUsers,
  onSwitchUser,
  onLogout,
  subjects,
  activeSubjectId,
  onSelectSubject,
  rateLimitRemaining = 58,
  theme = 'dark',
  onToggleTheme,
  isAuditing = false,
  onExitAudit,
  activeTab,
  onOpenPersonalization
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const activeSubject = subjects.find(s => s.id === activeSubjectId) || subjects[0];
  const isTutorTab = activeTab === 'tutor';

  const toggleRole = () => {
    // Only admins have the authority to cycle between perspectives
    if (currentUser.role !== 'admin' && !isAuditing) return;
    
    // Cycle between admin, teacher, and student
    const student = allUsers.find(u => u.role === 'student');
    if (student) onSwitchUser(student.id);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 shadow-sm transition-colors w-full min-w-0">
      <div className="w-full px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4 min-w-0">
          {/* Active Course & ID info */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink">
            <div className="flex items-center gap-2 min-w-0">
              <h2 className="text-sm sm:text-base font-semibold text-white tracking-tight truncate max-w-[130px] sm:max-w-[200px] md:max-w-xs">
                {currentUser.role === 'admin'
                  ? 'Academic Administration'
                  : isTutorTab
                  ? 'AI Tutor'
                  : (activeSubject?.name || 'Academic Course')}
              </h2>
              <span className="hidden sm:inline-block px-2 py-0.5 bg-slate-800 text-blue-400 text-[10px] font-mono rounded-sm border border-slate-700 shrink-0 font-medium">
                {currentUser.role === 'admin' ? 'REGISTRAR' : isTutorTab ? 'GEMINI' : `ID: ${activeSubject?.code || 'CRS-101'}`}
              </span>
            </div>

            {/* Course Switcher (hidden on AI Tutor tab and for admin) */}
            {currentUser.role !== 'admin' && !isTutorTab && (
              <div className="flex items-center gap-1.5 ml-1 sm:ml-2 pl-1.5 sm:pl-3 border-l border-slate-800 min-w-0">
                <span className="hidden md:inline text-[10px] uppercase font-bold tracking-wider text-slate-400 shrink-0">Course:</span>
                <select
                  id="header-subject-select"
                  aria-label="Current Course Selector"
                  value={activeSubjectId}
                  onChange={(e) => onSelectSubject(e.target.value)}
                  className="bg-slate-950 text-xs font-semibold text-slate-200 border border-slate-700 rounded px-1.5 sm:px-2 py-1 focus:outline-none focus:border-blue-500 cursor-pointer max-w-[110px] sm:max-w-[150px] md:max-w-[200px] truncate"
                >
                  {subjects.map((subj) => (
                    <option key={subj.id} value={subj.id} className="bg-slate-900 text-slate-200">
                      {subj.code} · {subj.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Right Controls: Audit Return, Personalization Button, Theme Toggle, AI Quota, User Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Highly Prevalent AI Notes & Learning Questionnaire Button */}
            {currentUser.role === 'student' && onOpenPersonalization && (
              <button
                id="header-personalize-ai-btn"
                onClick={onOpenPersonalization}
                className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-md text-xs font-bold transition-all shadow-md cursor-pointer shrink-0 ${
                  currentUser.learningProfile?.questionnaireCompleted
                    ? 'bg-purple-950 text-purple-200 border border-purple-700 hover:bg-purple-900 hover:border-purple-500'
                    : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white hover:from-purple-500 hover:to-indigo-500 ring-2 ring-purple-500/50 animate-pulse'
                }`}
                title="Launch the AI Cognitive Tuning Questionnaire"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span className="hidden xl:inline">
                  {currentUser.learningProfile?.questionnaireCompleted
                    ? `✨ AI Persona: ${currentUser.learningProfile.learningStyle.replace('_', ' ').toUpperCase()} (${currentUser.learningProfile.targetGrade})`
                    : '⚡ Personalize Notes Questionnaire'}
                </span>
                <span className="hidden sm:inline xl:hidden">
                  {currentUser.learningProfile?.questionnaireCompleted ? '✨ AI Tuned' : '⚡ AI Tune'}
                </span>
              </button>
            )}

            {/* If Registrar is in Audit Mode, show Return Button */}
            {isAuditing && onExitAudit && (
              <button
                id="header-exit-audit-btn"
                onClick={onExitAudit}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md transition-all shrink-0"
                title="Dean Privilege: Return to Registrar Dashboard"
              >
                <Shield className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Return to Registrar</span>
              </button>
            )}

            {/* Quick Role Switcher Button - Strictly for Deans/Registrars */}
            {currentUser.role === 'admin' && (
              <button
                id="header-quick-role-toggle-btn"
                onClick={toggleRole}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-semibold border transition-all bg-purple-950/60 text-purple-300 border-purple-800 hover:bg-purple-900/80 shrink-0"
                title="Dean Privilege: Click to inspect Student viewpoint"
              >
                <RefreshCw className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="hidden lg:inline">Audit Student View</span>
              </button>
            )}

            {/* Theme Toggle (Light / Dark) */}
            {onToggleTheme && (
              <button
                id="header-theme-toggle-btn"
                onClick={onToggleTheme}
                className="p-1.5 sm:p-2 rounded bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer shrink-0"
                title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-400" />
                )}
              </button>
            )}

            {/* Security & System Meter - Visible on wide desktop */}
            <div className="hidden 2xl:flex items-center gap-2 px-2.5 py-1 rounded bg-slate-950 text-slate-300 text-xs font-medium border border-slate-800 shrink-0" title="Security Hardened: OWASP Defenses & RBAC Active">
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">A+ Protected</span>
              </div>
              <span className="text-slate-700">|</span>
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-blue-400" />
                <span className="text-[10px] font-mono text-slate-400">{rateLimitRemaining} RPM</span>
              </div>
            </div>

            {/* Prominent Log Out Button */}
            {onLogout && (
              <button
                id="header-logout-btn"
                onClick={onLogout}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-200 hover:text-white border border-rose-800 hover:border-rose-600 text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs"
                title="Sign out of current account"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-300 shrink-0" />
                <span className="inline">Sign Out</span>
              </button>
            )}

            {/* User Dropdown */}
            <div className="relative shrink-0">
              <button
                id="header-user-menu-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 sm:p-1.5 rounded-md hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors text-left"
              >
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold border shrink-0 ${
                  currentUser.role === 'admin'
                    ? 'bg-purple-900/40 text-purple-300 border-purple-500/50'
                    : currentUser.role === 'teacher'
                    ? 'bg-emerald-900/40 text-emerald-300 border-emerald-500/50'
                    : 'bg-blue-900/40 text-blue-300 border-blue-500/50'
                }`}>
                  {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="truncate max-w-[90px] lg:max-w-[120px]">{currentUser.name}</span>
                    <span
                      className={`text-[9px] px-1 py-0.2 rounded font-semibold uppercase ${
                        currentUser.role === 'admin'
                          ? 'bg-purple-900/60 text-purple-300 border border-purple-700/50'
                          : currentUser.role === 'teacher'
                          ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50'
                          : 'bg-blue-900/60 text-blue-300 border border-blue-700/50'
                      }`}
                    >
                      {currentUser.role === 'admin' ? 'Dean' : currentUser.role === 'teacher' ? 'Faculty' : 'Student'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono hidden lg:block">
                    {currentUser.institutionalId}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {/* User Dropdown Modal */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 rounded-md shadow-2xl border border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2.5 border-b border-slate-800 bg-slate-950/50">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        BML Munjal University
                      </p>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-xs bg-slate-800 text-slate-300 font-mono">
                        {currentUser.role.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono truncate">{currentUser.email}</p>
                    <p className="text-[10px] text-blue-400 font-medium mt-0.5 truncate">{currentUser.department}</p>
                    {currentUser.username && (
                      <p className="text-[10px] text-purple-400 font-mono mt-0.5 truncate">Username: @{currentUser.username}</p>
                    )}
                  </div>

                  {/* If Admin/Dean, allow inspecting perspectives */}
                  {currentUser.role === 'admin' && allUsers.length > 0 ? (
                    <div className="p-2 max-h-80 overflow-y-auto space-y-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-purple-400 px-2 py-1 flex items-center justify-between">
                          <span>Dean Audit Switcher</span>
                          <span className="font-mono text-[9px] text-slate-400">Authorized</span>
                        </p>
                        <div className="space-y-1">
                          {allUsers.map((user) => (
                            <button
                              key={user.id}
                              onClick={() => {
                                onSwitchUser(user.id);
                                setShowUserMenu(false);
                              }}
                              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-sm text-left text-xs transition-colors ${
                                user.id === currentUser.id
                                  ? 'bg-purple-950/90 text-purple-200 border border-purple-700 font-semibold'
                                  : 'hover:bg-slate-800 text-slate-300'
                              }`}
                            >
                              <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-200 border border-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                                {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </div>
                              <div className="flex-1 truncate">
                                <div className="flex items-center justify-between">
                                  <span className="truncate text-white font-medium">{user.name}</span>
                                  <span className="text-[9px] px-1 rounded-xs bg-slate-800 text-slate-300 font-mono">
                                    {user.role}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono block truncate">{user.department}</span>
                              </div>
                              {user.id === currentUser.id && <UserCheck className="w-4 h-4 text-purple-400 shrink-0" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 text-xs text-slate-400 space-y-2">
                      <p className="leading-relaxed text-[11px]">
                        🔒 <strong>Role Isolation:</strong> Your account is restricted to your authorized {currentUser.role} dashboard workspace.
                      </p>
                    </div>
                  )}

                  {/* Bottom Logout in Dropdown */}
                  {onLogout && (
                    <div className="px-2 pt-2 border-t border-slate-800">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onLogout();
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-rose-950/40 hover:bg-rose-950 text-rose-300 border border-rose-800/60 rounded-sm text-xs font-bold transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out of EduSync</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
