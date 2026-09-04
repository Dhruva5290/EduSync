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
  Eye,
  Camera,
  UploadCloud,
  Palette
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
  onNavigateToVisionNote?: () => void;
  isDemoMode?: boolean;
  onToggleDemoMode?: (demo: boolean) => void;
  onOpenVNImport?: () => void;
  accentColor?: string;
  onChangeAccentColor?: (color: string) => void;
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
  onOpenPersonalization,
  onNavigateToVisionNote,
  isDemoMode = true,
  onToggleDemoMode,
  onOpenVNImport,
  accentColor = 'blue',
  onChangeAccentColor
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
          {/* Course Selector & Context */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {currentUser.role === 'admin' ? (
              <div className="flex items-center gap-2 min-w-0">
                <Shield className="w-4 h-4 text-purple-400 shrink-0" />
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                  Academic Administration
                </h2>
                <span className="px-2 py-0.5 bg-purple-950/80 text-purple-300 text-[10px] font-mono rounded border border-purple-800 shrink-0 font-bold">
                  REGISTRAR
                </span>
              </div>
            ) : isTutorTab ? (
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  EduSync AI Tutor
                </h2>
                <span className="px-2 py-0.5 bg-indigo-950/80 text-indigo-300 text-[10px] font-mono rounded border border-indigo-800 shrink-0 font-bold">
                  SOCRATIC
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex items-center gap-1.5 shrink-0">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 hidden md:inline">
                    Select Subject:
                  </span>
                </div>
                <select
                  id="header-subject-select"
                  aria-label="Select Subject"
                  value={activeSubjectId}
                  onChange={(e) => onSelectSubject(e.target.value)}
                  className="bg-slate-950 text-xs sm:text-sm font-bold text-white border border-slate-700 hover:border-blue-500 rounded-lg px-2.5 sm:px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer min-w-[160px] sm:min-w-[230px] md:min-w-[280px] shadow-sm transition-all"
                >
                  {subjects.map((subj) => (
                    <option key={subj.id} value={subj.id} className="bg-slate-900 text-white font-medium py-1">
                      {subj.code} — {subj.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Right Controls: Personalization Button, Audit Return, Theme Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Sleek Compact AI Persona Badge */}
            {currentUser.role === 'student' && onOpenPersonalization && (
              <button
                id="header-personalize-ai-btn"
                onClick={onOpenPersonalization}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0 border ${
                  currentUser.learningProfile?.questionnaireCompleted
                    ? 'bg-slate-950 text-purple-300 border-purple-800/80 hover:bg-purple-950/60 hover:border-purple-600'
                    : 'bg-purple-600 hover:bg-purple-500 text-white border-purple-500'
                }`}
                title="Cognitive Tuning & Learning Persona"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span className="font-sans">
                  {currentUser.learningProfile?.questionnaireCompleted
                    ? `AI Persona: ${currentUser.learningProfile.learningStyle.replace('_', ' ').split(' ')[0].toUpperCase()}`
                    : 'AI Persona Setup'}
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

            {/* VisionNote Direct Import Button */}
            {onOpenVNImport && (
              <button
                id="header-import-vn-btn"
                onClick={onOpenVNImport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-950/80 border border-cyan-700/80 text-cyan-300 hover:bg-cyan-900/80 transition-all shrink-0 shadow-sm hover:shadow-cyan-900/20"
                title="Paste OCR text or load .txt file from VisionNote"
              >
                <UploadCloud className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Import VN Note</span>
              </button>
            )}

            {/* Theme Toggle (Light / Dark) */}
            {onToggleTheme && (
              <button
                id="header-theme-toggle-btn"
                onClick={onToggleTheme}
                className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer shrink-0"
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

            {/* User Profile Trigger with Settings Dropdown */}
            <div className="relative shrink-0">
              <button
                id="header-user-menu-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 transition-all text-left bg-slate-950/60 cursor-pointer"
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold border shrink-0 ${
                  currentUser.role === 'admin'
                    ? 'bg-purple-900/40 text-purple-300 border-purple-500/50'
                    : currentUser.role === 'teacher'
                    ? 'bg-emerald-900/40 text-emerald-300 border-emerald-500/50'
                    : 'bg-blue-900/40 text-blue-300 border-blue-500/50'
                }`}>
                  {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5 leading-none">
                    <span className="truncate max-w-[100px]">{currentUser.name.split(' ')[0]}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${
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
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {/* User Dropdown Modal */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 rounded-xl shadow-2xl border border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3.5 py-2.5 border-b border-slate-800 bg-slate-950/70">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        BML Munjal University
                      </p>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                        {currentUser.role.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono truncate">{currentUser.email}</p>
                    <p className="text-[10px] text-blue-400 font-medium mt-0.5 truncate">{currentUser.department}</p>
                  </div>

                  {/* Real-time Theme Accent Color Picker Section */}
                  {onChangeAccentColor && (
                    <div className="px-3.5 py-2.5 border-b border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                          <Palette className="w-3.5 h-3.5 text-blue-400" />
                          Color Palette (Live)
                        </span>
                        <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">
                          {accentColor}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        {[
                          { id: 'blue', name: 'Blue', color: 'bg-blue-500', ring: 'ring-blue-400' },
                          { id: 'emerald', name: 'Emerald', color: 'bg-emerald-500', ring: 'ring-emerald-400' },
                          { id: 'purple', name: 'Purple', color: 'bg-purple-500', ring: 'ring-purple-400' },
                          { id: 'cyan', name: 'Cyan', color: 'bg-cyan-500', ring: 'ring-cyan-400' },
                          { id: 'rose', name: 'Rose', color: 'bg-rose-500', ring: 'ring-rose-400' },
                          { id: 'amber', name: 'Amber', color: 'bg-amber-500', ring: 'ring-amber-400' }
                        ].map((item) => {
                          const isSelected = accentColor === item.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                onChangeAccentColor(item.id);
                              }}
                              className={`w-6 h-6 rounded-full ${item.color} transition-all flex items-center justify-center cursor-pointer ${
                                isSelected ? `ring-2 ring-white scale-110 shadow-lg` : 'opacity-70 hover:opacity-100 hover:scale-105'
                              }`}
                              title={`Switch to ${item.name} Accent`}
                            >
                              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white block" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Mode Switcher Section (Demo Mode vs Clean Slate) */}
                  {onToggleDemoMode && (
                    <div className="px-3.5 py-2.5 border-b border-slate-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            {isDemoMode ? 'Mentor Demo Mode' : 'Clean Slate (Prod)'}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {isDemoMode ? 'Presentation data active' : 'Fresh production slate'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            onToggleDemoMode(!isDemoMode);
                          }}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all border ${
                            isDemoMode
                              ? 'bg-amber-950/70 text-amber-300 border-amber-600/80 hover:bg-amber-900/80'
                              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                          }`}
                        >
                          {isDemoMode ? 'Switch to Reset' : 'Load Demo'}
                        </button>
                      </div>
                    </div>
                  )}

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
