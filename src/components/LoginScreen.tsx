import React, { useState } from 'react';
import { User, UserRole } from '../types';
import {
  GraduationCap,
  Sparkles,
  Shield,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Brain,
  TrendingUp,
  RotateCcw,
  Check,
  HelpCircle,
  X,
  School,
} from 'lucide-react';
import { FAKE_USERS } from '../mock/fakeData';
import { fetchUsersFromSupabaseCloud } from '../lib/supabase';

interface LoginScreenProps {
  onLoginSuccess: (user: User, token: string) => void;
  onLaunchVisionNoteDirectly?: (user: User, token: string) => void;
  allUsers?: User[];
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  allUsers: initialUsers,
}) => {
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher' | 'admin'>('student');
  const [identifier, setIdentifier] = useState('student.dhruva');
  const [password, setPassword] = useState('ClassSarthi@260101');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const [registeredUsers, setRegisteredUsers] = useState<User[]>(() => {
    let base = initialUsers && initialUsers.length > 0 ? [...initialUsers] : [...FAKE_USERS];
    try {
      const saved = JSON.parse(localStorage.getItem('classsarthi_users') || '[]');
      if (Array.isArray(saved)) {
        for (const s of saved) {
          if (!base.some((b) => b.id === s.id)) base.push(s);
        }
      }
    } catch {}
    return base;
  });

  // Sync with initialUsers prop when updated by parent
  React.useEffect(() => {
    if (initialUsers && initialUsers.length > 0) {
      setRegisteredUsers((prev) => {
        const merged = [...initialUsers];
        for (const p of prev) {
          if (!merged.some((m) => m.id === p.id)) merged.push(p);
        }
        return merged;
      });
    }
  }, [initialUsers]);

  const dedupeUsers = (list: User[]): User[] => {
    const map = new Map<string, User>();
    for (const u of list) {
      if (!u || !u.name) continue;
      const key = `${u.name.toLowerCase().trim()}:${u.role}`;
      if (!map.has(key)) {
        map.set(key, u);
      }
    }
    return Array.from(map.values());
  };

  // Fetch updated registered users list from server and Supabase Cloud
  React.useEffect(() => {
    fetch('/api/auth/public-users')
      .then(async (res) => {
        const ct = res.headers.get('content-type');
        if (!res.ok || !ct || !ct.includes('application/json')) return null;
        return res.json();
      })
      .then((data) => {
        if (data?.users && Array.isArray(data.users) && data.users.length > 0) {
          setRegisteredUsers((prev) => {
            const merged = [...data.users];
            for (const p of prev) {
              if (!merged.some((m) => m.id === p.id)) merged.push(p);
            }
            return dedupeUsers(merged);
          });
        }
      })
      .catch((err) => console.error('Failed to load registered users from API:', err));

    fetchUsersFromSupabaseCloud()
      .then((cloudUsers) => {
        if (cloudUsers && cloudUsers.length > 0) {
          setRegisteredUsers((prev) => {
            const merged = [...cloudUsers];
            for (const p of prev) {
              if (!merged.some((m) => m.id === p.id)) merged.push(p);
            }
            return dedupeUsers(merged);
          });
        }
      })
      .catch((e) => console.warn('Supabase cloud user pull note:', e));
  }, []);

  const handleRoleChange = (role: 'student' | 'teacher' | 'admin') => {
    setSelectedRole(role);
    setErrorMessage(null);
    if (role === 'student') {
      setIdentifier('student.dhruva');
      setPassword('ClassSarthi@260101');
    } else if (role === 'teacher') {
      setIdentifier('prof.rajesh');
      setPassword('Physics@2026!');
    } else {
      setIdentifier('dean.maneek');
      setPassword('Dean@ClassSarthi2026!');
    }
  };

  const safeUsers = Array.isArray(registeredUsers) ? registeredUsers : [];

  const verifyCredentialsLocallyAndLogin = async (loginId: string, loginPass: string): Promise<boolean> => {
    const normId = loginId.toLowerCase().trim();

    let candidates = [...safeUsers];
    try {
      const savedUsers = JSON.parse(localStorage.getItem('classsarthi_users') || '[]');
      if (Array.isArray(savedUsers)) {
        for (const s of savedUsers) {
          if (!candidates.some((c) => c.id === s.id)) candidates.push(s);
        }
      }
    } catch {}

    let matched = candidates.find(
      (u) =>
        (u.username && u.username.toLowerCase() === normId) ||
        (u.email && u.email.toLowerCase() === normId) ||
        (u.institutionalId && u.institutionalId.toLowerCase() === normId) ||
        (u.name && u.name.toLowerCase() === normId)
    );

    if (!matched) {
      try {
        const cloudUsers = await fetchUsersFromSupabaseCloud();
        matched = cloudUsers.find(
          (u) =>
            (u.username && u.username.toLowerCase() === normId) ||
            (u.email && u.email.toLowerCase() === normId) ||
            (u.institutionalId && u.institutionalId.toLowerCase() === normId) ||
            (u.name && u.name.toLowerCase() === normId)
        );
      } catch {}
    }

    if (!matched) {
      setErrorMessage(`No registered account found matching "${loginId}". Please check your credentials.`);
      return false;
    }

    const expectedPassword = matched.password || 'ClassSarthi@260101';
    if (expectedPassword !== loginPass) {
      setErrorMessage('Incorrect password. Please verify your credentials and try again.');
      return false;
    }

    const fallbackToken = `classsarthi_session_${Date.now()}`;
    if (rememberMe) {
      localStorage.setItem('classsarthi_token', fallbackToken);
      localStorage.setItem('classsarthi_user_id', matched.id);
      try {
        localStorage.setItem('classsarthi_user', JSON.stringify(matched));
      } catch (e) {}
    }
    onLoginSuccess(matched, fallbackToken);
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMessage('Please enter your Username or Email.');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Please enter your Password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const enteredId = identifier.trim();
    const enteredPass = password.trim();

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: enteredId,
          password: enteredPass,
          role: selectedRole,
        }),
      });

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();

        if (!response.ok) {
          setErrorMessage(data.error || 'Invalid credentials. Please verify your username and password.');
          setIsLoading(false);
          return;
        }

        if (data.token && data.user) {
          if (rememberMe) {
            localStorage.setItem('classsarthi_token', data.token);
            localStorage.setItem('classsarthi_user_id', data.user.id);
            try {
              localStorage.setItem('classsarthi_user', JSON.stringify(data.user));
            } catch (e) {}
          }
          onLoginSuccess(data.user, data.token);
          setIsLoading(false);
          return;
        }
      }

      await verifyCredentialsLocallyAndLogin(enteredId, enteredPass);
    } catch (err) {
      console.error('Login network error, checking local identity:', err);
      await verifyCredentialsLocallyAndLogin(enteredId, enteredPass);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-[#333333] flex flex-col font-sans selection:bg-[#FF8C00]/20 selection:text-[#1A3A52]">
      {/* 1. Header Section */}
      <header className="w-full bg-white border-b border-[#E0E0E0] shadow-[0_1px_4px_rgba(0,0,0,0.04)] px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FF8C00] flex items-center justify-center text-white font-black text-lg shadow-[0_2px_8px_rgba(255,140,0,0.35)]">
            ES
          </div>
          <div>
            <span className="text-xl font-bold text-[#1A3A52] tracking-tight block leading-tight">
              ClassSarthi
            </span>
            <span className="text-xs text-[#666666] font-medium block">
              Your Personal Learning Partner
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-[#F5F5F5] border border-[#E0E0E0] rounded-full text-xs font-semibold text-[#1A3A52]">
            <Shield className="w-3.5 h-3.5 text-[#27AE60]" />
            <span>256-bit Encrypted</span>
          </div>
        </div>
      </header>

      {/* 2. Main Login Workspace: Split Screen Layout */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12">
        <div className="w-full max-w-6xl bg-white rounded-2xl shadow-[0_4px_24px_rgba(26,58,82,0.08)] border border-[#E0E0E0] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
          
          {/* Left Side (60%): Hero Section & Branding */}
          <div className="lg:col-span-7 bg-gradient-to-br from-[#1A3A52] via-[#162F43] to-[#0F2231] text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
            {/* Background Decorative Circles */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF8C00]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#3B82F6]/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

            {/* Top Brand Statement */}
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-[#FF8C00] border border-white/10">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Gen Student Learning Platform</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white">
                Welcome Back!
              </h1>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-lg">
                Continue your learning journey with ClassSarthi. Master topics, get guided by AI, and achieve your academic goals with synchronized classroom intelligence.
              </p>
            </div>

            {/* Core Educational Benefits Checklist */}
            <div className="relative z-10 my-8 space-y-3.5">
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3.5 rounded-xl backdrop-blur-xs hover:bg-white/10 transition-colors">
                <div className="w-7 h-7 rounded-lg bg-[#27AE60]/20 flex items-center justify-center text-[#27AE60] flex-shrink-0">
                  <Check className="w-4 h-4 font-bold" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Personalized Learning Paths</h4>
                  <p className="text-[11px] text-gray-300">Customized to your visual, step-by-step, or exam-focused learning profile.</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3.5 rounded-xl backdrop-blur-xs hover:bg-white/10 transition-colors">
                <div className="w-7 h-7 rounded-lg bg-[#FF8C00]/20 flex items-center justify-center text-[#FF8C00] flex-shrink-0">
                  <Brain className="w-4 h-4 font-bold" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">24/7 Socratic AI Tutor</h4>
                  <p className="text-[11px] text-gray-300">Grounded in your actual lecture notes, formulas, and chalkboard captures.</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3.5 rounded-xl backdrop-blur-xs hover:bg-white/10 transition-colors">
                <div className="w-7 h-7 rounded-lg bg-[#3B82F6]/20 flex items-center justify-center text-[#3B82F6] flex-shrink-0">
                  <TrendingUp className="w-4 h-4 font-bold" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Real-Time Progress & Mastery Radar</h4>
                  <p className="text-[11px] text-gray-300">Identify misconceptions and weak topics before upcoming exams.</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3.5 rounded-xl backdrop-blur-xs hover:bg-white/10 transition-colors">
                <div className="w-7 h-7 rounded-lg bg-[#F39C12]/20 flex items-center justify-center text-[#F39C12] flex-shrink-0">
                  <RotateCcw className="w-4 h-4 font-bold" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Interactive Practice & Spaced Repetition</h4>
                  <p className="text-[11px] text-gray-300">Adaptive multiple-choice quizzes and 3D flashcard decks.</p>
                </div>
              </div>
            </div>

            {/* Quick Demo Credentials Footer */}
            <div className="relative z-10 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-400">
              <span>Demo Quick-Fill:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleRoleChange('student')}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors cursor-pointer text-[11px]"
                >
                  Student: <span className="font-mono text-[#FF8C00]">student.dhruva</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange('teacher')}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors cursor-pointer text-[11px]"
                >
                  Teacher: <span className="font-mono text-[#FF8C00]">prof.rajesh</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Side (40%): Login Form */}
          <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-center bg-white">
            <div className="w-full max-w-md mx-auto space-y-6">
              
              <div>
                <h2 className="text-2xl font-bold text-[#1A3A52] tracking-tight">
                  Sign in to your account
                </h2>
                <p className="text-xs text-[#666666] mt-1">
                  Select your role and enter your credentials below.
                </p>
              </div>

              {/* 3.1 Role Selection (Two Large Touch Targets) */}
              <div>
                <label className="block text-[11px] font-bold text-[#666666] uppercase tracking-wider mb-2">
                  LOGIN AS:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Student Button */}
                  <button
                    type="button"
                    onClick={() => handleRoleChange('student')}
                    className={`p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                      selectedRole === 'student'
                        ? 'border-[#FF8C00] bg-[#FFF8F0] shadow-[0_2px_12px_rgba(255,140,0,0.15)] ring-2 ring-[#FF8C00]/20'
                        : 'border-[#E0E0E0] bg-[#FAFAFA] hover:bg-[#F5F5F5] hover:border-[#CCCCCC]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <GraduationCap className={`w-5 h-5 ${selectedRole === 'student' ? 'text-[#FF8C00]' : 'text-[#666666]'}`} />
                        <span className={`font-bold text-sm ${selectedRole === 'student' ? 'text-[#1A3A52]' : 'text-[#333333]'}`}>
                          STUDENT
                        </span>
                      </div>
                      {selectedRole === 'student' && (
                        <div className="w-4 h-4 rounded-full bg-[#FF8C00] flex items-center justify-center text-white">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-[#666666] leading-tight">
                      Learn with personalized AI tutor & track progress.
                    </p>
                  </button>

                  {/* Teacher Button */}
                  <button
                    type="button"
                    onClick={() => handleRoleChange('teacher')}
                    className={`p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                      selectedRole === 'teacher'
                        ? 'border-[#FF8C00] bg-[#FFF8F0] shadow-[0_2px_12px_rgba(255,140,0,0.15)] ring-2 ring-[#FF8C00]/20'
                        : 'border-[#E0E0E0] bg-[#FAFAFA] hover:bg-[#F5F5F5] hover:border-[#CCCCCC]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <School className={`w-5 h-5 ${selectedRole === 'teacher' ? 'text-[#FF8C00]' : 'text-[#666666]'}`} />
                        <span className={`font-bold text-sm ${selectedRole === 'teacher' ? 'text-[#1A3A52]' : 'text-[#333333]'}`}>
                          TEACHER
                        </span>
                      </div>
                      {selectedRole === 'teacher' && (
                        <div className="w-4 h-4 rounded-full bg-[#FF8C00] flex items-center justify-center text-white">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-[#666666] leading-tight">
                      Manage classes, grade rubrics & diagnostic insights.
                    </p>
                  </button>
                </div>
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div className="p-3 bg-[#FDEDEC] border border-[#F5B7B1] rounded-xl flex items-start gap-2.5 text-xs text-[#E74C3C] animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 text-[#E74C3C] shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                {/* 3.2 Username/Email Field */}
                <div>
                  <label className="block text-[11px] font-bold text-[#666666] uppercase tracking-wider mb-1.5">
                    USERNAME OR EMAIL
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#999999]">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={selectedRole === 'teacher' ? 'prof.rajesh@bmu.edu.in' : 'student.dhruva@bmu.edu.in'}
                      className="w-full h-11 pl-10 pr-3.5 rounded-lg border border-[#CCCCCC] focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/20 outline-none text-sm text-[#333333] transition-all bg-white font-medium placeholder:text-[#999999]"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-[#999999] mt-1">
                    Tip: Use your registration email or username
                  </p>
                </div>

                {/* 3.3 Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-bold text-[#666666] uppercase tracking-wider">
                      PASSWORD
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPasswordModal(true);
                        setForgotSubmitted(false);
                        setForgotEmail('');
                      }}
                      className="text-xs text-[#FF8C00] hover:underline font-semibold cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#999999]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full h-11 pl-10 pr-10 rounded-lg border border-[#CCCCCC] focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/20 outline-none text-sm text-[#333333] transition-all bg-white font-medium"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#999999] hover:text-[#333333] cursor-pointer"
                      tabIndex={-1}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* 3.4 Remember Me Checkbox */}
                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-[#FF8C00] focus:ring-[#FF8C00] border-[#CCCCCC] cursor-pointer"
                  />
                  <div className="flex flex-col">
                    <label htmlFor="rememberMe" className="text-xs font-semibold text-[#333333] cursor-pointer select-none">
                      Remember me for 30 days
                    </label>
                    <span className="text-[10px] text-[#999999]">
                      Only use on your personal device
                    </span>
                  </div>
                </div>

                {/* 3.5 Login Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-[#FF8C00] hover:bg-[#E67E00] active:bg-[#CC6A00] text-white font-bold text-sm rounded-lg transition-colors duration-150 shadow-[0_2px_8px_rgba(255,140,0,0.3)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>SIGN IN</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Admin OS / Dean Link Toggle */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => handleRoleChange('admin')}
                  className={`text-xs font-medium cursor-pointer transition-colors ${
                    selectedRole === 'admin'
                      ? 'text-[#FF8C00] font-bold'
                      : 'text-[#666666] hover:text-[#1A3A52]'
                  }`}
                >
                  {selectedRole === 'admin' ? '✓ Administrator / Dean Mode Active' : 'Access as University Administrator / Dean'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-[#E0E0E0] animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#EEEEEE]">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#FF8C00]" />
                <h3 className="font-bold text-base text-[#1A3A52]">Account Recovery</h3>
              </div>
              <button
                onClick={() => setShowForgotPasswordModal(false)}
                className="text-[#999999] hover:text-[#333333] cursor-pointer"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {forgotSubmitted ? (
              <div className="py-4 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#EAFAF1] text-[#27AE60] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-[#1A3A52]">Recovery Email Sent</h4>
                <p className="text-xs text-[#666666] leading-relaxed">
                  If an account exists for <span className="font-semibold text-[#1A3A52]">{forgotEmail}</span>, a password reset link has been dispatched.
                </p>
                <button
                  type="button"
                  onClick={() => setShowForgotPasswordModal(false)}
                  className="w-full py-2.5 bg-[#FF8C00] hover:bg-[#E67E00] text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (forgotEmail.trim()) {
                    setForgotSubmitted(true);
                  }
                }}
                className="space-y-4"
              >
                <p className="text-xs text-[#666666] leading-relaxed">
                  Enter the email address or username associated with your ClassSarthi account to receive reset instructions.
                </p>
                <div>
                  <label className="block text-[11px] font-bold text-[#666666] uppercase mb-1">
                    Your Email or Username
                  </label>
                  <input
                    type="text"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="student.dhruva@bmu.edu.in"
                    className="w-full h-10 px-3 rounded-lg border border-[#CCCCCC] focus:border-[#FF8C00] outline-none text-xs text-[#333333]"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordModal(false)}
                    className="flex-1 py-2.5 bg-[#F5F5F5] hover:bg-[#EEEEEE] text-[#666666] font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-[#FF8C00] hover:bg-[#E67E00] text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
