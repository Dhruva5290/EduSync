import React, { useState } from 'react';
import { User } from '../../types';
import { useStudentContext } from '../../context/StudentContext';
import { StudentHomeTab } from './Tabs/StudentHomeTab';
import { ClassesTab } from './Tabs/ClassesTab';
import { LectureDetailPage } from './LectureDetailPage';
import { QuizTab } from './Tabs/QuizTab';
import { AITutorTab } from './Tabs/AITutorTab';
import { AssignmentsTab } from './Tabs/AssignmentsTab';
import { TodoListTab } from './Tabs/TodoListTab';
import { PluginsTab } from './Tabs/PluginsTab';
import { SettingsTab } from './Tabs/SettingsTab';
import {
  LayoutDashboard,
  BookOpen,
  Sparkles,
  FileCheck,
  CheckSquare,
  Plug,
  HelpCircle,
  Settings,
  Search,
  Bell,
  Clock,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  ScanLine,
  Bot,
  LogOut
} from 'lucide-react';

interface StudentPortalLayoutProps {
  currentUser: User;
  onOpenPersonaModal?: () => void;
  onLogout?: () => void;
}

export type StudentTabId =
  | 'dashboard'
  | 'classes'
  | 'lecture-detail'
  | 'tutor'
  | 'assignments'
  | 'todo'
  | 'plugins'
  | 'quiz'
  | 'settings';

