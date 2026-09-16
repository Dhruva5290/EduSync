import React, { useState } from 'react';
import {
  Calendar,
  TrendingUp,
  UploadCloud,
  Briefcase,
  Layers,
  Sparkles
} from 'lucide-react';
import { TodaysScheduleView } from './TodaysScheduleView';
import { PerformanceAnalyticsView } from './PerformanceAnalyticsView';
import { MaterialsAndCalendarView } from './MaterialsAndCalendarView';
import { PersonalWorkspaceView } from './PersonalWorkspaceView';
import { AgenticAssistantPanel } from './AgenticAssistantPanel';

type CommandCenterSubTab = 'schedule' | 'performance' | 'materials' | 'workspace';

export const CommandCenterRoot: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<CommandCenterSubTab>('schedule');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleActionExecuted = (actionType: string) => {
    // Increment refreshKey to trigger re-renders of child views when an action modifies data
    setRefreshKey(prev => prev + 1);
  };

  const navTabs: Array<{ id: CommandCenterSubTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'schedule', label: "Today's Schedule & Attendance", icon: Calendar },
    { id: 'performance', label: 'Performance & Doubt Patterns', icon: TrendingUp },
    { id: 'materials', label: 'Materials, Tracking & Calendar', icon: UploadCloud },
    { id: 'workspace', label: 'Personal Desk & Leaves', icon: Briefcase }
  ];

  return (
    <div key={refreshKey} className="space-y-6 relative min-h-[calc(100vh-180px)] pb-16 font-sans">
      {/* Command Center Sub-Navigation Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2 rounded-2xl bg-[#181D24] border border-[#26303B]">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none w-full sm:w-auto">
          {navTabs.map(tab => {
            const Icon = tab.icon;
            const isSelected = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer font-['Sora'] shrink-0 ${
                  isSelected
                    ? 'bg-[#12161A] text-[#6EA8A0] border border-[#6EA8A0]/40 shadow-sm'
                    : 'text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#1E252D] border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#6EA8A0]' : 'text-[#94A3B8]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-2 px-3 text-[11px] font-mono text-[#94A3B8]">
          <span className="w-2 h-2 rounded-full bg-[#6EA8A0]" />
          <span>Faculty Command Hub</span>
        </div>
      </div>

      {/* Dynamic Sub-View Rendering */}
      <div>
        {activeSubTab === 'schedule' && <TodaysScheduleView />}
        {activeSubTab === 'performance' && <PerformanceAnalyticsView />}
        {activeSubTab === 'materials' && <MaterialsAndCalendarView />}
        {activeSubTab === 'workspace' && <PersonalWorkspaceView />}
      </div>

      {/* 5. Persistent Collapsible Agentic Assistant Panel (Bottom-Right) */}
      <AgenticAssistantPanel onActionExecuted={handleActionExecuted} />
    </div>
  );
};
