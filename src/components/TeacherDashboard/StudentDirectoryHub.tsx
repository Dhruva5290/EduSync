import React, { useState } from 'react';
import { User, Subject } from '../../types';
import {
  Users,
  GraduationCap,
  BookOpen,
  Search,
  Filter,
  Plus,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Mail,
  Phone,
  FolderPlus,
  Layers,
  Award,
  Calendar,
  CheckSquare,
  Square,
  Sparkles,
  ChevronRight,
  Building2
} from 'lucide-react';

interface StudentDirectoryHubProps {
  currentUser: User;
  allUsers: User[];
  subjects: Subject[];
  activeSubjectId: string;
  onRefreshUsers: () => void;
  onRefreshSubjects: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

export const StudentDirectoryHub: React.FC<StudentDirectoryHubProps> = ({
  currentUser,
  allUsers,
  subjects,
  activeSubjectId,
  onRefreshUsers,
  onRefreshSubjects,
  onShowToast
}) => {
  const [scopeFilter, setScopeFilter] = useState<'all' | 'my-classes'>('my-classes');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Modals
  const [assignModalStudent, setAssignModalStudent] = useState<User | null>(null);
  const [assignModalSubjectIds, setAssignModalSubjectIds] = useState<string[]>([]);
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [showBatchAssignModal, setShowBatchAssignModal] = useState(false);
  const [batchTargetSubjectId, setBatchTargetSubjectId] = useState<string>('');

  // Create Class Form State
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newRoom, setNewRoom] = useState('Academic Block A - Room 204');
  const [newSemester, setNewSemester] = useState('Fall 2026 (Semester 1)');
  const [newCredits, setNewCredits] = useState('4');
  const [newTopics, setNewTopics] = useState('Introduction & Foundational Concepts\nApplied Laboratory Practicals\nMidterm Milestones & Algorithms\nAdvanced Problem Sets & Defense');
  const [isCreatingClass, setIsCreatingClass] = useState(false);

  // All student users
  const allStudents = allUsers.filter(u => u.role === 'student');

  // Teacher's owned subjects
  const mySubjects = subjects.filter(s =>
    s.teacherId === currentUser.id || currentUser.teachingSubjectIds?.includes(s.id)
  );

  // Filter students based on scope, search, and subject filter
  const filteredStudents = allStudents.filter(student => {
    // Scope filter
    if (scopeFilter === 'my-classes') {
      const isEnrolledInMyClasses = mySubjects.some(s => student.enrolledSubjectIds?.includes(s.id));
      if (!isEnrolledInMyClasses) return false;
    }

    // Specific subject filter
    if (selectedSubjectFilter !== 'all') {
      if (!student.enrolledSubjectIds?.includes(selectedSubjectFilter)) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        student.name.toLowerCase().includes(q) ||
        student.email.toLowerCase().includes(q) ||
        student.institutionalId.toLowerCase().includes(q) ||
        student.department.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Handle single student class assignment
  const handleSaveStudentClasses = async () => {
    if (!assignModalStudent) return;
    try {
      const res = await fetch(`/api/students/${assignModalStudent.id}/assign-classes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectIds: assignModalSubjectIds })
      });

      if (res.ok) {
        onShowToast(`Updated course schedule for ${assignModalStudent.name}`, 'success');
        setAssignModalStudent(null);
        onRefreshUsers();
        onRefreshSubjects();
      } else {
        onShowToast('Failed to assign classes to student', 'error');
      }
    } catch (err) {
      console.error(err);
      onShowToast('Error updating student classes', 'error');
    }
  };

  // Handle Batch Class Assignment
  const handleExecuteBatchAssign = async () => {
    if (!batchTargetSubjectId || selectedStudentIds.length === 0) {
      onShowToast('Select a target class and at least one student.', 'error');
      return;
    }

    try {
      const res = await fetch(`/api/subjects/${batchTargetSubjectId}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentIds: selectedStudentIds })
      });

      if (res.ok) {
        const data = await res.json();
        const targetSubj = subjects.find(s => s.id === batchTargetSubjectId);
        onShowToast(
          `Enrolled ${data.newlyEnrolled || selectedStudentIds.length} students into ${targetSubj?.code || 'class'}!`,
          'success'
        );
        setShowBatchAssignModal(false);
        setSelectedStudentIds([]);
        onRefreshUsers();
        onRefreshSubjects();
      } else {
        onShowToast('Failed to enroll students in batch', 'error');
      }
    } catch (err) {
      console.error(err);
      onShowToast('Error during batch enrollment', 'error');
    }
  };

