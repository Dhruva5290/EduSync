import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Menu,
  X,
  CheckCircle,
  AlertTriangle,
  LogOut,
  UserCheck,
  Settings,
  ChevronDown,
} from 'lucide-react';
import { User as UserType } from '../types';

interface HeaderProps {
  currentUser: UserType;
  collapsed: boolean;
  onOpenMobileSidebar: () => void;
  onSearchQuery?: (q: string) => void;
  onNavigateTo: (route: any) => void;
  onSwitchUser?: (userId: string) => void;
  onLogout?: () => void;
  allUsers?: UserType[];
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  collapsed,
  onOpenMobileSidebar,
  onNavigateTo,
  onSwitchUser,
  onLogout,
  allUsers = [],
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = [
    {
      id: 1,
      title: 'Classroom Notes Synchronized',
      desc: 'Physics 11 OCR Whiteboard sync completed.',
      time: '10m ago',
      urgent: false,
    },
    {
      id: 2,
      title: 'Problem Set #3 Evaluation',
      desc: 'Dhruva submitted Problem Set 3 - Ramp Friction. Ready for rubric review.',
      time: '25m ago',
      urgent: true,
    },
    {
      id: 3,
      title: 'Disaster Recovery Automated Check',
      desc: 'All 14 OWASP & data vault checkpoints verified with 100% pass.',
      time: '1h ago',
      urgent: false,
    },
  ];

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-white/90 backdrop-blur-xl z-40 shadow-[0_1px_8px_rgba(0,0,0,0.03)] border-b border-[#eff4ff] transition-all duration-300 ${
        collapsed ? 'left-20' : 'left-0 lg:left-64'
      }`}
    >
      <div className="h-16 w-full px-4 lg:px-6 flex items-center justify-between gap-3">
        {/* Left: Mobile hamburger + Global Search */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden w-9 h-9 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#5a4138] hover:text-[#0b1c30] cursor-pointer"
            type="button"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 bg-[#eff4ff] px-3.5 py-2 rounded-full w-full max-w-md focus-within:ring-2 focus-within:ring-[#0051d5]/30 transition-all">
            <Search className="w-4 h-4 text-[#5a4138] flex-shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search lessons, formulas, notes, assignments..."
              className="bg-transparent border-none outline-none text-xs text-[#0b1c30] placeholder:text-[#5a4138] w-full font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-xs text-[#5a4138] hover:text-black cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right actions: Notifications + User Profile Avatar */}
        <div className="flex items-center gap-2.5 relative">
          {/* Notifications button & popover */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className="w-9 h-9 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#5a4138] hover:text-[#0b1c30] hover:bg-[#dce9ff] transition-colors relative cursor-pointer"
              type="button"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ba1a1a]" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#e2e8f0] p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-[#eff4ff]">
                  <span className="font-bold text-sm text-[#0b1c30]">Notifications</span>
                  <span className="text-[11px] font-semibold text-[#0051d5] cursor-pointer hover:underline">
                    Mark all read
                  </span>
                </div>
                <div className="flex flex-col gap-2 mt-2 max-h-72 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-2.5 rounded-xl hover:bg-[#eff4ff] transition-colors cursor-pointer flex gap-2.5 items-start"
                      onClick={() => setShowNotifications(false)}
                    >
                      {n.urgent ? (
                        <AlertTriangle className="w-4 h-4 text-[#ba1a1a] flex-shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-[#006947] flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-xs text-[#0b1c30]">{n.title}</span>
                        <span className="text-[11px] text-[#5a4138] leading-tight mt-0.5">
                          {n.desc}
                        </span>
                        <span className="text-[10px] text-gray-400 mt-1">{n.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User profile avatar & menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className={`flex items-center gap-2 py-1 px-2 rounded-full hover:bg-[#eff4ff] transition-all cursor-pointer ${
                showUserMenu ? 'bg-[#eff4ff]' : ''
              }`}
              type="button"
              aria-label="User Profile Menu"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-xs ${
                  currentUser.role === 'admin'
                    ? 'bg-[#0051d5]'
                    : currentUser.role === 'teacher'
                    ? 'bg-[#a33900]'
                    : 'bg-[#006947]'
                }`}
              >
                <span>{currentUser.role === 'student' ? 'S' : currentUser.avatarInitials}</span>
              </div>
              <span className="text-xs font-bold text-[#0b1c30] hidden md:inline max-w-[120px] truncate">
                {currentUser.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#5a4138]" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#e2e8f0] p-3 z-50 animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-2">
                {/* User info card */}
                <div className="p-2.5 rounded-xl bg-[#eff4ff] flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-xs ${
                      currentUser.role === 'admin'
                        ? 'bg-[#0051d5]'
                        : currentUser.role === 'teacher'
                        ? 'bg-[#a33900]'
                        : 'bg-[#006947]'
                    }`}
                  >
                    <span>{currentUser.role === 'student' ? 'S' : currentUser.avatarInitials}</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-xs text-[#0b1c30] truncate">{currentUser.name}</span>
                    <span className="text-[10px] text-[#5a4138] truncate">{currentUser.email || currentUser.username}</span>
                    <span
                      className={`inline-block w-fit mt-0.5 px-2 py-0.2 rounded-full text-[9px] font-bold uppercase ${
                        currentUser.role === 'admin'
                          ? 'bg-[#eff4ff] text-[#0051d5]'
                          : currentUser.role === 'teacher'
                          ? 'bg-[#fff3ea] text-[#a33900]'
                          : 'bg-[#e6f4ea] text-[#006947]'
                      }`}
                    >
                      {currentUser.role}
                    </span>
                  </div>
                </div>

                {/* Quick Persona Switch */}
                {allUsers && allUsers.length > 1 && onSwitchUser && (
                  <div className="py-1 border-t border-b border-[#eff4ff]">
                    <span className="text-[10px] font-bold text-[#5a4138] uppercase px-2 mb-1 block">
                      Switch Role
                    </span>
                    <div className="flex flex-col gap-1">
                      {allUsers.map((u) => {
                        const isCurrent = u.id === currentUser.id;
                        return (
                          <button
                            key={u.id}
                            onClick={() => {
                              onSwitchUser(u.id);
                              setShowUserMenu(false);
                            }}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-left transition-colors cursor-pointer ${
                              isCurrent
                                ? 'bg-[#fff3ea] text-[#a33900]'
                                : 'text-[#0b1c30] hover:bg-[#eff4ff]'
                            }`}
                          >
                            <span className="truncate">{u.name} ({u.role})</span>
                            {isCurrent && <UserCheck className="w-3.5 h-3.5 text-[#a33900]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Menu items */}
                <button
                  onClick={() => {
                    onNavigateTo('settings');
                    setShowUserMenu(false);
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#0b1c30] hover:bg-[#eff4ff] transition-colors cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-[#5a4138]" />
                  <span>Profile & Settings</span>
                </button>

                {onLogout && (
                  <button
                    onClick={() => {
                      onLogout();
                      setShowUserMenu(false);
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#ba1a1a] hover:bg-[#fff0f0] transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-[#ba1a1a]" />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
