import React, { useState } from 'react';
import { User, Subject } from '../../types';
import {
  Users,
  GraduationCap,
  BookOpen,
  UserPlus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Building,
  Mail,
  Phone,
  Shield,
  Layers,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  FolderPlus,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Award,
  Building2,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Lock,
  User as UserIcon
} from 'lucide-react';

interface AdminDashboardProps {
  currentUser: User;
  allUsers: User[];
  subjects: Subject[];
  onRefreshUsers: () => void;
  onRefreshSubjects: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  allUsers,
  subjects,
  onRefreshUsers,
  onRefreshSubjects,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'register' | 'directory' | 'courses'>('register');
  const [registerRole, setRegisterRole] = useState<'student' | 'teacher' | 'admin'>('student');

  // Search & Filters for directory
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'teacher' | 'admin'>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');

  // Registration Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [revealedPasswordUserIds, setRevealedPasswordUserIds] = useState<Record<string, boolean>>({});
  const [department, setDepartment] = useState('Department of Computer Science & Engineering');
  const [program, setProgram] = useState('B.Tech Computer Science and Engineering');
  const [gender, setGender] = useState('Male');
  const [academicYear, setAcademicYear] = useState('1st Year (Semester 1)');
  const [designation, setDesignation] = useState('Assistant Professor');
  const [officeLocation, setOfficeLocation] = useState('Academic Block B - Room 312');
  const [officeHours, setOfficeHours] = useState('Mon/Wed 14:00 - 16:00');
  const [phone, setPhone] = useState('+91 98110 24590');
  const [gpa, setGpa] = useState('8.45');
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Course Modal / Form State
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  const [courseTeacherId, setCourseTeacherId] = useState('');
  const [courseRoom, setCourseRoom] = useState('Academic Block A - Room 102');
  const [courseSemester, setCourseSemester] = useState('Fall 2026 (Semester 1)');
  const [courseCredits, setCourseCredits] = useState('4');
  const [courseColor, setCourseColor] = useState('indigo');
  const [courseTopicsText, setCourseTopicsText] = useState('Foundational Principles & Concepts\nMid-term Laboratory Experiments\nAdvanced Problem Sets & Case Studies\nFinal Capstone & Viva Defense');
  const [courseEnrolledStudentIds, setCourseEnrolledStudentIds] = useState<string[]>([]);

