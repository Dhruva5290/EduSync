import React, { useState, useEffect } from 'react';
import {
  Search,
  Fingerprint,
  Bell,
  ChevronDown,
  Menu,
  Check,
  AlertCircle,
  Clock,
  ExternalLink,
  GraduationCap,
  Shield,
  LogOut,
  Radio,
} from 'lucide-react';
import { FlaggedDoubt, User } from '../../types';

interface HeaderProps {
  onOpenSearch: () => void;
  onToggleMobileSidebar: () => void;
  unreadDoubtsCount: number;
  doubts: FlaggedDoubt[];
  onSelectDoubt: (doubt: FlaggedDoubt) => void;
  onOpenAntigravityModal?: () => void;
  onOpenEcosystemPing?: () => void;
  currentUser?: User | null;
  allUsers?: User[];
  onSwitchUser?: (user: User) => void;
  onLogout?: () => void;
  isAuditing?: boolean;
  onExitAudit?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onToggleMobileSidebar,
  unreadDoubtsCount,
  doubts,
  onSelectDoubt,
  onOpenAntigravityModal,
  onOpenEcosystemPing,
  currentUser,
  allUsers = [],
  onSwitchUser,
  onLogout,
  isAuditing,
  onExitAudit,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<'In Lecture (Room 210)' | 'Available (Cabin 304)' | 'In Lab' | 'Do Not Disturb'>('In Lecture (Room 210)');
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());

  // Live real-time clock ticking every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header
      id="app-header"
      className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-white/95 backdrop-blur-xl border-b border-[#eaedff] z-40 flex items-center justify-between px-3 sm:px-6 transition-all"
    >
      {/* Left section: Hamburger (mobile) + Global Search */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 max-w-xl">
        <button
          id="mobile-sidebar-toggle-btn"
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-[#464555] hover:bg-[#f2f3ff] transition-colors shrink-0"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div
          id="global-search-trigger"
          onClick={onOpenSearch}
          className="relative w-full max-w-md cursor-pointer group min-w-0"
        >
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#777587] group-hover:text-[#3525cd] transition-colors" />
          <div className="w-full h-9 pl-9 pr-14 bg-[#f2f3ff] hover:bg-[#eaedff] rounded-lg text-[13px] text-[#464555] flex items-center select-none border border-transparent hover:border-[#dae2fd] transition-all truncate">
            <span className="truncate">Search students, courses (e.g. ES-101)...</span>
          </div>
          <span className="font-['JetBrains_Mono'] text-[11px] absolute right-2.5 top-1/2 -translate-y-1/2 bg-[#dae2fd] text-[#464555] px-1.5 py-0.5 rounded font-medium hidden sm:inline">
            ⌘K
          </span>
        </div>

        {/* Biometric Status Pill */}
        <div
          id="biometric-quick-status-pill"
          className="hidden 2xl:flex items-center gap-1.5 px-3 py-1 bg-[#f2f3ff] rounded-full border border-[#dae2fd] shrink-0"
          title="Verified at Biometric Gate 3 (East)"
        >
          <Fingerprint className="w-3.5 h-3.5 text-[#006e4b]" />
          <span className="font-['JetBrains_Mono'] text-[12px] text-[#006e4b] font-semibold whitespace-nowrap">
            Punch: 08:42 AM
          </span>
        </div>
      </div>

      {/* Right actions: Live Watch + Ecosystem Ping + Notifications & Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Live Real-Time Digital Watch */}
        <div
          id="header-live-watch"
          className="flex items-center gap-2 px-3 py-1.5 bg-[#f2f3ff] rounded-xl border border-[#dae2fd] text-[#131b2e] shadow-xs shrink-0"
          title="Live campus synchronization time"
        >
          <Clock className="w-4 h-4 text-[#3525cd] shrink-0 animate-pulse" />
          <div className="flex items-center gap-1.5 font-['JetBrains_Mono']">
            <span className="text-[13px] font-bold text-[#131b2e] tracking-tight">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <span className="hidden xl:inline text-[11px] text-[#777587]">
              • {currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Ping Google & Apple Ecosystem Button */}
        {onOpenEcosystemPing && (
          <button
            id="ecosystem-ping-btn"
            onClick={onOpenEcosystemPing}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-[#d0cbff] bg-[#e2dfff]/50 hover:bg-[#e2dfff] text-[#0f0069] text-[12px] font-bold transition-all cursor-pointer shadow-2xs shrink-0 whitespace-nowrap"
            title="Connect & Ping Google Mail, Calendar, and Apple iOS"
          >
            <Radio className="w-3.5 h-3.5 text-[#3525cd] animate-pulse shrink-0" />
            <span className="hidden md:inline">Ping Google / iOS</span>
            <span className="md:hidden">Ping</span>
          </button>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button
            id="notifications-toggle-btn"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="relative p-2 rounded-lg text-[#464555] hover:bg-[#f2f3ff] hover:text-[#131b2e] transition-colors cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadDoubtsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-[#ba1a1a] ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div
              id="notifications-popover"
              className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-[#eaedff] py-2 z-50 animate-in fade-in slide-in-from-top-2"
            >
              <div className="px-4 py-2 border-b border-[#f2f3ff] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="font-['Sora'] font-semibold text-[14px] text-[#131b2e]">
                    Notifications & Doubts
                  </span>
                  <span className="bg-[#ffdad6] text-[#ba1a1a] font-['JetBrains_Mono'] text-[10px] font-bold px-1.5 py-0.5 rounded">
                    {unreadDoubtsCount} urgent
                  </span>
                </div>
                <span className="text-[12px] text-[#3525cd] hover:underline cursor-pointer">
                  Mark all read
                </span>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-[#f2f3ff]">
                {doubts.slice(0, 4).map((doubt) => (
                  <div
                    key={doubt.id}
                    onClick={() => {
                      onSelectDoubt(doubt);
                      setShowNotifications(false);
                    }}
                    className="p-3 hover:bg-[#f2f3ff] cursor-pointer transition-colors flex items-start gap-2.5"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[11px]">
                      !
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-['JetBrains_Mono'] text-[11px] font-bold text-[#3525cd]">
                          {doubt.courseCode} • {doubt.studentName}
                        </span>
                        <span className="text-[10px] text-[#777587] font-['JetBrains_Mono']">
                          {doubt.submittedTime}
                        </span>
                      </div>
                      <p className="text-[12px] text-[#131b2e] font-medium truncate mt-0.5">
                        {doubt.topic}
                      </p>
                      <p className="text-[11px] text-[#464555] line-clamp-2 mt-0.5">
                        {doubt.question}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Dean Dispatch announcement */}
                <div className="p-3 bg-[#faf8ff] flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-[#6b38d4] shrink-0 mt-0.5" />
                  <div className="text-[12px]">
                    <span className="font-semibold text-[#131b2e]">
                      Dean Academic Notice:
                    </span>{' '}
                    Mid-term question papers submission portal locks Friday 5:00 PM.
                  </div>
                </div>
              </div>

              <div className="px-4 py-2 border-t border-[#f2f3ff] text-center bg-[#faf8ff]">
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-[12px] text-[#3525cd] font-semibold hover:underline"
                >
                  View All Urgent Inquiries
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Capsule */}
        <div className="relative">
          <div
            id="user-profile-capsule"
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 pl-1.5 pr-3 py-1 bg-[#f2f3ff] hover:bg-[#eaedff] rounded-full transition-colors cursor-pointer border border-[#e2e7ff]"
          >
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZhppTRPu4AYwpSc7FogmrWYNU-MGZ_QACBWCi0pIY4Pd_JBADPwtyhhGht2YhKfvgkZFr0fma-1g8ngZgO4MVESI86tK73V4ztr86-FjGyROHzqRbs92eMCpazY0C5IN6kIFl9Q4DCYFUaqVy8KV0KfTzRrsgvngbaxPaVJvYP2iojN4clflVLnqyOaVF0YZ1GZU7GyD6aqv7aLNseMeKhV2gqFLw7GQIqADxa4e9PNC8z8SRrhZQ"
              alt="Dr. Sanmitra Bhattacharya Profile Avatar"
              className="w-8 h-8 rounded-full object-cover ring-1 ring-white"
            />
            <div className="hidden sm:flex flex-col text-left">
              <span className="font-semibold text-[13px] text-[#131b2e] leading-tight">
                Dr. Sanmitra Bhattacharya
              </span>
              <span className="font-['JetBrains_Mono'] text-[11px] text-[#464555] leading-none mt-0.5">
                Assoc. Professor • CSE
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-[#777587] ml-0.5" />
          </div>

          {/* Profile Status Dropdown */}
          {showProfileMenu && (
            <div
              id="profile-dropdown-menu"
              className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-[#eaedff] py-2 z-50 animate-in fade-in"
            >
              <div className="px-4 py-2 border-b border-[#f2f3ff]">
                <p className="text-[11px] uppercase font-bold text-[#777587] tracking-wider font-['JetBrains_Mono']">
                  Active Faculty Status
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#006e4b] animate-pulse" />
                  <span className="text-[13px] font-semibold text-[#131b2e]">
                    {currentStatus}
                  </span>
                </div>
              </div>

              <div className="py-1">
                {(
                  [
                    'In Lecture (Room 210)',
                    'Available (Cabin 304)',
                    'In Lab',
                    'Do Not Disturb',
                  ] as const
                ).map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setCurrentStatus(status);
                      setShowProfileMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-[12px] flex items-center justify-between hover:bg-[#f2f3ff] text-[#464555] hover:text-[#131b2e]"
                  >
                    <span>{status}</span>
                    {currentStatus === status && (
                      <Check className="w-3.5 h-3.5 text-[#3525cd]" />
                    )}
                  </button>
                ))}
              </div>

              <div className="border-t border-[#f2f3ff] px-4 py-2 text-[11px] text-[#777587]">
                <div>Staff ID: <span className="font-mono text-[#131b2e]">FAC-CSE-2018-09</span></div>
                <div>Cabin: <span className="text-[#131b2e]">Block 3, Room 304</span></div>
              </div>

              {(onLogout || isAuditing) && (
                <div className="border-t border-[#f2f3ff] p-1.5 flex flex-col gap-1">

                  {isAuditing && onExitAudit && (
                    <button
                      onClick={() => {
                        onExitAudit();
                        setShowProfileMenu(false);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg text-left text-[12px] flex items-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-800 font-medium transition-colors cursor-pointer"
                    >
                      <span>Exit Audit Mode</span>
                    </button>
                  )}

                  {onLogout && (
                    <button
                      onClick={() => {
                        onLogout();
                        setShowProfileMenu(false);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg text-left text-[12px] flex items-center gap-2 hover:bg-[#ffdad6] text-[#ba1a1a] font-medium transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-[#ba1a1a]" />
                      <span>Sign Out</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
