import React from 'react';
import {
  LayoutGrid,
  BookOpen,
  Sparkles,
  CheckSquare,
  ListTodo,
  Puzzle,
  Brain,
  Settings,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  FileQuestion,
  Calendar,
  Award,
  Users,
  Server,
  ShieldCheck,
  Building,
  LogOut,
} from 'lucide-react';
import { NavRoute, User, UserRole } from '../types';

interface SidebarProps {
  currentRoute: NavRoute;
  onNavigate: (route: NavRoute) => void;
  currentUser: User;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onSwitchUser?: (userId: string) => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onNavigate,
  currentUser,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  onLogout,
}) => {
  // Define nav sections based on user role
  const getNavItems = (): { route: NavRoute; label: string; icon: React.ReactNode }[] => {
    if (currentUser.role === 'teacher') {
      return [
        { route: 'faculty-analytics', label: 'Class Diagnostics', icon: <TrendingUp className="w-5 h-5" /> },
        { route: 'classes', label: 'Classes & Lectures', icon: <BookOpen className="w-5 h-5" /> },
        { route: 'rubric-grader', label: 'Rubric Grader', icon: <Award className="w-5 h-5" /> },
        { route: 'question-bank', label: 'Question Bank', icon: <FileQuestion className="w-5 h-5" /> },
        { route: 'timeline-manager', label: 'Curriculum Timeline', icon: <Calendar className="w-5 h-5" /> },
        { route: 'ai-tutor', label: 'Socratic Tutor', icon: <Sparkles className="w-5 h-5" /> },
        { route: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
      ];
    }

    if (currentUser.role === 'admin') {
      return [
        { route: 'admin-metrics', label: 'Dean Overview', icon: <Building className="w-5 h-5" /> },
        { route: 'user-provisioning', label: 'User Directory', icon: <Users className="w-5 h-5" /> },
        { route: 'vault-recovery', label: 'Data Vault', icon: <Server className="w-5 h-5" /> },
        { route: 'security-audit', label: 'Security Audit', icon: <ShieldCheck className="w-5 h-5" /> },
        { route: 'faculty-analytics', label: 'Academic Mastery', icon: <TrendingUp className="w-5 h-5" /> },
        { route: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
      ];
    }

    // Default: Student
    return [
      { route: 'dashboard', label: 'Dashboard', icon: <LayoutGrid className="w-5 h-5" /> },
      { route: 'classes', label: 'Classes', icon: <BookOpen className="w-5 h-5" /> },
      { route: 'ai-tutor', label: 'AI Tutor', icon: <Sparkles className="w-5 h-5" /> },
      { route: 'assignments', label: 'Assignments', icon: <CheckSquare className="w-5 h-5" /> },
      { route: 'quiz', label: 'Practice Quiz', icon: <Brain className="w-5 h-5" /> },
      { route: 'to-do-list', label: 'To-Do List', icon: <ListTodo className="w-5 h-5" /> },
      { route: 'plugins', label: 'Plugins', icon: <Puzzle className="w-5 h-5" /> },
      { route: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
    ];
  };

  const navItems = getNavItems();

  const roleBadge =
    currentUser.role === 'admin'
      ? { label: 'Administrator', color: 'bg-[#eff4ff] text-[#0051d5]' }
      : currentUser.role === 'teacher'
      ? { label: 'Faculty', color: 'bg-[#fff3ea] text-[#a33900]' }
      : { label: 'Student', color: 'bg-[#e6f4ea] text-[#006947]' };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Persistent Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-white z-50 flex flex-col justify-between shadow-[0_1px_12px_rgba(0,0,0,0.04)] border-r border-[#e2e8f0]/80 transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex flex-col">
          {/* Top Logo & Collapse Button */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-[#eff4ff]">
            <div
              className="flex items-center gap-2.5 cursor-pointer select-none"
              onClick={() => {
                onNavigate(currentUser.role === 'teacher' ? 'faculty-analytics' : currentUser.role === 'admin' ? 'admin-metrics' : 'dashboard');
                onCloseMobile();
              }}
            >
              <div className="w-9 h-9 rounded-xl bg-[#a33900] flex items-center justify-center shadow-[0_2px_8px_rgba(163,57,0,0.25)] flex-shrink-0">
                <span className="font-bold text-white tracking-tight text-sm">ES</span>
              </div>
              {!collapsed && (
                <div className="flex flex-col">
                  <span className="font-extrabold text-base text-[#0b1c30] tracking-tight leading-none">
                    EduSync Studio
                  </span>
                  <span className="text-[10px] text-[#5a4138] mt-0.5 font-medium">Academic OS</span>
                </div>
              )}
            </div>
            <button
              onClick={onToggleCollapse}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="w-7 h-7 rounded-full hidden lg:flex items-center justify-center text-[#5a4138] hover:bg-[#eff4ff] hover:text-[#0b1c30] transition-colors cursor-pointer"
              type="button"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Role Indicator Banner */}
          {!collapsed && (
            <div className="px-4 pt-3 pb-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5a4138]">
                  Portal View
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${roleBadge.color}`}>
                  {roleBadge.label}
                </span>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 px-2.5 mt-2 overflow-y-auto max-h-[calc(100vh-210px)]">
            {navItems.map((item) => {
              const isActive = currentRoute === item.route;
              return (
                <button
                  key={item.route}
                  onClick={() => {
                    onNavigate(item.route);
                    onCloseMobile();
                  }}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 text-left cursor-pointer ${
                    isActive
                      ? 'bg-[#a33900] text-white shadow-[0_2px_10px_rgba(163,57,0,0.25)]'
                      : 'text-[#5a4138] hover:bg-[#eff4ff] hover:text-[#0b1c30]'
                  } ${collapsed ? 'justify-center px-0' : ''}`}
                  type="button"
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Card & Logout */}
        <div className="p-2.5 m-1 border-t border-[#eff4ff] flex flex-col gap-1.5">
          <div
            onClick={() => onNavigate('settings')}
            className={`bg-[#eff4ff] hover:bg-[#dce9ff] cursor-pointer rounded-xl p-2.5 flex items-center gap-2.5 transition-colors ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xs shadow-xs ${
                currentUser.role === 'admin'
                  ? 'bg-[#0051d5]'
                  : currentUser.role === 'teacher'
                  ? 'bg-[#a33900]'
                  : 'bg-[#a33900]'
              }`}
            >
              <span>{currentUser.role === 'student' ? 'S' : currentUser.avatarInitials}</span>
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-bold text-xs text-[#0b1c30] truncate">
                  {currentUser.role === 'student' ? `Student ${currentUser.name}` : currentUser.name}
                </span>
                <span className="text-[10px] text-[#5a4138] truncate">
                  {currentUser.email || currentUser.institutionalId}
                </span>
              </div>
            )}
          </div>

          {/* Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              title="Sign Out of EduSync"
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#ba1a1a] hover:bg-[#fff0f0] transition-colors cursor-pointer ${
                collapsed ? 'justify-center px-0' : ''
              }`}
              type="button"
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>Sign Out</span>}
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
