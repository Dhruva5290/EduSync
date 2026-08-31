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
  Building,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Zap,
  Info
} from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: User, token: string) => void;
  allUsers?: User[];
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, allUsers: initialUsers }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [identifier, setIdentifier] = useState('student.dhruva');
  const [password, setPassword] = useState('EduSync@260101');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<User[]>(initialUsers || []);

  // Fetch updated registered users list from server
  React.useEffect(() => {
    fetch('/api/auth/public-users')
      .then(res => res.json())
      .then(data => {
        if (data?.users && Array.isArray(data.users)) {
          setRegisteredUsers(data.users);
        }
      })
      .catch(err => console.error('Failed to load registered users for login:', err));
  }, []);

  // Select any registered user from roster
  const handleSelectUser = (user: User) => {
    setSelectedRole(user.role);
    setIdentifier(user.username || user.institutionalId || user.email);
    setPassword(user.password || (user.role === 'admin' ? 'Dean@BMU2026!' : user.role === 'teacher' ? 'Teacher@ESS26' : 'EduSync@260101'));
    setErrorMessage(null);
  };

  // Quick preset loader
  const handleSelectRolePreset = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage(null);
    if (role === 'student') {
      setIdentifier('student.dhruva');
      setPassword('EduSync@260101');
    } else if (role === 'teacher') {
      setIdentifier('prof.sanmitra');
      setPassword('Teacher@ESS26');
    } else {
      setIdentifier('dean.maneek');
      setPassword('Dean@BMU2026!');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMessage('Please enter your Name, Username, or Email.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const effectivePass = password.trim() || (selectedRole === 'admin' ? 'Dean@BMU2026!' : selectedRole === 'teacher' ? 'Teacher@ESS26' : 'EduSync@260101');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password: effectivePass,
          role: selectedRole
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || 'Authentication failed. Please check your credentials.');
        setIsLoading(false);
        return;
      }

      // Save token and trigger callback
      if (data.token && data.user) {
        localStorage.setItem('edusync_token', data.token);
        localStorage.setItem('edusync_user_id', data.user.id);
        onLoginSuccess(data.user, data.token);
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMessage('Connection error. Please ensure the EduSync backend is active.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-purple-600 selection:text-white">
      {/* Dynamic Background Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="EduSync Logo"
            className="w-10 h-10 object-contain rounded-xl shadow-lg shadow-cyan-500/20 border border-slate-700/60"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">
                EduSync<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">.ai</span>
              </h1>
              <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-[10px] font-mono text-cyan-400 rounded-full">
                TechStorm 3.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400">BML Munjal University Academic Command OS</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-900/80 border border-slate-800 rounded-full text-xs text-slate-300">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Institutional RBAC Enforced</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Card Container */}
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-purple-950/20">
            {/* Header in Card */}
            <div className="text-center mb-6">
              <img
                src="/logo.png"
                alt="EduSync"
                className="w-16 h-16 object-contain mx-auto mb-3 rounded-2xl shadow-xl shadow-cyan-500/20 border border-slate-700/60"
              />
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                Sign in to your Portal
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Select your designated campus role to access your academic workspace.
              </p>
            </div>

            {/* Role Selector Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 mb-6">
              <button
                type="button"
                onClick={() => handleSelectRolePreset('student')}
                className={`py-2 px-1 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                  selectedRole === 'student'
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Student</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectRolePreset('teacher')}
                className={`py-2 px-1 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                  selectedRole === 'teacher'
                    ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>Faculty</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectRolePreset('admin')}
                className={`py-2 px-1 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                  selectedRole === 'admin'
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                <Building className="w-4 h-4" />
                <span>Dean / Reg.</span>
              </button>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl flex items-start gap-2.5 text-xs text-rose-200 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Username, Roll No. or Email</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {selectedRole === 'student' ? 'e.g. student.dhruva' : selectedRole === 'teacher' ? 'e.g. prof.sanmitra' : 'e.g. dean.maneek'}
                  </span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter username or email..."
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 font-mono transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Password</span>
                  <span className="text-[10px] text-slate-500 font-mono">Protected</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password..."
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 font-mono transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-950/50 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99]"
              >
                <span>{isLoading ? 'Verifying Credentials...' : `Enter ${selectedRole === 'admin' ? 'Registrar OS' : selectedRole === 'teacher' ? 'Faculty Portal' : 'Student Learning Hub'}`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Preloads Notice */}
            <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-purple-400" />
                  Instant Role Credentials
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {registeredUsers.length} Users Stored
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectRolePreset('student')}
                  className={`text-[11px] px-2.5 py-1.5 rounded-lg border font-mono transition-colors ${
                    selectedRole === 'student' && identifier === 'student.dhruva'
                      ? 'bg-blue-950 border-blue-700 text-blue-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  Student: Dhruva (260101)
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectRolePreset('teacher')}
                  className={`text-[11px] px-2.5 py-1.5 rounded-lg border font-mono transition-colors ${
                    selectedRole === 'teacher' && identifier === 'prof.sanmitra'
                      ? 'bg-emerald-950 border-emerald-700 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  Faculty: Dr. Sanmitra
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectRolePreset('admin')}
                  className={`text-[11px] px-2.5 py-1.5 rounded-lg border font-mono transition-colors ${
                    selectedRole === 'admin' && identifier === 'dean.maneek'
                      ? 'bg-purple-950 border-purple-700 text-purple-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  Dean: Dr. Maneek Singh
                </button>
              </div>

              {/* Roster of Registered Users Dropdown / Quick Selector */}
              {registeredUsers.length > 0 && (
                <div className="pt-2">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
                    Select From All Registered Users ({registeredUsers.length}):
                  </label>
                  <select
                    value={registeredUsers.find(u => u.username === identifier || u.institutionalId === identifier || u.email === identifier)?.id || ''}
                    onChange={(e) => {
                      const u = registeredUsers.find(user => user.id === e.target.value);
                      if (u) handleSelectUser(u);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
                  >
                    <option value="">-- Choose Registered User ({registeredUsers.length} available) --</option>
                    <optgroup label="Newly Registered & Custom Users">
                      {registeredUsers.filter(u => !['admin-1', 'admin-2', 'teacher-1', 'teacher-2', 'teacher-3', 'teacher-4', 'teacher-5', 'student-1', 'student-2'].includes(u.id)).map(u => (
                        <option key={u.id} value={u.id}>
                          ⭐ [{u.role.toUpperCase()}] {u.name} ({u.institutionalId || u.username}) · Pass: {u.password || 'EduSync@260101'}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Default Student Roster">
                      {registeredUsers.filter(u => u.role === 'student').map(u => (
                        <option key={u.id} value={u.id}>
                          [STUDENT] {u.name} ({u.institutionalId})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Faculty & Deans">
                      {registeredUsers.filter(u => u.role !== 'student').map(u => (
                        <option key={u.id} value={u.id}>
                          [{u.role.toUpperCase()}] {u.name}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              )}
            </div>

            {/* Governance Policy Footer in Card */}
            <div className="mt-5 p-3 bg-slate-950/60 border border-slate-800/60 rounded-xl flex items-start gap-2 text-[11px] text-slate-400">
              <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-200">Registration Policy:</strong> Only Deans and Registrars can register new students and faculty. Credentials for all faculty & students are maintained securely in the Registrar Dashboard.
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-slate-500 border-t border-slate-900">
        <p>© 2026 EduSync.ai · BML Munjal University · TechStorm 3.0 Entry</p>
      </footer>
    </div>
  );
};