  // Handle Teacher Creating a New Class
  const handleCreateNewClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim()) {
      onShowToast('Course code and title are required', 'error');
      return;
    }

    setIsCreatingClass(true);
    try {
      const topics = newTopics
        .split('\n')
        .map(t => t.trim())
        .filter(Boolean);

      const payload = {
        code: newCode.trim().toUpperCase(),
        name: newName.trim(),
        description: newDesc.trim(),
        teacherId: currentUser.id,
        room: newRoom,
        semester: newSemester,
        credits: Number(newCredits) || 4,
        color: 'emerald',
        syllabusTopics: topics,
        initialEnrolledStudentIds: selectedStudentIds
      };

      const res = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const created = await res.json();
        onShowToast(
          `Created class ${created.code} (${created.name}) and enrolled ${selectedStudentIds.length} students!`,
          'success'
        );
        setShowCreateClassModal(false);
        setNewCode('');
        setNewName('');
        setNewDesc('');
        setSelectedStudentIds([]);
        onRefreshSubjects();
        onRefreshUsers();
      } else {
        const err = await res.json();
        onShowToast(err.error || 'Failed to create class', 'error');
      }
    } catch (err) {
      console.error(err);
      onShowToast('Network error creating class', 'error');
    } finally {
      setIsCreatingClass(false);
    }
  };

  // Toggle selection for all filtered students
  const handleToggleSelectAll = () => {
    if (selectedStudentIds.length === filteredStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map(s => s.id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 rounded-md border border-slate-800 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-blue-950 text-blue-400 border border-blue-800 text-[10px] font-mono font-bold rounded-sm uppercase tracking-wide">
                BML Munjal University · Faculty Roster
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {mySubjects.length} Courses Taught by {currentUser.name}
              </span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight mt-1">
              Student Directory & Academic Class Allocator
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Inspect student performance, track institutional profiles, assign course enrollments, or create new class offerings.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {selectedStudentIds.length > 0 && (
              <button
                onClick={() => {
                  setBatchTargetSubjectId(mySubjects[0]?.id || subjects[0]?.id || '');
                  setShowBatchAssignModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-sm text-xs font-semibold shadow-xs transition-colors animate-in fade-in"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                Assign ({selectedStudentIds.length}) to Class...
              </button>
            )}

            <button
              onClick={() => setShowCreateClassModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-sm text-xs font-semibold shadow-xs transition-colors"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              Give New Class
            </button>
          </div>
        </div>

        {/* Quick Scope Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-4 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex p-1 bg-slate-950 rounded-sm border border-slate-800">
              <button
                onClick={() => setScopeFilter('my-classes')}
                className={`px-3 py-1 text-xs font-bold rounded-xs transition-colors ${
                  scopeFilter === 'my-classes'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Enrolled in My Classes
              </button>
              <button
                onClick={() => setScopeFilter('all')}
                className={`px-3 py-1 text-xs font-bold rounded-xs transition-colors ${
                  scopeFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All 1st Year Students ({allStudents.length})
              </button>
            </div>

            {/* Course Dropdown Filter */}
            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-sm text-xs font-semibold text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Course Rosters</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.code} · {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search students by name, roll no, or branch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-sm text-xs text-slate-200 focus:outline-none focus:border-blue-500 w-64 placeholder:text-slate-500"
            />
          </div>
        </div>
      </div>

      {/* Student Cards & Directory List */}
      <div className="bg-slate-900 rounded-md border border-slate-800 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleSelectAll}
              className="flex items-center gap-1.5 font-semibold text-slate-300 hover:text-blue-400"
            >
              {selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-blue-500" />
              ) : (
                <Square className="w-4 h-4 text-slate-500" />
              )}
              <span>Select All ({filteredStudents.length} Students)</span>
            </button>
          </div>

          <span className="font-mono text-[11px] text-slate-400">
            Showing {filteredStudents.length} of {allStudents.length} BML Munjal Univ students
          </span>
        </div>

        {/* Student Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {filteredStudents.map((student) => {
            const isSelected = selectedStudentIds.includes(student.id);
            const studentSubjects = subjects.filter(s => student.enrolledSubjectIds?.includes(s.id));
            const isEnrolledInMyClass = mySubjects.some(s => student.enrolledSubjectIds?.includes(s.id));
            const isDhruva = student.name.toLowerCase().includes('dhruva');

            return (
              <div
                key={student.id}
                className={`rounded-md border p-4 shadow-xs transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-950/40 border-blue-600 ring-1 ring-blue-500'
                    : isDhruva
                    ? 'bg-slate-900 border-amber-500/40 hover:border-amber-400'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Row: Checkbox, Avatar Monogram, Name & GPA */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <button
                        onClick={() => {
                          if (isSelected) {
                            setSelectedStudentIds(selectedStudentIds.filter(id => id !== student.id));
                          } else {
                            setSelectedStudentIds([...selectedStudentIds, student.id]);
                          }
                        }}
                        className="mt-1 text-slate-500 hover:text-blue-400"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-blue-400" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>

                      {/* Monogram Badge (No external face images) */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border ${
                        isDhruva
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                      }`}>
                        {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-white">{student.name}</h4>
                          {isDhruva && (
                            <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold rounded-xs">
                              #1 Rank
                            </span>
                          )}
                          {isEnrolledInMyClass && !isDhruva && (
                            <span
                              title="Enrolled in your course"
                              className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"
                            />
                          )}
                        </div>
                        <p className="text-[10px] text-blue-400 font-mono">Roll: {student.institutionalId}</p>
                        <p className="text-[11px] text-slate-300 font-medium truncate max-w-[150px]">
                          {student.department}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold rounded-sm border ${
                        isDhruva
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}>
                        <Award className="w-3 h-3 text-emerald-400" />
                        {student.gpa ? `${student.gpa.toFixed(2)} GPA` : '8.50 GPA'}
                      </span>
                      <p className="text-[10px] text-slate-400 font-mono mt-1">
                        {student.academicYear || '1st Year'}
                      </p>
                    </div>
                  </div>

                  {/* Academic Enrolled Classes */}
                  <div className="pt-2 border-t border-slate-800">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Enrolled Subjects ({studentSubjects.length})
                    </p>
                    <div className="flex flex-wrap gap-1 min-h-[28px]">
                      {studentSubjects.length > 0 ? (
                        studentSubjects.map(s => {
                          const isMine = mySubjects.some(ms => ms.id === s.id);
                          return (
                            <span
                              key={s.id}
                              className={`px-1.5 py-0.5 rounded-xs text-[10px] font-mono font-semibold border ${
                                isMine
                                  ? 'bg-blue-950 text-blue-300 border-blue-700 font-bold'
                                  : 'bg-slate-950 text-slate-300 border-slate-800'
                              }`}
                              title={`${s.name} (Prof. ${s.teacherName})`}
                            >
                              {s.code}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">No enrolled classes</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Card Actions */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800">
                  <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2">
                    <span>{student.phone}</span>
                  </div>

                  <button
                    onClick={() => {
                      setAssignModalStudent(student);
                      setAssignModalSubjectIds(student.enrolledSubjectIds || []);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-sm text-xs font-semibold transition-colors"
                  >
                    <Edit2 className="w-3 h-3 text-blue-400" />
                    <span>Assign Classes</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL 1: SINGLE STUDENT ASSIGN CLASSES */}
      {assignModalStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-md max-w-md w-full p-5 shadow-2xl border border-slate-800 animate-in fade-in duration-150 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Course Allocations for {assignModalStudent.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Roll No: {assignModalStudent.institutionalId} · {assignModalStudent.department}
                </p>
              </div>
              <button
                onClick={() => setAssignModalStudent(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="py-3 space-y-2 max-h-72 overflow-y-auto">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                Available Courses ({subjects.length})
              </p>

              {subjects.map((subj) => {
                const isSelected = assignModalSubjectIds.includes(subj.id);
                const isTaughtByMe = subj.teacherId === currentUser.id;

                return (
                  <label
                    key={subj.id}
                    className={`flex items-center justify-between p-2.5 rounded-sm border cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-950/80 border-blue-700 text-white'
                        : 'bg-slate-950 border-slate-800 hover:bg-slate-800/80 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAssignModalSubjectIds([...assignModalSubjectIds, subj.id]);
                          } else {
                            setAssignModalSubjectIds(assignModalSubjectIds.filter(id => id !== subj.id));
                          }
                        }}
                        className="rounded-xs text-blue-600 focus:ring-blue-500 bg-slate-900 border-slate-700"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white">{subj.code} · {subj.name}</span>
                          {isTaughtByMe && (
                            <span className="text-[9px] px-1 bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold rounded-xs">
                              Your Subject
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400">Teacher: {subj.teacherName} · {subj.room}</p>
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
                onClick={() => setAssignModalStudent(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveStudentClasses}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-sm text-xs font-bold shadow-xs"
              >
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: BATCH ASSIGN MULTIPLE STUDENTS */}
      {showBatchAssignModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-md max-w-md w-full p-5 shadow-2xl border border-slate-800 animate-in fade-in duration-150 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Bulk Assign {selectedStudentIds.length} Students to Class
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select which course to enroll the selected students into.
                </p>
              </div>
              <button
                onClick={() => setShowBatchAssignModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Target Course / Subject
                </label>
                <select
                  value={batchTargetSubjectId}
                  onChange={(e) => setBatchTargetSubjectId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-sm text-xs font-semibold text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.code} · {s.name} ({s.teacherName})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowBatchAssignModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteBatchAssign}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-sm text-xs font-bold shadow-xs"
              >
                Enroll All Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: TEACHER GIVES A NEW CLASS */}
      {showCreateClassModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-md max-w-lg w-full p-5 shadow-2xl border border-slate-800 animate-in fade-in duration-150 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Add New Class Offering
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Instructor: {currentUser.name} · BML Munjal University
                </p>
              </div>
              <button
                onClick={() => setShowCreateClassModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewClass} className="py-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wide mb-1">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AI-102"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-sm text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wide mb-1">
                    Credits
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={newCredits}
                    onChange={(e) => setNewCredits(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-sm text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wide mb-1">
                  Course Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Applied Machine Learning & Neural Nets"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-sm text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wide mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Summary of course scope and competencies..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-sm text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wide mb-1">
                    Room / Lab Location
                  </label>
                  <input
                    type="text"
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-sm text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wide mb-1">
                    Term / Semester
                  </label>
                  <input
                    type="text"
                    value={newSemester}
                    onChange={(e) => setNewSemester(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-sm text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wide mb-1">
                  Syllabus Topics (One per line)
                </label>
                <textarea
                  rows={3}
                  value={newTopics}
                  onChange={(e) => setNewTopics(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-sm text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono text-[11px]"
                />
              </div>

              {selectedStudentIds.length > 0 && (
                <div className="p-2.5 bg-emerald-950/60 border border-emerald-800/80 rounded-sm text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Will immediately auto-enroll {selectedStudentIds.length} currently selected students.</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateClassModal(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingClass}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-sm text-xs font-bold shadow-xs disabled:opacity-50"
                >
                  {isCreatingClass ? 'Creating Class...' : 'Publish Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