  // Assign Classes Modal for user in directory
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editSubjectIds, setEditSubjectIds] = useState<string[]>([]);

  const studentsList = allUsers.filter(u => u.role === 'student');
  const teachersList = allUsers.filter(u => u.role === 'teacher');
  const totalEnrolledSpots = subjects.reduce((sum, s) => sum + (s.enrolledCount || 0), 0);

  // Filtered directory list
  const filteredUsers = allUsers.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (deptFilter !== 'all' && !u.department.toLowerCase().includes(deptFilter.toLowerCase())) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.institutionalId.toLowerCase().includes(q) ||
        (u.username && u.username.toLowerCase().includes(q)) ||
        u.department.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Handle Registration Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      onShowToast('Name and Institutional Email are required.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        password: password.trim() || undefined,
        role: registerRole,
        department,
        program: registerRole === 'student' ? program : undefined,
        gender,
        academicYear: registerRole === 'student' ? academicYear : undefined,
        designation: registerRole !== 'student' ? designation : undefined,
        officeLocation: registerRole !== 'student' ? officeLocation : undefined,
        officeHours: registerRole !== 'student' ? officeHours : undefined,
        phone,
        gpa: registerRole === 'student' ? Number(gpa) || 8.2 : undefined,
        initialSubjectIds: registerRole === 'student' ? selectedSubjectIds : [],
        teachingSubjectIds: registerRole === 'teacher' ? selectedSubjectIds : []
      };

      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        onShowToast(`Successfully registered ${data.user.name} (${data.user.institutionalId}) at BML Munjal University! Assigned Password: ${data.user.password}`, 'success');
        // Reset form
        setName('');
        setEmail('');
        setPassword('');
        setSelectedSubjectIds([]);
        onRefreshUsers();
        onRefreshSubjects();
      } else {
        const err = await res.json();
        onShowToast(err.error || 'Failed to register user.', 'error');
      }
    } catch (err) {
      console.error(err);
      onShowToast('Network error during registration.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Create Course Submit
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode.trim() || !courseName.trim()) {
      onShowToast('Course code and course name are required.', 'error');
      return;
    }

    try {
      const topics = courseTopicsText
        .split('\n')
        .map(t => t.trim())
        .filter(Boolean);

      const payload = {
        code: courseCode.trim().toUpperCase(),
        name: courseName.trim(),
        description: courseDesc.trim(),
        teacherId: courseTeacherId || (teachersList[0]?.id || 'teacher-cpc'),
        room: courseRoom,
        semester: courseSemester,
        credits: Number(courseCredits) || 4,
        color: courseColor,
        syllabusTopics: topics,
        initialEnrolledStudentIds: courseEnrolledStudentIds
      };

      const res = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const created = await res.json();
        onShowToast(`New course ${created.code} (${created.name}) created and enrolled ${courseEnrolledStudentIds.length} students!`, 'success');
        setShowCourseModal(false);
        setCourseCode('');
        setCourseName('');
        setCourseDesc('');
        setCourseEnrolledStudentIds([]);
        onRefreshSubjects();
        onRefreshUsers();
      } else {
        const err = await res.json();
        onShowToast(err.error || 'Failed to create course.', 'error');
      }
    } catch (err) {
      console.error(err);
      onShowToast('Error creating course.', 'error');
    }
  };

  // Handle Save User Enrollments
  const handleSaveUserEnrollments = async () => {
    if (!editingUser) return;
    try {
      let res;
      if (editingUser.role === 'student') {
        res = await fetch(`/api/students/${editingUser.id}/assign-classes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subjectIds: editSubjectIds })
        });
      } else {
        res = await fetch(`/api/users/${editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ teachingSubjectIds: editSubjectIds })
        });
      }

      if (res.ok) {
        onShowToast(`Updated course allocations for ${editingUser.name}`, 'success');
        setEditingUser(null);
        onRefreshUsers();
        onRefreshSubjects();
      } else {
        onShowToast('Failed to update enrollments', 'error');
      }
    } catch (err) {
      console.error(err);
      onShowToast('Error updating course assignments', 'error');
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to remove ${userName} from the institution directory?`)) return;
    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        onShowToast(`Unregistered ${userName}`, 'success');
        onRefreshUsers();
        onRefreshSubjects();
      } else {
        onShowToast('Failed to remove user', 'error');
      }
    } catch (err) {
      console.error(err);
      onShowToast('Error unregistering user', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Institutional Metrics */}
      <div className="bg-slate-900 rounded-md border border-slate-800 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-mono font-bold rounded-sm uppercase tracking-wide">
                BML Munjal University · Registrar & Academic Welfare
              </span>
              <span className="text-xs text-slate-400 font-mono">Academic Term: 2026-27 (1st Year)</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight mt-1">
              Institutional Administration & Identity Provisioning
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Dean: Dr. Maneek Singh · Associate Dean: Dr. Kiran Khatter · Manage B.Tech student admissions, faculty appointments & curriculum rosters.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('register');
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-sm text-xs font-semibold shadow-xs transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Register User
            </button>
            <button
              onClick={() => setShowCourseModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-sm text-xs font-semibold shadow-xs transition-colors"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              Create Class
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div className="bg-slate-950 p-3 rounded-sm border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Registered Students</span>
              <GraduationCap className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-1">{studentsList.length}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">1st Year B.Tech Enrollees</p>
          </div>

          <div className="bg-slate-950 p-3 rounded-sm border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Faculty Members</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-1">{teachersList.length}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Active Professors & Doctors</p>
          </div>

          <div className="bg-slate-950 p-3 rounded-sm border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Curriculum Subjects</span>
              <BookOpen className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-1">{subjects.length}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{totalEnrolledSpots} Subject Enrollments</p>
          </div>

          <div className="bg-slate-950 p-3 rounded-sm border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Security & RBAC</span>
              <Shield className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-sm font-bold text-emerald-400 mt-1">Institutional Active</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Role Governance Enforced</p>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('register')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-sm transition-all ${
            activeTab === 'register'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Registration & Provisioning Center</span>
        </button>

        <button
          onClick={() => setActiveTab('directory')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-sm transition-all ${
            activeTab === 'directory'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Master University Directory ({allUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('courses')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-sm transition-all ${
            activeTab === 'courses'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Curriculum Offerings & Rosters ({subjects.length})</span>
        </button>
      </div>

      {/* TAB 1: REGISTRATION & PROVISIONING */}
      {activeTab === 'register' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form */}
          <div className="lg:col-span-8 bg-slate-900 rounded-md border border-slate-800 p-5 shadow-sm text-slate-100">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                  New Institutional Identity Provisioning
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Issue BML Munjal University roll numbers, credentials, and subject enrollments.
                </p>
              </div>

              {/* Role Picker */}
              <div className="flex p-1 bg-slate-950 rounded-sm border border-slate-800">
                <button
                  type="button"
                  onClick={() => setRegisterRole('student')}
                  className={`px-3 py-1 text-xs font-bold rounded-xs transition-colors ${
                    registerRole === 'student' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRegisterRole('teacher')}
                  className={`px-3 py-1 text-xs font-bold rounded-xs transition-colors ${
                    registerRole === 'teacher' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Faculty
                </button>
                <button
                  type="button"
                  onClick={() => setRegisterRole('admin')}
                  className={`px-3 py-1 text-xs font-bold rounded-xs transition-colors ${
                    registerRole === 'admin' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Admin / Registrar
                </button>
              </div>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Full Legal Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={registerRole === 'student' ? 'e.g. Dhruva' : 'e.g. Dr. Raghav Singhal'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-sm text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Institutional Email (@bmu.edu.in) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder={registerRole === 'student' ? 'student.bmu@bmu.edu.in' : 'faculty.bmu@bmu.edu.in'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-sm text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
                    <span>Initial Password</span>
                    <span className="text-[10px] text-purple-400 font-mono">Optional</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Auto-generated if left blank"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-sm text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Academic Department <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-sm text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  >
                    <option value="Department of Computer Sciences">Department of Computer Sciences</option>
                    <option value="Department of Environmental Sciences">Department of Environmental Sciences</option>
                    <option value="Dept of Computational Sciences">Dept of Computational Sciences</option>
                    <option value="Dept of Mechanical Engineering">Dept of Mechanical Engineering</option>
                    <option value="Department of Computer Engineering">Department of Computer Engineering</option>
                    <option value="Department of Academic Welfare">Department of Academic Welfare</option>
                  </select>
                </div>

                {registerRole === 'student' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Course / Program</label>
                    <select
                      value={program}
                      onChange={(e) => setProgram(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-sm text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                    >
                      <option value="B.Tech Computer Science and Engineering">B.Tech Computer Science and Engineering</option>
                      <option value="B.Tech Electronics & Computer Engineering">B.Tech Electronics & Computer Engineering</option>
                      <option value="B.Tech Mechanical Engineering">B.Tech Mechanical Engineering</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Faculty Designation</label>
                    <input
                      type="text"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      placeholder="e.g. Professor & Head of Department"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-sm text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Indian Contact Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-sm text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-sm text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                {registerRole === 'student' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">GPA (Out of 10.0)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.0"
                      max="10.0"
                      value={gpa}
                      onChange={(e) => setGpa(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-sm text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Office Location</label>
                    <input
                      type="text"
                      value={officeLocation}
                      onChange={(e) => setOfficeLocation(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-sm text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                )}
              </div>

              {/* Course Allocation Checkboxes */}
              <div className="pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-300">
                    {registerRole === 'student'
                      ? 'Initial Subject Enrollments (Assign 1st Year Classes)'
                      : 'Assigned Teaching Classes'}
                  </label>
                  <span className="text-[11px] text-purple-400 font-mono">
                    {selectedSubjectIds.length} subjects selected
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto p-1 bg-slate-950 rounded-sm border border-slate-800">
                  {subjects.map((subj) => {
                    const isChecked = selectedSubjectIds.includes(subj.id);
                    return (
                      <label
                        key={subj.id}
                        className={`flex items-start gap-2.5 p-2.5 rounded-sm border cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-purple-950/60 border-purple-700 text-white'
                            : 'bg-slate-900 border-slate-800 hover:bg-slate-800/60 text-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSubjectIds([...selectedSubjectIds, subj.id]);
                            } else {
                              setSelectedSubjectIds(selectedSubjectIds.filter(id => id !== subj.id));
                            }
                          }}
                          className="mt-0.5 rounded-xs text-purple-600 focus:ring-purple-500 bg-slate-950 border-slate-700"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold truncate text-white">{subj.code}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{subj.credits || 4} Cr</span>
                          </div>
                          <p className="text-[11px] text-slate-300 truncate">{subj.name}</p>
                          <p className="text-[10px] text-purple-400 font-mono truncate">{subj.teacherName}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-sm text-xs font-bold shadow-xs transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isSubmitting ? 'Registering...' : `Register & Issue ${registerRole.toUpperCase()} ID`}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Info Box */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-900 rounded-md border border-slate-800 p-4 shadow-sm text-slate-100">
              <h4 className="text-xs font-bold text-white uppercase tracking-wide flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-400" />
                BML Munjal Governance
              </h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                When a student or faculty identity is registered, EduSync automatically:
              </p>
              <ul className="space-y-2 mt-3 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Issues unique Roll No: <strong className="text-white font-mono">2026BMU-CSE...</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Enrolls student across all 5 common 1st year engineering subjects.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Grants Gemini AI syllabus assistant & assignment sandbox permissions.</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-950 border border-slate-800 text-white rounded-md p-4 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wide text-purple-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Role Switcher Integration
              </h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Newly registered students, faculty, or admins appear immediately in the top navigation profile switcher.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MASTER DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="bg-slate-900 rounded-md border border-slate-800 p-5 shadow-sm space-y-4 text-slate-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                BML Munjal University Master Directory
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Search students, faculty, dean offices, inspect GPA performances, and update class allocations.
              </p>
            </div>

            {/* Search & Filter bar */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search name, roll no, department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-sm text-xs text-slate-200 focus:outline-none focus:border-purple-500 w-56 placeholder:text-slate-500"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-sm text-xs font-semibold text-slate-200 focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="all">All Roles ({allUsers.length})</option>
                <option value="student">Students ({studentsList.length})</option>
                <option value="teacher">Faculty ({teachersList.length})</option>
                <option value="admin">Deans & Admins</option>
              </select>

              <button
                onClick={onRefreshUsers}
                title="Refresh Directory"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-sm border border-slate-700"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Directory Cards Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Identity & Account</th>
                  <th className="py-2.5 px-3">Role & Roll / ID</th>
                  <th className="py-2.5 px-3">Credentials & Security</th>
                  <th className="py-2.5 px-3">Department & Academic Program</th>
                  <th className="py-2.5 px-3">Contact & Phone</th>
                  <th className="py-2.5 px-3">Subject Enrollments</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredUsers.map((user) => {
                  const userSubjects = subjects.filter(s =>
                    user.role === 'teacher'
                      ? user.teachingSubjectIds?.includes(s.id) || s.teacherId === user.id
                      : user.enrolledSubjectIds?.includes(s.id)
                  );
                  const isDhruva = user.name.toLowerCase().includes('dhruva');

                  return (
                    <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          {/* Monogram Badge (no face photo) */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border ${
                            user.role === 'admin'
                              ? 'bg-purple-950 text-purple-300 border-purple-700'
                              : user.role === 'teacher'
                              ? 'bg-blue-950 text-blue-300 border-blue-700'
                              : isDhruva
                              ? 'bg-amber-950 text-amber-300 border-amber-600'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}>
                            {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-white">{user.name}</p>
                              {isDhruva && (
                                <span className="px-1.5 py-0.2 bg-amber-950 text-amber-300 border border-amber-700 text-[9px] font-bold rounded-xs">
                                  Top Rank
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 font-mono">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="space-y-1">
                          <span
                            className={`inline-block text-[9px] px-1.5 py-0.5 rounded-sm font-bold uppercase border ${
                              user.role === 'admin'
                                ? 'bg-purple-950 text-purple-300 border-purple-800'
                                : user.role === 'teacher'
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                : 'bg-blue-950 text-blue-300 border-blue-800'
                            }`}
                          >
                            {user.role}
                          </span>
                          <p className="text-[10px] font-mono text-slate-400">{user.institutionalId}</p>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 font-mono text-[11px] text-purple-300">
                            <UserIcon className="w-3 h-3 text-purple-400 shrink-0" />
                            <span className="truncate max-w-[120px]">{user.username || user.email.split('@')[0]}</span>
                          </div>
                          <div className="flex items-center gap-1 font-mono text-[10px] text-slate-300">
                            <KeyRound className="w-3 h-3 text-slate-500 shrink-0" />
                            <span className="font-semibold text-slate-200">
                              {revealedPasswordUserIds[user.id] ? (user.password || 'EduSync@2026') : '••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => setRevealedPasswordUserIds(prev => ({ ...prev, [user.id]: !prev[user.id] }))}
                              className="text-slate-400 hover:text-white p-0.5"
                              title={revealedPasswordUserIds[user.id] ? 'Hide password' : 'Show password'}
                            >
                              {revealedPasswordUserIds[user.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(`User: ${user.username || user.email}\nPass: ${user.password || 'EduSync@2026'}`);
                                onShowToast(`Copied credentials for ${user.name}`);
                              }}
                              className="text-slate-400 hover:text-purple-300 p-0.5"
                              title="Copy credentials"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div>
                          <p className="text-slate-200 font-medium">{user.department}</p>
                          {user.role === 'student' && (
                            <p className="text-[10px] text-slate-400 font-mono">
                              {user.program || 'B.Tech CSE'} · CGPA: <strong className={isDhruva ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>{user.gpa?.toFixed(2) || '8.50'}</strong>
                            </p>
                          )}
                          {user.role === 'teacher' && (
                            <p className="text-[10px] text-slate-400 font-mono">
                              {user.designation || 'Faculty'} · {user.officeLocation || 'Faculty Block'}
                            </p>
                          )}
                          {user.role === 'admin' && (
                            <p className="text-[10px] text-purple-400 font-mono">
                              {user.designation || 'Dean'}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="text-[11px] text-slate-300 font-mono">{user.phone}</span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {userSubjects.length > 0 ? (
                            userSubjects.map(s => (
                              <span
                                key={s.id}
                                className="px-1.5 py-0.5 bg-slate-950 text-slate-300 border border-slate-800 rounded-xs text-[10px] font-mono font-semibold"
                              >
                                {s.code}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-500 italic">No classes assigned</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setEditSubjectIds(
                                user.role === 'teacher'
                                  ? user.teachingSubjectIds || []
                                  : user.enrolledSubjectIds || []
                              );
                            }}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-sm text-[11px] flex items-center gap-1 border border-slate-700 transition-colors"
                          >
                            <Edit2 className="w-3 h-3 text-blue-400" />
                            <span>Classes</span>
                          </button>

                          {user.id !== currentUser.id && (
                            <button
                              onClick={() => handleDeleteUser(user.id, user.name)}
                              title="Unregister user"
                              className="p-1 hover:bg-rose-950 text-slate-500 hover:text-rose-400 rounded-sm transition-colors border border-transparent hover:border-rose-800"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: COURSE OFFERINGS & ROSTERS */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900 rounded-md border border-slate-800 p-4 shadow-sm text-slate-100">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                BML Munjal University 1st Year Curriculum ({subjects.length} Active Subjects)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Common foundational engineering curriculum across B.Tech Computer Science, Electronics & Mechanical.
              </p>
            </div>

            <button
              onClick={() => setShowCourseModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-sm text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Create New Subject
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subj) => {
              const enrolledStudents = studentsList.filter(s => s.enrolledSubjectIds?.includes(subj.id));

              return (
                <div
                  key={subj.id}
                  className="bg-slate-900 rounded-md border border-slate-800 p-4 shadow-sm flex flex-col justify-between hover:border-slate-700 transition-all text-slate-100"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="px-2 py-0.5 bg-slate-950 text-blue-400 text-[10px] font-mono font-bold rounded-sm border border-slate-800">
                          {subj.code}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-1">{subj.name}</h4>
                      </div>
                      <span className="px-2 py-0.5 bg-purple-950 text-purple-300 text-[10px] font-bold rounded-sm border border-purple-800 font-mono shrink-0">
                        {subj.credits || 4} Credits
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2">{subj.description}</p>

                    <div className="space-y-1 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-blue-400" />
                        <span>Teacher: <strong className="text-slate-200">{subj.teacherName}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>Room: {subj.room} · {subj.semester}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Enrolled Students: <strong className="text-emerald-400 font-bold">{enrolledStudents.length} / 15</strong></span>
                      </div>
                    </div>

                    {/* Enrolled students monogram row */}
                    <div className="pt-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Class Roster Preview
                      </p>
                      <div className="flex items-center -space-x-1.5 overflow-hidden py-1">
                        {enrolledStudents.slice(0, 6).map((s) => (
                          <div
                            key={s.id}
                            title={`${s.name} (${s.institutionalId})`}
                            className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-200 ring-2 ring-slate-900 border border-slate-700"
                          >
                            {s.name.slice(0, 1)}
                          </div>
                        ))}
                        {enrolledStudents.length > 6 && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-950 text-[10px] font-bold text-slate-400 ring-2 ring-slate-900 border border-slate-800">
                            +{enrolledStudents.length - 6}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CREATE COURSE MODAL */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-md max-w-xl w-full p-6 shadow-2xl border border-slate-800 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Create New Course / Subject Offering</h3>
                <p className="text-xs text-slate-400 mt-0.5">BML Munjal University · Define curriculum syllabus, faculty, and student roster.</p>
              </div>
              <button
                onClick={() => setShowCourseModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Course Code <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PHY-101"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-sm text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Academic Credits
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={courseCredits}
                    onChange={(e) => setCourseCredits(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-sm text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Subject Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Semiconductor Physics & Quantum Mechanics"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-sm text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Course scope, objectives, and laboratory requirements..."
                  value={courseDesc}
                  onChange={(e) => setCourseDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-sm text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Assigned Teacher</label>
                  <select
                    value={courseTeacherId}
                    onChange={(e) => setCourseTeacherId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-sm text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-semibold"
                  >
                    {teachersList.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Classroom / Lab</label>
                  <input
                    type="text"
                    value={courseRoom}
                    onChange={(e) => setCourseRoom(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-sm text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Syllabus Topics (One per line for RAG AI Grounding)
                </label>
                <textarea
                  rows={3}
                  value={courseTopicsText}
                  onChange={(e) => setCourseTopicsText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-sm text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Initial Enrolled Students Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Initial Student Enrollments ({courseEnrolledStudentIds.length} selected)
                </label>
                <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto p-2 bg-slate-950 rounded-sm border border-slate-800">
                  {studentsList.map((s) => {
                    const isSelected = courseEnrolledStudentIds.includes(s.id);
                    return (
                      <label
                        key={s.id}
                        className="flex items-center gap-2 p-1 text-xs cursor-pointer hover:bg-slate-800 rounded-xs text-slate-200"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setCourseEnrolledStudentIds([...courseEnrolledStudentIds, s.id]);
                            } else {
                              setCourseEnrolledStudentIds(courseEnrolledStudentIds.filter(id => id !== s.id));
                            }
                          }}
                          className="rounded-xs text-purple-600 focus:ring-purple-500 bg-slate-900 border-slate-700"
                        />
                        <span className="truncate">{s.name} ({s.institutionalId})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-sm text-xs font-bold shadow-xs"
                >
                  Create & Publish Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER CLASSES MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-md max-w-md w-full p-5 shadow-2xl border border-slate-800 animate-in fade-in duration-150 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Manage Class Enrollments for {editingUser.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{editingUser.institutionalId} · {editingUser.role.toUpperCase()}</p>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-2 max-h-72 overflow-y-auto">
              {subjects.map((subj) => {
                const isSelected = editSubjectIds.includes(subj.id);
                return (
                  <label
                    key={subj.id}
                    className={`flex items-center justify-between p-2.5 rounded-sm border cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-purple-950/70 border-purple-700 text-white'
                        : 'bg-slate-950 border-slate-800 hover:bg-slate-800/70 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditSubjectIds([...editSubjectIds, subj.id]);
                          } else {
                            setEditSubjectIds(editSubjectIds.filter(id => id !== subj.id));
                          }
                        }}
                        className="rounded-xs text-purple-600 focus:ring-purple-500 bg-slate-900 border-slate-700"
                      />
                      <div>
                        <p className="text-xs font-bold text-white">{subj.code} · {subj.name}</p>
                        <p className="text-[10px] text-slate-400">Teacher: {subj.teacherName}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded-xs text-slate-300">
                      {subj.credits || 4} Cr
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveUserEnrollments}
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-sm text-xs font-bold shadow-xs"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
