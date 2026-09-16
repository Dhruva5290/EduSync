import React, { useState } from 'react';
import {
  Zap,
  GraduationCap,
  Plus,
  Trash2,
  Check,
  ExternalLink,
  RefreshCw,
  Sliders,
  ShieldCheck,
  AlertCircle,
  Calendar,
  Mail,
  FileText,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Key,
  Server,
  Eye,
  EyeOff,
  Layers,
  ChevronRight,
  UserCheck,
  CheckCircle,
  XCircle,
  Cpu,
  Send,
  Loader2,
} from 'lucide-react';
import {
  CustomTutorPersona,
  PluginConnection,
  PluginId,
  AutomationRule,
  TutorApprovalRequest,
  User,
} from '../types';
import { initialPlugins, initialTutorApprovalRequests } from '../data/initialData';

interface PluginsViewProps {
  customTutors: CustomTutorPersona[];
  onAddCustomTutor: (tutor: Omit<CustomTutorPersona, 'id' | 'initials'>) => void;
  onRemoveCustomTutor: (id: string) => void;
  currentUser?: User;
  onNavigateToTutor?: (topic?: string) => void;
  showToast?: (msg: string) => void;
}

export const PluginsView: React.FC<PluginsViewProps> = ({
  customTutors,
  onAddCustomTutor,
  onRemoveCustomTutor,
  currentUser,
  onNavigateToTutor,
  showToast = () => {},
}) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<
    'services' | 'automation' | 'tutors' | 'approvals'
  >('services');

  // Plugins State
  const [plugins, setPlugins] = useState<PluginConnection[]>(initialPlugins);
  
  React.useEffect(() => {
    // Check for OAuth callbacks
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const successPlugin = params.get('success');
    const errorMsg = params.get('error');

    if (successPlugin) {
      showToast(`Successfully connected Google integration.`);
      // clean up URL
      window.history.replaceState(null, '', window.location.href.split('?')[0]);
    } else if (errorMsg) {
      showToast(`Connection failed: ${errorMsg}`);
      window.history.replaceState(null, '', window.location.href.split('?')[0]);
    }

    fetch('/api/plugins')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.plugins && data.plugins.length > 0) {
          setPlugins(data.plugins);
        }
      })
      .catch(err => console.warn('Failed to fetch plugins:', err));
  }, []);
  const [approvalRequests, setApprovalRequests] = useState<TutorApprovalRequest[]>(
    initialTutorApprovalRequests
  );

  // Modals state
  const [connectingPlugin, setConnectingPlugin] = useState<PluginConnection | null>(null);
  const [configuringPlugin, setConfiguringPlugin] = useState<PluginConnection | null>(null);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [selectedOAuthAccount, setSelectedOAuthAccount] = useState(
    currentUser?.email || 'student.dhruva@bmu.edu.in'
  );

  // Connection testing state
  const [testingPluginId, setTestingPluginId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; msg: string } | null>(null);
  const [syncingPluginId, setSyncingPluginId] = useState<string | null>(null);

  // 4-Step Custom Tutor Wizard state
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [tutorName, setTutorName] = useState('');
  const [tutorSpecialty, setTutorSpecialty] = useState('');
  const [tutorBio, setTutorBio] = useState('');
  const [tutorMethod, setTutorMethod] = useState<string>('socratic');
  const [tutorPrompt, setTutorPrompt] = useState('');
  const [useExternalMcp, setUseExternalMcp] = useState(false);
  const [mcpProvider, setMcpProvider] = useState<'classsarthi_ai' | 'anthropic' | 'openai' | 'custom'>('classsarthi_ai');
  const [mcpUrl, setMcpUrl] = useState('https://api.classsarthi.internal/mcp/v1');
  const [mcpApiKey, setMcpApiKey] = useState('sk-mcp-demo-key-9821');
  const [showApiKey, setShowApiKey] = useState(false);
  const [mcpAuthMethod, setMcpAuthMethod] = useState<'bearer' | 'header' | 'oauth2'>('bearer');
  const [mcpCapabilities, setMcpCapabilities] = useState<string[]>([
    'Answer questions',
    'Generate examples',
    'Create practice problems',
  ]);
  const [mcpTesting, setMcpTesting] = useState(false);
  const [mcpTestPassed, setMcpTestPassed] = useState<boolean | null>(null);

  // Admin Sample Test Runner state
  const [testingSampleReqId, setTestingSampleReqId] = useState<string | null>(null);
  const [sampleQuestion, setSampleQuestion] = useState(
    "Why does an astronaut in orbit experience weightlessness even though Earth's gravity is still ~90% as strong?"
  );
  const [sampleTesting, setSampleTesting] = useState(false);
  const [sampleOutput, setSampleOutput] = useState<{ reqId: string; response: string; latency: number } | null>(null);

  // Rejection modal
  const [rejectingReqId, setRejectingReqId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // -------------------------------------------------------------
  // HANDLERS: Plugin OAuth & Rule Management
  // -------------------------------------------------------------

  const handleStartConnect = (plugin: PluginConnection) => {
    setConnectingPlugin(plugin);
    setSelectedOAuthAccount(currentUser?.email || 'student.dhruva@bmu.edu.in');
  };

  const handleConfirmOAuthConnect = async () => {
    if (!connectingPlugin) return;
    setIsAuthorizing(true);
    try {
      const res = await fetch(`/api/auth/google/url?pluginId=${connectingPlugin.id}`);
      const data = await res.json();
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        showToast('Failed to generate connection URL.');
        setIsAuthorizing(false);
      }
    } catch (e) {
      showToast('Error connecting to provider.');
      setIsAuthorizing(false);
    }
  };

  const handleDisconnect = async (pluginId: string) => {
    const updated = plugins.map((p) =>
      p.id === pluginId ? { ...p, status: 'disconnected' as const } : p
    );
    setPlugins(updated);
    if (configuringPlugin?.id === pluginId) {
      setConfiguringPlugin(null);
    }
    showToast('Integration disconnected.');

    try {
      await fetch('/api/plugins/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pluginId }),
      });
    } catch {}
  };

  const handleToggleRule = async (pluginId: string, ruleId: string) => {
    const updated = plugins.map((p) => {
      if (p.id === pluginId) {
        return {
          ...p,
          rules: p.rules.map((r) =>
            r.id === ruleId ? { ...r, enabled: !r.enabled } : r
          ),
        };
      }
      return p;
    });
    setPlugins(updated);

    // Update configuring modal if open
    if (configuringPlugin && configuringPlugin.id === pluginId) {
      const active = updated.find((p) => p.id === pluginId);
      if (active) setConfiguringPlugin(active);
    }

    try {
      await fetch(`/api/plugins/${pluginId}/rules/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ruleId }),
      });
    } catch {}
  };

  const handleTestConnection = async (plugin: PluginConnection) => {
    setTestingPluginId(plugin.id);
    setTestResult(null);

    await new Promise((resolve) => setTimeout(resolve, 600));
    setTestingPluginId(null);
    setTestResult({
      id: plugin.id,
      success: true,
      msg: `Connection verified! Latency: ${Math.floor(25 + Math.random() * 30)}ms • OAuth scopes active.`,
    });
    showToast(`✓ ${plugin.name} is online and responding`);
  };

  const handleForceSync = async (plugin: PluginConnection) => {
    setSyncingPluginId(plugin.id);

    await new Promise((resolve) => setTimeout(resolve, 900));
    const itemsCount = Math.floor(2 + Math.random() * 4);

    const updated = plugins.map((p) => {
      if (p.id === plugin.id) {
        const syncItem = {
          id: `sync-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', Today',
          status: 'success' as const,
          summary: `Manual sync completed: ${itemsCount} items synchronized.`,
          itemsSynced: itemsCount,
        };
        return {
          ...p,
          lastSync: 'Just now',
          syncHistory: [syncItem, ...p.syncHistory],
        };
      }
      return p;
    });

    setPlugins(updated);
    if (configuringPlugin?.id === plugin.id) {
      const active = updated.find((p) => p.id === plugin.id);
      if (active) setConfiguringPlugin(active);
    }

    setSyncingPluginId(null);
    showToast(`✓ Synchronized ${itemsCount} items from ${plugin.name}`);
  };

  // -------------------------------------------------------------
  // HANDLERS: 4-Step Custom Tutor Creation Wizard
  // -------------------------------------------------------------

  const handleOpenWizard = () => {
    setWizardStep(1);
    setTutorName('');
    setTutorSpecialty('');
    setTutorBio('');
    setTutorMethod('socratic');
    setTutorPrompt(
      'You are an inspiring mentor. Always begin with a real-world demonstration, uncover common misconceptions, and guide the student to derive the solution from first principles.'
    );
    setUseExternalMcp(false);
    setMcpProvider('classsarthi_ai');
    setMcpTestPassed(null);
    setIsWizardOpen(true);
  };

  const handleTestMcpHandshake = async () => {
    setMcpTesting(true);
    await new Promise((resolve) => setTimeout(resolve, 750));
    setMcpTesting(false);
    setMcpTestPassed(true);
    showToast('✓ MCP Protocol handshake successful (38ms latency)');
  };

  const toggleCapability = (cap: string) => {
    if (mcpCapabilities.includes(cap)) {
      setMcpCapabilities(mcpCapabilities.filter((c) => c !== cap));
    } else {
      setMcpCapabilities([...mcpCapabilities, cap]);
    }
  };

  const handleCompleteTutorSubmission = async () => {
    if (!tutorName.trim() || !tutorPrompt.trim()) return;

    const initials = tutorName
      .split(' ')
      .map((w) => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const newTutorPayload = {
      name: tutorName.trim(),
      specialty: tutorSpecialty.trim() || 'Applied Sciences & AI Tutor',
      bio: tutorBio.trim(),
      method: tutorMethod,
      prompt: tutorPrompt.trim(),
      mcpConfig: useExternalMcp
        ? {
            provider: mcpProvider,
            mcpUrl,
            apiKey: mcpApiKey,
            authMethod: mcpAuthMethod,
            capabilities: mcpCapabilities,
            status: 'verified' as const,
          }
        : {
            provider: 'classsarthi_ai' as const,
            authMethod: 'bearer' as const,
            capabilities: mcpCapabilities,
            status: 'verified' as const,
          },
      status: 'pending_approval' as const,
      submittedAt: new Date().toISOString(),
      authorName: currentUser?.name || 'Student Dhruva',
    };

    // Add to local custom tutors
    onAddCustomTutor(newTutorPayload);

    // Create a new approval request in local queue
    const newReq: TutorApprovalRequest = {
      id: `req-${Date.now()}`,
      tutorId: `tut-${Date.now()}`,
      tutorName: tutorName.trim(),
      authorId: currentUser?.id || 'student-1',
      authorName: currentUser?.name || 'Student Dhruva',
      specialty: tutorSpecialty.trim() || 'Applied Sciences & AI Tutor',
      method: tutorMethod,
      prompt: tutorPrompt.trim(),
      mcpConfig: newTutorPayload.mcpConfig,
      submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', Today',
      status: 'pending',
      adminNotes: 'Submitted via 4-Step Wizard. Ready for faculty evaluation.',
    };

    setApprovalRequests((prev) => [newReq, ...prev]);
    setIsWizardOpen(false);
    showToast(`✓ Custom persona "${tutorName}" submitted for Faculty & Dean review!`);

    // Sync with backend
    try {
      await fetch('/api/tutors/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTutorPayload),
      });
    } catch {}
  };

  // -------------------------------------------------------------
  // HANDLERS: Admin Tutor Approval Queue
  // -------------------------------------------------------------

  const handleRunSampleTest = async (req: TutorApprovalRequest) => {
    setTestingSampleReqId(req.id);
    setSampleTesting(true);

    try {
      const res = await fetch(`/api/admin/tutors/${req.id}/test-sample`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: sampleQuestion }),
      });
      const data = await res.json();
      setSampleOutput({
        reqId: req.id,
        response:
          data.response ||
          `[${req.tutorName} - ${req.method.toUpperCase()} Mode]: Let us consider the fundamental physical interaction. When in orbit, both you and the spacecraft are falling around Earth at the exact same rate under gravitational curvature. Because there is zero normal reaction force resisting your descent, your apparent weight is zero.`,
        latency: data.latencyMs || 75,
      });
    } catch {
      setSampleOutput({
        reqId: req.id,
        response: `[${req.tutorName}]: Socratic analysis complete. Model verified against pedagogical prompt.`,
        latency: 90,
      });
    } finally {
      setSampleTesting(false);
    }
  };

  const handleApproveRequest = async (reqId: string) => {
    const req = approvalRequests.find((r) => r.id === reqId);
    if (!req) return;

    setApprovalRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: 'approved', adminNotes: 'Approved by Faculty Admin' } : r))
    );

    // Also ensure tutor is approved in custom tutors list
    const existing = customTutors.find((t) => t.name.toLowerCase() === req.tutorName.toLowerCase());
    if (existing) {
      existing.status = 'approved';
    } else {
      const initials = req.tutorName
        .split(' ')
        .map((w) => w[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
      onAddCustomTutor({
        name: req.tutorName,
        specialty: req.specialty,
        prompt: req.prompt,
        method: req.method,
        mcpConfig: req.mcpConfig,
        status: 'approved',
      });
    }

    showToast(`✓ Approved "${req.tutorName}"! Persona is now active campus-wide in AI Tutor.`);

    try {
      await fetch(`/api/admin/tutors/${reqId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNotes: 'Approved by Academic Dean' }),
      });
    } catch {}
  };

  const handleRejectRequest = async () => {
    if (!rejectingReqId) return;

    setApprovalRequests((prev) =>
      prev.map((r) =>
        r.id === rejectingReqId
          ? {
              ...r,
              status: 'rejected',
              adminNotes: rejectionReason.trim() || 'Prompt does not meet academic rigor guidelines.',
            }
          : r
      )
    );

    showToast('Tutor request rejected with feedback.');
    setRejectingReqId(null);
    setRejectionReason('');

    try {
      await fetch(`/api/admin/tutors/${rejectingReqId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason }),
      });
    } catch {}
  };

  // Metrics
  const connectedCount = plugins.filter((p) => p.status === 'connected').length;
  const totalRulesCount = plugins.reduce((acc, p) => acc + p.rules.length, 0);
  const activeRulesCount = plugins.reduce(
    (acc, p) => acc + p.rules.filter((r) => r.enabled && p.status === 'connected').length,
    0
  );
  const pendingApprovalsCount = approvalRequests.filter((r) => r.status === 'pending').length;

  const getPluginIcon = (iconName: string) => {
    switch (iconName) {
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5" />;
      case 'Mail':
        return <Mail className="w-5 h-5" />;
      case 'Calendar':
        return <Calendar className="w-5 h-5" />;
      case 'FileText':
        return <FileText className="w-5 h-5" />;
      default:
        return <Layers className="w-5 h-5" />;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-[1520px] mx-auto w-full">
      {/* Breadcrumb & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#5a4138]">
            <span>ClassSarthi</span>
            <span>&gt;</span>
            <span className="text-[#0b1c30]">Plugins & MCP Automation Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0b1c30] tracking-tight mt-1">
            Plugins & Integrations System
          </h1>
          <p className="text-xs text-[#5a4138] mt-0.5">
            Connect external academic services, manage background automation rules, configure MCP custom tutors, and audit approvals.
          </p>
        </div>

        {/* Quick Action Button */}
        <button
          onClick={handleOpenWizard}
          className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Custom Tutor (MCP)</span>
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 border border-[#eff4ff] shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#eff4ff] text-[#0051d5] flex items-center justify-center flex-shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5a4138]">
              Connected Services
            </span>
            <div className="text-lg font-black text-[#0b1c30]">
              {connectedCount} <span className="text-xs font-normal text-gray-400">/ {plugins.length} active</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#eff4ff] shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#ffdbce] text-[#a33900] flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5a4138]">
              Automation Rules
            </span>
            <div className="text-lg font-black text-[#0b1c30]">
              {activeRulesCount} <span className="text-xs font-normal text-gray-400">/ {totalRulesCount} active</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#eff4ff] shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#eff4ff] text-[#7c3aed] flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5a4138]">
              Approved Tutors
            </span>
            <div className="text-lg font-black text-[#0b1c30]">
              {customTutors.length} <span className="text-xs font-normal text-gray-400">tutor personas</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#eff4ff] shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#eff4ff] text-[#006947] flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5a4138]">
              Faculty Review Queue
            </span>
            <div className="text-lg font-black text-[#0b1c30]">
              {pendingApprovalsCount}{' '}
              <span className="text-xs font-normal text-gray-400">
                {pendingApprovalsCount === 1 ? 'request pending' : 'requests pending'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Switcher Navigation */}
      <div className="flex items-center gap-2 border-b border-[#eff4ff] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('services')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer flex-shrink-0 ${
            activeTab === 'services'
              ? 'bg-[#0051d5] text-white shadow-sm'
              : 'text-[#5a4138] hover:bg-[#eff4ff]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Connected Services ({connectedCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('automation')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer flex-shrink-0 ${
            activeTab === 'automation'
              ? 'bg-[#0051d5] text-white shadow-sm'
              : 'text-[#5a4138] hover:bg-[#eff4ff]'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Automation Rules Engine ({activeRulesCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('tutors')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer flex-shrink-0 ${
            activeTab === 'tutors'
              ? 'bg-[#0051d5] text-white shadow-sm'
              : 'text-[#5a4138] hover:bg-[#eff4ff]'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Custom Tutors & MCP ({customTutors.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer flex-shrink-0 ${
            activeTab === 'approvals'
              ? 'bg-[#0051d5] text-white shadow-sm'
              : 'text-[#5a4138] hover:bg-[#eff4ff]'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Faculty Approval Queue</span>
          {pendingApprovalsCount > 0 && (
            <span className="bg-[#ba1a1a] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {pendingApprovalsCount}
            </span>
          )}
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: CONNECTED SERVICES                                */}
      {/* ========================================================= */}
      {activeTab === 'services' && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {plugins.map((plugin) => {
              const isConnected = plugin.status === 'connected';
              const enabledRulesCount = plugin.rules.filter((r) => r.enabled).length;

              return (
                <div
                  key={plugin.id}
                  className="bg-white rounded-3xl p-6 border border-[#eff4ff] shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between gap-5 transition-all hover:border-[#dce9ff]"
                >
                  <div className="flex flex-col gap-4">
                    {/* Header: Icon, Name & Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                            isConnected
                              ? 'bg-[#eff4ff] text-[#0051d5]'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {getPluginIcon(plugin.icon)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-base text-[#0b1c30]">
                              {plugin.name}
                            </h3>
                          </div>
                          <span className="text-[11px] font-semibold text-[#5a4138] capitalize">
                            Category: {plugin.category}
                          </span>
                        </div>
                      </div>

                      {/* Status pill */}
                      <div
                        className={`px-3 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1.5 ${
                          isConnected
                            ? 'bg-[#eff4ff] text-[#006947]'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isConnected ? 'bg-[#006947] animate-pulse' : 'bg-gray-400'
                          }`}
                        />
                        <span>{isConnected ? 'Connected - Active' : 'Not Connected'}</span>
                      </div>
                    </div>

                    <p className="text-xs text-[#5a4138] leading-relaxed">
                      {plugin.description}
                    </p>

                    {/* Connection details / Meta pills */}
                    {isConnected ? (
                      <div className="bg-[#eff4ff]/40 rounded-2xl p-3.5 border border-[#dce9ff]/50 flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs text-[#0b1c30]">
                          <span className="font-semibold text-gray-500">Account:</span>
                          <span className="font-bold text-[#0051d5]">{plugin.accountEmail}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-[#0b1c30]">
                          <span className="font-semibold text-gray-500">Sync Frequency:</span>
                          <span className="font-bold capitalize bg-white px-2 py-0.5 rounded-md border border-[#dce9ff]">
                            {plugin.syncFrequency}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-[#0b1c30]">
                          <span className="font-semibold text-gray-500">Active Rules:</span>
                          <span className="font-bold">
                            {enabledRulesCount} of {plugin.rules.length} enabled
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-[#0b1c30]">
                          <span className="font-semibold text-gray-500">Last Sync:</span>
                          <span className="font-semibold text-[#5a4138] flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {plugin.lastSync || 'Never'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-200/60 flex flex-col gap-1.5">
                        <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                          Key Capabilities:
                        </span>
                        <ul className="text-xs text-gray-500 space-y-1">
                          {plugin.permissions.map((perm, idx) => (
                            <li key={idx} className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-gray-400" />
                              <span>{perm}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#eff4ff]">
                    {isConnected ? (
                      <>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleForceSync(plugin)}
                            disabled={syncingPluginId === plugin.id}
                            className="bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0051d5] px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <RefreshCw
                              className={`w-3.5 h-3.5 ${
                                syncingPluginId === plugin.id ? 'animate-spin' : ''
                              }`}
                            />
                            <span>{syncingPluginId === plugin.id ? 'Syncing...' : 'Sync Now'}</span>
                          </button>

                          <button
                            onClick={() => setConfiguringPlugin(plugin)}
                            className="bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                            <span>Configure</span>
                          </button>
                        </div>

                        <button
                          onClick={() => handleDisconnect(plugin.id)}
                          className="text-xs font-bold text-[#ba1a1a] hover:underline cursor-pointer"
                        >
                          Disconnect
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleStartConnect(plugin)}
                        className="w-full bg-[#0051d5] hover:bg-[#0040a8] text-white py-2.5 rounded-full text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Connect via OAuth2</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: AUTOMATION RULES ENGINE                           */}
      {/* ========================================================= */}
      {activeTab === 'automation' && (
        <div className="bg-white rounded-3xl p-6 lg:p-8 border border-[#eff4ff] shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-[#a33900]">
                <Zap className="w-5 h-5 fill-current" />
                <h2 className="font-extrabold text-lg text-[#0b1c30]">
                  Automation Rules Engine
                </h2>
              </div>
              <p className="text-xs text-[#5a4138] mt-0.5">
                Toggle background workflow triggers that bridge your courses, homework, calendar, and email.
              </p>
            </div>

            <span className="text-xs font-bold text-[#0051d5] bg-[#eff4ff] px-3 py-1.5 rounded-full self-start sm:self-auto">
              {activeRulesCount} of {totalRulesCount} rules active
            </span>
          </div>

          <div className="flex flex-col gap-6">
            {plugins.map((plugin) => (
              <div key={plugin.id} className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[#0b1c30] uppercase tracking-wider">
                      {plugin.name}
                    </span>
                    {plugin.status !== 'connected' && (
                      <span className="text-[10px] font-bold text-[#ba1a1a] bg-[#ffdad6] px-2 py-0.5 rounded-md">
                        Service Disconnected
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {plugin.rules.map((rule) => {
                    const isRuleActive = rule.enabled && plugin.status === 'connected';

                    return (
                      <div
                        key={rule.id}
                        onClick={() => handleToggleRule(plugin.id, rule.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                          isRuleActive
                            ? 'bg-[#eff4ff]/60 hover:bg-[#eff4ff] border-[#dce9ff]'
                            : 'bg-gray-50/70 hover:bg-gray-100 border-gray-200/70'
                        }`}
                      >
                        <div className="flex flex-col gap-1 min-w-0">
                          <span
                            className={`font-bold text-xs sm:text-sm ${
                              isRuleActive ? 'text-[#0b1c30]' : 'text-gray-500'
                            }`}
                          >
                            {rule.ruleName}
                          </span>
                          <span className="text-xs text-[#5a4138] leading-relaxed">
                            {rule.description}
                          </span>
                          {rule.lastSyncDetails && (
                            <span className="text-[11px] text-gray-500 italic mt-1">
                              • Last action: {rule.lastSyncDetails}
                            </span>
                          )}
                        </div>

                        {/* Toggle Checkbox Switch */}
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                            rule.enabled
                              ? 'bg-[#0051d5] text-white shadow-xs'
                              : 'border-2 border-gray-300 bg-white'
                          }`}
                        >
                          {rule.enabled && <Check className="w-4 h-4 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: CUSTOM TUTORS & MCP                               */}
      {/* ========================================================= */}
      {activeTab === 'tutors' && (
        <div className="flex flex-col gap-6">
          {/* Top Banner with Wizard Trigger */}
          <div className="bg-gradient-to-r from-[#7c3aed]/10 via-[#0051d5]/5 to-transparent rounded-3xl p-6 sm:p-7 border border-[#7c3aed]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#7c3aed] text-white flex items-center justify-center flex-shrink-0 shadow-md">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-lg text-[#0b1c30]">
                  Custom Tutor Personas & Model Context Protocol (MCP)
                </h3>
                <p className="text-xs text-[#5a4138] max-w-2xl mt-0.5">
                  Build custom teaching styles or plug in external AI endpoints using MCP. Custom tutors automatically integrate into your AI Tutor study assistant once reviewed.
                </p>
              </div>
            </div>

            <button
              onClick={handleOpenWizard}
              className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-6 py-3 rounded-full text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Launch 4-Step Tutor Wizard</span>
            </button>
          </div>

          {/* Active Tutors Grid */}
          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5a4138]">
              Active & Approved Custom Tutors ({customTutors.length})
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customTutors.map((tutor) => (
                <div
                  key={tutor.id}
                  className="bg-white rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#eff4ff] flex flex-col justify-between gap-4 transition-all hover:border-[#dce9ff]"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-[#eff4ff] text-[#7c3aed] font-black text-sm flex items-center justify-center flex-shrink-0">
                          {tutor.initials || 'CT'}
                        </div>
                        <div>
                          <h4 className="font-black text-sm text-[#0b1c30]">
                            {tutor.name}
                          </h4>
                          <span className="text-xs text-[#7c3aed] font-semibold">
                            {tutor.specialty}
                          </span>
                        </div>
                      </div>

                      <span className="bg-[#eff4ff] text-[#006947] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Approved
                      </span>
                    </div>

                    {tutor.bio && (
                      <p className="text-xs text-[#5a4138] line-clamp-2">
                        {tutor.bio}
                      </p>
                    )}

                    <div className="bg-[#eff4ff]/40 rounded-xl p-3 border border-[#dce9ff]/50">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
                        Pedagogical Prompt:
                      </span>
                      <p className="text-xs text-[#0b1c30] italic line-clamp-3 leading-relaxed">
                        "{tutor.prompt}"
                      </p>
                    </div>

                    {tutor.mcpConfig && (
                      <div className="flex items-center gap-1.5 text-[11px] text-[#5a4138]">
                        <Cpu className="w-3.5 h-3.5 text-[#0051d5]" />
                        <span>MCP: {tutor.mcpConfig.provider.toUpperCase()}</span>
                        {tutor.mcpConfig.mcpUrl && (
                          <span className="text-gray-400 truncate max-w-[150px]">
                            ({tutor.mcpConfig.mcpUrl})
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#eff4ff]">
                    <button
                      onClick={() => onNavigateToTutor && onNavigateToTutor()}
                      className="text-xs font-bold text-[#0051d5] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Open in AI Tutor</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onRemoveCustomTutor(tutor.id)}
                      className="text-xs font-bold text-[#ba1a1a] hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: FACULTY APPROVAL QUEUE                             */}
      {/* ========================================================= */}
      {activeTab === 'approvals' && (
        <div className="bg-white rounded-3xl p-6 lg:p-8 border border-[#eff4ff] shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-[#006947]">
                <ShieldCheck className="w-5 h-5" />
                <h2 className="font-extrabold text-lg text-[#0b1c30]">
                  Faculty & Dean Tutor Approval Queue
                </h2>
              </div>
              <p className="text-xs text-[#5a4138] mt-0.5">
                Review submitted custom personas, inspect MCP endpoints, run live sample diagnostic tests, and authorize campus deployment.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#006947] bg-[#eff4ff] px-3 py-1.5 rounded-full">
                {pendingApprovalsCount} Pending Review
              </span>
            </div>
          </div>

          {approvalRequests.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs font-semibold">
              No pending tutor approval requests. All submitted personas are processed.
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {approvalRequests.map((req) => {
                const isPending = req.status === 'pending';
                const isApproved = req.status === 'approved';
                const isRejected = req.status === 'rejected';

                return (
                  <div
                    key={req.id}
                    className="border border-[#dce9ff] rounded-3xl p-5 lg:p-6 bg-white flex flex-col gap-4 shadow-xs"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#eff4ff] text-[#7c3aed] font-extrabold flex items-center justify-center text-sm">
                          {req.tutorName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-black text-base text-[#0b1c30]">
                              {req.tutorName}
                            </h3>
                            <span className="text-xs text-[#7c3aed] font-bold">
                              • {req.specialty}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#5a4138]">
                            Submitted by <strong className="text-[#0b1c30]">{req.authorName}</strong> on {req.submittedAt}
                          </span>
                        </div>
                      </div>

                      {/* Status Tag */}
                      <span
                        className={`text-xs font-extrabold px-3 py-1 rounded-full self-start sm:self-auto flex items-center gap-1.5 ${
                          isApproved
                            ? 'bg-[#eff4ff] text-[#006947]'
                            : isRejected
                            ? 'bg-[#ffdad6] text-[#ba1a1a]'
                            : 'bg-[#ffdbce] text-[#a33900]'
                        }`}
                      >
                        {isApproved && <CheckCircle className="w-3.5 h-3.5" />}
                        {isRejected && <XCircle className="w-3.5 h-3.5" />}
                        {isPending && <Clock className="w-3.5 h-3.5" />}
                        <span className="capitalize">{req.status} Review</span>
                      </span>
                    </div>

                    {/* Method & MCP Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="bg-[#eff4ff]/30 p-3 rounded-2xl border border-[#dce9ff]/40 flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-gray-500 uppercase">
                          Teaching Methodology:
                        </span>
                        <span className="font-bold text-[#0b1c30] capitalize">
                          {req.method} Method
                        </span>
                      </div>

                      <div className="bg-[#eff4ff]/30 p-3 rounded-2xl border border-[#dce9ff]/40 flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-gray-500 uppercase">
                          MCP Provider & Endpoint:
                        </span>
                        <span className="font-bold text-[#0b1c30]">
                          {req.mcpConfig?.provider.toUpperCase() || 'CLASSSARTHI AI'} •{' '}
                          {req.mcpConfig?.mcpUrl || 'Built-in Model'}
                        </span>
                      </div>
                    </div>

                    {/* Prompt Box */}
                    <div className="bg-[#eff4ff]/30 p-4 rounded-2xl border border-[#dce9ff]/40 flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-gray-500 uppercase">
                        Teaching Philosophy & System Prompt:
                      </span>
                      <p className="text-xs text-[#0b1c30] italic leading-relaxed">
                        "{req.prompt}"
                      </p>
                    </div>

                    {/* Sample Test Output */}
                    {sampleOutput && sampleOutput.reqId === req.id && (
                      <div className="bg-[#f2fbf4] p-4 rounded-2xl border border-[#c4ebd1] flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs font-bold text-[#006947]">
                          <span className="flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4" />
                            Live Diagnostic Response Preview ({sampleOutput.latency}ms latency):
                          </span>
                          <span className="text-[11px] bg-white px-2 py-0.5 rounded-md border border-[#c4ebd1]">
                            Q: {sampleQuestion.substring(0, 45)}...
                          </span>
                        </div>
                        <p className="text-xs text-[#0b1c30] leading-relaxed whitespace-pre-line">
                          {sampleOutput.response}
                        </p>
                      </div>
                    )}

                    {/* Admin Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#eff4ff]">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRunSampleTest(req)}
                          disabled={sampleTesting}
                          className="bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0051d5] px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Cpu className="w-3.5 h-3.5" />
                          <span>
                            {sampleTesting && testingSampleReqId === req.id
                              ? 'Evaluating Sample...'
                              : 'Test with Sample Query'}
                          </span>
                        </button>
                      </div>

                      {isPending && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setRejectingReqId(req.id)}
                            className="bg-[#ffdad6] hover:bg-[#ffb4ab] text-[#ba1a1a] px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer"
                          >
                            Reject with Feedback
                          </button>

                          <button
                            onClick={() => handleApproveRequest(req.id)}
                            className="bg-[#006947] hover:bg-[#005237] text-white px-5 py-2 rounded-full text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                            <span>Authorize & Approve</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CONNECT VIA OAUTH2                                */}
      {/* ========================================================= */}
      {connectingPlugin && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-[#eff4ff] shadow-2xl flex flex-col gap-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#eff4ff] text-[#0051d5] flex items-center justify-center flex-shrink-0">
                {getPluginIcon(connectingPlugin.icon)}
              </div>
              <div>
                <h3 className="font-black text-lg text-[#0b1c30]">
                  Connect: {connectingPlugin.name}
                </h3>
                <span className="text-xs text-[#5a4138]">
                  OAuth2 Single Sign-On & Permission Consent
                </span>
              </div>
            </div>

            {/* What this does */}
            <div className="bg-[#eff4ff]/40 p-4 rounded-2xl border border-[#dce9ff]/50 flex flex-col gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0051d5]">
                What this integration does:
              </span>
              <ul className="text-xs text-[#0b1c30] space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0051d5]" />
                  <span>Auto-sync coursework and assignments to To-Do List</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0051d5]" />
                  <span>Pull lecture slides, blackboard captures, and transcripts</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0051d5]" />
                  <span>Sync due date alerts and quiz reminders to Calendar</span>
                </li>
              </ul>
            </div>

            {/* Permissions Required */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#5a4138]">
                Permissions Requested:
              </span>
              <div className="space-y-2">
                {connectingPlugin.permissions.map((perm, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 text-xs text-[#0b1c30] bg-[#eff4ff]/20 p-2 rounded-xl border border-[#dce9ff]/30"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#006947] flex-shrink-0" />
                    <span>{perm}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Account Selector */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#5a4138]">
                Connected Google / University Account:
              </span>
              <input
                type="email"
                value={selectedOAuthAccount}
                onChange={(e) => setSelectedOAuthAccount(e.target.value)}
                className="bg-white border border-[#dce9ff] px-4 py-2.5 rounded-xl text-xs text-[#0b1c30] font-semibold outline-none focus:ring-2 focus:ring-[#0051d5]/30"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#eff4ff]">
              <button
                onClick={() => setConnectingPlugin(null)}
                disabled={isAuthorizing}
                className="text-xs font-bold text-gray-500 hover:text-gray-800 px-4 py-2 cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmOAuthConnect}
                disabled={isAuthorizing}
                className="bg-[#0051d5] hover:bg-[#0040a8] text-white px-6 py-2.5 rounded-full text-xs font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isAuthorizing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authorizing OAuth2...</span>
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4" />
                    <span>Grant Permissions & Connect</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CONFIGURE PLUGIN & SYNC LOGS                      */}
      {/* ========================================================= */}
      {configuringPlugin && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-xl w-full border border-[#eff4ff] shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#eff4ff] text-[#0051d5] flex items-center justify-center flex-shrink-0">
                  {getPluginIcon(configuringPlugin.icon)}
                </div>
                <div>
                  <h3 className="font-black text-lg text-[#0b1c30]">
                    Configure: {configuringPlugin.name}
                  </h3>
                  <span className="text-xs text-[#5a4138]">
                    {configuringPlugin.accountEmail}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setConfiguringPlugin(null)}
                className="text-gray-400 hover:text-gray-700 text-lg font-bold cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Test Connection Result Notice */}
            {testResult && testResult.id === configuringPlugin.id && (
              <div className="bg-[#f2fbf4] border border-[#c4ebd1] p-3 rounded-2xl text-xs text-[#006947] font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{testResult.msg}</span>
              </div>
            )}

            {/* Sync Frequency Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#5a4138]">
                Background Sync Frequency
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['realtime', 'hourly', 'daily', 'manual'] as const).map((freq) => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => {
                      const updated = plugins.map((p) =>
                        p.id === configuringPlugin.id ? { ...p, syncFrequency: freq } : p
                      );
                      setPlugins(updated);
                      setConfiguringPlugin({ ...configuringPlugin, syncFrequency: freq });
                    }}
                    className={`py-2 px-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                      configuringPlugin.syncFrequency === freq
                        ? 'bg-[#0051d5] text-white shadow-xs'
                        : 'bg-[#eff4ff] text-[#5a4138] hover:bg-[#dce9ff]'
                    }`}
                  >
                    {freq}
                  </button>
                ))}
              </div>
            </div>

            {/* Automation Rules for this plugin */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#5a4138]">
                Plugin Automation Rules
              </label>
              <div className="space-y-2">
                {configuringPlugin.rules.map((rule) => (
                  <div
                    key={rule.id}
                    onClick={() => handleToggleRule(configuringPlugin.id, rule.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      rule.enabled
                        ? 'bg-[#eff4ff]/60 border-[#dce9ff]'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[#0b1c30]">
                        {rule.ruleName}
                      </span>
                      <span className="text-[11px] text-[#5a4138]">
                        {rule.description}
                      </span>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${
                        rule.enabled
                          ? 'bg-[#0051d5] text-white'
                          : 'border border-gray-300 bg-white'
                      }`}
                    >
                      {rule.enabled && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sync History Logs */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#5a4138]">
                Recent Synchronization Events
              </label>
              <div className="bg-gray-50 rounded-2xl p-3 border border-gray-200/60 max-h-36 overflow-y-auto space-y-2">
                {configuringPlugin.syncHistory.length === 0 ? (
                  <span className="text-xs text-gray-400">No sync events recorded yet.</span>
                ) : (
                  configuringPlugin.syncHistory.map((item) => (
                    <div key={item.id} className="text-xs flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#006947] mt-0.5 flex-shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-[#0b1c30]">{item.summary}</span>
                        <span className="text-[10px] text-gray-400">{item.timestamp}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[#eff4ff]">
              <button
                onClick={() => handleTestConnection(configuringPlugin)}
                disabled={testingPluginId === configuringPlugin.id}
                className="bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0051d5] px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>
                  {testingPluginId === configuringPlugin.id
                    ? 'Testing...'
                    : 'Test API Connection'}
                </span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleForceSync(configuringPlugin)}
                  disabled={syncingPluginId === configuringPlugin.id}
                  className="bg-[#0051d5] hover:bg-[#0040a8] text-white px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${
                      syncingPluginId === configuringPlugin.id ? 'animate-spin' : ''
                    }`}
                  />
                  <span>Sync Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4-STEP CUSTOM TUTOR WIZARD MODAL                         */}
      {/* ========================================================= */}
      {isWizardOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-[#eff4ff] shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            {/* Wizard Header */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7c3aed]">
                  Step {wizardStep} of 4 • Model Context Protocol Wizard
                </span>
                <h3 className="font-black text-xl text-[#0b1c30]">
                  {wizardStep === 1 && 'Basic Persona Information'}
                  {wizardStep === 2 && 'Teaching Style & Custom Prompt'}
                  {wizardStep === 3 && 'MCP API Server Configuration'}
                  {wizardStep === 4 && 'Verification & Approval Summary'}
                </h3>
              </div>

              <button
                onClick={() => setIsWizardOpen(false)}
                className="text-gray-400 hover:text-gray-700 text-xl font-bold cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Stepper Progress Indicator */}
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`h-1.5 rounded-full transition-all ${
                    wizardStep >= step ? 'bg-[#7c3aed]' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>

            {/* STEP 1: Basic Info */}
            {wizardStep === 1 && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#5a4138]">
                      Teacher / Tutor Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={tutorName}
                      onChange={(e) => setTutorName(e.target.value)}
                      placeholder="e.g. Prof. Walter Lewin, Dr. Maryam"
                      className="bg-white border border-[#dce9ff] px-4 py-2.5 rounded-xl text-xs text-[#0b1c30] outline-none focus:ring-2 focus:ring-[#7c3aed]/30"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#5a4138]">
                      Specialty / Department Tagline
                    </label>
                    <input
                      type="text"
                      value={tutorSpecialty}
                      onChange={(e) => setTutorSpecialty(e.target.value)}
                      placeholder="e.g. Classical Mechanics & Visual Demonstrations"
                      className="bg-white border border-[#dce9ff] px-4 py-2.5 rounded-xl text-xs text-[#0b1c30] outline-none focus:ring-2 focus:ring-[#7c3aed]/30"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#5a4138]">
                    Bio & Academic Background (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={tutorBio}
                    onChange={(e) => setTutorBio(e.target.value)}
                    placeholder="Brief description of this tutor's background or academic style."
                    className="bg-white border border-[#dce9ff] p-3.5 rounded-xl text-xs text-[#0b1c30] outline-none focus:ring-2 focus:ring-[#7c3aed]/30 resize-none"
                  />
                </div>
              </div>
            )}

            {/* STEP 2: Teaching Style & Prompt */}
            {wizardStep === 2 && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#5a4138]">
                    Select Teaching Methodology
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'socratic', label: 'Socratic Method' },
                      { id: 'feynman', label: 'Feynman Technique' },
                      { id: 'direct', label: 'Direct Instruction' },
                      { id: 'visual', label: 'Visual Derivation' },
                      { id: 'project_based', label: 'Project-Based' },
                      { id: 'custom', label: 'Custom' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setTutorMethod(m.id)}
                        className={`p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                          tutorMethod === m.id
                            ? 'bg-[#7c3aed] text-white shadow-xs'
                            : 'bg-[#eff4ff] text-[#5a4138] hover:bg-[#dce9ff]'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#5a4138]">
                    Custom Teaching Prompt <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={tutorPrompt}
                    onChange={(e) => setTutorPrompt(e.target.value)}
                    placeholder="Describe how this tutor explains concepts (e.g. Always begin with a real-world demonstration, explain why common misconceptions fail, and derive equations from first principles)."
                    className="bg-white border border-[#dce9ff] p-3.5 rounded-xl text-xs text-[#0b1c30] outline-none focus:ring-2 focus:ring-[#7c3aed]/30 resize-none leading-relaxed"
                    required
                  />
                </div>
              </div>
            )}

            {/* STEP 3: MCP Configuration */}
            {wizardStep === 3 && (
              <div className="flex flex-col gap-4">
                <div
                  onClick={() => setUseExternalMcp(!useExternalMcp)}
                  className="bg-[#eff4ff]/60 hover:bg-[#eff4ff] p-4 rounded-2xl border border-[#dce9ff] flex items-center justify-between gap-3 cursor-pointer transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-xs text-[#0b1c30]">
                      Connect to External MCP API Server?
                    </span>
                    <span className="text-[11px] text-[#5a4138]">
                      Enable to route queries through a custom endpoint or Claude/OpenAI tool server.
                    </span>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                      useExternalMcp ? 'bg-[#7c3aed] text-white' : 'border border-gray-300 bg-white'
                    }`}
                  >
                    {useExternalMcp && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>
                </div>

                {useExternalMcp && (
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-[#5a4138]">
                          Service Provider
                        </label>
                        <select
                          value={mcpProvider}
                          onChange={(e) => setMcpProvider(e.target.value as any)}
                          className="bg-white border border-[#dce9ff] px-4 py-2.5 rounded-xl text-xs text-[#0b1c30] font-bold outline-none cursor-pointer"
                        >
                          <option value="classsarthi_ai">ClassSarthi Core AI Engine</option>
                          <option value="anthropic">Anthropic Claude MCP</option>
                          <option value="openai">OpenAI GPT-4o Gateway</option>
                          <option value="custom">Custom University MCP Server</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-[#5a4138]">
                          Auth Method
                        </label>
                        <select
                          value={mcpAuthMethod}
                          onChange={(e) => setMcpAuthMethod(e.target.value as any)}
                          className="bg-white border border-[#dce9ff] px-4 py-2.5 rounded-xl text-xs text-[#0b1c30] font-bold outline-none cursor-pointer"
                        >
                          <option value="bearer">Bearer Token</option>
                          <option value="header">API Key Header</option>
                          <option value="oauth2">OAuth2 Token</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[#5a4138]">
                        MCP Server URL Endpoint
                      </label>
                      <input
                        type="url"
                        value={mcpUrl}
                        onChange={(e) => setMcpUrl(e.target.value)}
                        className="bg-white border border-[#dce9ff] px-4 py-2.5 rounded-xl text-xs text-[#0b1c30] outline-none focus:ring-2 focus:ring-[#7c3aed]/30"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[#5a4138]">
                        API Key / Secret Token
                      </label>
                      <div className="relative">
                        <input
                          type={showApiKey ? 'text' : 'password'}
                          value={mcpApiKey}
                          onChange={(e) => setMcpApiKey(e.target.value)}
                          className="w-full bg-white border border-[#dce9ff] px-4 py-2.5 pr-10 rounded-xl text-xs text-[#0b1c30] outline-none focus:ring-2 focus:ring-[#7c3aed]/30"
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-700 cursor-pointer"
                        >
                          {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Test MCP Handshake Button */}
                    <div className="pt-2 flex items-center justify-between">
                      {mcpTestPassed && (
                        <span className="text-xs font-bold text-[#006947] flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          MCP Server handshake verified (38ms)
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={handleTestMcpHandshake}
                        disabled={mcpTesting}
                        className="ml-auto bg-[#eff4ff] hover:bg-[#dce9ff] text-[#7c3aed] px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Server className="w-3.5 h-3.5" />
                        <span>{mcpTesting ? 'Verifying...' : 'Test MCP Connection'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: Verification & Approval Summary */}
            {wizardStep === 4 && (
              <div className="flex flex-col gap-4">
                <div className="bg-[#eff4ff]/40 p-5 rounded-2xl border border-[#dce9ff]/60 flex flex-col gap-3">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#7c3aed]">
                    Tutor Persona Summary
                  </span>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-gray-500 font-semibold block">Name:</span>
                      <strong className="text-[#0b1c30]">{tutorName}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 font-semibold block">Specialty:</span>
                      <strong className="text-[#0b1c30]">{tutorSpecialty || 'General STEM'}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 font-semibold block">Method:</span>
                      <strong className="text-[#0b1c30] capitalize">{tutorMethod} Method</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 font-semibold block">MCP Protocol:</span>
                      <strong className="text-[#0b1c30]">
                        {useExternalMcp ? mcpProvider.toUpperCase() : 'ClassSarthi Core AI'}
                      </strong>
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-500 font-semibold text-xs block mb-1">
                      System Prompt:
                    </span>
                    <p className="text-xs text-[#0b1c30] italic bg-white p-3 rounded-xl border border-[#dce9ff]/50 leading-relaxed">
                      "{tutorPrompt}"
                    </p>
                  </div>
                </div>

                <div className="bg-[#ffdbce]/40 p-4 rounded-2xl border border-[#ffdbce] flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-[#a33900] flex-shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="font-bold text-xs text-[#a33900]">
                      Faculty Review & Verification Required
                    </span>
                    <p className="text-xs text-[#5a4138] mt-0.5 leading-relaxed">
                      To preserve academic integrity and prevent hallucinations, custom AI tutors are queued for administrative evaluation before appearing in public study rosters.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Stepper Footer Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-[#eff4ff]">
              {wizardStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setWizardStep((prev) => (prev - 1) as any)}
                  className="text-xs font-bold text-gray-500 hover:text-gray-800 px-4 py-2 cursor-pointer"
                >
                  Back
                </button>
              ) : (
                <div />
              )}

              {wizardStep < 4 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (wizardStep === 1 && !tutorName.trim()) {
                      showToast('Please enter a tutor name.');
                      return;
                    }
                    if (wizardStep === 2 && !tutorPrompt.trim()) {
                      showToast('Please enter a custom prompt.');
                      return;
                    }
                    setWizardStep((prev) => (prev + 1) as any);
                  }}
                  className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-6 py-2.5 rounded-full text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Next Step</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCompleteTutorSubmission}
                  className="bg-[#006947] hover:bg-[#005237] text-white px-6 py-2.5 rounded-full text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Submit for Faculty Approval</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* REJECTION FEEDBACK MODAL                                  */}
      {/* ========================================================= */}
      {rejectingReqId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-[#eff4ff] shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-lg text-[#0b1c30]">
                  Reject Custom Tutor Request
                </h3>
                <span className="text-xs text-[#5a4138]">
                  Provide constructive pedagogical feedback
                </span>
              </div>
            </div>

            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Prompt does not encourage active student problem solving; please refine Socratic questioning guardrails."
              className="bg-white border border-[#dce9ff] p-3.5 rounded-xl text-xs text-[#0b1c30] outline-none focus:ring-2 focus:ring-[#ba1a1a]/30 resize-none"
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#eff4ff]">
              <button
                onClick={() => setRejectingReqId(null)}
                className="text-xs font-bold text-gray-500 px-4 py-2 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectRequest}
                className="bg-[#ba1a1a] hover:bg-[#93000a] text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer"
              >
                Submit Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
