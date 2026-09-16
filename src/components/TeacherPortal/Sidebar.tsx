import React from 'react';
import {
  Calendar,
  UserCheck,
  TrendingUp,
  UploadCloud,
  CalendarDays,
  ClipboardList,
  Sparkles,
  CheckCircle,
  X,
} from 'lucide-react';
import { ScreenId } from '../../types';

interface SidebarProps {
  currentScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  activeBatchCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  onSelectScreen,
  mobileOpen,
  onCloseMobile,
  activeBatchCount = 4,
}) => {
  const navItems = [
    {
      id: 'daily-schedule' as ScreenId,
      label: 'Daily Schedule',
      icon: Calendar,
      badge: null,
    },
    // Only display attendance session in the left-hand bar when active/opened
    ...(currentScreen === 'student-attendance'
      ? [
          {
            id: 'student-attendance' as ScreenId,
            label: 'Take Attendance',
            icon: UserCheck,
            badge: { text: 'ACTIVE SESSION', bg: 'bg-[#6ffbbe] text-[#002113]' },
          },
        ]
      : []),
    {
      id: 'student-performance' as ScreenId,
      label: 'Student Performance',
      icon: TrendingUp,
      badge: null,
    },
    {
      id: 'upload-documents' as ScreenId,
      label: 'Upload Documents',
      icon: UploadCloud,
      badge: null,
    },
    {
      id: 'academic-calendar' as ScreenId,
      label: 'Academic Calendar',
      icon: CalendarDays,
      badge: null,
    },
    {
      id: 'teacher-workspace-and-leaves' as ScreenId,
      label: 'Teacher Workspace',
      icon: ClipboardList,
      badge: null,
    },
    {
      id: 'ai-teacher-assistant' as ScreenId,
      label: 'AI Assistant',
      icon: Sparkles,
      badge: null,
      isAi: true,
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          id="sidebar-mobile-overlay"
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed left-0 top-0 bottom-0 w-64 bg-white z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)] overflow-y-auto transition-transform duration-200 ease-in-out border-r border-[#eaedff] ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col">
          {/* Brand Header */}
          <div className="h-16 px-4 flex items-center justify-between bg-white border-b border-[#f2f3ff]">
            <div className="flex items-center gap-2.5">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKpbeIO4zZKGIEHVWXA9NLjZcNgDJOBVHRCx-7dVgjYESPWMvsgWFeQVuQGlVGNCCIY87Irb2eMk6ifzO4O1lBMOrBw1hge2RbZNfg1KNgetj7AsdO8-9IeURvV04vaB5BvFmSqlFELM83491LRpO9tcGWCo3suQQSMboK1RNk33viFjbz21T09CsodTEbyC0BcQCzjxUNGxwuw3w-3Oy6wM8iuuUJ-BQXjUknFDRrZ8aE0Alfnrn5"
                alt="ClassSarthi Portal Logo"
                className="h-8 w-auto object-contain"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-['Sora'] font-semibold text-[17px] text-[#3525cd] tracking-tight leading-none">
                    ClassSarthi
                  </span>
                  <span className="font-['JetBrains_Mono'] text-[10px] font-bold bg-[#e2dfff] text-[#0f0069] px-1.5 py-0.5 rounded tracking-wide">
                    FACULTY
                  </span>
                </div>
                <span className="text-[12px] text-[#464555] leading-none mt-1 font-medium">
                  Master Portal
                </span>
              </div>
            </div>

            <button
              id="close-mobile-sidebar-btn"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-[#777587] hover:bg-[#f2f3ff] rounded-lg"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Academic Semester Week Pill */}
          <div className="px-4 py-2">
            <div className="p-2 bg-[#f2f3ff] rounded-lg flex items-center justify-between border border-[#e2e7ff]">
              <span className="font-['JetBrains_Mono'] text-[12px] text-[#464555] font-medium truncate">
                Spring 2026 • W8
              </span>
              <span className="h-2 w-2 rounded-full bg-[#006e4b] animate-pulse" />
            </div>
          </div>

          {/* Nav List */}
          <nav className="flex flex-col gap-1 px-2.5 py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id;

              if (isActive) {
                return (
                  <button
                    key={item.id}
                    id={`nav-item-${item.id}`}
                    onClick={() => {
                      onSelectScreen(item.id);
                      onCloseMobile();
                    }}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all bg-[#4f46e5] text-white font-medium shadow-xs text-left w-full cursor-pointer"
                  >
                    <Icon className="w-[18px] h-[18px] shrink-0" />
                    <span className="text-[14px] truncate">{item.label}</span>
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => {
                    onSelectScreen(item.id);
                    onCloseMobile();
                  }}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-left w-full cursor-pointer ${
                    item.isAi
                      ? 'text-[#6b38d4] hover:bg-[#eaedff] font-medium'
                      : 'text-[#464555] hover:bg-[#eaedff] hover:text-[#131b2e]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon
                      className={`w-[18px] h-[18px] shrink-0 ${
                        item.isAi ? 'text-[#6b38d4]' : 'text-[#777587]'
                      }`}
                    />
                    <span className="text-[14px] truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`font-['JetBrains_Mono'] text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase ${item.badge.bg}`}
                    >
                      {item.badge.text}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Status Card */}
        <div className="p-3 flex flex-col gap-2.5 bg-white border-t border-[#eaedff]">
          <div className="bg-[#f2f3ff] p-2.5 rounded-xl flex flex-col gap-1.5 border border-[#e2e7ff]">
            <div className="flex items-center justify-between">
              <span className="font-['JetBrains_Mono'] text-[11px] text-[#464555] font-semibold uppercase tracking-wider">
                Active Classes
              </span>
              <span className="font-['JetBrains_Mono'] text-[11px] text-[#006e4b] font-bold">
                {activeBatchCount} Batches
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1 font-['JetBrains_Mono'] text-[11px]">
              <span className="bg-white text-[#131b2e] px-1.5 py-1 rounded text-center truncate border border-[#e2e7ff] font-medium">
                ES-101 (A/C)
              </span>
              <span className="bg-white text-[#131b2e] px-1.5 py-1 rounded text-center truncate border border-[#e2e7ff] font-medium">
                ME-102 (B)
              </span>
              <span className="bg-white text-[#131b2e] px-1.5 py-1 rounded text-center truncate col-span-2 border border-[#e2e7ff] font-medium">
                ES-101L (CSE Labs)
              </span>
            </div>
          </div>

          <div className="px-1 py-1 flex items-center justify-between text-[11px] text-[#464555]">
            <div className="flex items-center gap-1.5 font-['JetBrains_Mono']">
              <span className="h-2 w-2 rounded-full bg-[#006e4b] animate-pulse" />
              <span className="truncate">DB Synced • Operational</span>
            </div>
            <CheckCircle className="w-3.5 h-3.5 text-[#006e4b]" />
          </div>
        </div>
      </aside>
    </>
  );
};
