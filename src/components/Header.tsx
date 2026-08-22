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
  Building2
} from 'lucide-react';

interface HeaderProps {
  currentUser: User;
  allUsers: User[];
  onSwitchUser: (userId: string) => void;
  subjects: Subject[];
  activeSubjectId: string;
  onSelectSubject: (subjectId: string) => void;
  rateLimitRemaining?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  allUsers,
  onSwitchUser,
  subjects,
  activeSubjectId,
  onSelectSubject,
  rateLimitRemaining = 58
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const activeSubject = subjects.find(s => s.id === activeSubjectId) || subjects[0];

  const toggleRole = () => {
    // 3-way toggle between student, teacher, and admin
    if (currentUser.role === 'student') {
      const teacher = allUsers.find(u => u.role === 'teacher');
      if (teacher) onSwitchUser(teacher.id);
    } else if (currentUser.role === 'teacher') {
      const admin = allUsers.find(u => u.role === 'admin');
      if (admin) onSwitchUser(admin.id);
      else {
        const student = allUsers.find(u => u.role === 'student');
        if (student) onSwitchUser(student.id);
      }
    } else {
      const student = allUsers.find(u => u.role === 'student');
      if (student) onSwitchUser(student.id);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 shadow-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Active Course & ID info */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight truncate max-w-xs sm:max-w-md">
                {currentUser.role === 'admin' ? 'Academic Administration & Registrar' : (activeSubject?.name || 'Advanced Academic Course')}
              </h2>
              <span className="px-2 py-0.5 bg-slate-800 text-blue-400 text-[10px] font-mono rounded-sm border border-slate-700 shrink-0 font-medium">
                {currentUser.role === 'admin' ? 'REGISTRAR-OPS' : `ID: ${activeSubject?.code || 'CRS-101'}`}
              </span>
            </div>

            {/* Course Switcher (only for student or teacher) */}
            {currentUser.role !== 'admin' && (
              <div className="flex items-center gap-1.5 ml-1 sm:ml-2 pl-2 sm:pl-3 border-l border-slate-800">
                <span className="hidden sm:inline text-[10px] uppercase font-bold tracking-wider text-slate-400">Course:</span>
                <select
                  id="header-subject-select"
                  aria-label="Current Course Selector"
                  value={activeSubjectId}
                  onChange={(e) => onSelectSubject(e.target.value)}
                  className="bg-slate-950 text-xs font-semibold text-slate-200 border border-slate-700 rounded-sm px-2 py-1 focus:outline-none focus:border-blue-500 cursor-pointer max-w-[160px] sm:max-w-xs truncate"
                >
                  {subjects.map((subj) => (
                    <option key={subj.id} value={subj.id} className="bg-slate-900 text-slate-200">
                      {subj.code} · {subj.name} ({subj.teacherName.split(' ').pop()})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Right Controls: Role Indicator, AI Quota, User Profile */}
          <div className="flex items-center gap-3">
            {/* Quick Role Switcher Button */}
            <button
              id="header-quick-role-toggle-btn"
              onClick={toggleRole}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-sm text-xs font-semibold border transition-all shadow-xs ${
                currentUser.role === 'admin'
                  ? 'bg-purple-950/60 text-purple-300 border-purple-800 hover:bg-purple-900/80'
                  : currentUser.role === 'teacher'
                  ? 'bg-blue-950/60 text-blue-300 border-blue-800 hover:bg-blue-900/80'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
              }`}
              title="Click to cycle between Student, Faculty, and Registrar viewpoints"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">
                {currentUser.role === 'student'
                  ? 'Switch to Faculty View'
                  : currentUser.role === 'teacher'
                  ? 'Switch to Admin View'
                  : 'Switch to Student View'}
              </span>
            </button>

            {/* Rate limit & security meter */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-slate-950 text-slate-300 text-xs font-medium border border-slate-800">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[11px] font-mono text-slate-400">{rateLimitRemaining}/60 RPM</span>
            </div>

            {/* User Dropdown */}
            <div className="relative">
              <button
                id="header-user-menu-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2.5 p-1.5 rounded-md hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600/30 text-blue-300 border border-blue-500/40 flex items-center justify-center text-xs font-bold ring-1 ring-slate-800">
                  {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="truncate max-w-[120px]">{currentUser.name}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-sm font-semibold uppercase ${
                        currentUser.role === 'admin'
                          ? 'bg-purple-900/60 text-purple-300 border border-purple-700/50'
                          : currentUser.role === 'teacher'
                          ? 'bg-blue-900/60 text-blue-300 border border-blue-700/50'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {currentUser.role === 'admin' ? 'Dean/Admin' : currentUser.role === 'teacher' ? 'Faculty' : 'Student'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {currentUser.institutionalId}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {/* User Switcher Dropdown Modal */}
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
                  </div>

                  <div className="p-2 max-h-80 overflow-y-auto space-y-3">
                    {/* 1. Faculty Section */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 px-2 py-1 flex items-center justify-between">
                        <span>Faculty Instructors ({allUsers.filter(u => u.role === 'teacher').length})</span>
                        <span className="font-mono text-[9px] text-slate-400">5 Departments</span>
                      </p>
                      <div className="space-y-1">
                        {allUsers.filter(u => u.role === 'teacher').map((user) => (
                          <button
                            key={user.id}
                            onClick={() => {
                              onSwitchUser(user.id);
                              setShowUserMenu(false);
                            }}
                            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-sm text-left text-xs transition-colors ${
                              user.id === currentUser.id
                                ? 'bg-blue-950/90 text-blue-200 border border-blue-700 font-semibold'
                                : 'hover:bg-slate-800 text-slate-300'
                            }`}
                          >
                            <div className="w-6 h-6 rounded-full bg-blue-900/60 text-blue-300 border border-blue-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div className="flex-1 truncate">
                              <div className="flex items-center justify-between">
                                <span className="truncate text-white font-medium">{user.name}</span>
                                <span className="text-[9px] px-1 rounded-xs bg-blue-950 text-blue-300 border border-blue-800 font-mono">
                                  {user.designation || 'Faculty'}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono block truncate">{user.department}</span>
                            </div>
                            {user.id === currentUser.id && <UserCheck className="w-4 h-4 text-blue-400 shrink-0" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 2. Admin Section */}
                    {allUsers.some(u => u.role === 'admin') && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-purple-400 px-2 py-1">
                          Registrar & Administration
                        </p>
                        <div className="space-y-1">
                          {allUsers.filter(u => u.role === 'admin').map((user) => (
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
                              <div className="w-6 h-6 rounded-full bg-purple-900/60 text-purple-300 border border-purple-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                                {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </div>
                              <div className="flex-1 truncate">
                                <div className="flex items-center justify-between">
                                  <span className="truncate text-white font-medium">{user.name}</span>
                                  <span className="text-[9px] px-1 rounded-xs bg-purple-950 text-purple-300 border border-purple-800 font-mono">
                                    Registrar
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono block truncate">{user.department}</span>
                              </div>
                              {user.id === currentUser.id && <UserCheck className="w-4 h-4 text-purple-400 shrink-0" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 3. Students Section */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 px-2 py-1 flex items-center justify-between">
                        <span>B.Tech Students ({allUsers.filter(u => u.role === 'student').length})</span>
                        <span className="font-mono text-[9px] text-slate-400">1st Year Cohort</span>
                      </p>
                      <div className="space-y-1">
                        {allUsers.filter(u => u.role === 'student').map((user) => (
                          <button
                            key={user.id}
                            onClick={() => {
                              onSwitchUser(user.id);
                              setShowUserMenu(false);
                            }}
                            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-sm text-left text-xs transition-colors ${
                              user.id === currentUser.id
                                ? 'bg-emerald-950/90 text-emerald-200 border border-emerald-700 font-semibold'
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
                                  {user.institutionalId}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono block truncate">{user.department}</span>
                            </div>
                            {user.id === currentUser.id && <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