export const StudentPortalLayout: React.FC<StudentPortalLayoutProps> = ({
  currentUser,
  onOpenPersonaModal,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<StudentTabId>('dashboard');
  const [selectedLectureId, setSelectedLectureId] = useState<string>('lec-phy-101');
  const [tutorInitialPrompt, setTutorInitialPrompt] = useState<string | undefined>(undefined);
  const [tutorInitialTopic, setTutorInitialTopic] = useState<string | undefined>(undefined);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { dashboardData } = useStudentContext();

  const handleNavigateToLecture = (lectureId: string) => {
    setSelectedLectureId(lectureId);
    setActiveTab('lecture-detail');
    setMobileMenuOpen(false);
  };

  const handleNavigateToClasses = (subjectId?: string) => {
    setActiveTab('classes');
    setMobileMenuOpen(false);
  };

  const handleNavigateToQuiz = (lectureId?: string) => {
    if (lectureId) setSelectedLectureId(lectureId);
    setActiveTab('quiz');
    setMobileMenuOpen(false);
  };

  const handleNavigateToTutor = (initialPrompt?: string, weakTopic?: string) => {
    setTutorInitialPrompt(initialPrompt);
    setTutorInitialTopic(weakTopic);
    setActiveTab('tutor');
    setMobileMenuOpen(false);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'classes', label: 'Classes', icon: BookOpen },
    { id: 'tutor', label: 'AI Tutor', icon: Sparkles },
    { id: 'assignments', label: 'Assignments', icon: FileCheck },
    { id: 'todo', label: 'To-Do List', icon: CheckSquare },
    { id: 'plugins', label: 'Plugins', icon: Plug },
    { id: 'quiz', label: 'Quiz', icon: HelpCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen w-screen bg-[#f8f9ff] text-[#0b1c30] font-sans antialiased overflow-hidden">
      {/* DESKTOP SIDEBAR */}
      <aside className={`hidden md:flex flex-col bg-white border-r border-slate-100 z-50 shrink-0 transition-all duration-200 justify-between shadow-[0_1px_12px_rgba(0,0,0,0.03)] ${
        sidebarCollapsed ? 'w-20' : 'w-60'
      }`}>
        <div className="flex flex-col">
          {/* Header & Logo */}
          <div className="h-16 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-[#c2410c] text-white flex items-center justify-center font-bold text-sm shadow-[0_2px_8px_rgba(163,57,0,0.25)] shrink-0">
                ES
              </div>
              {!sidebarCollapsed && (
                <span className="font-bold text-lg text-[#0b1c30] tracking-tight truncate">
                  EduSync
                </span>
              )}
            </div>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
              title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              type="button"
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 px-2.5 mt-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id || (activeTab === 'lecture-detail' && item.id === 'classes');

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as StudentTabId)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-full transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-[#c2410c] text-white font-semibold text-sm shadow-[0_4px_14px_rgba(194,65,12,0.3)]'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium text-sm'
                  }`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card */}
        <div className="p-2.5 m-1.5">
          <div className="bg-slate-50/80 rounded-xl p-2.5 flex items-center gap-2.5 border border-slate-100">
            <div className="w-9 h-9 rounded-full bg-[#c2410c] text-white flex items-center justify-center font-bold text-sm shrink-0">
              {currentUser.name.charAt(0)}
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-semibold text-xs text-[#0b1c30] truncate">{currentUser.name}</span>
                <span className="text-[11px] text-slate-500 truncate">{currentUser.email}</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* TOP HEADER */}
        <header className="h-16 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-6 sm:px-8 flex items-center justify-between z-40 shrink-0 shadow-[0_1px_8px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search Bar */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-4 py-1.5 rounded-full w-full max-w-md shadow-2xs">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search lessons, quizzes, notes..."
                className="bg-transparent border-none outline-none text-sm text-slate-800 placeholder:text-slate-400 w-full font-normal"
              />
            </div>
          </div>

          {/* Controls Right */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200/70 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#c2410c]"></span>
            </button>

            <button
              onClick={() => setActiveTab('todo')}
              type="button"
              className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200/70 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Schedule & Deadlines"
            >
              <Clock className="w-4 h-4" />
            </button>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-8 h-8 rounded-full bg-[#c2410c] text-white flex items-center justify-center hover:bg-[#ea580c] transition-colors cursor-pointer text-xs font-bold shadow-xs"
              >
                {currentUser.name.charAt(0)}
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-slate-100 shadow-xl p-2 z-50 space-y-1">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{currentUser.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2 cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Account Settings</span>
                  </button>
                  {onLogout && (
                    <button
                      onClick={onLogout}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* SCROLLABLE MAIN VIEW CONTAINER */}
        <main className="flex-1 overflow-y-auto bg-[#f8f9ff] min-h-screen">
          {activeTab === 'dashboard' && (
            <StudentHomeTab
              currentUser={currentUser}
              onNavigateToLecture={handleNavigateToLecture}
              onNavigateToClasses={handleNavigateToClasses}
              onNavigateToQuiz={handleNavigateToQuiz}
              onNavigateToTutor={handleNavigateToTutor}
              onNavigateToAssignments={() => setActiveTab('assignments')}
            />
          )}

          {activeTab === 'classes' && (
            <ClassesTab
              onSelectLecture={handleNavigateToLecture}
            />
          )}

          {activeTab === 'lecture-detail' && (
            <LectureDetailPage
              lectureId={selectedLectureId}
              currentUser={currentUser}
              onBack={() => setActiveTab('classes')}
              onOpenQuiz={handleNavigateToQuiz}
              onOpenTutor={handleNavigateToTutor}
            />
          )}

          {activeTab === 'quiz' && (
            <QuizTab
              initialLectureId={selectedLectureId}
              onNavigateToTutorWithMistake={(mistakePrompt, topic) => handleNavigateToTutor(mistakePrompt, topic)}
            />
          )}

          {activeTab === 'tutor' && (
            <AITutorTab
              currentUser={currentUser}
              initialPrompt={tutorInitialPrompt}
              initialWeakTopic={tutorInitialTopic}
            />
          )}

          {activeTab === 'assignments' && (
            <AssignmentsTab />
          )}

          {activeTab === 'todo' && (
            <TodoListTab />
          )}

          {activeTab === 'plugins' && (
            <PluginsTab />
          )}

          {activeTab === 'settings' && (
            <SettingsTab currentUser={currentUser} />
          )}
        </main>
      </div>

      {/* FLOATING ACTION BUTTONS */}
      <div className="fixed bottom-6 left-72 z-50 hidden lg:block">
        <button
          onClick={() => setActiveTab('classes')}
          aria-label="OCR Scan Snapshot"
          className="w-12 h-12 rounded-full bg-[#006947] hover:bg-[#00855b] text-white flex items-center justify-center shadow-[0_8px_20px_-2px_rgba(0,105,71,0.35)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
          type="button"
          title="ClassSarthi Realtime OCR Notes"
        >
          <ScanLine className="w-6 h-6" />
        </button>
      </div>

      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => handleNavigateToTutor()}
          aria-label="AI Assistant Chat"
          className="w-12 h-12 rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white flex items-center justify-center shadow-[0_8px_20px_-2px_rgba(37,99,235,0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
          type="button"
          title="Open AI Tutor Chat"
        >
          <Bot className="w-6 h-6" />
        </button>
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 md:hidden flex">
          <div className="w-64 bg-white h-full p-4 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#c2410c] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    ES
                  </div>
                  <span className="font-extrabold text-lg text-slate-900 tracking-tight">EduSync</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-1">
                {navItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as StudentTabId);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-full text-sm font-semibold text-left transition-all ${
                        isActive
                          ? 'bg-[#c2410c] text-white shadow-[0_4px_14px_rgba(194,65,12,0.3)]'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{currentUser.email}</p>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </div>
  );
};
