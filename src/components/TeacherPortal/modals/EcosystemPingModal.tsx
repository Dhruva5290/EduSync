import React, { useState } from 'react';
import {
  X,
  Radio,
  Mail,
  Calendar as CalendarIcon,
  Smartphone,
  RefreshCw,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  Clock,
} from 'lucide-react';

interface EcosystemPingModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherEmail?: string;
  teacherName?: string;
}

interface ServiceStatus {
  connected: boolean;
  lastPing: string;
  pingLatency: number;
  status: 'online' | 'syncing' | 'idle' | 'offline';
  itemsCount: number;
}

export const EcosystemPingModal: React.FC<EcosystemPingModalProps> = ({
  isOpen,
  onClose,
  teacherEmail = 'dr.jenkins@bmu.edu.in',
  teacherName = 'Dr. Robert Jenkins',
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'google-mail' | 'google-calendar' | 'apple-ios'>('overview');
  const [isPingingAll, setIsPingingAll] = useState(false);
  const [pingSuccessMessage, setPingSuccessMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Connection states
  const [services, setServices] = useState<{
    gmail: ServiceStatus;
    gcal: ServiceStatus;
    apple: ServiceStatus;
  }>({
    gmail: {
      connected: true,
      lastPing: '2 mins ago',
      pingLatency: 42,
      status: 'online',
      itemsCount: 4, // unread doubt emails
    },
    gcal: {
      connected: true,
      lastPing: '2 mins ago',
      pingLatency: 38,
      status: 'online',
      itemsCount: 3, // today's lectures synced
    },
    apple: {
      connected: true,
      lastPing: '5 mins ago',
      pingLatency: 55,
      status: 'online',
      itemsCount: 1, // active watch complication
    },
  });

  // Settings toggles
  const [syncSettings, setSyncSettings] = useState({
    autoForwardDoubtsToGmail: true,
    syncLecturesToGoogleCal: true,
    syncOfficeHoursToGoogleCal: true,
    pushAppleWatchAlerts: true,
    liveActivityDynamicIsland: true,
  });

  // Recent ping event log
  const [pingLogs, setPingLogs] = useState<Array<{ id: string; time: string; service: string; detail: string; status: 'success' | 'info' }>>([
    {
      id: 'log-1',
      time: '10:15 AM',
      service: 'Google Calendar',
      detail: 'Pushed lecture "ME-102 (Thermodynamics)" at 10:00 AM with Room 210 location',
      status: 'success',
    },
    {
      id: 'log-2',
      time: '09:48 AM',
      service: 'Google Mail',
      detail: 'Pulled 2 student doubt emails from B.Tech Section A into EduSync AI Assistant',
      status: 'success',
    },
    {
      id: 'log-3',
      time: '08:30 AM',
      service: 'Apple iOS Gateway',
      detail: 'Pushed daily timetable complication to Apple Watch & iPhone Dynamic Island',
      status: 'success',
    },
  ]);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(label);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  const handlePingAll = () => {
    setIsPingingAll(true);
    setPingSuccessMessage(null);

    // Update statuses to syncing
    setServices((prev) => ({
      gmail: { ...prev.gmail, status: 'syncing' },
      gcal: { ...prev.gcal, status: 'syncing' },
      apple: { ...prev.apple, status: 'syncing' },
    }));

    setTimeout(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      setServices({
        gmail: {
          connected: true,
          lastPing: 'Just now',
          pingLatency: Math.floor(Math.random() * 20 + 30),
          status: 'online',
          itemsCount: 4,
        },
        gcal: {
          connected: true,
          lastPing: 'Just now',
          pingLatency: Math.floor(Math.random() * 20 + 25),
          status: 'online',
          itemsCount: 3,
        },
        apple: {
          connected: true,
          lastPing: 'Just now',
          pingLatency: Math.floor(Math.random() * 30 + 40),
          status: 'online',
          itemsCount: 1,
        },
      });

      setPingLogs((prev) => [
        {
          id: `log-${Date.now()}-1`,
          time: timeStr,
          service: 'Google Workspace',
          detail: 'Gmail doubts & Calendar schedule synced with 0 conflict (Latency: 34ms)',
          status: 'success',
        },
        {
          id: `log-${Date.now()}-2`,
          time: timeStr,
          service: 'Apple APNs & iCal',
          detail: 'Sent live timetable ping to registered iPhone 15 Pro & Apple Watch Series 9',
          status: 'success',
        },
        ...prev.slice(0, 8),
      ]);

      setIsPingingAll(false);
      setPingSuccessMessage('All connected Google & iOS services pinged successfully! Timetable and basic details are 100% in sync.');

      setTimeout(() => {
        setPingSuccessMessage(null);
      }, 5000);
    }, 1200);
  };

  const handleToggleService = (serviceKey: 'gmail' | 'gcal' | 'apple') => {
    setServices((prev) => ({
      ...prev,
      [serviceKey]: {
        ...prev[serviceKey],
        connected: !prev[serviceKey].connected,
        status: !prev[serviceKey].connected ? 'online' : 'offline',
      },
    }));
  };

  const appleWebcalUrl = `webcal://edusync.bmu.edu.in/faculty/ical/feed?auth=${encodeURIComponent(teacherEmail)}&token=esy_89f1a0`;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#faf8ff] rounded-2xl max-w-3xl w-full border border-[#eaedff] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="bg-white px-6 py-5 border-b border-[#eaedff] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e2dfff] text-[#0f0069] flex items-center justify-center shadow-xs">
              <Radio className="w-5 h-5 text-[#3525cd] animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-['Sora'] font-bold text-[18px] text-[#131b2e]">
                  Ecosystem Ping & Sync Hub
                </h3>
                <span className="font-['JetBrains_Mono'] text-[11px] px-2 py-0.5 rounded-full bg-[#ecfdf5] text-[#006e4b] border border-[#a7f3d0] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#006e4b] animate-ping" />
                  3 Services Active
                </span>
              </div>
              <p className="text-[13px] text-[#777587]">
                Connect EduSync with your Google Mail, Calendar, and Apple iOS device to automatically access schedules & basic details.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#777587] hover:text-[#131b2e] hover:bg-[#f2f3ff] cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert Banner */}
        {pingSuccessMessage && (
          <div className="px-6 py-3 bg-[#ecfdf5] border-b border-[#a7f3d0] flex items-center justify-between text-[13px] text-[#065f46] font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#006e4b] shrink-0" />
              <span>{pingSuccessMessage}</span>
            </div>
            <button
              onClick={() => setPingSuccessMessage(null)}
              className="text-[#065f46] hover:text-[#044e38] text-[12px] underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Quick Ping All Action Banner */}
        <div className="bg-gradient-to-r from-[#3525cd] to-[#5143eb] px-6 py-3.5 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-[#facc15] shrink-0" />
            <div className="text-[13px]">
              <span className="font-bold">Instant Two-Way Ping:</span> Dispatches your latest lecture schedules, student doubts, and office hour slots across your devices.
            </div>
          </div>
          <button
            onClick={handlePingAll}
            disabled={isPingingAll}
            className="px-4 py-2 rounded-xl bg-white text-[#3525cd] hover:bg-[#f2f3ff] text-[13px] font-bold shadow-md cursor-pointer flex items-center gap-2 shrink-0 transition-all active:scale-95 disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${isPingingAll ? 'animate-spin' : ''}`} />
            <span>{isPingingAll ? 'Pinging All Devices...' : 'Ping All Now'}</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border-b border-[#eaedff] px-6 flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3.5 text-[13px] font-semibold border-b-2 cursor-pointer transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-[#3525cd] text-[#3525cd]'
                : 'border-transparent text-[#777587] hover:text-[#131b2e]'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Overview & Status</span>
          </button>
          <button
            onClick={() => setActiveTab('google-mail')}
            className={`py-3 px-3.5 text-[13px] font-semibold border-b-2 cursor-pointer transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'google-mail'
                ? 'border-[#3525cd] text-[#3525cd]'
                : 'border-transparent text-[#777587] hover:text-[#131b2e]'
            }`}
          >
            <Mail className="w-4 h-4 text-[#ea4335]" />
            <span>Google Mail</span>
            {services.gmail.connected && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#fef2f2] text-[#991b1b] font-bold">
                {services.gmail.itemsCount} Unread
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('google-calendar')}
            className={`py-3 px-3.5 text-[13px] font-semibold border-b-2 cursor-pointer transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'google-calendar'
                ? 'border-[#3525cd] text-[#3525cd]'
                : 'border-transparent text-[#777587] hover:text-[#131b2e]'
            }`}
          >
            <CalendarIcon className="w-4 h-4 text-[#4285f4]" />
            <span>Google Calendar</span>
            {services.gcal.connected && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#eff6ff] text-[#1e40af] font-bold">
                {services.gcal.itemsCount} Synced
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('apple-ios')}
            className={`py-3 px-3.5 text-[13px] font-semibold border-b-2 cursor-pointer transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'apple-ios'
                ? 'border-[#3525cd] text-[#3525cd]'
                : 'border-transparent text-[#777587] hover:text-[#131b2e]'
            }`}
          >
            <Smartphone className="w-4 h-4 text-[#131b2e]" />
            <span>Apple iOS & Watch</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 3 Integration Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Gmail Card */}
                <div className="bg-white rounded-xl p-4.5 border border-[#eaedff] shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-lg bg-[#fef2f2] text-[#ea4335] flex items-center justify-center font-bold">
                        <Mail className="w-5 h-5" />
                      </div>
                      <span className={`text-[11px] font-['JetBrains_Mono'] px-2 py-0.5 rounded-full font-bold ${
                        services.gmail.connected ? 'bg-[#ecfdf5] text-[#006e4b]' : 'bg-[#f4f3fa] text-[#777587]'
                      }`}>
                        {services.gmail.status === 'syncing' ? 'Syncing...' : services.gmail.connected ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                    <h4 className="font-['Sora'] font-bold text-[15px] text-[#131b2e]">Google Mail</h4>
                    <p className="text-[12px] text-[#777587] mt-0.5">
                      Syncs student doubt emails & auto-draft replies.
                    </p>
                    <div className="mt-3 pt-3 border-t border-[#f2f3ff] space-y-1.5 text-[12px]">
                      <div className="flex justify-between text-[#464555]">
                        <span>Account:</span>
                        <span className="font-['JetBrains_Mono'] text-[#131b2e] truncate max-w-[130px]" title={teacherEmail}>{teacherEmail}</span>
                      </div>
                      <div className="flex justify-between text-[#464555]">
                        <span>Pending Doubts:</span>
                        <span className="font-bold text-[#3525cd]">{services.gmail.itemsCount} Threads</span>
                      </div>
                      <div className="flex justify-between text-[#464555]">
                        <span>Last Ping:</span>
                        <span className="font-['JetBrains_Mono'] text-[#777587]">{services.gmail.lastPing}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 flex gap-2">
                    <button
                      onClick={() => setActiveTab('google-mail')}
                      className="flex-1 py-1.5 rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] text-[#3525cd] text-[12px] font-semibold cursor-pointer text-center"
                    >
                      Manage
                    </button>
                    <button
                      onClick={() => handleToggleService('gmail')}
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold cursor-pointer ${
                        services.gmail.connected ? 'text-[#ba1a1a] hover:bg-[#ffe4e6]' : 'bg-[#3525cd] text-white'
                      }`}
                    >
                      {services.gmail.connected ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>
                </div>

                {/* Google Calendar Card */}
                <div className="bg-white rounded-xl p-4.5 border border-[#eaedff] shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-lg bg-[#eff6ff] text-[#4285f4] flex items-center justify-center font-bold">
                        <CalendarIcon className="w-5 h-5" />
                      </div>
                      <span className={`text-[11px] font-['JetBrains_Mono'] px-2 py-0.5 rounded-full font-bold ${
                        services.gcal.connected ? 'bg-[#ecfdf5] text-[#006e4b]' : 'bg-[#f4f3fa] text-[#777587]'
                      }`}>
                        {services.gcal.status === 'syncing' ? 'Syncing...' : services.gcal.connected ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                    <h4 className="font-['Sora'] font-bold text-[15px] text-[#131b2e]">Google Calendar</h4>
                    <p className="text-[12px] text-[#777587] mt-0.5">
                      Two-way timetable & office hours synchronization.
                    </p>
                    <div className="mt-3 pt-3 border-t border-[#f2f3ff] space-y-1.5 text-[12px]">
                      <div className="flex justify-between text-[#464555]">
                        <span>Calendar ID:</span>
                        <span className="font-['JetBrains_Mono'] text-[#131b2e] truncate max-w-[130px]">Primary ({teacherName.split(' ')[1] || 'Jenkins'})</span>
                      </div>
                      <div className="flex justify-between text-[#464555]">
                        <span>Today&apos;s Lectures:</span>
                        <span className="font-bold text-[#006e4b]">{services.gcal.itemsCount} Events Synced</span>
                      </div>
                      <div className="flex justify-between text-[#464555]">
                        <span>Last Ping:</span>
                        <span className="font-['JetBrains_Mono'] text-[#777587]">{services.gcal.lastPing}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 flex gap-2">
                    <button
                      onClick={() => setActiveTab('google-calendar')}
                      className="flex-1 py-1.5 rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] text-[#3525cd] text-[12px] font-semibold cursor-pointer text-center"
                    >
                      Manage
                    </button>
                    <button
                      onClick={() => handleToggleService('gcal')}
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold cursor-pointer ${
                        services.gcal.connected ? 'text-[#ba1a1a] hover:bg-[#ffe4e6]' : 'bg-[#3525cd] text-white'
                      }`}
                    >
                      {services.gcal.connected ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>
                </div>

                {/* Apple iOS Card */}
                <div className="bg-white rounded-xl p-4.5 border border-[#eaedff] shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-lg bg-[#f4f3fa] text-[#131b2e] flex items-center justify-center font-bold">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <span className={`text-[11px] font-['JetBrains_Mono'] px-2 py-0.5 rounded-full font-bold ${
                        services.apple.connected ? 'bg-[#ecfdf5] text-[#006e4b]' : 'bg-[#f4f3fa] text-[#777587]'
                      }`}>
                        {services.apple.status === 'syncing' ? 'Syncing...' : services.apple.connected ? 'Active' : 'Offline'}
                      </span>
                    </div>
                    <h4 className="font-['Sora'] font-bold text-[15px] text-[#131b2e]">Apple iOS & Watch</h4>
                    <p className="text-[12px] text-[#777587] mt-0.5">
                      Native WebCal feed & Apple Watch live widgets.
                    </p>
                    <div className="mt-3 pt-3 border-t border-[#f2f3ff] space-y-1.5 text-[12px]">
                      <div className="flex justify-between text-[#464555]">
                        <span>Device:</span>
                        <span className="font-['JetBrains_Mono'] text-[#131b2e]">iPhone 15 Pro</span>
                      </div>
                      <div className="flex justify-between text-[#464555]">
                        <span>Complication:</span>
                        <span className="font-bold text-[#3525cd]">Active on Watch</span>
                      </div>
                      <div className="flex justify-between text-[#464555]">
                        <span>Last Ping:</span>
                        <span className="font-['JetBrains_Mono'] text-[#777587]">{services.apple.lastPing}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 flex gap-2">
                    <button
                      onClick={() => setActiveTab('apple-ios')}
                      className="flex-1 py-1.5 rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] text-[#3525cd] text-[12px] font-semibold cursor-pointer text-center"
                    >
                      Configure
                    </button>
                    <button
                      onClick={() => handleToggleService('apple')}
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold cursor-pointer ${
                        services.apple.connected ? 'text-[#ba1a1a] hover:bg-[#ffe4e6]' : 'bg-[#3525cd] text-white'
                      }`}
                    >
                      {services.apple.connected ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Ping Activity & Audit Log */}
              <div className="bg-white rounded-xl p-5 border border-[#eaedff] shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#3525cd]" />
                    <h4 className="font-['Sora'] font-bold text-[15px] text-[#131b2e]">
                      Recent Ecosystem Ping & Sync Log
                    </h4>
                  </div>
                  <span className="font-['JetBrains_Mono'] text-[11px] text-[#777587]">
                    Auto-refreshes on every schedule change
                  </span>
                </div>

                <div className="divide-y divide-[#f2f3ff]">
                  {pingLogs.map((log) => (
                    <div key={log.id} className="py-2.5 flex items-start justify-between gap-3 text-[13px]">
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#006e4b] mt-0.5 shrink-0" />
                        <div>
                          <div className="font-semibold text-[#131b2e] flex items-center gap-2">
                            <span>{log.service}</span>
                            <span className="font-['JetBrains_Mono'] text-[11px] text-[#777587] font-normal">
                              {log.time}
                            </span>
                          </div>
                          <p className="text-[12px] text-[#464555] mt-0.5">{log.detail}</p>
                        </div>
                      </div>
                      <span className="font-['JetBrains_Mono'] text-[11px] px-2 py-0.5 rounded bg-[#ecfdf5] text-[#006e4b] shrink-0">
                        200 OK
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GOOGLE MAIL */}
          {activeTab === 'google-mail' && (
            <div className="space-y-5">
              <div className="bg-white rounded-xl p-5 border border-[#eaedff] shadow-xs">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#fef2f2] text-[#ea4335] flex items-center justify-center font-bold">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-['Sora'] font-bold text-[16px] text-[#131b2e]">
                      Google Mail (Gmail) Connection
                    </h4>
                    <p className="text-[13px] text-[#777587]">
                      Linked to your official faculty institutional mailbox: <span className="font-['JetBrains_Mono'] font-bold text-[#131b2e]">{teacherEmail}</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-3 bg-[#faf8ff] p-4 rounded-xl border border-[#eaedff]">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <div className="font-semibold text-[13px] text-[#131b2e]">
                        Auto-Forward Student Doubts to Gmail
                      </div>
                      <div className="text-[12px] text-[#777587]">
                        Instantly receive an alert when a student flags an urgent doubt in EduSync.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={syncSettings.autoForwardDoubtsToGmail}
                      onChange={(e) => setSyncSettings((prev) => ({ ...prev, autoForwardDoubtsToGmail: e.target.checked }))}
                      className="w-4 h-4 text-[#3525cd] rounded accent-[#3525cd]"
                    />
                  </label>

                  <div className="border-t border-[#eaedff] pt-3">
                    <div className="font-semibold text-[13px] text-[#131b2e] mb-2">
                      Recent Doubts Pending in Gmail Inbox:
                    </div>
                    <div className="space-y-2">
                      <div className="p-3 bg-white rounded-lg border border-[#eaedff] flex items-center justify-between text-[12px]">
                        <div>
                          <span className="font-bold text-[#131b2e]">Aarav Sharma (ME-102):</span> &quot;Sir, regarding question 3 on Carnot cycle efficiency...&quot;
                        </div>
                        <span className="font-['JetBrains_Mono'] text-[11px] text-[#ea4335] font-semibold">12m ago</span>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-[#eaedff] flex items-center justify-between text-[12px]">
                        <div>
                          <span className="font-bold text-[#131b2e]">Diya Nambiar (CS-202):</span> &quot;Clarification needed on Bellman-Ford negative cycle proof&quot;
                        </div>
                        <span className="font-['JetBrains_Mono'] text-[11px] text-[#ea4335] font-semibold">45m ago</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[12px] text-[#777587]">
                    OAuth 2.0 Token valid for next 6 months • Google Workspace for Education
                  </span>
                  <button
                    onClick={handlePingAll}
                    disabled={isPingingAll}
                    className="px-4 py-2 rounded-lg bg-[#3525cd] hover:bg-[#3323cc] text-white text-[13px] font-semibold flex items-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isPingingAll ? 'animate-spin' : ''}`} />
                    <span>Ping Gmail Now</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GOOGLE CALENDAR */}
          {activeTab === 'google-calendar' && (
            <div className="space-y-5">
              <div className="bg-white rounded-xl p-5 border border-[#eaedff] shadow-xs">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#eff6ff] text-[#4285f4] flex items-center justify-center font-bold">
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-['Sora'] font-bold text-[16px] text-[#131b2e]">
                      Google Calendar Two-Way Synchronization
                    </h4>
                    <p className="text-[13px] text-[#777587]">
                      Sync all your classes, laboratory sessions, and 1-on-1 student counseling appointments.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 bg-[#faf8ff] p-4 rounded-xl border border-[#eaedff]">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <div className="font-semibold text-[13px] text-[#131b2e]">
                        Sync Daily Lecture Schedule
                      </div>
                      <div className="text-[12px] text-[#777587]">
                        Export ME-102, CS-202, and ES-101 slots directly into your primary Google Calendar.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={syncSettings.syncLecturesToGoogleCal}
                      onChange={(e) => setSyncSettings((prev) => ({ ...prev, syncLecturesToGoogleCal: e.target.checked }))}
                      className="w-4 h-4 text-[#3525cd] rounded accent-[#3525cd]"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer border-t border-[#eaedff] pt-3">
                    <div>
                      <div className="font-semibold text-[13px] text-[#131b2e]">
                        Sync 1-on-1 Student Office Hours
                      </div>
                      <div className="text-[12px] text-[#777587]">
                        Automatically generate Google Meet video links and invite students to Cabin 304 sessions.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={syncSettings.syncOfficeHoursToGoogleCal}
                      onChange={(e) => setSyncSettings((prev) => ({ ...prev, syncOfficeHoursToGoogleCal: e.target.checked }))}
                      className="w-4 h-4 text-[#3525cd] rounded accent-[#3525cd]"
                    />
                  </label>
                </div>

                <div className="mt-4 pt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[12px] text-[#006e4b] font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Next Event: ME-102 @ 10:00 AM (Room 210) synced</span>
                  </div>
                  <button
                    onClick={handlePingAll}
                    disabled={isPingingAll}
                    className="px-4 py-2 rounded-lg bg-[#3525cd] hover:bg-[#3323cc] text-white text-[13px] font-semibold flex items-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isPingingAll ? 'animate-spin' : ''}`} />
                    <span>Ping Google Calendar Now</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: APPLE IOS & WATCH */}
          {activeTab === 'apple-ios' && (
            <div className="space-y-5">
              <div className="bg-white rounded-xl p-5 border border-[#eaedff] shadow-xs">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#f4f3fa] text-[#131b2e] flex items-center justify-center font-bold">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-['Sora'] font-bold text-[16px] text-[#131b2e]">
                      Apple iOS System & Apple Watch Connection
                    </h4>
                    <p className="text-[13px] text-[#777587]">
                      Subscribe directly to the encrypted EduSync iCalendar feed on your iPhone, iPad, Mac, or Apple Watch.
                    </p>
                  </div>
                </div>

                {/* Webcal Feed Subscription Box */}
                <div className="p-4 bg-[#f2f3ff] rounded-xl border border-[#dae2fd] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-bold text-[#0f0069] font-['JetBrains_Mono'] uppercase tracking-wider">
                      Your Private Apple iCal / Webcal Subscription URL:
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-[#dae2fd] text-[#3525cd] font-semibold">
                      Auto-updates every 15m
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      type="text"
                      value={appleWebcalUrl}
                      className="flex-1 bg-white px-3 py-2 rounded-lg border border-[#eaedff] text-[12px] font-['JetBrains_Mono'] text-[#131b2e] select-all"
                    />
                    <button
                      onClick={() => handleCopy(appleWebcalUrl, 'apple-url')}
                      className="px-3.5 py-2 rounded-lg bg-[#3525cd] text-white text-[12px] font-semibold hover:bg-[#3323cc] cursor-pointer flex items-center gap-1.5 shrink-0"
                    >
                      {copiedLink === 'apple-url' ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Feed URL</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-[#464555]">
                    On your iPhone/Mac: Go to Calendar &gt; File &gt; New Calendar Subscription &gt; paste this URL.
                  </p>
                </div>

                {/* iOS Features */}
                <div className="space-y-3 bg-[#faf8ff] p-4 rounded-xl border border-[#eaedff] mt-4">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <div className="font-semibold text-[13px] text-[#131b2e]">
                        Apple Watch Schedule Complication
                      </div>
                      <div className="text-[12px] text-[#777587]">
                        Displays current lecture room and attendance count right on your wrist.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={syncSettings.pushAppleWatchAlerts}
                      onChange={(e) => setSyncSettings((prev) => ({ ...prev, pushAppleWatchAlerts: e.target.checked }))}
                      className="w-4 h-4 text-[#3525cd] rounded accent-[#3525cd]"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer border-t border-[#eaedff] pt-3">
                    <div>
                      <div className="font-semibold text-[13px] text-[#131b2e]">
                        iPhone Dynamic Island & Lock Screen Live Activity
                      </div>
                      <div className="text-[12px] text-[#777587]">
                        Shows &quot;Class in Progress: ME-102 (Hall 301)&quot; with remaining lecture countdown timer.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={syncSettings.liveActivityDynamicIsland}
                      onChange={(e) => setSyncSettings((prev) => ({ ...prev, liveActivityDynamicIsland: e.target.checked }))}
                      className="w-4 h-4 text-[#3525cd] rounded accent-[#3525cd]"
                    />
                  </label>
                </div>

                <div className="mt-4 pt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[12px] text-[#006e4b] font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Apple APNs Push Gateway Verified (Latency: 55ms)</span>
                  </div>
                  <button
                    onClick={handlePingAll}
                    disabled={isPingingAll}
                    className="px-4 py-2 rounded-lg bg-[#131b2e] hover:bg-black text-white text-[13px] font-semibold flex items-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isPingingAll ? 'animate-spin' : ''}`} />
                    <span>Ping Apple iOS Now</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="bg-white px-6 py-4 border-t border-[#eaedff] flex items-center justify-between">
          <div className="flex items-center gap-2 text-[12px] text-[#777587]">
            <ShieldCheck className="w-4 h-4 text-[#006e4b]" />
            <span>End-to-End Encrypted OAuth2 & TLS 1.3 sync protocol</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] font-semibold text-[13px] cursor-pointer transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
